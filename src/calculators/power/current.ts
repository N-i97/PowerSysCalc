import type { CalculatorDefinition } from '../../engine/calculator';
import { SQRT3 } from '../../engine/constants';
import { round } from '../../engine/math';

export const calc: CalculatorDefinition = {
  slug: 'current-calculator',
  title: 'Current Calculator (1φ / 3φ)',
  shortTitle: 'Current',
  category: 'power',
  icon: 'bolt',
  tagline: 'Line current from kW, kVA, or HP at given voltage & PF.',
  keywords: ['current', 'amps', 'line current', 'single phase', 'three phase'],
  description:
    'Compute line current for single-phase or three-phase systems from real power (kW), apparent power (kVA), or motor rating (HP). Useful for breaker, cable, and protective device selection.',
  fields: [
    { name: 'phase', label: 'System', defaultValue: '3', options: [
      { value: '1', label: 'Single-phase' },
      { value: '3', label: 'Three-phase' },
    ] },
    { name: 'V',  label: 'Voltage (line-to-line for 3φ)', defaultValue: 400, positive: true, required: true, unitGroup: 'voltage', defaultUnit: 'V', unitOptions: ['V', 'kV'] },
    { name: 'P',  label: 'Real power P',          defaultValue: 30, positive: true, unitGroup: 'power', defaultUnit: 'kW', unitOptions: ['W', 'kW', 'MW', 'hp', 'hp_m'] },
    { name: 'pf', label: 'Power factor',          defaultValue: 0.9, min: 0.01, max: 1, step: 0.01 },
    { name: 'eff',label: 'Motor / load efficiency', defaultValue: 1, min: 0.01, max: 1, step: 0.01, help: '1.0 = ideal (resistive, transformer, cable)' },
  ],
  compute: (input) => {
    const V  = Number(input.V);
    const P  = Number(input.P) * 1000;
    const pf = Number(input.pf);
    const eff = Number(input.eff) || 1;
    const ph = String(input.phase);
    const S = P / (pf * eff);
    const I = ph === '3' ? S / (SQRT3 * V) : S / V;
    return {
      rows: [
        { label: 'Apparent power S', value: round(S/1000, 3), unit: 'kVA', formula: 'S = P / (PF · η)' },
        { label: 'Line current I',   value: round(I, 2),     unit: 'A',   formula: ph === '3' ? 'I = S / (√3 · V_LL)' : 'I = S / V' },
        { label: 'Power P',          value: round(P/1000, 3), unit: 'kW', formula: 'given' },
        { label: 'Voltage',          value: round(V, 1),     unit: 'V',  formula: 'given' },
        { label: 'Power factor',     value: round(pf, 3),    unit: '',   formula: 'given' },
        { label: 'Efficiency',       value: round(eff, 3),   unit: '',   formula: 'given' },
      ],
      raw: { V, P, pf, eff, S, I, ph },
      status: 'ok',
      summary: `I = ${round(I, 2)} A (${ph}φ, ${V} V)`,
    };
  },
  formulas: [
    { name: '3φ current',  expression: 'I = P / (√3 · V_LL · PF · η)', variables: 'P (W), V_LL, PF, η' },
    { name: '1φ current',  expression: 'I = P / (V · PF · η)',         variables: 'P (W), V, PF, η' },
  ],
  notes: [
    { standard: 'IEC',  reference: 'IEC 60364',  text: 'Design current is the current the circuit is intended to carry in normal service. Cable ampacity must exceed design current after derating.' },
  ],
  recommendations: (_i, o) => {
    const r: string[] = [];
    const I = o.raw.I as number;
    r.push(`Apply 125% factor for continuous loads (>3h): I_cont = ${round(I * 1.25, 1)} A.`);
    r.push('Select OCPD next standard size up.');
    return r;
  },
  related: [
    { slug: 'three-phase-power', label: 'Three-phase power', reason: 'P, S from V & I' },
    { slug: 'motor-fl-current',  label: 'Motor FLC',         reason: 'Motor design current' },
    { slug: 'breaker-sizing',    label: 'Breaker sizing',    reason: 'Next standard OCPD' },
  ],
  seo: {
    title: 'Current Calculator — 1φ / 3φ Line Current | PowerSys Calc',
    description: 'Compute line current from kW or kVA in single and three-phase systems. Includes efficiency and PF.',
    keywords: ['current calculator', 'line current', 'amps from kW', 'single phase three phase'],
  },
};
