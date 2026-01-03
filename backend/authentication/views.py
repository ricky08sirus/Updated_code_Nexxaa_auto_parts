# authentication/views.py
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status, viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    ContactSubmission,
    PartsInquiry,
    Manufacturer,
    VehicleModel,
    PartCategory,
    PartInventory,
    PartImageGallery,
    PartImageUpload,
)
from .serializers import (
    ContactSubmissionSerializer,
    PartsInquirySerializer,
    ManufacturerSerializer,
    VehicleModelSerializer,
    PartCategorySerializer,
    PartInventorySerializer,
    PartInventoryListSerializer,
    PartImageGallerySerializer,
    PartImageGalleryListSerializer,
    PartImageUploadSerializer,
)
import logging

logger = logging.getLogger(__name__)


def get_client_ip(request):
    """Extract client IP address from request"""
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0]
    else:
        ip = request.META.get("REMOTE_ADDR")
    return ip


# ============= PARTS INQUIRY ENDPOINTS =============


@api_view(["POST"])
@permission_classes([AllowAny])
def submit_parts_inquiry(request):
    """
    Handle parts inquiry form submission

    POST /api/parts-inquiry/

    Body (JSON):
    {
        "year": 1980,
        "manufacturer": 1,  // manufacturer ID
        "model": 5,         // model ID
        "part_category": 3, // part category ID
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "zipcode": "12345",
        "additional_notes": "Optional notes"
    }
    """
    serializer = PartsInquirySerializer(data=request.data)

    if serializer.is_valid():
        try:
            # Save inquiry with metadata
            inquiry = serializer.save(
                ip_address=get_client_ip(request),
                user_agent=request.META.get("HTTP_USER_AGENT", "")[:500],
            )

            logger.info(
                f"Parts inquiry submitted by {inquiry.email} for {inquiry.year} {inquiry.manufacturer} {inquiry.model}"
            )

            # Send email notifications
            from .email_utils import (
                send_parts_inquiry_notification,
                send_parts_inquiry_auto_reply,
            )

            email_sent = send_parts_inquiry_notification(inquiry)
            auto_reply_sent = send_parts_inquiry_auto_reply(inquiry)

            if email_sent:
                logger.info(
                    f"Parts inquiry notification sent successfully for {inquiry.id}"
                )
            else:
                logger.warning(
                    f"Failed to send parts inquiry notification for {inquiry.id}"
                )

            if auto_reply_sent:
                logger.info(f"Auto-reply sent to {inquiry.email}")
            else:
                logger.warning(f"Failed to send auto-reply to {inquiry.email}")

            return Response(
                {
                    "success": True,
                    "message": "Your parts inquiry has been submitted successfully! We will contact you soon with availability and pricing.",
                    "inquiry_id": str(inquiry.id),
                    "details": {
                        "year": inquiry.year,
                        "manufacturer": inquiry.manufacturer.name
                        if inquiry.manufacturer
                        else None,
                        "model": inquiry.model.name if inquiry.model else None,
                        "part": inquiry.part_category.name
                        if inquiry.part_category
                        else None,
                    },
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            logger.error(f"Error saving parts inquiry: {str(e)}", exc_info=True)
            return Response(
                {
                    "success": False,
                    "error": "Failed to submit inquiry. Please try again later.",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    # Return validation errors
    return Response(
        {"success": False, "errors": serializer.errors},
        status=status.HTTP_400_BAD_REQUEST,
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def get_manufacturers(request):
    """
    Get list of all active manufacturers

    GET /api/manufacturers/
    """
    manufacturers = Manufacturer.objects.filter(is_active=True).order_by("name")
    serializer = ManufacturerSerializer(manufacturers, many=True)
    return Response({"success": True, "data": serializer.data})


@api_view(["GET"])
@permission_classes([AllowAny])
def get_models_by_manufacturer(request, manufacturer_id):
    """
    Get all models for a specific manufacturer

    GET /api/manufacturers/{manufacturer_id}/models/
    """
    try:
        manufacturer = Manufacturer.objects.get(id=manufacturer_id, is_active=True)
        models = VehicleModel.objects.filter(
            manufacturer=manufacturer, is_active=True
        ).order_by("name")

        serializer = VehicleModelSerializer(models, many=True)
        return Response(
            {
                "success": True,
                "manufacturer": manufacturer.name,
                "data": serializer.data,
            }
        )

    except Manufacturer.DoesNotExist:
        return Response(
            {"success": False, "error": "Manufacturer not found"},
            status=status.HTTP_404_NOT_FOUND,
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def get_all_models(request):
    """
    Get all active vehicle models (with manufacturer info)

    GET /api/models/

    Optional query params:
    - manufacturer_id: filter by manufacturer
    """
    manufacturer_id = request.query_params.get("manufacturer_id")

    models = VehicleModel.objects.filter(is_active=True).select_related("manufacturer")

    if manufacturer_id:
        models = models.filter(manufacturer_id=manufacturer_id)

    models = models.order_by("manufacturer__name", "name")
    serializer = VehicleModelSerializer(models, many=True)

    return Response({"success": True, "data": serializer.data})


@api_view(["GET"])
@permission_classes([AllowAny])
def get_part_categories(request):
    """
    Get list of all active part categories

    GET /api/part-categories/
    """
    categories = PartCategory.objects.filter(is_active=True).order_by("name")
    serializer = PartCategorySerializer(categories, many=True)
    return Response({"success": True, "data": serializer.data})


# ============= CONTACT FORM ENDPOINTS =============


@api_view(["POST"])
@permission_classes([AllowAny])
def submit_contact_form(request):
    """
    Handle contact form submission and send email notifications

    POST /api/contact/

    Body (JSON):
    {
        "name": "John Doe",
        "email": "john@example.com",
        "subject": "General Inquiry",
        "message": "Your message...",
        "phone": "+1234567890"
    }
    """
    serializer = ContactSubmissionSerializer(data=request.data)

    if serializer.is_valid():
        try:
            # Save submission with metadata
            submission = serializer.save(
                ip_address=get_client_ip(request),
                user_agent=request.META.get("HTTP_USER_AGENT", "")[:500],
            )

            logger.info(f"Contact form submitted by {submission.email}")

            # Import and send email notifications
            from .email_utils import send_contact_notification, send_auto_reply_to_customer
            
            email_sent = send_contact_notification(submission)
            auto_reply_sent = send_auto_reply_to_customer(submission)

            return Response(
                {
                    "success": True,
                    "message": "Your message has been sent successfully! We will get back to you soon.",
                    "submission_id": str(submission.id),
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            logger.error(f"Error saving contact submission: {str(e)}", exc_info=True)
            return Response(
                {
                    "success": False,
                    "error": "Failed to submit form. Please try again later.",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    # Return validation errors
    return Response(
        {"success": False, "errors": serializer.errors},
        status=status.HTTP_400_BAD_REQUEST,
    )


# ============= UTILITY ENDPOINTS =============


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    """Simple health check endpoint"""
    return Response(
        {
            "status": "ok",
            "message": "Auto Parts API is running",
            "endpoints": {
                "parts_inquiry": "/api/parts-inquiry/",
                "manufacturers": "/api/manufacturers/",
                "models": "/api/models/",
                "part_categories": "/api/part-categories/",
                "contact": "/api/contact/",
                "parts_inventory": "/api/parts/",
                "part_galleries": "/api/part-galleries/",
            },
        }
    )


# ============= PARTS INVENTORY VIEWSET =============


class PartInventoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for browsing parts inventory
    GET /api/parts/ - List all parts
    GET /api/parts/{id}/ - Get specific part
    GET /api/parts/?year=2020&manufacturer=1&model=5 - Filter parts
    GET /api/parts/?search=engine - Search parts
    GET /api/parts/featured/ - Get featured parts
    GET /api/parts/in_stock/ - Get in-stock parts
    GET /api/parts/by_vehicle/?year=2020&manufacturer=1&model=5 - Get parts by vehicle
    """

    queryset = (
        PartInventory.objects.filter(is_published=True)
        .select_related("manufacturer", "model", "part_category")
        .prefetch_related("images")
    )
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = [
        "year",
        "manufacturer",
        "model",
        "part_category",
        "status",
        "condition",
    ]
    search_fields = [
        "part_name",
        "part_number",
        "description",
        "manufacturer__name",
        "model__name",
    ]
    ordering_fields = ["price", "created_at", "stock_quantity"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        """Use list serializer for list view, detailed for retrieve"""
        if self.action == "list":
            return PartInventoryListSerializer
        return PartInventorySerializer

    @action(detail=False, methods=["get"])
    def featured(self, request):
        """Get featured parts"""
        featured_parts = self.queryset.filter(is_featured=True)
        serializer = self.get_serializer(featured_parts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def in_stock(self, request):
        """Get only in-stock parts"""
        in_stock_parts = self.queryset.filter(stock_quantity__gt=0, status="available")
        serializer = self.get_serializer(in_stock_parts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def by_vehicle(self, request):
        """
        Get parts for specific vehicle
        Usage: /api/parts/by_vehicle/?year=2020&manufacturer=1&model=5
        """
        year = request.query_params.get("year")
        manufacturer = request.query_params.get("manufacturer")
        model = request.query_params.get("model")

        if not all([year, manufacturer, model]):
            return Response(
                {"error": "year, manufacturer, and model parameters are required"},
                status=400,
            )

        parts = self.queryset.filter(
            year=year, manufacturer_id=manufacturer, model_id=model
        )

        serializer = self.get_serializer(parts, many=True)
        return Response(serializer.data)


# ============= PART IMAGE GALLERY VIEWSET =============


class PartImageGalleryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for browsing part image galleries
    GET /api/part-galleries/ - List all galleries
    GET /api/part-galleries/{id}/ - Get specific gallery with all images
    GET /api/part-galleries/?year=2020&manufacturer=1 - Filter galleries
    GET /api/part-galleries/?search=air+filter - Search galleries
    GET /api/part-galleries/featured/ - Get featured galleries
    GET /api/part-galleries/by_vehicle/?year=2020&manufacturer=1&model=5 - Get galleries by vehicle
    """

    queryset = (
        PartImageGallery.objects.filter(is_published=True)
        .select_related("manufacturer", "model", "part_category")
        .prefetch_related("images", "tags")
    )
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = [
        "year",
        "manufacturer",
        "model",
        "part_category",
        "is_featured",
    ]
    search_fields = [
        "part_name",
        "part_number",
        "description",
        "manufacturer__name",
        "model__name",
        "part_category__name",
    ]
    ordering_fields = ["created_at", "year"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        """Use list serializer for list view, detailed for retrieve"""
        if self.action == "list":
            return PartImageGalleryListSerializer
        return PartImageGallerySerializer

    @action(detail=False, methods=["get"])
    def featured(self, request):
        """Get featured galleries"""
        featured_galleries = self.queryset.filter(is_featured=True)
        serializer = self.get_serializer(featured_galleries, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def by_vehicle(self, request):
        """
        Get galleries for specific vehicle
        Usage: /api/part-galleries/by_vehicle/?year=2020&manufacturer=1&model=5
        """
        year = request.query_params.get("year")
        manufacturer = request.query_params.get("manufacturer")
        model = request.query_params.get("model")

        if not all([year, manufacturer, model]):
            return Response(
                {"error": "year, manufacturer, and model parameters are required"},
                status=400,
            )

        galleries = self.queryset.filter(
            year=year, manufacturer_id=manufacturer, model_id=model
        )

        serializer = self.get_serializer(galleries, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def by_part_category(self, request):
        """
        Get galleries for specific part category
        Usage: /api/part-galleries/by_part_category/?part_category=3
        """
        part_category = request.query_params.get("part_category")

        if not part_category:
            return Response(
                {"error": "part_category parameter is required"},
                status=400,
            )

        galleries = self.queryset.filter(part_category_id=part_category)
        serializer = self.get_serializer(galleries, many=True)
        return Response(serializer.data)
