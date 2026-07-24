import type { CalculatorDefinition } from '../../engine/calculator';
import { round } from '../../engine/math';

interface LoadRow { name: string; qty: number; unit: number; df: number; }

export const calc: CalculatorDefinition = {
  slug: 'demand-load',
  title: 'Demand Load & Load Factor Calculator',
  shortTitle: 'Demand load',
  category: 'power',
  icon: 'gear',
  tagline: 'Connected load, demand factor, and maximum demand.',
  keywords: ['demand load', 'demand factor', 'load factor', 'diversity', 'NEC'],
  description:
    'Aggregate multiple loads with per-load quantity, unit power, and demand factor (DF). Computes connected load, maximum demand, average demand, and load factor (LF) from a usage profile.',
  fields: [
    { name: 'loads', label: 'Loads (JSON array)', defaultValue: '[{"name":"Lighting","qty":120,"unit":0.06,"df":0.9},{"name":"HVAC","qty":2,"unit":15,"df":0.7},{"name":"Receptacles","qty":40,"unit":0.18,"df":0.4},{"name":"Motors","qty":4,"unit":7.5,"df":0.8}]', help: 'Array of {name, qty, unit kW, df}' },
    { name: 'hoursPerYear', label: 'Operating hours/year', defaultValue: 4500, min: 0, help: 'For load factor' },
  ],
  compute: (input) => {
    let loads: LoadRow[];
    try { loads = JSON.parse(String(input.loads)); }
    catch { loads = []; }
    const connected = loads.reduce((s, l) => s + l.qty * l.unit, 0);
    const demand    = loads.reduce((s, l) => s + l.qty * l.unit * l.df, 0);
    const hours     = Number(input.hoursPerYear);
    const energy    = demand * hours;          // kWh
    const peak      = demand;
    const avg       = hours > 0 ? energy / 8760 : 0; // kW
    const loadFactor = peak > 0 ? avg / peak : 0;
    return {
      rows: [
        { label: 'Connected load',  value: round(connected, 2), unit: 'kW', formula: 'Σ qty · unit' },
        { label: 'Maximum demand',  value: round(demand, 2),    unit: 'kW', status: 'ok', formula: 'Σ qty · unit · DF' },
        { label: 'Annual energy',   value: round(energy/1000, 2), unit: 'MWh', formula: 'demand · hours' },
        { label: 'Average demand',  value: round(avg, 2),       unit: 'kW', formula: 'energy / 8760' },
        { label: 'Load factor',     value: round(loadFactor*100, 1), unit: '%', status: loadFactor > 0.6 ? 'ok' : 'warn', formula: 'avg / peak' },
        { label: 'Number of load groups', value: loads.length, unit: '', formula: '' },
      ],
      raw: { connected, demand, energy, avg, loadFactor, hours },
      status: 'ok',
      summary: `Peak demand ${round(demand, 1)} kW from ${round(connected, 1)} kW connected (${loads.length} groups)`,
    };
  },
  formulas: [
    { name: 'Connected load', expression: 'Σ(qty · unit)', variables: 'Per load group' },
    { name: 'Maximum demand', expression: 'Σ(qty · unit · DF)', variables: 'DF = demand factor (NEC 220)' },
    { name: 'Load factor',    expression: 'LF = avg / peak', variables: 'avg = annual energy / 8760 h' },
  ],
  notes: [
    { standard: 'NEC', reference: 'NEC 220', text: 'Demand factors per NEC Table 220.42 (lighting), 220.44 (non-coincident), 220.50 (motors), etc. Use only where local code allows.' },
    { standard: 'IEC', reference: 'IEC 60364', text: 'Demand factors per IEC 60364-8-1 (low-voltage installations) — different from NEC.' },
  ],
  recommendations: (_i, o) => {
    const r: string[] = [];
    const lf = o.raw.loadFactor as number;
    if (lf < 0.5) r.push('Load factor < 50% — investigate peak-shaving or load-shifting opportunities.');
    if (lf > 0.85) r.push('High LF — consider transformer loading profile for thermal aging (IEC 60076-7).');
    r.push('Validate demand factors against local code — NEC and IEC differ significantly.');
    return r;
  },
  warnings: (_i, o) => {
    const w: string[] = [];
    if ((o.raw.demand as number) > (o.raw.connected as number)) w.push('Demand exceeds connected — check DF values (must be ≤ 1.0).');
    return w;
  },
  seo: {
    title: 'Demand Load & Load Factor Calculator | PowerSys Calc',
    description: 'Aggregate connected loads with demand factors, compute maximum demand, annual energy, and load factor.',
    keywords: ['demand load', 'demand factor', 'load factor', 'NEC 220', 'diversity'],
  },
};
