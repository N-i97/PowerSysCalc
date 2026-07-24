import type { CalculatorDefinition } from '../../engine/calculator';
import { round } from '../../engine/math';

export const calc: CalculatorDefinition = {
  slug: 'transformer-efficiency',
  title: 'Transformer Efficiency & Losses',
  shortTitle: 'Transformer efficiency',
  category: 'transformer',
  icon: 'transformer',
  tagline: 'No-load + load loss → efficiency at any load level.',
  keywords: ['transformer efficiency', 'no load loss', 'load loss', 'iron loss', 'copper loss'],
  description:
    'Compute transformer efficiency at any load level (and PF) from nameplate no-load loss (P₀) and load loss (Pk) at rated current. Output is per-unit and percent efficiency.',
  fields: [
    { name: 'S',  label: 'Rating S',  defaultValue: 1000, positive: true, required: true, unitGroup: 'power', defaultUnit: 'kVA', unitOptions: ['VA', 'kVA', 'MVA'] },
    { name: 'P0', label: 'No-load loss P₀', defaultValue: 1.1, positive: true, required: true, unitGroup: 'power', defaultUnit: 'kW', unitOptions: ['W', 'kW'], help: 'Iron/core loss' },
    { name: 'Pk', label: 'Load loss Pk',    defaultValue: 10.5, positive: true, required: true, unitGroup: 'power', defaultUnit: 'kW', unitOptions: ['W', 'kW'], help: 'At rated current (75 °C)' },
    { name: 'load',label: 'Loading',  defaultValue: 75, min: 0, max: 200, step: 1, help: '% of nameplate kVA' },
    { name: 'pf',  label: 'Power factor', defaultValue: 0.9, min: 0, max: 1, step: 0.01 },
  ],
  compute: (input) => {
    const S   = Number(input.S) * 1000;
    const P0  = Number(input.P0) * 1000;
    const Pk  = Number(input.Pk) * 1000;
    const L   = Number(input.load) / 100;
    const pf  = Number(input.pf);
    const Pout = S * L * pf;
    const losses = P0 + Math.pow(L, 2) * Pk;
    const Pin = Pout + losses;
    const eff = Pin > 0 ? Pout / Pin : 0;
    const maxEffL = Math.sqrt(P0 / Pk);
    const maxEff = maxEffL > 0 ? (S * maxEffL * pf) / (S * maxEffL * pf + 2 * P0) : 0;
    return {
      rows: [
        { label: 'Output P_out',     value: round(Pout/1000, 3), unit: 'kW', formula: 'P_out = S · L · PF' },
        { label: 'No-load loss P₀',  value: round(P0/1000, 3),   unit: 'kW', formula: 'constant' },
        { label: 'Load loss Pk · L²',value: round(L*L*Pk/1000, 3), unit: 'kW', formula: 'Pk · L²' },
        { label: 'Total losses',     value: round(losses/1000, 3), unit: 'kW', status: losses > 0.05 * S ? 'warn' : 'ok', formula: 'P₀ + Pk · L²' },
        { label: 'Efficiency η',     value: round(eff*100, 2),   unit: '%',   status: eff > 0.95 ? 'ok' : 'warn', formula: 'P_out / (P_out + losses)' },
        { label: 'Max-efficiency loading', value: round(maxEffL*100, 1), unit: '%', status: 'info', formula: '√(P₀ / Pk)' },
        { label: 'Efficiency at peak', value: round(maxEff*100, 2), unit: '%', formula: 'at L = √(P₀/Pk)' },
      ],
      raw: { S, P0, Pk, L, pf, Pout, losses, eff, maxEffL },
      status: eff > 0.97 ? 'ok' : eff > 0.92 ? 'info' : 'warn',
      summary: `η = ${round(eff*100, 2)}% at ${Number(input.load)}% load · max at ${round(maxEffL*100, 1)}%`,
    };
  },
  formulas: [
    { name: 'Efficiency',       expression: 'η = P_out / (P_out + P₀ + Pk·L²)', variables: 'L = per-unit load' },
    { name: 'Max efficiency',   expression: 'L_max = √(P₀ / Pk)',               variables: 'Where load loss = no-load loss' },
  ],
  steps: (_i, o) => {
    const L = o.raw.L as number, P0 = o.raw.P0 as number, Pk = o.raw.Pk as number;
    return [
      { label: 'P_out = S · L · PF', formula: `${(o.raw.S as number)/1000} · ${L} · ${o.raw.pf}`, result: `${round((o.raw.Pout as number)/1000, 3)} kW` },
      { label: 'Losses = P₀ + Pk·L²', formula: `${P0/1000} + ${Pk/1000}·${L*L}`, result: `${round((o.raw.losses as number)/1000, 3)} kW` },
      { label: 'η = P_out / (P_out + losses)', formula: '—', result: `${round((o.raw.eff as number)*100, 2)}%` },
    ];
  },
  notes: [
    { standard: 'IEC',  reference: 'IEC 60076-1',  text: 'Losses measured per IEC 60076-1. Load loss referenced to 75 °C winding temp.' },
    { standard: 'IEEE', reference: 'IEEE C57.12.90', text: 'Test code for distribution transformers — no-load loss at rated V & frequency; load loss at rated current.' },
  ],
  faq: [
    { q: 'Where is the efficiency maximum?',
      a: 'At the loading where load loss = no-load loss: L_max = √(P₀ / Pk). For typical distribution transformers, this is 40–60% of rating.' },
  ],
  related: [
    { slug: 'transformer-sizing', label: 'Transformer sizing', reason: 'kVA selection' },
    { slug: 'transformer-current', label: 'Transformer current', reason: 'FLA' },
  ],
  seo: {
    title: 'Transformer Efficiency & Loss Calculator | PowerSys Calc',
    description: 'Compute transformer efficiency at any load & power factor from no-load and load loss values. Find max-efficiency point.',
    keywords: ['transformer efficiency', 'no load loss', 'load loss', 'Pk P0'],
  },
};
