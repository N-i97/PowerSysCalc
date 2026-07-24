import type { CalculatorDefinition } from '../../engine/calculator';
import { SQRT3 } from '../../engine/constants';
import { IEC_MOTOR_FLC_400V, nextMotorKwUp } from '../../engine/cableData';
import { round } from '../../engine/math';

export const calc: CalculatorDefinition = {
  slug: 'motor-fl-current',
  title: 'Motor Full-Load Current (FLC)',
  shortTitle: 'Motor FLC',
  category: 'motor',
  icon: 'motor',
  featured: true,
  tagline: 'FLA per IEC and NEC tables, and direct calculation.',
  keywords: ['motor FLC', 'FLA', 'full load current', 'IEC motor', 'NEC 430'],
  description:
    'Compute motor full-load current from kW/HP rating using IEC reference values (400 V 3φ) or NEC Table 430.250 (Design B, 230/460 V 3φ), or directly from P, V, PF, and efficiency.',
  fields: [
    { name: 'P',     label: 'Motor power', defaultValue: 15, positive: true, required: true, unitGroup: 'power', defaultUnit: 'kW', unitOptions: ['kW', 'hp'] },
    { name: 'V',     label: 'Voltage (V_LL for 3φ)', defaultValue: 400, positive: true, required: true, unitGroup: 'voltage', defaultUnit: 'V', unitOptions: ['V', 'kV'] },
    { name: 'ph',    label: 'Phase', defaultValue: '3', options: [
      { value: '1', label: 'Single-phase' },
      { value: '3', label: 'Three-phase' },
    ] },
    { name: 'pf',    label: 'Power factor', defaultValue: 0.88, min: 0, max: 1, step: 0.01 },
    { name: 'eff',   label: 'Efficiency',   defaultValue: 0.91, min: 0.01, max: 1, step: 0.01 },
    { name: 'standard', label: 'Reference', defaultValue: 'calc', options: [
      { value: 'calc', label: 'Direct calc (P, V, PF, η)' },
      { value: 'iec',  label: 'IEC table (400 V 3φ)' },
      { value: 'nec',  label: 'NEC 430.250 (460 V 3φ)' },
    ] },
  ],
  compute: (input) => {
    // The hook converts P to the default unit (kW) before calling compute,
    // regardless of whether the user selected kW or hp in the dropdown.
    const P_kW = Number(input.P);
    const V   = Number(input.V);
    const ph  = String(input.ph);
    const pf  = Number(input.pf);
    const eff = Number(input.eff);
    const std = String(input.standard);
    let I_calc = ph === '3' ? (P_kW * 1000) / (SQRT3 * V * pf * eff) : (P_kW * 1000) / (V * pf * eff);
    let I_table = 0, tableNote = '';
    if (std === 'iec' && ph === '3' && V === 400) {
      const stdkW = nextMotorKwUp(P_kW);
      I_table = IEC_MOTOR_FLC_400V[stdkW] ?? I_calc;
      tableNote = `IEC @ 400 V 3φ, ${stdkW} kW → ${I_table} A`;
    } else if (std === 'nec' && ph === '3' && V === 460) {
      const hp = P_kW / 0.7457;
      const table: Record<number, number> = { 0.5: 1.1, 0.75: 1.6, 1: 2.1, 1.5: 3.0, 2: 3.4, 3: 4.8, 5: 7.6, 7.5: 11, 10: 14, 15: 21, 20: 27, 25: 34, 30: 40, 40: 52, 50: 65, 60: 77, 75: 96, 100: 124, 125: 156, 150: 180, 200: 240 };
      let pick = 0.5;
      for (const k of Object.keys(table).map(Number).sort((a, b) => a - b)) {
        if (k >= hp) { pick = k; break; }
      }
      I_table = table[pick] ?? I_calc;
      tableNote = `NEC 430.250 @ 460 V 3φ, ${pick} HP → ${I_table} A`;
    }
    const I = std === 'calc' ? I_calc : I_table;
    const ocpd = round(Math.ceil(I * 2.5 / 5) * 5, 0); // typical inverse-time OCPD
    return {
      rows: [
        { label: 'Full-load current I_FLC', value: round(I, 2), unit: 'A', status: 'ok', formula: std === 'calc' ? 'P / (√3·V·PF·η)' : tableNote },
        { label: 'Direct calculation',      value: round(I_calc, 2), unit: 'A', formula: 'I = P / (√3·V·PF·η)' },
        { label: 'Standard motor kW (rounded)', value: std === 'iec' ? nextMotorKwUp(P_kW) : '-', unit: 'kW', formula: '' },
        { label: 'Recommended OCPD (inverse-time)', value: ocpd, unit: 'A', status: 'info', formula: '~2.5 × FLC, next std size' },
        { label: 'Motor P',   value: round(P_kW, 2), unit: 'kW', formula: 'given' },
        { label: 'Voltage',   value: V, unit: 'V', formula: 'given' },
        { label: 'PF · η',    value: round(pf * eff, 3), unit: '', formula: 'combined' },
      ],
      raw: { P_kW, V, ph, pf, eff, std, I, I_calc, I_table, ocpd },
      picks: { motorFLC: round(I, 1) },
      status: 'ok',
      summary: `FLC ≈ ${round(I, 1)} A · OCPD ≈ ${ocpd} A (inverse-time)`,
    };
  },
  formulas: [
    { name: 'Direct FLC', expression: 'I = P / (√3 · V_LL · PF · η)', variables: '3φ; P in W' },
    { name: 'NEC OCPD',   expression: 'OCPD ≥ 2.5 × FLC (Design B)', variables: 'NEC 430.52' },
  ],
  notes: [
    { standard: 'NEC',  reference: 'NEC 430.250', text: 'FLC values for Design B, C, and D motors. Use next higher standard rating for breaker selection.' },
    { standard: 'NEMA', reference: 'NEMA MG-1',  text: 'Defines motor performance including locked-rotor current, breakdown torque, and slip.' },
    { standard: 'IEC',  reference: 'IEC 60034-1', text: 'Rotating electrical machines — nameplate rating and performance.' },
  ],
  recommendations: (_i, o) => {
    const r: string[] = [];
    r.push(`Inverse-time OCPD: next standard size ≥ ${round((o.raw.I as number) * 2.5, 0)} A (NEC 430.52 / IEC 60947-4-1).`);
    r.push('Choose overload relay at 115–125% of FLC for 1.15 SF motors, or at 100% of FLC for 1.0 SF motors.');
    r.push('For VFD-driven motors, set VFD current limit at motor nameplate FLA; cable sized per NEC 430.6 / IEC.');
    return r;
  },
  related: [
    { slug: 'motor-starting',   label: 'Motor starting',  reason: 'Locked-rotor current' },
    { slug: 'vfd-sizing',       label: 'VFD sizing',      reason: 'Drive sizing' },
    { slug: 'motor-breaker',    label: 'Motor breaker',   reason: 'OCPD selection' },
  ],
  schematic: 'motor',
  seo: {
    title: 'Motor Full-Load Current (FLC) Calculator | PowerSys Calc',
    description: 'Compute motor FLA from kW or HP, per IEC table or NEC 430.250. Includes OCPD recommendation.',
    keywords: ['motor FLC', 'motor FLA', 'full load current', 'NEC 430.250', 'IEC 60034'],
  },
};
