import type { CalculatorDefinition } from '../../engine/calculator';
import { nextBreakerUp } from '../../engine/cableData';
import { round } from '../../engine/math';

export const calc: CalculatorDefinition = {
  slug: 'motor-breaker',
  title: 'Motor Circuit Breaker / OCPD Sizing',
  shortTitle: 'Motor breaker',
  category: 'motor',
  icon: 'shield',
  tagline: 'Inverse-time breaker per NEC 430.52 and IEC 60947.',
  keywords: ['motor breaker', 'OCPD', 'NEC 430.52', 'IEC 60947', 'motor protection'],
  description:
    'Select the next standard inverse-time overcurrent protective device for a motor feeder per NEC 430.52 (table) and IEC 60947-4-1 type 1/2 coordination. Returns the breaker rating, the wiring protection size, and recommended overload relay range.',
  fields: [
    { name: 'I',   label: 'Motor FLC', defaultValue: 28, positive: true, required: true, unitGroup: 'current', defaultUnit: 'A', unitOptions: ['A', 'kA'] },
    { name: 'type',label: 'Breaker / fuse type', defaultValue: 'inv', options: [
      { value: 'inv',   label: 'Inverse-time breaker' },
      { value: 'inst',  label: 'Instantaneous trip (MCP)' },
      { value: 'dual',  label: 'Dual-element fuse' },
    ] },
    { name: 'poles',label: 'Poles', defaultValue: '3', options: [
      { value: '1', label: '1P' }, { value: '2', label: '2P' }, { value: '3', label: '3P' },
    ] },
  ],
  compute: (input) => {
    const I = Number(input.I);
    const t = String(input.type);
    let factor = 2.5;
    if (t === 'inst') factor = 8;
    if (t === 'dual') factor = 1.75;
    const target = I * factor;
    const ocpd   = nextBreakerUp(target);
    const ol_min = round(I * 1.15, 1);
    const ol_max = round(I * 1.25, 1);
    const cable_min = round(I * 1.25, 1);
    return {
      rows: [
        { label: 'Motor FLC',                 value: round(I, 1),    unit: 'A', formula: 'given' },
        { label: 'Protection factor (k)',     value: factor,         unit: '×', formula: 'NEC 430.52 / IEC 60947' },
        { label: 'Target OCPD',               value: round(target, 1), unit: 'A', formula: 'k × FLC' },
        { label: 'Selected OCPD (next std)',  value: ocpd,           unit: 'A', status: 'ok', formula: 'next std breaker' },
        { label: 'Overload relay setting',    value: `${ol_min} – ${ol_max}`, unit: 'A', status: 'info', formula: '115–125% FLC' },
        { label: 'Min conductor ampacity',    value: cable_min,      unit: 'A', formula: '125% FLC (continuous load)' },
        { label: 'Poles',                     value: Number(input.poles), unit: '', formula: 'given' },
      ],
      raw: { I, t, factor, target, ocpd, ol_min, ol_max, cable_min },
      picks: { breakerRating: ocpd, breakerFrame: ocpd },
      status: factor > 6 ? 'warn' : 'ok',
      summary: `OCPD ${ocpd} A · OL ${ol_min}–${ol_max} A · cable ≥ ${cable_min} A`,
    };
  },
  formulas: [
    { name: 'OCPD (inverse-time)', expression: 'OCPD ≥ 2.5 × FLC', variables: 'NEC 430.52, Design B' },
    { name: 'OCPD (instantaneous)', expression: 'OCPD ≥ 8 × FLC',  variables: 'Motor circuit protector' },
    { name: 'OCPD (dual fuse)',     expression: 'OCPD ≥ 1.75 × FLC', variables: 'Time-delay fuse' },
    { name: 'Conductor',            expression: 'A ≥ 1.25 × FLC',  variables: 'Continuous load' },
  ],
  notes: [
    { standard: 'NEC',  reference: 'NEC 430.52', text: 'Branch-circuit short-circuit & ground-fault protection: 250% (inverse-time), 800% (instantaneous), 175% (dual-element fuse). Next higher standard size allowed.' },
    { standard: 'IEC',  reference: 'IEC 60947-4-1', text: 'Type 1 / Type 2 coordination. Type 2 = no welding, trip on SC.' },
  ],
  recommendations: (i, o) => {
    const r: string[] = [];
    const ocpd = o.raw.ocpd as number;
    r.push(`Breaker: ${ocpd} A, ${String(i.poles)}-pole.`);
    r.push('Set overload to motor nameplate FLA (1.0 SF motor) or 115–125% × FLA (1.15 SF motor).');
    r.push('Verify SC rating ≥ available fault current at line side.');
    return r;
  },
  related: [
    { slug: 'motor-fl-current',   label: 'Motor FLC',     reason: 'FLA' },
    { slug: 'breaker-sizing',     label: 'Breaker sizing',reason: 'OCPD for feeders' },
    { slug: 'fuse-sizing',        label: 'Fuse sizing',   reason: 'fuse OCPD' },
  ],
  seo: {
    title: 'Motor Circuit Breaker / OCPD Sizing | PowerSys Calc',
    description: 'Select motor OCPD per NEC 430.52 and IEC 60947-4-1. Inverse-time, instantaneous, or dual-element fuse.',
    keywords: ['motor breaker', 'OCPD motor', 'NEC 430.52', 'IEC 60947-4-1'],
  },
};
