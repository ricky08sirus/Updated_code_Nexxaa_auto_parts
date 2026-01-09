# authentication/admin.py
from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from django.db.models import Count
from django.urls import path
from django.shortcuts import render, redirect
from django.contrib import messages
from django.shortcuts import render, redirect 
from django.contrib import messages 
from .email_service import InquiryEmailService
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
    PartImageTag,
    PartPrice,
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
        "status",
        "email_status_display",
        "created_at",
        "send_email_button",
    ]
    
    list_filter = [
        "status",
        "email_sent",
        "manufacturer",
        "year",
        "created_at"
    ]
    
    search_fields = ["name", "email"]
    
    readonly_fields = [
        "id",
        "created_at",
        "updated_at",
        "ip_address",
        "email_sent_at",
        "email_sent_by",
        "email_subject",
        "email_history_display",
    ]
    
    ordering = ["-created_at"]

    fieldsets = (
        ("Customer Information", {
            "fields": ("name", "email", "phone")
        }),
        ("Vehicle & Part Information", {
            "fields": ("year", "manufacturer", "model")
        }),
        ("Inquiry Details", {
            "fields": ("parts_needed", "status")
        }),
        ("Email Response History", {
            "fields": (
                "email_history_display",
                "email_sent_at",
                "email_sent_by",
                "email_subject",
            ),
            "classes": ("collapse",),
        }),
        ("Metadata", {
            "fields": (
                "id",
                "created_at",
                "updated_at",
                "ip_address",
            ),
            "classes": ("collapse",),
        }),
    )

    actions = ["mark_as_in_progress", "mark_as_completed", "send_email_to_selected"]


    # ========== METHODS (keep all your existing methods) ==========
    
    def get_urls(self):
        """Add custom URL for send email page"""
        urls = super().get_urls()
        custom_urls = [
            path(
                '<path:object_id>/send-email/',
                self.admin_site.admin_view(self.send_email_view),
                name='authentication_partsinquiry_send_email',
            ),
        ]
        return custom_urls + urls
    
    def send_email_button(self, obj):
        """Show 'Send Email' button in list view"""
        if obj.email_sent:
            return format_html(
                '<span style="color: #28a745;">✅ Sent</span>'
            )
        return format_html(
            '<a class="button" href="{}">📧 Send Email</a>',
            f'/admin/authentication/partsinquiry/{obj.id}/send-email/'
        )
    
    send_email_button.short_description = "Email Action"
    
    def email_status_display(self, obj):
        """Display email sent status with badge"""
        if obj.email_sent:
            return format_html(
                '<span style="background: #28a745; color: white; padding: 3px 8px; '
                'border-radius: 3px; font-size: 11px;">✅ Email Sent</span><br>'
                '<small>{}</small>',
                obj.email_sent_at.strftime('%Y-%m-%d %H:%M') if obj.email_sent_at else ''
            )
        return format_html(
            '<span style="background: #ffc107; color: #333; padding: 3px 8px; '
            'border-radius: 3px; font-size: 11px;">⏳ Pending</span>'
        )
    
    email_status_display.short_description = "Email Status"
    
    def email_history_display(self, obj):
        """Display email history in detail view"""
        if not obj.email_sent:
            return format_html(
                '<p style="color: #999;">No email sent yet</p>'
            )
        
        html = f'''
        <div style="background: #f8f9fa; padding: 15px; border-radius: 6px;">
            <p><strong>Email Sent:</strong> ✅ Yes</p>
            <p><strong>Sent At:</strong> {obj.email_sent_at.strftime('%B %d, %Y at %H:%M') if obj.email_sent_at else 'N/A'}</p>
            <p><strong>Sent By:</strong> {obj.email_sent_by.username if obj.email_sent_by else 'N/A'}</p>
            <p><strong>Subject:</strong> {obj.email_subject or 'N/A'}</p>
        '''
        
        if obj.email_message:
            html += f'<p><strong>Custom Message:</strong></p><div style="background: white; padding: 10px; border-radius: 4px;">{obj.email_message}</div>'
        
        if obj.parts_info_sent:
            html += '<p><strong>Parts Included:</strong></p><ul>'
            for part in obj.parts_info_sent:
                html += f'<li>{part.get("name", "Unknown Part")} - ${part.get("price", "N/A")}</li>'
            html += '</ul>'
        
        if obj.email_error:
            html += f'<p style="color: #dc3545;"><strong>Error:</strong> {obj.email_error}</p>'
        
        html += '</div>'
        return format_html(html)
    
    email_history_display.short_description = "Email History"
    
    def send_email_view(self, request, object_id):
        """Custom view for sending email to inquiry"""
        inquiry = self.get_object(request, object_id)
        
        if inquiry is None:
            self.message_user(request, "Inquiry not found", level=messages.ERROR)
            return redirect('admin:authentication_partsinquiry_changelist')
        
        if request.method == 'POST':
            custom_message = request.POST.get('custom_message', '')
            parts_info = []
            part_count = int(request.POST.get('part_count', 0))
            
            print(f"DEBUG: Processing {part_count} parts")  # Debug log
            
            for i in range(part_count):
                part_name = request.POST.get(f'part_name_{i}')
                if part_name:
                    # Collect images from both file uploads and URLs
                    images = []
                    
                    for img_num in range(1, 4):  # Loop through 3 image slots
                        # Check for uploaded file first
                        file_key = f'image_file_{img_num}_{i}'
                        if file_key in request.FILES:
                            uploaded_file = request.FILES[file_key]
                            print(f"DEBUG: Found uploaded file: {uploaded_file.name}")  # Debug
                            # Store the file object for processing
                            images.append({
                                'type': 'file',
                                'file': uploaded_file,
                                'name': uploaded_file.name
                            })
                        else:
                            # Check for URL
                            url_key = f'image_url_{img_num}_{i}'
                            image_url = request.POST.get(url_key)
                            if image_url and image_url.strip():
                                print(f"DEBUG: Found image URL: {image_url[:50]}...")  # Debug
                                images.append({
                                    'type': 'url',
                                    'url': image_url.strip()
                                })
                    
                    part_info = {
                        'name': part_name,
                        'part_number': request.POST.get(f'part_number_{i}', 'N/A'),
                        'condition': request.POST.get(f'condition_{i}', 'Used'),
                        'price': request.POST.get(f'price_{i}'),
                        'availability': request.POST.get(f'availability_{i}', 'In Stock'),
                        'warranty': request.POST.get(f'warranty_{i}', 'N/A'),
                        'description': request.POST.get(f'description_{i}', ''),
                        'link': request.POST.get(f'link_{i}', ''),
                        'link_heading': request.POST.get(f'link_heading_{i}', 'View Details'),
                        'images': images,  # Array of image objects (file or url)
                    }
                    
                    print(f"DEBUG: Part {i} - Name: {part_name}, Images: {len(images)}")  # Debug
                    parts_info.append(part_info)
            
            if not parts_info:
                messages.error(request, 'Please add at least one part to the email')
                return render(request, 'admin/send_inquiry_email.html', {
                    'inquiry': inquiry,
                    'opts': self.model._meta,
                })
            
            print(f"DEBUG: Sending email with {len(parts_info)} parts")  # Debug
            
            # Send email
            result = InquiryEmailService.send_inquiry_response(
                inquiry=inquiry,
                parts_info=parts_info,
                custom_message=custom_message,
                admin_user=request.user
            )
            
            if result['success']:
                messages.success(request, result['message'])
                return redirect('admin:authentication_partsinquiry_change', object_id)
            else:
                messages.error(request, f"Failed to send email: {result['error']}")
        
        context = {
            'inquiry': inquiry,
            'opts': self.model._meta,
            'has_view_permission': self.has_view_permission(request, inquiry),
            'original': inquiry,
            'title': f'Send Email Response - {inquiry.name}',
        }
        
        return render(request, 'admin/send_inquiry_email.html', context)



    def mark_as_in_progress(self, request, queryset):
        updated = queryset.update(status="in_progress")
        self.message_user(request, f"{updated} inquiries marked as in progress.")

    mark_as_in_progress.short_description = "Mark selected inquiries as in progress"

    def mark_as_completed(self, request, queryset):
        updated = queryset.update(status="completed", completed_at=timezone.now())
        self.message_user(request, f"{updated} inquiries marked as completed.")

    mark_as_completed.short_description = "Mark selected inquiries as completed"
    
    def send_email_to_selected(self, request, queryset):
        """Batch action to redirect to email send for multiple inquiries"""
        count = queryset.count()
        if count == 1:
            inquiry = queryset.first()
            return redirect(f'/admin/authentication/partsinquiry/{inquiry.id}/send-email/')
        else:
            self.message_user(
                request, 
                "Please select only one inquiry to send email", 
                level=messages.WARNING
            )
    
    send_email_to_selected.short_description = "📧 Send email response"





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
        "user_agent",
    ]
    ordering = ["-created_at"]

    fieldsets = (
        ("Contact Information", {"fields": ("name", "email", "phone")}),
        ("Message", {"fields": ("subject", "message")}),
        ("Status & Notes", {"fields": ("status", "admin_notes", "resolved_at")}),
        (
            "Metadata",
            {
                "fields": (
                    "id",
                    "created_at",
                    "updated_at",
                    "ip_address",
                    "user_agent",
                ),
                "classes": ("collapse",),
            },
        ),
    )

    actions = ["mark_as_in_progress", "mark_as_resolved"]

    def mark_as_in_progress(self, request, queryset):
        for submission in queryset:
            submission.mark_as_in_progress()
        self.message_user(
            request, f"{queryset.count()} submissions marked as in progress."
        )

    mark_as_in_progress.short_description = "Mark selected as in progress"

    def mark_as_resolved(self, request, queryset):
        for submission in queryset:
            submission.mark_as_resolved()
        self.message_user(
            request, f"{queryset.count()} submissions marked as resolved."
        )

    mark_as_resolved.short_description = "Mark selected as resolved"


