import { useState, useEffect, useRef } from "react";

const C = {
  bg: "#07070F", surface: "#0F0F1A", card: "#13131F", border: "#1E1E35",
  accent: "#7C6AF7", accentGlow: "#7C6AF722", gold: "#F0B429", goldGlow: "#F0B42915",
  text: "#F0EFF8", muted: "#6B6A85", success: "#34D399", danger: "#F87171",
};

function amz(k) { return `/go?url=${encodeURIComponent(`https://www.amazon.com/s?k=${encodeURIComponent(k)}`)}` }
function bkg(ss) { return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(ss)}&aid=decisionpilot` }

const CATEGORIES = [
  { id: "vacation", label: "Vacation", emoji: "🏖️", desc: "Hotels & destinations" },
  { id: "phone", label: "Smartphone", emoji: "📱", desc: "Find your perfect phone" },
  { id: "laptop", label: "Laptop", emoji: "💻", desc: "Work, gaming, study" },
  { id: "tv", label: "TV", emoji: "📺", desc: "Picture perfect viewing" },
  { id: "car", label: "Car", emoji: "🚗", desc: "Electric, sport, family" },
  { id: "fitness", label: "Fitness", emoji: "🏋️", desc: "Gym & wellness gear" },
  { id: "pet", label: "Pet", emoji: "🐕", desc: "Find your companion" },
  { id: "dining", label: "Dining Out", emoji: "🍽️", desc: "Restaurants & delivery" },
  { id: "career", label: "Career", emoji: "💼", desc: "Jobs & skills" },
];

const TREE = {
  id: "root", question: "What do you want to decide?", emoji: "🧭",
  options: [
    {
      label: "🏖️ Vacation", id: "vacation", question: "What's your travel style?", emoji: "✈️",
      options: [
        {
          label: "🌊 Beach & Relax", id: "beach", question: "What's your budget per person?", emoji: "💰",
          options: [
            { label: "Under $800", id: "beach_budget", result: { title: "Albania Riviera or Bulgaria", description: "Hidden gems with stunning beaches at a fraction of the cost.", picks: [
              { name: "Ksamil, Albania", tag: "Best Value", desc: "Crystal clear water, authentic food, almost zero crowds.", link: bkg("Ksamil") },
              { name: "Sunny Beach, Bulgaria", tag: "Party Scene", desc: "Lively atmosphere, affordable hotels, warm Black Sea water.", link: bkg("Sunny Beach Bulgaria") },
              { name: "Ulcinj, Montenegro", tag: "Underrated", desc: "Long sandy beach, warm Adriatic water, very affordable.", link: bkg("Ulcinj") },
            ]}},
            { label: "$800 – $1,500", id: "beach_mid", result: { title: "Crete or Mallorca", description: "Classic Mediterranean excellence at mid-range prices.", picks: [
              { name: "Crete, Greece", tag: "Best Overall", desc: "Diverse landscapes, incredible food, warm locals.", link: bkg("Crete") },
              { name: "Mallorca, Spain", tag: "Best Nightlife", desc: "Stunning coves, world-class clubs, easy transport.", link: bkg("Mallorca") },
              { name: "Algarve, Portugal", tag: "Hidden Gem", desc: "Dramatic cliffs, golden beaches, excellent seafood.", link: bkg("Algarve") },
            ]}},
            { label: "Over $1,500", id: "beach_luxury", result: { title: "Santorini, Maldives or Bali", description: "World-class luxury destinations.", picks: [
              { name: "Santorini, Greece", tag: "Most Iconic", desc: "Caldera sunsets, infinity pools, romantic atmosphere.", link: bkg("Santorini") },
              { name: "Maldives", tag: "Ultimate Luxury", desc: "Overwater bungalows, private beaches, world-class diving.", link: bkg("Maldives") },
              { name: "Bali, Indonesia", tag: "Best Value Luxury", desc: "Luxury at mid-range prices. Seminyak for nightlife, Ubud for culture.", link: bkg("Bali") },
            ]}},
          ],
        },
        {
          label: "🏛️ Culture & City", id: "culture", question: "Which region?", emoji: "🗺️",
          options: [
            { label: "🇪🇺 Europe", id: "europe_culture", result: { title: "Rome, Prague or Lisbon", description: "Europe's finest cultural cities.", picks: [
              { name: "Rome, Italy", tag: "Most Historic", desc: "Colosseum, Vatican, incredible food.", link: bkg("Rome") },
              { name: "Prague, Czech Republic", tag: "Best Value", desc: "Fairy-tale architecture, craft beer culture.", link: bkg("Prague") },
              { name: "Lisbon, Portugal", tag: "Most Underrated", desc: "Trams, Fado music, epic Atlantic views.", link: bkg("Lisbon") },
            ]}},
            { label: "🌏 Asia", id: "asia_culture", result: { title: "Tokyo, Kyoto or Bangkok", description: "Asia's most captivating destinations.", picks: [
              { name: "Tokyo, Japan", tag: "Most Unique", desc: "Futuristic and traditional at once.", link: bkg("Tokyo") },
              { name: "Kyoto, Japan", tag: "Most Traditional", desc: "Geishas, temples, bamboo forests.", link: bkg("Kyoto") },
              { name: "Bangkok, Thailand", tag: "Best Value", desc: "Street food, temples, rooftop bars.", link: bkg("Bangkok") },
            ]}},
            { label: "🌎 Americas", id: "americas_culture", result: { title: "New York, Buenos Aires or Mexico City", description: "The Americas' most vibrant destinations.", picks: [
              { name: "New York, USA", tag: "Most Iconic", desc: "Times Square, Central Park, world-class food.", link: bkg("New York") },
              { name: "Buenos Aires, Argentina", tag: "Most Passionate", desc: "Tango, steak, European architecture.", link: bkg("Buenos Aires") },
              { name: "Mexico City, Mexico", tag: "Best Value", desc: "Ancient ruins, world-class food scene.", link: bkg("Mexico City") },
            ]}},
          ],
        },
        { label: "🥾 Adventure", id: "adventure", result: { title: "New Zealand, Patagonia or Norway", description: "The world's ultimate adventure destinations.", picks: [
          { name: "New Zealand", tag: "Best All-Round", desc: "Bungee jumping, hiking, hobbit holes.", link: bkg("New Zealand") },
          { name: "Patagonia, Argentina", tag: "Most Dramatic", desc: "Torres del Paine, glaciers, end of the world.", link: bkg("Patagonia") },
          { name: "Norway", tag: "Best in Europe", desc: "Fjords, Northern Lights, midnight sun.", link: bkg("Norway") },
        ]}},
      ],
    },
    {
      label: "📱 Smartphone", id: "phone", question: "What matters most?", emoji: "📱",
      options: [
        { label: "📸 Best Camera", id: "phone_camera", result: { title: "Top Camera Phones 2026", description: "Photography champions.", picks: [
          { name: "iPhone 16 Pro Max", tag: "Best Overall", desc: "Cinematic mode, ProRes video, titanium build.", link: amz("iPhone 16 Pro Max") },
          { name: "Google Pixel 9 Pro", tag: "Best AI Camera", desc: "Google's AI makes every photo look professional.", link: amz("Google Pixel 9 Pro") },
          { name: "Samsung Galaxy S25 Ultra", tag: "Most Versatile", desc: "200MP sensor, 10x optical zoom, S Pen.", link: amz("Samsung Galaxy S25 Ultra") },
        ]}},
        { label: "🔋 Best Battery", id: "phone_battery", result: { title: "All-Day Battery Champions", description: "Never worry about charging.", picks: [
          { name: "OnePlus 13", tag: "Fastest Charging", desc: "100W charging, full charge in 25 minutes.", link: amz("OnePlus 13") },
          { name: "Samsung Galaxy S25+", tag: "Best Balance", desc: "All-day battery with premium features.", link: amz("Samsung Galaxy S25 Plus") },
          { name: "iPhone 16 Plus", tag: "Best iOS Battery", desc: "2 days of normal use.", link: amz("iPhone 16 Plus") },
        ]}},
        { label: "💰 Best Value", id: "phone_value", result: { title: "Premium Features, Smart Price", description: "Flagship feel without flagship price.", picks: [
          { name: "Google Pixel 8a", tag: "Best Under $500", desc: "Flagship AI features, pure Android, excellent camera.", link: amz("Google Pixel 8a") },
          { name: "Samsung Galaxy A55", tag: "Best Mid-Range", desc: "Beautiful display, solid camera, 5G.", link: amz("Samsung Galaxy A55") },
          { name: "Nothing Phone 3a", tag: "Most Unique", desc: "Glyph interface, clean design, excellent specs.", link: amz("Nothing Phone 3a") },
        ]}},
      ],
    },
    {
      label: "💻 Laptop", id: "laptop", question: "What will you use it for?", emoji: "💻",
      options: [
        { label: "🎮 Gaming", id: "laptop_gaming", result: { title: "Best Gaming Laptops 2026", description: "Maximum performance for serious gamers.", picks: [
          { name: "ASUS ROG Zephyrus G16", tag: "Best Overall", desc: "RTX 4080, 240Hz display, stunning design.", link: amz("ASUS ROG Zephyrus G16") },
          { name: "Razer Blade 16", tag: "Most Premium", desc: "Unmatched build quality, RTX 4090 option, OLED display.", link: amz("Razer Blade 16") },
          { name: "Lenovo Legion Pro 5", tag: "Best Value", desc: "RTX 4070, excellent thermals, great price-to-performance.", link: amz("Lenovo Legion Pro 5") },
        ]}},
        { label: "💼 Business", id: "laptop_business", result: { title: "Best Business Laptops 2026", description: "Productivity, portability, reliability.", picks: [
          { name: "Apple MacBook Pro 14\"", tag: "Best Overall", desc: "M4 chip, incredible battery, best-in-class display.", link: amz("MacBook Pro 14 M4") },
          { name: "ThinkPad X1 Carbon", tag: "Most Reliable", desc: "Military-grade durability, legendary keyboard.", link: amz("ThinkPad X1 Carbon") },
          { name: "Dell XPS 13", tag: "Most Portable", desc: "Ultralight, beautiful OLED display, powerful Intel.", link: amz("Dell XPS 13") },
        ]}},
        { label: "🎓 Student", id: "laptop_student", result: { title: "Best Student Laptops 2026", description: "Performance and value for studying.", picks: [
          { name: "Apple MacBook Air M3", tag: "Best Overall", desc: "Fanless, all-day battery, perfect for any student.", link: amz("MacBook Air M3") },
          { name: "Acer Swift 14 AI", tag: "Best Windows", desc: "Intel Core Ultra, OLED display, lightweight.", link: amz("Acer Swift 14 AI") },
          { name: "Chromebook Plus", tag: "Most Affordable", desc: "Perfect for Google Docs, great battery, fast.", link: amz("Chromebook Plus") },
        ]}},
      ],
    },
    {
      label: "📺 TV", id: "tv", question: "What's your priority?", emoji: "📺",
      options: [
        { label: "🎬 Best Picture", id: "tv_picture", result: { title: "Best Picture Quality TVs 2026", description: "For those who refuse to compromise.", picks: [
          { name: "LG G5 OLED", tag: "Best Overall", desc: "Infinite contrast, perfect blacks, Dolby Vision.", link: amz("LG G5 OLED TV") },
          { name: "Samsung QN90D Neo QLED", tag: "Brightest", desc: "Mini-LED brilliance, perfect for bright rooms.", link: amz("Samsung QN90D Neo QLED") },
          { name: "Sony Bravia 9", tag: "Best Processing", desc: "Sony's AI processor makes everything look cinematic.", link: amz("Sony Bravia 9") },
        ]}},
        { label: "💰 Best Value", id: "tv_value", result: { title: "Best Value TVs 2026", description: "Great picture without breaking the bank.", picks: [
          { name: "Hisense U8N", tag: "Best Bang for Buck", desc: "Mini-LED, 144Hz, Dolby Vision. Competes with TVs twice the price.", link: amz("Hisense U8N TV") },
          { name: "TCL QM8", tag: "Best Budget QLED", desc: "Quantum dots, excellent brightness, Google TV.", link: amz("TCL QM8 TV") },
          { name: "Amazon Fire TV Omni", tag: "Most Affordable", desc: "Alexa built-in, decent picture, unbeatable price.", link: amz("Amazon Fire TV Omni") },
        ]}},
        { label: "🎮 Gaming TV", id: "tv_gaming", result: { title: "Best Gaming TVs 2026", description: "Low latency, high refresh rate.", picks: [
          { name: "LG C4 OLED 42\"", tag: "Best Gaming OLED", desc: "0.1ms response, 4x HDMI 2.1, 120Hz.", link: amz("LG C4 OLED 42 inch") },
          { name: "Samsung S90D OLED", tag: "Best for Sports", desc: "Anti-glare OLED, 144Hz, stunning in any lighting.", link: amz("Samsung S90D OLED") },
          { name: "Hisense U7N", tag: "Best Value Gaming", desc: "144Hz, HDMI 2.1, mini-LED at competitive price.", link: amz("Hisense U7N TV") },
        ]}},
      ],
    },
    {
      label: "🚗 Car", id: "car", question: "What type of car?", emoji: "🚗",
      options: [
        { label: "⚡ Electric", id: "car_electric", result: { title: "Best Electric Cars 2026", description: "The EV market has matured.", picks: [
          { name: "Tesla Model 3", tag: "Best All-Round", desc: "500km range, supercharger network, autopilot.", link: "https://www.autoscout24.com/lst/tesla/model-3" },
          { name: "Volkswagen ID.4", tag: "Most Practical", desc: "SUV form factor, comfortable, VW reliability.", link: "https://www.autoscout24.com/lst/volkswagen/id.4" },
          { name: "Hyundai Ioniq 6", tag: "Best Range", desc: "800V ultra-fast charging, 600km+ range.", link: "https://www.autoscout24.com/lst/hyundai/ioniq-6" },
        ]}},
        { label: "🏎️ Performance", id: "car_performance", result: { title: "Performance Cars Worth Every Euro", description: "Driving pleasure above all else.", picks: [
          { name: "BMW M3 Competition", tag: "Best Driver's Car", desc: "503hp inline-6, perfect balance, daily usable.", link: "https://www.autoscout24.com/lst/bmw/m3" },
          { name: "Porsche 911", tag: "Most Iconic", desc: "Timeless, appreciates in value, usable every day.", link: "https://www.autoscout24.com/lst/porsche/911" },
          { name: "Toyota GR86", tag: "Best Value Fun", desc: "Pure driving joy, lightweight, affordable.", link: "https://www.autoscout24.com/lst/toyota/gr86" },
        ]}},
        { label: "👨‍👩‍👧 Family SUV", id: "car_family", result: { title: "Best Family SUVs 2026", description: "Space, safety, and comfort.", picks: [
          { name: "Skoda Kodiaq", tag: "Best Value", desc: "7 seats, huge boot, VW group reliability.", link: "https://www.autoscout24.com/lst/skoda/kodiaq" },
          { name: "Volvo XC60", tag: "Safest Choice", desc: "World-class safety, beautiful Scandinavian interior.", link: "https://www.autoscout24.com/lst/volvo/xc60" },
          { name: "Kia EV9", tag: "Future-Proof", desc: "7-seat electric SUV, 500km range.", link: "https://www.autoscout24.com/lst/kia/ev9" },
        ]}},
      ],
    },
    {
      label: "🏋️ Fitness", id: "fitness", question: "What's your fitness goal?", emoji: "🏋️",
      options: [
        { label: "💪 Build Muscle", id: "fitness_muscle", result: { title: "Best Home Gym Equipment", description: "Build serious muscle without leaving home.", picks: [
          { name: "Adjustable Dumbbell Set", tag: "Most Versatile", desc: "Replaces 15 pairs of dumbbells. Bowflex or PowerBlock.", link: amz("adjustable dumbbell set") },
          { name: "Power Rack + Barbell", tag: "Most Effective", desc: "Squat, bench, deadlift. The holy trinity of muscle building.", link: amz("power rack barbell set") },
          { name: "Resistance Band Set", tag: "Best Budget", desc: "Surprisingly effective, portable, joint-friendly.", link: amz("resistance band set heavy") },
        ]}},
        { label: "🏃 Cardio & Weight Loss", id: "fitness_cardio", result: { title: "Best Cardio Equipment 2026", description: "Burn calories efficiently at home.", picks: [
          { name: "Concept2 RowErg", tag: "Best Overall", desc: "Full body workout, low impact, used by Olympic athletes.", link: amz("Concept2 RowErg rowing machine") },
          { name: "NordicTrack Treadmill", tag: "Most Popular", desc: "iFit classes, incline training, foldable design.", link: amz("NordicTrack treadmill") },
          { name: "Assault AirBike", tag: "Most Intense", desc: "HIIT king. 20 minutes burns as much as an hour of jogging.", link: amz("Assault AirBike") },
        ]}},
        { label: "🧘 Flexibility & Wellness", id: "fitness_wellness", result: { title: "Best Wellness Equipment 2026", description: "Recovery, flexibility, mental health.", picks: [
          { name: "Manduka PRO Yoga Mat", tag: "Essential", desc: "The last yoga mat you'll ever buy. Worth every penny.", link: amz("Manduka PRO yoga mat") },
          { name: "Theragun Pro", tag: "Best Recovery", desc: "Percussive therapy for muscle recovery. Used by pro athletes.", link: amz("Theragun Pro massage gun") },
          { name: "Hypervolt 2 Pro", tag: "Best Value", desc: "Quieter than Theragun, equally effective, better price.", link: amz("Hypervolt 2 Pro massage gun") },
        ]}},
      ],
    },
    {
      label: "🐕 Pet", id: "pet", question: "Which pet suits you?", emoji: "🐾",
      options: [
        { label: "🐕 Dog", id: "pet_dog", question: "What's your lifestyle?", emoji: "🐕",
          options: [
            { label: "🏃 Active lifestyle", id: "dog_active", result: { title: "Best Dogs for Active People", description: "Dogs that match your energy.", picks: [
              { name: "Border Collie", tag: "Most Intelligent", desc: "Needs 2+ hours exercise daily. Thrives with tasks.", link: amz("Border Collie dog supplies") },
              { name: "Labrador Retriever", tag: "Most Popular", desc: "Friendly, energetic, great with families.", link: amz("Labrador dog supplies") },
              { name: "Vizsla", tag: "Best Companion", desc: "Velcro dog. Excellent runner and swimmer.", link: amz("Vizsla dog supplies") },
            ]}},
            { label: "🏠 Homebody", id: "dog_calm", result: { title: "Best Dogs for Relaxed Owners", description: "Dogs happy chilling at home.", picks: [
              { name: "Bulldog", tag: "Most Relaxed", desc: "Minimal exercise, loves sofa time, great apartment dog.", link: amz("Bulldog dog supplies") },
              { name: "Shih Tzu", tag: "Best Lap Dog", desc: "Affectionate, low exercise needs, hypoallergenic.", link: amz("Shih Tzu dog supplies") },
              { name: "Basset Hound", tag: "Most Chill", desc: "Easygoing, friendly, loves sleeping.", link: amz("Basset Hound dog supplies") },
            ]}},
          ],
        },
        { label: "🐱 Cat", id: "pet_cat", result: { title: "Best Cat Breeds 2026", description: "Find your perfect feline companion.", picks: [
          { name: "Maine Coon", tag: "Most Sociable", desc: "Dog-like personality, loves people, gentle giant.", link: amz("Maine Coon cat supplies") },
          { name: "Ragdoll", tag: "Most Relaxed", desc: "Goes limp when held, extremely gentle, perfect indoor cat.", link: amz("Ragdoll cat supplies") },
          { name: "British Shorthair", tag: "Most Independent", desc: "Calm, dignified, great for busy owners.", link: amz("British Shorthair cat supplies") },
        ]}},
        { label: "🐠 Fish / Other", id: "pet_other", result: { title: "Low Maintenance Pets", description: "Companionship without high commitment.", picks: [
          { name: "Betta Fish", tag: "Most Beautiful", desc: "Stunning colors, small tank needed, interactive.", link: amz("Betta fish tank aquarium") },
          { name: "Guinea Pig", tag: "Most Social", desc: "Gentle, social, great with children.", link: amz("guinea pig cage supplies") },
          { name: "Leopard Gecko", tag: "Most Unique", desc: "Low maintenance, long-lived, no smell.", link: amz("leopard gecko terrarium") },
        ]}},
      ],
    },
    {
      label: "🍽️ Dining Out", id: "dining", question: "What's the occasion?", emoji: "🍽️",
      options: [
        { label: "💑 Romantic Dinner", id: "dining_romantic", result: { title: "Perfect Romantic Restaurant", description: "Make it unforgettable.", picks: [
          { name: "OpenTable", tag: "Best Reservations", desc: "Filter by 'romantic', book 1 week ahead for weekends.", link: "https://www.opentable.com" },
          { name: "TripAdvisor", tag: "Best Reviews", desc: "Sort by 'romantic atmosphere', look for candles/dim lighting.", link: "https://www.tripadvisor.com" },
          { name: "TheFork", tag: "Best Deals", desc: "Often 50% off at great restaurants.", link: "https://www.thefork.com" },
        ]}},
        { label: "👨‍👩‍👧 Family Dinner", id: "dining_family", result: { title: "Perfect Family Restaurant", description: "Where everyone is happy.", picks: [
          { name: "Yelp", tag: "Best for Families", desc: "Filter 'good for kids', 'high chairs available'.", link: "https://www.yelp.com" },
          { name: "Google Maps", tag: "Most Convenient", desc: "Search 'family restaurant near me', check photos.", link: "https://maps.google.com" },
          { name: "TheFork", tag: "Best Booking", desc: "Easy group reservations, special menus for children.", link: "https://www.thefork.com" },
        ]}},
        { label: "🍕 Quick & Casual", id: "dining_casual", result: { title: "Best Food Delivery & Quick Dining", description: "Great food without the fuss.", picks: [
          { name: "Uber Eats", tag: "Most Options", desc: "Largest restaurant selection, real-time tracking.", link: "https://www.ubereats.com" },
          { name: "Deliveroo", tag: "Best Quality", desc: "Premium restaurant partners, excellent packaging.", link: "https://deliveroo.com" },
          { name: "Google Maps", tag: "Best Discovery", desc: "Search 'best pizza near me', sort by rating.", link: "https://maps.google.com" },
        ]}},
      ],
    },
    {
      label: "💼 Career Move", id: "career", question: "What's your situation?", emoji: "💼",
      options: [
        { label: "🚀 Switch Jobs", id: "career_switch", result: { title: "How to Navigate a Job Switch", description: "A structured approach.", picks: [
          { name: "Evaluate Total Compensation", tag: "Step 1", desc: "Salary + equity + benefits + remote flexibility.", link: "https://www.levels.fyi" },
          { name: "Research Company Culture", tag: "Step 2", desc: "Glassdoor, Blind, LinkedIn. Talk to people who work there.", link: "https://www.glassdoor.com" },
          { name: "Negotiate Before Signing", tag: "Step 3", desc: "Always negotiate. First offer is rarely the best.", link: "https://www.linkedin.com/jobs" },
        ]}},
        { label: "🌍 Relocate", id: "career_relocate", result: { title: "Best Cities for Career Growth 2026", description: "Location matters enormously.", picks: [
          { name: "Dubai, UAE", tag: "Tax Free", desc: "Zero income tax, international hub, growing tech scene.", link: "https://www.linkedin.com/jobs/search/?location=Dubai" },
          { name: "Berlin, Germany", tag: "Tech Hub", desc: "Strong startup ecosystem, good salaries, high quality of life.", link: "https://www.linkedin.com/jobs/search/?location=Berlin" },
          { name: "Lisbon, Portugal", tag: "Best Quality of Life", desc: "Tech visa, lower cost, sun, safety.", link: "https://www.linkedin.com/jobs/search/?location=Lisbon" },
        ]}},
        { label: "📚 Learn New Skills", id: "career_learn", result: { title: "Best Platforms to Learn New Skills", description: "Invest in yourself.", picks: [
          { name: "Coursera", tag: "Best Certificates", desc: "University-backed courses, Google/Meta/IBM certificates.", link: "https://www.coursera.org" },
          { name: "Udemy", tag: "Best Value", desc: "Lifetime access, frequent 90% sales, 200,000+ courses.", link: "https://www.udemy.com" },
          { name: "LinkedIn Learning", tag: "Best for Career", desc: "Skills show on your LinkedIn profile.", link: "https://www.linkedin.com/learning" },
        ]}},
      ],
    },
  ],
};

function findNode(tree, path) {
  let node = tree;
  for (const id of path) {
    if (!node.options) return null;
    node = node.options.find((o) => o.id === id);
    if (!node) return null;
  }
  return node;
}

function useTypewriter(text, speed = 30) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) { setDisplayed(text.slice(0, i + 1)); i++; }
      else clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text]);
  return displayed;
}

function Orb({ style }) {
  return <div style={{ position: "absolute", borderRadius: "50%", filter: "blur(100px)", pointerEvents: "none", zIndex: 0, ...style }} />;
}

function Badge({ children, color = C.accent }) {
  return <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase" }}>{children}</span>;
}

function GlowButton({ onClick, children, primary, style = {} }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: primary ? `linear-gradient(135deg, ${C.accent} 0%, #9B8BFF 100%)` : "transparent",
        color: primary ? "#fff" : C.text,
        border: primary ? "none" : `1px solid ${hovered ? C.accent : C.border}`,
        borderRadius: 14, padding: "16px 32px", fontSize: 16, fontWeight: 700,
        cursor: "pointer", transition: "all 0.2s",
        boxShadow: primary && hovered ? `0 12px 40px ${C.accent}55` : primary ? `0 8px 28px ${C.accent}33` : "none",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        background: primary ? `linear-gradient(135deg, ${C.accent}, #9B8BFF)` : hovered ? C.accentGlow : "transparent",
        ...style,
      }}>{children}</button>
  );
}

