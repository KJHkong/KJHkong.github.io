'use client';

import { motion } from 'framer-motion';
import { useMessages } from '@/lib/i18n/useMessages';

export interface NewsItem {
    date: string;
    content: string;
    highlight?: boolean;
}

interface NewsProps {
    items: NewsItem[];
    title?: string;
}

export default function News({ items, title }: NewsProps) {
    const messages = useMessages();
    const resolvedTitle = title || messages.home.news;

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
        >
            <h2 className="text-2xl font-serif font-bold text-primary mb-4">{resolvedTitle}</h2>
            <div className="space-y-3">
                {[...items].sort((a, b) => b.date.localeCompare(a.date)).map((item, index) => (
                    <div key={index} data-news-date={item.date} data-review-highlight={item.highlight || undefined} className={`flex items-start gap-3 ${item.highlight ? 'bg-accent/20 rounded-lg border-l-2 border-accent px-3 py-2' : ''}`}>
                        <span className={`text-xs mt-1 w-16 flex-shrink-0 ${item.highlight ? 'text-primary font-semibold' : 'text-neutral-500'}`}>{item.date}</span>
                        <p className={`text-sm leading-relaxed ${item.highlight ? 'text-primary font-semibold' : 'text-neutral-700'}`}>{item.content}</p>
                    </div>
                ))}
            </div>
        </motion.section>
    );
}
