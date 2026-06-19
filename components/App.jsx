import { useState, useEffect, useRef } from "react";

const C = {
  bg: "#0A0A0F", surface: "#12121A", card: "#1A1A28", border: "#2A2A40",
  accent: "#7C6AF7", accentGlow: "#7C6AF733", gold: "#F0B429",
  text: "#F0EFF8", muted: "#8887A4", success: "#34D399",
};

function amz(k) { return `/go?url=${encodeURIComponent(`https://www.amazon.com/s?k=${encodeURIComponent(k)}`)}` }
function bkg(ss) { return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(ss)}&aid=decisionpilot` }

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
            { label: "🌎 Americas", id: "americas_culture", result: { title: "New York, Buenos Aires or Mexico City", description: "The Americas' most vibrant urban destinations.", picks: [
              { name: "New York, USA", tag: "Most Iconic", desc: "Times Square, Central Park, world-class museums and food.", link: bkg("New York") },
              { name: "Buenos Aires, Argentina", tag: "Most Passionate", desc: "Tango, steak, European architecture, incredible nightlife.", link: bkg("Buenos Aires") },
              { name: "Mexico City, Mexico", tag: "Best Value", desc: "Ancient ruins, world-class food scene, vibrant culture.", link: bkg("Mexico City") },
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
          { name: "ASUS ROG Zephyrus G16", tag: "Best Overall", desc: "RTX 4080, 240Hz display, stunning design. The benchmark gaming laptop.", link: amz("ASUS ROG Zephyrus G16") },
          { name: "Razer Blade 16", tag: "Most Premium", desc: "Unmatched build quality, RTX 4090 option, stunning OLED display.", link: amz("Razer Blade 16") },
          { name: "Lenovo Legion Pro 5", tag: "Best Value", desc: "RTX 4070, excellent thermals, great price-to-performance ratio.", link: amz("Lenovo Legion Pro 5") },
        ]}},
        { label: "💼 Business", id: "laptop_business", result: { title: "Best Business Laptops 2026", description: "Productivity, portability, and reliability.", picks: [
          { name: "Apple MacBook Pro 14\"", tag: "Best Overall", desc: "M4 chip, incredible battery, best-in-class display. Worth every penny.", link: amz("MacBook Pro 14 M4") },
          { name: "ThinkPad X1 Carbon", tag: "Most Reliable", desc: "Military-grade durability, legendary keyboard, enterprise security.", link: amz("ThinkPad X1 Carbon") },
          { name: "Dell XPS 13", tag: "Most Portable", desc: "Ultralight, beautiful OLED display, powerful Intel processor.", link: amz("Dell XPS 13") },
        ]}},
        { label: "🎓 Student", id: "laptop_student", result: { title: "Best Student Laptops 2026", description: "Performance and value for studying.", picks: [
          { name: "Apple MacBook Air M3", tag: "Best Overall", desc: "Fanless, all-day battery, perfect for any student. Timeless.", link: amz("MacBook Air M3") },
          { name: "Acer Swift 14 AI", tag: "Best Windows", desc: "Intel Core Ultra, OLED display, lightweight at a great price.", link: amz("Acer Swift 14 AI") },
          { name: "Chromebook Plus", tag: "Most Affordable", desc: "Perfect for Google Docs, great battery, affordable and fast.", link: amz("Chromebook Plus") },
        ]}},
      ],
    },
    {
      label: "📺 TV", id: "tv", question: "What's your priority?", emoji: "📺",
      options: [
        { label: "🎬 Best Picture", id: "tv_picture", result: { title: "Best Picture Quality TVs 2026", description: "For those who refuse to compromise on image quality.", picks: [
          { name: "LG G5 OLED", tag: "Best Overall", desc: "Infinite contrast, perfect blacks, Dolby Vision. The reference OLED.", link: amz("LG G5 OLED TV") },
          { name: "Samsung QN90D Neo QLED", tag: "Brightest", desc: "Mini-LED brilliance, perfect for bright rooms, stunning colors.", link: amz("Samsung QN90D Neo QLED") },
          { name: "Sony Bravia 9", tag: "Best Processing", desc: "Sony's AI processor makes everything look cinematic.", link: amz("Sony Bravia 9") },
        ]}},
        { label: "💰 Best Value", id: "tv_value", result: { title: "Best Value TVs 2026", description: "Great picture without breaking the bank.", picks: [
          { name: "Hisense U8N", tag: "Best Bang for Buck", desc: "Mini-LED, 144Hz, Dolby Vision. Competes with TVs twice the price.", link: amz("Hisense U8N TV") },
          { name: "TCL QM8", tag: "Best Budget QLED", desc: "Quantum dots, excellent brightness, Google TV built-in.", link: amz("TCL QM8 TV") },
          { name: "Amazon Fire TV Omni", tag: "Most Affordable", desc: "Alexa built-in, decent picture, unbeatable price.", link: amz("Amazon Fire TV Omni") },
        ]}},
        { label: "🎮 Gaming TV", id: "tv_gaming", result: { title: "Best Gaming TVs 2026", description: "Low latency, high refresh rate, next-gen gaming.", picks: [
          { name: "LG C4 OLED 42\"", tag: "Best Gaming OLED", desc: "0.1ms response, 4x HDMI 2.1, 120Hz. PS5/Xbox dream display.", link: amz("LG C4 OLED 42 inch") },
          { name: "Samsung S90D OLED", tag: "Best for Sports", desc: "Anti-glare OLED, 144Hz, stunning in any lighting.", link: amz("Samsung S90D OLED") },
          { name: "Hisense U7N", tag: "Best Value Gaming", desc: "144Hz, HDMI 2.1, mini-LED at a very competitive price.", link: amz("Hisense U7N TV") },
        ]}},
      ],
    },
    {
      label: "🚗 Car", id: "car", question: "What type of car?", emoji: "🚗",
      options: [
        { label: "⚡ Electric", id: "car_electric", result: { title: "Best Electric Cars 2026", description: "The EV market has matured. These are worth buying now.", picks: [
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
        { label: "💪 Build Muscle", id: "fitness_muscle", result: { title: "Best Home Gym Equipment for Muscle", description: "Build serious muscle without leaving home.", picks: [
          { name: "Adjustable Dumbbell Set", tag: "Most Versatile", desc: "Replaces 15 pairs of dumbbells. Bowflex or PowerBlock are the gold standard.", link: amz("adjustable dumbbell set") },
          { name: "Power Rack + Barbell", tag: "Most Effective", desc: "Squat, bench, deadlift. The holy trinity of muscle building.", link: amz("power rack barbell set") },
          { name: "Resistance Band Set", tag: "Best Budget", desc: "Surprisingly effective, portable, joint-friendly. Great starter kit.", link: amz("resistance band set heavy") },
        ]}},
        { label: "🏃 Cardio & Weight Loss", id: "fitness_cardio", result: { title: "Best Cardio Equipment 2026", description: "Burn calories efficiently at home.", picks: [
          { name: "Concept2 RowErg", tag: "Best Overall", desc: "Full body workout, low impact, used by Olympic athletes.", link: amz("Concept2 RowErg rowing machine") },
          { name: "Treadmill NordicTrack", tag: "Most Popular", desc: "iFit classes, incline training, foldable design.", link: amz("NordicTrack treadmill") },
          { name: "Assault AirBike", tag: "Most Intense", desc: "HIIT king. 20 minutes burns as much as an hour of jogging.", link: amz("Assault AirBike") },
        ]}},
        { label: "🧘 Flexibility & Wellness", id: "fitness_wellness", result: { title: "Best Wellness Equipment 2026", description: "Recovery, flexibility, and mental health.", picks: [
          { name: "Yoga Mat Premium", tag: "Essential", desc: "Manduka PRO – the last yoga mat you'll ever buy. Worth it.", link: amz("Manduka PRO yoga mat") },
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
            { label: "🏃 Active lifestyle", id: "dog_active", result: { title: "Best Dogs for Active People", description: "Dogs that match your energy and love adventure.", picks: [
              { name: "Border Collie", tag: "Most Intelligent", desc: "Needs 2+ hours exercise daily. Thrives with tasks and mental stimulation.", link: amz("Border Collie dog supplies") },
              { name: "Labrador Retriever", tag: "Most Popular", desc: "Friendly, energetic, great with families. The world's favorite dog.", link: amz("Labrador dog supplies") },
              { name: "Vizsla", tag: "Best Companion", desc: "Velcro dog – stays by your side. Excellent runner and swimmer.", link: amz("Vizsla dog supplies") },
            ]}},
            { label: "🏠 Homebody", id: "dog_calm", result: { title: "Best Dogs for Relaxed Owners", description: "Dogs that are happy chilling at home.", picks: [
              { name: "Bulldog", tag: "Most Relaxed", desc: "Minimal exercise needed, loves sofa time, great apartment dog.", link: amz("Bulldog dog supplies") },
              { name: "Shih Tzu", tag: "Best Lap Dog", desc: "Affectionate, low exercise needs, hypoallergenic coat.", link: amz("Shih Tzu dog supplies") },
              { name: "Basset Hound", tag: "Most Chill", desc: "Easygoing, friendly, loves sleeping. Perfect for relaxed owners.", link: amz("Basset Hound dog supplies") },
            ]}},
          ],
        },
        { label: "🐱 Cat", id: "pet_cat", result: { title: "Best Cat Breeds 2026", description: "Find your perfect feline companion.", picks: [
          { name: "Maine Coon", tag: "Most Sociable", desc: "Dog-like personality, loves people, gentle giant. Highly intelligent.", link: amz("Maine Coon cat supplies") },
          { name: "Ragdoll", tag: "Most Relaxed", desc: "Goes limp when held, extremely gentle, perfect indoor cat.", link: amz("Ragdoll cat supplies") },
          { name: "British Shorthair", tag: "Most Independent", desc: "Calm, dignified, doesn't need constant attention. Great for busy owners.", link: amz("British Shorthair cat supplies") },
        ]}},
        { label: "🐠 Fish / Other", id: "pet_other", result: { title: "Low Maintenance Pets", description: "Perfect if you want companionship without high commitment.", picks: [
          { name: "Betta Fish", tag: "Most Beautiful", desc: "Stunning colors, small tank needed, surprisingly interactive.", link: amz("Betta fish tank aquarium") },
          { name: "Guinea Pig", tag: "Most Social", desc: "Gentle, social, great with children. Needs a companion though.", link: amz("guinea pig cage supplies") },
          { name: "Leopard Gecko", tag: "Most Unique", desc: "Low maintenance, long-lived, fascinating to watch. No smell.", link: amz("leopard gecko terrarium") },
        ]}},
      ],
    },
    {
      label: "🍽️ Dining Out", id: "dining", question: "What's the occasion?", emoji: "🍽️",
      options: [
        { label: "💑 Romantic Dinner", id: "dining_romantic", result: { title: "How to Pick the Perfect Romantic Restaurant", description: "Make it unforgettable.", picks: [
          { name: "Use OpenTable", tag: "Best Reservations", desc: "Filter by 'romantic', read recent reviews, book 1 week ahead for weekends.", link: "https://www.opentable.com" },
          { name: "Check TripAdvisor", tag: "Best Reviews", desc: "Sort by 'romantic atmosphere', look for candles/dim lighting mentions.", link: "https://www.tripadvisor.com" },
          { name: "Try TheFork", tag: "Best Deals", desc: "Often 50% off at great restaurants. Filter by cuisine and ambiance.", link: "https://www.thefork.com" },
        ]}},
        { label: "👨‍👩‍👧 Family Dinner", id: "dining_family", result: { title: "Finding the Perfect Family Restaurant", description: "Where everyone is happy, from kids to grandparents.", picks: [
          { name: "Use Yelp", tag: "Best for Families", desc: "Filter 'good for kids', 'high chairs available'. Read parent reviews.", link: "https://www.yelp.com" },
          { name: "Google Maps", tag: "Most Convenient", desc: "Search 'family restaurant near me', check photos for kids' areas.", link: "https://maps.google.com" },
          { name: "TheFork", tag: "Best Booking", desc: "Easy group reservations, special menus for children, loyalty points.", link: "https://www.thefork.com" },
        ]}},
        { label: "🍕 Quick & Casual", id: "dining_casual", result: { title: "Best Food Delivery & Quick Dining", description: "Great food without the fuss.", picks: [
          { name: "Uber Eats", tag: "Most Options", desc: "Largest restaurant selection, real-time tracking, great for groups.", link: "https://www.ubereats.com" },
          { name: "Deliveroo", tag: "Best Quality", desc: "Premium restaurant partners, excellent packaging, reliable delivery.", link: "https://deliveroo.com" },
          { name: "Google Maps", tag: "Best Discovery", desc: "Search 'best pizza near me', sort by rating, check wait times.", link: "https://maps.google.com" },
        ]}},
      ],
    },
    {
      label: "💼 Career Move", id: "career", question: "What's your situation?", emoji: "💼",
      options: [
        { label: "🚀 Switch Jobs", id: "career_switch", result: { title: "How to Navigate a Job Switch", description: "A structured approach to the right career move.", picks: [
          { name: "Evaluate Total Compensation", tag: "Step 1", desc: "Salary + equity + benefits + remote flexibility. Compare everything.", link: "https://www.levels.fyi" },
          { name: "Research Company Culture", tag: "Step 2", desc: "Glassdoor, Blind, LinkedIn. Talk to people who work there.", link: "https://www.glassdoor.com" },
          { name: "Negotiate Before Signing", tag: "Step 3", desc: "Always negotiate. First offer is rarely the best.", link: "https://www.linkedin.com/jobs" },
        ]}},
        { label: "🌍 Relocate", id: "career_relocate", result: { title: "Best Cities for Career Growth 2026", description: "Location matters enormously.", picks: [
          { name: "Dubai, UAE", tag: "Tax Free", desc: "Zero income tax, international hub, growing tech scene.", link: "https://www.linkedin.com/jobs/search/?location=Dubai" },
          { name: "Berlin, Germany", tag: "Tech Hub", desc: "Strong startup ecosystem, good salaries, high quality of life.", link: "https://www.linkedin.com/jobs/search/?location=Berlin" },
          { name: "Lisbon, Portugal", tag: "Best Quality of Life", desc: "Tech visa available, lower cost, sun, safety.", link: "https://www.linkedin.com/jobs/search/?location=Lisbon" },
        ]}},
        { label: "📚 Learn New Skills", id: "career_learn", result: { title: "Best Platforms to Learn New Skills", description: "Invest in yourself — the best ROI available.", picks: [
          { name: "Coursera", tag: "Best Certificates", desc: "University-backed courses, Google/Meta/IBM certificates, financial aid available.", link: "https://www.coursera.org" },
          { name: "Udemy", tag: "Best Value", desc: "Lifetime access, frequent 90% sales, 200,000+ courses on everything.", link: "https://www.udemy.com" },
          { name: "LinkedIn Learning", tag: "Best for Career", desc: "Skills show on your LinkedIn profile, employer-recognized certificates.", link: "https://www.linkedin.com/learning" },
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

function Orb({ style }) {
  return <div style={{ position: "absolute", borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none", zIndex: 0, ...style }} />;
}

function Badge({ children, color = C.accent }) {
  return <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>{children}</span>;
}

function ResultCard({ pick, index }) {
  const colors = [C.gold, C.accent, C.success];
  const c = colors[index % 3];
  return (
    <div style={{ background: C.card, border: `1px solid ${c}33`, borderRadius: 16, padding: "20px 22px", marginBottom: 12, transition: "transform 0.15s" }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
        <span style={{ color: C.text, fontWeight: 700, fontSize: 16 }}>{pick.name}</span>
        <Badge color={c}>{pick.tag}</Badge>
      </div>
      <p style={{ color: C.muted, fontSize: 14, margin: "0 0 8px", lineHeight: 1.6 }}>{pick.desc}</p>
      <a href={pick.link} target="_blank" rel="noopener noreferrer" style={{ color: c, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>View deals →</a>
    </div>
  );
}

function Landing({ onStart }) {
  const features = [
    { icon: "🌳", label: "Decision Trees", desc: "Click-by-click guided decisions" },
    { icon: "🤖", label: "AI Advisor", desc: "Chat with your personal AI" },
    { icon: "🌍", label: "Global Coverage", desc: "Recommendations worldwide" },
    { icon: "⚡", label: "Instant Results", desc: "No waiting, no signup needed" },
  ];
  return (
    <div style={{ minHeight: "100vh", background: C.bg, position: "relative", overflow: "hidden" }}>
      <Orb style={{ width: 600, height: 600, background: C.accent, opacity: 0.12, top: -200, left: -200 }} />
      <Orb style={{ width: 400, height: 400, background: C.gold, opacity: 0.07, top: 100, right: -100 }} />
      <Orb style={{ width: 300, height: 300, background: C.success, opacity: 0.06, bottom: 0, left: "40%" }} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "28px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${C.accent}, ${C.gold})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🧭</div>
            <span style={{ color: C.text, fontWeight: 800, fontSize: 18, letterSpacing: -0.5 }}>DecisionPilot</span>
          </div>
          <Badge color={C.gold}>Free Beta</Badge>
        </div>
        <div style={{ textAlign: "center", paddingTop: 80, paddingBottom: 60 }}>
          <div style={{ display: "inline-block", background: C.accentGlow, border: `1px solid ${C.accent}44`, borderRadius: 20, padding: "6px 16px", marginBottom: 28, color: C.accent, fontSize: 13, fontWeight: 600 }}>AI-Powered Decision Making ✦</div>
          <h1 style={{ color: C.text, fontSize: "clamp(38px, 7vw, 72px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: -2, margin: "0 0 12px" }}>
            Stop hesitating.<br />
            <span style={{ background: `linear-gradient(135deg, ${C.accent} 0%, ${C.gold} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Start deciding.</span>
          </h1>
          <p style={{ color: C.muted, fontSize: 18, maxWidth: 520, margin: "0 auto 48px", lineHeight: 1.7 }}>
            From choosing your next vacation to picking the perfect phone — DecisionPilot guides you to the right answer, every time.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => onStart("tree")} style={{ background: `linear-gradient(135deg, ${C.accent} 0%, #9B8BFF 100%)`, color: "#fff", border: "none", borderRadius: 14, padding: "16px 32px", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: `0 8px 32px ${C.accent}44` }}>🌳 Use Decision Tree</button>
            <button onClick={() => onStart("chat")} style={{ background: "transparent", color: C.text, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 32px", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>🤖 Chat with AI</button>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, paddingBottom: 80 }}>
          {features.map((f, i) => (
            <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 18px" }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ color: C.text, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{f.label}</div>
              <div style={{ color: C.muted, fontSize: 13 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TreeScreen({ onBack }) {
  const [path, setPath] = useState([]);
  const [animKey, setAnimKey] = useState(0);
  const currentNode = findNode(TREE, path);
  function choose(optionId) { setPath(p => [...p, optionId]); setAnimKey(k => k + 1); }
  function back() { if (path.length === 0) { onBack(); return; } setPath(p => p.slice(0, -1)); setAnimKey(k => k + 1); }
  const hasResult = currentNode?.result;
  return (
    <div style={{ minHeight: "100vh", background: C.bg, position: "relative", overflow: "hidden" }}>
      <Orb style={{ width: 500, height: 500, background: C.accent, opacity: 0.08, top: -150, right: -150 }} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 680, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "28px 0 0" }}>
          <button onClick={back} style={{ background: C.card, border: `1px solid ${C.border}`, color: C.muted, borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>← Back</button>
          <span style={{ color: C.text, fontWeight: 800, fontSize: 16 }}>🧭 DecisionPilot</span>
          {path.length > 0 && <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>{path.map((_, i) => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i === path.length - 1 ? C.accent : C.border }} />)}</div>}
        </div>
        <div key={animKey} style={{ paddingTop: 48, paddingBottom: 60 }}>
          {!hasResult ? (
            <>
              <div style={{ fontSize: 48, textAlign: "center", marginBottom: 16 }}>{currentNode?.emoji || "🧭"}</div>
              <h2 style={{ color: C.text, fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, textAlign: "center", marginBottom: 8, letterSpacing: -0.5 }}>{currentNode?.question}</h2>
              <p style={{ color: C.muted, textAlign: "center", marginBottom: 40, fontSize: 15 }}>Choose the option that fits you best</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {currentNode?.options?.map((opt) => (
                  <button key={opt.id} onClick={() => choose(opt.id)} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 22px", textAlign: "left", cursor: "pointer", color: C.text, fontSize: 16, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "space-between", transition: "border-color 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.background = C.accentGlow; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.card; }}>
                    <span>{opt.label}</span><span style={{ color: C.muted }}>→</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div style={{ background: `linear-gradient(135deg, ${C.accent}22, ${C.gold}11)`, border: `1px solid ${C.accent}33`, borderRadius: 20, padding: "24px", marginBottom: 28, textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✨</div>
                <h2 style={{ color: C.text, fontSize: 24, fontWeight: 800, marginBottom: 8, letterSpacing: -0.5 }}>{currentNode.result.title}</h2>
                <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.6, margin: 0 }}>{currentNode.result.description}</p>
              </div>
              {currentNode.result.picks.map((pick, i) => <ResultCard key={i} pick={pick} index={i} />)}
              <button onClick={() => { setPath([]); setAnimKey(k => k + 1); }} style={{ marginTop: 20, width: "100%", background: `linear-gradient(135deg, ${C.accent}, #9B8BFF)`, color: "#fff", border: "none", borderRadius: 14, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Make another decision →</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatScreen({ onBack }) {
  const [messages, setMessages] = useState([{ role: "assistant", content: "Hi! I'm your DecisionPilot. Tell me about a decision you're facing — vacation, laptop, TV, fitness, pets, dining, car, phone, career, or anything else. I'll ask a few questions and give you a personalized recommendation. 🧭" }]);
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
  return (
    <div style={{ height: "100vh", background: C.bg, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      <Orb style={{ width: 400, height: 400, background: C.accent, opacity: 0.07, top: -100, left: -100 }} />
      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 12, padding: "18px 24px", borderBottom: `1px solid ${C.border}`, background: C.surface }}>
        <button onClick={onBack} style={{ background: C.card, border: `1px solid ${C.border}`, color: C.muted, borderRadius: 10, padding: "7px 12px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>← Back</button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${C.accent}, ${C.gold})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🧭</div>
          <div>
            <div style={{ color: C.text, fontWeight: 700, fontSize: 14 }}>DecisionPilot AI</div>
            <div style={{ color: C.success, fontSize: 11, fontWeight: 600 }}>● Online</div>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "24px", position: "relative", zIndex: 1 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 16 }}>
            {m.role === "assistant" && <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: `linear-gradient(135deg, ${C.accent}, ${C.gold})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, marginRight: 10, marginTop: 2 }}>🧭</div>}
            <div style={{ maxWidth: "75%", padding: "12px 16px", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: m.role === "user" ? `linear-gradient(135deg, ${C.accent}, #9B8BFF)` : C.card, border: m.role === "user" ? "none" : `1px solid ${C.border}`, color: C.text, fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg, ${C.accent}, ${C.gold})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🧭</div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "16px 16px 16px 4px", padding: "12px 16px" }}>
              <div style={{ display: "flex", gap: 4 }}>{[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.muted, animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}</div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ position: "relative", zIndex: 1, padding: "16px 24px", borderTop: `1px solid ${C.border}`, background: C.surface }}>
        <div style={{ display: "flex", gap: 10, maxWidth: 680, margin: "0 auto" }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()} placeholder="Describe your decision..." style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 16px", color: C.text, fontSize: 14, outline: "none", fontFamily: "inherit" }} />
          <button onClick={send} disabled={loading || !input.trim()} style={{ background: input.trim() ? `linear-gradient(135deg, ${C.accent}, #9B8BFF)` : C.card, color: input.trim() ? "#fff" : C.muted, border: "none", borderRadius: 12, padding: "12px 20px", cursor: input.trim() ? "pointer" : "default", fontSize: 16 }}>↑</button>
        </div>
      </div>
      <style>{`@keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }`}</style>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("landing");
  if (screen === "tree") return <TreeScreen onBack={() => setScreen("landing")} />;
  if (screen === "chat") return <ChatScreen onBack={() => setScreen("landing")} />;
  return <Landing onStart={mode => setScreen(mode)} />;
}
