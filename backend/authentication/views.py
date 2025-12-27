# # authentication/views.py
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import AllowAny
# from rest_framework.response import Response
# from rest_framework import status
# from .models import ContactSubmission
# from .serializers import ContactSubmissionSerializer
# from .email_utils import send_contact_notification, send_auto_reply_to_customer
# import logging

# logger = logging.getLogger(__name__)


# def get_client_ip(request):
#     """Extract client IP address from request"""
#     x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
#     if x_forwarded_for:
#         ip = x_forwarded_for.split(",")[0]
#     else:
#         ip = request.META.get("REMOTE_ADDR")
#     return ip


# @api_view(["POST"])
# @permission_classes([AllowAny])
# def submit_contact_form(request):
#     """
#     Handle contact form submission and send email notifications

#     POST /api/contact/

#     Body (JSON):
#     {
#         "name": "John Doe",           // Optional
#         "email": "john@example.com",  // Required
#         "subject": "General Inquiry", // Optional
#         "message": "Your message...",  // Required
#         "phone": "+1234567890"        // Optional
#     }
#     """

#     # Add IP and user agent to the data
#     data = request.data.copy()

#     # Create serializer
#     serializer = ContactSubmissionSerializer(data=data)

#     if serializer.is_valid():
#         try:
#             # Save submission with metadata
#             submission = serializer.save(
#                 ip_address=get_client_ip(request),
#                 user_agent=request.META.get("HTTP_USER_AGENT", "")[:500],
#             )

#             logger.info(f"Contact form submitted by {submission.email}")

#             # Send email notification to company
#             email_sent = send_contact_notification(submission)

#             # Send auto-reply to customer
#             auto_reply_sent = send_auto_reply_to_customer(submission)

#             if email_sent:
#                 logger.info(
#                     f"Email notification sent successfully for submission {
#                         submission.id
#                     }"
#                 )
#             else:
#                 logger.warning(
#                     f"Failed to send email notification for submission {submission.id}"
#                 )

#             if auto_reply_sent:
#                 logger.info(f"Auto-reply sent to {submission.email}")
#             else:
#                 logger.warning(f"Failed to send auto-reply to {submission.email}")

#             return Response(
#                 {
#                     "success": True,
#                     "message": "Your message has been sent successfully! We will get back to you soon.",
#                     "submission_id": str(submission.id),
#                     "email_sent": email_sent,
#                     "auto_reply_sent": auto_reply_sent,
#                 },
#                 status=status.HTTP_201_CREATED,
#             )

#         except Exception as e:
#             logger.error(f"Error saving contact submission: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to submit form. Please try again later."},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             )

#     # Return validation errors
#     return Response(
#         {"success": False, "errors": serializer.errors},
#         status=status.HTTP_400_BAD_REQUEST,
#     )


# @api_view(["GET"])
# @permission_classes([AllowAny])
# def health_check(request):
#     """Simple health check endpoint"""
#     return Response({"status": "ok", "message": "Contact API is running"})


# @api_view(["POST"])
# @permission_classes([AllowAny])
# def test_email(request):
#     """
#     Test email configuration

#     POST /api/contact/test-email/
#     """
#     try:
#         from django.core.mail import send_mail
#         from django.conf import settings

#         send_mail(
#             subject="Test Email from Nexxa Auto Parts",
#             message="This is a test email to verify your email configuration is working correctly.",
#             from_email=settings.DEFAULT_FROM_EMAIL,
#             recipient_list=settings.CONTACT_EMAIL_RECIPIENTS,
#             fail_silently=False,
#         )

#         return Response(
#             {
#                 "success": True,
#                 "message": "Test email sent successfully! Check your inbox.",
#             }
#         )

#     except Exception as e:
#         logger.error(f"Test email failed: {str(e)}", exc_info=True)
#         return Response(
#             {"success": False, "error": str(e)},
#             status=status.HTTP_500_INTERNAL_SERVER_ERROR,
#         )






# authentication/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import (
    ContactSubmission, 
    PartsInquiry, 
    Manufacturer, 
    VehicleModel, 
    PartCategory
)
from .serializers import (
    ContactSubmissionSerializer,
    PartsInquirySerializer,
    ManufacturerSerializer,
    VehicleModelSerializer,
    PartCategorySerializer,
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
            
            logger.info(f"Parts inquiry submitted by {inquiry.email} for {inquiry.year} {inquiry.manufacturer} {inquiry.model}")
            
            # Send email notifications
            from .email_utils import send_parts_inquiry_notification, send_parts_inquiry_auto_reply
            email_sent = send_parts_inquiry_notification(inquiry)
            auto_reply_sent = send_parts_inquiry_auto_reply(inquiry)
            
            if email_sent:
                logger.info(f"Parts inquiry notification sent successfully for {inquiry.id}")
            else:
                logger.warning(f"Failed to send parts inquiry notification for {inquiry.id}")
            
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
                        "manufacturer": inquiry.manufacturer.name if inquiry.manufacturer else None,
                        "model": inquiry.model.name if inquiry.model else None,
                        "part": inquiry.part_category.name if inquiry.part_category else None,
                    }
                },
                status=status.HTTP_201_CREATED,
            )
        
        except Exception as e:
            logger.error(f"Error saving parts inquiry: {str(e)}", exc_info=True)
            return Response(
                {"success": False, "error": "Failed to submit inquiry. Please try again later."},
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
    return Response({
        "success": True,
        "data": serializer.data
    })


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
            manufacturer=manufacturer,
            is_active=True
        ).order_by("name")
        
        serializer = VehicleModelSerializer(models, many=True)
        return Response({
            "success": True,
            "manufacturer": manufacturer.name,
            "data": serializer.data
        })
    
    except Manufacturer.DoesNotExist:
        return Response(
            {"success": False, "error": "Manufacturer not found"},
            status=status.HTTP_404_NOT_FOUND
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
    
    return Response({
        "success": True,
        "data": serializer.data
    })


@api_view(["GET"])
@permission_classes([AllowAny])
def get_part_categories(request):
    """
    Get list of all active part categories
    
    GET /api/part-categories/
    """
    categories = PartCategory.objects.filter(is_active=True).order_by("name")
    serializer = PartCategorySerializer(categories, many=True)
    return Response({
        "success": True,
        "data": serializer.data
    })


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

            # Uncomment these when email utils are configured
            # email_sent = send_contact_notification(submission)
            # auto_reply_sent = send_auto_reply_to_customer(submission)

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
                {"success": False, "error": "Failed to submit form. Please try again later."},
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
    return Response({
        "status": "ok", 
        "message": "Auto Parts API is running",
        "endpoints": {
            "parts_inquiry": "/api/parts-inquiry/",
            "manufacturers": "/api/manufacturers/",
            "models": "/api/models/",
            "part_categories": "/api/part-categories/",
            "contact": "/api/contact/"
        }
    })