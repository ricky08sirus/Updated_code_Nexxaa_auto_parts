# authentication/views.py

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.utils import timezone
from django.db import connection
from .models import UserProfile
from .serializers import (
    UserProfileSerializer,
    UserProfilePublicSerializer,
    UserStatsSerializer,
)
import logging

logger = logging.getLogger(__name__)


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint - verify API and database are working
    GET /api/health/
    """
    try:
        # Check database connection
        connection.ensure_connection()
        db_status = "connected"
    except Exception as e:
        logger.error(f"Database connection error: {str(e)}")
        db_status = "disconnected"

    return Response(
        {
            "status": "healthy",
            "service": "Nexxa Backend API",
            "database": db_status,
            "timestamp": timezone.now().isoformat(),
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """
    Get current authenticated user profile
    GET /api/user/me/

    Headers:
        Authorization: Bearer <clerk_jwt_token>

    Returns:
        200: User profile data
        401: Unauthorized
    """
    try:
        serializer = UserProfileSerializer(request.user)
        return Response(
            {"success": True, "data": serializer.data}, status=status.HTTP_200_OK
        )
    except Exception as e:
        logger.error(f"Error fetching user profile: {str(e)}", exc_info=True)
        return Response(
            {"success": False, "error": "Failed to fetch user profile"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    """
    Update current user profile
    PUT/PATCH /api/user/me/

    Allowed fields: first_name, last_name

    Body:
        {
            "first_name": "John",
            "last_name": "Doe"
        }

    Returns:
        200: Updated user profile
        400: Validation errors
    """
    try:
        user = request.user
        serializer = UserProfileSerializer(
            user,
            data=request.data,
            partial=True,  # Allow partial updates
        )

        if serializer.is_valid():
            serializer.save()
            logger.info(f"User profile updated: {user.email}")
            return Response(
                {
                    "success": True,
                    "message": "Profile updated successfully",
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        logger.warning(f"Profile update validation failed: {serializer.errors}")
        return Response(
            {"success": False, "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    except Exception as e:
        logger.error(f"Error updating user profile: {str(e)}", exc_info=True)
        return Response(
            {"success": False, "error": "Failed to update profile"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_stats(request):
    """
    Get current user statistics
    GET /api/user/stats/

    Returns:
        200: User statistics (id, clerk_id, email, full_name, account_age_days, created_at, last_sign_in)
    """
    try:
        serializer = UserStatsSerializer(request.user)
        return Response(
            {"success": True, "data": serializer.data}, status=status.HTTP_200_OK
        )
    except Exception as e:
        logger.error(f"Error fetching user stats: {str(e)}")
        return Response(
            {"success": False, "error": "Failed to fetch statistics"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def sync_user_from_clerk(request):
    """
    Manually sync user data from Clerk
    POST /api/user/sync/

    This endpoint forces a sync of user data from Clerk
    Useful after user updates their profile in Clerk

    Returns:
        200: Sync successful
    """
    try:
        # The authentication already synced the user
        # But we can force another update if needed
        user = request.user

        # You can add additional sync logic here if needed
        # For now, just return the current user data

        serializer = UserProfileSerializer(user)

        return Response(
            {
                "success": True,
                "message": "User data synced successfully",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    except Exception as e:
        logger.error(f"Error syncing user: {str(e)}", exc_info=True)
        return Response(
            {"success": False, "error": "Failed to sync user data"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_last_sign_in(request):
    """
    Update user's last sign-in timestamp
    POST /api/user/signin/

    Call this from your React app after successful sign-in

    Returns:
        200: Timestamp updated
    """
    try:
        user = request.user
        user.update_last_sign_in()

        return Response(
            {
                "success": True,
                "message": "Last sign-in updated",
                "last_sign_in": user.last_sign_in.isoformat(),
            },
            status=status.HTTP_200_OK,
        )

    except Exception as e:
        logger.error(f"Error updating last sign-in: {str(e)}")
        return Response(
            {"success": False, "error": "Failed to update last sign-in"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def get_user_public_profile(request, user_id):
    """
    Get public profile of any user
    GET /api/users/{user_id}/

    This endpoint doesn't require authentication
    Returns limited public information (id, first_name, last_name, full_name)

    Returns:
        200: Public user profile
        404: User not found
    """
    try:
        user = UserProfile.objects.get(id=user_id, is_active=True)
        serializer = UserProfilePublicSerializer(user)
        return Response(
            {"success": True, "data": serializer.data}, status=status.HTTP_200_OK
        )
    except UserProfile.DoesNotExist:
        return Response(
            {"success": False, "error": "User not found"},
            status=status.HTTP_404_NOT_FOUND,
        )
    except Exception as e:
        logger.error(f"Error fetching public profile: {str(e)}")
        return Response(
            {"success": False, "error": "Failed to fetch user profile"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_user_account(request):
    """
    Delete user account (soft delete - marks as inactive)
    DELETE /api/user/me/

    Note: This doesn't delete the user from Clerk
    You should also call Clerk's API to delete the user there

    Returns:
        200: Account deleted
    """
    try:
        user = request.user

        # Soft delete - just mark as inactive
        user.is_active = False
        user.save()

        logger.info(f"User account deleted: {user.email}")

        return Response(
            {"success": True, "message": "Account deleted successfully"},
            status=status.HTTP_200_OK,
        )

    except Exception as e:
        logger.error(f"Error deleting account: {str(e)}")
        return Response(
            {"success": False, "error": "Failed to delete account"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def test_protected_route(request):
    """
    Test endpoint to verify authentication is working
    GET /api/protected/test/

    Returns:
        200: Authentication successful with user info
    """
    return Response(
        {
            "success": True,
            "message": "You are authenticated!",
            "user": {
                "id": request.user.id,
                "clerk_id": request.user.clerk_id,
                "email": request.user.email,
                "first_name": request.user.first_name,
                "last_name": request.user.last_name,
                "full_name": request.user.get_full_name(),
            },
            "timestamp": timezone.now().isoformat(),
        },
        status=status.HTTP_200_OK,
    )