# ============================================================================
# INVENTORY MANAGEMENT ADMIN (For Selling Parts)
# ============================================================================


class PartImageInline(admin.TabularInline):
    """Inline for managing part inventory images"""

    model = PartImage
    extra = 2
    fields = ["image", "image_preview", "caption", "order"]
    readonly_fields = ["image_preview"]

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" width="80" height="80" style="object-fit: cover; border-radius: 4px;" />',
                obj.image.url,
            )
        return "No image"

    image_preview.short_description = "Preview"


@admin.register(PartInventory)
class PartInventoryAdmin(admin.ModelAdmin):
    list_display = [
        "thumbnail_preview",
        "vehicle_display",
        "part_name",
        "part_number",
        "price",
        "stock_display",
        "status",
        "condition",
        "is_published",
        "created_at",
    ]

    list_filter = [
        "status",
        "condition",
        "is_published",
        "is_featured",
        "manufacturer",
        "part_category",
        "year",
        "created_at",
    ]

    search_fields = [
        "part_name",
        "part_number",
        "description",
        "manufacturer__name",
        "model__name",
        "slug",
    ]

    readonly_fields = [
        "slug",
        "created_at",
        "updated_at",
        "created_by",
        "primary_image_preview",
        "is_low_stock",
        "is_in_stock",
        "discount_percentage",
    ]

    fieldsets = (
        ("Vehicle Information", {"fields": ("year", "manufacturer", "model")}),
        (
            "Part Information",
            {
                "fields": (
                    "part_category",
                    "part_name",
                    "part_number",
                    "description",
                    "condition",
                )
            },
        ),
        (
            "Primary Image",
            {
                "fields": ("primary_image", "primary_image_preview"),
                "description": "Upload main product image. Add more images below.",
            },
        ),
        (
            "Pricing & Inventory",
            {
                "fields": (
                    "price",
                    "compare_at_price",
                    "stock_quantity",
                    "low_stock_threshold",
                    "status",
                )
            },
        ),
        (
            "Additional Details",
            {
                "fields": ("weight", "dimensions", "warranty_months"),
                "classes": ("collapse",),
            },
        ),
        (
            "SEO & Display",
            {"fields": ("is_published", "is_featured", "gallery_reference", "slug")},
        ),
        (
            "System Information",
            {
                "fields": (
                    "created_by",
                    "created_at",
                    "updated_at",
                    "is_low_stock",
                    "is_in_stock",
                    "discount_percentage",
                ),
                "classes": ("collapse",),
            },
        ),
    )

    inlines = [PartImageInline]
    list_per_page = 25
    list_editable = ["is_published", "status"]
    date_hierarchy = "created_at"

    actions = ["mark_as_available", "mark_as_out_of_stock", "publish_items"]

    def save_model(self, request, obj, form, change):
        if not obj.created_by:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

    def thumbnail_preview(self, obj):
        if obj.primary_image:
            return format_html(
                '<img src="{}" width="60" height="60" style="object-fit: cover; border-radius: 4px;" />',
                obj.primary_image.url,
            )
        return format_html(
            '<div style="width: 60px; height: 60px; background: #ddd; '
            "border-radius: 4px; display: flex; align-items: center; "
            'justify-content: center;">📦</div>'
        )

    thumbnail_preview.short_description = "Image"

    def primary_image_preview(self, obj):
        if obj.primary_image:
            return format_html(
                '<img src="{}" style="max-width: 400px; border-radius: 8px;" />',
                obj.primary_image.url,
            )
        return "No image uploaded"

    primary_image_preview.short_description = "Preview"

    def vehicle_display(self, obj):
        return format_html(
            "<strong>{}</strong><br><small>{} {}</small>",
            obj.year,
            obj.manufacturer.name,
            obj.model.name,
        )

    vehicle_display.short_description = "Vehicle"

    def stock_display(self, obj):
        if obj.stock_quantity == 0:
            color = "#dc3545"
            text = "Out of Stock"
        elif obj.is_low_stock:
            color = "#ffc107"
            text = f"{obj.stock_quantity} (Low)"
        else:
            color = "#28a745"
            text = f"{obj.stock_quantity}"

        return format_html(
            '<span style="background: {}; color: white; padding: 3px 8px; '
            'border-radius: 3px; font-size: 11px;">{}</span>',
            color,
            text,
        )

    stock_display.short_description = "Stock"

    # Admin Actions
    def mark_as_available(self, request, queryset):
        queryset.update(status="available")

    mark_as_available.short_description = "✅ Mark as Available"

    def mark_as_out_of_stock(self, request, queryset):
        queryset.update(status="out_of_stock")

    mark_as_out_of_stock.short_description = "❌ Mark as Out of Stock"

    def publish_items(self, request, queryset):
        queryset.update(is_published=True)

    publish_items.short_description = "🌐 Publish Selected Items"


