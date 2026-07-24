import { type ReactNode } from 'react';

type Tone = 'neutral' | 'ok' | 'warn' | 'err' | 'info' | 'accent';

const TONE: Record<Tone, string> = {
  neutral: 'border-rule text-ink-700 bg-paper-bright',
  ok:      'border-ok/40 text-ok bg-ok/5',
  warn:    'border-signal-warn/40 text-signal-warn bg-signal-warn/5',
  err:     'border-signal-err/40 text-signal-err bg-signal-err/5',
  info:    'border-signal-info/40 text-signal-info bg-signal-info/5',
  accent:  'border-live text-live bg-live/5',
};

export function Badge({ tone = 'neutral', children, className = '' }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={['inline-flex items-center gap-1.5 border px-2 py-0.5 text-2xs font-mono uppercase tracking-datasheet', TONE[tone], className].join(' ')}>
      {children}
    </span>
  );
}

export function Notice({ tone = 'info', title, children, icon }: { tone?: Tone; title?: ReactNode; children: ReactNode; icon?: ReactNode }) {
  return (
    <div className={['border p-3 text-sm bg-paper-bright', TONE[tone]].join(' ')}>
      <div className="flex items-start gap-2">
        <div className="mt-0.5 shrink-0">{icon ?? <DefaultIcon tone={tone} />}</div>
        <div className="space-y-1">
          {title ? <div className="text-2xs font-mono uppercase tracking-datasheet opacity-90">{title}</div> : null}
          <div className="text-ink-800 leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}

function DefaultIcon({ tone }: { tone: Tone }) {
  const c =
    tone === 'ok' ? 'text-ok'
    : tone === 'warn' ? 'text-signal-warn'
    : tone === 'err' ? 'text-signal-err'
    : tone === 'accent' ? 'text-live'
    : tone === 'info' ? 'text-signal-info'
    : 'text-ink-600';
  return (
    <svg viewBox="0 0 20 20" className={['h-4 w-4', c].join(' ')} fill="currentColor" aria-hidden>
      <path fillRule="evenodd" d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  );
}
