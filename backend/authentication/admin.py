# authentication/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(UserAdmin):
    """
    Custom admin interface for UserProfile
    """

    list_display = [
        "id",
        "email",
        "get_full_name_display",
        "clerk_id_short",
        "is_active",
        "created_at",
        "last_sign_in_display",
    ]

    list_filter = [
        "is_active",
        "is_staff",
        "is_superuser",
        "created_at",
        "last_sign_in",
    ]

    search_fields = ["id", "email", "clerk_id", "first_name", "last_name", "username"]

    readonly_fields = [
        "id",
        "clerk_id",
        "created_at",
        "updated_at",
        "last_login",
        "last_sign_in",
    ]

    fieldsets = (
        ("Clerk Information", {"fields": ("clerk_id",)}),
        (
            "Personal Information",
            {
                "fields": (
                    "email",
                    "username",
                    "first_name",
                    "last_name",
                )
            },
        ),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        (
            "Important Dates",
            {
                "fields": (
                    "last_login",
                    "last_sign_in",
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "clerk_id",
                    "username",
                    "first_name",
                    "last_name",
                    "password1",
                    "password2",
                    "is_active",
                    "is_staff",
                ),
            },
        ),
    )

    ordering = ["-created_at"]
    date_hierarchy = "created_at"

    # Custom display methods
    def get_full_name_display(self, obj):
        """Display full name in list"""
        return obj.get_full_name()

    get_full_name_display.short_description = "Full Name"

    def clerk_id_short(self, obj):
        """Display shortened clerk_id"""
        if obj.clerk_id:
            return f"{obj.clerk_id[:20]}..." if len(obj.clerk_id) > 20 else obj.clerk_id
        return "-"

    clerk_id_short.short_description = "Clerk ID"

    def last_sign_in_display(self, obj):
        """Display last sign-in with formatting"""
        if obj.last_sign_in:
            return obj.last_sign_in.strftime("%Y-%m-%d %H:%M")
        return "Never"

    # Register your models here.
    last_sign_in_display.short_description = "Last Sign In"
