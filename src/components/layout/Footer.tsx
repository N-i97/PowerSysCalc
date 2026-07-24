import { Link } from 'react-router-dom';
import { CATEGORIES, ALL_CALCULATORS } from '../../data/registry';
import { Icon } from '../ui/Icon';

export function Footer() {
  return (
    <footer className="relative mt-16 border-t-2 border-ink-900 bg-paper">
      <div className="relative container-px mx-auto max-w-[1500px] py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-2 lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <span aria-hidden className="inline-flex h-8 w-8 items-center justify-center border border-ink-900 bg-paper-bright">
                <svg viewBox="0 0 32 32" className="h-5 w-5 text-ink" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 18 L13 18 L16 10 L20 24 L23 14 L28 14" />
                </svg>
              </span>
              <div className="leading-tight">
                <div className="font-display font-semibold text-ink">PowerSys <span className="text-live">Calc</span></div>
                <div className="text-2xs font-mono text-ink-600 uppercase tracking-nameplate">Engineering Reference</div>
              </div>
            </div>
            <p className="text-sm text-ink-700 max-w-md leading-relaxed">
              Fast, accurate, engineering-grade calculations for power system design. All math runs in your browser — your inputs never leave this device.
            </p>
            <div className="flex items-center gap-2 text-2xs font-mono text-ink-600">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-ok" />
              All systems nominal · 50/60 Hz · 100–1000 V
            </div>
          </div>

          <div>
            <div className="eyebrow mb-3">Categories</div>
            <ul className="space-y-1.5">
              {CATEGORIES.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <Link to={`/${c.slug}`} className="text-sm text-ink-700 hover:text-live">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="eyebrow mb-3">Resources</div>
            <ul className="space-y-1.5">
              {[
                ['Standards', '/standards'],
                ['Methodology', '/methodology'],
                ['About', '/about'],
                ['FAQ', '/faq'],
              ].map(([l, h]) => (
                <li key={l}>
                  <Link to={h} className="text-sm text-ink-700 hover:text-live">{l}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="eyebrow mb-3">Standards</div>
            <ul className="space-y-1.5 text-2xs font-mono text-ink-600">
              <li>IEC 60364-5-52</li>
              <li>IEC 60898 / 60947-2</li>
              <li>IEEE C57 Series</li>
              <li>NEC NFPA 70 (2023)</li>
              <li>NEMA MG-1</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-rule flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-2xs font-mono text-ink-600">
          <div>© {new Date().getFullYear()} PowerSys Calc · v1.0 · {ALL_CALCULATORS.length} calculators</div>
          <div className="flex items-center gap-4">
            <span>For design verification only. Verify against local code & project specifications.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
