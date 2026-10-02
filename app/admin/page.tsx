'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import TopNav from '@/components/layout/TopNav';
import MobileTabBar from '@/components/layout/MobileTabBar';

interface InstitutionalSetting {
  key: string;
  label: string;
  value: string;
  description: string;
}

const DEFAULT_SETTINGS: InstitutionalSetting[] = [
  {
    key: 'allowed_domains',
    label: 'Authorized Campus Email Domains',
    value: 'nie.ac.in',
    description: 'Comma-separated institutional domains permitted for student and faculty authentication.',
  },
  {
    key: 'outstanding_threshold',
    label: 'Outstanding Candidate Threshold',
    value: '85',
    description: 'Minimum readiness diagnostic score to automatically qualify for direct TPC hiring partner spotlight.',
  },
  {
    key: 'max_flags',
    label: 'Maximum Roadmap Deadline Flags',
    value: '3',
    description: 'Number of missed milestone submissions before candidate placement status moves to suspended/terminated.',
  },
  {
    key: 'max_chances',
    label: 'Maximum Reinstatement Chances',
    value: '3',
    description: 'Maximum chances a placement coordinator can grant to a suspended candidate with recorded audit justification.',
  },
];

const MOCK_AUDIT_LOGS = [
  {
    id: 'aud_01',
    action: 'CHANCE_GRANTED',
    user: 'Prof. Ravi Sharma (TPC Coordinator)',
    target: 'Aarav Sundaram (4NI21CS042)',
    details: 'Reinstated candidate: Approved medical leave extension on sprint roadmap.',
    timestamp: 'Today, 02:40 PM',
  },
  {
    id: 'aud_02',
    action: 'TARGET_ROLE_CREATED',
    user: 'Placement Dean Office',
    target: 'role_jfd',
    details: 'Activated "Junior Frontend Developer" with Tier-1 Razorpay benchmark.',
    timestamp: 'Today, 11:15 AM',
  },
  {
    id: 'aud_03',
    action: 'RESUME_INGESTED',
    user: 'Aarav Sundaram',
    target: 'res_77192',
    details: 'Verified text layer. Stripped 1 Aadhaar and 1 PAN occurrence before analysis.',
    timestamp: 'Yesterday, 04:30 PM',
  },
];

export default function AdminPage() {
  const [settings, setSettings] = useState<InstitutionalSetting[]>(DEFAULT_SETTINGS);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  const handleUpdateSetting = (key: string, newValue: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value: newValue } : s))
    );
    setSavedKey(key);
    setTimeout(() => setSavedKey(null), 2500);
  };

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col pb-20 md:pb-12">
      <TopNav />

      <main className="flex-1 w-full pt-16 bg-surface px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-[1300px] mx-auto w-full space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-variant">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant mb-1">
                <span>Placement Administration</span>
                <span>/</span>
                <span className="text-primary font-semibold">Institutional Governance</span>
              </div>
              <h1 className="font-headline text-2xl sm:text-3xl text-primary font-semibold tracking-tight">
                Readiness System Administration
              </h1>
              <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-0.5">
                Configure campus domain policies, diagnostic scoring thresholds, and review institutional compliance audit logs.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-[#E8F0EA] text-[#4F7A5A] font-mono text-xs font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#4F7A5A]"></span>
                <span>All Policies Enforced</span>
              </span>
            </div>
          </div>

          {/* Grid Layout: Settings + Audit Ledger */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Settings Left Column (7 Cols) */}
            <div className="lg:col-span-7 space-y-5">
              <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-6 shadow-sm space-y-5">
                <div>
                  <h2 className="font-headline text-lg font-semibold text-primary">
                    Policy Controls & Thresholds
                  </h2>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Modifications update real-time admission and diagnostic rules instantly.
                  </p>
                </div>

                <div className="space-y-4">
                  {settings.map((setting) => (
                    <div
                      key={setting.key}
                      className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <label className="font-headline text-xs font-semibold text-primary block">
                            {setting.label}
                          </label>
                          <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                            {setting.description}
                          </p>
                        </div>
                        {savedKey === setting.key && (
                          <span className="text-[10px] font-mono text-[#4F7A5A] font-semibold shrink-0">
                            Saved ✓
                          </span>
                        )}
                      </div>

                      <div className="pt-1 flex items-center gap-3">
                        <input
                          type="text"
                          value={setting.value}
                          onChange={(e) => handleUpdateSetting(setting.key, e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg border border-surface-container-highest bg-surface-container-lowest text-xs font-mono text-primary focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Audit Log Right Column (5 Cols) */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-surface-container">
                  <h2 className="font-headline text-sm font-semibold text-primary">
                    Institutional Audit Ledger
                  </h2>
                  <span className="font-mono text-[10px] uppercase text-outline">
                    Immutable
                  </span>
                </div>

                <div className="space-y-3">
                  {MOCK_AUDIT_LOGS.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-mono text-[10px]">
                        <span className="font-bold text-secondary">{log.action}</span>
                        <span className="text-outline">{log.timestamp}</span>
                      </div>
                      <p className="font-body text-on-surface text-xs leading-normal">
                        {log.details}
                      </p>
                      <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-on-surface-variant">
                        <span>Actor: {log.user}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MobileTabBar role="coordinator" />
    </div>
  );
}
