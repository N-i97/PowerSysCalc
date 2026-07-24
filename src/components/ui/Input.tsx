import { type InputHTMLAttributes, type SelectHTMLAttributes, type ReactNode, useId } from 'react';

// ─── Field wrapper ────────────────────────────────────────────────────────────
interface FieldProps {
  label: ReactNode;
  htmlFor?: string;
  unit?: ReactNode;
  help?: ReactNode;
  error?: string;
  badge?: ReactNode;
  children: ReactNode;
}

export function Field({ label, htmlFor, unit, help, error, badge, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={htmlFor} className="label flex items-center gap-2">
          {label}
          {unit ? <span className="text-ink-500 normal-case tracking-normal text-2xs">({unit})</span> : null}
        </label>
        {badge}
      </div>
      {children}
      {help && !error ? <p className="help">{help}</p> : null}
      {error ? <p className="text-2xs text-signal-err font-medium">{error}</p> : null}
    </div>
  );
}

// ─── Number input ─────────────────────────────────────────────────────────────
interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type' | 'prefix'> {
  value: number | '';
  onChange: (v: number | '') => void;
  suffix?: ReactNode;
  prefix?: ReactNode;
}

export function NumberInput({ value, onChange, suffix, prefix, className = '', ...rest }: NumberInputProps) {
  return (
    <div className={[
      'group flex h-10 items-stretch border border-rule bg-paper-bright',
      'focus-within:border-ink-900 focus-within:ring-1 focus-within:ring-ink-900',
      'transition-colors',
      className,
    ].join(' ')}>
      {prefix ? (
        <span className="flex items-center px-3 text-2xs font-mono text-ink-600 border-r border-rule bg-paper-deep">
          {prefix}
        </span>
      ) : null}
      <input
        type="number"
        inputMode="decimal"
        value={value === '' ? '' : value}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === '') onChange('');
          else {
            const n = Number(raw);
            onChange(Number.isFinite(n) ? n : '');
          }
        }}
        className="flex-1 bg-transparent px-3 text-sm font-mono tabular-nums text-ink outline-none placeholder:text-ink-400"
        {...rest}
      />
      {suffix ? (
        <span className="flex items-center px-3 text-2xs font-mono text-ink-600 border-l border-rule bg-paper-deep">
          {suffix}
        </span>
      ) : null}
    </div>
  );
}

// ─── Text input ───────────────────────────────────────────────────────────────
interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string;
  onChange: (v: string) => void;
}

export function TextInput({ value, onChange, className = '', ...rest }: TextInputProps) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={[
        'h-10 w-full border border-rule bg-paper-bright px-3 text-sm text-ink',
        'outline-none placeholder:text-ink-400 focus:border-ink-900 focus:ring-1 focus:ring-ink-900',
        className,
      ].join(' ')}
      {...rest}
    />
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'> {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}

export function Select({ value, onChange, options, className = '', ...rest }: SelectProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={[
          'h-10 w-full appearance-none border border-rule bg-paper-bright pl-3 pr-9',
          'text-sm font-mono text-ink outline-none',
          'focus:border-ink-900 focus:ring-1 focus:ring-ink-900',
          className,
        ].join(' ')}
        {...rest}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-paper-bright text-ink">
            {o.label}
          </option>
        ))}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-600"
      >
        <path
          fill="currentColor"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
        />
      </svg>
    </div>
  );
}

// ─── Segmented control ────────────────────────────────────────────────────────
interface SegmentedProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon?: ReactNode }[];
  ariaLabel?: string;
}

export function Segmented<T extends string>({ value, onChange, options, ariaLabel }: SegmentedProps<T>) {
  const groupId = useId();
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="inline-flex border border-rule bg-paper-bright p-0">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={active}
            type="button"
            onClick={() => onChange(o.value)}
            className={[
              'inline-flex items-center justify-center gap-1.5 px-3 h-9 text-2xs font-mono uppercase tracking-datasheet transition-colors',
              'border-r border-rule last:border-r-0',
              active
                ? 'bg-ink-900 text-paper'
                : 'text-ink-700 hover:bg-paper-deep hover:text-ink',
            ].join(' ')}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
