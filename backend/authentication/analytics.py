# # authentication/analytics.py
# import requests
# import json
# from django.conf import settings
# import logging
# import hashlib
# import uuid
#
# logger = logging.getLogger(__name__)
#
# class GoogleAnalytics:
#     """
#     Google Analytics 4 Measurement Protocol
#     """
#
#     def __init__(self):
#         self.measurement_id = getattr(settings, 'GOOGLE_ANALYTICS_ID', '')
#         self.api_secret = getattr(settings, 'GOOGLE_ANALYTICS_API_SECRET', '')
#
#         if self.measurement_id and self.api_secret:
#             # use regular endpoint for production
#             self.endpoint = f"https://www.google-analytics.com/mp/collect?measurement_id={self.measurement_id}&api_secret={self.api_secret}"
#             # debug endpoint for testing
#             self.debug_endpoint = f"https://www.google-analytics.com/debug/mp/collect?measurement_id={self.measurement_id}&api_secret={self.api_secret}"
#         else:
#             self.endpoint = None
#             self.debug_endpoint = None
#
#     def send_event(self, client_id, event_name, event_params=None, debug=False):
#         """
#         send event to google analytics
#
#         args:
#             client_id: unique identifier for the user
#             event_name: name of the event (e.g., 'inquiry_submitted', 'email_sent')
#             event_params: dictionary of event parameters
#             debug: if True, uses debug endpoint and returns validation response
#         """
#         if not self.endpoint:
#             logger.warning("google analytics not configured - skipping event tracking")
#             return False
#
#         # add debug_mode to params if debugging
#         if event_params is None:
#             event_params = {}
#
#         # always add debug_mode for better visibility in ga4
#         event_params['debug_mode'] = 1
#
#         payload = {
#             "client_id": str(client_id),
#             "events": [{
#                 "name": event_name,
#                 "params": event_params
#             }]
#         }
#
#         # choose endpoint
#         endpoint = self.debug_endpoint if debug else self.endpoint
#
#         try:
#             response = requests.post(
#                 endpoint,
#                 json=payload,
#                 headers={'content-type': 'application/json'},
#                 timeout=5
#             )
#
#             # debug endpoint returns validation messages
#             if debug:
#                 if response.status_code == 200:
#                     validation_result = response.json()
#                     logger.info(f"ga debug response: {json.dumps(validation_result, indent=2)}")
#
#                     # check for validation errors
#                     if 'validationmessages' in validation_result:
#                         for msg in validation_result['validationmessages']:
#                             logger.warning(f"ga validation: {msg}")
#
#                     return validation_result
#                 else:
#                     logger.error(f"ga debug failed: {response.status_code} - {response.text}")
#                     return {"error": response.text}
#
#             # regular endpoint returns 204 no content on success
#             if response.status_code == 204:
#                 logger.info(f"ga event sent: {event_name}")
#                 return True
#             else:
#                 logger.error(f"ga event failed: {response.status_code}")
#                 return False
#
#         except Exception as e:
#             logger.error(f"ga event error: {str(e)}")
#             return False
#
# def get_client_ip(request):
#     """extract client ip address from request"""
#     x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
#     if x_forwarded_for:
#         ip = x_forwarded_for.split(",")[0].strip()
#     else:
#         ip = request.META.get("REMOTE_ADDR", "unknown")
#     return ip
#
#
# def get_client_id(request):
#     """
#     generate a consistent client id without using sessions.
#     uses ip address + user agent to create a stable identifier.
#
#     args:
#         request: django request object
#
#     returns:
#         str: client id in uuid format
#     """
#     # strategy 1: check for client id from frontend (custom header)
#     client_id_header = request.headers.get('x-ga-client-id')
#     if client_id_header:
#         return client_id_header
#
#     # strategy 2: use authenticated user id if available
#     if hasattr(request, 'user') and request.user.is_authenticated:
#         user_id = str(request.user.id)
#         hash_object = hashlib.md5(f"user_{user_id}".encode())
#         hash_hex = hash_object.hexdigest()
#         return f"{hash_hex[:8]}-{hash_hex[8:12]}-{hash_hex[12:16]}-{hash_hex[16:20]}-{hash_hex[20:32]}"
#
#     # strategy 3: generate from ip + user agent (fallback)
#     ip_address = get_client_ip(request)
#     user_agent = request.META.get('HTTP_USER_AGENT', 'unknown')
#
#     # create a stable hash
#     identifier = f"{ip_address}:{user_agent}"
#     hash_object = hashlib.md5(identifier.encode())
#     hash_hex = hash_object.hexdigest()
#
#     # format as uuid
#     return f"{hash_hex[:8]}-{hash_hex[8:12]}-{hash_hex[12:16]}-{hash_hex[16:20]}-{hash_hex[20:32]}"
#
#
# def track_event(request, event_name, event_params=None):
#     """
#     helper function to track events easily
#
#     args:
#         request: django request object
#         event_name: name of the event
#         event_params: optional dictionary of event parameters
#
#     returns:
#         bool: True if successful, False otherwise
#     """
#     try:
#         ga = GoogleAnalytics()
#         client_id = get_client_id(request)
#
#         # clean event params - remove potentially problematic data
#         if event_params:
#             # remove ip addresses and long user agents from params
#             cleaned_params = {k: v for k, v in event_params.items() 
#                             if k not in ['ip_address', 'user_agent']}
#             event_params = cleaned_params
#
#         return ga.send_event(client_id, event_name, event_params)
#     except Exception as e:
#         logger.error(f"error tracking event {event_name}: {str(e)}")
#         return False
#
#
# # ============================================================================
# # new product tracking functions - added
# # ============================================================================
#
# def track_product_page_view(request, product_id, product_name, price, category=None):
#     """
#     track product page view
#
#     args:
#         request: django request object
#         product_id: product id (uuid or int)
#         product_name: product name/title
#         price: product price
#         category: product category (optional)
#
#     returns:
#         bool: True if successful
#     """
#     try:
#         event_params = {
#             'product_id': str(product_id),
#             'product_name': product_name[:100],  # limit length
#             'price': float(price) if price else 0.0,
#             'page_url': request.build_absolute_uri(),
#         }
#
#         if category:
#             event_params['category'] = category[:50]
#
#         return track_event(request, 'product_page_view', event_params)
#
#     except Exception as e:
#         logger.error(f"error tracking product page view: {str(e)}")
#         return False
#
#
# def track_add_to_wishlist(request, product_id, product_name, price):
#     """
#     track when user adds product to wishlist
#
#     args:
#         request: django request object
#         product_id: product id
#         product_name: product name
#         price: product price
#
#     returns:
#         bool: True if successful
#     """
#     try:
#         event_params = {
#             'product_id': str(product_id),
#             'product_name': product_name[:100],
#             'price': float(price) if price else 0.0,
#             'action': 'add_to_wishlist'
#         }
#
#         return track_event(request, 'add_to_wishlist', event_params)
#
#     except Exception as e:
#         logger.error(f"error tracking add to wishlist: {str(e)}")
#         return False
#
#
# def track_scroll_depth(request, product_id, scroll_percentage):
#     """
#     track how far user scrolled on product page
#
#     args:
#         request: django request object
#         product_id: product id
#         scroll_percentage: scroll depth (25, 50, 75, 100)
#
#     returns:
#         bool: True if successful
#     """
#     try:
#         event_params = {
#             'product_id': str(product_id),
#             'scroll_percentage': int(scroll_percentage),
#             'milestone': f'{scroll_percentage}%'
#         }
#
#         return track_event(request, 'scroll_depth', event_params)
#
#     except Exception as e:
#         logger.error(f"error tracking scroll depth: {str(e)}")
#         return False
#
#
# def track_time_on_page(request, product_id, seconds_spent):
#     """
#     track how long user spent on product page
#
#     args:
#         request: django request object
#         product_id: product id
#         seconds_spent: time in seconds
#
#     returns:
#         bool: True if successful
#     """
#     try:
#         event_params = {
#             'product_id': str(product_id),
#             'time_spent_seconds': int(seconds_spent),
#             'time_category': categorize_time(seconds_spent)
#         }
#
#         return track_event(request, 'time_on_page', event_params)
#
#     except Exception as e:
#         logger.error(f"error tracking time on page: {str(e)}")
#         return False
#
#
# def categorize_time(seconds):
#     """helper to categorize time spent"""
#     if seconds < 10:
#         return 'quick_view'
#     elif seconds < 30:
#         return 'brief_view'
#     elif seconds < 60:
#         return 'engaged_view'
#     elif seconds < 180:
#         return 'detailed_view'
#     else:
#         return 'deep_engagement'
#
#
#
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
# EXISTING PRODUCT TRACKING FUNCTIONS (PRESERVED)
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


