const ACCESSORY_PATHS = {
  beach: (
    <g>
      <path d="M27 102 L41 102 L34 114 Z" fill="#F59E0B" />
      <rect x="33" y="114" width="2" height="8" fill="#1B2A52" />
    </g>
  ),
  auto: (
    <g>
      <circle cx="34" cy="114" r="9" fill="none" stroke="#1B2A52" strokeWidth="2.6" />
      <line x1="34" y1="105" x2="34" y2="123" stroke="#1B2A52" strokeWidth="2" />
    </g>
  ),
  phone: (
    <g>
      <rect x="29" y="102" width="11" height="19" rx="2.6" fill="#1B2A52" />
      <rect x="31.5" y="105" width="6" height="13" fill="#5FD4FF" />
    </g>
  ),
  laptop: (
    <g>
      <rect x="24" y="98" width="18" height="13" rx="1.6" fill="#1B2A52" />
      <rect x="26" y="100" width="14" height="9" fill="#5FD4FF" />
      <rect x="21" y="111" width="24" height="3" rx="1.5" fill="#C9CEE0" />
    </g>
  ),
  tv: (
    <g>
      <rect x="23" y="98" width="22" height="14" rx="2" fill="#1B2A52" />
      <rect x="25.5" y="100.5" width="17" height="9" fill="#5FD4FF" />
      <rect x="32" y="112" width="4" height="4" fill="#C9CEE0" />
      <rect x="27" y="116" width="14" height="2" rx="1" fill="#C9CEE0" />
    </g>
  ),
  fitness: (
    <g>
      <rect x="26" y="111.5" width="16" height="3" rx="1.5" fill="#1B2A52" />
      <circle cx="25" cy="113" r="5" fill="#1B2A52" /><circle cx="43" cy="113" r="5" fill="#1B2A52" />
      <circle cx="25" cy="113" r="2" fill="#C9CEE0" /><circle cx="43" cy="113" r="2" fill="#C9CEE0" />
    </g>
  ),
  pet: (
    <g>
      <circle cx="34" cy="111" r="4.4" fill="#1B2A52" />
      <circle cx="27" cy="105" r="2.6" fill="#1B2A52" /><circle cx="34" cy="102" r="2.6" fill="#1B2A52" /><circle cx="41" cy="105" r="2.6" fill="#1B2A52" />
    </g>
  ),
  dining: (
    <g>
      <rect x="29" y="98" width="2.4" height="22" rx="1.2" fill="#1B2A52" />
      <path d="M27.5 98 v6 M29.2 98 v6 M31 98 v6" stroke="#1B2A52" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="38" y="98" width="2.4" height="22" rx="1.2" fill="#1B2A52" />
    </g>
  ),
  career: (
    <g>
      <rect x="23" y="104" width="22" height="15" rx="2.5" fill="#1B2A52" />
      <rect x="30" y="100" width="8" height="6" rx="1.8" fill="none" stroke="#1B2A52" strokeWidth="2.2" />
      <rect x="32.5" y="110" width="3" height="3" fill="#D4AF37" />
    </g>
  ),
  premium: (
    <g>
      <path d="M58 76 L67 80 L58 84 Z" fill="#D4AF37" />
      <path d="M82 76 L73 80 L82 84 Z" fill="#D4AF37" />
      <circle cx="70" cy="80" r="2.6" fill="#1B2A52" />
    </g>
  ),
};

const RIGHT_ARMS = {
  greet: (
    <>
      <path className="asel-wave-arm" d="M98 80 C112 82 118 64 108 50" stroke="url(#aselPoseGrad)" strokeWidth="15" strokeLinecap="round" fill="none" />
      <circle cx="108" cy="48" r="9" fill="url(#aselPoseGrad)" stroke="#C9CEE0" strokeWidth="1" />
      <rect x="103" y="32" width="9" height="17" rx="4.5" fill="url(#aselPoseGrad)" stroke="#C9CEE0" strokeWidth="1" />
    </>
  ),
  point: (
    <>
      <path d="M98 80 C114 74 124 64 128 54" stroke="url(#aselPoseGrad)" strokeWidth="15" strokeLinecap="round" fill="none" />
      <circle cx="128" cy="52" r="8" fill="url(#aselPoseGrad)" stroke="#C9CEE0" strokeWidth="1" />
      <rect x="128" y="38" width="6" height="14" rx="3" fill="url(#aselPoseGrad)" stroke="#C9CEE0" strokeWidth="1" transform="rotate(25 131 45)" />
    </>
  ),
  lean: (
    <>
      <path d="M98 80 C110 86 112 102 106 112" stroke="url(#aselPoseGrad)" strokeWidth="15" strokeLinecap="round" fill="none" />
      <circle cx="106" cy="114" r="9" fill="url(#aselPoseGrad)" stroke="#C9CEE0" strokeWidth="1" />
    </>
  ),
};

