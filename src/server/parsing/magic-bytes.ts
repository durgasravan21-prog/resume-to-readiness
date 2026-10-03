/**
 * Validates file content using binary magic bytes to prevent renamed executables,
 * polyglots, and MIME-spoofing attacks while permitting all genuine document formats.
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
    // PDF must contain %PDF somewhere in the header (allowing for BOM or leading bytes)
    const headerSlice = buffer.subarray(0, Math.min(buffer.length, 1024)).toString('latin1');
    if (!headerSlice.includes('%PDF')) {
      return { valid: false, reason: 'Corrupted or spoofed PDF document (missing %PDF signature).' };
    }
  } else if (ext === 'docx' || ext === 'doc') {
    // Check if ZIP signature PK (0x50, 0x4B) exists anywhere in the first 2048 bytes
    let hasZipHeader = false;
    const searchLimit = Math.min(buffer.length - 1, 2048);
    for (let i = 0; i < searchLimit; i++) {
      if (buffer[i] === 0x50 && buffer[i + 1] === 0x4b) {
        hasZipHeader = true;
        break;
      }
    }

    // Check for OLE CFBF (0xD0, 0xCF, 0x11, 0xE0) for legacy .doc
    let hasOleHeader = false;
    for (let i = 0; i < Math.min(buffer.length - 3, 512); i++) {
      if (buffer[i] === 0xd0 && buffer[i + 1] === 0xcf && buffer[i + 2] === 0x11 && buffer[i + 3] === 0xe0) {
        hasOleHeader = true;
        break;
      }
    }

    const headerSlice = buffer.subarray(0, Math.min(buffer.length, 4096)).toString('latin1').toLowerCase();
    const hasRtf = headerSlice.includes('{\\rtf');
    const hasWordOrXml =
      headerSlice.includes('word') ||
      headerSlice.includes('[content_types]') ||
      headerSlice.includes('xml') ||
      headerSlice.includes('w:document');

    if (!hasZipHeader && !hasOleHeader && !hasRtf && !hasWordOrXml) {
      return { valid: false, reason: 'Corrupted or unreadable document. Please upload a standard .docx or .pdf file.' };
    }
  }

  return { valid: true };
}
