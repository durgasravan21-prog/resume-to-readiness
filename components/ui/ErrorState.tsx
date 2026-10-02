import React from 'react';

interface ErrorStateProps {
  fileName?: string;
  fileSize?: string;
  errorCode?: string;
  errorMessage?: string;
  onRetry?: () => void;
  onRemove?: () => void;
}

export default function ErrorState({
  fileName = 'Resume_Scanned_Document.pdf',
  fileSize = '2.4MB',
  errorCode = 'ERR_NO_SELECTABLE_GLYPHS',
  errorMessage = 'We could not read this file. Try a text-based PDF or a DOCX.',
  onRetry,
  onRemove,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-surface-variant">
      <div className="px-6 py-4 bg-surface-container-low flex items-center justify-between">
        <div>
          <span className="font-mono uppercase text-outline text-xs">Intake Diagnostic</span>
          <span className="font-mono text-on-surface text-xs ml-2">• Parsing Error</span>
        </div>
        <span className="font-mono text-error bg-error-container/40 px-2 py-0.5 rounded text-[11px] font-semibold">
          Action Required
        </span>
      </div>

      <div className="p-6 md:p-8 flex flex-col gap-5">
        {/* Inline Brick Error Banner */}
        <div className="bg-error-container/30 rounded-lg p-4 flex items-start gap-3 border border-error-container">
          <span className="material-symbols-outlined text-error text-[20px] mt-0.5 shrink-0">
            error_outline
          </span>
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="font-body text-sm text-on-error-container font-medium">
              {errorMessage}
            </span>
            {onRetry && (
              <button
                onClick={onRetry}
                type="button"
                className="inline-flex items-center gap-1 font-semibold text-xs text-primary hover:underline shrink-0"
              >
                <span>Retry upload</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            )}
          </div>
        </div>

        {/* Failed File Pill */}
        <div className="bg-surface-container-low rounded-lg p-4 flex items-center justify-between border border-surface-variant/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-surface-variant flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-error text-[20px]">picture_as_pdf</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-sm text-on-surface truncate">{fileName}</span>
              <span className="font-mono text-xs text-on-surface-variant">{fileSize} • Unreadable text layer</span>
            </div>
          </div>
          {onRemove && (
            <button
              onClick={onRemove}
              aria-label="Remove failed upload"
              className="text-on-surface-variant hover:text-error transition-colors p-2 rounded-lg hover:bg-surface-container-high"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Guidance Box */}
        <div className="bg-surface-container rounded-lg p-3.5 border border-surface-variant/40">
          <div className="flex gap-2.5 items-start">
            <span className="material-symbols-outlined text-on-surface-variant text-[16px] mt-0.5 shrink-0">info</span>
            <p className="font-body text-xs text-on-surface-variant leading-relaxed">
              Scanned image files or password-protected documents cannot be parsed by our text engine. Export directly from Google Docs, Word, or LaTeX for accurate parsing.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-2 border-t border-surface-container">
          <span className="font-mono text-on-surface-variant">Diagnostic Code: {errorCode}</span>
          <span className="font-medium text-primary">Standard PDF/DOCX Specs: Text-layer required</span>
        </div>
      </div>
    </div>
  );
}
