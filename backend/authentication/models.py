# authentication/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.utils.text import slugify
from django.core.validators import MinValueValidator
import uuid
from decimal import Decimal
from django.core.validators import EmailValidator, RegexValidator



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
    """Model for customer parts inquiries"""
    
    # Primary Key - UUID
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Customer Information
    name = models.CharField(max_length=255, help_text="Customer name")
    email = models.EmailField(help_text="Customer email address")
    phone = models.CharField(max_length=20, blank=True, help_text="Customer phone")
    zipcode = models.CharField(max_length=10, blank=True, help_text="Customer zipcode")
    
    # Vehicle Information - Using ForeignKeys
    manufacturer = models.ForeignKey(
        Manufacturer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Car manufacturer"
    )
    model = models.ForeignKey(
        VehicleModel,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Car model"
    )
    year = models.IntegerField(
        default=2024,
        blank=True,
        null=True,
        help_text="Car year"
    )
    part_category = models.ForeignKey(
        PartCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Category of parts needed"
    )
    
    # Parts Information
    parts_needed = models.TextField(
        default='',
        blank=True,
        help_text="Description of parts needed"
    )
    
    # Status
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('quoted', 'Quoted'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Email Response Tracking
    email_sent = models.BooleanField(
        default=False,
        help_text="Whether a reply email has been sent"
    )
    email_sent_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the reply email was sent"
    )
    email_sent_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sent_inquiry_emails',
        help_text="Admin who sent the email"
    )
    email_subject = models.CharField(
        max_length=255,
        blank=True,
        help_text="Subject line of the sent email"
    )
    email_message = models.TextField(
        blank=True,
        help_text="Custom message sent in the email"
    )
    email_error = models.TextField(
        blank=True,
        help_text="Error message if email failed to send"
    )
    
    # Parts Information Sent (store as JSON)
    parts_info_sent = models.JSONField(
        null=True,
        blank=True,
        help_text="Information about parts sent in the email"
    )
    
    # Metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        db_table = "parts_inquiries"
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["status"]),
            models.Index(fields=["-created_at"]),
            models.Index(fields=["manufacturer", "model"]),
            models.Index(fields=["email_sent"]),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        manufacturer_name = self.manufacturer.name if self.manufacturer else "Unknown"
        model_name = self.model.name if self.model else "unknown"
        return f"{self.name} - {manufacturer_name} {model_name} ({self.status})"
    
    def mark_email_sent(self, user, subject, message, parts_info):
        """Mark this inquiry as having received an email reply"""
        from django.utils import timezone
        
        self.email_sent = True
        self.email_sent_at = timezone.now()
        self.email_sent_by = user
        self.email_subject = subject
        self.email_message = message
        self.parts_info_sent = parts_info
        self.status = "quoted"
        self.save(update_fields=[
            'email_sent',
            'email_sent_at',
            'email_sent_by',
            'email_subject',
            'email_message',
            'parts_info_sent',
            'status',
            'updated_at'
        ])
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




# ============================================================================
# PRICING MODELS
# ============================================================================

