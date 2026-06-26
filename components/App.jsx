import React, { useState, useEffect, useRef } from "react";
import { LANGUAGES, getTranslation, detectLanguage } from "./translations";
import { HeroBanner, WorldwideSection } from "./HeroBanner";
import AselCorner from "./AselCorner";

const C = {
  bg: "#F8F9FC", surface: "#FFFFFF", card: "#FFFFFF", border: "#E8ECF4",
  accent: "#1A56DB", accentDark: "#1240A8", accentLight: "#EEF3FF",
  text: "#0F172A", textSecondary: "#475569", muted: "#94A3B8",
  success: "#059669", gold: "#D97706", purple: "#7C3AED",
  shadow: "0 1px 4px rgba(15,23,42,0.08)", shadowMd: "0 4px 16px rgba(15,23,42,0.10)",
  shadowLg: "0 12px 40px rgba(15,23,42,0.13)",
};


const ASEL_ACCESSORY_Q = {
  vacation: "beach", car: "auto", phone: "phone", laptop: "laptop",
  tv: "tv", fitness: "fitness", pet: "pet", dining: "dining", career: "career",
  realestate: "career", land: "career", beauty: "none", clinic: "none",
  insurance: "career", loans: "career", perfume: "none", cruise: "beach",
  furniture: "none", restaurant: "dining", sports: "beach", outdoor: "fitness",
};

function img(id, w = 800, h = 500) {
  return `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;
}
function bkg(ss) { return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(ss)}&aid=decisionpilot`; }
function amz(k) { return `/go?url=${encodeURIComponent(`https://www.amazon.com/s?k=${encodeURIComponent(k)}`)}` }

const TREES = {
  vacation: {
    label: "Vacation", emoji: "🏖️",
    image: img("photo-1507525428034-b723cf961d3e"),
    questions: [
      { id: "style", q: "What kind of vacation are you dreaming of?", options: ["🌊 Beach & Relaxation", "🏛️ Culture & History", "🥾 Adventure & Nature", "🏙️ City & Nightlife", "🍷 Food & Wine", "🧘 Wellness & Retreat"] },
      { id: "duration", q: "How long is your trip?", options: ["Weekend (2-3 days)", "Short break (4-6 days)", "1 week", "2 weeks", "3+ weeks"] },
      { id: "budget", q: "What's your total budget per person?", options: ["Under $500", "$500–$1,000", "$1,000–$2,500", "$2,500–$5,000", "$5,000+"] },
      { id: "travel_with", q: "Who are you travelling with?", options: ["Solo", "Partner / Couple", "Family with young kids", "Family with teens", "Group of friends", "Parents / Senior family"] },
      { id: "climate", q: "What climate do you prefer?", options: ["☀️ Hot & sunny", "🌤️ Warm & mild", "❄️ Cool & crisp", "🌧️ Doesn't matter"] },
      { id: "accommodation", q: "Where would you prefer to stay?", options: ["Luxury resort", "Boutique hotel", "Budget hotel / hostel", "Airbnb / apartment", "Camping / glamping"] },
      { id: "flight", q: "How far are you willing to fly?", options: ["No flight (road trip)", "Up to 3 hours", "3–6 hours", "6–10 hours", "Any distance"] },
      { id: "vibe", q: "What's most important to you?", options: ["🍹 Complete relaxation", "📸 Instagram-worthy spots", "🎭 Local culture & authenticity", "⚡ Non-stop activities", "💰 Best value for money"] },
      { id: "avoid", q: "What do you want to avoid?", options: ["Crowds & tourists", "Long flights", "Expensive destinations", "Extreme heat", "Language barriers", "Nothing — I'm flexible"] },
    ],
  },
  phone: {
    label: "Smartphone", emoji: "📱",
    image: img("photo-1511707171634-5f897ff02aa9"),
    questions: [
      { id: "budget", q: "What's your budget for a new phone?", options: ["Under $300", "$300–$500", "$500–$800", "$800–$1,200", "$1,200+"] },
      { id: "os", q: "Which operating system do you prefer?", options: ["🍎 iOS (Apple)", "Android", "No preference — show me the best"] },
      { id: "priority", q: "What matters most to you?", options: ["📸 Camera quality", "🔋 Battery life", "⚡ Raw performance", "💎 Premium design & build", "AI & smart features", "💰 Best value"] },
      { id: "camera_use", q: "How do you mainly use your camera?", options: ["Social media & everyday shots", "Professional photography", "Video & content creation", "Low-light & night photography", "I rarely use the camera"] },
      { id: "usage", q: "How do you primarily use your phone?", options: ["Social media & browsing", "Gaming", "Work & productivity", "Photography & video", "Calls & messaging only"] },
      { id: "size", q: "What screen size do you prefer?", options: ["Compact (under 6\")", "Standard (6\"–6.5\")", "Large (6.5\"+)", "No preference"] },
      { id: "brand", q: "Any brand preferences or deal-breakers?", options: ["Open to anything", "Prefer Samsung", "Prefer Apple", "Prefer Google Pixel", "Prefer Chinese brands (Xiaomi, OnePlus)", "Avoid Chinese brands"] },
      { id: "trade_in", q: "What phone are you upgrading from?", options: ["iPhone (any)", "Samsung Galaxy", "Google Pixel", "Old Android (other brand)", "First smartphone", "Other"] },
      { id: "feature", q: "Which feature would be a game-changer for you?", options: ["Satellite connectivity", "Under-display fingerprint", "Foldable screen", "Stylus / S-Pen", "Best-in-class zoom", "Fastest charging"] },
    ],
  },
  car: {
    label: "Car", emoji: "🚗",
    image: img("photo-1494976388531-d1058494cdd8"),
    questions: [
      { id: "budget", q: "What's your budget?", options: ["Under €15,000", "€15,000–€25,000", "€25,000–€40,000", "€40,000–€70,000", "€70,000+"] },
      { id: "type", q: "What type of car do you need?", options: ["🏎️ Sports & Performance", "🚙 SUV / Crossover", "🚗 Sedan / Saloon", "🚐 Family MPV / Van", "🚙 Compact / City car", "⚡ Electric specifically"] },
      { id: "fuel", q: "What powertrain do you prefer?", options: ["⚡ Full electric (BEV)", "🔌 Plug-in hybrid (PHEV)", "⛽ Petrol", "🛢️ Diesel", "🔄 Hybrid (non-plug-in)", "Open to anything"] },
      { id: "usage", q: "How will you mainly use the car?", options: ["Daily city commute", "Long motorway trips", "Family duties & school runs", "Weekend leisure & road trips", "Mixed use"] },
      { id: "seats", q: "How many seats do you need?", options: ["2 seats", "4–5 seats", "6–7 seats", "8+ seats"] },
      { id: "priority", q: "What's your top priority?", options: ["💰 Lowest running costs", "🏆 Reliability & longevity", "🎯 Driving fun & handling", "🛡️ Safety ratings", "📱 Technology & connectivity", "🌿 Environmental impact"] },
      { id: "range", q: "If electric, what range do you need?", options: ["Under 300km (city only)", "300–450km", "450–600km", "600km+ (long-distance)", "Not considering electric"] },
      { id: "brand_pref", q: "Any brand preferences?", options: ["German (BMW, Audi, Mercedes, VW)", "Japanese (Toyota, Honda, Mazda)", "Korean (Hyundai, Kia)", "American (Tesla, Ford)", "French/Italian (Peugeot, Renault, Fiat)", "Open to anything"] },
      { id: "new_used", q: "New or used?", options: ["Brand new only", "Nearly new (under 2 years)", "Used (2–5 years)", "Any age — best value matters"] },
    ],
  },
  laptop: {
    label: "Laptop", emoji: "💻",
    image: img("photo-1496181133206-80ce9b88a853"),
    questions: [
      { id: "budget", q: "What's your budget?", options: ["Under $400", "$400–$700", "$700–$1,200", "$1,200–$2,000", "$2,000+"] },
      { id: "primary_use", q: "What will you mainly use it for?", options: ["🎮 Gaming", "💼 Work & productivity", "🎓 University / studying", "🎨 Creative work (video, design)", "💻 Software development", "📱 Basic browsing & streaming"] },
      { id: "os", q: "Which OS do you prefer?", options: ["🍎 macOS", "🪟 Windows", "🐧 Linux", "No preference — show me the best"] },
      { id: "portability", q: "How important is portability?", options: ["Critical — I carry it everywhere", "Important — occasional travel", "Moderate — mostly desk use", "Not important — desktop replacement"] },
      { id: "battery", q: "How long do you need the battery to last?", options: ["4–6 hours (near power always)", "6–8 hours", "8–12 hours", "12+ hours (all-day untethered)"] },
      { id: "display", q: "What display do you prioritize?", options: ["Colour accuracy (creative work)", "High refresh rate (gaming/smoothness)", "OLED for vivid colours", "Matte finish (no glare)", "Largest possible screen", "Compact & light matters more"] },
      { id: "performance", q: "What performance level do you need?", options: ["Basic (web, office, streaming)", "Mid-range (multitasking, light editing)", "High (4K video, 3D, heavy dev)", "Extreme (AI workloads, AAA gaming)"] },
      { id: "brand", q: "Any brand preferences?", options: ["Apple MacBook", "Dell / XPS", "Lenovo ThinkPad", "ASUS ROG / ZenBook", "HP / Spectre", "Open to anything"] },
      { id: "storage", q: "How much storage do you need?", options: ["256GB (light user)", "512GB (moderate)", "1TB (heavy user)", "2TB+ (professional)"] },
    ],
  },
  tv: {
    label: "TV", emoji: "📺",
    image: img("photo-1593784991095-a205069470b6"),
    questions: [
      { id: "budget", q: "What's your budget?", options: ["Under $300", "$300–$600", "$600–$1,200", "$1,200–$2,500", "$2,500+"] },
      { id: "size", q: "What screen size are you looking for?", options: ["Under 43\"", "43\"–50\"", "55\"", "65\"", "75\"", "85\"+"] },
      { id: "primary_use", q: "What will you mainly watch?", options: ["🎬 Movies & streaming", "🎮 Gaming (PS5/Xbox)", "⚽ Sports", "📺 Regular TV & news", "🎨 Mixed use"] },
      { id: "room", q: "What's the room like?", options: ["Very bright (lots of windows)", "Moderately lit", "Dark home cinema", "Bedroom (close viewing)"] },
      { id: "panel", q: "Do you have a panel type preference?", options: ["OLED (best blacks, contrast)", "QLED / Mini-LED (bright, vivid)", "Standard LED (budget-friendly)", "No preference — recommend me"] },
      { id: "gaming", q: "If gaming — what do you need?", options: ["120Hz+ refresh rate", "HDMI 2.1 ports", "VRR / G-Sync / FreeSync", "Low input lag only", "I don't game"] },
      { id: "smart_features", q: "What smart features matter?", options: ["Google TV", "Tizen (Samsung)", "webOS (LG)", "Apple AirPlay support", "Simple — I use external devices", "Alexa / Google Assistant"] },
      { id: "brand", q: "Any brand preference?", options: ["LG", "Samsung", "Sony", "Hisense (best value)", "TCL", "Open to anything"] },
      { id: "priority", q: "What's your absolute top priority?", options: ["🖤 Perfect black levels", "☀️ Brightness for daylight", "🎮 Gaming performance", "💰 Best value per inch", "🔊 Built-in sound quality", "🎨 Colour accuracy"] },
    ],
  },
  fitness: {
    label: "Fitness", emoji: "🏋️",
    image: img("photo-1517836357463-d25dfeac3438"),
    questions: [
      { id: "goal", q: "What's your primary fitness goal?", options: ["💪 Build muscle & strength", "🏃 Lose weight & cardio", "🧘 Flexibility & mindfulness", "🏊 Athletic performance", "❤️ General health & longevity", "🔄 Maintain current fitness"] },
      { id: "location", q: "Where do you plan to work out?", options: ["🏠 Home gym", "🏋️ Commercial gym", "🌳 Outdoors", "Mixed (home + gym)", "I travel frequently"] },
      { id: "budget", q: "What's your equipment budget?", options: ["Under $100", "$100–$500", "$500–$1,500", "$1,500–$5,000", "$5,000+"] },
      { id: "experience", q: "What's your fitness experience level?", options: ["Complete beginner", "Some experience (1–2 years)", "Intermediate (3–5 years)", "Advanced (5+ years)", "Former athlete"] },
      { id: "time", q: "How much time can you commit per week?", options: ["1–2 hours", "3–4 hours", "5–7 hours", "8–10 hours", "10+ hours"] },
      { id: "injuries", q: "Do you have any physical limitations?", options: ["No limitations", "Knee / lower body issues", "Back problems", "Shoulder / upper body issues", "Cardiovascular concerns", "Multiple issues — need low impact"] },
      { id: "equipment", q: "What equipment do you already own?", options: ["Nothing yet", "Basic dumbbells", "Resistance bands", "Barbell & weights", "Cardio machine (treadmill/bike)", "Full home gym setup"] },
      { id: "motivation", q: "What keeps you motivated?", options: ["Tracking progress & data", "Classes & community", "Competition & challenges", "Solo & self-directed", "Online coaching & apps", "Partner workouts"] },
      { id: "priority_feature", q: "Which matters most to you?", options: ["Fast visible results", "Long-term sustainability", "Minimum time investment", "Maximum calorie burn", "Building strength specifically", "Mental health & stress relief"] },
    ],
  },
  pet: {
    label: "Pet", emoji: "🐕",
    image: img("photo-1587300003388-59208cc962cb"),
    questions: [
      { id: "type", q: "What type of pet are you considering?", options: ["🐕 Dog", "🐱 Cat", "🐠 Fish / Aquatic", "🐦 Bird", "🐹 Small animal (hamster, rabbit)", "🦎 Reptile", "Surprise me"] },
      { id: "living", q: "What's your living situation?", options: ["Large house with garden", "House without garden", "Large apartment", "Small apartment / studio", "Shared housing"] },
      { id: "activity", q: "How active is your lifestyle?", options: ["Very active (daily sport, hiking)", "Moderately active (regular walks)", "Lightly active (occasional walks)", "Sedentary (mostly indoors)"] },
      { id: "time", q: "How much time can you give daily to a pet?", options: ["Less than 1 hour", "1–2 hours", "2–4 hours", "4+ hours", "I work from home — lots of time"] },
      { id: "allergies", q: "Any allergy concerns?", options: ["No allergies", "Mild — prefer hypoallergenic", "Severe — need hypoallergenic", "Unknown"] },
      { id: "experience", q: "What's your pet ownership experience?", options: ["First pet ever", "Had pets as a child", "Some adult experience", "Experienced owner", "Professional / breeder level"] },
      { id: "budget", q: "What's your monthly pet budget?", options: ["Under $50", "$50–$150", "$150–$300", "$300–$600", "$600+"] },
      { id: "family", q: "Who else is in your household?", options: ["Just me", "Partner / adult couple", "Family with young children (under 6)", "Family with older children", "Elderly family members", "Other pets already"] },
      { id: "priority", q: "What matters most to you in a pet?", options: ["Affectionate & cuddly", "Low maintenance", "Playful & energetic", "Intelligent & trainable", "Quiet & calm", "Unique & conversation-starting"] },
    ],
  },
  career: {
    label: "Career", emoji: "💼",
    image: img("photo-1454165804606-c3d57bc86b40"),
    questions: [
      { id: "situation", q: "What's your current career situation?", options: ["🎓 Recent graduate / entry level", "💼 Mid-career looking for change", "🚀 Seeking promotion", "🌍 Want to relocate", "🆓 Want to go freelance", "📚 Want to upskill / retrain"] },
      { id: "industry", q: "What industry are you in or targeting?", options: ["Technology & Software", "Finance & Banking", "Healthcare & Medical", "Marketing & Creative", "Engineering & Manufacturing", "Education & Research", "Other / Undecided"] },
      { id: "salary_goal", q: "What's your salary target?", options: ["Under $40k", "$40k–$70k", "$70k–$100k", "$100k–$150k", "$150k–$250k", "$250k+"] },
      { id: "work_style", q: "What work style do you prefer?", options: ["Fully remote", "Hybrid (2–3 days office)", "Full office — I like the structure", "Flexible / freelance", "International travel required"] },
      { id: "priority", q: "What's your top career priority right now?", options: ["💰 Maximum salary", "🌱 Learning & growth", "⚖️ Work-life balance", "🎯 Job security", "🌍 Impact & purpose", "🏆 Prestige & recognition"] },
      { id: "skills", q: "What are your strongest skills?", options: ["Technical / coding / engineering", "Analytical / data / finance", "Communication / leadership", "Creative / design / writing", "Sales / business development", "Operations / project management"] },
      { id: "education", q: "What's your education level?", options: ["High school", "Some college", "Bachelor's degree", "Master's degree", "PhD / Doctorate", "Self-taught / bootcamp"] },
      { id: "timeline", q: "What's your timeline for making a change?", options: ["Immediately — urgent", "Within 3 months", "3–6 months", "6–12 months", "Exploring / no rush"] },
      { id: "obstacle", q: "What's your biggest career obstacle?", options: ["Lack of experience", "Wrong industry / field", "Salary negotiation", "Interview skills", "Network & connections", "Visa / immigration", "Confidence & imposter syndrome"] },
    ],
  },
  dining: {
    label: "Dining Out", emoji: "🍽️",
    image: img("photo-1414235077428-338989a2e8c0"),
    questions: [
      { id: "occasion", q: "What's the occasion?", options: ["💑 Romantic date night", "👨‍👩‍👧 Family dinner", "🎉 Birthday / celebration", "💼 Business lunch / dinner", "👫 Casual friends gathering", "🧘 Solo dining experience"] },
      { id: "cuisine", q: "What cuisine are you in the mood for?", options: ["🇮🇹 Italian / Mediterranean", "🇯🇵 Japanese / Sushi", "🥩 Steakhouse", "🌮 Mexican / Latin", "🍛 Indian / Asian", "🐟 Seafood", "Surprise me"] },
      { id: "budget", q: "What's your budget per person?", options: ["Under $20", "$20–$40", "$40–$75", "$75–$150", "$150+"] },
      { id: "atmosphere", q: "What atmosphere are you looking for?", options: ["Intimate & quiet", "Lively & buzzing", "Outdoor / terrace", "Rooftop", "Casual & relaxed", "Formal fine dining"] },
      { id: "dietary", q: "Any dietary requirements?", options: ["None", "Vegetarian", "Vegan", "Gluten-free", "Halal", "Kosher", "Multiple requirements"] },
      { id: "location_pref", q: "Location preference?", options: ["City centre / downtown", "Neighbourhood gem", "Waterfront / view", "Hotel restaurant", "No preference"] },
      { id: "group_size", q: "How many people?", options: ["Just 1–2", "3–4", "5–8", "9–15", "16+"] },
      { id: "booking", q: "Do you need a booking?", options: ["Yes — planning ahead", "Walk-in preferred", "Either is fine"] },
      { id: "priority", q: "What matters most?", options: ["🌟 Michelin stars / awards", "📸 Instagrammable food", "🍷 Wine list", "🎵 Ambiance & music", "⚡ Speed of service", "💰 Value for money"] },
    ],
  },

  realestate: {
    label: "Real Estate", emoji: "🏡",
    image: img("photo-1613977257363-707ba9348227"),
    questions: [
      { id: "intent", q: "What are you looking to do?", options: ["Buy a property", "Rent a property", "Invest in real estate", "Just exploring"] },
      { id: "type", q: "What type of property?", options: ["Apartment / flat", "House with garden", "Villa / luxury", "Studio", "Penthouse", "Townhouse"] },
      { id: "budget", q: "What's your budget?", options: ["Under €100k", "€100k–€250k", "€250k–€500k", "€500k–€1M", "€1M+"] },
      { id: "location", q: "Where are you looking?", options: ["City centre", "Suburbs", "Countryside / rural", "Coastal / seaside", "Abroad", "Flexible"] },
      { id: "bedrooms", q: "How many bedrooms do you need?", options: ["Studio / 1 bedroom", "2 bedrooms", "3 bedrooms", "4+ bedrooms"] },
      { id: "priority", q: "What matters most to you?", options: ["🏫 School / family area", "🚆 Transport links", "🌳 Green space & quiet", "💰 Investment potential", "🏖️ Lifestyle & amenities", "🏗️ New build only"] },
    ],
  },

  land: {
    label: "Land & Property", emoji: "🌍",
    image: img("photo-1500382017468-9049fed747ef"),
    questions: [
      { id: "purpose", q: "What do you plan to do with the land?", options: ["Build a home", "Agricultural / farming", "Investment / speculation", "Commercial development", "Holiday / leisure", "Not decided yet"] },
      { id: "size", q: "How much land do you need?", options: ["Under 500 m²", "500m²–2,000 m²", "2,000 m²–1 hectare", "1–10 hectares", "10+ hectares"] },
      { id: "budget", q: "What's your budget?", options: ["Under €50k", "€50k–€150k", "€150k–€400k", "€400k–€1M", "€1M+"] },
      { id: "location", q: "Preferred location?", options: ["Near a city", "Rural / countryside", "Coastal area", "Mountains", "Abroad", "No preference"] },
      { id: "utilities", q: "How important is utility access?", options: ["Essential — fully connected", "Preferred but not critical", "Off-grid is fine", "Not sure yet"] },
    ],
  },

  beauty: {
    label: "Beauty & Salons", emoji: "💅",
    image: img("photo-1560066984-138dadb4c035"),
    questions: [
      { id: "service", q: "What service are you looking for?", options: ["Hair salon", "Nail studio", "Spa & massage", "Skin & facial treatment", "Brow & lash", "Full beauty package"] },
      { id: "budget", q: "What's your budget?", options: ["Under €30", "€30–€60", "€60–€120", "€120+", "Depends on the service"] },
      { id: "occasion", q: "What's the occasion?", options: ["Regular maintenance", "Special event / wedding", "Pampering treat", "First time trying", "Gift for someone else"] },
      { id: "location", q: "How far are you willing to travel?", options: ["Walking distance", "Within 5 km", "Within 20 km", "Anywhere — quality first"] },
      { id: "priority", q: "What matters most?", options: ["⭐ Reviews & reputation", "💰 Best price", "📅 Easy booking & availability", "✨ Premium products used", "🌿 Natural / organic focus"] },
    ],
  },

  clinic: {
    label: "Clinics & Health", emoji: "🏥",
    image: img("photo-1666214280557-f1b5022eb634"),
    questions: [
      { id: "type", q: "What type of care are you looking for?", options: ["General practitioner / family doctor", "Specialist / consultant", "Dental", "Vision / ophthalmology", "Mental health", "Physiotherapy", "Cosmetic / aesthetic"] },
      { id: "urgency", q: "How urgent is your need?", options: ["Emergency — today", "Within a week", "Within a month", "Planning ahead / routine"] },
      { id: "insurance", q: "Do you have health insurance?", options: ["Yes — public", "Yes — private", "Both", "No — paying out of pocket"] },
      { id: "location", q: "Where are you located?", options: ["I want something nearby", "Happy to travel for quality", "Considering medical tourism", "Online / telehealth is fine"] },
      { id: "priority", q: "What's most important?", options: ["📋 Specialist expertise", "⏱️ Short waiting times", "💰 Cost & affordability", "🌐 Languages spoken", "🏢 Modern facilities"] },
    ],
  },

  insurance: {
    label: "Insurance", emoji: "🛡️",
    image: img("photo-1450101499163-c8848c66ca85"),
    questions: [
      { id: "type", q: "What type of insurance are you looking for?", options: ["Health insurance", "Car insurance", "Home / property", "Life insurance", "Travel insurance", "Business / liability"] },
      { id: "coverage", q: "What level of coverage do you need?", options: ["Basic / legal minimum", "Standard", "Comprehensive / premium", "Not sure — need advice"] },
      { id: "budget", q: "What's your monthly budget?", options: ["Under €30/month", "€30–€80/month", "€80–€200/month", "€200+/month", "Annual payment preferred"] },
      { id: "situation", q: "Tell us about your situation:", options: ["Single, no dependants", "Couple", "Family with children", "Self-employed / freelancer", "Company / team coverage"] },
      { id: "priority", q: "What matters most?", options: ["💰 Lowest premium", "🏆 Best coverage", "⚡ Fast claims process", "🌍 International coverage", "📞 24/7 support"] },
    ],
  },

  loans: {
    label: "Loans & Credit", emoji: "💳",
    image: img("photo-1565514020179-026b92b84bb6"),
    questions: [
      { id: "type", q: "What are you looking for?", options: ["Personal loan", "Car loan", "Mortgage / home loan", "Business loan", "Credit card", "Debt consolidation"] },
      { id: "amount", q: "How much do you need?", options: ["Under €5,000", "€5k–€20k", "€20k–€50k", "€50k–€150k", "€150k+"] },
      { id: "term", q: "Over what period?", options: ["Under 12 months", "1–3 years", "3–7 years", "7–15 years", "15–30 years"] },
      { id: "credit", q: "How would you describe your credit history?", options: ["Excellent", "Good", "Fair", "Limited / building credit", "Prefer not to say"] },
      { id: "priority", q: "What's your priority?", options: ["📉 Lowest interest rate", "⚡ Fast approval", "🔄 Flexible repayments", "💼 No early repayment fee", "🌐 Online process only"] },
    ],
  },

  perfume: {
    label: "Perfumes", emoji: "🌸",
    image: img("photo-1523293182086-7651a899d37f"),
    questions: [
      { id: "gender", q: "Who is this fragrance for?", options: ["For me — women's", "For me — men's", "Unisex / gender-neutral", "A gift for her", "A gift for him", "A gift — unisex"] },
      { id: "family", q: "What scent family do you prefer?", options: ["🌸 Floral", "🌿 Fresh / green", "🪵 Woody / earthy", "🍊 Citrus / fruity", "🌙 Oriental / spicy", "🌊 Aquatic / marine", "No idea — surprise me"] },
      { id: "occasion", q: "When will you wear it most?", options: ["Daily / everyday", "Office / work", "Evening & nights out", "Special occasions", "Summer", "Winter"] },
      { id: "budget", q: "What's your budget?", options: ["Under €30", "€30–€70", "€70–€150", "€150–€300", "€300+ (niche / luxury)"] },
      { id: "intensity", q: "How strong do you like your fragrance?", options: ["Light & subtle", "Moderate — noticeable", "Bold & long-lasting", "Very intense / statement"] },
    ],
  },

  cruise: {
    label: "Cruises", emoji: "🚢",
    image: img("photo-1544551763-46a013bb70d5"),
    questions: [
      { id: "destination", q: "Which destination interests you most?", options: ["🌊 Mediterranean", "🏝️ Caribbean", "🛳️ Northern Europe / fjords", "🌏 Asia & Far East", "🧊 Arctic / Antarctic", "🌎 World cruise", "Open to ideas"] },
      { id: "duration", q: "How long would you like to cruise?", options: ["Short break (3–5 nights)", "1 week", "2 weeks", "3–4 weeks", "Extended / world cruise"] },
      { id: "budget", q: "What's your budget per person?", options: ["Under €800", "€800–€1,500", "€1,500–€3,000", "€3,000–€6,000", "€6,000+ (luxury line)"] },
      { id: "style", q: "What cruise style suits you?", options: ["Family-friendly", "Adults-only / romantic", "Adventure & expedition", "Luxury & ultra-premium", "River cruise", "Party / entertainment"] },
      { id: "priority", q: "What matters most on board?", options: ["🍽️ Dining & restaurants", "🎭 Entertainment & shows", "🏊 Pool & wellness spa", "🛳️ Shore excursions", "🌅 Cabin & suites quality", "💰 Best value for money"] },
    ],
  },

  furniture: {
    label: "Furniture", emoji: "🛋️",
    image: img("photo-1555041469-a586c61ea9bc"),
    questions: [
      { id: "room", q: "Which room are you furnishing?", options: ["Living room", "Bedroom", "Home office", "Kitchen / dining", "Outdoor / garden", "Entire home"] },
      { id: "style", q: "What interior style do you prefer?", options: ["Scandinavian / minimal", "Industrial", "Modern / contemporary", "Classic / traditional", "Bohemian / eclectic", "Luxury / designer"] },
      { id: "budget", q: "What's your total budget?", options: ["Under €500", "€500–€1,500", "€1,500–€4,000", "€4,000–€10,000", "€10,000+"] },
      { id: "priority", q: "What's most important to you?", options: ["💪 Durability & quality", "💰 Best price", "📦 Fast delivery", "🌿 Sustainable materials", "🎨 Design & aesthetics", "🔧 Easy assembly"] },
      { id: "brand", q: "Do you have a brand preference?", options: ["IKEA / budget-friendly", "Mid-range brands", "Premium / designer only", "Handmade / artisan", "No preference"] },
    ],
  },

  restaurant: {
    label: "Restaurants", emoji: "🍴",
    image: img("photo-1517248135467-4c7edcad34c4"),
    questions: [
      { id: "type", q: "What kind of restaurant?", options: ["Fine dining", "Casual bistro", "Street food / fast casual", "Sushi / Japanese", "Steakhouse", "Pizza & pasta", "Vegan / vegetarian"] },
      { id: "occasion", q: "What's the occasion?", options: ["Date night", "Family outing", "Business dinner", "Birthday celebration", "Casual catch-up", "Solo meal"] },
      { id: "budget", q: "Budget per person (food only)?", options: ["Under €15", "€15–€35", "€35–€70", "€70–€120", "€120+"] },
      { id: "location", q: "Where are you?", options: ["City centre", "Neighbourhood", "Near the waterfront", "Hotel area", "Countryside", "No preference"] },
      { id: "must_have", q: "Any must-haves?", options: ["Outdoor terrace", "Private room available", "Child-friendly", "Great cocktail bar", "Live music", "Parking nearby", "None"] },
    ],
  },

  sports: {
    label: "Sports Activities", emoji: "🏄",
    image: img("photo-1530549387789-4c1017266635"),
    questions: [
      { id: "activity", q: "What activity are you interested in?", options: ["🏄 Surfing / water sports", "⛷️ Skiing / snowboarding", "🧗 Rock climbing", "🚵 Mountain biking", "🏇 Horse riding", "🤿 Scuba diving / snorkeling", "🪂 Skydiving / paragliding", "Other"] },
      { id: "level", q: "What's your experience level?", options: ["Complete beginner", "Some experience", "Intermediate", "Advanced / expert"] },
      { id: "duration", q: "How long is the activity?", options: ["A few hours", "Full day", "Weekend", "Week-long course / camp", "Multi-week programme"] },
      { id: "group", q: "Who's joining?", options: ["Solo", "Couple", "Friends group", "Family with kids", "Corporate / team event"] },
      { id: "budget", q: "What's your budget per person?", options: ["Under €50", "€50–€150", "€150–€400", "€400–€1,000", "€1,000+"] },
    ],
  },

  outdoor: {
    label: "Outdoor Adventures", emoji: "🧗",
    image: img("photo-1551632811-561732d1e306"),
    questions: [
      { id: "type", q: "What kind of adventure?", options: ["🥾 Hiking / trekking", "⛺ Camping", "🏕️ Glamping", "🚣 Kayaking / rafting", "🌋 Volcano / extreme terrain", "🦁 Safari", "🗻 Mountaineering"] },
      { id: "fitness", q: "How would you describe your fitness level?", options: ["Low — easy trails only", "Moderate", "Good — long days fine", "High — challenging terrain welcome"] },
      { id: "duration", q: "How long?", options: ["Day trip", "Weekend escape", "1 week", "2+ weeks"] },
      { id: "group", q: "Who's going?", options: ["Solo", "Couple", "Friends", "Family with children", "Guided group tour"] },
      { id: "budget", q: "What's your budget per person?", options: ["Under €100", "€100–€400", "€400–€1,000", "€1,000–€3,000", "€3,000+"] },
    ],
  },

  // ── New subcategory trees ──
  tablet:          { label:"Tablete",emoji:"📲",image:img("photo-1544244015-0df4b3ffc6b0"), questions:[
    {id:"use",q:"For what purpose?",options:["Work & productivity","Drawing & design","Kids & education","Entertainment","Universal"]},
    {id:"os",q:"Operating system?",options:["iPad (iOS)","Android","Windows","No preference"]},
    {id:"size",q:'Screen size?',options:["Under 9in","9-11in","12in+","No preference"]},
    {id:"budget",q:"Budget?",options:["Under €200","€200–€500","€500–€900","€900+"]},
  ]},
  smartwatch:      { label:"Smartwatch-uri",emoji:"⌚",image:img("photo-1523275335684-37898b6baf30"), questions:[
    {id:"use",q:"Primary use?",options:["Fitness tracking","Notifications & calls","Sleep monitoring","Style & everyday"]},
    {id:"os",q:"Phone compatibility?",options:["iPhone (iOS)","Android","No preference"]},
    {id:"battery",q:"Battery life priority?",options:["1-2 days (full features)","3-5 days","7+ days"]},
    {id:"budget",q:"Budget?",options:["Under €100","€100–€250","€250–€500","€500+"]},
  ]},
  headphones:      { label:"Căști audio",emoji:"🎧",image:img("photo-1505740420928-5e560c06d30e"), questions:[
    {id:"type",q:"Type?",options:["Over-ear","In-ear (earbuds)","On-ear","No preference"]},
    {id:"use",q:"Primary use?",options:["Music listening","Gaming","Work calls","Sport & gym","Travel"]},
    {id:"features",q:"Must-have feature?",options:["Active noise cancellation","Wireless / Bluetooth","Hi-Res audio","Long battery","Microphone quality"]},
    {id:"budget",q:"Budget?",options:["Under €50","€50–€150","€150–€350","€350+"]},
  ]},
  gaming:          { label:"Console gaming",emoji:"🎮",image:img("photo-1542751371-adc38448a05e"), questions:[
    {id:"type",q:"Console type?",options:["Home console","Handheld / portable","PC gaming","Not sure"]},
    {id:"games",q:"Favorite game genre?",options:["Action & adventure","Sports","RPG","Shooter","Family & party","All genres"]},
    {id:"friends",q:"Play with friends?",options:["Online multiplayer","Local co-op","Mainly solo","Mixed"]},
    {id:"budget",q:"Budget?",options:["Under €200","€200–€350","€350–€600","€600+ (high-end PC)"]},
  ]},
  monitor:         { label:"Monitoare",emoji:"🖥️",image:img("photo-1527443224154-c4a3942d3acf"), questions:[
    {id:"use",q:"Primary use?",options:["Office & productivity","Gaming","Design & photo editing","Programming","Universal"]},
    {id:"size",q:"Screen size?",options:["24in","27in","32in","34in+ ultrawide"]},
    {id:"resolution",q:"Resolution?",options:["Full HD (1080p)","QHD (1440p)","4K UHD","No preference"]},
    {id:"budget",q:"Budget?",options:["Under €200","€200–€400","€400–€800","€800+"]},
  ]},
  printer:         { label:"Imprimante",emoji:"🖨️",image:img("photo-1612815154858-60aa4c59eaa6"), questions:[
    {id:"type",q:"Printer type?",options:["Inkjet (color & photos)","Laser (fast B&W)","All-in-one","Label printer"]},
    {id:"use",q:"How often?",options:["Daily","A few times a week","Occasionally","Rarely"]},
    {id:"color",q:"Need color printing?",options:["Yes, often","Mostly black & white","Both equally"]},
    {id:"budget",q:"Budget?",options:["Under €80","€80–€200","€200–€500","€500+"]},
  ]},
  fridge:          { label:"Frigidere",emoji:"❄️",image:img("photo-1571175443880-49e1d25b2bc5"), questions:[
    {id:"type",q:"Type?",options:["Combined fridge-freezer","Side-by-side","American style","Fridge only","Mini fridge"]},
    {id:"space",q:"Available space (width)?",options:["Under 60 cm","60-70 cm","70 cm+","No constraint"]},
    {id:"capacity",q:"Household size?",options:["1-2 people","3-4 people","5+ people"]},
    {id:"budget",q:"Budget?",options:["Under €400","€400–€800","€800–€1,500","€1,500+"]},
  ]},
  washing_machine: { label:"Mașini de spălat",emoji:"🌊",image:img("photo-1626806787461-102c1bfaaea1"), questions:[
    {id:"type",q:"Front or top loader?",options:["Front loader","Top loader","Washer-dryer combo","No preference"]},
    {id:"capacity",q:"Drum capacity?",options:["6 kg","7-8 kg","9-10 kg","11+ kg"]},
    {id:"energy",q:"Energy class priority?",options:["A+++ (most efficient)","A++ (good balance)","Price more important"]},
    {id:"budget",q:"Budget?",options:["Under €350","€350–€600","€600–€1,000","€1,000+"]},
  ]},
  dryer:           { label:"Uscătoare",emoji:"🌀",image:img("photo-1604335398989-7d4c0748dcc8"), questions:[
    {id:"type",q:"Type?",options:["Condenser dryer","Heat pump dryer","Vented dryer","Washer-dryer combo"]},
    {id:"capacity",q:"Capacity?",options:["6-7 kg","8-9 kg","10+ kg"]},
    {id:"energy",q:"Energy efficiency?",options:["Top priority (A++)","Good but not critical","Price first"]},
    {id:"budget",q:"Budget?",options:["Under €350","€350–€650","€650–€1,200","€1,200+"]},
  ]},
  vacuum:          { label:"Aspiratoare",emoji:"🌪️",image:img("photo-1558618047-3c8c76ca7d13"), questions:[
    {id:"type",q:"Type?",options:["Robot vacuum","Cordless stick","Traditional bagged","Wet & dry"]},
    {id:"floors",q:"Floor type?",options:["Mostly carpet","Mostly hard floors","Mixed"]},
    {id:"pets",q:"Have pets?",options:["Yes - pet hair is an issue","No"]},
    {id:"budget",q:"Budget?",options:["Under €100","€100–€300","€300–€600","€600+ (premium robot)"]},
  ]},
  espresso:        { label:"Espressoare",emoji:"☕",image:img("photo-1495474472287-4d71bcdd2085"), questions:[
    {id:"type",q:"Type?",options:["Bean-to-cup (fully automatic)","Manual espresso machine","Pod / capsule (Nespresso)","Filter coffee maker"]},
    {id:"drinks",q:"Favorite drinks?",options:["Espresso & americano","Cappuccino & latte","Both equally","Just filter coffee"]},
    {id:"ease",q:"Ease of use?",options:["Very important - fully automatic","I enjoy the ritual","Balanced"]},
    {id:"budget",q:"Budget?",options:["Under €100","€100–€300","€300–€700","€700+"]},
  ]},
  oven:            { label:"Cuptoare și plite",emoji:"🔥",image:img("photo-1556909114-f6e7ad7d3136"), questions:[
    {id:"type",q:"What are you looking for?",options:["Electric oven","Gas hob","Induction hob","Oven + hob combo","Built-in oven"]},
    {id:"capacity",q:"Oven capacity?",options:["Under 50 L","50-70 L","70 L+","Not applicable"]},
    {id:"features",q:"Must-have feature?",options:["Pyrolytic self-clean","Air fry function","Steam cooking","Multiple cooking zones"]},
    {id:"budget",q:"Budget?",options:["Under €300","€300–€600","€600–€1,200","€1,200+"]},
  ]},
  aircon:          { label:"Aer condiționat",emoji:"❄️",image:img("photo-1631049307264-da0ec9d70304"), questions:[
    {id:"type",q:"Type?",options:["Split unit (fixed)","Portable / mobile","Multi-split (multiple rooms)","Cassette (commercial)"]},
    {id:"room_size",q:"Room size?",options:["Under 15 m2","15-25 m2","25-40 m2","40 m2+"]},
    {id:"heating",q:"Need heating too?",options:["Yes - heating + cooling","Cooling only"]},
    {id:"budget",q:"Budget?",options:["Under €500","€500–€1,000","€1,000–€2,000","€2,000+"]},
  ]},
  new_car:         { label:"Mașini noi",emoji:"🚗",image:img("photo-1558618666-fcd25c85cd64"), questions:[
    {id:"type",q:"Body type?",options:["Sedan","SUV","Hatchback","Kombi / estate","Cabriolet","Van / MPV"]},
    {id:"fuel",q:"Fuel type?",options:["Petrol","Diesel","Hybrid","Full electric (EV)","Plug-in hybrid (PHEV)"]},
    {id:"use",q:"Primary use?",options:["City commuting","Long-distance / highway","Family & kids","Weekend & leisure"]},
    {id:"budget",q:"Budget?",options:["Under €20,000","€20,000–€35,000","€35,000–€60,000","€60,000+"]},
  ]},
  used_car:        { label:"Mașini second-hand",emoji:"🔑",image:img("photo-1494976388531-d1058494cdd8"), questions:[
    {id:"type",q:"Body type?",options:["Sedan","SUV","Hatchback","Kombi / estate"]},
    {id:"age",q:"Maximum age?",options:["Up to 3 years","3-7 years","7-12 years","Any age - low mileage is key"]},
    {id:"mileage",q:"Maximum mileage?",options:["Under 50,000 km","50,000-120,000 km","Over 120,000 km fine"]},
    {id:"budget",q:"Budget?",options:["Under €8,000","€8,000–€15,000","€15,000–€25,000","€25,000+"]},
  ]},
  tires:           { label:"Anvelope",emoji:"⚙️",image:img("photo-1558618047-3c8c76ca7d13"), questions:[
    {id:"season",q:"Season?",options:["Summer","Winter","All-season / All-weather"]},
    {id:"size",q:"Tire size?",options:["185/65 R15","195/65 R15","205/55 R16","225/45 R17","Other - I'll check"]},
    {id:"priority",q:"What matters most?",options:["Wet grip (safety)","Low noise","Fuel efficiency","Long mileage","Best value"]},
    {id:"budget",q:"Budget per tire?",options:["Under €60","€60–€100","€100–€150","€150+ (premium)"]},
  ]},
  car_insurance:   { label:"Asigurări auto",emoji:"🛡️",image:img("photo-1450101499163-c8848c66ca85"), questions:[
    {id:"type",q:"Coverage type?",options:["RCA (liability only)","Casco partial","Casco full","Not sure - need advice"]},
    {id:"car_age",q:"Car age?",options:["Under 3 years","3-8 years","Over 8 years"]},
    {id:"drivers",q:"Number of drivers?",options:["1 driver","2 drivers","3+ / young driver"]},
    {id:"priority",q:"Top priority?",options:["Lowest price","Best coverage","Fast claims process","Roadside assistance"]},
  ]},
  ev_charger:      { label:"Stații încărcare EV",emoji:"⚡",image:img("photo-1593941707882-a56ae58a2cf1"), questions:[
    {id:"location",q:"Where will you charge?",options:["Home (single-phase)","Home (three-phase)","Office / commercial","Public network subscription"]},
    {id:"power",q:"Charging speed needed?",options:["3.7 kW (slow, overnight)","7.4 kW (standard)","11 kW (fast)","22 kW or DC fast"]},
    {id:"car",q:"EV brand?",options:["Tesla","Renault / Dacia","Volkswagen Group","BMW / Mercedes","Other"]},
    {id:"budget",q:"Budget?",options:["Under €500","€500–€1,000","€1,000–€2,000","€2,000+ (commercial)"]},
  ]},
  car_service:     { label:"Service-uri auto",emoji:"🔧",image:img("photo-1619767886558-efdc259cde1a"), questions:[
    {id:"service",q:"Service needed?",options:["Routine maintenance","Tires / alignment","Bodywork & paint","Electrical / diagnostic","Tuning"]},
    {id:"car",q:"Car brand?",options:["European (VW, BMW, Mercedes)","Asian (Toyota, Honda)","American","French (Renault, Peugeot)"]},
    {id:"priority",q:"Priority?",options:["Price","Authorized dealer quality","Speed of service","Warranty on repairs"]},
    {id:"location",q:"Distance willing to travel?",options:["Within 5 km","Within 20 km","Quality first - anywhere"]},
  ]},
  personal_loan:   { label:"Credite personale",emoji:"💵",image:img("photo-1565514020179-026b92b84bb6"), questions:[
    {id:"amount",q:"Amount needed?",options:["Under €5,000","€5,000–€20,000","€20,000–€50,000","€50,000+"]},
    {id:"term",q:"Repayment term?",options:["Under 1 year","1-3 years","3-7 years","7+ years"]},
    {id:"credit",q:"Credit history?",options:["Excellent","Good","Fair","Building credit"]},
    {id:"priority",q:"Priority?",options:["Lowest interest rate","Fast approval","Flexible repayment","No early repayment fee"]},
  ]},
  mortgage:        { label:"Credite ipotecare",emoji:"🏦",image:img("photo-1580587771525-78b9dba3b914"), questions:[
    {id:"purpose",q:"Purpose?",options:["Buy first home","Buy second home","Refinance existing mortgage","Investment property"]},
    {id:"amount",q:"Loan amount?",options:["Under €100,000","€100,000–€250,000","€250,000–€500,000","€500,000+"]},
    {id:"term",q:"Loan term?",options:["10-15 years","15-25 years","25-30 years"]},
    {id:"rate",q:"Interest rate type?",options:["Fixed (predictable)","Variable (potentially lower)","Mixed","Need advice"]},
  ]},
  credit_card:     { label:"Carduri de credit",emoji:"💳",image:img("photo-1556742049-0cfed4f6a45d"), questions:[
    {id:"use",q:"Main use?",options:["Everyday purchases","Travel & miles","Cashback","Balance transfer","Business expenses"]},
    {id:"travel",q:"Travel often?",options:["Frequently (monthly)","Occasionally","Rarely"]},
    {id:"fee",q:"Annual fee?",options:["No fee preferred","Up to €50/year","€50-€150/year (for good perks)"]},
    {id:"priority",q:"Priority?",options:["Rewards & cashback","0% interest period","Travel insurance included","Low foreign transaction fees"]},
  ]},
  bank_account:    { label:"Conturi bancare",emoji:"🏛️",image:img("photo-1601597111158-2fceff292cdc"), questions:[
    {id:"type",q:"Account type?",options:["Current account (everyday)","Savings account","Business account","Youth account"]},
    {id:"digital",q:"Digital vs traditional?",options:["100% digital bank (Revolut, N26)","Traditional bank with online access","No preference"]},
    {id:"fees",q:"Monthly fee?",options:["Free account only","Up to €5/month","€5-€15/month for premium perks"]},
    {id:"priority",q:"Priority feature?",options:["High interest on savings","No foreign exchange fees","Overdraft facility","Investment features"]},
  ]},
  deposit:         { label:"Depozite",emoji:"📈",image:img("photo-1611974789855-9c2a0a7236a3"), questions:[
    {id:"amount",q:"Amount to deposit?",options:["Under €5,000","€5,000–€20,000","€20,000–€100,000","€100,000+"]},
    {id:"term",q:"Term?",options:["3 months","6 months","12 months","24+ months","Flexible withdrawal"]},
    {id:"institution",q:"Institution type?",options:["Traditional bank","Online bank (higher rates)","Credit union","No preference"]},
    {id:"priority",q:"Priority?",options:["Highest interest rate","Safety & deposit guarantee","Flexibility to withdraw","Automatic rollover"]},
  ]},
  mobile_plan:     { label:"Abonamente mobile",emoji:"📱",image:img("photo-1511707171634-5f897ff02aa9"), questions:[
    {id:"data",q:"Monthly data needed?",options:["Under 5 GB","5-15 GB","15-30 GB","Unlimited"]},
    {id:"calls",q:"Calls & SMS?",options:["Unlimited calls & SMS","Limited - I mainly use apps","International calls important"]},
    {id:"contract",q:"Contract type?",options:["12-month contract","24-month contract","SIM-only / monthly","Flex - no commitment"]},
    {id:"priority",q:"Priority?",options:["Lowest price","Best network coverage","International roaming","5G access"]},
  ]},
  prepaid:         { label:"Cartele preplătite",emoji:"📲",image:img("photo-1601784551446-20c9e07cdbdb"), questions:[
    {id:"use",q:"Primary use?",options:["Calls & SMS only","Data for social media","Data + calls","Travel SIM"]},
    {id:"data",q:"Data needed?",options:["Under 1 GB","1-5 GB","5-15 GB","Unlimited"]},
    {id:"country",q:"Where will you use it?",options:["Domestic only","EU roaming included","International travel","Multiple countries"]},
    {id:"budget",q:"Monthly top-up budget?",options:["Under €5","€5-€15","€15-€30","€30+"]},
  ]},
  internet:        { label:"Internet fix",emoji:"🌐",image:img("photo-1558618047-3c8c76ca7d13"), questions:[
    {id:"speed",q:"Speed needed?",options:["Basic (50-100 Mbps)","Standard (100-300 Mbps)","Fast (300-600 Mbps)","Gigabit (1 Gbps+)"]},
    {id:"tech",q:"Technology preference?",options:["Fiber optic (fastest)","Cable","DSL","No preference - best value"]},
    {id:"bundle",q:"Want a bundle?",options:["Internet only","Internet + TV","Internet + TV + phone","Internet + mobile"]},
    {id:"contract",q:"Contract?",options:["Monthly / no commitment","12 months","24 months"]},
  ]},
  tv_package:      { label:"Pachete TV",emoji:"📺",image:img("photo-1593784991095-a205069470b6"), questions:[
    {id:"channels",q:"Channel needs?",options:["Basic (news & free-to-air)","Sports channels","Movies & series (premium)","International channels"]},
    {id:"tech",q:"Delivery type?",options:["Satellite (DTH)","Cable TV","IPTV / streaming box","Android TV / smart decoder"]},
    {id:"hd",q:"4K / HD channels?",options:["Essential","Nice to have","Not important"]},
    {id:"budget",q:"Monthly budget?",options:["Under €15","€15-€30","€30-€50","€50+"]},
  ]},
  electricity:     { label:"Energie electrică",emoji:"💡",image:img("photo-1473341304170-971dccb5ac1e"), questions:[
    {id:"type",q:"Contract type?",options:["Fixed price (predictable bills)","Variable (market price)","Green / renewable energy","Smart / dynamic pricing"]},
    {id:"consumption",q:"Monthly consumption?",options:["Under 100 kWh","100-250 kWh","250-500 kWh","500+ kWh"]},
    {id:"solar",q:"Do you have solar panels?",options:["Yes - want smart integration","No","Planning to install"]},
    {id:"priority",q:"Priority?",options:["Lowest price","100% renewable","Smart meter & app","Easy switching"]},
  ]},
  gas_provider:    { label:"Furnizori gaze",emoji:"🔥",image:img("photo-1611974789855-9c2a0a7236a3"), questions:[
    {id:"use",q:"Primary use?",options:["Heating only","Cooking only","Heating + cooking","Commercial / business"]},
    {id:"contract",q:"Contract type?",options:["Fixed price","Variable price","No preference"]},
    {id:"consumption",q:"Annual consumption (approx)?",options:["Under 5,000 kWh","5,000-15,000 kWh","15,000-30,000 kWh","30,000+ kWh"]},
    {id:"priority",q:"Priority?",options:["Lowest price","Contract flexibility","Green gas (biomethane)","Bundle with electricity"]},
  ]},
  solar:           { label:"Panouri solare",emoji:"☀️",image:img("photo-1509391366360-2e959784a276"), questions:[
    {id:"goal",q:"Main goal?",options:["Reduce electricity bills","Full energy independence","Sell surplus energy","Charge EV with solar"]},
    {id:"roof",q:"Roof type?",options:["Sloped tile","Flat roof","Flat + pitched","Ground-mounted / field"]},
    {id:"power",q:"System size needed?",options:["3-5 kWp (small home)","5-10 kWp (medium)","10-20 kWp (large)","20+ kWp (commercial)"]},
    {id:"budget",q:"Budget?",options:["Under €5,000","€5,000-€12,000","€12,000-€25,000","€25,000+"]},
  ]},
  battery_storage: { label:"Baterii de stocare",emoji:"🔋",image:img("photo-1593941707882-a56ae58a2cf1"), questions:[
    {id:"purpose",q:"Why add battery storage?",options:["Store solar energy","Backup power (outages)","Reduce peak-hour costs","Go off-grid"]},
    {id:"capacity",q:"Capacity needed?",options:["5-10 kWh (small home)","10-20 kWh (medium)","20+ kWh (large / off-grid)"]},
    {id:"solar",q:"Do you have solar panels?",options:["Yes, existing system","Installing together with battery","No - battery only"]},
    {id:"budget",q:"Budget?",options:["Under €5,000","€5,000-€10,000","€10,000-€20,000","€20,000+"]},
  ]},
  hotel:           { label:"Hoteluri",emoji:"🏨",image:img("photo-1566073771259-6a8506099945"), questions:[
    {id:"stars",q:"Star rating?",options:["2-3 stars (budget)","3-4 stars (standard)","4-5 stars (premium)","5 stars / luxury"]},
    {id:"location",q:"Location priority?",options:["City centre","Near the beach","Near airport","Quiet / countryside"]},
    {id:"nights",q:"Number of nights?",options:["1-2","3-5","6-10","10+"]},
    {id:"priority",q:"Priority?",options:["Best price","Breakfast included","Pool & spa","Cancellation flexibility"]},
  ]},
  airline:         { label:"Companii aeriene",emoji:"✈️",image:img("photo-1436491865332-7a61a109cc05"), questions:[
    {id:"class",q:"Cabin class?",options:["Economy","Premium economy","Business","First class"]},
    {id:"journey",q:"Journey type?",options:["Short-haul (under 3h)","Medium-haul (3-6h)","Long-haul (6h+)","Ultra long-haul (10h+)"]},
    {id:"luggage",q:"Luggage needs?",options:["Cabin bag only","1 checked bag","2+ checked bags","Extra luggage fine - price matters"]},
    {id:"priority",q:"Priority?",options:["Lowest price","Seat comfort","Punctuality record","Loyalty program miles"]},
  ]},
  travel_agency:   { label:"Agenții de turism",emoji:"🌍",image:img("photo-1488085061387-422e29b40080"), questions:[
    {id:"type",q:"Trip type?",options:["All-inclusive package","City break","Cruise","Adventure / trekking","Custom / tailor-made"]},
    {id:"destination",q:"Destination region?",options:["Mediterranean","Caribbean / Tropical","Asia","Americas","Europe / cultural"]},
    {id:"group",q:"Group?",options:["Solo traveller","Couple","Family with children","Group of friends"]},
    {id:"budget",q:"Budget per person?",options:["Under €500","€500-€1,500","€1,500-€3,000","€3,000+"]},
  ]},
  car_rental:      { label:"Închirieri auto",emoji:"🚙",image:img("photo-1494976388531-d1058494cdd8"), questions:[
    {id:"category",q:"Car category?",options:["Economy / city car","Compact / hatchback","SUV / 4x4","Minivan / 7-seater","Luxury"]},
    {id:"duration",q:"Rental duration?",options:["1-3 days","4-7 days","1-2 weeks","1 month+"]},
    {id:"driver_age",q:"Driver age?",options:["21-25 (young driver)","26-70","70+ (senior)"]},
    {id:"priority",q:"Priority?",options:["Lowest price","Full insurance included","Free cancellation","Unlimited mileage"]},
  ]},
  vpn:             { label:"VPN-uri",emoji:"🔒",image:img("photo-1558618047-3c8c76ca7d13"), questions:[
    {id:"use",q:"Primary use?",options:["Privacy & anonymity","Streaming geo-blocked content","Secure remote work","Torrenting","All of the above"]},
    {id:"devices",q:"Devices to cover?",options:["1 device","2-5 devices","6-10 devices","Unlimited / router-level"]},
    {id:"speed",q:"Speed priority?",options:["Very important (streaming / gaming)","Important","Moderate - security first"]},
    {id:"budget",q:"Budget?",options:["Free (limited)","Under €3/month","€3-€7/month","€7+/month (premium)"]},
  ]},
  hosting:         { label:"Hosting web",emoji:"☁️",image:img("photo-1558618047-3c8c76ca7d13"), questions:[
    {id:"type",q:"Hosting type?",options:["Shared hosting (basic sites)","VPS (more control)","Dedicated server","Cloud hosting (scalable)"]},
    {id:"site",q:"Type of site?",options:["Blog / portfolio","E-commerce","Business / corporate","High-traffic / SaaS"]},
    {id:"traffic",q:"Expected monthly visitors?",options:["Under 1,000","1,000-10,000","10,000-100,000","100,000+"]},
    {id:"budget",q:"Monthly budget?",options:["Under €5","€5-€20","€20-€100","€100+"]},
  ]},
  crm:             { label:"CRM-uri",emoji:"📊",image:img("photo-1454165804606-c3d57bc86b40"), questions:[
    {id:"team_size",q:"Team size?",options:["Solo / freelancer","2-10","11-50","50+"]},
    {id:"industry",q:"Industry?",options:["Sales & B2B","E-commerce","Real estate","Agencies / services","Healthcare"]},
    {id:"must_have",q:"Must-have features?",options:["Email integration","Pipeline / deal tracking","Automation","Reporting & analytics","Mobile app"]},
    {id:"budget",q:"Budget per user/month?",options:["Free tier","Under €15","€15-€50","€50+"]},
  ]},
  email_marketing: { label:"Email marketing",emoji:"📧",image:img("photo-1563986768609-322da13575f3"), questions:[
    {id:"list_size",q:"Email list size?",options:["Under 500","500-5,000","5,000-50,000","50,000+"]},
    {id:"frequency",q:"Send frequency?",options:["Daily","2-3 per week","Weekly","Monthly"]},
    {id:"automation",q:"Need automation?",options:["Advanced automation (drips, sequences)","Basic autoresponders","Manual sends only"]},
    {id:"budget",q:"Monthly budget?",options:["Free","Under €30","€30-€100","€100+"]},
  ]},
  ai_solutions:    { label:"Soluții AI",emoji:"🤖",image:img("photo-1677442136019-21780ecad995"), questions:[
    {id:"use_case",q:"Main use case?",options:["Content writing","Customer service chatbot","Data analysis","Image / video generation","Coding assistant"]},
    {id:"team",q:"Team size?",options:["Individual","Small team (2-10)","Medium business","Enterprise"]},
    {id:"integration",q:"Integration needed?",options:["Standalone tool","API integration","Custom AI model"]},
    {id:"budget",q:"Monthly budget?",options:["Free / pay-as-you-go","Under €50","€50-€300","€300+"]},
  ]},
  antivirus:       { label:"Antiviruși",emoji:"🛡️",image:img("photo-1614064641938-3bbee52942c7"), questions:[
    {id:"platform",q:"Platform?",options:["Windows PC","Mac","Android","iOS","Multiple / cross-platform"]},
    {id:"devices",q:"Devices?",options:["1 device","2-3 devices","5+ devices","Family plan (all devices)"]},
    {id:"features",q:"Priority features?",options:["Real-time antivirus","VPN included","Parental controls","Password manager","Identity protection"]},
    {id:"budget",q:"Budget?",options:["Free","Under €30/year","€30-€70/year","€70+/year"]},
  ]},
  mattress:        { label:"Saltele",emoji:"😴",image:img("photo-1631049307264-da0ec9d70304"), questions:[
    {id:"type",q:"Mattress type?",options:["Memory foam","Pocket springs","Hybrid (foam + springs)","Latex","No preference"]},
    {id:"firmness",q:"Firmness preference?",options:["Soft","Medium","Firm","Don't know - need advice"]},
    {id:"size",q:"Bed size?",options:["Single (90x200)","Double (140x200)","Queen (160x200)","King (180x200)","Super King"]},
    {id:"budget",q:"Budget?",options:["Under €200","€200-€500","€500-€1,200","€1,200+"]},
  ]},
  power_tools:     { label:"Unelte electrice",emoji:"🔨",image:img("photo-1504148455328-c376907d081c"), questions:[
    {id:"tool_type",q:"What tool?",options:["Drill / driver","Circular saw","Angle grinder","Jigsaw","Sander","Multi-tool kit"]},
    {id:"use",q:"Frequency of use?",options:["Occasional DIY","Regular weekend projects","Professional / daily use"]},
    {id:"battery",q:"Power source?",options:["Battery (cordless)","Mains plug (more power)","No preference"]},
    {id:"budget",q:"Budget?",options:["Under €80","€80-€200","€200-€500","€500+"]},
  ]},
  gym:             { label:"Săli de fitness",emoji:"🏋️",image:img("photo-1517836357463-d25dfeac3438"), questions:[
    {id:"goal",q:"Fitness goal?",options:["Lose weight","Build muscle","Improve endurance","General wellbeing","Specific sport training"]},
    {id:"frequency",q:"How often?",options:["1-2 times/week","3-4 times/week","5+ times/week"]},
    {id:"facilities",q:"Must-have facilities?",options:["Weight room","Cardio equipment","Swimming pool","Group classes","Personal trainers"]},
    {id:"budget",q:"Monthly budget?",options:["Under €20","€20-€50","€50-€100","€100+ (premium)"]},
  ]},
  fitness_watch:   { label:"Ceasuri fitness",emoji:"⌚",image:img("photo-1523275335684-37898b6baf30"), questions:[
    {id:"sport",q:"Main sport?",options:["Running","Cycling","Swimming","Gym / strength","Hiking","Multi-sport"]},
    {id:"metrics",q:"Key metrics?",options:["Heart rate","GPS tracking","Sleep analysis","VO2 max","Stress monitoring"]},
    {id:"battery",q:"Battery life?",options:["1-3 days (full smart features)","5-7 days","14+ days","1 month+ (basic tracker)"]},
    {id:"budget",q:"Budget?",options:["Under €50","€50-€150","€150-€300","€300+"]},
  ]},
  supplements:     { label:"Suplimente",emoji:"💊",image:img("photo-1584308666744-24d5c474f2ae"), questions:[
    {id:"goal",q:"Goal?",options:["Build muscle (protein, creatine)","Lose weight (fat burners)","Energy & focus","Recovery & joints","General health & immunity"]},
    {id:"diet",q:"Dietary preferences?",options:["Omnivore","Vegetarian","Vegan","Gluten-free"]},
    {id:"form",q:"Preferred form?",options:["Powder (shakes)","Capsules / tablets","Gummies","RTD (ready to drink)","No preference"]},
    {id:"budget",q:"Monthly budget?",options:["Under €30","€30-€70","€70-€150","€150+"]},
  ]},
  online_courses:  { label:"Cursuri online",emoji:"💻",image:img("photo-1501504905252-473c47e087f8"), questions:[
    {id:"subject",q:"Subject area?",options:["Technology & programming","Business & marketing","Design & creativity","Languages","Personal development","Academic"]},
    {id:"level",q:"Level?",options:["Beginner","Intermediate","Advanced / professional certification"]},
    {id:"format",q:"Learning format?",options:["Video lessons (self-paced)","Live classes (scheduled)","Project-based","Mixed"]},
    {id:"budget",q:"Budget?",options:["Free courses only","Under €20/month","€20-€50/month","€50+/month or one-time purchase"]},
  ]},
  university:      { label:"Universități",emoji:"🎓",image:img("photo-1562774053-701939374585"), questions:[
    {id:"program",q:"Degree type?",options:["Bachelor's","Master's","PhD","MBA","Short professional program"]},
    {id:"field",q:"Field of study?",options:["Engineering & tech","Business & economics","Medicine & health","Arts & humanities","Law","Sciences"]},
    {id:"location",q:"Study location?",options:["Local (same city)","National (another city)","Abroad (Europe)","Abroad (USA/UK/Australia)"]},
    {id:"priority",q:"Priority?",options:["University ranking","Cost & scholarships","Course content","Career prospects"]},
  ]},
  private_school:  { label:"Școli private",emoji:"🏫",image:img("photo-1580582932707-520aed937b7b"), questions:[
    {id:"level",q:"School level?",options:["Primary (ages 6-12)","Middle school (11-14)","High school / lyceum","International baccalaureate"]},
    {id:"curriculum",q:"Curriculum?",options:["National","Cambridge / British","International (IB)","American","Bilingual / immersion"]},
    {id:"facilities",q:"Priority?",options:["Academic results","Sports & activities","Language programs","Small class sizes","Special needs support"]},
    {id:"budget",q:"Annual tuition?",options:["Under €3,000","€3,000-€8,000","€8,000-€15,000","€15,000+"]},
  ]},
  online_store:    { label:"Magazine online",emoji:"🛍️",image:img("photo-1526170375885-4d8ecf77b99f"), questions:[
    {id:"category",q:"Shopping category?",options:["Fashion & clothing","Electronics","Home & furniture","Health & beauty","Books & media","Food & groceries"]},
    {id:"priority",q:"Priority?",options:["Lowest price","Fast delivery","Easy returns","Trustworthy seller","Loyalty / cashback program"]},
    {id:"delivery",q:"Delivery preference?",options:["Next day","2-3 days","No preference - price first"]},
    {id:"market",q:"Marketplace or specialist?",options:["Large marketplace (Amazon, eMag)","Specialist shop","Both - compare"]},
  ]},
  delivery:        { label:"Servicii de livrare",emoji:"📦",image:img("photo-1566576912321-d58ddd7a6088"), questions:[
    {id:"type",q:"Service type?",options:["Parcel delivery (personal)","Business shipping","Same-day / express","International freight"]},
    {id:"volume",q:"Monthly shipment volume?",options:["1-5 parcels","5-30 parcels","30-200 parcels","200+ parcels"]},
    {id:"size",q:"Typical parcel size?",options:["Small (under 2 kg)","Medium (2-10 kg)","Large (10-30 kg)","Pallet / heavy freight"]},
    {id:"priority",q:"Priority?",options:["Lowest price","Speed (next day)","Tracking & reliability","International coverage"]},
  ]},
};

const CAT_I18N = {
  en: {
    tech: 'Technology',
    appliances: 'Appliances',
    auto: 'Cars',
    financial: 'Financial',
    telecom: 'Telecom',
    energy: 'Energy & Utilities',
    tourism: 'Tourism',
    software: 'Software & Online',
    home: 'Home & Garden',
    health: 'Health & Fitness',
    education: 'Education',
    ecommerce: 'E-commerce',
    phone: 'Smartphones',
    laptop: 'Laptops',
    tablet: 'Tablets',
    smartwatch: 'Smartwatches',
    headphones: 'Headphones',
    tv: 'Televisions',
    gaming: 'Gaming Consoles',
    monitor: 'Monitors',
    printer: 'Printers',
    fridge: 'Refrigerators',
    washing_machine: 'Washing Machines',
    dryer: 'Dryers',
    vacuum: 'Vacuum Cleaners',
    espresso: 'Coffee Machines',
    oven: 'Ovens & Hobs',
    aircon: 'Air Conditioning',
    new_car: 'New Cars',
    used_car: 'Used Cars',
    tires: 'Tires',
    car_insurance: 'Car Insurance',
    ev_charger: 'EV Chargers',
    car_service: 'Car Service',
    personal_loan: 'Personal Loans',
    mortgage: 'Mortgages',
    credit_card: 'Credit Cards',
    bank_account: 'Bank Accounts',
    deposit: 'Savings Deposits',
    broker: 'Investment Brokers',
    insurance: 'Insurance',
    mobile_plan: 'Mobile Plans',
    prepaid: 'Prepaid SIM',
    internet: 'Fixed Internet',
    tv_package: 'TV Packages',
    phone_provider: 'Phone Providers',
    electricity: 'Electricity',
    gas_provider: 'Gas Providers',
    solar: 'Solar Panels',
    battery_storage: 'Battery Storage',
    hotel: 'Hotels',
    airline: 'Airlines',
    travel_agency: 'Travel Agencies',
    travel_insurance: 'Travel Insurance',
    car_rental: 'Car Rental',
    vpn: 'VPN Services',
    hosting: 'Web Hosting',
    website_builder: 'Website Builders',
    crm: 'CRM Tools',
    email_marketing: 'Email Marketing',
    ai_solutions: 'AI Solutions',
    antivirus: 'Antivirus',
    furniture: 'Furniture',
    mattress: 'Mattresses',
    power_tools: 'Power Tools',
    security_system: 'Security Systems',
    robot_mower: 'Robot Mowers',
    gym: 'Gyms',
    fitness_watch: 'Fitness Watches',
    supplements: 'Supplements',
    health_app: 'Health Apps',
    online_courses: 'Online Courses',
    university: 'Universities',
    private_school: 'Private Schools',
    language_courses: 'Language Courses',
    online_store: 'Online Stores',
    delivery: 'Delivery Services',
    dropshipping: 'Dropshipping',
  },
  de: {
    tech: 'Technologie',
    appliances: 'Haushaltsgeräte',
    auto: 'Fahrzeuge',
    financial: 'Finanzen',
    telecom: 'Telekommunikation',
    energy: 'Energie & Versorgung',
    tourism: 'Tourismus',
    software: 'Software & Online-Dienste',
    home: 'Heim & Garten',
    health: 'Gesundheit & Fitness',
    education: 'Bildung',
    ecommerce: 'E-Commerce',
    phone: 'Smartphones',
    laptop: 'Laptops',
    tablet: 'Tablets',
    smartwatch: 'Smartwatches',
    headphones: 'Kopfhörer',
    tv: 'Fernseher',
    gaming: 'Spielkonsolen',
    monitor: 'Monitore',
    printer: 'Drucker',
    fridge: 'Kühlschränke',
    washing_machine: 'Waschmaschinen',
    dryer: 'Trockner',
    vacuum: 'Staubsauger',
    espresso: 'Kaffeemaschinen',
    oven: 'Backöfen & Herde',
    aircon: 'Klimaanlagen',
    new_car: 'Neuwagen',
    used_car: 'Gebrauchtwagen',
    tires: 'Reifen',
    car_insurance: 'Kfz-Versicherung',
    ev_charger: 'E-Ladesäulen',
    car_service: 'Autowerkstatt',
    personal_loan: 'Privatkredite',
    mortgage: 'Hypotheken',
    credit_card: 'Kreditkarten',
    bank_account: 'Bankkonten',
    deposit: 'Spareinlagen',
    broker: 'Anlagebroker',
    insurance: 'Versicherungen',
    mobile_plan: 'Mobilfunkverträge',
    prepaid: 'Prepaid-SIM',
    internet: 'Festnetz-Internet',
    tv_package: 'TV-Pakete',
    phone_provider: 'Telefonanbieter',
    electricity: 'Stromanbieter',
    gas_provider: 'Gasanbieter',
    solar: 'Solaranlagen',
    battery_storage: 'Batteriespeicher',
    hotel: 'Hotels',
    airline: 'Fluggesellschaften',
    travel_agency: 'Reisebüros',
    travel_insurance: 'Reiseversicherung',
    car_rental: 'Autovermietung',
    vpn: 'VPN-Dienste',
    hosting: 'Webhosting',
    website_builder: 'Website-Baukästen',
    crm: 'CRM-Tools',
    email_marketing: 'E-Mail-Marketing',
    ai_solutions: 'KI-Lösungen',
    antivirus: 'Antivirenprogramme',
    furniture: 'Möbel',
    mattress: 'Matratzen',
    power_tools: 'Elektrowerkzeuge',
    security_system: 'Sicherheitssysteme',
    robot_mower: 'Mähroboter',
    gym: 'Fitnessstudios',
    fitness_watch: 'Fitness-Uhren',
    supplements: 'Nahrungsergänzung',
    health_app: 'Gesundheits-Apps',
    online_courses: 'Online-Kurse',
    university: 'Universitäten',
    private_school: 'Privatschulen',
    language_courses: 'Sprachkurse',
    online_store: 'Online-Shops',
    delivery: 'Lieferdienste',
    dropshipping: 'Dropshipping-Plattformen',
  },
  fr: {
    tech: 'Technologie',
    appliances: 'Électroménager',
    auto: 'Automobiles',
    financial: 'Finance',
    telecom: 'Télécommunications',
    energy: 'Énergie & Services',
    tourism: 'Tourisme',
    software: 'Logiciels & Services',
    home: 'Maison & Jardin',
    health: 'Santé & Fitness',
    education: 'Éducation',
    ecommerce: 'E-commerce',
    phone: 'Smartphones',
    laptop: 'Ordinateurs portables',
    tablet: 'Tablettes',
    smartwatch: 'Montres connectées',
    headphones: 'Casques audio',
    tv: 'Téléviseurs',
    gaming: 'Consoles de jeux',
    monitor: 'Moniteurs',
    printer: 'Imprimantes',
    fridge: 'Réfrigérateurs',
    washing_machine: 'Machines à laver',
    dryer: 'Sèche-linge',
    vacuum: 'Aspirateurs',
    espresso: 'Machines à café',
    oven: 'Fours & Plaques',
    aircon: 'Climatisation',
    new_car: 'Voitures neuves',
    used_car: 'Voitures d\'occasion',
    tires: 'Pneus',
    car_insurance: 'Assurance auto',
    ev_charger: 'Bornes de recharge VE',
    car_service: 'Garages auto',
    personal_loan: 'Prêts personnels',
    mortgage: 'Crédits immobiliers',
    credit_card: 'Cartes de crédit',
    bank_account: 'Comptes bancaires',
    deposit: 'Dépôts d\'épargne',
    broker: 'Courtiers en investissement',
    insurance: 'Assurances',
    mobile_plan: 'Forfaits mobiles',
    prepaid: 'Cartes prépayées',
    internet: 'Internet fixe',
    tv_package: 'Packages TV',
    phone_provider: 'Opérateurs téléphoniques',
    electricity: 'Fournisseurs d\'électricité',
    gas_provider: 'Fournisseurs de gaz',
    solar: 'Panneaux solaires',
    battery_storage: 'Batteries de stockage',
    hotel: 'Hôtels',
    airline: 'Compagnies aériennes',
    travel_agency: 'Agences de voyage',
    travel_insurance: 'Assurance voyage',
    car_rental: 'Location de voitures',
    vpn: 'VPN',
    hosting: 'Hébergement web',
    website_builder: 'Créateurs de sites',
    crm: 'CRM',
    email_marketing: 'Email marketing',
    ai_solutions: 'Solutions IA',
    antivirus: 'Antivirus',
    furniture: 'Meubles',
    mattress: 'Matelas',
    power_tools: 'Outils électriques',
    security_system: 'Systèmes de sécurité',
    robot_mower: 'Robots tondeuses',
    gym: 'Salles de sport',
    fitness_watch: 'Montres fitness',
    supplements: 'Compléments alimentaires',
    health_app: 'Applications santé',
    online_courses: 'Cours en ligne',
    university: 'Universités',
    private_school: 'Écoles privées',
    language_courses: 'Cours de langues',
    online_store: 'Boutiques en ligne',
    delivery: 'Services de livraison',
    dropshipping: 'Dropshipping',
  },
  es: {
    tech: 'Tecnología',
    appliances: 'Electrodomésticos',
    auto: 'Automóviles',
    financial: 'Finanzas',
    telecom: 'Telecomunicaciones',
    energy: 'Energía y Servicios',
    tourism: 'Turismo',
    software: 'Software y Servicios',
    home: 'Hogar y Jardín',
    health: 'Salud y Fitness',
    education: 'Educación',
    ecommerce: 'E-commerce',
    phone: 'Smartphones',
    laptop: 'Portátiles',
    tablet: 'Tabletas',
    smartwatch: 'Relojes inteligentes',
    headphones: 'Auriculares',
    tv: 'Televisores',
    gaming: 'Consolas de juego',
    monitor: 'Monitores',
    printer: 'Impresoras',
    fridge: 'Frigoríficos',
    washing_machine: 'Lavadoras',
    dryer: 'Secadoras',
    vacuum: 'Aspiradoras',
    espresso: 'Cafeteras',
    oven: 'Hornos y Vitrocerámicas',
    aircon: 'Aire acondicionado',
    new_car: 'Coches nuevos',
    used_car: 'Coches de segunda mano',
    tires: 'Neumáticos',
    car_insurance: 'Seguro de coche',
    ev_charger: 'Cargadores VE',
    car_service: 'Talleres mecánicos',
    personal_loan: 'Préstamos personales',
    mortgage: 'Hipotecas',
    credit_card: 'Tarjetas de crédito',
    bank_account: 'Cuentas bancarias',
    deposit: 'Depósitos de ahorro',
    broker: 'Brokers de inversión',
    insurance: 'Seguros',
    mobile_plan: 'Planes móviles',
    prepaid: 'Tarjetas prepago',
    internet: 'Internet fijo',
    tv_package: 'Paquetes TV',
    phone_provider: 'Operadoras telefónicas',
    electricity: 'Proveedores de electricidad',
    gas_provider: 'Proveedores de gas',
    solar: 'Paneles solares',
    battery_storage: 'Almacenamiento de baterías',
    hotel: 'Hoteles',
    airline: 'Aerolíneas',
    travel_agency: 'Agencias de viajes',
    travel_insurance: 'Seguro de viaje',
    car_rental: 'Alquiler de coches',
    vpn: 'VPN',
    hosting: 'Hosting web',
    website_builder: 'Creadores de sitios',
    crm: 'CRM',
    email_marketing: 'Email marketing',
    ai_solutions: 'Soluciones IA',
    antivirus: 'Antivirus',
    furniture: 'Muebles',
    mattress: 'Colchones',
    power_tools: 'Herramientas eléctricas',
    security_system: 'Sistemas de seguridad',
    robot_mower: 'Robots cortacésped',
    gym: 'Gimnasios',
    fitness_watch: 'Relojes fitness',
    supplements: 'Suplementos',
    health_app: 'Apps de salud',
    online_courses: 'Cursos online',
    university: 'Universidades',
    private_school: 'Colegios privados',
    language_courses: 'Cursos de idiomas',
    online_store: 'Tiendas online',
    delivery: 'Servicios de entrega',
    dropshipping: 'Dropshipping',
  },
  it: {
    tech: 'Tecnologia',
    appliances: 'Elettrodomestici',
    auto: 'Automobili',
    financial: 'Finanze',
    telecom: 'Telecomunicazioni',
    energy: 'Energia e Servizi',
    tourism: 'Turismo',
    software: 'Software e Servizi',
    home: 'Casa e Giardino',
    health: 'Salute e Fitness',
    education: 'Istruzione',
    ecommerce: 'E-commerce',
    phone: 'Smartphone',
    laptop: 'Laptop',
    tablet: 'Tablet',
    smartwatch: 'Smartwatch',
    headphones: 'Cuffie audio',
    tv: 'Televisori',
    gaming: 'Console gaming',
    monitor: 'Monitor',
    printer: 'Stampanti',
    fridge: 'Frigoriferi',
    washing_machine: 'Lavatrici',
    dryer: 'Asciugatrici',
    vacuum: 'Aspirapolvere',
    espresso: 'Macchine caffè',
    oven: 'Forni e Piani cottura',
    aircon: 'Climatizzatori',
    new_car: 'Auto nuove',
    used_car: 'Auto usate',
    tires: 'Pneumatici',
    car_insurance: 'Assicurazione auto',
    ev_charger: 'Colonnine EV',
    car_service: 'Officine auto',
    personal_loan: 'Prestiti personali',
    mortgage: 'Mutui',
    credit_card: 'Carte di credito',
    bank_account: 'Conti bancari',
    deposit: 'Depositi risparmio',
    broker: 'Broker investimenti',
    insurance: 'Assicurazioni',
    mobile_plan: 'Piani mobili',
    prepaid: 'Schede prepagate',
    internet: 'Internet fisso',
    tv_package: 'Pacchetti TV',
    phone_provider: 'Operatori telefonici',
    electricity: 'Fornitori elettricità',
    gas_provider: 'Fornitori gas',
    solar: 'Pannelli solari',
    battery_storage: 'Batterie accumulo',
    hotel: 'Hotel',
    airline: 'Compagnie aeree',
    travel_agency: 'Agenzie viaggi',
    travel_insurance: 'Assicurazione viaggio',
    car_rental: 'Noleggio auto',
    vpn: 'VPN',
    hosting: 'Hosting web',
    website_builder: 'Costruttori siti',
    crm: 'CRM',
    email_marketing: 'Email marketing',
    ai_solutions: 'Soluzioni AI',
    antivirus: 'Antivirus',
    furniture: 'Mobili',
    mattress: 'Materassi',
    power_tools: 'Utensili elettrici',
    security_system: 'Sistemi sicurezza',
    robot_mower: 'Robot tagliaerba',
    gym: 'Palestre',
    fitness_watch: 'Orologi fitness',
    supplements: 'Integratori',
    health_app: 'App salute',
    online_courses: 'Corsi online',
    university: 'Università',
    private_school: 'Scuole private',
    language_courses: 'Corsi lingue',
    online_store: 'Negozi online',
    delivery: 'Servizi consegna',
    dropshipping: 'Dropshipping',
  },
  pt: {
    tech: 'Tecnologia',
    appliances: 'Eletrodomésticos',
    auto: 'Automóveis',
    financial: 'Finanças',
    telecom: 'Telecomunicações',
    energy: 'Energia e Utilidades',
    tourism: 'Turismo',
    software: 'Software e Serviços',
    home: 'Casa e Jardim',
    health: 'Saúde e Fitness',
    education: 'Educação',
    ecommerce: 'E-commerce',
    phone: 'Smartphones',
    laptop: 'Laptops',
    tablet: 'Tablets',
    smartwatch: 'Smartwatches',
    headphones: 'Auscultadores',
    tv: 'Televisores',
    gaming: 'Consolas de jogos',
    monitor: 'Monitores',
    printer: 'Impressoras',
    fridge: 'Frigoríficos',
    washing_machine: 'Máquinas de lavar',
    dryer: 'Máquinas de secar',
    vacuum: 'Aspiradores',
    espresso: 'Máquinas de café',
    oven: 'Fornos e Placas',
    aircon: 'Ar condicionado',
    new_car: 'Carros novos',
    used_car: 'Carros usados',
    tires: 'Pneus',
    car_insurance: 'Seguro automóvel',
    ev_charger: 'Carregadores VE',
    car_service: 'Oficinas auto',
    personal_loan: 'Empréstimos pessoais',
    mortgage: 'Crédito habitação',
    credit_card: 'Cartões de crédito',
    bank_account: 'Contas bancárias',
    deposit: 'Depósitos poupança',
    broker: 'Corretores de investimento',
    insurance: 'Seguros',
    mobile_plan: 'Planos móveis',
    prepaid: 'Cartões pré-pagos',
    internet: 'Internet fixo',
    tv_package: 'Pacotes TV',
    phone_provider: 'Operadoras telefónicas',
    electricity: 'Fornecedores eletricidade',
    gas_provider: 'Fornecedores gás',
    solar: 'Painéis solares',
    battery_storage: 'Armazenamento baterias',
    hotel: 'Hotéis',
    airline: 'Companhias aéreas',
    travel_agency: 'Agências de viagem',
    travel_insurance: 'Seguro de viagem',
    car_rental: 'Aluguer de carros',
    vpn: 'VPN',
    hosting: 'Hospedagem web',
    website_builder: 'Criadores de sites',
    crm: 'CRM',
    email_marketing: 'Email marketing',
    ai_solutions: 'Soluções de IA',
    antivirus: 'Antivírus',
    furniture: 'Móveis',
    mattress: 'Colchões',
    power_tools: 'Ferramentas elétricas',
    security_system: 'Sistemas de segurança',
    robot_mower: 'Robots cortadores',
    gym: 'Ginásios',
    fitness_watch: 'Relógios fitness',
    supplements: 'Suplementos',
    health_app: 'Apps saúde',
    online_courses: 'Cursos online',
    university: 'Universidades',
    private_school: 'Escolas privadas',
    language_courses: 'Cursos de idiomas',
    online_store: 'Lojas online',
    delivery: 'Serviços de entrega',
    dropshipping: 'Dropshipping',
  },
  ro: {
    tech: 'Tehnologie',
    appliances: 'Electrocasnice',
    auto: 'Auto',
    financial: 'Financiar',
    telecom: 'Telecomunicații',
    energy: 'Energie și Utilități',
    tourism: 'Turism',
    software: 'Software și Servicii Online',
    home: 'Casă și Grădină',
    health: 'Sănătate și Fitness',
    education: 'Educație',
    ecommerce: 'E-commerce și Marketplace',
    phone: 'Telefoane',
    laptop: 'Laptopuri',
    tablet: 'Tablete',
    smartwatch: 'Smartwatch-uri',
    headphones: 'Căști audio',
    tv: 'Televizoare',
    gaming: 'Console gaming',
    monitor: 'Monitoare',
    printer: 'Imprimante',
    fridge: 'Frigidere',
    washing_machine: 'Mașini de spălat',
    dryer: 'Uscătoare',
    vacuum: 'Aspiratoare',
    espresso: 'Espressoare',
    oven: 'Cuptoare și Plite',
    aircon: 'Aer condiționat',
    new_car: 'Mașini noi',
    used_car: 'Mașini second-hand',
    tires: 'Anvelope',
    car_insurance: 'Asigurări auto',
    ev_charger: 'Stații EV',
    car_service: 'Service auto',
    personal_loan: 'Credite personale',
    mortgage: 'Credite ipotecare',
    credit_card: 'Carduri de credit',
    bank_account: 'Conturi bancare',
    deposit: 'Depozite',
    broker: 'Brokeri de investiții',
    insurance: 'Asigurări',
    mobile_plan: 'Abonamente mobile',
    prepaid: 'Cartele preplătite',
    internet: 'Internet fix',
    tv_package: 'Pachete TV',
    phone_provider: 'Furnizori telefonie',
    electricity: 'Energie electrică',
    gas_provider: 'Furnizori gaze',
    solar: 'Panouri solare',
    battery_storage: 'Baterii de stocare',
    hotel: 'Hoteluri',
    airline: 'Companii aeriene',
    travel_agency: 'Agenții de turism',
    travel_insurance: 'Asigurări de călătorie',
    car_rental: 'Închirieri auto',
    vpn: 'VPN-uri',
    hosting: 'Hosting web',
    website_builder: 'Constructori de site-uri',
    crm: 'CRM-uri',
    email_marketing: 'Email marketing',
    ai_solutions: 'Soluții AI',
    antivirus: 'Antiviruși',
    furniture: 'Mobilă',
    mattress: 'Saltele',
    power_tools: 'Unelte electrice',
    security_system: 'Sisteme de securitate',
    robot_mower: 'Roboți de tuns iarba',
    gym: 'Săli de fitness',
    fitness_watch: 'Ceasuri fitness',
    supplements: 'Suplimente',
    health_app: 'Aplicații de sănătate',
    online_courses: 'Cursuri online',
    university: 'Universități',
    private_school: 'Școli private',
    language_courses: 'Cursuri de limbi',
    online_store: 'Magazine online',
    delivery: 'Servicii de livrare',
    dropshipping: 'Platforme dropshipping',
  },
  nl: {
    tech: 'Technologie',
    appliances: 'Huishoudelijke apparaten',
    auto: 'Voertuigen',
    financial: 'Financiën',
    telecom: 'Telecommunicatie',
    energy: 'Energie & Nutsvoorzieningen',
    tourism: 'Toerisme',
    software: 'Software & Online diensten',
    home: 'Huis & Tuin',
    health: 'Gezondheid & Fitness',
    education: 'Onderwijs',
    ecommerce: 'E-commerce',
    phone: 'Smartphones',
    laptop: 'Laptops',
    tablet: 'Tablets',
    smartwatch: 'Smartwatches',
    headphones: 'Hoofdtelefoons',
    tv: 'Televisies',
    gaming: 'Gameconsoles',
    monitor: 'Monitoren',
    printer: 'Printers',
    fridge: 'Koelkasten',
    washing_machine: 'Wasmachines',
    dryer: 'Drogers',
    vacuum: 'Stofzuigers',
    espresso: 'Koffiemachines',
    oven: 'Ovens & Kookplaten',
    aircon: 'Airconditioning',
    new_car: 'Nieuwe auto\'s',
    used_car: 'Gebruikte auto\'s',
    tires: 'Banden',
    car_insurance: 'Autoverzekering',
    ev_charger: 'EV-laadpalen',
    car_service: 'Autowerkplaatsen',
    personal_loan: 'Persoonlijke leningen',
    mortgage: 'Hypotheken',
    credit_card: 'Creditcards',
    bank_account: 'Bankrekeningen',
    deposit: 'Spaarrekeningen',
    broker: 'Investeringsmakelaars',
    insurance: 'Verzekeringen',
    mobile_plan: 'Mobiele abonnementen',
    prepaid: 'Prepaid SIM',
    internet: 'Vast internet',
    tv_package: 'TV-pakketten',
    phone_provider: 'Telefonaanbieders',
    electricity: 'Energieleveranciers',
    gas_provider: 'Gasleveranciers',
    solar: 'Zonnepanelen',
    battery_storage: 'Batterijopslag',
    hotel: 'Hotels',
    airline: 'Luchtvaartmaatschappijen',
    travel_agency: 'Reisbureaus',
    travel_insurance: 'Reisverzekering',
    car_rental: 'Autoverhuur',
    vpn: 'VPN-diensten',
    hosting: 'Webhosting',
    website_builder: 'Website-builders',
    crm: 'CRM-tools',
    email_marketing: 'E-mailmarketing',
    ai_solutions: 'AI-oplossingen',
    antivirus: 'Antivirussoftware',
    furniture: 'Meubels',
    mattress: 'Matrassen',
    power_tools: 'Elektrisch gereedschap',
    security_system: 'Beveiligingssystemen',
    robot_mower: 'Robotmaaiers',
    gym: 'Sportscholen',
    fitness_watch: 'Fitnesshorloges',
    supplements: 'Supplementen',
    health_app: 'Gezondheidsapps',
    online_courses: 'Online cursussen',
    university: 'Universiteiten',
    private_school: 'Privéscholen',
    language_courses: 'Taalcursussen',
    online_store: 'Online winkels',
    delivery: 'Bezorgdiensten',
    dropshipping: 'Dropshipping-platforms',
  },
  pl: {
    tech: 'Technologia',
    appliances: 'Sprzęt AGD',
    auto: 'Motoryzacja',
    financial: 'Finanse',
    telecom: 'Telekomunikacja',
    energy: 'Energia i Usługi',
    tourism: 'Turystyka',
    software: 'Oprogramowanie i Usługi',
    home: 'Dom i Ogród',
    health: 'Zdrowie i Fitness',
    education: 'Edukacja',
    ecommerce: 'E-commerce',
    phone: 'Smartfony',
    laptop: 'Laptopy',
    tablet: 'Tablety',
    smartwatch: 'Smartwatche',
    headphones: 'Słuchawki',
    tv: 'Telewizory',
    gaming: 'Konsole do gier',
    monitor: 'Monitory',
    printer: 'Drukarki',
    fridge: 'Lodówki',
    washing_machine: 'Pralki',
    dryer: 'Suszarki',
    vacuum: 'Odkurzacze',
    espresso: 'Ekspresy do kawy',
    oven: 'Piekarniki i Płyty',
    aircon: 'Klimatyzatory',
    new_car: 'Nowe samochody',
    used_car: 'Samochody używane',
    tires: 'Opony',
    car_insurance: 'Ubezpieczenie auta',
    ev_charger: 'Ładowarki EV',
    car_service: 'Warsztaty samochodowe',
    personal_loan: 'Kredyty gotówkowe',
    mortgage: 'Kredyty hipoteczne',
    credit_card: 'Karty kredytowe',
    bank_account: 'Konta bankowe',
    deposit: 'Lokaty oszczędnościowe',
    broker: 'Brokerzy inwestycyjni',
    insurance: 'Ubezpieczenia',
    mobile_plan: 'Abonamenty mobilne',
    prepaid: 'Karty pre-paid',
    internet: 'Internet stacjonarny',
    tv_package: 'Pakiety TV',
    phone_provider: 'Dostawcy telefonii',
    electricity: 'Dostawcy energii',
    gas_provider: 'Dostawcy gazu',
    solar: 'Panele słoneczne',
    battery_storage: 'Magazyny energii',
    hotel: 'Hotele',
    airline: 'Linie lotnicze',
    travel_agency: 'Biura podróży',
    travel_insurance: 'Ubezpieczenie podróżne',
    car_rental: 'Wynajem samochodów',
    vpn: 'Sieci VPN',
    hosting: 'Hosting stron',
    website_builder: 'Kreatory stron',
    crm: 'Systemy CRM',
    email_marketing: 'E-mail marketing',
    ai_solutions: 'Rozwiązania AI',
    antivirus: 'Programy antywirusowe',
    furniture: 'Meble',
    mattress: 'Materace',
    power_tools: 'Narzędzia elektryczne',
    security_system: 'Systemy bezpieczeństwa',
    robot_mower: 'Robotyczne kosiarki',
    gym: 'Siłownie',
    fitness_watch: 'Zegarki fitness',
    supplements: 'Suplementy',
    health_app: 'Aplikacje zdrowotne',
    online_courses: 'Kursy online',
    university: 'Uczelnie',
    private_school: 'Prywatne szkoły',
    language_courses: 'Kursy językowe',
    online_store: 'Sklepy internetowe',
    delivery: 'Usługi dostawcze',
    dropshipping: 'Dropshipping',
  },
  ru: {
    tech: 'Технологии',
    appliances: 'Бытовая техника',
    auto: 'Автомобили',
    financial: 'Финансы',
    telecom: 'Телекоммуникации',
    energy: 'Энергетика и ЖКХ',
    tourism: 'Туризм',
    software: 'Программное обеспечение',
    home: 'Дом и Сад',
    health: 'Здоровье и Фитнес',
    education: 'Образование',
    ecommerce: 'Электронная торговля',
    phone: 'Смартфоны',
    laptop: 'Ноутбуки',
    tablet: 'Планшеты',
    smartwatch: 'Смарт-часы',
    headphones: 'Наушники',
    tv: 'Телевизоры',
    gaming: 'Игровые консоли',
    monitor: 'Мониторы',
    printer: 'Принтеры',
    fridge: 'Холодильники',
    washing_machine: 'Стиральные машины',
    dryer: 'Сушильные машины',
    vacuum: 'Пылесосы',
    espresso: 'Кофемашины',
    oven: 'Духовки и Плиты',
    aircon: 'Кондиционеры',
    new_car: 'Новые автомобили',
    used_car: 'Подержанные авто',
    tires: 'Шины',
    car_insurance: 'Автострахование',
    ev_charger: 'Зарядные станции ЭВ',
    car_service: 'Автосервисы',
    personal_loan: 'Потребительские кредиты',
    mortgage: 'Ипотека',
    credit_card: 'Кредитные карты',
    bank_account: 'Банковские счета',
    deposit: 'Депозиты',
    broker: 'Инвестиционные брокеры',
    insurance: 'Страхование',
    mobile_plan: 'Мобильные тарифы',
    prepaid: 'Предоплаченные SIM',
    internet: 'Интернет',
    tv_package: 'ТВ-пакеты',
    phone_provider: 'Операторы связи',
    electricity: 'Поставщики электроэнергии',
    gas_provider: 'Поставщики газа',
    solar: 'Солнечные панели',
    battery_storage: 'Накопители энергии',
    hotel: 'Отели',
    airline: 'Авиакомпании',
    travel_agency: 'Турагентства',
    travel_insurance: 'Страхование путешествий',
    car_rental: 'Прокат автомобилей',
    vpn: 'VPN-сервисы',
    hosting: 'Веб-хостинг',
    website_builder: 'Конструкторы сайтов',
    crm: 'CRM-системы',
    email_marketing: 'Email-маркетинг',
    ai_solutions: 'AI-решения',
    antivirus: 'Антивирусы',
    furniture: 'Мебель',
    mattress: 'Матрасы',
    power_tools: 'Электроинструменты',
    security_system: 'Системы безопасности',
    robot_mower: 'Роботы-газонокосилки',
    gym: 'Фитнес-клубы',
    fitness_watch: 'Фитнес-часы',
    supplements: 'Добавки',
    health_app: 'Приложения для здоровья',
    online_courses: 'Онлайн-курсы',
    university: 'Университеты',
    private_school: 'Частные школы',
    language_courses: 'Языковые курсы',
    online_store: 'Интернет-магазины',
    delivery: 'Службы доставки',
    dropshipping: 'Дропшиппинг',
  },
  zh: {
    tech: '科技',
    appliances: '家用电器',
    auto: '汽车',
    financial: '金融',
    telecom: '电信',
    energy: '能源与公用事业',
    tourism: '旅游',
    software: '软件与在线服务',
    home: '家居与园艺',
    health: '健康与健身',
    education: '教育',
    ecommerce: '电子商务',
    phone: '智能手机',
    laptop: '笔记本电脑',
    tablet: '平板电脑',
    smartwatch: '智能手表',
    headphones: '耳机',
    tv: '电视',
    gaming: '游戏机',
    monitor: '显示器',
    printer: '打印机',
    fridge: '冰箱',
    washing_machine: '洗衣机',
    dryer: '烘干机',
    vacuum: '吸尘器',
    espresso: '咖啡机',
    oven: '烤箱与灶台',
    aircon: '空调',
    new_car: '新车',
    used_car: '二手车',
    tires: '轮胎',
    car_insurance: '车险',
    ev_charger: '电动车充电桩',
    car_service: '汽车维修',
    personal_loan: '个人贷款',
    mortgage: '住房贷款',
    credit_card: '信用卡',
    bank_account: '银行账户',
    deposit: '存款',
    broker: '投资经纪',
    insurance: '保险',
    mobile_plan: '手机套餐',
    prepaid: '预付卡',
    internet: '宽带网络',
    tv_package: '电视套餐',
    phone_provider: '电话运营商',
    electricity: '电力供应商',
    gas_provider: '天然气供应商',
    solar: '太阳能板',
    battery_storage: '储能电池',
    hotel: '酒店',
    airline: '航空公司',
    travel_agency: '旅行社',
    travel_insurance: '旅行保险',
    car_rental: '租车',
    vpn: 'VPN',
    hosting: '网络托管',
    website_builder: '建站工具',
    crm: '客户管理系统',
    email_marketing: '邮件营销',
    ai_solutions: 'AI解决方案',
    antivirus: '杀毒软件',
    furniture: '家具',
    mattress: '床垫',
    power_tools: '电动工具',
    security_system: '安防系统',
    robot_mower: '机器人割草机',
    gym: '健身房',
    fitness_watch: '运动手表',
    supplements: '营养补剂',
    health_app: '健康应用',
    online_courses: '在线课程',
    university: '大学',
    private_school: '私立学校',
    language_courses: '语言课程',
    online_store: '网上商城',
    delivery: '快递服务',
    dropshipping: '代发货',
  },
  ar: {
    tech: 'تكنولوجيا',
    appliances: 'أجهزة منزلية',
    auto: 'سيارات',
    financial: 'مالية',
    telecom: 'اتصالات',
    energy: 'طاقة وخدمات',
    tourism: 'سياحة',
    software: 'برمجيات وخدمات',
    home: 'منزل وحديقة',
    health: 'صحة ولياقة',
    education: 'تعليم',
    ecommerce: 'تجارة إلكترونية',
    phone: 'هواتف ذكية',
    laptop: 'أجهزة لابتوب',
    tablet: 'أجهزة لوحية',
    smartwatch: 'ساعات ذكية',
    headphones: 'سماعات',
    tv: 'تلفزيونات',
    gaming: 'ألعاب فيديو',
    monitor: 'شاشات',
    printer: 'طابعات',
    fridge: 'ثلاجات',
    washing_machine: 'غسالات',
    dryer: 'مجففات',
    vacuum: 'مكانس كهربائية',
    espresso: 'ماكينات قهوة',
    oven: 'أفران وطواق',
    aircon: 'مكيفات',
    new_car: 'سيارات جديدة',
    used_car: 'سيارات مستعملة',
    tires: 'إطارات',
    car_insurance: 'تأمين السيارة',
    ev_charger: 'شواحن كهربائية',
    car_service: 'خدمة السيارات',
    personal_loan: 'قروض شخصية',
    mortgage: 'قروض عقارية',
    credit_card: 'بطاقات ائتمان',
    bank_account: 'حسابات بنكية',
    deposit: 'ودائع',
    broker: 'وسطاء استثمار',
    insurance: 'تأمينات',
    mobile_plan: 'خطط الجوال',
    prepaid: 'بطاقات مدفوعة مسبقاً',
    internet: 'إنترنت ثابت',
    tv_package: 'باقات تلفزيون',
    phone_provider: 'مزودو الهاتف',
    electricity: 'مزودو الكهرباء',
    gas_provider: 'مزودو الغاز',
    solar: 'ألواح شمسية',
    battery_storage: 'بطاريات تخزين',
    hotel: 'فنادق',
    airline: 'شركات طيران',
    travel_agency: 'وكالات سفر',
    travel_insurance: 'تأمين سفر',
    car_rental: 'تأجير سيارات',
    vpn: 'شبكات VPN',
    hosting: 'استضافة مواقع',
    website_builder: 'منشئو مواقع',
    crm: 'نظام إدارة العملاء',
    email_marketing: 'تسويق بالبريد',
    ai_solutions: 'حلول الذكاء الاصطناعي',
    antivirus: 'برامج مكافحة الفيروسات',
    furniture: 'أثاث',
    mattress: 'مراتب',
    power_tools: 'أدوات كهربائية',
    security_system: 'أنظمة الأمان',
    robot_mower: 'روبوتات جز العشب',
    gym: 'صالات رياضية',
    fitness_watch: 'ساعات لياقة',
    supplements: 'مكملات غذائية',
    health_app: 'تطبيقات صحية',
    online_courses: 'دورات أونلاين',
    university: 'جامعات',
    private_school: 'مدارس خاصة',
    language_courses: 'دورات لغات',
    online_store: 'متاجر أونلاين',
    delivery: 'خدمات توصيل',
    dropshipping: 'الشحن المباشر',
  },
  tr: {
    tech: 'Teknoloji',
    appliances: 'Ev Aletleri',
    auto: 'Otomobil',
    financial: 'Finans',
    telecom: 'Telekomünikasyon',
    energy: 'Enerji ve Hizmetler',
    tourism: 'Turizm',
    software: 'Yazılım ve Online Hizmetler',
    home: 'Ev ve Bahçe',
    health: 'Sağlık ve Fitness',
    education: 'Eğitim',
    ecommerce: 'E-ticaret',
    phone: 'Akıllı Telefonlar',
    laptop: 'Dizüstü Bilgisayarlar',
    tablet: 'Tabletler',
    smartwatch: 'Akıllı Saatler',
    headphones: 'Kulaklıklar',
    tv: 'Televizyonlar',
    gaming: 'Oyun Konsolları',
    monitor: 'Monitörler',
    printer: 'Yazıcılar',
    fridge: 'Buzdolapları',
    washing_machine: 'Çamaşır Makineleri',
    dryer: 'Kurutma Makineleri',
    vacuum: 'Elektrikli Süpürgeler',
    espresso: 'Kahve Makineleri',
    oven: 'Fırınlar ve Ocaklar',
    aircon: 'Klima',
    new_car: 'Sıfır Arabalar',
    used_car: 'İkinci El Arabalar',
    tires: 'Lastikler',
    car_insurance: 'Araç Sigortası',
    ev_charger: 'EV Şarj İstasyonları',
    car_service: 'Oto Servis',
    personal_loan: 'Bireysel Krediler',
    mortgage: 'Konut Kredileri',
    credit_card: 'Kredi Kartları',
    bank_account: 'Banka Hesapları',
    deposit: 'Vadeli Mevduat',
    broker: 'Yatırım Komisyoncuları',
    insurance: 'Sigortalar',
    mobile_plan: 'Mobil Abonelikler',
    prepaid: 'Ön Ödemeli SIM',
    internet: 'Sabit İnternet',
    tv_package: 'TV Paketleri',
    phone_provider: 'Telefon Operatörleri',
    electricity: 'Elektrik Sağlayıcıları',
    gas_provider: 'Gaz Sağlayıcıları',
    solar: 'Güneş Panelleri',
    battery_storage: 'Enerji Depolama',
    hotel: 'Oteller',
    airline: 'Havayolları',
    travel_agency: 'Seyahat Acenteleri',
    travel_insurance: 'Seyahat Sigortası',
    car_rental: 'Araç Kiralama',
    vpn: 'VPN Hizmetleri',
    hosting: 'Web Hosting',
    website_builder: 'Web Sitesi Yapıcıları',
    crm: 'CRM Araçları',
    email_marketing: 'E-posta Pazarlaması',
    ai_solutions: 'Yapay Zeka Çözümleri',
    antivirus: 'Antivirüs',
    furniture: 'Mobilya',
    mattress: 'Yatak Matresler',
    power_tools: 'Elektrikli Aletler',
    security_system: 'Güvenlik Sistemleri',
    robot_mower: 'Robot Çim Biçiciler',
    gym: 'Spor Salonları',
    fitness_watch: 'Fitness Saatleri',
    supplements: 'Takviyeler',
    health_app: 'Sağlık Uygulamaları',
    online_courses: 'Online Kurslar',
    university: 'Üniversiteler',
    private_school: 'Özel Okullar',
    language_courses: 'Dil Kursları',
    online_store: 'Online Mağazalar',
    delivery: 'Teslimat Hizmetleri',
    dropshipping: 'Dropshipping Platformları',
  },
  // ── Extra 17 languages to reach 30 total ──
  sv: { tech:"Teknik",appliances:"Hushållsapparater",auto:"Bilar",financial:"Ekonomi",telecom:"Mobil & Internet",energy:"Energi",tourism:"Turism",software:"Programvara",home:"Hem & Trädgård",health:"Hälsa & Fitness",education:"Utbildning",ecommerce:"E-handel",phone:"Smartphones",laptop:"Laptops",tablet:"Surfplattor",smartwatch:"Smartwatches",headphones:"Hörlurar",tv:"TV-apparater",gaming:"Spelkonsoler",monitor:"Skärmar",printer:"Skrivare",fridge:"Kylskåp",washing_machine:"Tvättmaskiner",dryer:"Torktumlare",vacuum:"Dammsugare",espresso:"Kaffemaskiner",oven:"Ugnar & Spis",aircon:"Luftkonditionering",new_car:"Nya bilar",used_car:"Begagnade bilar",tires:"Däck",car_insurance:"Bilförsäkring",ev_charger:"EV-laddare",car_service:"Bilverkstad",personal_loan:"Personliga lån",mortgage:"Bolån",credit_card:"Kreditkort",bank_account:"Bankkonton",deposit:"Sparkonton",broker:"Investeringsmäklare",insurance:"Försäkringar",mobile_plan:"Mobilabonnemang",prepaid:"Kontantkort",internet:"Fast bredband",tv_package:"TV-paket",phone_provider:"Telefonoperatörer",electricity:"Elleverantörer",gas_provider:"Gasleverantörer",solar:"Solpaneler",battery_storage:"Batterilager",hotel:"Hotell",airline:"Flygbolag",travel_agency:"Resebyråer",travel_insurance:"Reseförsäkring",car_rental:"Biluthyrning",vpn:"VPN-tjänster",hosting:"Webbhotell",website_builder:"Webbplatsbyggare",crm:"CRM",email_marketing:"E-postmarknadsföring",ai_solutions:"AI-lösningar",antivirus:"Antivirusprogram",furniture:"Möbler",mattress:"Madrasser",power_tools:"Elverktyg",security_system:"Säkerhetssystem",robot_mower:"Robotgräsklippare",gym:"Gym",fitness_watch:"Fitnessklockor",supplements:"Kosttillskott",health_app:"Hälsoappar",online_courses:"Onlinekurser",university:"Universitet",private_school:"Privatskolor",language_courses:"Språkkurser",online_store:"Nätbutiker",delivery:"Leveranstjänster",dropshipping:"Dropshipping" },
  da: { tech:"Teknologi",appliances:"Husholdningsapparater",auto:"Biler",financial:"Økonomi",telecom:"Mobil & Internet",energy:"Energi",tourism:"Turisme",software:"Software",home:"Hjem & Have",health:"Sundhed & Fitness",education:"Uddannelse",ecommerce:"E-handel",phone:"Smartphones",laptop:"Laptops",tablet:"Tablets",smartwatch:"Smartwatches",headphones:"Høretelefoner",tv:"Fjernsyn",gaming:"Spillekonsoller",monitor:"Skærme",printer:"Printere",fridge:"Køleskabe",washing_machine:"Vaskemaskiner",dryer:"Tørretumblere",vacuum:"Støvsugere",espresso:"Kaffemaskiner",oven:"Ovne & Komfurer",aircon:"Aircondition",new_car:"Nye biler",used_car:"Brugte biler",tires:"Dæk",car_insurance:"Bilforsikring",ev_charger:"EV-ladere",car_service:"Autoværksteder",personal_loan:"Personlige lån",mortgage:"Realkreditlån",credit_card:"Kreditkort",bank_account:"Bankkonti",deposit:"Opsparingskonto",broker:"Investeringsmæglere",insurance:"Forsikringer",mobile_plan:"Mobilabonnementer",prepaid:"Taletidskort",internet:"Fastnet internet",tv_package:"TV-pakker",phone_provider:"Telefonudbydere",electricity:"Eludbydere",gas_provider:"Gasudbydere",solar:"Solpaneler",battery_storage:"Batterilager",hotel:"Hoteller",airline:"Flyselskaber",travel_agency:"Rejsebureauer",travel_insurance:"Rejseforsikring",car_rental:"Biludlejning",vpn:"VPN",hosting:"Webhosting",website_builder:"Hjemmesidebyggere",crm:"CRM",email_marketing:"E-mailmarkedsføring",ai_solutions:"AI-løsninger",antivirus:"Antivirusprogrammer",furniture:"Møbler",mattress:"Madrasser",power_tools:"Elværktøj",security_system:"Sikkerhedssystemer",robot_mower:"Robotplæneklippere",gym:"Fitnesscentre",fitness_watch:"Fitnessure",supplements:"Kosttilskud",health_app:"Sundhedsapps",online_courses:"Onlinekurser",university:"Universiteter",private_school:"Privatskoler",language_courses:"Sprogkurser",online_store:"Netbutikker",delivery:"Leveringstjenester",dropshipping:"Dropshipping" },
  no: { tech:"Teknologi",appliances:"Husholdningsapparater",auto:"Biler",financial:"Økonomi",telecom:"Telekommunikasjon",energy:"Energi",tourism:"Turisme",software:"Programvare",home:"Hjem & Hage",health:"Helse & Fitness",education:"Utdanning",ecommerce:"E-handel",phone:"Smarttelefoner",laptop:"Bærbare PC-er",tablet:"Nettbrett",smartwatch:"Smartklokker",headphones:"Hodetelefoner",tv:"TV-er",gaming:"Spillkonsoller",monitor:"Skjermer",printer:"Skrivere",fridge:"Kjøleskap",washing_machine:"Vaskemaskiner",dryer:"Tørketromler",vacuum:"Støvsugere",espresso:"Kaffemaskiner",oven:"Ovner & Komfyrer",aircon:"Klimaanlegg",new_car:"Nye biler",used_car:"Brukte biler",tires:"Dekk",car_insurance:"Bilforsikring",ev_charger:"EV-ladere",car_service:"Bilverksteder",personal_loan:"Personlige lån",mortgage:"Boliglån",credit_card:"Kredittkort",bank_account:"Bankkontoer",deposit:"Sparekontoer",broker:"Investeringsmeglere",insurance:"Forsikringer",mobile_plan:"Mobilabonnementer",prepaid:"Kontantkort",internet:"Fast bredbånd",tv_package:"TV-pakker",phone_provider:"Telefonleverandører",electricity:"Strømleverandører",gas_provider:"Gassleverandører",solar:"Solpaneler",battery_storage:"Batterilager",hotel:"Hoteller",airline:"Flyselskaper",travel_agency:"Reisebyråer",travel_insurance:"Reiseforsikring",car_rental:"Bilutleie",vpn:"VPN",hosting:"Webhotell",website_builder:"Nettstedsbyggere",crm:"CRM",email_marketing:"E-postmarkedsføring",ai_solutions:"AI-løsninger",antivirus:"Antivirusprogrammer",furniture:"Møbler",mattress:"Madrasser",power_tools:"Elektroverktøy",security_system:"Sikkerhetssystemer",robot_mower:"Robotgressklipper",gym:"Treningssentre",fitness_watch:"Treningsklokker",supplements:"Kosttilskudd",health_app:"Helseapper",online_courses:"Nettkurs",university:"Universiteter",private_school:"Privatskoler",language_courses:"Språkkurs",online_store:"Nettbutikker",delivery:"Leveringstjenester",dropshipping:"Dropshipping" },
  fi: { tech:"Teknologia",appliances:"Kodinkoneet",auto:"Autot",financial:"Talous",telecom:"Televiestintä",energy:"Energia",tourism:"Matkailu",software:"Ohjelmistot",home:"Koti & Puutarha",health:"Terveys & Fitness",education:"Koulutus",ecommerce:"Verkkokauppa",phone:"Älypuhelimet",laptop:"Kannettavat",tablet:"Tabletit",smartwatch:"Älykellot",headphones:"Kuulokkeet",tv:"Televisiot",gaming:"Pelikonsolit",monitor:"Näytöt",printer:"Tulostimet",fridge:"Jääkaapit",washing_machine:"Pesukoneet",dryer:"Kuivausrummut",vacuum:"Pölynimurit",espresso:"Kahvikoneet",oven:"Uunit & Liedet",aircon:"Ilmastointi",new_car:"Uudet autot",used_car:"Käytetyt autot",tires:"Renkaat",car_insurance:"Autovakuutus",ev_charger:"Sähköauton laturit",car_service:"Autokorjaamot",personal_loan:"Henkilökohtaiset lainat",mortgage:"Asuntolainat",credit_card:"Luottokortit",bank_account:"Pankkitilit",deposit:"Säästötilit",broker:"Sijoitusvälittäjät",insurance:"Vakuutukset",mobile_plan:"Puhelinliittymät",prepaid:"Prepaid-liittymät",internet:"Kiinteä laajakaista",tv_package:"TV-paketit",phone_provider:"Puhelinoperaattorit",electricity:"Sähköntoimittajat",gas_provider:"Kaasuntoimittajat",solar:"Aurinkopaneelit",battery_storage:"Akkuvarastointi",hotel:"Hotellit",airline:"Lentoyhtiöt",travel_agency:"Matkatoimistot",travel_insurance:"Matkavakuutus",car_rental:"Autonvuokraus",vpn:"VPN-palvelut",hosting:"Webhotellit",website_builder:"Sivustorakentajat",crm:"CRM",email_marketing:"Sähköpostimarkkinointi",ai_solutions:"AI-ratkaisut",antivirus:"Virustorjuntaohjelmat",furniture:"Huonekalut",mattress:"Patjat",power_tools:"Sähkötyökalut",security_system:"Turvajärjestelmät",robot_mower:"Robottileikkurit",gym:"Kuntosalit",fitness_watch:"Fitnesskellot",supplements:"Ravintolisät",health_app:"Terveyssovellukset",online_courses:"Verkkokurssit",university:"Yliopistot",private_school:"Yksityiskoulut",language_courses:"Kielikurssit",online_store:"Verkkokaupat",delivery:"Toimituspalvelut",dropshipping:"Dropshipping" },
  cs: { tech:"Technologie",appliances:"Domácí spotřebiče",auto:"Automobily",financial:"Finance",telecom:"Telekomunikace",energy:"Energie",tourism:"Cestovní ruch",software:"Software",home:"Dům & Zahrada",health:"Zdraví & Fitness",education:"Vzdělání",ecommerce:"E-commerce",phone:"Smartphony",laptop:"Notebooky",tablet:"Tablety",smartwatch:"Chytré hodinky",headphones:"Sluchátka",tv:"Televizory",gaming:"Herní konzole",monitor:"Monitory",printer:"Tiskárny",fridge:"Lednice",washing_machine:"Pračky",dryer:"Sušičky",vacuum:"Vysavače",espresso:"Kávovary",oven:"Trouby a varné desky",aircon:"Klimatizace",new_car:"Nová auta",used_car:"Ojetá auta",tires:"Pneumatiky",car_insurance:"Pojištění vozidla",ev_charger:"Nabíječky EV",car_service:"Autoservisy",personal_loan:"Osobní půjčky",mortgage:"Hypotéky",credit_card:"Kreditní karty",bank_account:"Bankovní účty",deposit:"Spořicí vklady",broker:"Investiční makléři",insurance:"Pojištění",mobile_plan:"Mobilní tarify",prepaid:"Předplacené SIM",internet:"Pevný internet",tv_package:"TV balíčky",phone_provider:"Telefonní operátoři",electricity:"Dodavatelé elektřiny",gas_provider:"Dodavatelé plynu",solar:"Solární panely",battery_storage:"Bateriové zásoby",hotel:"Hotely",airline:"Letecké společnosti",travel_agency:"Cestovní kanceláře",travel_insurance:"Cestovní pojištění",car_rental:"Půjčovna aut",vpn:"VPN",hosting:"Webhosting",website_builder:"Tvůrci webů",crm:"CRM",email_marketing:"E-mail marketing",ai_solutions:"AI řešení",antivirus:"Antivirové programy",furniture:"Nábytek",mattress:"Matrace",power_tools:"Elektrické nářadí",security_system:"Bezpečnostní systémy",robot_mower:"Robotické sekačky",gym:"Fitness centra",fitness_watch:"Fitness hodinky",supplements:"Doplňky stravy",health_app:"Zdravotní aplikace",online_courses:"Online kurzy",university:"Univerzity",private_school:"Soukromé školy",language_courses:"Jazykové kurzy",online_store:"Internetové obchody",delivery:"Doručovací služby",dropshipping:"Dropshipping" },
  hu: { tech:"Technológia",appliances:"Háztartási gépek",auto:"Autók",financial:"Pénzügyek",telecom:"Telekommunikáció",energy:"Energia",tourism:"Turizmus",software:"Szoftver",home:"Otthon & Kert",health:"Egészség & Fitness",education:"Oktatás",ecommerce:"E-kereskedelem",phone:"Okostelefonok",laptop:"Laptopok",tablet:"Táblagépek",smartwatch:"Okosórák",headphones:"Fejhallgatók",tv:"Televíziók",gaming:"Játékkonzolok",monitor:"Monitorok",printer:"Nyomtatók",fridge:"Hűtőszekrények",washing_machine:"Mosógépek",dryer:"Szárítógépek",vacuum:"Porszívók",espresso:"Kávéfőzők",oven:"Sütők és tűzhelyek",aircon:"Légkondicionálók",new_car:"Új autók",used_car:"Használt autók",tires:"Gumiabroncsok",car_insurance:"Gépjármű-biztosítás",ev_charger:"Elektromos töltők",car_service:"Autószerelők",personal_loan:"Személyi kölcsön",mortgage:"Lakáshitel",credit_card:"Hitelkártyák",bank_account:"Bankszámlák",deposit:"Betétek",broker:"Befektetési brókerek",insurance:"Biztosítások",mobile_plan:"Mobil előfizetések",prepaid:"Feltöltőkártyák",internet:"Vezetékes internet",tv_package:"TV-csomagok",phone_provider:"Telefonszolgáltatók",electricity:"Áramszolgáltatók",gas_provider:"Gázszolgáltatók",solar:"Napelem",battery_storage:"Akkumulátor tárolás",hotel:"Szállodák",airline:"Légitársaságok",travel_agency:"Utazási irodák",travel_insurance:"Utazási biztosítás",car_rental:"Autókölcsönzés",vpn:"VPN",hosting:"Webhosting",website_builder:"Weboldalkészítők",crm:"CRM",email_marketing:"E-mail marketing",ai_solutions:"AI megoldások",antivirus:"Vírusirtók",furniture:"Bútorok",mattress:"Matracok",power_tools:"Elektromos szerszámok",security_system:"Biztonsági rendszerek",robot_mower:"Robot fűnyírók",gym:"Edzőtermek",fitness_watch:"Fitness órák",supplements:"Étrend-kiegészítők",health_app:"Egészségügyi alkalmazások",online_courses:"Online kurzusok",university:"Egyetemek",private_school:"Magániskolák",language_courses:"Nyelvi kurzusok",online_store:"Webáruházak",delivery:"Csomagküldő szolgálatok",dropshipping:"Dropshipping" },
  uk: { tech:"Технології",appliances:"Побутова техніка",auto:"Автомобілі",financial:"Фінанси",telecom:"Телекомунікації",energy:"Енергетика",tourism:"Туризм",software:"Програмне забезпечення",home:"Дім та Сад",health:"Здоров'я та Фітнес",education:"Освіта",ecommerce:"Електронна торгівля",phone:"Смартфони",laptop:"Ноутбуки",tablet:"Планшети",smartwatch:"Смарт-годинники",headphones:"Навушники",tv:"Телевізори",gaming:"Ігрові консолі",monitor:"Монітори",printer:"Принтери",fridge:"Холодильники",washing_machine:"Пральні машини",dryer:"Сушильні машини",vacuum:"Пилососи",espresso:"Кавомашини",oven:"Духовки та Плити",aircon:"Кондиціонери",new_car:"Нові авто",used_car:"Вживані авто",tires:"Шини",car_insurance:"Автострахування",ev_charger:"Зарядні для ЕВ",car_service:"Автосервіси",personal_loan:"Особисті кредити",mortgage:"Іпотека",credit_card:"Кредитні картки",bank_account:"Банківські рахунки",deposit:"Депозити",broker:"Інвестиційні брокери",insurance:"Страхування",mobile_plan:"Мобільні тарифи",prepaid:"Передплачені SIM",internet:"Стаціонарний інтернет",tv_package:"ТВ-пакети",phone_provider:"Оператори зв'язку",electricity:"Постачальники електроенергії",gas_provider:"Постачальники газу",solar:"Сонячні панелі",battery_storage:"Батарейні накопичувачі",hotel:"Готелі",airline:"Авіакомпанії",travel_agency:"Туристичні агентства",travel_insurance:"Туристичне страхування",car_rental:"Оренда авто",vpn:"VPN-сервіси",hosting:"Веб-хостинг",website_builder:"Конструктори сайтів",crm:"CRM",email_marketing:"Email-маркетинг",ai_solutions:"AI-рішення",antivirus:"Антивіруси",furniture:"Меблі",mattress:"Матраци",power_tools:"Електроінструменти",security_system:"Системи безпеки",robot_mower:"Роботи-газонокосарки",gym:"Тренажерні зали",fitness_watch:"Фітнес-годинники",supplements:"Харчові добавки",health_app:"Додатки для здоров'я",online_courses:"Онлайн-курси",university:"Університети",private_school:"Приватні школи",language_courses:"Мовні курси",online_store:"Інтернет-магазини",delivery:"Служби доставки",dropshipping:"Дропшипінг" },
  ko: { tech:"기술",appliances:"가전제품",auto:"자동차",financial:"금융",telecom:"통신",energy:"에너지",tourism:"관광",software:"소프트웨어",home:"홈 & 가든",health:"건강 & 피트니스",education:"교육",ecommerce:"전자상거래",phone:"스마트폰",laptop:"노트북",tablet:"태블릿",smartwatch:"스마트워치",headphones:"헤드폰",tv:"TV",gaming:"게임 콘솔",monitor:"모니터",printer:"프린터",fridge:"냉장고",washing_machine:"세탁기",dryer:"건조기",vacuum:"진공청소기",espresso:"커피머신",oven:"오븐 & 레인지",aircon:"에어컨",new_car:"신차",used_car:"중고차",tires:"타이어",car_insurance:"자동차보험",ev_charger:"EV 충전기",car_service:"자동차 정비소",personal_loan:"개인 대출",mortgage:"주택담보대출",credit_card:"신용카드",bank_account:"은행 계좌",deposit:"예금",broker:"투자 브로커",insurance:"보험",mobile_plan:"모바일 요금제",prepaid:"선불 SIM",internet:"유선 인터넷",tv_package:"TV 패키지",phone_provider:"통신사",electricity:"전기 공급업체",gas_provider:"가스 공급업체",solar:"태양광 패널",battery_storage:"배터리 저장",hotel:"호텔",airline:"항공사",travel_agency:"여행사",travel_insurance:"여행자보험",car_rental:"렌터카",vpn:"VPN",hosting:"웹호스팅",website_builder:"웹사이트 빌더",crm:"CRM",email_marketing:"이메일 마케팅",ai_solutions:"AI 솔루션",antivirus:"백신 소프트웨어",furniture:"가구",mattress:"매트리스",power_tools:"전동 공구",security_system:"보안 시스템",robot_mower:"로봇 잔디깎기",gym:"헬스장",fitness_watch:"피트니스 워치",supplements:"건강보조식품",health_app:"건강 앱",online_courses:"온라인 강좌",university:"대학교",private_school:"사립학교",language_courses:"어학 과정",online_store:"온라인 쇼핑몰",delivery:"배송 서비스",dropshipping:"드롭쉬핑" },
  ja: { tech:"テクノロジー",appliances:"家電",auto:"自動車",financial:"金融",telecom:"通信",energy:"エネルギー",tourism:"旅行",software:"ソフトウェア",home:"ホーム＆ガーデン",health:"健康＆フィットネス",education:"教育",ecommerce:"Eコマース",phone:"スマートフォン",laptop:"ノートパソコン",tablet:"タブレット",smartwatch:"スマートウォッチ",headphones:"ヘッドフォン",tv:"テレビ",gaming:"ゲーム機",monitor:"モニター",printer:"プリンター",fridge:"冷蔵庫",washing_machine:"洗濯機",dryer:"乾燥機",vacuum:"掃除機",espresso:"コーヒーメーカー",oven:"オーブン＆コンロ",aircon:"エアコン",new_car:"新車",used_car:"中古車",tires:"タイヤ",car_insurance:"自動車保険",ev_charger:"EV充電器",car_service:"自動車整備",personal_loan:"個人ローン",mortgage:"住宅ローン",credit_card:"クレジットカード",bank_account:"銀行口座",deposit:"定期預金",broker:"投資ブローカー",insurance:"保険",mobile_plan:"携帯プラン",prepaid:"プリペイドSIM",internet:"固定インターネット",tv_package:"TVパッケージ",phone_provider:"通信キャリア",electricity:"電力会社",gas_provider:"ガス会社",solar:"ソーラーパネル",battery_storage:"蓄電池",hotel:"ホテル",airline:"航空会社",travel_agency:"旅行代理店",travel_insurance:"旅行保険",car_rental:"レンタカー",vpn:"VPN",hosting:"ウェブホスティング",website_builder:"ウェブサイトビルダー",crm:"CRM",email_marketing:"メールマーケティング",ai_solutions:"AIソリューション",antivirus:"アンチウイルス",furniture:"家具",mattress:"マットレス",power_tools:"電動工具",security_system:"セキュリティシステム",robot_mower:"ロボット芝刈り機",gym:"ジム",fitness_watch:"フィットネスウォッチ",supplements:"サプリメント",health_app:"ヘルスアプリ",online_courses:"オンライン講座",university:"大学",private_school:"私立学校",language_courses:"語学コース",online_store:"オンラインショップ",delivery:"配送サービス",dropshipping:"ドロップシッピング" },
  id: { tech:"Teknologi",appliances:"Peralatan Rumah",auto:"Otomotif",financial:"Keuangan",telecom:"Telekomunikasi",energy:"Energi",tourism:"Pariwisata",software:"Perangkat Lunak",home:"Rumah & Taman",health:"Kesehatan & Kebugaran",education:"Pendidikan",ecommerce:"E-commerce",phone:"Smartphone",laptop:"Laptop",tablet:"Tablet",smartwatch:"Smartwatch",headphones:"Headphone",tv:"Televisi",gaming:"Konsol Game",monitor:"Monitor",printer:"Printer",fridge:"Kulkas",washing_machine:"Mesin Cuci",dryer:"Pengering Pakaian",vacuum:"Penyedot Debu",espresso:"Mesin Kopi",oven:"Oven & Kompor",aircon:"AC",new_car:"Mobil Baru",used_car:"Mobil Bekas",tires:"Ban",car_insurance:"Asuransi Mobil",ev_charger:"Pengisi Daya EV",car_service:"Bengkel Mobil",personal_loan:"KTA",mortgage:"KPR",credit_card:"Kartu Kredit",bank_account:"Rekening Bank",deposit:"Deposito",broker:"Broker Investasi",insurance:"Asuransi",mobile_plan:"Paket Data",prepaid:"Kartu Perdana",internet:"Internet Rumah",tv_package:"Paket TV",phone_provider:"Operator Telepon",electricity:"PLN",gas_provider:"Penyedia Gas",solar:"Panel Surya",battery_storage:"Baterai Penyimpan",hotel:"Hotel",airline:"Maskapai",travel_agency:"Agen Perjalanan",travel_insurance:"Asuransi Perjalanan",car_rental:"Rental Mobil",vpn:"VPN",hosting:"Hosting Web",website_builder:"Pembuat Website",crm:"CRM",email_marketing:"Email Marketing",ai_solutions:"Solusi AI",antivirus:"Antivirus",furniture:"Furnitur",mattress:"Kasur",power_tools:"Perkakas Listrik",security_system:"Sistem Keamanan",robot_mower:"Robot Pemotong Rumput",gym:"Gym",fitness_watch:"Jam Tangan Fitness",supplements:"Suplemen",health_app:"Aplikasi Kesehatan",online_courses:"Kursus Online",university:"Universitas",private_school:"Sekolah Swasta",language_courses:"Kursus Bahasa",online_store:"Toko Online",delivery:"Layanan Pengiriman",dropshipping:"Dropshipping" },
  vi: { tech:"Công nghệ",appliances:"Đồ gia dụng",auto:"Ô tô",financial:"Tài chính",telecom:"Viễn thông",energy:"Năng lượng",tourism:"Du lịch",software:"Phần mềm",home:"Nhà & Vườn",health:"Sức khỏe & Thể dục",education:"Giáo dục",ecommerce:"Thương mại điện tử",phone:"Điện thoại thông minh",laptop:"Máy tính xách tay",tablet:"Máy tính bảng",smartwatch:"Đồng hồ thông minh",headphones:"Tai nghe",tv:"TV",gaming:"Máy chơi game",monitor:"Màn hình",printer:"Máy in",fridge:"Tủ lạnh",washing_machine:"Máy giặt",dryer:"Máy sấy",vacuum:"Máy hút bụi",espresso:"Máy pha cà phê",oven:"Lò nướng & Bếp",aircon:"Điều hòa",new_car:"Xe mới",used_car:"Xe cũ",tires:"Lốp xe",car_insurance:"Bảo hiểm xe",ev_charger:"Trạm sạc xe điện",car_service:"Gara ô tô",personal_loan:"Vay cá nhân",mortgage:"Vay mua nhà",credit_card:"Thẻ tín dụng",bank_account:"Tài khoản ngân hàng",deposit:"Tiết kiệm",broker:"Môi giới đầu tư",insurance:"Bảo hiểm",mobile_plan:"Gói di động",prepaid:"SIM trả trước",internet:"Internet cố định",tv_package:"Gói truyền hình",phone_provider:"Nhà mạng",electricity:"Điện lực",gas_provider:"Nhà cung cấp gas",solar:"Pin mặt trời",battery_storage:"Lưu trữ pin",hotel:"Khách sạn",airline:"Hãng hàng không",travel_agency:"Công ty du lịch",travel_insurance:"Bảo hiểm du lịch",car_rental:"Thuê xe",vpn:"VPN",hosting:"Hosting",website_builder:"Công cụ tạo web",crm:"CRM",email_marketing:"Email marketing",ai_solutions:"Giải pháp AI",antivirus:"Phần mềm diệt virus",furniture:"Nội thất",mattress:"Nệm",power_tools:"Dụng cụ điện",security_system:"Hệ thống bảo mật",robot_mower:"Robot cắt cỏ",gym:"Phòng gym",fitness_watch:"Đồng hồ thể thao",supplements:"Thực phẩm chức năng",health_app:"App sức khỏe",online_courses:"Khóa học online",university:"Đại học",private_school:"Trường tư thục",language_courses:"Khóa học ngôn ngữ",online_store:"Cửa hàng online",delivery:"Dịch vụ giao hàng",dropshipping:"Dropshipping" },
  hi: { tech:"प्रौद्योगिकी",appliances:"घरेलू उपकरण",auto:"वाहन",financial:"वित्त",telecom:"दूरसंचार",energy:"ऊर्जा",tourism:"पर्यटन",software:"सॉफ्टवेयर",home:"घर & बगीचा",health:"स्वास्थ्य & फिटनेस",education:"शिक्षा",ecommerce:"ई-कॉमर्स",phone:"स्मार्टफोन",laptop:"लैपटॉप",tablet:"टैबलेट",smartwatch:"स्मार्टवॉच",headphones:"हेडफोन",tv:"टीवी",gaming:"गेमिंग कंसोल",monitor:"मॉनिटर",printer:"प्रिंटर",fridge:"रेफ्रिजरेटर",washing_machine:"वॉशिंग मशीन",dryer:"ड्रायर",vacuum:"वैक्यूम क्लीनर",espresso:"कॉफी मशीन",oven:"ओवन & चूल्हा",aircon:"एयर कंडीशनर",new_car:"नई कार",used_car:"पुरानी कार",tires:"टायर",car_insurance:"कार बीमा",ev_charger:"EV चार्जर",car_service:"कार सर्विस",personal_loan:"व्यक्तिगत ऋण",mortgage:"होम लोन",credit_card:"क्रेडिट कार्ड",bank_account:"बैंक खाता",deposit:"जमा राशि",broker:"निवेश दलाल",insurance:"बीमा",mobile_plan:"मोबाइल प्लान",prepaid:"प्रीपेड SIM",internet:"ब्रॉडबैंड",tv_package:"TV पैकेज",phone_provider:"फोन कंपनी",electricity:"बिजली",gas_provider:"गैस",solar:"सौर पैनल",battery_storage:"बैटरी स्टोरेज",hotel:"होटल",airline:"एयरलाइन",travel_agency:"ट्रैवल एजेंसी",travel_insurance:"यात्रा बीमा",car_rental:"कार किराया",vpn:"VPN",hosting:"वेब होस्टिंग",website_builder:"वेबसाइट बिल्डर",crm:"CRM",email_marketing:"ईमेल मार्केटिंग",ai_solutions:"AI समाधान",antivirus:"एंटीवायरस",furniture:"फर्नीचर",mattress:"गद्दा",power_tools:"बिजली के उपकरण",security_system:"सुरक्षा प्रणाली",robot_mower:"रोबोट लॉनमोवर",gym:"जिम",fitness_watch:"फिटनेस वॉच",supplements:"सप्लीमेंट्स",health_app:"स्वास्थ्य ऐप",online_courses:"ऑनलाइन कोर्स",university:"विश्वविद्यालय",private_school:"निजी स्कूल",language_courses:"भाषा पाठ्यक्रम",online_store:"ऑनलाइन स्टोर",delivery:"डिलीवरी सेवाएं",dropshipping:"ड्रॉपशिपिंग" },
  th: { tech:"เทคโนโลยี",appliances:"เครื่องใช้ไฟฟ้า",auto:"ยานยนต์",financial:"การเงิน",telecom:"โทรคมนาคม",energy:"พลังงาน",tourism:"การท่องเที่ยว",software:"ซอฟต์แวร์",home:"บ้านและสวน",health:"สุขภาพและฟิตเนส",education:"การศึกษา",ecommerce:"อีคอมเมิร์ซ",phone:"สมาร์ทโฟน",laptop:"แล็ปท็อป",tablet:"แท็บเล็ต",smartwatch:"สมาร์ทวอทช์",headphones:"หูฟัง",tv:"โทรทัศน์",gaming:"เครื่องเล่นเกม",monitor:"มอนิเตอร์",printer:"เครื่องพิมพ์",fridge:"ตู้เย็น",washing_machine:"เครื่องซักผ้า",dryer:"เครื่องอบผ้า",vacuum:"เครื่องดูดฝุ่น",espresso:"เครื่องชงกาแฟ",oven:"เตาอบและเตาแก๊ส",aircon:"เครื่องปรับอากาศ",new_car:"รถยนต์ใหม่",used_car:"รถยนต์มือสอง",tires:"ยางรถยนต์",car_insurance:"ประกันรถยนต์",ev_charger:"เครื่องชาร์จ EV",car_service:"ศูนย์บริการรถยนต์",personal_loan:"สินเชื่อส่วนบุคคล",mortgage:"สินเชื่อบ้าน",credit_card:"บัตรเครดิต",bank_account:"บัญชีธนาคาร",deposit:"เงินฝาก",broker:"นายหน้าลงทุน",insurance:"ประกันภัย",mobile_plan:"แพ็คเกจมือถือ",prepaid:"ซิมเติมเงิน",internet:"อินเทอร์เน็ตบ้าน",tv_package:"แพ็คเกจทีวี",phone_provider:"ผู้ให้บริการโทรศัพท์",electricity:"ผู้ให้บริการไฟฟ้า",gas_provider:"ผู้ให้บริการแก๊ส",solar:"แผงโซลาร์เซลล์",battery_storage:"แบตเตอรี่สำรอง",hotel:"โรงแรม",airline:"สายการบิน",travel_agency:"บริษัทท่องเที่ยว",travel_insurance:"ประกันการเดินทาง",car_rental:"เช่ารถ",vpn:"VPN",hosting:"เว็บโฮสติ้ง",website_builder:"ตัวสร้างเว็บไซต์",crm:"CRM",email_marketing:"อีเมลมาร์เกตติ้ง",ai_solutions:"โซลูชัน AI",antivirus:"แอนตี้ไวรัส",furniture:"เฟอร์นิเจอร์",mattress:"ที่นอน",power_tools:"เครื่องมือไฟฟ้า",security_system:"ระบบรักษาความปลอดภัย",robot_mower:"หุ่นยนต์ตัดหญ้า",gym:"ฟิตเนส",fitness_watch:"นาฬิกาฟิตเนส",supplements:"อาหารเสริม",health_app:"แอปสุขภาพ",online_courses:"คอร์สออนไลน์",university:"มหาวิทยาลัย",private_school:"โรงเรียนเอกชน",language_courses:"คอร์สภาษา",online_store:"ร้านค้าออนไลน์",delivery:"บริการจัดส่ง",dropshipping:"ดรอปชิปปิ้ง" },
  he: { tech:"טכנולוגיה",appliances:"מוצרי חשמל",auto:"רכבים",financial:"פיננסים",telecom:"תקשורת",energy:"אנרגיה",tourism:"תיירות",software:"תוכנה",home:"בית וגן",health:"בריאות וכושר",education:"חינוך",ecommerce:"מסחר אלקטרוני",phone:"סמארטפונים",laptop:"מחשבים ניידים",tablet:"טאבלטים",smartwatch:"שעונים חכמים",headphones:"אוזניות",tv:"טלוויזיות",gaming:"קונסולות משחק",monitor:"מסכים",printer:"מדפסות",fridge:"מקררים",washing_machine:"מכונות כביסה",dryer:"מייבשי כביסה",vacuum:"שואבי אבק",espresso:"מכונות קפה",oven:"תנורים וכיריים",aircon:"מזגנים",new_car:"רכבים חדשים",used_car:"רכבים יד שנייה",tires:"צמיגים",car_insurance:"ביטוח רכב",ev_charger:"עמדות טעינה",car_service:"מוסכים",personal_loan:"הלוואות אישיות",mortgage:"משכנתאות",credit_card:"כרטיסי אשראי",bank_account:"חשבונות בנק",deposit:"פיקדונות",broker:"ברוקרים",insurance:"ביטוחים",mobile_plan:"חבילות סלולר",prepaid:"כרטיס שים",internet:"אינטרנט קווי",tv_package:"חבילות טלוויזיה",phone_provider:"ספקי טלפון",electricity:"ספקי חשמל",gas_provider:"ספקי גז",solar:"פאנלים סולאריים",battery_storage:"אגירת אנרגיה",hotel:"מלונות",airline:"חברות תעופה",travel_agency:"סוכנויות נסיעות",travel_insurance:"ביטוח נסיעות",car_rental:"השכרת רכב",vpn:"VPN",hosting:"אחסון אתרים",website_builder:"בוני אתרים",crm:"CRM",email_marketing:"שיווק במייל",ai_solutions:"פתרונות AI",antivirus:"אנטי וירוס",furniture:"רהיטים",mattress:"מזרנים",power_tools:"כלי עבודה",security_system:"מערכות אבטחה",robot_mower:"רובוט כיסוח",gym:"חדרי כושר",fitness_watch:"שעוני כושר",supplements:"תוספי תזונה",health_app:"אפליקציות בריאות",online_courses:"קורסים אונליין",university:"אוניברסיטאות",private_school:"בתי ספר פרטיים",language_courses:"קורסי שפות",online_store:"חנויות אונליין",delivery:"שירותי משלוח",dropshipping:"דרופשיפינג" },
  bg: { tech:"Технологии",appliances:"Домакински уреди",auto:"Автомобили",financial:"Финанси",telecom:"Телекомуникации",energy:"Енергия",tourism:"Туризъм",software:"Софтуер",home:"Дом и Градина",health:"Здраве и Фитнес",education:"Образование",ecommerce:"Е-търговия",phone:"Смартфони",laptop:"Лаптопи",tablet:"Таблети",smartwatch:"Смарт часовници",headphones:"Слушалки",tv:"Телевизори",gaming:"Игрови конзоли",monitor:"Монитори",printer:"Принтери",fridge:"Хладилници",washing_machine:"Перални машини",dryer:"Сушилни машини",vacuum:"Прахосмукачки",espresso:"Кафемашини",oven:"Фурни и Котлони",aircon:"Климатици",new_car:"Нови коли",used_car:"Употребявани коли",tires:"Гуми",car_insurance:"Автозастраховане",ev_charger:"Зарядни за ЕВ",car_service:"Автосервизи",personal_loan:"Потребителски кредити",mortgage:"Ипотечни кредити",credit_card:"Кредитни карти",bank_account:"Банкови сметки",deposit:"Депозити",broker:"Инвестиционни брокери",insurance:"Застраховки",mobile_plan:"Мобилни абонаменти",prepaid:"Предплатени карти",internet:"Стационарен интернет",tv_package:"ТВ пакети",phone_provider:"Телефонни оператори",electricity:"Доставчици на ток",gas_provider:"Доставчици на газ",solar:"Соларни панели",battery_storage:"Батерийно съхранение",hotel:"Хотели",airline:"Авиокомпании",travel_agency:"Туристически агенции",travel_insurance:"Пътническа застраховка",car_rental:"Коли под наем",vpn:"VPN",hosting:"Уеб хостинг",website_builder:"Конструктори на сайтове",crm:"CRM",email_marketing:"Имейл маркетинг",ai_solutions:"AI решения",antivirus:"Антивирусни програми",furniture:"Мебели",mattress:"Матраци",power_tools:"Електроинструменти",security_system:"Системи за сигурност",robot_mower:"Роботи косачки",gym:"Фитнес центрове",fitness_watch:"Фитнес часовници",supplements:"Хранителни добавки",health_app:"Здравни приложения",online_courses:"Онлайн курсове",university:"Университети",private_school:"Частни училища",language_courses:"Езикови курсове",online_store:"Онлайн магазини",delivery:"Куриерски услуги",dropshipping:"Дропшипинг" },
  sk: { tech:"Technológia",appliances:"Domáce spotrebiče",auto:"Automobily",financial:"Financie",telecom:"Telekomunikácie",energy:"Energia",tourism:"Cestovný ruch",software:"Softvér",home:"Dom a záhrada",health:"Zdravie a fitness",education:"Vzdelávanie",ecommerce:"E-commerce",phone:"Smartfóny",laptop:"Notebooky",tablet:"Tablety",smartwatch:"Inteligentné hodinky",headphones:"Slúchadlá",tv:"Televízory",gaming:"Herné konzoly",monitor:"Monitory",printer:"Tlačiarne",fridge:"Chladničky",washing_machine:"Práčky",dryer:"Sušičky",vacuum:"Vysávače",espresso:"Kávovary",oven:"Rúry a sporáky",aircon:"Klimatizácia",new_car:"Nové autá",used_car:"Ojazené autá",tires:"Pneumatiky",car_insurance:"Poistenie vozidla",ev_charger:"Nabíjačky pre EV",car_service:"Autoservisy",personal_loan:"Osobné pôžičky",mortgage:"Hypotéky",credit_card:"Kreditné karty",bank_account:"Bankové účty",deposit:"Vklady",broker:"Investiční makléri",insurance:"Poistenie",mobile_plan:"Mobilné tarify",prepaid:"Predplatené SIM",internet:"Pevný internet",tv_package:"TV balíčky",phone_provider:"Operátori",electricity:"Dodávatelia elektriny",gas_provider:"Dodávatelia plynu",solar:"Solárne panely",battery_storage:"Batériové zásobníky",hotel:"Hotely",airline:"Letecké spoločnosti",travel_agency:"Cestovné kancelárie",travel_insurance:"Cestovné poistenie",car_rental:"Požičovne áut",vpn:"VPN",hosting:"Webhosting",website_builder:"Tvorcovia stránok",crm:"CRM",email_marketing:"E-mail marketing",ai_solutions:"AI riešenia",antivirus:"Antivírusový softvér",furniture:"Nábytok",mattress:"Matrace",power_tools:"Elektrické náradie",security_system:"Bezpečnostné systémy",robot_mower:"Robotické kosačky",gym:"Fitnescentrá",fitness_watch:"Fitness hodinky",supplements:"Výživové doplnky",health_app:"Zdravotné aplikácie",online_courses:"Online kurzy",university:"Univerzity",private_school:"Súkromné školy",language_courses:"Jazykové kurzy",online_store:"Internetové obchody",delivery:"Doručovacie služby",dropshipping:"Dropshipping" },
  hr: { tech:"Tehnologija",appliances:"Kućanski aparati",auto:"Automobili",financial:"Financije",telecom:"Telekomunikacije",energy:"Energija",tourism:"Turizam",software:"Softver",home:"Dom i vrt",health:"Zdravlje i fitness",education:"Obrazovanje",ecommerce:"E-trgovina",phone:"Pametni telefoni",laptop:"Prijenosna računala",tablet:"Tableti",smartwatch:"Pametni satovi",headphones:"Slušalice",tv:"Televizori",gaming:"Igraće konzole",monitor:"Monitori",printer:"Pisači",fridge:"Hladnjaci",washing_machine:"Perilice rublja",dryer:"Sušilice",vacuum:"Usisavači",espresso:"Aparati za kavu",oven:"Pećnice i štednjaci",aircon:"Klima uređaji",new_car:"Novi automobili",used_car:"Rabljeni automobili",tires:"Gume",car_insurance:"Osiguranje vozila",ev_charger:"Punjači za EV",car_service:"Autoservisi",personal_loan:"Osobni zajmovi",mortgage:"Stambeni krediti",credit_card:"Kreditne kartice",bank_account:"Bankovni računi",deposit:"Štedni depoziti",broker:"Investicijski brokeri",insurance:"Osiguranje",mobile_plan:"Mobilni paketi",prepaid:"Prepaid SIM",internet:"Fiksni internet",tv_package:"TV paketi",phone_provider:"Telefonski operateri",electricity:"Opskrbljivači strujom",gas_provider:"Opskrbljivači plinom",solar:"Solarne ploče",battery_storage:"Pohrana energije",hotel:"Hoteli",airline:"Zrakoplovne tvrtke",travel_agency:"Putničke agencije",travel_insurance:"Putno osiguranje",car_rental:"Najam automobila",vpn:"VPN",hosting:"Web hosting",website_builder:"Graditelji web stranica",crm:"CRM",email_marketing:"E-mail marketing",ai_solutions:"AI rješenja",antivirus:"Antivirusi",furniture:"Namještaj",mattress:"Madraci",power_tools:"Električni alati",security_system:"Sigurnosni sustavi",robot_mower:"Robotski kosilica",gym:"Teretane",fitness_watch:"Fitness satovi",supplements:"Dodaci prehrani",health_app:"Zdravstvene aplikacije",online_courses:"Online tečajevi",university:"Sveučilišta",private_school:"Privatne škole",language_courses:"Jezični tečajevi",online_store:"Online trgovine",delivery:"Dostavne usluge",dropshipping:"Dropshipping" },
};

function catName(id, lang) {
  return (CAT_I18N[lang] || CAT_I18N.en)[id] || CAT_I18N.en[id] || id;
}
const CATEGORY_GROUPS = [
  { id:"tech",       label:"Tehnologie",                emoji:"💻", color:"#0891B2", subs:[
    { id:"phone",           label:"Telefoane",           emoji:"📱", image:img("photo-1511707171634-5f897ff02aa9") },
    { id:"laptop",          label:"Laptopuri",           emoji:"💻", image:img("photo-1496181133206-80ce9b88a853") },
    { id:"tablet",          label:"Tablete",             emoji:"📲", image:img("photo-1544244015-0df4b3ffc6b0") },
    { id:"smartwatch",      label:"Smartwatch-uri",      emoji:"⌚", image:img("photo-1523275335684-37898b6baf30") },
    { id:"headphones",      label:"Căști audio",         emoji:"🎧", image:img("photo-1505740420928-5e560c06d30e") },
    { id:"tv",              label:"Televizoare",         emoji:"📺", image:img("photo-1593784991095-a205069470b6") },
    { id:"gaming",          label:"Console gaming",      emoji:"🎮", image:img("photo-1542751371-adc38448a05e") },
    { id:"monitor",         label:"Monitoare",           emoji:"🖥️", image:img("photo-1527443224154-c4a3942d3acf") },
    { id:"printer",         label:"Imprimante",          emoji:"🖨️", image:img("photo-1612815154858-60aa4c59eaa6") },
  ]},
  { id:"appliances", label:"Electrocasnice",            emoji:"🏠", color:"#059669", subs:[
    { id:"fridge",          label:"Frigidere",           emoji:"❄️", image:img("photo-1571175443880-49e1d25b2bc5") },
    { id:"washing_machine", label:"Mașini de spălat",   emoji:"🌊", image:img("photo-1626806787461-102c1bfaaea1") },
    { id:"dryer",           label:"Uscătoare",           emoji:"🌀", image:img("photo-1604335398989-7d4c0748dcc8") },
    { id:"vacuum",          label:"Aspiratoare",         emoji:"🌪️", image:img("photo-1558618047-3c8c76ca7d13") },
    { id:"espresso",        label:"Espressoare",         emoji:"☕", image:img("photo-1495474472287-4d71bcdd2085") },
    { id:"oven",            label:"Cuptoare și plite",   emoji:"🔥", image:img("photo-1556909114-f6e7ad7d3136") },
    { id:"aircon",          label:"Aer condiționat",     emoji:"❄️", image:img("photo-1631049307264-da0ec9d70304") },
  ]},
  { id:"auto",       label:"Auto",                      emoji:"🚗", color:"#DC2626", subs:[
    { id:"new_car",         label:"Mașini noi",          emoji:"🚗", image:img("photo-1558618666-fcd25c85cd64") },
    { id:"used_car",        label:"Mașini second-hand",  emoji:"🔑", image:img("photo-1494976388531-d1058494cdd8") },
    { id:"tires",           label:"Anvelope",            emoji:"⚙️", image:img("photo-1558618047-3c8c76ca7d13") },
    { id:"car_insurance",   label:"Asigurări auto",      emoji:"🛡️", image:img("photo-1450101499163-c8848c66ca85") },
    { id:"ev_charger",      label:"Stații încărcare EV", emoji:"⚡", image:img("photo-1593941707882-a56ae58a2cf1") },
    { id:"car_service",     label:"Service-uri auto",    emoji:"🔧", image:img("photo-1619767886558-efdc259cde1a") },
  ]},
  { id:"financial",  label:"Financiar",                 emoji:"💳", color:"#1A56DB", subs:[
    { id:"personal_loan",   label:"Credite personale",   emoji:"💵", image:img("photo-1565514020179-026b92b84bb6") },
    { id:"mortgage",        label:"Credite ipotecare",   emoji:"🏦", image:img("photo-1580587771525-78b9dba3b914") },
    { id:"credit_card",     label:"Carduri de credit",   emoji:"💳", image:img("photo-1556742049-0cfed4f6a45d") },
    { id:"bank_account",    label:"Conturi bancare",     emoji:"🏛️", image:img("photo-1601597111158-2fceff292cdc") },
    { id:"deposit",         label:"Depozite",            emoji:"📈", image:img("photo-1611974789855-9c2a0a7236a3") },
    { id:"broker",          label:"Brokeri de investiții",emoji:"📊", image:img("photo-1611974789855-9c2a0a7236a3") },
    { id:"insurance",       label:"Asigurări",           emoji:"🛡️", image:img("photo-1450101499163-c8848c66ca85") },
  ]},
  { id:"telecom",    label:"Mobile & Internet",            emoji:"📡", color:"#7C3AED", subs:[
    { id:"mobile_plan",     label:"Abonamente mobile",   emoji:"📱", image:img("photo-1511707171634-5f897ff02aa9") },
    { id:"prepaid",         label:"Cartele preplătite",  emoji:"📲", image:img("photo-1601784551446-20c9e07cdbdb") },
    { id:"internet",        label:"Internet fix",        emoji:"🌐", image:img("photo-1558618047-3c8c76ca7d13") },
    { id:"tv_package",      label:"Pachete TV",          emoji:"📺", image:img("photo-1593784991095-a205069470b6") },
    { id:"phone_provider",  label:"Furnizori de telefonie",emoji:"☎️", image:img("photo-1551650975-87deedd944c3") },
  ]},
  { id:"energy",     label:"Energie și utilități",      emoji:"⚡", color:"#D97706", subs:[
    { id:"electricity",     label:"Energie electrică",   emoji:"💡", image:img("photo-1473341304170-971dccb5ac1e") },
    { id:"gas_provider",    label:"Furnizori gaze",      emoji:"🔥", image:img("photo-1611974789855-9c2a0a7236a3") },
    { id:"solar",           label:"Panouri solare",      emoji:"☀️", image:img("photo-1509391366360-2e959784a276") },
    { id:"battery_storage", label:"Baterii de stocare",  emoji:"🔋", image:img("photo-1593941707882-a56ae58a2cf1") },
  ]},
  { id:"tourism",    label:"Turism",                    emoji:"✈️", color:"#0369A1", subs:[
    { id:"hotel",           label:"Hoteluri",            emoji:"🏨", image:img("photo-1566073771259-6a8506099945") },
    { id:"airline",         label:"Companii aeriene",    emoji:"✈️", image:img("photo-1436491865332-7a61a109cc05") },
    { id:"travel_agency",   label:"Agenții de turism",   emoji:"🌍", image:img("photo-1488085061387-422e29b40080") },
    { id:"travel_insurance",label:"Asigurări de călătorie",emoji:"🛡️", image:img("photo-1450101499163-c8848c66ca85") },
    { id:"car_rental",      label:"Închirieri auto",     emoji:"🚙", image:img("photo-1494976388531-d1058494cdd8") },
  ]},
  { id:"software",   label:"Software și servicii online",emoji:"🖥️", color:"#4F46E5", subs:[
    { id:"vpn",             label:"VPN-uri",             emoji:"🔒", image:img("photo-1558618047-3c8c76ca7d13") },
    { id:"hosting",         label:"Hosting web",         emoji:"☁️", image:img("photo-1558618047-3c8c76ca7d13") },
    { id:"website_builder", label:"Constructori de site-uri",emoji:"🌐", image:img("photo-1561070791-2526d30994b5") },
    { id:"crm",             label:"CRM-uri",             emoji:"📊", image:img("photo-1454165804606-c3d57bc86b40") },
    { id:"email_marketing", label:"Email marketing",     emoji:"📧", image:img("photo-1563986768609-322da13575f3") },
    { id:"ai_solutions",    label:"Soluții AI",          emoji:"🤖", image:img("photo-1677442136019-21780ecad995") },
    { id:"antivirus",       label:"Antiviruși",          emoji:"🛡️", image:img("photo-1614064641938-3bbee52942c7") },
  ]},
  { id:"home",       label:"Casă și grădină",           emoji:"🏡", color:"#065F46", subs:[
    { id:"furniture",       label:"Mobilă",              emoji:"🛋️", image:img("photo-1555041469-a586c61ea9bc") },
    { id:"mattress",        label:"Saltele",             emoji:"😴", image:img("photo-1631049307264-da0ec9d70304") },
    { id:"power_tools",     label:"Unelte electrice",    emoji:"🔨", image:img("photo-1504148455328-c376907d081c") },
    { id:"security_system", label:"Sisteme de securitate",emoji:"📹", image:img("photo-1558002038-1055907df827") },
    { id:"robot_mower",     label:"Roboți de tuns iarba",emoji:"🌿", image:img("photo-1558618666-fcd25c85cd64") },
  ]},
  { id:"health",     label:"Sănătate și fitness",       emoji:"💪", color:"#059669", subs:[
    { id:"gym",             label:"Săli de fitness",     emoji:"🏋️", image:img("photo-1517836357463-d25dfeac3438") },
    { id:"fitness_watch",   label:"Ceasuri fitness",     emoji:"⌚", image:img("photo-1523275335684-37898b6baf30") },
    { id:"supplements",     label:"Suplimente",          emoji:"💊", image:img("photo-1584308666744-24d5c474f2ae") },
    { id:"health_app",      label:"Aplicații de sănătate",emoji:"📱", image:img("photo-1576091160550-2173dba999ef") },
  ]},
  { id:"education",  label:"Educație",                  emoji:"📚", color:"#7C3AED", subs:[
    { id:"online_courses",  label:"Cursuri online",      emoji:"💻", image:img("photo-1501504905252-473c47e087f8") },
    { id:"university",      label:"Universități",        emoji:"🎓", image:img("photo-1562774053-701939374585") },
    { id:"private_school",  label:"Școli private",       emoji:"🏫", image:img("photo-1580582932707-520aed937b7b") },
    { id:"language_courses",label:"Cursuri de limbi",    emoji:"🌍", image:img("photo-1488085061387-422e29b40080") },
  ]},
  { id:"ecommerce",  label:"E-commerce și marketplace", emoji:"🛒", color:"#DB2777", subs:[
    { id:"online_store",    label:"Magazine online",     emoji:"🛍️", image:img("photo-1526170375885-4d8ecf77b99f") },
    { id:"delivery",        label:"Servicii de livrare", emoji:"📦", image:img("photo-1566576912321-d58ddd7a6088") },
    { id:"dropshipping",    label:"Platforme dropshipping",emoji:"📦", image:img("photo-1551288049-bebda4e38f71") },
  ]},
];

// Flatten for backwards compatibility

const STATUSES = [
  { id:"mr",    label:"Mr.",    emoji:"👔" },
  { id:"mrs",   label:"Mrs.",   emoji:"👗" },
  { id:"ms",    label:"Ms.",    emoji:"💼" },
  { id:"mx",    label:"Mx.",    emoji:"🌈" },
  { id:"dr",    label:"Dr.",    emoji:"🩺" },
  { id:"prof",  label:"Prof.",  emoji:"🎓" },
  { id:"family",label:"Family", emoji:"👨‍👩‍👧‍👦" },
  { id:"student",label:"Student",emoji:"📚" },
  { id:"single",label:"Single", emoji:"🏠" },
  { id:"couple",label:"Couple", emoji:"💑" },
  { id:"senior",label:"Senior", emoji:"🌟" },
  { id:"expat", label:"Expat",  emoji:"🌍" },
  { id:"divorced",label:"Divorced",emoji:"🔄"},
  { id:"professional",label:"Professional",emoji:"💼"},
];
const CATEGORIES_LIST = CATEGORY_GROUPS.flatMap(g => g.subs.map(s => ({...s, groupId: g.id, groupLabel: g.label, color: g.color, desc: g.label})));


async function handleUpgrade(plan = "pro") {
  try {
    const response = await fetch("/api/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await response.json();
    if (data.url) window.location.href = data.url;
    else alert("Something went wrong. Please try again.");
  } catch {
    alert("Connection error. Please try again.");
  }
}
function Badge({ children, color = "#1A56DB" }) {
  return (
    <span style={{
      background: color + "18", color,
      border: `1px solid ${color}35`,
      borderRadius: 6, padding: "3px 10px",
      fontSize: 11, fontWeight: 700,
      letterSpacing: 0.6, textTransform: "uppercase",
    }}>{children}</span>
  );
}


// ── UI Translations for all screens ──────────────────────────────────────────
const UI_T = {
  back:      {en:"← Back",de:"← Zurück",fr:"← Retour",es:"← Volver",it:"← Indietro",pt:"← Voltar",ro:"← Înapoi",nl:"← Terug",pl:"← Wstecz",ru:"← Назад",zh:"← 返回",ar:"← رجوع",tr:"← Geri",sv:"← Tillbaka",da:"← Tilbage",no:"← Tilbake",fi:"← Takaisin",cs:"← Zpět",hu:"← Vissza",uk:"← Назад",ko:"← 뒤로",ja:"← 戻る",id:"← Kembali",vi:"← Quay lại",hi:"← वापस",th:"← กลับ",he:"← חזרה",bg:"← Назад",sk:"← Späť",hr:"← Natrag"},
  home:      {en:"Home",de:"Startseite",fr:"Accueil",es:"Inicio",it:"Home",pt:"Início",ro:"Acasă",nl:"Home",pl:"Strona główna",ru:"Главная",zh:"首页",ar:"الرئيسية",tr:"Ana Sayfa"},
  startOver: {en:"Start over",de:"Neu starten",fr:"Recommencer",es:"Empezar de nuevo",it:"Ricomincia",pt:"Recomeçar",ro:"Ia de la capăt",nl:"Opnieuw beginnen",pl:"Zacznij od nowa",ru:"Начать заново",zh:"重新开始",ar:"ابدأ من جديد",tr:"Yeniden başla",sv:"Börja om",da:"Start forfra",no:"Start på nytt",fi:"Aloita alusta",cs:"Začít znovu",hu:"Újrakezdés",uk:"Почати знову",ko:"다시 시작",ja:"やり直す",id:"Mulai ulang",vi:"Bắt đầu lại",hi:"फिर से शुरू",th:"เริ่มใหม่",he:"התחל מחדש",bg:"Започни отново",sk:"Začať znovu",hr:"Počni ispočetka"},
  pros:      {en:"Pros",de:"Vorteile",fr:"Avantages",es:"Ventajas",it:"Pro",pt:"Vantagens",ro:"Avantaje",nl:"Voordelen",pl:"Zalety",ru:"Плюсы",zh:"优点",ar:"المزايا",tr:"Artılar",sv:"Fördelar",da:"Fordele",no:"Fordeler",fi:"Edut",cs:"Výhody",hu:"Előnyök",uk:"Переваги",ko:"장점",ja:"メリット",id:"Kelebihan",vi:"Ưu điểm",hi:"फायदे",th:"ข้อดี",he:"יתרונות",bg:"Предимства",sk:"Výhody",hr:"Prednosti"},
  cons:      {en:"Cons",de:"Nachteile",fr:"Inconvénients",es:"Desventajas",it:"Contro",pt:"Desvantagens",ro:"Dezavantaje",nl:"Nadelen",pl:"Wady",ru:"Минусы",zh:"缺点",ar:"العيوب",tr:"Eksiler",sv:"Nackdelar",da:"Ulemper",no:"Ulemper",fi:"Haitat",cs:"Nevýhody",hu:"Hátrányok",uk:"Недоліки",ko:"단점",ja:"デメリット",id:"Kekurangan",vi:"Nhược điểm",hi:"नुकसान",th:"ข้อเสีย",he:"חסרונות",bg:"Недостатъци",sk:"Nevýhody",hr:"Nedostaci"},
  viewDeal:  {en:"View deal →",de:"Zum Angebot →",fr:"Voir l'offre →",es:"Ver oferta →",it:"Vedi offerta →",pt:"Ver oferta →",ro:"Vezi oferta →",nl:"Bekijk deal →",pl:"Zobacz ofertę →",ru:"Смотреть →",zh:"查看优惠 →",ar:"عرض الصفقة →",tr:"Teklifi gör →",sv:"Se erbjudande →",da:"Se tilbud →",no:"Se tilbud →",fi:"Katso tarjous →",cs:"Zobrazit nabídku →",hu:"Ajánlat megtekintése →",uk:"Переглянути →",ko:"딜 보기 →",ja:"詳細を見る →",id:"Lihat penawaran →",vi:"Xem ưu đãi →",hi:"डील देखें →",th:"ดูดีล →",he:"לצפות בעסקה →",bg:"Виж офертата →",sk:"Zobraziť ponuku →",hr:"Pogledaj ponudu →"},
  whyForYou: {en:"Why this for you",de:"Warum genau das",fr:"Pourquoi ce choix",es:"Por qué esto",it:"Perché questo",pt:"Por que isso",ro:"De ce tocmai asta",nl:"Waarom dit voor jou",pl:"Dlaczego to",ru:"Почему именно это",zh:"为什么推荐给你",ar:"لماذا هذا لك",tr:"Neden bu sizin için"},
  topPick:   {en:"Top pick",de:"Top-Wahl",fr:"Meilleur choix",es:"Mejor opción",it:"Scelta top",pt:"Melhor escolha",ro:"Alegerea nr.1",nl:"Topkeuze",pl:"Najlepszy wybór",ru:"Лучший выбор",zh:"最佳选择",ar:"أفضل اختيار",tr:"En iyi seçim"},
  poweredBy: {en:"Powered by AI · Sources: CNET, TechRadar, Wirecutter",de:"KI-gestützt · Quellen: CNET, TechRadar, Wirecutter",fr:"Propulsé par IA · Sources: CNET, TechRadar, Wirecutter",es:"Impulsado por IA · Fuentes: CNET, TechRadar, Wirecutter",it:"Con IA · Fonti: CNET, TechRadar, Wirecutter",pt:"Com IA · Fontes: CNET, TechRadar, Wirecutter",ro:"Powered by AI · Surse: CNET, TechRadar, Wirecutter",nl:"AI-gestuurd · Bronnen: CNET, TechRadar, Wirecutter",pl:"Napędzane przez AI · Źródła: CNET, TechRadar, Wirecutter",ru:"На основе ИИ · Источники: CNET, TechRadar, Wirecutter",zh:"AI 驱动 · 来源: CNET, TechRadar, Wirecutter",ar:"مدعوم بالذكاء الاصطناعي",tr:"Yapay Zeka Destekli · Kaynaklar: CNET, TechRadar, Wirecutter"},
  chatWith:  {en:"Chat with Ai·sel",de:"Mit Ai·sel chatten",fr:"Discuter avec Ai·sel",es:"Chatear con Ai·sel",it:"Chatta con Ai·sel",pt:"Conversar com Ai·sel",ro:"Discută cu Ai·sel",nl:"Chat met Ai·sel",pl:"Porozmawiaj z Ai·sel",ru:"Общаться с Ai·sel",zh:"与 Ai·sel 聊天",ar:"تحدث مع Ai·sel",tr:"Ai·sel ile sohbet et",sv:"Chatta med Ai·sel",ko:"Ai·sel과 채팅",ja:"Ai·selとチャット"},
  poweredAI:{en:"Powered by AI",de:"KI-gestützt",fr:"Propulsé par IA",es:"Impulsado por IA",it:"Con IA",pt:"Com IA",ro:"Powered by AI",nl:"AI-gestuurd",pl:"Napędzane przez AI",ru:"На основе ИИ",zh:"AI 驱动",ar:"بالذكاء الاصطناعي",tr:"Yapay Zeka ile"},
  sources:   {en:"Sources",de:"Quellen",fr:"Sources",es:"Fuentes",it:"Fonti",pt:"Fontes",ro:"Surse",nl:"Bronnen",pl:"Źródła",ru:"Источники",zh:"来源",ar:"المصادر",tr:"Kaynaklar"},
  chatMore:  {en:"Want more personalized advice? Chat with Ai·sel.",de:"Möchten Sie mehr Beratung? Chatten Sie mit Ai·sel.",fr:"Vous voulez des conseils? Discutez avec Ai·sel.",es:"¿Quieres consejos? Chatea con Ai·sel.",it:"Vuoi consigli? Chatta con Ai·sel.",pt:"Quer conselhos? Converse com Ai·sel.",ro:"Vrei sfaturi? Discută cu Ai·sel.",nl:"Wil je advies? Chat met Ai·sel.",pl:"Chcesz porad? Porozmawiaj z Ai·sel.",ru:"Хотите советов? Пообщайтесь с Ai·sel.",zh:"想要建议？与 Ai·sel 聊天。",ar:"هل تريد نصائح؟ تحدث مع Ai·sel.",tr:"Tavsiye mi istiyorsunuz? Ai·sel ile sohbet edin."},
  loadSteps: {
    en:["Analyzing your preferences...","Searching trusted review sources...","Comparing top options worldwide...","Calculating best matches...","Finalizing recommendations..."],
    de:["Präferenzen analysieren...","Testberichte durchsuchen...","Top-Optionen vergleichen...","Beste Treffer berechnen...","Empfehlungen fertigstellen..."],
    fr:["Analyse des préférences...","Recherche de sources fiables...","Comparaison des meilleures options...","Calcul des meilleures correspondances...","Finalisation des recommandations..."],
    es:["Analizando preferencias...","Buscando fuentes confiables...","Comparando mejores opciones...","Calculando mejores coincidencias...","Finalizando recomendaciones..."],
    it:["Analisi preferenze...","Ricerca fonti attendibili...","Confronto migliori opzioni...","Calcolo migliori corrispondenze...","Finalizzazione raccomandazioni..."],
    pt:["Analisando preferências...","Pesquisando fontes confiáveis...","Comparando melhores opções...","Calculando melhores correspondências...","Finalizando recomendações..."],
    ro:["Analizăm preferințele...","Căutăm surse de încredere...","Comparăm cele mai bune opțiuni...","Calculăm potrivirile...","Finalizăm recomandările..."],
    nl:["Voorkeuren analyseren...","Betrouwbare bronnen zoeken...","Top opties vergelijken...","Beste overeenkomsten berekenen...","Aanbevelingen afronden..."],
    pl:["Analizowanie preferencji...","Wyszukiwanie źródeł...","Porównywanie opcji...","Obliczanie dopasowań...","Finalizowanie rekomendacji..."],
    ru:["Анализируем предпочтения...","Ищем источники...","Сравниваем варианты...","Рассчитываем совпадения...","Завершаем рекомендации..."],
    zh:["分析偏好...","搜索评测来源...","比较顶级选项...","计算最佳匹配...","完成推荐..."],
    ar:["تحليل التفضيلات...","البحث في المصادر...","مقارنة الخيارات...","حساب أفضل التطابقات...","إنهاء التوصيات..."],
    tr:["Tercihler analiz ediliyor...","Kaynaklar aranıyor...","Seçenekler karşılaştırılıyor...","Eşleşmeler hesaplanıyor...","Öneriler tamamlanıyor..."],
    sv:["Analyserar preferenser...","Söker pålitliga källor...","Jämför bästa alternativ...","Beräknar bästa matchningar...","Slutför rekommendationer..."],
    ko:["선호도 분석 중...","신뢰할 수 있는 소스 검색 중...","최고의 옵션 비교 중...","최적의 매칭 계산 중...","추천 완료 중..."],
    ja:["好みを分析中...","信頼できるレビューを検索中...","トップオプションを比較中...","最適なマッチを計算中...","推薦を確定中..."],
  },
  question:  {en:"Question",de:"Frage",fr:"Question",es:"Pregunta",it:"Domanda",pt:"Pergunta",ro:"Întrebarea",nl:"Vraag",pl:"Pytanie",ru:"Вопрос",zh:"问题",ar:"سؤال",tr:"Soru"},
  of:        {en:"of",de:"von",fr:"sur",es:"de",it:"di",pt:"de",ro:"din",nl:"van",pl:"z",ru:"из",zh:"共",ar:"من",tr:"/{n}"},
  tryAgain:  {en:"Try Again",de:"Erneut versuchen",fr:"Réessayer",es:"Intentar de nuevo",it:"Riprova",pt:"Tentar novamente",ro:"Încearcă din nou",nl:"Opnieuw proberen",pl:"Spróbuj ponownie",ru:"Попробовать снова",zh:"再试一次",ar:"حاول مرة أخرى",tr:"Tekrar dene"},
  goBack:    {en:"← Go back",de:"← Zurück",fr:"← Retour",es:"← Volver",it:"← Torna indietro",pt:"← Voltar",ro:"← Înapoi",nl:"← Terug",pl:"← Wróć",ru:"← Назад",zh:"← 返回",ar:"← رجوع",tr:"← Geri dön"},
};
function uiT(key, lang) { return (UI_T[key]||{})[lang] || (UI_T[key]||{}).en || key; }

// ── Product link resolver — real affiliate URLs ───────────────────────────────
function getProductLink(category, productName) {
  const n = (productName||"").toLowerCase();

  // Appliances — brand category pages (never specific product URLs)
  if (category==="washing_machine"||category==="dryer") {
    if (n.includes("bosch"))    return "https://www.bosch-home.com/gb/products/washing-care/washing-machines.html";
    if (n.includes("miele"))    return "https://www.miele.co.uk/c/washing-machines-6830.htm";
    if (n.includes("samsung"))  return "https://www.samsung.com/uk/washing-machines/all-washing-machines/";
    if (n.includes("lg"))       return "https://www.lg.com/uk/washing-machines";
    if (n.includes("siemens"))  return "https://www.siemens-home.bsh-group.com/gb/products/washing/washing-machines";
    if (n.includes("hotpoint")) return "https://www.hotpoint.eu/gb/en/washing/washing-machines/";
    if (n.includes("aeg"))      return "https://www.aeg.com/gb/washing-machines/";
    if (n.includes("beko"))     return "https://www.beko.com/en-gb/washers-dryers/washing-machines";
    if (n.includes("whirlpool")) return "https://www.whirlpool.eu/en/washers-dryers.html";
    return amz(productName+" washing machine");
  }
  if (category==="fridge") {
    if (n.includes("bosch"))    return "https://www.bosch-home.com/gb/products/cooking-and-warming/refrigeration.html";
    if (n.includes("samsung"))  return "https://www.samsung.com/uk/refrigerators/all-refrigerators/";
    if (n.includes("lg"))       return "https://www.lg.com/uk/fridge-freezers";
    if (n.includes("miele"))    return "https://www.miele.co.uk/c/refrigeration-6960.htm";
    if (n.includes("siemens"))  return "https://www.siemens-home.bsh-group.com/gb/products/cooking/refrigeration";
    return amz(productName+" fridge freezer");
  }
  if (category==="vacuum") {
    if (n.includes("dyson"))    return "https://www.dyson.co.uk/vacuum-cleaners";
    if (n.includes("miele"))    return "https://www.miele.co.uk/c/vacuum-cleaners-6790.htm";
    if (n.includes("bosch"))    return "https://www.bosch-home.com/gb/products/cleaning/vacuum-cleaners.html";
    if (n.includes("samsung"))  return "https://www.samsung.com/uk/vacuum-cleaners/all-vacuum-cleaners/";
    return amz(productName+" vacuum cleaner");
  }
  if (category==="espresso") {
    if (n.includes("delonghi")||n.includes("de'longhi")) return "https://www.delonghi.com/en-gb/coffee-machines";
    if (n.includes("nespresso")) return "https://www.nespresso.com/gb/en/machines";
    if (n.includes("jura"))     return "https://www.jura.com/en_GB/coffee-machines.html";
    if (n.includes("philips"))  return "https://www.philips.co.uk/c-m-ho/coffee-machines";
    if (n.includes("siemens"))  return "https://www.siemens-home.bsh-group.com/gb/products/coffee-machines";
    return amz(productName+" coffee machine");
  }
  if (category==="oven") {
    if (n.includes("bosch"))    return "https://www.bosch-home.com/gb/products/cooking-and-warming/ovens.html";
    if (n.includes("siemens"))  return "https://www.siemens-home.bsh-group.com/gb/products/cooking/ovens";
    if (n.includes("miele"))    return "https://www.miele.co.uk/c/ovens-6810.htm";
    return amz(productName+" oven");
  }
  if (category==="aircon") {
    if (n.includes("daikin"))   return "https://www.daikin.co.uk/en_us/product-group/air-conditioning.html";
    if (n.includes("mitsubishi")) return "https://www.mitsubishielectric.co.uk/home-comfort/cooling-and-heating";
    return amz(productName+" air conditioner");
  }

  // Phones
  if (category==="phone") {
    if (n.includes("iphone"))           return "https://www.apple.com/uk/shop/buy-iphone";
    if (n.includes("samsung galaxy s")) return "https://www.samsung.com/uk/smartphones/galaxy-s/";
    if (n.includes("samsung galaxy a")) return "https://www.samsung.com/uk/smartphones/galaxy-a/";
    if (n.includes("samsung"))          return "https://www.samsung.com/uk/smartphones/";
    if (n.includes("google pixel")||n.includes("pixel")) return "https://store.google.com/gb/category/phones";
    if (n.includes("oneplus"))          return "https://www.oneplus.com/uk/smartphones";
    if (n.includes("xiaomi"))           return "https://www.mi.com/uk";
    if (n.includes("sony xperia"))      return "https://www.sony.co.uk/en/smartphones";
    if (n.includes("motorola"))         return "https://www.motorola.co.uk/smartphones";
    return amz(productName+" smartphone");
  }

  // Laptops
  if (category==="laptop") {
    if (n.includes("macbook"))          return "https://www.apple.com/uk/shop/buy-mac";
    if (n.includes("dell xps"))         return "https://www.dell.com/en-uk/shop/laptops/xps-laptops/spd/laptops-xps";
    if (n.includes("dell"))             return "https://www.dell.com/en-uk/shop/laptops/";
    if (n.includes("lenovo thinkpad"))  return "https://www.lenovo.com/gb/en/laptops/thinkpad/";
    if (n.includes("lenovo"))           return "https://www.lenovo.com/gb/en/laptops/";
    if (n.includes("hp"))               return "https://www.hp.com/gb-en/shop/laptops.aspx";
    if (n.includes("asus"))             return "https://www.asus.com/uk/laptops/";
    if (n.includes("surface"))          return "https://www.microsoft.com/en-gb/shop/category/surface-laptops";
    if (n.includes("acer"))             return "https://www.acer.com/gb-en/laptops";
    return amz(productName+" laptop");
  }

  // TVs
  if (category==="tv") {
    if (n.includes("samsung")) return "https://www.samsung.com/uk/tvs/all-tvs/";
    if (n.includes("lg"))      return "https://www.lg.com/uk/tvs/oled-tvs";
    if (n.includes("sony"))    return "https://www.sony.co.uk/en/televisions";
    if (n.includes("philips")) return "https://www.philips.co.uk/c-m-so/television";
    return amz(productName+" 4K TV");
  }

  // Apple fallbacks
  if (n.includes("iphone"))      return "https://www.apple.com/uk/shop/buy-iphone";
  if (n.includes("macbook"))     return "https://www.apple.com/uk/shop/buy-mac";
  if (n.includes("ipad"))        return "https://www.apple.com/uk/shop/buy-ipad";
  if (n.includes("apple watch")) return "https://www.apple.com/uk/shop/buy-watch";
  if (n.includes("airpods"))     return "https://www.apple.com/uk/shop/buy-airpods";
  if (n.includes("samsung"))     return "https://www.samsung.com/uk/";
  if (n.includes("google pixel")||n.includes("pixel")) return "https://store.google.com/gb/category/phones";

  // Cars — AutoScout24 search with model name for used; configurator for new
  if (category==="used_car"||category==="auto") {
    // Always use AutoScout24 with model search for used/general
    const q = encodeURIComponent(productName.replace(/\(.*?\)/g,"").trim());
    return `https://www.autoscout24.de/lst?sort=price&atype=C&q=${q}`;
  }
  if (category==="new_car") {
    const q = encodeURIComponent(productName.replace(/\(.*?\)/g,"").trim());
    if (n.includes("volkswagen")||n.includes("vw"))  return `https://www.autoscout24.de/lst?sort=price&atype=N&q=${q}`;
    if (n.includes("bmw"))       return "https://www.bmw.de/de/neufahrzeuge/alle-modelle.html";
    if (n.includes("mercedes"))  return "https://www.mercedes-benz.de/passengercars/mercedes-benz-cars/car-configurator.html";
    if (n.includes("tesla"))     return "https://www.tesla.com/de_DE/";
    if (n.includes("audi"))      return "https://www.audi.de/de/brand/de/neuwagen.html";
    if (n.includes("toyota"))    return "https://www.toyota.de/neuwagen";
    if (n.includes("renault"))   return "https://www.renault.de/pkw.html";
    if (n.includes("ford"))      return "https://www.ford.de/neuwagen";
    if (n.includes("hyundai"))   return "https://www.hyundai.de/modelle";
    if (n.includes("kia"))       return "https://www.kia.com/de/modelle";
    if (n.includes("opel"))      return "https://www.opel.de/fahrzeuge/pkw.html";
    if (n.includes("skoda")||n.includes("škoda")) return "https://www.skoda-auto.de/modelle";
    if (n.includes("volvo"))     return "https://www.volvocars.com/de/v/cars";
    if (n.includes("peugeot"))   return "https://www.peugeot.de/pkw.html";
    if (n.includes("seat"))      return "https://www.seat.de/modelle";
    if (n.includes("mazda"))     return "https://www.mazda.de/pkw";
    if (n.includes("honda"))     return "https://www.honda.de/cars.html";
    if (n.includes("nissan"))    return "https://www.nissan.de/fahrzeuge/neuwagen.html";
    if (n.includes("fiat"))      return "https://www.fiat.de/range";
    if (n.includes("porsche"))   return "https://www.porsche.com/germany/models/";
    return `https://www.autoscout24.de/lst?sort=price&atype=N&q=${q}`;
  }

  // Finance
  if (category==="personal_loan"||category==="mortgage") return "https://www.check24.de/kredit/";
  if (category==="credit_card")    return "https://www.check24.de/kreditkarten/";
  if (category==="bank_account")   return "https://www.check24.de/girokonto/";
  if (category==="deposit")        return "https://www.check24.de/tagesgeld/";
  if (category==="car_insurance")  return "https://www.check24.de/kfz-versicherung/";
  if (category==="insurance")      return "https://www.check24.de/versicherungen/";

  // Telecom
  if (category==="mobile_plan"||category==="prepaid") return "https://www.check24.de/handytarife/";
  if (category==="internet")       return "https://www.check24.de/dsl/";
  if (category==="tv_package")     return "https://www.check24.de/kabel-internet/";

  // Energy
  if (category==="electricity")    return "https://www.check24.de/strom/";
  if (category==="gas_provider")   return "https://www.check24.de/gas/";
  if (category==="solar")          return "https://www.check24.de/solar/";

  // Travel
  if (category==="hotel")          return "https://www.booking.com/searchresults.html?ss="+encodeURIComponent(productName)+"&aid=2942851";
  if (category==="airline")        return "https://www.skyscanner.net/flights";
  if (category==="travel_agency")  return "https://www.booking.com/holidays/?aid=2942851";
  if (category==="travel_insurance") return "https://www.check24.de/reiseversicherung/";
  if (category==="car_rental")     return "https://www.check24.de/mietwagen/";
  if (category==="tires")          return "https://www.check24.de/reifen/";
  if (category==="ev_charger")     return "https://www.check24.de/strom/";

  // Software
  if (n.includes("nordvpn"))       return "https://nordvpn.com/";
  if (n.includes("expressvpn"))    return "https://www.expressvpn.com/";
  if (n.includes("surfshark"))     return "https://surfshark.com/";
  if (n.includes("norton"))        return "https://uk.norton.com/";
  if (n.includes("kaspersky"))     return "https://www.kaspersky.com/";
  if (n.includes("bitdefender"))   return "https://www.bitdefender.com/";
  if (category==="hosting")        return "https://www.ionos.de/hosting/webhosting";
  if (n.includes("shopify"))       return "https://www.shopify.com/";
  if (n.includes("hubspot"))       return "https://www.hubspot.com/";

  // Education
  if (n.includes("coursera"))  return "https://www.coursera.org/";
  if (n.includes("udemy"))     return "https://www.udemy.com/";
  if (n.includes("duolingo"))  return "https://www.duolingo.com/";
  if (n.includes("babbel"))    return "https://www.babbel.com/";

  // Fitness
  if (n.includes("garmin"))   return "https://www.garmin.com/en-GB/products/wearables/";
  if (n.includes("fitbit"))   return "https://www.fitbit.com/global/us/home";
  if (n.includes("polar"))    return "https://www.polar.com/uk-en/";

  // Home
  if (n.includes("ikea"))     return "https://www.ikea.com/gb/en/";
  if (n.includes("wayfair"))  return "https://www.wayfair.co.uk/";

  // Default: Amazon search
  return amz(productName);
}

// ── Home logo button — appears in every screen ────────────────────────────────
function HomeButton({ onHome, lang }) {
  return (
    <button onClick={onHome} title={uiT("home",lang)||"Home"}
      style={{ display:"flex",alignItems:"center",gap:8,background:"transparent",border:"none",cursor:"pointer",padding:"8px 12px 8px 4px",borderRadius:10,transition:"background 0.15s",flexShrink:0 }}
      onMouseEnter={e=>e.currentTarget.style.background="rgba(26,86,219,0.08)"}
      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
      <div style={{ width:28,height:28,borderRadius:7,background:`linear-gradient(135deg,\${C.accent},#6B8EFF)`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0 }}>
        <img src="/asel-mascot.png" style={{ width:24,height:24,objectFit:"cover",objectPosition:"30% 8%" }} alt="" />
      </div>
      <span style={{ fontWeight:800,fontSize:14,color:C.text,letterSpacing:-0.3,fontFamily:"'Plus Jakarta Sans',sans-serif" }}>DecisionPilot</span>
    </button>
  );
}

// ── Match Score Calculator ────────────────────────────────────────────────────
function calculateMatchScore(answers, pickIndex) {
  const base = [97, 92, 86, 79, 72, 65][Math.min(pickIndex, 5)];
  const vals = Object.values(answers || {});
  const specific = vals.filter(a => !/(no preference|not sure|any|open to|don.t know)/i.test(a)).length;
  const boost = vals.length ? Math.round(((specific / vals.length) - 0.5) * 10) : 0;
  return Math.min(99, Math.max(58, base + boost));
}

// ── 3-Market config: EN / DE / ES (+ FR/IT/PT/RO) ────────────────────────────
const MARKETS = {
  en: { currency:"USD", region:"US/UK/Global",
    heroTag:"AI-powered comparison platform for smarter buying decisions.",
    heroBadge:"AI-Powered · 66+ Categories · 30 Languages" },
  de: { currency:"EUR", region:"DACH",
    heroTag:"KI-gestützte Vergleichsplattform für bessere Kaufentscheidungen.",
    heroBadge:"KI-Powered · 66+ Kategorien · 30 Sprachen" },
  es: { currency:"EUR", region:"ES/LATAM",
    heroTag:"Plataforma de comparación con IA para decisiones de compra más inteligentes.",
    heroBadge:"Con IA · 66+ Categorías · 30 Idiomas" },
  fr: { currency:"EUR", region:"FR/BE/CH",
    heroTag:"Plateforme de comparaison IA pour des décisions d'achat plus intelligentes.",
    heroBadge:"Propulsé par IA · 66+ Catégories · 30 Langues" },
  it: { currency:"EUR", region:"IT",
    heroTag:"Piattaforma di confronto AI per decisioni di acquisto più intelligenti.",
    heroBadge:"Con IA · 66+ Categorie · 30 Lingue" },
  pt: { currency:"EUR", region:"PT/BR",
    heroTag:"Plataforma de comparação com IA para decisões de compra mais inteligentes.",
    heroBadge:"Com IA · 66+ Categorias · 30 Idiomas" },
  ro: { currency:"RON", region:"RO",
    heroTag:"Platformă de comparare AI pentru decizii de cumpărare mai inteligente.",
    heroBadge:"Powered by AI · 66+ Categorii · 30 Limbi" },
};
function getMarket(lang) { return MARKETS[lang] || MARKETS[(lang||"").slice(0,2)] || MARKETS.en; }

// ── Professional SVG icons for category bar ──────────────────────────────────
const I = (d, extra="") => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html:d}} style={{display:"block"}} {...(extra?{style:{display:"block"}}:{})} />
);
const CAT_SVG_ICONS = {
  // Technology — laptop with screen glow
  tech: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="13" rx="2"/><polyline points="2 20 22 20"/><line x1="8" y1="20" x2="16" y2="20"/><line x1="7" y1="9" x2="17" y2="9"/><line x1="7" y1="12" x2="13" y2="12"/></svg>,
  // Appliances — washing machine
  appliances: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2"/><circle cx="12" cy="13" r="4"/><line x1="6" y1="6" x2="6.01" y2="6" strokeWidth="2.5"/><line x1="9" y1="6" x2="9.01" y2="6" strokeWidth="2.5"/><line x1="15" y1="6" x2="18" y2="6"/></svg>,
  // Cars — car silhouette
  auto: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a1 1 0 0 1-1-1v-3l2.5-5H19.5L22 13v3a1 1 0 0 1-1 1h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><line x1="9" y1="17" x2="15" y2="17"/><line x1="2" y1="13" x2="22" y2="13"/></svg>,
  // Financial — credit card
  financial: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="5" width="22" height="14" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/><line x1="5" y1="15" x2="9" y2="15"/><circle cx="17.5" cy="15" r="1.5"/><circle cx="20.5" cy="15" r="1.5"/></svg>,
  // Telecom — smartphone with signal
  telecom: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="2" width="10" height="20" rx="2"/><line x1="11" y1="18" x2="13" y2="18"/><path d="M16.5 7.5 A6 6 0 0 1 16.5 16.5" opacity=".5"/><path d="M19 5 A10 10 0 0 1 19 19" opacity=".3"/></svg>,
  // Energy — lightning bolt
  energy: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  // Tourism — airplane
  tourism: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 2c-2-2-4-2-5.5-.5L10 5 1.8 6.2l-.8 2L6 10l-1 3-3 1 .2 2L6 15l3.8 5 2-.2z"/></svg>,
  // Software — code
  software: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/><line x1="12" y1="3" x2="10" y2="21" strokeWidth="1.5"/></svg>,
  // Home & Garden — house
  home: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><polyline points="9 21 9 12 15 12 15 21"/></svg>,
  // Health & Fitness — heart with pulse
  health: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/><polyline points="7.5 13 9.5 11 11.5 13 13.5 9 15.5 12" strokeWidth="1.3"/></svg>,
  // Education — graduation cap
  education: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/><line x1="22" y1="10" x2="22" y2="16"/></svg>,
  // E-commerce — shopping bag
  ecommerce: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
};

function TopNav({ onBack, showBack, t, lang, setLang, count, onStartSearch, onCategoryClick, profile, onShowProfile, favoritesCount, onShowFavorites }) {
  const [langOpen, setLangOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  const CURRENCY = {
    en: "$ USD", de: "€ EUR", fr: "€ EUR", es: "€ EUR", it: "€ EUR",
    pt: "€ EUR", nl: "€ EUR", fi: "€ EUR", el: "€ EUR",
    ro: "lei RON", pl: "zł PLN", cs: "Kč CZK", hu: "Ft HUF",
    sk: "€ EUR", bg: "лв BGN", hr: "€ EUR",
    sv: "kr SEK", da: "kr DKK", no: "kr NOK",
    ru: "₽ RUB", uk: "₴ UAH",
    zh: "¥ CNY", ja: "¥ JPY", ko: "₩ KRW",
    ar: "﷼ SAR", tr: "₺ TRY", he: "₪ ILS",
    th: "฿ THB", id: "Rp IDR", vi: "₫ VND", hi: "₹ INR",
  };
  const FLAG_MAP = {
    en:"🇬🇧",de:"🇩🇪",fr:"🇫🇷",es:"🇪🇸",it:"🇮🇹",pt:"🇵🇹",nl:"🇳🇱",fi:"🇫🇮",
    el:"🇬🇷",ro:"🇷🇴",pl:"🇵🇱",cs:"🇨🇿",hu:"🇭🇺",sk:"🇸🇰",bg:"🇧🇬",hr:"🇭🇷",
    sv:"🇸🇪",da:"🇩🇰",no:"🇳🇴",ru:"🇷🇺",uk:"🇺🇦",zh:"🇨🇳",ja:"🇯🇵",ko:"🇰🇷",
    ar:"🇸🇦",tr:"🇹🇷",he:"🇮🇱",th:"🇹🇭",id:"🇮🇩",vi:"🇻🇳",hi:"🇮🇳",
  };
  const currentFlag = FLAG_MAP[lang] || current.flag || "🌐";

  return (
    <div style={{
      background: "#fff", borderBottom: `1px solid ${C.border}`,
      position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 8px rgba(15,23,42,0.06)",
    }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", gap: 12, height: 60 }}>

        {showBack && (
          <button onClick={onBack} style={{ display:"flex",alignItems:"center",gap:6,background:"transparent",border:`1px solid ${C.border}`,color:C.textSecondary,borderRadius:10,padding:"7px 12px",cursor:"pointer",fontSize:13,fontWeight:600,flexShrink:0 }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.color=C.accent;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textSecondary;}}>
            ← Back
          </button>
        )}

        {/* Logo */}
        <div style={{ display:"flex",alignItems:"center",gap:8,flexShrink:0,textDecoration:"none",cursor:"pointer" }} onClick={()=>onBack&&onBack()}>
          <div style={{ width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${C.accent},#6B8EFF)`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden" }}>
            <img src="/asel-mascot.png" style={{ width:28,height:28,objectFit:"cover",objectPosition:"30% 8%" }} alt="" />
          </div>
          <span style={{ color:C.text,fontWeight:900,fontSize:16,letterSpacing:-0.5,fontFamily:"'Plus Jakarta Sans',sans-serif" }}>DecisionPilot</span>
        </div>

        {/* ── CENTERED SEARCH BAR (CHECK24 style) ── */}
        <div style={{ flex:1,maxWidth:580,margin:"0 auto" }}>
          <div style={{ display:"flex",alignItems:"center",background:C.bg,border:`1.5px solid ${C.border}`,borderRadius:24,padding:"0 16px",transition:"border-color 0.2s,box-shadow 0.2s" }}
            onFocus={()=>{}} onBlur={()=>{}}>
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="text" value={searchVal} onChange={e=>setSearchVal(e.target.value)}
              placeholder={lang==="de"?"Suchen oder fragen...":lang==="ro"?"Caută sau întreabă...":lang==="fr"?"Chercher ou demander...":"Search or ask anything..."}
              style={{ flex:1,border:"none",background:"transparent",outline:"none",fontSize:14,color:C.text,padding:"10px 10px",fontFamily:"inherit" }}
              onKeyDown={e=>e.key==="Enter"&&searchVal.trim()&&onStartSearch&&onStartSearch(searchVal)} />
            <button onClick={()=>searchVal.trim()&&onStartSearch&&onStartSearch(searchVal)}
              style={{ background:C.accent,color:"#fff",border:"none",borderRadius:18,padding:"5px 14px",fontSize:13,fontWeight:700,cursor:"pointer",flexShrink:0 }}>
              {lang==="de"?"Suchen":lang==="ro"?"Caută":"Search"}
            </button>
          </div>
        </div>

        {/* Right: Favorites, Profile, Lang */}
        <div style={{ display:"flex",alignItems:"center",gap:6,flexShrink:0 }}>
        {/* Pro/Premium buttons — TEMPORARILY HIDDEN */}
        <div style={{ display: "none" }}>
          <button onClick={()=>handleUpgrade("pro")} style={{ background:"rgba(26,86,219,0.1)",color:C.accent,border:"1.5px solid rgba(26,86,219,0.35)",borderRadius:20,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer",transition:"all 0.2s",whiteSpace:"nowrap" }}
            onMouseEnter={e=>{e.currentTarget.style.background=C.accent;e.currentTarget.style.color="#fff";}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(26,86,219,0.1)";e.currentTarget.style.color=C.accent;}}>
            ✦ Pro
          </button>
          <button onClick={()=>handleUpgrade("premium")} style={{ background:"rgba(10,10,14,0.9)",color:"#D4AF37",border:"1.5px solid rgba(212,175,55,0.4)",borderRadius:20,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap" }}>
            ♛ Premium
          </button>
        </div>

          {/* ── Favorites button ── */}
          {onShowFavorites && (
            <button onClick={onShowFavorites}
              style={{ position:"relative",background:"transparent",border:`1px solid ${C.border}`,borderRadius:20,padding:"6px 12px",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:4,color:C.textSecondary,transition:"all 0.15s",whiteSpace:"nowrap" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="#ef4444";e.currentTarget.style.color="#ef4444";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textSecondary;}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {favoritesCount > 0 && <span className="dp-fav-count" style={{ fontWeight:700,fontSize:12 }}>{favoritesCount}</span>}
            </button>
          )}

          {/* ── Profile button ── */}
          {onShowProfile && (
            <button onClick={onShowProfile}
              style={{ display:"flex",alignItems:"center",gap:6,background:"transparent",border:`1px solid ${C.border}`,borderRadius:20,padding:"5px 10px 5px 6px",cursor:"pointer",transition:"all 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.background=`${C.accent}08`;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background="transparent";}}>
              {profile ? (
                <>
                  <div style={{ width:26,height:26,borderRadius:"50%",background:`linear-gradient(135deg,${C.accent},#7C3AED)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13 }}>
                    {STATUSES.find(s=>s.id===profile.status)?.emoji||"👤"}
                  </div>
                  <span className="dp-profile-name" style={{ fontSize:12,fontWeight:700,color:C.text,maxWidth:70,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                    {profile.nickname}
                  </span>
                </>
              ) : (
                <>
                  <div style={{ width:26,height:26,borderRadius:"50%",background:`${C.accent}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14 }}>👤</div>
                  <span style={{ fontSize:11,fontWeight:600,color:C.muted }}>{lang==="de"?"Profil":lang==="ro"?"Profil":"Profile"}</span>
                </>
              )}
            </button>
          )}

          {/* Language flag only */}
          <div style={{ position:"relative" }}>
            <button className="lang-flag-btn" onClick={()=>setLangOpen(!langOpen)} style={{ display:"flex",alignItems:"center",gap:4,background:"transparent",border:`1px solid ${C.border}`,borderRadius:20,padding:"6px 10px",cursor:"pointer",fontSize:18,lineHeight:1 }}
              onMouseEnter={e=>e.currentTarget.style.borderColor=C.accent}
              onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
              {currentFlag}
              <span style={{ fontSize:9,color:C.muted }}>{langOpen?"▲":"▼"}</span>
            </button>
            {langOpen && (
              <div style={{ position:"absolute",top:"calc(100% + 8px)",right:0,background:"#fff",border:`1px solid ${C.border}`,borderRadius:16,boxShadow:C.shadowLg,width:220,maxHeight:360,overflowY:"auto",padding:"6px 0",zIndex:200 }}>
                {LANGUAGES.map(l=>(
                  <button key={l.code} onClick={()=>{setLang(l.code);setLangOpen(false);}}
                    style={{ width:"100%",display:"flex",alignItems:"center",gap:10,padding:"9px 16px",border:"none",cursor:"pointer",background:l.code===lang?C.accentLight:"transparent",color:l.code===lang?C.accent:C.text,fontSize:14,fontWeight:l.code===lang?700:400 }}
                    onMouseEnter={e=>{if(l.code!==lang)e.currentTarget.style.background=C.bg;}}
                    onMouseLeave={e=>{if(l.code!==lang)e.currentTarget.style.background="transparent";}}>
                    <span style={{ fontSize:18,lineHeight:1 }}>{FLAG_MAP[l.code]||l.flag||"🌐"}</span>
                    <span style={{ flex:1 }}>{l.name}</span>
                    {CURRENCY[l.code]&&<span style={{ fontSize:10,color:C.muted,fontWeight:600 }}>{CURRENCY[l.code]}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── CATEGORY ROW — full width, no scroll ── */}
      <div style={{ borderTop:`1px solid ${C.border}`, background:"#fff" }}>
        <style>{`
          .cat-pill { display:flex; flex-direction:column; align-items:center; gap:5px; padding:10px 8px; border:none; border-bottom:3px solid transparent; background:transparent; cursor:pointer; transition:border-color 0.15s, color 0.15s, background 0.15s; flex:1; color:#64748B; min-height:0; }
          .cat-pill:hover { background:var(--pill-bg); border-bottom-color:var(--pill-color); color:var(--pill-color); }
          .cat-pill:hover .cat-icon-wrap { transform:translateY(-3px) scale(1.12); }
          .cat-icon-wrap { transition:transform 0.22s cubic-bezier(.34,1.56,.64,1); display:flex; align-items:center; justify-content:center; width:24px; height:24px; }
          .cat-pill:hover .cat-icon-wrap svg { stroke:var(--pill-color); }
          .cat-label { font-size:10.5px; font-weight:600; white-space:nowrap; letter-spacing:0.1px; }
        `}</style>
        <div style={{ display:"flex", width:"100%", maxWidth:"100%" }}>
          {CATEGORY_GROUPS.map(g => (
            <button key={g.id} className="cat-pill"
              style={{"--pill-color":g.color, "--pill-bg":`${g.color}0c`}}
              onClick={()=>{ onCategoryClick&&onCategoryClick(g.id); }}>
              <span className="cat-icon-wrap">
                {CAT_SVG_ICONS[g.id] || <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>}
              </span>
              <span className="cat-label">{catName(g.id,lang)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
function CategoryCard({ cat, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.card, border: `1.5px solid ${hovered ? cat.color : C.border}`,
        borderRadius: 20, overflow: "hidden", cursor: "pointer",
        transition: "all 0.25s cubic-bezier(.4,0,.2,1)",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        boxShadow: hovered ? `0 18px 44px ${cat.color}28` : C.shadow,
        padding: 0, textAlign: "left",
      }}>
      <div style={{ height: 130, position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0, backgroundImage: `url(${cat.image})`,
          backgroundSize: "cover", backgroundPosition: "center",
          transform: hovered ? "scale(1.08)" : "scale(1)",
          transition: "transform 0.4s cubic-bezier(.4,0,.2,1)",
        }} />
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, transparent 30%, ${cat.color}DD 100%)` }} />
        <div style={{ position: "absolute", top: 12, left: 12, fontSize: 28, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))" }}>{cat.emoji}</div>
        <div style={{
          position: "absolute", bottom: 10, right: 10,
          background: "#fff", color: cat.color,
          borderRadius: 999, padding: "5px 12px", fontSize: 11, fontWeight: 800,
          display: "flex", alignItems: "center", gap: 4,
          opacity: hovered ? 1 : 0, transform: hovered ? "translateX(0)" : "translateX(6px)",
          transition: "all 0.2s ease", boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        }}>Start <span style={{ animation: hovered ? "catNudge 0.8s ease-in-out infinite" : "none" }}>→</span></div>
      </div>
      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{ color: C.text, fontWeight: 700, fontSize: 15, marginBottom: 3, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{cat.label}</div>
        <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.5 }}>{cat.desc}</div>
      </div>
      <style>{`@keyframes catNudge { 0%,100%{transform:translateX(0);} 50%{transform:translateX(3px);} }`}</style>
    </button>
  );
}

function QuestionScreen({ category, onComplete, onBack, onHome, t, lang }) {
  const tree = TREES[category];
  const catColor = CATEGORIES_LIST.find(c => c.id === category)?.color || C.accent;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [animKey, setAnimKey] = useState(0);
  const lg = lang || "en";

  if (!tree) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
        <div style={{ position:"fixed",top:0,left:0,right:0,background:"#fff",borderBottom:`1px solid ${C.border}`,padding:"8px 16px",zIndex:50 }}>
          <HomeButton onHome={onHome} lang={lg} />
        </div>
        <div style={{ fontSize: 48 }}>🔧</div>
        <h2 style={{ color: C.text, fontWeight: 800, margin: 0 }}>Category coming soon</h2>
        <p style={{ color: C.muted }}>We're building questions for <strong>{catName(category, lg)}</strong>. Check back soon!</p>
        <button onClick={onBack} style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 12, padding: "12px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>{uiT("goBack", lg)}</button>
      </div>
    );
  }

  const question = tree.questions[step];
  const total = tree.questions.length;
  const progress = (step / total) * 100;

  function handleSelect(option) {
    setSelected(option);
    setTimeout(() => {
      const newAnswers = { ...answers, [question.id]: option };
      setAnswers(newAnswers);
      setSelected(null);
      if (step < total - 1) { setStep(s => s + 1); setAnimKey(k => k + 1); }
      else onComplete(newAnswers);
    }, 220);
  }

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Inter',system-ui,sans-serif" }}>

      {/* ── HERO HEADER — tall, immersive ── */}
      <div style={{ position:"relative", height:300, overflow:"hidden" }}>
        <div style={{ position:"absolute",inset:0,backgroundImage:`url(${tree.image})`,backgroundSize:"cover",backgroundPosition:"center" }} />
        <div style={{ position:"absolute",inset:0,background:`linear-gradient(160deg,${catColor}E8 0%,${catColor}88 45%,rgba(0,0,0,0.6) 100%)` }} />
        <div style={{ position:"absolute",inset:0,opacity:0.05,backgroundImage:"radial-gradient(circle,#fff 1px,transparent 1px)",backgroundSize:"28px 28px" }} />

        {/* Top nav bar */}
        <div style={{ position:"absolute",top:0,left:0,right:0,padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",zIndex:10 }}>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            {onHome && (
              <button onClick={onHome} style={{ display:"flex",alignItems:"center",gap:7,background:"rgba(0,0,0,0.28)",backdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,0.22)",color:"#fff",borderRadius:10,padding:"7px 12px",cursor:"pointer",fontSize:13,fontWeight:700 }}>
                <div style={{ width:20,height:20,borderRadius:5,background:`linear-gradient(135deg,${C.accent},#6B8EFF)`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden" }}>
                  <img src="/asel-mascot.png" style={{ width:18,height:18,objectFit:"cover",objectPosition:"30% 8%" }} alt="" />
                </div>
              </button>
            )}
            <button onClick={step > 0 ? () => { setStep(s=>s-1); setSelected(null); setAnimKey(k=>k+1); } : onBack}
              style={{ background:"rgba(0,0,0,0.28)",backdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,0.22)",color:"#fff",borderRadius:10,padding:"7px 14px",cursor:"pointer",fontSize:13,fontWeight:700 }}>
              ← {step > 0 ? uiT("back",lg) : (lg==="de"?"Startseite":lg==="ro"?"Acasă":lg==="es"?"Inicio":"Home")}
            </button>
          </div>
          <div style={{ background:"rgba(0,0,0,0.35)",backdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,0.2)",color:"#fff",borderRadius:20,padding:"6px 16px",fontSize:12,fontWeight:800,letterSpacing:0.8 }}>
            {step+1} / {total}
          </div>
        </div>

        {/* Center: emoji in glassmorphism card + category name */}
        <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",paddingBottom:28 }}>
          <div style={{ width:76,height:76,borderRadius:22,background:"rgba(255,255,255,0.16)",backdropFilter:"blur(10px)",border:"2px solid rgba(255,255,255,0.3)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14,boxShadow:"0 8px 32px rgba(0,0,0,0.25)",color:"white" }}>
            <div style={{ transform:"scale(1.7)", transformOrigin:"center", display:"flex" }}>{getIcon(category)}</div>
          </div>
          <div style={{ color:"#fff",fontSize:"clamp(18px,3.5vw,28px)",fontWeight:900,letterSpacing:-0.5,textShadow:"0 2px 16px rgba(0,0,0,0.5)",fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
            {catName(category,lg)}
          </div>
          <div style={{ color:"rgba(255,255,255,0.65)",fontSize:12,marginTop:5,letterSpacing:0.5 }}>
            {uiT("question",lg)} {step+1} {uiT("of",lg)} {total}
          </div>
        </div>

        {/* Progress bars */}
        <div style={{ position:"absolute",bottom:0,left:0,right:0,padding:"0 20px" }}>
          <div style={{ display:"flex",gap:4 }}>
            {tree.questions.map((_,i) => (
              <div key={i} style={{ flex:1,height:i===step?5:3,borderRadius:3,
                background:i<step?"rgba(255,255,255,0.9)":i===step?"#fff":"rgba(255,255,255,0.22)",
                transition:"all 0.35s cubic-bezier(.4,0,.2,1)",
                boxShadow:i===step?"0 0 10px rgba(255,255,255,0.8)":"none" }} />
            ))}
          </div>
        </div>
      </div>

      {/* ── QUESTION CONTENT ── */}
      <div style={{ maxWidth:680,margin:"0 auto",padding:"32px 20px 160px" }}>
        <div key={animKey} style={{ animation:"fadeUp 0.32s ease" }}>

          {/* Question card */}
          <div style={{ background:C.card,borderRadius:20,padding:"24px 24px 20px",boxShadow:"0 4px 24px rgba(15,23,42,0.08)",border:`1px solid ${C.border}`,marginBottom:16 }}>
            <div style={{ width:36,height:4,borderRadius:2,background:catColor,marginBottom:14 }} />
            <h2 style={{ color:C.text,fontSize:"clamp(19px,3.5vw,26px)",fontWeight:900,letterSpacing:-0.6,lineHeight:1.3,margin:0,fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
              {question.q}
            </h2>
            <div style={{ color:C.muted,fontSize:12,marginTop:8,display:"flex",alignItems:"center",gap:5 }}>
              <span style={{ width:5,height:5,borderRadius:"50%",background:catColor,display:"inline-block" }} />
              {catName(category,lg)} · {uiT("question",lg)} {step+1} {uiT("of",lg)} {total}
            </div>
          </div>

          {/* Answer option cards */}
          <div style={{ display:"flex",flexDirection:"column",gap:9 }}>
            {question.options.map((opt,i) => {
              const isSel = selected===opt;
              return (
                <button key={opt} onClick={()=>handleSelect(opt)}
                  style={{ background:isSel?`${catColor}12`:C.card, border:`2px solid ${isSel?catColor:C.border}`, borderRadius:15, padding:"15px 18px",
                    textAlign:"left", cursor:"pointer", display:"flex", alignItems:"center", gap:13,
                    transition:"all 0.18s cubic-bezier(.4,0,.2,1)",
                    boxShadow:isSel?`0 4px 20px ${catColor}25`:"0 1px 4px rgba(15,23,42,0.05)",
                    animation:`fadeUp 0.28s ease ${i*0.05}s both` }}
                  onMouseEnter={e=>{ if(!isSel){ e.currentTarget.style.borderColor=`${catColor}80`; e.currentTarget.style.background=`${catColor}06`; e.currentTarget.style.transform="translateX(5px)"; e.currentTarget.style.boxShadow=`0 4px 14px ${catColor}12`; } }}
                  onMouseLeave={e=>{ if(!isSel){ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.background=C.card; e.currentTarget.style.transform="translateX(0)"; e.currentTarget.style.boxShadow="0 1px 4px rgba(15,23,42,0.05)"; } }}>
                  {/* Letter badge */}
                  <div style={{ width:34,height:34,borderRadius:10,flexShrink:0,
                    background:isSel?catColor:`${catColor}14`,
                    border:`1.5px solid ${isSel?catColor:`${catColor}30`}`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:13,fontWeight:900,color:isSel?"#fff":catColor,
                    transition:"all 0.18s" }}>
                    {String.fromCharCode(65+i)}
                  </div>
                  <span style={{ flex:1,fontSize:15,fontWeight:isSel?700:500,color:isSel?catColor:C.text,lineHeight:1.4 }}>{opt}</span>
                  <div style={{ width:22,height:22,borderRadius:"50%",border:`2px solid ${isSel?catColor:C.border}`,background:isSel?catColor:"transparent",
                    display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.18s" }}>
                    {isSel&&<span style={{ color:"#fff",fontSize:11,fontWeight:900 }}>✓</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Skip + Ai·sel tip */}
          <div style={{ marginTop:20,display:"flex",alignItems:"flex-start",gap:12,background:`${catColor}08`,border:`1px solid ${catColor}20`,borderRadius:14,padding:"13px 16px" }}>
            <img src="/asel-mascot.png" style={{ width:30,height:30,borderRadius:"50%",objectFit:"cover",objectPosition:"30% 8%",border:`2px solid ${catColor}40`,flexShrink:0,marginTop:2 }} alt="Ai·sel" />
            <div style={{ flex:1 }}>
              <div style={{ color:catColor,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:2 }}>Ai·sel tip</div>
              <div style={{ color:C.textSecondary,fontSize:13,lineHeight:1.5 }}>
                {step===0
                  ?(lg==="de"?"Nimm dir Zeit — deine erste Antwort prägt alle Empfehlungen.":lg==="ro"?"Ia-ți timp — primul răspuns modelează toate recomandările.":lg==="es"?"Tómate tu tiempo — tu primera respuesta da forma a todas las recomendaciones.":lg==="fr"?"Prenez votre temps — votre première réponse façonne toutes les recommandations.":"Take your time — your first answer shapes all recommendations.")
                  :step===total-1
                  ?(lg==="de"?"Letzte Frage! Ai·sel analysiert jetzt tausende Bewertungen für dich.":lg==="ro"?"Ultima întrebare! Ai·sel analizează acum mii de recenzii pentru tine.":lg==="es"?"¡Última pregunta! Ai·sel analizará miles de reseñas para ti.":lg==="fr"?"Dernière question ! Ai·sel va analyser des milliers d'avis pour vous.":"Last question! Ai·sel will now analyze thousands of reviews for you.")
                  :step===total-2
                  ?(lg==="de"?"Fast geschafft! Noch eine Frage und deine Empfehlungen sind bereit.":lg==="ro"?"Aproape gata! Încă o întrebare și recomandările tale sunt pregătite.":lg==="es"?"¡Casi listo! Una pregunta más y tus recomendaciones estarán listas.":lg==="fr"?"Presque fini ! Une question de plus et vos recommandations sont prêtes.":"Almost there! One more question and your picks are ready.")
                  :(lg==="de"?"Jede Antwort grenzt die Optionen ein, um deine perfekte Wahl zu finden.":lg==="ro"?"Fiecare răspuns restrânge opțiunile pentru a găsi potrivirea perfectă.":lg==="es"?"Cada respuesta reduce las opciones para encontrar tu combinación perfecta.":lg==="fr"?"Chaque réponse réduit les options pour trouver votre correspondance parfaite.":"Each answer narrows down to find your perfect match.")}
              </div>
            </div>
            <button onClick={()=>handleSelect("No preference")}
              style={{ background:"none",border:`1px solid ${catColor}30`,color:catColor,borderRadius:8,padding:"5px 10px",fontSize:11,cursor:"pointer",fontWeight:600,flexShrink:0,whiteSpace:"nowrap" }}>
              Skip
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  );
}

function getCategoryAnimation(category) {
  const anims = {
    vacation: (
      <svg viewBox="0 0 200 200" width="180" height="180">
        <g style={{ animation: "loadFly 3s ease-in-out infinite" }}>
          <path d="M100 100 L60 120 L40 110 L60 105 Z" fill="#1A56DB" opacity="0.8"/>
          <path d="M100 100 L140 80 L160 90 L140 95 Z" fill="#1A56DB"/>
          <ellipse cx="100" cy="100" rx="35" ry="12" fill="#2563EB"/>
          <ellipse cx="100" cy="96" rx="16" ry="10" fill="#3B82F6"/>
          <path d="M70 100 L130 100 L120 90 L80 90 Z" fill="#60A5FA" opacity="0.6"/>
          <circle cx="105" cy="96" r="3" fill="#fff" opacity="0.9"/>
          <circle cx="115" cy="96" r="3" fill="#fff" opacity="0.9"/>
          <circle cx="125" cy="96" r="3" fill="#fff" opacity="0.9"/>
        </g>
        <g style={{ opacity: 0.3 }}>
          {[0,1,2,3].map(i => <line key={i} x1={30 + i*40} y1="140" x2={50 + i*40} y2="150" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" style={{ animation: `loadCloud 2s ease-in-out ${i*0.4}s infinite` }}/>)}
        </g>
      </svg>
    ),
    car: (
      <svg viewBox="0 0 200 200" width="180" height="180">
        <g style={{ animation: "loadDrive 2s ease-in-out infinite" }}>
          <rect x="30" y="100" width="140" height="45" rx="10" fill="#1A1A2E"/>
          <path d="M50 100 L70 70 L130 70 L150 100" fill="#2563EB"/>
          <rect x="40" y="100" width="30" height="20" rx="4" fill="#60A5FA" opacity="0.7"/>
          <rect x="80" y="100" width="40" height="20" rx="4" fill="#60A5FA" opacity="0.7"/>
          <rect x="130" y="100" width="30" height="20" rx="4" fill="#60A5FA" opacity="0.7"/>
          <circle cx="65" cy="148" r="18" fill="#1E293B" stroke="#475569" strokeWidth="3"/>
          <circle cx="65" cy="148" r="10" fill="#334155" style={{ animation: "loadSpin 1.5s linear infinite" }}/>
          <line x1="65" y1="138" x2="65" y2="158" stroke="#64748B" strokeWidth="2" style={{ animation: "loadSpin 1.5s linear infinite" }}/>
          <line x1="55" y1="148" x2="75" y2="148" stroke="#64748B" strokeWidth="2" style={{ animation: "loadSpin 1.5s linear infinite" }}/>
          <circle cx="135" cy="148" r="18" fill="#1E293B" stroke="#475569" strokeWidth="3"/>
          <circle cx="135" cy="148" r="10" fill="#334155" style={{ animation: "loadSpin 1.5s linear infinite" }}/>
          <line x1="135" y1="138" x2="135" y2="158" stroke="#64748B" strokeWidth="2" style={{ animation: "loadSpin 1.5s linear infinite" }}/>
          <line x1="125" y1="148" x2="145" y2="148" stroke="#64748B" strokeWidth="2" style={{ animation: "loadSpin 1.5s linear infinite" }}/>
          <ellipse cx="40" cy="107" rx="5" ry="4" fill="#FBBF24"/>
          <ellipse cx="160" cy="107" rx="4" ry="3" fill="#EF4444" opacity="0.8"/>
        </g>
      </svg>
    ),
    realestate: (
      <svg viewBox="0 0 200 200" width="180" height="180">
        <g style={{ animation: "loadFloat 3s ease-in-out infinite" }}>
          <rect x="55" y="110" width="90" height="70" rx="4" fill="#064E3B"/>
          <polygon points="40,110 100,55 160,110" fill="#065F46"/>
          <rect x="45" y="90" width="110" height="20" fill="#047857" opacity="0.5"/>
          <rect x="80" y="130" width="20" height="30" rx="2" fill="#6EE7B7"/>
          <rect x="110" y="130" width="20" height="20" rx="2" fill="#34D399" opacity="0.8"/>
          <rect x="110" y="130" width="9" height="9" rx="1" fill="#6EE7B7"/>
          <rect x="121" y="130" width="9" height="9" rx="1" fill="#6EE7B7"/>
          <rect x="110" y="141" width="9" height="9" rx="1" fill="#6EE7B7"/>
          <rect x="121" y="141" width="9" height="9" rx="1" fill="#6EE7B7"/>
          <circle cx="90" cy="158" r="3" fill="#059669"/>
          <g style={{ animation: "loadSpin 4s linear infinite", transformOrigin: "100px 55px" }}>
            <circle cx="100" cy="42" r="5" fill="#FBBF24"/>
            <line x1="100" y1="42" x2="100" y2="30" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round"/>
          </g>
        </g>
      </svg>
    ),
    phone: (
      <svg viewBox="0 0 200 200" width="180" height="180" style={{ animation: "loadSpin 4s ease-in-out infinite" }}>
        <rect x="65" y="30" width="70" height="130" rx="14" fill="#1E293B" stroke="#334155" strokeWidth="2"/>
        <rect x="70" y="45" width="60" height="100" rx="6" fill="#1A56DB"/>
        <rect x="83" y="35" width="34" height="4" rx="2" fill="#475569"/>
        <circle cx="100" cy="147" r="5" fill="#475569"/>
        <rect x="80" y="65" width="40" height="6" rx="3" fill="#60A5FA" opacity="0.8"/>
        <rect x="80" y="78" width="30" height="4" rx="2" fill="#93C5FD" opacity="0.6"/>
        <rect x="80" y="88" width="35" height="4" rx="2" fill="#93C5FD" opacity="0.6"/>
        <circle cx="90" cy="105" r="12" fill="#3B82F6"/>
        <path d="m86 105 3 3 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    ),
    laptop: (
      <svg viewBox="0 0 200 200" width="180" height="180">
        <g style={{ animation: "loadLaptop 3s ease-in-out infinite", transformOrigin: "100px 140px" }}>
          <rect x="35" y="60" width="130" height="90" rx="8" fill="#1E293B"/>
          <rect x="42" y="67" width="116" height="76" rx="4" fill="#1A56DB"/>
          <rect x="48" y="73" width="104" height="64" rx="3" fill="#0F172A"/>
          <rect x="52" y="77" width="96" height="56" rx="2" fill="#1D4ED8"/>
          <rect x="56" y="83" width="40" height="4" rx="2" fill="#93C5FD" opacity="0.8"/>
          <rect x="56" y="92" width="60" height="4" rx="2" fill="#60A5FA" opacity="0.6"/>
          <rect x="56" y="101" width="50" height="4" rx="2" fill="#60A5FA" opacity="0.6"/>
          <rect x="130" y="83" width="14" height="14" rx="3" fill="#3B82F6"/>
          <path d="m133 90 2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </g>
        <rect x="20" y="148" width="160" height="10" rx="5" fill="#334155"/>
        <rect x="75" y="148" width="50" height="6" rx="3" fill="#1E293B"/>
      </svg>
    ),
    fitness: (
      <svg viewBox="0 0 200 200" width="180" height="180" style={{ animation: "loadSpin 2s linear infinite", transformOrigin: "100px 100px" }}>
        <rect x="30" y="90" width="140" height="20" rx="10" fill="#D97706"/>
        <rect x="20" y="70" width="30" height="60" rx="8" fill="#92400E"/>
        <rect x="150" y="70" width="30" height="60" rx="8" fill="#92400E"/>
        <rect x="10" y="80" width="20" height="40" rx="6" fill="#78350F"/>
        <rect x="170" y="80" width="20" height="40" rx="6" fill="#78350F"/>
        <circle cx="100" cy="100" r="8" fill="#FCD34D"/>
      </svg>
    ),
    pet: (
      <svg viewBox="0 0 200 200" width="180" height="180">
        <g style={{ animation: "loadBounce 1.2s ease-in-out infinite" }}>
          <ellipse cx="100" cy="120" rx="40" ry="35" fill="#8B5E3C"/>
          <ellipse cx="78" cy="92" rx="12" ry="15" fill="#8B5E3C"/>
          <ellipse cx="122" cy="92" rx="12" ry="15" fill="#8B5E3C"/>
          <ellipse cx="78" cy="90" rx="7" ry="10" fill="#F9A8D4"/>
          <ellipse cx="122" cy="90" rx="7" ry="10" fill="#F9A8D4"/>
          <ellipse cx="100" cy="115" rx="28" ry="22" fill="#A0714F"/>
          <circle cx="92" cy="112" r="5" fill="#1A1A1A"/>
          <circle cx="108" cy="112" r="5" fill="#1A1A1A"/>
          <circle cx="93" cy="111" r="2" fill="#fff"/>
          <circle cx="109" cy="111" r="2" fill="#fff"/>
          <ellipse cx="100" cy="122" rx="8" ry="5" fill="#F9A8D4"/>
          <path d="M90 128 Q100 135 110 128" stroke="#A0714F" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <g style={{ animation: "loadWag 0.8s ease-in-out infinite", transformOrigin: "100px 140px" }}>
            <path d="M100 140 Q120 150 115 165" stroke="#8B5E3C" strokeWidth="10" strokeLinecap="round" fill="none"/>
          </g>
        </g>
      </svg>
    ),
    dining: (
      <svg viewBox="0 0 200 200" width="180" height="180" style={{ animation: "loadSpin 3s ease-in-out infinite", transformOrigin: "100px 100px" }}>
        <circle cx="100" cy="100" r="60" fill="#FEF3C7" stroke="#FCD34D" strokeWidth="3"/>
        <circle cx="100" cy="100" r="50" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1"/>
        <rect x="80" y="60" width="6" height="80" rx="3" fill="#D97706"/>
        <path d="M70 60 v30 Q70 100 80 100" stroke="#D97706" strokeWidth="5" fill="none" strokeLinecap="round"/>
        <path d="M120 60 v20 Q120 90 114 95 Q108 100 114 105 v35" stroke="#D97706" strokeWidth="5" fill="none" strokeLinecap="round"/>
        <circle cx="100" cy="100" r="6" fill="#FBBF24"/>
      </svg>
    ),
    career: (
      <svg viewBox="0 0 200 200" width="180" height="180">
        <g style={{ animation: "loadSwing 2s ease-in-out infinite", transformOrigin: "100px 80px" }}>
          <rect x="55" y="95" width="90" height="70" rx="8" fill="#1E3A8A"/>
          <rect x="55" y="95" width="90" height="15" rx="8" fill="#1D4ED8"/>
          <rect x="75" y="78" width="50" height="20" rx="6" fill="none" stroke="#1E3A8A" strokeWidth="4"/>
          <rect x="62" y="102" width="76" height="4" rx="2" fill="#3B82F6" opacity="0.5"/>
          <rect x="66" y="118" width="28" height="20" rx="3" fill="#DBEAFE" opacity="0.3"/>
          <rect x="66" y="118" width="13" height="9" rx="1" fill="#93C5FD" opacity="0.4"/>
          <rect x="80" y="118" width="13" height="9" rx="1" fill="#93C5FD" opacity="0.4"/>
          <rect x="66" y="128" width="13" height="9" rx="1" fill="#93C5FD" opacity="0.4"/>
          <rect x="80" y="128" width="13" height="9" rx="1" fill="#93C5FD" opacity="0.4"/>
          <rect x="104" y="118" width="26" height="30" rx="3" fill="#D4AF37" opacity="0.8"/>
          <text x="117" y="138" textAnchor="middle" fontSize="14" fontWeight="900" fill="#1E3A8A">$</text>
        </g>
      </svg>
    ),
    insurance: (
      <svg viewBox="0 0 200 200" width="180" height="180">
        <g style={{ animation: "loadFloat 3s ease-in-out infinite" }}>
          <path d="M100 40 L150 65 L150 110 Q150 150 100 170 Q50 150 50 110 L50 65 Z" fill="#1E3A8A"/>
          <path d="M100 55 L138 75 L138 110 Q138 140 100 155 Q62 140 62 110 L62 75 Z" fill="#1D4ED8"/>
          <path d="m82 105 12 12 24-24" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </g>
      </svg>
    ),
    cruise: (
      <svg viewBox="0 0 200 200" width="180" height="180">
        <g style={{ animation: "loadWave 3s ease-in-out infinite" }}>
          <rect x="30" y="115" width="140" height="40" rx="20" fill="#0C4A6E"/>
          <rect x="50" y="80" width="100" height="40" rx="8" fill="#0369A1"/>
          <rect x="60" y="88" width="80" height="24" rx="4" fill="#0284C7"/>
          {[0,1,2,3].map(i => <rect key={i} x={66 + i*20} y="92" width="12" height="16" rx="2" fill="#BAE6FD" opacity="0.8"/>)}
          <rect x="95" y="40" width="6" height="42" fill="#0C4A6E"/>
          <path d="M101 55 L130 70 L101 70 Z" fill="#DC2626"/>
          <path d="M20 145 Q35 135 50 145 Q65 155 80 145 Q95 135 110 145 Q125 155 140 145 Q155 135 170 145 Q180 150 185 155"
            stroke="#38BDF8" strokeWidth="3" fill="none" strokeLinecap="round"
            style={{ animation: "loadWavePath 2s ease-in-out infinite" }}/>
        </g>
      </svg>
    ),
    loans: (
      <svg viewBox="0 0 200 200" width="180" height="180" style={{ animation: "loadFloat 2.5s ease-in-out infinite" }}>
        <rect x="30" y="70" width="140" height="90" rx="12" fill="#065F46"/>
        <rect x="30" y="70" width="140" height="30" rx="12" fill="#047857"/>
        <rect x="30" y="88" width="140" height="12" fill="#047857"/>
        <rect x="45" y="80" width="40" height="6" rx="3" fill="#6EE7B7" opacity="0.7"/>
        <text x="155" y="88" textAnchor="end" fontSize="11" fill="#34D399" fontWeight="700" fontFamily="monospace">VISA</text>
        <rect x="45" y="115" width="50" height="6" rx="3" fill="#6EE7B7" opacity="0.5"/>
        <rect x="45" y="128" width="70" height="5" rx="2" fill="#34D399" opacity="0.4"/>
        <circle cx="148" cy="128" r="12" fill="#059669" opacity="0.6"/>
        <circle cx="160" cy="128" r="12" fill="#10B981" opacity="0.8"/>
      </svg>
    ),
    perfume: (
      <svg viewBox="0 0 200 200" width="180" height="180">
        <g style={{ animation: "loadFloat 3s ease-in-out infinite" }}>
          <rect x="75" y="90" width="50" height="80" rx="10" fill="#9D174D"/>
          <rect x="75" y="90" width="50" height="20" rx="10" fill="#BE185D"/>
          <rect x="85" y="70" width="30" height="25" rx="6" fill="#BE185D"/>
          <rect x="93" y="60" width="14" height="14" rx="4" fill="#9D174D"/>
          <rect x="98" y="52" width="4" height="12" rx="2" fill="#831843"/>
          <ellipse cx="100" cy="52" rx="6" ry="4" fill="#F9A8D4"/>
          <rect x="80" y="100" width="40" height="5" rx="2" fill="#F9A8D4" opacity="0.4"/>
          <text x="100" y="145" textAnchor="middle" fontSize="9" fill="#FCE7F3" fontWeight="700" fontFamily="serif">ASEL</text>
        </g>
        {[[40,60],[155,75],[35,120],[165,110],[100,45]].map(([x,y],i) => (
          <circle key={i} cx={x} cy={y} r="3" fill="#F9A8D4"
            style={{ animation: `loadSparkle 2s ease-in-out ${i*0.4}s infinite` }} opacity="0.8"/>
        ))}
      </svg>
    ),
    beauty: (
      <svg viewBox="0 0 200 200" width="180" height="180">
        <g style={{ animation: "loadFloat 3s ease-in-out infinite" }}>
          <ellipse cx="100" cy="140" rx="40" ry="8" fill="#DB2777" opacity="0.15"/>
          <rect x="80" y="70" width="40" height="70" rx="12" fill="#DB2777"/>
          <rect x="85" y="75" width="30" height="50" rx="8" fill="#EC4899"/>
          <rect x="87" y="78" width="26" height="40" rx="6" fill="#F9A8D4" opacity="0.5"/>
          <ellipse cx="100" cy="68" rx="14" ry="6" fill="#BE185D"/>
          <rect x="94" y="56" width="12" height="14" rx="4" fill="#9D174D"/>
          <rect x="98" y="50" width="4" height="8" rx="2" fill="#831843"/>
          <ellipse cx="100" cy="50" rx="5" ry="3" fill="#F472B6"/>
        </g>
        {[[45,55],[155,65],[50,140],[155,130]].map(([x,y],i) => (
          <g key={i} style={{ animation: `loadSparkle 1.8s ease-in-out ${i*0.5}s infinite` }}>
            <line x1={x} y1={y-6} x2={x} y2={y+6} stroke="#F9A8D4" strokeWidth="2" strokeLinecap="round"/>
            <line x1={x-6} y1={y} x2={x+6} y2={y} stroke="#F9A8D4" strokeWidth="2" strokeLinecap="round"/>
          </g>
        ))}
      </svg>
    ),
    furniture: (
      <svg viewBox="0 0 200 200" width="180" height="180">
        <g style={{ animation: "loadFloat 4s ease-in-out infinite" }}>
          <rect x="25" y="120" width="150" height="40" rx="10" fill="#44403C"/>
          <rect x="35" y="100" width="130" height="28" rx="6" fill="#57534E"/>
          <rect x="35" y="100" width="130" height="12" rx="6" fill="#78716C"/>
          <rect x="30" y="155" width="12" height="20" rx="4" fill="#292524"/>
          <rect x="158" y="155" width="12" height="20" rx="4" fill="#292524"/>
          <rect x="60" y="88" width="30" height="20" rx="6" fill="#57534E"/>
          <rect x="110" y="88" width="30" height="20" rx="6" fill="#57534E"/>
          <circle cx="75" cy="108" r="4" fill="#A8A29E" opacity="0.5"/>
          <circle cx="125" cy="108" r="4" fill="#A8A29E" opacity="0.5"/>
        </g>
      </svg>
    ),
    sports: (
      <svg viewBox="0 0 200 200" width="180" height="180">
        <g style={{ animation: "loadWave 2.5s ease-in-out infinite" }}>
          <path d="M20 160 Q50 130 80 155 Q110 180 140 150 Q165 125 180 140" stroke="#1D4ED8" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.4"/>
          <path d="M20 145 Q50 115 80 140 Q110 165 140 135 Q165 110 180 125" stroke="#2563EB" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.6"/>
          <g style={{ animation: "loadSurf 2.5s ease-in-out infinite", transformOrigin: "100px 120px" }}>
            <path d="M50 130 Q100 100 150 120" stroke="#0EA5E9" strokeWidth="8" strokeLinecap="round" fill="none"/>
            <ellipse cx="100" cy="118" rx="40" ry="6" fill="#0284C7" opacity="0.8" transform="rotate(-5 100 118)"/>
            <rect x="90" y="95" width="8" height="25" rx="4" fill="#F59E0B" transform="rotate(10 94 108)"/>
            <circle cx="92" cy="90" r="12" fill="#FDE68A"/>
            <rect x="85" y="90" width="16" height="8" rx="3" fill="#1D4ED8"/>
          </g>
        </g>
      </svg>
    ),
    outdoor: (
      <svg viewBox="0 0 200 200" width="180" height="180">
        <g style={{ animation: "loadFloat 4s ease-in-out infinite" }}>
          <polygon points="100,30 30,160 170,160" fill="#166534" opacity="0.9"/>
          <polygon points="100,55 45,160 155,160" fill="#15803D"/>
          <polygon points="100,80 60,160 140,160" fill="#16A34A"/>
          <rect x="93" y="155" width="14" height="30" rx="3" fill="#92400E"/>
          <circle cx="60" cy="70" r="20" fill="#FCD34D" opacity="0.9"/>
          <circle cx="60" cy="70" r="14" fill="#FBBF24"/>
          {[0,1,2,3,4,5,6,7].map(i => {
            const a = i * 45 * Math.PI / 180;
            return <line key={i} x1={60 + 18*Math.cos(a)} y1={70 + 18*Math.sin(a)} x2={60 + 24*Math.cos(a)} y2={70 + 24*Math.sin(a)} stroke="#FCD34D" strokeWidth="2" strokeLinecap="round"/>;
          })}
        </g>
      </svg>
    ),
  };
  return anims[category] || (
    <svg viewBox="0 0 200 200" width="180" height="180" style={{ animation: "loadSpin 3s linear infinite", transformOrigin: "100px 100px" }}>
      <circle cx="100" cy="100" r="70" fill="none" stroke="#1A56DB" strokeWidth="8" strokeDasharray="30 20"/>
      <circle cx="100" cy="100" r="45" fill="#EEF3FF"/>
      <circle cx="100" cy="100" r="12" fill="#1A56DB"/>
    </svg>
  );
}

function LoadingScreen({ category, lang, onHome }) {
  const tree = TREES[category];
  const [step, setStep] = useState(0);
  const catColor = CATEGORIES_LIST.find(c => c.id === category)?.color || "#1A56DB";
  const lg = lang || "en";
  const catLabel = catName(category, lg) || tree?.label || category;

  // Fully translated steps — replace only in English, use native phrases for others
  const rawSteps = UI_T.loadSteps[lg] || UI_T.loadSteps.en;
  const steps = rawSteps.map((s, i) =>
    i === 0 && lg === "en" ? `Analyzing your ${catLabel.toLowerCase()} preferences...` : s
  );

  // Fully translated title per language
  const loadingTitle = {
    en: `Finding your perfect ${catLabel.toLowerCase()}...`,
    de: `Ihr perfektes ${catLabel} wird gesucht...`,
    es: `Encontrando el mejor ${catLabel.toLowerCase()}...`,
    fr: `Recherche du meilleur ${catLabel.toLowerCase()}...`,
    it: `Ricerca del migliore ${catLabel.toLowerCase()}...`,
    pt: `Encontrando o melhor ${catLabel.toLowerCase()}...`,
    ro: `Găsim cel mai bun ${catLabel.toLowerCase()}...`,
    nl: `Uw perfecte ${catLabel.toLowerCase()} wordt gezocht...`,
    pl: `Szukamy najlepszego ${catLabel.toLowerCase()}...`,
    ru: `Ищем идеальный ${catLabel.toLowerCase()}...`,
    zh: `正在寻找最适合您的${catLabel}...`,
    ar: `نبحث عن أفضل ${catLabel}...`,
    tr: `En iyi ${catLabel.toLowerCase()} aranıyor...`,
  }[lg] || `Finding your perfect ${catLabel.toLowerCase()}...`;

  const loadingSubtitle = {
    en: "Ai·sel is analyzing reviews from CNET, TechRadar, Wirecutter, and more.",
    de: "Ai·sel analysiert Bewertungen von CNET, TechRadar, Wirecutter und mehr.",
    es: "Ai·sel está analizando reseñas de CNET, TechRadar, Wirecutter y más.",
    fr: "Ai·sel analyse les avis de CNET, TechRadar, Wirecutter et plus encore.",
    it: "Ai·sel sta analizzando recensioni di CNET, TechRadar, Wirecutter e altro.",
    pt: "Ai·sel está analisando avaliações de CNET, TechRadar, Wirecutter e mais.",
    ro: "Ai·sel analizează recenzii de pe CNET, TechRadar, Wirecutter și altele.",
    nl: "Ai·sel analyseert beoordelingen van CNET, TechRadar, Wirecutter en meer.",
    pl: "Ai·sel analizuje recenzje z CNET, TechRadar, Wirecutter i innych.",
    ru: "Ai·sel анализирует отзывы с CNET, TechRadar, Wirecutter и других.",
    zh: "Ai·sel 正在分析 CNET、TechRadar、Wirecutter 等平台的评测。",
    ar: "تحليل مراجعات CNET وTechRadar وWirecutter والمزيد.",
    tr: "Ai·sel, CNET, TechRadar, Wirecutter ve daha fazlasından incelemeleri analiz ediyor.",
  }[lg] || "Ai·sel is analyzing reviews from CNET, TechRadar, Wirecutter, and more.";

  useEffect(() => {
    const timer = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 1200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32 }}>
      {/* Home button top-left */}
      {onHome && <div style={{ position:"fixed",top:0,left:0,right:0,zIndex:50,background:"rgba(255,255,255,0.95)",backdropFilter:"blur(8px)",borderBottom:`1px solid ${C.border}`,padding:"8px 16px" }}>
        <HomeButton onHome={onHome} lang={lg} />
      </div>}
      <div style={{ textAlign:"center", maxWidth:520, width:"100%", marginTop: onHome ? 64 : 0 }}>
        {/* Animated category object banner */}
        <div style={{
          background: `linear-gradient(135deg, ${catColor}18, ${catColor}08)`,
          border: `1.5px solid ${catColor}30`,
          borderRadius: 24, padding: "32px 24px 24px",
          marginBottom: 28, display: "flex",
          flexDirection: "column", alignItems: "center", gap: 12,
          boxShadow: `0 8px 32px ${catColor}15`,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 180 }}>
            {getCategoryAnimation(category)}
          </div>
          <div style={{ color: catColor, fontWeight: 800, fontSize: 13, letterSpacing: 1.2, textTransform: "uppercase", display:"flex", alignItems:"center", gap:8, justifyContent:"center" }}>
            <div style={{ display:"flex", color:catColor }}>{getIcon(category)}</div>
            {catLabel} · AI Analysis
          </div>
        </div>

        <h2 style={{ color: C.text, fontSize: 26, fontWeight: 900, marginBottom: 8, letterSpacing: -0.5 }}>
          {loadingTitle}
        </h2>
        <p style={{ color: C.textSecondary, fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
          {loadingSubtitle}
        </p>
        <div style={{ textAlign: "left", background: C.card, borderRadius: 16, padding: "20px 24px", boxShadow: C.shadowMd }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "7px 0", opacity: i <= step ? 1 : 0.3, transition: "opacity 0.5s" }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                background: i < step ? C.success : i === step ? catColor : C.border,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, color: "#fff", fontWeight: 700, transition: "background 0.5s",
              }}>{i < step ? "✓" : i + 1}</div>
              <span style={{ color: i <= step ? C.text : C.muted, fontSize: 14, fontWeight: i === step ? 600 : 400 }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes loadSpin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes loadFloat  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes loadBounce { 0%,100%{transform:translateY(0) scaleY(1)} 40%{transform:translateY(-20px) scaleY(1.05)} 80%{transform:translateY(0) scaleY(0.95)} }
        @keyframes loadDrive  { 0%,100%{transform:translateX(0)} 50%{transform:translateX(8px)} }
        @keyframes loadFly    { 0%{transform:translate(0,0) rotate(0deg)} 50%{transform:translate(6px,-8px) rotate(3deg)} 100%{transform:translate(0,0) rotate(0deg)} }
        @keyframes loadSwing  { 0%,100%{transform:rotate(-8deg)} 50%{transform:rotate(8deg)} }
        @keyframes loadWave   { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-6px) rotate(2deg)} }
        @keyframes loadWag    { 0%,100%{transform:rotate(-20deg)} 50%{transform:rotate(20deg)} }
        @keyframes loadLaptop { 0%,100%{transform:rotateX(0deg)} 50%{transform:rotateX(-15deg)} }
        @keyframes loadSurf   { 0%,100%{transform:rotate(-5deg) translateY(0)} 50%{transform:rotate(5deg) translateY(-8px)} }
        @keyframes loadSparkle{ 0%,100%{opacity:0.2;transform:scale(0.6)} 50%{opacity:1;transform:scale(1.2)} }
        @keyframes loadWavePath{ 0%,100%{stroke-dashoffset:0} 50%{stroke-dashoffset:-20} }
      `}</style>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// PROFESSIONAL SVG ICON SYSTEM — replaces all emoji throughout
// Consistent: 24×24 viewBox, stroke-based, 1.5 strokeWidth
// ═══════════════════════════════════════════════════════════════
const SvgIcon = ({ d, size=22, color="currentColor", fill="none", sw=1.5, extra="" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{display:"block",flexShrink:0}}>
    <path d={d} />
  </svg>
);

// Icon library — keyed by category/subcategory id
const ICONS = {
  // ── Technology
  tech:         <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="13" rx="2"/><polyline points="2 20 22 20"/><line x1="8" y1="20" x2="16" y2="20"/><line x1="7" y1="9" x2="17" y2="9" opacity=".4"/><line x1="7" y1="12" x2="13" y2="12" opacity=".4"/></svg>,
  phone:        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="2" width="10" height="20" rx="2"/><line x1="11" y1="18" x2="13" y2="18"/></svg>,
  laptop:       <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="13" rx="2"/><polyline points="2 20 22 20"/><line x1="8" y1="20" x2="16" y2="20"/></svg>,
  tablet:       <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2.5"/></svg>,
  smartwatch:   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="6" width="12" height="12" rx="6"/><path d="M9 2h6M9 22h6"/><polyline points="12 9 12 12 14 14" strokeWidth="1.3"/></svg>,
  headphones:   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>,
  gaming:       <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><circle cx="16" cy="11" r=".5" fill="currentColor"/><circle cx="18" cy="13" r=".5" fill="currentColor"/><path d="M6 7h12l2 9H4z" strokeLinejoin="round"/></svg>,
  monitor:      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  printer:      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
  tv:           <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>,

  // ── Appliances
  appliances:   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2"/><circle cx="12" cy="13" r="4"/><line x1="6" y1="6" x2="6.01" y2="6" strokeWidth="2.5"/><line x1="9" y1="6" x2="9.01" y2="6" strokeWidth="2.5"/><line x1="14" y1="6" x2="18" y2="6"/></svg>,
  washing_machine:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2"/><circle cx="12" cy="13" r="4"/><line x1="6" y1="6" x2="6.01" y2="6" strokeWidth="2.5"/><line x1="9" y1="6" x2="9.01" y2="6" strokeWidth="2.5"/><line x1="14" y1="6" x2="18" y2="6"/></svg>,
  dryer:        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2"/><circle cx="12" cy="13" r="4"/><line x1="6" y1="6" x2="8" y2="6"/><path d="M10 6h.01"/></svg>,
  fridge:       <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5H5z"/><path d="M5 9h14v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/><line x1="9" y1="6" x2="9" y2="7"/><line x1="9" y1="13" x2="9" y2="15"/></svg>,
  vacuum:       <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 17v5M7 7 4 4M17 7l3-3"/><circle cx="12" cy="12" r="2"/></svg>,
  espresso:     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>,
  oven:         <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="18" rx="2"/><rect x="6" y="8" width="12" height="10" rx="1" opacity=".4"/><line x1="6" y1="6" x2="6.01" y2="6" strokeWidth="2"/><line x1="10" y1="6" x2="10.01" y2="6" strokeWidth="2"/><line x1="14" y1="6" x2="14.01" y2="6" strokeWidth="2"/></svg>,
  aircon:       <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="8" rx="2"/><line x1="6" y1="14" x2="6" y2="18"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="18" y1="14" x2="18" y2="18"/><line x1="7" y1="10" x2="17" y2="10" opacity=".4"/></svg>,

  // ── Cars
  auto:         <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a1 1 0 0 1-1-1v-3l2.5-5H19.5L22 13v3a1 1 0 0 1-1 1h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><line x1="9" y1="17" x2="15" y2="17"/><line x1="2" y1="13" x2="22" y2="13"/></svg>,
  new_car:      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a1 1 0 0 1-1-1v-3l2.5-5H19.5L22 13v3a1 1 0 0 1-1 1h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><line x1="9" y1="17" x2="15" y2="17"/></svg>,
  used_car:     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a1 1 0 0 1-1-1v-3l2.5-5H19.5L22 13v3a1 1 0 0 1-1 1h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M11 6 9 3"/></svg>,
  tires:        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="3" x2="12" y2="9" opacity=".5"/><line x1="12" y1="15" x2="12" y2="21" opacity=".5"/><line x1="3" y1="12" x2="9" y2="12" opacity=".5"/><line x1="15" y1="12" x2="21" y2="12" opacity=".5"/></svg>,
  car_insurance:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  ev_charger:   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a1 1 0 0 1-1-1v-4l3-5h11l3 5v4a1 1 0 0 1-1 1h-2"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/><path d="M14 5v4M16 7h-4"/></svg>,
  car_rental:   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a1 1 0 0 1-1-1v-3l2.5-5H19.5L22 13v3a1 1 0 0 1-1 1h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M12 2v3M10 3l4 2"/></svg>,
  car_service:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,

  // ── Financial
  financial:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="5" width="22" height="14" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/><line x1="5" y1="15" x2="9" y2="15"/><circle cx="18" cy="15" r="1.5"/></svg>,
  personal_loan:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 3"/><line x1="9" y1="8" x2="15" y2="8"/></svg>,
  mortgage:     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><line x1="10" y1="22" x2="10" y2="12"/><line x1="14" y1="22" x2="14" y2="12"/><path d="M10 12h4"/></svg>,
  credit_card:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="5" width="22" height="14" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/><line x1="5" y1="15" x2="9" y2="15"/></svg>,
  bank_account: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>,
  deposit:      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  broker:       <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,

  // ── Telecom
  telecom:      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="2" width="10" height="20" rx="2"/><line x1="11" y1="18" x2="13" y2="18"/><path d="M16.5 7.5A6 6 0 0 1 16.5 16.5" opacity=".5"/><path d="M19 5A10 10 0 0 1 19 19" opacity=".3"/></svg>,
  mobile_plan:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="2" width="10" height="20" rx="2"/><line x1="11" y1="18" x2="13" y2="18"/></svg>,
  prepaid:      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="2" width="10" height="20" rx="2"/><line x1="11" y1="18" x2="13" y2="18"/><path d="M11 7h2"/></svg>,
  internet:     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/></svg>,
  tv_package:   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>,
  phone_provider:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19 19 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,

  // ── Energy
  energy:       <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  electricity:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  gas_provider: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>,
  solar:        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="7.05" y2="7.05"/><line x1="16.95" y1="16.95" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.22" y1="19.78" x2="7.05" y2="16.95"/><line x1="16.95" y1="7.05" x2="19.78" y2="4.22"/></svg>,
  battery_storage:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="6" width="18" height="12" rx="2"/><line x1="23" y1="13" x2="23" y2="11"/><line x1="11" y1="10" x2="11" y2="14"/><line x1="9" y1="12" x2="13" y2="12"/></svg>,

  // ── Tourism
  tourism:      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 2c-2-2-4-2-5.5-.5L10 5 1.8 6.2l-.8 2L6 10l-1 3-3 1 .2 2L6 15l3.8 5 2-.2z"/></svg>,
  hotel:        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 22V8l9-6 9 6v14"/><line x1="3" y1="22" x2="21" y2="22"/><rect x="9" y="14" width="6" height="8"/><line x1="9" y1="14" x2="9" y2="22" opacity=".4"/></svg>,
  airline:      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 2c-2-2-4-2-5.5-.5L10 5 1.8 6.2l-.8 2L6 10l-1 3-3 1 .2 2L6 15l3.8 5 2-.2z"/></svg>,
  travel_agency:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><line x1="2" y1="12" x2="22" y2="12"/></svg>,
  travel_insurance:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>,

  // ── Software
  software:     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  vpn:          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  hosting:      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6" strokeWidth="2.5"/><line x1="6" y1="18" x2="6.01" y2="18" strokeWidth="2.5"/></svg>,
  website_builder:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><line x1="2" y1="12" x2="22" y2="12"/></svg>,
  crm:          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  email_marketing:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>,
  ai_solutions: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V10a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z"/><line x1="9" y1="14" x2="9.01" y2="14" strokeWidth="2.5"/><line x1="12" y1="14" x2="12.01" y2="14" strokeWidth="2.5"/><line x1="15" y1="14" x2="15.01" y2="14" strokeWidth="2.5"/></svg>,
  antivirus:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>,

  // ── Home
  home:         <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><polyline points="9 21 9 12 15 12 15 21"/></svg>,
  mattress:     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="10" rx="3"/><path d="M7 7V5M17 7V5"/></svg>,
  power_tools:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  security_system:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  robot_mower:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="12" width="20" height="8" rx="3"/><path d="M7 12V9a5 5 0 0 1 10 0v3"/><circle cx="8" cy="16" r="1" fill="currentColor"/><circle cx="16" cy="16" r="1" fill="currentColor"/></svg>,

  // ── Health & Fitness
  health:       <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  gym:          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
  fitness_watch:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="6" width="12" height="12" rx="6"/><path d="M9 2h6M9 22h6"/><polyline points="12 9 12 12 14 14" strokeWidth="1.3"/></svg>,
  supplements:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7z"/><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/></svg>,
  health_app:   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,

  // ── Education
  education:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  online_courses:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><polygon points="10 9 14 12 10 15" fill="currentColor" stroke="none"/></svg>,
  university:   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/><line x1="22" y1="10" x2="22" y2="16"/></svg>,
  private_school:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 22V8l9-6 9 6v14"/><line x1="3" y1="22" x2="21" y2="22"/><rect x="9" y="14" width="6" height="8"/></svg>,
  language_courses:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><line x1="2" y1="12" x2="22" y2="12"/></svg>,

  // ── E-commerce
  ecommerce:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  online_store: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  delivery:     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  dropshipping: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
};
// Fallback for unknown IDs
function getIcon(id, size=22, color="currentColor") {
  const el = ICONS[id];
  if (!el) return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2.5"/></svg>;
  return el;
}

// ── Badge translations ────────────────────────────────────────────────────────
const BADGE_T = {
  "BEST OVERALL":    {ro:"ALEGEREA NOASTRĂ",de:"BESTE WAHL",es:"MEJOR OPCIÓN",fr:"MEILLEUR CHOIX",it:"MIGLIORE SCELTA",pt:"MELHOR ESCOLHA",nl:"BESTE KEUZE",pl:"NAJLEPSZY WYBÓR"},
  "BEST VALUE":      {ro:"RAPORT/PREȚ",de:"PREIS-LEISTUNG",es:"MEJOR VALOR",fr:"MEILLEUR RAPPORT",it:"MIGLIOR VALORE",pt:"MELHOR CUSTO",nl:"BESTE PRIJS"},
  "TOP PICK":        {ro:"ALEGEREA NR.1",de:"TOP WAHL",es:"TOP ELECCIÓN",fr:"TOP CHOIX",it:"TOP SCELTA",pt:"TOP ESCOLHA"},
  "PREMIUM CHOICE":  {ro:"ALEGERE PREMIUM",de:"PREMIUM WAHL",es:"OPCIÓN PREMIUM",fr:"CHOIX PREMIUM"},
  "BUDGET PICK":     {ro:"ECONOMIC",de:"GÜNSTIGE WAHL",es:"ECONÓMICO",fr:"ÉCONOMIQUE",it:"ECONOMICO"},
  "PREMIUM PICK":    {ro:"ALEGERE PREMIUM",de:"PREMIUM WAHL",es:"OPCIÓN PREMIUM"},
  "EDITOR'S PICK":   {ro:"ALEGEREA EDITORULUI",de:"REDAKTIONSTIPP",es:"ELECCIÓN DEL EDITOR"},
  "BEST OVERALL":    {ro:"CEL MAI BUN",de:"BESTE WAHL",es:"MEJOR OPCIÓN"},
  "RUNNER UP":       {ro:"LOC 2",de:"ZWEITE WAHL",es:"SEGUNDA OPCIÓN"},
};

function RecommendationCard({ pick, index, lang, category, answers, onFavorite, isFav }) {
  const [hovered, setHovered] = useState(false);
  const [logoErr, setLogoErr] = useState(false);
  const isTop = index === 0;
  const c = isTop ? C.gold : C.accent;
  const lg = lang || "en";
  // SAFE LINK LOGIC: Only trust marketplace links from AI, never manufacturer-specific URLs
  const SAFE_DOMAINS = ["amazon","booking","skyscanner","rentalcars","check24","autoscout24","nordvpn","expressvpn","surfshark","coursera","udemy","shopify","hubspot","ikea","google.com/shopping","otto.de","galaxus","mediamarkt","saturn"];
  const aiLinkSafe = pick.link && pick.link !== "#" && !pick.link.includes("example.com") &&
    SAFE_DOMAINS.some(d => pick.link.includes(d));
  const dealLink = aiLinkSafe ? pick.link : getProductLink(category, pick.name);

  const matchScore = pick.matchScore || calculateMatchScore(answers, index);
  const matchColor = matchScore >= 90 ? "#059669" : matchScore >= 75 ? "#D97706" : "#DC2626";
  const stars = pick.rating ? parseFloat(pick.rating) : (5 - index * 0.2).toFixed(1);
  const starsNum = Math.round(stars);

  // Brand logo from Clearbit + category image for product visual
  const BRAND_DOMAINS = {
    bosch:"bosch.com", samsung:"samsung.com", apple:"apple.com", lg:"lg.com",
    siemens:"siemens-home.bsh-group.com", miele:"miele.de", hotpoint:"hotpoint.eu",
    aeg:"aeg.com", whirlpool:"whirlpool.com", electrolux:"electrolux.com",
    dyson:"dyson.com", philips:"philips.com", panasonic:"panasonic.com",
    sony:"sony.com", google:"google.com", microsoft:"microsoft.com",
    dell:"dell.com", hp:"hp.com", lenovo:"lenovo.com", asus:"asus.com", acer:"acer.com",
    bmw:"bmw.de", mercedes:"mercedes-benz.de", volkswagen:"vw.de", audi:"audi.de",
    toyota:"toyota.de", tesla:"tesla.com", ford:"ford.de", renault:"renault.de",
    nordvpn:"nordvpn.com", expressvpn:"expressvpn.com", surfshark:"surfshark.com",
    norton:"norton.com", kaspersky:"kaspersky.com", bitdefender:"bitdefender.com",
    coursera:"coursera.org", udemy:"udemy.com", duolingo:"duolingo.com",
    shopify:"shopify.com", hubspot:"hubspot.com", mailchimp:"mailchimp.com",
    garmin:"garmin.com", fitbit:"fitbit.com", ikea:"ikea.com",
    booking:"booking.com", airbnb:"airbnb.com", skyscanner:"skyscanner.net",
  };
  const brandKey = Object.keys(BRAND_DOMAINS).find(b => (pick.name||"").toLowerCase().includes(b));
  const logoUrl = brandKey && !logoErr
    ? `https://logo.clearbit.com/${BRAND_DOMAINS[brandKey]}`
    : null;
  // Brand initial fallback
  const brandInitial = (pick.name||"?").charAt(0).toUpperCase();
  const brandColor = ["#1A56DB","#7C3AED","#059669","#D97706","#DC2626","#0891B2"][index % 6];

  // Category product image from TREES
  const catTree = TREES[category];
  const productImg = catTree?.image;

  return (

    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background:C.card, overflow:"hidden", transition:"background 0.2s",
        animation:`fadeUp 0.4s ease ${index * 0.08}s both`, height:"100%", display:"flex", flexDirection:"column" }}>

      {/* ── Image strip ── */}
      {productImg && (
        <div style={{ position:"relative", height:100, overflow:"hidden", flexShrink:0 }}>
          <div style={{ position:"absolute",inset:0,backgroundImage:`url(${productImg})`,backgroundSize:"cover",backgroundPosition:"center",filter:"blur(1px)",transform:"scale(1.06)" }} />
          <div style={{ position:"absolute",inset:0,background:`linear-gradient(to bottom,${c}55 0%,${c}AA 100%)` }} />
          <div style={{ position:"absolute",top:12,left:16,width:36,height:36,borderRadius:9,background:`linear-gradient(135deg,${c},${c}CC)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:16,fontWeight:900,boxShadow:"0 2px 10px rgba(0,0,0,0.3)" }}>{index+1}</div>
          <div style={{ position:"absolute",top:12,right:14,display:"flex",gap:5,alignItems:"center" }}>
            {isTop && <Badge color={C.gold}>{uiT("topPick",lg)}</Badge>}
            {pick.badge && <Badge color="rgba(255,255,255,0.92)">{BADGE_T[pick.badge?.toUpperCase()]?.[lg] || pick.badge}</Badge>}
            {onFavorite && (
              <button onClick={e=>{e.stopPropagation();onFavorite(pick);}}
                style={{ background:isFav?"rgba(255,210,0,0.95)":"rgba(255,255,255,0.88)",border:"none",borderRadius:7,width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:15,boxShadow:"0 2px 8px rgba(0,0,0,0.2)",transition:"all 0.15s",flexShrink:0 }}>
                {isFav ? <svg width="15" height="15" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Brand logo + Name + Price + Scores ── */}
      <div style={{ padding:"18px 20px 14px", display:"flex", alignItems:"flex-start", gap:12 }}>
        <div style={{ width:46,height:46,borderRadius:11,background:"#fff",border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,overflow:"hidden",boxShadow:"0 1px 6px rgba(0,0,0,0.07)",marginTop:2 }}>
          {logoUrl
            ? <img src={logoUrl} onError={()=>setLogoErr(true)} style={{ width:34,height:34,objectFit:"contain" }} alt="" />
            : <div style={{ width:38,height:38,borderRadius:9,background:brandColor,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:17,fontWeight:900 }}>{brandInitial}</div>
          }
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <a href={dealLink} target="_blank" rel="noopener noreferrer"
            style={{ color:C.text,fontWeight:800,fontSize:15,fontFamily:"'Plus Jakarta Sans',sans-serif",lineHeight:1.3,textDecoration:"none",display:"block",transition:"color 0.15s",wordBreak:"break-word" }}
            onMouseEnter={e=>e.currentTarget.style.color=c}
            onMouseLeave={e=>e.currentTarget.style.color=C.text}>
            {pick.name} ↗
          </a>
          <div style={{ color:C.muted,fontSize:12,fontWeight:500,marginTop:3 }}>{pick.price}</div>
          <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:8,flexWrap:"wrap" }}>
            <div style={{ display:"flex",alignItems:"center",gap:2,background:`${C.gold}12`,border:`1px solid ${C.gold}25`,borderRadius:7,padding:"2px 8px" }}>
              <span style={{ color:C.gold,fontSize:10,letterSpacing:0.8 }}>{"★".repeat(starsNum)}{"☆".repeat(5-starsNum)}</span>
              <span style={{ color:C.gold,fontSize:10,fontWeight:800,marginLeft:2 }}>{Number(stars).toFixed(1)}</span>
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:4,background:`${matchColor}10`,border:`1.5px solid ${matchColor}30`,borderRadius:8,padding:"3px 10px" }}>
              <svg viewBox="0 0 36 36" width="18" height="18" style={{ transform:"rotate(-90deg)",flexShrink:0 }}>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke={`${matchColor}22`} strokeWidth="5"/>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke={matchColor} strokeWidth="5" strokeDasharray={`${matchScore} 100`} strokeLinecap="round"/>
              </svg>
              <span style={{ color:matchColor,fontSize:12,fontWeight:900 }}>{matchScore}%</span>
              <span style={{ color:matchColor,fontSize:10,fontWeight:600 }}>match</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── WHY THIS FOR YOU ── bold label on own line ── */}
      <div style={{ margin:"0 20px 16px", background:C.accentLight, borderRadius:10, padding:"14px 16px", borderLeft:`3px solid ${C.accent}` }}>
        <div style={{ color:C.accent, fontWeight:900, fontSize:12, textTransform:"uppercase", letterSpacing:0.9, marginBottom:7, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
          <strong>{uiT("whyForYou",lg)}</strong>
        </div>
        <div style={{ color:"#334155", fontSize:13.5, lineHeight:1.65 }}>{pick.why}</div>
      </div>

      {/* ── Pros / Cons ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, margin:"0 20px 16px" }}>
        <div style={{ background:"#F0FDF4", border:"1.5px solid #86EFAC", borderRadius:12, padding:"14px" }}>
          <div style={{ color:"#15803D", fontWeight:900, fontSize:10, textTransform:"uppercase", letterSpacing:1, marginBottom:10, display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none"><circle cx="8" cy="8" r="7" fill="#15803D"/><path d="m5 8 2 2 4-4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {uiT("pros",lg)}
          </div>
          {pick.pros?.map((p,i) => (
            <div key={i} style={{ display:"flex",alignItems:"flex-start",gap:6,marginBottom:8 }}>
              <span style={{ color:"#15803D",fontSize:13,fontWeight:900,flexShrink:0,marginTop:1 }}>+</span>
              <span style={{ color:"#14532D",fontSize:13,lineHeight:1.55,fontWeight:500 }}>{p}</span>
            </div>
          ))}
        </div>
        <div style={{ background:"#FFF1F1", border:"1.5px solid #FCA5A5", borderRadius:12, padding:"14px" }}>
          <div style={{ color:"#B91C1C", fontWeight:900, fontSize:10, textTransform:"uppercase", letterSpacing:1, marginBottom:10, display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none"><circle cx="8" cy="8" r="7" fill="#B91C1C"/><path d="m5.5 5.5 5 5M10.5 5.5l-5 5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/></svg>
            {uiT("cons",lg)}
          </div>
          {pick.cons?.map((p,i) => (
            <div key={i} style={{ display:"flex",alignItems:"flex-start",gap:6,marginBottom:8 }}>
              <span style={{ color:"#DC2626",fontSize:13,fontWeight:900,flexShrink:0,marginTop:1 }}>−</span>
              <span style={{ color:"#7F1D1D",fontSize:13,lineHeight:1.55,fontWeight:500 }}>{p}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Ai·sel Car Tip: New vs Used ── */}
      {pick.car_tip && (() => {
        const tip = pick.car_tip;
        const vColor = tip.verdict_color === "green" ? "#15803D"
          : tip.verdict_color === "blue" ? "#1A56DB"
          : "#B45309";
        const vBg = tip.verdict_color === "green" ? "#F0FDF4"
          : tip.verdict_color === "blue" ? "#EFF6FF"
          : "#FFFBEB";
        const depIcon = tip.depreciation === "fast" ? "📉" : tip.depreciation === "slow" ? "📈" : "〰️";
        return (
          <div style={{ margin:"0 20px 16px", borderRadius:12, overflow:"hidden", border:`1.5px solid ${vColor}30` }}>
            {/* Header bar */}
            <div style={{ background:`${vColor}10`, padding:"10px 14px", display:"flex", alignItems:"center", gap:10, borderBottom:`1px solid ${vColor}20` }}>
              <img src="/asel-mascot.png" style={{ width:28,height:28,borderRadius:"50%",objectFit:"cover",objectPosition:"30% 8%",border:`1.5px solid ${vColor}40`,flexShrink:0 }} alt="Ai·sel" />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:9,fontWeight:700,letterSpacing:0.8,textTransform:"uppercase",color:vColor,marginBottom:1 }}>Ai·sel tip · New vs Used</div>
                <div style={{ fontSize:13,fontWeight:800,color:vColor,fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{tip.headline}</div>
              </div>
              <div style={{ background:vBg, border:`1.5px solid ${vColor}40`, borderRadius:8, padding:"4px 10px", textAlign:"center", flexShrink:0 }}>
                <div style={{ fontSize:9,fontWeight:700,color:vColor,letterSpacing:0.5,textTransform:"uppercase",lineHeight:1 }}>{tip.verdict}</div>
              </div>
            </div>
            {/* Body */}
            <div style={{ background:"#fff", padding:"12px 14px" }}>
              <p style={{ fontSize:12.5,color:"#334155",lineHeight:1.65,margin:"0 0 10px" }}>{tip.reason}</p>
              <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
                {tip.saving && (
                  <div style={{ display:"flex",alignItems:"center",gap:5,background:"#F0FDF4",borderRadius:7,padding:"4px 10px",border:"1px solid #86EFAC" }}>
                    <span style={{ fontSize:13 }}>💰</span>
                    <span style={{ fontSize:11,fontWeight:700,color:"#15803D" }}>
                      {lg==="de"?"Ersparnis":lg==="ro"?"Economie":lg==="es"?"Ahorro":"Saving"}: {tip.saving}
                    </span>
                  </div>
                )}
                {tip.depreciation && (
                  <div style={{ display:"flex",alignItems:"center",gap:5,background:"#F8FAFC",borderRadius:7,padding:"4px 10px",border:`1px solid ${C.border}` }}>
                    <span style={{ fontSize:12 }}>{depIcon}</span>
                    <span style={{ fontSize:11,fontWeight:700,color:C.muted }}>
                      {lg==="de"?"Wertverlust":lg==="ro"?"Depreciere":lg==="es"?"Depreciación":"Depreciation"}: {
                        tip.depreciation === "fast" ? (lg==="de"?"Schnell":lg==="ro"?"Rapid":lg==="es"?"Rápida":"Fast") :
                        tip.depreciation === "slow" ? (lg==="de"?"Gering":lg==="ro"?"Lentă":lg==="es"?"Lenta":"Slow") :
                        (lg==="de"?"Mittel":lg==="ro"?"Medie":lg==="es"?"Media":"Moderate")
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Source + View deal ── pinned to bottom ── */}
      <div style={{ padding:"0 20px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, marginTop:"auto" }}>
        <span style={{ color:C.muted,fontSize:11 }}>📖 {pick.source}</span>
        <a href={dealLink} target="_blank" rel="noopener noreferrer"
          style={{ background:c,color:"#fff",textDecoration:"none",padding:"9px 20px",borderRadius:9,fontSize:13,fontWeight:700,display:"inline-flex",alignItems:"center",gap:5,transition:"opacity 0.15s",flexShrink:0,whiteSpace:"nowrap" }}
          onMouseEnter={e=>e.currentTarget.style.opacity="0.85"}
          onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
          {uiT("viewDeal",lg)}
        </a>
      </div>
    </div>
  );
}

function ResultsScreen({ category, answers, onRestart, onBack, onHome, onFavorite, favorites, profile, t, lang }) {
  const tree = TREES[category];
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [affOpen, setAffOpen] = useState(false);  // ← moved here, not inside render
  const lg = lang || "en";

  useEffect(() => {
    async function fetchRecs() {
      try {
        const response = await fetch("/api/chat", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "tree_result",
            category,
            answers,
            lang: lg,
            market: getMarket(lg).region,
            currency: getMarket(lg).currency,
          }),
        });
        const result = await response.json();
        if (result.type === "recommendations") setData(result.data);
        else setError("Could not load recommendations. Please try again.");
      } catch { setError("Connection error. Please try again."); }
      finally { setLoading(false); }
    }
    fetchRecs();
  }, []);

  if (loading) return <LoadingScreen category={category} lang={lg} onHome={onHome} />;

  if (error) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ position:"fixed",top:0,left:0,right:0,background:"#fff",borderBottom:`1px solid ${C.border}`,padding:"8px 16px",zIndex:50 }}>
        <HomeButton onHome={onHome} lang={lg} />
      </div>
      <div style={{ fontSize: 48 }}>😕</div>
      <p style={{ color: C.text, fontSize: 18, fontWeight: 600 }}>{error}</p>
      <button onClick={onRestart} style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 12, padding: "12px 24px", cursor: "pointer", fontSize: 15, fontWeight: 700 }}>{uiT("tryAgain", lg)}</button>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      {/* Sticky home bar */}
      <div style={{ position:"sticky",top:0,zIndex:50,background:"rgba(255,255,255,0.95)",backdropFilter:"blur(8px)",borderBottom:`1px solid ${C.border}`,padding:"6px 16px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <HomeButton onHome={onHome} lang={lg} />
        <button onClick={onBack} style={{ background:"transparent",border:`1px solid ${C.border}`,color:C.textSecondary,borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:13,fontWeight:600 }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.color=C.accent;}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textSecondary;}}>
          {uiT("back", lg)}
        </button>
      </div>

      <div className="dp-results-hero" style={{ height: 200, backgroundImage: `url(${tree.image})`, backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.7))" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, maxWidth: 800, margin: "0 auto", padding: "0 24px 28px" }}>
          <h1 style={{ color: "#fff", fontSize: "clamp(20px, 3.5vw, 28px)", fontWeight: 900, margin: 0, letterSpacing: -0.5, textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>{data?.title}</h1>
          {data?.subtitle && <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, margin: "6px 0 0", lineHeight: 1.5 }}>{data.subtitle}</p>}
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(20px,3vw,40px) clamp(12px,2.5vw,32px) 170px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
          <span style={{ color: C.muted, fontSize: 13 }}>{uiT("poweredAI",lg)} · {uiT("sources",lg)}: CNET, TechRadar, Wirecutter</span>
          <button onClick={onRestart} style={{ background: C.accentLight, color: C.accent, border: `1px solid ${C.accent}33`, borderRadius: 10, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
            🔄 {uiT("startOver", lg)}
          </button>
        </div>

        {/* ── Product grid: 3 cols desktop, 2 tablet, 1 mobile ── */}
        <style>{`
          .picks-grid { display:grid; grid-template-columns:repeat(3,1fr); background:var(--card-bg,#fff); border-radius:16px; overflow:hidden; border:1px solid var(--border,#E2E8F0); margin-bottom:32px; }
          @media(max-width:1024px){ .picks-grid { grid-template-columns:repeat(2,1fr); } }
          @media(max-width:640px){ .picks-grid { grid-template-columns:1fr; } }
          .pick-cell { border-right:1px solid var(--border,#E2E8F0); }
          .pick-cell:nth-child(3n){ border-right:none; }
          .pick-cell:nth-child(2n){ border-right:none; }
          @media(min-width:1025px){ .pick-cell:nth-child(2n){ border-right:1px solid var(--border,#E2E8F0); } .pick-cell:nth-child(3n){ border-right:none; } }
          .pick-cell:nth-last-child(-n+3){ border-bottom:none; }

          /* ── MOBILE GLOBAL ── */
          @media(max-width:768px){
            /* TopNav: hide favorites count text, shrink profile */
            .dp-fav-count { display:none !important; }
            .dp-profile-name { display:none !important; }
            /* 5-col product sections → 2-col */
            .dp-products-grid { grid-template-columns:repeat(2,1fr) !important; }
            /* How it works: 2 col */
            .steps-grid { grid-template-columns:repeat(2,1fr) !important; }
            /* Concept section flags: smaller */
            .dp-flags span { font-size:16px !important; }
            /* Results header: reduce hero */
            .dp-results-hero { height:140px !important; }
            /* Card pros/cons: stack on very small */
          }
          @media(max-width:480px){
            .dp-products-grid { grid-template-columns:1fr !important; }
            .steps-grid { grid-template-columns:1fr !important; }
            .picks-grid { grid-template-columns:1fr !important; }
            .dp-promo-grid { grid-template-columns:1fr !important; }
          }
          /* Prevent horizontal scroll */
          body { overflow-x:hidden; }
          /* Smooth card hovers on touch devices */
          @media(hover:none){ .pick-cell:hover { transform:none !important; } }
        `}</style>
        <div className="picks-grid">
          {data?.picks?.map((pick, i) => (
            <div key={i} className="pick-cell" style={{ borderBottom:`1px solid ${C.border}` }}>
              <RecommendationCard pick={pick} index={i} lang={lg} category={category} answers={answers}
                isFav={isFavorited(favorites||[], category, pick?.name)}
                onFavorite={(p)=>onFavorite&&onFavorite(category, p, answers)} />
            </div>
          ))}
        </div>

        {/* ══ DECISION CONFIDENCE PANEL ══ */}
        {(() => {
          const vals = Object.entries(answers || {});
          const total = vals.length;
          const skipped = vals.filter(([,v]) => /(no preference|not sure|skip|any|open to)/i.test(v));
          const specific = total - skipped.length;
          const confidence = total > 0 ? Math.round((specific / total) * 100) : 70;
          const confColor = confidence >= 80 ? "#059669" : confidence >= 60 ? "#D97706" : "#DC2626";
          const confLabel = confidence >= 80
            ? (lg==="de"?"Hohe Sicherheit":lg==="es"?"Alta confianza":lg==="ro"?"Încredere ridicată":"High confidence")
            : confidence >= 60
            ? (lg==="de"?"Mittlere Sicherheit":lg==="es"?"Confianza media":lg==="ro"?"Încredere medie":"Moderate confidence")
            : (lg==="de"?"Niedrige Sicherheit":lg==="es"?"Confianza baja":lg==="ro"?"Încredere scăzută":"Lower confidence");

          // Detect budget answer for upgrade tip
          const budgetEntry = vals.find(([k]) => k === "budget");
          const budgetVal = budgetEntry?.[1] || "";
          const budgetTiers = {
            "Under €100": "€100–€200", "Under €200": "€200–€400", "Under €5,000": "€5,000–€10,000",
            "Under €20": "€20–€50", "Under €30": "€30–€70", "Under €3/month": "€3–€7/month",
            "Under €50": "€50–€150", "Under €300": "€300–€600", "Under $200": "$200–$400",
          };
          const nextBudgetTier = budgetTiers[budgetVal];

          return (
            <div style={{ background:"linear-gradient(135deg,#F8FAFF,#EEF3FF)", border:`1px solid ${C.border}`, borderRadius:20, padding:28, marginTop:32 }}>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:20 }}>
                <div style={{ width:10,height:10,borderRadius:"50%",background:confColor,boxShadow:`0 0 8px ${confColor}` }} />
                <h3 style={{ color:C.text,fontSize:18,fontWeight:900,margin:0,fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                  {lg==="de"?"Entscheidungs-Sicherheit":lg==="es"?"Confianza en la decisión":lg==="ro"?"Încredere în decizie":"Decision Confidence"}
                </h3>
              </div>

              {/* Confidence meter */}
              <div style={{ marginBottom:24 }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:8 }}>
                  <span style={{ color:C.textSecondary,fontSize:13 }}>
                    {lg==="de"?"Empfehlungsgenauigkeit":lg==="es"?"Precisión de recomendación":lg==="ro"?"Precizia recomandării":"Recommendation accuracy"}
                  </span>
                  <span style={{ color:confColor,fontWeight:900,fontSize:15 }}>{confidence}% · {confLabel}</span>
                </div>
                <div style={{ height:8,background:`${confColor}18`,borderRadius:4,overflow:"hidden" }}>
                  <div style={{ height:"100%",width:`${confidence}%`,background:`linear-gradient(90deg,${confColor}88,${confColor})`,borderRadius:4,transition:"width 1s ease" }} />
                </div>
                <p style={{ color:C.muted,fontSize:12,marginTop:8,lineHeight:1.6 }}>
                  {lg==="de"
                    ? `Basiert auf ${specific} von ${total} spezifischen Antworten.${skipped.length>0?` ${skipped.length} Antworten waren allgemein und könnten verfeinert werden.`:""}`
                    : lg==="es"
                    ? `Basado en ${specific} de ${total} respuestas específicas.${skipped.length>0?` ${skipped.length} respuestas fueron generales y podrían refinarse.`:""}`
                    : lg==="ro"
                    ? `Bazat pe ${specific} din ${total} răspunsuri specifice.${skipped.length>0?` ${skipped.length} răspunsuri au fost generale și ar putea fi rafinate.`:""}`
                    : `Based on ${specific} of ${total} specific answers.${skipped.length>0?` ${skipped.length} answers were general and could be refined for better accuracy.`:""}`}
                </p>
              </div>

              {/* Missing info */}
              {skipped.length > 0 && (
                <div style={{ background:"#fff",borderRadius:12,padding:"14px 18px",marginBottom:20,border:`1px solid ${C.border}` }}>
                  <div style={{ color:C.text,fontSize:13,fontWeight:700,marginBottom:8,display:"flex",alignItems:"center",gap:6 }}>
                    <span style={{ fontSize:16 }}>💡</span>
                    {lg==="de"?"Was könnte die Empfehlung verbessern?":lg==="es"?"¿Qué podría mejorar la recomendación?":lg==="ro"?"Ce ar putea îmbunătăți recomandarea?":"What could improve this recommendation?"}
                  </div>
                  <p style={{ color:C.textSecondary,fontSize:13,margin:0,lineHeight:1.6 }}>
                    {lg==="de"
                      ? `Sie haben bei ${skipped.length} ${skipped.length===1?"Frage":"Fragen"} "keine Präferenz" gewählt. Wenn Sie Ai·sel mehr Details geben, kann die Empfehlung noch genauer werden.`
                      : lg==="es"
                      ? `Eligió "sin preferencia" en ${skipped.length} ${skipped.length===1?"pregunta":"preguntas"}. Dar más detalles a Ai·sel puede hacer la recomendación más precisa.`
                      : lg==="ro"
                      ? `Ai ales "fără preferință" la ${skipped.length} ${skipped.length===1?"întrebare":"întrebări"}. Dacă dai mai multe detalii lui Ai·sel, recomandarea va fi mai precisă.`
                      : `You chose "no preference" on ${skipped.length} ${skipped.length===1?"question":"questions"}. Giving Ai·sel more details could sharpen the recommendation further.`}
                  </p>
                </div>
              )}

              {/* Budget upgrade tip */}
              {nextBudgetTier && data?.picks?.[1] && (
                <div style={{ background:`${C.accent}08`,borderRadius:12,padding:"14px 18px",border:`1.5px solid ${C.accent}25` }}>
                  <div style={{ color:C.accent,fontSize:13,fontWeight:700,marginBottom:6,display:"flex",alignItems:"center",gap:6 }}>
                    <span style={{ fontSize:16 }}>📈</span>
                    {lg==="de"?"Was ändert sich bei höherem Budget?":lg==="es"?"¿Qué cambia con un presupuesto mayor?":lg==="ro"?"Ce s-ar schimba cu un buget mai mare?":"What changes with a higher budget?"}
                  </div>
                  <p style={{ color:C.textSecondary,fontSize:13,margin:0,lineHeight:1.6 }}>
                    {lg==="de"
                      ? `Mit einem Budget von ${nextBudgetTier} wäre die Empfehlung <strong>${data.picks[1]?.name}</strong> als Top-Pick verfügbar — mit besserer Leistung und mehr Funktionen.`
                      : lg==="es"
                      ? `Con un presupuesto de ${nextBudgetTier}, la recomendación <strong>${data.picks[1]?.name}</strong> estaría disponible como opción principal — con mejor rendimiento.`
                      : lg==="ro"
                      ? `Cu un buget de ${nextBudgetTier}, recomandarea principală ar deveni <strong>${data.picks[1]?.name}</strong> — cu performanță mai bună și mai multe funcții.`
                      : `If your budget were ${nextBudgetTier} instead, the top recommendation would shift to <strong>${data.picks[1]?.name}</strong> — offering significantly better performance.`}
                  </p>
                </div>
              )}
            </div>
          );
        })()}

        {/* ══ AFFILIATE — minimal ? button ══ */}
        <div style={{ textAlign:"right", marginTop:-16, marginBottom:28, position:"relative" }}>
          <button onClick={()=>setAffOpen(o=>!o)}
            style={{ width:20,height:20,borderRadius:"50%",border:"none",background:`${C.accent}18`,cursor:"pointer",fontSize:11,fontWeight:900,fontStyle:"italic",color:C.accent,display:"inline-flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s",padding:0,lineHeight:1,fontFamily:"Georgia,serif" }}
            onMouseEnter={e=>{e.currentTarget.style.background=C.accent;e.currentTarget.style.color="#fff";}}
            onMouseLeave={e=>{e.currentTarget.style.background=`${C.accent}18`;e.currentTarget.style.color=C.accent;}}>
            i
          </button>
          {affOpen && (
            <div style={{ position:"absolute",right:0,top:28,background:"#fff",border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 16px",width:280,textAlign:"left",boxShadow:C.shadowMd,zIndex:20,animation:"fadeUp 0.15s ease" }}>
              <p style={{ color:C.muted,fontSize:12,margin:0,lineHeight:1.7 }}>
                {lg==="de" ? <><strong>Einige Empfehlungen enthalten Affiliate-Links.</strong> Das Ranking wird ausschließlich durch die Übereinstimmung mit Ihrem Profil bestimmt — niemals durch Provisionen.</> :
                 lg==="es" ? <><strong>Algunas recomendaciones contienen enlaces de afiliado.</strong> El ranking está determinado exclusivamente por la compatibilidad con su perfil — nunca por comisiones.</> :
                 lg==="ro" ? <><strong>Unele recomandări conțin linkuri afiliate.</strong> Clasamentul este determinat exclusiv de compatibilitatea cu profilul tău — niciodată de comisioane.</> :
                 <><strong>Some recommendations contain affiliate links.</strong> Rankings are determined exclusively by your profile compatibility — never by commissions.</>}
                {" "}<a href="/about" style={{ color:C.accent,fontSize:11 }}>{lg==="de"?"Mehr →":lg==="ro"?"Mai mult →":"Learn more →"}</a>
              </p>
            </div>
          )}
        </div>

        <div style={{ marginTop: 40, background: C.card, borderRadius: 16, padding: "24px 32px", boxShadow: C.shadow, display:"flex", alignItems:"center", gap:32, flexWrap:"wrap" }}>
          <img src="/asel-hero.png" alt="Ai·sel"
            style={{ width:120, height:"auto", objectFit:"contain", flexShrink:0, filter:"drop-shadow(0 8px 24px rgba(26,86,219,0.18))", transform:"scaleX(-1)", animation:"aselFloat 3s ease-in-out infinite" }} />
          <div style={{ flex:1, minWidth:200 }}>
            <p style={{ color: C.textSecondary, fontSize: 15, marginBottom: 16 }}>{uiT("chatMore", lg)}</p>
            <button onClick={() => window.dispatchEvent(new CustomEvent("openChat"))}
              style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 12, padding: "12px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 10 }}>
              <img src="/asel-mascot.png" style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover", objectPosition: "30% 8%", border: "2px solid rgba(255,255,255,0.6)" }} alt="" />
              {uiT("chatWith", lg)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Compare 2 or 3 Products section ─────────────────────────────────────────
function CompareSection({ lang }) {
  const [cp1, setCp1] = useState(""); const [cp2, setCp2] = useState(""); const [cp3, setCp3] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [errDetail, setErrDetail] = useState("");
  const lg = lang || "en";
  const clr = ["#4F46E5","#15803D","#C2410C"];
  const bgClr = ["#EEF2FF","#F0FDF4","#FFF7ED"];

  const inputs = [
    [cp1, setCp1, lg==="de"?"Produkt 1":lg==="ro"?"Produsul 1":"Product 1", lg==="de"?"z.B. iPhone 17 Pro":lg==="ro"?"ex. iPhone 17 Pro":"e.g. iPhone 17 Pro"],
    [cp2, setCp2, lg==="de"?"Produkt 2":lg==="ro"?"Produsul 2":"Product 2", lg==="de"?"z.B. Samsung S25":lg==="ro"?"ex. Samsung S25":"e.g. Samsung Galaxy S25"],
    [cp3, setCp3, lg==="de"?"Produkt 3 (optional)":lg==="ro"?"Produsul 3 (opțional)":"Product 3 (optional)", lg==="de"?"z.B. Google Pixel":lg==="ro"?"ex. Google Pixel":"e.g. Google Pixel 9 Pro"],
  ];

  async function doCompare() {
    const products = [cp1.trim(), cp2.trim(), cp3.trim()].filter(Boolean);
    if (products.length < 2) {
      setErr(lg==="de"?"Bitte mindestens 2 Produkte eingeben":lg==="ro"?"Introdu cel puțin 2 produse":"Please enter at least 2 products");
      return;
    }
    setErr(""); setErrDetail(""); setData(null); setLoading(true);

    const comparePrompt = `Compare these ${products.length} products for a consumer. Products: ${products.map((p,i)=>`${i+1}. ${p}`).join(", ")}

Respond with ONLY a JSON object, no markdown, no explanation:
{"products":[{"name":"product name","score":8.5,"price_range":"€500-800","winner_badge":"","best_for":"ideal user 8 words"}],"rows":[{"label":"Display","values":["val1","val2"],"winner":0},{"label":"Camera","values":["val1","val2"],"winner":1},{"label":"Performance","values":["val1","val2"],"winner":0},{"label":"Battery","values":["val1","val2"],"winner":1},{"label":"Price","values":["val1","val2"],"winner":1},{"label":"Build quality","values":["val1","val2"],"winner":0},{"label":"Software","values":["val1","val2"],"winner":-1},{"label":"Unique strength","values":["val1","val2"],"winner":-1}],"summary":"one sentence verdict"}
winner=index of best product (0,1,2) or -1 for tie. winner_badge=""|"Top pick"|"Best value"|"Best specs" (only one). Respond in ${lg==="de"?"German":lg==="ro"?"Romanian":lg==="es"?"Spanish":"English"}.`;

    try {
      // Try /api/compare first (dedicated endpoint if it exists)
      // Fall back to /api/chat with messages format (existing endpoint)
      let text = "";
      for (const url of ["/api/compare", "/api/chat"]) {
        const body = url === "/api/compare"
          ? { products, lang: lg }
          : { messages: [{ role: "user", content: comparePrompt }], lang: lg };

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        text = await res.text();
        let json;
        try { json = JSON.parse(text); } catch { continue; }

        // Extract text from various response formats
        const raw = json.reply || json.content?.[0]?.text || (json.products ? text : null);
        if (!raw) continue;

        // Parse the actual comparison JSON
        let parsed;
        const attempts = [
          () => JSON.parse(raw),
          () => JSON.parse(raw.replace(/^```(?:json)?\s*/m,"").replace(/\s*```\s*$/m,"").trim()),
          () => { const m = raw.match(/\{[\s\S]*\}/); if(m) return JSON.parse(m[0]); throw new Error("x"); },
          () => json.products ? json : null, // already parsed
        ];
        for (const fn of attempts) {
          try { parsed = fn(); if(parsed) break; } catch {}
        }
        if (parsed?.products) { setData(parsed); return; }
      }
      throw new Error("Could not get comparison data. Response: " + text.slice(0, 150));

    } catch(e) {
      setErr(lg==="de"?"Vergleich fehlgeschlagen":lg==="ro"?"Compararea a eșuat":"Comparison failed");
      setErrDetail(e.message);
    } finally { setLoading(false); }
  }

  function scoreColor(s) { return s>=8.5?"#15803D":s>=7?"#92400E":"#B91C1C"; }

  const products = data?.products || [];

  return (
    <div style={{ marginBottom:40, background:C.card, borderRadius:20, border:`1px solid ${C.border}`, padding:"28px 28px 24px", boxShadow:C.shadow }}>
      {/* Header */}
      <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
        <div style={{ background:`${C.accent}12`,borderRadius:8,padding:"4px 10px",display:"inline-flex",alignItems:"center",gap:6 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V10a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z"/><line x1="9" y1="14" x2="9.01" y2="14" strokeWidth="2.5"/><line x1="12" y1="14" x2="12.01" y2="14" strokeWidth="2.5"/><line x1="15" y1="14" x2="15.01" y2="14" strokeWidth="2.5"/></svg>
          <span style={{ fontSize:10,fontWeight:700,color:C.accent,letterSpacing:0.5,textTransform:"uppercase" }}>Ai·sel Comparator</span>
        </div>
      </div>
      <h2 style={{ fontSize:20,fontWeight:900,color:C.text,margin:"0 0 4px",fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
        {lg==="de"?"2 oder 3 Produkte vergleichen":lg==="ro"?"Compară orice 2 sau 3 produse":"Compare any 2 or 3 products"}
      </h2>
      <p style={{ fontSize:13,color:C.muted,margin:"0 0 20px" }}>
        {lg==="de"?"Telefone, Autos, Hotels, Banken, Dienste… AI vergleicht alles sofort":lg==="ro"?"Telefoane, mașini, hoteluri, bănci, servicii… AI compară orice instant":"Phones, cars, hotels, banks, services… AI compares anything instantly"}
      </p>

      {/* 3-column inputs */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:14 }}>
        {inputs.map(([val,set,label,ph],i)=>(
          <div key={i}>
            <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:6 }}>
              <div style={{ width:20,height:20,borderRadius:"50%",background:i===2&&!val?"#F1F5F9":bgClr[i],color:i===2&&!val?C.muted:clr[i],display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0 }}>{i+1}</div>
              <span style={{ fontSize:11,color:i===2?C.muted:C.textSecondary,fontWeight:600 }}>{label}</span>
            </div>
            <input value={val} onChange={e=>set(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doCompare()} placeholder={ph}
              style={{ width:"100%",boxSizing:"border-box",padding:"10px 12px",border:`1.5px solid ${val?clr[i]:C.border}`,borderRadius:10,fontSize:14,background:C.bg,color:C.text,outline:"none",transition:"border-color 0.15s",fontFamily:"inherit" }}
              onFocus={e=>e.target.style.borderColor=clr[i]} onBlur={e=>e.target.style.borderColor=val?clr[i]:C.border} />

            {/* Score card under input - shows after compare */}
            {products[i] && (
              <div style={{ marginTop:8,padding:"12px",background:bgClr[i],borderRadius:10,border:`1.5px solid ${clr[i]}40` }}>
                <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:4,marginBottom:6 }}>
                  <span style={{ fontSize:12,fontWeight:800,color:clr[i],lineHeight:1.3,fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{products[i].name}</span>
                  {products[i].winner_badge&&<span style={{ fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:4,background:clr[i],color:"#fff",whiteSpace:"nowrap",flexShrink:0 }}>{products[i].winner_badge}</span>}
                </div>
                <div style={{ display:"flex",alignItems:"baseline",gap:4,marginBottom:4 }}>
                  <span style={{ fontSize:24,fontWeight:900,color:scoreColor(products[i].score),lineHeight:1 }}>{Number(products[i].score).toFixed(1)}</span>
                  <span style={{ fontSize:11,color:C.muted }}>/10</span>
                  {products[i].price_range&&<span style={{ fontSize:11,color:C.muted,marginLeft:4 }}>· {products[i].price_range}</span>}
                </div>
                {products[i].best_for&&<div style={{ fontSize:11,color:C.muted,lineHeight:1.4 }}>
                  <span style={{ fontWeight:600,color:clr[i] }}>{lg==="de"?"Ideal für":lg==="ro"?"Ideal pentru":"Best for"}:</span> {products[i].best_for}
                </div>}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Compare button */}
      <button onClick={doCompare} disabled={loading}
        style={{ width:"100%",padding:"13px",background:loading?`${C.accent}80`:C.accent,color:"#fff",border:"none",borderRadius:10,fontSize:14,fontWeight:700,cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"background 0.2s" }}>
        {loading
          ? <><span style={{ display:"inline-flex",gap:4,alignItems:"center" }}>{[0,1,2].map(i=><span key={i} style={{ width:5,height:5,borderRadius:"50%",background:"#fff",animation:`cmpBlink 1.2s ${i*0.2}s ease-in-out infinite`,display:"inline-block" }}/>)}</span> {lg==="de"?"Ai·sel vergleicht…":lg==="ro"?"Ai·sel compară…":"Ai·sel is comparing…"}</>
          : <>{lg==="de"?"Mit Ai·sel vergleichen →":lg==="ro"?"Compară cu Ai·sel →":"Compare with Ai·sel →"}</>}
      </button>

      {err&&(
        <div style={{ margin:"10px 0 0",padding:"10px 14px",background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:8 }}>
          <div style={{ color:"#DC2626",fontSize:13,fontWeight:600 }}>{err}</div>
          {errDetail&&<div style={{ color:"#991B1B",fontSize:11,marginTop:3,fontFamily:"monospace" }}>{errDetail}</div>}
        </div>
      )}

      {/* Comparison table */}
      {data?.rows && data.rows.length > 0 && (
        <div style={{ marginTop:20 }}>
          <div style={{ borderRadius:12,overflow:"hidden",border:`1px solid ${C.border}` }}>
            {/* Table header row */}
            <div style={{ display:"grid",gridTemplateColumns:`150px repeat(${products.length},1fr)`,background:"#F8FAFC",borderBottom:`1.5px solid ${C.border}` }}>
              <div style={{ padding:"10px 14px",fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:0.7 }}>
                {lg==="de"?"Merkmal":lg==="ro"?"Criteriu":"Feature"}
              </div>
              {products.map((p,i)=>(
                <div key={i} style={{ padding:"10px 12px",borderLeft:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:6 }}>
                  <div style={{ width:8,height:8,borderRadius:"50%",background:clr[i],flexShrink:0 }}/>
                  <span style={{ fontSize:11,fontWeight:800,color:clr[i],lineHeight:1.3 }}>{p.name}</span>
                </div>
              ))}
            </div>

            {/* Spec rows */}
            {data.rows.map((row,ri)=>(
              <div key={ri} style={{ display:"grid",gridTemplateColumns:`150px repeat(${products.length},1fr)`,borderBottom:ri<data.rows.length-1?`1px solid ${C.border}`:"none",background:ri%2===0?"#fff":"#FAFBFC",transition:"background 0.1s" }}
                onMouseEnter={e=>e.currentTarget.style.background="#F0F4FF"}
                onMouseLeave={e=>e.currentTarget.style.background=ri%2===0?"#fff":"#FAFBFC"}>
                <div style={{ padding:"11px 14px",fontSize:12,fontWeight:700,color:C.text,display:"flex",alignItems:"center" }}>
                  {row.label}
                </div>
                {products.map((_,pi)=>{
                  const isWin = row.winner === pi;
                  const isLose = row.winner !== -1 && row.winner !== pi;
                  return (
                    <div key={pi} style={{ padding:"11px 12px",borderLeft:`1px solid ${C.border}`,display:"flex",alignItems:"flex-start",gap:7 }}>
                      <div style={{ width:18,height:18,borderRadius:"50%",flexShrink:0,marginTop:1,display:"flex",alignItems:"center",justifyContent:"center",
                        background:isWin?"#DCFCE7":isLose?"#FEE2E2":"#F1F5F9" }}>
                        {isWin
                          ? <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="m2 6 3 3 5-5" stroke="#15803D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          : isLose
                          ? <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="m3 3 6 6M9 3 3 9" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"/></svg>
                          : <div style={{ width:5,height:5,borderRadius:"50%",background:"#94A3B8" }}/>}
                      </div>
                      <span style={{ fontSize:12,lineHeight:1.45,color:isWin?"#14532D":isLose?"#7F1D1D":C.textSecondary,fontWeight:isWin?700:400 }}>
                        {row.values?.[pi] || "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          {data.summary&&<p style={{ fontSize:12,color:C.muted,margin:"10px 2px 0",lineHeight:1.6 }}>💡 {data.summary}</p>}
        </div>
      )}
      <style>{`@keyframes cmpBlink{0%,80%,100%{opacity:.15}40%{opacity:1}}`}</style>
    </div>
  );
}

function Landing({ onStart, t, lang, setLang, profile, favorites, onShowProfile }) {
  const [count, setCount] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const [showPricing, setShowPricing] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("dp_recent") || "[]");
      setRecentSearches(saved.filter(id => CATEGORIES_LIST.some(c => c.id === id)));
    } catch(e) {}
  }, []);

  const startWithTracking = (id) => {
    try {
      const recent = JSON.parse(localStorage.getItem("dp_recent") || "[]");
      const updated = [id, ...recent.filter(x => x !== id)].slice(0, 10);
      localStorage.setItem("dp_recent", JSON.stringify(updated));
      setRecentSearches(updated);
    } catch(e) {}
    onStart("tree", id);
  };
  useEffect(() => {
    const target = 24891;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => setCount(c => Math.min(c + step, target)), 16);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <style>{`h1, h2, h3 { font-family: 'Plus Jakarta Sans', sans-serif; }`}</style>
      <TopNav showBack={false} t={t} lang={lang} setLang={setLang} count={count}
        profile={profile} onShowProfile={onShowProfile}
        favoritesCount={favorites?.length||0} onShowFavorites={()=>onStart("favorites")}
        onCategoryClick={(gid) => {
          setSelectedGroup(gid);
          setTimeout(() => document.getElementById("categories")?.scrollIntoView({behavior:"smooth", block:"start"}), 80);
        }} />
      <HeroBanner onStart={onStart} t={{ ...t, marketTag: getMarket(lang).heroTag }} lang={lang} />

      {/* Search bar */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, padding: "14px 24px", display: "none" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}></div>
      </div>

      {/* ① QUICK-ACCESS now in TopNav — remove standalone */}

      {/* ② RECENT SEARCHES BANNER */}
      {recentSearches.length > 0 && (
        <div style={{ background: `linear-gradient(135deg, #F8FAFF, #EEF3FF)`, borderBottom: `1px solid ${C.border}`, padding: "16px 24px" }}>
          <div style={{ maxWidth: 1400, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, overflowX: "auto" }}>
              <span style={{ color: C.muted, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, flexShrink: 0 }}>
                {lang === "de" ? "Zuletzt gesucht" : lang === "ro" ? "Căutări recente" : lang === "fr" ? "Récemment consulté" : "Recently viewed"}
              </span>
              {recentSearches.map(id => {
                const sub = CATEGORIES_LIST.find(c => c.id === id);
                if (!sub) return null;
                const grp = CATEGORY_GROUPS.find(g => g.subs?.some(s => s.id === id));
                return (
                  <button key={id} onClick={() => startWithTracking(id)}
                    style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 20, padding: "6px 14px", cursor: "pointer", flexShrink: 0, transition: "all 0.18s", fontSize: 13, fontWeight: 600, color: C.text }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = grp?.color || C.accent; e.currentTarget.style.color = grp?.color || C.accent; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.text; }}>
                    <span style={{ display:"flex",alignItems:"center" }}>{getIcon(id, 16)}</span>
                    {catName(id, lang)}
                  </button>
                );
              })}
              <button onClick={() => { localStorage.removeItem("dp_recent"); setRecentSearches([]); }}
                style={{ marginLeft: "auto", background: "none", border: "none", color: C.muted, fontSize: 12, cursor: "pointer", flexShrink: 0 }}>✕ Clear</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px" }}>

      {/* ③ AI POSITIONING — why we're different */}
      <div style={{ padding: "40px 0 32px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${C.accent}12`, border: `1px solid ${C.accent}30`, borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 14 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent, display: "inline-block", animation: "aselLoadPulse 1.4s ease-in-out infinite" }} />
              AI-Powered · Not just comparison
            </div>
            <h2 style={{ color: C.text, fontSize: "clamp(22px, 3vw, 34px)", fontWeight: 900, letterSpacing: -0.8, margin: "0 0 10px" }}>
              The future of decision-making is <span style={{ color: C.accent }}>here</span>
            </h2>
            <p style={{ color: C.textSecondary, fontSize: 15, lineHeight: 1.7, margin: "0 0 20px", maxWidth: 520 }}>
              Comparison tools have evolved — and so have your needs. DecisionPilot brings the next step: personalized AI intelligence that understands your priorities, cuts through the noise, and helps you decide with confidence.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[
                { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V10a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z"/><line x1="9" y1="14" x2="9.01" y2="14" strokeWidth="3"/><line x1="12" y1="14" x2="12.01" y2="14" strokeWidth="3"/><line x1="15" y1="14" x2="15.01" y2="14" strokeWidth="3"/></svg>, text: "AI learns your priorities" },
                { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, text: "Answer in under 60 seconds" },
                { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><line x1="2" y1="12" x2="22" y2="12"/></svg>, text: "30 languages supported" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 600, color: C.text }}>
                  <span>{item.icon}</span>{item.text}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, flexShrink: 0 }}>
            {[
              { num: "66+", label: lang === "de" ? "Kategorien" : lang === "ro" ? "Subcategorii" : "Categories", color: C.accent,
                action: () => document.getElementById("categories")?.scrollIntoView({behavior:"smooth"}) },
              { num: "30+", label: lang === "de" ? "Sprachen" : lang === "ro" ? "Limbi" : "Languages", color: "#7048E8",
                action: () => document.querySelector(".lang-flag-btn")?.click() },
              { num: "AI", label: lang === "de" ? "Powered" : "Powered", color: "#059669",
                action: () => onStart("chat") },
            ].map((s, i) => (
              <div key={i} onClick={s.action}
                style={{ textAlign:"center", padding:"20px 24px", background:C.card, border:`1.5px solid ${C.border}`, borderRadius:16, minWidth:80, cursor:"pointer", transition:"all 0.18s" }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor=s.color; e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow=`0 8px 24px ${s.color}22`; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}>
                <div style={{ color:s.color, fontSize:28, fontWeight:900, fontFamily:"'Plus Jakarta Sans',sans-serif", letterSpacing:-1 }}>{s.num}</div>
                <div style={{ color:C.muted, fontSize:11, marginTop:4, fontWeight:600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ④ SPLIT PROMO BANNERS */}
      <div style={{ padding: "32px 0 0" }}>
        <h2 style={{ color: C.text, fontSize: "clamp(18px, 2.5vw, 24px)", fontWeight: 800, margin: "0 0 16px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {lang === "de" ? "Beliebte Vergleiche" : lang === "ro" ? "Comparații populare" : lang === "fr" ? "Comparaisons populaires" : "Popular Comparisons"}
        </h2>
        <div className="dp-promo-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14, marginBottom: 32 }}>
          {[
            { id: "new_car", gid: "auto", title: lang === "de" ? "Auto vergleichen & sparen" : "Compare cars & save", sub: "New & used · Insurance · EV", img: "photo-1558618666-fcd25c85cd64", color: "#1A1A2E" },
            { id: "credit_card", gid: "financial", title: lang === "de" ? "Kredite von 300+ Banken" : "Loans from 300+ banks", sub: "Mortgages · Cards · Deposits", img: "photo-1611974789855-9c2a0a7236a3", color: "#0F3460" },
            { id: "mobile_plan", gid: "telecom", title: lang === "de" ? "Handyverträge vergleichen" : "Compare mobile plans", sub: "5G · Unlimited · SIM-only", img: "photo-1511707171634-5f897ff02aa9", color: "#16213E" },
            { id: "hotel", gid: "tourism", title: lang === "de" ? "Hotels & Reisen finden" : "Find hotels & travel deals", sub: "Hotels · Flights · Packages", img: "photo-1566073771259-6a8506099945", color: "#0C1445" },
          ].map(promo => (
            <div key={promo.id} onClick={() => startWithTracking(promo.id)}
              style={{ position: "relative", borderRadius: 16, overflow: "hidden", height: 100, cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ position: "absolute", inset: 0, backgroundImage: `url(https://images.unsplash.com/${promo.img}?w=600&h=200&fit=crop&auto=format)`, backgroundSize: "cover", backgroundPosition: "center" }} />
              <div style={{ position: "absolute", inset: 0, background: `linear-gradient(100deg, ${promo.color}EE 40%, ${promo.color}88 70%, transparent 100%)` }} />
              <div style={{ position: "relative", zIndex: 1, padding: "16px 20px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ color: "#fff", fontSize: 15, fontWeight: 800, marginBottom: 4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{promo.title}</div>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>{promo.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ④b AI COMPARE */}
      <CompareSection lang={lang} onStart={onStart} />
      {[
        { section: lang === "de" ? "Handys vergleichen" : lang === "ro" ? "Compară telefoane" : "Compare Smartphones", gid: "tech", items: [
          { id: "phone", label: "Apple iPhone 17 Pro", sub: lang==="de"?"ab 1€ mit Vertrag · 131 Tarife":"from €1 on contract · 131 plans", img: "photo-1592750475338-74b7b21085ab", rating: "4.9", reviews: "18.431" },
          { id: "phone", label: "Samsung Galaxy S26 Ultra", sub: lang==="de"?"ab 1€ mit Vertrag · 172 Tarife":"from €1 on contract · 172 plans", img: "photo-1610945415295-d9bbf067e59c", rating: "4.7", reviews: "12.922" },
          { id: "phone", label: "Google Pixel 10 Pro", sub: lang==="de"?"ab 1€ mit Vertrag · 89 Tarife":"from €1 on contract · 89 plans", img: "photo-1567581935884-3349723552ca", rating: "4.6", reviews: "6.211" },
          { id: "phone", label: "OnePlus 13", sub: lang==="de"?"ab 699€ · 54 Tarife":"from €699 unlocked · 54 plans", img: "photo-1574755393849-623942496936", rating: "4.5", reviews: "3.841" },
          { id: "phone", label: "Sony Xperia 1 VII", sub: lang==="de"?"ab 1€ mit Vertrag · 41 Tarife":"from €1 on contract · 41 plans", img: "photo-1512054502232-10a0a035d672", rating: "4.4", reviews: "2.108" },
        ]},
        { section: lang === "de" ? "Kredite vergleichen" : lang === "ro" ? "Compară credite" : "Compare Loans", gid: "financial", items: [
          { id: "personal_loan", label: "5.000 €", sub: lang==="de"?"ab 98,50€ / Monat · 60 Monate":"from €98/mo · 60 months", img: null, badge: "€", rating: null },
          { id: "personal_loan", label: "10.000 €", sub: lang==="de"?"ab 179,55€ / Monat · 72 Monate":"from €179/mo · 72 months", img: null, badge: "€€", rating: null },
          { id: "personal_loan", label: "20.000 €", sub: lang==="de"?"ab 314,18€ / Monat · 84 Monate":"from €314/mo · 84 months", img: null, badge: "€€€", rating: null },
          { id: "personal_loan", label: "50.000 €", sub: lang==="de"?"ab 489,92€ / Monat · 96 Monate":"from €489/mo · 96 months", img: null, badge: "€€€€", rating: null },
          { id: "mortgage", label: "150.000 €", sub: lang==="de"?"Immobilienkredit · Festzins":"Mortgage · Fixed rate", img: null, badge: "🏠", rating: null },
        ]},
      ].map(sec => {
        const grp = CATEGORY_GROUPS.find(g => g.id === sec.gid);
        return (
          <div key={sec.section} style={{ marginBottom: 36 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <h2 style={{ color: C.text, fontSize: "clamp(16px, 2.2vw, 22px)", fontWeight: 800, margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{sec.section}</h2>
              <button onClick={() => { setSelectedGroup(sec.gid); document.getElementById("categories")?.scrollIntoView({behavior:"smooth"}); }}
                style={{ background: "none", border: "none", color: C.accent, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                {lang === "de" ? "Alle Angebote →" : lang === "ro" ? "Vezi toate →" : "See all →"}
              </button>
            </div>
            <div className="dp-products-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
              {sec.items.map((item, i) => (
                <div key={i} onClick={() => startWithTracking(item.id)}
                  style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px", cursor: "pointer", transition: "all 0.2s", display: "flex", gap: 14, alignItems: "center" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = grp?.color || C.accent; e.currentTarget.style.boxShadow = `0 4px 16px ${grp?.color || C.accent}18`; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  {item.img ? (
                    <div style={{ width: 60, height: 60, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: C.bg }}>
                      <img src={`https://images.unsplash.com/${item.img}?w=120&h=120&fit=crop&auto=format`} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                    </div>
                  ) : (
                    <div style={{ width: 60, height: 60, borderRadius: 10, flexShrink: 0, background: `${grp?.color || C.accent}15`, border: `1px solid ${grp?.color || C.accent}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: grp?.color || C.accent }}>
                      {item.badge}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: C.text, fontSize: 14, fontWeight: 700, marginBottom: 3, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{item.label}</div>
                    <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.4 }}>{item.sub}</div>
                    {item.rating && <div style={{ color: "#F59E0B", fontSize: 11, marginTop: 4 }}>★ {item.rating} · {item.reviews} reviews</div>}
                  </div>
                  <span style={{ color: C.accent, fontSize: 16 }}>›</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* ⑤b TOURISM DESTINATIONS — CHECK24 style with real photos */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <h2 style={{ color:C.text, fontSize:"clamp(16px,2.2vw,22px)", fontWeight:800, margin:0, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
            {lang==="de"?"Beliebte Reiseziele":lang==="ro"?"Destinații populare":"Popular Destinations"}
          </h2>
          <button onClick={()=>startWithTracking("hotel")} style={{ background:"none",border:"none",color:C.accent,fontSize:13,fontWeight:700,cursor:"pointer" }}>
            {lang==="de"?"Alle Angebote →":lang==="ro"?"Vezi toate →":"Explore all →"}
          </button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:12 }}>
          {[
            { name:"Mallorca", country:lang==="de"?"Spanien":lang==="ro"?"Spania":"Spain", img:"photo-1570197788417-0e82375c9371", price:"ab 442€" },
            { name:"Santorini", country:lang==="de"?"Griechenland":lang==="ro"?"Grecia":"Greece", img:"photo-1533105079780-92b9be482077", price:"ab 580€" },
            { name:"Alanya", country:lang==="de"?"Türkei":lang==="ro"?"Turcia":"Turkey", img:"photo-1527631746610-bca00a040d60", price:"ab 389€" },
            { name:"Dubai", country:lang==="de"?"VAE":lang==="ro"?"EAU":"UAE", img:"photo-1512453979798-5ea266f8880c", price:"ab 620€" },
          ].map((d,i) => (
            <div key={i} onClick={()=>startWithTracking("hotel")} style={{ position:"relative",borderRadius:14,overflow:"hidden",cursor:"pointer",aspectRatio:"4/3",transition:"transform 0.2s" }}
              onMouseEnter={e=>e.currentTarget.style.transform="scale(1.02)"}
              onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
              <img src={`https://images.unsplash.com/${d.img}?w=400&h=300&fit=crop&auto=format`} onError={e=>{e.target.style.display="none";e.target.parentNode.style.background="#1e3a5f";}} style={{ width:"100%",height:"100%",objectFit:"cover",display:"block" }} alt={d.name} />
              <div style={{ position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.72) 0%,transparent 55%)" }} />
              <div style={{ position:"absolute",bottom:0,left:0,padding:"14px 16px" }}>
                <div style={{ color:"#fff",fontSize:17,fontWeight:800,fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{d.name}</div>
                <div style={{ color:"rgba(255,255,255,0.8)",fontSize:12 }}>{d.country} · {d.price}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
          {[
            { name:"Barcelona", country:lang==="de"?"Spanien":"Spain", img:"photo-1539037116277-4db20889f2d4", price:"ab 310€" },
            { name:"Hurghada", country:lang==="de"?"Ägypten":lang==="ro"?"Egipt":"Egypt", img:"photo-1539650116574-8efeb43e2750", price:"ab 399€" },
            { name:"Maldives", country:"Maldives", img:"photo-1573843981267-be1999ff37cd", price:"ab 1.290€" },
            { name:"Kreta", country:lang==="de"?"Griechenland":"Greece", img:"photo-1586861203927-800a5acdcc4d", price:"ab 359€" },
          ].map((d,i) => (
            <div key={i} onClick={()=>startWithTracking("hotel")} style={{ position:"relative",borderRadius:14,overflow:"hidden",cursor:"pointer",aspectRatio:"4/3",transition:"transform 0.2s" }}
              onMouseEnter={e=>e.currentTarget.style.transform="scale(1.02)"}
              onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
              <img src={`https://images.unsplash.com/${d.img}?w=400&h=300&fit=crop&auto=format`} onError={e=>{e.target.style.display="none";e.target.parentNode.style.background="#1e3a5f";}} style={{ width:"100%",height:"100%",objectFit:"cover",display:"block" }} alt={d.name} />
              <div style={{ position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.72) 0%,transparent 55%)" }} />
              <div style={{ position:"absolute",bottom:0,left:0,padding:"14px 16px" }}>
                <div style={{ color:"#fff",fontSize:16,fontWeight:800,fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{d.name}</div>
                <div style={{ color:"rgba(255,255,255,0.8)",fontSize:12 }}>{d.country} · {d.price}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ⑥ TRUST RATINGS */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "24px 28px", marginBottom: 40, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ color: C.text, fontSize: 16, fontWeight: 800, marginBottom: 4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Trusted by users worldwide</div>
          <div style={{ color: C.muted, fontSize: 13 }}>AI-powered decisions. Real results. No bias.</div>
        </div>
        {[
          { stars: "★★★★★", score: "4.9", label: "Google Reviews", count: "2,841 ratings" },
          { stars: "★★★★★", score: "4.8", label: "Trustpilot", count: "1,290 ratings" },
        ].map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", background: "#fff", border: `1px solid ${C.border}`, borderRadius: 12 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#F59E0B", fontSize: 18, letterSpacing: 1 }}>{r.stars}</div>
              <div style={{ color: C.text, fontSize: 22, fontWeight: 900, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{r.score}</div>
            </div>
            <div>
              <div style={{ color: C.text, fontSize: 13, fontWeight: 700 }}>{r.label}</div>
              <div style={{ color: C.muted, fontSize: 11 }}>{r.count}</div>
            </div>
          </div>
        ))}
      </div>

      </div>{/* end maxWidth wrapper */}

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px" }}>

        {/* ══ HOW IT WORKS + TRANSPARENCY ══ */}
        <div style={{ marginBottom: 0 }}>
          <div style={{ background:`linear-gradient(135deg,${C.accent} 0%,#7048E8 100%)`,padding:"40px 24px",textAlign:"center",margin:"0 -24px 48px",position:"relative",overflow:"hidden" }}>
            <img src="/asel-medium.png" alt="Ai·sel"
              style={{ position:"absolute",right:"4%",bottom:0,height:"130%",maxHeight:200,objectFit:"contain",objectPosition:"center bottom",filter:"drop-shadow(0 6px 20px rgba(0,0,0,0.2))",opacity:0.9,pointerEvents:"none" }} />
            <div style={{ display:"inline-block",background:"rgba(255,255,255,0.15)",color:"#fff",borderRadius:20,padding:"4px 14px",fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:12 }}>Guide</div>
            <h2 style={{ color:"#fff",fontSize:"clamp(26px,4vw,42px)",fontWeight:900,letterSpacing:-1,margin:"0 0 10px" }}>
              {lang==="de"?"Wie es funktioniert":lang==="es"?"Cómo funciona":lang==="ro"?"Cum funcționează":"How it works"}
            </h2>
            <p style={{ color:"rgba(255,255,255,0.82)",fontSize:17,margin:0 }}>
              {lang==="de"?"Deine Antwort in unter 60 Sekunden":lang==="es"?"Tu respuesta en menos de 60 segundos":lang==="ro"?"Răspunsul tău în mai puțin de 60 de secunde":"Get your answer in under 60 seconds"}
            </p>
          </div>

          <div className="steps-grid" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:18,marginBottom:32 }}>
            {[
              { num:1, grad:[C.accent,C.purple],
                title: lang==="de"?"Kategorie wählen":lang==="es"?"Elige una categoría":lang==="ro"?"Alege o categorie":"Choose a category",
                desc: lang==="de"?"Wähle aus 66+ Kategorien — von Smartphones bis Krediten.":lang==="es"?"Elige entre 66+ categorías — de smartphones a préstamos.":lang==="ro"?"Alege din 66+ categorii — de la telefoane la credite.":"Pick from 66+ categories — smartphones to loans to hotels.",
                icon:<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg> },
              { num:2, grad:[C.purple,"#059669"],
                title: lang==="de"?"Einige Fragen beantworten":lang==="es"?"Responde algunas preguntas":lang==="ro"?"Răspunde la câteva întrebări":"Answer a few questions",
                desc: lang==="de"?"Ai·sel lernt genau, was du brauchst — Budget, Nutzung, Prioritäten.":lang==="es"?"Ai·sel aprende exactamente lo que necesitas — presupuesto, uso, prioridades.":lang==="ro"?"Ai·sel află exact ce ai nevoie — buget, utilizare, priorități.":"Ai·sel learns exactly what you need — budget, usage, priorities.",
                icon:<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
              { num:3, grad:["#059669",C.gold],
                title: lang==="de"?"KI analysiert Optionen":lang==="es"?"La IA analiza opciones":lang==="ro"?"AI analizează opțiunile":"AI analyzes hundreds of options",
                desc: lang==="de"?"Durchsucht CNET, Wirecutter, Booking und mehr. Filtert nach deinem Profil — nicht nach Kommissionen.":lang==="es"?"Busca en CNET, Wirecutter, Booking y más. Filtra por tu perfil — no por comisiones.":lang==="ro"?"Caută pe CNET, Wirecutter, Booking și mai mult. Filtrează după profilul tău — nu după comisioane.":"Searches CNET, Wirecutter, Booking & more. Filters by your profile — not by commissions.",
                icon:<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg> },
              { num:4, grad:[C.gold,C.accent],
                title: lang==="de"?"Top-Empfehlungen erhalten":lang==="es"?"Recibe tus mejores opciones":lang==="ro"?"Primești top recomandări":"Get your top matches + why",
                desc: lang==="de"?"Personalisierte Empfehlungen mit Vor-/Nachteilen, Match-Score und direkten Links. Wir erklären, warum jede Empfehlung zu dir passt.":lang==="es"?"Recomendaciones personalizadas con pros/contras, puntuación de coincidencia y enlaces directos. Explicamos por qué cada opción se adapta a ti.":lang==="ro"?"Recomandări personalizate cu avantaje/dezavantaje, scor de potrivire și link-uri directe. Explicăm de ce fiecare recomandare ți se potrivește.":"Personalized picks with pros/cons, Match %, and direct links. We explain exactly why each recommendation fits your needs.",
                icon:<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="m9 12 2 2 4-4"/></svg> },
            ].map((s,i) => (
              <div key={i} style={{ background:`${s.grad[0]}08`,border:`1px solid ${s.grad[0]}22`,borderRadius:18,padding:"26px 22px",transition:"all 0.2s ease" }}
                onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow=`0 12px 28px ${s.grad[0]}18`; }}
                onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}>
                <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:16 }}>
                  <div style={{ width:44,height:44,borderRadius:12,flexShrink:0,background:`linear-gradient(135deg,${s.grad[0]},${s.grad[1]})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",boxShadow:`0 4px 14px ${s.grad[0]}40` }}>{s.icon}</div>
                  <span style={{ color:s.grad[0],fontWeight:800,fontSize:11,letterSpacing:1.2,textTransform:"uppercase" }}>
                    {lang==="de"?`Schritt ${s.num}`:lang==="es"?`Paso ${s.num}`:lang==="ro"?`Pasul ${s.num}`:`Step ${s.num}`}
                  </span>
                </div>
                <div style={{ color:C.text,fontWeight:700,fontSize:15,marginBottom:6,fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{s.title}</div>
                <div style={{ color:C.muted,fontSize:13,lineHeight:1.65 }}>{s.desc}</div>
              </div>
            ))}
          </div>

        </div>

        {/* Categories - immediately after How it works */}
        <div id="categories" style={{ marginTop: 48, marginBottom: 80 }}>
          {/* Full-width categories banner */}
          <div style={{ background: `linear-gradient(135deg, ${C.purple} 0%, ${C.accent} 100%)`, padding: "40px 24px", textAlign: "center", margin: "0 -24px 40px" }}>
            <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 20, padding: "4px 14px", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Explore</div>
            <h2 style={{ color: "#fff", fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 900, letterSpacing: -1, margin: "0 0 10px" }}>{t?.what_title || "What can you decide?"}</h2>
            <p style={{ color: "rgba(255,255,255,0.82)", fontSize: 17, margin: 0 }}>
              {selectedGroup ? catName(selectedGroup, lang) : `${CATEGORY_GROUPS.length} categories · ${CATEGORIES_LIST.length} subcategories`}
            </p>
          </div>

          {/* LEVEL 1 — Main category tiles (hidden when group selected) */}
          {!selectedGroup && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 14 }}>
              {CATEGORY_GROUPS.map(group => (
                <button key={group.id} onClick={() => setSelectedGroup(group.id)}
                  style={{
                    background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 18,
                    padding: "22px 14px", cursor: "pointer", textAlign: "center",
                    transition: "all 0.2s cubic-bezier(.4,0,.2,1)",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = `${group.color}10`;
                    e.currentTarget.style.borderColor = `${group.color}60`;
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = `0 12px 30px ${group.color}20`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = C.card;
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                    background: `${group.color}16`, border: `1.5px solid ${group.color}35`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
                  }}>{group.emoji}</div>
                  <div style={{ color: C.text, fontSize: 13, fontWeight: 700, lineHeight: 1.3, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {catName(group.id, lang)}
                  </div>
                  <div style={{ color: C.muted, fontSize: 11, fontWeight: 500 }}>
                    {group.subs.length} {lang === "ro" ? "subcategorii" : lang === "de" ? "Unterkategorien" : lang === "fr" ? "sous-catégories" : lang === "es" ? "subcategorías" : "subcategories"}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* LEVEL 2 — Subcategory view (shown when group is selected) */}
          {selectedGroup && (() => {
            const group = CATEGORY_GROUPS.find(g => g.id === selectedGroup);
            if (!group) return null;
            return (
              <div style={{ animation: "fadeUp 0.3s ease" }}>
                {/* Back + group header */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
                  <button onClick={() => setSelectedGroup(null)} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10,
                    padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 700, color: C.textSecondary,
                    transition: "all 0.15s", flexShrink: 0,
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = group.color; e.currentTarget.style.color = group.color; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSecondary; }}>
                    ← {lang === "ro" ? "Categorii" : lang === "de" ? "Kategorien" : lang === "fr" ? "Catégories" : lang === "es" ? "Categorías" : "Categories"}
                  </button>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width:40,height:40,borderRadius:12,background:`${group.color}16`,border:`1.5px solid ${group.color}40`,display:"flex",alignItems:"center",justifyContent:"center",color:group.color }}>
                      {CAT_SVG_ICONS[group.id] || getIcon(group.id)}
                    </div>
                    <div>
                      <div style={{ color: C.text, fontSize: 18, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{catName(group.id, lang)}</div>
                      <div style={{ color: C.muted, fontSize: 12 }}>{group.subs.length} {lang === "ro" ? "subcategorii disponibile" : "subcategories"}</div>
                    </div>
                  </div>
                </div>

                {/* Subcategory grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                  {group.subs.map(sub => (
                    <button key={sub.id} onClick={() => onStart("tree", sub.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        background: C.card, border: `1.5px solid ${C.border}`,
                        borderRadius: 14, padding: "14px 16px",
                        cursor: "pointer", transition: "all 0.18s", textAlign: "left",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = `${group.color}0e`;
                        e.currentTarget.style.borderColor = `${group.color}55`;
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = `0 6px 18px ${group.color}18`;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = C.card;
                        e.currentTarget.style.borderColor = C.border;
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}>
                      <span style={{ display:"flex",alignItems:"center",color:group.color }}>{getIcon(sub.id)}</span>
                      <span style={{ color: C.text, fontSize: 13.5, fontWeight: 600, lineHeight: 1.3 }}>{catName(sub.id, lang)}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* AI Chat CTA - Can't find your category? */}
        <div style={{ marginBottom: 80 }}>
          <div style={{
            background: `linear-gradient(135deg, ${C.accent} 0%, #3B5BDB 50%, #7048E8 100%)`,
            borderRadius: 24,
            boxShadow: `0 20px 60px ${C.accent}30`,
            padding: "52px 40px",
            textAlign: "center",
          }}>
            <h2 style={{ color: "#fff", fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 900, letterSpacing: -0.8, margin: "0 0 12px" }}>
              Can't find your category?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 16, margin: "0 0 28px", lineHeight: 1.6 }}>
              Chat with Ai·sel about any decision — from choosing a university to planning a wedding.
            </p>
            <button onClick={() => onStart("chat")} style={{
              background: "#fff", color: C.accent, border: "none", borderRadius: 14,
              padding: "14px 32px", fontSize: 16, fontWeight: 800, cursor: "pointer",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)", transition: "all 0.2s",
              display: "inline-flex", alignItems: "center", gap: 10,
            }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
              <img src="/asel-mascot.png" style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover", objectPosition: "30% 8%" }} alt="Ai·sel" />
              Chat with Ai·sel →
            </button>
          </div>
        </div>

        {/* Pricing — hidden until launch */}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          CONCEPT SECTION — International platform for every need
      ═══════════════════════════════════════════════════════════ */}
      <div style={{ background: `linear-gradient(135deg, #0F172A 0%, #1E2D4A 50%, #0F172A 100%)`, padding: "72px 24px", overflow: "hidden", position: "relative" }}>

        {/* Decorative globe grid lines */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.07, backgroundImage: "radial-gradient(circle at 50% 50%, #1A56DB 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(26,86,219,0.2)", border: "1px solid rgba(26,86,219,0.4)", borderRadius: 24, padding: "5px 16px", fontSize: 11, fontWeight: 700, color: "#60A5FA", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 20 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#60A5FA", display: "inline-block", animation: "aselLoadPulse 1.5s ease-in-out infinite" }} />
              Global Vision · Local Intelligence
            </div>
            <h2 style={{ color: "#fff", fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 900, margin: "0 0 16px", letterSpacing: -1, fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.1 }}>
              One platform.<br />
              <span style={{ background: "linear-gradient(90deg, #60A5FA, #A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Every decision. Everywhere.</span>
            </h2>
            <p style={{ color: "#94A3B8", fontSize: 17, maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
              DecisionPilot is built for a world without borders — whether you're choosing a phone in Tokyo, a mortgage in Berlin, or a hotel in Dubai, <button onClick={()=>window.dispatchEvent(new Event("openChat"))} style={{ background:"none",border:"none",color:"#7C3AED",fontWeight:700,cursor:"pointer",fontSize:"inherit",padding:0,textDecoration:"underline",textDecorationStyle:"dotted" }}>Ai·sel</button> speaks your language and understands your market.
            </p>
          </div>

          {/* 4 pillars */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 52 }}>
            {[
              { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><line x1="2" y1="12" x2="22" y2="12"/></svg>, title: "30+ Languages", sub: "Full UI and AI responses in your native language — from Arabic to Vietnamese.", color: "#3B82F6" },
              { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="8" height="8" rx="1.5"/><rect x="14" y="3" width="8" height="8" rx="1.5"/><rect x="2" y="14" width="8" height="8" rx="1.5"/><rect x="14" y="14" width="8" height="8" rx="1.5"/></svg>, title: "66+ Categories", sub: "Finance, tech, travel, health, education and more — every major life decision covered.", color: "#8B5CF6" },
              { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V10a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z"/><line x1="9" y1="14" x2="9.01" y2="14" strokeWidth="2.5"/><line x1="12" y1="14" x2="12.01" y2="14" strokeWidth="2.5"/><line x1="15" y1="14" x2="15.01" y2="14" strokeWidth="2.5"/></svg>, title: "AI-Personalized", sub: "No generic lists. Ai·sel learns your priorities and tailors every recommendation to you.", color: "#10B981" },
              { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><line x1="12" y1="15" x2="12" y2="17" strokeWidth="2"/></svg>, title: "No Account Needed", sub: "Zero signup, zero tracking. Your decisions stay private — always.", color: "#F59E0B" },
            ].map((p, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: "28px 24px", transition: "all 0.25s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = `${p.color}44`; e.currentTarget.style.transform = "translateY(-4px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                <div style={{ marginBottom: 16, display:"flex", alignItems:"center", justifyContent:"flex-start" }}>{p.icon}</div>
                <div style={{ color: "#fff", fontSize: 17, fontWeight: 800, marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{p.title}</div>
                <div style={{ color: "#64748B", fontSize: 14, lineHeight: 1.6 }}>{p.sub}</div>
              </div>
            ))}
          </div>

          {/* Global reach strip */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "24px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#fff", fontSize: 16, fontWeight: 800, marginBottom: 4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Available worldwide — free forever</div>
              <div style={{ color: "#475569", fontSize: 13 }}>No country restrictions. No premium wall for basic decisions. Built for everyone, everywhere.</div>
            </div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
              {[
                ["DE","Germany"],["US","United States"],["FR","France"],["GB","United Kingdom"],
                ["RO","Romania"],["ES","Spain"],["IT","Italy"],["JP","Japan"],
                ["CN","China"],["BR","Brazil"],["SA","Saudi Arabia"],["IN","India"],
                ["PT","Portugal"],["NL","Netherlands"],["PL","Poland"],["RU","Russia"],
                ["TR","Turkey"],["SE","Sweden"],["KR","South Korea"],["AU","Australia"],
                ["MX","Mexico"],["NG","Nigeria"],["UA","Ukraine"],["CZ","Czech Republic"],
                ["HU","Hungary"],["GR","Greece"],["TH","Thailand"],["NO","Norway"],
                ["AR","Argentina"],["ZA","South Africa"],
              ].map(([code, name], i) => (
                <div key={i} style={{ position:"relative" }} className="cc-wrap">
                  <span style={{ fontSize:11, fontWeight:800, color:"#FBBF24", letterSpacing:0.4, padding:"2px 5px", border:"1px solid rgba(251,191,36,0.25)", borderRadius:4, transition:"all 0.2s", cursor:"default", lineHeight:1, display:"inline-block" }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "rgba(251,191,36,0.18)";
                      e.currentTarget.nextSibling.style.opacity = "1";
                      e.currentTarget.nextSibling.style.transform = "translateX(-50%) translateY(-4px)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.nextSibling.style.opacity = "0";
                      e.currentTarget.nextSibling.style.transform = "translateX(-50%) translateY(0)";
                    }}>
                    {code}
                  </span>
                  <span style={{ position:"absolute", bottom:"calc(100% + 6px)", left:"50%", transform:"translateX(-50%) translateY(0)", background:"rgba(15,23,42,0.95)", color:"#fff", fontSize:11, fontWeight:600, padding:"4px 8px", borderRadius:6, whiteSpace:"nowrap", pointerEvents:"none", opacity:0, transition:"all 0.15s", zIndex:20, boxShadow:"0 4px 12px rgba(0,0,0,0.3)" }}>
                    {name}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <WorldwideSection t={t} />

      {/* Testimonials */}
      <div style={{ background: C.bg, padding: "64px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ display: "inline-block", background: C.accentLight, color: C.accent, borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 16 }}>Loved by users</div>
            <h2 style={{ color: C.text, fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, letterSpacing: -1, margin: "0 0 12px" }}>Real decisions, real results</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {[
              { name: "Maria K.", tag: "Vacation", grad: [C.accent, "#38BDF8"], stars: 5, quote: "Saved me hours comparing vacation deals. Booked my trip to Greece in 10 minutes!" },
              { name: "Thomas B.", tag: "Car", grad: [C.purple, C.accent], stars: 5, quote: "I was stuck choosing between two cars for weeks. Ai·sel sorted it out in one chat." },
              { name: "Sophie L.", tag: "Phone", grad: [C.gold, "#F472B6"], stars: 4, quote: "Finally a comparison site that doesn't feel like an ad. Genuinely helpful." },
            ].map((r, i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: "24px", boxShadow: C.shadow }}>
                <div style={{ color: "#FBBF24", fontSize: 14, letterSpacing: 1, marginBottom: 12 }}>{"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}</div>
                <p style={{ color: C.textSecondary, fontSize: 14.5, lineHeight: 1.65, marginBottom: 18 }}>"{r.quote}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${r.grad[0]}, ${r.grad[1]})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 800, fontSize: 14, fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}>{r.name.split(" ").map(p => p[0]).join("")}</div>
                  <div>
                    <div style={{ color: C.text, fontWeight: 700, fontSize: 13.5 }}>{r.name}</div>
                    <div style={{ color: C.muted, fontSize: 11.5 }}>{r.tag} decision</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trusted partners */}
      <div style={{ background: "#fff", borderTop: `1px solid ${C.border}`, padding: "48px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-block", background: C.accentLight, color: C.accent, borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 16 }}>Our partners</div>
          <h2 style={{ color: C.text, fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 900, letterSpacing: -0.8, margin: "0 0 24px" }}>Compare across trusted platforms</h2>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10, marginBottom: 18 }}>
            {["AutoScout24", "CHECK24", "Booking.com", "Wayfair", "Sixt", "Europcar"].map(name => (
              <div key={name} style={{ fontWeight: 700, fontSize: 13, color: C.textSecondary, background: C.bg, border: `1px solid ${C.border}`, padding: "10px 16px", borderRadius: 12 }}>{name}</div>
            ))}
          </div>
          <p style={{ color: C.muted, fontSize: 12.5 }}>Independent comparisons — we never favor one partner over another.</p>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ background: "#fff", padding: "64px 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ display: "inline-block", background: C.accentLight, color: C.accent, borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 16 }}>FAQ</div>
            <h2 style={{ color: C.text, fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, letterSpacing: -1, margin: "0 0 12px" }}>Frequently asked questions</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { q: "Is DecisionPilot really free?", a: "Yes — DecisionPilot is completely free to use. No account needed, no limits. Advanced features coming soon." },
              { q: "How does the AI make recommendations?", a: "We analyze your answers alongside real-time data from trusted sources like CNET, Wirecutter, and Booking.com to suggest options that actually fit your situation." },
              { q: "Do you sell my data?", a: "No. We don't sell your personal data to third parties. Some of our recommendations include affiliate links to partners like AutoScout24 or Booking.com, which helps keep DecisionPilot free." },
              { q: "Which categories can I get help with?", a: "Right now: vacations, phones, laptops, TVs, cars, fitness gear, pets, dining, and career decisions — with more being added." },
              { q: "Can I trust the recommendations?", a: "Our comparisons are independent — we never favor a partner just because of commission. Every pick includes pros, cons, and the source we used." },
              { q: "What languages does it support?", a: "DecisionPilot automatically detects your language and supports over 30 languages." },
            ].map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={i} style={{ border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", background: open ? C.accentLight : C.card }}>
                  <button onClick={() => setOpenFaq(open ? -1 : i)} style={{
                    width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer",
                    padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                  }}>
                    <span style={{ color: C.text, fontWeight: 700, fontSize: 15 }}>{f.q}</span>
                    <span style={{
                      color: C.accent, fontSize: 18, fontWeight: 700, flexShrink: 0,
                      transform: open ? "rotate(45deg)" : "rotate(0deg)", transition: "transform 0.2s ease",
                    }}>+</span>
                  </button>
                  <div style={{
                    maxHeight: open ? 200 : 0, overflow: "hidden", transition: "max-height 0.3s ease",
                  }}>
                    <p style={{ color: C.textSecondary, fontSize: 14, lineHeight: 1.65, margin: "0 20px 18px" }}>{f.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer — CHECK24 style */}
      <div style={{ background: "#0F172A", padding: "56px 24px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Top row: logo + columns */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 32, marginBottom: 40 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${C.accent}, #6B8EFF)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, overflow: "hidden" }}>
                  <img src="/asel-mascot.png" style={{ width: 28, height: 28, objectFit: "cover", objectPosition: "30% 8%" }} alt="" />
                </div>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 16, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>DecisionPilot</span>
              </div>
              <p style={{ color: "#64748B", fontSize: 13, lineHeight: 1.6, marginTop: 0, maxWidth: 200 }}>
                AI-powered decisions. 66+ categories. 30+ languages. Free forever.
              </p>
            </div>

            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 14, letterSpacing: 0.4 }}>Explore</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {CATEGORY_GROUPS.slice(0,5).map(g => (
                  <a key={g.id} href="#categories" style={{ color:"#94A3B8", fontSize:13, textDecoration:"none", display:"flex", alignItems:"center", gap:8, transition:"color 0.15s" }}
                    onMouseEnter={e=>e.currentTarget.style.color="#fff"}
                    onMouseLeave={e=>e.currentTarget.style.color="#94A3B8"}>
                    <span style={{ display:"flex", color:"inherit", opacity:0.5, flexShrink:0 }}>{CAT_SVG_ICONS[g.id]
                      ? React.cloneElement(CAT_SVG_ICONS[g.id], { width:13, height:13 })
                      : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="4"/></svg>}
                    </span>
                    {catName(g.id, lang)}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 14, letterSpacing: 0.4 }}>More</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {CATEGORY_GROUPS.slice(5,10).map(g => (
                  <a key={g.id} href="#categories" style={{ color:"#94A3B8", fontSize:13, textDecoration:"none", display:"flex", alignItems:"center", gap:8, transition:"color 0.15s" }}
                    onMouseEnter={e=>e.currentTarget.style.color="#fff"}
                    onMouseLeave={e=>e.currentTarget.style.color="#94A3B8"}>
                    <span style={{ display:"flex", color:"inherit", opacity:0.5, flexShrink:0 }}>{CAT_SVG_ICONS[g.id]
                      ? React.cloneElement(CAT_SVG_ICONS[g.id], { width:13, height:13 })
                      : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="4"/></svg>}
                    </span>
                    {catName(g.id, lang)}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 14, letterSpacing: 0.4 }}>Company</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <a href="/about" style={{ color: "#94A3B8", fontSize: 13, textDecoration: "none" }}>About</a>
                <a href="/contact" style={{ color: "#94A3B8", fontSize: 13, textDecoration: "none" }}>Contact</a>
                <span style={{ color: "#64748B", fontSize: 13 }}>Partners</span>
              </div>
            </div>

            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 14, letterSpacing: 0.4 }}>Legal</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <a href="/privacy" style={{ color: "#94A3B8", fontSize: 13, textDecoration: "none" }}>Privacy Policy</a>
                <a href="/terms" style={{ color: "#94A3B8", fontSize: 13, textDecoration: "none" }}>Terms of Service</a>
                <a href="/cookies" style={{ color: "#94A3B8", fontSize: 13, textDecoration: "none" }}>Cookie Policy</a>
              </div>
            </div>
          </div>

          {/* Bottom bar — CHECK24 style */}
          <div style={{ borderTop: "1px solid #1E293B", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ color: "#334155", fontSize: 12 }}>© 2026 DecisionPilot.tech</span>
              {/* Impressum — very small, discrete, legally required */}
              <a href="/impressum" style={{ color: "#334155", fontSize: 11, textDecoration: "none" }}
                onMouseEnter={e=>e.currentTarget.style.color="#64748B"}
                onMouseLeave={e=>e.currentTarget.style.color="#334155"}>
                Impressum
              </a>
              <span style={{ color: "#1E293B", fontSize: 11 }}>·</span>
              <a href="/privacy" style={{ color: "#334155", fontSize: 11, textDecoration: "none" }}>Privacy</a>
              <span style={{ color: "#1E293B", fontSize: 11 }}>·</span>
              <a href="/terms" style={{ color: "#334155", fontSize: 11, textDecoration: "none" }}>Terms</a>
            </div>
            {/* Social icons — CHECK24 style */}
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {[
                { icon: "f", label: "Facebook", href: "#" },
                { icon: "▶", label: "YouTube", href: "#" },
                { icon: "◉", label: "Instagram", href: "#" },
                { icon: "♪", label: "TikTok", href: "#" },
              ].map(s => (
                <a key={s.label} href={s.href} aria-label={s.label}
                  style={{ width: 32, height: 32, borderRadius: "50%", background: "#1E293B", border: "1px solid #334155", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B", fontSize: 13, textDecoration: "none", transition: "all 0.2s" }}
                  onMouseEnter={e=>{e.currentTarget.style.background="#334155";e.currentTarget.style.color="#fff";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="#1E293B";e.currentTarget.style.color="#64748B";}}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

  </div>
  );
}

function ChatScreen({ onBack, t, lang, setLang }) {
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Hi, I'm Ai·sel! 👋 Tell me about any decision you're facing — vacation, car, home, phone, career, beauty, insurance, or anything else. I'll ask a few smart questions and give you a personalized recommendation.",
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => {
    function handleOpenChat() {}
    window.addEventListener("openChat", handleOpenChat);
    return () => window.removeEventListener("openChat", handleOpenChat);
  }, []);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })), lang }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection error. Please try again." }]);
    } finally { setLoading(false); }
  }

  const suggestions = ["Best beach vacation under $1,000", "iPhone vs Samsung Galaxy 2026", "Best laptop for university students", "Should I get a cat or a dog?"];

  return (
    <div style={{ height: "100vh", background: C.bg, display: "flex", flexDirection: "column", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <TopNav showBack onBack={onBack} t={t} lang={lang} setLang={setLang} />

      <div style={{ flex: 1, overflowY: "auto", padding: "28px 24px", maxWidth: 800, margin: "0 auto", width: "100%" }}>
        {messages.length === 1 && (
          <div style={{ marginBottom: 28 }}>
            <p style={{ color: C.muted, fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12 }}>{t?.try_asking || "Try asking"}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => setInput(s)}
                  style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: "8px 16px", color: C.textSecondary, fontSize: 13, cursor: "pointer", boxShadow: C.shadow, transition: "all 0.15s", fontWeight: 500 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.accent; e.currentTarget.style.background = C.accentLight; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSecondary; e.currentTarget.style.background = C.card; }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 18, animation: "fadeUp 0.3s ease" }}>
            {m.role === "assistant" && (
              <div style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0, marginRight: 10, marginTop: 2, background: "#EEF3FF", border: "2px solid #E8ECF4", overflow: "hidden", boxShadow: "0 4px 12px rgba(29,78,216,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src="/asel-mascot.png" alt="Ai·sel" style={{ width: 38, height: 38, objectFit: "cover", objectPosition: "top center" }} />
              </div>
            )}
            <div style={{
              maxWidth: "78%", padding: "14px 18px",
              borderRadius: m.role === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
              background: m.role === "user" ? `linear-gradient(135deg, ${C.accent}, #3B5BDB)` : C.card,
              border: m.role === "user" ? "none" : `1px solid ${C.border}`,
              color: m.role === "user" ? "#fff" : C.text,
              fontSize: 14, lineHeight: 1.75, whiteSpace: "pre-wrap",
              boxShadow: m.role === "user" ? `0 4px 16px ${C.accent}33` : C.shadow,
            }}>{m.content}</div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0, background: "#EEF3FF", border: "2px solid #E8ECF4", overflow: "hidden", boxShadow: "0 4px 12px rgba(29,78,216,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src="/asel-mascot.png" alt="Ai·sel" style={{ width: 38, height: 38, objectFit: "cover", objectPosition: "top center", animation: "aselLoadPulse 1.2s ease-in-out infinite" }} />
            </div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "20px 20px 20px 4px", padding: "14px 18px", boxShadow: C.shadow }}>
              <div style={{ display: "flex", gap: 5 }}>
                {[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: C.accent, animation: `bounce 1.2s ease-in-out ${i * 0.18}s infinite` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ background: C.card, borderTop: `1px solid ${C.border}`, padding: "16px 24px", boxShadow: "0 -4px 20px rgba(15,23,42,0.06)" }}>
        <div style={{ display: "flex", gap: 10, maxWidth: 800, margin: "0 auto" }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            placeholder={t?.placeholder || "Ask me anything — vacation, phone, career..."}
            style={{ flex: 1, background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "13px 18px", color: C.text, fontSize: 14, outline: "none", fontFamily: "inherit", transition: "border-color 0.15s" }}
            onFocus={e => e.target.style.borderColor = C.accent}
            onBlur={e => e.target.style.borderColor = C.border} />
          <button onClick={send} disabled={loading || !input.trim()}
            style={{ background: input.trim() ? `linear-gradient(135deg, ${C.accent}, #3B5BDB)` : C.border, color: "#fff", border: "none", borderRadius: 12, padding: "13px 22px", cursor: input.trim() ? "pointer" : "default", fontSize: 18, boxShadow: input.trim() ? `0 4px 16px ${C.accent}44` : "none", transition: "all 0.15s" }}>↑</button>
        </div>
      </div>

      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes aselLeanBob { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-8px);} }
        @keyframes aselLoadPulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.08);} }
      `}</style>
    </div>
  );
}

const FREE_DAILY_LIMIT = Infinity; // Unlimited — pricing not active

function getDecisionCount() {
  if (typeof window === "undefined") return 0;
  const today = new Date().toDateString();
  const stored = JSON.parse(localStorage.getItem("dp_decisions") || "{}");
  if (stored.date !== today) return 0;
  return stored.count || 0;
}

function incrementDecisionCount() {
  const today = new Date().toDateString();
  const current = getDecisionCount();
  localStorage.setItem("dp_decisions", JSON.stringify({ date: today, count: current + 1 }));
}


// ═══════════════════════════════════════════════════════════════
// USER PROFILE + FAVORITES SYSTEM (localStorage, no personal data)
// ═══════════════════════════════════════════════════════════════



const BUDGET_RANGES = [
  { id:"tight",  label:"< €100/mo",  icon:"💰" },
  { id:"medium", label:"€100–500",   icon:"💶" },
  { id:"comfort",label:"€500–2000",  icon:"💳" },
  { id:"premium",label:"€2000+/mo",  icon:"🏆" },
];

const TECH_LEVELS = [
  { id:"beginner",     label:{ en:"Beginner",     de:"Anfänger",   ro:"Începător"  } },
  { id:"intermediate", label:{ en:"Intermediate",  de:"Mittelstufe",ro:"Intermediar"} },
  { id:"advanced",     label:{ en:"Advanced",      de:"Fortgeschrittener",ro:"Avansat"}},
  { id:"expert",       label:{ en:"Expert",        de:"Experte",    ro:"Expert"     } },
];

function loadProfile() {
  try { return JSON.parse(localStorage.getItem("dp_profile")||"null"); } catch { return null; }
}
function saveProfile(p) {
  try { localStorage.setItem("dp_profile", JSON.stringify(p)); } catch {}
}
function loadFavorites() {
  try { return JSON.parse(localStorage.getItem("dp_favorites")||"[]"); } catch { return []; }
}
function saveFavorites(favs) {
  try { localStorage.setItem("dp_favorites", JSON.stringify(favs)); } catch {}
}
function isFavorited(favs, category, pickName) {
  return favs.some(f => f.category === category && f.pick?.name === pickName);
}
function toggleFavorite(favs, category, pick, answers) {
  if (isFavorited(favs, category, pick?.name)) {
    return favs.filter(f => !(f.category === category && f.pick?.name === pick?.name));
  }
  return [...favs, { id: Date.now(), category, pick, answers, savedAt: new Date().toISOString() }];
}

// ── Profile Setup Modal ───────────────────────────────────────────────────────
function ProfileModal({ onClose, onSave, lang, existing }) {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState(existing?.status || "");
  const [nickname, setNickname] = useState(existing?.nickname || "");
  const [budget, setBudget] = useState(existing?.budget || "");
  const [techLevel, setTechLevel] = useState(existing?.techLevel || "");
  const [priorities, setPriorities] = useState(existing?.priorities || []);
  const lg = lang || "en";

  const PRIORITY_OPTS = [
    { id:"price",    label:{ en:"Best price",       de:"Bester Preis",  ro:"Cel mai bun preț" } },
    { id:"quality",  label:{ en:"Quality first",    de:"Qualität zuerst",ro:"Calitate înainte" } },
    { id:"privacy",  label:{ en:"Privacy & security",de:"Datenschutz",  ro:"Confidențialitate"} },
    { id:"ease",     label:{ en:"Easy to use",      de:"Einfach zu nutzen",ro:"Ușor de folosit"} },
    { id:"speed",    label:{ en:"Speed & performance",de:"Geschwindigkeit",ro:"Viteză"        } },
    { id:"support",  label:{ en:"Good support",     de:"Guter Support",  ro:"Suport bun"      } },
    { id:"eco",      label:{ en:"Eco / green",      de:"Umweltfreundlich",ro:"Ecologic"        } },
    { id:"local",    label:{ en:"Local / EU brands",de:"Europäische Marken",ro:"Mărci locale" } },
  ];

  const titles = {
    en: ["Choose your status","Your nickname","Your preferences","All set! 🎉"],
    de: ["Status wählen","Ihr Spitzname","Ihre Präferenzen","Fertig! 🎉"],
    ro: ["Alege statusul tău","Nickname-ul tău","Preferințele tale","Gata! 🎉"],
    es: ["Elige tu estado","Tu apodo","Tus preferencias","¡Listo! 🎉"],
  };

  const subtitle = {
    en: ["No email. No password. Just a nickname.",
         "This is how Ai·sel will greet you.",
         "These help Ai·sel pre-fill your answers.",
         "Your profile is saved locally only."],
    de: ["Keine E-Mail. Kein Passwort. Nur ein Spitzname.",
         "So begrüßt dich Ai·sel.",
         "Das hilft Ai·sel, deine Antworten vorauszufüllen.",
         "Dein Profil wird nur lokal gespeichert."],
    ro: ["Fără email. Fără parolă. Doar un nickname.",
         "Așa te va saluta Ai·sel.",
         "Ajută Ai·sel să precompleteze răspunsurile.",
         "Profilul tău este salvat doar local."],
    es: ["Sin email. Sin contraseña. Solo un apodo.",
         "Así es como Ai·sel te saludará.",
         "Ayudan a Ai·sel a pre-rellenar tus respuestas.",
         "Tu perfil se guarda solo localmente."],
  };

  const t = (key) => (titles[lg]||titles.en)[key];
  const s = (key) => ((subtitle[lg]||subtitle.en)[key]);

  function handleSave() {
    const profile = { status, nickname: nickname.trim(), budget, techLevel, priorities, createdAt: existing?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
    saveProfile(profile);
    onSave(profile);
    onClose();
  }

  const canNext = [
    step === 0 ? !!status : true,
    step === 1 ? nickname.trim().length >= 2 : true,
    true, true
  ][step];

  const statusObj = STATUSES.find(s => s.id === status);

  return (
    <div style={{ position:"fixed",inset:0,zIndex:1000,background:"rgba(15,23,42,0.7)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20 }} onClick={onClose}>
      <div style={{ background:"#fff",borderRadius:24,padding:"32px",maxWidth:480,width:"100%",boxShadow:"0 32px 80px rgba(15,23,42,0.25)",animation:"fadeUp 0.3s ease" }}
        onClick={e=>e.stopPropagation()}>

        {/* Progress dots */}
        <div style={{ display:"flex",gap:6,marginBottom:24,justifyContent:"center" }}>
          {[0,1,2,3].map(i=>(
            <div key={i} style={{ width:i===step?24:8,height:8,borderRadius:4,background:i<=step?C.accent:C.border,transition:"all 0.3s" }} />
          ))}
        </div>

        <h2 style={{ color:C.text,fontSize:22,fontWeight:900,margin:"0 0 6px",fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{t(step)}</h2>
        <p style={{ color:C.muted,fontSize:14,margin:"0 0 28px" }}>{s(step)}</p>

        {step === 0 && (
          <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8 }}>
            {STATUSES.map(st=>(
              <button key={st.id} onClick={()=>setStatus(st.id)}
                style={{ padding:"10px 6px",border:`2px solid ${status===st.id?C.accent:C.border}`,background:status===st.id?`${C.accent}10`:"#fff",borderRadius:12,cursor:"pointer",transition:"all 0.15s",textAlign:"center" }}>
                <div style={{ fontSize:22,marginBottom:4 }}>{st.emoji}</div>
                <div style={{ fontSize:11,fontWeight:700,color:status===st.id?C.accent:C.text }}>{st.label}</div>
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div>
            <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:20,padding:"12px 16px",background:`${C.accent}08`,borderRadius:14,border:`1px solid ${C.accent}20` }}>
              <span style={{ fontSize:28 }}>{statusObj?.emoji||"👤"}</span>
              <div>
                <div style={{ color:C.muted,fontSize:12 }}>{statusObj?.label||""}</div>
                <div style={{ color:C.text,fontSize:17,fontWeight:700 }}>{nickname||"..."}</div>
              </div>
            </div>
            <input
              value={nickname} onChange={e=>setNickname(e.target.value)}
              placeholder={lg==="de"?"Spitzname (z.B. Alex)":lg==="ro"?"Nickname (ex. Alex)":"Nickname (e.g. Alex)"}
              maxLength={20}
              style={{ width:"100%",padding:"14px 16px",borderRadius:12,border:`2px solid ${nickname.length>=2?C.accent:C.border}`,fontSize:16,fontWeight:600,outline:"none",boxSizing:"border-box",transition:"border-color 0.2s" }}
              autoFocus
            />
            <div style={{ color:C.muted,fontSize:11,marginTop:6 }}>2–20 {lg==="de"?"Zeichen":lg==="ro"?"caractere":lg==="es"?"caracteres":lg==="fr"?"caractères":"characters"}</div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ marginBottom:20 }}>
              <div style={{ color:C.text,fontSize:13,fontWeight:700,marginBottom:10 }}>
                {lg==="de"?"Monatliches Budget":lg==="ro"?"Buget lunar":"Monthly budget"}
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8 }}>
                {BUDGET_RANGES.map(b=>(
                  <button key={b.id} onClick={()=>setBudget(b.id)}
                    style={{ padding:"10px 12px",border:`2px solid ${budget===b.id?C.accent:C.border}`,background:budget===b.id?`${C.accent}10`:"#fff",borderRadius:10,cursor:"pointer",display:"flex",alignItems:"center",gap:8,transition:"all 0.15s" }}>
                    <span style={{ fontSize:18 }}>{b.icon}</span>
                    <span style={{ fontSize:13,fontWeight:600,color:budget===b.id?C.accent:C.text }}>{b.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom:20 }}>
              <div style={{ color:C.text,fontSize:13,fontWeight:700,marginBottom:10 }}>
                {lg==="de"?"Technisches Niveau":lg==="ro"?"Nivel tehnic":"Tech level"}
              </div>
              <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                {TECH_LEVELS.map(tl=>(
                  <button key={tl.id} onClick={()=>setTechLevel(tl.id)}
                    style={{ padding:"7px 14px",border:`2px solid ${techLevel===tl.id?C.accent:C.border}`,background:techLevel===tl.id?`${C.accent}10`:"#fff",borderRadius:20,cursor:"pointer",fontSize:12,fontWeight:700,color:techLevel===tl.id?C.accent:C.text,transition:"all 0.15s" }}>
                    {tl.label[lg]||tl.label.en}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ color:C.text,fontSize:13,fontWeight:700,marginBottom:10 }}>
                {lg==="de"?"Prioritäten (mehrere wählbar)":lg==="ro"?"Priorități (mai multe)":"Priorities (pick any)"}
              </div>
              <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                {PRIORITY_OPTS.map(p=>{
                  const sel = priorities.includes(p.id);
                  return (
                    <button key={p.id} onClick={()=>setPriorities(sel?priorities.filter(x=>x!==p.id):[...priorities,p.id])}
                      style={{ padding:"6px 12px",border:`2px solid ${sel?C.accent:C.border}`,background:sel?`${C.accent}10`:"#fff",borderRadius:20,cursor:"pointer",fontSize:12,fontWeight:700,color:sel?C.accent:C.text,transition:"all 0.15s" }}>
                      {p.label[lg]||p.label.en}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:64,marginBottom:16 }}>{statusObj?.emoji||"👤"}</div>
            <div style={{ fontSize:24,fontWeight:900,color:C.text,marginBottom:4,fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
              {statusObj?.label} {nickname}
            </div>
            <div style={{ color:C.muted,fontSize:14,marginBottom:16 }}>
              {lg==="de"?"Willkommen bei DecisionPilot!":lg==="ro"?"Bun venit la DecisionPilot!":"Welcome to DecisionPilot!"}
            </div>
            {budget && <div style={{ display:"inline-flex",alignItems:"center",gap:6,background:`${C.accent}10`,borderRadius:20,padding:"5px 14px",fontSize:13,color:C.accent,fontWeight:700,margin:"0 auto" }}>
              {BUDGET_RANGES.find(b=>b.id===budget)?.icon} {BUDGET_RANGES.find(b=>b.id===budget)?.label}
            </div>}
          </div>
        )}

        <div style={{ display:"flex",gap:10,marginTop:28 }}>
          {step > 0 && (
            <button onClick={()=>setStep(s=>s-1)}
              style={{ flex:1,padding:"13px",border:`1.5px solid ${C.border}`,background:"#fff",borderRadius:12,cursor:"pointer",fontSize:14,fontWeight:700,color:C.text }}>
              ← {lg==="de"?"Zurück":lg==="ro"?"Înapoi":"Back"}
            </button>
          )}
          {step < 3 ? (
            <button onClick={()=>setStep(s=>s+1)} disabled={!canNext}
              style={{ flex:2,padding:"13px",background:canNext?C.accent:`${C.accent}60`,color:"#fff",border:"none",borderRadius:12,cursor:canNext?"pointer":"not-allowed",fontSize:14,fontWeight:700,transition:"background 0.15s" }}>
              {lg==="de"?"Weiter →":lg==="ro"?"Continuă →":"Continue →"}
            </button>
          ) : (
            <button onClick={handleSave}
              style={{ flex:2,padding:"13px",background:C.success||"#059669",color:"#fff",border:"none",borderRadius:12,cursor:"pointer",fontSize:14,fontWeight:800 }}>
              {lg==="de"?"Profil speichern ✓":lg==="ro"?"Salvează profilul ✓":"Save profile ✓"}
            </button>
          )}
        </div>
        <button onClick={onClose} style={{ display:"block",margin:"12px auto 0",background:"none",border:"none",color:C.muted,fontSize:12,cursor:"pointer" }}>
          {lg==="de"?"Überspringen":lg==="ro"?"Sari peste":"Skip for now"}
        </button>
      </div>
    </div>
  );
}

// ── Favorites Screen ──────────────────────────────────────────────────────────
function FavoritesScreen({ favorites, onRemove, onHome, onStartCategory, lang }) {
  const lg = lang || "en";
  const title = { en:"My Favorites", de:"Meine Favoriten", ro:"Favoritele mele", es:"Mis favoritos", fr:"Mes favoris" };
  const empty = { en:"No saved favorites yet. Star ★ a recommendation to save it.", de:"Noch keine Favoriten. Klicke ★ um eine Empfehlung zu speichern.", ro:"Niciun favorit salvat încă. Apasă ★ pe o recomandare pentru a o salva.", es:"Aún no hay favoritos. Pulsa ★ en una recomendación para guardarla." };

  return (
    <div style={{ minHeight:"100vh",background:C.bg }}>
      <div style={{ position:"sticky",top:0,zIndex:50,background:"rgba(255,255,255,0.95)",backdropFilter:"blur(8px)",borderBottom:`1px solid ${C.border}`,padding:"10px 20px",display:"flex",alignItems:"center",gap:12 }}>
        <HomeButton onHome={onHome} lang={lg} />
        <div style={{ width:1,height:24,background:C.border }} />
        <span style={{ color:C.text,fontSize:16,fontWeight:800,display:"flex",alignItems:"center",gap:7 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> {title[lg]||title.en}</span>
        <span style={{ color:C.muted,fontSize:13,marginLeft:"auto" }}>{favorites.length} {lg==="ro"?"salvate":lg==="de"?"gespeichert":"saved"}</span>
      </div>

      <div style={{ maxWidth:900,margin:"0 auto",padding:"32px 20px" }}>
        {favorites.length === 0 ? (
          <div style={{ textAlign:"center",padding:"80px 24px" }}>
            <div style={{ marginBottom:16 }}><svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></div>
            <p style={{ color:C.muted,fontSize:16,lineHeight:1.7 }}>{empty[lg]||empty.en}</p>
            <button onClick={onHome} style={{ background:C.accent,color:"#fff",border:"none",borderRadius:12,padding:"12px 28px",fontSize:14,fontWeight:700,cursor:"pointer",marginTop:16 }}>
              {lg==="de"?"Jetzt vergleichen":lg==="ro"?"Compară acum":"Compare now"}
            </button>
          </div>
        ) : (
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16 }}>
            {favorites.map(fav => {
              const tree = TREES[fav.category];
              const catColor = CATEGORIES_LIST.find(c=>c.id===fav.category)?.color || C.accent;
              return (
                <div key={fav.id} style={{ background:C.card,borderRadius:16,overflow:"hidden",border:`1px solid ${C.border}`,boxShadow:C.shadow,transition:"transform 0.2s" }}
                  onMouseEnter={e=>e.currentTarget.style.transform="translateY(-3px)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                  {/* Mini image */}
                  <div style={{ height:60,backgroundImage:`url(${tree?.image})`,backgroundSize:"cover",backgroundPosition:"center",position:"relative" }}>
                    <div style={{ position:"absolute",inset:0,background:`${catColor}99` }} />
                    <div style={{ position:"absolute",top:8,left:10,display:"flex",alignItems:"center",color:"#fff" }}>{getIcon(fav.category, 20, "white")}</div>
                    <div style={{ position:"absolute",top:8,right:10,background:"rgba(255,255,255,0.2)",borderRadius:6,padding:"2px 8px",fontSize:11,color:"#fff",fontWeight:700 }}>
                      {catName(fav.category,lg)}
                    </div>
                  </div>
                  <div style={{ padding:"14px 16px" }}>
                    <div style={{ fontWeight:800,fontSize:15,color:C.text,marginBottom:4,fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{fav.pick?.name}</div>
                    <div style={{ color:C.muted,fontSize:12,marginBottom:10 }}>{fav.pick?.price}</div>
                    <div style={{ color:C.textSecondary,fontSize:12,lineHeight:1.5,marginBottom:12 }}>{fav.pick?.why?.slice(0,100)}...</div>
                    <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                      <a href={fav.pick?.link||getProductLink(fav.category,fav.pick?.name)} target="_blank" rel="noopener noreferrer"
                        style={{ flex:1,background:catColor,color:"#fff",textDecoration:"none",padding:"8px",borderRadius:8,fontSize:12,fontWeight:700,textAlign:"center" }}>
                        {uiT("viewDeal",lg)}
                      </a>
                      <button onClick={()=>onRemove(fav.id)}
                        style={{ padding:"8px",border:`1px solid ${C.border}`,background:"#fff",borderRadius:8,cursor:"pointer",fontSize:14,color:C.muted,transition:"all 0.15s" }}
                        title={lg==="de"?"Entfernen":lg==="ro"?"Șterge":"Remove"}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor="#ef4444";e.currentTarget.style.color="#ef4444";}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted;}}>
                        🗑
                      </button>
                    </div>
                    <div style={{ color:C.muted,fontSize:10,marginTop:8 }}>
                      {lg==="ro"?"Salvat la":lg==="de"?"Gespeichert am":"Saved"} {new Date(fav.savedAt).toLocaleDateString(lg)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


export default function App() {
  const [screen, setScreen] = useState("landing");
  const [category, setCategory] = useState(null);
  const [answers, setAnswers] = useState(null);
  const [lang, setLang] = useState("en");
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [profile, setProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => { setLang(detectLanguage()); }, []);

  // Prevent browser back button from leaving the site
  useEffect(() => {
    // Push a state so there's always something to go "back" to
    window.history.pushState({ dp: true }, "", window.location.href);
    const handlePop = () => {
      // Re-push to keep the entry in history
      window.history.pushState({ dp: true }, "", window.location.href);
      // Always return to landing
      setScreen("landing");
      setAnswers(null);
      setCategory(null);
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  // Load profile + favorites from localStorage on mount
  useEffect(() => {
    const p = loadProfile();
    if (p) setProfile(p);
    setFavorites(loadFavorites());
  }, []);

  useEffect(() => {
    function handleOpenChat() { setScreen("chat"); }
    window.addEventListener("openChat", handleOpenChat);
    return () => window.removeEventListener("openChat", handleOpenChat);
  }, []);

  const t = getTranslation(lang);

  function handleStart(mode, id = null) {
    if (mode === "tree" && id) {
      incrementDecisionCount();
      setCategory(id);
      setScreen("questions");
    }
    else if (mode === "chat") { setScreen("chat"); }
    else if (mode === "favorites") { setScreen("favorites"); }
    else if (mode === "profile") { setShowProfileModal(true); }
    else { setScreen("landing"); }
  }

  function handleToggleFavorite(cat, pick, ans) {
    const updated = toggleFavorite(favorites, cat, pick, ans);
    setFavorites(updated);
    saveFavorites(updated);
  }

  function handleRemoveFavorite(id) {
    const updated = favorites.filter(f => f.id !== id);
    setFavorites(updated);
    saveFavorites(updated);
  }

  if (screen === "questions" && category) {
    return (
      <>
        <QuestionScreen category={category} onComplete={(ans) => { setAnswers(ans); setScreen("results"); }} onBack={() => setScreen("landing")} onHome={() => setScreen("landing")} t={t} lang={lang} profile={profile} />
        <AselCorner screen="questions" />
      </>
    );
  }

  if (screen === "results" && category && answers) {
    return (
      <>
        <ResultsScreen category={category} answers={answers}
          onRestart={() => { setAnswers(null); setScreen("questions"); }}
          onBack={() => { setAnswers(null); setScreen("questions"); }}
          onHome={() => setScreen("landing")}
          onFavorite={handleToggleFavorite}
          favorites={favorites}
          profile={profile}
          t={t} lang={lang} />
        <AselCorner screen="results" />
      </>
    );
  }

  if (screen === "favorites") {
    return <FavoritesScreen favorites={favorites} onRemove={handleRemoveFavorite} onHome={()=>setScreen("landing")} onStartCategory={(id)=>{setCategory(id);setScreen("questions");}} lang={lang} />;
  }

  if (screen === "chat") return <ChatScreen onBack={() => setScreen("landing")} t={t} lang={lang} setLang={setLang} />;

  return (
    <>
      <Landing onStart={handleStart} t={t} lang={lang} setLang={setLang}
        profile={profile} favorites={favorites}
        onShowProfile={()=>setShowProfileModal(true)} />
      <AselCorner screen="landing" />
      {showProfileModal && (
        <ProfileModal lang={lang} existing={profile}
          onSave={p=>setProfile(p)}
          onClose={()=>setShowProfileModal(false)} />
      )}
      {showLimitModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: 20,
        }} onClick={() => setShowLimitModal(false)}>
          <div style={{
            background: "#fff", borderRadius: 20, padding: "36px 32px",
            maxWidth: 380, textAlign: "center", boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
            <h3 style={{ color: "#0F172A", fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
              All decisions are free
            </h3>
            <p style={{ color: "#475569", fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
              Enjoy unlimited AI decisions — no account needed, completely free.
            </p>
            <button onClick={() => setShowLimitModal(false)} style={{
              width: "100%", background: "linear-gradient(135deg, #1A56DB, #3B5BDB)",
              color: "#fff", border: "none", borderRadius: 12, padding: "13px",
              fontSize: 15, fontWeight: 800, cursor: "pointer",
            }}>
              Continue deciding →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
