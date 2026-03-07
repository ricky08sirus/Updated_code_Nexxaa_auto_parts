# authentication/cloudflare_email_backend.py
import requests
import logging
from django.conf import settings

logger = logging.getLogger(__name__)


def send_email_via_cloudflare(to, subject, html_body, text_body, reply_to=None):
    """
    Send email via Cloudflare Workers
    
    Args:
        to: Email address (string) or list of addresses
        subject: Email subject
        html_body: HTML content
        text_body: Plain text content
        reply_to: Optional reply-to address
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Ensure 'to' is a single email address (Cloudflare Worker expects string)
        if isinstance(to, list):
            to = to[0]  # Take first email
        
        # Prepare request data
        data = {
            'to': to,
            'subject': subject,
            'html': html_body,
            'text': text_body,
        }
        
        # Send request to Cloudflare Worker
        response = requests.post(
            settings.CLOUDFLARE_WORKER_URL,
            json=data,
            headers={
                'Authorization': f'Bearer {settings.CLOUDFLARE_WORKER_TOKEN}',
                'Content-Type': 'application/json',
            },
            timeout=30
        )
        
        if response.status_code == 200:
            logger.info(f"Email sent successfully to {to} via Cloudflare")
            return True
        else:
            logger.error(f"Cloudflare Worker error: {response.text}")
            return False
    
    except Exception as e:
        logger.error(f"Failed to send email via Cloudflare: {str(e)}", exc_info=True)
        return False