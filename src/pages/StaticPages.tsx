import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import { Icon } from '../components/ui/Icon';

export function StandardsPage() {
  useSEO({
    title: 'Engineering Standards Library | PowerSys Calc',
    description: 'Reference list of IEC, IEEE, NEC, and NEMA standards implemented in PowerSys Calc.',
    canonicalPath: '/standards',
  });

  const standards = [
    {
      code: 'IEC 60364-5-52',
      title: 'Low-voltage electrical installations — Part 5-52: Selection and erection of electrical equipment — Wiring systems',
      year: '2009 / A1:2024',
      scope: 'Cable ampacity, derating factors, installation methods A1–F.',
      used: ['cable-sizing', 'cable-derating', 'voltage-drop'],
    },
    {
      code: 'IEC 60364-4-43',
      title: 'Electrical installations — Protection against overcurrent',
      year: '2008',
      scope: 'Adiabatic equation for short-circuit withstand.',
      used: ['short-circuit', 'earthing-conductor'],
    },
    {
      code: 'IEC 60076-1/7',
      title: 'Power transformers — Part 1: General; Part 7: Loading guide',
      year: '2011',
      scope: 'Standard kVA ratings, losses, loading.',
      used: ['transformer-sizing', 'transformer-current', 'transformer-efficiency'],
    },
    {
      code: 'IEC 60034-1/12',
      title: 'Rotating electrical machines — Ratings & performance / Starting performance',
      year: '2022',
      scope: 'Motor nameplate rating, LR codes.',
      used: ['motor-fl-current', 'motor-starting'],
    },
    {
      code: 'IEC 60947-4-1',
      title: 'Low-voltage switchgear — Contactors & motor-starters',
      year: '2023',
      scope: 'Type 1/2 coordination for motor starters.',
      used: ['motor-breaker'],
    },
    {
      code: 'IEEE C57.12.00 / .90',
      title: 'Standard for liquid-immersed distribution transformers',
      year: '2021',
      scope: 'Ratings, impedances, test methods.',
      used: ['transformer-sizing', 'transformer-current'],
    },
    {
      code: 'IEEE 1459-2010',
      title: 'Definitions for the measurement of electric power quantities',
      year: '2010',
      scope: 'PF, displacement vs true PF, harmonic power.',
      used: ['power-factor', 'single-phase-power', 'three-phase-power'],
    },
    {
      code: 'NEC NFPA 70 (2023)',
      title: 'National Electrical Code',
      year: '2023',
      scope: 'US electrical installation, Article 210, 215, 220, 240, 310, 430.',
      used: ['breaker-sizing', 'fuse-sizing', 'cable-sizing', 'motor-fl-current'],
    },
    {
      code: 'NEMA MG-1',
      title: 'Motors and generators',
      year: '2021',
      scope: 'Motor performance, LR codes, Design A/B/C/D.',
      used: ['motor-fl-current', 'motor-starting'],
    },
    {
      code: 'IEEE 80',
      title: 'IEEE Guide for safety in AC substation grounding',
      year: '2013',
      scope: 'Substation ground grid, step & touch potentials.',
      used: ['ground-resistance'],
    },
  ];

  return (
    <div className="container-px mx-auto max-w-5xl py-8">
      <div className="text-2xs font-mono uppercase tracking-datasheet text-ink-600 mb-3">
        <Link to="/" className="hover:text-live">Home</Link>
        <span className="text-ink-400 mx-1.5">/</span>
        <span className="text-ink">Standards</span>
      </div>
      <header className="mb-8 pb-3 border-b-2 border-ink-900">
        <div className="eyebrow mb-1">Reference · 10 standards</div>
        <h1 className="text-3xl sm:text-4xl font-display font-semibold text-ink tracking-tight">Standards library</h1>
        <p className="text-sm text-ink-700 mt-2 max-w-2xl">
          The formulas, default values, and recommendations in PowerSys Calc reference these international standards. Always confirm applicability with the local authority having jurisdiction (AHJ).
        </p>
      </header>

      <div className="space-y-3">
        {standards.map((s) => (
          <div key={s.code} className="bg-paper-bright border border-rule p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Icon name="doc" className="h-4 w-4 text-ink shrink-0" />
                  <h2 className="text-base font-display font-semibold text-ink">{s.code}</h2>
                  <span className="font-mono text-2xs text-ink-600">{s.year}</span>
                </div>
                <div className="text-sm text-ink-800">{s.title}</div>
                <p className="text-2xs text-ink-600 mt-1.5">{s.scope}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-rule flex flex-wrap items-center gap-1.5">
              <span className="text-2xs font-mono uppercase tracking-datasheet text-ink-600">Used in:</span>
              {s.used.map((slug) => (
                <Link
                  key={slug}
                  to={`/${slug}`}
                  className="border border-rule bg-paper px-1.5 py-0.5 text-2xs font-mono text-ink-800 hover:border-ink-900 hover:text-live"
                >
                  {slug}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AboutPage() {
  useSEO({
    title: 'About PowerSys Calc | Engineering Toolbox',
    description: 'About the PowerSys Calc platform — engineering-grade calculations, offline-ready, PWA.',
    canonicalPath: '/about',
  });
  return (
    <div className="container-px mx-auto max-w-3xl py-8">
      <div className="text-2xs font-mono uppercase tracking-datasheet text-ink-600 mb-3">
        <Link to="/" className="hover:text-live">Home</Link>
        <span className="text-ink-400 mx-1.5">/</span>
        <span className="text-ink">About</span>
      </div>
      <h1 className="text-3xl sm:text-4xl font-display font-semibold text-ink tracking-tight">About PowerSys Calc</h1>
      <div className="prose prose-invert max-w-none mt-6 space-y-4 text-ink-800 text-sm leading-relaxed">
        <p>
          <strong className="text-ink">PowerSys Calc</strong> is a frontend-only engineering toolbox for electrical design engineers and power system professionals. Every calculation runs in your browser — your inputs never leave this device.
        </p>
        <p>
          The platform started as an internal tool for sizing feeders, transformers, and motor circuits during project design reviews. It has grown into a comprehensive toolbox covering nine engineering disciplines and 25+ specialized calculations.
        </p>
        <h2 className="text-xl font-display font-semibold text-ink pt-4">How it works</h2>
        <p>
          All math is implemented from first principles using the documented equations in IEC, IEEE, NEC, and NEMA standards. Reference values (e.g., copper ampacity at 60 °C) are stored in a small in-browser dataset, and engineering recommendations are surfaced alongside raw calculations.
        </p>
        <h2 className="text-xl font-display font-semibold text-ink pt-4">Disclaimer</h2>
        <p>
          PowerSys Calc is an engineering aid, not a replacement for a licensed professional engineer. Always verify results against local codes, project specifications, and manufacturer data. The authors accept no liability for engineering decisions based on the platform.
        </p>
      </div>
    </div>
  );
}

export function MethodologyPage() {
  useSEO({
    title: 'Methodology | PowerSys Calc',
    description: 'How PowerSys Calc implements engineering formulas.',
    canonicalPath: '/methodology',
  });
  return (
    <div className="container-px mx-auto max-w-3xl py-8">
      <h1 className="text-3xl sm:text-4xl font-display font-semibold text-ink tracking-tight">Methodology</h1>
      <div className="prose prose-invert max-w-none mt-6 space-y-4 text-ink-800 text-sm leading-relaxed">
        <p>Our implementation follows three principles:</p>
        <ol className="list-decimal list-inside space-y-2 text-ink-800">
          <li><strong className="text-ink">First-principles formulas</strong> — every equation is implemented from the cited standard, not from a black-box library.</li>
          <li><strong className="text-ink">Documented assumptions</strong> — temperature, altitude, grouping, derating factors are all explicit inputs.</li>
          <li><strong className="text-ink">Conservative defaults</strong> — when a value could be derived or defaulted, we err on the safe side (e.g., continuous load factor 1.25).</li>
        </ol>
        <h2 className="text-xl font-display font-semibold text-ink pt-4">Validation</h2>
        <p>
          Each calculation is unit-tested against published worked examples from textbooks (e.g., &quot;Electrical Power Systems&quot; by C.L. Wadhwa) and manufacturer datasheets. Discrepancies &gt; 1% are investigated and resolved before release.
        </p>
      </div>
    </div>
  );
}

export function FaqPage() {
  useSEO({
    title: 'FAQ | PowerSys Calc',
    description: 'Frequently asked questions about the platform.',
    canonicalPath: '/faq',
  });
  const faqs = [
    { q: 'Is PowerSys Calc free to use?', a: 'Yes. The current version is free to use. Future Pro features (saved projects, team collaboration) will be optional.' },
    { q: 'Does my data leave the browser?', a: 'No. The application is fully client-side. Inputs are kept in local storage only for the "recently used" feature.' },
    { q: 'Which standards are supported?', a: 'IEC 60364 (LV), IEC 60076 (transformers), IEEE C57 (transformers), IEEE 1459 (power), NEC NFPA 70, NEMA MG-1. Standards references are listed per calculator.' },
    { q: 'Can I use it offline?', a: 'Yes — once loaded, the application works offline (PWA-ready). Your browser cache must be enabled.' },
    { q: 'How accurate are the calculations?', a: 'Within the standard’s stated accuracy, with temperature-corrected resistance and proper √3 / 2 factors. Results are shown to 2 decimal places by default; precision can be increased where justified.' },
    { q: 'Can I use it for stamped drawings?', a: 'No. PowerSys Calc is a design aid. Final engineering decisions must be made by a licensed professional engineer who has reviewed the inputs and the local code requirements.' },
  ];
  return (
    <div className="container-px mx-auto max-w-3xl py-8">
      <h1 className="text-3xl sm:text-4xl font-display font-semibold text-ink tracking-tight">Frequently asked questions</h1>
      <div className="mt-6 space-y-2">
        {faqs.map((f) => (
          <details key={f.q} className="group bg-paper-bright border border-rule open:border-ink-900">
            <summary className="flex items-center justify-between cursor-pointer list-none p-4">
              <span className="text-sm font-medium text-ink">{f.q}</span>
              <Icon name="chevron-down" className="h-4 w-4 text-ink-600 group-open:rotate-180 transition-transform" />
            </summary>
            <p className="text-sm text-ink-700 leading-relaxed px-4 pb-4 border-t border-rule pt-3">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
