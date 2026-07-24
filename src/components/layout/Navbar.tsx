import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Icon, LiveDot } from '../ui/Icon';
import { ALL_CALCULATORS, CATEGORIES, searchCalculators } from '../../data/registry';
import { useRecent } from '../../hooks/useRecent';

export function Navbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<{ slug: string; title: string; icon?: string }[]>([]);
  const nav = useNavigate();
  const { recent } = useRecent();

  useEffect(() => {
    if (query) {
      setResults(searchCalculators(query).map((c) => ({ slug: c.slug, title: c.title, icon: c.icon })));
    } else {
      setResults(recent.map((r) => ({ slug: r.slug, title: r.title })));
    }
  }, [query, recent]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const first = results[0];
    if (first) {
      nav(`/${first.slug}`);
      setQuery('');
      setOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink-900 bg-paper">
      {/* ── Top status strip — datasheet metadata ── */}
      <div className="border-b border-rule">
        <div className="container-px mx-auto max-w-[1500px] flex items-center justify-between h-6 text-2xs font-mono text-ink-600">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5"><LiveDot /> SYSTEM ONLINE</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">REV 1.0 / 26.07</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline">IEC 60364 · IEEE C57 · NEC 2023</span>
            <span className="hidden md:flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-ok" />50/60 Hz</span>
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-live" /> {ALL_CALCULATORS.length} tools</span>
          </div>
        </div>
      </div>

      <div className="container-px mx-auto max-w-[1500px] h-14 flex items-center gap-3">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={onOpenSidebar}
          className="lg:hidden inline-flex h-9 w-9 items-center justify-center border border-ink-900 text-ink hover:bg-ink-900 hover:text-paper"
        >
          <Icon name="menu" className="h-5 w-5" />
        </button>

        {/* ── Logo + nameplate ── */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <Logo />
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="font-display font-semibold text-ink tracking-tight">
              PowerSys <span className="text-live">Calc</span>
            </span>
            <span className="text-2xs font-mono text-ink-600 uppercase tracking-nameplate">Engineering Reference</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-0 ml-4 border-l border-rule pl-4">
          {[
            { to: '/', label: 'Home' },
            { to: `/${CATEGORIES[0].slug}`, label: 'Calculators' },
            { to: '/standards', label: 'Standards' },
            { to: '/about', label: 'About' },
          ].map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                [
                  'px-3 h-9 inline-flex items-center text-sm font-medium transition-colors border-b-2 -mb-px',
                  isActive
                    ? 'text-ink border-live'
                    : 'text-ink-700 border-transparent hover:text-ink hover:border-ink-900',
                ].join(' ')
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <form onSubmit={submit} className="flex-1 min-w-0 max-w-md ml-auto relative">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-600">
              <Icon name="search" className="h-4 w-4" />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              placeholder="Search calculators (voltage drop, cable, motor…)"
              className="w-full h-9 border border-ink-900 bg-paper-bright pl-9 pr-3 text-sm text-ink placeholder:text-ink-500 outline-none focus:ring-1 focus:ring-live"
              aria-label="Search calculators"
            />
          </div>
          {open && results.length > 0 ? (
            <div className="absolute z-50 mt-1 w-full border border-ink-900 bg-paper-bright shadow-engrave">
              <div className="px-3 py-1.5 text-2xs font-mono uppercase tracking-datasheet text-ink-600 border-b border-rule">
                {query ? `Results for "${query}"` : 'Recently used'}
              </div>
              <ul className="max-h-80 overflow-y-auto">
                {results.slice(0, 8).map((c) => (
                  <li key={c.slug}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-paper-deep border-b border-rule/50 last:border-0"
                      onMouseDown={() => { nav(`/${c.slug}`); setOpen(false); setQuery(''); }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon name={c.icon ?? 'bolt'} className="h-4 w-4 text-live shrink-0" />
                        <div className="min-w-0">
                          <div className="text-sm text-ink truncate">{c.title}</div>
                          <div className="text-2xs text-ink-600 truncate">{c.title}</div>
                        </div>
                      </div>
                      <Icon name="arrow-right" className="h-3.5 w-3.5 text-ink-500 shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </form>

        <div className="hidden md:flex items-center gap-2 ml-2">
          <a
            href="/standards"
            className="inline-flex items-center justify-center gap-2 font-mono font-medium uppercase tracking-datasheet h-8 px-3 text-2xs border border-ink-900 bg-paper-bright text-ink hover:bg-ink-900 hover:text-paper"
          >
            <Icon name="doc" className="h-3.5 w-3.5" />
            <span>Docs</span>
          </a>
        </div>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <span aria-hidden className="relative inline-flex h-8 w-8 items-center justify-center border border-ink-900 bg-paper-bright">
      <svg viewBox="0 0 32 32" className="h-5 w-5 text-ink" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 18 L13 18 L16 10 L20 24 L23 14 L28 14" />
      </svg>
      <span className="absolute -right-0.5 -bottom-0.5 h-1.5 w-1.5 bg-live" />
    </span>
  );
}
