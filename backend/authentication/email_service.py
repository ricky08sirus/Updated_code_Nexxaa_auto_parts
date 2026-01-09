# # authentication/email_service.py
# """
# Email service for admin-initiated responses to customer inquiries.
# Uses info@nexxaauto.com for two-way communication via Resend.
# """

# import os
# import logging
# import base64
# import resend
# from django.conf import settings
# from django.template.loader import render_to_string
# from django.utils import timezone
# from django.core.files.uploadedfile import InMemoryUploadedFile

# logger = logging.getLogger(__name__)

# # Configure Resend API key
# resend.api_key = settings.RESEND_API_KEY


# class InquiryEmailService:
#     """
#     Service for sending email responses to parts inquiries from admin panel.
#     Uses info@nexxaauto.com for professional, reply-able emails.
#     """
    
#     FROM_EMAIL = os.getenv('INFO_EMAIL', 'info@nexxaauto.com')
#     COMPANY_NAME = 'Nexxa Auto'
    
#     @staticmethod
#     def send_inquiry_response(inquiry, parts_info, custom_message, admin_user):
#         """
#         Send email response to a parts inquiry with part details.
        
#         Args:
#             inquiry: PartsInquiry instance
#             parts_info: List of dicts containing part details to include
#             custom_message: Optional custom message from admin
#             admin_user: User who is sending the email
            
#         Returns:
#             dict: {'success': bool, 'message': str, 'error': str or None}
#         """
#         try:
#             # Process images to get URLs (uploaded files or direct URLs)
#             processed_parts = InquiryEmailService._process_part_images(parts_info)
            
#             # Prepare email subject
#             subject = f"Response to Your Part Inquiry - {inquiry.year} {inquiry.manufacturer} {inquiry.model}"
            
#             # Prepare context for email template
#             context = {
#                 'customer_name': inquiry.name,
#                 'inquiry': inquiry,
#                 'parts_info': processed_parts,
#                 'custom_message': custom_message,
#                 'inquiry_date': inquiry.created_at,
#                 'company_email': InquiryEmailService.FROM_EMAIL,
#                 'company_name': InquiryEmailService.COMPANY_NAME,
#             }
            
#             # Render HTML email template
#             html_content = render_to_string(
#                 'emails/inquiry_response.html',
#                 context
#             )
            
#             # Prepare attachments for uploaded images
#             attachments = []
#             for part in parts_info:
#                 for img in part.get('images', []):
#                     if img.get('type') == 'file' and img.get('file'):
#                         file_obj = img['file']
#                         # Read file content and encode to base64
#                         file_content = file_obj.read()
#                         file_obj.seek(0)  # Reset file pointer
                        
#                         attachments.append({
#                             'filename': img['name'],
#                             'content': list(file_content),  # Resend expects array of bytes
#                         })
            
#             # Prepare email parameters for Resend
#             params = {
#                 "from": f"{InquiryEmailService.COMPANY_NAME} <{InquiryEmailService.FROM_EMAIL}>",
#                 "to": [inquiry.email],
#                 "subject": subject,
#                 "html": html_content,
#                 "reply_to": InquiryEmailService.FROM_EMAIL,
#             }
            
#             # Add attachments if any
#             if attachments:
#                 params['attachments'] = attachments
            
#             # Send via Resend API
#             email_response = resend.Emails.send(params)
            
#             # Check if email was sent successfully
#             if email_response and email_response.get('id'):
#                 # Mark inquiry as emailed
#                 inquiry.mark_email_sent(
#                     user=admin_user,
#                     subject=subject,
#                     message=custom_message,
#                     parts_info=processed_parts
#                 )
                
#                 logger.info(
#                     f"Email sent successfully to {inquiry.email} for inquiry {inquiry.id}. "
#                     f"Resend ID: {email_response.get('id')}"
#                 )
                
#                 return {
#                     'success': True,
#                     'message': f'Email sent successfully to {inquiry.email}',
#                     'error': None
#                 }
#             else:
#                 raise Exception(f"Resend API returned unexpected response: {email_response}")
            
#         except Exception as e:
#             error_msg = str(e)
#             logger.error(
#                 f"Failed to send email for inquiry {inquiry.id}: {error_msg}",
#                 exc_info=True
#             )
            
#             # Log error in inquiry
#             inquiry.email_error = error_msg
#             inquiry.save(update_fields=['email_error'])
            
