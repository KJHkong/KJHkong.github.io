'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { Publication } from '@/types/publication';
import { useMessages } from '@/lib/i18n/useMessages';
import FormattedBibTeXText from '@/components/publications/FormattedBibTeXText';
import TwoLineExcerpt from '@/components/publications/TwoLineExcerpt';

interface SelectedPublicationsProps {
    publications: Publication[];
    title?: string;
    enableOnePageMode?: boolean;
}

export default function SelectedPublications({ publications, title, enableOnePageMode = false }: SelectedPublicationsProps) {
    const messages = useMessages();
    return (
        <motion.section data-selected-publications initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
            <div className="flex items-center justify-between gap-4 mb-4">
                <h2 className="text-2xl font-serif font-bold text-primary">{title || messages.home.selectedPublications}</h2>
                <Link href={enableOnePageMode ? '/#publications' : '/publications'} className="text-accent hover:text-accent-dark text-sm font-medium shrink-0">
                    {messages.home.viewAll} →
                </Link>
            </div>
            <div className="space-y-4">
                {publications.map(pub => (
                    <article key={pub.id} data-publication-id={pub.id} lang="en" className="bg-neutral-50 rounded-lg border border-neutral-200 p-5 shadow-sm">
                        <h3 className="font-semibold text-primary text-base leading-relaxed mb-2">
                            <a href={pub.url || (pub.doi ? `https://doi.org/${pub.doi}` : `/publications#${pub.id}`)}
                                {...(pub.url || pub.doi ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                className="hover:text-accent transition-colors">
                                <FormattedBibTeXText nodes={pub.titleNodes} fallback={pub.title} />
                            </a>
                        </h3>
                        <p className="text-sm text-neutral-600 leading-relaxed mb-2">
                            {pub.authors.map((author, index) => (
                                <span key={index}>
                                    <span className={author.isHighlighted ? 'font-semibold text-accent' : ''}>{author.name}</span>
                                    {author.isCorresponding && <sup>*</sup>}
                                    {index < pub.authors.length - 1 && ', '}
                                </span>
                            ))}
                        </p>
                        <p className="text-sm font-medium text-primary leading-relaxed mb-3">
                            {pub.venue || pub.conference || pub.journal}{pub.year ? ` · ${pub.year}` : ''}
                        </p>
                        {(pub.summary || pub.abstract) && (
                            <TwoLineExcerpt text={pub.summary || pub.abstract || ''} />
                        )}
                    </article>
                ))}
            </div>
        </motion.section>
    );
}
