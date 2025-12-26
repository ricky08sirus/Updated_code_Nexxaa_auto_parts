import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import {
  Car,
  Package,
  Settings,
  TrendingUp,
  User as UserIcon,
} from "lucide-react";

export default function Dashboard() {
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();

  const [userData, setUserData] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    let isMounted = true; // Prevent state updates if component unmounts

    const initializeDashboard = async () => {
      if (!isSignedIn || !user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get token
        const token = await getToken();

        if (!token) {
          throw new Error("Failed to get authentication token");
        }

        // Track sign-in
        await fetch("http://localhost:8000/api/user/signin/", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        // Fetch user data & stats in parallel
        const [userResponse, statsResponse] = await Promise.all([
          fetch("http://localhost:8000/api/user/me/", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
          fetch("http://localhost:8000/api/user/stats/", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
        ]);

        if (!userResponse.ok || !statsResponse.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userJson = await userResponse.json();
        const statsJson = await statsResponse.json();

        // Only update state if component is still mounted
        if (isMounted) {
          setUserData(userJson.data);
          setUserStats(statsJson.data);
          setError(null);
        }
      } catch (err) {
        console.error("Dashboard initialization error:", err);
        if (isMounted) {
          setError(err.message || "Failed to load dashboard data");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeDashboard();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [isSignedIn, user?.id, getToken]); // Only re-run if these specific values change

  // ---------------- LOADING VIEW ----------------
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto">
          </div>
          <p className="mt-4 text-gray-600 text-lg">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  // ---------------- ERROR VIEW ----------------
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="text-center">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-3xl">⚠</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Error Loading Dashboard
            </h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- MAIN DASHBOARD VIEW ----------------
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
              <UserIcon size={40} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                Welcome back,{" "}
                {userData?.first_name || user?.firstName || "User"}!
              </h1>
              <p className="text-white/90 mt-1">
                {userData?.email || user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Orders */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Total Orders
                </p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  {userStats?.total_orders || 0}
                </p>
                <p className="text-gray-500 text-sm mt-1">All time</p>
              </div>
              <div className="bg-green-100 p-4 rounded-full">
                <Package className="text-green-600" size={32} />
              </div>
            </div>
          </div>

          {/* Account Age */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Member For</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  {userStats?.account_age_days || 0}
                </p>
                <p className="text-gray-500 text-sm mt-1">Days</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-full">
                <TrendingUp className="text-blue-600" size={32} />
              </div>
            </div>
          </div>

          {/* Verified Status */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Status</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {userStats?.is_verified_buyer ? "Verified" : "Standard"}
                </p>
                <p className="text-gray-500 text-sm mt-1">Account type</p>
              </div>
              <div className="bg-red-100 p-4 rounded-full">
                <Car className="text-red-600" size={32} />
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              {["overview", "profile", "activity"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === tab
                    ? "border-red-600 text-red-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* TAB CONTENT */}
          <div className="p-6">
            {activeTab === "overview" && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Dashboard Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Recent Orders
                    </h3>
                    <p className="text-gray-600 text-sm">No recent orders</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Account Info
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Total Orders: {userStats?.total_orders || 0}
                    </p>
                    <p className="text-gray-600 text-sm">
                      Member for: {userStats?.account_age_days || 0} days
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Account Info
                </h2>
                <div className="space-y-4">
                  {/* First / Last Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoField
                      label="First Name"
                      value={userData?.first_name || user?.firstName}
                    />
                    <InfoField
                      label="Last Name"
                      value={userData?.last_name || user?.lastName}
                    />
                  </div>

                  {/* Email */}
                  <InfoField
                    label="Email Address"
                    value={userData?.email ||
                      user?.primaryEmailAddress?.emailAddress}
                  />

                  {/* Clerk ID */}
                  <InfoField
                    label="Clerk User ID"
                    value={userData?.clerk_id || user?.id}
                  />

                  {/* Created / Updated */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoField
                      label="Member Since"
                      value={formatDate(userData?.created_at)}
                    />
                    <InfoField
                      label="Last Sign In"
                      value={formatDate(userData?.last_sign_in)}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "activity" && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Recent Activity
                </h2>

                <div className="space-y-3">
                  <ActivityCard
                    color="red"
                    title="Signed in"
                    time={formatDate(userData?.last_sign_in) || "Just now"}
                  />
                  <ActivityCard
                    color="blue"
                    title="Account created"
                    time={formatDate(userData?.created_at)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionButton
              icon={<Package className="text-red-600" />}
              text="Browse Parts"
            />
            <ActionButton
              icon={<Settings className="text-red-600" />}
              text="Account Settings"
            />
            <ActionButton
              icon={<Car className="text-red-600" />}
              text="My Orders"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* -----------------------------------------------
   SMALL COMPONENT HELPERS
----------------------------------------------- */

function InfoField({ label, value }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
        {value || "N/A"}
      </p>
    </div>
  );
}

function ActivityCard({ color, title, time }) {
  return (
    <div className={`border-l-4 border-${color}-600 bg-gray-50 p-4 rounded`}>
      <p className="font-semibold text-gray-900">{title}</p>
      <p className="text-sm text-gray-600">{time}</p>
    </div>
  );
}

function ActionButton({ icon, text }) {
  return (
    <button className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-red-600 hover:bg-red-50 transition-all">
      {icon}
      <span className="font-medium">{text}</span>
    </button>
  );
}

function formatDate(date) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

