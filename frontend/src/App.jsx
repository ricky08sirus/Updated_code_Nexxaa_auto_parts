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
import { 
  initGA, 
  trackPageView, 
  trackPageExit, 
  resetPageTimer 
} from "./utils/analytics";

function App() {
  const location = useLocation();

  // ✅ Initialize GA ONCE when app mounts
  useEffect(() => {
    console.log('🚀 App mounted - Initializing GA...');
    initGA();
  }, []); // Empty dependency array = runs once

  // ✅ Track page views on route changes
  useEffect(() => {
    console.log('📍 Route changed to:', location.pathname);
    resetPageTimer();
    
    // Small delay to ensure GA is ready
    setTimeout(() => {
      trackPageView(location.pathname, document.title);
    }, 100);
    
    return () => {
      trackPageExit(location.pathname);
    };
  }, [location.pathname]);

  const hideNavbarRoutes = [
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
        {/* Public pages */}
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
        
        {/* Product & Brand */}
        <Route path="/product/:slug/:id" element={<ProductPage />} />
        <Route path="/used/:brandSlug/parts" element={<BrandDetail />} />
        <Route path="/order/:slug/:id" element={<OrderPage />} />
        
        {/* Auth Routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/register" element={<Register />} />
      </Routes>
      <Footer />
    </AuthProvider>
  );
}

export default App;
