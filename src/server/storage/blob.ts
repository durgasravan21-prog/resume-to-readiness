import 'server-only';
import { put, del } from '@vercel/blob';

export async function uploadResumeBlob(fileName: string, buffer: Buffer, contentType: string): Promise<string> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(`resumes/${Date.now()}-${fileName}`, buffer, {
        access: 'public',
        contentType,
      });
      return blob.url;
    } catch (err) {
      console.warn('Vercel blob upload failed, falling back to simulated path:', err);
    }
  }

  // Local development simulated file URL
  return `/uploads/${Date.now()}_${encodeURIComponent(fileName)}`;
}

export async function deleteResumeBlob(fileUrl: string): Promise<void> {
  if (process.env.BLOB_READ_WRITE_TOKEN && fileUrl.startsWith('http')) {
    try {
      await del(fileUrl);
    } catch (err) {
      console.warn('Failed to delete blob from Vercel:', err);
    }
  }
}
