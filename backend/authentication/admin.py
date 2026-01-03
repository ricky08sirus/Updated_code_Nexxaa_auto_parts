# # authentication/admin.py
# from django.contrib import admin
# from django.utils.html import format_html
# from .models import ContactSubmission


# @admin.register(ContactSubmission)
# class ContactSubmissionAdmin(admin.ModelAdmin):
#     """
#     Admin interface for Contact Form Submissions
#     """

#     list_display = [
#         "id_short",
#         "name_or_anonymous",
#         "email",
#         "subject_short",
#         "status_badge",
#         "created_at",
#         "is_new",
#     ]

#     list_filter = [
#         "status",
#         "created_at",
#         "resolved_at",
#     ]

#     search_fields = [
#         "email",
#         "name",
#         "subject",
#         "message",
#         "id",
#     ]

#     readonly_fields = [
#         "id",
#         "created_at",
#         "updated_at",
#         "resolved_at",
#         "ip_address",
#         "user_agent",
#     ]

#     fieldsets = (
#         (
#             "Contact Information",
#             {
#                 "fields": (
#                     "id",
#                     "email",
#                     "name",
#                     "phone",
#                 )
#             },
#         ),
#         (
#             "Inquiry Details",
#             {
#                 "fields": (
#                     "subject",
#                     "message",
#                     "status",
#                 )
#             },
#         ),
#         (
#             "Admin Section",
#             {"fields": ("admin_notes",)},
#         ),
#         (
#             "Metadata",
#             {
#                 "fields": (
#                     "ip_address",
#                     "user_agent",
#                     "created_at",
#                     "updated_at",
#                     "resolved_at",
#                 ),
#                 "classes": ("collapse",),
#             },
#         ),
#     )

#     ordering = ["-created_at"]
#     date_hierarchy = "created_at"

#     actions = [
#         "mark_as_in_progress",
#         "mark_as_resolved",
#         "mark_as_new",
#     ]

#     # Custom display methods
#     def id_short(self, obj):
#         """Display shortened UUID"""
#         return str(obj.id)[:8]

#     id_short.short_description = "ID"

#     def name_or_anonymous(self, obj):
#         """Display name or 'Anonymous' if not provided"""
#         return obj.name if obj.name else "Anonymous"

#     name_or_anonymous.short_description = "Name"

#     def subject_short(self, obj):
#         """Display shortened subject"""
#         if obj.subject:
#             return obj.subject[:50] + "..." if len(obj.subject) > 50 else obj.subject
#         return "(No subject)"

#     subject_short.short_description = "Subject"

#     def status_badge(self, obj):
#         """Display status with color coding"""
#         colors = {
#             "new": "#e74c3c",  # Red
#             "in_progress": "#f39c12",  # Orange
#             "resolved": "#27ae60",  # Green
#             "closed": "#95a5a6",  # Gray
#         }
#         color = colors.get(obj.status, "#95a5a6")
#         return format_html(
#             '<span style="background-color: {}; color: white; padding: 3px 10px; '
#             'border-radius: 3px; font-weight: bold;">{}</span>',
#             color,
#             obj.get_status_display(),
#         )

#     status_badge.short_description = "Status"

#     # Admin actions
#     def mark_as_in_progress(self, request, queryset):
#         """Mark selected submissions as in progress"""
#         updated = queryset.update(status="in_progress")
#         self.message_user(request, f"{updated} submission(s) marked as in progress.")

#     mark_as_in_progress.short_description = "Mark as In Progress"

#     def mark_as_resolved(self, request, queryset):
#         """Mark selected submissions as resolved"""
#         count = 0
#         for submission in queryset:
#             submission.mark_as_resolved()
#             count += 1
#         self.message_user(request, f"{count} submission(s) marked as resolved.")

#     mark_as_resolved.short_description = "Mark as Resolved"

#     def mark_as_new(self, request, queryset):
#         """Mark selected submissions as new"""
#         updated = queryset.update(status="new", resolved_at=None)
#         self.message_user(request, f"{updated} submission(s) marked as new.")

#     mark_as_new.short_description = "Mark as New"



# authentication/admin.py
from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from django.db.models import Count
from .models import (
    Manufacturer,
    VehicleModel,
    PartCategory,
    PartsInquiry,
    ContactSubmission,
    PartInventory,
    PartImage,
    PartImageGallery,
    PartImageUpload,
    PartImageTag
)


# ============================================================================
# VEHICLE & PARTS REFERENCE MODELS ADMIN
# ============================================================================

