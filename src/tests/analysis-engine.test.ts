import { describe, it, expect } from 'vitest';
import { analyzeResumeContent } from '@/server/ai/engine';

describe('AI Analysis Engine — analyzeResumeContent', () => {
  const sampleResumeText = `
    John Doe | B.Tech Computer Science
    Built responsive web application using React.js with custom hooks and component architecture.
    Implemented REST API integration with Axios for fetching product catalog data.
    Used CSS Grid and Tailwind CSS for pixel-perfect responsive layouts.
    Wrote basic Jest snapshot tests for navigation component.
    Deployed portfolio on Vercel with GitHub Actions CI/CD pipeline.
    Familiar with JavaScript ES6+ features including async/await and closures.
    Worked with Git for version control and collaborative pull requests.
    Created semantic HTML5 markup with ARIA landmarks for accessibility.
  `;

  it('should return a valid analysis result with all required fields', () => {
    const result = analyzeResumeContent(sampleResumeText, 'Junior Frontend Developer');
    expect(result).toBeDefined();
    expect(result.readinessScore).toBeGreaterThanOrEqual(35);
    expect(result.readinessScore).toBeLessThanOrEqual(95);
    expect(result.confidenceScore).toBeGreaterThanOrEqual(70);
    expect(result.summarySentence).toBeTruthy();
    expect(result.topGap).toBeTruthy();
    expect(result.competencies).toBeInstanceOf(Array);
    expect(result.competencies.length).toBeGreaterThan(0);
    expect(result.roadmapTasks).toBeInstanceOf(Array);
    expect(result.roadmapTasks.length).toBeGreaterThan(0);
  });

  it('should detect React as strong when resume mentions react and hooks', () => {
    const result = analyzeResumeContent(sampleResumeText, 'Junior Frontend Developer');
    const reactItem = result.competencies.find((c) => c.name.toLowerCase().includes('react'));
    expect(reactItem).toBeDefined();
    expect(reactItem!.status).toBe('strong');
    expect(reactItem!.evidenceQuote).toBeTruthy();
  });

  it('should detect missing skills when resume has no mention', () => {
    const result = analyzeResumeContent(sampleResumeText, 'Junior Frontend Developer');
    const missingItems = result.competencies.filter((c) => c.status === 'missing');
    // Should detect at least TypeScript and State Management as missing
    expect(missingItems.length).toBeGreaterThan(0);
    const missingNames = missingItems.map((c) => c.name.toLowerCase());
    const hasTSOrState = missingNames.some((n) => n.includes('typescript') || n.includes('state'));
    expect(hasTSOrState).toBe(true);
  });

  it('should use frontend skills for frontend role', () => {
    const result = analyzeResumeContent(sampleResumeText, 'Frontend Developer at Razorpay');
    const skillNames = result.competencies.map((c) => c.name.toLowerCase());
    expect(skillNames.some((n) => n.includes('html') || n.includes('css'))).toBe(true);
  });

  it('should use backend skills for backend role', () => {
    const result = analyzeResumeContent(sampleResumeText, 'Backend Engineer');
    const skillNames = result.competencies.map((c) => c.name.toLowerCase());
    expect(skillNames.some((n) => n.includes('api') || n.includes('database'))).toBe(true);
  });

  it('should use data skills for data analyst role', () => {
    const result = analyzeResumeContent(sampleResumeText, 'Data Analyst');
    const skillNames = result.competencies.map((c) => c.name.toLowerCase());
    expect(skillNames.some((n) => n.includes('python') || n.includes('sql'))).toBe(true);
  });

  it('should generate 3-phase roadmap tasks (prioritize, sequence, prove)', () => {
    const result = analyzeResumeContent(sampleResumeText, 'Junior Frontend Developer');
    const phases = new Set(result.roadmapTasks.map((t) => t.phase));
    expect(phases.has('prioritize')).toBe(true);
    expect(phases.has('sequence')).toBe(true);
    expect(phases.has('prove')).toBe(true);
  });

  it('should produce different scores for vastly different resumes', () => {
    const strongResume = `
      Expert in React, TypeScript, Zustand, Redux, Vitest, Jest, CI/CD, Docker, AWS.
      Built production-grade applications with comprehensive test coverage.
      Implemented global state management using Zustand with persistent storage.
      TypeScript strict mode across all projects with generics and type guards.
      Automated testing with Vitest achieving 95% coverage.
      Deployed via GitHub Actions CI/CD pipeline to Vercel production.
      Lighthouse score 98 with code splitting and lazy loading.
      Semantic HTML5 with WCAG 2.1 AA compliance and screen reader support.
      CSS Grid and Tailwind CSS for responsive layouts.
      REST API integration with Axios and SWR for data fetching.
      Git flow with conventional commits and PR reviews.
    `;
    const weakResume = 'I am looking for a job.';

    const strongResult = analyzeResumeContent(strongResume, 'Junior Frontend Developer');
    const weakResult = analyzeResumeContent(weakResume, 'Junior Frontend Developer');

    expect(strongResult.readinessScore).toBeGreaterThan(weakResult.readinessScore);
  });

  it('should include evidence quotes only when found in resume text', () => {
    const result = analyzeResumeContent(sampleResumeText, 'Junior Frontend Developer');
    for (const comp of result.competencies) {
      if (comp.status === 'missing') {
        expect(comp.evidenceQuote).toBeNull();
      }
    }
  });

  it('should produce valid roadmap task fields', () => {
    const result = analyzeResumeContent(sampleResumeText, 'Junior Frontend Developer');
    for (const task of result.roadmapTasks) {
      expect(task.id).toBeTruthy();
      expect(task.title).toBeTruthy();
      expect(task.description).toBeTruthy();
      expect(['prioritize', 'sequence', 'prove']).toContain(task.phase);
      expect(['High', 'Medium', 'Low']).toContain(task.priority);
      expect(task.hoursEstimate).toBeTruthy();
      expect(task.isCompleted).toBe(false);
    }
  });
});

