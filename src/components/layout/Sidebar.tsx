import { Link, useLocation } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { CATEGORIES, calculatorsByCategory } from '../../data/registry';
import { Icon } from '../ui/Icon';
import { useRecent } from '../../hooks/useRecent';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const loc = useLocation();
  const { recent, clear } = useRecent();
  const [expanded, setExpanded] = useState<string[]>(CATEGORIES.map((c) => c.id));

  const grouped = useMemo(() => calculatorsByCategory(), []);

  function toggle(id: string) {
    setExpanded((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  return (
    <>
      {/* Mobile overlay */}
      <div
        aria-hidden
        onClick={onClose}
        className={[
          'lg:hidden fixed inset-0 z-30 bg-ink-900/40 backdrop-blur-sm transition-opacity',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />

      <aside
        className={[
          'fixed lg:sticky top-[88px] lg:top-[88px] z-30 lg:z-0',
          'h-[calc(100vh-88px)] w-72 shrink-0',
          'border-r border-rule bg-paper lg:bg-paper',
          'transition-transform duration-200 ease-out',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          'overflow-y-auto',
        ].join(' ')}
        aria-label="Engineering toolbox navigation"
      >
        <div className="p-4 space-y-6">
          {/* Recent */}
          {recent.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="eyebrow">Recent</div>
                <button
                  type="button"
                  onClick={clear}
                  className="text-2xs text-ink-600 hover:text-ink font-mono"
                >
                  Clear
                </button>
              </div>
              <ul className="space-y-0 border border-rule bg-paper-bright">
                {recent.slice(0, 4).map((r) => (
                  <li key={r.slug} className="border-b border-rule last:border-0">
                    <Link
                      to={`/${r.slug}`}
                      onClick={onClose}
                      className="group flex items-center gap-2 px-2 py-1.5 text-sm text-ink hover:bg-paper-deep"
                    >
                      <Icon name="clock" className="h-3.5 w-3.5 text-ink-500 group-hover:text-live" />
                      <span className="truncate">{r.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Categories */}
          <nav className="space-y-1.5">
            {CATEGORIES.map((cat) => {
              const isOpen = expanded.includes(cat.id);
              const items = grouped.get(cat.id) ?? [];
              return (
                <div key={cat.id}>
                  <button
                    type="button"
                    onClick={() => toggle(cat.id)}
                    className="group flex w-full items-center justify-between gap-2 px-2 py-2 text-left hover:bg-paper-deep"
                  >
                    <span className="flex items-center gap-2">
                      <Icon name={cat.icon} className="h-4 w-4 text-ink" />
                      <span className="text-sm font-medium text-ink">{cat.label}</span>
                      <span className="text-2xs font-mono text-ink-500 tabular-nums">{items.length}</span>
                    </span>
                    <Icon name="chevron-down" className={['h-3.5 w-3.5 text-ink-500 transition-transform', isOpen ? 'rotate-180' : ''].join(' ')} />
                  </button>
                  {isOpen ? (
                    <ul className="ml-6 mt-1 space-y-0 border-l border-ink-900 pl-3">
                      {items.map((c) => {
                        const active = loc.pathname === `/${c.slug}`;
                        return (
                          <li key={c.slug}>
                            <Link
                              to={`/${c.slug}`}
                              onClick={onClose}
                              className={[
                                'block px-2 py-1.5 text-2xs transition-colors border-l-2 -ml-[calc(0.75rem+2px)]',
                                active
                                  ? 'border-live text-live font-medium bg-live/5'
                                  : 'border-transparent text-ink-700 hover:text-ink hover:bg-paper-deep',
                              ].join(' ')}
                            >
                              {c.shortTitle}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>
              );
            })}
          </nav>

          <div className="border border-ink-900 bg-paper-bright p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Icon name="bolt" className="h-3.5 w-3.5 text-live" />
              <div className="eyebrow text-live">Pro tip</div>
            </div>
            <p className="text-2xs text-ink-700 leading-relaxed">
              Press <kbd className="border border-ink-900 bg-paper px-1 py-0.5 font-mono">/</kbd> anywhere to focus the global calculator search.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
