import { describe, it, expect } from 'vitest';

export function sanitizeCsvValue(val: string | number | null | undefined): string {
  const str = String(val ?? '');
  // Prefix formula trigger characters (=, +, -, @, \t, \r) with a single quote to prevent DDE/CSV injection
  if (/^[=+\-@\t\r]/.test(str)) {
    return `"'${str.replace(/"/g, '""')}"`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

export function sanitizeFileName(fileName: string): string {
  // Strip path traversal sequences and illegal filesystem characters
  return fileName
    .replace(/^.*[\\\/]/, '') // remove directory path
    .replace(/[^a-zA-Z0-9._-]/g, '_'); // replace dangerous characters
}

describe('CSV Injection Neutralization (Phase 4)', () => {
  it('neutralizes formula injection characters starting with =', () => {
    const payload = '=cmd|\'/C calc\'!\'A0\'';
    const sanitized = sanitizeCsvValue(payload);
    expect(sanitized).toBe("\"'=cmd|'/C calc'!'A0'\"");
  });

  it('neutralizes formula injection characters starting with +, -, @', () => {
    expect(sanitizeCsvValue('+12345')).toBe("\"'+12345\"");
    expect(sanitizeCsvValue('-1+2*3')).toBe("\"'-1+2*3\"");
    expect(sanitizeCsvValue('@SUM(A1:A10)')).toBe("\"'@SUM(A1:A10)\"");
  });

  it('escapes embedded quotes properly', () => {
    const input = 'Normal "Quote" Test';
    expect(sanitizeCsvValue(input)).toBe('"Normal ""Quote"" Test"');
  });

  it('handles normal alphanumeric text without adding a single quote', () => {
    expect(sanitizeCsvValue('Aarav Sundaram')).toBe('"Aarav Sundaram"');
    expect(sanitizeCsvValue('8.4')).toBe('"8.4"');
  });
});

describe('File Name & Path Traversal Sanitization', () => {
  it('strips directory traversal prefixes (../ and ..\\)', () => {
    expect(sanitizeFileName('../../etc/passwd.pdf')).toBe('passwd.pdf');
    expect(sanitizeFileName('..\\..\\windows\\system32\\cmd.exe.docx')).toBe('cmd.exe.docx');
  });

  it('replaces dangerous and control characters with underscores', () => {
    expect(sanitizeFileName('resume;rm -rf *.pdf')).toBe('resume_rm_-rf__.pdf');
    expect(sanitizeFileName('student<script>.pdf')).toBe('student_script_.pdf');
  });
});
