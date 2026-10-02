import React from 'react';
import Link from 'next/link';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title = 'No analyses yet',
  description = 'Upload your resume to compare it with real industry benchmarks and get a structured roadmap for placement preparation.',
  actionText = 'Upload a resume',
  actionHref = '/analyses/new',
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-surface-variant">
      <div className="px-6 py-4 bg-surface-container-low flex items-center justify-between">
        <div>
          <span className="font-mono uppercase text-outline text-xs">Repository</span>
          <span className="font-mono text-on-surface text-xs ml-2">• Ready for intake</span>
        </div>
        <span className="font-mono text-on-surface-variant bg-surface-container-highest px-2 py-0.5 rounded text-[11px]">
          Confidential
        </span>
      </div>

      <div className="p-8 md:p-12 flex flex-col items-center text-center justify-center flex-1">
        <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-6 text-primary">
          <svg fill="none" height="40" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 48 48" width="40">
            <path d="M12 8h16l10 10v22H12V8z"></path>
            <path d="M28 8v10h10"></path>
            <path d="M18 24h12"></path>
            <path d="M18 30h8"></path>
            <path d="M26 38l12-12 4 4-12 12-4-4z"></path>
          </svg>
        </div>

        <h2 className="font-headline font-semibold text-2xl text-primary mb-3">
          {title}
        </h2>
        
        <p className="font-body text-on-surface-variant max-w-md mx-auto mb-8 text-sm leading-relaxed">
          {description}
        </p>

        {actionHref ? (
          <Link
            href={actionHref}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm px-6 py-3 rounded-lg transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            <span>{actionText}</span>
          </Link>
        ) : (
          <button
            onClick={onAction}
            type="button"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm px-6 py-3 rounded-lg transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            <span>{actionText}</span>
          </button>
        )}

        <div className="mt-8 pt-4 w-full max-w-md bg-surface-container-low rounded-lg p-3 text-center border border-surface-variant/50">
          <p className="font-body text-xs text-on-surface-variant">
            Supports PDF and DOCX files up to 5MB. Your data remains strictly confidential to you and your placement cell.
          </p>
        </div>
      </div>
    </div>
  );
}
