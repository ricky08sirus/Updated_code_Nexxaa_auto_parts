// src/utils/analytics.js
// Complete Analytics System with 15+ Tracking Features

// ============================================================================
// CONFIGURATION
// ============================================================================

const GA_MEASUREMENT_ID = 'G-675QHD8DWY';
const DEBUG_MODE = true; // ✅ Set to true for testing

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

let pageLoadTime = Date.now();
let isGAInitialized = false;
const scrollMilestones = new Set();
let lastScrollTime = Date.now();
let totalScrollDistance = 0;
let lastScrollY = 0;
let userIsActive = true;
let inactivityTimer = null;
let mouseMovements = 0;
let clicks = 0;
let keypresses = 0;

// ============================================================================
// GOOGLE ANALYTICS 4 INITIALIZATION
// ============================================================================

export const initGA = () => {
  if (isGAInitialized) {
    console.log('✅ Google Analytics already initialized');
    return;
  }

  // Load gtag.js script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false,
    cookie_flags: 'SameSite=None;Secure',
    debug_mode: true, // ✅ Enable debug mode for DebugView
  });

  // ✅ CRITICAL: This extra line ensures DebugView works
  gtag('set', 'debug_mode', true);

  isGAInitialized = true;
  console.log('✅ Google Analytics initialized:', GA_MEASUREMENT_ID);
  console.log('✅ Debug mode enabled for DebugView');

  // Initialize user activity tracking
  initUserActivityTracking();
};

