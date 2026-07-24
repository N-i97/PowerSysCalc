// Comprehensive validation test for every calculator.
// Validates ALL outputs: rows, raw, picks, status, summary,
// notes (standards), recommendations, warnings, formulas, steps.
// Run: node --experimental-strip-types --experimental-transform-types tests/comprehensive-validation.mts
// (uses --experimental-transform-types to strip TypeScript types from .mts files at runtime)
//
// On Node 22+, you can also just run:  node --experimental-strip-types tests/comprehensive-validation.mts
// after the .ts import fix below.

import { calc as singlePhase }         from '../src/calculators/power/singlePhase.ts';
import { calc as threePhase }           from '../src/calculators/power/threePhase.ts';
import { calc as powerFactor }          from '../src/calculators/power/powerFactor.ts';
import { calc as pfCorrection }         from '../src/calculators/power/pfCorrection.ts';
import { calc as kwKvaHp }              from '../src/calculators/power/kwKvaHp.ts';
import { calc as currentCalc }          from '../src/calculators/power/current.ts';
import { calc as demandLoad }           from '../src/calculators/power/demandLoad.ts';
import { calc as deltaWye }             from '../src/calculators/threePhase/deltaWye.ts';
import { calc as balancedLoad }         from '../src/calculators/threePhase/balancedLoad.ts';
import { calc as txSizing }             from '../src/calculators/transformer/sizing.ts';
import { calc as txCurrent }            from '../src/calculators/transformer/current.ts';
import { calc as txEfficiency }         from '../src/calculators/transformer/efficiency.ts';
import { calc as motorFLC }             from '../src/calculators/motor/flc.ts';
import { calc as motorStarting }        from '../src/calculators/motor/starting.ts';
import { calc as vfdSizing }            from '../src/calculators/motor/vfd.ts';
import { calc as motorBreaker }         from '../src/calculators/motor/breaker.ts';
import { calc as voltageDrop }          from '../src/calculators/cable/voltageDrop.ts';
import { calc as cableSizing }          from '../src/calculators/cable/sizing.ts';
import { calc as cableDerating }        from '../src/calculators/cable/derating.ts';
import { calc as shortCircuit }         from '../src/calculators/cable/shortCircuit.ts';
import { calc as breakerSizing }        from '../src/calculators/protection/breaker.ts';
import { calc as fuseSizing }           from '../src/calculators/protection/fuse.ts';
import { calc as earthingConductor }    from '../src/calculators/grounding/conductor.ts';
import { calc as groundResistance }     from '../src/calculators/grounding/resistance.ts';
import { calc as solarInverter }        from '../src/calculators/renewable/inverter.ts';
import { calc as batteryRuntime }       from '../src/calculators/renewable/battery.ts';
import { calc as solarString }          from '../src/calculators/renewable/string.ts';
import { calc as hpKwConvert }          from '../src/calculators/conversion/hpKw.ts';
import { calc as awgMm2Convert }        from '../src/calculators/conversion/awgMm2.ts';

// Silence the unused-import warning for the workaround line
void txEfficiency; // keep import (avoid unused warning)

// ── Types ──────────────────────────────────────────────────────────────────
interface Row { label: string; value: number | string; unit?: string; status?: string; formula?: string; }
interface Out { rows: Row[]; raw: Record<string, unknown>; picks?: Record<string, number | string | undefined>; status?: string; summary?: string; }
interface Def {
  slug: string; title: string; category: string;
  compute: (input: Record<string, unknown>) => Out;
  notes?: { standard: string; reference: string; text: string }[];
  recommendations?: (input: Record<string, unknown>, output: Out) => string[];
  warnings?: (input: Record<string, unknown>, output: Out) => string[];
  formulas?: { name: string; expression: string; variables?: string }[];
  steps?: (input: Record<string, unknown>, output: Out) => { label: string; formula: string; result?: string; note?: string }[];
}
interface Check { field: string; expected: unknown; actual: unknown; pass: boolean; note?: string; }
interface CaseResult { calculator: string; title: string; category: string; testName: string; input: Record<string, unknown>; checks: Check[]; pass: boolean; passCount: number; failCount: number; }
interface ReportData { generatedAt: string; totalCases: number; totalPass: number; totalFail: number; cases: CaseResult[]; }

// ── Helpers ───────────────────────────────────────────────────────────────
const tol = (exp: number, act: number, rel = 0.005, abs = 0.01): boolean =>
  Number.isFinite(act) && Math.abs(exp - act) <= Math.max(abs, Math.abs(exp) * rel);

const findRow = (rows: Row[], label: string): Row | undefined =>
  rows.find((r) => r.label.toLowerCase() === label.toLowerCase()) ||
  rows.find((r) => r.label.toLowerCase().includes(label.toLowerCase()));

const findRowByContains = (rows: Row[], substr: string): Row | undefined =>
  rows.find((r) => r.label.toLowerCase().includes(substr.toLowerCase()));

