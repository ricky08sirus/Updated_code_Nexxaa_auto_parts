# authentication/serializers.py
from rest_framework import serializers
from .models import (
    ContactSubmission,
    PartsInquiry,
    Manufacturer,
    VehicleModel,
    PartCategory,
    PartInventory,
    PartImage,
    PartImageGallery,
    PartImageUpload,
    PartImageTag,
)


# ============================================================================
# REFERENCE DATA SERIALIZERS (Manufacturers, Models, Categories)
# ============================================================================

class ManufacturerSerializer(serializers.ModelSerializer):
    """Serializer for Manufacturer"""

    class Meta:
        model = Manufacturer
        fields = ["id", "name", "code", "is_active"]


class VehicleModelSerializer(serializers.ModelSerializer):
    """Serializer for Vehicle Model"""

    manufacturer_name = serializers.CharField(
        source="manufacturer.name", read_only=True
    )

    class Meta:
        model = VehicleModel
        fields = ["id", "name", "code", "manufacturer", "manufacturer_name", "is_active"]


class PartCategorySerializer(serializers.ModelSerializer):
    """Serializer for Part Category"""

    class Meta:
        model = PartCategory
        fields = ["id", "name", "description", "is_active"]


# ============================================================================
# INQUIRY & CONTACT SERIALIZERS
# ============================================================================

class PartsInquirySerializer(serializers.ModelSerializer):
    """
    Serializer for parts inquiry submissions
    """

    manufacturer_name = serializers.CharField(
        source="manufacturer.name", read_only=True
    )
    model_name = serializers.CharField(source="model.name", read_only=True)
    part_category_name = serializers.CharField(
        source="part_category.name", read_only=True
    )

    class Meta:
        model = PartsInquiry
        fields = [
            "id",
            "year",
            "manufacturer",
            "manufacturer_name",
            "model",
            "model_name",
            "part_category",
            "part_category_name",
            "name",
            "email",
            "phone",
            "zipcode",
            "additional_notes",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "status", "created_at"]

    def validate_year(self, value):
        """Validate year is reasonable"""
        from datetime import datetime

        current_year = datetime.now().year

        if value < 1950 or value > current_year + 2:
            raise serializers.ValidationError(
                f"Year must be between 1950 and {current_year + 2}"
            )
        return value

    def validate_email(self, value):
        """Validate email format"""
        if not value or "@" not in value:
            raise serializers.ValidationError("Please provide a valid email address")
        return value.lower().strip()

    def validate_phone(self, value):
        """Validate phone number"""
        if not value or len(value.strip()) < 10:
            raise serializers.ValidationError("Please provide a valid phone number")
        return value.strip()

    def validate_name(self, value):
        """Validate name"""
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Please provide a valid name")
        return value.strip()

    def validate_zipcode(self, value):
        """Validate zipcode"""
        if not value or len(value.strip()) < 5:
            raise serializers.ValidationError("Please provide a valid ZIP code")
        return value.strip()

    def validate(self, data):
        """Cross-field validation"""
        # Validate that model belongs to the selected manufacturer
        if data.get("model") and data.get("manufacturer"):
            if data["model"].manufacturer != data["manufacturer"]:
                raise serializers.ValidationError(
                    {
                        "model": "Selected model does not belong to the selected manufacturer"
                    }
                )

        return data


