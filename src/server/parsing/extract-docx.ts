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

  // If text is short, try HTML/XML tag stripping (e.g. web exports saved as .docx)
  if (!text || text.trim().length < 50) {
    try {
      const utf8 = buffer.toString('utf-8');
      if (utf8.includes('<') && utf8.includes('>')) {
        const stripped = utf8
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

  // If still little or no text (e.g. binary doc or complex packaging), extract printable strings
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
    hasTextLayer: hasTextLayer || text.trim().length >= 20,
  };
}