# ============================================================================
# NEW FEATURES FROM analytics.js - INTEGRATED
# ============================================================================

# -------------------- Button & Link Tracking --------------------

def track_button_click(request, button_name, location='unknown', total_clicks=None):
    """
    track button click events
    
    args:
        request: django request object
        button_name: name/identifier of the button
        location: where the button is located on the page
        total_clicks: optional total click count
    
    returns:
        bool: True if successful
    """
    try:
        event_params = {
            'button_name': button_name[:100],
            'click_location': location[:100],
        }
        
        if total_clicks is not None:
            event_params['total_clicks'] = int(total_clicks)
        
        return track_event(request, 'button_click', event_params)
    
    except Exception as e:
        logger.error(f"error tracking button click: {str(e)}")
        return False


def track_link_click(request, link_text, link_url):
    """
    track link click events
    
    args:
        request: django request object
        link_text: text of the link
        link_url: url of the link
    
    returns:
        bool: True if successful
    """
    try:
        event_params = {
            'link_text': link_text[:200],
            'link_url': link_url[:500],
        }
        
        return track_event(request, 'link_click', event_params)
    
    except Exception as e:
        logger.error(f"error tracking link click: {str(e)}")
        return False


# -------------------- Search Tracking --------------------

def track_search(request, search_term, results_count=0):
    """
    track search events
    
    args:
        request: django request object
        search_term: the search query
        results_count: number of results returned
    
    returns:
        bool: True if successful
    """
    try:
        event_params = {
            'search_term': search_term[:200],
            'results_count': int(results_count),
        }
        
        return track_event(request, 'search', event_params)
    
    except Exception as e:
        logger.error(f"error tracking search: {str(e)}")
        return False


