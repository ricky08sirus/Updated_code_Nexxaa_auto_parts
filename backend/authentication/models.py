# # authentication/models.py
# from django.db import models
# from django.utils import timezone
# import uuid
# from django.core.validators import MinValueValidator
# from decimal import Decimal


# class Manufacturer(models.Model):
#     """
#     Model to store vehicle manufacturers (e.g., Acura, Honda, Toyota)
#     """

#     id = models.AutoField(primary_key=True)
#     name = models.CharField(max_length=100, unique=True, help_text="Manufacturer name")
#     code = models.CharField(
#         max_length=20, unique=True, help_text="Short code for manufacturer"
#     )
#     is_active = models.BooleanField(
#         default=True, help_text="Whether this manufacturer is currently available"
#     )
#     created_at = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         db_table = "manufacturers"
#         verbose_name = "Manufacturer"
#         verbose_name_plural = "Manufacturers"
#         ordering = ["name"]

#     def __str__(self):
#         return self.name


# class VehicleModel(models.Model):
#     """
#     Model to store vehicle models linked to manufacturers
#     """

#     id = models.AutoField(primary_key=True)
#     manufacturer = models.ForeignKey(
#         Manufacturer,
#         on_delete=models.CASCADE,
#         related_name="models",
#         help_text="Associated manufacturer",
#     )
#     name = models.CharField(max_length=100, help_text="Model name (e.g., CL, Accord)")
#     code = models.CharField(max_length=20, help_text="Short code for model")
#     is_active = models.BooleanField(
#         default=True, help_text="Whether this model is currently available"
#     )
#     created_at = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         db_table = "vehicle_models"
#         verbose_name = "Vehicle Model"
#         verbose_name_plural = "Vehicle Models"
#         ordering = ["name"]
#         unique_together = [["manufacturer", "name"]]

#     def __str__(self):
#         return f"{self.manufacturer.name} - {self.name}"


# class PartCategory(models.Model):
#     """
#     Model to store auto part categories (e.g., Abs Brake Pump, Engine Parts)
#     """

#     id = models.AutoField(primary_key=True)
#     name = models.CharField(max_length=100, unique=True, help_text="Part category name")
#     description = models.TextField(
#         blank=True, help_text="Description of the part category"
#     )
#     is_active = models.BooleanField(default=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         db_table = "part_categories"
#         verbose_name = "Part Category"
#         verbose_name_plural = "Part Categories"
#         ordering = ["name"]

#     def __str__(self):
#         return self.name


# class PartsInquiry(models.Model):
#     """
#     Model to store parts search/inquiry submissions from users
#     """

#     STATUS_CHOICES = [
#         ("new", "New"),
#         ("in_progress", "In Progress"),
#         ("quoted", "Quote Sent"),
#         ("completed", "Completed"),
#         ("cancelled", "Cancelled"),
#     ]

#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

#     # Vehicle Information
#     year = models.IntegerField(help_text="Vehicle year")
#     manufacturer = models.ForeignKey(
#         Manufacturer,
#         on_delete=models.SET_NULL,
#         null=True,
#         related_name="inquiries",
#         help_text="Vehicle manufacturer",
#     )
#     model = models.ForeignKey(
#         VehicleModel,
#         on_delete=models.SET_NULL,
#         null=True,
#         related_name="inquiries",
#         help_text="Vehicle model",
#     )
#     part_category = models.ForeignKey(
#         PartCategory,
#         on_delete=models.SET_NULL,
#         null=True,
#         related_name="inquiries",
#         help_text="Part category being searched",
#     )

#     # Customer Contact Information
#     name = models.CharField(max_length=255, help_text="Customer's name")
#     email = models.EmailField(max_length=255, help_text="Customer's email address")
#     phone = models.CharField(max_length=20, help_text="Customer's phone number")
#     zipcode = models.CharField(max_length=10, help_text="Customer's ZIP code")

#     # Additional Information
#     additional_notes = models.TextField(
#         blank=True, help_text="Any additional information or special requests"
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
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     completed_at = models.DateTimeField(null=True, blank=True)

#     # Metadata
#     ip_address = models.GenericIPAddressField(
#         null=True, blank=True, help_text="IP address of the submitter"
#     )
#     user_agent = models.TextField(blank=True, help_text="Browser user agent")

#     class Meta:
#         db_table = "parts_inquiries"
#         verbose_name = "Parts Inquiry"
#         verbose_name_plural = "Parts Inquiries"
#         ordering = ["-created_at"]
#         indexes = [
#             models.Index(fields=["email"]),
#             models.Index(fields=["status"]),
#             models.Index(fields=["-created_at"]),
#             models.Index(fields=["manufacturer", "model"]),
#         ]

