-- ==============================================================================
-- READINESS PLATFORM — DATABASE MIGRATION
-- Schema: readiness (isolated schema to prevent collisions)
-- Tables: colleges, users, target_roles, resumes, analyses, analysis_items,
--         roadmap_items, roadmap_tasks, mentor_messages, coach_notes, audit_log
-- ==============================================================================

CREATE SCHEMA IF NOT EXISTS readiness;

-- 1. Colleges (Institutions)
CREATE TABLE IF NOT EXISTS readiness.colleges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    domain TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Users (Students & Placement Coordinators)
CREATE TABLE IF NOT EXISTS readiness.users (
    id TEXT PRIMARY KEY,
    college_id TEXT REFERENCES readiness.colleges(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'coordinator')),
    roll_number TEXT,
    degree TEXT,
    branch TEXT,
    graduation_year TEXT,
    cgpa TEXT,
    achievements TEXT[],
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Target Roles (Uploaded/managed by Placement Coordinators)
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
    census_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Resumes (Uploaded documents with extracted text)
CREATE TABLE IF NOT EXISTS readiness.resumes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES readiness.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size TEXT NOT NULL,
    file_url TEXT,
    raw_text TEXT,
    has_text_layer BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Analyses (Session audits)
CREATE TABLE IF NOT EXISTS readiness.analyses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES readiness.users(id) ON DELETE CASCADE,
    resume_id TEXT REFERENCES readiness.resumes(id) ON DELETE SET NULL,
    target_role_id TEXT REFERENCES readiness.target_roles(id) ON DELETE SET NULL,
    custom_jd TEXT,
    status TEXT NOT NULL CHECK (status IN ('queued', 'extracting', 'reading_role', 'matching', 'explaining', 'done', 'failed')),
    readiness_score INT DEFAULT 0,
    confidence_score INT DEFAULT 0,
    summary_sentence TEXT,
    top_gap TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Analysis Items (Competencies with evidence quotes)
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
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Roadmap Items (Phases: Prioritize, Sequence, Prove)
CREATE TABLE IF NOT EXISTS readiness.roadmap_items (
    id TEXT PRIMARY KEY,
    analysis_id TEXT NOT NULL REFERENCES readiness.analyses(id) ON DELETE CASCADE,
    phase TEXT NOT NULL CHECK (phase IN ('prioritize', 'sequence', 'prove')),
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Roadmap Tasks (Individual actionable tasks)
CREATE TABLE IF NOT EXISTS readiness.roadmap_tasks (
    id TEXT PRIMARY KEY,
    roadmap_item_id TEXT NOT NULL REFERENCES readiness.roadmap_items(id) ON DELETE CASCADE,
    analysis_id TEXT NOT NULL REFERENCES readiness.analyses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL CHECK (priority IN ('High', 'Medium', 'Foundational')),
    hours_estimate TEXT,
    evidence_outcome TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Mentor Messages (Advisor consultation stream)
CREATE TABLE IF NOT EXISTS readiness.mentor_messages (
    id TEXT PRIMARY KEY,
    analysis_id TEXT NOT NULL REFERENCES readiness.analyses(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES readiness.users(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('student', 'mentor')),
    sender_name TEXT NOT NULL,
    message_text TEXT NOT NULL,
    action_card_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Coach Notes (Private coordinator observations)
CREATE TABLE IF NOT EXISTS readiness.coach_notes (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES readiness.users(id) ON DELETE CASCADE,
    coordinator_id TEXT NOT NULL REFERENCES readiness.users(id) ON DELETE CASCADE,
    note_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Audit Log (Action history)
CREATE TABLE IF NOT EXISTS readiness.audit_log (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES readiness.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_readiness_users_email ON readiness.users(email);
CREATE INDEX IF NOT EXISTS idx_readiness_analyses_user ON readiness.analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_readiness_analysis_items_analysis ON readiness.analysis_items(analysis_id);
CREATE INDEX IF NOT EXISTS idx_readiness_roadmap_tasks_analysis ON readiness.roadmap_tasks(analysis_id);
CREATE INDEX IF NOT EXISTS idx_readiness_mentor_messages_analysis ON readiness.mentor_messages(analysis_id);
CREATE INDEX IF NOT EXISTS idx_readiness_coach_notes_student ON readiness.coach_notes(student_id);
