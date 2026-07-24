// Standalone calculator test harness.
// Runs every calculator's `compute` function with hand-derived inputs and
// checks the results against expected values. No source files are modified.
//
// Run with:  node --experimental-strip-types tests/run-calculators.mts
// (or just:  node tests/run-calculators.mts  on Node 22+)

import { calc as singlePhase } from '../src/calculators/power/singlePhase.ts';
import { calc as threePhase } from '../src/calculators/power/threePhase.ts';
import { calc as current } from '../src/calculators/power/current.ts';
import { calc as powerFactor } from '../src/calculators/power/powerFactor.ts';
import { calc as pfCorrection } from '../src/calculators/power/pfCorrection.ts';
import { calc as kwKvaHp } from '../src/calculators/power/kwKvaHp.ts';
import { calc as demandLoad } from '../src/calculators/power/demandLoad.ts';
import { calc as voltageDrop } from '../src/calculators/cable/voltageDrop.ts';
import { calc as cableSizing } from '../src/calculators/cable/sizing.ts';
import { calc as cableDerating } from '../src/calculators/cable/derating.ts';
import { calc as shortCircuit } from '../src/calculators/cable/shortCircuit.ts';
import { calc as txSizing } from '../src/calculators/transformer/sizing.ts';
import { calc as txCurrent } from '../src/calculators/transformer/current.ts';
import { calc as txEfficiency } from '../src/calculators/transformer/efficiency.ts';
import { calc as motorFLC } from '../src/calculators/motor/flc.ts';
import { calc as motorStarting } from '../src/calculators/motor/starting.ts';
import { calc as motorVFD } from '../src/calculators/motor/vfd.ts';
import { calc as motorBreaker } from '../src/calculators/motor/breaker.ts';
import { calc as breaker } from '../src/calculators/protection/breaker.ts';
import { calc as fuse } from '../src/calculators/protection/fuse.ts';
import { calc as groundCond } from '../src/calculators/grounding/conductor.ts';
import { calc as groundRes } from '../src/calculators/grounding/resistance.ts';
import { calc as inverter } from '../src/calculators/renewable/inverter.ts';
import { calc as battery } from '../src/calculators/renewable/battery.ts';
import { calc as solarString } from '../src/calculators/renewable/string.ts';
import { calc as deltaWye } from '../src/calculators/threePhase/deltaWye.ts';
import { calc as balancedLoad } from '../src/calculators/threePhase/balancedLoad.ts';
import { calc as hpKw } from '../src/calculators/conversion/hpKw.ts';
import { calc as awgMm2 } from '../src/calculators/conversion/awgMm2.ts';

type Row = { label: string; value: number | string; unit?: string };
type Result = { rows: Row[]; raw: Record<string, unknown>; status?: string };

const tol = (expected: number, actual: number, rel = 0.005, abs = 0.05) => {
  if (!Number.isFinite(actual)) return false;
  return Math.abs(expected - actual) <= Math.max(abs, Math.abs(expected) * rel);
};

const findRow = (rows: Row[], labelIncludes: string) =>
  rows.find((r) => r.label.toLowerCase().includes(labelIncludes.toLowerCase()));

type TestResult = { name: string; pass: boolean; detail: string[] };
const results: TestResult[] = [];

const run = (
  name: string,
  def: { compute: (input: Record<string, unknown>) => Result },
  input: Record<string, unknown>,
  checks: { label: string; expected: number; rel?: number; abs?: number }[],
) => {
  const detail: string[] = [];
  let pass = true;
  try {
    const out = def.compute(input);
    for (const c of checks) {
      const row = findRow(out.rows, c.label);
      if (!row) {
        pass = false;
        detail.push(`  ✗ Row not found: "${c.label}"`);
        continue;
      }
      const actual = typeof row.value === 'number' ? row.value : NaN;
      const ok = tol(c.expected, actual, c.rel, c.abs);
      if (!ok) {
        pass = false;
        detail.push(`  ✗ ${row.label}: expected ${c.expected}, got ${actual}`);
      } else {
        detail.push(`  ✓ ${row.label} = ${actual} (exp ${c.expected})`);
      }
    }
  } catch (e) {
    pass = false;
    detail.push(`  ✗ Threw: ${(e as Error).message}`);
  }
  results.push({ name, pass, detail });
};

