# # authentication/serializers.py
# from rest_framework import serializers
# from .models import ContactSubmission


# class ContactSubmissionSerializer(serializers.ModelSerializer):
#     """
#     Serializer for contact form submissions
#     """

#     class Meta:
#         model = ContactSubmission
#         fields = [
#             "id",
#             "name",
#             "email",
#             "subject",
#             "message",
#             "phone",
#             "created_at",
#         ]
#         read_only_fields = ["id", "created_at"]

#     def validate_email(self, value):
#         """Validate email format"""
#         if not value or "@" not in value:
#             raise serializers.ValidationError("Please provide a valid email address")
#         return value.lower().strip()

#     def validate_message(self, value):
#         """Validate message is not empty and within limits"""
#         if not value or len(value.strip()) < 10:
#             raise serializers.ValidationError(
#                 "Message must be at least 10 characters long"
#             )
#         if len(value) > 5000:
#             raise serializers.ValidationError(
#                 "Message is too long (max 5000 characters)"
#             )
#         return value.strip()

#     def validate_name(self, value):
#         """Clean up name"""
#         return value.strip() if value else ""

#     def validate_subject(self, value):
#         """Clean up subject"""
#         return value.strip() if value else ""





# authentication/serializers.py
from rest_framework import serializers
from .models import ContactSubmission, PartsInquiry, Manufacturer, VehicleModel, PartCategory


class ManufacturerSerializer(serializers.ModelSerializer):
    """Serializer for Manufacturer"""
    
    class Meta:
        model = Manufacturer
        fields = ["id", "name", "code"]


class VehicleModelSerializer(serializers.ModelSerializer):
    """Serializer for Vehicle Model"""
    manufacturer_name = serializers.CharField(source="manufacturer.name", read_only=True)
    
    class Meta:
        model = VehicleModel
        fields = ["id", "name", "code", "manufacturer", "manufacturer_name"]


class PartCategorySerializer(serializers.ModelSerializer):
    """Serializer for Part Category"""
    
    class Meta:
        model = PartCategory
        fields = ["id", "name", "description"]


class PartsInquirySerializer(serializers.ModelSerializer):
    """
    Serializer for parts inquiry submissions
    """
    manufacturer_name = serializers.CharField(source="manufacturer.name", read_only=True)
    model_name = serializers.CharField(source="model.name", read_only=True)
    part_category_name = serializers.CharField(source="part_category.name", read_only=True)
    
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
            raise serializers.ValidationError(
                "Please provide a valid phone number"
            )
        return value.strip()
    
    def validate_name(self, value):
        """Validate name"""
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError(
                "Please provide a valid name"
            )
        return value.strip()
    
    def validate_zipcode(self, value):
        """Validate zipcode"""
        if not value or len(value.strip()) < 5:
            raise serializers.ValidationError(
                "Please provide a valid ZIP code"
            )
        return value.strip()
    
    def validate(self, data):
        """Cross-field validation"""
        # Validate that model belongs to the selected manufacturer
        if data.get('model') and data.get('manufacturer'):
            if data['model'].manufacturer != data['manufacturer']:
                raise serializers.ValidationError({
                    "model": "Selected model does not belong to the selected manufacturer"
                })
        
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






        