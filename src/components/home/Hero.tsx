import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon, LiveDot } from '../ui/Icon';
import { ALL_CALCULATORS, CATEGORIES, searchCalculators } from '../../data/registry';
import { useRecent } from '../../hooks/useRecent';
import { Button } from '../ui/Button';

export function Hero() {
  const [q, setQ] = useState('');
  const [focused, setFocused] = useState(false);
  const nav = useNavigate();
  const { recent } = useRecent();
  const results = q ? searchCalculators(q) : recent.map((r) => ALL_CALCULATORS.find((c) => c.slug === r.slug)).filter(Boolean) as typeof ALL_CALCULATORS;
  const popular = ['three-phase-power', 'voltage-drop', 'cable-sizing', 'transformer-sizing', 'motor-fl-current', 'pf-correction'];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const el = document.querySelector<HTMLInputElement>('#hero-search');
        el?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function go(slug: string) {
    nav(`/${slug}`);
    setQ('');
  }

  return (
    <section className="relative overflow-hidden border-b-2 border-ink-900">
      {/* Faint background grid */}
      <div aria-hidden className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute inset-0 bg-grid-print bg-grid-32" />
      </div>

      <div className="container-px mx-auto max-w-[1500px] relative py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 items-start">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 border border-ink-900 bg-paper-bright px-3 py-1 text-2xs font-mono uppercase tracking-nameplate text-ink">
              <LiveDot />
              <span>v1.0 · {ALL_CALCULATORS.length} engineering tools</span>
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-ink text-balance leading-[0.95]">
              Engineering calculations,
              <br />
              <span className="text-live">in the browser.</span>
            </h1>
            <p className="max-w-2xl text-base sm:text-lg text-ink-700 leading-relaxed">
              Cable sizing, transformer design, motor selection, voltage drop, short-circuit withstand — every tool you reach for during a design review, all in one fast offline-ready workspace. IEC, IEEE, NEMA, NEC aligned.
            </p>

            {/* Search */}
            <div className="relative max-w-2xl">
              <div className={[
                'flex items-center gap-2 border-2 bg-paper-bright transition-colors',
                focused ? 'border-live shadow-live' : 'border-ink-900',
              ].join(' ')}>
                <span className="pl-4 text-ink-700">
                  <Icon name="search" className="h-5 w-5" />
                </span>
                <input
                  id="hero-search"
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setTimeout(() => setFocused(false), 150)}
                  placeholder="Search 'voltage drop', 'motor FLC', 'cable sizing'…"
                  className="flex-1 h-12 sm:h-14 bg-transparent px-2 text-base text-ink placeholder:text-ink-500 outline-none font-mono"
                  autoComplete="off"
                />
                <span className="hidden sm:flex items-center pr-4 gap-1 text-2xs font-mono text-ink-600">
                  <kbd className="border border-ink-900 bg-paper px-1.5 py-0.5">/</kbd>
                  <span>to focus</span>
                </span>
              </div>
              {focused && results.length > 0 ? (
                <div className="absolute z-30 mt-2 w-full border-2 border-ink-900 bg-paper-bright shadow-engrave">
                  <div className="px-4 py-2 text-2xs font-mono uppercase tracking-datasheet text-ink-600 border-b border-rule">
                    {q ? `Results for "${q}"` : 'Recently used'}
                  </div>
                  <ul className="max-h-96 overflow-y-auto">
                    {results.slice(0, 8).map((c) => (
                      <li key={c.slug}>
                        <button
                          type="button"
                          className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-paper-deep border-b border-rule/50 last:border-0"
                          onMouseDown={() => go(c.slug)}
                        >
                          <span className="inline-flex h-8 w-8 items-center justify-center border border-ink-900 bg-paper text-live shrink-0">
                            <Icon name={c.icon ?? 'bolt'} className="h-4 w-4" />
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-ink truncate">{c.title}</div>
                            <div className="text-2xs text-ink-600 truncate">{c.tagline}</div>
                          </div>
                          <Icon name="arrow-right" className="h-4 w-4 text-ink-500" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            {/* Quick tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-2xs font-mono uppercase tracking-datasheet text-ink-600">Popular:</span>
              {popular.map((slug) => {
                const c = ALL_CALCULATORS.find((x) => x.slug === slug);
                if (!c) return null;
                return (
                  <Link
                    key={slug}
                    to={`/${slug}`}
                    className="border border-rule bg-paper-bright px-3 py-1 text-2xs font-mono text-ink hover:border-ink-900 hover:text-live transition-colors"
                  >
                    {c.shortTitle}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right panel — DATASHEET NAMEPLATE (the signature) */}
          <div className="relative">
            <Nameplate />
            <div className="mt-3 flex items-center justify-between text-2xs font-mono text-ink-600">
              <span>FIG. 1.0 · System nameplate</span>
              <span>2026</span>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 border-2 border-ink-900 bg-paper-bright">
          {[
            { v: ALL_CALCULATORS.length.toString(), l: 'Calculators' },
            { v: '9',        l: 'Categories' },
            { v: '4',        l: 'Standards' },
            { v: '<1ms',     l: 'Avg compute' },
          ].map((s, i) => (
            <div
              key={s.l}
              className={[
                'px-4 py-4 text-center',
                i > 0 ? 'border-l-2 border-ink-900' : '',
              ].join(' ')}
            >
              <div className="font-mono text-3xl font-semibold text-ink tabular-nums">{s.v}</div>
              <div className="text-2xs font-mono uppercase tracking-datasheet text-ink-600 mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Nameplate() {
  return (
    <div className="nameplate p-5 sm:p-6">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-ink-900">
        <div className="min-w-0">
          <div className="text-2xs font-mono uppercase tracking-nameplate text-ink-600">Equipment / Model</div>
          <div className="font-display text-2xl sm:text-3xl font-semibold text-ink leading-tight mt-1">
            PSC<span className="text-live">-01</span>
          </div>
          <div className="text-2xs font-mono text-ink-700 mt-0.5">Power System Calculator · Engine</div>
        </div>
        <div className="text-right shrink-0">
          <div className="stamp text-2xs">CLASS A</div>
          <div className="text-2xs font-mono text-ink-600 mt-1">SN 26.07-A</div>
        </div>
      </div>

      {/* Spec rows */}
      <dl className="mt-4 space-y-2.5">
        <SpecRow k="Service" v="Cable · Transformer · Motor · Protection" />
        <SpecRow k="Standards" v="IEC 60364 · IEEE C57 · NEC 2023" />
        <SpecRow k="Range" v="100 V – 1000 V · 50/60 Hz" />
        <SpecRow k="Compute" v="< 1 ms · in-browser" />
        <SpecRow k="Status" v={<span className="inline-flex items-center gap-1.5"><LiveDot />NOMINAL</span>} />
      </dl>

      {/* Footer schematic strip */}
      <div className="mt-5 pt-3 border-t border-ink-900">
        <div className="text-2xs font-mono uppercase tracking-datasheet text-ink-600 mb-2">Single-line preview</div>
        <svg viewBox="0 0 320 80" className="w-full h-20">
          <g stroke="#0E1726" strokeWidth="1.4" fill="none" strokeLinecap="square">
            <circle cx="30" cy="40" r="12" />
            <line x1="30" y1="28" x2="30" y2="20" />
            <line x1="30" y1="52" x2="30" y2="60" />
            <rect x="56" y="28" width="20" height="24" />
            <line x1="56" y1="28" x2="76" y2="52" />
            <line x1="90" y1="40" x2="240" y2="40" />
            <line x1="90" y1="50" x2="240" y2="50" />
            <line x1="90" y1="60" x2="240" y2="60" />
            <line x1="120" y1="40" x2="150" y2="40" />
            <rect x="258" y="28" width="20" height="36" />
            <line x1="268" y1="36" x2="262" y2="46" />
            <line x1="268" y1="46" x2="262" y2="36" />
            <line x1="288" y1="40" x2="300" y2="40" />
          </g>
          <g fontFamily="JetBrains Mono" fontSize="8" fill="#0E1726">
            <text x="30" y="44" textAnchor="middle">V</text>
            <text x="66" y="44" textAnchor="middle" fontSize="7">TX</text>
            <text x="135" y="34" textAnchor="middle" fill="#C9351B" fontWeight="600">I</text>
            <text x="290" y="34" textAnchor="middle" fontSize="7">M</text>
            <text x="290" y="56" textAnchor="middle" fontSize="7">3φ</text>
          </g>
        </svg>
      </div>
    </div>
  );
}

function SpecRow({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <dt className="text-2xs font-mono uppercase tracking-datasheet text-ink-600 shrink-0">{k}</dt>
      <dd className="font-mono text-ink text-right min-w-0 truncate">{v}</dd>
    </div>
  );
}