// ── power/threePhase (from V & I) ──────────────────────────────────────────
run(
  'three-phase · from V & I',
  threePhase,
  { Vll: 400, I: 50, pf: 0.88, mode: 'from_IV', P_or_S: 30, P_or_S_unit: 'kW' },
  [
    { label: 'Apparent power S', expected: 34.641 },
    { label: 'Real power P',     expected: 30.484 },
    { label: 'Reactive power Q', expected: 16.456 },
    { label: 'Line current I',   expected: 50 },
    { label: 'Phase voltage',    expected: 230.9 },
    { label: 'Phase angle',      expected: 28.36 },
  ],
);

// ── power/threePhase (from P, unit = kW) ──────────────────────────────────
run(
  'three-phase · from P (kW)',
  threePhase,
  { Vll: 400, I: 50, pf: 0.88, mode: 'from_P', P_or_S: 30, P_or_S_unit: 'kW' },
  [
    { label: 'Real power P',      expected: 30.0 },
    { label: 'Apparent power S',  expected: 34.091 },
    { label: 'Reactive power Q',  expected: 16.193 },
    { label: 'Line current I',    expected: 49.2 },
  ],
);

// ── power/threePhase (from S, unit = kVA) ─────────────────────────────────
run(
  'three-phase · from S (kVA)',
  threePhase,
  { Vll: 400, I: 50, pf: 0.88, mode: 'from_S', P_or_S: 40, P_or_S_unit: 'kVA' },
  [
    { label: 'Apparent power S', expected: 40.0 },
    { label: 'Real power P',     expected: 35.2 },
    { label: 'Reactive power Q', expected: 19.0 },
    { label: 'Line current I',   expected: 57.74 },
  ],
);

// ── power/singlePhase ──────────────────────────────────────────────────────
run(
  'single-phase',
  singlePhase,
  { V: 230, I: 20, pf: 0.9, phiUnit: 'leading' },
  [
    { label: 'Apparent power S', expected: 4600 },
    { label: 'Real power P',     expected: 4140 },
    { label: 'Reactive power Q', expected: 2005 },
    { label: 'Phase angle',      expected: 25.84 },
  ],
);

// ── power/current (3φ) ────────────────────────────────────────────────────
run(
  'current · 3φ',
  current,
  { phase: '3', V: 400, P: 30, pf: 0.9, eff: 1 },
  [
    { label: 'Apparent power S', expected: 33.333 },
    { label: 'Line current I',   expected: 48.11 },
  ],
);

// ── power/current (1φ) ────────────────────────────────────────────────────
run(
  'current · 1φ',
  current,
  { phase: '1', V: 230, P: 5, pf: 0.95, eff: 1 },
  [
    { label: 'Apparent power S', expected: 5.263 },
    { label: 'Line current I',   expected: 22.88 },
  ],
);

// ── power/powerFactor (from P & S) ────────────────────────────────────────
run(
  'power-factor · from P & S',
  powerFactor,
  { mode: 'from_PS', P: 30, S: 35, Q: 18, phi: 28 },
  [
    { label: 'Power factor', expected: 0.857 },
    { label: 'Phase angle',  expected: 31.0 },
  ],
);

// ── power/powerFactor (from P & Q) ────────────────────────────────────────
run(
  'power-factor · from P & Q',
  powerFactor,
  { mode: 'from_PQ', P: 30, S: 35, Q: 18, phi: 28 },
  [
    { label: 'Power factor', expected: 0.857 },
    { label: 'Phase angle',  expected: 31.0 },
  ],
);

