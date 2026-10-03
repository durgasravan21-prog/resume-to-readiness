'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ role }: { role?: 'coordinator' | 'student' } = {}) {
  const pathname = usePathname();

  const links = [
    { label: 'Overview', href: '/tpc', icon: 'grid_view' },
    { label: 'Students', href: '/tpc/students', icon: 'school' },
    { label: 'Roles', href: '/tpc/roles', icon: 'work_outline' },
    { label: 'Mentorship', href: '/mentor', icon: 'forum' },
    { label: 'Reports', href: '/tpc/reports', icon: 'analytics' },
    { label: 'Settings', href: '/tpc/settings', icon: 'settings' },
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-[240px] bg-surface-container-low border-r border-surface-variant z-40 flex flex-col justify-between p-4 hidden md:flex">
      <div className="flex flex-col gap-6">
        <div className="px-3 pt-2">
          <span className="font-mono text-xs uppercase text-outline tracking-wider font-semibold">
            Institutional Console
          </span>
        </div>
        
        <nav className="flex flex-col gap-1">
          {links.map((link) => {
            const isActive = link.href === '/tpc'
              ? pathname === '/tpc'
              : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors font-medium ${
                  isActive
                    ? 'bg-primary text-on-primary font-semibold shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* System Status Footnote */}
      <div className="p-3 bg-surface-container-lowest border border-surface-variant rounded-lg">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-xs text-on-surface">System Status</span>
          <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
        </div>
        <span className="font-mono text-[11px] text-on-surface-variant block">Sync: Active • v2.4</span>
      </div>
    </aside>
  );
}
