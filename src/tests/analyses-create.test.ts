import { describe, it, expect } from 'vitest';
import { validateFileMagicBytes } from '@/server/parsing/magic-bytes';
import { classifyResumeText } from '@/server/parsing/classify-resume';
import { sanitizeResumePII } from '@/server/parsing/sanitize-pii';
import { analyzeResumeContent } from '@/server/ai/engine';

describe('Analysis Creation Pipeline — Integration Flow', () => {
  it('should validate PDF magic bytes correctly', () => {
    const validPdfBuffer = Buffer.from('%PDF-1.7\nSample content');
    expect(validateFileMagicBytes(validPdfBuffer, '.pdf').valid).toBe(true);

    const invalidBuffer = Buffer.from('Not a PDF file content');
    expect(validateFileMagicBytes(invalidBuffer, '.pdf').valid).toBe(false);
  });

  it('should validate DOCX magic bytes correctly', () => {
    const validDocxBuffer = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00]);
    expect(validateFileMagicBytes(validDocxBuffer, '.docx').valid).toBe(true);

    const invalidBuffer = Buffer.from('Just plain text file');
    expect(validateFileMagicBytes(invalidBuffer, '.docx').valid).toBe(false);
  });

  it('should classify resume text and reject invoices/receipts', () => {
    const resumeText = `
      Curriculum Vitae - Engineering Candidate
      Education: B.Tech in Computer Science and Engineering, CGPA 8.7
      Technical Skills: JavaScript, React.js, TypeScript, Next.js, Node.js, Python, Git
      Academic Projects: Developed campus readiness assessment portal with responsive UI
      Certifications: AWS Certified Cloud Practitioner, HackerRank 5-Star Problem Solving
    `;
    const invoiceText = `
      TAX INVOICE / BILL TO:
      Invoice Number: INV-2024-8890
      Bill To: ACME Industrial Corp, 452 Tech Park
      Total Amount Due: INR 45,000.00
      Payment Receipt & GSTIN Verification details.
    `;

    expect(classifyResumeText(resumeText).isResume).toBe(true);
    const invoiceResult = classifyResumeText(invoiceText);
    expect(invoiceResult.isResume).toBe(false);
  });

  it('should sanitize sensitive government PII from resume text', () => {
    const rawResume = `
      Candidate Profile: Aarav Kumar
      Aadhaar: 3456 7890 1234
      PAN: ABCDE1234F
      Passport: M1234567
      Built React component library with 95% test coverage.
    `;
    const { sanitizedText, redactedCount } = sanitizeResumePII(rawResume);
    expect(sanitizedText).toContain('[REDACTED_AADHAAR]');
    expect(sanitizedText).toContain('[REDACTED_PAN]');
    expect(sanitizedText).toContain('[REDACTED_PASSPORT]');
    expect(sanitizedText).not.toContain('3456 7890 1234');
    expect(sanitizedText).not.toContain('ABCDE1234F');
    expect(sanitizedText).toContain('React component library');
    expect(redactedCount).toBe(3);
  });

  it('should run full analysis engine and return score, gaps, and roadmap', () => {
    const sampleText = `
      Software Engineer candidate.
      Experienced in React.js, TypeScript, Next.js, and CSS Grid.
      Deployed production web applications on Vercel with GitHub Actions.
      Familiar with RESTful API integration using Axios.
      Wrote unit tests using Vitest for authentication flow.
    `;
    const result = analyzeResumeContent(sampleText, 'Junior Frontend Developer', 'Razorpay');

    expect(result.readinessScore).toBeGreaterThan(50);
    expect(result.confidenceScore).toBeGreaterThan(70);
    expect(result.summarySentence).toBeTruthy();
    expect(result.topGap).toBeTruthy();
    expect(result.competencies.length).toBeGreaterThan(5);
    expect(result.roadmapTasks.length).toBeGreaterThan(2);

    // Verify roadmap tasks have valid priorities for DB check constraint
    const validPriorities = ['High', 'Medium', 'Low', 'Foundational'];
    for (const task of result.roadmapTasks) {
      expect(validPriorities).toContain(task.priority);
    }
  });
});
