import mammoth from 'mammoth';
import { isScannedOrUnreadable } from './detect-scanned';

export interface ExtractedDocxResult {
  text: string;
  hasTextLayer: boolean;
  error?: string;
}

export async function extractDocxText(buffer: Buffer): Promise<ExtractedDocxResult> {
  let text = '';
  try {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value || '';
  } catch (err: any) {
    console.warn('Mammoth extraction notice:', err?.message);
  }

  // If mammoth gave little or no text (e.g. binary doc or complex packaging), extract printable strings
  if (!text || text.trim().length < 50) {
    const rawString = buffer.toString('latin1');
    const printableChunks = rawString.match(/[\w\s.,;:/\-()@#+&]{4,}/g) || [];
    const filtered = printableChunks
      .filter((s) => !s.startsWith('word/') && !s.startsWith('[Content_') && !s.startsWith('theme/'))
      .map((s) => s.trim())
      .filter((s) => s.length > 3);
    if (filtered.length > 5) {
      text = filtered.join(' ');
    }
  }

  const hasTextLayer = !isScannedOrUnreadable(text);

  return {
    text,
    hasTextLayer: hasTextLayer || text.length >= 50,
  };
}
