import type { CalculatorDefinition } from '../../engine/calculator';
import { round } from '../../engine/math';

export const calc: CalculatorDefinition = {
  slug: 'ground-resistance',
  title: 'Ground Electrode Resistance Estimator',
  shortTitle: 'Ground resistance',
  category: 'grounding',
  icon: 'ground',
  tagline: 'Single rod, multiple rods, and ground bed resistance.',
  keywords: ['ground resistance', 'earth electrode', 'IEEE 80', 'IEC 62561'],
  description:
    'Estimate the resistance of a single ground rod, multiple rods in parallel, or a horizontal ground bed using the simplified formulas (Dwight / Schwarz). Useful for substation, transformer, and PV grounding design.',
  fields: [
    { name: 'type', label: 'Electrode type', defaultValue: 'rod', options: [
      { value: 'rod', label: 'Vertical rod' },
      { value: 'bed', label: 'Horizontal ground bed' },
      { value: 'plate', label: 'Earth plate' },
    ] },
    { name: 'rho', label: 'Soil resistivity', defaultValue: 100, min: 1, max: 5000, step: 1, help: 'Ω·m (typical 50–500)' },
    { name: 'L',   label: 'Rod length / bed length', defaultValue: 2.4, min: 0.1, step: 0.1, unitGroup: 'length', defaultUnit: 'm', unitOptions: ['m', 'cm', 'mm', 'ft', 'in'] },
    { name: 'd',   label: 'Rod diameter', defaultValue: 0.016, min: 0.005, step: 0.001, unitGroup: 'length', defaultUnit: 'm', unitOptions: ['m', 'cm', 'mm', 'in'] },
    { name: 'W',   label: 'Burial depth (bed)', defaultValue: 0.6, min: 0.1, step: 0.1, unitGroup: 'length', defaultUnit: 'm', unitOptions: ['m', 'cm', 'ft'] },
    { name: 'A',   label: 'Plate area (m²)', defaultValue: 1, min: 0.05, step: 0.05, help: 'Used for plate electrode' },
    { name: 'n',   label: 'Number of rods in parallel', defaultValue: 4, min: 1, step: 1 },
    { name: 's',   label: 'Spacing between rods', defaultValue: 3, min: 0.1, step: 0.1, unitGroup: 'length', defaultUnit: 'm', unitOptions: ['m', 'cm', 'mm', 'ft', 'in'] },
  ],
  compute: (input) => {
    const t = String(input.type);
    const rho = Number(input.rho);
    const L = Number(input.L);
    const d = Number(input.d);
    const W = Number(input.W);
    const A = Number(input.A);
    const n = Number(input.n);
    const s = Number(input.s);
    let R = 0;
    if (t === 'rod') {
      R = rho / (2 * Math.PI * L) * Math.log(4 * L / d);
    } else if (t === 'bed') {
      R = rho / (Math.PI * L) * (Math.log(2 * L / Math.sqrt(d * W)) + 0.5 * Math.log(L / (4 * W)) - 0.22);
    } else {
      R = rho / (4 * Math.sqrt(Math.PI * A));
    }
    const Rn = t === 'rod' && n > 1 ? R / n * (1 + rho / (Math.PI * s * R)) : R;
    return {
      rows: [
        { label: 'Single electrode R', value: round(R, 2), unit: 'Ω', formula: t === 'rod' ? 'ρ/(2πL)·ln(4L/d)' : t === 'bed' ? 'Schwarz' : 'ρ/(4·√(πA))' },
        { label: 'Multi-rod R',       value: round(Rn, 2), unit: 'Ω', status: 'ok', formula: 'parallel with mutual resistance' },
        { label: 'Soil ρ',            value: rho, unit: 'Ω·m', formula: 'given' },
        { label: 'Length L',          value: L, unit: 'm', formula: 'given' },
      ],
      raw: { t, rho, L, d, W, A, n, s, R, Rn },
      status: Rn > 25 ? 'warn' : Rn > 5 ? 'info' : 'ok',
      summary: `R ≈ ${round(Rn, 1)} Ω with ${n} rod(s)`,
    };
  },
  formulas: [
    { name: 'Vertical rod', expression: 'R = ρ/(2πL) · ln(4L/d)', variables: '' },
    { name: 'Multiple rods', expression: 'R_n ≈ R / n · (1 + ρ/(π·s·R))', variables: 'Mutual coupling correction' },
    { name: 'Horizontal bed', expression: 'Schwarz formula', variables: 'See IEEE 80' },
  ],
  notes: [
    { standard: 'IEEE', reference: 'IEEE 80 §11', text: 'Detailed formulas for substation ground grid design. Includes surface layer materials for step/touch potentials.' },
    { standard: 'IEC',  reference: 'IEC 62561-1',    text: 'Lightning protection system components — earth electrodes.' },
  ],
  recommendations: (_i, o) => {
    const R = o.raw.Rn as number;
    const r: string[] = [];
    if (R > 10) r.push('R > 10 Ω — typical limit for commercial/industrial. Add more rods, longer rods, or soil treatment (e.g., bentonite).');
    if (R > 25) r.push('R > 25 Ω — exceeds most code requirements. Significant redesign needed.');
    r.push('Always measure R after installation — calculated values are estimates.');
    r.push('Seasonal variation can be 2–4× — design for worst-case dry soil conditions.');
    return r;
  },
  related: [
    { slug: 'earthing-conductor', label: 'Earthing conductor', reason: 'PE sizing' },
  ],
  seo: {
    title: 'Ground Electrode Resistance Estimator | PowerSys Calc',
    description: 'Estimate resistance of ground rods, ground beds, and earth plates. Includes parallel rod correction.',
    keywords: ['ground resistance', 'earth electrode', 'ground rod', 'IEEE 80', 'IEC 62561'],
  },
};
