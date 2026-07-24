// Standard cable & conductor data
// Copper & Aluminum XLPE/PVC ampacities simplified from IEC 60364-5-52 Table B.52
// (reference method A1/A2/B1/B2/C/E/F — installation dependent).

export type Insulation = 'PVC' | 'XLPE' | 'EPR';
export type ConductorMaterial = 'Cu' | 'Al';
export type InstallationMethod = 'A1' | 'A2' | 'B1' | 'B2' | 'C' | 'E' | 'F';

// Ampacity table indexed by mm² size
type AmpacityTable = Record<number, number>;

export interface ConductorEntry {
  size: number;     // mm²
  resistanceCu20: number;   // mΩ/m @ 20°C (copper)
  resistanceAl20: number;   // mΩ/m @ 20°C (aluminum)
  reactance: number;        // mΩ/m at 50Hz (typical)
  ampacity: Record<Insulation, Record<InstallationMethod, AmpacityTable>>; // A
}

const PVC_A2:  AmpacityTable = { 1.5: 16, 2.5: 22, 4: 30, 6: 37, 10: 52, 16: 70, 25: 88, 35: 114, 50: 144, 70: 178, 95: 218, 120: 253, 150: 297, 185: 344, 240: 419, 300: 495 };
const PVC_C:   AmpacityTable = { 1.5: 20, 2.5: 28, 4: 38, 6: 49, 10: 67, 16: 90, 25: 119, 35: 148, 50: 188, 70: 232, 95: 282, 120: 328, 150: 379, 185: 434, 240: 514, 300: 593 };
const XLPE_C:  AmpacityTable = { 1.5: 24, 2.5: 33, 4: 45, 6: 57, 10: 78, 16: 104, 25: 135, 35: 168, 50: 210, 70: 258, 95: 313, 120: 362, 150: 420, 185: 477, 240: 565, 300: 651 };
const XLPE_F:  AmpacityTable = { 1.5: 26, 2.5: 36, 4: 49, 6: 63, 10: 86, 16: 115, 25: 149, 35: 185, 50: 230, 70: 282, 95: 341, 120: 395, 150: 458, 185: 520, 240: 615, 300: 708 };

function buildAmpacities(cuPVC_A2: AmpacityTable): ConductorEntry['ampacity'] {
  return {
    PVC:  { A1: cuPVC_A2, A2: cuPVC_A2, B1: PVC_C,  B2: PVC_C,  C: PVC_C,  E: XLPE_C, F: XLPE_F },
    XLPE: { A1: XLPE_C,   A2: XLPE_C,   B1: XLPE_C, B2: XLPE_C, C: XLPE_C, E: XLPE_C, F: XLPE_F },
    EPR:  { A1: XLPE_C,   A2: XLPE_C,   B1: XLPE_C, B2: XLPE_C, C: XLPE_C, E: XLPE_C, F: XLPE_F },
  };
}

// Resistance values (mΩ/m) at 20°C, derived from ρ and cross-section
const R = (rho: number, area: number) => (rho / area) * 1000; // Ω·mm²/m → mΩ/m
const rhoCu = 0.017241;
const rhoAl = 0.028264;

const SIZES = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300] as const;

export const CONDUCTORS: ConductorEntry[] = SIZES.map((size) => ({
  size,
  resistanceCu20: R(rhoCu, size),
  resistanceAl20: R(rhoAl, size),
  reactance: 0.08,   // typical 50/60 Hz inductive reactance for power cables
  ampacity: buildAmpacities(PVC_A2),
}));

// Standard OCPD ratings (A) — IEC 60898 type C / NEC standard sizes
export const STANDARD_BREAKER_SIZES = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3000, 4000] as const;

// Standard transformer kVA ratings (typical 3-ph distribution)
export const STANDARD_TRANSFORMER_KVA = [15, 30, 45, 75, 100, 112.5, 150, 200, 225, 300, 500, 630, 750, 1000, 1250, 1500, 2000, 2500, 3000, 5000] as const;

// Standard motor kW ratings
export const STANDARD_MOTOR_KW = [0.37, 0.55, 0.75, 1.1, 1.5, 2.2, 3, 4, 5.5, 7.5, 11, 15, 18.5, 22, 30, 37, 45, 55, 75, 90, 110, 132, 160, 200, 250, 315, 355, 400, 500, 630] as const;

// NEC motor FLC multiplier reference (430.6) for Design B motors
export const NEC_MOTOR_FLC: Record<string, Record<number, number>> = {
  // hp → A at 460V 3φ (typical NEC table values for Design B)
  '460V_3ph': {
    0.5: 1.1, 0.75: 1.6, 1: 2.1, 1.5: 3.0, 2: 3.4, 3: 4.8, 5: 7.6, 7.5: 11,
    10: 14, 15: 21, 20: 27, 25: 34, 30: 40, 40: 52, 50: 65, 60: 77, 75: 96,
    100: 124, 125: 156, 150: 180, 200: 240, 250: 302, 300: 361, 350: 414, 400: 477, 500: 590,
  },
  '230V_3ph': {
    0.5: 2.2, 0.75: 3.2, 1: 4.2, 1.5: 6.0, 2: 6.8, 3: 9.6, 5: 15.2, 7.5: 22,
    10: 28, 15: 42, 20: 54, 25: 68, 30: 80, 40: 104, 50: 130, 60: 154, 75: 192,
    100: 248, 125: 312, 150: 360, 200: 480,
  },
};

