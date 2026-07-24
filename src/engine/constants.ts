// Engineering constants used across calculations
// All values from IEC / IEEE / NEC where applicable

export const SQRT3 = Math.sqrt(3);
export const SQRT2 = Math.sqrt(2);
export const PI = Math.PI;

// Standard voltages (V)
export const STANDARD_VOLTAGES = {
  // IEC / EU common
  '230V_1ph':    { v: 230,    system: '1ph' as const, regions: ['IEC', 'EU'] },
  '400V_3ph':    { v: 400,    system: '3ph' as const, regions: ['IEC', 'EU'] },
  '690V_3ph':    { v: 690,    system: '3ph' as const, regions: ['IEC', 'EU'] },
  '3.3kV':       { v: 3300,   system: '3ph' as const, regions: ['IEC'] },
  '6.6kV':       { v: 6600,   system: '3ph' as const, regions: ['IEC'] },
  '11kV':        { v: 11000,  system: '3ph' as const, regions: ['IEC'] },
  '22kV':        { v: 22000,  system: '3ph' as const, regions: ['IEC'] },
  '33kV':        { v: 33000,  system: '3ph' as const, regions: ['IEC'] },
  // ANSI / US common
  '120V_1ph':    { v: 120,    system: '1ph' as const, regions: ['ANSI', 'US'] },
  '208V_3ph':    { v: 208,    system: '3ph' as const, regions: ['ANSI', 'US'] },
  '240V_1ph':    { v: 240,    system: '1ph' as const, regions: ['ANSI', 'US'] },
  '277V_1ph':    { v: 277,    system: '1ph' as const, regions: ['ANSI', 'US'] },
  '480V_3ph':    { v: 480,    system: '3ph' as const, regions: ['ANSI', 'US'] },
  '600V_3ph':    { v: 600,    system: '3ph' as const, regions: ['ANSI', 'US'] },
  '4.16kV':      { v: 4160,   system: '3ph' as const, regions: ['ANSI', 'US'] },
  '13.8kV':      { v: 13800,  system: '3ph' as const, regions: ['ANSI', 'US'] },
  '34.5kV':      { v: 34500,  system: '3ph' as const, regions: ['ANSI', 'US'] },
};

// Standard frequencies
export const STANDARD_FREQUENCIES_HZ = [50, 60] as const;

// Conversion factors
export const HP_TO_W = 745.6998715822702;          // mechanical HP
export const HP_METRIC_TO_W = 735.49875;          // metric HP
export const BTU_PER_H_TO_W = 0.29307107;

// Common derating/temperature factors (engineering round numbers)
export const REFERENCE_TEMPERATURE_C = {
  ground: 20,
  air:    30,
  soilResistivity: 1.0,  // K·m/W
};

// Standard materials
export const MATERIAL = {
  copper: {
    name: 'Copper',
    resistivity20C_ohmMm2PerM: 0.017241,    // Ω·mm²/m at 20°C
    tempCoefficient: 0.00393,                // 1/K
    referenceTempC: 20,
  },
  aluminum: {
    name: 'Aluminum',
    resistivity20C_ohmMm2PerM: 0.028264,
    tempCoefficient: 0.00403,
    referenceTempC: 20,
  },
} as const;

// Engineering voltage drop limits (typical guidance)
export const VD_LIMIT = {
  branch:  3,    // %
  feeder:  3,    // %
  total:   5,    // %
  motor:   5,    // % at motor terminals (NEMA MG-1)
  lighting: 3,   // %
} as const;

// IEC 60364 / NEC typical breaker / conductor relationships
export const BREAKER_TO_CONDUCTOR = {
  // For C-type breakers, conductor is sized at 125% of OCPD
  factor: 1.25,
} as const;
