import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuth } from "../context/AuthContext";
import API_BASE_URL from "../services/api";

function Auth0Sync() {
  const { isAuthenticated, user } = useAuth0();
  const { token, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const syncGoogleUser = async () => {
      if (
        !isAuthenticated ||
        !user ||
        token ||
        sessionStorage.getItem("google_login_pending") !== "1"
      ) {
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/google`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            name: user.name || user.email,
            auth0_id: user.sub,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Google login failed");
        }

        login(data.access_token);

        sessionStorage.removeItem("google_login_pending");

        navigate("/");
      } catch (error) {
        console.error("Google backend login failed:", error);
      }
    };

    syncGoogleUser();
  }, [isAuthenticated, user, token, login, navigate]);

  return null;
}

export default Auth0Sync;