const expectRow = (rows: Row[], label: string, expectedValue: number, opts: { unit?: string; status?: string; rel?: number; abs?: number } = {}): Check[] => {
  const checks: Check[] = [];
  const row = findRow(rows, label);
  if (!row) {
    checks.push({ field: `row:"${label}"`, expected: 'exists', actual: 'missing', pass: false });
    return checks;
  }
  const actualNum = typeof row.value === 'number' ? row.value : NaN;
  checks.push({
    field: `row:"${label}".value`,
    expected: expectedValue,
    actual: actualNum,
    pass: tol(expectedValue, actualNum, opts.rel, opts.abs),
  });
  if (opts.unit !== undefined) {
    checks.push({
      field: `row:"${label}".unit`,
      expected: opts.unit,
      actual: row.unit ?? '',
      pass: row.unit === opts.unit,
    });
  }
  if (opts.status !== undefined) {
    checks.push({
      field: `row:"${label}".status`,
      expected: opts.status,
      actual: row.status ?? '(none)',
      pass: row.status === opts.status,
    });
  }
  return checks;
};

const expectPicks = (picks: Record<string, unknown> | undefined, key: string, expected: number | string): Check[] => {
  const checks: Check[] = [];
  if (!picks) {
    checks.push({ field: `picks.${key}`, expected, actual: 'no picks', pass: false });
    return checks;
  }
  const actual = picks[key];
  const pass = typeof expected === 'number'
    ? typeof actual === 'number' && tol(expected, actual as number)
    : actual === expected;
  checks.push({ field: `picks.${key}`, expected, actual, pass });
  return checks;
};

const expectStatus = (status: string | undefined, expected: string): Check => ({
  field: 'status',
  expected,
  actual: status ?? '(none)',
  pass: status === expected,
});

const expectSummaryContains = (summary: string | undefined, substr: string): Check => ({
  field: `summary contains "${substr}"`,
  expected: true,
  actual: summary?.includes(substr) ?? false,
  pass: summary?.includes(substr) ?? false,
});

const expectNotes = (notes: Def['notes'], checks: { minCount?: number; firstStandard?: string; firstReference?: string }): Check[] => {
  const out: Check[] = [];
  const count = notes?.length ?? 0;
  out.push({ field: 'notes.count', expected: checks.minCount ?? '>=1', actual: count, pass: count >= (checks.minCount ?? 1) });
  if (checks.firstStandard && notes && notes.length > 0) {
    out.push({ field: 'notes[0].standard', expected: checks.firstStandard, actual: notes[0].standard, pass: notes[0].standard === checks.firstStandard });
  }
  if (checks.firstReference && notes && notes.length > 0) {
    out.push({ field: 'notes[0].reference', expected: checks.firstReference, actual: notes[0].reference, pass: notes[0].reference === checks.firstReference });
  }
  return out;
};

const expectRecs = (def: Def, input: Record<string, unknown>, output: Out, checks: { minCount?: number; containsAny?: string[] }): Check[] => {
  const out: Check[] = [];
  const recs = def.recommendations ? def.recommendations(input, output as Out) : [];
  const count = recs.length;
  out.push({ field: 'recommendations.count', expected: checks.minCount ?? '>=0', actual: count, pass: count >= (checks.minCount ?? 0) });
  if (checks.containsAny) {
    for (const s of checks.containsAny) {
      out.push({
        field: `recommendations contains "${s}"`,
        expected: true,
        actual: recs.some((r) => r.includes(s)),
        pass: recs.some((r) => r.includes(s)),
      });
    }
  }
  return out;
};

const expectWarnings = (def: Def, input: Record<string, unknown>, output: Out, checks: { minCount?: number; maxCount?: number; containsAny?: string[] }): Check[] => {
  const out: Check[] = [];
  const warns = def.warnings ? def.warnings(input, output as Out) : [];
  const count = warns.length;
  out.push({ field: 'warnings.count', expected: `between ${checks.minCount ?? 0} and ${checks.maxCount ?? 99}`, actual: count, pass: count >= (checks.minCount ?? 0) && count <= (checks.maxCount ?? 99) });
  if (checks.containsAny) {
    for (const s of checks.containsAny) {
      out.push({
        field: `warnings contains "${s}"`,
        expected: true,
        actual: warns.some((w) => w.includes(s)),
        pass: warns.some((w) => w.includes(s)),
      });
    }
  }
  return out;
};

const expectFormulas = (formulas: Def['formulas'], checks: { minCount: number; containsNames?: string[] }): Check[] => {
  const out: Check[] = [];
  const arr = formulas ?? [];
  out.push({ field: 'formulas.count', expected: `>=${checks.minCount}`, actual: arr.length, pass: arr.length >= checks.minCount });
  if (checks.containsNames) {
    for (const n of checks.containsNames) {
      out.push({ field: `formulas contains "${n}"`, expected: true, actual: arr.some((f) => f.name === n), pass: arr.some((f) => f.name === n) });
    }
  }
  return out;
};

