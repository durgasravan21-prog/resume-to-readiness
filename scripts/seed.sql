-- Seed Data for Readiness Platform
-- Schema: readiness

-- 1. College
INSERT INTO readiness.colleges (id, name, domain)
VALUES ('col_nie', 'National Institute of Engineering', 'college.edu')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 2. Coordinator
INSERT INTO readiness.users (id, college_id, name, email, role, avatar_url)
VALUES (
    'usr_coord_01',
    'col_nie',
    'Prof. Ravi Sharma',
    'ravi.sharma@college.edu',
    'coordinator',
    'https://lh3.googleusercontent.com/aida/AEtjO1XHfJAfdgb2cpVMwC7Ri3nKx-3OgYJShGHSYskEexfzhfcT1m2UaYeFrAaKj37Hk0_MQ002m_7OQr8gFySH1RWswifDSxA14Yo0dY3k6De1G5wE4mm407djRkw2j3YhhjUtNnNAGQMcWzcAbH6A-LuMC0RtXYNAYg1XOPQ4QdFRLRHvJ_WXhO0Y_QOHCCt6g3hPkVgc060dwPqEE_qKeodtUITcW-IfB0Oy10wg2AAta8yCRNri7HZnfsE'
)
ON CONFLICT (id) DO NOTHING;

-- 3. 12 Realistic Placement Target Roles
INSERT INTO readiness.target_roles (id, college_id, title, category, companies, description, benchmark_code, skills, census_count)
VALUES
('role_jfd', 'col_nie', 'Junior Frontend Developer', 'Product Engineering', 'Razorpay, Urban Company, Swiggy', 'Responsive interfaces, accessible design systems, and state synchronization.', 'Tier-1 Product v3.2', ARRAY['React', 'TypeScript', 'CSS Grid', 'Tailwind', 'Redux / Zustand', 'Jest'], 382),
('role_ase', 'col_nie', 'Associate Software Engineer', 'Enterprise IT Services', 'TCS Digital, Infosys DSE, Wipro Turbo', 'Core software development in Java/Python, database queries, and clean OOP design.', 'Standard Campus Syllabus 2024', ARRAY['Java', 'Spring Boot', 'SQL Joins', 'REST APIs', 'Data Structures', 'Git'], 420),
('role_da', 'col_nie', 'Data Analyst', 'Analytics & BI', 'Mu Sigma, Fractal Analytics, Tiger Analytics', 'SQL querying, KPI dashboard development, statistical analysis, and business storytelling.', 'Analytics Associate Standard v2.8', ARRAY['Python', 'Pandas', 'PostgreSQL', 'Tableau / PowerBI', 'A/B Testing'], 215),
('role_pe', 'col_nie', 'Product Engineer (Backend)', 'Backend & Distributed', 'Swiggy, Zomato, PhonePe', 'High-throughput microservices, caching layers, and database performance tuning.', 'Backend Tier-1 Rubric v4.0', ARRAY['Node.js', 'PostgreSQL', 'Redis', 'Docker', 'System Design', 'Kafka'], 184),
('role_se', 'col_nie', 'Systems & Cloud Engineer', 'Infrastructure', 'AWS, Cisco, Red Hat', 'Linux kernel internals, TCP/IP networking, containerization, and infrastructure as code.', 'Cloud Operations Standard v1.9', ARRAY['Linux Kernel', 'Bash Scripting', 'Networking', 'AWS', 'Kubernetes', 'CI/CD'], 122),
('role_qa', 'col_nie', 'QA & Automation Engineer', 'Quality Engineering', 'BrowserStack, Postman, Thoughtworks', 'Test automation frameworks, API testing, end-to-end user journeys, and load simulation.', 'SDET Campus Benchmark v2.1', ARRAY['Selenium', 'Cypress', 'Playwright', 'Jest', 'API Testing', 'Performance'], 98),
('role_fs', 'col_nie', 'Full Stack Engineer', 'Product Engineering', 'CRED, Zeta, Meesho', 'End-to-end feature delivery across React frontend and Node/Go backend systems.', 'Full Stack Standard v3.0', ARRAY['React', 'Next.js', 'Node.js', 'PostgreSQL', 'Tailwind', 'REST'], 154),
('role_ds', 'col_nie', 'Data Scientist', 'Machine Learning & AI', 'Flipkart, Amazon, American Express', 'Applied predictive modeling, feature engineering, NLP pipelines, and model evaluation.', 'Data Science Standard v2.4', ARRAY['Python', 'Scikit-learn', 'PyTorch', 'SQL', 'NLP', 'Model Evaluation'], 86),
('role_mob', 'col_nie', 'Mobile Application Developer', 'Mobile Engineering', 'Dream11, Paytm, Slice', 'Cross-platform native mobile apps, offline caching, and native bridge performance.', 'Mobile Engineer Rubric v2.2', ARRAY['React Native', 'Flutter', 'iOS/Android', 'State Management', 'Offline Sync'], 74),
('role_devops', 'col_nie', 'DevOps & Site Reliability Engineer', 'Cloud Infrastructure', 'Hotstar, InMobi, Jio', 'Zero-downtime deployments, Kubernetes clusters, telemetry monitoring, and alerting.', 'SRE Benchmark Standard v1.8', ARRAY['Docker', 'Kubernetes', 'Terraform', 'Prometheus', 'Grafana', 'GitHub Actions'], 68),
('role_cyber', 'col_nie', 'Cybersecurity Associate', 'Security & Compliance', 'PwC, Deloitte, Palantir', 'Network security assessment, OWASP Top 10 mitigation, and identity management.', 'SecOps Standard v1.5', ARRAY['Network Security', 'OWASP Top 10', 'Penetration Testing', 'SIEM', 'Cryptography'], 45),
('role_pa', 'col_nie', 'Product Analyst', 'Growth & Product Ops', 'KreditBee, Groww, Zerodha', 'User funnel conversion tracking, cohort retention analysis, and A/B test validation.', 'Product Analytics v2.0', ARRAY['SQL', 'Amplitude / Mixpanel', 'Python', 'A/B Testing', 'Retention Analysis'], 58)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, skills = EXCLUDED.skills;