class PartPrice(models.Model):
    """
    Flexible pricing model for parts
    Allows storing multiple price points and conditions
    """
    
    CONDITION_CHOICES = [
        ('new', 'New'),
        ('used_excellent', 'Used - Excellent'),
        ('used_good', 'Used - Good'),
        ('used_fair', 'Used - Fair'),
        ('refurbished', 'Refurbished'),
        ('oem', 'OEM'),
        ('aftermarket', 'Aftermarket'),
    ]
    
    PRICE_TYPE_CHOICES = [
        ('retail', 'Retail Price'),
        ('wholesale', 'Wholesale Price'),
        ('core_charge', 'Core Charge'),
        ('exchange', 'Exchange Price'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Link to vehicle and part
    year = models.IntegerField(verbose_name="Vehicle Year")
    manufacturer = models.ForeignKey(
        'Manufacturer',
        on_delete=models.CASCADE,
        related_name='part_prices',
        verbose_name="Manufacturer"
    )
    model = models.ForeignKey(
        'VehicleModel',
        on_delete=models.CASCADE,
        related_name='part_prices',
        verbose_name="Vehicle Model"
    )
    part_category = models.ForeignKey(
        'PartCategory',
        on_delete=models.CASCADE,
        related_name='part_prices',
        verbose_name="Part Category"
    )
    
    # Part Details
    part_name = models.CharField(
        max_length=255,
        help_text="Specific part name"
    )
    part_number = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="OEM or manufacturer part number (optional)"
    )
    
    # Pricing Information
    condition = models.CharField(
        max_length=20,
        choices=CONDITION_CHOICES,
        default='used_good',
        help_text="Condition of the part"
    )
    price_type = models.CharField(
        max_length=20,
        choices=PRICE_TYPE_CHOICES,
        default='retail',
        help_text="Type of pricing"
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
        help_text="Price in USD"
    )
    original_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        help_text="Original/MSRP price (for showing discounts)"
    )
    
    # Additional Pricing Details
    core_charge = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        default=0,
        help_text="Core charge if applicable"
    )
    shipping_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        default=0,
        help_text="Estimated shipping cost"
    )
    
    # Availability
    in_stock = models.BooleanField(
        default=True,
        help_text="Whether this part is currently in stock"
    )
    quantity_available = models.IntegerField(
        default=1,
        validators=[MinValueValidator(0)],
        help_text="Number of units available"
    )
    
    # Validity Period
    valid_from = models.DateField(
        default=timezone.now,
        help_text="Price valid from this date"
    )
    valid_until = models.DateField(
        blank=True,
        null=True,
        help_text="Price valid until this date (optional)"
    )
    
    # Additional Info
    warranty_months = models.IntegerField(
        blank=True,
        null=True,
        help_text="Warranty period in months"
    )
    notes = models.TextField(
        blank=True,
        help_text="Additional notes about this price/part"
    )
    
    # Link to inventory (optional)
    inventory_item = models.ForeignKey(
        'PartInventory',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='prices',
        help_text="Link to inventory item if applicable"
    )
    
    # Link to image gallery (optional)
    gallery_reference = models.ForeignKey(
        'PartImageGallery',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='prices',
        help_text="Link to image gallery for this part"
    )
    
    # Status
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this price is currently active/visible"
    )
    is_featured = models.BooleanField(
        default=False,
        help_text="Feature this price in listings"
    )
    
    # Tracking
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_prices',
        verbose_name="Created By"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'part_prices'
        verbose_name = 'Part Price'
        verbose_name_plural = 'Part Prices'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['year', 'manufacturer', 'model']),
            models.Index(fields=['part_category']),
            models.Index(fields=['is_active', 'in_stock']),
            models.Index(fields=['condition', 'price_type']),
        ]
    
    def __str__(self):
        """
        String representation with error handling for unsaved instances
        """
        try:
            manufacturer_name = self.manufacturer.name if self.manufacturer else "Unknown"
            model_name = self.model.name if self.model else "Unknown"
            return f"{self.year} {manufacturer_name} {model_name} - {self.part_name} (${self.price})"
        except:
            # Fallback for unsaved/incomplete instances
            return f"PartPrice - {self.part_name if hasattr(self, 'part_name') and self.part_name else 'New'}"











    @property
    def discount_percentage(self):
        """Calculate discount percentage if original price exists"""
        if self.original_price and self.price:
            return int(((self.original_price - self.price) / self.original_price) * 100)
        return 0
    
    @property
    def total_price(self):
        """Calculate total price including core charge and shipping"""
        total = self.price
        if self.core_charge:
            total += self.core_charge
        if self.shipping_cost:
            total += self.shipping_cost
        return total
    
    @property
    def is_valid(self):
        """Check if price is currently valid based on date range"""
        today = timezone.now().date()
        if self.valid_until:
            return self.valid_from <= today <= self.valid_until
        return self.valid_from <= today
    
    def save(self, *args, **kwargs):
    # Auto-update in_stock based on quantity
        if self.quantity_available == 0:
            self.in_stock = False
        
        if self.gallery_reference:
            self.year = self.gallery_reference.year
            self.manufacturer = self.gallery_reference.manufacturer
            self.model = self.gallery_reference.model
            self.part_category = self.gallery_reference.part_category
            self.part_name = self.gallery_reference.part_name

        super().save(*args, **kwargs)


# ============================================================================
# PART IMAGE MODELS (For Inventory Parts)
# ============================================================================



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

# =================================================================================
# registration models
# =================================================================================
# authentication/models.py
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

    class Meta:
        db_table = 'user_profiles'

# Signal to create UserProfile automatically when User is created
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        # Only create profile if it doesn't exist
        UserProfile.objects.get_or_create(user=instance)


# @receiver(post_save, sender=User)
# def save_user_profile(sender, instance, **kwargs):
#     instance.profile.save()


# =============================================================
# shipping addres models
# =============================================================

# models.py
from django.db import models

class ShippingAddress(models.Model):
    country = models.CharField(max_length=100)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    street_address = models.CharField(max_length=255)
    street_address_2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=20)
    email = models.EmailField()
    country_code = models.CharField(max_length=20)
    phone = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'shipping_addresses'
        verbose_name = 'Shipping Address'
        verbose_name_plural = 'Shipping Addresses'

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.city}, {self.state}"
# ===================================================================================================

# Enquiry form image uploading 

class ProductImage(models.Model):
    """
    Model to store product images linked to vehicle specifications
    Images are matched based on manufacturer, model, year, and part category
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Vehicle Information - Linking to existing models
    manufacturer = models.ForeignKey(
        'Manufacturer',
        on_delete=models.CASCADE,
        related_name="product_images",
        help_text="Car manufacturer"
    )
    model = models.ForeignKey(
        'VehicleModel',
        on_delete=models.CASCADE,
        related_name="product_images",
        help_text="Car model"
    )
    year = models.IntegerField(
        help_text="Car year"
    )
    part_category = models.ForeignKey(
        'PartCategory',
        on_delete=models.CASCADE,
        related_name="product_images",
        help_text="Category of the part"
    )
    
    # Image Information
    image = models.ImageField(
        upload_to='product_images/%Y/%m/%d/',
        help_text="Product image"
    )
    
    # Specification as a number (e.g., 10 specifications)
    specification_number = models.IntegerField(
        default=0,
        help_text="Number of specifications (e.g., 10)"
    )
    
    # Metadata
    is_active = models.BooleanField(
        default=True,
        help_text="Whether to display this image"
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='uploaded_product_images'
    )
    
    class Meta:
        db_table = "product_images"
        verbose_name = "Product Image"
        verbose_name_plural = "Product Images"
        ordering = ['-uploaded_at']
        indexes = [
            models.Index(fields=['manufacturer', 'model', 'year', 'part_category']),
            models.Index(fields=['is_active']),
            models.Index(fields=['-uploaded_at']),
        ]
        # Ensure only one image per vehicle/category combination
        unique_together = [['manufacturer', 'model', 'year', 'part_category']]
    
    def __str__(self):
        return f"{self.manufacturer.name} {self.model.name} {self.year} - {self.part_category.name}"