@admin.register(PartImage)
class PartImageAdmin(admin.ModelAdmin):
    list_display = ["image_preview", "part", "caption", "order", "created_at"]
    list_filter = ["created_at"]
    search_fields = ["caption", "part__part_name"]
    readonly_fields = ["image_preview_large"]

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" width="80" height="80" style="object-fit: cover; border-radius: 4px;" />',
                obj.image.url,
            )
        return "No image"

    image_preview.short_description = "Preview"

    def image_preview_large(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-width: 500px; border-radius: 8px;" />',
                obj.image.url,
            )
        return "No image"

    image_preview_large.short_description = "Full Preview"


# ============================================================================
# PART IMAGE GALLERY ADMIN (For Reference/Catalog with R2)
# ============================================================================


class PartImageUploadInline(admin.TabularInline):
    """
    Inline for uploading multiple images at once to R2
    """

    model = PartImageUpload
    extra = 3  # Show 3 empty upload fields
    fields = ["image", "image_preview", "caption", "is_primary", "display_order"]
    readonly_fields = ["image_preview"]

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" width="100" height="100" style="object-fit: cover; border-radius: 4px;" />',
                obj.image.url,
            )
        return "No image"

    image_preview.short_description = "Preview"


class PartPriceInline(admin.TabularInline):
    """
    Inline for adding part prices directly in Part Image Gallery
    """

    model = PartPrice
    extra = 1  # Show 1 empty form
    fk_name = "gallery_reference"

    # Only show these fields in the inline form
    fields = [
        "condition",
        "price_type",
        "price",
        "original_price",
        "quantity_available",
        "in_stock",
        "warranty_months",
        "is_active",
    ]

    # IMPORTANT: Exclude the fields that are auto-populated from gallery
    # This prevents Django from trying to access them as direct fields
    exclude = [
        "year",
        "manufacturer",
        "model",
        "part_category",
        "part_name",
        "part_number",
    ]

    readonly_fields = []

    def save_formset(self, request, form, formset, change):
        """
        FIXED: Auto-populate vehicle/part info from gallery and assign created_by
        """
        # IMPORTANT: Save the parent gallery FIRST to get its ID
        if not form.instance.pk:
            form.instance.save()
        
        gallery = form.instance
        
        instances = formset.save(commit=False)
        
        for instance in instances:
            if isinstance(instance, PartPrice):
                # Auto-populate from gallery
                instance.gallery_reference = gallery
                instance.year = gallery.year
                instance.manufacturer = gallery.manufacturer
                instance.model = gallery.model
                instance.part_category = gallery.part_category
                instance.part_name = gallery.part_name
                
                # Set created_by if new
                if not instance.created_by:
                    instance.created_by = request.user
                
                try:
                    instance.save()
                except Exception as e:
                    # Log the error for debugging
                    print(f"Error saving PartPrice: {e}")
                    from django.contrib import messages
                    messages.error(request, f"Error saving price: {str(e)}")
        
        # Delete instances marked for deletion
        for instance in formset.deleted_objects:
            instance.delete()
        
        formset.save_m2m()


