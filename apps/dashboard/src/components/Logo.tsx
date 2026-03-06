import type { JSX } from 'preact';

export function Logo(props: JSX.SVGAttributes<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" {...props}>
      {/* Blue shadow */}
      <path
        d="M 94 23 C 139 23, 169 43, 169 98 C 169 143, 129 178, 94 188 C 59 178, 19 143, 19 98 C 19 43, 49 23, 94 23 Z"
        fill="#006B9E"
      />

      {/* Dark background */}
      <path
        d="M 100 20 C 145 20, 175 40, 175 95 C 175 140, 135 175, 100 185 C 65 175, 25 140, 25 95 C 25 40, 55 20, 100 20 Z"
        fill="#161618"
      />

      {/* Orange Logo Mark */}
      <g fill="#E87A14">
        <rect x="93" y="56" width="14" height="88" rx="0" />
        <circle cx="100" cy="56" r="11" />
        <circle cx="100" cy="144" r="11" />
        <circle cx="54" cy="80" r="11" />
        <circle cx="146" cy="80" r="11" />
        <line x1="100" y1="100" x2="54" y2="80" stroke="#E87A14" strokeWidth="14" strokeLinecap="round" />
        <line x1="100" y1="100" x2="146" y2="80" stroke="#E87A14" strokeWidth="14" strokeLinecap="round" />
        <polygon points="43,80 65,80 65,112 43,122" />
        <polygon points="135,80 157,80 157,122 135,112" />
      </g>
    </svg>
  );
}