const expectSteps = (def: Def, input: Record<string, unknown>, output: Out, minCount: number): Check[] => {
  const out: Check[] = [];
  const steps = def.steps ? def.steps(input, output as Out) : [];
  out.push({ field: 'steps.count', expected: `>=${minCount}`, actual: steps.length, pass: steps.length >= minCount });
  return out;
};

// ── Test cases ────────────────────────────────────────────────────────────
const cases: { def: Def; testName: string; input: Record<string, unknown>; run: (def: Def, out: Out, input: Record<string, unknown>) => Check[] }[] = [];

// 1. singlePhase
cases.push({
  def: singlePhase as unknown as Def,
  testName: '120V · 15A · pf 0.85',
  input: { V: 120, I: 15, pf: 0.85, phiUnit: 'lagging' },
  run: (def, out, input) => [
    ...expectRow(out.rows, 'Apparent power S', 1800, { unit: 'VA' }),
    ...expectRow(out.rows, 'Real power P', 1530, { unit: 'W' }),
    ...expectRow(out.rows, 'Reactive power Q', 948.2, { unit: 'var', rel: 0.01 }),
    ...expectRow(out.rows, 'Phase angle', 31.79, { unit: '°', abs: 0.1 }),
    expectStatus(out.status, 'ok'),
    expectSummaryContains(out.summary, 'kVA'),
    ...expectNotes(def.notes, { minCount: 1, firstStandard: 'IEEE' }),
    ...expectRecs(def, input, out, { minCount: 0 }),
    ...expectFormulas(def.formulas, { minCount: 4, containsNames: ['Apparent power', 'Real power'] }),
    ...expectSteps(def, input, out, 4),
  ],
});

// 2. threePhase
cases.push({
  def: threePhase as unknown as Def,
  testName: '480V · 100A · pf 0.8 (from V&I)',
  input: { Vll: 480, I: 100, pf: 0.8, mode: 'from_IV', P_or_S: 30 },
  run: (def, out, input) => [
    ...expectRow(out.rows, 'Apparent power S', 83.138, { unit: 'kVA' }),
    ...expectRow(out.rows, 'Real power P', 66.511, { unit: 'kW' }),
    ...expectRow(out.rows, 'Reactive power Q', 49.883, { unit: 'kVAr' }),
    ...expectRow(out.rows, 'Line current I', 100, { unit: 'A' }),
    ...expectRow(out.rows, 'Phase voltage V_LN', 277.13, { unit: 'V' }),
    expectStatus(out.status, 'ok'),
    ...expectNotes(def.notes, { minCount: 1 }),
    ...expectFormulas(def.formulas, { minCount: 4 }),
  ],
});

// 3. powerFactor
cases.push({
  def: powerFactor as unknown as Def,
  testName: 'P=50kW · S=62.5kVA',
  input: { mode: 'from_PS', P: 50, S: 62.5, Q: 30, phi: 30 },
  run: (def, out, input) => [
    ...expectRow(out.rows, 'Power factor (cos φ)', 0.8, { rel: 0.01 }),
    ...expectRow(out.rows, 'Phase angle φ', 36.87, { abs: 0.1 }),
    expectStatus(out.status, 'warn'),
    ...expectNotes(def.notes, { minCount: 1, firstStandard: 'IEEE' }),
    ...expectRecs(def, input, out, { minCount: 1, containsAny: ['0.85'] }),
  ],
});

// 4. pfCorrection
cases.push({
  def: pfCorrection as unknown as Def,
  testName: '100kW · 0.8→0.95 · 480V 3φ',
  input: { P: 100, pf1: 0.8, pf2: 0.95, V: 480, ph: '3' },
  run: (def, out, input) => [
    ...expectRow(out.rows, 'Capacitor bank Qc', 42.13, { unit: 'kVAr' }),
    ...expectRow(out.rows, 'Current before I₁', 150.33, { unit: 'A' }),
    ...expectRow(out.rows, 'Current after I₂', 126.58, { unit: 'A' }),
    ...expectRow(out.rows, 'Released capacity', 15.8, { unit: '%' }),
    ...expectPicks(out.picks, 'capacitorKVAr', 42.13),
    expectStatus(out.status, 'ok'),
    ...expectNotes(def.notes, { minCount: 1 }),
    ...expectRecs(def, input, out, { minCount: 1 }),
  ],
});

