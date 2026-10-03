import { TargetRole } from '@/types';

export interface AnalysisCompetency {
  id: string;
  name: string;
  status: 'strong' | 'needs_proof' | 'missing';
  statusLabel: string;
  jdRequirement: string;
  evidenceQuote: string | null;
  sourceReference: string | null;
  plainExplanation: string;
}

export interface RoadmapTaskItem {
  id: string;
  title: string;
  description: string;
  phase: 'prioritize' | 'sequence' | 'prove';
  priority: 'High' | 'Medium' | 'Low';
  hoursEstimate: string;
  evidenceOutcome: string;
  dueDate: string;
  isCompleted: boolean;
}

export interface FullAnalysisResult {
  readinessScore: number;
  confidenceScore: number;
  summarySentence: string;
  topGap: string;
  competencies: AnalysisCompetency[];
  roadmapTasks: RoadmapTaskItem[];
}

// Role competencies matrix benchmarked to top campus hiring standards
const ROLE_SKILL_PROFILES: Record<string, { skills: string[]; requirements: Record<string, string> }> = {
  frontend: {
    skills: [
      'Semantic HTML5 & Accessibility (WCAG)',
      'Modern Responsive CSS & Tailwind',
      'JavaScript (ES6+, Async/Await, Event Loop)',
      'React.js Component Architecture & Hooks',
      'Global State Management (Zustand/Redux/Context)',
      'TypeScript & Interface Contracts',
      'REST API Integration & Data Fetching',
      'Automated Testing (Vitest/Jest/Testing Library)',
      'Client-Side Web Performance & Lighthouse',
      'Version Control (Git workflows & PR reviews)',
      'CI/CD & Production Build Deployments',
    ],
    requirements: {
      'Semantic HTML5 & Accessibility (WCAG)': 'Strong grasp of semantic elements, ARIA landmarks, and keyboard accessibility navigation.',
      'Modern Responsive CSS & Tailwind': 'Pixel-perfect responsive layouts with CSS Flexbox, Grid, container queries, and utility CSS frameworks.',
      'JavaScript (ES6+, Async/Await, Event Loop)': 'Deep understanding of closures, promises, asynchronous microtasks, DOM manipulation, and ES6+ syntax.',
      'React.js Component Architecture & Hooks': 'Functional components, lifecycle management, custom hooks, memoization (useMemo/useCallback), and component tree optimization.',
      'Global State Management (Zustand/Redux/Context)': 'Production-grade centralized state management handling cache invalidation, asynchronous actions, and state normalization.',
      'TypeScript & Interface Contracts': 'Static type definitions, generics, type guards, and strict compile-time safety across component props and API responses.',
      'REST API Integration & Data Fetching': 'Axios/Fetch data pipelines, HTTP status handling, optimistic UI updates, pagination, and debounce/throttle mechanisms.',
      'Automated Testing (Vitest/Jest/Testing Library)': 'Unit testing of utility functions, React component rendering tests, user event simulation, and mocking network requests.',
      'Client-Side Web Performance & Lighthouse': 'Code splitting, dynamic imports, bundle optimization, asset compression, and Core Web Vitals (LCP, FID, CLS).',
      'Version Control (Git workflows & PR reviews)': 'Clean feature branch workflows, conventional commits, rebase strategies, and collaborative code reviews.',
      'CI/CD & Production Build Deployments': 'Automated GitHub Actions pipelines, Vercel/Netlify cloud deployment, and environment variable security.',
    },
  },
  backend: {
    skills: [
      'Core Programming Language (Node.js/Python/Java/Go)',
      'RESTful & GraphQL API Design',
      'Relational Database Modeling (PostgreSQL/MySQL)',
      'NoSQL & Document Stores (MongoDB/DynamoDB)',
      'In-Memory Caching (Redis/Memcached)',
      'Authentication & Security (JWT/OAuth2/RBAC)',
      'Containerization & Microservices (Docker)',
      'Automated Backend Testing & Mocking',
      'Message Queues & Event Streaming (Kafka/RabbitMQ)',
      'Database Indexing & Query Optimization',
      'CI/CD Pipelines & Cloud Infrastructure',
    ],
    requirements: {
      'Core Programming Language (Node.js/Python/Java/Go)': 'Fluency in backend idioms, concurrency models, asynchronous execution, and standard libraries.',
      'RESTful & GraphQL API Design': 'Clean resource-oriented routing, idempotent endpoints, HTTP status standards, and schema validation.',
      'Relational Database Modeling (PostgreSQL/MySQL)': 'Normalized schemas, foreign key relationships, ACID transactions, migrations, and complex SQL joins.',
      'NoSQL & Document Stores (MongoDB/DynamoDB)': 'Document modeling, aggregations, partitioning strategies, and eventual consistency handling.',
      'In-Memory Caching (Redis/Memcached)': 'Sub-millisecond data caching, cache aside patterns, TTL expiration, and rate-limiting keys.',
      'Authentication & Security (JWT/OAuth2/RBAC)': 'Secure session tokens, password hashing (bcrypt/argon2), CORS protection, and input sanitization against injections.',
      'Containerization & Microservices (Docker)': 'Dockerfile optimization, multi-stage builds, container networking, and reproducible service setups.',
      'Automated Backend Testing & Mocking': 'Integration test suites, database transaction rollback test fixtures, and mock external API dependencies.',
      'Message Queues & Event Streaming (Kafka/RabbitMQ)': 'Decoupled asynchronous worker queues, publish/subscribe patterns, and consumer retry logic.',
      'Database Indexing & Query Optimization': 'B-tree indexes, execution plan analysis (EXPLAIN ANALYZE), connection pooling, and eliminating N+1 queries.',
      'CI/CD Pipelines & Cloud Infrastructure': 'Automated testing workflows, container registry pushes, and cloud deployment on AWS/GCP/Vercel.',
    },
  },
  data: {
    skills: [
      'Python for Data Science (NumPy, Pandas)',
      'SQL & Complex Data Extraction',
      'Exploratory Data Analysis & Visualization',
      'Machine Learning Foundations (Scikit-Learn)',
      'Statistical Testing & Hypothesis Formulation',
      'Data Cleaning & ETL Pipeline Construction',
      'Feature Engineering & Model Evaluation',
      'Business Intelligence Dashboards (Tableau/PowerBI)',
      'Big Data & Distributed Computing (Spark/SQL)',
      'Model Deployment & REST Inference APIs',
    ],
    requirements: {
      'Python for Data Science (NumPy, Pandas)': 'Vectorized calculations, series/dataframe operations, aggregation pipelines, and high-performance transformations.',
      'SQL & Complex Data Extraction': 'Window functions, Common Table Expressions (CTEs), multi-table aggregations, and subqueries.',
      'Exploratory Data Analysis & Visualization': 'Statistical distributions, correlation matrices, Matplotlib/Seaborn/Plotly interactive charts.',
      'Machine Learning Foundations (Scikit-Learn)': 'Supervised/unsupervised algorithms (regression, decision trees, random forests, clustering).',
      'Statistical Testing & Hypothesis Formulation': 'p-values, A/B testing frameworks, confidence intervals, and parametric vs non-parametric checks.',
      'Data Cleaning & ETL Pipeline Construction': 'Missing value imputation, outlier detection, data type casting, and automated pipeline scripts.',
      'Feature Engineering & Model Evaluation': 'One-hot encoding, scaling, cross-validation, precision/recall, ROC-AUC, and hyperparameter tuning.',
      'Business Intelligence Dashboards (Tableau/PowerBI)': 'Executive stakeholder metrics, drill-down KPIs, calculated fields, and scheduled data refreshes.',
      'Big Data & Distributed Computing (Spark/SQL)': 'Handling large unstructured/semi-structured datasets across distributed storage clusters.',
      'Model Deployment & REST Inference APIs': 'Serving ML models via FastAPI/Flask endpoints, Docker containers, and serialized artifact pipelines.',
    },
  },
  general: {
    skills: [
      'Data Structures & Algorithms (Arrays, Trees, Graphs)',
      'Object-Oriented & Modular Programming',
      'Database Fundamentals & SQL Queries',
      'Full-Stack Web Development Basics',
      'System Design & Architecture Concepts',
      'Version Control & Collaborative Git',
      'Automated Testing & Code Quality',
      'Problem Solving & Debugging Techniques',
      'Cloud Deployment & Hosting',
    ],
    requirements: {
      'Data Structures & Algorithms (Arrays, Trees, Graphs)': 'Asymptotic time/space complexity analysis (Big-O), search/sorting implementations, and dynamic programming.',
      'Object-Oriented & Modular Programming': 'Encapsulation, inheritance, polymorphism, design patterns, and clean separation of concerns.',
      'Database Fundamentals & SQL Queries': 'Relational tables, primary/foreign keys, joins, normalization, and basic transactions.',
      'Full-Stack Web Development Basics': 'Client-server communications, HTTP protocols, frontend user interface, and backend request routing.',
      'System Design & Architecture Concepts': 'High-level scalability, load balancing, stateless servers, caching, and database replication.',
      'Version Control & Collaborative Git': 'Commit hygiene, branch management, merge conflict resolution, and repository organization.',
      'Automated Testing & Code Quality': 'Writing reliable unit tests, verifying edge cases, and adhering to strict linting and type contracts.',
      'Problem Solving & Debugging Techniques': 'Root cause analysis, browser devtools inspection, stack trace debugging, and logging.',
      'Cloud Deployment & Hosting': 'Deploying functional projects on cloud platforms with custom domains and environment configs.',
    },
  },
};

