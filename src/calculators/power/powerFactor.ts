import type { CalculatorDefinition } from '../../engine/calculator';
import { round } from '../../engine/math';

export const calc: CalculatorDefinition = {
  slug: 'power-factor',
  title: 'Power Factor Calculator',
  shortTitle: 'Power factor',
  category: 'power',
  icon: 'pf',
  tagline: 'Compute power factor from P, S, or angle.',
  keywords: ['power factor', 'cos phi', 'phi', 'displacement', 'distortion'],
  description:
    'Calculate true power factor, displacement power factor, and reactive factor. Compute from real and apparent power, or directly from the phase angle.',
  fields: [
    { name: 'mode', label: 'Inputs', defaultValue: 'from_PS', options: [
      { value: 'from_PS', label: 'P & S' },
      { value: 'from_PQ', label: 'P & Q' },
      { value: 'from_angle', label: 'Phase angle φ' },
    ] },
    { name: 'P', label: 'Real power P', defaultValue: 30, min: 0, positive: true, unitGroup: 'power', defaultUnit: 'kW', unitOptions: ['W', 'kW', 'MW', 'hp', 'hp_m'] },
    { name: 'S', label: 'Apparent power S', defaultValue: 35, min: 0, positive: true, unitGroup: 'power', defaultUnit: 'kVA', unitOptions: ['VA', 'kVA', 'MVA'] },
    { name: 'Q', label: 'Reactive power Q', defaultValue: 18, min: 0, positive: true, unitGroup: 'power', defaultUnit: 'kvar', unitOptions: ['var', 'kvar'] },
    { name: 'phi', label: 'Phase angle φ (deg)', defaultValue: 28, help: 'Negative for leading', step: 0.1 },
  ],
  compute: (input) => {
    const mode = String(input.mode);
    let pf = 0, phi = 0, status: 'ok' | 'warn' = 'ok';
    if (mode === 'from_PS') {
      const P = Number(input.P) * 1000, S = Number(input.S) * 1000;
      pf  = S > 0 ? P / S : 0;
      phi = Math.acos(Math.max(-1, Math.min(1, pf))) * 180 / Math.PI;
    } else if (mode === 'from_PQ') {
      const P = Number(input.P) * 1000, Q = Number(input.Q) * 1000;
      const S = Math.hypot(P, Q);
      pf  = S > 0 ? P / S : 0;
      phi = Math.acos(Math.max(-1, Math.min(1, pf))) * 180 / Math.PI;
    } else {
      phi = Number(input.phi);
      pf  = Math.cos(phi * Math.PI / 180);
    }
    if (pf < 0.85) status = 'warn';
    return {
      rows: [
        { label: 'Power factor (cos φ)',  value: round(pf, 3),    unit: '',      status, formula: 'cos φ = P / S' },
        { label: 'Phase angle φ',         value: round(phi, 2),   unit: '°',    formula: 'φ = cos⁻¹(PF)' },
        { label: 'sin φ',                 value: round(Math.sin(phi * Math.PI / 180), 3), unit: '', formula: 'sin φ' },
        { label: 'tan φ',                 value: round(Math.tan(phi * Math.PI / 180), 3), unit: '', formula: 'tan φ' },
        { label: 'PF interpretation',     value: phi < 0 ? 'Leading (capacitive)' : 'Lagging (inductive)', unit: '', formula: 'sign of φ' },
      ],
      raw: { pf, phi },
      status,
      summary: `PF = ${round(pf, 3)} (${phi < 0 ? 'leading' : 'lagging'}) · φ = ${round(phi, 2)}°`,
    };
  },
  formulas: [
    { name: 'True PF',        expression: 'cos φ = P / S',         variables: 'P (W), S (VA)' },
    { name: 'From P & Q',     expression: 'cos φ = P / √(P² + Q²)', variables: 'P, Q' },
    { name: 'Phase angle',    expression: 'φ = cos⁻¹(PF)',         variables: 'PF' },
  ],
  notes: [
    { standard: 'IEEE', reference: 'IEEE 1459-2010', text: 'For distorted waveforms, true PF = (P₁ / S) where P₁ is fundamental real power. Displacement PF = cos φ₁ from fundamental phase shift only.' },
  ],
  recommendations: (_i, o) => {
    const r: string[] = [];
    const pf = o.raw.pf as number;
    if (pf < 0.85) r.push('PF below 0.85 — consider installing capacitor bank to reach PF ≥ 0.95.');
    if (pf < 0.7)  r.push('Severely lagging PF: check for large induction motors without compensation or harmonic filter issues.');
    if (pf > 1)    r.push('PF > 1 is unphysical — recheck inputs.');
    return r;
  },
  faq: [
    { q: 'What is displacement vs. true power factor?',
      a: 'Displacement PF = cos φ₁ uses only the fundamental (60/50 Hz) phase shift. True PF also includes harmonic distortion: PF = (1/√(1+THD_i²)) · cos φ₁. With non-linear loads (VFD, SMPS), true PF < displacement PF.' },
  ],
  related: [
    { slug: 'pf-correction',         label: 'PF correction',  reason: 'Capacitor bank sizing' },
    { slug: 'three-phase-power',     label: 'Three-phase power', reason: 'Power triangle' },
  ],
  seo: {
    title: 'Power Factor Calculator (cos φ) | PowerSys Calc',
    description: 'Calculate power factor from real & apparent power, or from phase angle. Lagging/leading, true vs displacement PF.',
    keywords: ['power factor calculator', 'cos phi', 'displacement PF', 'true PF'],
  },
};
