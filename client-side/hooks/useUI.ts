/**
 * useUI Hook
 *
 * This is a custom hook that encapsulates UI state logic.
 * It provides a clean interface for components to access theme, sidebar, and notifications.
 * This abstracts away direct context consumption and makes the code more maintainable.
 *
 * Benefits:
 * - Single source of truth for UI logic
 * - Easier to test and mock
 * - Cleaner component code
 * - Easy to extend with new UI features
 *
 * Usage:
 * const { theme, toggleTheme, sidebarOpen, toggleSidebar } = useUI();
 */

import { useUIContext } from "@/context/UIContext";

export function useUI() {
  const {
    theme,
    toggleTheme,
    sidebarOpen,
    toggleSidebar,
    setSidebarOpen,
    notifications,
    addNotification,
    removeNotification,
  } = useUIContext();

  return {
    // Theme
    theme,
    toggleTheme,
    isDarkMode: theme === "dark",
    isLightMode: theme === "light",

    // Sidebar
    sidebarOpen,
    toggleSidebar,
    setSidebarOpen,
    openSidebar: () => setSidebarOpen(true),
    closeSidebar: () => setSidebarOpen(false),

    // Notifications
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications: () => {
      notifications.forEach((n) => removeNotification(n.id));
    },
  };
}

export type UseUIReturn = ReturnType<typeof useUI>;
