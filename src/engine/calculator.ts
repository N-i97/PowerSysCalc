// Calculator abstraction layer
// Every calculator in the app is described by a single `CalculatorDefinition` object
// that the UI consumes. This is the foundation for future features (AI assistant,
// single-line diagram generation, saved projects, etc).

import type { ReactNode } from 'react';

export type CalculatorCategory =
  | 'power'
  | 'three-phase'
  | 'transformer'
  | 'motor'
  | 'cable'
  | 'protection'
  | 'grounding'
  | 'renewable'
  | 'conversion';

export interface CalculatorField {
  name: string;
  label: string;
  unitGroup?: string;          // id from UNIT_GROUPS
  defaultUnit?: string;        // unit id within that group
  // Optional: restrict the unit selector to a subset of the unitGroup's units
  // (e.g. only ['kW', 'hp'] for motor power). If omitted, all units in the group
  // are offered.
  unitOptions?: string[];
  defaultValue?: number | string;
  placeholder?: string;
  help?: string;
  required?: boolean;
  min?: number;
  max?: number;
  positive?: boolean;
  integer?: boolean;
  options?: { value: string; label: string }[];
  step?: number;
  group?: string;              // optional visual group key
}

export interface ResultRow {
  label: string;
  value: number | string;
  unit?: string;
  highlight?: boolean;
  status?: 'ok' | 'warn' | 'err' | 'info';
  formula?: string;
}

export interface CalculationStep {
  label: string;
  formula: string;
  result?: string;
  note?: string;
}

export interface EngineeringNote {
  standard: 'IEC' | 'ANSI' | 'IEEE' | 'NEC' | 'NEMA';
  reference: string;
  text: string;
}

export interface FAQItem {
  q: string;
  a: string;
}

export interface RelatedLink {
  slug: string;
  label: string;
  reason: string;
}

export interface CalculatorDefinition<Input extends Record<string, unknown> = Record<string, unknown>> {
  // Identity
  slug: string;
  title: string;
  shortTitle: string;
  category: CalculatorCategory;
  keywords: string[];

  // Presentation
  tagline: string;
  description: ReactNode | string;
  icon?: string;                   // lucide-style icon name
  featured?: boolean;

  // Schema
  fields: CalculatorField[];

  // Behaviour
  compute: (input: Input, ctx?: ComputeContext) => CalculatorOutput;

  // Documentation
  formulas: { name: string; expression: string; variables?: string }[];
  steps?: (input: Input, output: CalculatorOutput) => CalculationStep[];
  notes?: EngineeringNote[];
  warnings?: (input: Input, output: CalculatorOutput) => string[];
  recommendations?: (input: Input, output: CalculatorOutput) => string[];
  faq?: FAQItem[];
  related?: RelatedLink[];
  schematic?: 'single-line' | 'transformer' | 'motor' | 'cable' | 'inverter' | null;

  // SEO
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

// Context passed to `compute` so authors can read the currently-selected unit
// for each field. Use this for fields where the unit carries semantic meaning
// (e.g. kW vs kVA) rather than just a numeric scale change.
export interface ComputeContext {
  units: Record<string, string>;
}

export interface CalculatorOutput {
  rows: ResultRow[];
  raw: Record<string, number | string>;
  // Free-form metadata that the UI can render (e.g. selected cable, breaker, ...).
  picks?: {
    cableSize?: number;          // mm²
    cableSizeAWG?: string;
    breakerRating?: number;      // A
    breakerFrame?: number;       // A
    transformerKVA?: number;
    motorFLC?: number;
    capacitorKVAr?: number;
    [k: string]: number | string | undefined;
  };
  // Engine-level flags, e.g. "voltage drop exceeds 3%"
  status?: 'ok' | 'warn' | 'err' | 'info';
  // Optional summary line
  summary?: string;
}
