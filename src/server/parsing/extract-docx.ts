import mammoth from 'mammoth';
import { isScannedOrUnreadable } from './detect-scanned';

export interface ExtractedDocxResult {
  text: string;
  hasTextLayer: boolean;
  error?: string;
}

export async function extractDocxText(buffer: Buffer): Promise<ExtractedDocxResult> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value || '';
    const hasTextLayer = !isScannedOrUnreadable(text);

    return {
      text,
      hasTextLayer,
    };
  } catch (err: any) {
    return {
      text: '',
      hasTextLayer: false,
      error: err.message || 'Failed to parse DOCX document.',
    };
  }
}
