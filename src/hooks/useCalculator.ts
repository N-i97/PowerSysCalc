import { useCallback, useMemo, useState } from 'react';
import type { CalculatorDefinition, CalculatorOutput } from '../engine/calculator';
import { validateAll, hasErrors, type ValidationMessage } from '../engine/validation';
import { getUnit } from '../engine/units';

export function useCalculator(def: CalculatorDefinition) {
  const initial = useMemo(() => {
    const out: Record<string, number | string> = {};
    for (const f of def.fields) {
      if (f.defaultValue !== undefined) out[f.name] = f.defaultValue;
      else if (f.options?.length) out[f.name] = f.options[0].value;
      else out[f.name] = '';
    }
    return out;
  }, [def]);

  const initialUnits = useMemo(() => {
    const out: Record<string, string> = {};
    for (const f of def.fields) {
      if (f.unitGroup && f.defaultUnit) out[f.name] = f.defaultUnit;
    }
    return out;
  }, [def]);

  const [values, setValues] = useState<Record<string, number | string>>(initial);
  const [units, setUnits] = useState<Record<string, string>>(initialUnits);
  const [output, setOutput] = useState<CalculatorOutput | null>(null);
  const [messages, setMessages] = useState<ValidationMessage[]>([]);

  const set = useCallback((name: string, value: number | string) => {
    setValues((p) => ({ ...p, [name]: value }));
  }, []);

  // Change the unit for a field, converting the displayed value so it represents
  // the same physical quantity in the new unit. The underlying numeric value
  // passed to `compute` stays in the field's default unit.
  const setUnit = useCallback((name: string, newUnit: string) => {
    setUnits((prevUnits) => {
      const oldUnit = prevUnits[name];
      if (oldUnit === newUnit) return prevUnits;
      const field = def.fields.find((f) => f.name === name);
      if (!field?.unitGroup) return { ...prevUnits, [name]: newUnit };
      const oldU = getUnit(field.unitGroup, oldUnit);
      const newU = getUnit(field.unitGroup, newUnit);
      if (!oldU || !newU) return { ...prevUnits, [name]: newUnit };
      setValues((prevValues) => {
        const v = prevValues[name];
        if (v === '' || v === undefined || v === null) return prevValues;
        const num = Number(v);
        if (!Number.isFinite(num)) return prevValues;
        const baseVal = oldU.toBase(num);
        const converted = newU.fromBase(baseVal);
        return { ...prevValues, [name]: converted };
      });
      return { ...prevUnits, [name]: newUnit };
    });
  }, [def]);

  const reset = useCallback(() => {
    setValues(initial);
    setUnits(initialUnits);
    setOutput(null);
    setMessages([]);
  }, [initial, initialUnits]);

  // Convert each field's display value to its DEFAULT unit (not base SI),
  // because every existing calculator's `compute` function treats the input
  // value as if it's already in the field's default unit. This way the
  // calculator code is unchanged and the unit selector actually works.
  const toDefaultUnits = useCallback((vs: Record<string, number | string>, us: Record<string, string>) => {
    const out: Record<string, number | string> = { ...vs };
    for (const f of def.fields) {
      if (!f.unitGroup || !f.defaultUnit) continue;
      const currentUnit = us[f.name];
      if (!currentUnit || currentUnit === f.defaultUnit) continue;
      const v = vs[f.name];
      if (v === '' || v === undefined || v === null) continue;
      const num = Number(v);
      if (!Number.isFinite(num)) continue;
      const fromU = getUnit(f.unitGroup, currentUnit);
      const toU = getUnit(f.unitGroup, f.defaultUnit);
      if (fromU && toU) out[f.name] = toU.fromBase(fromU.toBase(num));
    }
    return out;
  }, [def]);

  const calculate = useCallback(() => {
    const specs = def.fields.map((f) => ({
      name: f.name,
      required: f.required,
      min: f.min,
      max: f.max,
      positive: f.positive,
      integer: f.integer,
    }));
    const calcValues = toDefaultUnits(values, units);
    const msgs = validateAll(specs, calcValues);
    setMessages(msgs);
    if (hasErrors(msgs)) {
      setOutput(null);
      return null;
    }
    const out = def.compute(calcValues, { units });
    setOutput(out);
    return out;
  }, [def, values, units, toDefaultUnits]);

  return { values, set, units, setUnit, output, messages, calculate, reset };
}
