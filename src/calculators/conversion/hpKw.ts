import type { CalculatorDefinition } from '../../engine/calculator';
import { HP_METRIC_TO_W, HP_TO_W } from '../../engine/constants';
import { round } from '../../engine/math';

export const calc: CalculatorDefinition = {
  slug: 'hp-kw-converter',
  title: 'HP ↔ kW Converter',
  shortTitle: 'HP · kW',
  category: 'conversion',
  icon: 'swap',
  tagline: 'Convert horsepower (mechanical & metric) to/from kilowatts.',
  keywords: ['hp to kw', 'kw to hp', 'horsepower conversion', 'metric PS'],
  description: 'Quick converter between mechanical horsepower (hp), metric horsepower (PS), and kilowatts (kW). Useful for motor rating, generator sizing, and machine tools.',
  fields: [
    { name: 'value', label: 'Value', defaultValue: 10, positive: true, required: true },
    { name: 'from',  label: 'From', defaultValue: 'hp', options: [
      { value: 'hp',   label: 'HP (mechanical)' },
      { value: 'ps',   label: 'PS (metric HP)' },
      { value: 'kW',   label: 'kW' },
      { value: 'W',    label: 'W' },
    ] },
    { name: 'to',    label: 'To', defaultValue: 'kW', options: [
      { value: 'hp',   label: 'HP (mechanical)' },
      { value: 'ps',   label: 'PS (metric HP)' },
      { value: 'kW',   label: 'kW' },
      { value: 'W',    label: 'W' },
    ] },
  ],
  compute: (input) => {
    const v = Number(input.value);
    const from = String(input.from);
    const to   = String(input.to);
    const toW = (x: number) => {
      switch (from) {
        case 'hp': return x * HP_TO_W;
        case 'ps': return x * HP_METRIC_TO_W;
        case 'kW': return x * 1000;
        case 'W':  return x;
        default:   return x;
      }
    };
    const fromW = (w: number) => {
      switch (to) {
        case 'hp': return w / HP_TO_W;
        case 'ps': return w / HP_METRIC_TO_W;
        case 'kW': return w / 1000;
        case 'W':  return w;
        default:   return w;
      }
    };
    const w = toW(v);
    const r = fromW(w);
    return {
      rows: [
        { label: 'Input', value: v, unit: from, formula: '' },
        { label: 'Output', value: round(r, 4), unit: to, status: 'ok', formula: 'see constants' },
      ],
      raw: { v, w, r, from, to },
      summary: `${v} ${from} = ${round(r, 4)} ${to}`,
    };
  },
  formulas: [
    { name: 'HP → W', expression: 'W = HP · 745.7', variables: 'Mechanical' },
    { name: 'PS → W', expression: 'W = PS · 735.5', variables: 'Metric' },
  ],
  seo: {
    title: 'HP ↔ kW Converter | PowerSys Calc',
    description: 'Convert between mechanical HP, metric PS, kW, and W.',
    keywords: ['hp to kw', 'horsepower to kilowatt', 'PS metric HP', 'conversion'],
  },
};
