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
    // PDF must contain %PDF somewhere in the header (allowing for BOM or leading bytes)
    const headerSlice = buffer.subarray(0, Math.min(buffer.length, 1024)).toString('latin1');
    if (!headerSlice.includes('%PDF')) {
      return { valid: false, reason: 'Corrupted or spoofed PDF document (missing %PDF signature).' };
    }
  } else if (ext === 'docx' || ext === 'doc') {
    // DOCX is a zip archive (0x50, 0x4B), DOC is OLE CFBF (0xD0, 0xCF, 0x11, 0xE0)
    const isZip = buffer.length >= 2 && buffer[0] === 0x50 && buffer[1] === 0x4b;
    const isOle = buffer.length >= 4 && buffer[0] === 0xd0 && buffer[1] === 0xcf && buffer[2] === 0x11 && buffer[3] === 0xe0;
    const isRtf = buffer.length >= 5 && buffer.subarray(0, 5).toString('latin1').startsWith('{\\rtf');
    const hasXmlOrWord = buffer.subarray(0, 200).toString('latin1').toLowerCase().includes('word');
    if (!isZip && !isOle && !isRtf && !hasXmlOrWord) {
      return { valid: false, reason: 'Corrupted or unreadable document. Please upload a standard .docx or .pdf file.' };
    }
  }

  return { valid: true };
}