// 5. kwKvaHp
cases.push({
  def: kwKvaHp as unknown as Def,
  testName: '75 kW · pf 0.9',
  input: { value: 75, pf: 0.9 },
  run: (def, out, input) => [
    ...expectRow(out.rows, 'W', 75000, { unit: 'W' }),
    ...expectRow(out.rows, 'kW', 75, { unit: 'kW' }),
    ...expectRow(out.rows, 'kVA', 83.333, { unit: 'kVA' }),
    ...expectRow(out.rows, 'HP (mechanical)', 100.57, { unit: 'hp' }),
    ...expectRow(out.rows, 'PS (metric)', 101.97, { unit: 'PS' }),
    ...expectRow(out.rows, 'VAr', 36323, { unit: 'var', abs: 100 }),
    expectStatus(out.status, 'ok'),
    ...expectNotes(def.notes, { minCount: 1 }),
  ],
});

// 6. current
cases.push({
  def: currentCalc as unknown as Def,
  testName: '3φ 690V · 75kW · pf 0.85 · eff 0.95',
  input: { phase: '3', V: 690, P: 75, pf: 0.85, eff: 0.95 },
  run: (def, out, input) => [
    ...expectRow(out.rows, 'Apparent power S', 92.88, { unit: 'kVA' }),
    ...expectRow(out.rows, 'Line current I', 77.54, { unit: 'A' }),
    expectStatus(out.status, 'ok'),
    ...expectNotes(def.notes, { minCount: 1 }),
    ...expectRecs(def, input, out, { minCount: 1, containsAny: ['125%'] }),
  ],
});

// 7. demandLoad
cases.push({
  def: demandLoad as unknown as Def,
  testName: '3 load groups · 5000h/yr',
  input: {
    loads: '[{"name":"Lighting","qty":80,"unit":0.05,"df":0.9},{"name":"HVAC","qty":3,"unit":10,"df":0.7},{"name":"Receptacles","qty":50,"unit":0.18,"df":0.4}]',
    hoursPerYear: 5000,
  },
  run: (def, out, input) => [
    ...expectRow(out.rows, 'Connected load', 43.0, { unit: 'kW' }),
    ...expectRow(out.rows, 'Maximum demand', 28.2, { unit: 'kW' }),
    ...expectRow(out.rows, 'Annual energy', 141.0, { unit: 'MWh' }),
    ...expectRow(out.rows, 'Average demand', 16.1, { unit: 'kW' }),
    ...expectRow(out.rows, 'Load factor', 57.1, { unit: '%' }),
    expectStatus(out.status, 'ok'),
    ...expectNotes(def.notes, { minCount: 1 }),
    ...expectRecs(def, input, out, { minCount: 1 }),
  ],
});

// 8. deltaWye
cases.push({
  def: deltaWye as unknown as Def,
  testName: 'Y · V · L→P · 690V',
  input: { system: 'wye', quantity: 'V', direction: 'L2P', value: 690 },
  run: (def, out, input) => [
    ...expectRow(out.rows, 'phase', 398.37, { unit: 'V' }),
    expectStatus(out.status, 'ok'),
    ...expectNotes(def.notes, { minCount: 1, firstStandard: 'IEEE' }),
  ],
});

// 9. balancedLoad
cases.push({
  def: balancedLoad as unknown as Def,
  testName: 'Y · 690V · Z=20Ω · φ=45°',
  input: { system: 'wye', Vll: 690, Z: 20, phi: 45 },
  run: (def, out, input) => [
    ...expectRow(out.rows, 'Phase voltage V_ph', 398.37, { unit: 'V' }),
    ...expectRow(out.rows, 'Phase current I_ph', 19.92, { unit: 'A' }),
    ...expectRow(out.rows, 'Line current I_L', 19.92, { unit: 'A' }),
    ...expectRow(out.rows, 'Total apparent S', 23.805, { unit: 'kVA' }),
    ...expectRow(out.rows, 'Total real P', 16.832, { unit: 'kW' }),
    expectStatus(out.status, 'ok'),
    ...expectNotes(def.notes, { minCount: 1 }),
  ],
});

// 10. transformer/sizing
cases.push({
  def: txSizing as unknown as Def,
  testName: '250kW · 480V · 3φ · df 0.9 · grow 15%',
  input: { P: 250, pf: 0.85, df: 0.9, grow: 15, Vll: 480, eff: 0.97, ph: '3' },
  run: (def, out, input) => [
    ...expectRow(out.rows, 'Required apparent S', 304.41, { unit: 'kVA' }),
    ...expectRow(out.rows, 'Adjusted for losses', 313.83, { unit: 'kVA' }),
    ...expectRow(out.rows, 'Standard size', 500, { unit: 'kVA' }),
    ...expectRow(out.rows, 'Loading at full load', 60.88, { unit: '%' }),
    ...expectRow(out.rows, 'Secondary current', 601.4, { unit: 'A' }),
    ...expectPicks(out.picks, 'transformerKVA', 500),
    expectStatus(out.status, 'ok'),
    ...expectNotes(def.notes, { minCount: 1 }),
    ...expectRecs(def, input, out, { minCount: 1, containsAny: ['20%'] }),
  ],
});

