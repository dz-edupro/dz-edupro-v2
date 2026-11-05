import { useEffect, useRef } from 'react';
import katex from 'katex';

interface KatexProps {
  math: string;
  display?: boolean;
  className?: string;
}

export default function Katex({ math, display = false, className }: KatexProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    try {
      katex.render(math, ref.current, {
        throwOnError: false,
        displayMode: display,
        output: 'html',
      });
    } catch {
      if (ref.current) ref.current.textContent = math;
    }
  }, [math, display]);

  return <span ref={ref} className={className} aria-label={math} />;
}
