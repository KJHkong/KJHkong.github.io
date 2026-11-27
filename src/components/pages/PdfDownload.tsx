'use client';

import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import type { TextPageConfig } from '@/types/page';
import { useMessages } from '@/lib/i18n/useMessages';

export default function PdfDownload({ pdf }: { pdf: NonNullable<TextPageConfig['pdf']> }) {
  const { cv: labels } = useMessages();
  const buttonClass = 'inline-flex items-center gap-2.5 rounded-xl border border-accent px-6 py-3 text-base font-semibold text-accent transition-colors hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent';

  return (
    <div className="mb-6" data-cv-download>
      {pdf.available ? (
        <a href={pdf.path} download className={buttonClass}>
          <ArrowDownTrayIcon className="h-5 w-5" aria-hidden="true" />
          {labels.download}
        </a>
      ) : (
        <button disabled title={labels.unavailable} className={`${buttonClass} cursor-not-allowed opacity-50`}>
          <ArrowDownTrayIcon className="h-5 w-5" aria-hidden="true" />
          {labels.download}
        </button>
      )}
    </div>
  );
}
