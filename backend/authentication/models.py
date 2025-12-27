# # authentication/models.py
# from django.db import models
# from django.utils import timezone
# import uuid


# class ContactSubmission(models.Model):
#     """
#     Model to store contact form submissions from users
#     No authentication required - anyone can submit
#     """

#     STATUS_CHOICES = [
#         ("new", "New"),
#         ("in_progress", "In Progress"),
#         ("resolved", "Resolved"),
#         ("closed", "Closed"),
#     ]

#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

#     # Contact Information
#     email = models.EmailField(
#         max_length=255, help_text="User's email address for response"
#     )

#     name = models.CharField(
#         max_length=255, blank=True, help_text="User's name (optional)"
#     )

#     subject = models.CharField(
#         max_length=255, blank=True, help_text="Subject of the inquiry"
#     )

#     # Message/Query
#     message = models.TextField(help_text="User's query or message to the company")

#     # Additional Information
#     phone = models.CharField(
#         max_length=20, blank=True, help_text="Phone number (optional)"
#     )

#     # Status tracking
#     status = models.CharField(
#         max_length=20,
#         choices=STATUS_CHOICES,
#         default="new",
#         help_text="Current status of the inquiry",
#     )

#     # Admin notes
#     admin_notes = models.TextField(
#         blank=True, help_text="Internal notes for admin staff"
#     )

#     # Timestamps
#     created_at = models.DateTimeField(
#         auto_now_add=True, help_text="When the contact form was submitted"
#     )

#     updated_at = models.DateTimeField(
#         auto_now=True, help_text="Last time this record was updated"
#     )

#     resolved_at = models.DateTimeField(
#         null=True, blank=True, help_text="When the inquiry was resolved"
#     )

#     # Metadata
#     ip_address = models.GenericIPAddressField(
#         null=True,
#         blank=True,
#         help_text="IP address of the submitter (for spam prevention)",
#     )

#     user_agent = models.TextField(
#         blank=True, help_text="Browser user agent (for spam prevention)"
#     )

#     class Meta:
#         db_table = "contact_submissions"
#         verbose_name = "Contact Submission"
#         verbose_name_plural = "Contact Submissions"
#         ordering = ["-created_at"]
#         indexes = [
#             models.Index(fields=["email"]),
#             models.Index(fields=["status"]),
#             models.Index(fields=["-created_at"]),
#         ]

#     def __str__(self):
#         name_display = self.name if self.name else "Anonymous"
#         return f"{name_display} ({self.email}) - {self.created_at.strftime('%Y-%m-%d')}"

#     def mark_as_resolved(self):
#         """Mark this inquiry as resolved"""
#         self.status = "resolved"
#         self.resolved_at = timezone.now()
#         self.save(update_fields=["status", "resolved_at", "updated_at"])

#     def mark_as_in_progress(self):
#         """Mark this inquiry as in progress"""
#         self.status = "in_progress"
#         self.save(update_fields=["status", "updated_at"])

#     def to_dict(self):
#         """Convert contact submission to dictionary for API responses"""
#         return {
#             "id": str(self.id),
#             "email": self.email,
#             "name": self.name,
#             "subject": self.subject,
#             "message": self.message,
#             "phone": self.phone,
#             "status": self.status,
#             "created_at": self.created_at.isoformat() if self.created_at else None,
#             "updated_at": self.updated_at.isoformat() if self.updated_at else None,
#         }

#     @property
#     def is_new(self):
#         """Check if this is a new, unread submission"""
#         return self.status == "new"

#     @property
#     def response_time(self):
#         """Calculate time taken to resolve (if resolved)"""
#         if self.resolved_at:
#             delta = self.resolved_at - self.created_at
#             return delta
#         return None




# authentication/models.py
from django.db import models
from django.utils import timezone
import uuid


class Manufacturer(models.Model):
    """
    Model to store vehicle manufacturers (e.g., Acura, Honda, Toyota)
    """
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True, help_text="Manufacturer name")
    code = models.CharField(max_length=20, unique=True, help_text="Short code for manufacturer")
    is_active = models.BooleanField(default=True, help_text="Whether this manufacturer is currently available")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = "manufacturers"
        verbose_name = "Manufacturer"
        verbose_name_plural = "Manufacturers"
        ordering = ["name"]
    
    def __str__(self):
        return self.name


class VehicleModel(models.Model):
    """
    Model to store vehicle models linked to manufacturers
    """
    id = models.AutoField(primary_key=True)
    manufacturer = models.ForeignKey(
        Manufacturer, 
        on_delete=models.CASCADE, 
        related_name="models",
        help_text="Associated manufacturer"
    )
    name = models.CharField(max_length=100, help_text="Model name (e.g., CL, Accord)")
    code = models.CharField(max_length=20, help_text="Short code for model")
    is_active = models.BooleanField(default=True, help_text="Whether this model is currently available")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = "vehicle_models"
        verbose_name = "Vehicle Model"
        verbose_name_plural = "Vehicle Models"
        ordering = ["name"]
        unique_together = [["manufacturer", "name"]]
    
    def __str__(self):
        return f"{self.manufacturer.name} - {self.name}"