// ── power/powerFactor (from angle) ────────────────────────────────────────
run(
  'power-factor · from angle',
  powerFactor,
  { mode: 'from_angle', P: 30, S: 35, Q: 18, phi: 30 },
  [
    { label: 'Power factor', expected: 0.866 },
    { label: 'Phase angle',  expected: 30 },
  ],
);

// ── power/pfCorrection ─────────────────────────────────────────────────────
run(
  'PF correction',
  pfCorrection,
  { P: 200, pf1: 0.72, pf2: 0.95, V: 400, ph: '3' },
  [
    { label: 'Capacitor bank Qc', expected: 127.0 },
    { label: 'Current before',    expected: 400.9 },
    { label: 'Current after',     expected: 303.9 },
    { label: 'Released capacity', expected: 24.2 },
  ],
);

// ── power/kwKvaHp ──────────────────────────────────────────────────────────
run(
  'kW / kVA / HP',
  kwKvaHp,
  { value: 50, pf: 0.9 },
  [
    { label: 'W',   expected: 50000 },
    { label: 'kW',  expected: 50 },
    { label: 'kVA', expected: 55.556 },
    { label: 'HP',  expected: 67.05 },
    { label: 'PS',  expected: 67.98 },
    { label: 'MW',  expected: 0.05 },
    { label: 'VAr', expected: 24208 },
  ],
);

// ── power/demandLoad ──────────────────────────────────────────────────────
run(
  'demand load',
  demandLoad,
  {
    loads: '[{"name":"Lighting","qty":120,"unit":0.06,"df":0.9},{"name":"HVAC","qty":2,"unit":15,"df":0.7},{"name":"Receptacles","qty":40,"unit":0.18,"df":0.4},{"name":"Motors","qty":4,"unit":7.5,"df":0.8}]',
    hoursPerYear: 4500,
  },
  [
    { label: 'Connected load',  expected: 74.4 },
    { label: 'Maximum demand',  expected: 54.36 },
    { label: 'Annual energy',   expected: 244.62 },
    { label: 'Average demand',  expected: 27.93 },
    { label: 'Load factor',     expected: 51.4 },
  ],
);

// ── cable/voltageDrop ──────────────────────────────────────────────────────
run(
  'voltage drop · 3φ Cu XLPE 25 mm²',
  voltageDrop,
  { V: 400, ph: '3', I: 60, L: 80, mat: 'Cu', size: 25, pf: 0.88, T: 70 },
  [
    { label: 'Voltage drop ΔU',  expected: 6.35 },
    { label: 'Resistance R',     expected: 0.066 },
    { label: 'Reactance X',      expected: 0.006 },
    { label: 'Voltage at load',  expected: 393.65 },
  ],
);
// % drop row has label identical to a substring of the ΔU label, so do it manually
(() => {
  const out = voltageDrop.compute({ V: 400, ph: '3', I: 60, L: 80, mat: 'Cu', size: 25, pf: 0.88, T: 70 });
  const row = out.rows.find((r) => r.unit === '%' && r.label.toLowerCase().includes('drop'));
  const pass = row ? Math.abs((row.value as number) - 1.59) < 0.01 : false;
  results.push({
    name: 'voltage drop · Vd% row',
    pass,
    detail: [pass ? `  ✓ Vd% = ${row!.value} (exp 1.59)` : `  ✗ Vd% row not found or wrong`],
  });
})();

// ── cable/sizing ──────────────────────────────────────────────────────────
run(
  'cable sizing · Cu XLPE C cont',
  cableSizing,
  { IB: 60, ins: 'XLPE', method: 'C', mat: 'Cu', Ta: 30, grp: 1, soil: 1.0, duty: 'cont' },
  [
    { label: 'Continuous-load factor', expected: 1.25 },
    { label: 'Required I_n',           expected: 75 },
    { label: 'Temperature factor',     expected: 1.0 },
    { label: 'Grouping factor',        expected: 1.0 },
    { label: 'Soil derate',            expected: 1.05 },
    { label: 'Required I_z',           expected: 71.4 },
    { label: 'Selected size',          expected: 10 },
    { label: 'Recommended OCPD',       expected: 80 },
  ],
);