@admin.register(Manufacturer)
class ManufacturerAdmin(admin.ModelAdmin):
    list_display = ["name", "code", "is_active", "created_at"]
    list_filter = ["is_active"]
    search_fields = ["name", "code"]
    ordering = ["name"]


@admin.register(VehicleModel)
class VehicleModelAdmin(admin.ModelAdmin):
    list_display = ["name", "manufacturer", "code", "is_active", "created_at"]
    list_filter = ["manufacturer", "is_active"]
    search_fields = ["name", "code", "manufacturer__name"]
    ordering = ["manufacturer__name", "name"]
    autocomplete_fields = ["manufacturer"]


@admin.register(PartCategory)
class PartCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "is_active", "created_at"]
    list_filter = ["is_active"]
    search_fields = ["name", "description"]
    ordering = ["name"]


# ============================================================================
# CUSTOMER INQUIRY MODELS ADMIN
# ============================================================================

@admin.register(PartsInquiry)
class PartsInquiryAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "email",
        "year",
        "manufacturer",
        "model",
        "part_category",
        "status",
        "created_at"
    ]
    list_filter = ["status", "manufacturer", "year", "created_at"]
    search_fields = ["name", "email", "phone", "zipcode"]
    readonly_fields = ["id", "created_at", "updated_at", "ip_address", "user_agent"]
    ordering = ["-created_at"]
    
    fieldsets = (
        ("Customer Information", {
            "fields": ("name", "email", "phone", "zipcode")
        }),
        ("Vehicle & Part Information", {
            "fields": ("year", "manufacturer", "model", "part_category")
        }),
        ("Inquiry Details", {
            "fields": ("additional_notes", "status", "admin_notes")
        }),
        ("Metadata", {
            "fields": ("id", "created_at", "updated_at", "ip_address", "user_agent"),
            "classes": ("collapse",)
        }),
    )
    
    actions = ["mark_as_in_progress", "mark_as_completed"]
    
    def mark_as_in_progress(self, request, queryset):
        updated = queryset.update(status="in_progress")
        self.message_user(request, f"{updated} inquiries marked as in progress.")
    mark_as_in_progress.short_description = "Mark selected inquiries as in progress"
    
    def mark_as_completed(self, request, queryset):
        updated = queryset.update(status="completed", completed_at=timezone.now())
        self.message_user(request, f"{updated} inquiries marked as completed.")
    mark_as_completed.short_description = "Mark selected inquiries as completed"


@admin.register(ContactSubmission)
class ContactSubmissionAdmin(admin.ModelAdmin):
    list_display = ["name", "email", "subject", "status", "created_at"]
    list_filter = ["status", "created_at"]
    search_fields = ["name", "email", "subject", "message"]
    readonly_fields = [
        "id",
        "created_at",
        "updated_at",
        "resolved_at",
        "ip_address",
        "user_agent"
    ]
    ordering = ["-created_at"]
    
    fieldsets = (
        ("Contact Information", {
            "fields": ("name", "email", "phone")
        }),
        ("Message", {
            "fields": ("subject", "message")
        }),
        ("Status & Notes", {
            "fields": ("status", "admin_notes", "resolved_at")
        }),
        ("Metadata", {
            "fields": ("id", "created_at", "updated_at", "ip_address", "user_agent"),
            "classes": ("collapse",)
        }),
    )
    
    actions = ["mark_as_in_progress", "mark_as_resolved"]
    
    def mark_as_in_progress(self, request, queryset):
        for submission in queryset:
            submission.mark_as_in_progress()
        self.message_user(
            request,
            f"{queryset.count()} submissions marked as in progress."
        )
    mark_as_in_progress.short_description = "Mark selected as in progress"
    
    def mark_as_resolved(self, request, queryset):
        for submission in queryset:
            submission.mark_as_resolved()
        self.message_user(
            request,
            f"{queryset.count()} submissions marked as resolved."
        )
    mark_as_resolved.short_description = "Mark selected as resolved"


# ============================================================================
# INVENTORY MANAGEMENT ADMIN (For Selling Parts)
# ============================================================================

class PartImageInline(admin.TabularInline):
    """Inline for managing part inventory images"""
    model = PartImage
    extra = 2
    fields = ['image', 'image_preview', 'caption', 'order']
    readonly_fields = ['image_preview']
    
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" width="80" height="80" style="object-fit: cover; border-radius: 4px;" />',
                obj.image.url
            )
        return "No image"
    image_preview.short_description = 'Preview'


