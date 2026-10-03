# System Architecture & Technical Specifications

> **Technical Architecture, Security Sandbox, and Data Flow Design for Readiness Skill Gap Platform.**

---

## 1. Architectural Philosophy

Readiness is engineered on three core architectural principles:

1. **Deterministic Grounding Over Hallucination**: AI does not generate arbitrary score percentages. Instead, it computes metrics through strict lexical and semantic matching against actual resume text layers, cross-referencing verbatim evidence sentences.
2. **Schema-Level Multi-Tenant Isolation**: All platform data is partitioned into an isolated PostgreSQL schema (`readiness`), strictly decoupled from external application tables and auth schemas.
3. **Defense-in-Depth Document Intake**: Resumes undergo binary magic-byte inspection, character stream validation, classifier filtering, and PII redaction before entering the diagnostic engine.

---

## 2. High-Level Component Topology

```mermaid
graph TD
    subgraph Client["Client Tier (Next.js 14 App Router)"]
        Landing["Landing Page / OTP Login"]
        StudentHome["Student Home Dashboard (/home)"]
        NewAnalysis["Document Upload (/analyses/new)"]
        SkillMap["Skill Map Ledger (/analyses/[id])"]
        GapDetail["Gap Deep Dive (/analyses/[id]/gap/[itemId])"]
        RoadmapPage["Action Roadmap (/analyses/[id]/roadmap)"]
        MentorChat["Mentor Consultation (/analyses/[id]/mentor)"]
        TPCDashboard["TPC Coordinator Portal (/tpc)"]
    end

    subgraph Middleware["Edge & Middleware Layer"]
        SessionGuard["Session & Role Cookie Guard"]
        AuthMiddleware["Supabase Auth State Synchronizer"]
    end

    subgraph ServerAPI["Server Route Handlers (/api)"]
        APIAnalyses["/api/analyses/create"]
        APIOnboarding["/api/onboarding"]
        APIMessages["/api/mentor/messages"]
        APIVerifyOTP["/api/auth/verify-otp"]
        APISettings["/api/settings"]
    end

    subgraph Pipeline["AI & Ingestion Pipeline"]
        MagicValidator["Magic Bytes Binary Inspector"]
        TextExtractor["PDF (pdfjs) & DOCX (mammoth) Extractors"]
        Classifier["Resume Classifier Heuristics"]
        PIIStripper["PII Sanitizer (Aadhaar, PAN, Passport)"]
        AnalysisEngine["Deterministic Rule-Based Matching Engine"]
    end

    subgraph DataTier["Data Tier (Supabase PostgreSQL 15)"]
        Profiles[("readiness.profiles")]
        Resumes[("readiness.resumes")]
        Analyses[("readiness.analyses")]
        Items[("readiness.analysis_items")]
        RoadmapTasks[("readiness.roadmap_tasks")]
        Messages[("readiness.mentor_messages")]
        Drives[("readiness.placement_drives")]
        Realtime["PostgreSQL WAL Realtime Engine"]
    end

    Client --> Middleware
    Middleware --> ServerAPI
    APIAnalyses --> Pipeline
    APIOnboarding --> Pipeline
    Pipeline --> Analyses
    Pipeline --> Items
    Pipeline --> RoadmapTasks
    Pipeline --> Resumes
    ServerAPI --> DataTier
    MentorChat -.-> Realtime
    Realtime -.-> Messages
```

---

## 3. Resume Intake & Security Sandbox

```mermaid
flowchart LR
    A["Uploaded File Buffer"] --> B{"Magic Bytes Match?"}
    B -- No --> B_Err["Reject: Disguised File Format"]
    B -- Yes --> C{"Extracted Text >= 100 Chars?"}
    C -- No --> C_Err["Reject: Scanned Image / Missing Text Layer"]
    C -- Yes --> D{"Resume Classifier Heuristic"}
    D -- Invoice/Bill --> D_Err["Reject: Non-Resume Document"]
    D -- Valid CV --> E["PII Sanitizer"]
    E --> F["Redacted Text Layer"]
    F --> G["Skill Matching & Gap Engine"]
```

### Magic Bytes Signatures Enforced
- **PDF**: Checks for `%PDF` within the first 1024 bytes. Disallows executable signatures (`MZ` for Windows PE, `\x7fELF` for Linux).
- **DOCX**: Checks for PK Zip headers (`0x50, 0x4B, 0x03, 0x04`) and confirms Microsoft Word XML namespace structures.

### PII Redaction Strategy
To comply with Indian data protection norms (DPDP Act), sensitive government identity documents are systematically redacted prior to storage:
- **Aadhaar Numbers**: `\b[2-9]\d{3}[\s-]?\d{4}[\s-]?\d{4}\b` → `[REDACTED_AADHAAR]`
- **PAN Numbers**: `\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b` → `[REDACTED_PAN]`
- **Indian Passports**: `\b[A-Za-z][1-9]\d{6}\b` → `[REDACTED_PASSPORT]`

---

## 4. Mentor Chat State Machine

The mentor consultation system features an automated queuing state machine:

```mermaid
stateDiagram-v2
    [*] --> Idle: Chat Initialized
    Idle --> MessageSent: Student Submits Query
    MessageSent --> WaitingForMentor: System Auto-Acknowledges
    note right of WaitingForMentor: Student input field is disabled.\nDuplicate submissions blocked with HTTP 429.
    WaitingForMentor --> OpenTwoWay: Faculty Mentor Submits Reply
    note right of OpenTwoWay: Realtime WAL event triggers.\nInput field re-enabled for conversational consultation.
    OpenTwoWay --> MessageSent: Student Submits Follow-Up
```

---

## 5. Relational Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    PROFILES ||--o{ RESUMES : uploads
    PROFILES ||--o{ ANALYSES : owns
    PROFILES ||--o{ MENTOR_MESSAGES : sends
    RESUMES ||--|| ANALYSES : parsed_into
    ANALYSES ||--o{ ANALYSIS_ITEMS : details
    ANALYSES ||--o{ ROADMAP_ITEMS : structures
    ROADMAP_ITEMS ||--o{ ROADMAP_TASKS : contains
    ANALYSES ||--o{ MENTOR_MESSAGES : contextualizes

    PROFILES {
        string id PK
        string email UK
        string name
        string role
        boolean onboarding_completed
        string roll_number
        string college_name
        string degree
        string branch
        string cgpa
        string phone_number
        string dob
        string github_url
        string linkedin_url
    }

    RESUMES {
        string id PK
        string user_id FK
        string file_name
        string file_size
        text raw_text
        boolean has_text_layer
        boolean is_resume
    }

    ANALYSES {
        string id PK
        string user_id FK
        string resume_id FK
        string dream_role
        string dream_company
        integer readiness_score
        integer confidence_score
        text summary_sentence
        string top_gap
        string status
    }

    ANALYSIS_ITEMS {
        string id PK
        string analysis_id FK
        string name
        string status
        string status_label
        text jd_requirement
        text evidence_quote
        string source_reference
        text plain_explanation
    }

    ROADMAP_ITEMS {
        string id PK
        string analysis_id FK
        string phase
        string title
        text description
    }

    ROADMAP_TASKS {
        string id PK
        string roadmap_item_id FK
        string analysis_id FK
        string title
        text description
        string priority
        string hours_estimate
        text evidence_outcome
        boolean is_completed
        timestamp due_date
    }

    PLACEMENT_DRIVES {
        uuid id PK
        string company_name
        string role_title
        string ctc_range
        date drive_date
        date deadline
        decimal eligibility_cgpa
        string status
    }
```