@admin.register(PartImageGallery)
class PartImageGalleryAdmin(admin.ModelAdmin):
    """
    Main admin interface for uploading part images to R2
    Team members use this to upload images organized by Year/Make/Model/Part
    """

    list_display = [
        "thumbnail_preview",
        "vehicle_info",
        "part_name",
        "part_category",
        "image_count_display",
        "is_published",
        "is_featured",
        "uploaded_by",
        "created_at",
    ]

    list_filter = [
        "is_published",
        "is_featured",
        "year",
        "manufacturer",
        "part_category",
        "created_at",
        "uploaded_by",
    ]

    search_fields = [
        "part_name",
        "part_number",
        "description",
        "manufacturer__name",
        "model__name",
        "part_category__name",
    ]

    readonly_fields = [
        "id",
        "slug",
        "r2_folder_path",
        "uploaded_by",
        "created_at",
        "updated_at",
        "thumbnail_display",
    ]

    fieldsets = (
        (
            "📋 Vehicle Information",
            {
                "fields": ("year", "manufacturer", "model"),
                "description": "Select the vehicle year, make, and model",
            },
        ),
        (
            "🔧 Part Information",
            {
                "fields": ("part_category", "part_name", "part_number", "description"),
                "description": "Specify the part details",
            },
        ),
        (
            "📸 Images",
            {
                "fields": ("thumbnail_display",),
                "description": 'Upload images using the "Part Image Uploads" section below',
            },
        ),
        (
            "⚙️ Display Settings",
            {
                "fields": ("is_published", "is_featured"),
                "description": "Control visibility in API and frontend",
            },
        ),
        (
            "ℹ️ Metadata",
            {
                "fields": (
                    "id",
                    "slug",
                    "r2_folder_path",
                    "uploaded_by",
                    "created_at",
                    "updated_at",
                ),
                "classes": ("collapse",),
                "description": "System information",
            },
        ),
    )

    inlines = [PartImageUploadInline, PartPriceInline]

    list_per_page = 25
    list_editable = ["is_published", "is_featured"]
    date_hierarchy = "created_at"

    actions = ["publish_galleries", "unpublish_galleries", "feature_galleries"]

    def save_model(self, request, obj, form, change):
        """Auto-assign uploaded_by"""
        if not obj.uploaded_by:
            obj.uploaded_by = request.user
        super().save_model(request, obj, form, change)

    def save_formset(self, request, form, formset, change):
        """
        Handle saving both PartImageUpload AND PartPrice inlines
        """
        instances = formset.save(commit=False)
        
        # Ensure parent gallery is saved first
        if not form.instance.pk:
            form.instance.save()
        
        gallery = form.instance
        
        for instance in instances:
            # Handle PartImageUpload
            if isinstance(instance, PartImageUpload):
                if not instance.uploaded_by:
                    instance.uploaded_by = request.user
                instance.save()
            
            # Handle PartPrice
            elif isinstance(instance, PartPrice):
                # Auto-populate from gallery
                instance.gallery_reference = gallery
                instance.year = gallery.year
                instance.manufacturer = gallery.manufacturer
                instance.model = gallery.model
                instance.part_category = gallery.part_category
                instance.part_name = gallery.part_name
                
                # Set created_by if new
                if not instance.created_by:
                    instance.created_by = request.user
                
                try:
                    instance.save()
                except Exception as e:
                    print(f"Error saving PartPrice: {e}")
                    from django.contrib import messages
                    messages.error(request, f"Error saving price: {str(e)}")
        
        # Delete marked instances
        for instance in formset.deleted_objects:
            instance.delete()
        
        formset.save_m2m()

    
    def save_related(self, request, form, formsets, change):
        """Override to handle errors in related objects"""
        try:
            super().save_related(request, form, formsets, change)
        except Exception as e:
            from django.contrib import messages
            messages.error(request, f"Error saving related data: {str(e)}")
            print(f"Error in save_related: {e}")
            import traceback
            traceback.print_exc()





    def thumbnail_preview(self, obj):
        """Show thumbnail in list view"""
        primary_image = obj.images.filter(is_primary=True).first()
        if not primary_image:
            primary_image = obj.images.first()

        if primary_image and primary_image.image:
            return format_html(
                '<img src="{}" width="60" height="60" style="object-fit: cover; border-radius: 4px;" />',
                primary_image.image.url,
            )
        return format_html(
            '<div style="width: 60px; height: 60px; background: #ddd; '
            "border-radius: 4px; display: flex; align-items: center; "
            'justify-content: center;">📷</div>'
        )

    thumbnail_preview.short_description = "Image"

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
                    if img.is_primary
                    else ""
                )
                html += f'''
                <div style="position: relative;">
                    <img src="{img.image.url}" width="150" height="150"
                         style="object-fit: cover; border-radius: 8px; border: 2px solid #ddd;" />
                    {primary_badge}
                </div>
                '''
        html += "</div>"
        return format_html(html)

    thumbnail_display.short_description = "All Images"

    def vehicle_info(self, obj):
        """Display vehicle information"""
        return format_html(
            "<strong>{}</strong><br><small>{} {}</small>",
            obj.year,
            obj.manufacturer.name,
            obj.model.name,
        )

    vehicle_info.short_description = "Vehicle"

    def image_count_display(self, obj):
        """Show image count"""
        count = obj.images.count()
        color = "#28a745" if count > 0 else "#dc3545"
        return format_html(
            '<span style="background: {}; color: white; padding: 3px 8px; '
            'border-radius: 3px; font-size: 11px;">{} images</span>',
            color,
            count,
        )

    image_count_display.short_description = "Images"

    def r2_folder_path(self, obj):
        """Show R2 storage path"""
        return obj.r2_folder_path

    r2_folder_path.short_description = "R2 Storage Path"

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
        "image_thumbnail",
        "gallery",
        "caption",
        "is_primary",
        "display_order",
        "file_size_display",
        "uploaded_by",
        "uploaded_at",
    ]

    list_filter = [
        "is_primary",
        "uploaded_at",
        "uploaded_by",
        "gallery__manufacturer",
        "gallery__part_category",
    ]

    search_fields = [
        "caption",
        "gallery__part_name",
        "gallery__manufacturer__name",
        "gallery__model__name",
    ]

    readonly_fields = [
        "id",
        "image_url",
        "r2_key",
        "file_size",
        "width",
        "height",
        "uploaded_by",
        "uploaded_at",
        "full_image_preview",
    ]

    fieldsets = (
        ("Image Upload", {"fields": ("gallery", "image", "full_image_preview")}),
        ("Image Details", {"fields": ("caption", "is_primary", "display_order")}),
        (
            "Storage Information",
            {
                "fields": ("image_url", "r2_key", "file_size", "width", "height"),
                "classes": ("collapse",),
            },
        ),
        (
            "Metadata",
            {"fields": ("id", "uploaded_by", "uploaded_at"), "classes": ("collapse",)},
        ),
    )

    list_per_page = 50
    list_editable = ["is_primary", "display_order"]

    def save_model(self, request, obj, form, change):
        if not obj.uploaded_by:
            obj.uploaded_by = request.user
        super().save_model(request, obj, form, change)

    def image_thumbnail(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" width="80" height="80" style="object-fit: cover; border-radius: 4px;" />',
                obj.image.url,
            )
        return "No image"

    image_thumbnail.short_description = "Thumbnail"

    def full_image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-width: 500px; border-radius: 8px;" />',
                obj.image.url,
            )
        return "No image"

    full_image_preview.short_description = "Preview"

    def file_size_display(self, obj):
        if obj.file_size:
            size_kb = obj.file_size / 1024
            if size_kb > 1024:
                return f"{size_kb / 1024:.1f} MB"
            return f"{size_kb:.1f} KB"
        return "N/A"

    file_size_display.short_description = "Size"


