'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/layout/TopNav';
import Sidebar from '@/components/layout/Sidebar';
import MobileTabBar from '@/components/layout/MobileTabBar';
import { getSession } from '@/lib/auth';

interface RoleBenchmark {
  id: string;
  title: string;
  category: string;
  companies?: string;
  skills: string[];
  benchmark_code?: string;
  census_count?: number;
  min_cgpa?: string;
  created_by?: string;
}

export default function CoordinatorRolesPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<RoleBenchmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const session = getSession();
    const cookieRole = typeof document !== 'undefined'
      ? document.cookie.split('; ').find(row => row.startsWith('readiness_role='))?.split('=')[1]
      : null;

    const effectiveRole = cookieRole || session?.role || 'student';

    if (effectiveRole !== 'coordinator' && effectiveRole !== 'admin') {
      const lastPath = typeof document !== 'undefined'
        ? document.cookie.split('; ').find(row => row.startsWith('readiness_last_student_path='))?.split('=')[1]
        : null;
      const target = (lastPath && lastPath.startsWith('/analyses'))
        ? `${lastPath}${lastPath.includes('?') ? '&' : '?'}restricted=tpc`
        : '/home?restricted=tpc';
      router.replace(target);
    }
  }, [router]);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Product Engineering');
  const [companies, setCompanies] = useState('');
  const [skillsStr, setSkillsStr] = useState('');
  const [minCgpa, setMinCgpa] = useState('7.0');
  const [benchmarkCode, setBenchmarkCode] = useState('Standard Syllabus 2025.1');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchRoles = () => {
    setLoading(true);
    fetch('/api/roles')
      .then((res) => res.json())
      .then((data) => {
        if (data.roles) setRoles(data.roles);
      })
      .catch((e) => console.warn('Could not fetch roles:', e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        category,
        companies: companies.trim() || 'Campus Placement Drive 2025',
        skills: skillsStr.split(',').map((s) => s.trim()).filter(Boolean),
        benchmark_code: benchmarkCode,
        min_cgpa: minCgpa,
        created_by: 'TPC Coordinator',
      };

      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload role.');
      }

      setShowAddModal(false);
      setTitle('');
      setCompanies('');
      setSkillsStr('');
      setMinCgpa('7.0');
      setToastMessage(`Role "${payload.title}" successfully uploaded & activated.`);
      setTimeout(() => setToastMessage(null), 3000);
      fetchRoles();
    } catch (err: any) {
      alert(err.message || 'Error creating role.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRole = async (roleId: string, roleTitle: string) => {
    if (!confirm(`Are you sure you want to remove the target role "${roleTitle}"? It will be removed from student view.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/roles?id=${roleId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete role');
      setRoles(prev => prev.filter(r => r.id !== roleId));
      setToastMessage(`Role "${roleTitle}" removed successfully.`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error deleting role');
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col pb-20 md:pb-12">
      <TopNav />
      <Sidebar />

      <div className="md:pl-[240px]">
        <main className="pt-16 bg-surface min-h-screen px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-[1300px] mx-auto w-full">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-surface-variant">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant mb-1">
                  <Link href="/tpc" className="hover:text-primary transition-colors">
                    Institutional Console
                  </Link>
                  <span>/</span>
                  <span className="text-primary font-semibold">Target Roles & Rubrics</span>
                </div>
                <h1 className="font-headline text-2xl sm:text-3xl text-primary font-semibold tracking-tight">
                  Placement Benchmark Roles
                </h1>
                <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-0.5">
                  Publish and manage placement tracks, required competencies, and minimum CGPA criteria for candidates.
                </p>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-colors shadow-sm self-start sm:self-auto"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Upload target role</span>
              </button>
            </div>

            {/* Roles Grid */}
            {loading ? (
              <div className="py-16 text-center text-xs font-mono text-on-surface-variant flex items-center justify-center gap-2">
                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                <span>Retrieving benchmark roles...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-variant shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[10px] uppercase text-secondary font-semibold">
                          {role.category}
                        </span>
                        <div className="flex items-center gap-2">
                          {role.min_cgpa && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-secondary-container/30 text-secondary font-semibold">
                              Min CGPA: {role.min_cgpa}
                            </span>
                          )}
                          <span className="font-mono text-[11px] text-outline">
                            {role.census_count ?? 0} mapped
                          </span>
                        </div>
                      </div>

                      <h3 className="font-headline text-lg font-semibold text-primary mb-1">
                        {role.title}
                      </h3>
                      <p className="font-body text-xs text-on-surface-variant mb-4">
                        Hiring Partners: <span className="text-on-surface font-medium">{role.companies || 'General Campus Drives'}</span>
                      </p>

                      <div className="space-y-1.5 mb-4">
                        <span className="font-mono text-[10px] uppercase text-outline font-semibold block">
                          Required Competencies
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {(role.skills || []).map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-0.5 rounded-md bg-surface-container font-mono text-[11px] text-primary"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-surface-container flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-outline">
                      <div className="flex items-center gap-2">
                        <span>Protocol: {role.benchmark_code || 'Standard'}</span>
                        <span className="text-[#4F7A5A] font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4F7A5A]"></span>
                          Active
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/analyses/new?roleId=${role.id}&roleTitle=${encodeURIComponent(role.title)}`}
                          className="px-2.5 py-1 rounded bg-surface-container-high hover:bg-surface-container-highest text-primary font-medium text-[11px] transition-colors"
                        >
                          Preview Diagnostic
                        </Link>
                        <button
                          onClick={() => handleDeleteRole(role.id, role.title)}
                          className="px-2 py-1 rounded bg-[#FFDAD6] hover:bg-[#FFDAD6]/80 text-error font-medium text-[11px] transition-colors inline-flex items-center gap-0.5"
                          title="Delete benchmark role"
                        >
                          <span className="material-symbols-outlined text-[13px]">delete</span>
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Add Role Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-primary/30 backdrop-blur-xs"
            onClick={() => setShowAddModal(false)}
          ></div>

          <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-variant p-6 sm:p-8 z-10 space-y-5">
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <div>
                <h3 className="font-headline text-lg font-semibold text-primary">
                  Upload Placement Target Role
                </h3>
                <p className="font-body text-xs text-on-surface-variant">
                  Define benchmark rubric and required skills for upcoming campus drives.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-on-surface block mb-1">
                  Target Role Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Systems Engineer, SRE Cloud Specialist"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-surface-container-low border border-surface-variant text-on-surface focus:outline-none focus:border-primary font-body"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-on-surface block mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-surface-container-low border border-surface-variant text-on-surface focus:outline-none"
                  >
                    <option>Product Engineering</option>
                    <option>Backend & Distributed</option>
                    <option>Analytics & BI</option>
                    <option>Enterprise IT Services</option>
                    <option>Cloud Infrastructure</option>
                    <option>Quality Assurance</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-on-surface block mb-1">
                    Minimum CGPA Cutoff
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 7.5"
                    value={minCgpa}
                    onChange={(e) => setMinCgpa(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-surface-container-low border border-surface-variant text-on-surface focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-on-surface block mb-1">
                  Target Companies / Placement Drives
                </label>
                <input
                  type="text"
                  placeholder="e.g. Goldman Sachs, Cisco, Oracle"
                  value={companies}
                  onChange={(e) => setCompanies(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-surface-container-low border border-surface-variant text-on-surface focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-on-surface block mb-1">
                  Benchmark Skills & Competencies (comma separated) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Go, Kubernetes, PostgreSQL, Microservices, CI/CD"
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-surface-container-low border border-surface-variant text-on-surface focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-on-surface block mb-1">
                  Benchmark Protocol Code
                </label>
                <input
                  type="text"
                  value={benchmarkCode}
                  onChange={(e) => setBenchmarkCode(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-surface-container-low border border-surface-variant text-on-surface focus:outline-none font-mono"
                />
              </div>

              <div className="pt-3 border-t border-surface-container flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg text-on-surface-variant hover:text-on-surface font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold shadow-sm flex items-center gap-1.5"
                >
                  {submitting && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
                  <span>Activate Target Role</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-on-primary px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-mono animate-fade-in">
          <span className="material-symbols-outlined text-[16px] text-[#4F7A5A]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <MobileTabBar role="coordinator" />
    </div>
  );
}
