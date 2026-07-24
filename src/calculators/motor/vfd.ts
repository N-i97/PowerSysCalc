import type { CalculatorDefinition } from '../../engine/calculator';
import { round } from '../../engine/math';

export const calc: CalculatorDefinition = {
  slug: 'vfd-sizing',
  title: 'VFD (Variable Frequency Drive) Sizing',
  shortTitle: 'VFD sizing',
  category: 'motor',
  icon: 'gear',
  tagline: 'Select VFD rating from motor FLC, duty cycle, and altitude.',
  keywords: ['VFD sizing', 'variable frequency drive', 'inverter', 'motor drive', 'derating'],
  description:
    'Size a VFD (variable frequency drive) from motor FLC, with derating for ambient temperature, altitude, carrier frequency, and duty cycle (variable torque vs constant torque).',
  fields: [
    { name: 'I',   label: 'Motor FLC',       defaultValue: 28, positive: true, required: true, unitGroup: 'current', defaultUnit: 'A', unitOptions: ['A', 'kA'] },
    { name: 'V',   label: 'Drive voltage',   defaultValue: 400, positive: true, required: true, unitGroup: 'voltage', defaultUnit: 'V', unitOptions: ['V', 'kV'] },
    { name: 'ph',  label: 'Phase',           defaultValue: '3', options: [
      { value: '1', label: '1φ' }, { value: '3', label: '3φ' },
    ] },
    { name: 'duty',label: 'Load profile',    defaultValue: 'VT', options: [
      { value: 'VT', label: 'Variable torque (fans, pumps)' },
      { value: 'CT', label: 'Constant torque (conveyors, compressors)' },
      { value: 'CT_OL',label: 'Constant torque + 110% OL (1 min)' },
    ] },
    { name: 'Ta',  label: 'Ambient temperature', defaultValue: 40, min: -20, max: 60, step: 1, help: '°C' },
    { name: 'alt', label: 'Altitude',         defaultValue: 1000, min: 0, max: 4000, step: 100, help: 'm above sea level' },
    { name: 'fc',  label: 'Switching frequency', defaultValue: 4, min: 1, max: 16, step: 1, help: 'kHz; lower losses at 2–4 kHz' },
  ],
  compute: (input) => {
    const I  = Number(input.I);
    const V  = Number(input.V);
    const ph = String(input.ph);
    const d  = String(input.duty);
    const Ta = Number(input.Ta);
    const alt = Number(input.alt);
    const fc = Number(input.fc);
    let kd = 1;
    if (d === 'VT') kd = 1.0;       // VT drives can run at FLC
    if (d === 'CT') kd = 1.05;      // small margin
    if (d === 'CT_OL') kd = 1.10;
    const kT = Ta > 40 ? 1 - 0.02 * (Ta - 40) : 1;          // 2%/°C above 40
    const kA = alt > 1000 ? 1 - 0.01 * ((alt - 1000) / 100) : 1;
    const kF = fc > 4 ? 1 - 0.05 * Math.floor((fc - 4) / 2) : 1;
    const derate = Math.min(kd, kT, kA, kF);
    const I_req  = I / derate;
    const S_drive = (ph === '3' ? Math.sqrt(3) : 1) * V * I_req;
    return {
      rows: [
        { label: 'Motor FLC',         value: round(I, 1), unit: 'A', formula: 'given' },
        { label: 'Duty factor (k_d)', value: round(kd, 2), unit: '', formula: 'VT/CT/CT+OL' },
        { label: 'Temp derate (k_T)', value: round(kT, 2), unit: '', status: kT < 1 ? 'warn' : 'ok', formula: '−2%/°C above 40 °C' },
        { label: 'Altitude derate (k_A)', value: round(kA, 2), unit: '', status: kA < 1 ? 'warn' : 'ok', formula: '−1%/100 m above 1000 m' },
        { label: 'Carrier derate (k_F)', value: round(kF, 2), unit: '', status: kF < 1 ? 'warn' : 'ok', formula: '−5% per 2 kHz above 4 kHz' },
        { label: 'Worst derate',     value: round(derate, 3), unit: '', formula: 'min(k_d, k_T, k_A, k_F)' },
        { label: 'Required VFD current', value: round(I_req, 1), unit: 'A', formula: 'I_FLC / derate' },
        { label: 'Required VFD power',  value: round(S_drive/1000, 2), unit: 'kVA', status: 'ok', formula: ph === '3' ? '√3·V·I' : 'V·I' },
      ],
      raw: { I, V, ph, d, Ta, alt, fc, kd, kT, kA, kF, derate, I_req, S_drive },
      status: derate < 0.8 ? 'warn' : 'ok',
      summary: `VFD ≥ ${round(I_req, 1)} A (${round(S_drive/1000, 2)} kVA) at derate ${round(derate*100, 1)}%`,
    };
  },
  formulas: [
    { name: 'Required current',  expression: 'I_req = I_FLC / (k_d · k_T · k_A · k_F)', variables: '' },
    { name: 'Temp derate',       expression: 'k_T = 1 − 0.02·(T_a − 40)', variables: '°C above 40' },
    { name: 'Altitude derate',   expression: 'k_A = 1 − 0.01·((alt − 1000)/100)', variables: 'per 100 m above 1000 m' },
  ],
  notes: [
    { standard: 'IEC',  reference: 'IEC 61800-2', text: 'Adjustable speed electrical power drive systems — general requirements. Includes derating guidance.' },
    { standard: 'NEMA', reference: 'NEMA ICS 7',   text: 'Industrial control and systems — adjustable-speed drives.' },
  ],
  recommendations: (_i, o) => {
    const r: string[] = [];
    const I_req = o.raw.I_req as number;
    r.push(`Select VFD nominal ≥ ${round(I_req, 1)} A continuous, ${round(I_req*1.5, 1)} A peak (60 s).`);
    r.push('Use inverter-duty cable or output reactor/reactor filter for long motor leads (>30 m) to limit dv/dt and reflected wave.');
    r.push('Install line reactor or passive harmonic filter at VFD input for THDi mitigation.');
    return r;
  },
  related: [
    { slug: 'motor-fl-current',  label: 'Motor FLC',     reason: 'FLA' },
    { slug: 'motor-starting',    label: 'Motor starting',reason: 'DOL/VFD' },
  ],
  seo: {
    title: 'VFD (Variable Frequency Drive) Sizing Calculator | PowerSys Calc',
    description: 'Size VFD from motor FLC, with derating for ambient, altitude, switching frequency, and duty cycle.',
    keywords: ['VFD sizing', 'variable frequency drive', 'drive derate', 'altitude temperature'],
  },
};
