import { type ReactNode } from 'react';

interface ResultCardProps {
  label: string;
  value: ReactNode;
  unit?: ReactNode;
  caption?: ReactNode;
  highlight?: boolean;
  status?: 'ok' | 'warn' | 'err' | 'info';
  index?: number;
  size?: 'sm' | 'md' | 'lg';
}

const BAR: Record<NonNullable<ResultCardProps['status']>, string> = {
  ok:   'before:bg-ok',
  warn: 'before:bg-signal-warn',
  err:  'before:bg-signal-err',
  info: 'before:bg-signal-info',
};

export function ResultCard({ label, value, unit, caption, status, index, size = 'md' }: ResultCardProps) {
  const valueSize = size === 'lg' ? 'text-3xl sm:text-4xl' : size === 'sm' ? 'text-lg' : 'text-2xl';
  return (
    <div
      className={[
        'relative bg-paper-bright border border-rule p-3.5 pl-4',
        'before:absolute before:left-0 before:top-0 before:h-full before:w-1',
        status ? (BAR[status] ?? 'before:bg-rule') : 'before:bg-rule',
      ].join(' ')}
    >
      {index !== undefined ? (
        <div className="absolute right-2 top-1.5 font-mono text-2xs text-ink-500 tabular-nums">
          {String(index).padStart(2, '0')}
        </div>
      ) : null}
      <div className="label">{label}</div>
      <div className={['mt-1 font-mono font-semibold tabular-nums text-ink', valueSize].join(' ')}>
        {value}
        {unit ? <span className="ml-1.5 text-base font-normal text-ink-600">{unit}</span> : null}
      </div>
      {caption ? <div className="mt-1 text-2xs text-ink-600">{caption}</div> : null}
    </div>
  );
}

export function ResultGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {children}
    </div>
  );
}
