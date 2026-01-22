# authentication/views.py
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .analytics import track_event
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
    ProductImageSerializer,
    ProductImageCreateSerializer,
    ProductImageListSerializer
)
import logging
from .analytics import (
    track_product_page_view,
    track_add_to_wishlist,
    track_scroll_depth,
    track_time_on_page
)

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
    }
    """
    serializer = PartsInquirySerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            # Save inquiry with metadata
            inquiry = serializer.save(
                ip_address=get_client_ip(request),
            )
            
            logger.info(
                f"Parts inquiry submitted by {inquiry.email} for {inquiry.year} {inquiry.manufacturer} {inquiry.model}"
            )
            
            # ✅ Track inquiry submission
            track_event(
                request,
                'parts_inquiry_submitted',
                {
                    'inquiry_id': str(inquiry.id),
                    'year': inquiry.year,
                    'manufacturer': inquiry.manufacturer.name if inquiry.manufacturer else 'Unknown',
                    'model': inquiry.model.name if inquiry.model else 'Unknown',
                    'part_category': inquiry.part_category.name if inquiry.part_category else 'Unknown',
                    'currency': 'USD',
                    'value': 1.0,
                }
            )
            
            # Send email notifications
            from .email_utils import (
                send_parts_inquiry_notification,
                send_parts_inquiry_auto_reply,
            )
            
            email_sent = send_parts_inquiry_notification(inquiry)
            auto_reply_sent = send_parts_inquiry_auto_reply(inquiry)
            
            if email_sent:
                logger.info(f"Parts inquiry notification sent successfully for {inquiry.id}")
                # ✅ Track email sent (ADDED)
                track_event(request, 'inquiry_notification_sent', {
                    'inquiry_id': str(inquiry.id)
                })
            else:
                logger.warning(f"Failed to send parts inquiry notification for {inquiry.id}")
                # ✅ Track email failure (ADDED)
                track_event(request, 'inquiry_notification_failed', {
                    'inquiry_id': str(inquiry.id)
                })
            
            if auto_reply_sent:
                logger.info(f"Auto-reply sent to {inquiry.email}")
                # ✅ Track auto-reply sent (ADDED)
                track_event(request, 'inquiry_auto_reply_sent', {
                    'inquiry_id': str(inquiry.id)
                })
            else:
                logger.warning(f"Failed to send auto-reply to {inquiry.email}")
                # ✅ Track auto-reply failure (ADDED)
                track_event(request, 'inquiry_auto_reply_failed', {
                    'inquiry_id': str(inquiry.id)
                })
            
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
                    },
                },
                status=status.HTTP_201_CREATED,
            )
            
        except Exception as e:
            logger.error(f"Error saving parts inquiry: {str(e)}", exc_info=True)
            
            # ✅ Track error
            track_event(request, 'parts_inquiry_error', {
                'error_message': str(e)[:100],
                'error_type': 'server_error'
            })
            
            return Response(
                {
                    "success": False,
                    "error": "Failed to submit inquiry. Please try again later.",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
    
    # ✅ Track validation errors (ADDED)
    track_event(request, 'parts_inquiry_validation_error', {
        'errors': str(serializer.errors)[:200]
    })
    
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
                #user_agent=request.META.get("HTTP_USER_AGENT", "")[:500],
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
    permission_classes = [AllowAny]
                        
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

    permission_classes = [AllowAny]
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
    serializer_class = PartImageGallerySerializer
    pagination_class = None  # Disable pagination
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


# ==============================================================================
# user registrtion
# ==============================================================================
# authentication/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer

def get_tokens_for_user(user):
    """Generate JWT tokens for user"""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """
    Register a new user
    POST /api/auth/register/
    Body: {
        "email": "user@example.com",
        "password": "password123",
        "first_name": "John",
        "last_name": "Doe",
        "phone_number": "1234567890" (optional)
    }
    """
    serializer = RegisterSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        tokens = get_tokens_for_user(user)
        
        user_data = UserSerializer(user).data
        
        return Response({
            'message': 'User registered successfully',
            'user': user_data,
            'token': tokens['access'],
            'refresh_token': tokens['refresh']
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'error': 'Registration failed',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Login user
    POST /api/auth/login/
    Body: {
        "email": "user@example.com",
        "password": "password123"
    }
    """
    serializer = LoginSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.validated_data['user']
        tokens = get_tokens_for_user(user)
        
        user_data = UserSerializer(user).data
        
        return Response({
            'message': 'Login successful',
            'user': user_data,
            'token': tokens['access'],
            'refresh_token': tokens['refresh']
        }, status=status.HTTP_200_OK)
    
    return Response({
        'error': 'Login failed',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile_view(request):
    """
    Get current user profile
    GET /api/auth/profile/
    Headers: Authorization: Bearer <token>
    """
    user_data = UserSerializer(request.user).data
    return Response({
        'user': user_data
    }, status=status.HTTP_200_OK)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile_view(request):
    """
    Update user profile
    PUT/PATCH /api/auth/profile/update/
    Headers: Authorization: Bearer <token>
    Body: {
        "first_name": "John",
        "last_name": "Doe",
        "phone_number": "1234567890"
    }
    """
    user = request.user
    
    # Update user fields
    if 'first_name' in request.data:
        user.first_name = request.data['first_name']
    if 'last_name' in request.data:
        user.last_name = request.data['last_name']
    
    user.save()
    
    # Update profile fields
    if 'phone_number' in request.data:
        user.profile.phone_number = request.data['phone_number']
        user.profile.save()
    
    user_data = UserSerializer(user).data
    
    return Response({
        'message': 'Profile updated successfully',
        'user': user_data
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Logout user (blacklist refresh token)
    POST /api/auth/logout/
    Headers: Authorization: Bearer <token>
    Body: {
        "refresh_token": "your_refresh_token"
    }
    """
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        return Response({
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': 'Logout failed',
            'details': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
    
# =========================================================================================
# shipping form views
# ==============================================================================================


# authentication/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import ShippingAddress
from .serializers import ShippingAddressSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

@api_view(['POST'])
@permission_classes([AllowAny]) 
def create_shipping_address(request):
    """
    Create a new shipping address
    """
    try:
        serializer = ShippingAddressSerializer(data=request.data)
        
        if serializer.is_valid():
            shipping_address = serializer.save()
            
            return Response({
                'success': True,
                'message': 'Shipping address created successfully',
                'data': {
                    'id': shipping_address.id,
                    'first_name': shipping_address.first_name,
                    'last_name': shipping_address.last_name,
                    'email': shipping_address.email,
                    'phone': shipping_address.phone,
                    'city': shipping_address.city,
                    'state': shipping_address.state,
                }
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'success': False,
                'message': 'Validation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error creating shipping address: {str(e)}',
            'errors': {}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)







# ============= ANALYTICS TEST ENDPOINT =============
# Add this at the very end of your views.py file
# Add these test endpoints to your views.py

# ============= ANALYTICS TEST ENDPOINTS =============
# Add these at the very end of your authentication/views.py file

@api_view(['GET'])
@permission_classes([AllowAny])
def test_analytics(request):
    """
    Test endpoint to verify Google Analytics is working
    GET /api/test-analytics/
    """
    from .analytics import GoogleAnalytics, get_client_id, get_client_ip
    
    ga = GoogleAnalytics()
    client_id = get_client_id(request)
    
    # Send a test event with debug_mode enabled
    success = ga.send_event(
        client_id=client_id,
        event_name='backend_test_event',
        event_params={
            'test_parameter': 'test_value',
            'environment': 'backend',
            'timestamp': str(request.META.get('HTTP_HOST', 'localhost'))
        }
    )
    
    return Response({
        'status': 'success' if success else 'failed',
        'measurement_id': ga.measurement_id,
        'client_id': client_id,
        'configured': bool(ga.measurement_id and ga.api_secret),
        'message': 'Analytics event sent with debug_mode! Check GA4 DebugView in 10-30 seconds.' if success else 'Failed to send event. Check configuration.',
        'next_steps': [
            '1. Go to GA4 → Configure → DebugView',
            '2. Wait 10-30 seconds',
            '3. Look for event named "backend_test_event"',
            '4. If not showing, check validation endpoint'
        ]
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def test_analytics_debug(request):
    """
    Test endpoint with full validation response from GA4
    GET /api/test-analytics-debug/
    """
    from .analytics import GoogleAnalytics, get_client_id
    import time
    
    ga = GoogleAnalytics()
    client_id = get_client_id(request)
    
    # Send event to debug endpoint
    validation = ga.send_event(
        client_id=client_id,
        event_name='debug_test_event',
        event_params={
            'test_type': 'validation',
            'timestamp': int(time.time()),
            'value': 100
        },
        debug=True  # Use debug endpoint
    )
    
    return Response({
        'status': 'validation_complete',
        'measurement_id': ga.measurement_id,
        'client_id': client_id,
        'configured': bool(ga.measurement_id and ga.api_secret),
        'validation_response': validation,
        'instructions': {
            'step_1': 'Check the validation_response above for any errors',
            'step_2': 'If validation_response is empty {}, your event is valid',
            'step_3': 'Go to GA4 → Configure → DebugView',
            'step_4': 'Look for event named "debug_test_event"'
        }
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def analytics_config(request):
    """
    Check Analytics configuration
    GET /api/analytics-config/
    """
    from .analytics import GoogleAnalytics
    
    ga = GoogleAnalytics()
    
    return Response({
        'configured': bool(ga.measurement_id and ga.api_secret),
        'measurement_id': ga.measurement_id if ga.measurement_id else 'NOT_SET',
        'api_secret_set': bool(ga.api_secret),
        'endpoints': {
            'production': ga.endpoint if ga.endpoint else 'NOT_CONFIGURED',
            'debug': ga.debug_endpoint if ga.debug_endpoint else 'NOT_CONFIGURED'
        },
        'troubleshooting': {
            'check_env': 'Ensure GOOGLE_ANALYTICS_ID and GOOGLE_ANALYTICS_API_SECRET are set in settings.py',
            'verify_ga4': f'Log into GA4 and verify Measurement ID: {ga.measurement_id}' if ga.measurement_id else 'Measurement ID not configured',
            'regenerate_secret': 'If events not showing, regenerate API secret in GA4 Admin',
            'check_debugview': 'Events with debug_mode=1 appear in Configure → DebugView'
        }
    })




# Add this to your authentication/views.py

@api_view(['GET'])
@permission_classes([AllowAny])
def verify_ga4_connection(request):
    """
    Send multiple test events and verify GA4 configuration
    GET /api/verify-ga4/
    """
    from .analytics import GoogleAnalytics, get_client_id
    import time
    
    ga = GoogleAnalytics()
    client_id = get_client_id(request)
    
    results = []
    
    # Test 1: Send to debug endpoint
    debug_result = ga.send_event(
        client_id=client_id,
        event_name='verification_test',
        event_params={
            'test_number': 1,
            'test_type': 'debug_endpoint',
            'timestamp': int(time.time())
        },
        debug=True
    )
    results.append({
        'test': 'Debug Endpoint',
        'success': bool(debug_result),
        'validation': debug_result if isinstance(debug_result, dict) else None
    })
    
    # Test 2: Send to production endpoint
    prod_result = ga.send_event(
        client_id=client_id,
        event_name='verification_test',
        event_params={
            'test_number': 2,
            'test_type': 'production_endpoint',
            'timestamp': int(time.time())
        },
        debug=False
    )
    results.append({
        'test': 'Production Endpoint',
        'success': prod_result
    })
    
    # Test 3: Send with different event name
    test3_result = ga.send_event(
        client_id=client_id,
        event_name='page_view',  # Standard GA4 event
        event_params={
            'page_location': 'http://localhost:8080/test',
            'page_title': 'Test Page'
        }
    )
    results.append({
        'test': 'Standard Event (page_view)',
        'success': test3_result
    })
    
    return Response({
        'status': 'verification_complete',
        'measurement_id': ga.measurement_id,
        'client_id': client_id,
        'tests_completed': len(results),
        'test_results': results,
        'instructions': {
            'step_1': 'Open GA4 in your browser',
            'step_2': 'Go to: Configure → DebugView',
            'step_3': f'Look for client_id: {client_id}',
            'step_4': 'You should see 3 events within 30 seconds',
            'step_5': 'If nothing appears, check property selector (top-left) to ensure you are viewing G-675QHD8DWY'
        },
        'troubleshooting': {
            'if_no_events': [
                '1. Verify you are viewing the correct GA4 property (G-675QHD8DWY)',
                '2. Check if data stream is active in Admin → Data Streams',
                '3. Regenerate API secret in GA4 and update Django settings',
                '4. Wait up to 1-2 minutes for events to appear'
            ],
            'debugview_location': 'GA4 → Configure (left sidebar) → DebugView',
            'property_selector': 'Top-left of GA4 interface, shows current property name'
        }
    })





# ==================================================================================
# Enquiry form image uplaoding
# =====================================================================================
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import ProductImage

class ProductImageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Product Images
    Supports filtering by manufacturer, model, year, and part category
    """
    queryset = ProductImage.objects.select_related(
        'manufacturer', 'model', 'part_category'
    ).filter(is_active=True)
    
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    filterset_fields = {
        'manufacturer': ['exact'],
        'model': ['exact'],
        'year': ['exact'],
        'part_category': ['exact'],
    }
    
    ordering_fields = ['uploaded_at', 'specification_number']
    ordering = ['-uploaded_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProductImageListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ProductImageCreateSerializer
        return ProductImageSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by URL query parameters
        manufacturer_id = self.request.query_params.get('manufacturerId')
        model_id = self.request.query_params.get('modelId')
        year = self.request.query_params.get('year')
        category_id = self.request.query_params.get('partCategoryId')
        
        if manufacturer_id:
            queryset = queryset.filter(manufacturer_id=manufacturer_id)
        if model_id:
            queryset = queryset.filter(model_id=model_id)
        if year:
            queryset = queryset.filter(year=year)
        if category_id:
            queryset = queryset.filter(part_category_id=category_id)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def by_vehicle(self, request):
        """
        Get product image filtered by vehicle information
        Query params: manufacturerId, modelId, year, partCategoryId
        Returns the matching image with specification number
        """
        queryset = self.get_queryset()
        
        # Get the first matching image
        image = queryset.first()
        
        if image:
            serializer = ProductImageSerializer(
                image,
                context={'request': request}
            )
            return Response(serializer.data)
        else:
            return Response(
                {'message': 'No image found for the selected criteria'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def update_specification(self, request, pk=None):
        """Update specification number for an image"""
        image = self.get_object()
        specification_number = request.data.get('specification_number')
        
        if specification_number is None:
            return Response(
                {'error': 'specification_number is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            specification_number = int(specification_number)
            if specification_number < 0:
                raise ValueError("Must be non-negative")
        except (ValueError, TypeError):
            return Response(
                {'error': 'specification_number must be a valid non-negative integer'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        image.specification_number = specification_number
        image.save()
        
        serializer = ProductImageSerializer(image, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get statistics about product images"""
        queryset = self.get_queryset()
        
        stats = {
            'total_images': queryset.count(),
            'by_manufacturer': queryset.values('manufacturer__name').annotate(
                count=models.Count('id')
            ),
            'by_category': queryset.values('part_category__name').annotate(
                count=models.Count('id')
            )
        }
        
        return Response(stats)






@api_view(['POST'])
@permission_classes([AllowAny])
def track_product_view_api(request):
    """
    Track product page view
    POST /api/track-product-view/
    
    Body:
    {
        "product_id": "uuid-or-id",
        "product_name": "2003 Toyota Camry Engine Assembly",
        "price": 985.00,
        "category": "Engine"
    }
    """
    try:
        product_id = request.data.get('product_id')
        product_name = request.data.get('product_name')
        price = request.data.get('price')
        category = request.data.get('category')
        
        if not product_id or not product_name:
            return Response({
                'success': False,
                'error': 'product_id and product_name are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Track the view
        success = track_product_page_view(
            request, 
            product_id, 
            product_name, 
            price, 
            category
        )
        
        logger.info(f"Product view tracked: {product_name} (ID: {product_id})")
        
        return Response({
            'success': success,
            'message': 'Product view tracked'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in track_product_view_api: {str(e)}", exc_info=True)
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def track_wishlist_api(request):
    """
    Track add to wishlist
    POST /api/track-wishlist/
    
    Body:
    {
        "product_id": "uuid-or-id",
        "product_name": "2003 Toyota Camry Engine Assembly",
        "price": 985.00
    }
    """
    try:
        product_id = request.data.get('product_id')
        product_name = request.data.get('product_name')
        price = request.data.get('price')
        
        if not product_id or not product_name:
            return Response({
                'success': False,
                'error': 'product_id and product_name are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Track wishlist add
        success = track_add_to_wishlist(request, product_id, product_name, price)
        
        logger.info(f"Wishlist add tracked: {product_name}")
        
        return Response({
            'success': success,
            'message': 'Wishlist add tracked'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in track_wishlist_api: {str(e)}", exc_info=True)
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def track_scroll_api(request):
    """
    Track scroll depth
    POST /api/track-scroll/
    
    Body:
    {
        "product_id": "uuid-or-id",
        "scroll_percentage": 50
    }
    """
    try:
        product_id = request.data.get('product_id')
        scroll_percentage = request.data.get('scroll_percentage')
        
        if not product_id or scroll_percentage is None:
            return Response({
                'success': False,
                'error': 'product_id and scroll_percentage are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Track scroll
        success = track_scroll_depth(request, product_id, scroll_percentage)
        
        logger.info(f"Scroll depth tracked: {scroll_percentage}% on product {product_id}")
        
        return Response({
            'success': success,
            'message': f'Scroll {scroll_percentage}% tracked'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in track_scroll_api: {str(e)}", exc_info=True)
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def track_time_spent_api(request):
    """
    Track time spent on page
    POST /api/track-time-spent/
    
    Body:
    {
        "product_id": "uuid-or-id",
        "seconds_spent": 45
    }
    """
    try:
        product_id = request.data.get('product_id')
        seconds_spent = request.data.get('seconds_spent')
        
        if not product_id or seconds_spent is None:
            return Response({
                'success': False,
                'error': 'product_id and seconds_spent are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Track time
        success = track_time_on_page(request, product_id, seconds_spent)
        
        logger.info(f"Time tracked: {seconds_spent}s on product {product_id}")
        
        return Response({
            'success': success,
            'message': f'Time {seconds_spent}s tracked'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in track_time_spent_api: {str(e)}", exc_info=True)
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

