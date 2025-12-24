from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.utils import timezone


class UserProfile(AbstractUser):
    """
    Custom user model that syncs with Clerk authentication
    Extended from Django's AbstractUser
    """

    # Clerk specific fields
    clerk_id = models.CharField(
        max_length=255,
        unique=True,
        db_index=True,
        help_text="Unique identifier from Clerk (sub claim in JWT)",
    )

    # Override email to make it required and unique
    email = models.EmailField(
        _("email address"),
        unique=True,
        blank=False,
        null=False,
        help_text="User's email address from Clerk",
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_sign_in = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "user_profiles"
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["clerk_id"]),
            models.Index(fields=["email"]),
            models.Index(fields=["-created_at"]),
        ]

    def __str__(self):
        return f"{self.email} ({self.clerk_id})"

    def get_full_name(self):
        """Return the full name or email if name not available"""
        full_name = f"{self.first_name} {self.last_name}".strip()
        return full_name if full_name else self.email

    def update_last_sign_in(self):
        """Update the last sign-in timestamp"""
        self.last_sign_in = timezone.now()
        self.save(update_fields=["last_sign_in"])

    @classmethod
    def get_or_create_from_clerk(cls, clerk_data):
        """
        Get or create user from Clerk JWT data
        Updates user data if it has changed

        Args:
            clerk_data (dict): Decoded JWT data from Clerk

        Returns:
            tuple: (user, created) where created is True if new user
        """
        clerk_id = clerk_data.get("sub")
        email = clerk_data.get("email", "")

        if not clerk_id:
            raise ValueError("clerk_id (sub) is required")

        if not email:
            raise ValueError("email is required")

        # Extract name from JWT
        name = clerk_data.get("name", "")
        first_name = clerk_data.get("given_name", "")
        last_name = clerk_data.get("family_name", "")

        # If name exists but not split into first/last
        if name and not (first_name or last_name):
            name_parts = name.split(" ", 1)
            first_name = name_parts[0]
            last_name = name_parts[1] if len(name_parts) > 1 else ""

        # Prepare user data
        user_defaults = {
            "email": email,
            "username": email,  # Use email as username
            "first_name": first_name or "",
            "last_name": last_name or "",
        }

        # Get or create user
        user, created = cls.objects.update_or_create(
            clerk_id=clerk_id, defaults=user_defaults
        )

        # Update last sign-in
        if not created:
            user.update_last_sign_in()

        return user, created

    def to_dict(self):
        """Convert user to dictionary for API responses"""
        return {
            "id": self.id,
            "clerk_id": self.clerk_id,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "last_sign_in": self.last_sign_in.isoformat()
            if self.last_sign_in
            else None,
        }  # Create your models here.
