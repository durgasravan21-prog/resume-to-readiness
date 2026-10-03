import mammoth from 'mammoth';
import zlib from 'zlib';
import { isScannedOrUnreadable } from './detect-scanned';

export interface ExtractedDocxResult {
  text: string;
  hasTextLayer: boolean;
  error?: string;
}

/**
 * Extracts raw XML text from a DOCX zip container by locating word/document.xml
 * and decompressing via native Node.js zlib.
 */
function extractFromZipBuffer(buf: Buffer): string | null {
  try {
    let pos = 0;
    while (pos < buf.length - 30) {
      // Local file header signature: PK\x03\x04
      if (buf[pos] === 0x50 && buf[pos + 1] === 0x4b && buf[pos + 2] === 0x03 && buf[pos + 3] === 0x04) {
        const compMethod = buf.readUInt16LE(pos + 8);
        const compSize = buf.readUInt32LE(pos + 18);
        const fnLen = buf.readUInt16LE(pos + 26);
        const extraLen = buf.readUInt16LE(pos + 28);
        const fn = buf.subarray(pos + 30, pos + 30 + fnLen).toString('utf8');
        const dataStart = pos + 30 + fnLen + extraLen;

        if (fn === 'word/document.xml' || fn.endsWith('/document.xml')) {
          const compressed = buf.subarray(dataStart, dataStart + compSize);
          const decompressed = compMethod === 8 ? zlib.inflateRawSync(compressed) : compressed;
          const xml = decompressed.toString('utf8');

          // Extract text runs inside <w:t> tags
          const textRuns: string[] = [];
          const regex = /<w:t[^>]*>([\s\S]*?)<\/w:t>/gi;
          let match;
          while ((match = regex.exec(xml)) !== null) {
            textRuns.push(match[1]);
          }

          if (textRuns.length > 0) {
            return textRuns.join(' ').replace(/\s+/g, ' ').trim();
          }

          // Fallback: strip all XML tags
          return xml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        }

        pos = dataStart + (compSize > 0 ? compSize : 0);
      } else {
        pos++;
      }
    }
  } catch (err) {
    console.warn('Native zip parser notice:', err);
  }
  return null;
}

/**
 * Extracts plain text from legacy Word 97-2003 binary (.doc) files via UTF-16LE and ASCII extraction.
 */
function extractLegacyDocText(buf: Buffer): string {
  try {
    // 1. Try UTF-16LE decoding (Word stores strings in 16-bit unicode)
    const utf16 = buf.toString('utf16le');
    const utf16Chunks = utf16.match(/[\w\s.,;:/\-()@#+&]{4,}/g) || [];
    const valid16 = utf16Chunks
      .map((s) => s.trim())
      .filter((s) => s.length >= 4 && !s.includes('Root Entry') && !s.includes('WordDocument'));

    if (valid16.length > 5) {
      return valid16.join(' ').replace(/\s+/g, ' ').trim();
    }

    // 2. Try ANSI ASCII decoding
    const latin = buf.toString('latin1');
    const latinChunks = latin.match(/[\w\s.,;:/\-()@#+&]{4,}/g) || [];
    const validLatin = latinChunks
      .map((s) => s.trim())
      .filter((s) => s.length >= 4 && !s.includes('CompObj') && !s.includes('SummaryInformation'));

    if (validLatin.length > 5) {
      return validLatin.join(' ').replace(/\s+/g, ' ').trim();
    }
  } catch (err) {
    console.warn('Legacy doc extraction notice:', err);
  }
  return '';
}

/**
 * Extracts text from RTF (Rich Text Format) documents.
 */
function extractRtfText(buf: Buffer): string {
  try {
    const raw = buf.toString('utf8');
    if (raw.includes('{\\rtf')) {
      return raw
        .replace(/\\par[d]?/gi, '\n')
        .replace(/\\tab/gi, '\t')
        .replace(/\\[a-zA-Z0-9]+(-?[0-9]+)? ?/g, '')
        .replace(/[{}]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    }
  } catch (err) {}
  return '';
}

export async function extractDocxText(buffer: Buffer): Promise<ExtractedDocxResult> {
  let text = '';

  // 1. Try Mammoth (best for standard .docx OpenXML)
  try {
    const result = await mammoth.extractRawText({ buffer });
    text = (result.value || '').trim();
  } catch (err: any) {
    console.warn('Mammoth extraction note:', err?.message);
  }

  // 2. If mammoth failed or returned sparse text, try native ZIP OpenXML extraction
  if (!text || text.length < 50) {
    const zipText = extractFromZipBuffer(buffer);
    if (zipText && zipText.length > text.length) {
      text = zipText;
    }
  }

  // 3. If still sparse, check for RTF format
  if (!text || text.length < 50) {
    const rtfText = extractRtfText(buffer);
    if (rtfText && rtfText.length > text.length) {
      text = rtfText;
    }
  }

  // 4. If still sparse, check for legacy Word 97-2003 (.doc) binary format
  if (!text || text.length < 50) {
    const docText = extractLegacyDocText(buffer);
    if (docText && docText.length > text.length) {
      text = docText;
    }
  }

  // 5. Fallback: string matching on XML / HTML / printable words
  if (!text || text.length < 50) {
    try {
      const rawString = buffer.toString('utf8');
      if (rawString.includes('<') && rawString.includes('>')) {
        const stripped = rawString
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        if (stripped.length >= 40) {
          text = stripped;
        }
      }
    } catch (e) {}
  }

  // 6. Last resort: extract any printable text sequences
  if (!text || text.length < 30) {
    const rawLatin = buffer.toString('latin1');
    const printableMatches = rawLatin.match(/[a-zA-Z0-9\s.,;:'"()@#+-]{4,}/g) || [];
    const cleanWords = printableMatches
      .map((s) => s.trim())
      .filter((s) => s.length >= 3 && !s.startsWith('[Content_') && !s.startsWith('word/'));
    if (cleanWords.length > 5) {
      text = cleanWords.join(' ').replace(/\s+/g, ' ').trim();
    }
  }

  const hasTextLayer = !isScannedOrUnreadable(text) || text.length >= 20;

  return {
    text: text.trim(),
    hasTextLayer,
  };
}