@admin.register(PartInventory)
class PartInventoryAdmin(admin.ModelAdmin):
    list_display = [
        'thumbnail_preview',
        'vehicle_display',
        'part_name',
        'part_number',
        'price',
        'stock_display',
        'status',
        'condition',
        'is_published',
        'created_at'
    ]
    
    list_filter = [
        'status',
        'condition',
        'is_published',
        'is_featured',
        'manufacturer',
        'part_category',
        'year',
        'created_at'
    ]
    
    search_fields = [
        'part_name',
        'part_number',
        'description',
        'manufacturer__name',
        'model__name',
        'slug'
    ]
    
    readonly_fields = [
        'slug',
        'created_at',
        'updated_at',
        'created_by',
        'primary_image_preview',
        'is_low_stock',
        'is_in_stock',
        'discount_percentage'
    ]
    
    fieldsets = (
        ('Vehicle Information', {
            'fields': ('year', 'manufacturer', 'model')
        }),
        ('Part Information', {
            'fields': (
                'part_category',
                'part_name',
                'part_number',
                'description',
                'condition'
            )
        }),
        ('Primary Image', {
            'fields': ('primary_image', 'primary_image_preview'),
            'description': 'Upload main product image. Add more images below.'
        }),
        ('Pricing & Inventory', {
            'fields': (
                'price',
                'compare_at_price',
                'stock_quantity',
                'low_stock_threshold',
                'status'
            )
        }),
        ('Additional Details', {
            'fields': ('weight', 'dimensions', 'warranty_months'),
            'classes': ('collapse',)
        }),
        ('SEO & Display', {
            'fields': (
                'is_published',
                'is_featured',
                'gallery_reference',
                'slug'
            )
        }),
        ('System Information', {
            'fields': (
                'created_by',
                'created_at',
                'updated_at',
                'is_low_stock',
                'is_in_stock',
                'discount_percentage'
            ),
            'classes': ('collapse',)
        })
    )
    
    inlines = [PartImageInline]
    list_per_page = 25
    list_editable = ['is_published', 'status']
    date_hierarchy = 'created_at'
    
    actions = ['mark_as_available', 'mark_as_out_of_stock', 'publish_items']
    
    def save_model(self, request, obj, form, change):
        if not obj.created_by:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
    
    def thumbnail_preview(self, obj):
        if obj.primary_image:
            return format_html(
                '<img src="{}" width="60" height="60" style="object-fit: cover; border-radius: 4px;" />',
                obj.primary_image.url
            )
        return format_html(
            '<div style="width: 60px; height: 60px; background: #ddd; '
            'border-radius: 4px; display: flex; align-items: center; '
            'justify-content: center;">📦</div>'
        )
    thumbnail_preview.short_description = 'Image'
    
    def primary_image_preview(self, obj):
        if obj.primary_image:
            return format_html(
                '<img src="{}" style="max-width: 400px; border-radius: 8px;" />',
                obj.primary_image.url
            )
        return "No image uploaded"
    primary_image_preview.short_description = 'Preview'
    
    def vehicle_display(self, obj):
        return format_html(
            '<strong>{}</strong><br><small>{} {}</small>',
            obj.year,
            obj.manufacturer.name,
            obj.model.name
        )
    vehicle_display.short_description = 'Vehicle'
    
    def stock_display(self, obj):
        if obj.stock_quantity == 0:
            color = '#dc3545'
            text = 'Out of Stock'
        elif obj.is_low_stock:
            color = '#ffc107'
            text = f'{obj.stock_quantity} (Low)'
        else:
            color = '#28a745'
            text = f'{obj.stock_quantity}'
        
        return format_html(
            '<span style="background: {}; color: white; padding: 3px 8px; '
            'border-radius: 3px; font-size: 11px;">{}</span>',
            color, text
        )
    stock_display.short_description = 'Stock'
    
    # Admin Actions
    def mark_as_available(self, request, queryset):
        queryset.update(status='available')
    mark_as_available.short_description = "✅ Mark as Available"
    
    def mark_as_out_of_stock(self, request, queryset):
        queryset.update(status='out_of_stock')
    mark_as_out_of_stock.short_description = "❌ Mark as Out of Stock"
    
    def publish_items(self, request, queryset):
        queryset.update(is_published=True)
    publish_items.short_description = "🌐 Publish Selected Items"


@admin.register(PartImage)
class PartImageAdmin(admin.ModelAdmin):
    list_display = ['image_preview', 'part', 'caption', 'order', 'created_at']
    list_filter = ['created_at']
    search_fields = ['caption', 'part__part_name']
    readonly_fields = ['image_preview_large']
    
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" width="80" height="80" style="object-fit: cover; border-radius: 4px;" />',
                obj.image.url
            )
        return "No image"
    image_preview.short_description = 'Preview'
    
    def image_preview_large(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-width: 500px; border-radius: 8px;" />',
                obj.image.url
            )
        return "No image"
    image_preview_large.short_description = 'Full Preview'


