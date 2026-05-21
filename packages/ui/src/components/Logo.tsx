import * as React from 'react';

type LogoProps = React.SVGProps<SVGSVGElement> & { showWordmark?: boolean };

export const Logo = ({ showWordmark = true, className, ...props }: LogoProps) => (
  <div className={`flex items-center gap-2 ${className ?? ''}`}>
    <svg viewBox="0 0 28 28" className="h-6 w-6" {...props}>
      <defs>
        <linearGradient id="karpos-leaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#10b981" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
      </defs>
      <circle cx="14" cy="14" r="13" fill="url(#karpos-leaf)" />
      <path
        d="M14 6c-3.6 0-6.5 2.9-6.5 6.5 0 4.3 6.5 9.5 6.5 9.5s6.5-5.2 6.5-9.5C20.5 8.9 17.6 6 14 6zm0 9a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"
        fill="white"
        opacity="0.95"
      />
    </svg>
    {showWordmark ? (
      <span className="text-base font-semibold tracking-tight text-neutral-900">Karpos</span>
    ) : null}
  </div>
);