def track_filter_change(request, filter_type, filter_value, location='unknown'):
    """
    track filter/search filter changes
    
    args:
        request: django request object
        filter_type: type of filter (e.g., 'category', 'price', 'brand')
        filter_value: value of the filter
        location: where the filter is applied
    
    returns:
        bool: True if successful
    """
    try:
        event_params = {
            'filter_type': filter_type[:100],
            'filter_value': str(filter_value)[:200],
            'page_location': location[:100],
        }
        
        return track_event(request, 'search_filter_change', event_params)
    
    except Exception as e:
        logger.error(f"error tracking filter change: {str(e)}")
        return False


# -------------------- Form Tracking --------------------

def track_form_start(request, form_name):
    """
    track when user starts filling a form
    
    args:
        request: django request object
        form_name: name/identifier of the form
    
    returns:
        bool: True if successful
    """
    try:
        event_params = {
            'form_name': form_name[:100],
        }
        
        return track_event(request, 'form_start', event_params)
    
    except Exception as e:
        logger.error(f"error tracking form start: {str(e)}")
        return False


def track_form_submit(request, form_name, success=True):
    """
    track form submission
    
    args:
        request: django request object
        form_name: name/identifier of the form
        success: whether submission was successful
    
    returns:
        bool: True if successful
    """
    try:
        event_params = {
            'form_name': form_name[:100],
            'success': bool(success),
        }
        
        return track_event(request, 'form_submit', event_params)
    
    except Exception as e:
        logger.error(f"error tracking form submit: {str(e)}")
        return False


def track_form_field_interaction(request, form_name, field_name, has_value=False):
    """
    track interaction with form fields
    
    args:
        request: django request object
        form_name: name/identifier of the form
        field_name: name of the field
        has_value: whether the field has a value
    
    returns:
        bool: True if successful
    """
    try:
        event_params = {
            'form_name': form_name[:100],
            'field_name': field_name[:100],
            'has_value': bool(has_value),
        }
        
        return track_event(request, 'form_field_interaction', event_params)
    
    except Exception as e:
        logger.error(f"error tracking form field interaction: {str(e)}")
        return False


# -------------------- UI Interaction Tracking --------------------

def track_carousel_interaction(request, carousel_name, action, direction=None):
    """
    track carousel/slider interactions
    
    args:
        request: django request object
        carousel_name: name/identifier of the carousel
        action: action performed (e.g., 'next', 'prev', 'dot_click')
        direction: optional direction ('left', 'right')
    
    returns:
        bool: True if successful
    """
    try:
        event_params = {
            'carousel_name': carousel_name[:100],
            'action': action[:50],
        }
        
        if direction:
            event_params['direction'] = direction[:20]
        
        return track_event(request, 'carousel_interaction', event_params)
    
    except Exception as e:
        logger.error(f"error tracking carousel interaction: {str(e)}")
        return False


def track_brand_click(request, brand_name, brand_slug, location='unknown'):
    """
    track brand click events
    
    args:
        request: django request object
        brand_name: name of the brand
        brand_slug: slug/identifier of the brand
        location: where the brand was clicked
    
    returns:
        bool: True if successful
    """
    try:
        event_params = {
            'brand_name': brand_name[:100],
            'brand_slug': brand_slug[:100],
            'click_location': location[:100],
        }
        
        return track_event(request, 'brand_click', event_params)
    
    except Exception as e:
        logger.error(f"error tracking brand click: {str(e)}")
        return False


def track_part_category_click(request, category_name, location='unknown'):
    """
    track part category click events
    
    args:
        request: django request object
        category_name: name of the category
        location: where the category was clicked
    
    returns:
        bool: True if successful
    """
    try:
        event_params = {
            'category_name': category_name[:100],
            'click_location': location[:100],
        }
        
        return track_event(request, 'part_category_click', event_params)
    
    except Exception as e:
        logger.error(f"error tracking part category click: {str(e)}")
        return False


