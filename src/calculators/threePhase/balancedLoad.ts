import type { CalculatorDefinition } from '../../engine/calculator';
import { SQRT3 } from '../../engine/constants';
import { round } from '../../engine/math';

export const calc: CalculatorDefinition = {
  slug: 'balanced-load',
  title: 'Balanced Three-Phase Load Calculator',
  shortTitle: 'Balanced 3φ load',
  category: 'three-phase',
  icon: 'three-phase',
  tagline: 'Line current, phase voltage, and total power for Y/Δ loads.',
  keywords: ['balanced load', 'three phase', 'impedance', 'wye delta'],
  description: 'For balanced 3φ Y or Δ loads with per-phase impedance, compute line current, total real/reactive/apparent power, and phase angle.',
  fields: [
    { name: 'system', label: 'System', defaultValue: 'wye', options: [
      { value: 'wye',   label: 'Wye (Y)' },
      { value: 'delta', label: 'Delta (Δ)' },
    ] },
    { name: 'Vll', label: 'Line-to-line voltage', defaultValue: 400, positive: true, required: true, unitGroup: 'voltage', defaultUnit: 'V', unitOptions: ['V', 'kV'] },
    { name: 'Z',   label: 'Per-phase impedance |Z|', defaultValue: 10, positive: true, required: true, unitGroup: 'resistance', defaultUnit: 'ohm', unitOptions: ['ohm', 'kohm', 'mohm'] },
    { name: 'phi', label: 'Impedance angle (°)', defaultValue: 30, help: '+ = inductive (lagging), − = capacitive (leading)' },
  ],
  compute: (input) => {
    const sys = String(input.system);
    const Vll = Number(input.Vll);
    const Z   = Number(input.Z);
    const phi = Number(input.phi) * Math.PI / 180;
    const Vph = sys === 'wye' ? Vll / SQRT3 : Vll;
    const Iph = Vph / Z;
    const IL  = sys === 'wye' ? Iph : Iph * SQRT3;
    const S   = 3 * Vph * Iph;            // VA total
    const P   = S * Math.cos(phi);
    const Q   = S * Math.sin(phi);
    return {
      rows: [
        { label: 'Phase voltage V_ph',  value: round(Vph, 2), unit: 'V', formula: sys === 'wye' ? 'V_LL / √3' : 'V_LL (Δ)' },
        { label: 'Phase current I_ph',  value: round(Iph, 2), unit: 'A', formula: 'I_ph = V_ph / Z' },
        { label: 'Line current I_L',    value: round(IL, 2),  unit: 'A', formula: sys === 'wye' ? 'I_L = I_ph' : 'I_L = √3 · I_ph' },
        { label: 'Total apparent S',    value: round(S/1000, 3), unit: 'kVA', formula: 'S = 3 · V_ph · I_ph' },
        { label: 'Total real P',        value: round(P/1000, 3), unit: 'kW',  status: 'ok', formula: 'P = S · cos φ' },
        { label: 'Total reactive Q',    value: round(Q/1000, 3), unit: 'kVAr', formula: 'Q = S · sin φ' },
        { label: 'Power factor',        value: round(Math.cos(phi), 3), unit: '', formula: 'cos φ' },
      ],
      raw: { sys, Vll, Z, phi: phi*180/Math.PI, Vph, Iph, IL, S, P, Q },
      status: 'ok',
      summary: `I_L = ${round(IL, 2)} A · S = ${round(S/1000, 2)} kVA · PF = ${round(Math.cos(phi), 3)}`,
    };
  },
  formulas: [
    { name: 'Y: phase voltage', expression: 'V_ph = V_LL / √3', variables: '' },
    { name: 'Δ: phase voltage', expression: 'V_ph = V_LL',      variables: '' },
    { name: 'Phase current',    expression: 'I_ph = V_ph / Z',  variables: 'Z = phase impedance' },
    { name: 'Y: line current',  expression: 'I_L = I_ph',       variables: '' },
    { name: 'Δ: line current',  expression: 'I_L = √3 · I_ph',  variables: '' },
    { name: 'Total power',      expression: 'S = 3 · V_ph · I_ph', variables: 'For balanced 3φ' },
  ],
  notes: [
    { standard: 'IEEE', reference: 'IEEE Std 141', text: 'For unbalanced loads, use symmetrical components (positive/negative/zero sequence).' },
  ],
  related: [
    { slug: 'delta-wye',     label: 'Delta-Wye',       reason: 'Phase vs line' },
    { slug: 'three-phase-power', label: 'Three-phase power', reason: 'P, Q, S' },
  ],
  seo: {
    title: 'Balanced 3φ Load Calculator (Y/Δ) | PowerSys Calc',
    description: 'Compute line current, phase voltage, and total power for balanced three-phase Y or Δ loads.',
    keywords: ['balanced load calculator', 'three phase', 'Y delta', 'line current'],
  },
};
