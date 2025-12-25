# authentication/serializers.py
from rest_framework import serializers
from .models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Main serializer for UserProfile model
    Used for authenticated user operations
    """

    full_name = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = [
            "id",
            "clerk_id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "created_at",
            "updated_at",
            "last_sign_in",
        ]
        read_only_fields = [
            "id",
            "clerk_id",
            "email",  # Email comes from Clerk, shouldn't be editable here
            "created_at",
            "updated_at",
            "last_sign_in",
        ]

    def get_full_name(self, obj):
        """Get user's full name"""
        return obj.get_full_name()


class UserProfilePublicSerializer(serializers.ModelSerializer):
    """
    Public serializer with limited fields
    Used when displaying user info to other users
    """

    full_name = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = [
            "id",
            "full_name",
            "first_name",
            "last_name",
        ]

    def get_full_name(self, obj):
        return obj.get_full_name()


class UserProfileMinimalSerializer(serializers.ModelSerializer):
    """
    Minimal serializer for basic user info
    Used in nested serializers (e.g., orders, reviews)
    """

    class Meta:
        model = UserProfile
        fields = [
            "id",
            "first_name",
            "last_name",
        ]


class UserStatsSerializer(serializers.ModelSerializer):
    """
    Serializer for user statistics
    """

    full_name = serializers.SerializerMethodField()
    account_age_days = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = [
            "id",
            "clerk_id",
            "email",
            "full_name",
            "account_age_days",
            "created_at",
            "last_sign_in",
        ]

    def get_full_name(self, obj):
        return obj.get_full_name()

    def get_account_age_days(self, obj):
        """Calculate account age in days"""
        from django.utils import timezone

        if obj.created_at:
            delta = timezone.now() - obj.created_at
            return delta.days
        return 0
