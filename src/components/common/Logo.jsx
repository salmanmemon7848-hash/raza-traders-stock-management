import React from 'react';

const Logo = ({ size = 36, withText = true, textClassName = '' }) => (
  <div className="flex items-center gap-2.5">
    <div
      className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center font-extrabold shadow-soft"
      style={{ width: size, height: size, fontSize: size * 0.45 }}
      aria-hidden="true"
    >
      R
    </div>
    {withText && (
      <div className={`flex flex-col leading-none ${textClassName}`}>
        <span className="text-[15px] font-bold text-slate-900 tracking-tight">Raza Traders</span>
        <span className="text-[11px] text-slate-500 mt-0.5">Business Manager</span>
      </div>
    )}
  </div>
);

export default Logo;
