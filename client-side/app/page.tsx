"use client";

import React, { memo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUI } from "@/hooks/useUI";
import { Button, Card, InputField } from "@/components";

/**
 * Notification Component
 * Displays toast notifications with type-based styling
 */
const NotificationToast = memo(
  ({ notification, onRemove }: {
    notification: { id: string; message: string; type: "success" | "error" | "info" };
    onRemove: (id: string) => void;
  }) => {
    const bgClass = {
      success: "bg-green-100 border-green-500",
      error: "bg-red-100 border-red-500",
      info: "bg-blue-100 border-blue-500",
    }[notification.type];

    const textClass = {
      success: "text-green-800",
      error: "text-red-800",
      info: "text-blue-800",
    }[notification.type];

    return (
      <div className={`${bgClass} ${textClass} border-l-4 p-4 mb-3 rounded flex justify-between items-center`}>
        <span>{notification.message}</span>
        <button
          onClick={() => onRemove(notification.id)}
          className="ml-4 font-bold hover:opacity-70"
        >
          ✕
        </button>
      </div>
    );
  }
);

NotificationToast.displayName = "NotificationToast";

/**
 * Auth Section Component
 * Demonstrates authentication state management
 */
const AuthSection = memo(() => {
  const { user, isAuthenticated, isLoading, error, login, logout, clearError } = useAuth();
  const [formData, setFormData] = useState({ username: "", email: "" });
  const { addNotification } = useUI();

  const handleLogin = async () => {
    try {
      await login(formData.username, formData.email);
      addNotification(`Welcome, ${formData.username}!`, "success");
      setFormData({ username: "", email: "" });
    } catch (err) {
      addNotification("Login failed", "error");
    }
  };

  const handleLogout = () => {
    logout();
    addNotification("You have been logged out", "info");
  };

  return (
    <Card className="mb-6 bg-blue-50 dark:bg-blue-900 border-none">
      <h2 className="text-2xl font-bold mb-4 text-blue-900 dark:text-blue-100">
        🔐 Authentication State
      </h2>

      {/* Error handling ... */}

      <div className="space-y-3">
        {isAuthenticated ? (
          <>
            {/* User Info ... */}
            <Button
              variant="danger"
              fullWidth
              onClick={handleLogout}
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <InputField
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
            <InputField
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Button
              variant="primary" // Assuming green variant existed but mapped to primary/danger for now, or add success variant. 
              // For consistency let's use primary (blue) or update Button.tsx. 
              // The original was green. Let's use primary for now.
              fullWidth
              onClick={handleLogin}
              disabled={isLoading || !formData.username || !formData.email}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-2">
              Try: username="KalviumUser", email="user@kalvium.com"
            </p>
          </>
        )}
      </div>
    </Card>
  );
});

AuthSection.displayName = "AuthSection";

/**
 * UI Controls Section Component
 * Demonstrates theme and sidebar state management
 */
const UIControlsSection = memo(() => {
  const { theme, toggleTheme, isDarkMode, sidebarOpen, toggleSidebar, openSidebar, closeSidebar } = useUI();
  const { addNotification } = useUI();

  return (
    <div className="p-6 bg-purple-50 dark:bg-purple-900 rounded-lg mb-6">
      <h2 className="text-2xl font-bold mb-4 text-purple-900 dark:text-purple-100">
        🎨 UI Controls & State
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Theme Section */}
        <div className="bg-white dark:bg-slate-700 p-4 rounded">
          <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Theme</h3>
          <div className="mb-3">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Current: <span className="font-bold capitalize">{theme}</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isDarkMode ? "🌙 Dark Mode Active" : "☀️ Light Mode Active"}
            </p>
          </div>
          <button
            onClick={() => {
              toggleTheme();
              addNotification(`Switched to ${theme === "light" ? "dark" : "light"} mode`, "info");
            }}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded transition"
          >
            Toggle Theme
          </button>
        </div>

        {/* Sidebar Section */}
        <div className="bg-white dark:bg-slate-700 p-4 rounded">
          <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Sidebar</h3>
          <div className="mb-3">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Status: <span className="font-bold">{sidebarOpen ? "Open" : "Closed"}</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {sidebarOpen ? "📂 Sidebar is visible" : "📂 Sidebar is hidden"}
            </p>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => {
                toggleSidebar();
                addNotification(`Sidebar ${sidebarOpen ? "closed" : "opened"}`, "info");
              }}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded transition"
            >
              Toggle Sidebar
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  openSidebar();
                  addNotification("Sidebar opened", "info");
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded transition text-sm"
              >
                Open
              </button>
              <button
                onClick={() => {
                  closeSidebar();
                  addNotification("Sidebar closed", "info");
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-3 rounded transition text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

UIControlsSection.displayName = "UIControlsSection";

/**
 * Main Page Component
 * Demonstrates complete Context API and custom hooks usage
 */
export default function Home() {
  const { theme } = useUI();
  const { notifications, removeNotification } = useUI();

  return (
    <main
      className={`min-h-screen p-6 ${theme === "dark"
        ? "bg-gradient-to-br from-slate-900 to-slate-800 text-white"
        : "bg-gradient-to-br from-slate-50 to-slate-100 text-black"
        }`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">📱 Global State Management</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Using React Context API & Custom Hooks for centralized state
          </p>
          <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 rounded text-sm">
            💡 <strong>Tip:</strong> Open your browser console to see state transitions logged in real-time.
          </div>
        </div>

        {/* Notification Toast Container */}
        {notifications.length > 0 && (
          <div className="fixed top-4 right-4 max-w-sm z-50">
            {notifications.map((notification) => (
              <NotificationToast
                key={notification.id}
                notification={notification}
                onRemove={removeNotification}
              />
            ))}
          </div>
        )}

        {/* Auth Section */}
        <AuthSection />

        {/* UI Controls Section */}
        <UIControlsSection />

        {/* Info Section */}
        <div className="p-6 bg-green-50 dark:bg-green-900 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-green-900 dark:text-green-100">
            ℹ️ How It Works
          </h2>
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <div className="bg-white dark:bg-slate-700 p-4 rounded">
              <h3 className="font-bold mb-2">🏗️ Architecture</h3>
              <p>
                <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-xs">AuthContext</code> stores user
                state globally, while{" "}
                <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-xs">UIContext</code> manages theme
                and UI state. Custom hooks{" "}
                <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-xs">useAuth()</code> and{" "}
                <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-xs">useUI()</code> provide clean
                interfaces to access this state.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-700 p-4 rounded">
              <h3 className="font-bold mb-2">🔄 Data Flow</h3>
              <p>
                Components use hooks to access state → Hooks consume context → Context provides centralized state →
                State updates trigger re-renders in subscribed components.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-700 p-4 rounded">
              <h3 className="font-bold mb-2">✅ No Prop Drilling</h3>
              <p>
                Previously, you'd pass props through multiple levels. Now any component can call{" "}
                <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-xs">useAuth()</code> directly to
                access authentication state.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
