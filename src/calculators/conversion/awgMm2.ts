import type { CalculatorDefinition } from '../../engine/calculator';
import { AWG_TO_MM2 } from '../../engine/cableData';
import { round } from '../../engine/math';

export const calc: CalculatorDefinition = {
  slug: 'awg-mm2-converter',
  title: 'AWG ↔ mm² Converter',
  shortTitle: 'AWG · mm²',
  category: 'conversion',
  icon: 'ruler',
  tagline: 'Cross-section between AWG/kcmil and mm².',
  keywords: ['AWG to mm2', 'mm2 to AWG', 'wire gauge', 'kcmil', 'cross section'],
  description: 'Convert between American Wire Gauge (AWG), thousand circular mils (kcmil), and square millimeters (mm²). Includes copper ampacity at 60 °C.',
  fields: [
    { name: 'mode', label: 'Conversion', defaultValue: 'mm2toAWG', options: [
      { value: 'mm2toAWG', label: 'mm² → AWG/kcmil' },
      { value: 'awgTomm2', label: 'AWG/kcmil → mm²' },
    ] },
    { name: 'value', label: 'Value', defaultValue: 25, positive: true, required: true },
  ],
  compute: (input) => {
    const m = String(input.mode);
    const v = Number(input.value);
    let awg = '', mm2 = 0, ampacity = 0;
    if (m === 'mm2toAWG') {
      // Find closest AWG
      let best = AWG_TO_MM2[0], diff = Math.abs(v - best.mm2);
      for (const e of AWG_TO_MM2) {
        if (Math.abs(v - e.mm2) < diff) { best = e; diff = Math.abs(v - e.mm2); }
      }
      awg = best.awg; mm2 = best.mm2; ampacity = best.ampacityCu60C;
    } else {
      // AWG string like "14", "1/0", "250"
      const target = AWG_TO_MM2.find((e) => e.awg === String(v)) ?? AWG_TO_MM2[0];
      awg = target.awg; mm2 = target.mm2; ampacity = target.ampacityCu60C;
    }
    return {
      rows: [
        { label: 'AWG / kcmil', value: awg, unit: '', status: 'ok' },
        { label: 'mm²',         value: mm2, unit: 'mm²' },
        { label: 'Cu ampacity (60 °C, NEC 310.16)', value: ampacity, unit: 'A', status: 'info' },
      ],
      raw: { m, v, awg, mm2, ampacity },
      summary: `${mm2} mm² ≈ ${awg} AWG · ${ampacity} A @ 60 °C`,
    };
  },
  formulas: [
    { name: 'AWG → mm²', expression: 'mm² ≈ 0.012668 · 92^((36−n)/19.5)', variables: 'n = AWG number' },
    { name: 'kcmil → mm²', expression: 'mm² = kcmil / 1.9735', variables: '' },
  ],
  notes: [
    { standard: 'NEC', reference: 'NEC 310.16', text: 'Allowable ampacity for 60/75/90 °C conductors, copper & aluminum.' },
  ],
  related: [
    { slug: 'hp-kw-converter', label: 'HP · kW', reason: 'Power conversion' },
  ],
  seo: {
    title: 'AWG ↔ mm² Wire Gauge Converter | PowerSys Calc',
    description: 'Convert between AWG, kcmil, and mm². Includes copper ampacity per NEC 310.16.',
    keywords: ['AWG to mm2', 'wire gauge converter', 'kcmil', 'mm2 AWG', 'NEC 310.16'],
  },
};
