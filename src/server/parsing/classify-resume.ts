/**
 * Resume Classifier Heuristic
 * Ensures an uploaded file is genuinely a candidate CV / resume
 * and not an invoice, receipt, fee slip, or random document.
 */

export interface ResumeClassificationResult {
  isResume: boolean;
  confidence: number;
  detectedSections: string[];
  reason?: string;
}

export function classifyResumeText(text: string): ResumeClassificationResult {
  if (!text || text.trim().length < 100) {
    return {
      isResume: false,
      confidence: 0,
      detectedSections: [],
      reason: 'The uploaded file contains insufficient extractable text (under 100 characters). Please provide a text-based PDF or DOCX.',
    };
  }

  const lower = text.toLowerCase();

  // Negative cues: Invoices, bills, tax forms, receipts
  const invoiceKeywords = [
    'tax invoice',
    'invoice number',
    'bill to',
    'total amount due',
    'payment receipt',
    'purchase order',
    'remittance advice',
    'gstin',
  ];
  let negativeHits = 0;
  for (const kw of invoiceKeywords) {
    if (lower.includes(kw)) negativeHits++;
  }

  if (negativeHits >= 2) {
    return {
      isResume: false,
      confidence: 0.1,
      detectedSections: [],
      reason: 'The uploaded file appears to be a financial receipt, bill, or invoice rather than an engineering resume.',
    };
  }

  // Positive section cues
  const sections = {
    education: /(education|academics|qualification|b\.?tech|b\.?e\.?|degree|cgpa|gpa|university|college|school)/i,
    skills: /(skills|technical skills|proficiencies|technologies|programming|tools|frameworks)/i,
    experience: /(experience|projects|internship|work history|employment|contributions)/i,
    achievements: /(achievements|awards|certifications|extracurricular|publications|competitions|honors)/i,
  };

  const detectedSections: string[] = [];
  if (sections.education.test(text)) detectedSections.push('Education');
  if (sections.skills.test(text)) detectedSections.push('Skills');
  if (sections.experience.test(text)) detectedSections.push('Experience & Projects');
  if (sections.achievements.test(text)) detectedSections.push('Achievements');

  // Need at least 2 distinct resume sections
  if (detectedSections.length < 2) {
    return {
      isResume: false,
      confidence: 0.3,
      detectedSections,
      reason: 'The uploaded document lacks standard resume sections (Education, Technical Skills, or Projects). Please upload a complete engineering resume.',
    };
  }

  const confidence = Math.min(1.0, 0.4 + detectedSections.length * 0.15);

  return {
    isResume: true,
    confidence,
    detectedSections,
  };
}
