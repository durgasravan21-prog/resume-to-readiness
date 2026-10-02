import pdfParse from 'pdf-parse';
import { isScannedOrUnreadable } from './detect-scanned';

export interface ExtractedPdfResult {
  text: string;
  pageCount: number;
  hasTextLayer: boolean;
  error?: string;
}

export async function extractPdfText(buffer: Buffer): Promise<ExtractedPdfResult> {
  try {
    const data = await pdfParse(buffer);
    const text = data.text || '';
    const hasTextLayer = !isScannedOrUnreadable(text);

    return {
      text,
      pageCount: data.numpages || 1,
      hasTextLayer,
    };
  } catch (err: any) {
    return {
      text: '',
      pageCount: 0,
      hasTextLayer: false,
      error: err.message || 'Failed to parse PDF document.',
    };
  }
}
