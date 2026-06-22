// Asel — blue furry mascot, all poses

const B1 = "#1D4ED8"; // deep blue (shadows, outline)
const B2 = "#2563EB"; // main body blue
const B3 = "#3B82F6"; // mid highlight blue
const B4 = "#60A5FA"; // light highlight blue
const YEL = "#F5C400"; // t-shirt yellow
const YEL2 = "#E5B800"; // shirt shadow
const GOLD = "#D4AF37"; // compass gold
const GOLD2 = "#F0D060"; // compass highlight
const AMB = "#D97706"; // amber eyes
const AMB2 = "#FBBF24"; // eye highlight
const WHT = "#FFFFFF";
const NVY = "#1E3A8A"; // dark navy (nose, shirt text)

function AselSVG({ pose, size, flip }) {
  const isLean = pose === "lean";
  const isPoint = pose === "point";

  // Right arm path changes per pose
  let rightArm, rightHand, cardGroup;
  if (pose === "greet") {
    rightArm = "M 125 148 C 138 132 148 112 140 82 C 136 68 126 58 116 60";
    rightHand = { cx: 112, cy: 57 };
    cardGroup = true;
  } else if (isPoint) {
    rightArm = "M 125 148 C 140 138 152 122 156 104 C 158 92 154 80 148 76";
    rightHand = { cx: 146, cy: 73 };
  } else { // lean
    rightArm = "M 125 148 C 134 155 138 168 134 180";
    rightHand = { cx: 133, cy: 183 };
  }

  return (
    <svg viewBox="0 0 200 300" width={size} height={size * 1.5}
      className="asel-pose-bob"
      style={{
        transform: `${flip ? "scaleX(-1) " : ""}${isLean ? "rotate(-5deg)" : ""}`,
        transformOrigin: "100px 240px",
        filter: "drop-shadow(0 10px 18px rgba(29,78,216,0.28))",
      }}>
      <defs>
        <radialGradient id="apBodyGrad" cx="45%" cy="40%">
          <stop offset="0%" stopColor={B4}/>
          <stop offset="50%" stopColor={B3}/>
          <stop offset="100%" stopColor={B1}/>
        </radialGradient>
        <radialGradient id="apHeadGrad" cx="40%" cy="35%">
          <stop offset="0%" stopColor={B4}/>
          <stop offset="55%" stopColor={B3}/>
          <stop offset="100%" stopColor={B1}/>
        </radialGradient>
        <radialGradient id="apFaceGrad" cx="50%" cy="45%">
          <stop offset="0%" stopColor={B4}/>
          <stop offset="100%" stopColor={B3}/>
        </radialGradient>
        <radialGradient id="apEyeL" cx="35%" cy="35%">
          <stop offset="0%" stopColor={AMB2}/>
          <stop offset="100%" stopColor={AMB}/>
        </radialGradient>
        <radialGradient id="apEyeR" cx="35%" cy="35%">
          <stop offset="0%" stopColor={AMB2}/>
          <stop offset="100%" stopColor={AMB}/>
        </radialGradient>
        <radialGradient id="apShirt" cx="40%" cy="30%">
          <stop offset="0%" stopColor="#FFD700"/>
          <stop offset="60%" stopColor={YEL}/>
          <stop offset="100%" stopColor={YEL2}/>
        </radialGradient>
        <radialGradient id="apShoe" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#F8FAFF"/>
          <stop offset="100%" stopColor="#D0D8EF"/>
        </radialGradient>
      </defs>

      {/* ─── LEGS ─── */}
      {/* Left leg */}
      <ellipse cx="76" cy="248" rx="18" ry="28" fill="url(#apBodyGrad)"/>
      {/* Right leg */}
      <ellipse cx="124" cy="248" rx="18" ry="28" fill="url(#apBodyGrad)"/>

      {/* Fur tufts on ankles */}
      <ellipse cx="76" cy="264" rx="20" ry="8" fill={B2}/>
      <ellipse cx="124" cy="264" rx="20" ry="8" fill={B2}/>

      {/* ─── SNEAKERS ─── */}
      {/* Left shoe */}
      <rect x="52" y="270" width="48" height="22" rx="10" fill="url(#apShoe)" stroke={B1} strokeWidth="1.5"/>
      <rect x="52" y="270" width="48" height="8" rx="5" fill={B2} opacity="0.25"/>
      {/* Shoe stripe */}
      <rect x="58" y="276" width="32" height="5" rx="2.5" fill={B2} opacity="0.4"/>
      {/* "A" badge */}
      <circle cx="68" cy="284" r="7" fill={WHT} stroke={B1} strokeWidth="1.2"/>
      <text x="68" y="288" textAnchor="middle" fontFamily="'Plus Jakarta Sans', Arial, sans-serif" fontWeight="900" fontSize="8" fill={B1}>A</text>
      {/* Laces */}
      <line x1="62" y1="273" x2="88" y2="273" stroke={B1} strokeWidth="1" strokeDasharray="4 3" opacity="0.6"/>

      {/* Right shoe */}
      <rect x="100" y="270" width="48" height="22" rx="10" fill="url(#apShoe)" stroke={B1} strokeWidth="1.5"/>
      <rect x="100" y="270" width="48" height="8" rx="5" fill={B2} opacity="0.25"/>
      <rect x="110" y="276" width="32" height="5" rx="2.5" fill={B2} opacity="0.4"/>
      <circle cx="132" cy="284" r="7" fill={WHT} stroke={B1} strokeWidth="1.2"/>
      <text x="132" y="288" textAnchor="middle" fontFamily="'Plus Jakarta Sans', Arial, sans-serif" fontWeight="900" fontSize="8" fill={B1}>A</text>
      <line x1="110" y1="273" x2="136" y2="273" stroke={B1} strokeWidth="1" strokeDasharray="4 3" opacity="0.6"/>
      {/* Gold shoe trim */}
      <line x1="52" y1="278" x2="100" y2="278" stroke={GOLD} strokeWidth="1.5" opacity="0.6"/>
      <line x1="100" y1="278" x2="148" y2="278" stroke={GOLD} strokeWidth="1.5" opacity="0.6"/>

      {/* ─── BODY ─── */}
      <ellipse cx="100" cy="190" rx="52" ry="62" fill="url(#apBodyGrad)"/>

      {/* ─── LEFT ARM (on hip) ─── */}
      <path d="M 72 155 C 54 162 46 178 50 200 C 52 212 60 216 68 210 C 72 204 74 192 72 178 Z"
        fill="url(#apBodyGrad)" stroke={B1} strokeWidth="0.5"/>
      {/* Left hand */}
      <ellipse cx="52" cy="204" rx="13" ry="10" fill={B3} transform="rotate(-20 52 204)"/>
      {/* knuckle lines */}
      <path d="M46 200 Q52 196 58 200" stroke={B1} strokeWidth="1" fill="none" opacity="0.5"/>

      {/* ─── RIGHT ARM ─── */}
      <path d={rightArm} stroke="url(#apBodyGrad)" strokeWidth="26" strokeLinecap="round" fill="none"/>
      <path d={rightArm} stroke={B1} strokeWidth="27" strokeLinecap="round" fill="none" opacity="0.12"/>
      {/* Right hand */}
      <ellipse cx={rightHand.cx} cy={rightHand.cy} rx="13" ry="11"
        fill={B3} transform={`rotate(-30 ${rightHand.cx} ${rightHand.cy})`}/>
      <path d={`M${rightHand.cx-6} ${rightHand.cy-5} Q${rightHand.cx} ${rightHand.cy-10} ${rightHand.cx+6} ${rightHand.cy-5}`}
        stroke={B1} strokeWidth="1" fill="none" opacity="0.5"/>

      {/* ─── ACE CARD (greet pose) ─── */}
      {cardGroup && (
        <g transform="rotate(-18 84 72)">
          <rect x="64" y="36" width="42" height="56" rx="5" fill={WHT} stroke={GOLD} strokeWidth="2"/>
          <rect x="66" y="38" width="38" height="52" rx="4" fill={WHT}/>
          {/* Corner A */}
          <text x="70" y="51" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="11" fill={NVY}>A</text>
          <text x="70" y="62" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="9" fill={NVY}>♠</text>
          {/* Center big A */}
          <text x="85" y="76" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="26" fill={NVY}>A</text>
          {/* Center spade */}
          <text x="85" y="90" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="10" fill={NVY}>♠</text>
          {/* Bottom corner rotated */}
          <text x="100" y="87" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="11" fill={NVY}
            transform="rotate(180 100 87)">A</text>
        </g>
      )}

      {/* ─── T-SHIRT ─── */}
      <path d="M 56 148 C 48 154 46 172 46 194 C 46 210 50 222 56 228 C 64 234 80 236 100 236 C 120 236 136 234 144 228 C 150 222 154 210 154 194 C 154 172 152 154 144 148 C 136 144 122 142 100 142 C 78 142 64 144 56 148 Z"
        fill="url(#apShirt)"/>
      {/* Shirt shadow at bottom */}
      <path d="M 56 220 C 64 228 80 232 100 232 C 120 232 136 228 144 220 C 144 222 144 224 144 226 C 136 232 120 235 100 235 C 80 235 64 232 56 226 Z"
        fill={YEL2} opacity="0.5"/>
      {/* Collar */}
      <path d="M 82 142 Q 100 136 118 142" stroke={YEL2} strokeWidth="2.5" fill="none"/>

      {/* Shirt text */}
      <text x="100" y="175" textAnchor="middle" fontFamily="'Plus Jakarta Sans', Arial, sans-serif"
        fontWeight="900" fontSize="18" fill={NVY} letterSpacing="2">—ASEL—</text>
      <text x="100" y="192" textAnchor="middle" fontFamily="'Plus Jakarta Sans', Arial, sans-serif"
        fontWeight="700" fontSize="6.5" fill={NVY} letterSpacing="0.5">VERGLEICHEN. VERSTEHEN.</text>
      <text x="100" y="201" textAnchor="middle" fontFamily="'Plus Jakarta Sans', Arial, sans-serif"
        fontWeight="700" fontSize="6.5" fill={NVY} letterSpacing="0.5">BESTE WAHL TREFFEN.</text>

      {/* ─── NECK FUR ─── */}
      <ellipse cx="100" cy="138" rx="26" ry="12" fill={B3}/>

      {/* ─── HEAD ─── */}
      {/* Fur spikes around head */}
      <ellipse cx="100" cy="88" rx="52" ry="54" fill={B2}/>
      {/* Fur spike shapes */}
      <path d="M 60 52 C 56 38 66 28 72 36 C 68 42 64 46 60 52Z" fill={B3}/>
      <path d="M 75 40 C 76 24 88 20 90 32 C 86 34 80 36 75 40Z" fill={B3}/>
      <path d="M 92 34 C 96 18 108 20 108 32 C 104 34 98 34 92 34Z" fill={B3}/>
      <path d="M 108 38 C 114 24 124 28 120 40 C 116 40 112 38 108 38Z" fill={B3}/>
      <path d="M 122 50 C 130 38 140 44 134 56 C 130 54 126 52 122 50Z" fill={B3}/>
      <path d="M 132 68 C 142 60 148 70 140 78 C 136 74 134 70 132 68Z" fill={B3}/>
      <path d="M 52 68 C 42 62 40 74 48 80 C 50 76 52 72 52 68Z" fill={B3}/>

      {/* Main head circle clean */}
      <ellipse cx="100" cy="90" rx="44" ry="46" fill="url(#apHeadGrad)"/>

      {/* Face lighter area */}
      <ellipse cx="100" cy="98" rx="30" ry="34" fill="url(#apFaceGrad)" opacity="0.6"/>

      {/* ─── EYEBROWS (confident/smirky) ─── */}
      <path d="M 72 72 C 76 66 86 65 90 68" stroke={B1} strokeWidth="4" strokeLinecap="round" fill="none"/>
      <path d="M 110 68 C 114 65 122 66 128 72" stroke={B1} strokeWidth="4" strokeLinecap="round" fill="none"/>
      {/* Brow shadow/fur */}
      <path d="M 70 74 C 76 68 88 66 92 70" stroke={B1} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4"/>
      <path d="M 108 70 C 112 66 122 68 130 74" stroke={B1} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4"/>

      {/* ─── EYES ─── */}
      {/* Eye whites/outer */}
      <ellipse cx="83" cy="84" rx="14" ry="13" fill={WHT} stroke={B1} strokeWidth="1"/>
      <ellipse cx="118" cy="84" rx="14" ry="13" fill={WHT} stroke={B1} strokeWidth="1"/>
      {/* Iris */}
      <circle cx="85" cy="85" r="10" fill="url(#apEyeL)"/>
      <circle cx="116" cy="85" r="10" fill="url(#apEyeR)"/>
      {/* Pupil */}
      <circle cx="86" cy="86" r="6" fill={B1}/>
      <circle cx="115" cy="86" r="6" fill={B1}/>
      {/* Eye shine */}
      <circle cx="89" cy="83" r="2.5" fill={WHT} opacity="0.9"/>
      <circle cx="118" cy="83" r="2.5" fill={WHT} opacity="0.9"/>
      <circle cx="88" cy="87" r="1" fill={WHT} opacity="0.5"/>

      {/* ─── NOSE ─── */}
      <ellipse cx="100" cy="103" rx="8" ry="6" fill={NVY}/>
      <ellipse cx="98" cy="101" rx="3" ry="2" fill={B3} opacity="0.4"/>

      {/* ─── MOUTH (smirk/smile) ─── */}
      <path d="M 85 114 Q 100 128 116 114" stroke={B1} strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M 85 114 Q 100 130 116 114" stroke={B4} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
      {/* Chin fur suggestion */}
      <path d="M 83 120 Q 100 132 118 120" stroke={B3} strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.3"/>

      {/* ─── COMPASS ANTENNA ─── */}
      {/* Thin antenna stem */}
      <line x1="104" y1="44" x2="110" y2="8" stroke={B1} strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="104" y1="44" x2="110" y2="8" stroke={B3} strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
      {/* Base gem */}
      <circle cx="104" cy="44" r="4" fill={B4} stroke={GOLD} strokeWidth="1.5"/>
      {/* Compass rose */}
      <g transform="translate(110, 8)">
        {/* Outer points */}
        <path d="M0 -14 L3 -4 L0 -2 L-3 -4 Z" fill={GOLD2}/>
        <path d="M0 14 L3 4 L0 2 L-3 4 Z" fill={GOLD2}/>
        <path d="M-14 0 L-4 -3 L-2 0 L-4 3 Z" fill={GOLD2}/>
        <path d="M14 0 L4 -3 L2 0 L4 3 Z" fill={GOLD2}/>
        {/* Diagonal points */}
        <path d="M-9 -9 L-2 -3 L-4 0 L-7 -3 Z" fill={GOLD} opacity="0.85"/>
        <path d="M9 -9 L2 -3 L4 0 L7 -3 Z" fill={GOLD} opacity="0.85"/>
        <path d="M-9 9 L-2 3 L-4 0 L-7 3 Z" fill={GOLD} opacity="0.85"/>
        <path d="M9 9 L2 3 L4 0 L7 3 Z" fill={GOLD} opacity="0.85"/>
        {/* Center gem */}
        <circle cx="0" cy="0" r="4.5" fill={GOLD} stroke={GOLD2} strokeWidth="1"/>
        <circle cx="0" cy="0" r="2.5" fill="#5DADE2"/>
        <circle cx="-1" cy="-1" r="1" fill={WHT} opacity="0.8"/>
      </g>

      {/* Shadow at feet */}
      <ellipse cx="100" cy="295" rx="42" ry="7" fill="rgba(29,78,216,0.15)"/>
    </svg>
  );
}

