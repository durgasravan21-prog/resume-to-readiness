import React from 'react';
import Link from 'next/link';

interface LowConfidenceBannerProps {
  message?: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function LowConfidenceBanner({
  message = 'Your resume has little detail about projects, so some ratings are uncertain. Adding project descriptions will improve this.',
  actionText = 'Update project details',
  actionHref = '/analyses/new',
  onAction,
}: LowConfidenceBannerProps) {
  return (
    <div className="bg-secondary-fixed/40 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-secondary-fixed shadow-xs">
      <div className="flex items-start gap-3">
        <span className="font-mono text-xs uppercase px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed shrink-0 mt-0.5 font-semibold">
          Evaluation Notice
        </span>
        <p className="font-body text-sm text-on-surface leading-relaxed">
          {message}
        </p>
      </div>

      {actionHref ? (
        <Link
          href={actionHref}
          className="bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs px-4 py-2 rounded-lg transition-colors whitespace-nowrap self-start md:self-auto shrink-0 shadow-xs"
        >
          {actionText}
        </Link>
      ) : (
        <button
          onClick={onAction}
          type="button"
          className="bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs px-4 py-2 rounded-lg transition-colors whitespace-nowrap self-start md:self-auto shrink-0 shadow-xs"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
