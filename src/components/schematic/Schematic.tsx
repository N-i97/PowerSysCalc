// Engineering single-line diagrams rendered as clean SVG.
// Not full schematic symbols, but a clear, professional visual aid.

interface SchematicProps {
  kind: 'single-line' | 'transformer' | 'motor' | 'cable' | 'inverter';
}

export function Schematic({ kind }: SchematicProps) {
  switch (kind) {
    case 'single-line':  return <SingleLine />;
    case 'transformer':  return <TransformerDiagram />;
    case 'motor':        return <MotorDiagram />;
    case 'cable':        return <CableDiagram />;
    case 'inverter':     return <InverterDiagram />;
  }
}

const baseProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  className: 'w-full max-w-3xl h-auto',
  viewBox: '0 0 800 280',
  fill: 'none',
};

const color = {
  line:   '#0E1726',
  accent: '#C9351B',
  text:   '#3A4A5E',
  dim:    '#BFB7A5',
};

function SingleLine() {
  return (
    <svg {...baseProps}>
      <defs>
        <pattern id="gridSL" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#D5CCBA" strokeWidth="0.5" />
        </pattern>
        <marker id="arrSL" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color.accent} />
        </marker>
      </defs>
      <rect width="800" height="280" fill="url(#gridSL)" opacity="0.5" />
      {/* Source */}
      <circle cx="60" cy="140" r="22" stroke={color.accent} strokeWidth="2" />
      <text x="60" y="146" textAnchor="middle" fill={color.text} fontFamily="JetBrains Mono" fontSize="11">V</text>
      <text x="60" y="100" textAnchor="middle" fill={color.text} fontFamily="JetBrains Mono" fontSize="10">SOURCE</text>
      {/* Breaker */}
      <rect x="120" y="120" width="40" height="40" stroke={color.line} strokeWidth="1.5" />
      <line x1="120" y1="120" x2="160" y2="160" stroke={color.line} strokeWidth="1.5" />
      <text x="140" y="180" textAnchor="middle" fill={color.text} fontFamily="JetBrains Mono" fontSize="9">CB</text>
      {/* Conductor */}
      <line x1="160" y1="140" x2="600" y2="140" stroke={color.line} strokeWidth="1.5" />
      <text x="380" y="130" textAnchor="middle" fill={color.text} fontFamily="JetBrains Mono" fontSize="10">L₁ L₂ L₃</text>
      {/* Load */}
      <rect x="600" y="120" width="60" height="40" stroke={color.accent} strokeWidth="2" />
      <line x1="610" y1="135" x2="640" y2="150" stroke={color.accent} strokeWidth="1.5" />
      <line x1="640" y1="135" x2="610" y2="150" stroke={color.accent} strokeWidth="1.5" />
      <text x="630" y="180" textAnchor="middle" fill={color.text} fontFamily="JetBrains Mono" fontSize="9">LOAD</text>
      {/* Current arrow */}
      <line x1="240" y1="155" x2="320" y2="155" stroke={color.accent} strokeWidth="1.5" markerEnd="url(#arrSL)" />
      <text x="280" y="175" textAnchor="middle" fill={color.accent} fontFamily="JetBrains Mono" fontSize="10">I</text>
      {/* Labels */}
      <text x="60" y="260" textAnchor="middle" fill={color.dim} fontFamily="JetBrains Mono" fontSize="9">A</text>
      <text x="140" y="260" textAnchor="middle" fill={color.dim} fontFamily="JetBrains Mono" fontSize="9">B</text>
      <text x="630" y="260" textAnchor="middle" fill={color.dim} fontFamily="JetBrains Mono" fontSize="9">C</text>
      <text x="780" y="265" textAnchor="end" fill={color.dim} fontFamily="JetBrains Mono" fontSize="8">DWG-001 · SINGLE-LINE</text>
    </svg>
  );
}

