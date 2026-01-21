from django.conf import settings 

def google_analytics(request):
    """
    Add Google Analytics ID to template context
    """
    return {
        'GOOGLE_ANALYTICS_ID': settings.GOOGLE_ANALYTICS_ID,
        'DEBUG': settings.DEBUG,
    }



