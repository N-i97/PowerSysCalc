import { type ReactNode } from 'react';

export function Icon({ name, className = 'h-5 w-5' }: { name: string; className?: string }) {
  switch (name) {
    case 'bolt':       return <Bolt className={className} />;
    case 'transformer':return <Transformer className={className} />;
    case 'motor':      return <Motor className={className} />;
    case 'cable':      return <Cable className={className} />;
    case 'shield':     return <Shield className={className} />;
    case 'ground':     return <Ground className={className} />;
    case 'solar':      return <Solar className={className} />;
    case 'swap':       return <Swap className={className} />;
    case 'wave':       return <Wave className={className} />;
    case 'three-phase':return <ThreePhase className={className} />;
    case 'pf':         return <PF className={className} />;
    case 'cap':        return <Cap className={className} />;
    case 'wye':        return <Wye className={className} />;
    case 'delta':      return <Delta className={className} />;
    case 'drop':       return <Drop className={className} />;
    case 'gear':       return <Gear className={className} />;
    case 'search':     return <Search className={className} />;
    case 'menu':       return <Menu className={className} />;
    case 'close':      return <Close className={className} />;
    case 'check':      return <Check className={className} />;
    case 'arrow-right':return <ArrowRight className={className} />;
    case 'arrow-left': return <ArrowLeft className={className} />;
    case 'chevron-down':return <ChevronDown className={className} />;
    case 'info':       return <Info className={className} />;
    case 'warn':       return <Warn className={className} />;
    case 'doc':        return <Doc className={className} />;
    case 'battery':    return <Battery className={className} />;
    case 'ruler':      return <Ruler className={className} />;
    case 'star':       return <Star className={className} />;
    case 'clock':      return <Clock className={className} />;
    default:           return <Bolt className={className} />;
  }
}

const BASE = 'stroke-current fill-none';
const W = 1.6;

function svg(children: ReactNode, className: string) {
  return (
    <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={W} className={[BASE, className].join(' ')}>
      {children}
    </svg>
  );
}

