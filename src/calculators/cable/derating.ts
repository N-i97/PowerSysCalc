import type { CalculatorDefinition } from '../../engine/calculator';
import { CONDUCTORS, getConductor, TEMP_DERATING, GROUPING_DERATING, SOIL_RESISTIVITY_DERATING } from '../../engine/cableData';
import { round } from '../../engine/math';
import type { ConductorEntry } from '../../engine/cableData';

export const calc: CalculatorDefinition = {
  slug: 'cable-derating',
  title: 'Cable Derating Factors Calculator',
  shortTitle: 'Cable derating',
  category: 'cable',
  icon: 'ruler',
  tagline: 'k_T · k_G · k_S — total derated ampacity for any cable.',
  keywords: ['cable derating', 'kT', 'kG', 'kS', 'temperature factor', 'grouping factor'],
  description:
    'Compute total derating factor and final cable ampacity for an existing cable cross-section. Inputs: insulation, installation method, ambient temperature, number of grouped circuits, soil thermal resistivity.',
  fields: [
    { name: 'size',label: 'Cable size', defaultValue: 25, positive: true, required: true, unitGroup: 'area', defaultUnit: 'mm2', unitOptions: ['mm2', 'cm2'] },
    { name: 'ins', label: 'Insulation', defaultValue: 'XLPE', options: [
      { value: 'PVC', label: 'PVC' }, { value: 'XLPE', label: 'XLPE' }, { value: 'EPR', label: 'EPR' },
    ] },
    { name: 'method', label: 'Installation method', defaultValue: 'C', options: [
      { value: 'A1', label: 'A1' }, { value: 'A2', label: 'A2' }, { value: 'B1', label: 'B1' },
      { value: 'B2', label: 'B2' }, { value: 'C',  label: 'C' }, { value: 'E', label: 'E' }, { value: 'F', label: 'F' },
    ] },
    { name: 'Ta',  label: 'Ambient temperature', defaultValue: 40, min: -20, max: 80, help: '°C' },
    { name: 'grp', label: 'Grouped circuits',    defaultValue: 4, min: 1, max: 20 },
    { name: 'soil',label: 'Soil thermal resistivity', defaultValue: 1.0, min: 0.4, max: 3.5, step: 0.1, help: 'K·m/W (only for buried)' },
  ],
  compute: (input) => {
    const size = Number(input.size);
    const ins  = String(input.ins) as 'PVC' | 'XLPE' | 'EPR';
    const m    = String(input.method) as 'A1' | 'A2' | 'B1' | 'B2' | 'C' | 'E' | 'F';
    const Ta   = Number(input.Ta);
    const grp  = Number(input.grp);
    const soil = Number(input.soil);

    const tKeys = Object.keys(TEMP_DERATING[ins] || {}).map(Number).sort((a, b) => a - b);
    let kT = 1;
    for (let i = 0; i < tKeys.length; i++) {
      if (Ta <= tKeys[i]) { kT = TEMP_DERATING[ins][tKeys[i]]; break; }
      if (i === tKeys.length - 1) kT = TEMP_DERATING[ins][tKeys[i]];
    }
    const kG = GROUPING_DERATING[Math.min(grp, 20)] ?? 0.48;
    const kS = SOIL_RESISTIVITY_DERATING[Math.round(soil * 10) / 10] ?? 1;
    const K  = kT * kG * kS;

    const c = getConductor(size);
    const Iz_table = c?.ampacity[ins]?.[m]?.[size] ?? 0;
    const Iz_final = Iz_table * K;
    return {
      rows: [
        { label: 'Temperature factor k_T', value: round(kT, 3), unit: '', status: kT < 1 ? 'warn' : 'ok', formula: `IEC B.52.14, ${ins} @ ${Ta} °C` },
        { label: 'Grouping factor k_G',    value: round(kG, 3), unit: '', status: kG < 1 ? 'warn' : 'ok', formula: `IEC B.52.17, ${grp} circuits` },
        { label: 'Soil factor k_S',         value: round(kS, 3), unit: '', formula: `IEC B.52.16, ${soil} K·m/W` },
        { label: 'Combined derate K',       value: round(K, 3),  unit: '', status: K < 0.6 ? 'err' : K < 0.8 ? 'warn' : 'ok', formula: 'k_T · k_G · k_S' },
        { label: 'Base ampacity I_z,table', value: Iz_table,    unit: 'A', formula: `IEC table, ${ins} / ${m}` },
        { label: 'Final ampacity I_z\'',    value: round(Iz_final, 1), unit: 'A', status: 'ok', formula: 'I_z,table · K' },
      ],
      raw: { size, ins, m, Ta, grp, soil, kT, kG, kS, K, Iz_table, Iz_final },
      status: K < 0.6 ? 'err' : K < 0.8 ? 'warn' : 'ok',
      summary: `K = ${round(K, 3)} · I_z' = ${round(Iz_final, 1)} A (from ${Iz_table} A table)`,
    };
  },
  formulas: [
    { name: 'Combined derate', expression: 'K = k_T · k_G · k_S', variables: '' },
    { name: 'Final ampacity',  expression: 'I_z\' = I_z,table · K', variables: '' },
  ],
  notes: [
    { standard: 'IEC', reference: 'IEC 60364-5-52 §523', text: 'Apply derating factors where installation conditions differ from the reference method.' },
  ],
  related: [
    { slug: 'cable-sizing',  label: 'Cable sizing',  reason: 'Use K' },
    { slug: 'voltage-drop',  label: 'Voltage drop',  reason: 'ΔU' },
  ],
  seo: {
    title: 'Cable Derating Factor Calculator (kT, kG, kS) | PowerSys Calc',
    description: 'Compute total cable derating factor K = k_T · k_G · k_S per IEC 60364-5-52. Get final ampacity for any cable.',
    keywords: ['cable derating', 'kT kG kS', 'temperature factor', 'grouping factor', 'IEC 60364'],
  },
};