export const getClientId = () => {
  let clientId = localStorage.getItem('ga_client_id');
  
  if (!clientId) {
    clientId = `${Date.now()}.${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('ga_client_id', clientId);
  }
  
  return clientId;
};

// ============================================================================
// CORE EVENT TRACKING
// ============================================================================

export const trackEvent = (eventName, eventParams = {}) => {
  try {
    if (window.gtag) {
      const params = {
        ...eventParams,
        client_id: getClientId(),
        timestamp: Date.now(),
      };
      
      window.gtag('event', eventName, params);
      
      if (DEBUG_MODE) {
        console.log(`📊 Event: ${eventName}`, params);
      }
    } else {
      console.warn('⚠️ GA not initialized yet');
    }
  } catch (error) {
    console.error('❌ Tracking error:', error);
  }
};

export const trackPageView = (pagePath, pageTitle) => {
  try {
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: pagePath,
        page_title: pageTitle,
        page_location: window.location.href,
        client_id: getClientId(),
      });
      
      if (DEBUG_MODE) {
        console.log(`📄 Page view: ${pagePath}`);
      }
    }
  } catch (error) {
    console.error('❌ Page view error:', error);
  }
};

// ============================================================================
// FEATURE 1-3: USER INTERACTION TRACKING
// ============================================================================

export const trackButtonClick = (buttonName, location = 'unknown') => {
  clicks++;
  trackEvent('button_click', {
    button_name: buttonName,
    click_location: location,
    total_clicks: clicks,
  });
};

export const trackLinkClick = (linkText, linkUrl) => {
  trackEvent('link_click', {
    link_text: linkText,
    link_url: linkUrl,
  });
};

export const trackSearch = (searchTerm, resultsCount = 0) => {
  trackEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount,
  });
};

// ============================================================================
// FEATURE 4-5: SCROLL TRACKING (Depth + Distance)
// ============================================================================

export const initScrollTracking = () => {
  const handleScroll = () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    const scrollPercentage = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);

    // Track scroll depth milestones (25%, 50%, 75%, 100%)
    const milestones = [25, 50, 75, 100];
    milestones.forEach(milestone => {
      if (scrollPercentage >= milestone && !scrollMilestones.has(milestone)) {
        scrollMilestones.add(milestone);
        trackEvent('scroll_depth', {
          scroll_percentage: milestone,
          page_path: window.location.pathname,
        });
      }
    });

    // Track total scroll distance
    const scrollDelta = Math.abs(scrollTop - lastScrollY);
    totalScrollDistance += scrollDelta;
    lastScrollY = scrollTop;
    lastScrollTime = Date.now();
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  return () => {
    window.removeEventListener('scroll', handleScroll);
    scrollMilestones.clear();
  };
};

export const getScrollStats = () => ({
  total_distance: Math.round(totalScrollDistance),
  max_depth: Math.max(...scrollMilestones, 0),
  milestones_reached: scrollMilestones.size,
});

// ============================================================================
// FEATURE 6: TIME ON PAGE TRACKING
// ============================================================================

export const resetPageTimer = () => {
  pageLoadTime = Date.now();
  totalScrollDistance = 0;
  lastScrollY = 0;
  scrollMilestones.clear();
  mouseMovements = 0;
  clicks = 0;
  keypresses = 0;
};

export const trackTimeOnPage = (pagePath) => {
  const timeSpent = Math.round((Date.now() - pageLoadTime) / 1000);
  
  if (timeSpent > 0) {
    trackEvent('time_on_page', {
      page_path: pagePath,
      time_spent_seconds: timeSpent,
      time_category: categorizeTime(timeSpent),
      scroll_distance: totalScrollDistance,
      engagement_score: calculateEngagementScore(timeSpent),
    });
  }
};

const categorizeTime = (seconds) => {
  if (seconds < 10) return 'bounce';
  if (seconds < 30) return 'quick_view';
  if (seconds < 60) return 'engaged_view';
  if (seconds < 180) return 'detailed_view';
  return 'deep_engagement';
};

// ============================================================================
// FEATURE 7: ENGAGEMENT SCORE
// ============================================================================

const calculateEngagementScore = (timeSpent) => {
  let score = 0;
  
  // Time component (max 40 points)
  score += Math.min(40, timeSpent / 3);
  
  // Scroll component (max 30 points)
  score += scrollMilestones.size * 7.5;
  
  // Interaction component (max 30 points)
  score += Math.min(30, (clicks + mouseMovements / 10) / 2);
  
  return Math.round(score);
};

// ============================================================================
// FEATURE 8-9: USER ACTIVITY & INACTIVITY TRACKING
// ============================================================================

const initUserActivityTracking = () => {
  let inactivityTime = 0;
  
  const resetInactivityTimer = () => {
    if (inactivityTime > 30) {
      trackEvent('user_returned', {
        inactive_seconds: inactivityTime,
      });
    }
    inactivityTime = 0;
    userIsActive = true;
  };

  // Track mouse movements
  document.addEventListener('mousemove', () => {
    mouseMovements++;
    resetInactivityTimer();
  }, { passive: true });

  // Track clicks
  document.addEventListener('click', resetInactivityTimer);

  // Track keyboard
  document.addEventListener('keypress', () => {
    keypresses++;
    resetInactivityTimer();
  });

  // Check for inactivity every 5 seconds
  setInterval(() => {
    inactivityTime += 5;
    if (inactivityTime === 30) {
      trackEvent('user_inactive', {
        inactive_seconds: 30,
      });
      userIsActive = false;
    }
  }, 5000);
};

// ============================================================================
// FEATURE 10: FORM FIELD TRACKING
// ============================================================================

export const trackFormStart = (formName) => {
  trackEvent('form_start', {
    form_name: formName,
  });
};

export const trackFormSubmit = (formName, success = true) => {
  trackEvent('form_submit', {
    form_name: formName,
    success: success,
  });
};

export const trackFormFieldInteraction = (formName, fieldName, fieldValue = null) => {
  trackEvent('form_field_interaction', {
    form_name: formName,
    field_name: fieldName,
    has_value: !!fieldValue,
  });
};

// ============================================================================
// FEATURE 11: SEARCH FILTER TRACKING
// ============================================================================

export const trackFilterChange = (filterType, filterValue, location = 'unknown') => {
  console.log('🔥 trackFilterChange CALLED:', { filterType, filterValue, location });
  
  trackEvent('search_filter_change', {
    filter_type: filterType,
    filter_value: filterValue,
    page_location: location,
  });
  
  console.log('✅ trackFilterChange COMPLETED');
};

// ============================================================================
// FEATURE 12: CAROUSEL/SLIDER INTERACTION
// ============================================================================

export const trackCarouselInteraction = (carouselName, action, direction = null) => {
  trackEvent('carousel_interaction', {
    carousel_name: carouselName,
    action: action,
    direction: direction,
  });
};

// ============================================================================
// FEATURE 13: BRAND CLICK TRACKING
// ============================================================================

export const trackBrandClick = (brandName, brandSlug, location = 'unknown') => {
  trackEvent('brand_click', {
    brand_name: brandName,
    brand_slug: brandSlug,
    click_location: location,
  });
};

// ============================================================================
// FEATURE 14: PART CATEGORY TRACKING
// ============================================================================

export const trackPartCategoryClick = (categoryName, location = 'unknown') => {
  trackEvent('part_category_click', {
    category_name: categoryName,
    click_location: location,
  });
};

// ============================================================================
// FEATURE 15: CTA (Call-to-Action) TRACKING
// ============================================================================

export const trackCTAClick = (ctaName, ctaLocation, ctaType = 'button') => {
  trackEvent('cta_click', {
    cta_name: ctaName,
    cta_location: ctaLocation,
    cta_type: ctaType,
  });
};

// ============================================================================
// FEATURE 16: ERROR TRACKING
// ============================================================================

export const trackError = (errorType, errorMessage, errorLocation) => {
  trackEvent('error', {
    error_type: errorType,
    error_message: errorMessage,
    error_location: errorLocation,
  });
};

export const trackAPIError = (endpoint, statusCode, errorMessage) => {
  trackEvent('api_error', {
    endpoint: endpoint,
    status_code: statusCode,
    error_message: errorMessage,
  });
};

// ============================================================================
// FEATURE 17: PAGE EXIT TRACKING
// ============================================================================

export const trackPageExit = (pagePath) => {
  const timeSpent = Math.round((Date.now() - pageLoadTime) / 1000);
  const scrollStats = getScrollStats();
  
  trackEvent('page_exit', {
    page_path: pagePath,
    time_spent_seconds: timeSpent,
    ...scrollStats,
    total_clicks: clicks,
    total_keypresses: keypresses,
    engagement_score: calculateEngagementScore(timeSpent),
  });
};

// ============================================================================
// FEATURE 18: VISIBILITY TRACKING (Tab Switch)
// ============================================================================

let tabSwitchCount = 0;
let tabInactiveStart = null;

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      tabInactiveStart = Date.now();
      tabSwitchCount++;
    } else {
      if (tabInactiveStart) {
        const inactiveTime = Math.round((Date.now() - tabInactiveStart) / 1000);
        trackEvent('tab_returned', {
          inactive_seconds: inactiveTime,
          total_tab_switches: tabSwitchCount,
        });
        tabInactiveStart = null;
      }
    }
  });
}

// ============================================================================
// ✅ DEFAULT EXPORT
// ============================================================================

export default {
  initGA,
  getClientId,
  trackEvent,
  trackPageView,
  trackButtonClick,
  trackLinkClick,
  trackSearch,
  initScrollTracking,
  resetPageTimer,
  trackTimeOnPage,
  getScrollStats,
  trackFormStart,
  trackFormSubmit,
  trackFormFieldInteraction,
  trackFilterChange,
  trackCarouselInteraction,
  trackBrandClick,
  trackPartCategoryClick,
  trackCTAClick,
  trackError,
  trackAPIError,
  trackPageExit,
};

// ============================================================================
// 🔍 DEBUG: Expose to window for testing
// ============================================================================
if (typeof window !== 'undefined') {
  window.analyticsDebug = {
    initGA,
    getClientId,
    trackEvent,
    trackPageView,
    trackButtonClick,
    trackLinkClick,
    trackSearch,
    initScrollTracking,
    resetPageTimer,
    trackTimeOnPage,
    getScrollStats,
    trackFormStart,
    trackFormSubmit,
    trackFormFieldInteraction,
    trackFilterChange,
    trackCarouselInteraction,
    trackBrandClick,
    trackPartCategoryClick,
    trackCTAClick,
    trackError,
    trackAPIError,
    trackPageExit,
  };
  console.log('🔍 Analytics exposed to window.analyticsDebug');
}
