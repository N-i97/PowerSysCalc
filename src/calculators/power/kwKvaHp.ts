import type { CalculatorDefinition } from '../../engine/calculator';
import { HP_METRIC_TO_W, HP_TO_W } from '../../engine/constants';
import { round } from '../../engine/math';

export const calc: CalculatorDefinition = {
  slug: 'kw-kva-hp',
  title: 'kW / kVA / HP Converter',
  shortTitle: 'kW · kVA · HP',
  category: 'conversion',
  icon: 'swap',
  tagline: 'Convert between real, apparent, and mechanical power.',
  keywords: ['kW kVA HP', 'horsepower', 'power conversion', 'PS'],
  description: 'Convert between watts, kilowatts, megawatts, volt-amperes, kilovolt-amperes, mechanical horsepower, and metric horsepower (Pferdestärke).',
  fields: [
    { name: 'value', label: 'Value', defaultValue: 50, positive: true, required: true, unitGroup: 'power', defaultUnit: 'kW' },
    { name: 'pf', label: 'Power factor (kW↔kVA)', defaultValue: 0.9, min: 0.01, max: 1, step: 0.01 },
  ],
  compute: (input) => {
    const v = Number(input.value);
    const pf = Number(input.pf);
    const W = v * 1000; // kW → W
    const VA = pf > 0 ? W / pf : 0;
    const kVA = VA / 1000;
    const hp = W / HP_TO_W;
    const ps = W / HP_METRIC_TO_W;
    const mW = W / 1_000_000;
    return {
      rows: [
        { label: 'W',     value: round(W, 0),    unit: 'W',    formula: 'W = kW · 1000' },
        { label: 'kW',    value: round(v, 4),    unit: 'kW',  formula: 'given' },
        { label: 'MW',    value: round(mW, 6),   unit: 'MW',  formula: 'MW = W / 1e6' },
        { label: 'kVA',   value: round(kVA, 3),  unit: 'kVA', formula: 'kVA = kW / PF' },
        { label: 'HP (mechanical)', value: round(hp, 3), unit: 'hp', formula: 'hp = W / 745.7' },
        { label: 'PS (metric)',    value: round(ps, 3), unit: 'PS', formula: 'PS = W / 735.5' },
        { label: 'VAr',   value: round(Math.sqrt(Math.max(0, VA*VA - W*W)), 0), unit: 'var', formula: 'var = √(VA² − W²)' },
      ],
      raw: { W, kW: v, kVA, hp, pf },
      status: 'ok',
      summary: `${round(v, 2)} kW = ${round(hp, 2)} HP = ${round(kVA, 2)} kVA @ PF ${pf}`,
    };
  },
  formulas: [
    { name: 'kW → kVA', expression: 'kVA = kW / cos φ', variables: 'cos φ = power factor' },
    { name: 'kW → HP',  expression: 'HP = kW · 1000 / 745.7', variables: 'Mechanical horsepower' },
    { name: 'kW → PS',  expression: 'PS = kW · 1000 / 735.5', variables: 'Metric HP (DIN 66036)' },
  ],
  notes: [
    { standard: 'IEC', reference: 'ISO 80000-4', text: '1 mechanical HP = 745.6999 W. 1 metric HP (PS) = 735.49875 W.' },
  ],
  faq: [
    { q: 'Is HP the same as BHP?',
      a: 'BHP (brake horsepower) is mechanical output at the shaft, before gearbox and driven load. HP is sometimes used loosely for both input electrical power and shaft output. Always clarify which is meant.' },
  ],
  seo: {
    title: 'kW / kVA / HP Converter | PowerSys Calc',
    description: 'Convert between watts, kilowatts, volt-amperes, mechanical and metric horsepower. Includes PF-aware kW↔kVA conversion.',
    keywords: ['kW to HP', 'HP to kW', 'kVA kW conversion', 'PS horsepower'],
  },
};
