/**
 * useAuth Hook
 *
 * This is a custom hook that encapsulates authentication logic.
 * It provides a clean interface for components to access and manage auth state.
 * This abstracts away direct context consumption and makes the code more maintainable.
 *
 * Benefits:
 * - Single source of truth for auth logic
 * - Easier to test and mock
 * - Cleaner component code
 * - Easy to extend with additional methods
 *
 * Usage:
 * const { user, login, logout, isAuthenticated } = useAuth();
 */

import { useAuthContext } from "@/context/AuthContext";

export function useAuth() {
  const { user, isLoading, error, login, logout, clearError } = useAuthContext();

  return {
    // State
    user,
    isAuthenticated: !!user,
    isLoading,
    error,

    // Methods
    login,
    logout,
    clearError,

    // Derived state
    userId: user?.id,
    username: user?.username,
    email: user?.email,
  };
}

export type UseAuthReturn = ReturnType<typeof useAuth>;
