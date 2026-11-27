'use client';

import Link from 'next/link';
import { BookOpenIcon, DocumentTextIcon, GlobeAltIcon, PlayCircleIcon } from '@heroicons/react/24/outline';
import { Github } from 'lucide-react';
import type { ResourceKind } from '@/types/resource';

// Shared by publication resources, panel toggles and internship project resources.
export const resourceClass = 'inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-1.5 text-xs sm:text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2';
export const idleClass = 'border-neutral-200 bg-neutral-100 dark:bg-neutral-200/60 text-neutral-600 hover:bg-accent/15 hover:text-primary';
export const activeClass = 'border-accent bg-accent text-[#0f172a]';

function ResourceIcon({ kind }: { kind: ResourceKind }) {
    const iconClass = 'h-4 w-4';
    switch (kind) {
        case 'pdf': return <DocumentTextIcon aria-hidden="true" className={iconClass} />;
        case 'code': return <Github aria-hidden="true" className={iconClass} />;
        case 'projectPage': return <GlobeAltIcon aria-hidden="true" className={iconClass} />;
        case 'huggingFace': return <span aria-hidden="true" className="text-base leading-none">🤗</span>;
        case 'demo': return <PlayCircleIcon aria-hidden="true" className={iconClass} />;
        case 'details': return <BookOpenIcon aria-hidden="true" className={iconClass} />;
    }
}

export default function ResourceLink({ href, kind, children }: { href: string; kind: ResourceKind; children: React.ReactNode }) {
    const content = <><ResourceIcon kind={kind} />{children}</>;
    const className = `${resourceClass} ${idleClass}`;
    return href.startsWith('/')
        ? <Link href={href} className={className}>{content}</Link>
        : <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{content}</a>;
}
