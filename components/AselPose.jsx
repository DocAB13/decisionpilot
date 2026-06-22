// Asel — penguin mascot, all poses and accessories

const DARK = "#1A1A2E";
const CREAM = "#F5F0E8";
const ORANGE = "#FF8C00";
const ACCENT = "#1A56DB";

// Accessories held in the left wing area (around x=28, y=125)
const ACCESSORIES = {
  beach: (
    <g>
      {/* Cocktail umbrella */}
      <line x1="28" y1="110" x2="28" y2="134" stroke={DARK} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M16 110 L28 110 L40 110 Z" fill="#F59E0B" opacity="0.9"/>
      <path d="M19 110 L28 110 L37 110 Z" fill="#EF4444" opacity="0.8"/>
      {/* Sunglasses on face */}
      <rect x="58" y="43" width="10" height="6" rx="3" fill={DARK} opacity="0.85"/>
      <rect x="72" y="43" width="10" height="6" rx="3" fill={DARK} opacity="0.85"/>
      <line x1="68" y1="46" x2="72" y2="46" stroke={DARK} strokeWidth="1.5"/>
    </g>
  ),
  auto: (
    <g>
      <circle cx="28" cy="122" r="11" fill="none" stroke={DARK} strokeWidth="2.5"/>
      <line x1="28" y1="111" x2="28" y2="133" stroke={DARK} strokeWidth="2"/>
      <line x1="17" y1="122" x2="39" y2="122" stroke={DARK} strokeWidth="2"/>
      <circle cx="28" cy="122" r="4" fill={DARK}/>
    </g>
  ),
  phone: (
    <g>
      <rect x="20" y="110" width="14" height="24" rx="3" fill={DARK}/>
      <rect x="22" y="113" width="10" height="17" fill="#5FD4FF"/>
      <circle cx="27" cy="131" r="1.5" fill="#888"/>
    </g>
  ),
  laptop: (
    <g>
      <rect x="16" y="113" width="22" height="15" rx="2" fill={DARK}/>
      <rect x="18" y="115" width="18" height="11" fill="#5FD4FF"/>
      <rect x="14" y="128" width="26" height="3" rx="1.5" fill={DARK}/>
    </g>
  ),
  tv: (
    <g>
      <rect x="15" y="110" width="26" height="18" rx="2.5" fill={DARK}/>
      <rect x="17.5" y="112.5" width="21" height="13" fill="#5FD4FF"/>
      <rect x="26" y="128" width="6" height="4" fill={DARK}/>
      <rect x="20" y="132" width="18" height="2.5" rx="1.2" fill={DARK}/>
    </g>
  ),
  fitness: (
    <g>
      <rect x="18" y="120" width="20" height="4" rx="2" fill={DARK}/>
      <circle cx="17" cy="122" r="6" fill={DARK}/><circle cx="17" cy="122" r="3" fill={CREAM}/>
      <circle cx="39" cy="122" r="6" fill={DARK}/><circle cx="39" cy="122" r="3" fill={CREAM}/>
    </g>
  ),
  pet: (
    <g>
      <circle cx="28" cy="122" r="6" fill="#8B5E3C"/>
      <circle cx="21" cy="115" r="4" fill="#8B5E3C"/>
      <circle cx="28" cy="113" r="4" fill="#8B5E3C"/>
      <circle cx="35" cy="115" r="4" fill="#8B5E3C"/>
      <ellipse cx="28" cy="124" rx="3" ry="2" fill="#F9A8D4"/>
    </g>
  ),
  dining: (
    <g>
      <rect x="22" y="108" width="3" height="26" rx="1.5" fill={DARK}/>
      <path d="M20 108 v7 M22 108 v7 M24 108 v7" stroke={DARK} strokeWidth="1.8" strokeLinecap="round"/>
      <rect x="30" y="108" width="3" height="26" rx="1.5" fill={DARK}/>
    </g>
  ),
  career: (
    <g>
      <rect x="16" y="116" width="24" height="18" rx="3" fill={DARK}/>
      <rect x="22" y="112" width="12" height="7" rx="2" fill="none" stroke={DARK} strokeWidth="2.2"/>
      <rect x="26" y="122" width="6" height="6" fill="#D4AF37" rx="1"/>
    </g>
  ),
  premium: (
    // Bowtie on neck
    <g>
      <path d="M58 70 L65 66 L65 74 Z" fill="#D4AF37"/>
      <path d="M82 70 L75 66 L75 74 Z" fill="#D4AF37"/>
      <ellipse cx="70" cy="70" rx="5" ry="4" fill="#B8860B"/>
    </g>
  ),
  none: null,
};

