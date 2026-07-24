import type { CalculatorDefinition } from '../../engine/calculator';
import { SQRT3 } from '../../engine/constants';
import { round } from '../../engine/math';

export const calc: CalculatorDefinition = {
  slug: 'earthing-conductor',
  title: 'Earthing Conductor Sizing',
  shortTitle: 'Earthing conductor',
  category: 'grounding',
  icon: 'ground',
  tagline: 'Earth conductor cross-section per IEC 60364-5-54.',
  keywords: ['earthing conductor', 'ground wire', 'PE', 'IEC 60364-5-54', 'bonding'],
  description:
    'Compute the minimum cross-section of a protective earth (PE) conductor using the adiabatic equation from IEC 60364-5-54 §543.1. Includes guidance for supplementary bonding conductors.',
  fields: [
    { name: 'Isc', label: 'Earth-fault current (single-phase-to-ground)', defaultValue: 4500, positive: true, required: true, unitGroup: 'current', defaultUnit: 'A', unitOptions: ['A', 'kA'] },
    { name: 't',   label: 'Disconnect time of protective device', defaultValue: 0.5, min: 0.01, max: 5, step: 0.01, unitGroup: 'time', defaultUnit: 's', unitOptions: ['s', 'ms'], help: 's' },
    { name: 'mat', label: 'Conductor material', defaultValue: 'Cu', options: [
      { value: 'Cu', label: 'Copper' }, { value: 'Al', label: 'Aluminum' },
    ] },
    { name: 'ins', label: 'Insulation', defaultValue: 'PVC', options: [
      { value: 'PVC', label: 'PVC' }, { value: 'XLPE', label: 'XLPE/EPR' },
    ] },
  ],
  compute: (input) => {
    const Isc = Number(input.Isc);
    const t   = Number(input.t);
    const mat = String(input.mat);
    const ins = String(input.ins);
    const k = (ins === 'PVC' ? 115 : 143) * (mat === 'Cu' ? 1 : 0.78);
    const S = (Isc * Math.sqrt(t)) / k;
    const nextStd = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300].find((s) => s >= S) ?? 300;
    const minByTable = 2.5; // mm² minimum for buried PE
    const final = Math.max(nextStd, minByTable);
    return {
      rows: [
        { label: 'Earth-fault current I', value: round(Isc, 1), unit: 'A', formula: 'given' },
        { label: 'Disconnect time t',     value: t, unit: 's', formula: 'given' },
        { label: 'k coefficient',         value: round(k, 1), unit: 'A·s^½/mm²', formula: `IEC 60364-5-54 T54.2/3, ${mat}/${ins}` },
        { label: 'Computed S (adiabatic)',value: round(S, 2), unit: 'mm²', formula: 'S = I·√t / k' },
        { label: 'Next standard size',    value: final, unit: 'mm²', status: 'ok', formula: 'next std ≥ S, ≥ 2.5 mm² minimum' },
      ],
      raw: { Isc, t, mat, ins, k, S, final },
      picks: { cableSize: final },
      status: S > 300 ? 'err' : 'ok',
      summary: `PE conductor ≥ ${final} mm² ${mat}`,
    };
  },
  formulas: [
    { name: 'Adiabatic S', expression: 'S = I · √t / k', variables: 'k = 115 (Cu/PVC) or 143 (Cu/XLPE)' },
  ],
  notes: [
    { standard: 'IEC',  reference: 'IEC 60364-5-54 §543.1', text: 'PE conductor must withstand adiabatic I²t for the disconnect time. Minimum 2.5 mm² if mechanically protected, 4 mm² if not.' },
    { standard: 'IEEE', reference: 'IEEE 80 (substation) ', text: 'Step & touch potentials for substations — separate from PE sizing.' },
  ],
  recommendations: (_i, _o) => [
    'Verify PE conductor is copper or aluminum — steel earth electrodes have higher resistance.',
    'For TN systems, PE sized equal to phase conductor up to 16 mm²; 16 mm² for larger phase sizes per 543.1.2.',
  ],
  related: [
    { slug: 'ground-resistance', label: 'Ground resistance', reason: 'Earth electrode' },
  ],
  seo: {
    title: 'Earthing Conductor Sizing (PE) | PowerSys Calc',
    description: 'Size protective earth (PE) conductor using the adiabatic equation S = I√t / k per IEC 60364-5-54.',
    keywords: ['earthing conductor', 'PE conductor sizing', 'IEC 60364-5-54', 'adiabatic earth'],
  },
};
