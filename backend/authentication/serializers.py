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
    PartPrice,
    PartImageGallery,
    PartImageUpload,
    PartImageTag,
    ProductImage
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
    Fixed to match actual PartsInquiry model fields
    """

    class Meta:
        model = PartsInquiry
        fields = [
            "id",
            "name",
            "email",
            "phone",
            "year",
            "manufacturer",
            "model",
            "part_category",
            "parts_needed",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "status", "created_at"]

    def validate_year(self, value):
        """Validate year is reasonable"""
        from datetime import datetime
        current_year = datetime.now().year
        
        if value and (value < 1950 or value > current_year + 2):
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
        """Validate phone number (optional)"""
        if value and len(value.strip()) < 10:
            raise serializers.ValidationError("Please provide a valid phone number")
        return value.strip() if value else ""

    def validate_name(self, value):
        """Validate name"""
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Please provide a valid name")
        return value.strip()


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





class PartPriceSerializer(serializers.ModelSerializer):
    """Serializer for Part Prices"""
    
    manufacturer_name = serializers.CharField(source='manufacturer.name', read_only=True)
    model_name = serializers.CharField(source='model.name', read_only=True)
    part_category_name = serializers.CharField(source='part_category.name', read_only=True)
    discount_percentage = serializers.ReadOnlyField()
    total_price = serializers.ReadOnlyField()
    is_valid = serializers.ReadOnlyField()
    
    class Meta:
        model = PartPrice
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
            'condition',
            'price_type',
            'price',
            'original_price',
            'discount_percentage',
            'core_charge',
            'shipping_cost',
            'total_price',
            'in_stock',
            'quantity_available',
            'valid_from',
            'valid_until',
            'is_valid',
            'warranty_months',
            'notes',
            'is_active',
            'is_featured',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'discount_percentage', 'total_price', 'is_valid']


class PartPriceListSerializer(serializers.ModelSerializer):
    """Simplified serializer for price list view"""
    
    manufacturer_name = serializers.CharField(source='manufacturer.name', read_only=True)
    model_name = serializers.CharField(source='model.name', read_only=True)
    part_category_name = serializers.CharField(source='part_category.name', read_only=True)
    discount_percentage = serializers.ReadOnlyField()
    total_price = serializers.ReadOnlyField()
    
    class Meta:
        model = PartPrice
        fields = [
            'id',
            'year',
            'manufacturer_name',
            'model_name',
            'part_category_name',
            'part_name',
            'condition',
            'price',
            'original_price',
            'discount_percentage',
            'total_price',
            'in_stock',
            'quantity_available',
            'is_active',
            'created_at',
        ]




        
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
    prices = PartPriceSerializer(many=True, read_only=True)  # ADD THIS LINE
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
            "prices",  
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
    prices = PartPriceSerializer(many=True, read_only=True)
    prices = PartPriceListSerializer(many=True, read_only=True) 
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
            'prices',
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
    prices = PartPriceListSerializer(many=True, read_only=True) 
    
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
            'prices',
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

# ========================================================================
# user registr
# ========================================================================
# authentication/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['phone_number']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(required=False)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'profile']
        read_only_fields = ['id']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    phone_number = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = ['email', 'password', 'first_name', 'last_name', 'phone_number']
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()
    
    def create(self, validated_data):
        phone_number = validated_data.pop('phone_number', None)
        
        # Create user with email as username
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        # Update profile with phone number if provided
        if phone_number:
            user.profile.phone_number = phone_number
            user.profile.save()
        
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        email = data.get('email', '').lower()
        password = data.get('password', '')
        
        if not email or not password:
            raise serializers.ValidationError("Email and password are required.")
        
        # Try to get user by email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password.")
        
        # Authenticate using username (which is email)
        user = authenticate(username=user.username, password=password)
        
        if not user:
            raise serializers.ValidationError("Invalid email or password.")
        
        if not user.is_active:
            raise serializers.ValidationError("User account is disabled.")
        
        data['user'] = user
        return data
    
# =================================================================================
# shipping address 
# ===============================================================================
# serializers.py
from rest_framework import serializers
from .models import ShippingAddress

class ShippingAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingAddress
        fields = [
            'id', 'country', 'first_name', 'last_name', 
            'street_address', 'street_address_2', 'city', 
            'state', 'zip_code', 'email', 'country_code', 
            'phone', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_phone(self, value):
        """Validate phone number format"""
        if not value.startswith('+'):
            raise serializers.ValidationError("Phone number must be in E.164 format (e.g., +12125551234)")
        return value

    def validate_email(self, value):
        """Validate email format"""
        if '@' not in value:
            raise serializers.ValidationError("Enter a valid email address")
        return value.lower()

# ==========================================================================================
# enquiry form image uploading
# ===========================================================================================
class ProductImageSerializer(serializers.ModelSerializer):
    """Serializer for product images with full details"""
    image_url = serializers.SerializerMethodField()
    manufacturer_name = serializers.CharField(source='manufacturer.name', read_only=True)
    model_name = serializers.CharField(source='model.name', read_only=True)
    category_name = serializers.CharField(source='part_category.name', read_only=True)
    
    class Meta:
        model = ProductImage
        fields = [
            'id', 
            'manufacturer', 
            'manufacturer_name', 
            'model', 
            'model_name',
            'year', 
            'part_category', 
            'category_name', 
            'image', 
            'image_url',
            'specification_number',
            'uploaded_at'
        ]
    
    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class ProductImageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating product images"""
    
    class Meta:
        model = ProductImage
        fields = [
            'manufacturer', 
            'model', 
            'year', 
            'part_category',
            'image', 
            'specification_number'
        ]
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['uploaded_by'] = request.user
        return super().create(validated_data)


class ProductImageListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing images"""
    image_url = serializers.SerializerMethodField()
    manufacturer_name = serializers.CharField(source='manufacturer.name', read_only=True)
    model_name = serializers.CharField(source='model.name', read_only=True)
    category_name = serializers.CharField(source='part_category.name', read_only=True)
    
    class Meta:
        model = ProductImage
        fields = [
            'id', 
            'manufacturer_name', 
            'model_name', 
            'year', 
            'category_name',
            'image_url', 
            'specification_number'
        ]
    
    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None