import type { CalculatorDefinition } from '../../engine/calculator';
import { SQRT3 } from '../../engine/constants';
import { round } from '../../engine/math';

export const calc: CalculatorDefinition = {
  slug: 'three-phase-power',
  title: 'Three-Phase Power Calculator',
  shortTitle: 'Three-phase power',
  category: 'three-phase',
  icon: 'three-phase',
  featured: true,
  tagline: 'Balanced three-phase real, reactive, apparent power & current.',
  keywords: ['three phase', 'power', 'kW', 'kVA', 'kVAr', 'PF', 'balanced'],
  description:
    'For balanced three-phase systems, calculate real power (P), reactive power (Q), apparent power (S), and line current from line-to-line voltage, current, and power factor. Use this for motors, transformers, and feeder sizing.',
  fields: [
    { name: 'Vll', label: 'Line-to-line voltage', unitGroup: 'voltage', defaultUnit: 'V', unitOptions: ['V', 'kV'], defaultValue: 400, required: true, positive: true },
    { name: 'I',   label: 'Line current',         unitGroup: 'current', defaultUnit: 'A', unitOptions: ['A', 'kA'], defaultValue: 50,   required: true, positive: true },
    { name: 'pf',  label: 'Power factor',         defaultValue: 0.88, min: 0, max: 1, step: 0.01, required: true },
    { name: 'mode', label: 'Calculation mode',    defaultValue: 'from_IV', options: [
      { value: 'from_IV', label: 'From V & I' },
      { value: 'from_P',  label: 'From P & I' },
      { value: 'from_S',  label: 'From S & V' },
    ] },
    { name: 'P_or_S', label: 'P (kW) or S (kVA)', defaultValue: 30, min: 0, help: 'Used when mode is "from P" or "from S"', positive: true, unitGroup: 'power', defaultUnit: 'kW', unitOptions: ['kW', 'kVA'] },
  ],
  compute: (input, ctx) => {
    const Vll = Number(input.Vll);
    const pf  = Number(input.pf);
    const mode = String(input.mode);
    let I = Number(input.I);
    let P: number, S: number, Q: number;
    if (mode === 'from_IV') {
      S = SQRT3 * Vll * I;
      P = S * pf;
      Q = S * Math.sqrt(Math.max(0, 1 - pf * pf));
    } else if (mode === 'from_P') {
      const isKVA = ctx?.units.P_or_S === 'kVA';
      P = Number(input.P_or_S) * (isKVA ? pf : 1000);
      S = P / pf;
      Q = S * Math.sqrt(Math.max(0, 1 - pf * pf));
      I = S / (SQRT3 * Vll);
    } else {
      const isKVA = ctx?.units.P_or_S === 'kVA';
      S = Number(input.P_or_S) * (isKVA ? 1000 : 1000);
      I = S / (SQRT3 * Vll);
      P = S * pf;
      Q = S * Math.sqrt(Math.max(0, 1 - pf * pf));
    }
    const phi = Math.acos(pf) * 180 / Math.PI;
    return {
      rows: [
        { label: 'Apparent power S',  value: round(S/1000, 3),  unit: 'kVA',   formula: 'S = √3 · V_LL · I' },
        { label: 'Real power P',      value: round(P/1000, 3),  unit: 'kW',    formula: 'P = √3 · V_LL · I · cos φ' },
        { label: 'Reactive power Q',  value: round(Q/1000, 3),  unit: 'kVAr', formula: 'Q = √3 · V_LL · I · sin φ' },
        { label: 'Line current I',    value: round(I, 2),       unit: 'A',    formula: 'I = S / (√3 · V_LL)' },
        { label: 'Phase voltage V_LN',value: round(Vll/SQRT3, 1), unit: 'V', formula: 'V_LN = V_LL / √3' },
        { label: 'Phase angle φ',     value: round(phi, 2),     unit: '°',    formula: 'φ = cos⁻¹(pf)' },
      ],
      raw: { Vll, I, pf, S, P, Q, phi },
      status: pf < 0.7 ? 'warn' : 'ok',
      summary: `P = ${round(P/1000,2)} kW · S = ${round(S/1000,2)} kVA · I = ${round(I,1)} A`,
    };
  },
  formulas: [
    { name: 'Apparent power',  expression: 'S = √3 · V_LL · I',          variables: 'V_LL (V), I (A) → VA' },
    { name: 'Real power',      expression: 'P = √3 · V_LL · I · cos φ',  variables: 'cos φ = power factor' },
    { name: 'Reactive power',  expression: 'Q = √3 · V_LL · I · sin φ',  variables: 'sin φ = √(1 − cos²φ)' },
    { name: 'Line current',    expression: 'I = S / (√3 · V_LL)',        variables: 'From S and V_LL' },
  ],
  steps: (_i, o) => {
    const Vll = o.raw.Vll as number, I = o.raw.I as number, pf = o.raw.pf as number, S = o.raw.S as number;
    return [
      { label: 'Compute S', formula: 'S = √3 · V_LL · I', result: `1.732 × ${Vll} × ${round(I,2)} = ${round(S,1)} VA` },
      { label: 'Compute P', formula: 'P = S · cos φ',     result: `${round(S,1)} × ${pf} = ${round(o.raw.P as number,1)} W` },
      { label: 'Compute Q', formula: 'Q = √(S² − P²)',    result: `${round(o.raw.Q as number,1)} var` },
      { label: 'Phase voltage', formula: 'V_LN = V_LL / √3', result: `${round(Vll/SQRT3,1)} V` },
    ];
  },
  notes: [
    { standard: 'IEC',  reference: 'IEC 60038',  text: 'Standard 3φ voltages: 400 V, 690 V (LV); 3.3, 6.6, 11, 22, 33 kV (MV).' },
    { standard: 'ANSI', reference: 'ANSI C84.1', text: 'Standard 3φ voltages: 208, 240, 480, 600 V (LV); 4.16, 13.8, 34.5 kV (MV).' },
  ],
  recommendations: (_i, o) => {
    const r: string[] = [];
    const pf = o.raw.pf as number;
    if (pf < 0.85) r.push('PF below 0.85 — consider capacitor bank for PF correction.');
    if (pf < 0.7)  r.push('Very low PF; verify load is not faulted (e.g., capacitor failure) before correcting.');
    return r;
  },
  faq: [
    { q: 'Why use line-to-line voltage?',
      a: 'In balanced three-phase, metering and protection typically use V_LL because it is the voltage between any two phases — the value a phase-to-phase connected voltmeter reads.' },
    { q: 'What is √3 in three-phase?',
      a: '√3 ≈ 1.732 arises from the 120° phase displacement. It appears in the relationship V_LL = √3 · V_LN and in the three-phase power formula P = √3 · V · I · cos φ.' },
  ],
  related: [
    { slug: 'single-phase-power', label: 'Single-phase power', reason: 'Same quantities, 1φ' },
    { slug: 'delta-wye',         label: 'Delta-Wye',          reason: 'Phase/line conversion' },
    { slug: 'pf-correction',     label: 'PF correction',      reason: 'Capacitor sizing' },
  ],
  schematic: 'single-line',
  seo: {
    title: 'Three-Phase Power Calculator (P, Q, S, I) | PowerSys Calc',
    description: 'Three-phase AC power calculator for balanced loads. Compute real, reactive, apparent power, line current, and phase angle.',
    keywords: ['three phase power calculator', 'balanced load', 'kW kVA kVAr', '√3'],
  },
};