// ── cable/derating ─────────────────────────────────────────────────────────
run(
  'cable derating · XLPE 25 mm² C 40°C g=4',
  cableDerating,
  { size: 25, ins: 'XLPE', method: 'C', Ta: 40, grp: 4, soil: 1.0 },
  [
    { label: 'Temperature factor',  expected: 0.91 },
    { label: 'Grouping factor',     expected: 0.77 },
    { label: 'Soil factor',         expected: 1.05 },
    { label: 'Combined derate',     expected: 0.736 },
    { label: 'Base ampacity',       expected: 135 },
    { label: 'Final ampacity',      expected: 99.3 },
  ],
);

// ── cable/shortCircuit ─────────────────────────────────────────────────────
run(
  'short-circuit · Cu XLPE 25 mm² I²t',
  shortCircuit,
  { Isc: 10000, S: 25, mat: 'Cu', ins: 'XLPE', t: 0.4, I2t_dev: 60000 },
  [
    { label: 'Material constant k',  expected: 143 },
    { label: 'Cable I²t withstand',  expected: 12.781 },
  ],
);

// ── transformer/sizing ────────────────────────────────────────────────────
run(
  'transformer sizing · 180 kW 400 V',
  txSizing,
  { P: 180, pf: 0.9, df: 0.85, grow: 20, Vll: 400, eff: 0.98, ph: '3' },
  [
    { label: 'Required apparent',  expected: 204 },
    { label: 'Adjusted for losses', expected: 208.16 },
    { label: 'Standard size',      expected: 225 },
    { label: 'Loading at full',    expected: 90.7 },
    { label: 'Secondary current',  expected: 324.8 },
  ],
);

// ── transformer/current ────────────────────────────────────────────────────
run(
  'transformer current · 500 kVA 11kV/400V',
  txCurrent,
  { S: 500, V1: 11000, V2: 400, Z: 6, ph: '3' },
  [
    { label: 'Primary current',   expected: 26.24 },
    { label: 'Secondary current', expected: 721.69 },
    { label: 'Turns ratio',       expected: 27.5 },
    { label: 'Short-circuit I_sc', expected: 12028 },
    { label: 'Short-circuit MVA', expected: 8.33 },
  ],
);

// ── transformer/efficiency ────────────────────────────────────────────────
run(
  'transformer efficiency · 1 MVA 75% load',
  txEfficiency,
  { S: 1000, P0: 1.1, Pk: 10.5, load: 75, pf: 0.9 },
  [
    { label: 'Output P_out',     expected: 675 },
    { label: 'No-load loss P',   expected: 1.1 },
    { label: 'Load loss Pk',     expected: 5.906 },
    { label: 'Total losses',     expected: 7.006 },
    { label: 'Efficiency',       expected: 98.97 },
    { label: 'Max-efficiency loading', expected: 32.4 },
  ],
);

// ── motor/flc ──────────────────────────────────────────────────────────────
run(
  'motor FLC · 15 kW 400 V 3φ calc',
  motorFLC,
  { P: 15, V: 400, ph: '3', pf: 0.88, eff: 0.91, standard: 'calc' },
  [
    { label: 'Full-load current', expected: 27.06 },
    { label: 'Direct calculation', expected: 27.06 },
    { label: 'Recommended OCPD',  expected: 70 },
  ],
);

// ── motor/starting (DOL) ───────────────────────────────────────────────────
run(
  'motor starting · DOL 28 A ×6',
  motorStarting,
  { I: 28, lr: 6, method: 'dol', autoPct: 65, V: 400, Ssc: 25 },
  [
    { label: 'Locked-rotor current', expected: 168 },
    { label: 'Starting current',     expected: 168 },
    { label: 'Voltage dip',          expected: 0.16 },
  ],
);

