import { useState, useEffect, useRef } from "react";

const C = {
  bg: "#F5F7FA",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  border: "#E2E8F0",
  borderHover: "#CBD5E1",
  accent: "#0066CC",
  accentLight: "#EBF4FF",
  accentHover: "#0052A3",
  gold: "#F59E0B",
  text: "#1A202C",
  textSecondary: "#4A5568",
  muted: "#718096",
  success: "#38A169",
  successLight: "#F0FFF4",
  danger: "#E53E3E",
  shadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
  shadowMd: "0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)",
  shadowLg: "0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)",
};

function amz(k) { return `/go?url=${encodeURIComponent(`https://www.amazon.com/s?k=${encodeURIComponent(k)}`)}` }
function bkg(ss) { return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(ss)}&aid=decisionpilot` }

const CATEGORIES = [
  { id: "vacation", label: "Vacation", emoji: "🏖️", desc: "Hotels & destinations", color: "#0066CC" },
  { id: "phone", label: "Smartphone", emoji: "📱", desc: "Find your perfect phone", color: "#7C3AED" },
  { id: "laptop", label: "Laptop", emoji: "💻", desc: "Work, gaming, study", color: "#0891B2" },
  { id: "tv", label: "TV", emoji: "📺", desc: "Picture perfect viewing", color: "#059669" },
  { id: "car", label: "Car", emoji: "🚗", desc: "Electric, sport, family", color: "#DC2626" },
  { id: "fitness", label: "Fitness", emoji: "🏋️", desc: "Gym & wellness gear", color: "#D97706" },
  { id: "pet", label: "Pet", emoji: "🐕", desc: "Find your companion", color: "#7C3AED" },
  { id: "dining", label: "Dining Out", emoji: "🍽️", desc: "Restaurants & delivery", color: "#DB2777" },
  { id: "career", label: "Career", emoji: "💼", desc: "Jobs & skills", color: "#0066CC" },
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
          { name: "Hisense U8N", tag: "Best Bang for Buck", desc: "Mini-LED, 144Hz, Dolby Vision.", link: amz("Hisense U8N TV") },
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
          { name: "Manduka PRO Yoga Mat", tag: "Essential", desc: "The last yoga mat you'll ever buy.", link: amz("Manduka PRO yoga mat") },
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
          { name: "Ragdoll", tag: "Most Relaxed", desc: "Goes limp when held, extremely gentle.", link: amz("Ragdoll cat supplies") },
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

function Badge({ children, color = C.accent }) {
  return (
    <span style={{
      background: color + "15", color, border: `1px solid ${color}30`,
      borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700,
      letterSpacing: 0.5, textTransform: "uppercase",
    }}>{children}</span>
  );
}

function TopNav({ onBack, showBack }) {
  return (
    <div style={{
      background: C.accent, padding: "0 24px",
      boxShadow: "0 2px 8px rgba(0,102,204,0.3)",
      position: "sticky", top: 0, zIndex: 100,
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 16, height: 60 }}>
        {showBack && (
          <button onClick={onBack} style={{
            background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
            color: "#fff", borderRadius: 8, padding: "6px 14px", cursor: "pointer",
            fontSize: 13, fontWeight: 600, transition: "all 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}>
            ← Back
          </button>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8, background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
          }}>🧭</div>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 18, letterSpacing: -0.3 }}>DecisionPilot</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{
            background: "rgba(255,255,255,0.15)", color: "#fff",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600,
          }}>🆓 Free Beta</span>
        </div>
      </div>
    </div>
  );
}

function CategoryGrid({ onSelect }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
      {CATEGORIES.map((cat) => (
        <button key={cat.id} onClick={() => onSelect(cat.id)}
          onMouseEnter={() => setHovered(cat.id)}
          onMouseLeave={() => setHovered(null)}
          style={{
            background: hovered === cat.id ? cat.color + "08" : C.card,
            border: `2px solid ${hovered === cat.id ? cat.color : C.border}`,
            borderRadius: 12, padding: "20px 14px", cursor: "pointer",
            transition: "all 0.2s", transform: hovered === cat.id ? "translateY(-2px)" : "translateY(0)",
            boxShadow: hovered === cat.id ? `0 6px 20px ${cat.color}22` : C.shadow,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center",
          }}>
          <span style={{ fontSize: 34 }}>{cat.emoji}</span>
          <span style={{ color: C.text, fontWeight: 700, fontSize: 14 }}>{cat.label}</span>
          <span style={{ color: C.muted, fontSize: 12, lineHeight: 1.4 }}>{cat.desc}</span>
        </button>
      ))}
    </div>
  );
}

function ResultCard({ pick, index }) {
  const colors = [C.accent, "#7C3AED", C.success];
  const c = colors[index % 3];
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: C.card, border: `1px solid ${hovered ? c + "44" : C.border}`,
        borderLeft: `4px solid ${c}`,
        borderRadius: 12, padding: "20px 22px", marginBottom: 10,
        transition: "all 0.2s", boxShadow: hovered ? C.shadowMd : C.shadow,
      }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <span style={{ color: C.text, fontWeight: 800, fontSize: 16 }}>{pick.name}</span>
        <Badge color={c}>{pick.tag}</Badge>
      </div>
      <p style={{ color: C.textSecondary, fontSize: 14, margin: "0 0 12px", lineHeight: 1.6 }}>{pick.desc}</p>
      <a href={pick.link} target="_blank" rel="noopener noreferrer"
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: c, color: "#fff", fontSize: 13, fontWeight: 700,
          textDecoration: "none", padding: "7px 16px", borderRadius: 8,
          transition: "opacity 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
        onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
        View deals →
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

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <TopNav showBack={false} />

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, #0055AA 0%, #0077DD 50%, #0099FF 100%)`, padding: "60px 24px 80px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: 24, padding: "6px 16px", marginBottom: 28,
            color: "#fff", fontSize: 13, fontWeight: 600,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ADE80", display: "inline-block" }} />
            AI-Powered Decision Making
          </div>
          <h1 style={{ color: "#fff", fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 900, lineHeight: 1.1, letterSpacing: -2, margin: "0 0 16px" }}>
            Stop hesitating.<br />Start deciding.
          </h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.7 }}>
            Your AI co-pilot for every major decision. Vacations, gadgets, cars, careers — personalized recommendations in seconds.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => onStart("tree")} style={{
              background: "#fff", color: C.accent, border: "none",
              borderRadius: 10, padding: "14px 28px", fontSize: 16, fontWeight: 700,
              cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.25)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.2)"; }}>
              🌳 Decision Tree
            </button>
            <button onClick={() => onStart("chat")} style={{
              background: "rgba(255,255,255,0.15)", color: "#fff",
              border: "2px solid rgba(255,255,255,0.4)",
              borderRadius: 10, padding: "14px 28px", fontSize: 16, fontWeight: 700,
              cursor: "pointer", transition: "all 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}>
              🤖 Chat with AI
            </button>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, padding: "16px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap" }}>
          {[
            { value: `${count.toLocaleString()}+`, label: "Decisions made" },
            { value: "9", label: "Categories" },
            { value: "100%", label: "Free to use" },
            { value: "AI", label: "Powered" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ color: C.accent, fontSize: 22, fontWeight: 900 }}>{s.value}</div>
              <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* How it works */}
        <div style={{ marginBottom: 56 }}>
          <h2 style={{ color: C.text, fontSize: 24, fontWeight: 800, marginBottom: 6, textAlign: "center" }}>How it works</h2>
          <p style={{ color: C.muted, textAlign: "center", marginBottom: 32, fontSize: 15 }}>Get your answer in under 60 seconds</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {[
              { num: "1", icon: "🎯", title: "Choose a category", desc: "Pick what you want to decide from our 9 categories." },
              { num: "2", icon: "💬", title: "Answer questions", desc: "Navigate the tree or chat with AI about your preferences." },
              { num: "3", icon: "✨", title: "Get recommendations", desc: "Receive personalized picks with direct links to the best deals." },
            ].map((s, i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "24px 20px", boxShadow: C.shadow, display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16, flexShrink: 0 }}>{s.num}</div>
                <div>
                  <div style={{ color: C.text, fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{s.icon} {s.title}</div>
                  <div style={{ color: C.muted, fontSize: 13, lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h2 style={{ color: C.text, fontSize: 24, fontWeight: 800, marginBottom: 6, textAlign: "center" }}>What can you decide?</h2>
          <p style={{ color: C.muted, textAlign: "center", marginBottom: 32, fontSize: 15 }}>Click any category to start immediately — no signup required</p>
          <CategoryGrid onSelect={(id) => onStart("tree", id)} />
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: C.text, padding: "32px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>🧭</span>
            <span style={{ color: "#fff", fontWeight: 700 }}>DecisionPilot</span>
            <span style={{ color: "#718096", fontSize: 13 }}>© 2026</span>
          </div>
          <span style={{ color: "#718096", fontSize: 12 }}>Free forever · No signup · AI-powered · Global recommendations</span>
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
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <TopNav showBack onBack={back} />
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Progress */}
        {path.length > 0 && (
          <div style={{ display: "flex", gap: 6, marginBottom: 32 }}>
            {path.map((_, i) => (
              <div key={i} style={{ height: 4, flex: 1, borderRadius: 2, background: i <= path.length - 1 ? C.accent : C.border, transition: "background 0.3s" }} />
            ))}
            <div style={{ height: 4, flex: 1, borderRadius: 2, background: C.border }} />
          </div>
        )}

        <div key={animKey} style={{ animation: "fadeSlide 0.3s ease" }}>
          {!hasResult ? (
            <>
              <div style={{ textAlign: "center", marginBottom: 40 }}>
                <div style={{ fontSize: 60, marginBottom: 16 }}>{currentNode?.emoji || "🧭"}</div>
                <h2 style={{ color: C.text, fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 900, marginBottom: 10, letterSpacing: -0.5 }}>{currentNode?.question}</h2>
                <p style={{ color: C.muted, fontSize: 15 }}>Select the option that best describes you</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {currentNode?.options?.map((opt, i) => (
                  <button key={opt.id} onClick={() => choose(opt.id)}
                    style={{
                      background: C.card, border: `1px solid ${C.border}`,
                      borderRadius: 12, padding: "18px 22px", textAlign: "left",
                      cursor: "pointer", color: C.text, fontSize: 16, fontWeight: 600,
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      transition: "all 0.15s", boxShadow: C.shadow,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = C.accent;
                      e.currentTarget.style.background = C.accentLight;
                      e.currentTarget.style.transform = "translateX(4px)";
                      e.currentTarget.style.boxShadow = `0 4px 12px ${C.accent}22`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = C.border;
                      e.currentTarget.style.background = C.card;
                      e.currentTarget.style.transform = "translateX(0)";
                      e.currentTarget.style.boxShadow = C.shadow;
                    }}>
                    <span>{opt.label}</span>
                    <span style={{ color: C.accent, fontSize: 18 }}>›</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div style={{ background: C.accentLight, border: `1px solid ${C.accent}33`, borderRadius: 16, padding: "28px", marginBottom: 24, textAlign: "center" }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>✨</div>
                <h2 style={{ color: C.text, fontSize: 24, fontWeight: 900, marginBottom: 8 }}>{currentNode.result.title}</h2>
                <p style={{ color: C.textSecondary, fontSize: 15, lineHeight: 1.6, margin: 0 }}>{currentNode.result.description}</p>
              </div>
              {currentNode.result.picks.map((pick, i) => <ResultCard key={i} pick={pick} index={i} />)}
              <button onClick={() => { setPath([]); setAnimKey(k => k + 1); }}
                style={{
                  marginTop: 20, width: "100%", background: C.accent, color: "#fff",
                  border: "none", borderRadius: 10, padding: "14px", fontSize: 15,
                  fontWeight: 700, cursor: "pointer", transition: "background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = C.accentHover}
                onMouseLeave={e => e.currentTarget.style.background = C.accent}>
                Make another decision →
              </button>
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes fadeSlide { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  );
}

function ChatScreen({ onBack }) {
  const [messages, setMessages] = useState([{ role: "assistant", content: "Hi! I'm your DecisionPilot AI. Tell me about any decision — vacation, laptop, TV, car, fitness, pets, dining, phone, or career. I'll ask a few questions and give you a personalized recommendation. 🧭" }]);
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
      <TopNav showBack onBack={onBack} />
      <div style={{ flex: 1, overflowY: "auto", padding: "24px", maxWidth: 760, margin: "0 auto", width: "100%" }}>
        {messages.length === 1 && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ color: C.muted, fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Try asking</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => setInput(s)}
                  style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: "7px 14px", color: C.textSecondary, fontSize: 13, cursor: "pointer", transition: "all 0.15s", boxShadow: C.shadow }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.accent; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSecondary; }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 16 }}>
            {m.role === "assistant" && (
              <div style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, marginRight: 10, marginTop: 2 }}>🧭</div>
            )}
            <div style={{
              maxWidth: "78%", padding: "12px 16px",
              borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              background: m.role === "user" ? C.accent : C.card,
              border: m.role === "user" ? "none" : `1px solid ${C.border}`,
              color: m.role === "user" ? "#fff" : C.text,
              fontSize: 14, lineHeight: 1.75, whiteSpace: "pre-wrap",
              boxShadow: C.shadow,
            }}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🧭</div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "18px 18px 18px 4px", padding: "12px 16px", boxShadow: C.shadow }}>
              <div style={{ display: "flex", gap: 4 }}>{[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: C.accent, animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}</div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ background: C.card, borderTop: `1px solid ${C.border}`, padding: "16px 24px", boxShadow: "0 -2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", gap: 10, maxWidth: 760, margin: "0 auto" }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Ask me anything — vacation, phone, career..."
            style={{ flex: 1, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 16px", color: C.text, fontSize: 14, outline: "none", fontFamily: "inherit", transition: "border-color 0.15s" }}
            onFocus={e => e.target.style.borderColor = C.accent}
            onBlur={e => e.target.style.borderColor = C.border} />
          <button onClick={send} disabled={loading || !input.trim()}
            style={{ background: input.trim() ? C.accent : C.border, color: "#fff", border: "none", borderRadius: 10, padding: "12px 20px", cursor: input.trim() ? "pointer" : "default", fontSize: 18, transition: "background 0.15s" }}
            onMouseEnter={e => input.trim() && (e.currentTarget.style.background = C.accentHover)}
            onMouseLeave={e => input.trim() && (e.currentTarget.style.background = C.accent)}>↑</button>
        </div>
      </div>
      <style>{`@keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }`}</style>
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
