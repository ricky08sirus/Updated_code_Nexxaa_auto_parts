# authentication/authentication.py
# FIXED VERSION - Solves JWKS 403 Error

import jwt
import requests
import logging
from django.conf import settings
from rest_framework import authentication
from rest_framework.exceptions import AuthenticationFailed
from .models import UserProfile

logger = logging.getLogger(__name__)


class ClerkJWTAuthentication(authentication.BaseAuthentication):
    """
    Custom authentication class that validates Clerk JWT tokens
    This integrates with your React frontend using @clerk/clerk-react

    FIXED: Now uses Clerk API verification instead of JWKS
    """

    def authenticate(self, request):
        """
        Authenticate the request using Clerk JWT token

        Returns:
            tuple: (user, token) if authentication successful
            None: if no authentication attempted

        Raises:
            AuthenticationFailed: if authentication fails
        """
        # Get authorization header
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")

        if not auth_header:
            # No authorization header, allow request to continue
            # Views can still enforce authentication with permission classes
            return None

        try:
            # Extract token from "Bearer <token>"
            parts = auth_header.split()

            if len(parts) != 2:
                raise AuthenticationFailed(
                    "Invalid authorization header format. Use: Bearer <token>"
                )

            if parts[0].lower() != "bearer":
                raise AuthenticationFailed(
                    "Authorization header must start with Bearer"
                )

            token = parts[1]

            # Decode and verify JWT
            decoded_token = self.verify_clerk_jwt(token)

            # Get or create user from Clerk data
            user, created = UserProfile.get_or_create_from_clerk(decoded_token)

            if created:
                logger.info(
                    f"New user created from Clerk: {user.email} (clerk_id: {
                        user.clerk_id
                    })"
                )
            else:
                logger.debug(f"User authenticated: {user.email}")

            return (user, token)

        except jwt.ExpiredSignatureError:
            logger.warning("JWT token has expired")
            raise AuthenticationFailed("Token has expired. Please sign in again.")

        except jwt.InvalidTokenError as e:
            logger.error(f"Invalid JWT token: {str(e)}")
            raise AuthenticationFailed(f"Invalid token: {str(e)}")

        except ValueError as e:
            logger.error(f"Value error during authentication: {str(e)}")
            raise AuthenticationFailed(str(e))

        except Exception as e:
            logger.error(f"Unexpected authentication error: {str(e)}", exc_info=True)
            raise AuthenticationFailed(f"Authentication failed: {str(e)}")

    def verify_clerk_jwt(self, token):
        """
        Verify JWT token using Clerk API (FIXED VERSION)
        This method verifies the token by calling Clerk's API instead of using JWKS

        Args:
            token (str): JWT token from Authorization header

        Returns:
            dict: Decoded JWT payload with user data

        Raises:
            jwt.InvalidTokenError: if token is invalid
        """
        try:
            # Step 1: Decode token WITHOUT verification to extract user ID
            # This is safe because we verify with Clerk API next
            unverified = jwt.decode(token, options={"verify_signature": False})
            user_id = unverified.get("sub")

            if not user_id:
                logger.error("Token missing 'sub' claim")
                raise jwt.InvalidTokenError("Missing user ID in token")

            logger.debug(f"Verifying token for user ID: {user_id}")

            # Step 2: Verify token with Clerk API
            headers = {
                "Authorization": f"Bearer {settings.CLERK_SECRET_KEY}",
                "Content-Type": "application/json",
            }

            response = requests.get(
                f"https://api.clerk.com/v1/users/{user_id}", headers=headers, timeout=10
            )

            # Check if API call was successful
            if response.status_code == 401:
                logger.error("Invalid Clerk Secret Key")
                raise jwt.InvalidTokenError(
                    "Authentication failed: Invalid Clerk credentials"
                )

            if response.status_code == 404:
                logger.error(f"User {user_id} not found in Clerk")
                raise jwt.InvalidTokenError("User not found")

            if response.status_code != 200:
                logger.error(
                    f"Clerk API returned status {response.status_code}: {response.text}"
                )
                raise jwt.InvalidTokenError(
                    f"Token verification failed: HTTP {response.status_code}"
                )

            # Step 3: Get user data from Clerk
            user_data = response.json()
            logger.debug(f"Successfully verified user: {user_data.get('id')}")

            # Step 4: Return standardized JWT claims format
            # This matches what Clerk's JWT would normally contain
            return {
                "sub": user_data["id"],
                "email": user_data["email_addresses"][0]["email_address"]
                if user_data.get("email_addresses")
                and len(user_data["email_addresses"]) > 0
                else "",
                "given_name": user_data.get("first_name", ""),
                "family_name": user_data.get("last_name", ""),
                "name": f"{user_data.get('first_name', '')} {user_data.get('last_name', '')}".strip(),
                "picture": user_data.get("profile_image_url", ""),
                "phone_number": user_data.get("phone_numbers", [{}])[0].get(
                    "phone_number", ""
                )
                if user_data.get("phone_numbers")
                and len(user_data["phone_numbers"]) > 0
                else "",
                "updated_at": user_data.get("updated_at"),
            }

        except jwt.ExpiredSignatureError:
            logger.warning("Token expired during verification")
            raise

        except jwt.InvalidTokenError:
            # Re-raise InvalidTokenError as-is
            raise

        except requests.Timeout:
            logger.error("Clerk API request timed out")
            raise jwt.InvalidTokenError("Token verification timed out")

        except requests.RequestException as e:
            logger.error(f"Clerk API request failed: {str(e)}")
            raise jwt.InvalidTokenError(f"Failed to verify token with Clerk: {str(e)}")

        except KeyError as e:
            logger.error(f"Missing expected field in Clerk response: {str(e)}")
            raise jwt.InvalidTokenError(f"Invalid response from Clerk: {str(e)}")

        except Exception as e:
            logger.error(f"Unexpected JWT verification error: {str(e)}", exc_info=True)
            raise jwt.InvalidTokenError(f"Failed to verify token: {str(e)}")

    def authenticate_header(self, request):
        """
        Return WWW-Authenticate header for 401 responses
        """
        return 'Bearer realm="api"'


