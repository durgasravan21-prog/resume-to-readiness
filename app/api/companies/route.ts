import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const FALLBACK_COMPANIES = [
  { id: 'comp_razorpay', name: 'Razorpay', tier: 'Tier-1 Product', industry: 'Fintech' },
  { id: 'comp_swiggy', name: 'Swiggy', tier: 'Tier-1 Product', industry: 'Consumer Tech' },
  { id: 'comp_zerodha', name: 'Zerodha', tier: 'Tier-1 FinTech', industry: 'Brokerage / Tech' },
  { id: 'comp_google', name: 'Google', tier: 'Tier-1 FAANG', industry: 'Enterprise / Search' },
  { id: 'comp_microsoft', name: 'Microsoft', tier: 'Tier-1 FAANG', industry: 'Enterprise Cloud' },
  { id: 'comp_tcs', name: 'TCS Digital', tier: 'Tier-2 IT Services', industry: 'Enterprise Services' },
  { id: 'comp_infosys', name: 'Infosys DSE', tier: 'Tier-2 IT Services', industry: 'Enterprise Services' },
  { id: 'comp_urbancompany', name: 'Urban Company', tier: 'Tier-1 Product', industry: 'Consumer Services' },
];

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yslupcclthqltvvwjvjr.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbHVwY2NsdGhxbHR2dndqdmpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MjA0MzYsImV4cCI6MjA5ODk5NjQzNn0.XN9oa1bOtXf0ZsqViLDk5OB_xVT-wFh7GPDEFzzgtPU';

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    });

    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .order('name', { ascending: true });

    if (error || !companies || companies.length === 0) {
      return NextResponse.json({ companies: FALLBACK_COMPANIES });
    }

    return NextResponse.json({ companies });
  } catch (err: any) {
    return NextResponse.json({ companies: FALLBACK_COMPANIES });
  }
}
