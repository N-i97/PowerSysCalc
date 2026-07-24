import type { CalculatorDefinition } from '../../engine/calculator';
import { CONDUCTORS, getConductor, nextBreakerUp, TEMP_DERATING, GROUPING_DERATING, SOIL_RESISTIVITY_DERATING } from '../../engine/cableData';
import { round } from '../../engine/math';
import type { ConductorEntry } from '../../engine/cableData';

export const calc: CalculatorDefinition = {
  slug: 'cable-sizing',
  title: 'Cable Sizing Calculator',
  shortTitle: 'Cable sizing',
  category: 'cable',
  icon: 'cable',
  featured: true,
  tagline: 'Minimum cable size from ampacity, derating, and OCPD.',
  keywords: ['cable sizing', 'ampacity', 'derating', 'current capacity', 'IEC 60364-5-52'],
  description:
    'Select minimum cross-section from ampacity (with derating factors) and overcurrent protection. Returns the next standard size that satisfies: I_z ≥ I_n ≥ I_B, with Vd separately checkable.',
  fields: [
    { name: 'IB',  label: 'Design current I_B',   defaultValue: 60, positive: true, required: true, unitGroup: 'current', defaultUnit: 'A', unitOptions: ['A', 'kA'] },
    { name: 'ins', label: 'Insulation', defaultValue: 'XLPE', options: [
      { value: 'PVC', label: 'PVC (70 °C)' },
      { value: 'XLPE',label: 'XLPE (90 °C)' },
      { value: 'EPR', label: 'EPR (90 °C)' },
    ] },
    { name: 'method', label: 'Installation method', defaultValue: 'C', options: [
      { value: 'A1', label: 'A1 — in conduit, thermal' },
      { value: 'A2', label: 'A2 — in conduit, multi-core' },
      { value: 'B1', label: 'B1 — in conduit on wall' },
      { value: 'B2', label: 'B2 — on wall / tray' },
      { value: 'C',  label: 'C — on cable ladder / tray' },
      { value: 'E',  label: 'E — in free air (single)' },
      { value: 'F',  label: 'F — in free air (touching)' },
    ] },
    { name: 'mat', label: 'Conductor material', defaultValue: 'Cu', options: [
      { value: 'Cu', label: 'Copper' }, { value: 'Al', label: 'Aluminum' },
    ] },
    { name: 'Ta',  label: 'Ambient temperature', defaultValue: 30, min: -20, max: 80, help: '°C' },
    { name: 'grp', label: 'Grouped circuits',    defaultValue: 1, min: 1, max: 20, help: 'Total bundled circuits' },
    { name: 'soil',label: 'Soil thermal resistivity', defaultValue: 1.0, min: 0.4, max: 3.5, step: 0.1, help: 'K·m/W; only for buried cables' },
    { name: 'duty',label: 'Load duty', defaultValue: 'cont', options: [
      { value: 'cont', label: 'Continuous (≥ 3 h)' },
      { value: 'nonc', label: 'Non-continuous' },
    ] },
  ],
  compute: (input) => {
    const IB   = Number(input.IB);
    const ins  = String(input.ins) as 'PVC' | 'XLPE' | 'EPR';
    const m    = String(input.method) as 'A1' | 'A2' | 'B1' | 'B2' | 'C' | 'E' | 'F';
    const Ta   = Number(input.Ta);
    const grp  = Number(input.grp);
    const soil = Number(input.soil);
    const duty = String(input.duty);

    // Derate factors
    const tKeys = Object.keys(TEMP_DERATING[ins] || {}).map(Number).sort((a, b) => a - b);
    let kT = 1;
    for (let i = 0; i < tKeys.length; i++) {
      if (Ta <= tKeys[i]) { kT = TEMP_DERATING[ins][tKeys[i]]; break; }
      if (i === tKeys.length - 1) kT = TEMP_DERATING[ins][tKeys[i]];
    }
    const kG = GROUPING_DERATING[Math.min(grp, 20)] ?? 0.48;
    const kS = SOIL_RESISTIVITY_DERATING[Math.round(soil * 10) / 10] ?? 1;

    // Required ampacity: I_z ≥ I_n = k1 · I_B; k1 = 1.25 for continuous
    const k1 = duty === 'cont' ? 1.25 : 1.0;
    const In = IB * k1;
    const I_z_req = In / (kT * kG * kS);

    // Iterate
    let chosen: ConductorEntry | undefined;
    for (const c of CONDUCTORS) {
      const table = c.ampacity[ins]?.[m];
      const amp = table?.[c.size];
      if (amp && amp >= I_z_req) { chosen = c; break; }
    }
    if (!chosen) chosen = CONDUCTORS[CONDUCTORS.length - 1];

    const ocpd = nextBreakerUp(In);
    return {
      rows: [
        { label: 'Design current I_B',      value: round(IB, 1),    unit: 'A',  formula: 'given' },
        { label: 'Continuous-load factor k₁', value: k1,            unit: '',   formula: '1.25 continuous / 1.0 non-cont' },
        { label: 'Required I_n',             value: round(In, 1),   unit: 'A',  formula: 'k₁ · I_B' },
        { label: 'Temperature factor k_T',   value: round(kT, 3),   unit: '',   status: kT < 1 ? 'warn' : 'ok', formula: `IEC 60364-5-52 B.52.14, ${ins} @ ${Ta}°C` },
        { label: 'Grouping factor k_G',      value: round(kG, 3),   unit: '',   status: kG < 1 ? 'warn' : 'ok', formula: `IEC B.52.17, ${grp} circuits` },
        { label: 'Soil derate k_S',          value: round(kS, 3),   unit: '',   formula: `IEC B.52.16, soil ${soil} K·m/W` },
        { label: 'Required I_z (ampacity)',  value: round(I_z_req, 1), unit: 'A', status: 'warn', formula: 'I_n / (k_T·k_G·k_S)' },
        { label: 'Selected size',            value: chosen.size,    unit: 'mm²', status: 'ok', formula: 'smallest size with I_z ≥ required' },
        { label: 'Cable ampacity (I_z)',     value: chosen.ampacity[ins][m as 'A1' | 'A2' | 'B1' | 'B2' | 'C' | 'E' | 'F'][chosen.size] ?? 0, unit: 'A', status: 'ok', formula: `I_z table, ${ins} / ${m}` },
        { label: 'Recommended OCPD (next std)', value: ocpd,        unit: 'A',   formula: 'next std ≥ I_n' },
      ],
      raw: { IB, ins, m, Ta, grp, soil, duty, k1, In, kT, kG, kS, I_z_req, chosen: chosen.size, ocpd },
      picks: { cableSize: chosen.size, breakerRating: ocpd },
      status: I_z_req > (chosen.ampacity[ins][m as 'A1' | 'A2' | 'B1' | 'B2' | 'C' | 'E' | 'F'][chosen.size] ?? 0) ? 'err' : 'ok',
      summary: `Select ${chosen.size} mm² ${input.mat} (${ins}, method ${m}) · OCPD ${ocpd} A`,
    };
  },
  formulas: [
    { name: 'Required ampacity', expression: 'I_z ≥ k₁ · I_B / (k_T · k_G · k_S)', variables: 'IEC 60364-5-52' },
    { name: 'Temperature',       expression: 'k_T (B.52.14)', variables: 'From insulation & ambient' },
    { name: 'Grouping',          expression: 'k_G (B.52.17)', variables: 'Number of circuits' },
    { name: 'Continuous load',   expression: 'k₁ = 1.25',     variables: 'NEC 210.20 / 215.3' },
  ],
  notes: [
    { standard: 'IEC', reference: 'IEC 60364-5-52', text: 'Tables B.52.2 to B.52.14 give ampacity for installation methods A1–F. Apply derating factors B.52.14 (temperature), B.52.17 (grouping), B.52.16 (soil).' },
    { standard: 'NEC', reference: 'NEC 310.15(B)(16)', text: 'Allowable ampacity for 60/75/90 °C conductors. Apply adjustment & correction factors per 310.15(B)(3)(a).' },
  ],
  recommendations: (_i, o) => {
    const r: string[] = [];
    r.push('Voltage drop must be checked separately (use Voltage Drop calculator).');
    r.push('Verify short-circuit withstand: I²t cable ≥ I²t breaker clearing.');
    r.push('For long parallel runs, consider derating per ambient/burial depth per IEEE 835 / IEC 60287.');
    return r;
  },
  related: [
    { slug: 'voltage-drop',    label: 'Voltage drop',   reason: 'ΔU check' },
    { slug: 'cable-derating',  label: 'Derating detail',reason: 'kT, kG, kS' },
    { slug: 'short-circuit',   label: 'Short-circuit',  reason: 'Withstand' },
  ],
  seo: {
    title: 'Cable Sizing Calculator (Ampacity + Derating) | PowerSys Calc',
    description: 'Minimum cable cross-section from ampacity, temperature, grouping, and soil derating per IEC 60364-5-52. Includes OCPD selection.',
    keywords: ['cable sizing calculator', 'ampacity', 'cable derating', 'IEC 60364-5-52'],
  },
};
