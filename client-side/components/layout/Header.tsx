import React from 'react';
import Link from 'next/link';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="h-16 px-6 flex items-center justify-between max-w-7xl mx-auto">
        
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-blue-600 hover:opacity-90 transition"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white text-lg">
            O
          </span>
          OASIS
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <Link
            href="/dashboard"
            className="relative hover:text-blue-600 transition after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-blue-600 hover:after:w-full after:transition-all"
          >
            Dashboard
          </Link>

          <Link
            href="/courses"
            className="relative hover:text-blue-600 transition after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-blue-600 hover:after:w-full after:transition-all"
          >
            Courses
          </Link>

          <Link href="/auth/login">
            <Button>Login</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
};

// Temp simple button for header
const Button = ({ children, ...props }: any) => (
  <button
    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-700 hover:shadow transition-all"
    {...props}
  >
    {children}
  </button>
);
