import React from 'react';

interface CodeMoonProps {
  size?: number;
}

export const CodeMoon: React.FC<CodeMoonProps> = ({ size = 130 }) => (
  <div className="code-moon-container" style={{ width: size, height: size }} aria-hidden="true">
    <div className="moon-procedural-glow" />
    <svg className="clean-full-moon" width={size} height={size} viewBox="0 0 200 200" role="presentation">
      <defs>
        <radialGradient id="moonSurface" cx="34%" cy="28%" r="78%">
          <stop offset="0" stopColor="#e9edf1" />
          <stop offset="0.48" stopColor="#b8c0c8" />
          <stop offset="0.82" stopColor="#858f99" />
          <stop offset="1" stopColor="#59636e" />
        </radialGradient>
        <radialGradient id="moonMare" cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#69747e" stopOpacity=".55" />
          <stop offset="1" stopColor="#4c5660" stopOpacity=".2" />
        </radialGradient>
        <radialGradient id="moonCrater" cx="35%" cy="28%" r="75%">
          <stop offset="0" stopColor="#dce1e5" stopOpacity=".48" />
          <stop offset=".48" stopColor="#7a858f" stopOpacity=".42" />
          <stop offset="1" stopColor="#404a54" stopOpacity=".65" />
        </radialGradient>
        <filter id="moonTexture"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" /><feColorMatrix values="0 0 0 0 .5 0 0 0 0 .55 0 0 0 0 .6 0 0 0 .16 0" /></filter>
        <clipPath id="moonClip"><circle cx="100" cy="100" r="98" /></clipPath>
      </defs>
      <g clipPath="url(#moonClip)">
        <circle cx="100" cy="100" r="99" fill="url(#moonSurface)" />
        <ellipse cx="60" cy="68" rx="34" ry="28" fill="url(#moonMare)" />
        <ellipse cx="124" cy="76" rx="31" ry="22" fill="url(#moonMare)" />
        <ellipse cx="89" cy="133" rx="37" ry="24" fill="url(#moonMare)" />
        <ellipse cx="151" cy="120" rx="22" ry="30" fill="url(#moonMare)" />
        <rect width="200" height="200" filter="url(#moonTexture)" opacity=".35" />
        <g fill="url(#moonCrater)" stroke="#e2e6e9" strokeOpacity=".25" strokeWidth="1.2">
          <ellipse cx="48" cy="52" rx="10" ry="8" />
          <ellipse cx="83" cy="63" rx="7" ry="6" />
          <ellipse cx="131" cy="47" rx="9" ry="7" />
          <ellipse cx="155" cy="84" rx="6" ry="5" />
          <ellipse cx="66" cy="116" rx="9" ry="7" />
          <ellipse cx="111" cy="112" rx="7" ry="6" />
          <ellipse cx="143" cy="151" rx="10" ry="8" />
          <ellipse cx="88" cy="161" rx="5" ry="4" />
        </g>
      </g>
      <circle cx="100" cy="100" r="98" fill="none" stroke="#f4f6f8" strokeOpacity=".22" strokeWidth="2" />
    </svg>
  </div>
); 

export default CodeMoon;