class ContactSubmissionSerializer(serializers.ModelSerializer):
    """
    Serializer for contact form submissions
    """

    class Meta:
        model = ContactSubmission
        fields = [
            "id",
            "name",
            "email",
            "subject",
            "message",
            "phone",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate_email(self, value):
        """Validate email format"""
        if not value or "@" not in value:
            raise serializers.ValidationError("Please provide a valid email address")
        return value.lower().strip()

    def validate_message(self, value):
        """Validate message is not empty and within limits"""
        if not value or len(value.strip()) < 10:
            raise serializers.ValidationError(
                "Message must be at least 10 characters long"
            )
        if len(value) > 5000:
            raise serializers.ValidationError(
                "Message is too long (max 5000 characters)"
            )
        return value.strip()

    def validate_name(self, value):
        """Clean up name"""
        return value.strip() if value else ""

    def validate_subject(self, value):
        """Clean up subject"""
        return value.strip() if value else ""


# ============================================================================
# INVENTORY SERIALIZERS (For Selling Parts)
# ============================================================================

class PartImageSerializer(serializers.ModelSerializer):
    """Serializer for part inventory images"""
    
    class Meta:
        model = PartImage
        fields = ["id", "image", "caption", "order"]


class PartInventorySerializer(serializers.ModelSerializer):
    """
    Detailed serializer for part inventory with pricing and stock
    Used for single part detail view
    """
    
    manufacturer_name = serializers.CharField(
        source="manufacturer.name", read_only=True
    )
    model_name = serializers.CharField(source="model.name", read_only=True)
    part_category_name = serializers.CharField(
        source="part_category.name", read_only=True
    )
    images = PartImageSerializer(many=True, read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True)

    class Meta:
        model = PartInventory
        fields = [
            "id",
            "year",
            "manufacturer",
            "manufacturer_name",
            "model",
            "model_name",
            "part_category",
            "part_category_name",
            "part_name",
            "part_number",
            "description",
            "primary_image",
            "images",
            "price",
            "compare_at_price",
            "discount_percentage",
            "stock_quantity",
            "status",
            "condition",
            "weight",
            "dimensions",
            "warranty_months",
            "is_featured",
            "is_in_stock",
            "is_low_stock",
            "slug",
            "created_at",
            "updated_at",
        ]


class PartInventoryListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for inventory list view
    Optimized for performance - only essential fields
    """
    
    manufacturer_name = serializers.CharField(source="manufacturer.name", read_only=True)
    model_name = serializers.CharField(source="model.name", read_only=True)
    part_category_name = serializers.CharField(source="part_category.name", read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = PartInventory
        fields = [
            "id",
            "year",
            "manufacturer_name",
            "model_name",
            "part_category_name",
            "part_name",
            "part_number",
            "primary_image",
            "price",
            "compare_at_price",
            "discount_percentage",
            "status",
            "condition",
            "is_in_stock",
            "is_featured",
            "slug",
        ]


# ============================================================================
# PART IMAGE GALLERY SERIALIZERS (For R2 Storage Reference Images)
# ============================================================================

class PartImageUploadSerializer(serializers.ModelSerializer):
    """Serializer for individual part images uploaded to R2"""
    
    thumbnail_url = serializers.ReadOnlyField()
    full_url = serializers.ReadOnlyField()
    
    class Meta:
        model = PartImageUpload
        fields = [
            'id',
            'image',
            'image_url',
            'thumbnail_url',
            'full_url',
            'caption',
            'is_primary',
            'display_order',
            'file_size',
            'width',
            'height',
            'uploaded_at'
        ]
        read_only_fields = ['id', 'thumbnail_url', 'full_url', 'uploaded_at']


class PartImageTagSerializer(serializers.ModelSerializer):
    """Serializer for image tags"""
    
    class Meta:
        model = PartImageTag
        fields = ['id', 'name', 'slug', 'description']
        read_only_fields = ['id', 'slug']


class PartImageGallerySerializer(serializers.ModelSerializer):
    """
    Detailed serializer for part image galleries
    Used for single gallery view with all images
    Includes complete information about the part and all associated images
    """
    
    manufacturer_name = serializers.CharField(source='manufacturer.name', read_only=True)
    model_name = serializers.CharField(source='model.name', read_only=True)
    part_category_name = serializers.CharField(source='part_category.name', read_only=True)
    images = PartImageUploadSerializer(many=True, read_only=True)
    tags = PartImageTagSerializer(many=True, read_only=True)
    image_count = serializers.ReadOnlyField()
    r2_folder_path = serializers.ReadOnlyField()
    primary_image = serializers.SerializerMethodField()
    
    class Meta:
        model = PartImageGallery
        fields = [
            'id',
            'year',
            'manufacturer',
            'manufacturer_name',
            'model',
            'model_name',
            'part_category',
            'part_category_name',
            'part_name',
            'part_number',
            'description',
            'primary_image',
            'images',
            'image_count',
            'tags',
            'is_published',
            'is_featured',
            'r2_folder_path',
            'slug',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']
    
    def get_primary_image(self, obj):
        """Get primary image or first image with thumbnail"""
        primary = obj.images.filter(is_primary=True).first()
        if not primary:
            primary = obj.images.first()
        
        if primary:
            return {
                'id': str(primary.id),
                'url': primary.full_url,
                'thumbnail': primary.thumbnail_url,
                'caption': primary.caption
            }
        return None


class PartImageGalleryListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for gallery list view
    Optimized for performance - doesn't load all images
    Perfect for browsing and search results
    """
    
    manufacturer_name = serializers.CharField(source='manufacturer.name', read_only=True)
    model_name = serializers.CharField(source='model.name', read_only=True)
    part_category_name = serializers.CharField(source='part_category.name', read_only=True)
    image_count = serializers.ReadOnlyField()
    primary_image = serializers.SerializerMethodField()
    
    class Meta:
        model = PartImageGallery
        fields = [
            'id',
            'year',
            'manufacturer_name',
            'model_name',
            'part_category_name',
            'part_name',
            'part_number',
            'description', 
            'primary_image',
            'image_count',
            'is_featured',
            'slug',
            'created_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at']
    
    def get_primary_image(self, obj):
        """Get primary image thumbnail URL only (lightweight)"""
        primary = obj.images.filter(is_primary=True).first()
        if not primary:
            primary = obj.images.first()
        
        if primary:
            return {
                'thumbnail': primary.thumbnail_url,
                'url': primary.full_url
            }
        return None


# ============================================================================
# COMBINED SEARCH SERIALIZER (Optional - for unified search)
# ============================================================================

class UnifiedPartSearchSerializer(serializers.Serializer):
    """
    Serializer for unified search across inventory and gallery
    Can be used for a single search endpoint that returns both types
    Useful for implementing a global search feature
    """
    
    id = serializers.UUIDField()
    type = serializers.CharField(help_text="'inventory' or 'gallery'")
    year = serializers.IntegerField()
    manufacturer = serializers.CharField()
    model = serializers.CharField()
    part_category = serializers.CharField()
    part_name = serializers.CharField()
    part_number = serializers.CharField(allow_null=True, required=False)
    image = serializers.CharField(allow_null=True, required=False)
    price = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        allow_null=True, 
        required=False
    )
    stock_available = serializers.BooleanField(default=False)
    slug = serializers.CharField()
    created_at = serializers.DateTimeField()
    
    class Meta:
        # This is a read-only serializer for search results
        read_only = True
