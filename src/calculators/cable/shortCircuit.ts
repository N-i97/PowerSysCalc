import type { CalculatorDefinition } from '../../engine/calculator';
import { SQRT3 } from '../../engine/constants';
import { round } from '../../engine/math';

export const calc: CalculatorDefinition = {
  slug: 'short-circuit',
  title: 'Short-Circuit Current (I²t) Withstand',
  shortTitle: 'Short-circuit I²t',
  category: 'cable',
  icon: 'shield',
  tagline: 'Cable SC withstand check vs. protective device let-through.',
  keywords: ['short circuit', 'I²t', 'cable withstand', 'let-through', 'IEC 60364'],
  description:
    'Verify a cable can withstand the short-circuit energy until the protective device clears. Compares cable adiabatic I²t (k²·S²) against breaker/fuse let-through.',
  fields: [
    { name: 'Isc', label: 'Available short-circuit current', defaultValue: 10000, positive: true, required: true, unitGroup: 'current', defaultUnit: 'A', unitOptions: ['A', 'kA'] },
    { name: 'S',   label: 'Cable cross-section', defaultValue: 25, positive: true, required: true, unitGroup: 'area', defaultUnit: 'mm2', unitOptions: ['mm2', 'cm2'] },
    { name: 'mat', label: 'Conductor material', defaultValue: 'Cu', options: [
      { value: 'Cu', label: 'Copper' }, { value: 'Al', label: 'Aluminum' },
    ] },
    { name: 'ins', label: 'Insulation', defaultValue: 'XLPE', options: [
      { value: 'PVC', label: 'PVC' }, { value: 'XLPE', label: 'XLPE' }, { value: 'EPR', label: 'EPR' },
    ] },
    { name: 't',   label: 'Clearing time', defaultValue: 0.4, min: 0.01, max: 5, step: 0.01, unitGroup: 'time', defaultUnit: 's', unitOptions: ['s', 'ms'], help: 's — breaker/fuse total clearing time' },
    { name: 'I2t_dev', label: 'Device let-through I²t', defaultValue: 60000, min: 0, unitGroup: 'area', defaultUnit: 'A2s', unitOptions: [], help: 'Optional — from breaker curve' },
  ],
  compute: (input) => {
    const Isc = Number(input.Isc);
    const S   = Number(input.S);
    const mat = String(input.mat);
    const ins = String(input.ins);
    const t   = Number(input.t);
    const I2t_dev = Number(input.I2t_dev);

    // k from IEC 60364-43 / 60644 (PVC=115, XLPE/EPR=143, Cu), Al slightly lower
    const k_base = ins === 'PVC' ? 115 : 143;
    const k = mat === 'Cu' ? k_base : k_base * 0.78; // approx ratio

    const I2t_cable = (k * S) ** 2;             // (A·s^(1/2))²
    const I2t_source = Isc * Isc * t;
    const verdict = I2t_dev > 0 ? (I2t_cable >= I2t_dev ? 'ok' : 'err') : (I2t_cable >= I2t_source ? 'ok' : 'err');
    return {
      rows: [
        { label: 'Material constant k', value: k, unit: 'A·s^½ / mm²', formula: `IEC 60364-43, ${mat}/${ins}` },
        { label: 'Cable I²t withstand (k²·S²)', value: round(I2t_cable / 1e6, 3), unit: 'kA²s', status: 'ok', formula: '(k·S)²' },
        { label: 'Source I²t',          value: round(I2t_source / 1e6, 3), unit: 'kA²s', status: verdict === 'err' ? 'err' : 'ok', formula: 'I_sc² · t' },
        { label: 'Device I²t (given)',  value: I2t_dev > 0 ? round(I2t_dev / 1e6, 3) : '—', unit: 'kA²s', formula: 'from breaker curve' },
        { label: 'Verdict',             value: verdict === 'ok' ? 'PASS · cable withstands' : 'FAIL · cable will be damaged', unit: '', status: verdict, formula: 'cable ≥ device' },
      ],
      raw: { Isc, S, mat, ins, t, I2t_dev, k, I2t_cable, I2t_source },
      status: verdict,
      summary: `Cable I²t = ${round(I2t_cable/1e6, 2)} kA²s vs ${I2t_dev > 0 ? round(I2t_dev/1e6, 2) + ' kA²s device' : round(I2t_source/1e6, 2) + ' kA²s source'}`,
    };
  },
  formulas: [
    { name: 'Adiabatic withstand',  expression: 'I²t ≤ k² · S²', variables: 'k = 115 (PVC/Cu), 143 (XLPE/Cu)' },
    { name: 'Source I²t',           expression: 'I²t = I_sc² · t', variables: 't = clearing time' },
  ],
  notes: [
    { standard: 'IEC', reference: 'IEC 60364-4-43 §433', text: 'Adiabatic equation: S ≥ I·√t / k. k depends on conductor material, insulation, and initial/final temperature.' },
    { standard: 'NEC', reference: 'NEC 110.10', text: 'Circuit impedance and other characteristics shall be selected so that the overcurrent device will clear a fault before damage occurs.' },
  ],
  recommendations: (_i, o) => {
    const r: string[] = [];
    const v = o.raw.I2t_cable as number;
    if ((o.raw.I2t_dev as number) > v) r.push('Cable undersized for SC — increase cross-section or reduce clearing time (use current-limiting fuse/breaker).');
    r.push('Always cross-check with the actual protective device let-through curve.');
    r.push('For long cable runs, source impedance reduces I_sc at the fault — compute I_sc at the far end.');
    return r;
  },
  related: [
    { slug: 'breaker-sizing', label: 'Breaker sizing',  reason: 'SC rating' },
    { slug: 'cable-sizing',   label: 'Cable sizing',    reason: 'Minimum size' },
  ],
  seo: {
    title: 'Short-Circuit I²t Cable Withstand Calculator | PowerSys Calc',
    description: 'Verify cable can withstand short-circuit energy (I²t) until protective device clears. Adiabatic equation per IEC 60364-4-43.',
    keywords: ['short circuit cable withstand', 'I²t', 'adiabatic', 'kS I²t'],
  },
};
