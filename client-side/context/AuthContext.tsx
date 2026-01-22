"use client";

import { createContext, useState, useContext, ReactNode, useCallback, useEffect } from "react";

/**
 * AuthContext Type Definition
 * Defines the shape of authentication state and methods
 */
export interface AuthContextType {
  user: { id: string; name: string; email: string } | null;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

/**
 * Create the Auth Context
 * This will be the centralized store for authentication state
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Component
 * Wraps the application to provide authentication state globally
 *
 * @param children - React components to wrap with auth context
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextType["user"]>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("authUser");
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  /**
   * Login handler
   * Calls backend API to authenticate user
   */
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      const { token, user: userData } = data;

      // Store token and user in localStorage
      localStorage.setItem("authToken", token);
      
      // Create user object from response
      const userObj = {
        id: userData.id.toString(),
        name: userData.name,
        email: userData.email,
      };
      
      localStorage.setItem("authUser", JSON.stringify(userObj));
      
      setToken(token);
      setUser(userObj);
      
      console.log(`✅ User logged in: ${email}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      console.error(`❌ Login error: ${errorMessage}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Signup handler
   * Calls backend API to register new user
   */
  const signup = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      console.log(`✅ User signed up: ${email}`);
      
      // Auto-login after signup
      await login(email, password);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Signup failed";
      setError(errorMessage);
      console.error(`❌ Signup error: ${errorMessage}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  /**
   * Logout handler
   * Clears user state and removes token
   */
  const logout = useCallback(() => {
    const currentUser = user?.name || "Unknown user";
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    console.log(`✅ ${currentUser} logged out`);
  }, [user?.name]);

  /**
   * Clear error state
   * Allows components to dismiss error messages
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);


  const value: AuthContextType = {
    user,
    token,
    isLoading,
    error,
    login,
    signup,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuthContext Hook
 * Internal hook to access auth context
 * Throws error if used outside AuthProvider
 *
 * @returns AuthContextType
 */
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuthContext must be used within an AuthProvider. " +
      "Make sure your component is wrapped with <AuthProvider> in the layout."
    );
  }

  return context;
}
