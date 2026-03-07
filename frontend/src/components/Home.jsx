import { Car, Clock, Package, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-black to-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Premium Used Auto Parts
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Quality parts for Kia, Porsche, BMW, Mercedes and more
          </p>
          <button className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-lg text-lg font-semibold transition-colors">
            Browse Parts
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Choose Nexxa?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Car className="text-red-600" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Wide Selection</h3>
            <p className="text-gray-600">Thousands of quality used parts</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="text-blue-600" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Quality Assured</h3>
            <p className="text-gray-600">All parts tested and verified</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="text-green-600" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Fast Delivery</h3>
            <p className="text-gray-600">Quick shipping nationwide</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="text-purple-600" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Easy Returns</h3>
            <p className="text-gray-600">30-day return policy</p>
          </div>
        </div>
      </div>

      {/* Popular Brands Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Popular Brands
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {["BMW", "Mercedes", "Porsche", "Kia"].map((brand) => (
              <div
                key={brand}
                className="border-2 border-gray-200 rounded-lg p-8 text-center hover:border-red-600 transition-colors cursor-pointer"
              >
                <h3 className="text-2xl font-bold text-gray-800">{brand}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
