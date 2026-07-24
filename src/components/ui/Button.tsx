import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const base =
  'inline-flex items-center justify-center gap-2 font-mono font-medium uppercase ' +
  'tracking-datasheet transition-colors duration-100 disabled:opacity-40 ' +
  'disabled:cursor-not-allowed select-none whitespace-nowrap';

const sizes: Record<Size, string> = {
  sm: 'h-8  px-3  text-2xs',
  md: 'h-10 px-4  text-xs',
  lg: 'h-12 px-6  text-xs',
};

const variants: Record<Variant, string> = {
  primary:
    'bg-ink-900 text-paper border border-ink-900 hover:bg-ink-800 active:bg-ink-700',
  secondary:
    'bg-paper-bright text-ink border border-rule hover:bg-paper-deep hover:border-ink-700',
  ghost:
    'text-ink-700 hover:bg-paper-deep hover:text-ink',
  danger:
    'bg-live text-paper border border-live hover:bg-live-600',
  outline:
    'border border-ink-900 text-ink-900 hover:bg-ink-900 hover:text-paper',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', icon, iconRight, loading, fullWidth, className = '', children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={[
        base,
        sizes[size],
        variants[variant],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {loading ? <Spinner /> : icon}
      <span>{children}</span>
      {iconRight}
    </button>
  );
});

function Spinner() {
  return (
    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-r-transparent" />
  );
}
