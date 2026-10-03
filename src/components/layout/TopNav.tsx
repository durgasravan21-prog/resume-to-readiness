'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getSession, saveSession, clearSession, UserProfile } from '@/lib/auth';

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session) {
      setUser(session);
    } else {
      // Default to student if inspecting directly
      setUser({
        id: 'usr_student_01',
        name: 'Ananya Reddy',
        email: 'ananya.reddy@college.edu',
        role: 'student',
        rollNumber: '2021BCS0089',
        collegeName: 'National Institute of Engineering',
        avatarUrl: 'https://lh3.googleusercontent.com/aida/AEtjO1WdKXqNRspbpeyaqj--Djbz-rUwt4twHbg-W0QFpJL5QjyYt80ttJsTLkovyDI_ENraMh-GwTB4izML4KQkzNUdTqtGYnClifUTgkIWVQbauT_Ln6m6lStaoBT1PxR4awTDClw2aidI0t7lohoqfs3mb3gDJ3wLwrsvM5M9DvcfHmijKNWVlwFPvx7IMB1UoIr84vfa-IhHwuM80XVgDnVMp0dwmRDtuxiMc2mC4jJ3ax7s_N6ynozDxW8'
      });
    }
  }, []);

  const handleSignOut = () => {
    clearSession();
    router.push('/');
  };

  const isCoordinator = user?.role === 'coordinator' || pathname.startsWith('/tpc') || pathname.startsWith('/mentor');

  const handleToggleRole = () => {
    setMenuOpen(false);
    const targetRole = isCoordinator ? 'student' : 'coordinator';
    
    // Set cookie for middleware
    document.cookie = `readiness_role=${targetRole}; path=/; max-age=2592000; SameSite=Lax`;
    
    // Update local storage session
    if (user) {
      const updated = { ...user, role: targetRole as any };
      saveSession(updated);
      setUser(updated);
    }
    
    // Full redirect to initialize destination view
    window.location.href = targetRole === 'coordinator' ? '/tpc' : '/home';
  };

  const navLinks = isCoordinator
    ? [
        { label: 'Overview', href: '/tpc' },
        { label: 'Students', href: '/tpc/students' },
        { label: 'Mentorship', href: '/mentor' },
        { label: 'Reports', href: '/tpc/reports' },
        { label: 'Settings', href: '/tpc/settings' },
      ]
    : [
        { label: 'Home', href: '/home' },
        { label: 'My Analyses', href: '/analyses' },
        { label: 'Roadmap', href: '/analyses/default/roadmap' },
        { label: 'Mentor', href: '/analyses/default/mentor' },
        { label: 'Settings', href: '/settings' },
      ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-md border-b border-surface-variant">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <Link href={isCoordinator ? '/tpc' : '/home'} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center font-display font-bold text-base">
              R
            </div>
            <span className="font-headline text-headline-sm text-primary tracking-tight font-semibold">
              Readiness
            </span>
          </Link>
          
          {isCoordinator && (
            <div className="hidden lg:flex items-center gap-2.5 ml-4 pl-4 border-l border-surface-variant text-xs">
              <span className="font-mono uppercase px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface border border-surface-variant">
                Placement Cell
              </span>
              <span className="text-on-surface-variant font-mono">Institutional Portal • AY 2024-25</span>
            </div>
          )}
        </div>

        {/* Center Nav Links (Student) */}
        {!isCoordinator && (
          <nav className="hidden md:flex items-center gap-6 h-full">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/home' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`h-full flex items-center transition-colors text-sm font-medium border-b-2 pt-0.5 ${
                    isActive
                      ? 'border-primary text-primary font-semibold'
                      : 'border-transparent text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* User Profile & Avatar Menu */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="font-title text-sm text-on-surface leading-tight font-semibold">
              {user?.name || 'User'}
            </span>
            <span className="font-mono text-[11px] text-on-surface-variant">
              {isCoordinator ? 'TPC Incharge' : (user?.rollNumber ? `Candidate #${user.rollNumber}` : 'Student')}
            </span>
          </div>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="relative flex items-center justify-center p-0.5 rounded-full border border-surface-variant hover:ring-2 hover:ring-primary/20 transition-all focus:outline-none"
              title="Account options"
            >
              <img
                src={user?.avatarUrl || 'https://lh3.googleusercontent.com/aida/AEtjO1WdKXqNRspbpeyaqj--Djbz-rUwt4twHbg-W0QFpJL5QjyYt80ttJsTLkovyDI_ENraMh-GwTB4izML4KQkzNUdTqtGYnClifUTgkIWVQbauT_Ln6m6lStaoBT1PxR4awTDClw2aidI0t7lohoqfs3mb3gDJ3wLwrsvM5M9DvcfHmijKNWVlwFPvx7IMB1UoIr84vfa-IhHwuM80XVgDnVMp0dwmRDtuxiMc2mC4jJ3ax7s_N6ynozDxW8'}
                alt={user?.name || 'Profile'}
                className="w-8 h-8 rounded-full object-cover"
              />
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-surface-container-lowest border border-surface-container-highest rounded-xl shadow-lg p-2 z-50 text-xs"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <div className="p-2 border-b border-surface-container-highest mb-1">
                  <p className="font-semibold text-primary">{user?.name}</p>
                  <p className="font-mono text-on-surface-variant text-[10px] truncate">{user?.email}</p>
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-primary-container text-on-primary">
                    {user?.role}
                  </span>
                </div>

                <Link
                  href={isCoordinator ? '/tpc/settings' : '/settings'}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 w-full p-2 text-on-surface hover:bg-surface-container rounded-lg transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-[16px]">manage_accounts</span>
                  <span>Profile & Settings</span>
                </Link>

                <button
                  onClick={handleToggleRole}
                  className="flex items-center gap-2 w-full p-2 text-on-surface hover:bg-surface-container rounded-lg transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                  <span>Switch to {isCoordinator ? 'Student View' : 'Coordinator View'}</span>
                </button>

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full p-2 text-error hover:bg-error-container/30 rounded-lg transition-colors text-left font-medium mt-1 border-t border-surface-container"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
