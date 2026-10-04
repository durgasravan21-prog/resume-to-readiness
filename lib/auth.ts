import { createContext, useContext, useEffect, useState } from 'react';

export type UserRole = 'student' | 'coordinator';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  rollNumber?: string;
  degree?: string;
  branch?: string;
  graduationYear?: string;
  cgpa?: string;
  achievements?: string[];
  collegeName?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  dob?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  onboardingCompleted?: boolean;
}

const DEFAULT_STUDENT: UserProfile = {
  id: 'usr_student_01',
  name: 'Ananya Reddy',
  email: 'ananya.reddy@college.edu',
  role: 'student',
  rollNumber: '2021BCS0089',
  degree: 'B.Tech',
  branch: 'Computer Science & Engineering',
  graduationYear: '2025',
  cgpa: '8.74',
  collegeName: 'National Institute of Engineering',
  avatarUrl: 'https://lh3.googleusercontent.com/aida/AEtjO1WdKXqNRspbpeyaqj--Djbz-rUwt4twHbg-W0QFpJL5QjyYt80ttJsTLkovyDI_ENraMh-GwTB4izML4KQkzNUdTqtGYnClifUTgkIWVQbauT_Ln6m6lStaoBT1PxR4awTDClw2aidI0t7lohoqfs3mb3gDJ3wLwrsvM5M9DvcfHmijKNWVlwFPvx7IMB1UoIr84vfa-IhHwuM80XVgDnVMp0dwmRDtuxiMc2mC4jJ3ax7s_N6ynozDxW8',
};

const DEFAULT_COORDINATOR: UserProfile = {
  id: 'usr_coord_01',
  name: 'Prof. Ravi Sharma',
  email: 'ravi.sharma@college.edu',
  role: 'coordinator',
  collegeName: 'National Institute of Engineering',
  avatarUrl: 'https://lh3.googleusercontent.com/aida/AEtjO1XHfJAfdgb2cpVMwC7Ri3nKx-3OgYJShGHSYskEexfzhfcT1m2UaYeFrAaKj37Hk0_MQ002m_7OQr8gFySH1RWswifDSxA14Yo0dY3k6De1G5wE4mm407djRkw2j3YhhjUtNnNAGQMcWzcAbH6A-LuMC0RtXYNAYg1XOPQ4QdFRLRHvJ_WXhO0Y_QOHCCt6g3hPkVgc060dwPqEE_qKeodtUITcW-IfB0Oy10wg2AAta8yCRNri7HZnfsE',
};

const AUTH_STORAGE_KEY = 'readiness_auth_session';

export function getSession(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSession(user: UserProfile) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    // Also set cookie for middleware checks
    document.cookie = `readiness_role=${user.role}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `readiness_user_id=${user.id}; path=/; max-age=604800; SameSite=Lax`;
  }
}

export function clearSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('readiness_user');
    sessionStorage.clear();
    document.cookie = 'readiness_role=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'readiness_user_id=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'readiness_onboarding_completed=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}

export async function signOutUser() {
  if (typeof window !== 'undefined') {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
    } catch (e) {
      console.warn('Signout API call notice:', e);
    }
    clearSession();
    // Replace history entry so pressing browser Back cannot return to protected session
    window.location.replace('/login');
  }
}

export { DEFAULT_STUDENT, DEFAULT_COORDINATOR };