describe('AI Analysis Engine — Role Detection', () => {
  it('should detect "React Developer" as frontend', () => {
    const result = analyzeResumeContent('test resume', 'React Developer');
    const hasCSS = result.competencies.some((c) => c.name.toLowerCase().includes('css'));
    expect(hasCSS).toBe(true);
  });

  it('should detect "Node.js Backend" as backend', () => {
    const result = analyzeResumeContent('test resume', 'Node.js Backend Developer');
    const hasDB = result.competencies.some((c) => c.name.toLowerCase().includes('database') || c.name.toLowerCase().includes('api'));
    expect(hasDB).toBe(true);
  });

  it('should detect "ML Engineer" as data', () => {
    const result = analyzeResumeContent('test resume', 'ML Engineer');
    const hasPython = result.competencies.some((c) => c.name.toLowerCase().includes('python'));
    expect(hasPython).toBe(true);
  });

  it('should fallback to general for unknown roles', () => {
    const result = analyzeResumeContent('test resume', 'Quantum Computing Researcher');
    expect(result.competencies.length).toBeGreaterThan(0);
  });
});

describe('AI Analysis Engine — Edge Cases', () => {
  it('should handle empty resume text gracefully', () => {
    const result = analyzeResumeContent('', 'Frontend Developer');
    expect(result.readinessScore).toBe(35); // Minimum floor
    expect(result.competencies.length).toBeGreaterThan(0);
    expect(result.competencies.every((c) => c.status === 'missing')).toBe(true);
  });

  it('should handle null/undefined resume text gracefully', () => {
    const result = analyzeResumeContent(null as any, 'Frontend Developer');
    expect(result.readinessScore).toBe(35);
    expect(result.roadmapTasks.length).toBeGreaterThan(0);
  });

  it('should handle very long resume text without error', () => {
    const longText = 'React JavaScript TypeScript testing CI/CD. '.repeat(500);
    const result = analyzeResumeContent(longText, 'Frontend Developer');
    expect(result.readinessScore).toBeGreaterThanOrEqual(35);
    expect(result.competencies.length).toBeGreaterThan(0);
  });
});
