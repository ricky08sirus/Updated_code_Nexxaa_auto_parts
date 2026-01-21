# # authentication/urls.py
# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from .views import PartInventoryViewSet, PartImageGalleryViewSet
# from .views import (
#     register_view,
#     login_view,
#     user_profile_view,
#     update_profile_view,
#     logout_view,
#     create_shipping_address
# )
# # from .views import ShippingAddressViewSet

# from . import views

# # Create router for ViewSets
# router = DefaultRouter()
# router.register(r"parts", PartInventoryViewSet, basename="parts")
# router.register(r"part-galleries", PartImageGalleryViewSet, basename="part-galleries")
# # router.register(r'shipping-addresses', ShippingAddressViewSet, basename='shipping-address')
# app_name = "authentication"

# urlpatterns = [
#     # ============= HEALTH CHECK =============
#     path("health/", views.health_check, name="health_check"),
    
#     # ============= PARTS INQUIRY ENDPOINTS =============
#     path("parts-inquiry/", views.submit_parts_inquiry, name="submit_parts_inquiry"),
    
#     # ============= MANUFACTURER ENDPOINTS =============
#     path("manufacturers/", views.get_manufacturers, name="get_manufacturers"),
#     path(
#         "manufacturers/<int:manufacturer_id>/models/",
#         views.get_models_by_manufacturer,
#         name="get_models_by_manufacturer",
#     ),
    
#     # ============= VEHICLE MODEL ENDPOINTS =============
#     path("models/", views.get_all_models, name="get_all_models"),
    
#     # ============= PART CATEGORY ENDPOINTS =============
#     path("part-categories/", views.get_part_categories, name="get_part_categories"),
    
#     # ============= CONTACT FORM ENDPOINTS =============
#     path("contact/", views.submit_contact_form, name="submit_contact"),
    
#     # ============= VIEWSET ROUTES (Parts Inventory & Part Galleries) =============
#     # This includes:
#     # - /api/parts/ - List all parts
#     # - /api/parts/{id}/ - Get specific part
#     # - /api/parts/featured/ - Featured parts
#     # - /api/parts/in_stock/ - In-stock parts
#     # - /api/parts/by_vehicle/ - Parts by vehicle
#     # - /api/part-galleries/ - List all galleries
#     # - /api/part-galleries/{id}/ - Get specific gallery
#     # - /api/part-galleries/featured/ - Featured galleries
#     # - /api/part-galleries/by_vehicle/ - Galleries by vehicle
#     # - /api/part-galleries/by_part_category/ - Galleries by part category
#     path("", include(router.urls)),

#     path('register/', register_view, name='register'),
#     path('login/', login_view, name='login'),
#     path('profile/', user_profile_view, name='profile'),
#     path('profile/update/', update_profile_view, name='update_profile'),
#     path('logout/', logout_view, name='logout'),
#     # path('shipping-addresses/', views.create_shipping_address, name='create_shipping_address'),
#     # path('api/shipping-addresses/', views.create_shipping_address, name='create_shipping_address'),
#     path('shipping-addresses/', views.create_shipping_address, name='create_shipping_address'),

# ]

# authentication/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PartInventoryViewSet, PartImageGalleryViewSet
from .views import (
    register_view,
    login_view,
    user_profile_view,
    update_profile_view,
    logout_view,
    create_shipping_address  # Import from views
)
from .views import test_analytics, test_analytics_debug, analytics_config

from . import views

# Create router for ViewSets
router = DefaultRouter()
router.register(r"parts", PartInventoryViewSet, basename="parts")
router.register(r"part-galleries", PartImageGalleryViewSet, basename="part-galleries")

app_name = "authentication"

urlpatterns = [
    # ============= HEALTH CHECK =============
    path("health/", views.health_check, name="health_check"),
    
    # ============= PARTS INQUIRY ENDPOINTS =============
    path("parts-inquiry/", views.submit_parts_inquiry, name="submit_parts_inquiry"),
    
    # ============= MANUFACTURER ENDPOINTS =============
    path("manufacturers/", views.get_manufacturers, name="get_manufacturers"),
    path(
        "manufacturers/<int:manufacturer_id>/models/",
        views.get_models_by_manufacturer,
        name="get_models_by_manufacturer",
    ),
    
    # ============= VEHICLE MODEL ENDPOINTS =============
    path("models/", views.get_all_models, name="get_all_models"),
    
    # ============= PART CATEGORY ENDPOINTS =============
    path("part-categories/", views.get_part_categories, name="get_part_categories"),
    
    # ============= CONTACT FORM ENDPOINTS =============
    path("contact/", views.submit_contact_form, name="submit_contact"),
    
    # ============= USER AUTHENTICATION ENDPOINTS =============
    path('register/', register_view, name='register'),
    path('login/', login_view, name='login'),
    path('profile/', user_profile_view, name='profile'),
    path('profile/update/', update_profile_view, name='update_profile'),
    path('logout/', logout_view, name='logout'),
    
    # ============= SHIPPING ADDRESS ENDPOINT =============
    path('shipping-addresses/', views.create_shipping_address, name='create_shipping_address'),
    path('test-analytics/', views.test_analytics, name='test-analytics'),
    path('test-analytics-debug/', views.test_analytics_debug, name='test-analytics-debug'),
    path('analytics-config/', views.analytics_config, name='analytics-config'),
    path('verify-ga4/', views.verify_ga4_connection, name='verify-ga4'),
    # ============= VIEWSET ROUTES (Parts Inventory & Part Galleries) =============
    path("", include(router.urls)),
]
