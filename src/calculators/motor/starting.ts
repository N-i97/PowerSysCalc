import type { CalculatorDefinition } from '../../engine/calculator';
import { round } from '../../engine/math';

export const calc: CalculatorDefinition = {
  slug: 'motor-starting',
  title: 'Motor Starting Current & Methods',
  shortTitle: 'Motor starting',
  category: 'motor',
  icon: 'motor',
  tagline: 'Locked-rotor current, starting method, and voltage dip.',
  keywords: ['motor starting', 'locked rotor', 'LRC', 'DOL', 'star delta', 'soft starter', 'VFD'],
  description:
    'Estimate motor starting current under different starting methods (DOL, star-delta, autotransformer, soft starter, VFD) and the resulting voltage dip on a weak source.',
  fields: [
    { name: 'I', label: 'Motor FLC', defaultValue: 28, positive: true, required: true, unitGroup: 'current', defaultUnit: 'A', unitOptions: ['A', 'kA'] },
    { name: 'lr',label: 'Locked-rotor / FLC ratio', defaultValue: 6, min: 1, max: 12, step: 0.1, help: '6–7 typical for Design B' },
    { name: 'method', label: 'Starting method', defaultValue: 'dol', options: [
      { value: 'dol',   label: 'DOL (direct-on-line)' },
      { value: 'ysd',   label: 'Star-delta (Y → Δ)' },
      { value: 'auto',  label: 'Autotransformer (65%)' },
      { value: 'soft',  label: 'Soft starter (50%)' },
      { value: 'vfd',   label: 'VFD (controlled ramp)' },
    ] },
    { name: 'autoPct',label: 'Autotransformer tap', defaultValue: 65, min: 25, max: 90, step: 5 },
    { name: 'V',      label: 'System voltage', defaultValue: 400, positive: true, unitGroup: 'voltage', defaultUnit: 'V', unitOptions: ['V', 'kV'] },
    { name: 'Ssc',    label: 'Source short-circuit MVA', defaultValue: 25, positive: true, unitGroup: 'power', defaultUnit: 'MVA', unitOptions: ['VA', 'kVA', 'MVA'], help: 'For voltage dip estimate' },
  ],
  compute: (input) => {
    const I  = Number(input.I);
    const lr = Number(input.lr);
    const m  = String(input.method);
    const tap = Number(input.autoPct) / 100;
    const V  = Number(input.V);
    const Ssc = Number(input.Ssc) * 1e6;
    const I_LR = lr * I;       // DOL LRA
    let factor = 1;
    if (m === 'dol')  factor = 1;
    if (m === 'ysd')  factor = 1/3;          // 33% of DOL
    if (m === 'auto') factor = tap * tap;    // I = k² · I_LR
    if (m === 'soft') factor = 0.5;          // adjustable
    if (m === 'vfd')  factor = 0.1;          // VFD ramps, peak ~ 1.0–1.5 × I
    const I_start = I_LR * factor;
    const Zsource_pu = (V * V) / Ssc;
    const deltaU_pu = (I_start * V) / (Math.sqrt(3) * Ssc);
    const deltaU_pct = deltaU_pu * 100;
    return {
      rows: [
        { label: 'Locked-rotor current (DOL)', value: round(I_LR, 1), unit: 'A', status: 'warn', formula: 'I_LR = LR × FLC' },
        { label: 'Starting current (method)',   value: round(I_start, 1), unit: 'A', status: 'ok', formula: 'I_start = k² · I_LR (method)' },
        { label: 'Method factor k',            value: round(Math.sqrt(factor), 3), unit: '', formula: 'k² · I_LR → k' },
        { label: 'Voltage dip on source',      value: round(deltaU_pct, 1), unit: '%', status: deltaU_pct > 15 ? 'err' : deltaU_pct > 8 ? 'warn' : 'ok', formula: 'ΔU = I_start / I_sc' },
        { label: 'Mechanical stress level',    value: m === 'dol' ? 'High' : m === 'vfd' ? 'Low' : 'Reduced', unit: '', formula: '' },
        { label: 'Recommended for',            value: m === 'dol' ? '< 5 kW, robust supply' : m === 'ysd' ? '5–100 kW, no-load start' : m === 'auto' ? 'High inertia, reduced V' : m === 'soft' ? 'Pumps, conveyors' : 'Variable speed required', unit: '', formula: '' },
      ],
      raw: { I, lr, m, tap, V, Ssc, I_LR, factor, I_start, deltaU_pct },
      status: deltaU_pct > 15 ? 'err' : (deltaU_pct > 8 ? 'warn' : 'ok'),
      summary: `I_start = ${round(I_start, 1)} A (${m.toUpperCase()}) · ΔU ≈ ${round(deltaU_pct, 1)}%`,
    };
  },
  formulas: [
    { name: 'Locked-rotor current', expression: 'I_LR = LR × FLC', variables: 'LR typical 6–8' },
    { name: 'Star-delta start',     expression: 'I_start = I_LR / 3', variables: '' },
    { name: 'Autotransformer',      expression: 'I_start = k² · I_LR', variables: 'k = tap ratio' },
    { name: 'Voltage dip',          expression: 'ΔU ≈ I_start / I_sc', variables: 'I_sc = S_sc / (√3·V)' },
  ],
  notes: [
    { standard: 'IEC',  reference: 'IEC 60034-12', text: 'Starting performance of cage induction motors — Design N (normal) and NY (high torque).' },
    { standard: 'NEMA', reference: 'NEMA MG-1 Part 12', text: 'Locked-rotor current codes A–J; Design B typical LR = 6–7 × FLC.' },
  ],
  recommendations: (_i, o) => {
    const r: string[] = [];
    const dip = o.raw.deltaU_pct as number;
    if (dip > 15) r.push('Voltage dip > 15% may exceed utility limits and trip contactors. Use VFD or autotransformer start.');
    if (dip > 8)  r.push('Dip 8–15% — verify contactors, capacitors, and sensitive loads ride through.');
    r.push('Star-delta: 6 lead motor required; transitions cause 2nd inrush peak.');
    r.push('VFD eliminates inrush entirely and provides soft ramp & controlled decel.');
    return r;
  },
  related: [
    { slug: 'motor-fl-current',  label: 'Motor FLC',     reason: 'FLA' },
    { slug: 'vfd-sizing',        label: 'VFD sizing',    reason: 'VFD' },
    { slug: 'motor-breaker',     label: 'Motor breaker', reason: 'OCPD' },
  ],
  seo: {
    title: 'Motor Starting Current Calculator (DOL, Y-Δ, VFD) | PowerSys Calc',
    description: 'Compute starting current and voltage dip for DOL, star-delta, autotransformer, soft starter, and VFD starting methods.',
    keywords: ['motor starting', 'LRC', 'locked rotor', 'DOL', 'star delta', 'VFD start'],
  },
};