@admin.register(PartImageTag)
class PartImageTagAdmin(admin.ModelAdmin):
    """
    Admin for managing image tags
    """

    list_display = ["name", "slug", "gallery_count"]
    search_fields = ["name", "description"]
    prepopulated_fields = {"slug": ("name",)}
    filter_horizontal = ["galleries"]

    def gallery_count(self, obj):
        count = obj.galleries.count()
        return f"{count} galleries"

    gallery_count.short_description = "Used in"


# ============================================================================
# PRICING ADMIN
# ============================================================================


@admin.register(PartPrice)
class PartPriceAdmin(admin.ModelAdmin):
    """
    Admin interface for managing part prices
    """

    list_display = [
        "vehicle_info",
        "part_name_display",
        "condition",
        "price_display",
        "stock_status",
        "price_type",
        "validity_period",
        "is_active",
        "in_stock",
        "created_at",
    ]

    list_filter = [
        "is_active",
        "in_stock",
        "condition",
        "price_type",
        "manufacturer",
        "part_category",
        "year",
        "created_at",
        "valid_from",
    ]

    search_fields = [
        "part_name",
        "part_number",
        "manufacturer__name",
        "model__name",
        "part_category__name",
        "notes",
    ]

    readonly_fields = [
        "id",
        "created_by",
        "created_at",
        "updated_at",
        "discount_percentage_display",
        "total_price_display",
        "is_valid_display",
    ]

    fieldsets = (
        (
            "📋 Vehicle Information",
            {
                "fields": ("year", "manufacturer", "model"),
                "description": "Select the vehicle year, make, and model",
            },
        ),
        (
            "🔧 Part Information",
            {
                "fields": ("part_category", "part_name", "part_number"),
                "description": "Specify the part details",
            },
        ),
        (
            "💰 Pricing Information",
            {
                "fields": (
                    "condition",
                    "price_type",
                    "price",
                    "original_price",
                    "discount_percentage_display",
                    "core_charge",
                    "shipping_cost",
                    "total_price_display",
                ),
                "description": "Set pricing details",
            },
        ),
        (
            "📦 Availability",
            {
                "fields": ("in_stock", "quantity_available", "warranty_months"),
            },
        ),
        (
            "📅 Validity Period",
            {
                "fields": ("valid_from", "valid_until", "is_valid_display"),
                "description": "Set when this price is valid",
            },
        ),
        (
            "🔗 References",
            {
                "fields": ("inventory_item", "gallery_reference"),
                "classes": ("collapse",),
                "description": "Link to inventory or image gallery (optional)",
            },
        ),
        (
            "⚙️ Settings",
            {
                "fields": ("is_active", "is_featured", "notes"),
            },
        ),
        (
            "ℹ️ Metadata",
            {
                "fields": ("id", "created_by", "created_at", "updated_at"),
                "classes": ("collapse",),
            },
        ),
    )

    list_per_page = 25
    list_editable = ["is_active"]
    date_hierarchy = "created_at"

    actions = [
        "activate_prices",
        "deactivate_prices",
        "mark_in_stock",
        "mark_out_of_stock",
        "feature_prices",
    ]

    def save_model(self, request, obj, form, change):
        """Auto-assign created_by"""
        if not obj.created_by:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

    def vehicle_info(self, obj):
        """Display vehicle information"""
        return format_html(
            "<strong>{}</strong><br><small>{} {}</small>",
            obj.year,
            obj.manufacturer.name,
            obj.model.name,
        )

    vehicle_info.short_description = "Vehicle"

    def part_name_display(self, obj):
        """Display part name with category"""
        return format_html(
            "<strong>{}</strong><br><small>{}</small>",
            obj.part_name,
            obj.part_category.name,
        )

    part_name_display.short_description = "Part"

    def price_display(self, obj):
        """Display price with discount badge"""
        discount = obj.discount_percentage

        if discount > 0:
            return format_html(
                '<div style="line-height: 1.4;">'
                '<strong style="color: #28a745; font-size: 16px;">${}</strong><br>'
                '<small style="text-decoration: line-through; color: #999;">${}</small> '
                '<span style="background: #dc3545; color: white; padding: 2px 6px; '
                'border-radius: 3px; font-size: 10px;">-{}%</span>'
                "</div>",
                f"{float(obj.price):.2f}",
                f"{float(obj.original_price):.2f}",
                discount,
            )
        else:
            return format_html(
                '<strong style="color: #28a745; font-size: 16px;">${}</strong>',
                f"{float(obj.price):.2f}",
            )

    price_display.short_description = "Price"

    def stock_status(self, obj):
        """Display stock status with badge"""
        if obj.quantity_available == 0:
            color = "#dc3545"
            text = "Out of Stock"
        elif obj.quantity_available <= 5:
            color = "#ffc107"
            text = f"{obj.quantity_available} left"
        else:
            color = "#28a745"
            text = f"{obj.quantity_available} in stock"

        return format_html(
            '<span style="background: {}; color: white; padding: 3px 8px; '
            'border-radius: 3px; font-size: 11px;">{}</span>',
            color,
            text,
        )

    stock_status.short_description = "Stock"

    def validity_period(self, obj):
        """Display validity period"""
        if obj.valid_until:
            return format_html(
                "<small>{}<br>to<br>{}</small>",
                obj.valid_from.strftime("%Y-%m-%d"),
                obj.valid_until.strftime("%Y-%m-%d"),
            )
        return format_html(
            "<small>From {}</small>", obj.valid_from.strftime("%Y-%m-%d")
        )

    validity_period.short_description = "Valid Period"

    def discount_percentage_display(self, obj):
        """Show calculated discount"""
        discount = obj.discount_percentage
        if discount > 0:
            return format_html(
                '<span style="color: #dc3545; font-weight: bold;">-{}%</span>', discount
            )
        return "No discount"

    discount_percentage_display.short_description = "Discount"

    def total_price_display(self, obj):
        """Show total price including extras"""
        total = obj.total_price
        breakdown = f"Price: ${float(obj.price):.2f}"
        if obj.core_charge and obj.core_charge > 0:
            breakdown += f" + Core: ${float(obj.core_charge):.2f}"
        if obj.shipping_cost and obj.shipping_cost > 0:
            breakdown += f" + Shipping: ${float(obj.shipping_cost):.2f}"

        return format_html(
            "<strong>${}</strong><br><small>{}</small>",
            f"{float(total):.2f}",
            breakdown
        )

    total_price_display.short_description = "Total Price"

    def is_valid_display(self, obj):
        """Show if price is currently valid"""
        if obj.is_valid:
            return format_html('<span style="color: #28a745;">✅ Valid</span>')
        return format_html('<span style="color: #dc3545;">❌ Expired</span>')

    is_valid_display.short_description = "Current Status"

    # Admin Actions
    def activate_prices(self, request, queryset):
        queryset.update(is_active=True)
        self.message_user(request, f"{queryset.count()} prices activated.")

    activate_prices.short_description = "✅ Activate selected prices"

    def deactivate_prices(self, request, queryset):
        queryset.update(is_active=False)
        self.message_user(request, f"{queryset.count()} prices deactivated.")

    deactivate_prices.short_description = "❌ Deactivate selected prices"

    def mark_in_stock(self, request, queryset):
        queryset.update(in_stock=True)
        self.message_user(request, f"{queryset.count()} marked as in stock.")

    mark_in_stock.short_description = "📦 Mark as In Stock"

    def mark_out_of_stock(self, request, queryset):
        queryset.update(in_stock=False, quantity_available=0)
        self.message_user(request, f"{queryset.count()} marked as out of stock.")

    mark_out_of_stock.short_description = "🚫 Mark as Out of Stock"

    def feature_prices(self, request, queryset):
        queryset.update(is_featured=True)
        self.message_user(request, f"{queryset.count()} prices featured.")

    feature_prices.short_description = "⭐ Feature selected prices"

