import 'server-only';
import { supabase } from '../client';
import { TargetRole } from '@/types';

export async function getTargetRoles(): Promise<TargetRole[]> {
  try {
    const { data, error } = await supabase
      .from('target_roles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      // Fallback defaults if table is empty
      return [
        {
          id: 'role_jfd',
          title: 'Junior Frontend Developer',
          category: 'Product Engineering',
          companies: 'Razorpay / Urban Company track',
          benchmark_code: 'Tier-1 Product Frontend v3.2',
          skills: ['React', 'TypeScript', 'CSS Grid', 'Tailwind', 'Redux / State', 'Unit Testing'],
          min_cgpa: '7.5',
          census_count: 14,
        },
        {
          id: 'role_ase',
          title: 'Associate Software Engineer',
          category: 'Enterprise IT Services',
          companies: 'TCS Digital / Infosys DSE track',
          benchmark_code: 'Standard Campus Syllabus 2024',
          skills: ['Java', 'Spring Boot', 'SQL Joins', 'REST APIs', 'Data Structures', 'Git'],
          min_cgpa: '7.0',
          census_count: 28,
        },
        {
          id: 'role_da',
          title: 'Data Analyst',
          category: 'Analytics & BI',
          companies: 'Mu Sigma / Fractal track',
          benchmark_code: 'Analytics Associate Standard v2.8',
          skills: ['Python', 'Pandas', 'PostgreSQL', 'Tableau / PowerBI', 'A/B Testing', 'Statistics'],
          min_cgpa: '7.0',
          census_count: 9,
        },
        {
          id: 'role_pe',
          title: 'Product Engineer (Backend)',
          category: 'Backend & Distributed',
          companies: 'Swiggy / Zomato track',
          benchmark_code: 'Backend Tier-1 Rubric v4.0',
          skills: ['Node.js', 'PostgreSQL', 'Redis Caching', 'Docker', 'System Design', 'Kafka'],
          min_cgpa: '8.0',
          census_count: 11,
        },
        {
          id: 'role_se',
          title: 'Systems & Cloud Engineer',
          category: 'Infrastructure',
          companies: 'AWS / Cisco track',
          benchmark_code: 'Cloud Operations Standard v1.9',
          skills: ['Linux Kernel', 'Bash Scripting', 'Networking', 'AWS / GCP', 'Kubernetes', 'CI/CD'],
          min_cgpa: '7.5',
          census_count: 7,
        },
        {
          id: 'role_qa',
          title: 'QA & Automation Engineer',
          category: 'Quality Engineering',
          companies: 'BrowserStack / Postman track',
          benchmark_code: 'SDET Campus Benchmark v2.1',
          skills: ['Selenium', 'Cypress', 'Playwright', 'Jest', 'API Testing', 'Performance'],
          min_cgpa: '6.5',
          census_count: 6,
        },
      ];
    }

    return data as TargetRole[];
  } catch (err) {
    return [];
  }
}

export async function insertTargetRole(role: Partial<TargetRole>): Promise<TargetRole | null> {
  const roleId = role.id || 'role_' + Date.now();
  const newRole = {
    id: roleId,
    title: role.title,
    category: role.category,
    companies: role.companies || '',
    description: role.description || '',
    benchmark_code: role.benchmark_code || 'Benchmark v1.0',
    skills: role.skills || [],
    min_cgpa: role.min_cgpa || '7.0',
    created_by: role.created_by || 'Coordinator',
  };

  const { data, error } = await supabase
    .from('target_roles')
    .insert([newRole])
    .select()
    .single();

  if (error) {
    return newRole as TargetRole;
  }
  return data as TargetRole;
}
