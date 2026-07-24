import type { CalculatorDefinition } from '../../engine/calculator';
import { round } from '../../engine/math';

export const calc: CalculatorDefinition = {
  slug: 'solar-inverter',
  title: 'Solar Inverter Sizing',
  shortTitle: 'Solar inverter',
  category: 'renewable',
  icon: 'solar',
  tagline: 'Inverter kW from PV array + safety/oversize margin.',
  keywords: ['solar inverter', 'PV inverter', 'inverter sizing', 'DC/AC ratio'],
  description:
    'Size a string inverter from total DC PV array power. Apply an oversize margin (typical DC/AC ratio 1.0–1.3) to allow for low-irradiance and clipping management.',
  fields: [
    { name: 'Pdc',  label: 'PV array DC power', defaultValue: 12, positive: true, required: true, unitGroup: 'power', defaultUnit: 'kW', unitOptions: ['W', 'kW', 'MW'] },
    { name: 'ratio',label: 'DC/AC ratio', defaultValue: 1.15, min: 0.8, max: 1.6, step: 0.01, help: 'P_dc / P_ac; 1.0–1.3 typical' },
    { name: 'Vmp',  label: 'MPPT voltage range (min)', defaultValue: 200, positive: true, required: true, unitGroup: 'voltage', defaultUnit: 'V', unitOptions: ['V', 'kV'] },
    { name: 'Voc',  label: 'Open-circuit voltage (max)', defaultValue: 600, positive: true, required: true, unitGroup: 'voltage', defaultUnit: 'V', unitOptions: ['V', 'kV'] },
    { name: 'ph',   label: 'Phase', defaultValue: '1', options: [
      { value: '1', label: 'Single-phase' }, { value: '3', label: 'Three-phase' },
    ] },
  ],
  compute: (input) => {
    const Pdc = Number(input.Pdc) * 1000;
    const ratio = Number(input.ratio);
    const Vac = (Pdc / ratio) / 1000;
    return {
      rows: [
        { label: 'PV DC power',     value: round(Pdc/1000, 2), unit: 'kWp', formula: 'given' },
        { label: 'DC/AC ratio',     value: ratio, unit: '', formula: 'Pdc / Pac' },
        { label: 'Inverter AC',     value: round(Vac, 2), unit: 'kW', status: 'ok', formula: 'P_dc / ratio' },
        { label: 'MPPT V range',    value: Number(input.Vmp), unit: 'V', formula: 'given' },
        { label: 'Max Voc',         value: Number(input.Voc), unit: 'V', formula: 'given' },
      ],
      raw: { Pdc, ratio, Vac },
      status: 'ok',
      summary: `Inverter ≥ ${round(Vac, 2)} kW (DC/AC = ${ratio})`,
    };
  },
  formulas: [
    { name: 'Inverter AC', expression: 'P_ac = P_dc / (DC/AC ratio)', variables: '' },
  ],
  notes: [
    { standard: 'IEEE', reference: 'IEEE 1547-2018', text: 'Standard for interconnecting distributed resources with electric power systems.' },
    { standard: 'IEC',  reference: 'IEC 62109-1/2', text: 'Safety of power converters for use in photovoltaic power systems.' },
  ],
  recommendations: (_i, o) => {
    const r: string[] = [];
    r.push('Confirm inverter MPPT range covers string Vmp at min expected cell temperature.');
    r.push('Confirm Voc (cold) ≤ inverter max DC input voltage (use −10 °C or site min).');
    r.push('In high-irradiance regions, DC/AC > 1.2 is common to recover clipping losses at noon.');
    return r;
  },
  related: [
    { slug: 'solar-string',    label: 'Solar string',   reason: 'Strings in series' },
    { slug: 'battery-runtime', label: 'Battery runtime', reason: 'Storage sizing' },
  ],
  schematic: 'inverter',
  seo: {
    title: 'Solar Inverter Sizing Calculator (DC/AC) | PowerSys Calc',
    description: 'Size string inverter from PV array DC power and DC/AC ratio. IEC 62109 & IEEE 1547 aligned.',
    keywords: ['solar inverter sizing', 'DC/AC ratio', 'PV inverter', 'IEC 62109'],
  },
};
