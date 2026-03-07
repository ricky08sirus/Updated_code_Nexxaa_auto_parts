# authentication/resend_email_backend.py
import resend
import os
import logging

logger = logging.getLogger(__name__)

# Initialize Resend API key
resend.api_key = os.getenv('RESEND_API_KEY')

def send_email_via_resend(to, subject, html_body, text_body, reply_to=None, from_email="noreply"):
    """
    Send email via Resend
    Args:
        to: Email address (string) or list of addresses
        subject: Email subject
        html_body: HTML content
        text_body: Plain text content
        reply_to: Optional reply-to address
        from_email: Either "noreply" or "info" (default: "noreply")
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Ensure 'to' is a list
        if isinstance(to, str):
            to = [to]
        
        # Set the from address based on from_email parameter
        if from_email == "info":
            from_address = "Nexxa Auto <info@nexxaauto.com>"
            # Automatically set reply_to to info if not provided
            if not reply_to:
                reply_to = "info@nexxaauto.com"
        else:
            # Default: noreply for form submissions
            from_address = "Nexxa Auto <noreply@nexxaauto.com>"
            # Don't set reply_to for noreply emails
        
        # Prepare email parameters
        params = {
            "from": from_address,
            "to": to,
            "subject": subject,
            "html": html_body,
            "text": text_body,
        }
        
        # Add reply_to if provided
        if reply_to:
            params["reply_to"] = reply_to
        
        # Send email
        email = resend.Emails.send(params)
        logger.info(f"Email sent successfully via Resend to {to} from {from_address}: {email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email via Resend: {str(e)}", exc_info=True)
        return False
