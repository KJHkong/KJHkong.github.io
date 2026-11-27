'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';

const noAlternatives: string[] = [];

// Pick the richest complete paragraph that fits the actual font and available width.
export default function ProjectDescription({ content, alternatives = noAlternatives, compact, components }: {
    content: string; alternatives?: string[]; compact?: string; components: Components;
}) {
    const texts = useMemo(() => [content, ...alternatives, compact].filter((text): text is string => Boolean(text)), [content, alternatives, compact]);
    const rootRef = useRef<HTMLDivElement>(null);
    const candidatesRef = useRef<HTMLDivElement>(null);
    const [selected, setSelected] = useState(0);

    useEffect(() => {
        const root = rootRef.current;
        const candidates = candidatesRef.current;
        if (!root || !candidates) return;
        let active = true;
        const fit = () => {
            if (!active || !root.clientWidth) return;
            let best = -1;
            let bestHeight = 0;
            let shortest = 0;
            let shortestHeight = Infinity;
            Array.from(candidates.children).forEach((candidate, index) => {
                const probe = candidate.cloneNode(true) as HTMLDivElement;
                probe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;top:0;left:0;width:${root.clientWidth}px;`;
                root.appendChild(probe);
                const paragraph = probe.querySelector('p');
                if (paragraph) {
                    const height = paragraph.getBoundingClientRect().height;
                    const line = parseFloat(getComputedStyle(paragraph).lineHeight);
                    if (height < shortestHeight) { shortest = index; shortestHeight = height; }
                    if (height <= line * 4 + 0.5 && height > bestHeight + 0.5) { best = index; bestHeight = height; }
                }
                probe.remove();
            });
            const next = best < 0 ? shortest : best;
            setSelected(previous => previous === next ? previous : next);
        };
        fit();
        const observer = new ResizeObserver(fit);
        observer.observe(root);
        void document.fonts.ready.then(fit);
        return () => { active = false; observer.disconnect(); };
    }, [texts]);

    return <div ref={rootRef} className="relative">
        <div data-project-description><ReactMarkdown components={components}>{texts[selected] || content}</ReactMarkdown></div>
        <div ref={candidatesRef} className="hidden" aria-hidden="true">
            {texts.map((text, index) => <div key={index}><ReactMarkdown components={components}>{text}</ReactMarkdown></div>)}
        </div>
    </div>;
}