function CategoryGrid({ onSelect }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
      {CATEGORIES.map((cat) => (
        <button key={cat.id} onClick={() => onSelect(cat.id)}
          onMouseEnter={() => setHovered(cat.id)}
          onMouseLeave={() => setHovered(null)}
          style={{
            background: hovered === cat.id ? C.accentGlow : C.card,
            border: `1px solid ${hovered === cat.id ? C.accent + "66" : C.border}`,
            borderRadius: 16, padding: "20px 16px", cursor: "pointer",
            transition: "all 0.2s", transform: hovered === cat.id ? "translateY(-3px)" : "translateY(0)",
            boxShadow: hovered === cat.id ? `0 8px 24px ${C.accent}22` : "none",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          }}>
          <span style={{ fontSize: 32 }}>{cat.emoji}</span>
          <span style={{ color: C.text, fontWeight: 700, fontSize: 13 }}>{cat.label}</span>
          <span style={{ color: C.muted, fontSize: 11, textAlign: "center", lineHeight: 1.4 }}>{cat.desc}</span>
        </button>
      ))}
    </div>
  );
}

function ResultCard({ pick, index }) {
  const colors = [C.gold, C.accent, C.success];
  const c = colors[index % 3];
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? `linear-gradient(135deg, ${c}11, ${C.card})` : C.card,
        border: `1px solid ${hovered ? c + "55" : c + "33"}`,
        borderRadius: 18, padding: "22px 24px", marginBottom: 12,
        transition: "all 0.2s", transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered ? `0 12px 32px ${c}22` : `0 4px 16px ${c}11`,
      }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <span style={{ color: C.text, fontWeight: 800, fontSize: 17 }}>{pick.name}</span>
        <Badge color={c}>{pick.tag}</Badge>
      </div>
      <p style={{ color: C.muted, fontSize: 14, margin: "0 0 12px", lineHeight: 1.7 }}>{pick.desc}</p>
      <a href={pick.link} target="_blank" rel="noopener noreferrer"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, color: c, fontSize: 13, fontWeight: 700, textDecoration: "none", background: c + "15", padding: "6px 14px", borderRadius: 20, transition: "background 0.15s" }}>
        View deals <span style={{ fontSize: 16 }}>→</span>
      </a>
    </div>
  );
}

