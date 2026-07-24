import { Link } from 'react-router-dom';
import { ALL_CALCULATORS, CATEGORIES, calculatorsByCategory } from '../../data/registry';
import { Icon } from '../ui/Icon';

export function CategoryGrid() {
  const grouped = calculatorsByCategory();
  return (
    <section className="container-px mx-auto max-w-[1500px] py-12 sm:py-16">
      <header className="mb-8 flex items-end justify-between gap-4 pb-3 border-b-2 border-ink-900">
        <div>
          <div className="eyebrow mb-1">§ 02 · Categories · 09</div>
          <h2 className="text-2xl sm:text-3xl font-display font-semibold text-ink">Engineering toolbox</h2>
          <p className="text-sm text-ink-600 mt-1 max-w-2xl">Browse by discipline. Each category groups related calculations with consistent inputs and units.</p>
        </div>
        <Link to={`/${CATEGORIES[0].slug}`} className="hidden sm:inline-flex items-center gap-1.5 text-sm text-live hover:text-live-600 font-mono uppercase tracking-datasheet text-2xs">
          All categories <Icon name="arrow-right" className="h-3.5 w-3.5" />
        </Link>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {CATEGORIES.map((c) => {
          const items = grouped.get(c.id) ?? [];
          return (
            <Link
              key={c.id}
              to={`/category/${c.id}`}
              className="group relative bg-paper-bright border border-rule p-5 hover:border-ink-900 transition-colors"
            >
              <div className="relative">
                <div className="flex items-start justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center border border-ink-900 bg-paper text-ink">
                    <Icon name={c.icon} className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-2xs text-ink-600 tabular-nums">{String(items.length).padStart(2, '0')}</span>
                </div>
                <h3 className="mt-4 text-lg font-display font-semibold text-ink">{c.label}</h3>
                <p className="mt-1 text-2xs text-ink-600 leading-relaxed">{c.tagline}</p>
                <div className="mt-4 flex items-center gap-1 text-2xs font-mono text-ink-700 flex-wrap">
                  {items.slice(0, 3).map((i) => (
                    <span key={i.slug} className="border border-rule bg-paper px-1.5 py-0.5">{i.shortTitle}</span>
                  ))}
                  {items.length > 3 ? <span className="text-ink-500">+{items.length - 3}</span> : null}
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-2xs font-mono uppercase tracking-datasheet text-live">
                  Open <Icon name="arrow-right" className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function FeaturedCalculators() {
  const featured = ALL_CALCULATORS.filter((c) => c.featured);
  return (
    <section className="container-px mx-auto max-w-[1500px] py-12 sm:py-16 border-t border-rule">
      <header className="mb-8 flex items-end justify-between gap-4 pb-3 border-b-2 border-ink-900">
        <div>
          <div className="eyebrow mb-1 flex items-center gap-2"><Icon name="star" className="h-3 w-3 text-live" /> § 03 · Featured</div>
          <h2 className="text-2xl sm:text-3xl font-display font-semibold text-ink">Daily-driver calculations</h2>
          <p className="text-sm text-ink-600 mt-1 max-w-2xl">The handful of tools every design engineer reaches for in a typical week.</p>
        </div>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {featured.map((c) => (
          <Link
            key={c.slug}
            to={`/${c.slug}`}
            className="group bg-paper-bright border border-rule p-5 hover:border-ink-900 transition-colors"
          >
            <div className="flex items-start justify-between">
              <span className="inline-flex h-9 w-9 items-center justify-center border border-ink-900 bg-paper text-ink">
                <Icon name={c.icon ?? 'bolt'} className="h-4 w-4" />
              </span>
              <span className="font-mono text-2xs text-ink-600 uppercase tracking-datasheet">{c.category.replace('-', ' ')}</span>
            </div>
            <h3 className="mt-3 text-base font-display font-semibold text-ink group-hover:text-live transition-colors">{c.title}</h3>
            <p className="mt-1 text-2xs text-ink-600 leading-relaxed line-clamp-2">{c.tagline}</p>
            <div className="mt-3 flex items-center gap-1.5 text-2xs font-mono uppercase tracking-datasheet text-live">
              Open calculator <Icon name="arrow-right" className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function QuickAccess() {
  // Group by quick intent: "I need to size", "I need to verify", "I need to convert"
  const groups = [
    {
      title: 'I need to size…',
      icon: 'ruler',
      items: ['cable-sizing', 'transformer-sizing', 'vfd-sizing', 'solar-inverter'],
    },
    {
      title: 'I need to verify…',
      icon: 'shield',
      items: ['voltage-drop', 'short-circuit', 'breaker-sizing', 'earthing-conductor'],
    },
    {
      title: 'I need to compute…',
      icon: 'bolt',
      items: ['three-phase-power', 'motor-fl-current', 'power-factor', 'pf-correction'],
    },
    {
      title: 'I need to convert…',
      icon: 'swap',
      items: ['hp-kw-converter', 'awg-mm2-converter', 'delta-wye', 'kw-kva-hp'],
    },
  ];
  return (
    <section className="container-px mx-auto max-w-[1500px] py-12 sm:py-16 border-t border-rule">
      <header className="mb-8 pb-3 border-b-2 border-ink-900">
        <div className="eyebrow mb-1">§ 04 · Quick access · by intent</div>
        <h2 className="text-2xl sm:text-3xl font-display font-semibold text-ink">Find by what you’re trying to do</h2>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {groups.map((g) => (
          <div key={g.title} className="bg-paper-bright border border-rule p-4">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-rule">
              <span className="inline-flex h-7 w-7 items-center justify-center border border-ink-900 bg-paper text-ink">
                <Icon name={g.icon} className="h-4 w-4" />
              </span>
              <h3 className="text-sm font-display font-semibold text-ink">{g.title}</h3>
            </div>
            <ul className="space-y-0 border border-rule">
              {g.items.map((slug, i) => {
                const c = ALL_CALCULATORS.find((x) => x.slug === slug);
                if (!c) return null;
                return (
                  <li key={slug} className={i > 0 ? 'border-t border-rule' : ''}>
                    <Link
                      to={`/${slug}`}
                      className="group flex items-center justify-between gap-2 px-2 py-1.5 text-2xs text-ink-800 hover:bg-paper-deep hover:text-ink"
                    >
                      <span className="truncate">{c.shortTitle}</span>
                      <Icon name="arrow-right" className="h-3 w-3 text-ink-500 group-hover:text-live" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export function EngineeringPrinciples() {
  return (
    <section className="container-px mx-auto max-w-[1500px] py-12 sm:py-16 border-t border-rule">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-paper-bright border border-rule p-6">
          <div className="eyebrow mb-2">§ 05 · Why PowerSys Calc</div>
          <h2 className="text-2xl font-display font-semibold text-ink mb-3">Built for engineers, by engineers</h2>
          <p className="text-sm text-ink-700 leading-relaxed">
            Every formula on this platform is implemented from first principles and cross-referenced against IEC 60364, IEEE C57, NEC 2023, and NEMA MG-1. We surface not just numbers — but the engineering standards, derating factors, and recommended values that go with them.
          </p>
          <ul className="mt-4 space-y-2">
            {[
              'Inputs in the units you actually use — metric, AWG, or kcmil',
              'Temperature-corrected resistance, ampacity derating, source impedance',
              'Recommended standard sizes — never wonder if 70 mm² exists',
              'Step-by-step working — show your work, every time',
              'PWA-ready — works offline once loaded',
            ].map((b) => (
              <li key={b} className="flex items-start gap-2 text-2xs text-ink-800">
                <Icon name="check" className="h-3.5 w-3.5 text-live mt-0.5 shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-paper-bright border border-rule p-6">
          <div className="eyebrow mb-2">§ 06 · Roadmap</div>
          <h2 className="text-2xl font-display font-semibold text-ink mb-3">What’s coming next</h2>
          <ul className="space-y-3">
            {[
              ['AI Engineering Assistant', 'Ask in plain English: "size a 200 kVA transformer for a 180 kW load, 11 kV to 400 V, 25% growth"'],
              ['Single-line diagram generation', 'Export DWG / SVG of computed circuits'],
              ['Load flow & fault analysis', 'Per-bus admittance, IEC 60909 short-circuit'],
              ['PDF export & saved projects', 'Document every calculation with version history'],
              ['Team collaboration', 'Share a workspace, comment on cases, audit trail'],
              ['Native mobile apps', 'Same engine, PWA → iOS / Android.'],
            ].map(([t, d]) => (
              <li key={t} className="flex items-start gap-3 border-l-2 border-ink-900 pl-3">
                <div>
                  <div className="text-sm font-medium text-ink">{t}</div>
                  <div className="text-2xs text-ink-600">{d}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function StandardsStrip() {
  return (
    <section className="container-px mx-auto max-w-[1500px] py-10 border-t border-rule">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
        <div className="eyebrow shrink-0">§ 07 · Standards library</div>
        <div className="flex flex-wrap items-center gap-1.5">
          {['IEC 60364-5-52', 'IEC 60076', 'IEEE C57', 'NEC NFPA 70', 'NEMA MG-1', 'IEEE 1459', 'IEC 60947', 'IEC 60898', 'IEC 62548', 'IEEE 80'].map((s) => (
            <span key={s} className="border border-rule bg-paper-bright px-2.5 py-1 text-2xs font-mono text-ink-800">{s}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