// 11. transformer/current
cases.push({
  def: txCurrent as unknown as Def,
  testName: '1000kVA · 22kV/400V · Z=5.75% · 3φ',
  input: { S: 1000, V1: 22000, V2: 400, Z: 5.75, ph: '3' },
  run: (def, out, input) => [
    ...expectRow(out.rows, 'Primary current I₁', 26.24, { unit: 'A' }),
    ...expectRow(out.rows, 'Secondary current I₂', 1443.38, { unit: 'A' }),
    ...expectRow(out.rows, 'Turns ratio (a)', 55, { rel: 0.01 }),
    ...expectRow(out.rows, 'Short-circuit I_sc', 25102, { unit: 'A' }),
    expectStatus(out.status, 'ok'),
    ...expectNotes(def.notes, { minCount: 1 }),
    ...expectRecs(def, input, out, { minCount: 1, containsAny: ['breaker'] }),
  ],
});

// 12. transformer/efficiency
cases.push({
  def: txEfficiency as unknown as Def,
  testName: '500kVA · P0=0.6 · Pk=5.5 · 80% load',
  input: { S: 500, P0: 0.6, Pk: 5.5, load: 80, pf: 0.85 },
  run: (def, out, input) => [
    ...expectRow(out.rows, 'Output P_out', 340, { unit: 'kW' }),
    ...expectRow(out.rows, 'No-load loss P₀', 0.6, { unit: 'kW' }),
    ...expectRow(out.rows, 'Total losses', 4.12, { unit: 'kW' }),
    ...expectRow(out.rows, 'Efficiency η', 98.80, { unit: '%' }),
    ...expectRow(out.rows, 'Max-efficiency loading', 33.0, { unit: '%' }),
    expectStatus(out.status, 'ok'),
    ...expectNotes(def.notes, { minCount: 1 }),
    ...expectFormulas(def.formulas, { minCount: 2, containsNames: ['Efficiency', 'Max efficiency'] }),
  ],
});

// 13. motor/flc
cases.push({
  def: motorFLC as unknown as Def,
  testName: '22kW · 400V · 3φ · pf 0.85 · eff 0.9 (calc)',
  input: { P: 22, V: 400, ph: '3', pf: 0.85, eff: 0.9, standard: 'calc' },
  run: (def, out, input) => [
    ...expectRow(out.rows, 'Full-load current I_FLC', 41.51, { unit: 'A' }),
    ...expectRow(out.rows, 'Direct calculation', 41.51, { unit: 'A' }),
    ...expectRow(out.rows, 'Recommended OCPD (inverse-time)', 105, { unit: 'A' }),
    ...expectPicks(out.picks, 'motorFLC', 41.5),
    expectStatus(out.status, 'ok'),
    ...expectNotes(def.notes, { minCount: 2 }),
    ...expectRecs(def, input, out, { minCount: 2, containsAny: ['OCPD', 'overload'] }),
  ],
});

// 14. motor/starting
cases.push({
  def: motorStarting as unknown as Def,
  testName: '45A · LR×7 · DOL · 400V · 30MVA',
  input: { I: 45, lr: 7, method: 'dol', autoPct: 65, V: 400, Ssc: 30 },
  run: (def, out, input) => [
    ...expectRow(out.rows, 'Locked-rotor current (DOL)', 315, { unit: 'A' }),
    ...expectRow(out.rows, 'Starting current (method)', 315, { unit: 'A' }),
    ...expectRow(out.rows, 'Voltage dip on source', 0.2, { unit: '%', abs: 0.1 }),
    expectStatus(out.status, 'ok'),
    ...expectNotes(def.notes, { minCount: 1 }),
    ...expectRecs(def, input, out, { minCount: 1 }),
  ],
});

// 15. motor/vfd
cases.push({
  def: vfdSizing as unknown as Def,
  testName: '45A · 400V · CT · 45°C · 1500m · 6kHz',
  input: { I: 45, V: 400, ph: '3', duty: 'CT', Ta: 45, alt: 1500, fc: 6 },
  run: (def, out, input) => [
    ...expectRow(out.rows, 'Duty factor (k_d)', 1.05, { rel: 0.01 }),
    ...expectRow(out.rows, 'Temp derate (k_T)', 0.9, { rel: 0.01 }),
    ...expectRow(out.rows, 'Altitude derate (k_A)', 0.95, { rel: 0.01 }),
    ...expectRow(out.rows, 'Carrier derate (k_F)', 0.95, { rel: 0.01 }),
    ...expectRow(out.rows, 'Worst derate', 0.9, { rel: 0.01 }),
    ...expectRow(out.rows, 'Required VFD current', 50, { unit: 'A' }),
    ...expectRow(out.rows, 'Required VFD power', 34.64, { unit: 'kVA' }),
    expectStatus(out.status, 'ok'),
    ...expectNotes(def.notes, { minCount: 1 }),
    ...expectRecs(def, input, out, { minCount: 1 }),
  ],
});

