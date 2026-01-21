# authentication/analytics.py
import requests
import json
from django.conf import settings
import logging
import hashlib
import uuid

logger = logging.getLogger(__name__)

class GoogleAnalytics:
    """
    Google Analytics 4 Measurement Protocol
    """
    
    def __init__(self):
        self.measurement_id = getattr(settings, 'GOOGLE_ANALYTICS_ID', '')
        self.api_secret = getattr(settings, 'GOOGLE_ANALYTICS_API_SECRET', '')
        
        if self.measurement_id and self.api_secret:
            # Use regular endpoint for production
            self.endpoint = f"https://www.google-analytics.com/mp/collect?measurement_id={self.measurement_id}&api_secret={self.api_secret}"
            # Debug endpoint for testing
            self.debug_endpoint = f"https://www.google-analytics.com/debug/mp/collect?measurement_id={self.measurement_id}&api_secret={self.api_secret}"
        else:
            self.endpoint = None
            self.debug_endpoint = None
    
    def send_event(self, client_id, event_name, event_params=None, debug=False):
        """
        Send event to Google Analytics
        
        Args:
            client_id: Unique identifier for the user
            event_name: Name of the event (e.g., 'inquiry_submitted', 'email_sent')
            event_params: Dictionary of event parameters
            debug: If True, uses debug endpoint and returns validation response
        """
        if not self.endpoint:
            logger.warning("Google Analytics not configured - skipping event tracking")
            return False
        
        # Add debug_mode to params if debugging
        if event_params is None:
            event_params = {}
        
        # Always add debug_mode for better visibility in GA4
        event_params['debug_mode'] = 1
        
        payload = {
            "client_id": str(client_id),
            "events": [{
                "name": event_name,
                "params": event_params
            }]
        }
        
        # Choose endpoint
        endpoint = self.debug_endpoint if debug else self.endpoint
        
        try:
            response = requests.post(
                endpoint,
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=5
            )
            
            # Debug endpoint returns validation messages
            if debug:
                if response.status_code == 200:
                    validation_result = response.json()
                    logger.info(f"GA Debug Response: {json.dumps(validation_result, indent=2)}")
                    
                    # Check for validation errors
                    if 'validationMessages' in validation_result:
                        for msg in validation_result['validationMessages']:
                            logger.warning(f"GA Validation: {msg}")
                    
                    return validation_result
                else:
                    logger.error(f"GA Debug failed: {response.status_code} - {response.text}")
                    return {"error": response.text}
            
            # Regular endpoint returns 204 No Content on success
            if response.status_code == 204:
                logger.info(f"GA Event sent: {event_name}")
                return True
            else:
                logger.error(f"GA Event failed: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"GA Event error: {str(e)}")
            return False


def get_client_ip(request):
    """Extract client IP address from request"""
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0].strip()
    else:
        ip = request.META.get("REMOTE_ADDR", "unknown")
    return ip


def get_client_id(request):
    """
    Generate a consistent client ID without using sessions.
    Uses IP address + User Agent to create a stable identifier.
    
    Args:
        request: Django request object
        
    Returns:
        str: Client ID in UUID format
    """
    # Strategy 1: Check for client ID from frontend (custom header)
    client_id_header = request.headers.get('X-GA-Client-ID')
    if client_id_header:
        return client_id_header
    
    # Strategy 2: Use authenticated user ID if available
    if hasattr(request, 'user') and request.user.is_authenticated:
        user_id = str(request.user.id)
        hash_object = hashlib.md5(f"user_{user_id}".encode())
        hash_hex = hash_object.hexdigest()
        return f"{hash_hex[:8]}-{hash_hex[8:12]}-{hash_hex[12:16]}-{hash_hex[16:20]}-{hash_hex[20:32]}"
    
    # Strategy 3: Generate from IP + User Agent (fallback)
    ip_address = get_client_ip(request)
    user_agent = request.META.get('HTTP_USER_AGENT', 'unknown')
    
    # Create a stable hash
    identifier = f"{ip_address}:{user_agent}"
    hash_object = hashlib.md5(identifier.encode())
    hash_hex = hash_object.hexdigest()
    
    # Format as UUID
    return f"{hash_hex[:8]}-{hash_hex[8:12]}-{hash_hex[12:16]}-{hash_hex[16:20]}-{hash_hex[20:32]}"


def track_event(request, event_name, event_params=None):
    """
    Helper function to track events easily
    
    Args:
        request: Django request object
        event_name: Name of the event
        event_params: Optional dictionary of event parameters
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        ga = GoogleAnalytics()
        client_id = get_client_id(request)
        
        # Clean event params - remove potentially problematic data
        if event_params:
            # Remove IP addresses and long user agents from params
            cleaned_params = {k: v for k, v in event_params.items() 
                            if k not in ['ip_address', 'user_agent']}
            event_params = cleaned_params
        
        return ga.send_event(client_id, event_name, event_params)
    except Exception as e:
        logger.error(f"Error tracking event {event_name}: {str(e)}")
        return False
