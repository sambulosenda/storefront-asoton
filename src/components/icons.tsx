import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 20, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const SearchIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </Icon>
);

export const AccountIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
  </Icon>
);

export const MenuIcon = (p: IconProps) => (
  <Icon size={22} {...p}>
    <path d="M3 9h18M3 15h18" />
  </Icon>
);

export const CloseIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
);

export const ArrowRight = (p: IconProps) => (
  <Icon size={16} {...p}>
    <path d="M4 12h16M14 6l6 6-6 6" />
  </Icon>
);

export const ArrowLeft = (p: IconProps) => (
  <Icon size={22} {...p}>
    <path d="M20 12H4M10 6l-6 6 6 6" />
  </Icon>
);

export const ChevronDown = (p: IconProps) => (
  <Icon size={14} {...p}>
    <path d="M6 9l6 6 6-6" />
  </Icon>
);

export const CheckIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Icon>
);

export const PlusIcon = (p: IconProps) => (
  <Icon size={18} {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

export const MinusIcon = (p: IconProps) => (
  <Icon size={18} {...p}>
    <path d="M5 12h14" />
  </Icon>
);

export const FilterIcon = (p: IconProps) => (
  <Icon size={18} {...p}>
    <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="10" cy="17" r="2" />
  </Icon>
);

export const BagIcon = (p: IconProps) => (
  <Icon size={21} {...p}>
    <path d="M5 8h14l-1 12H6L5 8z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </Icon>
);

export const HeartIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
  </Icon>
);

export const AlertIcon = (p: IconProps) => (
  <Icon size={18} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v6M12 16.5v.5" />
  </Icon>
);

export const FourUpIcon = (p: IconProps) => (
  <Icon size={18} {...p}>
    <path d="M3 5h3v14H3zM8 5h3v14H8zM13 5h3v14h-3zM18 5h3v14h-3z" />
  </Icon>
);

export const TwoUpIcon = (p: IconProps) => (
  <Icon size={18} {...p}>
    <path d="M3 5h7.5v14H3zM13.5 5H21v14h-7.5z" />
  </Icon>
);

export function StarIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.8 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z" />
    </svg>
  );
}
