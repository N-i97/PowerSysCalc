// Independent calculator accuracy test (separate from run-calculators.mts).
// Uses fresh inputs and hand-derived expected values.
// Run via:  node_modules/.bin/esbuild tests/independent-test.mts --bundle --platform=node --format=esm --outfile=/tmp/independent-test.mjs && node /tmp/independent-test.mjs
// (No source files are modified.)

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

const tol = (expected: number, actual: number, rel = 0.005, abs = 0.01) => {
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
        detail.push(`  ✗ ${row.label}: expected ≈ ${c.expected}, got ${actual}`);
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

// ── three-phase: V=480, I=75, pf=0.85 ─────────────────────────────────────
run('3φ · 480V 75A 0.85 PF (V&I mode)',
  threePhase,
  { Vll: 480, I: 75, pf: 0.85, mode: 'from_IV', P_or_S: 50, P_or_S_unit: 'kW' },
  [
    { label: 'Apparent power S',   expected: 62.354 },  // √3·480·75 = 62353.8
    { label: 'Real power P',       expected: 53.001 },  // 62353.8·0.85
    { label: 'Reactive power Q',   expected: 32.848 },  // 62353.8·sin(acos 0.85)
    { label: 'Line current I',     expected: 75 },
    { label: 'Phase voltage',      expected: 277.13 },  // 480/√3
    { label: 'Phase angle',        expected: 31.79 },   // acos(0.85)°
  ],
);

// ── three-phase: from P = 50 kW ───────────────────────────────────────────
run('3φ · 480V from P=50kW 0.85 PF',
  threePhase,
  { Vll: 480, I: 75, pf: 0.85, mode: 'from_P', P_or_S: 50, P_or_S_unit: 'kW' },
  [
    { label: 'Real power P',       expected: 50.0 },
    { label: 'Apparent power S',   expected: 58.824 },  // 50/0.85
    { label: 'Line current I',     expected: 70.755 },  // 58823.5/(√3·480)
  ],
);

// ── three-phase: from S = 50 kVA ──────────────────────────────────────────
run('3φ · 480V from S=50kVA 0.85 PF',
  threePhase,
  { Vll: 480, I: 75, pf: 0.85, mode: 'from_S', P_or_S: 50, P_or_S_unit: 'kVA' },
  [
    { label: 'Apparent power S',   expected: 50.0 },
    { label: 'Real power P',       expected: 42.5 },
    { label: 'Line current I',     expected: 60.142 },  // 50000/(√3·480)
  ],
);

// ── single-phase: 240 V 15 A 0.85 PF ──────────────────────────────────────
run('1φ · 240V 15A 0.85 PF',
  singlePhase,
  { V: 240, I: 15, pf: 0.85, phiUnit: 'lagging' },
  [
    { label: 'Apparent power S',   expected: 3600 },
    { label: 'Real power P',       expected: 3060 },
    { label: 'Reactive power Q',   expected: 1896.4 },  // 3600·sin(acos 0.85)
    { label: 'Power factor',       expected: 0.85 },
    { label: 'Phase angle',        expected: 31.79 },
  ],
);

// ── current: 3φ 480V 50kW 0.9pf 0.95eff ───────────────────────────────────
run('Current · 3φ 480V 50kW 0.9 PF 0.95 η',
  current,
  { phase: '3', V: 480, P: 50, pf: 0.9, eff: 0.95 },
  [
    { label: 'Apparent power S',   expected: 58.480 },  // 50/(0.9·0.95)
    { label: 'Line current I',     expected: 70.337 },  // 58479.5/(√3·480)
  ],
);

// ── current: 1φ 240V 3kW 0.8pf ───────────────────────────────────────────
run('Current · 1φ 240V 3kW 0.8 PF',
  current,
  { phase: '1', V: 240, P: 3, pf: 0.8, eff: 1 },
  [
    { label: 'Apparent power S',   expected: 3.75 },
    { label: 'Line current I',     expected: 15.625 },  // 3750/240
  ],
);

// ── power factor: from P=40 S=50 ──────────────────────────────────────────
run('PF · P=40kW S=50kVA',
  powerFactor,
  { mode: 'from_PS', P: 40, S: 50, Q: 30, phi: 36 },
  [
    { label: 'Power factor',       expected: 0.8 },
    { label: 'Phase angle',        expected: 36.87 },
  ],
);

// ── power factor: from P=40 Q=30 ──────────────────────────────────────────
run('PF · P=40kW Q=30kVAr',
  powerFactor,
  { mode: 'from_PQ', P: 40, S: 50, Q: 30, phi: 36 },
  [
    { label: 'Power factor',       expected: 0.8 },     // 40/√(1600+900)
    { label: 'Phase angle',        expected: 36.87 },
  ],
);

// ── power factor: from φ=60° ──────────────────────────────────────────────
run('PF · φ=60°',
  powerFactor,
  { mode: 'from_angle', P: 40, S: 50, Q: 30, phi: 60 },
  [
    { label: 'Power factor',       expected: 0.5 },     // cos(60°)
    { label: 'Phase angle',        expected: 60 },
  ],
);

// ── PF correction: 100kW 0.7→0.9 400V 3φ ─────────────────────────────────
run('PF correction · 100kW 0.7→0.9 400V 3φ',
  pfCorrection,
  { P: 100, pf1: 0.7, pf2: 0.9, V: 400, ph: '3' },
  [
    { label: 'Capacitor bank Qc',  expected: 53.587 },  // 100·(tan φ1−tan φ2)
    { label: 'Current before',     expected: 206.20 },  // 142857.1/(√3·400)
    { label: 'Current after',      expected: 160.37 },  // 111111.1/(√3·400)
    { label: 'Released capacity',  expected: 22.23 },
  ],
);

// ── kW/kVA/HP: 75kW 0.85pf ────────────────────────────────────────────────
run('kW/kVA/HP · 75kW @ 0.85 PF',
  kwKvaHp,
  { value: 75, pf: 0.85 },
  [
    { label: 'W',                  expected: 75000 },
    { label: 'kW',                 expected: 75 },
    { label: 'kVA',                expected: 88.235 },  // 75/0.85
    { label: 'HP',                 expected: 100.572 }, // 75000/745.7
    { label: 'PS',                 expected: 101.97 },  // 75000/735.5
    { label: 'MW',                 expected: 0.075 },
    { label: 'VAr',                expected: 46489.7 },
  ],
);

// ── demand load: 3 groups, 6000h/yr ───────────────────────────────────────
run('Demand load · 3 groups, 6000 h/yr',
  demandLoad,
  {
    loads: '[{"name":"Lighting","qty":50,"unit":0.1,"df":1.0},{"name":"HVAC","qty":10,"unit":2.5,"df":0.8},{"name":"Pumps","qty":5,"unit":5,"df":0.6}]',
    hoursPerYear: 6000,
  },
  [
    { label: 'Connected load',     expected: 55.0 },    // 5+25+25
    { label: 'Maximum demand',     expected: 40.0 },    // 5+20+15
    { label: 'Annual energy',      expected: 240.0 },   // 40·6000/1000
    { label: 'Average demand',     expected: 27.40 },   // 240000/8760
    { label: 'Load factor',        expected: 68.5 },
  ],
);

// ── voltage drop: 3φ Cu XLPE 16mm² 400V 80A 50m @ 90°C, 0.9 PF ───────────
run('Vd · 3φ Cu XLPE 16mm² 400V 80A 50m 90°C 0.9',
  voltageDrop,
  { V: 400, ph: '3', I: 80, L: 50, mat: 'Cu', size: 16, pf: 0.9, T: 90 },
  [
    { label: 'Voltage drop ΔU',    expected: 8.81 },
    { label: 'Resistance R',       expected: 0.0687 },
    { label: 'Reactance X',        expected: 0.004 },
    { label: 'Voltage at load',    expected: 391.19 },
  ],
);

// ── voltage drop: 1φ Cu PVC 4mm² 230V 20A 30m @ 30°C pf=1 ────────────────
run('Vd · 1φ Cu PVC 4mm² 230V 20A 30m 30°C pf=1',
  voltageDrop,
  { V: 230, ph: '1', I: 20, L: 30, mat: 'Cu', size: 4, pf: 1, T: 30 },
  [
    { label: 'Voltage drop ΔU',    expected: 5.38 },
    { label: 'Voltage at load',    expected: 224.62 },
  ],
);

// ── cable sizing: 100A Cu XLPE F 30°C g=2 cont ────────────────────────────
run('Cable sizing · 100A Cu XLPE F 30°C g=2 cont',
  cableSizing,
  { IB: 100, ins: 'XLPE', method: 'F', mat: 'Cu', Ta: 30, grp: 2, soil: 1.0, duty: 'cont' },
  [
    { label: 'Continuous-load factor', expected: 1.25 },
    { label: 'Required I_n',           expected: 125 },
    { label: 'Temperature factor',     expected: 1.0 },
    { label: 'Grouping factor',        expected: 0.88 },
    { label: 'Soil derate',            expected: 1.05 },
    { label: 'Required I_z',           expected: 135.28 },
    { label: 'Selected size',          expected: 25 },   // XLPE F: 16→115 too low, 25→149 OK
    { label: 'Recommended OCPD',       expected: 125 },
  ],
);

// ── cable derating: PVC 10mm² C 45°C g=3 ─────────────────────────────────
run('Cable derating · PVC 10mm² C 45°C g=3',
  cableDerating,
  { size: 10, ins: 'PVC', method: 'C', Ta: 45, grp: 3, soil: 1.0 },
  [
    { label: 'Temperature factor',  expected: 0.79 },
    { label: 'Grouping factor',     expected: 0.82 },
    { label: 'Soil factor',         expected: 1.05 },
    { label: 'Combined derate',     expected: 0.680 },
    { label: 'Base ampacity',       expected: 67 },
    { label: 'Final ampacity',      expected: 45.57 },
  ],
);

// ── short-circuit: Cu PVC 50mm² Isc=5kA t=0.5s ───────────────────────────
run('SC · Cu PVC 50mm² Isc=5kA t=0.5s',
  shortCircuit,
  { Isc: 5000, S: 50, mat: 'Cu', ins: 'PVC', t: 0.5, I2t_dev: 0 },
  [
    { label: 'Material constant k',  expected: 115 },
    { label: 'Cable I²t withstand',  expected: 33.063 },  // (115·50)²/1e6
  ],
);

// ── transformer sizing: 100kW 0.85pf 0.9df 25% 400V 0.98eff 3φ ──────────
run('TX sizing · 100kW 0.85PF 0.9DF 25% 400V η=0.98',
  txSizing,
  { P: 100, pf: 0.85, df: 0.9, grow: 25, Vll: 400, eff: 0.98, ph: '3' },
  [
    { label: 'Required apparent',  expected: 132.353 },  // (100/0.85)·0.9·1.25
    { label: 'Adjusted for losses', expected: 135.054 },  // 132.353/0.98
    { label: 'Standard size',      expected: 150 },
    { label: 'Loading at full',    expected: 88.24 },
    { label: 'Secondary current',  expected: 216.51 },
  ],
);

// ── transformer current: 250kVA 11kV/400V Z=5% 3φ ────────────────────────
run('TX current · 250kVA 11kV/400V Z=5% 3φ',
  txCurrent,
  { S: 250, V1: 11000, V2: 400, Z: 5, ph: '3' },
  [
    { label: 'Primary current',   expected: 13.12 },
    { label: 'Secondary current', expected: 360.84 },
    { label: 'Turns ratio',       expected: 27.5 },
    { label: 'Short-circuit I_sc', expected: 7216.9 },
    { label: 'Short-circuit MVA', expected: 5.0 },
  ],
);

// ── transformer efficiency: 500kVA P0=1.0kW Pk=7.5kW 80%load 0.95pf ─────
run('TX efficiency · 500kVA P0=1.0 Pk=7.5 80% 0.95PF',
  txEfficiency,
  { S: 500, P0: 1.0, Pk: 7.5, load: 80, pf: 0.95 },
  [
    { label: 'Output P_out',     expected: 380.0 },
    { label: 'No-load loss P',   expected: 1.0 },
    { label: 'Load loss Pk',     expected: 4.8 },        // 7.5·0.64
    { label: 'Total losses',     expected: 5.8 },
    { label: 'Efficiency',       expected: 98.50 },
    { label: 'Max-efficiency loading', expected: 36.51 },
  ],
);

// ── motor FLC: 22kW 400V 3φ 0.88pf 0.92η calc ───────────────────────────
run('Motor FLC · 22kW 400V 3φ 0.88PF 0.92η (calc)',
  motorFLC,
  { P: 22, V: 400, ph: '3', pf: 0.88, eff: 0.92, standard: 'calc' },
  [
    { label: 'Full-load current', expected: 39.20 },
    { label: 'Direct calculation', expected: 39.20 },
    { label: 'Recommended OCPD',  expected: 100 },
  ],
);

// ── motor starting DOL: 42A ×6.5 400V 20MVA ─────────────────────────────
run('Motor start · DOL 42A LR=6.5 400V 20MVA',
  motorStarting,
  { I: 42, lr: 6.5, method: 'dol', autoPct: 65, V: 400, Ssc: 20 },
  [
    { label: 'Locked-rotor current', expected: 273.0 },
    { label: 'Starting current',     expected: 273.0 },
    { label: 'Voltage dip',          expected: 0.3 },  // 0.3152% → 1-decimal = 0.3
  ],
);

// ── motor starting star-delta: 42A ×6.5 ─────────────────────────────────
run('Motor start · Y-Δ 42A LR=6.5',
  motorStarting,
  { I: 42, lr: 6.5, method: 'ysd', autoPct: 65, V: 400, Ssc: 20 },
  [
    { label: 'Locked-rotor current', expected: 273.0 },
    { label: 'Starting current',     expected: 91.0 },   // 273/3
  ],
);

// ── VFD sizing: 42A 400V 3φ CT 50°C 2000m 8kHz ──────────────────────────
run('VFD · 42A 400V 3φ CT 50°C 2000m 8kHz',
  motorVFD,
  { I: 42, V: 400, ph: '3', duty: 'CT', Ta: 50, alt: 2000, fc: 8 },
  [
    { label: 'Duty factor',   expected: 1.05 },
    { label: 'Temp derate',   expected: 0.8 },
    { label: 'Altitude derate', expected: 0.9 },
    { label: 'Carrier derate', expected: 0.9 },
    { label: 'Worst derate',  expected: 0.8 },
    { label: 'Required VFD current', expected: 52.5 },
    { label: 'Required VFD power',  expected: 36.37 },
  ],
);

// ── motor breaker: 42A inverse-time ──────────────────────────────────────
run('Motor breaker · 42A inverse-time',
  motorBreaker,
  { I: 42, type: 'inv', poles: '3' },
  [
    { label: 'Protection factor', expected: 2.5 },
    { label: 'Target OCPD',       expected: 105 },
    { label: 'Selected OCPD',     expected: 125 },
  ],
);

// ── breaker sizing: 30 cont + 12 non ─────────────────────────────────────
run('Breaker · 30 cont + 12 non',
  breaker,
  { Icont: 30, Inon: 12, system: 'LV' },
  [
    { label: 'Total (NEC 80% rule)', expected: 49.5 },
    { label: 'OCPD (next std)',     expected: 50 },
  ],
);

// ── fuse sizing: 18 cont + 4 non TD ──────────────────────────────────────
run('Fuse · 18 cont + 4 non TD',
  fuse,
  { Icont: 18, Inon: 4, type: 'TD', inrush: 5 },
  [
    { label: 'Multiplier',       expected: 1.15 },
    { label: 'Computed minimum', expected: 24.7 },
    { label: 'Recommended fuse', expected: 25 },
  ],
);

// ── earthing conductor: 3000A 0.3s Cu XLPE ──────────────────────────────
run('Earth cond · Cu XLPE 3000A 0.3s',
  groundCond,
  { Isc: 3000, t: 0.3, mat: 'Cu', ins: 'XLPE' },
  [
    { label: 'k coefficient',  expected: 143 },
    { label: 'Computed S',     expected: 11.49 },   // 3000·√0.3/143
    { label: 'Next standard',  expected: 16 },
  ],
);

// ── ground resistance: 6 rods ρ=200 L=3.0 d=0.02 s=2 ─────────────────────
run('Ground R · 6 rods ρ=200 L=3.0 d=0.02 s=2',
  groundRes,
  { type: 'rod', rho: 200, L: 3.0, d: 0.02, W: 0.6, A: 1, n: 6, s: 2 },
  [
    { label: 'Single electrode', expected: 67.87 },
    { label: 'Multi-rod',        expected: 16.62 },
  ],
);

// ── solar inverter: 20kWp DC/AC 1.2 ─────────────────────────────────────
run('Solar inverter · 20kWp DC/AC 1.2',
  inverter,
  { Pdc: 20, ratio: 1.2, Vmp: 300, Voc: 800, ph: '3' },
  [
    { label: 'PV DC power',  expected: 20.0 },
    { label: 'DC/AC ratio',  expected: 1.2 },
    { label: 'Inverter AC',  expected: 16.67 },
  ],
);

// ── battery: 15kWh · 2kW · 80%DoD · 92%η · 10% aging ─────────────────────
run('Battery · 15kWh 2kW 80%DoD 92%η 10% aging',
  battery,
  { E: 15, dod: 80, P: 2.0, eta: 92, age: 10 },
  [
    { label: 'Usable energy', expected: 10.8 },
    { label: 'Runtime',       expected: 4.97 },
  ],
);

// ── solar string: 37Vmp/45Voc, -15 to +75°C, 250–600V MPPT, 900V inv max
run('Solar string · 37Vmp/45Voc -15..75°C MPPT 250-600 inv 900',
  solarString,
  { Vmp_mod: 37, Voc_mod: 45, Tc_min: -15, Tc_max: 75, Vmppt_min: 250, Vmppt_max: 600, Vinv_max: 900 },
  [
    { label: 'Vmp at hot',     expected: 30.53 },
    { label: 'Voc at cold',    expected: 51.3 },
    { label: 'Min modules',    expected: 9 },
    { label: 'Max modules',    expected: 17 },  // row = Nmax_voc = ⌊900/51.3⌋ = 17
  ],
);

// ── delta-wye: Y V L→P 480V ──────────────────────────────────────────────
run('Δ-Y · Y V L→P 480V',
  deltaWye,
  { system: 'wye', quantity: 'V', direction: 'L2P', value: 480 },
  [{ label: 'phase', expected: 277.13 }],
);

// ── delta-wye: Δ I P→L 100A ──────────────────────────────────────────────
run('Δ-Y · Δ I P→L 100A',
  deltaWye,
  { system: 'delta', quantity: 'I', direction: 'P2L', value: 100 },
  [{ label: 'line', expected: 173.21 }],
);

// ── balanced load: Y 400V Z=8 ∠36.87° ────────────────────────────────────
run('Balanced · Y 400V Z=8 ∠36.87°',
  balancedLoad,
  { system: 'wye', Vll: 400, Z: 8, phi: 36.87 },
  [
    { label: 'Phase voltage',  expected: 230.94 },
    { label: 'Phase current',  expected: 28.87 },
    { label: 'Line current',   expected: 28.87 },
    { label: 'Total apparent', expected: 20.0 },
    { label: 'Total real',     expected: 16.0 },
    { label: 'Total reactive', expected: 12.0 },
  ],
);

// ── balanced load: Δ 400V Z=8 ∠36.87° ────────────────────────────────────
run('Balanced · Δ 400V Z=8 ∠36.87°',
  balancedLoad,
  { system: 'delta', Vll: 400, Z: 8, phi: 36.87 },
  [
    { label: 'Phase voltage',  expected: 400.0 },
    { label: 'Phase current',  expected: 50.0 },
    { label: 'Line current',   expected: 86.60 },
    { label: 'Total apparent', expected: 60.0 },
    { label: 'Total real',     expected: 48.0 },
    { label: 'Total reactive', expected: 36.0 },
  ],
);

// ── HP → kW: 25 hp ───────────────────────────────────────────────────────
run('HP→kW · 25 hp',
  hpKw,
  { value: 25, from: 'hp', to: 'kW' },
  [{ label: 'Output', expected: 18.643 }],
);

// ── kW → PS: 20 kW ───────────────────────────────────────────────────────
run('kW→PS · 20 kW',
  hpKw,
  { value: 20, from: 'kW', to: 'ps' },
  [{ label: 'Output', expected: 27.192 }],
);

// ── AWG → mm²: 10 AWG ────────────────────────────────────────────────────
{
  const out = awgMm2.compute({ mode: 'awgTomm2', value: 10 });
  const awgRow = findRow(out.rows, 'AWG / kcmil');
  const mm2Row = findRow(out.rows, 'mm²');
  const pass = awgRow?.value === '10' && Math.abs((mm2Row?.value as number) - 5.26) < 0.01;
  results.push({
    name: 'AWG→mm² · 10 AWG',
    pass,
    detail: [pass
      ? `  ✓ AWG = "${awgRow!.value}", mm² = ${mm2Row!.value} (exp 5.26)`
      : `  ✗ AWG="${awgRow?.value}" mm²=${mm2Row?.value}`],
  });
}

// ── mm² → AWG: 50 mm² (closest is 1/0 = 53.5 mm²) ────────────────────────
{
  const out = awgMm2.compute({ mode: 'mm2toAWG', value: 50 });
  const awgRow = findRow(out.rows, 'AWG / kcmil');
  const mm2Row = findRow(out.rows, 'mm²');
  const pass = awgRow?.value === '1/0' && Math.abs((mm2Row?.value as number) - 53.5) < 0.01;
  results.push({
    name: 'mm²→AWG · 50 mm²',
    pass,
    detail: [pass
      ? `  ✓ AWG = "${awgRow!.value}", mm² = ${mm2Row!.value} (exp 53.5)`
      : `  ✗ AWG="${awgRow?.value}" mm²=${mm2Row?.value}`],
  });
}

// ── Report ────────────────────────────────────────────────────────────────
const passed = results.filter((r) => r.pass).length;
const failed = results.length - passed;

console.log('');
console.log('═'.repeat(78));
console.log(`  Independent calculator test · ${passed}/${results.length} pass · ${failed} fail`);
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
