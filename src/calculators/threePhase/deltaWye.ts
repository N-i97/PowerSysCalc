import type { CalculatorDefinition } from '../../engine/calculator';
import { SQRT3 } from '../../engine/constants';
import { round } from '../../engine/math';

export const calc: CalculatorDefinition = {
  slug: 'delta-wye',
  title: 'Delta ↔ Wye Voltage & Current Converter',
  shortTitle: 'Delta-Wye',
  category: 'three-phase',
  icon: 'delta',
  featured: true,
  tagline: 'Convert between line and phase quantities in Δ or Y.',
  keywords: ['delta wye', 'star', 'line phase', 'V_LL V_LN', 'I_L I_phase'],
  description:
    'Convert between line-to-line and line-to-neutral voltage, and between line current and phase current, in a three-phase wye (Y) or delta (Δ) system. Handles balanced load only.',
  fields: [
    { name: 'system', label: 'System', defaultValue: 'wye', options: [
      { value: 'wye',   label: 'Wye (Y)' },
      { value: 'delta', label: 'Delta (Δ)' },
    ] },
    { name: 'quantity', label: 'Convert', defaultValue: 'V', options: [
      { value: 'V', label: 'Voltage' },
      { value: 'I', label: 'Current' },
    ] },
    { name: 'direction', label: 'Direction', defaultValue: 'L2P', options: [
      { value: 'L2P', label: 'Line → Phase' },
      { value: 'P2L', label: 'Phase → Line' },
    ] },
    { name: 'value', label: 'Value', defaultValue: 400, positive: true, required: true, unitGroup: 'voltage', defaultUnit: 'V', unitOptions: ['V', 'kV'] },
  ],
  compute: (input) => {
    const v = Number(input.value);
    const sys = String(input.system);
    const q = String(input.quantity);
    const d = String(input.direction);
    let out = v, formula = '';
    if (q === 'V') {
      if (sys === 'wye') {
        if (d === 'L2P') { out = v / SQRT3; formula = 'V_LN = V_LL / √3'; }
        else             { out = v * SQRT3; formula = 'V_LL = V_LN · √3'; }
      } else {
        // delta: V_LL = V_phase
        out = d === 'L2P' ? v : v;
        formula = 'V_LL = V_phase (Δ)';
      }
    } else {
      // current
      if (sys === 'wye') {
        out = d === 'L2P' ? v : v;  // I_L = I_phase in Y
        formula = 'I_L = I_phase (Y)';
      } else {
        if (d === 'L2P') { out = v / SQRT3; formula = 'I_phase = I_L / √3 (Δ)'; }
        else             { out = v * SQRT3; formula = 'I_L = I_phase · √3 (Δ)'; }
      }
    }
    const systemNote = sys === 'wye' ? 'Y (wye)' : 'Δ (delta)';
    const quantityNote = q === 'V' ? 'voltage' : 'current';
    return {
      rows: [
        { label: 'Input',           value: round(v, 2),   unit: q === 'V' ? 'V' : 'A', formula: 'given' },
        { label: `${q === 'V' ? 'Voltage' : 'Current'} (${d === 'L2P' ? 'phase' : 'line'})`, value: round(out, 2), unit: q === 'V' ? 'V' : 'A', formula },
        { label: 'Other quantity',  value: round(d === 'L2P' ? (q === 'V' ? (sys === 'wye' ? v : v) : (sys === 'wye' ? v : (sys === 'wye' ? v : v * SQRT3))) : v, 2), unit: q === 'V' ? 'V' : 'A', formula: 'inverse relation' },
        { label: 'System',          value: systemNote, unit: '', formula: '' },
      ],
      raw: { in: v, out, sys, q, d },
      status: 'ok',
      summary: `${round(v, 2)} ${q === 'V' ? 'V' : 'A'} ${d === 'L2P' ? '→ phase' : '→ line'} = ${round(out, 2)} ${q === 'V' ? 'V' : 'A'} (${systemNote})`,
    };
  },
  formulas: [
    { name: 'Y voltage',  expression: 'V_LL = √3 · V_LN',  variables: 'Line vs phase voltage' },
    { name: 'Δ current',  expression: 'I_L = √3 · I_phase', variables: 'Δ: line current is √3 × phase' },
    { name: 'Y current',  expression: 'I_L = I_phase',     variables: 'Y: line = phase current' },
  ],
  notes: [
    { standard: 'IEEE', reference: 'IEEE Std 141 (Red Book)', text: 'For balanced 3φ loads, Y: V_LL = √3 V_LN, I_L = I_phase. Δ: V_LL = V_phase, I_L = √3 I_phase.' },
  ],
  recommendations: (_i, _o) => [
    'Memorize: V ratio is √3 in Y; I ratio is √3 in Δ. The other quantity is 1:1.',
  ],
  faq: [
    { q: 'When do I use this?',
      a: 'Most commonly when a motor is wound Δ (e.g., 230 V Δ) but the supply is Y (e.g., 400 V Y). Knowing the phase quantities is essential for testing and for protection settings.' },
  ],
  related: [
    { slug: 'three-phase-power', label: 'Three-phase power', reason: 'P, Q, S with line quantities' },
    { slug: 'balanced-load',     label: 'Balanced 3φ load',  reason: 'Y/Δ total impedance' },
  ],
  seo: {
    title: 'Delta-Wye Voltage & Current Converter | PowerSys Calc',
    description: 'Convert between line and phase voltage/current in 3φ Y or Δ systems. √3 relationships explained.',
    keywords: ['delta wye', 'star delta', 'line to phase', 'V_LL V_LN', '√3'],
  },
};
