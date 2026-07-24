import { type ReactNode } from 'react';

interface FormulaProps {
  children: ReactNode;
  label?: ReactNode;
  number?: string | number;
}

export function Formula({ children, label, number }: FormulaProps) {
  return (
    <div className="relative bg-paper-bright border border-rule p-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(14,23,38,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(14,23,38,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="relative flex items-center gap-3">
        {number !== undefined ? (
          <span className="shrink-0 inline-flex h-6 min-w-6 items-center justify-center border border-ink-900 px-1.5 font-mono text-2xs text-ink">
            {number}
          </span>
        ) : null}
        {label ? <span className="label">{label}</span> : null}
      </div>
      <div className="relative mt-2 font-mono text-base sm:text-lg text-ink leading-relaxed break-words">
        {children}
      </div>
    </div>
  );
}

export function FormulaVar({ name, desc }: { name: ReactNode; desc: ReactNode }) {
  return (
    <span className="inline-flex items-baseline gap-1 align-baseline">
      <span className="font-mono italic text-live">{name}</span>
      <span className="text-ink-600 text-xs">— {desc}</span>
    </span>
  );
}
