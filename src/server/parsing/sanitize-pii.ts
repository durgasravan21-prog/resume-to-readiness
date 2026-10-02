/**
 * Sanitizes personally identifiable sensitive government records from resume text
 * before passing to LLM and diagnostic storage.
 * Specifically redacts Aadhaar, PAN, and Passport numbers while preserving
 * candidate contact info and academic credentials.
 */

export function sanitizeResumePII(text: string): { sanitizedText: string; redactedCount: number } {
  if (!text) return { sanitizedText: '', redactedCount: 0 };

  let sanitized = text;
  let redactedCount = 0;

  // 1. Aadhaar: 12 digits, often formatted as XXXX XXXX XXXX or XXXX-XXXX-XXXX
  // Aadhaar numbers do not start with 0 or 1
  const aadhaarRegex = /\b[2-9]\d{3}[\s-]?\d{4}[\s-]?\d{4}\b/g;
  sanitized = sanitized.replace(aadhaarRegex, (match) => {
    redactedCount++;
    return '[REDACTED_AADHAAR]';
  });

  // 2. PAN Card: 5 uppercase letters + 4 digits + 1 uppercase letter (e.g. ABCDE1234F)
  const panRegex = /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g;
  sanitized = sanitized.replace(panRegex, (match) => {
    redactedCount++;
    return '[REDACTED_PAN]';
  });

  // 3. Indian Passport: 1 letter followed by 7 digits
  const passportRegex = /\b[A-Za-z][1-9]\d{6}\b/g;
  sanitized = sanitized.replace(passportRegex, (match) => {
    redactedCount++;
    return '[REDACTED_PASSPORT]';
  });

  return { sanitizedText: sanitized, redactedCount };
}