// Right wing variants per pose
function RightWing({ pose }) {
  if (pose === "greet") return (
    <>
      <path className="asel-wave-arm"
        d="M96 92 C108 80 116 64 108 50"
        stroke={DARK} strokeWidth="14" strokeLinecap="round" fill="none"/>
      {/* Wing tip / flipper */}
      <ellipse cx="107" cy="47" rx="9" ry="6" fill={DARK} transform="rotate(-20 107 47)"/>
    </>
  );
  if (pose === "point") return (
    <>
      <path d="M96 92 C112 78 124 66 128 54"
        stroke={DARK} strokeWidth="14" strokeLinecap="round" fill="none"/>
      <ellipse cx="127" cy="51" rx="9" ry="6" fill={DARK} transform="rotate(-35 127 51)"/>
    </>
  );
  // lean — wing down
  return (
    <path d="M96 92 C108 100 110 118 104 130"
      stroke={DARK} strokeWidth="14" strokeLinecap="round" fill="none"/>
  );
}

export default function AselPose({ pose = "greet", accessory = "none", size = 110, flip = false, style = {} }) {
  const isPeek = pose === "peek";
  const acc = ACCESSORIES[accessory] || null;

  if (isPeek) {
    return (
      <div style={{ width: size, height: size * 0.68, overflow: "hidden", pointerEvents: "none",
        animation: "aselPopPeek 0.45s cubic-bezier(.34,1.56,.64,1) both", ...style }}>
        <svg viewBox="0 0 140 95" width={size} height={size * 0.68}
          style={{ transform: flip ? "scaleX(-1)" : "none" }}>
          <g className="asel-peek-glance">
            {/* Head */}
            <ellipse cx="70" cy="52" rx="26" ry="24" fill={DARK}/>
            {/* Face patch */}
            <ellipse cx="70" cy="57" rx="17" ry="18" fill={CREAM}/>
            {/* Eyes */}
            <circle cx="62" cy="48" r="5.5" fill="white"/>
            <circle cx="63.5" cy="48" r="3" fill={DARK}/>
            <circle cx="64.5" cy="47" r="1.2" fill="white"/>
            <circle cx="78" cy="48" r="5.5" fill="white"/>
            <circle cx="79.5" cy="48" r="3" fill={DARK}/>
            <circle cx="80.5" cy="47" r="1.2" fill="white"/>
            {/* Beak */}
            <ellipse cx="70" cy="61" rx="7" ry="5" fill={ORANGE}/>
            <line x1="63" y1="61" x2="77" y2="61" stroke="#CC6600" strokeWidth="1.2"/>
            {/* Top of body peeking */}
            <ellipse cx="70" cy="85" rx="32" ry="18" fill={DARK}/>
            <ellipse cx="70" cy="87" rx="18" ry="11" fill={CREAM}/>
          </g>
          <style>{`
            .asel-peek-glance { transform-origin: 70px 55px; animation: aselGlance 4.5s ease-in-out infinite; }
            @keyframes aselGlance { 0%,100%{transform:rotate(0deg);} 25%{transform:rotate(-9deg);} 60%{transform:rotate(7deg);} }
            @keyframes aselPopPeek { 0%{opacity:0;transform:translateY(10px);} 100%{opacity:1;transform:translateY(0);} }
          `}</style>
        </svg>
      </div>
    );
  }

  return (
    <div style={{ width: size, height: size * 1.25, pointerEvents: "none", ...style }}>
      <svg viewBox="0 0 140 175" width={size} height={size * 1.25}
        className="asel-pose-bob"
        style={{ transform: `${flip ? "scaleX(-1) " : ""}${pose === "lean" ? "rotate(-6deg)" : ""}`, transformOrigin: "70px 140px" }}>

        {/* Feet */}
        <ellipse cx="58" cy="162" rx="14" ry="6" fill={ORANGE}/>
        <ellipse cx="82" cy="162" rx="14" ry="6" fill={ORANGE}/>

        {/* Body */}
        <ellipse cx="70" cy="114" rx="32" ry="44" fill={DARK}/>
        {/* Belly */}
        <ellipse cx="70" cy="118" rx="19" ry="30" fill={CREAM}/>

        {/* Left wing (static) */}
        <path d="M40 90 C26 98 22 120 28 136 C32 144 40 140 42 132 C44 120 44 106 40 90"
          fill={DARK}/>

        {/* Accessory held in left wing */}
        {acc && accessory !== "premium" && accessory !== "beach" && acc}
        {/* Beach: umbrella in wing + sunglasses drawn over face */}
        {accessory === "beach" && acc}

        {/* Right wing */}
        <RightWing pose={pose}/>

        {/* Head */}
        <ellipse cx="70" cy="48" rx="26" ry="24" fill={DARK}/>
        {/* Face patch */}
        <ellipse cx="70" cy="53" rx="17" ry="18" fill={CREAM}/>
        {/* Eyes */}
        <circle cx="62" cy="44" r="5.5" fill="white"/>
        <circle cx="63.5" cy="44" r="3" fill={DARK}/>
        <circle cx="64.5" cy="43" r="1.2" fill="white"/>
        <circle cx="78" cy="44" r="5.5" fill="white"/>
        <circle cx="79.5" cy="44" r="3" fill={DARK}/>
        <circle cx="80.5" cy="43" r="1.2" fill="white"/>
        {/* Beak */}
        <ellipse cx="70" cy="57" rx="7" ry="5" fill={ORANGE}/>
        <line x1="63" y1="57" x2="77" y2="57" stroke="#CC6600" strokeWidth="1.2"/>

        {/* Premium bowtie on neck */}
        {accessory === "premium" && acc}

        {/* Beach sunglasses over face */}
        {accessory === "beach" && (
          <>
            <rect x="57" y="42" width="11" height="7" rx="3.5" fill={DARK} opacity="0.85"/>
            <rect x="72" y="42" width="11" height="7" rx="3.5" fill={DARK} opacity="0.85"/>
            <line x1="68" y1="45.5" x2="72" y2="45.5" stroke={DARK} strokeWidth="1.5"/>
          </>
        )}

        {/* Shadow under feet */}
        <ellipse cx="70" cy="170" rx="28" ry="6" fill="rgba(0,0,0,0.1)"/>
      </svg>

      <style>{`
        .asel-pose-bob {
          animation: aselPop 0.45s cubic-bezier(.34,1.56,.64,1) both,
                     aselPoseBob 3s ease-in-out 0.45s infinite;
        }
        @keyframes aselPop {
          0%  { opacity:0; transform: scale(0.55) translateY(10px) ${pose === "lean" ? "rotate(-6deg)" : ""}; }
          70% { opacity:1; transform: scale(1.08) translateY(-2px) ${pose === "lean" ? "rotate(-6deg)" : ""}; }
          100%{ opacity:1; transform: scale(1) translateY(0) ${pose === "lean" ? "rotate(-6deg)" : ""}; }
        }
        @keyframes aselPoseBob {
          0%,100% { transform: translateY(0) ${pose === "lean" ? "rotate(-6deg)" : ""}; }
          50%     { transform: translateY(-6px) ${pose === "lean" ? "rotate(-6deg)" : ""}; }
        }
        .asel-wave-arm {
          transform-origin: 96px 92px;
          animation: aselWave 4.2s ease-in-out infinite;
        }
        @keyframes aselWave {
          0%,70%,100% { transform: rotate(0deg); }
          78%  { transform: rotate(-10deg); }
          86%  { transform: rotate(7deg); }
          94%  { transform: rotate(-5deg); }
        }
      `}</style>
    </div>
  );
}
