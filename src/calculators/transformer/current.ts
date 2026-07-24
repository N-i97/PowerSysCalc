import type { CalculatorDefinition } from '../../engine/calculator';
import { SQRT3 } from '../../engine/constants';
import { round } from '../../engine/math';

export const calc: CalculatorDefinition = {
  slug: 'transformer-current',
  title: 'Transformer Primary & Secondary Current',
  shortTitle: 'Transformer current',
  category: 'transformer',
  icon: 'transformer',
  tagline: 'FLA on each side, turns ratio, and short-circuit current.',
  keywords: ['transformer FLA', 'primary current', 'secondary current', 'short circuit current'],
  description:
    'Compute full-load current on primary and secondary, turns ratio, and estimate short-circuit current from transformer impedance (Z%).',
  fields: [
    { name: 'S',   label: 'Rating', defaultValue: 500, positive: true, required: true, unitGroup: 'power', defaultUnit: 'kVA', unitOptions: ['VA', 'kVA', 'MVA'] },
    { name: 'V1',  label: 'Primary voltage (V_LL)', defaultValue: 11000, positive: true, required: true, unitGroup: 'voltage', defaultUnit: 'V', unitOptions: ['V', 'kV'] },
    { name: 'V2',  label: 'Secondary voltage (V_LL)', defaultValue: 400, positive: true, required: true, unitGroup: 'voltage', defaultUnit: 'V', unitOptions: ['V', 'kV'] },
    { name: 'Z',   label: 'Impedance Z%', defaultValue: 6, min: 0.1, max: 25, step: 0.1, help: 'Nameplate impedance %' },
    { name: 'ph',  label: 'Phase', defaultValue: '3', options: [
      { value: '1', label: 'Single-phase' },
      { value: '3', label: 'Three-phase' },
    ] },
  ],
  compute: (input) => {
    const S   = Number(input.S) * 1000;
    const V1  = Number(input.V1);
    const V2  = Number(input.V2);
    const Z   = Number(input.Z) / 100;
    const ph  = String(input.ph);
    const a   = ph === '3' ? SQRT3 : 1;
    const I1  = S / (a * V1);
    const I2  = S / (a * V2);
    const Isc = Z > 0 ? I2 / Z : 0;
    const turns = V1 / V2;
    return {
      rows: [
        { label: 'Primary current I₁',   value: round(I1, 2), unit: 'A', formula: ph === '3' ? 'I₁ = S / (√3·V₁)' : 'I₁ = S / V₁' },
        { label: 'Secondary current I₂', value: round(I2, 2), unit: 'A', formula: ph === '3' ? 'I₂ = S / (√3·V₂)' : 'I₂ = S / V₂' },
        { label: 'Turns ratio (a)',      value: round(turns, 4), unit: '', formula: 'a = V₁ / V₂' },
        { label: 'Impedance Z%',         value: Number(input.Z), unit: '%', formula: 'nameplate' },
        { label: 'Short-circuit I_sc',   value: round(Isc, 0), unit: 'A', status: 'warn', formula: 'I_sc = I₂ / Z%' },
        { label: 'Short-circuit MVA',    value: round((Isc * V2 * a) / 1e6, 2), unit: 'MVA', formula: 'I_sc · V · √3' },
      ],
      raw: { S, V1, V2, Z, ph, I1, I2, Isc, turns },
      status: 'ok',
      summary: `I₁ = ${round(I1, 1)} A · I₂ = ${round(I2, 1)} A · I_sc ≈ ${round(Isc, 0)} A`,
    };
  },
  formulas: [
    { name: 'Primary current',   expression: 'I₁ = S / (√3 · V₁)',         variables: '3φ; S in VA' },
    { name: 'Secondary current', expression: 'I₂ = S / (√3 · V₂)',         variables: '3φ' },
    { name: 'Turns ratio',       expression: 'a = V₁ / V₂',                 variables: '' },
    { name: 'Short-circuit',     expression: 'I_sc = I₂ / Z%',              variables: 'Z% on secondary base' },
  ],
  notes: [
    { standard: 'IEEE', reference: 'IEEE C57.12.00', text: 'Distribution transformer impedance typically 5–7.5% (≤ 500 kVA), 5.75–8% (larger). Lower Z = higher short-circuit current.' },
    { standard: 'IEC',  reference: 'IEC 60076-5',   text: 'Ability to withstand short-circuit tested per IEC 60076-5.' },
  ],
  recommendations: (_i, o) => {
    const r: string[] = [];
    const Isc = o.raw.Isc as number;
    r.push(`Set LV breaker short-circuit rating ≥ I_sc (${round(Isc, 0)} A peak ≈ ${round(Isc * Math.SQRT2, 0)} A peak make).`);
    r.push('Verify cable & bus bracing short-circuit withstand ≥ I_sc² · t (where t = breaker clearing time).');
    return r;
  },
  related: [
    { slug: 'transformer-sizing',  label: 'Transformer sizing',  reason: 'kVA selection' },
    { slug: 'short-circuit',       label: 'Short-circuit',       reason: 'Source contribution' },
  ],
  seo: {
    title: 'Transformer Primary / Secondary Current Calculator | PowerSys Calc',
    description: 'Compute transformer FLA on primary and secondary, turns ratio, and short-circuit current from Z%.',
    keywords: ['transformer FLA', 'primary secondary current', 'transformer short circuit', 'Z%'],
  },
};
