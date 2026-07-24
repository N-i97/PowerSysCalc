import { type ReactNode } from 'react';

export function SectionHeading({ eyebrow, title, description, number, action }: { eyebrow?: ReactNode; title: ReactNode; description?: ReactNode; number?: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 pb-2 mb-4 border-b border-ink-900">
      <div className="space-y-1">
        {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
        <h2 className="text-xl sm:text-2xl font-display font-semibold text-ink flex items-center gap-3">
          {number ? (
            <span className="font-mono text-base text-live tabular-nums">
              {number}
            </span>
          ) : null}
          {title}
        </h2>
        {description ? <p className="text-sm text-ink-600 max-w-2xl">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