# ============================================================================
# PART IMAGE GALLERY ADMIN (For Reference/Catalog with R2)
# ============================================================================

class PartImageUploadInline(admin.TabularInline):
    """
    Inline for uploading multiple images at once to R2
    """
    model = PartImageUpload
    extra = 3  # Show 3 empty upload fields
    fields = ['image', 'image_preview', 'caption', 'is_primary', 'display_order']
    readonly_fields = ['image_preview']
    
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" width="100" height="100" style="object-fit: cover; border-radius: 4px;" />',
                obj.image.url
            )
        return "No image"
    image_preview.short_description = 'Preview'


@admin.register(PartImageGallery)
class PartImageGalleryAdmin(admin.ModelAdmin):
    """
    Main admin interface for uploading part images to R2
    Team members use this to upload images organized by Year/Make/Model/Part
    """
    
    list_display = [
        'thumbnail_preview',
        'vehicle_info',
        'part_name',
        'part_category',
        'image_count_display',
        'is_published',
        'is_featured',
        'uploaded_by',
        'created_at'
    ]
    
    list_filter = [
        'is_published',
        'is_featured',
        'year',
        'manufacturer',
        'part_category',
        'created_at',
        'uploaded_by'
    ]
    
    search_fields = [
        'part_name',
        'part_number',
        'description',
        'manufacturer__name',
        'model__name',
        'part_category__name'
    ]
    
    readonly_fields = [
        'id',
        'slug',
        'r2_folder_path',
        'uploaded_by',
        'created_at',
        'updated_at',
        'thumbnail_display'
    ]
    
    fieldsets = (
        ('📋 Vehicle Information', {
            'fields': ('year', 'manufacturer', 'model'),
            'description': 'Select the vehicle year, make, and model'
        }),
        ('🔧 Part Information', {
            'fields': ('part_category', 'part_name', 'part_number', 'description'),
            'description': 'Specify the part details'
        }),
        ('📸 Images', {
            'fields': ('thumbnail_display',),
            'description': 'Upload images using the "Part Image Uploads" section below'
        }),
        ('⚙️ Display Settings', {
            'fields': ('is_published', 'is_featured'),
            'description': 'Control visibility in API and frontend'
        }),
        ('ℹ️ Metadata', {
            'fields': ('id', 'slug', 'r2_folder_path', 'uploaded_by', 'created_at', 'updated_at'),
            'classes': ('collapse',),
            'description': 'System information'
        })
    )
    
    inlines = [PartImageUploadInline]
    
    list_per_page = 25
    list_editable = ['is_published', 'is_featured']
    date_hierarchy = 'created_at'
    
    actions = ['publish_galleries', 'unpublish_galleries', 'feature_galleries']
    
    def save_model(self, request, obj, form, change):
        """Auto-assign uploaded_by"""
        if not obj.uploaded_by:
            obj.uploaded_by = request.user
        super().save_model(request, obj, form, change)
    
    def save_formset(self, request, form, formset, change):
        """Auto-assign uploaded_by for images"""
        instances = formset.save(commit=False)
        for instance in instances:
            if isinstance(instance, PartImageUpload):
                if not instance.uploaded_by:
                    instance.uploaded_by = request.user
                instance.save()
        formset.save_m2m()
    
    def thumbnail_preview(self, obj):
        """Show thumbnail in list view"""
        primary_image = obj.images.filter(is_primary=True).first()
        if not primary_image:
            primary_image = obj.images.first()
        
        if primary_image and primary_image.image:
            return format_html(
                '<img src="{}" width="60" height="60" style="object-fit: cover; border-radius: 4px;" />',
                primary_image.image.url
            )
        return format_html(
            '<div style="width: 60px; height: 60px; background: #ddd; '
            'border-radius: 4px; display: flex; align-items: center; '
            'justify-content: center;">📷</div>'
        )
    thumbnail_preview.short_description = 'Image'
    
    def thumbnail_display(self, obj):
        """Show all images in detail view"""
        images = obj.images.all()
        if not images:
            return "No images uploaded yet"
        
        html = '<div style="display: flex; flex-wrap: wrap; gap: 10px;">'
        for img in images:
            if img.image:
                primary_badge = (
                    '<span style="background: #28a745; color: white; padding: 2px 6px; '
                    'border-radius: 3px; font-size: 10px;">PRIMARY</span>'
                    if img.is_primary else ''
                )
                html += f'''
                <div style="position: relative;">
                    <img src="{img.image.url}" width="150" height="150" 
                         style="object-fit: cover; border-radius: 8px; border: 2px solid #ddd;" />
                    {primary_badge}
                </div>
                '''
        html += '</div>'
        return format_html(html)
    thumbnail_display.short_description = 'All Images'
    
    def vehicle_info(self, obj):
        """Display vehicle information"""
        return format_html(
            '<strong>{}</strong><br><small>{} {}</small>',
            obj.year,
            obj.manufacturer.name,
            obj.model.name
        )
    vehicle_info.short_description = 'Vehicle'
    
    def image_count_display(self, obj):
        """Show image count"""
        count = obj.images.count()
        color = '#28a745' if count > 0 else '#dc3545'
        return format_html(
            '<span style="background: {}; color: white; padding: 3px 8px; '
            'border-radius: 3px; font-size: 11px;">{} images</span>',
            color, count
        )
    image_count_display.short_description = 'Images'
    
    def r2_folder_path(self, obj):
        """Show R2 storage path"""
        return obj.r2_folder_path
    r2_folder_path.short_description = 'R2 Storage Path'
    
    # Admin Actions
    def publish_galleries(self, request, queryset):
        queryset.update(is_published=True)
        self.message_user(request, f"{queryset.count()} galleries published.")
    publish_galleries.short_description = "✅ Publish selected galleries"
    
    def unpublish_galleries(self, request, queryset):
        queryset.update(is_published=False)
        self.message_user(request, f"{queryset.count()} galleries unpublished.")
    unpublish_galleries.short_description = "❌ Unpublish selected galleries"
    
    def feature_galleries(self, request, queryset):
        queryset.update(is_featured=True)
        self.message_user(request, f"{queryset.count()} galleries featured.")
    feature_galleries.short_description = "⭐ Feature selected galleries"


