import 'server-only';
import { can } from '../auth/permissions';
import { AppError } from './errors';
import { extractPdfText } from '../parsing/extract-pdf';
import { extractDocxText } from '../parsing/extract-docx';
import { validateFileMagicBytes } from '../parsing/magic-bytes';
import { uploadResumeBlob, deleteResumeBlob } from '../storage/blob';
import { supabase } from '../db/client';
import { upsertStudentProfile } from '../db/queries/users';
import { User, Resume, StudentProfileInput } from '@/types';
import { MAX_RESUME_SIZE_BYTES } from '@/lib/constants';

export async function uploadResume(
  user: User,
  fileBuffer: Buffer,
  fileName: string,
  contentType: string,
  profile?: StudentProfileInput
): Promise<Resume> {
  if (!can(user, 'create', 'resume', { user_id: user.id })) {
    throw new AppError('FORBIDDEN', 'You do not have permission to upload this resume.', 403);
  }

  if (fileBuffer.length > MAX_RESUME_SIZE_BYTES) {
    throw new AppError('FILE_TOO_LARGE', 'File exceeds the 5MB maximum limit. Please upload a smaller document.', 400);
  }

  const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();

  const magicCheck = validateFileMagicBytes(fileBuffer, ext);
  if (!magicCheck.valid) {
    throw new AppError('INVALID_FORMAT', magicCheck.reason || 'Invalid file content.', 400);
  }

  let rawText = '';
  let hasTextLayer = true;

  if (ext === '.pdf') {
    const parsed = await extractPdfText(fileBuffer);
    rawText = parsed.text;
    hasTextLayer = parsed.hasTextLayer;
  } else if (ext === '.docx') {
    const parsed = await extractDocxText(fileBuffer);
    rawText = parsed.text;
    hasTextLayer = parsed.hasTextLayer;
  } else {
    throw new AppError('INVALID_FORMAT', 'Invalid file format. Please upload a PDF or DOCX document.', 400);
  }

  if (!hasTextLayer || rawText.trim().length < 30) {
    throw new AppError(
      'UNREADABLE_TEXT',
      'Unreadable text layer. Scanned images cannot be parsed. Please use an export from Word or Docs.',
      422
    );
  }

  // Upload to blob storage
  const fileUrl = await uploadResumeBlob(fileName, fileBuffer, contentType);

  // If student profile details were provided, update user record
  if (profile) {
    await upsertStudentProfile(user.id, profile);
  }

  const resumeId = 'res_' + Date.now();
  const sizeMb = (fileBuffer.length / (1024 * 1024)).toFixed(1) + ' MB';

  const newResume: Resume = {
    id: resumeId,
    user_id: user.id,
    file_name: fileName,
    file_size: sizeMb,
    file_url: fileUrl,
    raw_text: rawText,
    has_text_layer: hasTextLayer,
    created_at: new Date().toISOString(),
  };

  await supabase.from('resumes').insert([newResume]);

  return newResume;
}

export async function deleteResume(user: User, resumeId: string): Promise<void> {
  const { data: resume } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', resumeId)
    .single();

  if (!resume) {
    throw new AppError('NOT_FOUND', 'Resume not found.', 404);
  }

  if (!can(user, 'delete', 'resume', { user_id: resume.user_id })) {
    throw new AppError('FORBIDDEN', 'You do not have permission to delete this resume.', 403);
  }

  if (resume.file_url) {
    await deleteResumeBlob(resume.file_url);
  }

  await supabase.from('resumes').delete().eq('id', resumeId);
}