class PartCategory(models.Model):
    """
    Model to store auto part categories (e.g., Abs Brake Pump, Engine Parts)
    """
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True, help_text="Part category name")
    description = models.TextField(blank=True, help_text="Description of the part category")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = "part_categories"
        verbose_name = "Part Category"
        verbose_name_plural = "Part Categories"
        ordering = ["name"]
    
    def __str__(self):
        return self.name


class PartsInquiry(models.Model):
    """
    Model to store parts search/inquiry submissions from users
    """
    STATUS_CHOICES = [
        ("new", "New"),
        ("in_progress", "In Progress"),
        ("quoted", "Quote Sent"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Vehicle Information
    year = models.IntegerField(help_text="Vehicle year")
    manufacturer = models.ForeignKey(
        Manufacturer,
        on_delete=models.SET_NULL,
        null=True,
        related_name="inquiries",
        help_text="Vehicle manufacturer"
    )
    model = models.ForeignKey(
        VehicleModel,
        on_delete=models.SET_NULL,
        null=True,
        related_name="inquiries",
        help_text="Vehicle model"
    )
    part_category = models.ForeignKey(
        PartCategory,
        on_delete=models.SET_NULL,
        null=True,
        related_name="inquiries",
        help_text="Part category being searched"
    )
    
    # Customer Contact Information
    name = models.CharField(max_length=255, help_text="Customer's name")
    email = models.EmailField(max_length=255, help_text="Customer's email address")
    phone = models.CharField(max_length=20, help_text="Customer's phone number")
    zipcode = models.CharField(max_length=10, help_text="Customer's ZIP code")
    
    # Additional Information
    additional_notes = models.TextField(
        blank=True,
        help_text="Any additional information or special requests"
    )
    
    # Status tracking
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="new",
        help_text="Current status of the inquiry"
    )
    
    # Admin notes
    admin_notes = models.TextField(
        blank=True,
        help_text="Internal notes for admin staff"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text="IP address of the submitter"
    )
    user_agent = models.TextField(
        blank=True,
        help_text="Browser user agent"
    )
    
    class Meta:
        db_table = "parts_inquiries"
        verbose_name = "Parts Inquiry"
        verbose_name_plural = "Parts Inquiries"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["status"]),
            models.Index(fields=["-created_at"]),
            models.Index(fields=["manufacturer", "model"]),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.year} {self.manufacturer} {self.model} ({self.created_at.strftime('%Y-%m-%d')})"
    
    def mark_as_completed(self):
        """Mark this inquiry as completed"""
        self.status = "completed"
        self.completed_at = timezone.now()
        self.save(update_fields=["status", "completed_at", "updated_at"])


class ContactSubmission(models.Model):
    """
    Model to store contact form submissions from users
    No authentication required - anyone can submit
    """

    STATUS_CHOICES = [
        ("new", "New"),
        ("in_progress", "In Progress"),
        ("resolved", "Resolved"),
        ("closed", "Closed"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Contact Information
    email = models.EmailField(
        max_length=255, help_text="User's email address for response"
    )

    name = models.CharField(
        max_length=255, blank=True, help_text="User's name (optional)"
    )

    subject = models.CharField(
        max_length=255, blank=True, help_text="Subject of the inquiry"
    )

    # Message/Query
    message = models.TextField(help_text="User's query or message to the company")

    # Additional Information
    phone = models.CharField(
        max_length=20, blank=True, help_text="Phone number (optional)"
    )

    # Status tracking
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="new",
        help_text="Current status of the inquiry",
    )

    # Admin notes
    admin_notes = models.TextField(
        blank=True, help_text="Internal notes for admin staff"
    )

    # Timestamps
    created_at = models.DateTimeField(
        auto_now_add=True, help_text="When the contact form was submitted"
    )

    updated_at = models.DateTimeField(
        auto_now=True, help_text="Last time this record was updated"
    )

    resolved_at = models.DateTimeField(
        null=True, blank=True, help_text="When the inquiry was resolved"
    )

    # Metadata
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text="IP address of the submitter (for spam prevention)",
    )

    user_agent = models.TextField(
        blank=True, help_text="Browser user agent (for spam prevention)"
    )

    class Meta:
        db_table = "contact_submissions"
        verbose_name = "Contact Submission"
        verbose_name_plural = "Contact Submissions"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["status"]),
            models.Index(fields=["-created_at"]),
        ]

    def __str__(self):
        name_display = self.name if self.name else "Anonymous"
        return f"{name_display} ({self.email}) - {self.created_at.strftime('%Y-%m-%d')}"

    def mark_as_resolved(self):
        """Mark this inquiry as resolved"""
        self.status = "resolved"
        self.resolved_at = timezone.now()
        self.save(update_fields=["status", "resolved_at", "updated_at"])

    def mark_as_in_progress(self):
        """Mark this inquiry as in progress"""
        self.status = "in_progress"
        self.save(update_fields=["status", "updated_at"])

    def to_dict(self):
        """Convert contact submission to dictionary for API responses"""
        return {
            "id": str(self.id),
            "email": self.email,
            "name": self.name,
            "subject": self.subject,
            "message": self.message,
            "phone": self.phone,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    @property
    def is_new(self):
        """Check if this is a new, unread submission"""
        return self.status == "new"

    @property
    def response_time(self):
        """Calculate time taken to resolve (if resolved)"""
        if self.resolved_at:
            delta = self.resolved_at - self.created_at
            return delta
        return None





        