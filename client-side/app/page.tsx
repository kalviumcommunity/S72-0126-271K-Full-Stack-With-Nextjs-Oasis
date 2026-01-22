"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * Main Page Component
 * Shows dashboard when authenticated, redirects to login otherwise
 */
export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Welcome to OASIS</h1>
          <p className="text-xl text-gray-600 mb-8">Global State Management with Next.js & Context API</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <p className="text-gray-600 text-center mb-6">
            Sign in or create an account to get started
          </p>
          
          <div className="space-y-3">
            <Link 
              href="/auth/login"
              className="w-full block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition"
            >
              Sign In
            </Link>
            <Link 
              href="/auth/signup"
              className="w-full block text-center border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 px-4 rounded-lg transition"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show dashboard when authenticated
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome back to OASIS</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            Logout
          </button>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">🔐 Your Profile</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <span className="text-gray-600 font-medium">Name:</span>
              <span className="text-blue-600 font-bold text-lg">{user?.name}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
              <span className="text-gray-600 font-medium">Email:</span>
              <span className="text-indigo-600 font-bold">{user?.email}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <span className="text-gray-600 font-medium">User ID:</span>
              <span className="text-purple-600 font-bold">{user?.id}</span>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">ℹ️ Authentication Features</h2>
          <div className="space-y-4 text-gray-600">
            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
              <h3 className="font-bold text-green-900 mb-1">✅ JWT Authentication</h3>
              <p className="text-sm">Secure token-based authentication with 7-day expiration</p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <h3 className="font-bold text-blue-900 mb-1">🔒 Password Hashing</h3>
              <p className="text-sm">Passwords are hashed with bcrypt for maximum security</p>
            </div>
            
            <div className="p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-500">
              <h3 className="font-bold text-indigo-900 mb-1">💾 Session Persistence</h3>
              <p className="text-sm">Your session is saved in localStorage and persists across page reloads</p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
              <h3 className="font-bold text-purple-900 mb-1">🔄 Context API</h3>
              <p className="text-sm">Global state management using React Context API and custom hooks</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