const Bolt = ({ className }: { className: string }) => svg(<path d="M13 3 L4 14 H11 L10 21 L20 9 H13 Z" />, className);
const Transformer = ({ className }: { className: string }) => svg(
  <g>
    <circle cx="9"  cy="9" r="4.5" />
    <circle cx="15" cy="9" r="4.5" />
    <circle cx="12" cy="15" r="4.5" />
    <path d="M4.5 4 L4.5 2 M19.5 4 L19.5 2 M12 19.5 V22" />
  </g>,
  className,
);
const Motor = ({ className }: { className: string }) => svg(
  <g>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="2.5" />
    <path d="M12 4 V2 M12 22 V20 M4 12 H2 M22 12 H20 M6.3 6.3 L4.9 4.9 M19.1 19.1 L17.7 17.7 M6.3 17.7 L4.9 19.1 M19.1 4.9 L17.7 6.3" />
  </g>,
  className,
);
const Cable = ({ className }: { className: string }) => svg(
  <g>
    <path d="M3 12 H17" />
    <path d="M17 12 L13 8 M17 12 L13 16" />
    <rect x="18.5" y="9" width="3" height="6" rx="0.5" />
    <path d="M6 9 V15 M9 9 V15 M12 9 V15" />
  </g>,
  className,
);
const Shield = ({ className }: { className: string }) => svg(
  <g>
    <path d="M12 3 L20 6 V12 C20 16.5 16.5 20 12 21 C7.5 20 4 16.5 4 12 V6 Z" />
    <path d="M9 12 L11 14 L15 10" />
  </g>,
  className,
);
const Ground = ({ className }: { className: string }) => svg(
  <g>
    <path d="M12 3 V14" />
    <path d="M7 14 H17" />
    <path d="M9 17 H15" />
    <path d="M10 20 H14" />
  </g>,
  className,
);
const Solar = ({ className }: { className: string }) => svg(
  <g>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3 V6 M12 18 V21 M3 12 H6 M18 12 H21 M5.6 5.6 L7.7 7.7 M16.3 16.3 L18.4 18.4 M5.6 18.4 L7.7 16.3 M16.3 7.7 L18.4 5.6" />
  </g>,
  className,
);
const Swap = ({ className }: { className: string }) => svg(
  <g>
    <path d="M4 7 H18 L14 3" />
    <path d="M20 17 H6 L10 21" />
  </g>,
  className,
);
const Wave = ({ className }: { className: string }) => svg(
  <path d="M2 12 C 4 6, 6 18, 8 12 S 12 6, 14 12 S 18 18, 20 12 S 22 6, 24 12" />,
  className,
);
const ThreePhase = ({ className }: { className: string }) => svg(
  <g>
    <path d="M3 12 C 4 8, 6 16, 7 12" />
    <path d="M10 12 C 11 6, 13 18, 14 12" />
    <path d="M17 12 C 18 8, 20 16, 21 12" />
  </g>,
  className,
);
const PF = ({ className }: { className: string }) => svg(
  <g>
    <path d="M3 12 H21" />
    <path d="M5 12 L7 6 L10 18 L13 8 L16 14 L19 11" />
  </g>,
  className,
);
const Cap = ({ className }: { className: string }) => svg(
  <g>
    <path d="M3 9 H8 V15 H3 Z" />
    <path d="M16 9 H21 V15 H16 Z" />
    <path d="M8 12 H16" />
  </g>,
  className,
);
const Wye = ({ className }: { className: string }) => svg(
  <g>
    <path d="M12 12 L4 5" />
    <path d="M12 12 L20 5" />
    <path d="M12 12 L12 22" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" />
  </g>,
  className,
);
const Delta = ({ className }: { className: string }) => svg(
  <g>
    <path d="M12 4 L21 18 L3 18 Z" />
    <circle cx="12" cy="13" r="1.2" fill="currentColor" />
  </g>,
  className,
);
const Drop = ({ className }: { className: string }) => svg(
  <g>
    <path d="M3 18 L8 13 L11 16 L15 10 L21 14" />
    <path d="M3 22 H21" />
  </g>,
  className,
);
const Gear = ({ className }: { className: string }) => svg(
  <g>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2 V5 M12 19 V22 M4.2 4.2 L6.3 6.3 M17.7 17.7 L19.8 19.8 M2 12 H5 M19 12 H22 M4.2 19.8 L6.3 17.7 M17.7 6.3 L19.8 4.2" />
  </g>,
  className,
);
const Search = ({ className }: { className: string }) => svg(
  <g>
    <circle cx="11" cy="11" r="6" />
    <path d="M20 20 L15 15" />
  </g>,
  className,
);
const Menu = ({ className }: { className: string }) => svg(
  <g><path d="M4 7 H20 M4 12 H20 M4 17 H20" /></g>,
  className,
);
const Close = ({ className }: { className: string }) => svg(
  <g><path d="M6 6 L18 18 M18 6 L6 18" /></g>,
  className,
);
const Check = ({ className }: { className: string }) => svg(
  <g><path d="M5 12 L10 17 L19 7" /></g>,
  className,
);
const ArrowRight = ({ className }: { className: string }) => svg(
  <g><path d="M5 12 H19 M13 6 L19 12 L13 18" /></g>,
  className,
);
const ArrowLeft = ({ className }: { className: string }) => svg(
  <g><path d="M19 12 H5 M11 6 L5 12 L11 18" /></g>,
  className,
);
const ChevronDown = ({ className }: { className: string }) => svg(
  <g><path d="M6 9 L12 15 L18 9" /></g>,
  className,
);
const Info = ({ className }: { className: string }) => svg(
  <g>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11 V17" />
    <circle cx="12" cy="8" r="0.8" fill="currentColor" />
  </g>,
  className,
);
const Warn = ({ className }: { className: string }) => svg(
  <g>
    <path d="M12 4 L22 20 H2 Z" />
    <path d="M12 10 V14" />
    <circle cx="12" cy="17" r="0.8" fill="currentColor" />
  </g>,
  className,
);
const Doc = ({ className }: { className: string }) => svg(
  <g>
    <path d="M7 3 H15 L19 7 V21 H5 V5 a2 2 0 0 1 2-2 Z" />
    <path d="M14 3 V8 H19" />
    <path d="M9 13 H15 M9 17 H13" />
  </g>,
  className,
);
const Battery = ({ className }: { className: string }) => svg(
  <g>
    <rect x="3" y="8" width="16" height="10" rx="1.5" />
    <rect x="5" y="10" width="9" height="6" fill="currentColor" stroke="none" />
    <path d="M21 11 V15" />
  </g>,
  className,
);
const Ruler = ({ className }: { className: string }) => svg(
  <g>
    <path d="M3 16 L8 21 L21 8 L16 3 Z" />
    <path d="M7 11 L9 13 M11 7 L13 9 M15 11 L17 13" />
  </g>,
  className,
);
const Star = ({ className }: { className: string }) => svg(
  <g>
    <path d="M12 3 L14.6 9 L21 9.7 L16.2 14 L17.6 20.5 L12 17 L6.4 20.5 L7.8 14 L3 9.7 L9.4 9 Z" />
  </g>,
  className,
);
const Clock = ({ className }: { className: string }) => svg(
  <g>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7 V12 L15 14" />
  </g>,
  className,
);

// Animated "live" indicator dot
export function LiveDot({ className = '' }: { className?: string }) {
  return (
    <span className={['relative inline-flex h-2 w-2', className].join(' ')}>
      <span className="absolute inset-0 animate-pulse-dot rounded-full bg-live" />
      <span className="absolute inset-0 rounded-full bg-live" />
    </span>
  );
}
