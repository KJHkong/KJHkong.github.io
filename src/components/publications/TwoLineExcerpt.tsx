'use client';

import { useEffect, useRef, useState } from 'react';

// Measure in the rendered font so a literal "..." also fits on the second line.
export default function TwoLineExcerpt({ text }: { text: string }) {
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const [visibleText, setVisibleText] = useState(text);

  useEffect(() => {
    const paragraph = paragraphRef.current;
    if (!paragraph) return;
    let active = true;

    const fit = () => {
      if (!active || !paragraph.parentElement) return;
      const width = paragraph.getBoundingClientRect().width;
      if (!width) return;
      const style = getComputedStyle(paragraph);
      const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.625;
      const probe = paragraph.cloneNode(false) as HTMLParagraphElement;
      probe.removeAttribute('data-abstract-excerpt');
      probe.removeAttribute('data-excerpt-truncated');
      probe.removeAttribute('title');
      probe.setAttribute('aria-hidden', 'true');
      probe.classList.remove('line-clamp-2');
      probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;display:block;height:auto;max-height:none;overflow:visible;margin:0;';
      probe.style.width = `${width}px`;
      paragraph.parentElement.appendChild(probe);

      try {
        probe.textContent = text;
        let result = text;
        if (probe.getBoundingClientRect().height > lineHeight * 2 + 0.5) {
          const words = text.trim().split(/\s+/);
          const excerpt = (count: number) => `${words.slice(0, count).join(' ').replace(/[.,;:\s]+$/, '')}...`;
          let low = 0;
          let high = words.length;
          while (low < high) {
            const mid = Math.ceil((low + high) / 2);
            probe.textContent = excerpt(mid);
            if (probe.getBoundingClientRect().height <= lineHeight * 2 + 0.5) low = mid;
            else high = mid - 1;
          }
          result = excerpt(low);
        }
        setVisibleText(previous => previous === result ? previous : result);
      } finally {
        probe.remove();
      }
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(paragraph);
    void document.fonts.ready.then(fit);
    return () => { active = false; observer.disconnect(); };
  }, [text]);

  const truncated = visibleText !== text;
  return (
    <p ref={paragraphRef} data-abstract-excerpt data-excerpt-truncated={truncated}
      title={truncated ? text : undefined}
      className="line-clamp-2 text-sm leading-relaxed text-neutral-600">
      {visibleText}
    </p>
  );
}