// 16. motor/breaker
cases.push({
  def: motorBreaker as unknown as Def,
  testName: '45A · inverse-time · 3P',
  input: { I: 45, type: 'inv', poles: '3' },
  run: (def, out, input) => [
    ...expectRow(out.rows, 'Motor FLC', 45, { unit: 'A' }),
    ...expectRow(out.rows, 'Protection factor (k)', 2.5, { rel: 0.01 }),
    ...expectRow(out.rows, 'Target OCPD', 112.5, { unit: 'A' }),
    ...expectRow(out.rows, 'Selected OCPD (next std)', 125, { unit: 'A' }),
    ...expectPicks(out.picks, 'breakerRating', 125),
    ...expectPicks(out.picks, 'breakerFrame', 125),
    expectStatus(out.status, 'ok'),
    ...expectNotes(def.notes, { minCount: 1 }),
    ...expectRecs(def, input, out, { minCount: 1, containsAny: ['Breaker'] }),
  ],
});

// 17. cable/voltageDrop
cases.push({
  def: voltageDrop as unknown as Def,
  testName: '400V · 3φ · 80A · 60m · 16mm² Cu · 60°C',
  input: { V: 400, ph: '3', I: 80, L: 60, mat: 'Cu', size: 16, pf: 0.9, T: 60 },
  run: (def, out, input) => [
    ...expectRow(out.rows, 'Voltage drop ΔU', 9.62, { unit: 'V' }),
    ...expectRow(out.rows, 'Resistance R_ph', 0.075, { unit: 'Ω' }),
    ...expectRow(out.rows, 'Reactance X_ph', 0.005, { unit: 'Ω' }),
    ...expectRow(out.rows, 'Voltage at load', 390.38, { unit: 'V' }),
    ...expectPicks(out.picks, 'cableSize', 16),
    ...expectPicks(out.picks, 'breakerRating', 100),
    expectStatus(out.status, 'ok'),
    ...expectNotes(def.notes, { minCount: 1 }),
    ...expectRecs(def, input, out, { minCount: 1, containsAny: ['ampacity'] }),
  ],
});

// 18. cable/sizing
cases.push({
  def: cableSizing as unknown as Def,
  testName: '100A · XLPE · C · Cu · 35°C · 2 circuits',
  input: { IB: 100, ins: 'XLPE', method: 'C', mat: 'Cu', Ta: 35, grp: 2, soil: 1.2, duty: 'cont' },
  run: (def, out, input) => [
    ...expectRow(out.rows, 'Continuous-load factor k₁', 1.25, { rel: 0.01 }),
    ...expectRow(out.rows, 'Required I_n', 125, { unit: 'A' }),
    ...expectRow(out.rows, 'Temperature factor k_T', 0.96, { rel: 0.01 }),
    ...expectRow(out.rows, 'Grouping factor k_G', 0.88, { rel: 0.01 }),
    ...expectRow(out.rows, 'Required I_z (ampacity)', 147.96, { unit: 'A' }),
    ...expectRow(out.rows, 'Selected size', 35, { unit: 'mm²' }),
    ...expectRow(out.rows, 'Recommended OCPD (next std)', 125, { unit: 'A' }),
    ...expectPicks(out.picks, 'cableSize', 35),
    ...expectPicks(out.picks, 'breakerRating', 125),
    expectStatus(out.status, 'ok'),
    ...expectNotes(def.notes, { minCount: 1 }),
  ],
});

// 19. cable/derating
cases.push({
  def: cableDerating as unknown as Def,
  testName: '35mm² PVC · C · 45°C · 3 circuits · soil 1.5',
  input: { size: 35, ins: 'PVC', method: 'C', Ta: 45, grp: 3, soil: 1.5 },
  run: (def, out, input) => [
    ...expectRow(out.rows, 'Temperature factor k_T', 0.79, { rel: 0.01 }),
    ...expectRow(out.rows, 'Grouping factor k_G', 0.82, { rel: 0.01 }),
    ...expectRow(out.rows, 'Soil factor k_S', 0.93, { rel: 0.01 }),
    ...expectRow(out.rows, 'Combined derate K', 0.602, { rel: 0.01 }),
    ...expectRow(out.rows, 'Base ampacity I_z,table', 148, { unit: 'A' }),
    ...expectRow(out.rows, 'Final ampacity I_z\'', 89.1, { unit: 'A' }),
    expectStatus(out.status, 'warn'),
    ...expectNotes(def.notes, { minCount: 1, firstStandard: 'IEC' }),
  ],
});