// ── motor/starting (Y-Δ) ───────────────────────────────────────────────────
run(
  'motor starting · star-delta 28 A',
  motorStarting,
  { I: 28, lr: 6, method: 'ysd', autoPct: 65, V: 400, Ssc: 25 },
  [
    { label: 'Starting current', expected: 56 },
  ],
);

// ── motor/vfd ──────────────────────────────────────────────────────────────
run(
  'VFD sizing · 28 A 400 V 3φ no derate',
  motorVFD,
  { I: 28, V: 400, ph: '3', duty: 'VT', Ta: 40, alt: 1000, fc: 4 },
  [
    { label: 'Duty factor',   expected: 1.0 },
    { label: 'Temp derate',   expected: 1.0 },
    { label: 'Altitude derate', expected: 1.0 },
    { label: 'Carrier derate', expected: 1.0 },
    { label: 'Worst derate',  expected: 1.0 },
    { label: 'Required VFD current', expected: 28 },
    { label: 'Required VFD power',  expected: 19.4 },
  ],
);

// ── motor/breaker ──────────────────────────────────────────────────────────
run(
  'motor breaker · 28 A inverse-time',
  motorBreaker,
  { I: 28, type: 'inv', poles: '3' },
  [
    { label: 'Protection factor', expected: 2.5 },
    { label: 'Target OCPD',       expected: 70 },
    { label: 'Selected OCPD',     expected: 80 },
  ],
);

// ── protection/breaker ────────────────────────────────────────────────────
run(
  'breaker sizing · 50 cont + 20 non',
  breaker,
  { Icont: 50, Inon: 20, system: 'LV' },
  [
    { label: 'Total (NEC 80% rule)', expected: 82.5 },
    { label: 'OCPD (next std)',     expected: 100 },
  ],
);

// ── protection/fuse ───────────────────────────────────────────────────────
run(
  'fuse sizing · 25 cont + 8 non TD',
  fuse,
  { Icont: 25, Inon: 8, type: 'TD', inrush: 5 },
  [
    { label: 'Multiplier',       expected: 1.15 },
    { label: 'Computed minimum', expected: 36.75 },
    { label: 'Recommended fuse', expected: 40 },
  ],
);

// ── grounding/conductor ────────────────────────────────────────────────────
run(
  'earthing conductor · Cu PVC 4500 A 0.5 s',
  groundCond,
  { Isc: 4500, t: 0.5, mat: 'Cu', ins: 'PVC' },
  [
    { label: 'k coefficient',  expected: 115 },
    { label: 'Computed S',     expected: 27.67 },
    { label: 'Next standard',  expected: 35 },
  ],
);

// ── grounding/resistance ──────────────────────────────────────────────────
run(
  'ground resistance · 4 rods 100 Ω·m',
  groundRes,
  { type: 'rod', rho: 100, L: 2.4, d: 0.016, W: 0.6, A: 1, n: 4, s: 3 },
  [
    { label: 'Single electrode', expected: 42.43 },
    { label: 'Multi-rod',        expected: 13.26 },
  ],
);

// ── renewable/inverter ────────────────────────────────────────────────────
run(
  'solar inverter · 12 kWp DC/AC 1.15',
  inverter,
  { Pdc: 12, ratio: 1.15, Vmp: 200, Voc: 600, ph: '1' },
  [
    { label: 'Inverter AC', expected: 10.43 },
  ],
);

// ── renewable/battery ─────────────────────────────────────────────────────
run(
  'battery runtime · 10 kWh · 1.5 kW · DoD 80% · 90% eff',
  battery,
  { E: 10, dod: 80, P: 1.5, eta: 90, age: 0 },
  [
    { label: 'Usable energy', expected: 8 },
    { label: 'Runtime',       expected: 4.8 },
  ],
);

