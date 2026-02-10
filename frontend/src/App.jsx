import "./App.css";
import { useEffect } from "react";
import { useLocation, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CallModal from "./components/CallModal";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacypolicy from "./pages/Policypage.jsx";
import ProductDetails from "./pages/ProductDetails";
import Warranty from "./pages/Warranty";
import Terms from "./pages/Terms";
import Landing from "./pages/Landing.jsx";
import BrandDetail from "./pages/BrandDetail.jsx";
import ProductPage from "./pages/ProductPage.jsx";
import OrderPage from "./pages/OrderPage";
import RequestPart from "./pages/RequestPart/";
import HomePage2 from "./pages/HomePage2.jsx";
import Thankyou from "./components/Thankyou";
import { AuthProvider } from "./Context/AuthContext";
import { SignIn } from "./components/Auth/SignIn";
import { Register } from "./components/Auth/Register";
import PartDetailPage from './pages/PartDetailPage';
import { 
  initGA, 
  trackPageView, 
  trackPageExit, 
  resetPageTimer,
  trackEvent
} from "./utils/analytics";

function App() {
  const location = useLocation();

  // ✅ Initialize GA ONCE when app mounts
  useEffect(() => {
    console.log('🚀 App initializing Google Analytics...');
    initGA();

    // Wait for GA to load, then send initial event
    setTimeout(() => {
      trackEvent('app_loaded', {
        initial_page: location.pathname,
        timestamp: new Date().toISOString(),
      });
    }, 2000);
  }, []);

  // ✅ Track page views on route changes
  useEffect(() => {
    console.log('📍 Route changed to:', location.pathname);
    
    // Reset timer for new page
    resetPageTimer();
    
    // Wait a bit for page to render, then track
    const timer = setTimeout(() => {
      trackPageView(location.pathname, document.title);
      
      // Send a custom event too
      trackEvent('page_navigation', {
        from: document.referrer,
        to: location.pathname,
      });
    }, 500);
    
    // Track exit when leaving page
    return () => {
      clearTimeout(timer);
      trackPageExit(location.pathname);
    };
  }, [location.pathname]);

  const hideNavbarRoutes = [
    "/product",
    "/order",
    "/signin",
    "/register"
  ];
  
  const hideNavbar = hideNavbarRoutes.some(route =>
    location.pathname.startsWith(route)
  );

  return (
    <AuthProvider>
      {!hideNavbar && <Navbar />}
      <CallModal />
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<About />} />
  <Route path="/contact" element={<Contact />} />
  <Route path="/privacy-policy" element={<Privacypolicy />} />
  <Route path="/product-details" element={<ProductDetails />} />
  <Route path="/warranty" element={<Warranty />} />
  <Route path="/terms-and-condition" element={<Terms />} />
  <Route path="/landing" element={<Landing />} />
  <Route path="/request-part" element={<HomePage2 />} />
  <Route path="/order-a-part" element={<RequestPart />} />
  <Route path="/order-a-part/thank-you" element={<Thankyou />} />
  
  {/* Product and brand routes - specific patterns first */}
  <Route path="/product/:slug/:id" element={<ProductPage />} />
  <Route path="/order/:slug/:id" element={<OrderPage />} />
  
  {/* Part routes - more specific BEFORE generic */}
  <Route path="/used/:brandSlug/parts" element={<BrandDetail />} />
  <Route path="/used/:partSlug" element={<PartDetailPage />} />
  
  {/* Auth routes */}
  <Route path="/signin" element={<SignIn />} />
  <Route path="/register" element={<Register />} />
</Routes>
      <Footer />
    </AuthProvider>
  );
}

export default App;