function TransformerDiagram() {
  return (
    <svg {...baseProps}>
      <defs>
        <pattern id="gridTX" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#D5CCBA" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="800" height="280" fill="url(#gridTX)" opacity="0.5" />
      {/* HV bus */}
      <line x1="40" y1="80" x2="280" y2="80" stroke={color.line} strokeWidth="1.5" />
      <line x1="40" y1="120" x2="280" y2="120" stroke={color.line} strokeWidth="1.5" />
      <line x1="40" y1="160" x2="280" y2="160" stroke={color.line} strokeWidth="1.5" />
      <text x="160" y="60" textAnchor="middle" fill={color.text} fontFamily="JetBrains Mono" fontSize="10">HV · 11 kV</text>
      {/* Transformer */}
      <circle cx="320" cy="100" r="14" stroke={color.accent} strokeWidth="1.5" />
      <circle cx="320" cy="140" r="14" stroke={color.accent} strokeWidth="1.5" />
      <circle cx="360" cy="120" r="14" stroke={color.accent} strokeWidth="1.5" />
      {/* LV bus */}
      <line x1="420" y1="100" x2="760" y2="100" stroke={color.line} strokeWidth="1.5" />
      <line x1="420" y1="140" x2="760" y2="140" stroke={color.line} strokeWidth="1.5" />
      <line x1="420" y1="180" x2="760" y2="180" stroke={color.line} strokeWidth="1.5" />
      <text x="600" y="220" textAnchor="middle" fill={color.text} fontFamily="JetBrains Mono" fontSize="10">LV · 400 V</text>
      {/* Tap changer */}
      <line x1="360" y1="80" x2="360" y2="40" stroke={color.accent} strokeWidth="1.5" />
      <line x1="350" y1="40" x2="370" y2="40" stroke={color.accent} strokeWidth="1.5" />
      <line x1="355" y1="50" x2="365" y2="50" stroke={color.accent} strokeWidth="1.5" />
      <text x="380" y="48" fill={color.accent} fontFamily="JetBrains Mono" fontSize="9">TAP</text>
      {/* Vector group Dyn11 label */}
      <text x="335" y="200" textAnchor="middle" fill={color.accent} fontFamily="JetBrains Mono" fontSize="10">Dy11</text>
      <text x="335" y="216" textAnchor="middle" fill={color.text} fontFamily="JetBrains Mono" fontSize="8">OIL-IMMERSED</text>
      {/* Annotations */}
      <text x="60" y="40" fill={color.dim} fontFamily="JetBrains Mono" fontSize="8">PRIMARY</text>
      <text x="700" y="40" fill={color.dim} fontFamily="JetBrains Mono" fontSize="8">SECONDARY</text>
      <text x="780" y="265" textAnchor="end" fill={color.dim} fontFamily="JetBrains Mono" fontSize="8">DWG-002 · DISTRIBUTION TX</text>
    </svg>
  );
}

