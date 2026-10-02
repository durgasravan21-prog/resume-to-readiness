import { describe, it, expect } from 'vitest';
import { validateFileMagicBytes } from '../server/parsing/magic-bytes';

describe('File Upload Security & Magic Byte Inspection (Phase 5)', () => {
  it('accepts legitimate PDF files beginning with %PDF-', () => {
    const validPdfBuffer = Buffer.from('%PDF-1.7\nSample resume content');
    const result = validateFileMagicBytes(validPdfBuffer, '.pdf');
    expect(result.valid).toBe(true);
  });

  it('accepts legitimate DOCX files beginning with PK zip header', () => {
    const validDocxBuffer = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]);
    const result = validateFileMagicBytes(validDocxBuffer, '.docx');
    expect(result.valid).toBe(true);
  });

  it('rejects renamed Windows executables (.exe renamed to .pdf)', () => {
    // MZ signature
    const exeBuffer = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00]);
    const result = validateFileMagicBytes(exeBuffer, '.pdf');
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('MZ header detected');
  });

  it('rejects renamed Linux binaries (ELF renamed to .pdf)', () => {
    const elfBuffer = Buffer.from([0x7f, 0x45, 0x4c, 0x46, 0x02, 0x01]);
    const result = validateFileMagicBytes(elfBuffer, '.pdf');
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('ELF header detected');
  });

  it('rejects zero-byte empty files', () => {
    const zeroByte = Buffer.alloc(0);
    const result = validateFileMagicBytes(zeroByte, '.pdf');
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Empty file payload');
  });

  it('rejects HTML/Script files spoofed as PDF', () => {
    const htmlSpoof = Buffer.from('<html><script>alert(1)</script></html>');
    const result = validateFileMagicBytes(htmlSpoof, '.pdf');
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('missing %PDF signature');
  });
});
