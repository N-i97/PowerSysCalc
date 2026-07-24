import { type HTMLAttributes, type ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  tone?: 'default' | 'accent';
  header?: ReactNode;
  footer?: ReactNode;
}

export function Card({ elevated, tone = 'default', header, footer, className = '', children, ...rest }: CardProps) {
  const toneCls = tone === 'accent'
    ? 'border-ink-900 bg-paper-bright'
    : '';
  return (
    <div
      className={[
        'bg-paper-bright border border-rule shadow-paper',
        toneCls,
        elevated ? 'shadow-engrave' : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {header ? <div className="px-5 py-4 border-b border-rule">{header}</div> : null}
      <div className="p-5">{children}</div>
      {footer ? <div className="px-5 py-3 border-t border-rule text-ink-600">{footer}</div> : null}
    </div>
  );
}

export function CardHeader({ eyebrow, title, subtitle, right }: { eyebrow?: ReactNode; title: ReactNode; subtitle?: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
        <h3 className="text-lg font-display font-semibold text-ink">{title}</h3>
        {subtitle ? <p className="text-sm text-ink-600 max-w-prose">{subtitle}</p> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}
