import type { CalculatorDefinition } from '../../engine/calculator';
import { round } from '../../engine/math';

export const calc: CalculatorDefinition = {
  slug: 'solar-string',
  title: 'Solar String Sizing Calculator',
  shortTitle: 'Solar string',
  category: 'renewable',
  icon: 'solar',
  tagline: 'Modules per string from Vmp, Voc, and inverter window.',
  keywords: ['solar string', 'PV string', 'Voc', 'Vmp', 'MPPT'],
  description:
    'Compute the number of PV modules in series for a string from module Vmp/Voc and inverter MPPT window. Includes temperature correction (Voc rises in cold).',
  fields: [
    { name: 'Vmp_mod', label: 'Module Vmp (STC)', defaultValue: 41, positive: true, required: true, unitGroup: 'voltage', defaultUnit: 'V', unitOptions: ['V', 'kV'] },
    { name: 'Voc_mod', label: 'Module Voc (STC)', defaultValue: 49, positive: true, required: true, unitGroup: 'voltage', defaultUnit: 'V', unitOptions: ['V', 'kV'] },
    { name: 'Tc_min',  label: 'Min cell temperature', defaultValue: -10, min: -40, max: 25, help: '°C' },
    { name: 'Tc_max',  label: 'Max cell temperature', defaultValue: 70, min: 25, max: 90, help: '°C' },
    { name: 'Vmppt_min',label: 'Inverter MPPT min', defaultValue: 200, positive: true, required: true, unitGroup: 'voltage', defaultUnit: 'V', unitOptions: ['V', 'kV'] },
    { name: 'Vmppt_max',label: 'Inverter MPPT max', defaultValue: 800, positive: true, required: true, unitGroup: 'voltage', defaultUnit: 'V', unitOptions: ['V', 'kV'] },
    { name: 'Vinv_max',label: 'Inverter max DC input', defaultValue: 1000, positive: true, required: true, unitGroup: 'voltage', defaultUnit: 'V', unitOptions: ['V', 'kV'] },
  ],
  compute: (input) => {
    const Vmp = Number(input.Vmp_mod);
    const Voc = Number(input.Voc_mod);
    const Tc_min = Number(input.Tc_min);
    const Tc_max = Number(input.Tc_max);
    const Vmppt_min = Number(input.Vmppt_min);
    const Vmppt_max = Number(input.Vmppt_max);
    const Vinv_max = Number(input.Vinv_max);
    const beta = -0.0035; // typical V/°C coefficient
    // Temperature-adjusted:
    const Vmp_hot = Vmp * (1 + beta * (Tc_max - 25));
    const Voc_cold = Voc * (1 + beta * (Tc_min - 25));
    const Nmin = Math.ceil(Vmppt_min / Vmp_hot);
    const Nmax_voc = Math.floor(Vinv_max / Voc_cold);
    const Nmax_mppt = Math.floor(Vmppt_max / Vmp);
    const Nmax = Math.min(Nmax_voc, Nmax_mppt);
    return {
      rows: [
        { label: 'Vmp at hot cell (Tmax)',  value: round(Vmp_hot, 2), unit: 'V', formula: 'Vmp·(1 + β·(Tmax − 25))' },
        { label: 'Voc at cold cell (Tmin)', value: round(Voc_cold, 2), unit: 'V', formula: 'Voc·(1 + β·(Tmin − 25))' },
        { label: 'Min modules (hot Vmp ≥ MPPT min)', value: Nmin, unit: '', formula: '⌈V_mppt_min / Vmp_hot⌉' },
        { label: 'Max modules (cold Voc ≤ inverter max)', value: Nmax_voc, unit: '', formula: '⌊V_inv_max / Voc_cold⌋' },
        { label: 'Max modules (Vmp ≤ MPPT max)', value: Nmax_mppt, unit: '', formula: '⌊V_mppt_max / Vmp⌋' },
        { label: 'Recommended range', value: `${Nmin} – ${Nmax}`, unit: 'modules', status: Nmax >= Nmin ? 'ok' : 'err', formula: 'string length' },
      ],
      raw: { Vmp, Voc, Tc_min, Tc_max, Vmppt_min, Vmppt_max, Vinv_max, Nmin, Nmax, Nmax_voc, Nmax_mppt },
      status: Nmax < Nmin ? 'err' : 'ok',
      summary: `String size ${Nmin}–${Nmax} modules (${Nmin} typical)`,
    };
  },
  formulas: [
    { name: 'Vmp (hot)',  expression: 'Vmp_T = Vmp·(1 + β·(Tmax − 25))', variables: 'β ≈ −0.0035/°C' },
    { name: 'Voc (cold)', expression: 'Voc_T = Voc·(1 + β·(Tmin − 25))', variables: '' },
    { name: 'N_min',      expression: 'N_min = ⌈Vmppt_min / Vmp_hot⌉',     variables: '' },
    { name: 'N_max',      expression: 'N_max = ⌊Vinv_max / Voc_cold⌋',       variables: '' },
  ],
  notes: [
    { standard: 'IEC',  reference: 'IEC 62548', text: 'PV array design requirements. Includes temperature coefficient for Voc and Vmp.' },
    { standard: 'IEEE', reference: 'IEEE 1547',  text: 'Interconnection requirements — no string sizing per se, but inverter DC input limit applies.' },
  ],
  recommendations: (_i, o) => {
    const r: string[] = [];
    if ((o.raw.Nmin as number) > (o.raw.Nmax as number)) r.push('No valid string size — inverter MPPT window too narrow for this module at this site temperature range.');
    r.push('Validate Vmp > MPPT min under all expected operating conditions (low irradiance, cold weather).');
    r.push('Validate Voc (cold) < V_inverter_max to avoid over-voltage damage.');
    return r;
  },
  related: [
    { slug: 'solar-inverter', label: 'Solar inverter', reason: 'Inverter sizing' },
  ],
  seo: {
    title: 'Solar String Sizing Calculator (Modules per String) | PowerSys Calc',
    description: 'Compute number of PV modules per string from module Vmp/Voc and inverter MPPT window. Temperature-corrected.',
    keywords: ['solar string sizing', 'modules per string', 'PV string', 'MPPT window'],
  },
};
