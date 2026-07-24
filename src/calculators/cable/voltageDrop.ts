import type { CalculatorDefinition } from '../../engine/calculator';
import { SQRT3 } from '../../engine/constants';
import { CONDUCTORS, getConductor, nextBreakerUp } from '../../engine/cableData';
import { round, resistanceAt } from '../../engine/math';

export const calc: CalculatorDefinition = {
  slug: 'voltage-drop',
  title: 'Voltage Drop Calculator',
  shortTitle: 'Voltage drop',
  category: 'cable',
  icon: 'drop',
  featured: true,
  tagline: 'Single & 3-phase Vd% with temperature-corrected resistance.',
  keywords: ['voltage drop', 'Vd', 'cable sizing', 'I²R', 'NEC 215', 'IEC 60364'],
  description:
    'Compute voltage drop for single-phase or three-phase circuits using exact temperature-corrected resistance (R₂₀·(1+α·(T−20))). Includes allowable Vd% check (3% branch, 5% total) and recommended cable size for the target Vd%.',
  fields: [
    { name: 'V',   label: 'System voltage V_LL (3φ) / V (1φ)', defaultValue: 400, positive: true, required: true, unitGroup: 'voltage', defaultUnit: 'V', unitOptions: ['V', 'kV'] },
    { name: 'ph',  label: 'Phase', defaultValue: '3', options: [
      { value: '1', label: 'Single-phase' },
      { value: '3', label: 'Three-phase' },
    ] },
    { name: 'I',   label: 'Load current', defaultValue: 60, positive: true, required: true, unitGroup: 'current', defaultUnit: 'A', unitOptions: ['A', 'kA'] },
    { name: 'L',   label: 'One-way length', defaultValue: 80, positive: true, required: true, unitGroup: 'length', defaultUnit: 'm', unitOptions: ['m', 'km', 'ft'] },
    { name: 'mat', label: 'Conductor material', defaultValue: 'Cu', options: [
      { value: 'Cu', label: 'Copper' }, { value: 'Al', label: 'Aluminum' },
    ] },
    { name: 'size',label: 'Cable size', defaultValue: 25, unitGroup: 'area', defaultUnit: 'mm2', unitOptions: ['mm2', 'cm2'] },
    { name: 'pf',  label: 'Power factor', defaultValue: 0.88, min: 0, max: 1, step: 0.01 },
    { name: 'T',   label: 'Operating temperature', defaultValue: 70, min: 0, max: 90, help: '°C (XLPE ~ 90, PVC ~ 70)' },
  ],
  compute: (input) => {
    const V = Number(input.V);
    const ph = String(input.ph);
    const I = Number(input.I);
    const L = Number(input.L);
    const mat = String(input.mat);
    const size = Number(input.size);
    const pf = Number(input.pf);
    const T = Number(input.T);

    const c = getConductor(size);
    if (!c) {
      return { rows: [{ label: 'Error', value: 'Invalid size', unit: '' }], raw: { size } as Record<string, number | string>, status: 'err' };
    }
    const r20 = (mat === 'Cu' ? c.resistanceCu20 : c.resistanceAl20) / 1000; // Ω/m
    const alpha = mat === 'Cu' ? 0.00393 : 0.00403;
    const Rph = resistanceAt(r20, alpha, T) * L;
    const Xph = (c.reactance / 1000) * L;
    const sin = Math.sqrt(Math.max(0, 1 - pf * pf));
    const k = ph === '3' ? SQRT3 : 2;
    const Vd  = k * I * (Rph * pf + Xph * sin);
    const Vd_pct = (Vd / V) * 100;
    // Only recommend a different size when the current one fails ≤ 3% Vd.
    // When the current size already passes, keep `recommended = size` and
    // mark it `ok` so the user isn't told to downgrade their cable.
    let recommended = size;
    let recStatus: 'ok' | 'warn' = 'ok';
    if (Vd_pct > 3) {
      recStatus = 'warn';
      for (const cand of CONDUCTORS) {
        if (cand.size < size) continue; // never recommend smaller than current
        const r20c = (mat === 'Cu' ? cand.resistanceCu20 : cand.resistanceAl20) / 1000;
        const Rc = resistanceAt(r20c, alpha, T) * L;
        const Xc = (cand.reactance / 1000) * L;
        const Vdc = k * I * (Rc * pf + Xc * sin);
        if ((Vdc / V) * 100 <= 3) { recommended = cand.size; break; }
      }
    }
    const ocpd = nextBreakerUp(I * 1.25);

    return {
      rows: [
        { label: 'Voltage drop ΔU',  value: round(Vd, 2), unit: 'V', formula: 'ΔU = k·I·(R·cos φ + X·sin φ)' },
        { label: 'Voltage drop',     value: round(Vd_pct, 2), unit: '%',
          status: Vd_pct <= 3 ? 'ok' : Vd_pct <= 5 ? 'warn' : 'err', formula: 'ΔU / V_nom' },
        { label: 'Resistance R_ph',  value: round(Rph, 3), unit: 'Ω', formula: 'R₂₀·(1+α·(T−20))·L' },
        { label: 'Reactance X_ph',   value: round(Xph, 3), unit: 'Ω', formula: 'X · L' },
        { label: 'Voltage at load',  value: round(V - Vd, 1), unit: 'V', formula: 'V − ΔU' },
        { label: 'Recommended size for ≤ 3% Vd', value: recommended, unit: 'mm²', status: recStatus, formula: Vd_pct > 3 ? 'next size up satisfying 3%' : 'current size OK' },
        { label: 'Recommended OCPD (125% I)',  value: ocpd, unit: 'A', formula: '1.25 × I → next std' },
      ],
      raw: { V, ph, I, L, mat, size, pf, T, Rph, Xph, Vd, Vd_pct, recommended },
      picks: { cableSize: recommended, breakerRating: ocpd },
      status: Vd_pct <= 3 ? 'ok' : Vd_pct <= 5 ? 'warn' : 'err',
      summary: Vd_pct <= 3
        ? `ΔU = ${round(Vd_pct, 2)}% (${round(Vd, 1)} V) · ${size} mm² meets ≤ 3% target`
        : `ΔU = ${round(Vd_pct, 2)}% (${round(Vd, 1)} V) · upsize to ${recommended} mm² for ≤ 3%`,
    };
  },
  formulas: [
    { name: 'Voltage drop',  expression: 'ΔU = k·I·(R·cos φ + X·sin φ)', variables: 'k = 2 (1φ), √3 (3φ)' },
    { name: 'Operating R',   expression: 'R_T = R₂₀·(1 + α·(T − 20))',    variables: 'α = 0.00393 (Cu) / 0.00403 (Al)' },
    { name: 'Vd %',          expression: 'Vd% = ΔU / V_nom · 100',         variables: '3% branch / 5% total' },
  ],
  steps: (_i, o) => {
    const I = o.raw.I as number, L = o.raw.L as number, mat = o.raw.mat as string, size = o.raw.size as number, pf = o.raw.pf as number, T = o.raw.T as number;
    const c = getConductor(size);
    const r20 = c ? (mat === 'Cu' ? c.resistanceCu20 : c.resistanceAl20) / 1000 : 0;
    const alpha = mat === 'Cu' ? 0.00393 : 0.00403;
    const Rph = resistanceAt(r20, alpha, T) * L;
    return [
      { label: 'R at 20°C',     formula: `R₂₀ = ${mat === 'Cu' ? 0.017241 : 0.028264}/${size} = ${round(r20*1000, 3)} mΩ/m`, result: '' },
      { label: 'R at T',        formula: `R_T = R₂₀·(1 + ${alpha}·(${T} − 20))·${L}`, result: `${round(Rph, 3)} Ω` },
      { label: 'ΔU',            formula: `k·I·(R·cos φ + X·sin φ)`,  result: `${round(o.raw.Vd as number, 2)} V` },
      { label: 'Vd%',           formula: `ΔU / V_nom · 100`,         result: `${round(o.raw.Vd_pct as number, 2)}%` },
    ];
  },
  notes: [
    { standard: 'NEC', reference: 'NEC 210.19 / 215.2', text: 'Branch circuit / feeder Vd ≤ 3% for furthest outlet; total ≤ 5% (NEC informational note).' },
    { standard: 'IEC', reference: 'IEC 60364-5-52', text: 'Annex G provides Vd calculation method including temperature correction.' },
  ],
  recommendations: (_i, o) => {
    const r: string[] = [];
    const vd = o.raw.Vd_pct as number;
    if (vd > 5) r.push('Vd% > 5% — significantly exceeds code. Increase cable size or reduce circuit length.');
    if (vd > 3 && vd <= 5) r.push('Vd% 3–5% — exceeds branch-circuit recommendation; consider upsizing for sensitive loads.');
    if (vd <= 3) r.push('Vd% ≤ 3% — within typical branch-circuit target.');
    r.push('Verify cable ampacity separately (use cable-sizing calculator) — voltage drop and ampacity are independent checks.');
    return r;
  },
  warnings: (_i, o) => {
    const w: string[] = [];
    if ((o.raw.size as number) > 300) w.push('Size > 300 mm² unusual for power cables — consider paralleling or bus duct.');
    if ((o.raw.T as number) > 90) w.push('Operating temperature above 90 °C — XLPE limit. Use higher temperature insulation (EPR, silicone).');
    return w;
  },
  related: [
    { slug: 'cable-sizing',    label: 'Cable sizing',   reason: 'Ampacity & derating' },
    { slug: 'cable-derating',  label: 'Cable derating', reason: 'kT, kG, kS factors' },
  ],
  schematic: 'cable',
  seo: {
    title: 'Voltage Drop Calculator (1φ / 3φ) | PowerSys Calc',
    description: 'Compute voltage drop with temperature-corrected resistance. Single & three-phase. Includes recommended cable size for 3% target.',
    keywords: ['voltage drop calculator', 'cable Vd', 'I²R loss', 'NEC 215.2', 'IEC 60364-5-52'],
  },
};
