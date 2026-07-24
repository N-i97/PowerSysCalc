import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { CalculatorDefinition } from '../../engine/calculator';
import { Field, NumberInput, Select, Segmented } from '../ui/Input';
import { listUnits } from '../../engine/units';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { useCalculator } from '../../hooks/useCalculator';
import { ResultGrid, ResultCard } from '../ui/ResultCard';
import { Notice, Badge } from '../ui/Badge';
import { Formula } from '../ui/Formula';
import { DataTable } from '../ui/Table';
import { useEffect } from 'react';
import { useRecent } from '../../hooks/useRecent';
import { useSEO } from '../../hooks/useSEO';
import { Schematic } from '../schematic/Schematic';

export function CalculatorLayout({ def, children }: { def: CalculatorDefinition; children?: ReactNode }) {
  const { values, set, units, setUnit, output, messages, calculate, reset } = useCalculator(def);
  const { track } = useRecent();

  useSEO({
    title: def.seo.title,
    description: def.seo.description,
    keywords: def.seo.keywords,
    canonicalPath: `/${def.slug}`,
  });

  useEffect(() => {
    track(def.slug, def.title);
  }, [def.slug, def.title, track]);

  // Reset all state and recompute when navigating to a different calculator
  useEffect(() => {
    reset();
    calculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [def.slug]);

  const hasErrors = messages.some((m) => m.level === 'error');

  return (
    <div className="container-px mx-auto max-w-[1500px] py-6 sm:py-8">
      {/* Breadcrumb */}
      <div className="text-2xs font-mono uppercase tracking-datasheet text-ink-600 mb-3 flex items-center gap-2">
        <Link to="/" className="hover:text-live">Home</Link>
        <span className="text-ink-400">/</span>
        <Link to={`/category/${def.category}`} className="hover:text-live">{def.category.replace('-', ' ')}</Link>
        <span className="text-ink-400">/</span>
        <span className="text-ink">{def.shortTitle}</span>
      </div>

      {/* Title block */}
      <header className="mb-6 sm:mb-8">
        <div className="flex items-start gap-4">
          <span aria-hidden className="hidden sm:inline-flex h-12 w-12 items-center justify-center border-2 border-ink-900 bg-paper-bright shrink-0">
            <Icon name={def.icon ?? 'bolt'} className="h-6 w-6 text-ink" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="eyebrow mb-1">Calculator · {def.category.replace('-', ' ')}</div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-ink tracking-tight">
              {def.title}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-ink-700 max-w-3xl">
              {def.tagline}
            </p>
          </div>
        </div>
        {typeof def.description === 'string' ? (
          <p className="mt-4 text-sm text-ink-700 max-w-3xl leading-relaxed border-l-2 border-ink-900 pl-3">{def.description}</p>
        ) : null}
      </header>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-6">
        {/* INPUT PANEL */}
        <section aria-labelledby="input-heading" className="space-y-4">
          <div className="bg-paper-bright border border-rule shadow-paper">
            <div className="flex items-center justify-between p-5 pb-4 border-b border-rule">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 min-w-6 items-center justify-center border border-ink-900 px-1.5 font-mono text-2xs text-ink">01</span>
                <h2 id="input-heading" className="text-lg font-display font-semibold text-ink">Input parameters</h2>
              </div>
              <Button size="sm" variant="ghost" onClick={reset}>Reset</Button>
            </div>

            <div className="p-5 space-y-4">
              {def.fields.map((f) => {
                const val = values[f.name];
                const err = messages.find((m) => m.field === f.name && m.level === 'error')?.message;
                if (f.options) {
                  return (
                    <Field key={f.name} label={f.label} help={f.help}>
                      {f.options.length > 4 ? (
                        <Select
                          value={String(val ?? f.options[0].value)}
                          onChange={(v) => set(f.name, v)}
                          options={f.options}
                        />
                      ) : (
                        <Segmented
                          value={String(val ?? f.options[0].value) as never}
                          onChange={(v) => set(f.name, v)}
                          options={f.options.map((o) => ({ value: o.value as never, label: o.label }))}
                        />
                      )}
                    </Field>
                  );
                }
                if (f.unitGroup) {
                  const allUnits = listUnits(f.unitGroup);
                  const available = f.unitOptions
                    ? allUnits.filter((u) => f.unitOptions!.includes(u.id))
                    : allUnits;
                  const currentUnit = units[f.name] ?? f.defaultUnit ?? available[0]?.id;
                  return (
                    <Field key={f.name} label={f.label} unit={currentUnit} help={f.help} error={err}>
                      <NumberInput
                        value={val === '' || val === undefined ? '' : Number(val)}
                        onChange={(v) => set(f.name, v)}
                        suffix={
                          <select
                            value={currentUnit}
                            onChange={(e) => setUnit(f.name, e.target.value)}
                            className="bg-transparent text-2xs font-mono text-ink-800 outline-none"
                            aria-label="Unit"
                          >
                            {available.map((u) => <option key={u.id} value={u.id} className="bg-paper-bright">{u.symbol || u.label}</option>)}
                          </select>
                        }
                        step={f.step}
                        min={f.min}
                        max={f.max}
                        required={f.required}
                        placeholder={f.placeholder}
                      />
                    </Field>
                  );
                }
                return (
                  <Field key={f.name} label={f.label} help={f.help} error={err}>
                    <NumberInput
                      value={val === '' || val === undefined ? '' : Number(val)}
                      onChange={(v) => set(f.name, v)}
                      step={f.step}
                      min={f.min}
                      max={f.max}
                      required={f.required}
                      placeholder={f.placeholder}
                    />
                  </Field>
                );
              })}
            </div>

            <div className="border-t-2 border-ink-900 bg-paper-deep p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <Button onClick={calculate} fullWidth size="lg" icon={<Icon name="bolt" className="h-4 w-4" />}>
                  Calculate
                </Button>
                <Button onClick={reset} variant="secondary" size="lg" icon={<Icon name="close" className="h-4 w-4" />}>
                  Clear
                </Button>
              </div>
              {hasErrors ? (
                <p className="mt-2 text-2xs text-signal-err font-mono">Fix input errors to calculate.</p>
              ) : null}
            </div>
          </div>

          {/* Warnings / Validation */}
          {messages.length > 0 ? (
            <div className="space-y-2">
              {messages.map((m, i) => (
                <Notice key={i} tone={m.level === 'error' ? 'err' : m.level === 'warning' ? 'warn' : 'info'}>
                  <span className="font-mono text-2xs uppercase tracking-datasheet mr-1.5 opacity-70">{m.field}</span>
                  {m.message}
                </Notice>
              ))}
            </div>
          ) : null}
        </section>

        {/* RESULTS */}
        <section aria-labelledby="results-heading" className="space-y-4">
          {output ? (
            <>
              {/* Result header */}
              <div className="bg-paper-bright border-2 border-ink-900">
                <div className="flex items-center justify-between p-5 pb-4 border-b-2 border-ink-900 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 min-w-6 items-center justify-center border border-ink-900 px-1.5 font-mono text-2xs text-ink">02</span>
                    <h2 id="results-heading" className="text-lg font-display font-semibold text-ink">Results</h2>
                  </div>
                  {output.status ? (
                    <Badge tone={output.status === 'ok' ? 'ok' : output.status === 'warn' ? 'warn' : output.status === 'err' ? 'err' : 'info'}>
                      {output.status.toUpperCase()}
                    </Badge>
                  ) : null}
                </div>
                <div className="p-5">
                {output.summary ? (
                  <div className="border-2 border-live bg-live/5 p-3 mb-4">
                    <div className="eyebrow text-live mb-1">Summary</div>
                    <div className="font-mono text-base text-ink">{output.summary}</div>
                  </div>
                ) : null}
                <ResultGrid>
                  {output.rows.map((r, i) => (
                    <ResultCard
                      key={i}
                      label={r.label}
                      value={typeof r.value === 'number' ? formatNumeric(r.value) : r.value}
                      unit={r.unit}
                      caption={r.formula}
                      highlight={r.highlight}
                      status={r.status}
                      index={i + 1}
                    />
                  ))}
                </ResultGrid>
                </div>
              </div>

              {/* Picks (recommended cable, breaker, etc.) */}
              {output.picks && Object.keys(output.picks).length > 0 ? (
                <PicksPanel picks={output.picks} />
              ) : null}

              {/* Warnings & Recommendations */}
              {def.warnings && def.warnings(values, output).length > 0 ? (
                <div className="space-y-2">
                  {def.warnings(values, output).map((w, i) => (
                    <Notice key={i} tone="warn" title="Warning">{w}</Notice>
                  ))}
                </div>
              ) : null}
              {def.recommendations && def.recommendations(values, output).length > 0 ? (
                <div className="space-y-2">
                  {def.recommendations(values, output).map((r, i) => (
                    <Notice key={i} tone="info" title="Engineering recommendation">{r}</Notice>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <div className="bg-paper-bright border-2 border-ink-900 p-5">
              <div className="text-center py-8 text-ink-600">
                <Icon name="bolt" className="h-10 w-10 mx-auto text-ink-500 mb-2" />
                <p>Enter values and press <span className="font-mono text-ink">Calculate</span>.</p>
              </div>
            </div>
          )}

          {children}
        </section>
      </div>

      {/* DOCUMENTATION */}
      <div className="mt-12 space-y-10">
        {/* Formulas */}
        {def.formulas.length > 0 ? (
          <section>
            <SectionHeader number="03" title="Formulas" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {def.formulas.map((f, i) => (
                <Formula key={i} number={String(i + 1).padStart(2, '0')} label={f.name}>
                  <MathExpr expr={f.expression} />
                  {f.variables ? <div className="mt-1 text-2xs text-ink-600">{f.variables}</div> : null}
                </Formula>
              ))}
            </div>
          </section>
        ) : null}

        {/* Steps */}
        {def.steps && output ? (
          <section>
            <SectionHeader number="04" title="Step-by-step" />
            <div className="bg-paper-bright border border-rule p-5">
              <ol className="space-y-3">
                {def.steps(values, output).map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center border border-ink-900 bg-paper font-mono text-2xs text-ink">{String(i + 1).padStart(2, '0')}</span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-ink">{s.label}</div>
                      <div className="font-mono text-2xs text-ink-700 mt-0.5 break-words">
                        {s.formula}{s.result ? <span className="text-live font-semibold"> → {s.result}</span> : null}
                      </div>
                      {s.note ? <div className="text-2xs text-ink-600 mt-0.5">{s.note}</div> : null}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        ) : null}

        {/* Schematic */}
        {def.schematic ? (
          <section>
            <SectionHeader number="05" title="Typical single-line" />
            <div className="bg-paper-bright border border-rule p-5">
              <Schematic kind={def.schematic} />
            </div>
          </section>
        ) : null}

        {/* Standards */}
        {def.notes && def.notes.length > 0 ? (
          <section>
            <SectionHeader number="06" title="Standards & references" />
            <DataTable
              data={def.notes}
              columns={[
                { key: 'std', header: 'Standard', cell: (r) => <Badge tone="accent">{r.standard}</Badge> },
                { key: 'ref', header: 'Reference', cell: (r) => <span className="text-ink font-medium">{r.reference}</span> },
                { key: 'txt', header: 'Excerpt', cell: (r) => <span className="text-ink-800 text-xs">{r.text}</span> },
              ]}
            />
          </section>
        ) : null}

        {/* Related */}
        {def.related && def.related.length > 0 ? (
          <section>
            <SectionHeader number="07" title="Related calculators" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {def.related.map((r) => (
                <Link
                  key={r.slug}
                  to={`/${r.slug}`}
                  className="group bg-paper-bright border border-rule p-4 hover:border-ink-900 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-mono text-2xs uppercase tracking-datasheet text-live">{r.reason}</div>
                    <Icon name="arrow-right" className="h-3.5 w-3.5 text-ink-500 group-hover:text-live group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="text-base font-medium text-ink">{r.label}</div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {/* FAQ */}
        {def.faq && def.faq.length > 0 ? (
          <section>
            <SectionHeader number="08" title="FAQ" />
            <div className="space-y-2">
              {def.faq.map((f, i) => (
                <details key={i} className="group bg-paper-bright border border-rule open:border-ink-900">
                  <summary className="flex items-center justify-between cursor-pointer list-none p-4">
                    <span className="text-sm font-medium text-ink">{f.q}</span>
                    <Icon name="chevron-down" className="h-4 w-4 text-ink-600 group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="mt-0 text-sm text-ink-700 leading-relaxed px-4 pb-4 border-t border-rule pt-3">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-end justify-between gap-3 pb-2 mb-4 border-b-2 border-ink-900">
      <h2 className="text-xl sm:text-2xl font-display font-semibold text-ink flex items-center gap-3">
        <span className="font-mono text-base text-live tabular-nums">{number}</span>
        {title}
      </h2>
    </div>
  );
}

function PicksPanel({ picks }: { picks: Record<string, number | string | undefined> }) {
  const entries = Object.entries(picks).filter(([, v]) => v !== undefined && v !== '');
  if (entries.length === 0) return null;
  return (
    <div className="bg-paper-bright border-2 border-live p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex h-6 min-w-6 items-center justify-center border border-ink-900 px-1.5 font-mono text-2xs text-ink">★</span>
        <h3 className="text-sm font-display font-semibold text-ink">Recommended selections</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {entries.map(([k, v]) => (
          <div key={k} className="border border-rule bg-paper p-2.5">
            <div className="text-2xs font-mono uppercase tracking-datasheet text-ink-600">{humanKey(k)}</div>
            <div className="font-mono text-base text-ink mt-0.5 font-semibold">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function humanKey(k: string): string {
  return ({
    cableSize: 'Cable size',
    cableSizeAWG: 'Cable AWG',
    breakerRating: 'Breaker rating',
    breakerFrame: 'Breaker frame',
    transformerKVA: 'Transformer kVA',
    motorFLC: 'Motor FLC',
    capacitorKVAr: 'Capacitor kVAr',
  } as Record<string, string>)[k] ?? k;
}

function formatNumeric(n: number): string {
  if (!Number.isFinite(n)) return '—';
  const abs = Math.abs(n);
  if (abs === 0) return '0';
  if (abs >= 1_000_000) return n.toExponential(3);
  if (abs < 0.001) return n.toExponential(3);
  const str = abs >= 1000 ? n.toFixed(0) : n.toFixed(2);
  return str.replace(/\.?0+$/, '');
}

function MathExpr({ expr }: { expr: string }) {
  // Light-touch math rendering: replace common symbols with Unicode
  const formatted = expr
    .replace(/sqrt\(([^)]+)\)/g, '√($1)')
    .replace(/cdot/g, '·')
    .replace(/times/g, '×')
    .replace(/·/g, '·')
    .replace(/alpha/g, 'α')
    .replace(/beta/g, 'β')
    .replace(/gamma/g, 'γ')
    .replace(/Delta/g, 'Δ')
    .replace(/phi/g, 'φ')
    .replace(/lambda/g, 'λ')
    .replace(/rho/g, 'ρ')
    .replace(/omega/g, 'ω')
    .replace(/pi/g, 'π')
    .replace(/<=>/g, '⇔')
    .replace(/<=/g, '≤')
    .replace(/>=/g, '≥')
    .replace(/!=/g, '≠');
  return <span className="text-ink">{formatted}</span>;
}