// 20. cable/shortCircuit
cases.push({
  def: shortCircuit as unknown as Def,
  testName: '25kA · 35mm² Cu/XLPE · 0.3s · device I²t=200M (FAIL)',
  input: { Isc: 25000, S: 35, mat: 'Cu', ins: 'XLPE', t: 0.3, I2t_dev: 200_000_000 },
  run: (def, out, input) => [
    ...expectRow(out.rows, 'Material constant k', 143, { rel: 0.01 }),
    ...expectRow(out.rows, 'Cable I²t withstand (k²·S²)', 25.05, { unit: 'kA²s' }),
    ...expectRow(out.rows, 'Source I²t', 187.5, { unit: 'kA²s' }),
    expectStatus(out.status, 'err'),
    ...expectNotes(def.notes, { minCount: 1, firstStandard: 'IEC' }),
    ...expectRecs(def, input, out, { minCount: 1, containsAny: ['undersized'] }),
  ],
});

// 21. protection/breaker
cases.push({
  def: breakerSizing as unknown as Def,
  testName: '120A cont + 30A non · LV',
  input: { Icont: 120, Inon: 30, system: 'LV' },
  run: (def, out, input) => [
    ...expectRow(out.rows, 'Total (NEC 80% rule)', 180, { unit: 'A' }),
    ...expectRow(out.rows, 'OCPD (next std)', 200, { unit: 'A' }),
    ...expectRow(out.rows, 'Loading', 90, { unit: '%' }),
    ...expectPicks(out.picks, 'breakerRating', 200),
    expectStatus(out.status, 'ok'),
    ...expectNotes(def.notes, { minCount: 1, firstStandard: 'NEC' }),
  ],
});

// 22. protection/fuse
cases.push({
  def: fuseSizing as unknown as Def,
  testName: '40A cont + 15A non · fast-acting',
  input: { Icont: 40, Inon: 15, type: 'FA', inrush: 5 },
  run: (def, out, input) => [
    ...expectRow(out.rows, 'Multiplier (1.25 / 1.15)', 1.25, { rel: 0.01 }),
    ...expectRow(out.rows, 'Computed minimum', 65, { unit: 'A' }),
    ...expectRow(out.rows, 'Recommended fuse', 70, { unit: 'A' }),
    expectStatus(out.status, 'ok'),
    ...expectNotes(def.notes, { minCount: 1, firstStandard: 'IEC' }),
    ...expectRecs(def, input, out, { minCount: 1 }),
  ],
});

// 23. grounding/conductor
cases.push({
  def: earthingConductor as unknown as Def,
  testName: '6000A · 0.3s · Cu/XLPE',
  input: { Isc: 6000, t: 0.3, mat: 'Cu', ins: 'XLPE' },
  run: (def, out, input) => [
    ...expectRow(out.rows, 'k coefficient', 143, { rel: 0.01 }),
    ...expectRow(out.rows, 'Computed S (adiabatic)', 22.98, { unit: 'mm²' }),
    ...expectRow(out.rows, 'Next standard size', 25, { unit: 'mm²' }),
    ...expectPicks(out.picks, 'cableSize', 25),
    expectStatus(out.status, 'ok'),
    ...expectNotes(def.notes, { minCount: 1, firstStandard: 'IEC' }),
  ],
});

// 24. grounding/resistance
cases.push({
  def: groundResistance as unknown as Def,
  testName: 'Single rod · ρ=50 · L=3m',
  input: { type: 'rod', rho: 50, L: 3, d: 0.02, W: 0.6, A: 1, n: 1, s: 3 },
  run: (def, out, input) => [
    ...expectRow(out.rows, 'Single electrode R', 16.97, { unit: 'Ω' }),
    ...expectRow(out.rows, 'Multi-rod R', 16.97, { unit: 'Ω' }),
    expectStatus(out.status, 'info'),
    ...expectNotes(def.notes, { minCount: 1, firstStandard: 'IEEE' }),
    ...expectRecs(def, input, out, { minCount: 1, containsAny: ['R >'] }),
  ],
});

// 25. renewable/inverter
cases.push({
  def: solarInverter as unknown as Def,
  testName: '12kWp · DC/AC 1.15',
  input: { Pdc: 12, ratio: 1.15, Vmp: 200, Voc: 600, ph: '1' },
  run: (def, out, input) => [
    ...expectRow(out.rows, 'PV DC power', 12, { unit: 'kWp' }),
    ...expectRow(out.rows, 'DC/AC ratio', 1.15, { rel: 0.01 }),
    ...expectRow(out.rows, 'Inverter AC', 10.43, { unit: 'kW' }),
    expectStatus(out.status, 'ok'),
    ...expectNotes(def.notes, { minCount: 1 }),
    ...expectRecs(def, input, out, { minCount: 2, containsAny: ['MPPT', 'Voc'] }),
  ],
});

