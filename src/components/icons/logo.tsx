import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
        <path d="M12 22h8.5a.5.5 0 0 0 .5-.5v-19a.5.5 0 0 0-.5-.5H3a.5.5 0 0 0-.5.5v12.5c0 .3.2.5.5.5h3"/>
        <path d="m3 12.5 5 3-5 3v-6Z"/>
        <path d="M16 19h2"/>
        <path d="M14 19h-1.5"/>
        <path d="M17 16v6"/>
    </svg>
  );
}
