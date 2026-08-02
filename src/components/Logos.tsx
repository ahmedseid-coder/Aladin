import React from 'react';

// DKT Ethiopia Logo Component
export const DktLogo: React.FC<{ className?: string; variant?: 'light' | 'dark' | 'color' }> = ({
  className = 'h-10',
  variant = 'color'
}) => {
  return (
    <div className={`inline-flex flex-col items-center justify-center font-sans ${className}`}>
      <svg
        viewBox="0 0 320 180"
        className="h-full w-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* dkt main bold lowercase text */}
        <text
          x="10"
          y="120"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="900"
          fontSize="130"
          fill={variant === 'dark' ? '#ffffff' : '#e11d48'}
          letterSpacing="-4"
        >
          dkt
        </text>
        {/* ETHIOPIA subtext */}
        <text
          x="18"
          y="160"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="800"
          fontSize="30"
          fill={variant === 'dark' ? '#ffffff' : '#e11d48'}
          letterSpacing="14"
        >
          ETHIOPIA
        </text>
      </svg>
    </div>
  );
};

// SABA dkt Partner Clinics Logo Component
export const SabaClinicLogo: React.FC<{ className?: string }> = ({ className = 'h-12' }) => {
  return (
    <div className={`inline-flex flex-col items-start ${className}`}>
      <div className="bg-white p-2 rounded-xl border border-rose-200/40 shadow-sm flex items-center gap-3">
        {/* DKT Red Block */}
        <div className="bg-red-600 text-white font-black text-xs px-2 py-1 rounded tracking-tighter uppercase font-mono">
          dkt
        </div>

        <div className="flex flex-col">
          {/* SABA Header */}
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-black text-rose-600 tracking-wider font-sans leading-none">
              SABA
            </span>
            <span className="text-[10px] font-bold text-slate-700 bg-rose-100 px-1.5 py-0.5 rounded border border-rose-200 uppercase">
              Clinic
            </span>
          </div>

          {/* Subtext */}
          <div className="text-[9px] font-extrabold text-slate-800 tracking-tight font-sans mt-0.5">
            dkt Partner Clinics Ethiopia
          </div>
        </div>
      </div>
    </div>
  );
};
