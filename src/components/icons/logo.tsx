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
      <path d="m21.21 15.89-1.42-1.42" />
      <path d="m15.89 21.21-1.42-1.42" />
      <path d="m15.89 2.79 1.42 1.42" />
      <path d="m2.79 15.89 1.42 1.42" />
      <path d="m9 12 2 2 4-4" />
      <path d="M12.01 2.01 12 2" />
      <path d="m12.01 22.01.01-.01" />
      <path d="m22.01 12.01.01-.01" />
      <path d="m2.01 12.01.01-.01" />
      <path d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z" />
    </svg>
  );
}