// ── renewable/string ──────────────────────────────────────────────────────
run(
  'solar string · 41 Vmp / 49 Voc',
  solarString,
  { Vmp_mod: 41, Voc_mod: 49, Tc_min: -10, Tc_max: 70, Vmppt_min: 200, Vmppt_max: 800, Vinv_max: 1000 },
  [
    { label: 'Vmp at hot',     expected: 34.54 },
    { label: 'Voc at cold',    expected: 55.0 },
    { label: 'Min modules',    expected: 6 },
    { label: 'Max modules',    expected: 18 },
  ],
);

// ── threePhase/deltaWye ────────────────────────────────────────────────────
run(
  'delta-wye · Y V L→P',
  deltaWye,
  { system: 'wye', quantity: 'V', direction: 'L2P', value: 400 },
  [{ label: 'phase', expected: 230.94 }],
);
run(
  'delta-wye · Y V P→L',
  deltaWye,
  { system: 'wye', quantity: 'V', direction: 'P2L', value: 230 },
  [{ label: 'line', expected: 398.37 }],
);
run(
  'delta-wye · Δ I L→P',
  deltaWye,
  { system: 'delta', quantity: 'I', direction: 'L2P', value: 100 },
  [{ label: 'phase', expected: 57.74 }],
);
run(
  'delta-wye · Y I L→P (1:1)',
  deltaWye,
  { system: 'wye', quantity: 'I', direction: 'L2P', value: 50 },
  [{ label: 'phase', expected: 50 }],
);

// ── threePhase/balancedLoad ───────────────────────────────────────────────
run(
  'balanced load · Y 400 V Z=10 ∠30°',
  balancedLoad,
  { system: 'wye', Vll: 400, Z: 10, phi: 30 },
  [
    { label: 'Phase voltage', expected: 230.94 },
    { label: 'Phase current', expected: 23.09 },
    { label: 'Line current',  expected: 23.09 },
    { label: 'Total apparent', expected: 16 },
    { label: 'Total real',     expected: 13.856 },
    { label: 'Total reactive', expected: 8 },
  ],
);
run(
  'balanced load · Δ 400 V Z=10 ∠30°',
  balancedLoad,
  { system: 'delta', Vll: 400, Z: 10, phi: 30 },
  [
    { label: 'Phase voltage', expected: 400 },
    { label: 'Phase current', expected: 40 },
    { label: 'Line current',  expected: 69.28 },
    { label: 'Total apparent', expected: 48 },
    { label: 'Total real',     expected: 41.569 },
    { label: 'Total reactive', expected: 24 },
  ],
);

// ── conversion/hpKw ────────────────────────────────────────────────────────
run(
  'HP → kW · 10 hp',
  hpKw,
  { value: 10, from: 'hp', to: 'kW' },
  [{ label: 'Output', expected: 7.457 }],
);
run(
  'kW → HP · 10 kW',
  hpKw,
  { value: 10, from: 'kW', to: 'hp' },
  [{ label: 'Output', expected: 13.41 }],
);

// ── conversion/awgMm2 ──────────────────────────────────────────────────────
run(
  'AWG ↔ mm² · 25 mm² → AWG',
  awgMm2,
  { mode: 'mm2toAWG', value: 25 },
  [{ label: 'mm²', expected: 21.1 }],
);

// ── Report ────────────────────────────────────────────────────────────────
const passed = results.filter((r) => r.pass).length;
const failed = results.length - passed;

console.log('');
console.log('═'.repeat(78));
console.log(`  Calculator accuracy test · ${passed}/${results.length} pass · ${failed} fail`);
console.log('═'.repeat(78));
for (const r of results) {
  console.log('');
  console.log(`${r.pass ? '✅' : '❌'}  ${r.name}`);
  for (const d of r.detail) console.log(d);
}
console.log('');
console.log('═'.repeat(78));
console.log(`  ${passed} pass · ${failed} fail · ${results.length} total`);
console.log('═'.repeat(78));

process.exit(failed === 0 ? 0 : 1);