export default function AselPose({ pose = "greet", accessory = "none", size = 140, flip = false, style = {} }) {
  const isPeek = pose === "peek";

  if (isPeek) {
    return (
      <div style={{ width: size, height: size * 0.65, overflow: "hidden", pointerEvents: "none",
        animation: "aselPopPeek 0.45s cubic-bezier(.34,1.56,.64,1) both", ...style }}>
        <svg viewBox="0 0 200 130" width={size} height={size * 0.65}
          style={{ transform: flip ? "scaleX(-1)" : "none",
            filter: "drop-shadow(0 8px 14px rgba(29,78,216,0.25))" }}>
          <defs>
            <radialGradient id="apHeadGradP" cx="40%" cy="35%">
              <stop offset="0%" stopColor="#60A5FA"/>
              <stop offset="55%" stopColor="#3B82F6"/>
              <stop offset="100%" stopColor="#1D4ED8"/>
            </radialGradient>
          </defs>
          <g className="asel-peek-glance">
            {/* Fur spikes */}
            <path d="M 60 52 C 56 38 66 28 72 36 C 68 42 64 46 60 52Z" fill="#3B82F6"/>
            <path d="M 75 40 C 76 24 88 20 90 32 C 86 34 80 36 75 40Z" fill="#3B82F6"/>
            <path d="M 92 34 C 96 18 108 20 108 32 C 104 34 98 34 92 34Z" fill="#3B82F6"/>
            <path d="M 108 38 C 114 24 124 28 120 40 C 116 40 112 38 108 38Z" fill="#3B82F6"/>
            <path d="M 122 50 C 130 38 140 44 134 56 C 130 54 126 52 122 50Z" fill="#3B82F6"/>
            {/* Head */}
            <ellipse cx="100" cy="90" rx="44" ry="46" fill="url(#apHeadGradP)"/>
            <ellipse cx="100" cy="98" rx="30" ry="34" fill="#60A5FA" opacity="0.5"/>
            {/* Eyebrows */}
            <path d="M 72 72 C 76 66 86 65 90 68" stroke="#1E3A8A" strokeWidth="4" strokeLinecap="round" fill="none"/>
            <path d="M 110 68 C 114 65 122 66 128 72" stroke="#1E3A8A" strokeWidth="4" strokeLinecap="round" fill="none"/>
            {/* Eyes */}
            <ellipse cx="83" cy="84" rx="13" ry="12" fill="white" stroke="#1D4ED8" strokeWidth="1"/>
            <ellipse cx="118" cy="84" rx="13" ry="12" fill="white" stroke="#1D4ED8" strokeWidth="1"/>
            <circle cx="85" cy="85" r="9" fill="#D97706"/>
            <circle cx="116" cy="85" r="9" fill="#D97706"/>
            <circle cx="86" cy="86" r="5.5" fill="#1E3A8A"/>
            <circle cx="115" cy="86" r="5.5" fill="#1E3A8A"/>
            <circle cx="89" cy="83" r="2" fill="white" opacity="0.9"/>
            <circle cx="118" cy="83" r="2" fill="white" opacity="0.9"/>
            {/* Nose */}
            <ellipse cx="100" cy="103" rx="7" ry="5.5" fill="#1E3A8A"/>
            {/* Mouth */}
            <path d="M 86 114 Q 100 126 114 114" stroke="#1E3A8A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            {/* Antenna */}
            <line x1="104" y1="44" x2="110" y2="8" stroke="#1D4ED8" strokeWidth="2.5" strokeLinecap="round"/>
            <g transform="translate(110, 8)">
              <path d="M0 -12 L2.5 -3 L0 -1.5 L-2.5 -3 Z" fill="#F0D060"/>
              <path d="M0 12 L2.5 3 L0 1.5 L-2.5 3 Z" fill="#F0D060"/>
              <path d="M-12 0 L-3 -2.5 L-1.5 0 L-3 2.5 Z" fill="#F0D060"/>
              <path d="M12 0 L3 -2.5 L1.5 0 L3 2.5 Z" fill="#F0D060"/>
              <circle cx="0" cy="0" r="4" fill="#D4AF37" stroke="#F0D060" strokeWidth="1"/>
              <circle cx="0" cy="0" r="2" fill="#5DADE2"/>
            </g>
          </g>
          {/* Peeking over edge - body top visible */}
          <rect x="10" y="115" width="180" height="20" rx="8" fill="#2563EB"/>
          <rect x="40" y="115" width="120" height="16" rx="6" fill="#F5C400"/>
          <text x="100" y="128" textAnchor="middle" fontFamily="'Plus Jakarta Sans', Arial, sans-serif"
            fontWeight="900" fontSize="9" fill="#1E3A8A" letterSpacing="1">— ASEL —</text>
          <style>{`
            .asel-peek-glance { transform-origin: 100px 90px; animation: aselGlance 4.5s ease-in-out infinite; }
            @keyframes aselGlance { 0%,100%{transform:rotate(0deg);} 25%{transform:rotate(-8deg);} 60%{transform:rotate(6deg);} }
            @keyframes aselPopPeek { 0%{opacity:0;transform:translateY(12px);} 100%{opacity:1;transform:translateY(0);} }
          `}</style>
        </svg>
      </div>
    );
  }

  return (
    <div style={{ width: size, height: size * 1.5, pointerEvents: "none", ...style }}>
      <AselSVG pose={pose} size={size} flip={flip}/>
      <style>{`
        .asel-pose-bob {
          animation: aselPop 0.5s cubic-bezier(.34,1.56,.64,1) both,
                     aselPoseBob 3.2s ease-in-out 0.5s infinite;
        }
        @keyframes aselPop {
          0%  { opacity:0; transform: scale(0.5) translateY(14px); }
          65% { opacity:1; transform: scale(1.06) translateY(-3px); }
          100%{ opacity:1; transform: scale(1) translateY(0); }
        }
        @keyframes aselPoseBob {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-7px); }
        }
      `}</style>
    </div>
  );
}
