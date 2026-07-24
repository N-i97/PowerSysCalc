import type { CalculatorDefinition } from '../../engine/calculator';
import { SQRT3 } from '../../engine/constants';
import { nextTransformerKvaUp } from '../../engine/cableData';
import { round } from '../../engine/math';

export const calc: CalculatorDefinition = {
  slug: 'transformer-sizing',
  title: 'Transformer Sizing Calculator',
  shortTitle: 'Transformer sizing',
  category: 'transformer',
  icon: 'transformer',
  featured: true,
  tagline: 'Select transformer kVA from load, with future growth.',
  keywords: ['transformer sizing', 'kVA', 'distribution transformer', 'IEC 60076'],
  description:
    'Size a distribution transformer from connected load, demand factor, and optional future growth margin. Returns the next standard kVA rating per typical 3φ distribution sizes (15–5000 kVA).',
  fields: [
    { name: 'P',   label: 'Real load P',         defaultValue: 180, positive: true, required: true, unitGroup: 'power', defaultUnit: 'kW', unitOptions: ['W', 'kW', 'MW', 'hp', 'hp_m'] },
    { name: 'pf',  label: 'Power factor',        defaultValue: 0.9, min: 0.5, max: 1, step: 0.01, required: true },
    { name: 'df',  label: 'Demand factor',       defaultValue: 0.85, min: 0.01, max: 1, step: 0.01, help: 'Diversity already accounted for' },
    { name: 'grow',label: 'Future growth margin', defaultValue: 20, min: 0, max: 100, step: 1, help: '% extra capacity' },
    { name: 'Vll', label: 'Secondary voltage',   defaultValue: 400, positive: true, unitGroup: 'voltage', defaultUnit: 'V', unitOptions: ['V', 'kV'] },
    { name: 'eff', label: 'Transformer efficiency', defaultValue: 0.98, min: 0.5, max: 1, step: 0.01 },
    { name: 'ph',  label: 'Phase', defaultValue: '3', options: [
      { value: '1', label: 'Single-phase' },
      { value: '3', label: 'Three-phase' },
    ] },
  ],
  compute: (input) => {
    const P   = Number(input.P) * 1000;
    const pf  = Number(input.pf);
    const df  = Number(input.df);
    const grow = Number(input.grow) / 100;
    const eff = Number(input.eff);
    const ph  = String(input.ph);
    const S_load = (P / pf) * df * (1 + grow);  // VA demanded
    const S_tx   = S_load / eff;                 // size accounting for losses
    const stdkva = nextTransformerKvaUp(S_tx / 1000);
    const I_sec  = ph === '3' ? (stdkva * 1000) / (SQRT3 * Number(input.Vll)) : (stdkva * 1000) / Number(input.Vll);
    const loadRatio = (S_load / 1000) / stdkva * 100;
    return {
      rows: [
        { label: 'Required apparent S', value: round(S_load/1000, 2), unit: 'kVA', formula: 'P/PF · DF · (1+g)' },
        { label: 'Adjusted for losses', value: round(S_tx/1000, 2),   unit: 'kVA', formula: 'S_load / η' },
        { label: 'Standard size',       value: stdkva,                  unit: 'kVA', status: 'ok', formula: 'next std rating' },
        { label: 'Loading at full load',value: round(loadRatio, 1),     unit: '%', status: loadRatio > 100 ? 'err' : loadRatio > 80 ? 'warn' : 'ok', formula: 'S_load / S_tx' },
        { label: 'Secondary current',   value: round(I_sec, 1),        unit: 'A', formula: ph === '3' ? 'I = S / (√3·V)' : 'I = S / V' },
        { label: 'Voltage',             value: Number(input.Vll),      unit: 'V', formula: 'given' },
      ],
      raw: { P, pf, df, grow, eff, ph, S_load, S_tx, stdkva, I_sec, loadRatio },
      picks: { transformerKVA: stdkva },
      status: loadRatio > 100 ? 'err' : (loadRatio > 80 ? 'warn' : 'ok'),
      summary: `Size ${stdkva} kVA (${round(loadRatio, 1)}% loaded) · ${round(I_sec, 1)} A secondary at ${Number(input.Vll)} V`,
    };
  },
  formulas: [
    { name: 'Apparent load', expression: 'S_load = (P/PF) · DF · (1 + g)', variables: 'g = growth fraction' },
    { name: 'Standard kVA',  expression: 'S_tx = next ≥ S_load / η',       variables: 'η = transformer efficiency' },
    { name: 'Loading',       expression: 'Loading% = S_load / S_tx',     variables: '' },
  ],
  steps: (_i, o) => {
    const P = o.raw.P as number, pf = o.raw.pf as number, df = o.raw.df as number, g = o.raw.grow as number, eff = o.raw.eff as number;
    return [
      { label: 'S_load', formula: 'S_load = (P/PF) · DF · (1+g)', result: `${P/1000} / ${pf} · ${df} · ${1+g} = ${round((o.raw.S_load as number)/1000, 2)} kVA` },
      { label: 'S_tx',   formula: 'S_tx = S_load / η',            result: `${round((o.raw.S_tx as number)/1000, 2)} kVA` },
      { label: 'Next standard', formula: 'next ≥ S_tx',           result: `${o.raw.stdkva} kVA` },
      { label: 'Loading', formula: 'Loading = S_load / S_tx',     result: `${round(o.raw.loadRatio as number, 1)}%` },
    ];
  },
  notes: [
    { standard: 'IEC',  reference: 'IEC 60076-1', text: 'Power transformer ratings: standard kVA per IEC 60076 (e.g., 100, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500 kVA).' },
    { standard: 'IEEE', reference: 'IEEE C57.12.00', text: 'IEEE standard kVA ratings for liquid-immersed distribution transformers.' },
    { standard: 'IEC',  reference: 'IEC 60076-7', text: 'Loading guide — nameplate kVA is continuous at rated ambient; cyclic loading can exceed for short periods.' },
  ],
  recommendations: (_i, o) => {
    const r: string[] = [];
    const lr = o.raw.loadRatio as number;
    if (lr > 80) r.push('Loading > 80% — verify ventilation, ambient, and consider upsizing for cyclic peak loads.');
    if (lr < 30) r.push('Loading < 30% — transformer operates inefficiently at low load (no-load losses dominate).');
    r.push('Apply 20% spare for future growth unless explicitly accounted for.');
    r.push('For harmonic-rich loads (VFDs, rectifiers), use K-factor or H-grade transformer and derate per IEEE 1100.');
    return r;
  },
  faq: [
    { q: 'Should I derate for ambient temperature?',
      a: 'Yes. Oil-immersed transformers are rated at 30 °C average / 40 °C max ambient. Above 40 °C, derate ≈ 1% per °C above (typical).' },
  ],
  related: [
    { slug: 'transformer-current',   label: 'Transformer current',  reason: 'Primary/secondary FLA' },
    { slug: 'transformer-efficiency',label: 'Efficiency',           reason: 'Loss & efficiency' },
    { slug: 'demand-load',           label: 'Demand load',          reason: 'Connected → demand' },
  ],
  schematic: 'transformer',
  seo: {
    title: 'Transformer Sizing Calculator (kVA) | PowerSys Calc',
    description: 'Size distribution transformer kVA from connected load, demand factor, growth, and efficiency. Standard ratings per IEC 60076.',
    keywords: ['transformer sizing', 'kVA calculator', 'distribution transformer', 'IEC 60076'],
  },
};