function MotorDiagram() {
  return (
    <svg {...baseProps}>
      <defs>
        <pattern id="gridM" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#D5CCBA" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="800" height="280" fill="url(#gridM)" opacity="0.5" />
      {/* Supply */}
      <line x1="40" y1="80" x2="280" y2="80" stroke={color.line} strokeWidth="1.5" />
      <line x1="40" y1="140" x2="280" y2="140" stroke={color.line} strokeWidth="1.5" />
      <line x1="40" y1="200" x2="280" y2="200" stroke={color.line} strokeWidth="1.5" />
      <text x="160" y="60" textAnchor="middle" fill={color.text} fontFamily="JetBrains Mono" fontSize="10">3φ SUPPLY</text>
      {/* Disconnect */}
      <line x1="120" y1="80" x2="120" y2="200" stroke={color.line} strokeWidth="1.5" strokeDasharray="4 3" />
      {/* Starter */}
      <rect x="180" y="100" width="80" height="80" stroke={color.accent} strokeWidth="1.5" fill="none" />
      <text x="220" y="146" textAnchor="middle" fill={color.accent} fontFamily="JetBrains Mono" fontSize="10">DOL</text>
      <text x="220" y="160" textAnchor="middle" fill={color.text} fontFamily="JetBrains Mono" fontSize="8">STARTER</text>
      {/* Overload */}
      <circle cx="310" cy="100" r="8" stroke={color.line} strokeWidth="1.5" />
      <circle cx="310" cy="140" r="8" stroke={color.line} strokeWidth="1.5" />
      <circle cx="310" cy="180" r="8" stroke={color.line} strokeWidth="1.5" />
      <text x="330" y="146" fill={color.text} fontFamily="JetBrains Mono" fontSize="9">OL</text>
      {/* Cable */}
      <line x1="350" y1="100" x2="500" y2="140" stroke={color.line} strokeWidth="1.5" />
      <line x1="350" y1="140" x2="500" y2="140" stroke={color.line} strokeWidth="1.5" />
      <line x1="350" y1="180" x2="500" y2="140" stroke={color.line} strokeWidth="1.5" />
      {/* Motor */}
      <circle cx="560" cy="140" r="50" stroke={color.accent} strokeWidth="2" />
      <text x="560" y="146" textAnchor="middle" fill={color.accent} fontFamily="JetBrains Mono" fontSize="11">M</text>
      <text x="560" y="208" textAnchor="middle" fill={color.text} fontFamily="JetBrains Mono" fontSize="9">3φ INDUCTION</text>
      {/* PE */}
      <line x1="610" y1="190" x2="650" y2="230" stroke={color.line} strokeWidth="1.5" />
      <line x1="640" y1="225" x2="660" y2="225" stroke={color.line} strokeWidth="1.5" />
      <line x1="645" y1="232" x2="655" y2="232" stroke={color.line} strokeWidth="1.5" />
      <line x1="648" y1="239" x2="652" y2="239" stroke={color.line} strokeWidth="1.5" />
      <text x="670" y="240" fill={color.text} fontFamily="JetBrains Mono" fontSize="9">PE</text>
      <text x="780" y="265" textAnchor="end" fill={color.dim} fontFamily="JetBrains Mono" fontSize="8">DWG-003 · MOTOR FEEDER</text>
    </svg>
  );
}

function CableDiagram() {
  return (
    <svg {...baseProps}>
      <defs>
        <pattern id="gridC" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#D5CCBA" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="800" height="280" fill="url(#gridC)" opacity="0.5" />
      {/* Source bus */}
      <rect x="40" y="100" width="40" height="80" stroke={color.accent} strokeWidth="1.5" />
      <text x="60" y="146" textAnchor="middle" fill={color.accent} fontFamily="JetBrains Mono" fontSize="10">SRC</text>
      {/* Cable */}
      <line x1="80" y1="120" x2="380" y2="120" stroke={color.line} strokeWidth="2" />
      <line x1="80" y1="140" x2="380" y2="140" stroke={color.line} strokeWidth="2" />
      <line x1="80" y1="160" x2="380" y2="160" stroke={color.line} strokeWidth="2" />
      <line x1="80" y1="180" x2="380" y2="180" stroke={color.line} strokeWidth="2" />
      <text x="230" y="100" textAnchor="middle" fill={color.text} fontFamily="JetBrains Mono" fontSize="10">L₁ L₂ L₃ PE</text>
      {/* Length dimension */}
      <line x1="80" y1="220" x2="380" y2="220" stroke={color.accent} strokeWidth="0.8" />
      <line x1="80" y1="215" x2="80" y2="225" stroke={color.accent} strokeWidth="0.8" />
      <line x1="380" y1="215" x2="380" y2="225" stroke={color.accent} strokeWidth="0.8" />
      <text x="230" y="240" textAnchor="middle" fill={color.accent} fontFamily="JetBrains Mono" fontSize="10">L (m)</text>
      {/* Load */}
      <rect x="380" y="100" width="60" height="80" stroke={color.accent} strokeWidth="1.5" />
      <text x="410" y="146" textAnchor="middle" fill={color.accent} fontFamily="JetBrains Mono" fontSize="10">LOAD</text>
      {/* Vd arrow */}
      <text x="500" y="120" fill={color.text} fontFamily="JetBrains Mono" fontSize="10">V_S</text>
      <text x="500" y="180" fill={color.accent} fontFamily="JetBrains Mono" fontSize="10">V_S − ΔV</text>
      <line x1="510" y1="170" x2="510" y2="120" stroke={color.accent} strokeWidth="1.5" />
      <path d="M 504 124 L 510 116 L 516 124 Z" fill={color.accent} />
      {/* Right info */}
      <rect x="600" y="80" width="160" height="120" stroke={color.dim} strokeWidth="1" />
      <text x="608" y="100" fill={color.accent} fontFamily="JetBrains Mono" fontSize="9">CIRCUIT</text>
      <text x="608" y="120" fill={color.text} fontFamily="JetBrains Mono" fontSize="9">V_LL  · 400 V</text>
      <text x="608" y="138" fill={color.text} fontFamily="JetBrains Mono" fontSize="9">I_B  · 60 A</text>
      <text x="608" y="156" fill={color.text} fontFamily="JetBrains Mono" fontSize="9">L  · 80 m</text>
      <text x="608" y="174" fill={color.text} fontFamily="JetBrains Mono" fontSize="9">Cu/XLPE · C</text>
      <text x="608" y="192" fill={color.text} fontFamily="JetBrains Mono" fontSize="9">25 mm²</text>
      <text x="780" y="265" textAnchor="end" fill={color.dim} fontFamily="JetBrains Mono" fontSize="8">DWG-004 · CABLE RUN</text>
    </svg>
  );
}