@admin.register(PartImageUpload)
class PartImageUploadAdmin(admin.ModelAdmin):
    """
    Admin for individual image management in R2
    """
    
    list_display = [
        'image_thumbnail',
        'gallery',
        'caption',
        'is_primary',
        'display_order',
        'file_size_display',
        'uploaded_by',
        'uploaded_at'
    ]
    
    list_filter = [
        'is_primary',
        'uploaded_at',
        'uploaded_by',
        'gallery__manufacturer',
        'gallery__part_category'
    ]
    
    search_fields = [
        'caption',
        'gallery__part_name',
        'gallery__manufacturer__name',
        'gallery__model__name'
    ]
    
    readonly_fields = [
        'id',
        'image_url',
        'r2_key',
        'file_size',
        'width',
        'height',
        'uploaded_by',
        'uploaded_at',
        'full_image_preview'
    ]
    
    fieldsets = (
        ('Image Upload', {
            'fields': ('gallery', 'image', 'full_image_preview')
        }),
        ('Image Details', {
            'fields': ('caption', 'is_primary', 'display_order')
        }),
        ('Storage Information', {
            'fields': ('image_url', 'r2_key', 'file_size', 'width', 'height'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('id', 'uploaded_by', 'uploaded_at'),
            'classes': ('collapse',)
        })
    )
    
    list_per_page = 50
    list_editable = ['is_primary', 'display_order']
    
    def save_model(self, request, obj, form, change):
        if not obj.uploaded_by:
            obj.uploaded_by = request.user
        super().save_model(request, obj, form, change)
    
    def image_thumbnail(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" width="80" height="80" style="object-fit: cover; border-radius: 4px;" />',
                obj.image.url
            )
        return "No image"
    image_thumbnail.short_description = 'Thumbnail'
    
    def full_image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-width: 500px; border-radius: 8px;" />',
                obj.image.url
            )
        return "No image"
    full_image_preview.short_description = 'Preview'
    
    def file_size_display(self, obj):
        if obj.file_size:
            size_kb = obj.file_size / 1024
            if size_kb > 1024:
                return f"{size_kb/1024:.1f} MB"
            return f"{size_kb:.1f} KB"
        return "N/A"
    file_size_display.short_description = 'Size'


@admin.register(PartImageTag)
class PartImageTagAdmin(admin.ModelAdmin):
    """
    Admin for managing image tags
    """
    list_display = ['name', 'slug', 'gallery_count']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    filter_horizontal = ['galleries']
    
    def gallery_count(self, obj):
        count = obj.galleries.count()
        return f"{count} galleries"
    gallery_count.short_description = 'Used in'
