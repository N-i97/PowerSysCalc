import type { CalculatorCategory, CalculatorDefinition } from '../engine/calculator';

export const CATEGORIES: { id: CalculatorCategory; slug: string; label: string; icon: string; tagline: string }[] = [
  { id: 'power',         slug: 'category/power',         label: 'Power',            icon: 'bolt',        tagline: 'Single & three-phase power, PF, current' },
  { id: 'three-phase',   slug: 'category/three-phase',   label: 'Three-phase',      icon: 'three-phase', tagline: 'Wye/Delta conversions, balanced systems' },
  { id: 'transformer',   slug: 'category/transformer',   label: 'Transformers',     icon: 'transformer', tagline: 'Sizing, current, efficiency, vector group' },
  { id: 'motor',         slug: 'category/motor',         label: 'Motors',           icon: 'motor',       tagline: 'FLC, starting, VFD & breaker selection' },
  { id: 'cable',         slug: 'category/cable',         label: 'Cable sizing',     icon: 'cable',       tagline: 'Ampacity, voltage drop, derating, short-circuit' },
  { id: 'protection',    slug: 'category/protection',    label: 'Protection',       icon: 'shield',      tagline: 'Breaker, fuse, relay, short-circuit' },
  { id: 'grounding',     slug: 'category/grounding',     label: 'Grounding',        icon: 'ground',      tagline: 'Earthing conductor, ground resistance' },
  { id: 'renewable',     slug: 'category/renewable',     label: 'Renewable',        icon: 'solar',       tagline: 'Solar PV inverter, battery, string sizing' },
  { id: 'conversion',    slug: 'category/conversion',    label: 'Conversions',      icon: 'swap',        tagline: 'kW↔HP, AWG↔mm², V, I, P conversions' },
];

// Re-export all calculator definitions from one entry point
import { calc as singlePhasePower }      from '../calculators/power/singlePhase';
import { calc as threePhasePower }        from '../calculators/power/threePhase';
import { calc as powerFactor }            from '../calculators/power/powerFactor';
import { calc as powerFactorCorrection }  from '../calculators/power/pfCorrection';
import { calc as kwKvaHp }                from '../calculators/power/kwKvaHp';
import { calc as currentCalc }            from '../calculators/power/current';
import { calc as demandLoad }             from '../calculators/power/demandLoad';
import { calc as deltaWye }               from '../calculators/threePhase/deltaWye';
import { calc as balancedLoad }           from '../calculators/threePhase/balancedLoad';
import { calc as transformerSizing }      from '../calculators/transformer/sizing';
import { calc as transformerCurrent }     from '../calculators/transformer/current';
import { calc as transformerEfficiency }  from '../calculators/transformer/efficiency';
import { calc as motorFLC }               from '../calculators/motor/flc';
import { calc as motorStarting }          from '../calculators/motor/starting';
import { calc as vfdSizing }              from '../calculators/motor/vfd';
import { calc as motorBreaker }           from '../calculators/motor/breaker';
import { calc as voltageDrop }            from '../calculators/cable/voltageDrop';
import { calc as cableSizing }            from '../calculators/cable/sizing';
import { calc as cableDerating }          from '../calculators/cable/derating';
import { calc as shortCircuit }           from '../calculators/cable/shortCircuit';
import { calc as breakerSizing }          from '../calculators/protection/breaker';
import { calc as fuseSizing }             from '../calculators/protection/fuse';
import { calc as earthingConductor }      from '../calculators/grounding/conductor';
import { calc as groundResistance }       from '../calculators/grounding/resistance';
import { calc as solarInverter }          from '../calculators/renewable/inverter';
import { calc as batteryRuntime }         from '../calculators/renewable/battery';
import { calc as solarString }            from '../calculators/renewable/string';
import { calc as hpKwConvert }            from '../calculators/conversion/hpKw';
import { calc as awgMm2Convert }          from '../calculators/conversion/awgMm2';

export const ALL_CALCULATORS: CalculatorDefinition[] = [
  singlePhasePower, threePhasePower, powerFactor, powerFactorCorrection, kwKvaHp, currentCalc, demandLoad,
  deltaWye, balancedLoad,
  transformerSizing, transformerCurrent, transformerEfficiency,
  motorFLC, motorStarting, vfdSizing, motorBreaker,
  voltageDrop, cableSizing, cableDerating, shortCircuit,
  breakerSizing, fuseSizing,
  earthingConductor, groundResistance,
  solarInverter, batteryRuntime, solarString,
  hpKwConvert, awgMm2Convert,
];

export function calculatorsByCategory(): Map<CalculatorCategory, CalculatorDefinition[]> {
  const m = new Map<CalculatorCategory, CalculatorDefinition[]>();
  for (const c of ALL_CALCULATORS) {
    if (!m.has(c.category)) m.set(c.category, []);
    m.get(c.category)!.push(c);
  }
  return m;
}

export function getCalculatorBySlug(slug: string): CalculatorDefinition | undefined {
  return ALL_CALCULATORS.find((c) => c.slug === slug);
}

export function searchCalculators(q: string): CalculatorDefinition[] {
  const s = q.trim().toLowerCase();
  if (!s) return ALL_CALCULATORS.slice(0, 8);
  const tokens = s.split(/\s+/);
  return ALL_CALCULATORS
    .map((c) => {
      const hay = (c.title + ' ' + c.shortTitle + ' ' + c.tagline + ' ' + c.keywords.join(' ')).toLowerCase();
      let score = 0;
      for (const t of tokens) {
        if (hay.includes(t)) score += hay.split(t).length - 1;
        if (c.title.toLowerCase().startsWith(t)) score += 5;
        if (c.shortTitle.toLowerCase().startsWith(t)) score += 3;
      }
      return { c, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.c);
}
