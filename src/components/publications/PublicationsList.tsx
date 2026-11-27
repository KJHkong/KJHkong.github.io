'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, FunnelIcon, CalendarIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import type { Publication } from '@/types/publication';
import type { PublicationPageConfig } from '@/types/page';
import { useMessages } from '@/lib/i18n/useMessages';
import PublicationCard from './PublicationCard';

interface PublicationsListProps {
    config: PublicationPageConfig;
    publications: Publication[];
    embedded?: boolean;
}

export default function PublicationsList({ config, publications, embedded = false }: PublicationsListProps) {
    const messages = useMessages();
    const [search, setSearch] = useState('');
    const [year, setYear] = useState<number | 'unknown' | 'all'>('all');
    const [type, setType] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const years = useMemo(() => Array.from(new Set(publications.map(pub => pub.year ?? 'unknown' as const)))
        .sort((a, b) => (b === 'unknown' ? 0 : b) - (a === 'unknown' ? 0 : a)), [publications]);
    const types = useMemo(() => Array.from(new Set(publications.map(pub => pub.type))).sort(), [publications]);
    const filtered = useMemo(() => {
        const query = search.trim().toLocaleLowerCase();
        return publications.filter(pub => {
            const haystack = [pub.title, ...pub.authors.map(author => author.name), pub.journal, pub.conference, pub.venue].filter(Boolean).join(' ').toLocaleLowerCase();
            return haystack.includes(query) && (year === 'all' || (year === 'unknown' ? !pub.year : pub.year === year)) && (type === 'all' || pub.type === type);
        }).sort((a, b) => {
            const index = (pub: Publication) => { const value = config.order?.indexOf(pub.id) ?? -1; return value < 0 ? Number.MAX_SAFE_INTEGER : value; };
            return index(a) - index(b);
        });
    }, [publications, search, year, type, config.order]);

    const grouped = config.group_by_status !== false;
    const groups = grouped ? [
        { id: 'published', title: messages.publications.publishedGroup, items: filtered.filter(pub => pub.status === 'published') },
        { id: 'review', title: messages.publications.reviewGroup, items: filtered.filter(pub => ['under-review', 'submitted'].includes(pub.status)) },
        { id: 'other', title: messages.publications.otherGroup, items: filtered.filter(pub => !['published', 'under-review', 'submitted'].includes(pub.status)) },
    ].filter(group => group.items.length) : [{ id: 'all', title: '', items: filtered }];
    const filterClass = (active: boolean) => `rounded-full px-3 py-1 text-xs font-medium transition-colors ${active ? 'bg-accent text-[#0f172a]' : 'bg-background text-neutral-600 hover:text-accent'}`;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <header className="mb-8">
                <h1 className={`${embedded ? 'text-2xl' : 'text-4xl'} font-serif font-bold text-primary mb-4`}>{config.title}</h1>
                {config.description && <p className="text-base sm:text-lg text-neutral-600">{config.description}</p>}
            </header>
            <div className="mb-8 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                        <input type="search" aria-label={messages.publications.searchPlaceholder} placeholder={messages.publications.searchPlaceholder}
                            value={search} onChange={event => setSearch(event.target.value)}
                            className="w-full rounded-lg border border-neutral-200 bg-background pl-10 pr-4 py-2.5 text-sm text-primary focus-visible:outline-2 focus-visible:outline-accent" />
                    </div>
                    <button type="button" aria-expanded={showFilters} aria-controls="publication-filters" onClick={() => setShowFilters(value => !value)}
                        className={`inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium ${showFilters ? 'bg-accent text-[#0f172a]' : 'bg-background text-neutral-600 hover:text-accent'}`}>
                        <FunnelIcon className="h-4 w-4" />{messages.publications.filters}
                    </button>
                </div>
                {showFilters && <div id="publication-filters" className="flex flex-wrap gap-6 rounded-xl border border-neutral-200 bg-neutral-100 p-4">
                    <div role="group" aria-label={messages.publications.year} className="space-y-2">
                        <p className="flex items-center gap-1 text-sm font-medium text-primary"><CalendarIcon className="h-4 w-4" />{messages.publications.year}</p>
                        <div className="flex flex-wrap gap-2">
                            <button type="button" aria-pressed={year === 'all'} onClick={() => setYear('all')} className={filterClass(year === 'all')}>{messages.common.all}</button>
                            {years.map(value => <button type="button" key={value} aria-pressed={year === value} onClick={() => setYear(value)} className={filterClass(year === value)}>
                                {value === 'unknown' ? messages.publications.yearPending : value}
                            </button>)}
                        </div>
                    </div>
                    <div role="group" aria-label={messages.publications.type} className="space-y-2">
                        <p className="flex items-center gap-1 text-sm font-medium text-primary"><BookOpenIcon className="h-4 w-4" />{messages.publications.type}</p>
                        <div className="flex flex-wrap gap-2">
                            <button type="button" aria-pressed={type === 'all'} onClick={() => setType('all')} className={filterClass(type === 'all')}>{messages.common.all}</button>
                            {types.map(value => <button type="button" key={value} aria-pressed={type === value} onClick={() => setType(value)} className={filterClass(type === value)}>{messages.publications.types[value]}</button>)}
                        </div>
                    </div>
                </div>}
            </div>
            {filtered.length === 0 ? <p className="py-12 text-center text-neutral-500">{messages.publications.noResults}</p> : (
                <div className="space-y-8">
                    {groups.map(group => <section key={group.id} aria-labelledby={group.title ? `group-${group.id}` : undefined}>
                        {group.title && <h2 id={`group-${group.id}`} className="font-serif text-2xl font-bold text-primary mb-4">{group.title}</h2>}
                        <div className="space-y-6">{group.items.map(pub => <PublicationCard key={pub.id} publication={pub} grouped={grouped || embedded} />)}</div>
                    </section>)}
                </div>
            )}
        </motion.div>
    );
}
