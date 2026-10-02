-- ==============================================================================
-- READINESS PLATFORM — COMPLETE SUPABASE MIGRATION
-- Schema: readiness
-- Features: Auth Profiles, Settings, Companies, Resumes, Onboarding Consents,
--           Analyses, Roadmaps, Submissions, Mentor Assignments, Realtime Chat,
--           Flags, Deadlines, 3-Chance Program Status, Coach Notes, Audit Log.
-- ==============================================================================

CREATE SCHEMA IF NOT EXISTS readiness;

-- 1. Colleges
CREATE TABLE IF NOT EXISTS readiness.colleges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    domain TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. System Settings (configurable thresholds, allowed domains)
CREATE TABLE IF NOT EXISTS readiness.settings (
    key TEXT PRIMARY KEY,
    value_json JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO readiness.settings (key, value_json)
VALUES 
    ('allowed_email_domains', '[]'::jsonb),
    ('outstanding_threshold', '85'::jsonb),
    ('flag_limit', '3'::jsonb),
    ('maximum_chances', '3'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 3. Companies (suggestions table for Dream Company step)
CREATE TABLE IF NOT EXISTS readiness.companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    industry TEXT NOT NULL,
    tier TEXT DEFAULT 'Tier-1',
    typical_skills TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO readiness.companies (id, name, industry, tier, typical_skills)
VALUES
    ('comp_razorpay', 'Razorpay', 'Fintech / Payments', 'Tier-1 Product', ARRAY['React', 'TypeScript', 'Redux', 'System Design', 'Kafka']),
    ('comp_swiggy', 'Swiggy', 'Consumer Tech / Logistics', 'Tier-1 Product', ARRAY['React', 'TypeScript', 'Node.js', 'Distributed Systems', 'Redis']),
    ('comp_zomato', 'Zomato', 'Food Delivery / Quick Commerce', 'Tier-1 Product', ARRAY['React', 'TypeScript', 'PostgreSQL', 'Golang', 'Kubernetes']),
    ('comp_urban_co', 'Urban Company', 'Gig Economy / Home Services', 'Tier-1 Product', ARRAY['React Native', 'React', 'TypeScript', 'State Management']),
    ('comp_tcs', 'TCS (Digital Track)', 'IT Services / Enterprise', 'Enterprise Services', ARRAY['Java', 'Spring Boot', 'SQL', 'Data Structures', 'REST']),
    ('comp_infosys', 'Infosys (DSE Track)', 'IT Services / Systems', 'Enterprise Services', ARRAY['Java', 'Python', 'Algorithms', 'Cloud Basics']),
    ('comp_fractal', 'Fractal Analytics', 'AI / Data Analytics', 'Analytics Consulting', ARRAY['Python', 'Pandas', 'PostgreSQL', 'Tableau', 'Statistics']),
    ('comp_postman', 'Postman', 'Developer Tools / APIs', 'Tier-1 Product', ARRAY['Node.js', 'Electron', 'REST', 'GraphQL', 'Testing Frameworks'])
ON CONFLICT (id) DO NOTHING;

-- 4. Server-Controlled User Profiles
CREATE TABLE IF NOT EXISTS readiness.profiles (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('student', 'mentor', 'coordinator', 'admin')),
    name TEXT NOT NULL,
    college_id TEXT REFERENCES readiness.colleges(id) ON DELETE SET NULL,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    roll_number TEXT,
    degree TEXT,
    branch TEXT,
    graduation_year TEXT,
    cgpa TEXT,
    school_10th TEXT,
    school_10th_marks TEXT,
    school_12th TEXT,
    school_12th_marks TEXT,
    college_name TEXT,
    achievements_text TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Target Roles (Uploaded by Placement Coordinators & Curated)
CREATE TABLE IF NOT EXISTS readiness.target_roles (
    id TEXT PRIMARY KEY,
    college_id TEXT REFERENCES readiness.colleges(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    companies TEXT,
    description TEXT,
    benchmark_code TEXT,
    skills TEXT[] DEFAULT '{}',
    syllabus_json JSONB DEFAULT '{}'::jsonb,
    min_cgpa TEXT,
    created_by TEXT,
    census_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Resumes
CREATE TABLE IF NOT EXISTS readiness.resumes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES readiness.profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size TEXT NOT NULL,
    file_url TEXT,
    raw_text TEXT,
    has_text_layer BOOLEAN DEFAULT TRUE,
    is_resume BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Mandatory Onboarding Consents
CREATE TABLE IF NOT EXISTS readiness.consents (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES readiness.profiles(id) ON DELETE CASCADE,
    consent_version TEXT NOT NULL,
    consent_text TEXT NOT NULL,
    agreed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Analyses (Diagnostic Ledgers)
CREATE TABLE IF NOT EXISTS readiness.analyses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES readiness.profiles(id) ON DELETE CASCADE,
    resume_id TEXT REFERENCES readiness.resumes(id) ON DELETE SET NULL,
    target_role_id TEXT REFERENCES readiness.target_roles(id) ON DELETE SET NULL,
    dream_role TEXT,
    dream_company TEXT,
    custom_jd TEXT,
    status TEXT NOT NULL CHECK (status IN ('queued', 'extracting', 'reading_role', 'matching', 'explaining', 'done', 'failed')),
    readiness_score INT DEFAULT 0,
    confidence_score INT DEFAULT 0,
    summary_sentence TEXT,
    top_gap TEXT,
    is_outstanding BOOLEAN DEFAULT FALSE,
    shared_with_tpc_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Analysis Items (Competencies with Verbatim Proof)
CREATE TABLE IF NOT EXISTS readiness.analysis_items (
    id TEXT PRIMARY KEY,
    analysis_id TEXT NOT NULL REFERENCES readiness.analyses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('strong', 'needs_proof', 'missing')),
    status_label TEXT,
    jd_requirement TEXT,
    evidence_quote TEXT,
    source_reference TEXT,
    plain_explanation TEXT,
    suggestions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Roadmap Items (Phases)
CREATE TABLE IF NOT EXISTS readiness.roadmap_items (
    id TEXT PRIMARY KEY,
    analysis_id TEXT NOT NULL REFERENCES readiness.analyses(id) ON DELETE CASCADE,
    phase TEXT NOT NULL CHECK (phase IN ('prioritize', 'sequence', 'prove')),
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Roadmap Tasks
CREATE TABLE IF NOT EXISTS readiness.roadmap_tasks (
    id TEXT PRIMARY KEY,
    roadmap_item_id TEXT NOT NULL REFERENCES readiness.roadmap_items(id) ON DELETE CASCADE,
    analysis_id TEXT NOT NULL REFERENCES readiness.analyses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL CHECK (priority IN ('High', 'Medium', 'Foundational')),
    hours_estimate TEXT,
    evidence_outcome TEXT,
    due_date TIMESTAMPTZ,
    is_completed BOOLEAN DEFAULT FALSE,
    suggested_by_mentor BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Task Proof Submissions
CREATE TABLE IF NOT EXISTS readiness.task_submissions (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES readiness.roadmap_tasks(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES readiness.profiles(id) ON DELETE CASCADE,
    submission_type TEXT NOT NULL CHECK (submission_type IN ('repo_url', 'live_url', 'file', 'written_proof')),
    submission_content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'changes_requested')),
    reviewer_notes TEXT,
    reviewed_by TEXT REFERENCES readiness.profiles(id),
    reviewed_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Mentor Assignments
CREATE TABLE IF NOT EXISTS readiness.mentor_assignments (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL UNIQUE REFERENCES readiness.profiles(id) ON DELETE CASCADE,
    mentor_id TEXT NOT NULL REFERENCES readiness.profiles(id) ON DELETE CASCADE,
    assigned_by TEXT REFERENCES readiness.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Realtime Mentor Messages (Human Only)
CREATE TABLE IF NOT EXISTS readiness.mentor_messages (
    id TEXT PRIMARY KEY,
    thread_id TEXT NOT NULL,
    sender_id TEXT NOT NULL REFERENCES readiness.profiles(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('student', 'mentor', 'system')),
    body TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. In-App Notifications
CREATE TABLE IF NOT EXISTS readiness.notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES readiness.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Program Flags
CREATE TABLE IF NOT EXISTS readiness.flags (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES readiness.profiles(id) ON DELETE CASCADE,
    task_id TEXT REFERENCES readiness.roadmap_tasks(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    voided_by TEXT REFERENCES readiness.profiles(id),
    voided_reason TEXT,
    voided_at TIMESTAMPTZ
);

-- 17. Program Status (Active, At-Risk, Terminated)
CREATE TABLE IF NOT EXISTS readiness.program_status (
    student_id TEXT PRIMARY KEY REFERENCES readiness.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'at_risk', 'terminated')),
    flag_count INT DEFAULT 0,
    chances_used INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. Chance Grants (Coordinator 3-Chance System)
CREATE TABLE IF NOT EXISTS readiness.chance_grants (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES readiness.profiles(id) ON DELETE CASCADE,
    granted_by TEXT NOT NULL REFERENCES readiness.profiles(id),
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. Coach Notes (Private Coordinator Observations)
CREATE TABLE IF NOT EXISTS readiness.coach_notes (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES readiness.profiles(id) ON DELETE CASCADE,
    coordinator_id TEXT NOT NULL REFERENCES readiness.profiles(id) ON DELETE CASCADE,
    note_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. Compliance Audit Log
CREATE TABLE IF NOT EXISTS readiness.audit_log (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES readiness.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_readiness_profiles_email ON readiness.profiles(email);
CREATE INDEX IF NOT EXISTS idx_readiness_profiles_college ON readiness.profiles(college_id);
CREATE INDEX IF NOT EXISTS idx_readiness_analyses_user ON readiness.analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_readiness_analyses_status ON readiness.analyses(status);
CREATE INDEX IF NOT EXISTS idx_readiness_analyses_outstanding ON readiness.analyses(is_outstanding);
CREATE INDEX IF NOT EXISTS idx_readiness_tasks_due ON readiness.roadmap_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_readiness_submissions_task ON readiness.task_submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_readiness_messages_thread ON readiness.mentor_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_readiness_notifications_user ON readiness.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_readiness_flags_student ON readiness.flags(student_id);
CREATE INDEX IF NOT EXISTS idx_readiness_program_status ON readiness.program_status(status);
