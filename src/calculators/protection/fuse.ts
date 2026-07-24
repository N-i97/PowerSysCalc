import type { CalculatorDefinition } from '../../engine/calculator';
import { round } from '../../engine/math';

export const calc: CalculatorDefinition = {
  slug: 'fuse-sizing',
  title: 'Fuse Sizing Calculator',
  shortTitle: 'Fuse sizing',
  category: 'protection',
  icon: 'shield',
  tagline: 'Fast-acting & time-delay fuse from load profile.',
  keywords: ['fuse sizing', 'UL 248', 'gG aM', 'class CC J', 'time delay'],
  description:
    'Compute fuse rating from continuous and non-continuous load, with different multiplier factors for fast-acting (1.25) vs time-delay (1.15) fuses. Includes standard class recommendations (gG/gL per IEC 60269).',
  fields: [
    { name: 'Icont', label: 'Continuous load', defaultValue: 25, positive: true, required: true, unitGroup: 'current', defaultUnit: 'A', unitOptions: ['A', 'kA'] },
    { name: 'Inon',  label: 'Non-continuous load', defaultValue: 8, positive: true, required: true, unitGroup: 'current', defaultUnit: 'A', unitOptions: ['A', 'kA'] },
    { name: 'type',  label: 'Fuse type', defaultValue: 'TD', options: [
      { value: 'FA', label: 'Fast-acting (gG class CC, J)' },
      { value: 'TD', label: 'Time-delay (gG)' },
      { value: 'aM', label: 'Motor (aM)' },
    ] },
    { name: 'inrush',label: 'Motor inrush factor', defaultValue: 5, min: 1, max: 12, step: 0.1, help: '× FLC, only for aM' },
  ],
  compute: (input) => {
    const Icont = Number(input.Icont);
    const Inon  = Number(input.Inon);
    const t = String(input.type);
    let factor = 1.25;
    if (t === 'TD') factor = 1.15;
    if (t === 'aM') factor = 1.0; // motor fuses don't carry continuous at 125%
    const base = Icont * factor + Inon;
    let rec: number;
    if (t === 'aM') {
      rec = Math.max(base, Number(input.inrush) * Icont * 0.6);
    } else {
      const stdSizes = [1,2,3,4,5,6,8,10,12,15,16,20,25,30,32,35,40,50,60,63,70,80,90,100,125,150,160,175,200,225,250,300,315,350,400,450,500,600,630,800,1000,1250];
      rec = stdSizes.find((s) => s >= base) ?? 1250;
    }
    return {
      rows: [
        { label: 'Continuous load',     value: round(Icont, 1), unit: 'A', formula: 'given' },
        { label: 'Non-continuous',      value: round(Inon, 1),  unit: 'A', formula: 'given' },
        { label: 'Multiplier (1.25 / 1.15)', value: factor, unit: '×', formula: t === 'FA' ? '1.25 fast-acting' : t === 'TD' ? '1.15 time-delay' : '1.0 motor' },
        { label: 'Computed minimum',    value: round(base, 1),  unit: 'A', formula: 'k · Icont + Inon' },
        { label: 'Recommended fuse',    value: rec,             unit: 'A', status: 'ok', formula: 'next standard size' },
      ],
      raw: { Icont, Inon, t, factor, base, rec },
      status: 'ok',
      summary: `Recommend ${rec} A ${t === 'aM' ? 'aM motor fuse' : t === 'TD' ? 'time-delay gG' : 'fast-acting'}`,
    };
  },
  formulas: [
    { name: 'Fast-acting',  expression: 'I_F ≥ 1.25·Icont + Inon', variables: 'NEC 240.4(B) / 430.52' },
    { name: 'Time-delay',   expression: 'I_F ≥ 1.15·Icont + Inon', variables: 'Allows harmless inrush' },
    { name: 'Motor (aM)',   expression: 'I_F ≥ Icont + inrush, sized for locked rotor', variables: 'IEC 60269 aM' },
  ],
  notes: [
    { standard: 'IEC',  reference: 'IEC 60269-1/2',  text: 'Low-voltage fuses — gG (general purpose), aM (motor), gR/aR (semiconductor).' },
    { standard: 'NEC',  reference: 'NEC 240.4(B)',  text: 'Conductor ampacity vs fuse rating — next higher standard size permitted for 800 A and below.' },
  ],
  recommendations: (_i, o) => {
    const r: string[] = [];
    r.push('Select fuse class to match available fuseholders (CC, J, T, L).');
    r.push('For DC circuits, select DC-rated fuse (different arcing behavior).');
    r.push('Time-delay fuses (dual-element) tolerate motor inrush; fast-acting fuses protect semiconductors.');
    return r;
  },
  related: [
    { slug: 'breaker-sizing',  label: 'Breaker sizing', reason: 'OCPD' },
    { slug: 'motor-breaker',   label: 'Motor breaker',  reason: 'Motor OCPD' },
  ],
  seo: {
    title: 'Fuse Sizing Calculator (Fast, Time-delay, Motor) | PowerSys Calc',
    description: 'Select fuse rating per NEC 240 and IEC 60269. Fast-acting, time-delay, and motor (aM) classes.',
    keywords: ['fuse sizing', 'gG gL', 'aM motor fuse', 'class CC J', 'IEC 60269'],
  },
};
