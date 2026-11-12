import React from 'react';

type P = {size?: number; color?: string; strokeWidth?: number};

const Svg: React.FC<P & {children: React.ReactNode}> = ({size = 32, color = 'currentColor', strokeWidth = 2, children}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{flexShrink: 0, display: 'block'}}
  >
    {children}
  </svg>
);

export const WarningIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M12 3.5 2.5 20h19L12 3.5Z" />
    <path d="M12 10v4.5" />
    <path d="M12 17.2v.1" />
  </Svg>
);

export const TruckIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M2 6h11v10H2z" />
    <path d="M13 9h4.5L21 12.5V16h-8z" />
    <circle cx="6.5" cy="17.5" r="1.8" />
    <circle cx="16.5" cy="17.5" r="1.8" />
  </Svg>
);

export const SearchIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-4-4" />
  </Svg>
);

export const CopyIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V6a2 2 0 0 1 2-2h9" />
  </Svg>
);

export const CheckIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="m4.5 12.5 5 5 10-11" />
  </Svg>
);

export const CrossIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const InsertIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M5 4v8a3 3 0 0 0 3 3h11" />
    <path d="m15 11 4 4-4 4" />
  </Svg>
);

export const ClockIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Svg>
);

export const BoxIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M3 8 12 3l9 5v8l-9 5-9-5V8Z" />
    <path d="m3 8 9 5 9-5M12 13v8" />
  </Svg>
);

export const LockIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </Svg>
);

export const MailIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </Svg>
);

export const BrowserIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 9h18" />
  </Svg>
);

export const StoreIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M4 10v10h16V10" />
    <path d="M3 10 5 4h14l2 6a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0Z" />
  </Svg>
);

export const ServerIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <rect x="4" y="4" width="16" height="7" rx="2" />
    <rect x="4" y="13" width="16" height="7" rx="2" />
    <path d="M8 7.5v.1M8 16.5v.1" />
  </Svg>
);

// Lateling mark: an eye on the brand green, drawn here so no image file is needed.
export const LatelingMark: React.FC<{size?: number}> = ({size = 96}) => (
  <svg width={size} height={size} viewBox="0 0 48 48" style={{display: 'block', flexShrink: 0}}>
    <rect width="48" height="48" rx="11" fill="#2f5b45" />
    <path
      d="M8 24s6-10 16-10 16 10 16 10-6 10-16 10S8 24 8 24Z"
      fill="none"
      stroke="#fff"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <circle cx="24" cy="24" r="5.5" fill="#fff" />
  </svg>
);