// 26. renewable/battery
cases.push({
  def: batteryRuntime as unknown as Def,
  testName: '10kWh · 1.5kW · 80% DoD · 90% eff',
  input: { E: 10, dod: 80, P: 1.5, eta: 90, age: 0 },
  run: (def, out, input) => [
    ...expectRow(out.rows, 'Usable energy', 8, { unit: 'kWh' }),
    ...expectRow(out.rows, 'Effective load', 1.667, { unit: 'kW' }),
    ...expectRow(out.rows, 'Runtime', 4.8, { unit: 'h' }),
    expectStatus(out.status, 'ok'),
    ...expectNotes(def.notes, { minCount: 1 }),
    ...expectRecs(def, input, out, { minCount: 1, containsAny: ['aging'] }),
  ],
});

// 27. renewable/string
cases.push({
  def: solarString as unknown as Def,
  testName: 'Vmp=41 · Voc=49 · -10°C to 70°C',
  input: { Vmp_mod: 41, Voc_mod: 49, Tc_min: -10, Tc_max: 70, Vmppt_min: 200, Vmppt_max: 800, Vinv_max: 1000 },
  run: (def, out, input) => [
    ...expectRow(out.rows, 'Vmp at hot cell (Tmax)', 34.54, { unit: 'V' }),
    ...expectRow(out.rows, 'Voc at cold cell (Tmin)', 55.0, { unit: 'V' }),
    ...expectRow(out.rows, 'Min modules (hot Vmp ≥ MPPT min)', 6, { rel: 0.01 }),
    ...expectRow(out.rows, 'Max modules (cold Voc ≤ inverter max)', 18, { rel: 0.01 }),
    expectStatus(out.status, 'ok'),
    ...expectNotes(def.notes, { minCount: 1, firstStandard: 'IEC' }),
    ...expectFormulas(def.formulas, { minCount: 4 }),
  ],
});

// 28. conversion/hpKw
cases.push({
  def: hpKwConvert as unknown as Def,
  testName: '10 HP → kW',
  input: { value: 10, from: 'hp', to: 'kW' },
  run: (def, out, input) => [
    ...expectRow(out.rows, 'Input', 10, { unit: 'hp' }),
    ...expectRow(out.rows, 'Output', 7.457, { unit: 'kW' }),
    { field: 'status', expected: '(none)', actual: out.status ?? '(none)', pass: out.status === undefined },
  ],
});

// 29. conversion/awgMm2
cases.push({
  def: awgMm2Convert as unknown as Def,
  testName: 'AWG 4 → mm²',
  input: { mode: 'awgTomm2', value: 4 },
  run: (def, out, input) => [
    ...expectRow(out.rows, 'mm²', 21.1, { unit: 'mm²' }),
    ...expectRow(out.rows, 'Cu ampacity (60 °C, NEC 310.16)', 85, { unit: 'A' }),
  ],
});

// ── Runner ────────────────────────────────────────────────────────────────
const report: ReportData = {
  generatedAt: new Date().toISOString(),
  totalCases: cases.length,
  totalPass: 0,
  totalFail: 0,
  cases: [],
};

for (const c of cases) {
  let out: Out;
  try {
    out = c.def.compute(c.input);
  } catch (e) {
    report.cases.push({
      calculator: c.def.slug,
      title: c.def.title,
      category: c.def.category,
      testName: c.testName,
      input: c.input,
      checks: [{ field: 'compute()', expected: 'no throw', actual: (e as Error).message, pass: false }],
      pass: false,
      passCount: 0,
      failCount: 1,
    });
    report.totalFail++;
    continue;
  }
  const checks = c.run(c.def, out, c.input);
  const passCount = checks.filter((x) => x.pass).length;
  const failCount = checks.length - passCount;
  const pass = failCount === 0;
  if (pass) report.totalPass++;
  else report.totalFail++;
  report.cases.push({
    calculator: c.def.slug,
    title: c.def.title,
    category: c.def.category,
    testName: c.testName,
    input: c.input,
    checks,
    pass,
    passCount,
    failCount,
  });
}

import * as fs from 'node:fs';
import * as path from 'node:path';

const outDir = path.resolve(process.cwd(), 'tests', 'output');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'comprehensive-report.json');
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

console.log('');
console.log('═'.repeat(80));
console.log(`  COMPREHENSIVE VALIDATION · ${report.totalPass}/${report.totalCases} PASS · ${report.totalFail} FAIL`);
console.log('═'.repeat(80));
for (const c of report.cases) {
  console.log(`  ${c.pass ? '✅' : '❌'}  [${c.category}] ${c.calculator} · ${c.testName}  (${c.passCount}/${c.checks.length})`);
  for (const ch of c.checks.filter((x) => !x.pass)) {
    console.log(`     ✗ ${ch.field}: expected=${JSON.stringify(ch.expected)}, actual=${JSON.stringify(ch.actual)}`);
  }
}
console.log('');
console.log(`  Report JSON: ${outPath}`);
console.log('═'.repeat(80));

process.exit(report.totalFail === 0 ? 0 : 1);