#             return {
#                 'success': False,
#                 'message': 'Failed to send email',
#                 'error': error_msg
#             }
    
    
#     @staticmethod
#     def _process_part_images(parts_info):
#         """
#         Process part images - handle both file uploads and URLs.
#         For uploaded files, we'll use base64 data URIs for inline display.
        
#         Args:
#             parts_info: List of part dicts with image info
            
#         Returns:
#             list: Processed parts with images array ready for email template
#         """
#         processed_parts = []
        
#         for part in parts_info:
#             processed_part = part.copy()
#             processed_images = []
            
#             for img in part.get('images', []):
#                 if img.get('type') == 'url' and img.get('url'):
#                     # Direct URL - use as is
#                     processed_images.append(img['url'])
#                 elif img.get('type') == 'file' and img.get('file'):
#                     # Uploaded file - create data URI for inline display
#                     file_obj = img['file']
#                     file_content = file_obj.read()
#                     file_obj.seek(0)  # Reset pointer
                    
#                     # Encode as base64 data URI
#                     encoded = base64.b64encode(file_content).decode('utf-8')
#                     mime_type = file_obj.content_type or 'image/jpeg'
#                     data_uri = f"data:{mime_type};base64,{encoded}"
#                     processed_images.append(data_uri)
            
#             # Add images array to processed part
#             processed_part['images'] = processed_images
#             processed_parts.append(processed_part)
        
#         return processed_parts
    
#     @staticmethod
#     def prepare_parts_info(selected_parts_data):
#         """
#         Prepare and validate parts information for email.
        
#         Args:
#             selected_parts_data: List of part info dicts from admin form
            
#         Returns:
#             list: Formatted and validated parts information
#         """
#         parts_info = []
        
#         for part_data in selected_parts_data:
#             # Collect images array
#             images = part_data.get('images', [])
#             if not isinstance(images, list):
#                 images = [images] if images else []
            
#             # Validate and clean part data
#             part_info = {
#                 'name': part_data.get('name', 'Part').strip(),
#                 'part_number': part_data.get('part_number', 'N/A').strip(),
#                 'condition': part_data.get('condition', 'Used'),
#                 'price': part_data.get('price'),
#                 'availability': part_data.get('availability', 'In Stock'),
#                 'warranty': part_data.get('warranty', 'N/A'),
#                 'description': part_data.get('description', '').strip(),
#                 'link': part_data.get('link', '').strip(),
#                 'link_heading': part_data.get('link_heading', 'View Details').strip(),
#                 'images': images,  # Will contain file objects or URLs
#             }
            
#             # Format price if present
#             if part_info['price']:
#                 try:
#                     part_info['price'] = f"{float(part_info['price']):.2f}"
#                 except (ValueError, TypeError):
#                     part_info['price'] = None
            
#             parts_info.append(part_info)
        
#         return parts_info
    
#     @staticmethod
#     def send_test_email(to_email, admin_user):
#         """
#         Send a test email to verify configuration.
        
#         Args:
#             to_email: Email address to send test to
#             admin_user: Admin user sending test
            
#         Returns:
#             dict: Result of send operation
#         """
#         try:
#             subject = "Test Email - Nexxa Auto Admin System"
            
#             html_content = """
#             <!DOCTYPE html>
#             <html>
#             <head>
#                 <style>
#                     body { font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; }
#                     .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
#                     .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px; margin: -30px -30px 30px -30px; }
#                     .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 6px; margin: 20px 0; }
#                 </style>
#             </head>
#             <body>
#                 <div class="container">
#                     <div class="header">
#                         <h1>✅ Test Email Successful!</h1>
#                         <p>Nexxa Auto Admin System</p>
#                     </div>
#                     <div class="success">
#                         <strong>Congratulations!</strong> Your email configuration is working correctly.
#                     </div>
#                     <p>This test email confirms that:</p>
#                     <ul>
#                         <li>✅ Resend API is configured correctly</li>
#                         <li>✅ info@nexxaauto.com is working</li>
#                         <li>✅ Email templates are rendering properly</li>
#                         <li>✅ Admin system can send emails</li>
#                     </ul>
#                     <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
#                     <p style="color: #666; font-size: 12px;">
#                         <strong>Sent from:</strong> info@nexxaauto.com<br>
#                         <strong>Sent via:</strong> Resend API<br>
#                         <strong>Time:</strong> """ + timezone.now().strftime('%B %d, %Y at %I:%M %p') + """
#                     </p>
#                 </div>
#             </body>
#             </html>
#             """
            