#     def __str__(self):
#         return f"{self.name} - {self.year} {self.manufacturer} {self.model} ({self.created_at.strftime('%Y-%m-%d')})"

#     def mark_as_completed(self):
#         """Mark this inquiry as completed"""
#         self.status = "completed"
#         self.completed_at = timezone.now()
#         self.save(update_fields=["status", "completed_at", "updated_at"])


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


# class PartInventory(models.Model):
#     """
#     Model to store actual parts inventory with images, pricing, and stock
#     """

#     STATUS_CHOICES = [
#         ("available", "Available"),
#         ("out_of_stock", "Out of Stock"),
#         ("discontinued", "Discontinued"),
#         ("coming_soon", "Coming Soon"),
#     ]

#     CONDITION_CHOICES = [
#         ("new", "New"),
#         ("used", "Used"),
#         ("refurbished", "Refurbished"),
#         ("oem", "OEM"),
#         ("aftermarket", "Aftermarket"),
#     ]

#     # Vehicle Information
#     year = models.IntegerField()
#     manufacturer = models.ForeignKey("Manufacturer", on_delete=models.CASCADE)
#     model = models.ForeignKey("VehicleModel", on_delete=models.CASCADE)

#     # Part Information
#     part_category = models.ForeignKey("PartCategory", on_delete=models.CASCADE)
#     part_name = models.CharField(max_length=255, help_text="Specific part name")
#     part_number = models.CharField(
#         max_length=100, blank=True, null=True, help_text="OEM/Manufacturer part number"
#     )
#     description = models.TextField(blank=True, null=True)

#     # Images (multiple images support)
#     primary_image = models.ImageField(
#         upload_to="parts/images/%Y/%m/", blank=True, null=True
#     )

#     # Pricing (optional)
#     price = models.DecimalField(
#         max_digits=10,
#         decimal_places=2,
#         blank=True,
#         null=True,
#         validators=[MinValueValidator(Decimal("0.01"))],
#         help_text="Price in USD",
#     )
#     compare_at_price = models.DecimalField(
#         max_digits=10,
#         decimal_places=2,
#         blank=True,
#         null=True,
#         help_text="Original price for showing discounts",
#     )

#     # Inventory
#     stock_quantity = models.IntegerField(
#         default=0, validators=[MinValueValidator(0)], help_text="Available quantity"
#     )
#     low_stock_threshold = models.IntegerField(
#         default=5, help_text="Alert when stock falls below this number"
#     )
#     status = models.CharField(
#         max_length=20, choices=STATUS_CHOICES, default="available"
#     )
#     condition = models.CharField(
#         max_length=20, choices=CONDITION_CHOICES, default="used"
#     )

#     # Additional Details
#     weight = models.DecimalField(
#         max_digits=8, decimal_places=2, blank=True, null=True, help_text="Weight in lbs"
#     )
#     dimensions = models.CharField(
#         max_length=100, blank=True, null=True, help_text="L x W x H"
#     )
#     warranty_months = models.IntegerField(
#         blank=True, null=True, help_text="Warranty period in months"
#     )

#     # SEO & Display
#     is_featured = models.BooleanField(default=False)
#     is_published = models.BooleanField(default=True)
#     slug = models.SlugField(max_length=255, unique=True, blank=True)

