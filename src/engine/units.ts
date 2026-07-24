// Unit conversion framework
// All functions operate on a normalized base unit and return values in the chosen target unit.

import { HP_METRIC_TO_W, HP_TO_W, BTU_PER_H_TO_W, SQRT3 } from './constants';

export type UnitSystem = 'SI' | 'Imperial';

export interface Unit {
  id: string;
  label: string;
  symbol: string;
  system: UnitSystem | 'both';
  toBase: (v: number) => number;     // convert input value → base SI
  fromBase: (v: number) => number;   // convert base SI → this unit
}

export interface UnitGroup {
  id: string;
  label: string;
  base: string;     // id of the canonical base unit
  units: Unit[];
}

// Helper to create a linear unit: value * factor → base
const linear = (id: string, label: string, symbol: string, factor: number, system: UnitGroup['units'][number]['system']): Unit => ({
  id, label, symbol, system,
  toBase:   (v) => v * factor,
  fromBase: (v) => v / factor,
});

const offset = (id: string, label: string, symbol: string, offsetC: number, system: UnitGroup['units'][number]['system']): Unit => ({
  id, label, symbol, system,
  toBase:   (v) => v + 273.15 + offsetC,
  fromBase: (v) => v - 273.15 - offsetC,
});

export const UNIT_GROUPS: UnitGroup[] = [
  {
    id: 'voltage',
    label: 'Voltage',
    base: 'V',
    units: [
      linear('V',     'Volt',         'V',   1,                 'both'),
      linear('mV',    'Millivolt',    'mV',  0.001,             'both'),
      linear('kV',    'Kilovolt',     'kV',  1000,              'both'),
    ],
  },
  {
    id: 'current',
    label: 'Current',
    base: 'A',
    units: [
      linear('A',  'Ampere',   'A',  1,     'both'),
      linear('mA', 'Milliamp', 'mA', 0.001, 'both'),
      linear('kA', 'Kiloamp',  'kA', 1000,  'both'),
    ],
  },
  {
    id: 'power',
    label: 'Power',
    base: 'W',
    units: [
      linear('W',     'Watt',           'W',   1,            'both'),
      linear('kW',    'Kilowatt',       'kW',  1000,         'both'),
      linear('MW',    'Megawatt',       'MW',  1_000_000,    'both'),
      linear('mW',    'Milliwatt',      'mW',  0.001,        'both'),
      { id: 'hp',   label: 'Horsepower', symbol: 'hp',   system: 'Imperial',
        toBase: (v) => v * HP_TO_W,         fromBase: (v) => v / HP_TO_W },
      { id: 'hp_m', label: 'Metric HP',  symbol: 'PS',   system: 'both',
        toBase: (v) => v * HP_METRIC_TO_W,  fromBase: (v) => v / HP_METRIC_TO_W },
      linear('VA',    'Volt-ampere',    'VA',  1,            'both'),
      linear('kVA',   'Kilovolt-ampere','kVA', 1000,         'both'),
      linear('MVA',   'Megavolt-ampere','MVA', 1_000_000,    'both'),
      linear('var',   'Var',            'var', 1,            'both'),
      linear('kvar',  'Kilovar',        'kvar', 1000,        'both'),
      { id: 'btuh', label: 'BTU/h',      symbol: 'BTU/h', system: 'Imperial',
        toBase: (v) => v * BTU_PER_H_TO_W,  fromBase: (v) => v / BTU_PER_H_TO_W },
    ],
  },
  {
    id: 'energy',
    label: 'Energy',
    base: 'J',
    units: [
      linear('J',    'Joule',         'J',    1,          'both'),
      linear('kJ',   'Kilojoule',     'kJ',   1000,       'both'),
      linear('Wh',   'Watt-hour',     'Wh',   3600,       'both'),
      linear('kWh',  'Kilowatt-hour', 'kWh',  3_600_000,  'both'),
      linear('MWh',  'Megawatt-hour', 'MWh',  3.6e9,      'both'),
    ],
  },
  {
    id: 'resistance',
    label: 'Resistance / Impedance',
    base: 'ohm',
    units: [
      linear('ohm',  'Ohm',         'Ω',   1,     'both'),
      linear('kohm', 'Kilo-ohm',    'kΩ',  1000,  'both'),
      linear('Mohm', 'Mega-ohm',    'MΩ',  1e6,   'both'),
      linear('mohm', 'Milli-ohm',   'mΩ',  0.001, 'both'),
    ],
  },
  {
    id: 'frequency',
    label: 'Frequency',
    base: 'Hz',
    units: [
      linear('Hz',   'Hertz',     'Hz',  1,    'both'),
      linear('kHz',  'Kilohertz', 'kHz', 1000, 'both'),
    ],
  },
  {
    id: 'length',
    label: 'Length',
    base: 'm',
    units: [
      linear('m',    'Meter',      'm',   1,    'both'),
      linear('km',   'Kilometer',  'km',  1000, 'both'),
      linear('cm',   'Centimeter', 'cm',  0.01, 'both'),
      linear('mm',   'Millimeter', 'mm',  0.001,'both'),
      linear('ft',   'Foot',       'ft',  0.3048,'Imperial'),
      linear('in',   'Inch',       'in',  0.0254,'Imperial'),
    ],
  },
  {
    id: 'area',
    label: 'Cross-section',
    base: 'mm2',
    units: [
      linear('mm2',  'Square millimeter', 'mm²',  1,        'both'),
      linear('cm2',  'Square centimeter', 'cm²',  100,      'both'),
      linear('m2',   'Square meter',      'm²',   1e6,      'both'),
    ],
  },
  {
    id: 'temperature',
    label: 'Temperature',
    base: 'K',
    units: [
      offset('C', 'Celsius',    '°C', 0,    'both'),
      offset('F', 'Fahrenheit', '°F', -32,  'both'),
      { id: 'K', label: 'Kelvin', symbol: 'K', system: 'both', toBase: (v) => v, fromBase: (v) => v },
    ],
  },
  {
    id: 'time',
    label: 'Time',
    base: 's',
    units: [
      linear('s',   'Second',     's',   1,    'both'),
      linear('min', 'Minute',     'min', 60,   'both'),
      linear('h',   'Hour',       'h',   3600, 'both'),
      linear('ms',  'Millisecond','ms',  0.001,'both'),
    ],
  },
  {
    id: 'angle',
    label: 'Angle',
    base: 'rad',
    units: [
      { id: 'rad', label: 'Radian',     symbol: 'rad', system: 'both',
        toBase: (v) => v,             fromBase: (v) => v },
      { id: 'deg', label: 'Degree',     symbol: '°',   system: 'both',
        toBase: (v) => (v * Math.PI) / 180,
        fromBase: (v) => (v * 180) / Math.PI },
    ],
  },
  {
    id: 'efficiency',
    label: 'Efficiency',
    base: 'pct',
    units: [
      { id: 'pct', label: 'Percent', symbol: '%',   system: 'both',
        toBase: (v) => v / 100, fromBase: (v) => v * 100 },
      { id: 'dec', label: 'Decimal', symbol: '',    system: 'both',
        toBase: (v) => v,        fromBase: (v) => v },
    ],
  },
];