def track_cta_click(request, cta_name, cta_location, cta_type='button'):
    """
    track call-to-action (CTA) clicks
    
    args:
        request: django request object
        cta_name: name/text of the CTA
        cta_location: where the CTA is located
        cta_type: type of CTA (button, link, banner, etc.)
    
    returns:
        bool: True if successful
    """
    try:
        event_params = {
            'cta_name': cta_name[:100],
            'cta_location': cta_location[:100],
            'cta_type': cta_type[:50],
        }
        
        return track_event(request, 'cta_click', event_params)
    
    except Exception as e:
        logger.error(f"error tracking cta click: {str(e)}")
        return False


# -------------------- Error Tracking --------------------

def track_error(request, error_type, error_message, error_location):
    """
    track application errors
    
    args:
        request: django request object
        error_type: type/category of error
        error_message: error message
        error_location: where the error occurred
    
    returns:
        bool: True if successful
    """
    try:
        event_params = {
            'error_type': error_type[:100],
            'error_message': error_message[:500],
            'error_location': error_location[:200],
        }
        
        return track_event(request, 'error', event_params)
    
    except Exception as e:
        logger.error(f"error tracking error event: {str(e)}")
        return False


def track_api_error(request, endpoint, status_code, error_message):
    """
    track API-specific errors
    
    args:
        request: django request object
        endpoint: API endpoint that failed
        status_code: HTTP status code
        error_message: error message
    
    returns:
        bool: True if successful
    """
    try:
        event_params = {
            'endpoint': endpoint[:200],
            'status_code': int(status_code),
            'error_message': error_message[:500],
        }
        
        return track_event(request, 'api_error', event_params)
    
    except Exception as e:
        logger.error(f"error tracking api error: {str(e)}")
        return False


# -------------------- Page Tracking --------------------

def track_page_view(request, page_path, page_title=None):
    """
    track page views
    
    args:
        request: django request object
        page_path: path of the page
        page_title: optional page title
    
    returns:
        bool: True if successful
    """
    try:
        event_params = {
            'page_path': page_path[:500],
            'page_location': request.build_absolute_uri()[:500],
        }
        
        if page_title:
            event_params['page_title'] = page_title[:200]
        
        return track_event(request, 'page_view', event_params)
    
    except Exception as e:
        logger.error(f"error tracking page view: {str(e)}")
        return False


def track_page_exit(request, page_path, time_spent_seconds, total_clicks=0, engagement_score=0):
    """
    track when user exits a page
    
    args:
        request: django request object
        page_path: path of the page
        time_spent_seconds: time spent on page
        total_clicks: total clicks on the page
        engagement_score: calculated engagement score
    
    returns:
        bool: True if successful
    """
    try:
        event_params = {
            'page_path': page_path[:500],
            'time_spent_seconds': int(time_spent_seconds),
            'total_clicks': int(total_clicks),
            'engagement_score': int(engagement_score),
        }
        
        return track_event(request, 'page_exit', event_params)
    
    except Exception as e:
        logger.error(f"error tracking page exit: {str(e)}")
        return False


# ============================================================================
# TESTING & DEBUG UTILITIES
# ============================================================================

def test_analytics_connection(request=None):
    """
    test the analytics connection and send a test event
    
    args:
        request: optional django request object (creates mock if None)
    
    returns:
        dict: test results
    """
    try:
        ga = GoogleAnalytics()
        
        # check configuration
        if not ga.endpoint:
            return {
                'success': False,
                'error': 'Analytics not configured - missing GOOGLE_ANALYTICS_ID or API_SECRET',
                'configured': False
            }
        
        # create a test client id
        test_client_id = f"test-{uuid.uuid4()}"
        
        # send test event using debug endpoint
        result = ga.send_event(
            client_id=test_client_id,
            event_name='analytics_test',
            event_params={
                'test_type': 'backend_connection_test',
                'timestamp': str(uuid.uuid1().time)
            },
            debug=True
        )
        
        return {
            'success': True if result else False,
            'configured': True,
            'measurement_id': ga.measurement_id,
            'debug_response': result if isinstance(result, dict) else None,
            'message': 'Test event sent successfully' if result else 'Test event failed'
        }
    
    except Exception as e:
        logger.error(f"analytics connection test failed: {str(e)}")
        return {
            'success': False,
            'error': str(e),
            'configured': False
        }


def get_analytics_status():
    """
    get current analytics configuration status
    
    returns:
        dict: status information
    """
    ga = GoogleAnalytics()
    
    return {
        'configured': bool(ga.endpoint),
        'measurement_id': ga.measurement_id if ga.measurement_id else 'Not set',
        'api_secret': 'Set' if ga.api_secret else 'Not set',
        'endpoint': ga.endpoint if ga.endpoint else 'Not configured'
    }

