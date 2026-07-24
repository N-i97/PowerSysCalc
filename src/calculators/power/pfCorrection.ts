import type { CalculatorDefinition } from '../../engine/calculator';
import { round } from '../../engine/math';

export const calc: CalculatorDefinition = {
  slug: 'pf-correction',
  title: 'Power Factor Correction Capacitor Sizing',
  shortTitle: 'PF correction',
  category: 'power',
  icon: 'cap',
  featured: true,
  tagline: 'Capacitor bank kVAr required to reach target PF.',
  keywords: ['PF correction', 'capacitor', 'kVAr', 'reactive compensation'],
  description:
    'Calculate the reactive power (kVAr) needed from a shunt capacitor bank to improve the power factor from a current value to a target. Includes utility cost / release charge context.',
  fields: [
    { name: 'P',  label: 'Real power P',         defaultValue: 200, positive: true, required: true, unitGroup: 'power', defaultUnit: 'kW', unitOptions: ['W', 'kW', 'MW', 'hp', 'hp_m'] },
    { name: 'pf1', label: 'Current power factor', defaultValue: 0.72, min: 0.01, max: 1, step: 0.01, required: true },
    { name: 'pf2', label: 'Target power factor',  defaultValue: 0.95, min: 0.01, max: 1, step: 0.01, required: true },
    { name: 'V',  label: 'System voltage',       defaultValue: 400, positive: true, required: true, unitGroup: 'voltage', defaultUnit: 'V', unitOptions: ['V', 'kV'] },
    { name: 'ph', label: 'System',               defaultValue: '3', options: [
      { value: '1', label: 'Single-phase' },
      { value: '3', label: 'Three-phase' },
    ] },
  ],
  compute: (input) => {
    const P   = Number(input.P) * 1000;
    const pf1 = Math.max(0.01, Math.min(1, Number(input.pf1)));
    const pf2 = Math.max(0.01, Math.min(1, Number(input.pf2)));
    const V   = Number(input.V);
    const ph  = String(input.ph);
    const phi1 = Math.acos(pf1);
    const phi2 = Math.acos(pf2);
    const Qc   = P * (Math.tan(phi1) - Math.tan(phi2));      // var
    const S_before = P / pf1;
    const S_after  = P / pf2;
    const I_before = ph === '3' ? S_before / (Math.sqrt(3) * V) : S_before / V;
    const I_after  = ph === '3' ? S_after  / (Math.sqrt(3) * V) : S_after  / V;
    const I_release = I_before - I_after;
    const pct_release = I_before > 0 ? (I_release / I_before) * 100 : 0;
    return {
      rows: [
        { label: 'Capacitor bank Qc', value: round(Qc/1000, 2), unit: 'kVAr', formula: 'Qc = P · (tan φ₁ − tan φ₂)' },
        { label: 'Reactive before Q₁', value: round(P * Math.tan(phi1) / 1000, 2), unit: 'kVAr', formula: 'Q₁ = P · tan φ₁' },
        { label: 'Reactive after Q₂',  value: round(P * Math.tan(phi2) / 1000, 2), unit: 'kVAr', formula: 'Q₂ = P · tan φ₂' },
        { label: 'Current before I₁',  value: round(I_before, 1), unit: 'A',  status: 'warn', formula: ph === '3' ? 'I₁ = S₁ / (√3·V)' : 'I₁ = S₁ / V' },
        { label: 'Current after I₂',   value: round(I_after, 1),  unit: 'A',  status: 'ok', formula: ph === '3' ? 'I₂ = S₂ / (√3·V)' : 'I₂ = S₂ / V' },
        { label: 'Released current',   value: round(I_release, 1), unit: 'A', formula: 'ΔI = I₁ − I₂' },
        { label: 'Released capacity',  value: round(pct_release, 1), unit: '%', status: 'ok', formula: '(I₁ − I₂)/I₁' },
      ],
      raw: { Qc, P, pf1, pf2, V, ph },
      picks: { capacitorKVAr: round(Qc/1000, 2) },
      status: pf2 >= pf1 ? 'err' : (pf2 >= 0.9 ? 'ok' : 'warn'),
      summary: `Install ≈ ${round(Qc/1000, 2)} kVAr of capacitors to bring PF from ${pf1} to ${pf2}`,
    };
  },
  formulas: [
    { name: 'Capacitor kVAr', expression: 'Qc = P · (tan φ₁ − tan φ₂)', variables: 'P (W), φ₁ = acos(pf₁), φ₂ = acos(pf₂)' },
    { name: 'Released current', expression: 'ΔI = I₁ − I₂', variables: 'Reduction in line current' },
  ],
  steps: (_i, o) => {
    const P = o.raw.P as number, pf1 = o.raw.pf1 as number, pf2 = o.raw.pf2 as number;
    return [
      { label: 'φ₁ = acos(pf₁)', formula: 'acos(' + pf1 + ')', result: `${round(Math.acos(pf1)*180/Math.PI, 2)}°` },
      { label: 'φ₂ = acos(pf₂)', formula: 'acos(' + pf2 + ')', result: `${round(Math.acos(pf2)*180/Math.PI, 2)}°` },
      { label: 'Qc = P · (tan φ₁ − tan φ₂)', formula: `${P} W · (${round(Math.tan(Math.acos(pf1)),3)} − ${round(Math.tan(Math.acos(pf2)),3)})`, result: `${round((o.raw.Qc as number)/1000, 3)} kVAr` },
    ];
  },
  notes: [
    { standard: 'IEEE', reference: 'IEEE 18-2002', text: 'Standard for shunt power capacitors. Capacitors are typically sized in standard kVAr steps (5, 7.5, 10, 12.5, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300, 400, 500 kVAr).' },
    { standard: 'IEC',  reference: 'IEC 60831-1/2', text: 'Shunt power capacitors for AC systems having a rated voltage up to and including 1000 V.' },
  ],
  recommendations: (_i, o) => {
    const r: string[] = [];
    const Qc = (o.raw.Qc as number) / 1000;
    r.push(`Round capacitor bank to nearest standard kVAr (typical 5/10/25/50 kVAr steps). Total ≈ ${round(Qc, 1)} kVAr.`);
    r.push('If harmonic distortion is present (THD-V > 5%, THD-I > 8%), install detuned reactor (5–7% p.f.) to avoid resonance.');
    r.push('Verify capacitor inrush current rating with switching contactors (pre-insertion resistors or tuned reactors).');
    return r;
  },
  warnings: (_i, o) => {
    const w: string[] = [];
    const pf1 = o.raw.pf1 as number, pf2 = o.raw.pf2 as number;
    if (pf2 <= pf1) w.push('Target PF must be higher than current PF — choose a higher target.');
    if (pf2 > 0.98) w.push('Targeting PF > 0.98 yields very large capacitors for small kVAr — diminishing return.');
    return w;
  },
  faq: [
    { q: 'Why not correct to PF = 1.0?',
      a: 'Beyond ~0.95 the marginal capacitor kVAr grows rapidly. A target of 0.95–0.98 is the practical optimum, balancing kVAr investment against PF penalty savings and avoiding leading-PF conditions on light load.' },
    { q: 'Are there risks to over-correction?',
      a: 'Yes. On light load, over-correction can drive the system to leading PF, which can cause generator instability, voltage rise on distribution, and resonance with line inductance/capacitance.' },
  ],
  related: [
    { slug: 'power-factor',          label: 'Power factor',     reason: 'From P, S, or angle' },
    { slug: 'three-phase-power',     label: 'Three-phase power',reason: 'kW/kVAr/kVA' },
    { slug: 'harmonic-filter',      label: 'Harmonic filter',  reason: 'Avoid resonance with detuned reactors' },
  ],
  seo: {
    title: 'Power Factor Correction Capacitor Sizing Calculator | PowerSys Calc',
    description: 'Calculate kVAr of capacitor bank to correct PF to a target value. Reduce line current, I²R losses, and utility penalties.',
    keywords: ['PF correction calculator', 'capacitor bank sizing', 'kVAr', 'reactive compensation'],
  },
};