// Convenience lookups
const GROUP_BY_ID = new Map(UNIT_GROUPS.map((g) => [g.id, g]));
const UNIT_BY_KEY = new Map<string, { group: UnitGroup; unit: Unit }>();
for (const g of UNIT_GROUPS) {
  for (const u of g.units) UNIT_BY_KEY.set(`${g.id}:${u.id}`, { group: g, unit: u });
}

export function getUnitGroup(id: string): UnitGroup | undefined {
  return GROUP_BY_ID.get(id);
}

export function getUnit(groupId: string, unitId: string): Unit | undefined {
  return UNIT_BY_KEY.get(`${groupId}:${unitId}`)?.unit;
}

export function listUnitGroups(): UnitGroup[] {
  return UNIT_GROUPS;
}

export function listUnits(groupId: string): Unit[] {
  return getUnitGroup(groupId)?.units ?? [];
}

// Convert a value from one unit to another within the same group
export function convert(value: number, groupId: string, fromUnitId: string, toUnitId: string): number {
  if (fromUnitId === toUnitId) return value;
  const group = getUnitGroup(groupId);
  if (!group) return value;
  const from = getUnit(groupId, fromUnitId);
  const to   = getUnit(groupId, toUnitId);
  if (!from || !to) return value;
  return to.fromBase(from.toBase(value));
}

// Format a value in the chosen unit, including symbol
export function formatValue(
  value: number,
  groupId: string,
  unitId: string,
  precision = 2,
): string {
  const group = getUnitGroup(groupId);
  if (!group) return value.toFixed(precision);
  const unit = getUnit(groupId, unitId) ?? group.units.find((u) => u.id === group.base);
  if (!unit) return value.toFixed(precision);
  const converted = unit.fromBase(value);
  const n = formatNumber(converted, precision);
  return unit.symbol ? `${n} ${unit.symbol}` : n;
}

export function formatNumber(value: number, precision = 2): string {
  if (!Number.isFinite(value)) return '—';
  if (value === 0) return '0';
  const abs = Math.abs(value);
  if (abs >= 1_000_000 || abs < 0.001) {
    return value.toExponential(Math.max(0, precision - 1));
  }
  return value.toFixed(precision).replace(/\.?0+$/, '');
}

// Three-phase current from power: I = P / (√3 · V · PF)
export function threePhaseCurrent(P_w: number, V_ll: number, pf: number): number {
  return P_w / (SQRT3 * V_ll * pf);
}

// Single-phase current from power: I = P / (V · PF)
export function singlePhaseCurrent(P_w: number, V: number, pf: number): number {
  return P_w / (V * pf);
}