export default function AselPose({ pose = "greet", accessory = "none", size = 110, flip = false, style = {} }) {
  const isPeek = pose === "peek";
  const acc = ACCESSORY_PATHS[accessory];
  const showHeadAcc = accessory === "beach";

  if (isPeek) {
    return (
      <div style={{ width: size, height: size * 0.62, overflow: "hidden", pointerEvents: "none", animation: "aselPopPeek 0.45s cubic-bezier(.34,1.56,.64,1) both", ...style }}>
        <svg viewBox="0 0 140 90" width={size} height={size * 0.62} style={{ transform: flip ? "scaleX(-1)" : "none" }}>
          <defs>
            <linearGradient id="aselPoseGradPeek" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" /><stop offset="100%" stopColor="#E4E8F4" />
            </linearGradient>
          </defs>
          <g className="asel-peek-glance">
            <line x1="70" y1="10" x2="70" y2="23" stroke="#C9A24B" strokeWidth="3" strokeLinecap="round" />
            <path d="M70 0 L73 6 L80 8 L73 10 L70 18 L67 10 L60 8 L67 6 Z" fill="#D4AF37" />
            <circle cx="70" cy="8" r="2.2" fill="#1B2A52" className="asel-gem" />
            <ellipse cx="70" cy="40" rx="34" ry="30" fill="url(#aselPoseGradPeek)" />
            <circle cx="38" cy="42" r="7" fill="#D4AF37" /><circle cx="38" cy="42" r="2.6" fill="#5FD4FF" />
            <circle cx="102" cy="42" r="7" fill="#D4AF37" /><circle cx="102" cy="42" r="2.6" fill="#5FD4FF" />
            <rect x="48" y="28" width="44" height="26" rx="13" fill="#0B0F20" />
            <path d="M56 40 Q62 32 68 40" stroke="#5FD4FF" strokeWidth="3.2" fill="none" strokeLinecap="round" />
            <path d="M72 40 Q78 32 84 40" stroke="#5FD4FF" strokeWidth="3.2" fill="none" strokeLinecap="round" />
            <path d="M60 47 Q70 53 80 47" stroke="#5FD4FF" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          </g>
          <ellipse cx="70" cy="78" rx="40" ry="20" fill="url(#aselPoseGradPeek)" />
        </svg>
        <style>{`
          .asel-peek-glance { transform-origin: 70px 50px; animation: aselGlance 4.5s ease-in-out infinite; }
          @keyframes aselGlance { 0%,100%{transform:rotate(0deg);} 25%{transform:rotate(-9deg);} 60%{transform:rotate(7deg);} }
          .asel-gem { animation: aselGemP 1.8s ease-in-out infinite; }
          @keyframes aselGemP { 0%,100%{opacity:1;} 50%{opacity:0.5;} }
          @keyframes aselPopPeek { 0%{opacity:0; transform:translateY(8px);} 100%{opacity:1; transform:translateY(0);} }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ width: size, height: size * 1.21, pointerEvents: "none", ...style }}>
      <svg viewBox="0 0 140 170" width={size} height={size * 1.21}
        className="asel-pose-bob"
        style={{ transform: `${flip ? "scaleX(-1) " : ""}${pose === "lean" ? "rotate(-6deg)" : ""}`, transformOrigin: "70px 130px" }}>
        <defs>
          <linearGradient id="aselPoseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" /><stop offset="100%" stopColor="#E4E8F4" />
          </linearGradient>
          <linearGradient id="aselPoseScreen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1C2238" /><stop offset="100%" stopColor="#0B0F20" />
          </linearGradient>
        </defs>

        <rect x="52" y="118" width="14" height="32" rx="7" fill="url(#aselPoseGrad)" />
        <rect x="74" y="118" width="14" height="32" rx="7" fill="url(#aselPoseGrad)" />
        <circle cx="59" cy="140" r="4" fill="#D4AF37" /><circle cx="81" cy="140" r="4" fill="#D4AF37" />
        <ellipse cx="59" cy="154" rx="13" ry="7" fill="#1B2A52" /><ellipse cx="81" cy="154" rx="13" ry="7" fill="#1B2A52" />
        <rect x="49" y="151" width="20" height="3" fill="#D4AF37" /><rect x="71" y="151" width="20" height="3" fill="#D4AF37" />

        <path d="M42 80 C30 86 28 102 34 112" stroke="url(#aselPoseGrad)" strokeWidth="15" strokeLinecap="round" fill="none" />
        <circle cx="34" cy="114" r="9" fill="url(#aselPoseGrad)" stroke="#C9CEE0" strokeWidth="1" />
        {acc}

        {RIGHT_ARMS[pose] || RIGHT_ARMS.greet}

        <ellipse cx="70" cy="65" rx="22" ry="4" fill="#D4AF37" opacity="0.85" />
        <rect x="40" y="66" width="60" height="56" rx="22" fill="url(#aselPoseGrad)" />
        <circle cx="42" cy="72" r="6" fill="#D4AF37" /><circle cx="98" cy="72" r="6" fill="#D4AF37" />
        <rect x="55" y="80" width="30" height="27" rx="10" fill="#1B2A52" stroke="#D4AF37" strokeWidth="2.2" />
        <text x="70" y="100" textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="700" fontSize="15" fill="#fff">AS</text>

        <g>
          <line x1="70" y1="10" x2="70" y2="23" stroke="#C9A24B" strokeWidth="3" strokeLinecap="round" />
          <path d="M70 0 L73 6 L80 8 L73 10 L70 18 L67 10 L60 8 L67 6 Z" fill="#D4AF37" />
          <circle cx="70" cy="8" r="2.2" fill="#1B2A52" className="asel-gem" />
          <ellipse cx="70" cy="40" rx="34" ry="30" fill="url(#aselPoseGrad)" />
          <circle cx="38" cy="42" r="7" fill="#D4AF37" /><circle cx="38" cy="42" r="2.6" fill="#5FD4FF" />
          <circle cx="102" cy="42" r="7" fill="#D4AF37" /><circle cx="102" cy="42" r="2.6" fill="#5FD4FF" />
          <rect x="48" y="28" width="44" height="26" rx="13" fill="url(#aselPoseScreen)" />
          <path d="M56 40 Q62 32 68 40" stroke="#5FD4FF" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <path d="M72 40 Q78 32 84 40" stroke="#5FD4FF" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <path d="M60 47 Q70 53 80 47" stroke="#5FD4FF" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          {showHeadAcc && (
            <g>
              <rect x="50" y="33" width="16" height="9" rx="3" fill="#1F2937" />
              <rect x="74" y="33" width="16" height="9" rx="3" fill="#1F2937" />
              <line x1="66" y1="37" x2="74" y2="37" stroke="#1F2937" strokeWidth="2" />
            </g>
          )}
        </g>
      </svg>

      <style>{`
        .asel-pose-bob { animation: aselPop 0.45s cubic-bezier(.34,1.56,.64,1) both, aselPoseBob 3s ease-in-out 0.45s infinite; }
        @keyframes aselPop { 0%{opacity:0; transform:scale(0.55) translateY(10px) ${pose === "lean" ? "rotate(-6deg)" : ""};} 70%{opacity:1; transform:scale(1.08) translateY(-2px) ${pose === "lean" ? "rotate(-6deg)" : ""};} 100%{opacity:1; transform:scale(1) translateY(0) ${pose === "lean" ? "rotate(-6deg)" : ""};} }
        @keyframes aselPoseBob { 0%,100%{transform:translateY(0) ${pose === "lean" ? "rotate(-6deg)" : ""};} 50%{transform:translateY(-5px) ${pose === "lean" ? "rotate(-6deg)" : ""};} }
        .asel-wave-arm { transform-origin: 98px 80px; animation: aselWave 4.2s ease-in-out infinite; }
        @keyframes aselWave { 0%, 70%, 100% { transform: rotate(0deg); } 78% { transform: rotate(-8deg); } 86% { transform: rotate(6deg); } 94% { transform: rotate(-4deg); } }
        .asel-gem { animation: aselGemP 1.8s ease-in-out infinite; }
        @keyframes aselGemP { 0%,100%{opacity:1;} 50%{opacity:0.5;} }
      `}</style>
    </div>
  );
}
