import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const FALLBACK_ROLES = [
  {
    id: 'role_jfd',
    title: 'Junior Frontend Developer',
    category: 'Product Engineering',
    companies: 'Razorpay, Swiggy, Cred, Urban Company',
    description: 'Build responsive, production-ready web user interfaces with React, modern state management, and strict TypeScript.',
    benchmark_code: 'Tier-1 Product Frontend v3.2',
    skills: ['React', 'TypeScript', 'CSS Grid', 'Tailwind', 'Redux / State', 'Unit Testing'],
    min_cgpa: '7.5',
    census_count: 42,
  },
  {
    id: 'role_ase',
    title: 'Associate Software Engineer',
    category: 'Enterprise IT Services',
    companies: 'TCS Digital, Infosys DSE, Wipro Turbo, Cognizant',
    description: 'Foundational software engineering with object-oriented programming, data structures, SQL databases, and enterprise Java.',
    benchmark_code: 'Standard Campus Syllabus 2024',
    skills: ['Java', 'Spring Boot', 'SQL Joins', 'REST APIs', 'Data Structures', 'Git'],
    min_cgpa: '6.5',
    census_count: 78,
  },
  {
    id: 'role_da',
    title: 'Data Analyst & BI Specialist',
    category: 'Analytics & BI',
    companies: 'Mu Sigma, Fractal, Tiger Analytics, LatentView',
    description: 'Transform complex business datasets into structured actionable intelligence via SQL queries, Python analysis, and dashboard modeling.',
    benchmark_code: 'Analytics Associate Standard v2.8',
    skills: ['Python', 'Pandas', 'PostgreSQL', 'Tableau / PowerBI', 'A/B Testing', 'Statistics'],
    min_cgpa: '7.0',
    census_count: 31,
  },
  {
    id: 'role_pe',
    title: 'Product Engineer (Backend)',
    category: 'Backend & Distributed',
    companies: 'Swiggy, Zomato, PhonePe, Flipkart',
    description: 'High-throughput microservices, concurrent request processing, distributed caching, and transactional ACID data stores.',
    benchmark_code: 'Backend Tier-1 Rubric v4.0',
    skills: ['Node.js', 'PostgreSQL', 'Redis Caching', 'Docker', 'System Design', 'Kafka'],
    min_cgpa: '8.0',
    census_count: 53,
  },
];

async function getSupabase() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yslupcclthqltvvwjvjr.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbHVwY2NsdGhxbHR2dndqdmpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MjA0MzYsImV4cCI6MjA5ODk5NjQzNn0.XN9oa1bOtXf0ZsqViLDk5OB_xVT-wFh7GPDEFzzgtPU';

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    db: { schema: 'readiness' },
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options) {
        cookieStore.delete({ name, ...options });
      },
    },
  });
}

export async function GET() {
  try {
    const supabase = await getSupabase();
    const { data: roles, error } = await supabase
      .from('target_roles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !roles || roles.length === 0) {
      return NextResponse.json({ roles: FALLBACK_ROLES });
    }

    return NextResponse.json({ roles });
  } catch (err: any) {
    return NextResponse.json({ roles: FALLBACK_ROLES });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, category, companies, description, benchmark_code, skills, min_cgpa, created_by } = body;

    if (!title || !category) {
      return NextResponse.json(
        { error: 'Role title and category are required.' },
        { status: 400 }
      );
    }

    const supabase = await getSupabase();
    const id = 'role_' + Math.random().toString(36).substring(2, 9);

    const newRole = {
      id,
      title: title.trim(),
      category: category.trim(),
      companies: companies?.trim() || 'Various hiring partners',
      description: description?.trim() || '',
      benchmark_code: benchmark_code?.trim() || `CAMPUS-${Date.now().toString().slice(-4)}`,
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s: string) => s.trim()) : []),
      min_cgpa: min_cgpa?.toString() || '6.0',
      created_by: created_by || 'TPC Coordinator',
      college_id: 'col_nie',
      census_count: 0,
    };

    const { data, error } = await supabase
      .from('target_roles')
      .insert(newRole)
      .select()
      .single();

    if (error) {
      console.error('Failed to insert target role:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Record audit log
    await supabase.from('audit_log').insert({
      id: 'aud_' + Math.random().toString(36).substring(2, 9),
      action: 'TARGET_ROLE_CREATED',
      target_id: id,
      details: { title, category, min_cgpa },
    });

    return NextResponse.json({ success: true, role: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
