"use client";

import { createContext, useState, useContext, ReactNode, useCallback } from "react";

/**
 * AuthContext Type Definition
 * Defines the shape of authentication state and methods
 */
export interface AuthContextType {
  user: { id: string; username: string; email: string } | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, email: string) => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Login handler
   * Simulates authentication and sets user state
   * In production, this would call an API
   */
  const login = useCallback(async (username: string, email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Validation
      if (!username || !email) {
        throw new Error("Username and email are required");
      }

      if (!email.includes("@")) {
        throw new Error("Invalid email format");
      }

      // Set user state
      setUser({
        id: Math.random().toString(36).substr(2, 9),
        username,
        email,
      });

      console.log(`✅ User logged in: ${username} (${email})`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      console.error(`❌ Login error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout handler
   * Clears user state
   */
  const logout = useCallback(() => {
    const currentUser = user?.username || "Unknown user";
    setUser(null);
    setError(null);
    console.log(`✅ ${currentUser} logged out`);
  }, [user?.username]);

  /**
   * Clear error state
   * Allows components to dismiss error messages
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    login,
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
