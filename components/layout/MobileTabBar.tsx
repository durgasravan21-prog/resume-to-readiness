'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileTabBar({ role = 'student' }: { role?: 'student' | 'coordinator' }) {
  const pathname = usePathname();

  const studentTabs = [
    { label: 'Home', href: '/home', icon: 'home' },
    { label: 'Analyses', href: '/analyses', icon: 'analytics' },
    { label: 'Roadmap', href: '/analyses/default/roadmap', icon: 'route' },
    { label: 'Mentor', href: '/analyses/default/mentor', icon: 'forum' },
  ];

  const coordinatorTabs = [
    { label: 'Overview', href: '/tpc', icon: 'grid_view' },
    { label: 'Students', href: '/tpc/students', icon: 'school' },
    { label: 'Roles', href: '/tpc/roles', icon: 'work' },
    { label: 'Reports', href: '/tpc/reports', icon: 'assignment' },
  ];

  const tabs = role === 'coordinator' || pathname.startsWith('/tpc') ? coordinatorTabs : studentTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-surface-container-lowest/95 backdrop-blur-md border-t border-surface-variant z-50 flex items-center justify-around px-2 md:hidden">
      {tabs.map((tab) => {
        const isActive = tab.href === '/home' || tab.href === '/tpc'
          ? pathname === tab.href
          : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-lg transition-colors ${
              isActive
                ? 'text-primary font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-primary font-bold' : ''}`}>
              {tab.icon}
            </span>
            <span className="text-[10px] font-mono leading-none">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