function InverterDiagram() {
  return (
    <svg {...baseProps}>
      <defs>
        <pattern id="gridI" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#D5CCBA" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="800" height="280" fill="url(#gridI)" opacity="0.5" />
      {/* PV array */}
      <g transform="translate(60 60)">
        <rect width="60" height="40" stroke={color.line} strokeWidth="1.5" />
        <line x1="0" y1="20" x2="60" y2="20" stroke={color.line} strokeWidth="1" />
        <text x="30" y="58" textAnchor="middle" fill={color.text} fontFamily="JetBrains Mono" fontSize="9">PV</text>
        <g transform="translate(70 0)">
          <rect width="60" height="40" stroke={color.line} strokeWidth="1.5" />
          <line x1="0" y1="20" x2="60" y2="20" stroke={color.line} strokeWidth="1" />
          <text x="30" y="58" textAnchor="middle" fill={color.text} fontFamily="JetBrains Mono" fontSize="9">PV</text>
        </g>
        <text x="60" y="100" textAnchor="middle" fill={color.text} fontFamily="JetBrains Mono" fontSize="9">PV ARRAY · DC</text>
      </g>
      {/* DC lines */}
      <line x1="90" y1="180" x2="280" y2="180" stroke={color.line} strokeWidth="1.5" />
      <line x1="200" y1="220" x2="280" y2="180" stroke={color.line} strokeWidth="1.5" />
      {/* Inverter */}
      <rect x="280" y="100" width="100" height="80" stroke={color.accent} strokeWidth="2" fill="none" />
      <text x="330" y="146" textAnchor="middle" fill={color.accent} fontFamily="JetBrains Mono" fontSize="11">VFD</text>
      <text x="330" y="160" textAnchor="middle" fill={color.text} fontFamily="JetBrains Mono" fontSize="8">DC/AC</text>
      {/* AC lines */}
      <line x1="380" y1="120" x2="600" y2="120" stroke={color.line} strokeWidth="1.5" />
      <line x1="380" y1="140" x2="600" y2="140" stroke={color.line} strokeWidth="1.5" />
      <line x1="380" y1="160" x2="600" y2="160" stroke={color.line} strokeWidth="1.5" />
      <text x="490" y="100" textAnchor="middle" fill={color.text} fontFamily="JetBrains Mono" fontSize="9">3φ AC</text>
      {/* Grid */}
      <rect x="600" y="100" width="60" height="80" stroke={color.accent} strokeWidth="1.5" />
      <text x="630" y="146" textAnchor="middle" fill={color.accent} fontFamily="JetBrains Mono" fontSize="10">GRID</text>
      <text x="780" y="265" textAnchor="end" fill={color.dim} fontFamily="JetBrains Mono" fontSize="8">DWG-005 · PV INVERTER</text>
    </svg>
  );
}
