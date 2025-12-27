# # authentication/urls.py
# from django.urls import path
# from . import views

# app_name = "authentication"

# urlpatterns = [
#     path("contact/", views.submit_contact_form, name="submit_contact"),
#     path("contact/test-email/", views.test_email, name="test_email"),
#     path("health/", views.health_check, name="health_check"),
# ]




# authentication/urls.py
from django.urls import path
from . import views

app_name = "authentication"

urlpatterns = [
    # Health check
    path("health/", views.health_check, name="health_check"),
    
    # Parts Inquiry endpoints
    path("parts-inquiry/", views.submit_parts_inquiry, name="submit_parts_inquiry"),
    path("manufacturers/", views.get_manufacturers, name="get_manufacturers"),
    path("manufacturers/<int:manufacturer_id>/models/", views.get_models_by_manufacturer, name="get_models_by_manufacturer"),
    path("models/", views.get_all_models, name="get_all_models"),
    path("part-categories/", views.get_part_categories, name="get_part_categories"),
    
    # Contact form endpoints
    path("contact/", views.submit_contact_form, name="submit_contact"),
]




