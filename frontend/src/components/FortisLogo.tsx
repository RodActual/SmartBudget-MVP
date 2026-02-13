export function FortisLogo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Subtle Inner Glow Filter */}
        <filter id="innerGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
          <feOffset dx="0" dy="1" result="offsetBlur" />
          <feComposite in="offsetBlur" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadow" />
          <feColorMatrix in="shadow" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.3 0" />
        </filter>
      </defs>

      {/* Shield Base */}
      <path 
        d="M 50 5 L 90 15 V 45 C 90 75 50 95 50 95 C 50 95 10 75 10 45 V 15 L 50 5 Z" 
        fill="#001D3D" 
      />

      {/* Overlay path that applies the glow effect */}
      <path 
        d="M 50 5 L 90 15 V 45 C 90 75 50 95 50 95 C 50 95 10 75 10 45 V 15 L 50 5 Z" 
        filter="url(#innerGlow)" 
      />

      {/* The Centered 'F' */}
      <path 
        d="M 38 25 H 68 V 35 H 48 V 45 H 63 V 55 H 48 V 70 H 38 V 25 Z" 
        fill="white" 
      />
    </svg>
  );
}