function Landing({ onStart }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const target = 12847;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => setCount(c => Math.min(c + step, target)), 16);
    return () => clearInterval(timer);
  }, []);

  const headline = useTypewriter("Stop hesitating.", 50);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, position: "relative", overflow: "hidden" }}>
      <Orb style={{ width: 700, height: 700, background: C.accent, opacity: 0.1, top: -300, left: -200 }} />
      <Orb style={{ width: 500, height: 500, background: C.gold, opacity: 0.06, top: 200, right: -150 }} />
      <Orb style={{ width: 400, height: 400, background: C.success, opacity: 0.05, bottom: -100, left: "30%" }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 960, margin: "0 auto", padding: "0 24px" }}>
        {/* Nav */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 0", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: `linear-gradient(135deg, ${C.accent}, ${C.gold})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: `0 4px 16px ${C.accent}44` }}>🧭</div>
            <span style={{ color: C.text, fontWeight: 900, fontSize: 19, letterSpacing: -0.5 }}>DecisionPilot</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ color: C.muted, fontSize: 13 }}>{count.toLocaleString()} decisions made</span>
            <Badge color={C.gold}>Free Beta</Badge>
          </div>
        </div>

        {/* Hero */}
        <div style={{ textAlign: "center", paddingTop: 100, paddingBottom: 70 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.accentGlow, border: `1px solid ${C.accent}44`, borderRadius: 24, padding: "7px 18px", marginBottom: 32, color: C.accent, fontSize: 13, fontWeight: 600 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.success, display: "inline-block", boxShadow: `0 0 8px ${C.success}` }} />
            AI-Powered Decision Making
          </div>

          <h1 style={{ color: C.text, fontSize: "clamp(40px, 7vw, 76px)", fontWeight: 900, lineHeight: 1.02, letterSpacing: -3, margin: "0 0 8px" }}>
            {headline || "Stop hesitating."}
          </h1>
          <h1 style={{ fontSize: "clamp(40px, 7vw, 76px)", fontWeight: 900, lineHeight: 1.02, letterSpacing: -3, margin: "0 0 32px", background: `linear-gradient(135deg, ${C.accent} 0%, ${C.gold} 60%, ${C.success} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Start deciding.
          </h1>

          <p style={{ color: C.muted, fontSize: 19, maxWidth: 540, margin: "0 auto 52px", lineHeight: 1.75 }}>
            Your AI co-pilot for every major decision. Vacations, gadgets, cars, careers — get personalized recommendations in seconds.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 80 }}>
            <GlowButton primary onClick={() => onStart("tree")}>🌳 Decision Tree</GlowButton>
            <GlowButton onClick={() => onStart("chat")}>🤖 Chat with AI</GlowButton>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", justifyContent: "center", gap: 48, marginBottom: 80, flexWrap: "wrap" }}>
            {[
              { value: "9+", label: "Categories" },
              { value: "100%", label: "Free to use" },
              { value: "AI", label: "Powered" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ color: C.text, fontSize: 32, fontWeight: 900, letterSpacing: -1 }}>{s.value}</div>
                <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div style={{ marginBottom: 80 }}>
          <h2 style={{ color: C.text, fontSize: 28, fontWeight: 800, textAlign: "center", marginBottom: 40, letterSpacing: -0.5 }}>How it works</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
            {[
              { step: "01", icon: "🎯", title: "Choose a category", desc: "Pick what you want to decide — vacation, phone, car, and more." },
              { step: "02", icon: "💬", title: "Answer questions", desc: "Navigate the tree or chat with AI about your needs and preferences." },
              { step: "03", icon: "✨", title: "Get your answer", desc: "Receive personalized recommendations with direct links to the best deals." },
            ].map((s, i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: "28px 24px" }}>
                <div style={{ color: C.accent, fontSize: 12, fontWeight: 800, letterSpacing: 2, marginBottom: 12 }}>{s.step}</div>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{s.icon}</div>
                <div style={{ color: C.text, fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{s.title}</div>
                <div style={{ color: C.muted, fontSize: 13, lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div style={{ marginBottom: 80 }}>
          <h2 style={{ color: C.text, fontSize: 28, fontWeight: 800, textAlign: "center", marginBottom: 12, letterSpacing: -0.5 }}>What can you decide?</h2>
          <p style={{ color: C.muted, textAlign: "center", marginBottom: 36, fontSize: 15 }}>Click any category to start immediately</p>
          <CategoryGrid onSelect={(id) => onStart("tree", id)} />
        </div>

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "32px 0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>🧭</span>
            <span style={{ color: C.muted, fontSize: 13 }}>DecisionPilot © 2026</span>
          </div>
          <span style={{ color: C.muted, fontSize: 12 }}>Free forever · No signup required · AI-powered</span>
        </div>
      </div>
    </div>
  );
}

function TreeScreen({ onBack, startId }) {
  const [path, setPath] = useState(startId ? [startId] : []);
  const [animKey, setAnimKey] = useState(0);
  const currentNode = findNode(TREE, path);
  function choose(optionId) { setPath(p => [...p, optionId]); setAnimKey(k => k + 1); }
  function back() { if (path.length === 0) { onBack(); return; } setPath(p => p.slice(0, -1)); setAnimKey(k => k + 1); }
  const hasResult = currentNode?.result;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, position: "relative", overflow: "hidden" }}>
      <Orb style={{ width: 600, height: 600, background: C.accent, opacity: 0.07, top: -200, right: -200 }} />
      <Orb style={{ width: 400, height: 400, background: C.gold, opacity: 0.05, bottom: 0, left: -100 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "24px 0", borderBottom: `1px solid ${C.border}`, marginBottom: 48 }}>
          <button onClick={back} style={{ background: C.card, border: `1px solid ${C.border}`, color: C.muted, borderRadius: 10, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.text; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}>
            ← Back
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>🧭</span>
            <span style={{ color: C.text, fontWeight: 800, fontSize: 15 }}>DecisionPilot</span>
          </div>
          {path.length > 0 && (
            <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
              {path.map((_, i) => <div key={i} style={{ width: i === path.length - 1 ? 20 : 8, height: 8, borderRadius: 4, background: i === path.length - 1 ? C.accent : C.border, transition: "all 0.3s" }} />)}
            </div>
          )}
        </div>

        <div key={animKey} style={{ animation: "fadeIn 0.3s ease", paddingBottom: 80 }}>
          {!hasResult ? (
            <>
              <div style={{ textAlign: "center", marginBottom: 40 }}>
                <div style={{ fontSize: 56, marginBottom: 16, filter: "drop-shadow(0 4px 16px rgba(124,106,247,0.3))" }}>{currentNode?.emoji || "🧭"}</div>
                <h2 style={{ color: C.text, fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 900, marginBottom: 10, letterSpacing: -1 }}>{currentNode?.question}</h2>
                <p style={{ color: C.muted, fontSize: 15 }}>Choose the option that fits you best</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {currentNode?.options?.map((opt, i) => (
                  <button key={opt.id} onClick={() => choose(opt.id)}
                    style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 24px", textAlign: "left", cursor: "pointer", color: C.text, fontSize: 16, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.2s", animation: `slideIn 0.3s ease ${i * 0.05}s both` }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.background = C.accentGlow; e.currentTarget.style.transform = "translateX(6px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.card; e.currentTarget.style.transform = "translateX(0)"; }}>
                    <span>{opt.label}</span>
                    <span style={{ color: C.accent, fontSize: 20 }}>→</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div style={{ background: `linear-gradient(135deg, ${C.accent}18, ${C.gold}0a)`, border: `1px solid ${C.accent}33`, borderRadius: 24, padding: "32px", marginBottom: 28, textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✨</div>
                <h2 style={{ color: C.text, fontSize: 26, fontWeight: 900, marginBottom: 10, letterSpacing: -0.5 }}>{currentNode.result.title}</h2>
                <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.7, margin: 0 }}>{currentNode.result.description}</p>
              </div>
              {currentNode.result.picks.map((pick, i) => <ResultCard key={i} pick={pick} index={i} />)}
              <button onClick={() => { setPath([]); setAnimKey(k => k + 1); }}
                style={{ marginTop: 24, width: "100%", background: `linear-gradient(135deg, ${C.accent}, #9B8BFF)`, color: "#fff", border: "none", borderRadius: 16, padding: "16px", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: `0 8px 24px ${C.accent}44`, transition: "transform 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                Make another decision →
              </button>
            </>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </div>
  );
}

function ChatScreen({ onBack }) {
  const [messages, setMessages] = useState([{ role: "assistant", content: "Hi! I'm your DecisionPilot AI. Tell me about any decision you're facing — vacation, laptop, TV, car, fitness, pets, dining, phone, or career. I'll ask a few questions and give you a personalized recommendation. 🧭" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })) }) });
      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection error. Please try again." }]);
    } finally { setLoading(false); }
  }

  const suggestions = ["Best beach vacation under $1000", "iPhone vs Samsung 2026", "Best laptop for students", "Should I adopt a cat or dog?"];

  return (
    <div style={{ height: "100vh", background: C.bg, display: "flex", flexDirection: "column" }}>
      <Orb style={{ width: 400, height: 400, background: C.accent, opacity: 0.06, top: -100, left: -100 }} />

      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 12, padding: "16px 24px", borderBottom: `1px solid ${C.border}`, background: C.surface }}>
        <button onClick={onBack} style={{ background: C.card, border: `1px solid ${C.border}`, color: C.muted, borderRadius: 10, padding: "7px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>← Back</button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg, ${C.accent}, ${C.gold})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, boxShadow: `0 4px 12px ${C.accent}44` }}>🧭</div>
          <div>
            <div style={{ color: C.text, fontWeight: 800, fontSize: 14 }}>DecisionPilot AI</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 1 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.success, boxShadow: `0 0 6px ${C.success}` }} />
              <span style={{ color: C.success, fontSize: 11, fontWeight: 600 }}>Online</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px", position: "relative", zIndex: 1 }}>
        {messages.length === 1 && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ color: C.muted, fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Try asking about</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => { setInput(s); }}
                  style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: "7px 14px", color: C.muted, fontSize: 13, cursor: "pointer", transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.text; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 16, animation: "fadeIn 0.3s ease" }}>
            {m.role === "assistant" && <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: `linear-gradient(135deg, ${C.accent}, ${C.gold})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, marginRight: 10, marginTop: 2, boxShadow: `0 4px 12px ${C.accent}33` }}>🧭</div>}
            <div style={{ maxWidth: "78%", padding: "13px 17px", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: m.role === "user" ? `linear-gradient(135deg, ${C.accent}, #9B8BFF)` : C.card, border: m.role === "user" ? "none" : `1px solid ${C.border}`, color: C.text, fontSize: 14, lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(135deg, ${C.accent}, ${C.gold})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🧭</div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "18px 18px 18px 4px", padding: "14px 18px" }}>
              <div style={{ display: "flex", gap: 5 }}>{[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: C.accent, animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}</div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ position: "relative", zIndex: 1, padding: "16px 24px", borderTop: `1px solid ${C.border}`, background: C.surface }}>
        <div style={{ display: "flex", gap: 10, maxWidth: 700, margin: "0 auto" }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()} placeholder="Ask me anything — vacation, phone, career..."
            style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "13px 18px", color: C.text, fontSize: 14, outline: "none", fontFamily: "inherit", transition: "border-color 0.15s" }}
            onFocus={e => e.target.style.borderColor = C.accent}
            onBlur={e => e.target.style.borderColor = C.border} />
          <button onClick={send} disabled={loading || !input.trim()}
            style={{ background: input.trim() ? `linear-gradient(135deg, ${C.accent}, #9B8BFF)` : C.card, color: input.trim() ? "#fff" : C.muted, border: "none", borderRadius: 14, padding: "13px 22px", cursor: input.trim() ? "pointer" : "default", fontSize: 18, transition: "all 0.15s", boxShadow: input.trim() ? `0 4px 16px ${C.accent}44` : "none" }}>↑</button>
        </div>
      </div>
      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-7px)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [startId, setStartId] = useState(null);
  function handleStart(mode, id = null) { setStartId(id); setScreen(mode); }
  if (screen === "tree") return <TreeScreen onBack={() => setScreen("landing")} startId={startId} />;
  if (screen === "chat") return <ChatScreen onBack={() => setScreen("landing")} />;
  return <Landing onStart={handleStart} />;
}
