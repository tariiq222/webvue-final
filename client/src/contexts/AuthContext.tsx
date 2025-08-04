
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { login as apiLogin, register as apiRegister } from "../api/auth";
import api from "../api/api";

type AuthContextType = {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  user: any;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

// Helper function to check if JWT token is valid (not expired)
const isTokenValid = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch {
    return false;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch user data from server
  const fetchUserData = async (token: string) => {
    try {
      const response = await api.get('/api/auth/me');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      return null;
    }
  };

  // Check authentication status on mount
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      if (token && isTokenValid(token)) {
        // Token is valid, try to fetch user data
        const userData = await fetchUserData(token);
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // Failed to fetch user data, clear tokens
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        // Token is invalid or doesn't exist, clear everything
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setIsAuthenticated(false);
        setUser(null);
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiLogin(email, password);
      console.log('Login response from API:', response); // Debug log

      // Now response should be the data object directly from api/auth.ts
      const accessToken = response?.token || response?.accessToken;
      const refreshToken = response?.refreshToken;
      const user = response?.user;

      console.log('Extracted tokens:', {
        accessToken: accessToken ? 'Present' : 'Missing',
        refreshToken: refreshToken ? 'Present' : 'Missing',
        user: user ? 'Present' : 'Missing'
      });

      if (refreshToken && accessToken) {
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("accessToken", accessToken);
        setUser(user); // Store user data
        setIsAuthenticated(true);
        console.log('✅ Login successful - tokens stored');
        console.log('✅ Access Token:', accessToken.substring(0, 20) + '...');
        console.log('✅ Refresh Token:', refreshToken.substring(0, 20) + '...');
      } else {
        console.error('❌ Invalid response structure:', response);
        console.error('❌ Expected: token/accessToken and refreshToken');
        console.error('❌ Token check:', {
          hasToken: !!response?.token,
          hasAccessToken: !!response?.accessToken,
          hasRefreshToken: !!response?.refreshToken,
          hasUser: !!response?.user,
          responseKeys: Object.keys(response || {})
        });
        throw new Error('Login failed - no tokens received');
      }
    } catch (error: any) {
      console.error('Login error in AuthContext:', error);
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("accessToken");
      setUser(null);
      setIsAuthenticated(false);
      throw error; // Re-throw the original error
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const response = await apiRegister(email, password);
      // Registration successful, but user still needs to login
      console.log('Registration successful:', response);
    } catch (error: any) {
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("accessToken");
      setIsAuthenticated(false);
      throw new Error(error?.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("accessToken");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, register, logout, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
