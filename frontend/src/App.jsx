// import "./App.css";
// import { useLocation, Routes, Route } from "react-router-dom";

// import Navbar from "./components/Navbar";
// import Footer from "./components/Footer";
// import CallModal from "./components/CallModal";

// import Home from "./pages/Home";
// import About from "./pages/About";
// import Contact from "./pages/Contact";
// import Privacypolicy from "./pages/Policypage.jsx";
// import ProductDetails from "./pages/ProductDetails";
// import Warranty from "./pages/Warranty";
// import Terms from "./pages/Terms";
// import Landing from "./pages/Landing.jsx";
// import BrandDetail from "./pages/BrandDetail.jsx";
// import ProductPage from "./pages/ProductPage.jsx";
// import OrderPage from "./pages/OrderPage";


// // ✅ Auth imports
// import { AuthProvider } from "./Context/AuthContext";
// import { SignIn } from "./components/Auth/SignIn";
// import { Register } from "./components/Auth/Register";
// // import { Dashboard } from "./components/Auth/Dashboard"; // if you have it

// function App() {
//   const location = useLocation();

//   const hideNavbarRoutes = [
//     "/product",
//     "/order",
//     "/signin",
//     "/register"
//   ];

//   const hideNavbar = hideNavbarRoutes.some(route =>
//     location.pathname.startsWith(route)
//   );

//   return (
//     <AuthProvider>
//       {!hideNavbar && <Navbar />}

//       <CallModal />

//       <Routes>
//         {/* Public pages */}
//         <Route path="/" element={<Home />} />
//         <Route path="/about" element={<About />} />
//         <Route path="/contact" element={<Contact />} />
//         <Route path="/privacy-policy" element={<Privacypolicy />} />
//         <Route path="/product-details" element={<ProductDetails />} />
//         <Route path="/warranty" element={<Warranty />} />
//         <Route path="/terms-and-condition" element={<Terms />} />
//         <Route path="/landing" element={<Landing />} />

//         {/* Product & Brand */}
//         <Route path="/product" element={<ProductPage />} />
//         <Route path="/product/:slug/:id" element={<ProductPage />} />
//         <Route path="/brand/:id" element={<BrandDetail />} />

//         {/* Order */}
//         <Route path="/order" element={<OrderPage />} />
//         <Route path="/order/:slug/:id" element={<OrderPage />} />

//         {/* ✅ Auth Routes */}
//         <Route path="/signin" element={<SignIn />} />
//         <Route path="/register" element={<Register />} />
//         {/* <Route path="/dashboard" element={<Dashboard />} /> */}
//       </Routes>

//       <Footer />
//     </AuthProvider>
//   );
// }

// export default App;


import "./App.css";
import { useLocation, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";

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

// ✅ Auth imports
import { AuthProvider } from "./Context/AuthContext";
import { SignIn } from "./components/Auth/SignIn";
import { Register } from "./components/Auth/Register";

// ✅ NEW: Redirect handler component
function HashRedirect() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const path = window.location.pathname + window.location.search;
    if (path !== '/' && !window.location.hash) {
      window.location.replace('/#' + path);
    }
  }, [navigate]);
  
  return null;
}

function App() {
  const location = useLocation();

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
      <HashRedirect />
      
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

        {/* Product & Brand */}
        <Route path="/product" element={<ProductPage />} />
        <Route path="/product/:slug/:id" element={<ProductPage />} />
        
        {/* ✅ BOTH routes for brands */}
        <Route path="/brand/:id" element={<BrandDetail />} />
        <Route path="/used-auto-parts/:id" element={<BrandDetail />} />

        {/* Order */}
        <Route path="/order" element={<OrderPage />} />
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