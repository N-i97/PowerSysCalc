// Independent accuracy test — completely separate from tests/run-calculators.mts
// All inputs and expected values are hand-derived.
// Run: npx tsx tests/independent-accuracy-test.mts

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

// ── Helpers ────────────────────────────────────────────────────────────────
type Row = { label: string; value: number | string; unit?: string };
type Output = { rows: Row[]; raw: Record<string, unknown>; status?: string };

const SQRT3 = Math.sqrt(3);

const approx = (expected: number, actual: number, relTol = 0.01, absTol = 0.1): boolean => {
  if (!Number.isFinite(actual)) return false;
  return Math.abs(expected - actual) <= Math.max(absTol, Math.abs(expected) * relTol);
};

const findRow = (rows: Row[], substr: string) =>
  rows.find((r) => r.label.toLowerCase().includes(substr.toLowerCase()));

interface Check { label: string; expected: number; rel?: number; abs?: number; }
interface TestResult { name: string; pass: boolean; lines: string[]; }

const results: TestResult[] = [];

function run(
  name: string,
  def: { compute: (input: Record<string, unknown>, ctx?: unknown) => Output },
  input: Record<string, unknown>,
  checks: Check[],
  ctx?: unknown,
) {
  const lines: string[] = [];
  let pass = true;
  try {
    const out = def.compute(input, ctx);
    for (const c of checks) {
      const row = findRow(out.rows, c.label);
      if (!row) {
        pass = false;
        lines.push(`  ✗ Row "${c.label}" not found`);
        continue;
      }
      const actual = typeof row.value === 'number' ? row.value : NaN;
      const ok = approx(c.expected, actual, c.rel, c.abs);
      if (!ok) {
        pass = false;
        lines.push(`  ✗ "${row.label}": expected ≈${c.expected}, got ${actual}`);
      } else {
        lines.push(`  ✓ "${row.label}" = ${actual}  (expected ≈${c.expected})`);
      }
    }
  } catch (e) {
    pass = false;
    lines.push(`  ✗ EXCEPTION: ${(e as Error).message}`);
  }
  results.push({ name, pass, lines });
}