#             params = {
#                 "from": f"Nexxa Auto <{InquiryEmailService.FROM_EMAIL}>",
#                 "to": [to_email],
#                 "subject": subject,
#                 "html": html_content,
#                 "reply_to": InquiryEmailService.FROM_EMAIL,
#             }
            
#             # Send via Resend
#             email_response = resend.Emails.send(params)
            
#             if email_response and email_response.get('id'):
#                 logger.info(f"Test email sent successfully to {to_email}")
#                 return {
#                     'success': True,
#                     'message': f'Test email sent successfully to {to_email}',
#                     'error': None
#                 }
#             else:
#                 raise Exception(f"Resend returned unexpected response: {email_response}")
                
#         except Exception as e:
#             error_msg = str(e)
#             logger.error(f"Test email failed: {error_msg}", exc_info=True)
#             return {
#                 'success': False,
#                 'message': 'Test email failed',
#                 'error': error_msg
#             }
















# authentication/email_service.py
"""
Email service for admin-initiated responses to customer inquiries.
Uses info@nexxaauto.com for two-way communication via Resend.
"""

import os
import logging
import base64
import resend
from django.conf import settings
from django.template.loader import render_to_string
from django.utils import timezone

logger = logging.getLogger(__name__)

# Configure Resend API key
resend.api_key = settings.RESEND_API_KEY


