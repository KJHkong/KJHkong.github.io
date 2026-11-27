'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { EnvelopeIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { Github } from 'lucide-react';
import type { SiteConfig } from '@/lib/config';
import { useMessages } from '@/lib/i18n/useMessages';

const OrcidIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947s-.422.947-.947.947a.95.95 0 0 1-.947-.947c0-.525.422-.947.947-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.025-5.325 5.025h-3.919V7.416zm1.444 1.303v7.444h2.297c3.272 0 4.022-2.484 4.022-3.722 0-2.016-1.284-3.722-4.097-3.722h-2.222z" />
    </svg>
);

interface ProfileProps {
    author: SiteConfig['author'];
    social: SiteConfig['social'];
    features: SiteConfig['features'];
    researchInterests?: string[];
}

const contactClass = 'inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 hover:text-accent hover:border-accent transition-colors focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2';

export default function Profile({ author, social, researchInterests }: ProfileProps) {
    const messages = useMessages();

    return (
        <motion.aside initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="lg:sticky lg:top-28">
            <div className="w-64 h-64 mx-auto mb-6 rounded-2xl overflow-hidden shadow-lg">
                {author.avatar ? <Image
                    src={author.avatar}
                    alt={author.name}
                    width={256}
                    height={256}
                    className="w-full h-full object-cover object-[50%_25%]"
                    priority
                /> : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-neutral-100 border border-neutral-200 rounded-2xl text-neutral-500">
                        <span className="font-serif text-6xl text-primary" aria-hidden="true">KJ</span>
                        <span className="text-sm">{messages.profile.portraitPending}</span>
                    </div>
                )}
            </div>

            <div className="text-center mb-4">
                <h1 className="text-3xl font-serif font-bold text-primary mb-2">{author.name}</h1>
                <p className="text-lg text-accent font-medium mb-1">{author.title}</p>
                <p className="text-neutral-600">{author.institution}</p>
            </div>

            <div data-profile-contacts className="flex items-center justify-center gap-3 mb-5">
                {social.email && (
                    <Popover>
                        <PopoverButton aria-label={messages.profile.email} title={messages.profile.email} className={contactClass}>
                            <EnvelopeIcon className="h-5 w-5" />
                        </PopoverButton>
                        <PopoverPanel
                            anchor={{ to: 'bottom', gap: 10, padding: 16 }}
                            className="z-[60] w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-neutral-200 bg-background px-5 py-4 shadow-xl focus:outline-none"
                        >
                            <p className="text-sm font-semibold text-primary mb-2">{messages.profile.email}</p>
                            <p className="text-sm text-neutral-600 break-all mb-4">{social.email}</p>
                            <a href={`mailto:${social.email}`} className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-primary-dark hover:bg-accent-light">
                                <EnvelopeIcon className="h-4 w-4" />{messages.profile.send}
                            </a>
                        </PopoverPanel>
                    </Popover>
                )}
                {social.orcid && <a href={social.orcid} target="_blank" rel="noopener noreferrer" aria-label="ORCID" title="ORCID" className={contactClass}><OrcidIcon /></a>}
                {social.github && <a href={social.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub" className={contactClass}><Github className="h-5 w-5" /></a>}
            </div>

            {social.cv && <div className="text-center mb-7">
                <Link href={String(social.cv)} className="inline-flex items-center gap-2 border border-neutral-200 rounded-lg px-4 py-2 text-sm font-medium text-primary hover:border-accent hover:text-accent transition-colors">
                    <DocumentTextIcon className="h-4 w-4" />{messages.profile.cv}
                </Link>
            </div>}

            {researchInterests && researchInterests.length > 0 && (
                <section className="bg-neutral-100 rounded-lg p-4 mb-6" aria-label={messages.profile.researchInterests}>
                    <h2 className="font-serif font-semibold text-primary mb-3">{messages.profile.researchInterests}</h2>
                    <ul className="space-y-2.5 text-sm text-neutral-600">
                        {researchInterests.map(interest => <li key={interest}>{interest}</li>)}
                    </ul>
                </section>
            )}
        </motion.aside>
    );
}
