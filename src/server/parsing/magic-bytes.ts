/**
 * Validates file content using binary magic bytes to prevent renamed executables,
 * polyglots, and MIME-spoofing attacks.
 */
export function validateFileMagicBytes(buffer: Buffer, expectedExtension: string): { valid: boolean; reason?: string } {
  if (!buffer || buffer.length === 0) {
    return { valid: false, reason: 'Empty file payload (0 bytes).' };
  }

  const ext = expectedExtension.toLowerCase().replace(/^\./, '');

  // Check for executable binary signatures (MZ = Windows PE/EXE, ELF = Linux binary)
  if (buffer.length >= 2 && buffer[0] === 0x4d && buffer[1] === 0x5a) {
    return { valid: false, reason: 'Disallowed executable binary format (MZ header detected).' };
  }

  if (buffer.length >= 4 && buffer[0] === 0x7f && buffer[1] === 0x45 && buffer[2] === 0x4c && buffer[3] === 0x46) {
    return { valid: false, reason: 'Disallowed executable binary format (ELF header detected).' };
  }

  if (ext === 'pdf') {
    // PDF must begin with %PDF- (0x25, 0x50, 0x44, 0x46)
    if (buffer.length < 5 || buffer[0] !== 0x25 || buffer[1] !== 0x50 || buffer[2] !== 0x44 || buffer[3] !== 0x46) {
      return { valid: false, reason: 'Corrupted or spoofed PDF document (missing %PDF signature).' };
    }
  } else if (ext === 'docx') {
    // DOCX is a zip archive, must begin with PK\x03\x04 (0x50, 0x4B, 0x03, 0x04)
    if (buffer.length < 4 || buffer[0] !== 0x50 || buffer[1] !== 0x4b || buffer[2] !== 0x03 || buffer[3] !== 0x04) {
      return { valid: false, reason: 'Corrupted or spoofed DOCX document (missing PK zip signature).' };
    }
  } else {
    return { valid: false, reason: `Unsupported file extension: .${ext}` };
  }

  return { valid: true };
}
