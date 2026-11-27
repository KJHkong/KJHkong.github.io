'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import type { CardItem, CardPageConfig } from '@/types/page';
import { useMessages } from '@/lib/i18n/useMessages';
import ResourceLink from '@/components/ui/ResourceLink';
import ProjectDescription from './ProjectDescription';

const markdownComponents = {
    p: ({ children }: React.ComponentProps<'p'>) => <p className="mb-3 last:mb-0">{children}</p>,
    ul: ({ children }: React.ComponentProps<'ul'>) => <ul className="list-disc pl-5 mb-3 space-y-2">{children}</ul>,
    ol: ({ children }: React.ComponentProps<'ol'>) => <ol className="list-decimal pl-5 mb-3 space-y-2">{children}</ol>,
    li: ({ children }: React.ComponentProps<'li'>) => <li>{children}</li>,
    a: ({ href, children }: React.ComponentProps<'a'>) => href ? (
        <a href={href} {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="text-accent font-medium hover:underline underline-offset-4">{children}</a>
    ) : <span>{children}</span>,
    strong: ({ children }: React.ComponentProps<'strong'>) => <strong className="font-semibold text-primary">{children}</strong>,
};

function ItemContent({ item, embedded, project = false, compactProject = false }: { item: CardItem; embedded: boolean; project?: boolean; compactProject?: boolean }) {
    const messages = useMessages();
    const Heading = embedded || project ? 'h3' : 'h2';
    return (
        <div className="min-w-0">
            <div data-project-heading={project || undefined} className={`flex flex-col ${project ? 'md:flex-row md:items-center' : 'sm:flex-row sm:items-start'} justify-between gap-2 mb-2`}>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
                    <Heading className={`${embedded || project ? 'text-lg' : 'text-xl'} font-semibold text-primary break-words`}>
                        {item.link ? <Link href={item.link} className="hover:text-accent transition-colors">{item.title} <span aria-hidden="true">↗</span></Link> : item.title}
                    </Heading>
                    {item.ongoing && <span className="shrink-0 rounded border border-accent/40 bg-accent/20 px-2 py-0.5 text-xs font-medium text-primary">{messages.pages.inProgress}</span>}
                </div>
                {item.resources && item.resources.length > 0 && <div data-project-resources className="flex flex-wrap items-center gap-2 shrink-0 md:ml-auto">
                    {item.resources.map(resource => <ResourceLink key={`${resource.kind}-${resource.href}`} href={resource.href} kind={resource.kind}>
                        {resource.kind === 'details' ? messages.pages.paperDetails : messages.publications[resource.kind]}
                    </ResourceLink>)}
                </div>}
                {item.date && <span className="text-xs sm:text-sm text-neutral-500 font-medium bg-neutral-100 px-2 py-1 rounded self-start shrink-0">{item.date}</span>}
            </div>
            {item.subtitle && <p className="text-sm sm:text-base text-accent font-medium mb-3">{item.subtitle}</p>}
            {item.content && <div data-review-highlight={item.highlight || undefined} className={`text-sm sm:text-base leading-relaxed break-words ${item.highlight ? 'bg-accent/20 text-primary border-l-2 border-accent rounded px-3 py-2' : 'text-neutral-600'}`}>
                {compactProject ? <ProjectDescription content={item.content} alternatives={item.content_variants} compact={item.compact_content} components={markdownComponents} />
                    : <ReactMarkdown components={markdownComponents}>{item.content}</ReactMarkdown>}
            </div>}
            {item.entries && item.entries.length > 0 && <ul data-dated-entries className="mt-4 list-disc pl-5 space-y-4 marker:text-accent">
                {item.entries.map(entry => <li key={`${entry.title}-${entry.date}`} data-dated-entry className="text-sm sm:text-base leading-relaxed text-neutral-600">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:gap-6">
                        <span className="min-w-0 break-words">{entry.title}</span>
                        <time dateTime={entry.date.replace('.', '-')} className="text-xs sm:text-sm text-neutral-500 font-medium bg-neutral-100 px-2 py-1 rounded whitespace-nowrap tabular-nums">{entry.date}</time>
                    </div>
                </li>)}
            </ul>}
            {item.tags && <div data-project-tags={compactProject || undefined} aria-label={compactProject ? messages.pages.technologies : undefined} tabIndex={compactProject ? 0 : undefined}
                className={`flex gap-2 mt-4 ${compactProject ? 'flex-nowrap overflow-x-auto pb-1 focus-visible:outline-2 focus-visible:outline-accent rounded' : 'flex-wrap'}`}>
                {item.tags.map(tag => <span key={tag} className={`text-xs text-neutral-500 bg-neutral-50 px-2 py-1 rounded border border-neutral-200 ${compactProject ? 'shrink-0 whitespace-nowrap' : 'break-words max-w-full'}`}>{tag}</span>)}
            </div>}
        </div>
    );
}

export default function CardPage({ config, embedded = false }: { config: CardPageConfig; embedded?: boolean }) {
    const messages = useMessages();
    const Heading = embedded ? 'h2' : 'h1';
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <div className={embedded ? 'mb-4' : 'mb-8'}>
                <Heading className={`${embedded ? 'text-2xl' : 'text-4xl'} font-serif font-bold text-primary mb-4`}>{config.title}</Heading>
                {config.description && <div className="text-base sm:text-lg text-neutral-600 max-w-2xl leading-relaxed">
                    <ReactMarkdown components={markdownComponents}>{config.description}</ReactMarkdown>
                </div>}
            </div>
            <div className={`grid ${embedded ? 'gap-4' : 'gap-6'}`}>
                {config.items.map((item, index) => (
                    <article key={item.id || index} id={item.id}
                        className={`card-bg min-w-0 ${embedded ? 'p-4' : 'p-5 sm:p-6'} rounded-xl shadow-sm border border-neutral-200 scroll-mt-28`}>
                        <ItemContent item={item} embedded={embedded} />
                        {item.projects && item.projects.length > 0 && <div className="mt-6 border-t border-neutral-200 pt-5">
                            <p className="text-xs uppercase tracking-wider font-medium text-neutral-500 mb-4">{messages.pages.projects}</p>
                            <div className="space-y-6">
                                {item.projects.map((project, projectIndex) => (
                                    <section key={project.id || projectIndex} id={project.id} data-project-card={config.compact_projects || undefined} data-review-highlight={project.ongoing || undefined}
                                        className={`pl-4 border-l-2 scroll-mt-28 ${project.ongoing ? 'border-accent bg-accent/20 rounded-lg py-3 pr-3' : 'border-accent/40'}`}>
                                        <ItemContent item={project} embedded={embedded} project compactProject={config.compact_projects} />
                                    </section>
                                ))}
                            </div>
                        </div>}
                    </article>
                ))}
            </div>
        </motion.div>
    );
}