// ═══════════════════════════════════════════════════════════════════════════
//  1. SINGLE-PHASE POWER
//     V=120 V, I=15 A, pf=0.85
//     S = 120×15 = 1800 VA
//     P = 1800×0.85 = 1530 W
//     Q = 1800×√(1−0.85²) = 1800×0.52678 = 948.2 var
//     φ = acos(0.85) = 31.79°
// ═══════════════════════════════════════════════════════════════════════════
run(
  '01 · Single-Phase Power  (120 V, 15 A, pf 0.85)',
  singlePhase,
  { V: 120, I: 15, pf: 0.85, phiUnit: 'lagging' },
  [
    { label: 'Apparent power S', expected: 1800 },
    { label: 'Real power P',     expected: 1530 },
    { label: 'Reactive power Q', expected: 948.2 },
    { label: 'Phase angle',      expected: 31.79 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  2. THREE-PHASE POWER (from_IV)
//     Vll=480 V, I=100 A, pf=0.8
//     S = √3×480×100 = 83138.4 VA = 83.138 kVA
//     P = 83138.4×0.8 = 66510.7 W = 66.511 kW
//     Q = 83138.4×0.6 = 49883.1 var = 49.883 kVAr
//     φ = acos(0.8) = 36.87°
//     V_LN = 480/√3 = 277.13 V
// ═══════════════════════════════════════════════════════════════════════════
run(
  '02 · Three-Phase Power from_IV  (480 V, 100 A, pf 0.8)',
  threePhase,
  { Vll: 480, I: 100, pf: 0.8, mode: 'from_IV', P_or_S: 30 },
  [
    { label: 'Apparent power S',  expected: 83.138 },
    { label: 'Real power P',      expected: 66.511 },
    { label: 'Reactive power Q',  expected: 49.883 },
    { label: 'Line current I',    expected: 100 },
    { label: 'Phase voltage',     expected: 277.13 },
    { label: 'Phase angle',       expected: 36.87 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  3. THREE-PHASE POWER (from_P, kW)
//     Vll=480, pf=0.85, P=50 kW
//     P = 50000 W, S = 50000/0.85 = 58823.5 VA = 58.824 kVA
//     Q = S×√(1-0.85²) = 58823.5×0.52678 = 30983.7 var = 30.984 kVAr
//     I = S/(√3×480) = 58823.5/831.38 = 70.76 A
// ═══════════════════════════════════════════════════════════════════════════
run(
  '03 · Three-Phase Power from_P  (480 V, 50 kW, pf 0.85)',
  threePhase,
  { Vll: 480, I: 50, pf: 0.85, mode: 'from_P', P_or_S: 50 },
  [
    { label: 'Real power P',      expected: 50.0 },
    { label: 'Apparent power S',  expected: 58.824 },
    { label: 'Reactive power Q',  expected: 30.984 },
    { label: 'Line current I',    expected: 70.76 },
  ],
  { units: { P_or_S: 'kW' } },
);

// ═══════════════════════════════════════════════════════════════════════════
//  4. POWER FACTOR (from P & S)
//     P=50 kW, S=62.5 kVA → pf = 50/62.5 = 0.8, φ = 36.87°
// ═══════════════════════════════════════════════════════════════════════════
run(
  '04 · Power Factor from P & S  (P=50, S=62.5)',
  powerFactor,
  { mode: 'from_PS', P: 50, S: 62.5, Q: 30, phi: 30 },
  [
    { label: 'Power factor', expected: 0.8 },
    { label: 'Phase angle',  expected: 36.87 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  5. POWER FACTOR (from P & Q)
//     P=40 kW, Q=30 kvar → S = √(40²+30²) = 50 kVA, pf = 40/50 = 0.8
// ═══════════════════════════════════════════════════════════════════════════
run(
  '05 · Power Factor from P & Q  (P=40, Q=30)',
  powerFactor,
  { mode: 'from_PQ', P: 40, S: 50, Q: 30, phi: 30 },
  [
    { label: 'Power factor', expected: 0.8 },
    { label: 'Phase angle',  expected: 36.87 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  6. POWER FACTOR (from angle)
//     φ=45° → pf = cos(45°) = 0.7071
// ═══════════════════════════════════════════════════════════════════════════
run(
  '06 · Power Factor from angle  (φ=45°)',
  powerFactor,
  { mode: 'from_angle', P: 30, S: 35, Q: 18, phi: 45 },
  [
    { label: 'Power factor', expected: 0.707 },
    { label: 'Phase angle',  expected: 45 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  7. PF CORRECTION
//     P=100 kW, pf1=0.8 → pf2=0.95, V=480, 3φ
//     φ1 = acos(0.8)=0.6435 rad, tan(φ1)=0.75
//     φ2 = acos(0.95)=0.3176 rad, tan(φ2)=0.32868
//     Qc = 100000×(0.75 − 0.32868) = 42132 var = 42.13 kVAr
//     S_before = 100000/0.8 = 125000 VA → I_before = 125000/(√3×480) = 150.33 A
//     S_after  = 100000/0.95 = 105263 VA → I_after = 105263/(√3×480) = 126.58 A
//     Released = (150.33−126.58)/150.33×100 = 15.8%
// ═══════════════════════════════════════════════════════════════════════════
run(
  '07 · PF Correction  (100 kW, 0.8→0.95, 480 V 3φ)',
  pfCorrection,
  { P: 100, pf1: 0.8, pf2: 0.95, V: 480, ph: '3' },
  [
    { label: 'Capacitor bank Qc', expected: 42.13 },
    { label: 'Current before',    expected: 150.33 },
    { label: 'Current after',     expected: 126.58 },
    { label: 'Released capacity', expected: 15.8 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  8. kW / kVA / HP CONVERTER
//     75 kW, pf=0.9
//     W = 75000, kVA = 75/0.9 = 83.333
//     HP = 75000/745.7 = 100.57
//     PS = 75000/735.499 = 101.97
//     MW = 0.075
//     VAr = √(83333²−75000²) = √(6944388889−5625000000) = √1319388889 = 36323
// ═══════════════════════════════════════════════════════════════════════════
run(
  '08 · kW/kVA/HP  (75 kW, pf 0.9)',
  kwKvaHp,
  { value: 75, pf: 0.9 },
  [
    { label: 'W',    expected: 75000 },
    { label: 'kW',   expected: 75 },
    { label: 'kVA',  expected: 83.333 },
    { label: 'HP',   expected: 100.57 },
    { label: 'PS',   expected: 101.97 },
    { label: 'MW',   expected: 0.075 },
    { label: 'VAr',  expected: 36323, abs: 50 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  9. DEMAND LOAD
//     Lighting: 80×0.05=4 kW, df=0.9 → 3.6
//     HVAC: 3×10=30 kW, df=0.7 → 21
//     Receptacles: 50×0.18=9 kW, df=0.4 → 3.6
//     Connected = 43 kW, Demand = 28.2 kW
//     Energy = 28.2×5000 = 141000 kWh = 141 MWh
//     Avg = 141000/8760 = 16.1 kW
//     LF = 16.1/28.2 = 57.1%
// ═══════════════════════════════════════════════════════════════════════════
run(
  '09 · Demand Load  (3 groups, 5000 h)',
  demandLoad,
  {
    loads: '[{"name":"Lighting","qty":80,"unit":0.05,"df":0.9},{"name":"HVAC","qty":3,"unit":10,"df":0.7},{"name":"Receptacles","qty":50,"unit":0.18,"df":0.4}]',
    hoursPerYear: 5000,
  },
  [
    { label: 'Connected load',  expected: 43.0 },
    { label: 'Maximum demand',  expected: 28.2 },
    { label: 'Annual energy',   expected: 141.0 },
    { label: 'Average demand',  expected: 16.1 },
    { label: 'Load factor',     expected: 57.1 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  10. CURRENT CALCULATOR (3φ)
//      V=690, P=75 kW, pf=0.85, eff=0.95
//      S = 75000/(0.85×0.95) = 92879.5 VA = 92.88 kVA
//      I = 92879.5/(√3×690) = 77.54 A
// ═══════════════════════════════════════════════════════════════════════════
run(
  '10 · Current 3φ  (690 V, 75 kW, pf 0.85, eff 0.95)',
  current,
  { phase: '3', V: 690, P: 75, pf: 0.85, eff: 0.95 },
  [
    { label: 'Apparent power S', expected: 92.88 },
    { label: 'Line current I',   expected: 77.54 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  11. CURRENT CALCULATOR (1φ)
//      V=240, P=3 kW, pf=0.9, eff=1
//      S = 3000/0.9 = 3333.3 VA = 3.333 kVA
//      I = 3333.3/240 = 13.89 A
// ═══════════════════════════════════════════════════════════════════════════
run(
  '11 · Current 1φ  (240 V, 3 kW, pf 0.9)',
  current,
  { phase: '1', V: 240, P: 3, pf: 0.9, eff: 1 },
  [
    { label: 'Apparent power S', expected: 3.333 },
    { label: 'Line current I',   expected: 13.89 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  12. DELTA-WYE  (Y, V, L→P)  690 V
//      V_LN = 690/√3 = 398.37 V
// ═══════════════════════════════════════════════════════════════════════════
run(
  '12 · Delta-Wye  Y V L→P  (690 V)',
  deltaWye,
  { system: 'wye', quantity: 'V', direction: 'L2P', value: 690 },
  [{ label: 'phase', expected: 398.37 }],
);

// ═══════════════════════════════════════════════════════════════════════════
//  13. DELTA-WYE  (Δ, I, P→L)  50 A
//      I_L = 50×√3 = 86.6 A
// ═══════════════════════════════════════════════════════════════════════════
run(
  '13 · Delta-Wye  Δ I P→L  (50 A)',
  deltaWye,
  { system: 'delta', quantity: 'I', direction: 'P2L', value: 50 },
  [{ label: 'line', expected: 86.6 }],
);

// ═══════════════════════════════════════════════════════════════════════════
//  14. BALANCED LOAD (Y)
//      Vll=690, Z=20Ω, φ=45°
//      Vph = 690/√3 = 398.37 V
//      Iph = 398.37/20 = 19.92 A
//      IL = 19.92 A
//      S = 3×398.37×19.92 = 23805 VA = 23.805 kVA
//      P = 23805×cos(45°) = 16832 W = 16.832 kW
//      Q = 23805×sin(45°) = 16832 var = 16.832 kVAr
//      PF = cos(45°) = 0.707
// ═══════════════════════════════════════════════════════════════════════════
run(
  '14 · Balanced Load Y  (690 V, Z=20, φ=45°)',
  balancedLoad,
  { system: 'wye', Vll: 690, Z: 20, phi: 45 },
  [
    { label: 'Phase voltage',  expected: 398.37 },
    { label: 'Phase current',  expected: 19.92 },
    { label: 'Line current',   expected: 19.92 },
    { label: 'Total apparent', expected: 23.805 },
    { label: 'Total real',     expected: 16.832 },
    { label: 'Total reactive', expected: 16.832 },
    { label: 'Power factor',   expected: 0.707 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  15. BALANCED LOAD (Δ)
//      Vll=690, Z=20Ω, φ=45°
//      Vph = 690 V, Iph = 690/20 = 34.5 A
//      IL = 34.5×√3 = 59.75 A
//      S = 3×690×34.5 = 71415 VA = 71.415 kVA
//      P = 71415×cos(45°) = 50498 W = 50.498 kW
//      Q = 71415×sin(45°) = 50498 var = 50.498 kVAr
// ═══════════════════════════════════════════════════════════════════════════
run(
  '15 · Balanced Load Δ  (690 V, Z=20, φ=45°)',
  balancedLoad,
  { system: 'delta', Vll: 690, Z: 20, phi: 45 },
  [
    { label: 'Phase voltage',  expected: 690 },
    { label: 'Phase current',  expected: 34.5 },
    { label: 'Line current',   expected: 59.75 },
    { label: 'Total apparent', expected: 71.415 },
    { label: 'Total real',     expected: 50.498 },
    { label: 'Total reactive', expected: 50.498 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  16. TRANSFORMER SIZING
//      P=250 kW, pf=0.85, df=0.9, grow=15%, Vll=480, eff=0.97, 3φ
//      S_load = (250000/0.85)×0.9×1.15 = 304412 VA = 304.41 kVA
//      S_tx = 304412/0.97 = 313827 VA = 313.83 kVA
//      next std = 500 kVA
//      loading = 304.41/500×100 = 60.88%
//      I_sec = 500000/(√3×480) = 601.4 A
// ═══════════════════════════════════════════════════════════════════════════
run(
  '16 · Transformer Sizing  (250 kW, 480 V)',
  txSizing,
  { P: 250, pf: 0.85, df: 0.9, grow: 15, Vll: 480, eff: 0.97, ph: '3' },
  [
    { label: 'Required apparent',  expected: 304.41 },
    { label: 'Adjusted for losses', expected: 313.83 },
    { label: 'Standard size',      expected: 500 },
    { label: 'Loading at full',    expected: 60.88 },
    { label: 'Secondary current',  expected: 601.4 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  17. TRANSFORMER CURRENT
//      S=1000 kVA, V1=22000, V2=400, Z=5.75%, 3φ
//      I1 = 1000000/(√3×22000) = 26.24 A
//      I2 = 1000000/(√3×400) = 1443.38 A
//      turns = 22000/400 = 55
//      Isc = 1443.38/0.0575 = 25102 A
//      SC MVA = 25102×400×√3 / 1e6 = 17.39 MVA
// ═══════════════════════════════════════════════════════════════════════════
run(
  '17 · Transformer Current  (1000 kVA, 22kV/400V, Z=5.75%)',
  txCurrent,
  { S: 1000, V1: 22000, V2: 400, Z: 5.75, ph: '3' },
  [
    { label: 'Primary current',    expected: 26.24 },
    { label: 'Secondary current',  expected: 1443.38 },
    { label: 'Turns ratio',        expected: 55 },
    { label: 'Short-circuit I_sc', expected: 25102 },
    { label: 'Short-circuit MVA',  expected: 17.39 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  18. TRANSFORMER EFFICIENCY
//      S=500 kVA, P0=0.6 kW, Pk=5.5 kW, load=80%, pf=0.85
//      Pout = 500000×0.8×0.85 = 340000 W = 340 kW
//      losses = 600 + 0.64×5500 = 600+3520 = 4120 W = 4.12 kW
//      eff = 340000/344120 = 98.80%
//      maxEffL = √(600/5500) = √0.10909 = 0.3303 → 33.0%
// ═══════════════════════════════════════════════════════════════════════════
run(
  '18 · Transformer Efficiency  (500 kVA, 80% load)',
  txEfficiency,
  { S: 500, P0: 0.6, Pk: 5.5, load: 80, pf: 0.85 },
  [
    { label: 'Output P_out',           expected: 340 },
    { label: 'No-load loss',           expected: 0.6 },
    { label: 'Load loss Pk',           expected: 3.52 },
    { label: 'Total losses',           expected: 4.12 },
    { label: 'Efficiency',             expected: 98.80 },
    { label: 'Max-efficiency loading', expected: 33.0 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  19. MOTOR FLC
//      P=22 kW, V=400, 3φ, pf=0.85, eff=0.9, calc
//      I = 22000/(√3×400×0.85×0.9) = 22000/529.95 = 41.51 A
//      OCPD = ceil(41.51×2.5/5)×5 = ceil(20.76)×5 = 21×5 = 105 → next std
//      Actually: 41.51×2.5 = 103.78, ceil(103.78/5)*5 = ceil(20.756)*5 = 21*5 = 105
//      But 105 isn't in STANDARD_BREAKER_SIZES [6,10,16,20,25,32,40,50,63,80,100,125,...]
//      So nextBreakerUp(103.78) = 125
// ═══════════════════════════════════════════════════════════════════════════
run(
  '19 · Motor FLC  (22 kW, 400 V, 3φ, pf 0.85, eff 0.9)',
  motorFLC,
  { P: 22, V: 400, ph: '3', pf: 0.85, eff: 0.9, standard: 'calc' },
  [
    { label: 'Full-load current',  expected: 41.51 },
    { label: 'Direct calculation', expected: 41.51 },
    { label: 'Recommended OCPD',   expected: 105 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  20. MOTOR STARTING (DOL)
//      I=45 A, lr=7, DOL, V=400, Ssc=30 MVA
//      I_LR = 7×45 = 315 A
//      I_start = 315 A (factor=1)
//      ΔU = (315×400)/(√3×30e6) = 126000/51961524 = 0.002425 → 0.24%
// ═══════════════════════════════════════════════════════════════════════════
run(
  '20 · Motor Starting DOL  (45 A, LR×7)',
  motorStarting,
  { I: 45, lr: 7, method: 'dol', autoPct: 65, V: 400, Ssc: 30 },
  [
    { label: 'Locked-rotor current', expected: 315 },
    { label: 'Starting current',     expected: 315 },
    { label: 'Voltage dip',          expected: 0.24 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  21. MOTOR STARTING (star-delta)
//      I=45 A, lr=7, Y-Δ
//      I_LR = 315, factor=1/3 → I_start = 105 A
// ═══════════════════════════════════════════════════════════════════════════
run(
  '21 · Motor Starting Y-Δ  (45 A, LR×7)',
  motorStarting,
  { I: 45, lr: 7, method: 'ysd', autoPct: 65, V: 400, Ssc: 30 },
  [
    { label: 'Starting current', expected: 105 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  22. MOTOR STARTING (autotransformer 65%)
//      I=45, lr=7, auto, tap=65%
//      I_LR = 315, factor = 0.65² = 0.4225 → I_start = 133.09 A
// ═══════════════════════════════════════════════════════════════════════════
run(
  '22 · Motor Starting Auto 65%  (45 A, LR×7)',
  motorStarting,
  { I: 45, lr: 7, method: 'auto', autoPct: 65, V: 400, Ssc: 30 },
  [
    { label: 'Starting current', expected: 133.09 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  23. VFD SIZING
//      I=45 A, V=400, 3φ, CT, Ta=45°C, alt=1500m, fc=6 kHz
//      kd = 1.05 (CT)
//      kT = 1 − 0.02×(45−40) = 0.9
//      kA = 1 − 0.01×(1500−1000)/100 = 0.95
//      kF = 1 − 0.05×floor((6−4)/2) = 1 − 0.05 = 0.95
//      derate = min(1.05, 0.9, 0.95, 0.95) = 0.9
//      I_req = 45/0.9 = 50 A
//      S = √3×400×50 = 34641 VA = 34.64 kVA
// ═══════════════════════════════════════════════════════════════════════════
run(
  '23 · VFD Sizing  (45 A, CT, 45°C, 1500 m, 6 kHz)',
  motorVFD,
  { I: 45, V: 400, ph: '3', duty: 'CT', Ta: 45, alt: 1500, fc: 6 },
  [
    { label: 'Duty factor',        expected: 1.05 },
    { label: 'Temp derate',        expected: 0.9 },
    { label: 'Altitude derate',    expected: 0.95 },
    { label: 'Carrier derate',     expected: 0.95 },
    { label: 'Worst derate',       expected: 0.9 },
    { label: 'Required VFD current', expected: 50 },
    { label: 'Required VFD power',  expected: 34.64 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  24. MOTOR BREAKER
//      I=45 A, inverse-time → factor=2.5, target=112.5
//      nextBreakerUp(112.5) = 125
// ═══════════════════════════════════════════════════════════════════════════
run(
  '24 · Motor Breaker  (45 A, inverse-time)',
  motorBreaker,
  { I: 45, type: 'inv', poles: '3' },
  [
    { label: 'Protection factor', expected: 2.5 },
    { label: 'Target OCPD',       expected: 112.5 },
    { label: 'Selected OCPD',     expected: 125 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  25. MOTOR BREAKER (instantaneous)
//      I=45 A, inst → factor=8, target=360
//      nextBreakerUp(360) = 400
// ═══════════════════════════════════════════════════════════════════════════
run(
  '25 · Motor Breaker  (45 A, instantaneous)',
  motorBreaker,
  { I: 45, type: 'inst', poles: '3' },
  [
    { label: 'Protection factor', expected: 8 },
    { label: 'Target OCPD',       expected: 360 },
    { label: 'Selected OCPD',     expected: 400 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  26. VOLTAGE DROP
//      V=400, 3φ, I=80 A, L=60 m, Cu, 16 mm², pf=0.9, T=60°C
//      R20(16mm²) = 0.017241/16 = 1.0776 mΩ/m = 0.0010776 Ω/m
//      R60 = 0.0010776×(1+0.00393×40)×60 = 0.0010776×1.1572×60 = 0.07482 Ω
//      X = 0.08/1000×60 = 0.0048 Ω
//      sin(φ) = √(1−0.81) = 0.43589
//      Vd = √3×80×(0.07482×0.9 + 0.0048×0.43589)
//         = 138.564×(0.06734 + 0.002092) = 138.564×0.06943 = 9.62 V
//      Vd% = 9.62/400×100 = 2.41%
// ═══════════════════════════════════════════════════════════════════════════
run(
  '26 · Voltage Drop  (400 V, 3φ, 80 A, 60 m, 16 mm² Cu, 60°C)',
  voltageDrop,
  { V: 400, ph: '3', I: 80, L: 60, mat: 'Cu', size: 16, pf: 0.9, T: 60 },
  [
    { label: 'Voltage drop ΔU',  expected: 9.62 },
    { label: 'Resistance R',     expected: 0.075 },
    { label: 'Reactance X',      expected: 0.005 },
    { label: 'Voltage at load',  expected: 390.38 },
  ],
);

// Also check Vd%
(() => {
  const out = voltageDrop.compute({ V: 400, ph: '3', I: 80, L: 60, mat: 'Cu', size: 16, pf: 0.9, T: 60 });
  const row = out.rows.find((r) => r.unit === '%' && r.label.toLowerCase().includes('drop'));
  const pass = row ? approx(2.41, row.value as number, 0.02, 0.05) : false;
  results.push({
    name: '26b · Voltage Drop Vd% row',
    pass,
    lines: [pass ? `  ✓ Vd% = ${row!.value} (expected ≈2.41)` : `  ✗ Vd% row not found or wrong`],
  });
})();

// ═══════════════════════════════════════════════════════════════════════════
//  27. CABLE SIZING
//      IB=100 A, XLPE, method C, Cu, Ta=35°C, grp=2, soil=1.2, cont
//      k1=1.25, In=125 A
//      kT: XLPE at 35°C = 0.96
//      kG: 2 circuits = 0.88
//      kS: soil 1.2 = 1.0
//      I_z_req = 125/(0.96×0.88×1.0) = 125/0.8448 = 147.96 A
//      XLPE_C table: 25→135, 35→168 → 35 mm²
//      OCPD = nextBreakerUp(125) = 125
// ═══════════════════════════════════════════════════════════════════════════
run(
  '27 · Cable Sizing  (100 A, XLPE, C, 35°C, 2 circuits)',
  cableSizing,
  { IB: 100, ins: 'XLPE', method: 'C', mat: 'Cu', Ta: 35, grp: 2, soil: 1.2, duty: 'cont' },
  [
    { label: 'Continuous-load factor', expected: 1.25 },
    { label: 'Required I_n',           expected: 125 },
    { label: 'Temperature factor',     expected: 0.96 },
    { label: 'Grouping factor',        expected: 0.88 },
    { label: 'Soil derate',            expected: 1.0 },
    { label: 'Required I_z',           expected: 147.96 },
    { label: 'Selected size',          expected: 35 },
    { label: 'Recommended OCPD',       expected: 125 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  28. CABLE DERATING
//      35 mm², PVC, method C, Ta=45°C, grp=3, soil=1.5
//      kT: PVC at 45°C = 0.79
//      kG: 3 circuits = 0.82
//      kS: soil 1.5 = 0.93
//      K = 0.79×0.82×0.93 = 0.6022
//      PVC_C table 35mm² = 148 A
//      Iz_final = 148×0.6022 = 89.1 A
// ═══════════════════════════════════════════════════════════════════════════
run(
  '28 · Cable Derating  (35 mm² PVC, C, 45°C, 3 circuits, soil 1.5)',
  cableDerating,
  { size: 35, ins: 'PVC', method: 'C', Ta: 45, grp: 3, soil: 1.5 },
  [
    { label: 'Temperature factor', expected: 0.79 },
    { label: 'Grouping factor',    expected: 0.82 },
    { label: 'Soil factor',        expected: 0.93 },
    { label: 'Combined derate',    expected: 0.602 },
    { label: 'Base ampacity',      expected: 148 },
    { label: 'Final ampacity',     expected: 89.1 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  29. SHORT-CIRCUIT I²t
//      Isc=25000 A, S=35 mm², Cu, XLPE, t=0.3 s, I2t_dev=0 (use source)
//      k = 143 (XLPE/Cu)
//      I2t_cable = (143×35)² = 5005² = 25050025 → 25.05 kA²s
//      I2t_source = 25000²×0.3 = 187500000 → 187.5 kA²s
//      verdict: 25.05 < 187.5 → FAIL
// ═══════════════════════════════════════════════════════════════════════════
run(
  '29 · Short-Circuit I²t  (25 kA, 35 mm² Cu/XLPE, 0.3 s)',
  shortCircuit,
  { Isc: 25000, S: 35, mat: 'Cu', ins: 'XLPE', t: 0.3, I2t_dev: 0 },
  [
    { label: 'Material constant k',  expected: 143 },
    { label: 'Cable I²t withstand',  expected: 25.05 },
    { label: 'Source I²t',           expected: 187.5 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  30. BREAKER SIZING
//      Icont=120 A, Inon=30 A
//      target = 120×1.25 + 30 = 180 A
//      nextBreakerUp(180) = 200 A
// ═══════════════════════════════════════════════════════════════════════════
run(
  '30 · Breaker Sizing  (120 cont + 30 non)',
  breaker,
  { Icont: 120, Inon: 30, system: 'LV' },
  [
    { label: 'Total (NEC 80% rule)', expected: 180 },
    { label: 'OCPD (next std)',     expected: 200 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  31. FUSE SIZING (fast-acting)
//      Icont=40 A, Inon=15 A, FA
//      factor=1.25, base = 40×1.25+15 = 65 A
//      next std fuse = 70 A
// ═══════════════════════════════════════════════════════════════════════════
run(
  '31 · Fuse Sizing  (40 cont + 15 non, fast-acting)',
  fuse,
  { Icont: 40, Inon: 15, type: 'FA', inrush: 5 },
  [
    { label: 'Multiplier',       expected: 1.25 },
    { label: 'Computed minimum', expected: 65 },
    { label: 'Recommended fuse', expected: 70 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  32. EARTHING CONDUCTOR
//      Isc=6000 A, t=0.3 s, Cu, XLPE
//      k = 143 (XLPE/Cu)
//      S = 6000×√0.3 / 143 = 6000×0.54772 / 143 = 3286.3/143 = 22.98 mm²
//      next std = 25 mm²
// ═══════════════════════════════════════════════════════════════════════════
run(
  '32 · Earthing Conductor  (6000 A, 0.3 s, Cu/XLPE)',
  groundCond,
  { Isc: 6000, t: 0.3, mat: 'Cu', ins: 'XLPE' },
  [
    { label: 'k coefficient', expected: 143 },
    { label: 'Computed S',    expected: 22.98 },
    { label: 'Next standard', expected: 25 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  33. GROUND RESISTANCE (single rod)
//      ρ=50 Ω·m, L=3 m, d=0.02 m
//      R = 50/(2π×3)×ln(4×3/0.02) = 2.6526×ln(600) = 2.6526×6.3969 = 16.97 Ω
// ═══════════════════════════════════════════════════════════════════════════
run(
  '33 · Ground Resistance  (single rod, ρ=50, L=3 m)',
  groundRes,
  { type: 'rod', rho: 50, L: 3, d: 0.02, W: 0.6, A: 1, n: 1, s: 3 },
  [
    { label: 'Single electrode', expected: 16.97 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  34. GROUND RESISTANCE (plate)
//      ρ=200 Ω·m, A=2 m²
//      R = 200/(4×√(π×2)) = 200/(4×2.5066) = 200/10.0265 = 19.95 Ω
// ═══════════════════════════════════════════════════════════════════════════
run(
  '34 · Ground Resistance  (plate, ρ=200, A=2 m²)',
  groundRes,
  { type: 'plate', rho: 200, L: 2.4, d: 0.016, W: 0.6, A: 2, n: 1, s: 3 },
  [
    { label: 'Single electrode', expected: 19.95 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  35. SOLAR INVERTER
//      Pdc=8 kW, ratio=1.2
//      Vac = 8000/1.2 / 1000 = 6.67 kW
// ═══════════════════════════════════════════════════════════════════════════
run(
  '35 · Solar Inverter  (8 kWp, DC/AC 1.2)',
  inverter,
  { Pdc: 8, ratio: 1.2, Vmp: 250, Voc: 500, ph: '3' },
  [
    { label: 'Inverter AC', expected: 6.67 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  36. BATTERY RUNTIME
//      E=5 kWh, DoD=90%, P=2 kW, η=95%, age=10%
//      E_usable = 5000×0.9×0.9 = 4050 Wh = 4.05 kWh
//      P_eff = 2000/0.95 = 2105.26 W = 2.105 kW
//      runtime = 4050/2105.26 = 1.924 h
// ═══════════════════════════════════════════════════════════════════════════
run(
  '36 · Battery Runtime  (5 kWh, 90% DoD, 2 kW, 95% eff, 10% age)',
  battery,
  { E: 5, dod: 90, P: 2, eta: 95, age: 10 },
  [
    { label: 'Usable energy', expected: 4.05 },
    { label: 'Runtime',       expected: 1.92 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  37. SOLAR STRING
//      Vmp=38, Voc=46, Tc_min=-5, Tc_max=65
//      Vmppt_min=350, Vmppt_max=750, Vinv_max=1000
//      β = -0.0035
//      Vmp_hot = 38×(1 + (-0.0035)×(65−25)) = 38×(1−0.14) = 38×0.86 = 32.68 V
//      Voc_cold = 46×(1 + (-0.0035)×(-5−25)) = 46×(1+0.105) = 46×1.105 = 50.83 V
//      Nmin = ceil(350/32.68) = ceil(10.71) = 11
//      Nmax_voc = floor(1000/50.83) = floor(19.67) = 19
//      Nmax_mppt = floor(750/38) = floor(19.74) = 19
//      Nmax = min(19,19) = 19
// ═══════════════════════════════════════════════════════════════════════════
run(
  '37 · Solar String  (Vmp=38, Voc=46, -5°C to 65°C)',
  solarString,
  { Vmp_mod: 38, Voc_mod: 46, Tc_min: -5, Tc_max: 65, Vmppt_min: 350, Vmppt_max: 750, Vinv_max: 1000 },
  [
    { label: 'Vmp at hot',   expected: 32.68 },
    { label: 'Voc at cold',  expected: 50.83 },
    { label: 'Min modules',  expected: 11 },
    { label: 'Max modules',  expected: 19 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  38. HP → kW  (15 HP)
//      W = 15×745.7 = 11185.5 W → kW = 11.1855
// ═══════════════════════════════════════════════════════════════════════════
run(
  '38 · HP→kW  (15 HP)',
  hpKw,
  { value: 15, from: 'hp', to: 'kW' },
  [{ label: 'Output', expected: 11.1855 }],
);

// ═══════════════════════════════════════════════════════════════════════════
//  39. kW → PS  (20 kW)
//      W = 20000, PS = 20000/735.499 = 27.192
// ═══════════════════════════════════════════════════════════════════════════
run(
  '39 · kW→PS  (20 kW)',
  hpKw,
  { value: 20, from: 'kW', to: 'ps' },
  [{ label: 'Output', expected: 27.192 }],
);

// ═══════════════════════════════════════════════════════════════════════════
//  40. W → HP  (7457 W)
//      HP = 7457/745.7 = 10.0
// ═══════════════════════════════════════════════════════════════════════════
run(
  '40 · W→HP  (7457 W)',
  hpKw,
  { value: 7457, from: 'W', to: 'hp' },
  [{ label: 'Output', expected: 10.0 }],
);

// ═══════════════════════════════════════════════════════════════════════════
//  41. AWG → mm²  (AWG "4")
//      AWG 4 → 21.1 mm²
// ═══════════════════════════════════════════════════════════════════════════
run(
  '41 · AWG→mm²  (AWG 4)',
  awgMm2,
  { mode: 'awgTomm2', value: 4 },
  [
    { label: 'mm²', expected: 21.1 },
    { label: 'Cu ampacity', expected: 85 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  42. mm² → AWG  (50 mm²)
//      Closest: 53.5 mm² = 1/0 AWG
// ═══════════════════════════════════════════════════════════════════════════
run(
  '42 · mm²→AWG  (50 mm²)',
  awgMm2,
  { mode: 'mm2toAWG', value: 50 },
  [
    { label: 'mm²', expected: 53.5 },
    { label: 'Cu ampacity', expected: 150 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  43. MOTOR BREAKER (dual-element fuse)
//      I=60 A, dual → factor=1.75, target=105
//      nextBreakerUp(105) = 125
// ═══════════════════════════════════════════════════════════════════════════
run(
  '43 · Motor Breaker  (60 A, dual-element fuse)',
  motorBreaker,
  { I: 60, type: 'dual', poles: '3' },
  [
    { label: 'Protection factor', expected: 1.75 },
    { label: 'Target OCPD',       expected: 105 },
    { label: 'Selected OCPD',     expected: 125 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  44. FUSE SIZING (time-delay)
//      Icont=60 A, Inon=20 A, TD
//      factor=1.15, base = 60×1.15+20 = 89 A
//      next std = 90 A
// ═══════════════════════════════════════════════════════════════════════════
run(
  '44 · Fuse Sizing  (60 cont + 20 non, time-delay)',
  fuse,
  { Icont: 60, Inon: 20, type: 'TD', inrush: 5 },
  [
    { label: 'Multiplier',       expected: 1.15 },
    { label: 'Computed minimum', expected: 89 },
    { label: 'Recommended fuse', expected: 90 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  45. VOLTAGE DROP (1φ)
//      V=230, 1φ, I=32 A, L=40 m, Cu, 6 mm², pf=0.95, T=50°C
//      R20(6mm²) = 0.017241/6 = 2.8735 mΩ/m = 0.0028735 Ω/m
//      R50 = 0.0028735×(1+0.00393×30)×40 = 0.0028735×1.1179×40 = 0.12849 Ω
//      X = 0.08/1000×40 = 0.0032 Ω
//      sin = √(1−0.9025) = 0.31225
//      k = 2 (1φ)
//      Vd = 2×32×(0.12849×0.95 + 0.0032×0.31225)
//         = 64×(0.12207 + 0.000999) = 64×0.12307 = 7.88 V
//      Vd% = 7.88/230×100 = 3.42%
// ═══════════════════════════════════════════════════════════════════════════
run(
  '45 · Voltage Drop 1φ  (230 V, 32 A, 40 m, 6 mm² Cu, 50°C)',
  voltageDrop,
  { V: 230, ph: '1', I: 32, L: 40, mat: 'Cu', size: 6, pf: 0.95, T: 50 },
  [
    { label: 'Voltage drop ΔU',  expected: 7.88 },
    { label: 'Resistance R',     expected: 0.128 },
    { label: 'Voltage at load',  expected: 222.12 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  46. SHORT-CIRCUIT I²t (PASS case)
//      Isc=5000 A, S=95 mm², Cu, PVC, t=0.1 s, I2t_dev=0
//      k = 115 (PVC/Cu)
//      I2t_cable = (115×95)² = 10925² = 119355625 → 119.356 kA²s
//      I2t_source = 5000²×0.1 = 2500000 → 2.5 kA²s
//      verdict: 119.356 > 2.5 → PASS
// ═══════════════════════════════════════════════════════════════════════════
run(
  '46 · Short-Circuit I²t  (5 kA, 95 mm² Cu/PVC, 0.1 s)',
  shortCircuit,
  { Isc: 5000, S: 95, mat: 'Cu', ins: 'PVC', t: 0.1, I2t_dev: 0 },
  [
    { label: 'Material constant k',  expected: 115 },
    { label: 'Cable I²t withstand',  expected: 119.356 },
    { label: 'Source I²t',           expected: 2.5 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  47. GROUND RESISTANCE (multiple rods)
//      ρ=150 Ω·m, L=3 m, d=0.016 m, n=3, s=4 m
//      R_single = 150/(2π×3)×ln(4×3/0.016) = 7.9577×ln(750) = 7.9577×6.6201 = 52.68 Ω
//      Rn = R/n × (1 + ρ/(π×s×R))
//         = 52.68/3 × (1 + 150/(π×4×52.68))
//         = 17.56 × (1 + 150/661.95)
//         = 17.56 × (1 + 0.2266)
//         = 17.56 × 1.2266 = 21.54 Ω
// ═══════════════════════════════════════════════════════════════════════════
run(
  '47 · Ground Resistance  (3 rods, ρ=150, L=3 m, s=4 m)',
  groundRes,
  { type: 'rod', rho: 150, L: 3, d: 0.016, W: 0.6, A: 1, n: 3, s: 4 },
  [
    { label: 'Single electrode', expected: 52.68 },
    { label: 'Multi-rod',        expected: 21.54 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  48. TRANSFORMER SIZING (1φ)
//      P=10 kW, pf=0.95, df=1.0, grow=0%, Vll=240, eff=0.98, 1φ
//      S_load = (10000/0.95)×1.0×1.0 = 10526.3 VA = 10.53 kVA
//      S_tx = 10526.3/0.98 = 10741.1 VA = 10.74 kVA
//      next std = 15 kVA
//      loading = 10.53/15×100 = 70.18%
//      I_sec = 15000/240 = 62.5 A
// ═══════════════════════════════════════════════════════════════════════════
run(
  '48 · Transformer Sizing 1φ  (10 kW, 240 V)',
  txSizing,
  { P: 10, pf: 0.95, df: 1.0, grow: 0, Vll: 240, eff: 0.98, ph: '1' },
  [
    { label: 'Required apparent',  expected: 10.53 },
    { label: 'Adjusted for losses', expected: 10.74 },
    { label: 'Standard size',      expected: 15 },
    { label: 'Loading at full',    expected: 70.18 },
    { label: 'Secondary current',  expected: 62.5 },
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
//  REPORT
// ═══════════════════════════════════════════════════════════════════════════
const passed = results.filter((r) => r.pass).length;
const failed = results.length - passed;

console.log('');
console.log('═'.repeat(80));
console.log(`  INDEPENDENT ACCURACY TEST · ${passed}/${results.length} PASS · ${failed} FAIL`);
console.log('═'.repeat(80));
for (const r of results) {
  console.log('');
  console.log(`${r.pass ? '✅' : '❌'}  ${r.name}`);
  for (const l of r.lines) console.log(l);
}
console.log('');
console.log('═'.repeat(80));
console.log(`  SUMMARY: ${passed} pass · ${failed} fail · ${results.length} total`);
console.log('═'.repeat(80));

process.exit(failed === 0 ? 0 : 1);
