# ========================================
# authentication/urls.py
# ========================================
from django.urls import path
from . import views

app_name = "authentication"

urlpatterns = [
    # User profile endpoints
    # GET - Returns: id, clerk_id, email, first_name, last_name, full_name, created_at, updated_at, last_sign_in
    path("user/me/", views.get_current_user, name="current-user"),
    # PUT/PATCH - Update: first_name, last_name only
    path("user/me/update/", views.update_user_profile, name="update-user"),
    # GET - Returns: id, clerk_id, email, full_name, account_age_days, created_at, last_sign_in
    path("user/stats/", views.get_user_stats, name="user-stats"),
    # POST - Sync user data from Clerk
    path("user/sync/", views.sync_user_from_clerk, name="sync-user"),
    # POST - Update last_sign_in timestamp
    path("user/signin/", views.update_last_sign_in, name="update-signin"),
    # Public user profile
    # GET - Returns: id, first_name, last_name, full_name (public data only)
    path("users/<int:user_id>/", views.get_user_public_profile, name="public-profile"),
    # Account management
    # DELETE - Soft delete user account (marks is_active=False)
    path("user/delete/", views.delete_user_account, name="delete-account"),
    # Test endpoints
    # GET - Test if authentication is working
    path("protected/test/", views.test_protected_route, name="test-protected"),
]
