import type { Metadata, Viewport } from 'next';
import './globals.css';
import QueryProvider from '@/components/providers/QueryProvider';
import SessionGuard from '@/components/auth/SessionGuard';

export const metadata: Metadata = {
  title: {
    default: 'Readiness — Campus Skill Gap Diagnostic & Placement Platform',
    template: '%s | Readiness',
  },
  description: 'AI-powered placement readiness diagnostic that analyzes your resume against campus hiring benchmarks, identifies skill gaps, and generates actionable roadmaps with faculty mentorship.',
  keywords: [
    'campus placement',
    'skill gap analysis',
    'placement readiness',
    'resume analysis',
    'college placements',
    'engineering placement',
    'campus drive preparation',
    'TPC',
    'training and placement cell',
  ],
  authors: [{ name: 'Stitch Readiness Team' }],
  creator: 'Stitch Readiness',
  publisher: 'National Institute of Engineering',
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Readiness — Campus Skill Gap Diagnostic & Placement Platform',
    description: 'AI-powered placement readiness diagnostic that analyzes your resume against campus hiring benchmarks.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Readiness Platform',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Readiness — Campus Skill Gap Diagnostic',
    description: 'Transparent, rubric-backed campus placement preparation platform.',
  },
  other: {
    'theme-color': '#1B1F23',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1B1F23',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
        />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="bg-surface font-body text-on-surface antialiased min-h-screen">
        <QueryProvider>
          <SessionGuard />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
