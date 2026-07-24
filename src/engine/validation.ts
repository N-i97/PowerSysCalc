// Validation framework
// Lightweight, composable validators that produce human-readable errors/warnings.

export type ValidationLevel = 'error' | 'warning' | 'info';

export interface ValidationMessage {
  field: string;
  level: ValidationLevel;
  message: string;
}

export interface FieldSpec<T = unknown> {
  name: string;
  required?: boolean;
  min?: number;
  max?: number;
  positive?: boolean;
  integer?: boolean;
  oneOf?: readonly T[];
  pattern?: RegExp;
  custom?: (value: T) => string | null;
}

export interface ValidationContext {
  values: Record<string, unknown>;
}

export function validateValue(field: FieldSpec, value: unknown): ValidationMessage[] {
  const msgs: ValidationMessage[] = [];
  const v = value;
  const isEmpty = v === undefined || v === null || v === '' ||
    (typeof v === 'number' && Number.isNaN(v));

  if (isEmpty) {
    if (field.required) {
      msgs.push({ field: field.name, level: 'error', message: `${field.name} is required` });
    }
    return msgs;
  }

  if (typeof v === 'number') {
    if (field.integer && !Number.isInteger(v)) {
      msgs.push({ field: field.name, level: 'error', message: `${field.name} must be an integer` });
    }
    if (field.positive && v <= 0) {
      msgs.push({ field: field.name, level: 'error', message: `${field.name} must be positive` });
    }
    if (field.min !== undefined && v < field.min) {
      msgs.push({ field: field.name, level: 'error', message: `${field.name} must be ≥ ${field.min}` });
    }
    if (field.max !== undefined && v > field.max) {
      msgs.push({ field: field.name, level: 'error', message: `${field.name} must be ≤ ${field.max}` });
    }
  }

  if (field.oneOf && !field.oneOf.includes(v as never)) {
    msgs.push({ field: field.name, level: 'error', message: `${field.name} must be one of ${field.oneOf.join(', ')}` });
  }

  if (field.custom) {
    const err = field.custom(v);
    if (err) msgs.push({ field: field.name, level: 'error', message: err });
  }

  return msgs;
}

export function validateAll(specs: FieldSpec[], values: Record<string, unknown>): ValidationMessage[] {
  return specs.flatMap((s) => validateValue(s, values[s.name]));
}

export function hasErrors(msgs: ValidationMessage[]): boolean {
  return msgs.some((m) => m.level === 'error');
}
