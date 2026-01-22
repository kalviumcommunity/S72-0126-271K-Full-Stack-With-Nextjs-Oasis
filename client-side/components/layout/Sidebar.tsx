import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Sidebar: React.FC = () => {
    // Use a hook to get current path if needed for active state
    // const pathname = usePathname(); // Requires 'use client' if used

    const links = [
        { label: 'Overview', href: '/dashboard' },
        { label: 'My Courses', href: '/dashboard/courses' },
        { label: 'Assignments', href: '/dashboard/assignments' },
        { label: 'Settings', href: '/settings' },
    ];

    return (
        <aside className="w-64 bg-gray-50 border-r border-gray-200 min-h-[calc(100vh-4rem)] hidden md:block">
            <nav className="p-4 space-y-2">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="block px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>
        </aside>
    );
};
