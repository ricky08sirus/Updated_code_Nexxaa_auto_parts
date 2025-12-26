/**
 * Authentication helper functions for Clerk (v4+)
 */

import { useAuth } from "@clerk/clerk-react";

/**
 * Custom hook: Returns functions for token + auth helpers
 */
export const useClerkAuth = () => {
  const { getToken, isSignedIn } = useAuth();

  /**
   * Get Clerk token (session token)
   * @returns {Promise<string>} JWT token
   */
  const fetchToken = async () => {
    try {
      const token = await getToken(); // no user.getToken()
      return token;
    } catch (error) {
      console.error("Error getting token:", error);
      throw error;
    }
  };

  /**
   * Check if the user is authenticated
   * @returns {boolean}
   */
  const isAuthenticated = () => {
    return isSignedIn;
  };

  /**
   * Handle authentication errors
   * @param {Error} error - Error object
   */
  const handleAuthError = (error) => {
    console.error("Authentication error:", error);

    const msg = error?.message?.toLowerCase() || "";

    if (msg.includes("401")) {
      return "Your session has expired. Please sign in again.";
    }
    if (msg.includes("403")) {
      return "You do not have permission to access this resource.";
    }
    if (msg.includes("network")) {
      return "Network error. Please check your connection.";
    }

    return "An unknown error occurred. Please try again.";
  };

  return {
    fetchToken,
    isAuthenticated,
    handleAuthError,
  };
};
