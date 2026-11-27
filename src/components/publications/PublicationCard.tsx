'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { DocumentTextIcon, BookOpenIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import type { Publication } from '@/types/publication';
import { useMessages } from '@/lib/i18n/useMessages';
import FormattedBibTeXText from './FormattedBibTeXText';
import TwoLineExcerpt from './TwoLineExcerpt';
import ResourceLink, { resourceClass, idleClass, activeClass } from '@/components/ui/ResourceLink';

async function copyCitation(text: string) {
    try {
        if (!navigator.clipboard) throw new Error('Clipboard API unavailable');
        await navigator.clipboard.writeText(text);
    } catch {
        const previousFocus = document.activeElement;
        const field = document.createElement('textarea');
        field.value = text;
        field.setAttribute('readonly', '');
        field.style.cssText = 'position:fixed;left:-9999px;top:0;';
        document.body.appendChild(field);
        try {
            field.select();
            if (!document.execCommand('copy')) throw new Error('Copy unavailable');
        } finally {
            field.remove();
            if (previousFocus instanceof HTMLElement) previousFocus.focus();
        }
    }
}

export default function PublicationCard({ publication: pub, grouped = false }: { publication: Publication; grouped?: boolean }) {
    const messages = useMessages();
    const [panel, setPanel] = useState<'abstract' | 'bibtex' | null>(null);
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
    const Heading = grouped ? 'h3' : 'h2';
    const panelId = `publication-panel-${pub.id}`;
    const previews = [pub.preview, ...(pub.additionalPreviews || [])]
        .filter((path): path is string => Boolean(path))
        .map(path => path.startsWith('/') ? path : `/papers/${path}`);
    const figureAspect = previews.length > 1 ? 'aspect-[2/1]' : pub.previewFit === 'fill'
        ? 'aspect-[16/10] md:aspect-[3/2]' : 'aspect-[16/10] md:aspect-[4/3]';

    useEffect(() => {
        if (copyStatus === 'idle') return;
        const timer = setTimeout(() => setCopyStatus('idle'), 2500);
        return () => clearTimeout(timer);
    }, [copyStatus]);

    const toggle = (next: 'abstract' | 'bibtex') => {
        setPanel(current => current === next ? null : next);
        setCopyStatus('idle');
    };

    return (
        <article id={pub.id} data-publication-card data-publication-id={pub.id}
            className="card-bg rounded-2xl border border-neutral-200 p-5 sm:p-6 lg:p-8 scroll-mt-28">
            <div className="grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)] lg:grid-cols-[248px_minmax(0,1fr)] gap-6 lg:gap-8 items-start">
                {previews.length > 0 && <div className="grid gap-0 rounded-xl bg-white" data-publication-figures>
                    {previews.map((preview, index) => <a key={preview} href={preview} target="_blank" rel="noopener noreferrer"
                        aria-label={`${messages.publications.viewFigure}: ${pub.title}${previews.length > 1 ? ` (${index + 1})` : ''}`}
                        title={messages.publications.viewFigure}
                        className={`relative block ${figureAspect} overflow-hidden rounded-xl focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2`}>
                        <Image src={preview} alt={`${pub.title} — representative figure${previews.length > 1 ? ` ${index + 1}` : ''}`} fill
                            sizes="(min-width: 1024px) 248px, (min-width: 768px) 200px, calc(100vw - 5rem)"
                            className={`${pub.previewFit === 'fill' ? 'object-fill' : 'object-contain'} ${previews.length > 1 ? (index === 0 ? 'object-bottom' : 'object-top') : ''}`} />
                    </a>)}
                </div>}
                <div className={`min-w-0 ${previews.length > 0 ? '' : 'md:col-span-2'}`}>
                    <Heading className="text-lg sm:text-xl font-semibold text-primary leading-snug mb-3" lang="en">
                        <a href={pub.url || pub.pdfUrl || (pub.doi ? `https://doi.org/${pub.doi}` : '#')}
                            target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                            <FormattedBibTeXText nodes={pub.titleNodes} fallback={pub.title} />
                        </a>
                    </Heading>
                    <p className="text-sm leading-relaxed text-neutral-600 mb-3" lang="en" data-publication-authors>
                        {pub.authors.map((author, index) => <span key={index}>
                            <span className={author.isHighlighted ? 'font-semibold text-accent' : ''}>{author.name}</span>
                            {author.isCorresponding && <sup>*</sup>}
                            {author.isCoAuthor && <sup>†</sup>}
                            {index < pub.authors.length - 1 && ', '}
                        </span>)}
                    </p>
                    <p className="text-sm font-semibold text-primary mb-4 leading-relaxed" lang="en" data-publication-venue>
                        {pub.venue || pub.journal || pub.conference}{pub.year ? ` · ${pub.year}` : ''}
                    </p>
                    {(pub.summary || pub.abstract) && <div className="mb-5" lang="en">
                        <TwoLineExcerpt text={pub.summary || pub.abstract || ''} />
                    </div>}
                    <div className="flex flex-wrap gap-2" data-publication-resources>
                        {pub.pdfUrl && <ResourceLink kind="pdf" href={pub.pdfUrl}>{messages.publications.pdf}</ResourceLink>}
                        {pub.abstract && <button type="button" aria-expanded={panel === 'abstract'} aria-controls={panelId}
                            onClick={() => toggle('abstract')} className={`${resourceClass} ${panel === 'abstract' ? activeClass : idleClass}`}>
                            <DocumentTextIcon className="h-4 w-4" />{messages.publications.abstract}
                        </button>}
                        {pub.code && <ResourceLink kind="code" href={pub.code}>{messages.publications.code}</ResourceLink>}
                        {pub.projectPage && <ResourceLink kind="projectPage" href={pub.projectPage}>{messages.publications.projectPage}</ResourceLink>}
                        {pub.huggingFace && <ResourceLink kind="huggingFace" href={pub.huggingFace}>{messages.publications.huggingFace}</ResourceLink>}
                        {pub.demo && <ResourceLink kind="demo" href={pub.demo}>{messages.publications.demo}</ResourceLink>}
                        {pub.bibtex && <button type="button" aria-expanded={panel === 'bibtex'} aria-controls={panelId}
                            onClick={() => toggle('bibtex')} className={`${resourceClass} ${panel === 'bibtex' ? activeClass : idleClass}`}>
                            <BookOpenIcon className="h-4 w-4" />{messages.publications.bibtex}
                        </button>}
                    </div>
                    {panel && <div id={panelId} role="region"
                        aria-label={`${panel === 'abstract' ? messages.publications.abstract : messages.publications.bibtex}: ${pub.title}`}
                        className="mt-5 rounded-xl border border-neutral-300 bg-neutral-100 p-4 sm:p-5">
                        {panel === 'abstract' ? <p lang="en" className="text-sm leading-7 text-neutral-600 whitespace-pre-line break-words" data-full-abstract>{pub.abstract}</p> : (
                            <div className="relative">
                                <button type="button"
                                    aria-label={copyStatus === 'copied' ? messages.common.copied : messages.common.copyToClipboard}
                                    title={copyStatus === 'copied' ? messages.common.copied : messages.common.copyToClipboard}
                                    className="absolute top-0 right-0 flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-200 text-neutral-600 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
                                    onClick={async () => {
                                        try { await copyCitation(pub.bibtex || ''); setCopyStatus('copied'); }
                                        catch { setCopyStatus('error'); }
                                    }}>
                                    {copyStatus === 'copied' ? <CheckIcon className="h-5 w-5" /> : <ClipboardDocumentIcon className="h-5 w-5" />}
                                </button>
                                <pre lang="en" data-bibtex-content className="pr-11 whitespace-pre-wrap break-words [overflow-wrap:anywhere] font-mono text-xs sm:text-sm leading-relaxed text-neutral-600">{pub.bibtex}</pre>
                                <p aria-live="polite" className="text-xs text-neutral-600 mt-2">
                                    {copyStatus === 'copied' ? messages.common.copied : copyStatus === 'error' ? messages.common.copyFailed : ''}
                                </p>
                            </div>
                        )}
                    </div>}
                </div>
            </div>
        </article>
    );
}
