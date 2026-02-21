import React from "react";

export function FortisLogo({ className = "h-12 w-auto", iconOnly = false }: { className?: string; iconOnly?: boolean }) {
  return (
    <svg 
      viewBox={iconOnly ? "0 0 80 100" : "0 0 300 100"}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* USACE Style Deep Red Gradient */}
        <linearGradient id="castleRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b1219" /> {/* Darker Castle Red */}
          <stop offset="100%" stopColor="#630d12" /> {/* Shadow Red */}
        </linearGradient>
        
        {/* Glow for the Shield */}
        <filter id="shieldGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur" />
          <feOffset dx="0" dy="1" result="offsetBlur" />
          <feColorMatrix in="offsetBlur" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.4 0" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* The Shield Icon */}
      <g filter="url(#shieldGlow)">
        <path 
          d="M 40 10 L 75 18 V 45 C 75 70 40 88 40 88 C 40 88 5 70 5 45 V 18 L 40 10 Z" 
          fill="url(#castleRedGrad)" 
        />
        {/* The 'F' inside the shield */}
        <path 
          d="M 32 28 H 54 V 36 H 40 V 44 H 50 V 52 H 40 V 68 H 32 V 28 Z" 
          fill="white" 
        />
      </g>

      {/* Brand Text Integrated for Google Verification */}
      <text 
        x="90" 
        y="52" 
        fill="#8b1219" 
        style={{ 
          font: "bold 32px sans-serif", 
          letterSpacing: "-1px",
          textTransform: "uppercase"
        }}
      >
        FORTIS
      </text>
      <text 
        x="90" 
        y="78" 
        fill="#475569" 
        style={{ 
          font: "400 20px sans-serif", 
          letterSpacing: "2px"
        }}
      >
        BUDGET
      </text>
    </svg>
  );
}