-- 4. 30 Sample Indian Students
INSERT INTO readiness.users (id, college_id, name, email, role, roll_number, degree, branch, graduation_year, cgpa, avatar_url)
VALUES
('usr_ananya', 'col_nie', 'Ananya Reddy', 'ananya.reddy@college.edu', 'student', '2021BCS0089', 'B.Tech', 'Computer Science & Engineering', '2025', '8.74', 'https://lh3.googleusercontent.com/aida/AEtjO1WdKXqNRspbpeyaqj--Djbz-rUwt4twHbg-W0QFpJL5QjyYt80ttJsTLkovyDI_ENraMh-GwTB4izML4KQkzNUdTqtGYnClifUTgkIWVQbauT_Ln6m6lStaoBT1PxR4awTDClw2aidI0t7lohoqfs3mb3gDJ3wLwrsvM5M9DvcfHmijKNWVlwFPvx7IMB1UoIr84vfa-IhHwuM80XVgDnVMp0dwmRDtuxiMc2mC4jJ3ax7s_N6ynozDxW8'),
('usr_rahul', 'col_nie', 'Rahul Verma', 'rahul.verma@college.edu', 'student', '2021BCS0142', 'B.Tech', 'Computer Science & Engineering', '2025', '8.42', NULL),
('usr_devansh', 'col_nie', 'Devansh Mathur', 'devansh.mathur@college.edu', 'student', '2021BCS0312', 'B.Tech', 'Computer Science & Engineering', '2025', '7.85', NULL),
('usr_meera', 'col_nie', 'Meera Venkatesh', 'meera.venkatesh@college.edu', 'student', '2021BCS0044', 'B.Tech', 'Computer Science & Engineering', '2025', '9.12', NULL),
('usr_rohan', 'col_nie', 'Rohan Kulkarni', 'rohan.kulkarni@college.edu', 'student', '2021BCS0219', 'B.Tech', 'Computer Science & Engineering', '2025', '7.40', NULL),
('usr_priya', 'col_nie', 'Priya Nair', 'priya.nair@college.edu', 'student', '2021BCS0188', 'B.Tech', 'Computer Science & Engineering', '2025', '8.65', NULL),
('usr_siddharth', 'col_nie', 'Siddharth Sen', 'siddharth.sen@college.edu', 'student', '2021BCS0401', 'B.Tech', 'Computer Science & Engineering', '2025', '7.92', NULL),
('usr_aarav', 'col_nie', 'Aarav Sundaram', 'aarav.sundaram@college.edu', 'student', '2021BCS0012', 'B.Tech', 'Computer Science & Engineering', '2025', '8.30', NULL),
('usr_kavya', 'col_nie', 'Kavya Krishnan', 'kavya.krishnan@college.edu', 'student', '2021BCS0155', 'B.Tech', 'Computer Science & Engineering', '2025', '8.90', NULL),
('usr_aditya', 'col_nie', 'Aditya Sharma', 'aditya.sharma@college.edu', 'student', '2021BCS0023', 'B.Tech', 'Computer Science & Engineering', '2025', '8.15', NULL),
('usr_tanvi', 'col_nie', 'Tanvi Patel', 'tanvi.patel@college.edu', 'student', '2021BCS0278', 'B.Tech', 'Computer Science & Engineering', '2025', '8.55', NULL),
('usr_nikhil', 'col_nie', 'Nikhil Joshi', 'nikhil.joshi@college.edu', 'student', '2021BCS0194', 'B.Tech', 'Computer Science & Engineering', '2025', '7.60', NULL),
('usr_sneha', 'col_nie', 'Sneha Iyer', 'sneha.iyer@college.edu', 'student', '2021BCS0245', 'B.Tech', 'Computer Science & Engineering', '2025', '9.05', NULL),
('usr_varun', 'col_nie', 'Varun Chopra', 'varun.chopra@college.edu', 'student', '2021BCS0334', 'B.Tech', 'Computer Science & Engineering', '2025', '8.20', NULL),
('usr_pooja', 'col_nie', 'Pooja Hegde', 'pooja.hegde@college.edu', 'student', '2021BCS0176', 'B.Tech', 'Computer Science & Engineering', '2025', '7.95', NULL),
('usr_karthik', 'col_nie', 'Karthik Raja', 'karthik.raja@college.edu', 'student', '2021BCS0134', 'B.Tech', 'Computer Science & Engineering', '2025', '8.40', NULL),
('usr_ritu', 'col_nie', 'Ritu Saxena', 'ritu.saxena@college.edu', 'student', '2021BCS0210', 'B.Tech', 'Computer Science & Engineering', '2025', '8.80', NULL),
('usr_harsh', 'col_nie', 'Harsh Vardhan', 'harsh.vardhan@college.edu', 'student', '2021BCS0111', 'B.Tech', 'Computer Science & Engineering', '2025', '7.75', NULL),
('usr_ishaan', 'col_nie', 'Ishaan Deshmukh', 'ishaan.deshmukh@college.edu', 'student', '2021BCS0129', 'B.Tech', 'Computer Science & Engineering', '2025', '8.25', NULL),
('usr_ananya_m', 'col_nie', 'Ananya Mukherjee', 'ananya.mukherjee@college.edu', 'student', '2021BCS0067', 'B.Tech', 'Computer Science & Engineering', '2025', '8.95', NULL),
('usr_pranav', 'col_nie', 'Pranav Nair', 'pranav.nair@college.edu', 'student', '2021BCS0201', 'B.Tech', 'Computer Science & Engineering', '2025', '7.80', NULL),
('usr_divya', 'col_nie', 'Divya Menon', 'divya.menon@college.edu', 'student', '2021BCS0098', 'B.Tech', 'Computer Science & Engineering', '2025', '8.50', NULL),
('usr_akash', 'col_nie', 'Akash Gupta', 'akash.gupta@college.edu', 'student', '2021BCS0018', 'B.Tech', 'Computer Science & Engineering', '2025', '8.10', NULL),
('usr_shreya', 'col_nie', 'Shreya Bhatt', 'shreya.bhatt@college.edu', 'student', '2021BCS0262', 'B.Tech', 'Computer Science & Engineering', '2025', '8.70', NULL),
('usr_manav', 'col_nie', 'Manav Kapur', 'manav.kapur@college.edu', 'student', '2021BCS0163', 'B.Tech', 'Computer Science & Engineering', '2025', '7.50', NULL),
('usr_neha', 'col_nie', 'Neha Pillai', 'neha.pillai@college.edu', 'student', '2021BCS0182', 'B.Tech', 'Computer Science & Engineering', '2025', '8.35', NULL),
('usr_abhishek', 'col_nie', 'Abhishek Das', 'abhishek.das@college.edu', 'student', '2021BCS0007', 'B.Tech', 'Computer Science & Engineering', '2025', '8.00', NULL),
('usr_swati', 'col_nie', 'Swati Roy', 'swati.roy@college.edu', 'student', '2021BCS0289', 'B.Tech', 'Computer Science & Engineering', '2025', '8.60', NULL),
('usr_tarun', 'col_nie', 'Tarun Bansal', 'tarun.bansal@college.edu', 'student', '2021BCS0305', 'B.Tech', 'Computer Science & Engineering', '2025', '7.70', NULL),
('usr_vikram', 'col_nie', 'Vikram Rathore', 'vikram.rathore@college.edu', 'student', '2021BCS0342', 'B.Tech', 'Computer Science & Engineering', '2025', '8.45', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, roll_number = EXCLUDED.roll_number;

-- 5. Ananya Reddy Sample Resume & Completed Analysis
INSERT INTO readiness.resumes (id, user_id, file_name, file_size, raw_text, has_text_layer)
VALUES (
    'res_ananya_01',
    'usr_ananya',
    'Ananya_Reddy_Resume_2025.pdf',
    '1.8 MB',
    'Ananya Reddy | B.Tech CSE | Built accessible component library complying with WCAG 2.1 AA standards including screen reader landmarks. Architected pixel-perfect dashboard layouts with CSS Grid and Tailwind, reducing CSS payload by 40%. Implemented asynchronous data pagination and debounced search filters handling 10k items smoothly. Utilized React useState and useContext for local widget states in coursework e-commerce store. Wrote basic Jest snapshot tests for header navigation component. Mentioned Lighthouse 90+ score in personal portfolio.',
    TRUE
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO readiness.analyses (id, user_id, resume_id, target_role_id, status, readiness_score, confidence_score, summary_sentence, top_gap)
VALUES (
    'default',
    'usr_ananya',
    'res_ananya_01',
    'role_jfd',
    'done',
    72,
    78,
    'Your resume demonstrates solid foundational web competence, but lacks verifiable production proof for complex state synchronization and automated testing suites.',
    'React state management'
)
ON CONFLICT (id) DO UPDATE SET readiness_score = 72;

-- 6. Rahul Verma Coaching Notes
INSERT INTO readiness.coach_notes (id, student_id, coordinator_id, note_text)
VALUES
('note_rahul_1', 'usr_rahul', 'usr_coord_01', 'Spoke to Rahul after mock interview. His SQL fundamentals are solid, but he struggles to articulate business impact. Advised him to record a 3-min walkthrough of his e-commerce data pipeline.'),
('note_rahul_2', 'usr_rahul', 'usr_coord_01', 'Initial resume parsed. Flagged for Business Intelligence workshop series starting 20th Sept.')
ON CONFLICT (id) DO NOTHING;
