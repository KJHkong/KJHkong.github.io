'use client';

import type { Publication } from '@/types/publication';
import { useMessages } from '@/lib/i18n/useMessages';

// Shared by the full list and homepage: submission status stays consistent.
export default function PublicationDetails({ publication: pub }: { publication: Publication }) {
  const { publications: labels } = useMessages();
  return (
    <div className="space-y-2 text-sm text-neutral-600">
      {pub.placeholder && <p className="text-xs text-neutral-500">{labels.titlePending}</p>}
      <p>
        {pub.authors.length > 0 ? pub.authors.map((author, index) => (
          <span key={index}>
            <span className={author.isHighlighted ? 'font-semibold text-accent' : ''}>{author.name}</span>
            {author.isCoAuthor && <sup>*</sup>}{author.isCorresponding && <sup>†</sup>}
            {index < pub.authors.length - 1 && ', '}
          </span>
        )) : labels.authorsPending}
      </p>
      {pub.authorPosition && <p>{labels.authorPosition}：{labels.positions[pub.authorPosition]}</p>}
      <p className="font-medium">{pub.journal || pub.conference || pub.venue} · {pub.year || labels.yearPending}</p>
      <span className="inline-block text-xs font-medium rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 text-primary">
        {labels.statuses[pub.status]}
      </span>
    </div>
  );
}