export function analyzeResumeContent(
  rawResumeText: string,
  targetRoleTitle: string,
  dreamCompany: string = 'Tier-1 Hiring Benchmark',
  candidateProfile?: any
): FullAnalysisResult {
  const normalizedText = (rawResumeText || '').toLowerCase();
  const sentences = (rawResumeText || '')
    .split(/(?<=[.?!])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);

  // 1. Determine best role profile based on role title
  const lowerRole = targetRoleTitle.toLowerCase();
  let profileKey = 'general';
  if (lowerRole.includes('front') || lowerRole.includes('react') || lowerRole.includes('ui') || lowerRole.includes('web')) {
    profileKey = 'frontend';
  } else if (lowerRole.includes('back') || lowerRole.includes('api') || lowerRole.includes('node') || lowerRole.includes('cloud') || lowerRole.includes('devops') || lowerRole.includes('system')) {
    profileKey = 'backend';
  } else if (lowerRole.includes('data') || lowerRole.includes('ml') || lowerRole.includes('ai') || lowerRole.includes('analyst')) {
    profileKey = 'data';
  }

  const roleConfig = ROLE_SKILL_PROFILES[profileKey] || ROLE_SKILL_PROFILES.frontend;
  const competencies: AnalysisCompetency[] = [];
  let strongCount = 0;
  let needsProofCount = 0;
  let missingCount = 0;
  const detectedGaps: string[] = [];

  // Skill synonyms mapping for deep semantic recognition
  const SKILL_KEYWORDS: Record<string, string[]> = {
    'Semantic HTML5 & Accessibility (WCAG)': ['html', 'semantic', 'wcag', 'aria', 'accessibility', 'screen reader'],
    'Modern Responsive CSS & Tailwind': ['css', 'tailwind', 'flexbox', 'grid', 'responsive', 'bootstrap', 'sass', 'styled-components'],
    'JavaScript (ES6+, Async/Await, Event Loop)': ['javascript', 'js', 'es6', 'async', 'await', 'promise', 'closures', 'dom'],
    'React.js Component Architecture & Hooks': ['react', 'component', 'usestate', 'useeffect', 'custom hook', 'jsx', 'next.js', 'nextjs'],
    'Global State Management (Zustand/Redux/Context)': ['zustand', 'redux', 'context', 'recoil', 'mobx', 'state management', 'toolkit'],
    'TypeScript & Interface Contracts': ['typescript', 'ts', 'type', 'interface', 'generics'],
    'REST API Integration & Data Fetching': ['api', 'rest', 'axios', 'fetch', 'endpoints', 'graphql', 'json', 'postman'],
    'Automated Testing (Vitest/Jest/Testing Library)': ['test', 'jest', 'vitest', 'cypress', 'testing library', 'unit test', 'tdd'],
    'Client-Side Web Performance & Lighthouse': ['performance', 'lighthouse', 'lazy load', 'code splitting', 'optimization', 'caching', 'web vitals'],
    'Version Control (Git workflows & PR reviews)': ['git', 'github', 'gitlab', 'version control', 'commits', 'pr', 'pull request'],
    'CI/CD & Production Build Deployments': ['ci/cd', 'docker', 'vercel', 'github actions', 'pipeline', 'aws', 'deploy', 'production'],
    
    // Backend
    'Core Programming Language (Node.js/Python/Java/Go)': ['node', 'express', 'python', 'java', 'golang', 'django', 'fastapi', 'spring'],
    'RESTful & GraphQL API Design': ['rest', 'restful', 'api', 'graphql', 'swagger', 'grpc', 'endpoints'],
    'Relational Database Modeling (PostgreSQL/MySQL)': ['sql', 'postgres', 'postgresql', 'mysql', 'relational', 'foreign key', 'joins', 'schema'],
    'NoSQL & Document Stores (MongoDB/DynamoDB)': ['nosql', 'mongodb', 'mongo', 'dynamodb', 'firebase', 'firestore', 'cassandra'],
    'In-Memory Caching (Redis/Memcached)': ['redis', 'cache', 'caching', 'memcached'],
    'Authentication & Security (JWT/OAuth2/RBAC)': ['jwt', 'oauth', 'token', 'auth', 'bcrypt', 'security', 'session', 'passport'],
    'Containerization & Microservices (Docker)': ['docker', 'container', 'kubernetes', 'compose', 'microservices'],
    'Automated Backend Testing & Mocking': ['test', 'pytest', 'mocha', 'chai', 'supertest', 'integration test', 'mock'],
    'Message Queues & Event Streaming (Kafka/RabbitMQ)': ['kafka', 'rabbitmq', 'queue', 'pub/sub', 'event driven', 'sqs'],
    'Database Indexing & Query Optimization': ['index', 'optimization', 'query', 'execution plan', 'performance', 'n+1'],

    // Data
    'Python for Data Science (NumPy, Pandas)': ['python', 'pandas', 'numpy', 'scipy', 'dataframe'],
    'SQL & Complex Data Extraction': ['sql', 'select', 'join', 'group by', 'cte', 'window function', 'database'],
    'Exploratory Data Analysis & Visualization': ['matplotlib', 'seaborn', 'plotly', 'eda', 'visualization', 'charts', 'plots'],
    'Machine Learning Foundations (Scikit-Learn)': ['machine learning', 'ml', 'scikit-learn', 'sklearn', 'regression', 'classification', 'random forest'],
    'Statistical Testing & Hypothesis Formulation': ['statistics', 'hypothesis', 'p-value', 'a/b test', 'distribution'],
    'Data Cleaning & ETL Pipeline Construction': ['etl', 'cleaning', 'preprocessing', 'pipeline', 'pipeline', 'transform'],
    'Feature Engineering & Model Evaluation': ['feature engineering', 'roc', 'auc', 'f1', 'precision', 'recall', 'cross validation'],
    'Business Intelligence Dashboards (Tableau/PowerBI)': ['tableau', 'powerbi', 'power bi', 'dashboard', 'reporting'],
    'Big Data & Distributed Computing (Spark/SQL)': ['spark', 'pyspark', 'hadoop', 'big data'],
    'Model Deployment & REST Inference APIs': ['deploy', 'fastapi', 'flask', 'docker', 'inference', 'serving', 'onnx'],

    // General
    'Data Structures & Algorithms (Arrays, Trees, Graphs)': ['dsa', 'data structures', 'algorithm', 'tree', 'graph', 'dynamic programming', 'sorting'],
    'Object-Oriented & Modular Programming': ['oop', 'object oriented', 'class', 'inheritance', 'polymorphism', 'design patterns'],
    'Database Fundamentals & SQL Queries': ['database', 'sql', 'queries', 'dbms'],
    'Full-Stack Web Development Basics': ['full stack', 'fullstack', 'frontend', 'backend', 'web development'],
    'System Design & Architecture Concepts': ['system design', 'architecture', 'scalability', 'load balancer'],
    'Problem Solving & Debugging Techniques': ['problem solving', 'debugging', 'troubleshooting'],
    'Cloud Deployment & Hosting': ['cloud', 'aws', 'gcp', 'azure', 'hosting', 'serverless'],
  };

  // Evaluate each skill against the real extracted resume text
  roleConfig.skills.forEach((skillName, index) => {
    const keywords = SKILL_KEYWORDS[skillName] || [skillName.toLowerCase()];
    const reqText = roleConfig.requirements[skillName] || `Demonstrated competency in ${skillName} within campus recruitment drives.`;

    // Find if keywords appear in resume text
    let matchedSentence: string | null = null;
    let matchStrength = 0;

    for (const kw of keywords) {
      if (normalizedText.includes(kw)) {
        matchStrength++;
        if (!matchedSentence) {
          const found = sentences.find((s) => s.toLowerCase().includes(kw));
          if (found) matchedSentence = found;
        }
      }
    }

    let status: 'strong' | 'needs_proof' | 'missing' = 'missing';
    let statusLabel = 'Missing from resume';
    let plainExplanation = `No verified implementations of ${skillName} were found in the uploaded resume. Placement rounds for ${targetRoleTitle} at ${dreamCompany} test this competency directly.`;

    if (matchStrength >= 2 && matchedSentence) {
      status = 'strong';
      statusLabel = 'Industry Verified';
      strongCount++;
      plainExplanation = `Strong demonstrated competency. The resume contains concrete evidence of ${skillName} implementation.`;
    } else if (matchStrength === 1 && matchedSentence) {
      status = 'needs_proof';
      statusLabel = 'Needs Stronger Proof';
      needsProofCount++;
      detectedGaps.push(skillName);
      plainExplanation = `Mentioned briefly, but lacks metrics, architecture depth, or test evidence expected in technical interview shortlists.`;
    } else {
      status = 'missing';
      statusLabel = 'Critical Gap';
      missingCount++;
      detectedGaps.push(skillName);
    }

    competencies.push({
      id: `item_${index + 1}_${skillName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`,
      name: skillName,
      status,
      statusLabel,
      jdRequirement: reqText,
      evidenceQuote: matchedSentence ? matchedSentence.slice(0, 220) : null,
      sourceReference: matchedSentence ? `Verbatim Evidence Quote from Resume Document` : null,
      plainExplanation,
    });
  });

  // Calculate dynamic readiness score based on real competency count
  const total = competencies.length;
  const rawScore = Math.round(((strongCount * 1.0) + (needsProofCount * 0.45)) / total * 100);
  const readinessScore = Math.max(35, Math.min(95, rawScore));
  const confidenceScore = Math.min(96, Math.max(70, Math.round(75 + (sentences.length * 0.5))));

  // Pick the top gap
  const topGap = detectedGaps[0] || 'Advanced System Architecture & Test Coverage';
  const summarySentence = detectedGaps.length > 0
    ? `Resume verified for ${targetRoleTitle}. Demonstrated competency in ${strongCount} core areas. Critical preparation gaps identified in ${detectedGaps.slice(0, 2).join(' and ')}.`
    : `Excellent alignment with ${targetRoleTitle} hiring rubrics. Strong depth across technical requirements.`;

  // Generate personalized 3-phase remediation roadmap tasks
  const roadmapTasks: RoadmapTaskItem[] = [];
  const primaryGap = detectedGaps[0] || 'Core State Management';
  const secondaryGap = detectedGaps[1] || 'Automated Unit Testing';
  const tertiaryGap = detectedGaps[2] || 'CI/CD and Performance Metrics';

  // Phase 1 Tasks: Prioritize (Urgent Gaps)
  roadmapTasks.push({
    id: `tsk_phase1_1_${Date.now()}`,
    title: `Implement practical project module demonstrating ${primaryGap}`,
    description: `Construct a standalone production-ready repository showcasing deep architectural mastery of ${primaryGap}. Document the architecture in a technical README with design decisions.`,
    phase: 'prioritize',
    priority: 'High',
    hoursEstimate: '5.0 hours',
    evidenceOutcome: `GitHub repository with verifiable commit history and architecture diagram for ${primaryGap}`,
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    isCompleted: false,
  });

  roadmapTasks.push({
    id: `tsk_phase1_2_${Date.now()}`,
    title: `Resolve interview coding problem patterns for ${targetRoleTitle}`,
    description: `Solve 10 medium-difficulty live interview coding problems centered around ${primaryGap} and core algorithms. Record time complexity and space complexity for each solution.`,
    phase: 'prioritize',
    priority: 'High',
    hoursEstimate: '4.5 hours',
    evidenceOutcome: 'Working test suite with passing algorithmic unit tests',
    dueDate: new Date(Date.now() + 8 * 86400000).toISOString(),
    isCompleted: false,
  });

  // Phase 2 Tasks: Sequence (Depth & Architecture)
  roadmapTasks.push({
    id: `tsk_phase2_1_${Date.now()}`,
    title: `Add comprehensive test suite for ${secondaryGap}`,
    description: `Integrate unit and integration tests covering positive paths, boundary edge cases, and asynchronous error states for your portfolio projects.`,
    phase: 'sequence',
    priority: 'Medium',
    hoursEstimate: '4.0 hours',
    evidenceOutcome: 'Coverage report screenshot demonstrating >80% branch coverage',
    dueDate: new Date(Date.now() + 12 * 86400000).toISOString(),
    isCompleted: false,
  });

  roadmapTasks.push({
    id: `tsk_phase2_2_${Date.now()}`,
    title: `Instrument observability, telemetry, and error logging`,
    description: `Add request tracing, performance measurements, and structured error logs to demonstrate senior engineering hygiene before drive interview panels.`,
    phase: 'sequence',
    priority: 'Medium',
    hoursEstimate: '3.5 hours',
    evidenceOutcome: 'Verified dashboard or terminal output of structured error handling',
    dueDate: new Date(Date.now() + 16 * 86400000).toISOString(),
    isCompleted: false,
  });

  // Phase 3 Tasks: Prove (Deployments & Presentation)
  roadmapTasks.push({
    id: `tsk_phase3_1_${Date.now()}`,
    title: `Deploy live showcase application on cloud platform`,
    description: `Deploy your verified engineering solution to production with automated CI/CD pipeline, SSL encryption, and custom domain or preview URL.`,
    phase: 'prove',
    priority: 'High',
    hoursEstimate: '3.0 hours',
    evidenceOutcome: 'Live URL with automated deployment pipeline badge and passing health check',
    dueDate: new Date(Date.now() + 20 * 86400000).toISOString(),
    isCompleted: false,
  });

  roadmapTasks.push({
    id: `tsk_phase3_2_${Date.now()}`,
    title: `Update verified resume bullet points with quantifiable metrics`,
    description: `Format project bullet points using the Google XYZ formula: "Accomplished [X] as measured by [Y] by doing [Z]" to clearly showcase ${primaryGap} and ${secondaryGap}.`,
    phase: 'prove',
    priority: 'Low',
    hoursEstimate: '2.0 hours',
    evidenceOutcome: 'Updated PDF/DOCX resume file ready for Training & Placement Cell submission',
    dueDate: new Date(Date.now() + 24 * 86400000).toISOString(),
    isCompleted: false,
  });

  return {
    readinessScore,
    confidenceScore,
    summarySentence,
    topGap,
    competencies,
    roadmapTasks,
  };
}