class InquiryEmailService:
    """
    Service for sending email responses to parts inquiries from admin panel.
    Uses info@nexxaauto.com for professional, reply-able emails.
    """
    
    FROM_EMAIL = os.getenv('INFO_EMAIL', 'info@nexxaauto.com')
    COMPANY_NAME = 'Nexxa Auto'
    
    @staticmethod
    def send_inquiry_response(inquiry, parts_info, custom_message, admin_user):
        """
        Send email response to a parts inquiry with part details.
        
        Args:
            inquiry: PartsInquiry instance
            parts_info: List of dicts containing part details to include
            custom_message: Optional custom message from admin
            admin_user: User who is sending the email
            
        Returns:
            dict: {'success': bool, 'message': str, 'error': str or None}
        """
        try:
            # Process images to embed as data URIs (NO attachments)
            processed_parts = InquiryEmailService._process_part_images(parts_info)
            
            # Prepare email subject
            subject = f"Response to Your Part Inquiry - {inquiry.year} {inquiry.manufacturer} {inquiry.model}"
            
            # Prepare context for email template
            context = {
                'customer_name': inquiry.name,
                'inquiry': inquiry,
                'parts_info': processed_parts,
                'custom_message': custom_message,
                'inquiry_date': inquiry.created_at,
                'company_email': InquiryEmailService.FROM_EMAIL,
                'company_name': InquiryEmailService.COMPANY_NAME,
            }
            
            # Render HTML email template
            html_content = render_to_string(
                'emails/inquiry_response.html',
                context
            )
            
            # Prepare email parameters for Resend (NO attachments - only inline images)
            params = {
                "from": f"{InquiryEmailService.COMPANY_NAME} <{InquiryEmailService.FROM_EMAIL}>",
                "to": [inquiry.email],
                "subject": subject,
                "html": html_content,
                "reply_to": InquiryEmailService.FROM_EMAIL,
            }
            
            # Send via Resend API
            email_response = resend.Emails.send(params)
            
            # Check if email was sent successfully
            if email_response and email_response.get('id'):
                # Mark inquiry as emailed
                inquiry.mark_email_sent(
                    user=admin_user,
                    subject=subject,
                    message=custom_message,
                    parts_info=processed_parts
                )
                
                logger.info(
                    f"Email sent successfully to {inquiry.email} for inquiry {inquiry.id}. "
                    f"Resend ID: {email_response.get('id')}"
                )
                
                return {
                    'success': True,
                    'message': f'Email sent successfully to {inquiry.email}',
                    'error': None
                }
            else:
                raise Exception(f"Resend API returned unexpected response: {email_response}")
            
        except Exception as e:
            error_msg = str(e)
            logger.error(
                f"Failed to send email for inquiry {inquiry.id}: {error_msg}",
                exc_info=True
            )
            
            # Log error in inquiry
            inquiry.email_error = error_msg
            inquiry.save(update_fields=['email_error'])
            
            return {
                'success': False,
                'message': 'Failed to send email',
                'error': error_msg
            }
    
    
    @staticmethod
    def _process_part_images(parts_info):
        """
        Process part images - convert to data URIs for inline display.
        NO attachments - Gmail displays data URIs properly.
        
        Args:
            parts_info: List of part dicts with image info
            
        Returns:
            list: Processed parts with images array ready for email template
        """
        processed_parts = []
        
        for part in parts_info:
            processed_part = part.copy()
            processed_images = []
            
            for img in part.get('images', []):
                if img.get('type') == 'url' and img.get('url'):
                    # Direct URL - use as is
                    processed_images.append({
                        'url': img['url'],
                        'type': 'url'
                    })
                elif img.get('type') == 'file' and img.get('file'):
                    # Uploaded file - create data URI for inline display
                    file_obj = img['file']
                    file_content = file_obj.read()
                    file_obj.seek(0)  # Reset pointer
                    
                    # Encode as base64 data URI
                    encoded = base64.b64encode(file_content).decode('utf-8')
                    mime_type = file_obj.content_type or 'image/jpeg'
                    data_uri = f"data:{mime_type};base64,{encoded}"
                    processed_images.append({
                        'url': data_uri,
                        'type': 'data_uri'
                    })
            
            # Add images array to processed part
            processed_part['images'] = processed_images
            processed_parts.append(processed_part)
        
        return processed_parts
    
    @staticmethod
    def prepare_parts_info(selected_parts_data):
        """
        Prepare and validate parts information for email.
        
        Args:
            selected_parts_data: List of part info dicts from admin form
            
        Returns:
            list: Formatted and validated parts information
        """
        parts_info = []
        
        for part_data in selected_parts_data:
            # Collect images array
            images = part_data.get('images', [])
            if not isinstance(images, list):
                images = [images] if images else []
            
            # Validate and clean part data
            part_info = {
                'name': part_data.get('name', 'Part').strip(),
                'part_number': part_data.get('part_number', 'N/A').strip(),
                'condition': part_data.get('condition', 'Used'),
                'price': part_data.get('price'),
                'availability': part_data.get('availability', 'In Stock'),
                'warranty': part_data.get('warranty', 'N/A'),
                'description': part_data.get('description', '').strip(),
                'link': part_data.get('link', '').strip(),
                'link_heading': part_data.get('link_heading', 'View Details').strip(),
                'images': images,  # Will contain file objects or URLs
            }
            
            # Format price if present
            if part_info['price']:
                try:
                    part_info['price'] = f"{float(part_info['price']):.2f}"
                except (ValueError, TypeError):
                    part_info['price'] = None
            
            parts_info.append(part_info)
        
        return parts_info
    
    @staticmethod
    def send_test_email(to_email, admin_user):
        """
        Send a test email to verify configuration.
        
        Args:
            to_email: Email address to send test to
            admin_user: Admin user sending test
            
        Returns:
            dict: Result of send operation
        """
        try:
            subject = "Test Email - Nexxa Auto Admin System"
            
            html_content = """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; }
                    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px; margin: -30px -30px 30px -30px; }
                    .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 6px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✅ Test Email Successful!</h1>
                        <p>Nexxa Auto Admin System</p>
                    </div>
                    <div class="success">
                        <strong>Congratulations!</strong> Your email configuration is working correctly.
                    </div>
                    <p>This test email confirms that:</p>
                    <ul>
                        <li>✅ Resend API is configured correctly</li>
                        <li>✅ info@nexxaauto.com is working</li>
                        <li>✅ Email templates are rendering properly</li>
                        <li>✅ Admin system can send emails</li>
                    </ul>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                    <p style="color: #666; font-size: 12px;">
                        <strong>Sent from:</strong> info@nexxaauto.com<br>
                        <strong>Sent via:</strong> Resend API<br>
                        <strong>Time:</strong> """ + timezone.now().strftime('%B %d, %Y at %I:%M %p') + """
                    </p>
                </div>
            </body>
            </html>
            """
            
            params = {
                "from": f"Nexxa Auto <{InquiryEmailService.FROM_EMAIL}>",
                "to": [to_email],
                "subject": subject,
                "html": html_content,
                "reply_to": InquiryEmailService.FROM_EMAIL,
            }
            
            # Send via Resend
            email_response = resend.Emails.send(params)
            
            if email_response and email_response.get('id'):
                logger.info(f"Test email sent successfully to {to_email}")
                return {
                    'success': True,
                    'message': f'Test email sent successfully to {to_email}',
                    'error': None
                }
            else:
                raise Exception(f"Resend returned unexpected response: {email_response}")
                
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Test email failed: {error_msg}", exc_info=True)
            return {
                'success': False,
                'message': 'Test email failed',
                'error': error_msg
            }