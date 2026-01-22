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
            # use regular endpoint for production
            self.endpoint = f"https://www.google-analytics.com/mp/collect?measurement_id={self.measurement_id}&api_secret={self.api_secret}"
            # debug endpoint for testing
            self.debug_endpoint = f"https://www.google-analytics.com/debug/mp/collect?measurement_id={self.measurement_id}&api_secret={self.api_secret}"
        else:
            self.endpoint = None
            self.debug_endpoint = None
    
    def send_event(self, client_id, event_name, event_params=None, debug=False):
        """
        send event to google analytics
        
        args:
            client_id: unique identifier for the user
            event_name: name of the event (e.g., 'inquiry_submitted', 'email_sent')
            event_params: dictionary of event parameters
            debug: if True, uses debug endpoint and returns validation response
        """
        if not self.endpoint:
            logger.warning("google analytics not configured - skipping event tracking")
            return False
        
        # add debug_mode to params if debugging
        if event_params is None:
            event_params = {}
        
        # always add debug_mode for better visibility in ga4
        event_params['debug_mode'] = 1
        
        payload = {
            "client_id": str(client_id),
            "events": [{
                "name": event_name,
                "params": event_params
            }]
        }
        
        # choose endpoint
        endpoint = self.debug_endpoint if debug else self.endpoint
        
        try:
            response = requests.post(
                endpoint,
                json=payload,
                headers={'content-type': 'application/json'},
                timeout=5
            )
            
            # debug endpoint returns validation messages
            if debug:
                if response.status_code == 200:
                    validation_result = response.json()
                    logger.info(f"ga debug response: {json.dumps(validation_result, indent=2)}")
                    
                    # check for validation errors
                    if 'validationmessages' in validation_result:
                        for msg in validation_result['validationmessages']:
                            logger.warning(f"ga validation: {msg}")
                    
                    return validation_result
                else:
                    logger.error(f"ga debug failed: {response.status_code} - {response.text}")
                    return {"error": response.text}
            
            # regular endpoint returns 204 no content on success
            if response.status_code == 204:
                logger.info(f"ga event sent: {event_name}")
                return True
            else:
                logger.error(f"ga event failed: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"ga event error: {str(e)}")
            return False

def get_client_ip(request):
    """extract client ip address from request"""
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0].strip()
    else:
        ip = request.META.get("REMOTE_ADDR", "unknown")
    return ip


def get_client_id(request):
    """
    generate a consistent client id without using sessions.
    uses ip address + user agent to create a stable identifier.
    
    args:
        request: django request object
        
    returns:
        str: client id in uuid format
    """
    # strategy 1: check for client id from frontend (custom header)
    client_id_header = request.headers.get('x-ga-client-id')
    if client_id_header:
        return client_id_header
    
    # strategy 2: use authenticated user id if available
    if hasattr(request, 'user') and request.user.is_authenticated:
        user_id = str(request.user.id)
        hash_object = hashlib.md5(f"user_{user_id}".encode())
        hash_hex = hash_object.hexdigest()
        return f"{hash_hex[:8]}-{hash_hex[8:12]}-{hash_hex[12:16]}-{hash_hex[16:20]}-{hash_hex[20:32]}"
    
    # strategy 3: generate from ip + user agent (fallback)
    ip_address = get_client_ip(request)
    user_agent = request.META.get('HTTP_USER_AGENT', 'unknown')
    
    # create a stable hash
    identifier = f"{ip_address}:{user_agent}"
    hash_object = hashlib.md5(identifier.encode())
    hash_hex = hash_object.hexdigest()
    
    # format as uuid
    return f"{hash_hex[:8]}-{hash_hex[8:12]}-{hash_hex[12:16]}-{hash_hex[16:20]}-{hash_hex[20:32]}"


def track_event(request, event_name, event_params=None):
    """
    helper function to track events easily
    
    args:
        request: django request object
        event_name: name of the event
        event_params: optional dictionary of event parameters
    
    returns:
        bool: True if successful, False otherwise
    """
    try:
        ga = GoogleAnalytics()
        client_id = get_client_id(request)
        
        # clean event params - remove potentially problematic data
        if event_params:
            # remove ip addresses and long user agents from params
            cleaned_params = {k: v for k, v in event_params.items() 
                            if k not in ['ip_address', 'user_agent']}
            event_params = cleaned_params
        
        return ga.send_event(client_id, event_name, event_params)
    except Exception as e:
        logger.error(f"error tracking event {event_name}: {str(e)}")
        return False


# ============================================================================
# new product tracking functions - added
# ============================================================================

def track_product_page_view(request, product_id, product_name, price, category=None):
    """
    track product page view
    
    args:
        request: django request object
        product_id: product id (uuid or int)
        product_name: product name/title
        price: product price
        category: product category (optional)
    
    returns:
        bool: True if successful
    """
    try:
        event_params = {
            'product_id': str(product_id),
            'product_name': product_name[:100],  # limit length
            'price': float(price) if price else 0.0,
            'page_url': request.build_absolute_uri(),
        }
        
        if category:
            event_params['category'] = category[:50]
        
        return track_event(request, 'product_page_view', event_params)
        
    except Exception as e:
        logger.error(f"error tracking product page view: {str(e)}")
        return False


def track_add_to_wishlist(request, product_id, product_name, price):
    """
    track when user adds product to wishlist
    
    args:
        request: django request object
        product_id: product id
        product_name: product name
        price: product price
    
    returns:
        bool: True if successful
    """
    try:
        event_params = {
            'product_id': str(product_id),
            'product_name': product_name[:100],
            'price': float(price) if price else 0.0,
            'action': 'add_to_wishlist'
        }
        
        return track_event(request, 'add_to_wishlist', event_params)
        
    except Exception as e:
        logger.error(f"error tracking add to wishlist: {str(e)}")
        return False


def track_scroll_depth(request, product_id, scroll_percentage):
    """
    track how far user scrolled on product page
    
    args:
        request: django request object
        product_id: product id
        scroll_percentage: scroll depth (25, 50, 75, 100)
    
    returns:
        bool: True if successful
    """
    try:
        event_params = {
            'product_id': str(product_id),
            'scroll_percentage': int(scroll_percentage),
            'milestone': f'{scroll_percentage}%'
        }
        
        return track_event(request, 'scroll_depth', event_params)
        
    except Exception as e:
        logger.error(f"error tracking scroll depth: {str(e)}")
        return False


def track_time_on_page(request, product_id, seconds_spent):
    """
    track how long user spent on product page
    
    args:
        request: django request object
        product_id: product id
        seconds_spent: time in seconds
    
    returns:
        bool: True if successful
    """
    try:
        event_params = {
            'product_id': str(product_id),
            'time_spent_seconds': int(seconds_spent),
            'time_category': categorize_time(seconds_spent)
        }
        
        return track_event(request, 'time_on_page', event_params)
        
    except Exception as e:
        logger.error(f"error tracking time on page: {str(e)}")
        return False


def categorize_time(seconds):
    """helper to categorize time spent"""
    if seconds < 10:
        return 'quick_view'
    elif seconds < 30:
        return 'brief_view'
    elif seconds < 60:
        return 'engaged_view'
    elif seconds < 180:
        return 'detailed_view'
    else:
        return 'deep_engagement'
