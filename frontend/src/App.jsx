import "./App.css";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacypolicy from "./pages/Policypage.jsx";
import ProductDetails from "./pages/ProductDetails";
import Warranty from "./pages/Warranty";
import Terms from "./pages/Terms";
import Landing from "./pages/Landing.jsx";
import BrandDetail from "./pages/BrandDetail.jsx";
import CallModal from './components/CallModal';


function App() {
  return (
    <>
      <Navbar />
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

        {/* ONE page for ALL brands */}
          <Route path="/brand/:id" element={<BrandDetail />} />
        {/* <Route path="/brands/:id" element={<BrandDetail />} /> */}

      </Routes>

      <Footer />
    </>
  );
}

export default App;
