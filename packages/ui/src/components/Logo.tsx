import * as React from 'react';

export interface LogoProps extends React.SVGProps<SVGSVGElement> {
  variant?: 'full' | 'mark';
}

export const Logo = ({ variant = 'full', ...rest }: LogoProps) => {
  if (variant === 'mark') {
    return (
      <svg viewBox="0 0 56 56" role="img" aria-label="Karpos" {...rest}>
        <g transform="translate(4,4)">
          <path
            d="M24 4 C36 4 44 14 44 26 C44 38 36 48 24 48 C12 48 4 38 4 26 C4 14 12 4 24 4 Z"
            fill="#0E5C3A"
          />
          <path d="M30 6 C40 0 50 4 52 12 C46 18 36 18 30 12 Z" fill="#3FA66B" />
          <circle cx="18" cy="28" r="3" fill="#F0B23C" />
        </g>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 240 64" role="img" aria-label="Karpos" {...rest}>
      <g transform="translate(8,8)">
        <path
          d="M24 4 C36 4 44 14 44 26 C44 38 36 48 24 48 C12 48 4 38 4 26 C4 14 12 4 24 4 Z"
          fill="#0E5C3A"
        />
        <path d="M30 6 C40 0 50 4 52 12 C46 18 36 18 30 12 Z" fill="#3FA66B" />
        <circle cx="18" cy="28" r="3" fill="#F0B23C" />
      </g>
      <text
        x="68"
        y="42"
        fontFamily="Fraunces, Georgia, serif"
        fontSize="30"
        fontWeight="600"
        fill="#1B2A29"
        letterSpacing="-0.5"
      >
        Karpos
      </text>
    </svg>
  );
};