#     # Metadata
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     created_by = models.ForeignKey(
#         "auth.User", on_delete=models.SET_NULL, null=True, blank=True
#     )

#     class Meta:
#         ordering = ["-created_at"]
#         verbose_name = "Part Inventory"
#         verbose_name_plural = "Parts Inventory"
#         indexes = [
#             models.Index(fields=["year", "manufacturer", "model"]),
#             models.Index(fields=["part_category"]),
#             models.Index(fields=["status"]),
#         ]

#     def __str__(self):
#         return (
#             f"{self.year} {self.manufacturer.name} {self.model.name} - {self.part_name}"
#         )

#     def save(self, *args, **kwargs):
#         # Auto-generate slug if not provided
#         if not self.slug:
#             from django.utils.text import slugify

#             base_slug = slugify(
#                 f"{self.year}-{self.manufacturer.name}-{self.model.name}-{self.part_name}"
#             )
#             slug = base_slug
#             counter = 1
#             while PartInventory.objects.filter(slug=slug).exists():
#                 slug = f"{base_slug}-{counter}"
#                 counter += 1
#             self.slug = slug

#         # Auto-update status based on stock
#         if self.stock_quantity == 0:
#             self.status = "out_of_stock"
#         elif self.stock_quantity > 0 and self.status == "out_of_stock":
#             self.status = "available"

#         super().save(*args, **kwargs)

#     @property
#     def is_low_stock(self):
#         return 0 < self.stock_quantity <= self.low_stock_threshold

#     @property
#     def is_in_stock(self):
#         return self.stock_quantity > 0

#     @property
#     def discount_percentage(self):
#         if self.compare_at_price and self.price:
#             return int(
#                 ((self.compare_at_price - self.price) / self.compare_at_price) * 100
#             )
#         return 0


# class PartImage(models.Model):
#     """
#     Additional images for parts (multiple images per part)
#     """

#     part = models.ForeignKey(
#         PartInventory, related_name="images", on_delete=models.CASCADE
#     )
#     image = models.ImageField(upload_to="parts/images/%Y/%m/")
#     caption = models.CharField(max_length=255, blank=True, null=True)
#     order = models.IntegerField(default=0, help_text="Display order")
#     created_at = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         ordering = ["order", "created_at"]

#     def __str__(self):
#         return f"Image for {self.part.part_name}"














# authentication/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.utils.text import slugify
from django.core.validators import MinValueValidator
import uuid
from decimal import Decimal


# ============================================================================
# VEHICLE & PARTS REFERENCE MODELS
# ============================================================================

class Manufacturer(models.Model):
    """
    Model to store vehicle manufacturers (e.g., Acura, Honda, Toyota)
    """

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True, help_text="Manufacturer name")
    code = models.CharField(
        max_length=20, unique=True, help_text="Short code for manufacturer"
    )
    is_active = models.BooleanField(
        default=True, help_text="Whether this manufacturer is currently available"
    )
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
        help_text="Associated manufacturer",
    )
    name = models.CharField(max_length=100, help_text="Model name (e.g., CL, Accord)")
    code = models.CharField(max_length=20, help_text="Short code for model")
    is_active = models.BooleanField(
        default=True, help_text="Whether this model is currently available"
    )
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
    description = models.TextField(
        blank=True, help_text="Description of the part category"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "part_categories"
        verbose_name = "Part Category"
        verbose_name_plural = "Part Categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


# ============================================================================
# CUSTOMER INQUIRY MODELS
# ============================================================================

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
        help_text="Vehicle manufacturer",
    )
    model = models.ForeignKey(
        VehicleModel,
        on_delete=models.SET_NULL,
        null=True,
        related_name="inquiries",
        help_text="Vehicle model",
    )
    part_category = models.ForeignKey(
        PartCategory,
        on_delete=models.SET_NULL,
        null=True,
        related_name="inquiries",
        help_text="Part category being searched",
    )

    # Customer Contact Information
    name = models.CharField(max_length=255, help_text="Customer's name")
    email = models.EmailField(max_length=255, help_text="Customer's email address")
    phone = models.CharField(max_length=20, help_text="Customer's phone number")
    zipcode = models.CharField(max_length=10, help_text="Customer's ZIP code")

    # Additional Information
    additional_notes = models.TextField(
        blank=True, help_text="Any additional information or special requests"
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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    # Metadata
    ip_address = models.GenericIPAddressField(
        null=True, blank=True, help_text="IP address of the submitter"
    )
    user_agent = models.TextField(blank=True, help_text="Browser user agent")

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


# ============================================================================
# INVENTORY MANAGEMENT MODELS (For Selling Parts)
# ============================================================================

class PartInventory(models.Model):
    """
    Model to store actual parts inventory with images, pricing, and stock
    Used for parts that are actively being sold
    """

    STATUS_CHOICES = [
        ("available", "Available"),
        ("out_of_stock", "Out of Stock"),
        ("discontinued", "Discontinued"),
        ("coming_soon", "Coming Soon"),
    ]

    CONDITION_CHOICES = [
        ("new", "New"),
        ("used", "Used"),
        ("refurbished", "Refurbished"),
        ("oem", "OEM"),
        ("aftermarket", "Aftermarket"),
    ]

    # Vehicle Information
    year = models.IntegerField()
    manufacturer = models.ForeignKey("Manufacturer", on_delete=models.CASCADE)
    model = models.ForeignKey("VehicleModel", on_delete=models.CASCADE)

    # Part Information
    part_category = models.ForeignKey("PartCategory", on_delete=models.CASCADE)
    part_name = models.CharField(max_length=255, help_text="Specific part name")
    part_number = models.CharField(
        max_length=100, blank=True, null=True, help_text="OEM/Manufacturer part number"
    )
    description = models.TextField(blank=True, null=True)

    # Images (multiple images support)
    primary_image = models.ImageField(
        upload_to="parts/images/%Y/%m/", blank=True, null=True
    )

    # Pricing (optional)
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        validators=[MinValueValidator(Decimal("0.01"))],
        help_text="Price in USD",
    )
    compare_at_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        help_text="Original price for showing discounts",
    )

    # Inventory
    stock_quantity = models.IntegerField(
        default=0, validators=[MinValueValidator(0)], help_text="Available quantity"
    )
    low_stock_threshold = models.IntegerField(
        default=5, help_text="Alert when stock falls below this number"
    )
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="available"
    )
    condition = models.CharField(
        max_length=20, choices=CONDITION_CHOICES, default="used"
    )

    # Additional Details
    weight = models.DecimalField(
        max_digits=8, decimal_places=2, blank=True, null=True, help_text="Weight in lbs"
    )
    dimensions = models.CharField(
        max_length=100, blank=True, null=True, help_text="L x W x H"
    )
    warranty_months = models.IntegerField(
        blank=True, null=True, help_text="Warranty period in months"
    )

    # Link to Image Gallery (Optional)
    gallery_reference = models.ForeignKey(
        'PartImageGallery',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='inventory_items',
        help_text="Link to reference image gallery for this part"
    )

    # SEO & Display
    is_featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    slug = models.SlugField(max_length=255, unique=True, blank=True)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True
    )

    class Meta:
        db_table = "part_inventory"
        ordering = ["-created_at"]
        verbose_name = "Part Inventory"
        verbose_name_plural = "Parts Inventory"
        indexes = [
            models.Index(fields=["year", "manufacturer", "model"]),
            models.Index(fields=["part_category"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return (
            f"{self.year} {self.manufacturer.name} {self.model.name} - {self.part_name}"
        )

    def save(self, *args, **kwargs):
        # Auto-generate slug if not provided
        if not self.slug:
            base_slug = slugify(
                f"{self.year}-{self.manufacturer.name}-{self.model.name}-{self.part_name}"
            )
            slug = base_slug
            counter = 1
            while PartInventory.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug

        # Auto-update status based on stock
        if self.stock_quantity == 0:
            self.status = "out_of_stock"
        elif self.stock_quantity > 0 and self.status == "out_of_stock":
            self.status = "available"

        super().save(*args, **kwargs)

    @property
    def is_low_stock(self):
        return 0 < self.stock_quantity <= self.low_stock_threshold

    @property
    def is_in_stock(self):
        return self.stock_quantity > 0

    @property
    def discount_percentage(self):
        if self.compare_at_price and self.price:
            return int(
                ((self.compare_at_price - self.price) / self.compare_at_price) * 100
            )
        return 0


class PartImage(models.Model):
    """
    Additional images for parts inventory (multiple images per part)
    """

    part = models.ForeignKey(
        PartInventory, related_name="images", on_delete=models.CASCADE
    )
    image = models.ImageField(upload_to="parts/images/%Y/%m/")
    caption = models.CharField(max_length=255, blank=True, null=True)
    order = models.IntegerField(default=0, help_text="Display order")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "part_images"
        ordering = ["order", "created_at"]
        verbose_name = "Part Image"
        verbose_name_plural = "Part Images"

    def __str__(self):
        return f"Image for {self.part.part_name}"


# ============================================================================
# PART IMAGE GALLERY MODELS (For Reference/Catalog with R2 Storage)
# ============================================================================

class PartImageGallery(models.Model):
    """
    Main model for organizing and uploading part images as reference/catalog
    Admin users select Year/Make/Model/Part and upload images
    Images are stored in R2 with organized folder structure
    This is separate from inventory - used for reference and lookups
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Vehicle and Part Selection
    year = models.IntegerField(verbose_name="Vehicle Year")
    manufacturer = models.ForeignKey(
        'Manufacturer',
        on_delete=models.CASCADE,
        related_name='part_image_galleries',
        verbose_name="Manufacturer"
    )
    model = models.ForeignKey(
        'VehicleModel',
        on_delete=models.CASCADE,
        related_name='part_image_galleries',
        verbose_name="Vehicle Model"
    )
    part_category = models.ForeignKey(
        'PartCategory',
        on_delete=models.CASCADE,
        related_name='part_image_galleries',
        verbose_name="Part Category"
    )
    
    # Part Details
    part_name = models.CharField(
        max_length=255,
        help_text="Specific part name (e.g., Front Bumper, Headlight Left)"
    )
    part_number = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="OEM or manufacturer part number (optional)"
    )
    description = models.TextField(
        blank=True,
        null=True,
        help_text="Additional details about the part"
    )
    
    # Status and Metadata
    is_published = models.BooleanField(
        default=True,
        help_text="Make this part gallery visible in API"
    )
    is_featured = models.BooleanField(
        default=False,
        help_text="Feature this part in listings"
    )
    
    # Tracking
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='uploaded_part_galleries',
        verbose_name="Uploaded By"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Auto-generated slug for URLs
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    
    class Meta:
        db_table = 'part_image_galleries'
        verbose_name = 'Part Image Gallery'
        verbose_name_plural = 'Part Image Galleries'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['year', 'manufacturer', 'model']),
            models.Index(fields=['part_category']),
            models.Index(fields=['is_published']),
        ]
    
    def __str__(self):
        return f"{self.year} {self.manufacturer.name} {self.model.name} - {self.part_name}"
    
    def save(self, *args, **kwargs):
        # Auto-generate slug
        if not self.slug:
            base_slug = slugify(
                f"{self.year}-{self.manufacturer.name}-{self.model.name}-{self.part_name}"
            )
            slug = base_slug
            counter = 1
            while PartImageGallery.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        
        super().save(*args, **kwargs)
    
    @property
    def r2_folder_path(self):
        """Generate organized R2 folder path"""
        return f"{self.year}/{slugify(self.manufacturer.name)}/{slugify(self.model.name)}/{slugify(self.part_category.name)}/"
    
    @property
    def image_count(self):
        """Count of images in this gallery"""
        return self.images.count()


class PartImageUpload(models.Model):
    """
    Individual images uploaded for a part gallery
    Multiple images can be uploaded per PartImageGallery
    Stored in Cloudflare R2
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    gallery = models.ForeignKey(
        PartImageGallery,
        on_delete=models.CASCADE,
        related_name='images',
        verbose_name="Part Gallery"
    )
    
    # Image file (will be uploaded to R2)
    image = models.ImageField(
        upload_to='part_gallery_images/%Y/%m/%d/',
        help_text="Upload part image (will be stored in R2)"
    )
    
    # Image metadata
    image_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="R2 public URL (auto-filled after upload)"
    )
    r2_key = models.CharField(
        max_length=500,
        blank=True,
        null=True,
        help_text="R2 storage key/path"
    )
    
    # Image details
    caption = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Optional caption or description"
    )
    is_primary = models.BooleanField(
        default=False,
        help_text="Set as primary/thumbnail image"
    )
    display_order = models.IntegerField(
        default=0,
        help_text="Order for displaying images (lower = first)"
    )
    
    # Image properties (auto-filled)
    file_size = models.IntegerField(
        null=True,
        blank=True,
        help_text="File size in bytes"
    )
    width = models.IntegerField(null=True, blank=True)
    height = models.IntegerField(null=True, blank=True)
    
    # Tracking
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Uploaded By"
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'part_image_uploads'
        verbose_name = 'Part Image Upload'
        verbose_name_plural = 'Part Image Uploads'
        ordering = ['display_order', 'uploaded_at']
        indexes = [
            models.Index(fields=['gallery', 'is_primary']),
            models.Index(fields=['display_order']),
        ]
    
    def __str__(self):
        return f"Image for {self.gallery.part_name} - {self.caption or 'No caption'}"
    
    @property
    def thumbnail_url(self):
        """Return R2 URL with thumbnail transformation (if available)"""
        if self.image_url:
            # Cloudflare Image Resizing parameters
            return f"{self.image_url}?width=300&height=300&fit=cover"
        return None
    
    @property
    def full_url(self):
        """Return full R2 URL"""
        return self.image_url or self.image.url if self.image else None


class PartImageTag(models.Model):
    """
    Optional: Tags for organizing and searching images
    e.g., "damaged", "restored", "OEM", "aftermarket"
    """
    
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True, blank=True)
    description = models.TextField(blank=True)
    
    galleries = models.ManyToManyField(
        PartImageGallery,
        related_name='tags',
        blank=True
    )
    
    class Meta:
        db_table = 'part_image_tags'
        verbose_name = 'Image Tag'
        verbose_name_plural = 'Image Tags'
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