// IEC motor FLC reference (4-pole, 50Hz) — current at 400V
export const IEC_MOTOR_FLC_400V: Record<number, number> = {
  0.37: 1.05, 0.55: 1.5, 0.75: 2.0, 1.1: 2.8, 1.5: 3.7, 2.2: 5.3, 3: 7.0, 4: 9.0,
  5.5: 12, 7.5: 16, 11: 22, 15: 28, 18.5: 35, 22: 41, 30: 55, 37: 66, 45: 80, 55: 98,
  75: 135, 90: 160, 110: 200, 132: 240, 160: 285, 200: 360, 250: 440, 315: 540, 355: 620,
};

// Common AWG ↔ mm²
export const AWG_TO_MM2: { awg: string; mm2: number; ampacityCu60C: number }[] = [
  { awg: '14', mm2: 2.08,  ampacityCu60C: 20 },
  { awg: '12', mm2: 3.31,  ampacityCu60C: 25 },
  { awg: '10', mm2: 5.26,  ampacityCu60C: 35 },
  { awg: '8',  mm2: 8.37,  ampacityCu60C: 50 },
  { awg: '6',  mm2: 13.3,  ampacityCu60C: 65 },
  { awg: '4',  mm2: 21.1,  ampacityCu60C: 85 },
  { awg: '2',  mm2: 33.6,  ampacityCu60C: 115 },
  { awg: '1/0', mm2: 53.5, ampacityCu60C: 150 },
  { awg: '2/0', mm2: 67.4, ampacityCu60C: 175 },
  { awg: '4/0', mm2: 107,  ampacityCu60C: 230 },
  { awg: '250', mm2: 127,  ampacityCu60C: 255 },
  { awg: '350', mm2: 177,  ampacityCu60C: 310 },
  { awg: '500', mm2: 253,  ampacityCu60C: 380 },
];

// Derating factors (typical values, IEC 60364-5-52)
export const TEMP_DERATING: Record<Insulation, Record<number, number>> = {
  // insulation → ambient °C → factor
  PVC:  { 10: 1.22, 15: 1.17, 20: 1.12, 25: 1.06, 30: 1.0,  35: 0.94, 40: 0.87, 45: 0.79, 50: 0.71, 55: 0.61, 60: 0.50 },
  XLPE: { 10: 1.15, 15: 1.12, 20: 1.08, 25: 1.04, 30: 1.0,  35: 0.96, 40: 0.91, 45: 0.87, 50: 0.82, 55: 0.76, 60: 0.71, 65: 0.65, 70: 0.58, 75: 0.50, 80: 0.41, 85: 0.29 },
  EPR:  { 10: 1.15, 15: 1.12, 20: 1.08, 25: 1.04, 30: 1.0,  35: 0.96, 40: 0.91, 45: 0.87, 50: 0.82, 55: 0.76, 60: 0.71, 65: 0.65, 70: 0.58, 75: 0.50, 80: 0.41, 85: 0.29 },
};

export const GROUPING_DERATING: Record<number, number> = {
  1: 1.0, 2: 0.88, 3: 0.82, 4: 0.77, 5: 0.73, 6: 0.71, 7: 0.66, 8: 0.63, 9: 0.6, 12: 0.55, 16: 0.51, 20: 0.48,
};

// Soil thermal resistivity derating (K·m/W)
export const SOIL_RESISTIVITY_DERATING: Record<number, number> = {
  0.5: 1.21, 0.7: 1.13, 1.0: 1.05, 1.2: 1.0, 1.5: 0.93, 2.0: 0.86, 2.5: 0.79, 3.0: 0.74,
};

export function getConductor(mm2: number): ConductorEntry | undefined {
  return CONDUCTORS.find((c) => c.size === mm2);
}

export function nextBreakerUp(target: number): number {
  for (const b of STANDARD_BREAKER_SIZES) if (b >= target) return b;
  return STANDARD_BREAKER_SIZES[STANDARD_BREAKER_SIZES.length - 1];
}

export function nextTransformerKvaUp(target: number): number {
  for (const k of STANDARD_TRANSFORMER_KVA) if (k >= target) return k;
  return STANDARD_TRANSFORMER_KVA[STANDARD_TRANSFORMER_KVA.length - 1];
}

export function nextMotorKwUp(target: number): number {
  for (const k of STANDARD_MOTOR_KW) if (k >= target) return k;
  return STANDARD_MOTOR_KW[STANDARD_MOTOR_KW.length - 1];
}
