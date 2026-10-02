import { describe, it, expect } from 'vitest';
import { sanitizeResumePII } from '../server/parsing/sanitize-pii';
import { classifyResumeText } from '../server/parsing/classify-resume';

describe('PII Sanitizer', () => {
  it('redacts Indian 12-digit Aadhaar numbers', () => {
    const raw = 'Candidate Aadhaar: 2345 6789 0123, resident of Bangalore.';
    const result = sanitizeResumePII(raw);
    expect(result.sanitizedText).toContain('[REDACTED_AADHAAR]');
    expect(result.sanitizedText).not.toContain('2345 6789 0123');
    expect(result.redactedCount).toBe(1);
  });

  it('redacts Indian 10-character PAN card numbers', () => {
    const raw = 'Identity verification: PAN ABCDE1234F recorded for payroll.';
    const result = sanitizeResumePII(raw);
    expect(result.sanitizedText).toContain('[REDACTED_PAN]');
    expect(result.sanitizedText).not.toContain('ABCDE1234F');
    expect(result.redactedCount).toBe(1);
  });

  it('redacts Indian Passport numbers', () => {
    const raw = 'Travel passport number: Z1234567 issued in 2022.';
    const result = sanitizeResumePII(raw);
    expect(result.sanitizedText).toContain('[REDACTED_PASSPORT]');
    expect(result.sanitizedText).not.toContain('Z1234567');
  });

  it('preserves technical skills, email addresses, and phone numbers', () => {
    const raw = 'Contact: aarav@college.edu | Skills: React, TypeScript, Node.js | CGPA: 8.45';
    const result = sanitizeResumePII(raw);
    expect(result.sanitizedText).toContain('aarav@college.edu');
    expect(result.sanitizedText).toContain('React, TypeScript, Node.js');
    expect(result.sanitizedText).toContain('CGPA: 8.45');
    expect(result.redactedCount).toBe(0);
  });
});

describe('Resume Classifier', () => {
  it('accepts legitimate technical resume with standard sections', () => {
    const resumeText = `
      AARAV SUNDARAM
      Education:
      B.Tech Computer Science & Engineering, National Institute of Engineering, CGPA: 8.45
      Technical Skills:
      React.js, TypeScript, PostgreSQL, Tailwind CSS, Git
      Experience & Projects:
      Built full-stack e-commerce application using React and Zustand.
      Achievements:
      Smart India Hackathon Finalist
    `;
    const result = classifyResumeText(resumeText);
    expect(result.isResume).toBe(true);
    expect(result.detectedSections.length).toBeGreaterThanOrEqual(3);
  });

  it('rejects invoices and financial payment receipts', () => {
    const invoiceText = `
      TAX INVOICE
      Invoice Number: INV-2025-001
      Bill To: ACME Corporation
      Total Amount Due: $1,450.00
      Payment receipt attached. GSTIN: 29AAAAA0000A1Z5
    `;
    const result = classifyResumeText(invoiceText);
    expect(result.isResume).toBe(false);
    expect(result.reason).toContain('financial receipt');
  });

  it('rejects arbitrary short text lacking resume sections', () => {
    const randomText = 'Hello world this is some random document without any structure.';
    const result = classifyResumeText(randomText);
    expect(result.isResume).toBe(false);
  });
});
