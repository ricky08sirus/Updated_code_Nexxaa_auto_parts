// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL ||
  "http://localhost:8000/api";

/**
 * API Service for backend communication
 */
const apiService = {
  /**
   * Health check endpoint
   */
  healthCheck: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health/`);
      if (!response.ok) throw new Error("Health check failed");
      return await response.json();
    } catch (error) {
      console.error("Health check error:", error);
      throw error;
    }
  },

  /**
   * Get current user data
   * @param {string} token - Clerk JWT token
   */
  getCurrentUser: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/me/`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch user data");
      }

      return await response.json();
    } catch (error) {
      console.error("Get current user error:", error);
      throw error;
    }
  },

  /**
   * Update user profile
   * @param {string} token - Clerk JWT token
   * @param {object} data - User data to update
   */
  updateProfile: async (token, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/me/update/`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }

      return await response.json();
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  },

  /**
   * Get user statistics
   * @param {string} token - Clerk JWT token
   */
  getUserStats: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/stats/`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch user stats");
      }

      return await response.json();
    } catch (error) {
      console.error("Get user stats error:", error);
      throw error;
    }
  },

  /**
   * Track user sign-in
   * @param {string} token - Clerk JWT token
   */
  trackSignIn: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/signin/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to track sign-in");
      }

      return await response.json();
    } catch (error) {
      console.error("Track sign-in error:", error);
      throw error;
    }
  },
};

export default apiService;
