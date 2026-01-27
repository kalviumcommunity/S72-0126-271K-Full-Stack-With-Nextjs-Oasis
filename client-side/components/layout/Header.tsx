import React from 'react';
import Link from 'next/link';

export const Header: React.FC = () => {
    return (
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6 sticky top-0 z-10">
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-xl font-bold text-blue-600">
                        OASIS
                    </Link>
                </div>

                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
                    <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
                        Dashboard
                    </Link>
                    <Link href="/courses" className="hover:text-blue-600 transition-colors">
                        Courses
                    </Link>
                    <Link href="/auth/login" className="hover:text-blue-600 transition-colors">
                        Login
                    </Link>
                </nav>
            </div>
        </header>
    );
};

// Temp simple button for header to avoid circular dependency before barrel export
const Button = ({ children, variant, size, ...props }: any) => (
    <button className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700" {...props}>
        {children}
    </button>
);
