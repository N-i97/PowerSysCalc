import type { CalculatorDefinition } from '../../engine/calculator';
import { nextBreakerUp } from '../../engine/cableData';
import { round } from '../../engine/math';

export const calc: CalculatorDefinition = {
  slug: 'breaker-sizing',
  title: 'Circuit Breaker Sizing',
  shortTitle: 'Breaker sizing',
  category: 'protection',
  icon: 'shield',
  tagline: 'OCPD from continuous + non-continuous load, 80% rule.',
  keywords: ['breaker sizing', 'OCPD', 'circuit breaker', 'NEC 210', 'IEC 60898'],
  description:
    'Compute breaker rating for a feeder or branch circuit from continuous and non-continuous loads. Continuous loads are multiplied by 1.25; next standard size returned.',
  fields: [
    { name: 'Icont', label: 'Continuous load current (≥ 3 h)', defaultValue: 50, positive: true, required: true, unitGroup: 'current', defaultUnit: 'A', unitOptions: ['A', 'kA'] },
    { name: 'Inon',  label: 'Non-continuous load current',      defaultValue: 20, positive: true, required: true, unitGroup: 'current', defaultUnit: 'A', unitOptions: ['A', 'kA'] },
    { name: 'system',label: 'System', defaultValue: 'LV', options: [
      { value: 'LV', label: 'Low voltage (IEC 60898 / UL 489)' },
      { value: 'MV', label: 'Medium voltage (IEC 62271)' },
    ] },
  ],
  compute: (input) => {
    const Icont = Number(input.Icont);
    const Inon  = Number(input.Inon);
    const target = Icont * 1.25 + Inon;
    const ocpd = nextBreakerUp(target);
    return {
      rows: [
        { label: 'Continuous load',     value: round(Icont, 1),   unit: 'A', formula: 'given' },
        { label: 'Non-continuous load', value: round(Inon, 1),    unit: 'A', formula: 'given' },
        { label: 'Total (NEC 80% rule)', value: round(Icont*1.25 + Inon, 1), unit: 'A', formula: '1.25·Icont + Inon' },
        { label: 'OCPD (next std)',     value: ocpd,              unit: 'A', status: 'ok', formula: 'next std size ≥ target' },
        { label: 'Loading',             value: round(target/ocpd*100, 1), unit: '%', status: target/ocpd > 0.95 ? 'warn' : 'ok', formula: 'target / OCPD' },
      ],
      raw: { Icont, Inon, target, ocpd },
      picks: { breakerRating: ocpd, breakerFrame: ocpd },
      status: target / ocpd > 0.95 ? 'warn' : 'ok',
      summary: `Breaker ${ocpd} A · ${round(target/ocpd*100, 1)}% loaded`,
    };
  },
  formulas: [
    { name: 'OCPD',         expression: 'I_OCPD ≥ 1.25·Icont + Inon', variables: 'NEC 210.20 / 215.3' },
    { name: 'Next standard', expression: 'next ≥ target',             variables: 'Standard sizes' },
  ],
  notes: [
    { standard: 'NEC', reference: 'NEC 210.20', text: 'OCPD rating ≥ noncontinuous + 125% continuous load.' },
    { standard: 'IEC', reference: 'IEC 60898 / 60947-2', text: 'Circuit-breakers for overcurrent protection. Tripping characteristics B/C/D/K.' },
  ],
  recommendations: (_i, _o) => [
    'Verify SC rating ≥ available fault current at point of installation.',
    'For motor loads, use inverse-time OCPD per NEC 430.52 (typically 250% of FLC).',
  ],
  related: [
    { slug: 'fuse-sizing',     label: 'Fuse sizing', reason: 'Fuse OCPD' },
    { slug: 'motor-breaker',   label: 'Motor breaker', reason: 'Motor OCPD' },
    { slug: 'short-circuit',   label: 'Short-circuit', reason: 'SC rating' },
  ],
  seo: {
    title: 'Circuit Breaker Sizing (OCPD) | PowerSys Calc',
    description: 'Compute breaker size from continuous and non-continuous load per NEC 210.20 / 215.3 (80% rule).',
    keywords: ['breaker sizing', 'OCPD', 'circuit breaker', 'NEC 210.20', '80% rule'],
  },
};
