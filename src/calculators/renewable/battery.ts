import type { CalculatorDefinition } from '../../engine/calculator';
import { round } from '../../engine/math';

export const calc: CalculatorDefinition = {
  slug: 'battery-runtime',
  title: 'Battery Runtime Calculator',
  shortTitle: 'Battery runtime',
  category: 'renewable',
  icon: 'battery',
  tagline: 'Runtime from capacity, DoD, and load.',
  keywords: ['battery runtime', 'autonomy', 'DoD', 'lithium', 'lead acid'],
  description:
    'Estimate backup battery runtime from nameplate capacity (Wh or Ah × V), depth of discharge limit, and load power. Includes efficiency losses and aging derate.',
  fields: [
    { name: 'E',  label: 'Battery capacity', defaultValue: 10, positive: true, required: true, unitGroup: 'energy', defaultUnit: 'kWh', unitOptions: ['Wh', 'kWh', 'MWh'] },
    { name: 'dod',label: 'Depth of discharge', defaultValue: 80, min: 5, max: 100, help: '% (Li-ion 80–90, lead-acid 50)' },
    { name: 'P',  label: 'Load power',         defaultValue: 1.5, positive: true, required: true, unitGroup: 'power', defaultUnit: 'kW', unitOptions: ['W', 'kW', 'MW'] },
    { name: 'eta',label: 'System efficiency',  defaultValue: 90, min: 30, max: 99, help: '% (inverter + wiring)' },
    { name: 'age',label: 'Aging derate',       defaultValue: 0, min: 0, max: 60, help: '% of original capacity lost' },
  ],
  compute: (input) => {
    const E = Number(input.E) * 1000;
    const dod = Number(input.dod) / 100;
    const P = Number(input.P) * 1000;
    const eta = Number(input.eta) / 100;
    const age = 1 - Number(input.age) / 100;
    const E_usable = E * dod * age;
    const runtime = E_usable / (P / eta);
    return {
      rows: [
        { label: 'Usable energy',     value: round(E_usable/1000, 3), unit: 'kWh', formula: 'E · DoD · age' },
        { label: 'Effective load',    value: round(P/eta/1000, 3),     unit: 'kW',  formula: 'P / η' },
        { label: 'Runtime',           value: round(runtime, 2),         unit: 'h',   status: 'ok', formula: 'E_usable / (P/η)' },
        { label: 'Runtime (hh:mm)',   value: `${Math.floor(runtime)}h ${Math.round((runtime % 1) * 60)}m`, unit: '', formula: '' },
      ],
      raw: { E, dod, P, eta, age, E_usable, runtime },
      status: runtime < 1 ? 'warn' : 'ok',
      summary: `Runtime ≈ ${round(runtime, 2)} h at ${Number(input.P)} kW load`,
    };
  },
  formulas: [
    { name: 'Usable energy', expression: 'E_usable = E_nom · DoD · (1 − aging)', variables: '' },
    { name: 'Runtime',       expression: 't = E_usable / (P_load / η)',         variables: '' },
  ],
  notes: [
    { standard: 'IEEE', reference: 'IEEE 1188-2005', text: 'Lead-acid battery sizing for standby applications. Allow 1.25× aging factor at end-of-life.' },
    { standard: 'IEC',  reference: 'IEC 61427',     text: 'Secondary cells for PV energy systems.' },
  ],
  recommendations: (_i, o) => {
    const r: string[] = [];
    r.push('Apply aging derate at end-of-life (typically 70–80% of nameplate).');
    r.push('For UPS, design for ≥ 15 min runtime at full load.');
    r.push('LiFePO4 supports deeper DoD (90%) vs lead-acid (50%).');
    return r;
  },
  related: [
    { slug: 'solar-inverter', label: 'Solar inverter', reason: 'PV system' },
  ],
  seo: {
    title: 'Battery Runtime Calculator | PowerSys Calc',
    description: 'Estimate backup battery runtime from capacity, depth of discharge, system efficiency, and aging.',
    keywords: ['battery runtime', 'battery autonomy', 'DoD', 'IEC 61427', 'IEEE 1188'],
  },
};
