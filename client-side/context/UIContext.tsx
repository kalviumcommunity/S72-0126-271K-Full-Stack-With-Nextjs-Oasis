"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";

/**
 * UIContext Type Definition
 * Defines the shape of UI state (theme, sidebar, notifications, etc.)
 */
export interface UIContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  notifications: Array<{ id: string; message: string; type: "success" | "error" | "info" }>;
  addNotification: (message: string, type: "success" | "error" | "info") => void;
  removeNotification: (id: string) => void;
}

/**
 * Create the UI Context
 * This will be the centralized store for UI state across the app
 */
const UIContext = createContext<UIContextType | undefined>(undefined);

/**
 * UIProvider Component
 * Wraps the application to provide UI state globally
 * Manages theme, sidebar visibility, and notifications
 *
 * @param children - React components to wrap with UI context
 */
export function UIProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<
    Array<{ id: string; message: string; type: "success" | "error" | "info" }>
  >([]);

  /**
   * Toggle between light and dark theme
   * This affects the entire application visually
   */
  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const newTheme = prev === "light" ? "dark" : "light";
      console.log(`🎨 Theme toggled to: ${newTheme}`);
      // In production, persist to localStorage
      localStorage.setItem("theme", newTheme);
      return newTheme;
    });
  }, []);

  /**
   * Toggle sidebar visibility
   * Updates the sidebar state for responsive navigation
   */
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => {
      const newState = !prev;
      console.log(`📱 Sidebar ${newState ? "opened" : "closed"}`);
      return newState;
    });
  }, []);

  /**
   * Manually set sidebar state
   * Allows controlled opening/closing
   */
  const setSidebarOpenManually = useCallback((open: boolean) => {
    setSidebarOpen(open);
    console.log(`📱 Sidebar set to: ${open ? "open" : "closed"}`);
  }, []);

  /**
   * Add notification to queue
   * Notifications appear and auto-dismiss after 4 seconds
   */
  const addNotification = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      const id = Math.random().toString(36).substr(2, 9);
      setNotifications((prev) => [...prev, { id, message, type }]);
      console.log(`🔔 Notification (${type}): ${message}`);

      // Auto-dismiss after 4 seconds
      setTimeout(() => {
        removeNotification(id);
      }, 4000);
    },
    []
  );

  /**
   * Remove notification by ID
   */
  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const value: UIContextType = {
    theme,
    toggleTheme,
    sidebarOpen,
    toggleSidebar,
    setSidebarOpen: setSidebarOpenManually,
    notifications,
    addNotification,
    removeNotification,
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
}

/**
 * useUIContext Hook
 * Internal hook to access UI context
 * Throws error if used outside UIProvider
 *
 * @returns UIContextType
 */
export function useUIContext(): UIContextType {
  const context = useContext(UIContext);

  if (!context) {
    throw new Error(
      "useUIContext must be used within a UIProvider. " +
      "Make sure your component is wrapped with <UIProvider> in the layout."
    );
  }

  return context;
}
