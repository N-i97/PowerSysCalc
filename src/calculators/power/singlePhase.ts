import type { CalculatorDefinition } from '../../engine/calculator';
import { round } from '../../engine/math';

export const calc: CalculatorDefinition = {
  slug: 'single-phase-power',
  title: 'Single-Phase Power Calculator',
  shortTitle: 'Single-phase power',
  category: 'power',
  icon: 'bolt',
  featured: true,
  tagline: 'Real, reactive, and apparent power in a single-phase AC system.',
  keywords: ['single phase', 'power', 'kW', 'kVA', 'kVAr', 'PF', 'AC'],
  description:
    'Compute real power (P), reactive power (Q), apparent power (S) and current (I) in a single-phase AC circuit from voltage, current, and power factor. Useful for residential, light commercial, and small auxiliary load design.',
  fields: [
    { name: 'V',  label: 'Voltage',          unitGroup: 'voltage', defaultUnit: 'V',  unitOptions: ['V', 'kV'],  defaultValue: 230, required: true, positive: true, help: 'Line-to-neutral RMS voltage' },
    { name: 'I',  label: 'Current',          unitGroup: 'current', defaultUnit: 'A',  unitOptions: ['A', 'kA'], defaultValue: 20,  required: true, positive: true, help: 'Load RMS current' },
    { name: 'pf', label: 'Power factor',     defaultValue: 0.9, min: 0, max: 1, step: 0.01, required: true, help: 'cos φ between 0 and 1' },
    { name: 'phiUnit', label: 'PF interpretation', defaultValue: 'leading', options: [
      { value: 'lagging',  label: 'Lagging (inductive)' },
      { value: 'leading',  label: 'Leading (capacitive)' },
    ] },
  ],
  compute: (input) => {
    const V  = Number(input.V);
    const I  = Number(input.I);
    const pf = Number(input.pf);
    const S  = V * I;              // VA
    const P  = S * pf;             // W
    const Q  = S * Math.sqrt(Math.max(0, 1 - pf * pf)); // var
    const phi = Math.acos(pf) * 180 / Math.PI;
    return {
      rows: [
        { label: 'Apparent power S',  value: round(S, 2),     unit: 'VA',   formula: 'S = V · I' },
        { label: 'Real power P',      value: round(P, 2),     unit: 'W',    formula: 'P = V · I · cos φ' },
        { label: 'Reactive power Q',  value: round(Q, 2),     unit: 'var', formula: 'Q = V · I · sin φ' },
        { label: 'Power factor',      value: round(pf, 3),    unit: '',    formula: 'cos φ' },
        { label: 'Phase angle φ',     value: round(phi, 2),   unit: '°',   formula: 'φ = cos⁻¹(PF)' },
        { label: 'Current I',         value: round(I, 2),     unit: 'A',   formula: 'given' },
        { label: 'Voltage V',         value: round(V, 2),     unit: 'V',   formula: 'given' },
      ],
      raw: { V, I, pf, S, P, Q, phi },
      status: pf < 0.7 ? 'warn' : 'ok',
      summary: `S = ${round(S/1000, 3)} kVA · P = ${round(P/1000, 3)} kW · Q = ${round(Q/1000, 3)} kVAr`,
    };
  },
  formulas: [
    { name: 'Apparent power',   expression: 'S = V · I',            variables: 'V (V), I (A) → VA' },
    { name: 'Real power',       expression: 'P = V · I · cos φ',    variables: 'cos φ = power factor' },
    { name: 'Reactive power',   expression: 'Q = V · I · sin φ',    variables: 'sin φ = √(1 − cos²φ)' },
    { name: 'Power triangle',   expression: 'S² = P² + Q²',         variables: 'P, Q, S form a right triangle' },
  ],
  steps: (_i, o) => [
    { label: 'Compute S',  formula: 'S = V × I',                result: `${o.raw.V} × ${o.raw.I} = ${round((o.raw.S as number), 2)} VA` },
    { label: 'Compute P',  formula: 'P = S × cos φ',            result: `${round(o.raw.S as number, 2)} × ${o.raw.pf} = ${round(o.raw.P as number, 2)} W` },
    { label: 'Compute Q',  formula: 'Q = √(S² − P²)',           result: `Q = ${round(o.raw.Q as number, 2)} var` },
    { label: 'Phase angle', formula: 'φ = cos⁻¹(pf)',           result: `${round(o.raw.phi as number, 2)}°` },
  ],
  notes: [
    { standard: 'IEEE',  reference: 'IEEE 1459-2010',   text: 'Defines measurement of AC electric power under sinusoidal and non-sinusoidal conditions. Above formulas assume sinusoidal, balanced load.' },
    { standard: 'IEC',   reference: 'IEC 60038',        text: 'Standard nominal voltages: 230 V / 400 V (50 Hz) for IEC markets.' },
  ],
  recommendations: (_i, o) => {
    const r: string[] = [];
    if ((o.raw.pf as number) < 0.85) r.push('Power factor is below 0.85 — consider PF correction capacitors to reduce kVAr demand and I²R losses.');
    if ((o.raw.pf as number) < 0.7)  r.push('Low PF may incur utility penalties. Aim for PF ≥ 0.90 in commercial/industrial facilities.');
    return r;
  },
  warnings: (_i, o) => {
    const w: string[] = [];
    if ((o.raw.pf as number) > 1.0001) w.push('PF > 1 is not physical; check the PF value.');
    if ((o.raw.V as number) <= 0 || (o.raw.I as number) <= 0) w.push('Voltage and current must be positive.');
    return w;
  },
  faq: [
    { q: 'What is the difference between kW and kVA?',
      a: 'kW is real (working) power consumed by the load. kVA is apparent power — the product of V and I. They differ by the power factor: kW = kVA × cos φ.' },
    { q: 'Is residential supply single-phase?',
      a: 'In most regions (EU/UK/AU) residential service is single-phase 230 V, derived from a three-phase distribution. In North America, residential is 120/240 V split-phase (a two-phase derivation).' },
  ],
  related: [
    { slug: 'three-phase-power',     label: 'Three-phase power',         reason: 'Same quantities for balanced 3φ systems' },
    { slug: 'power-factor',          label: 'Power factor',              reason: 'From real & apparent power' },
    { slug: 'pf-correction',         label: 'PF correction',             reason: 'Capacitor bank to improve PF' },
  ],
  schematic: 'single-line',
  seo: {
    title: 'Single-Phase Power Calculator (P, Q, S, I) | PowerSys Calc',
    description: 'Free single-phase AC power calculator — compute real, reactive, and apparent power, current, and phase angle. IEC & IEEE aligned.',
    keywords: ['single phase power calculator', 'kW kVA kVAr', 'power factor', 'AC power formula'],
  },
};