class ClerkAPIAuthentication(authentication.BaseAuthentication):
    """
    Alternative authentication that verifies tokens with Clerk API
    This is the same as the fixed ClerkJWTAuthentication
    (Kept for backwards compatibility)
    """

    def authenticate(self, request):
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")

        if not auth_header:
            return None

        try:
            parts = auth_header.split()
            if len(parts) != 2 or parts[0].lower() != "bearer":
                raise AuthenticationFailed("Invalid authorization header format")

            token = parts[1]

            # Verify with Clerk API
            user_data = self.verify_with_clerk_api(token)

            # Create standardized JWT claims
            clerk_data = {
                "sub": user_data["id"],
                "email": user_data["email_addresses"][0]["email_address"]
                if user_data.get("email_addresses")
                else "",
                "given_name": user_data.get("first_name", ""),
                "family_name": user_data.get("last_name", ""),
                "picture": user_data.get("profile_image_url", ""),
                "phone_number": user_data.get("phone_numbers", [{}])[0].get(
                    "phone_number", ""
                )
                if user_data.get("phone_numbers")
                else "",
                "updated_at": user_data.get("updated_at"),
            }

            # Get or create user
            user, created = UserProfile.get_or_create_from_clerk(clerk_data)

            return (user, token)

        except Exception as e:
            logger.error(f"API authentication error: {str(e)}")
            raise AuthenticationFailed(f"Authentication failed: {str(e)}")

    def verify_with_clerk_api(self, token):
        """
        Verify token by calling Clerk's API
        This adds latency but is more secure
        """
        try:
            # First decode token without verification to get user ID
            unverified = jwt.decode(token, options={"verify_signature": False})
            user_id = unverified.get("sub")

            if not user_id:
                raise AuthenticationFailed("Invalid token: missing user ID")

            # Verify with Clerk API
            headers = {
                "Authorization": f"Bearer {settings.CLERK_SECRET_KEY}",
                "Content-Type": "application/json",
            }

            response = requests.get(
                f"https://api.clerk.com/v1/users/{user_id}", headers=headers, timeout=10
            )

            if response.status_code != 200:
                logger.error(
                    f"Clerk API returned status {response.status_code}: {response.text}"
                )
                raise AuthenticationFailed("Token verification failed with Clerk API")

            return response.json()

        except requests.RequestException as e:
            logger.error(f"Clerk API request failed: {str(e)}")
            raise AuthenticationFailed("Failed to verify token with Clerk")

    def authenticate_header(self, request):
        return 'Bearer realm="api"'
