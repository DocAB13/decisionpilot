import { useState, useEffect, useRef } from "react";
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
  sv: { tech:"Teknik",appliances:"Hushållsapparater",auto:"Bilar",financial:"Ekonomi",telecom:"Telekommunikation",energy:"Energi",tourism:"Turism",software:"Programvara",home:"Hem & Trädgård",health:"Hälsa & Fitness",education:"Utbildning",ecommerce:"E-handel",phone:"Smartphones",laptop:"Laptops",tablet:"Surfplattor",smartwatch:"Smartwatches",headphones:"Hörlurar",tv:"TV-apparater",gaming:"Spelkonsoler",monitor:"Skärmar",printer:"Skrivare",fridge:"Kylskåp",washing_machine:"Tvättmaskiner",dryer:"Torktumlare",vacuum:"Dammsugare",espresso:"Kaffemaskiner",oven:"Ugnar & Spis",aircon:"Luftkonditionering",new_car:"Nya bilar",used_car:"Begagnade bilar",tires:"Däck",car_insurance:"Bilförsäkring",ev_charger:"EV-laddare",car_service:"Bilverkstad",personal_loan:"Personliga lån",mortgage:"Bolån",credit_card:"Kreditkort",bank_account:"Bankkonton",deposit:"Sparkonton",broker:"Investeringsmäklare",insurance:"Försäkringar",mobile_plan:"Mobilabonnemang",prepaid:"Kontantkort",internet:"Fast bredband",tv_package:"TV-paket",phone_provider:"Telefonoperatörer",electricity:"Elleverantörer",gas_provider:"Gasleverantörer",solar:"Solpaneler",battery_storage:"Batterilager",hotel:"Hotell",airline:"Flygbolag",travel_agency:"Resebyråer",travel_insurance:"Reseförsäkring",car_rental:"Biluthyrning",vpn:"VPN-tjänster",hosting:"Webbhotell",website_builder:"Webbplatsbyggare",crm:"CRM",email_marketing:"E-postmarknadsföring",ai_solutions:"AI-lösningar",antivirus:"Antivirusprogram",furniture:"Möbler",mattress:"Madrasser",power_tools:"Elverktyg",security_system:"Säkerhetssystem",robot_mower:"Robotgräsklippare",gym:"Gym",fitness_watch:"Fitnessklockor",supplements:"Kosttillskott",health_app:"Hälsoappar",online_courses:"Onlinekurser",university:"Universitet",private_school:"Privatskolor",language_courses:"Språkkurser",online_store:"Nätbutiker",delivery:"Leveranstjänster",dropshipping:"Dropshipping" },
  da: { tech:"Teknologi",appliances:"Husholdningsapparater",auto:"Biler",financial:"Økonomi",telecom:"Telekommunikation",energy:"Energi",tourism:"Turisme",software:"Software",home:"Hjem & Have",health:"Sundhed & Fitness",education:"Uddannelse",ecommerce:"E-handel",phone:"Smartphones",laptop:"Laptops",tablet:"Tablets",smartwatch:"Smartwatches",headphones:"Høretelefoner",tv:"Fjernsyn",gaming:"Spillekonsoller",monitor:"Skærme",printer:"Printere",fridge:"Køleskabe",washing_machine:"Vaskemaskiner",dryer:"Tørretumblere",vacuum:"Støvsugere",espresso:"Kaffemaskiner",oven:"Ovne & Komfurer",aircon:"Aircondition",new_car:"Nye biler",used_car:"Brugte biler",tires:"Dæk",car_insurance:"Bilforsikring",ev_charger:"EV-ladere",car_service:"Autoværksteder",personal_loan:"Personlige lån",mortgage:"Realkreditlån",credit_card:"Kreditkort",bank_account:"Bankkonti",deposit:"Opsparingskonto",broker:"Investeringsmæglere",insurance:"Forsikringer",mobile_plan:"Mobilabonnementer",prepaid:"Taletidskort",internet:"Fastnet internet",tv_package:"TV-pakker",phone_provider:"Telefonudbydere",electricity:"Eludbydere",gas_provider:"Gasudbydere",solar:"Solpaneler",battery_storage:"Batterilager",hotel:"Hoteller",airline:"Flyselskaber",travel_agency:"Rejsebureauer",travel_insurance:"Rejseforsikring",car_rental:"Biludlejning",vpn:"VPN",hosting:"Webhosting",website_builder:"Hjemmesidebyggere",crm:"CRM",email_marketing:"E-mailmarkedsføring",ai_solutions:"AI-løsninger",antivirus:"Antivirusprogrammer",furniture:"Møbler",mattress:"Madrasser",power_tools:"Elværktøj",security_system:"Sikkerhedssystemer",robot_mower:"Robotplæneklippere",gym:"Fitnesscentre",fitness_watch:"Fitnessure",supplements:"Kosttilskud",health_app:"Sundhedsapps",online_courses:"Onlinekurser",university:"Universiteter",private_school:"Privatskoler",language_courses:"Sprogkurser",online_store:"Netbutikker",delivery:"Leveringstjenester",dropshipping:"Dropshipping" },
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
  { id:"telecom",    label:"Telecomunicații",            emoji:"📡", color:"#7C3AED", subs:[
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

function TopNav({ onBack, showBack, t, lang, setLang, count, onStartSearch }) {
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

        {/* Right: Pro, Premium, Lang */}
        <div style={{ display:"flex",alignItems:"center",gap:6,flexShrink:0 }}>
          <button onClick={()=>handleUpgrade("pro")} style={{ background:"rgba(26,86,219,0.1)",color:C.accent,border:"1.5px solid rgba(26,86,219,0.35)",borderRadius:20,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer",transition:"all 0.2s",whiteSpace:"nowrap" }}
            onMouseEnter={e=>{e.currentTarget.style.background=C.accent;e.currentTarget.style.color="#fff";}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(26,86,219,0.1)";e.currentTarget.style.color=C.accent;}}>
            ✦ Pro
          </button>
          <button onClick={()=>handleUpgrade("premium")} style={{ background:"rgba(10,10,14,0.9)",color:"#D4AF37",border:"1.5px solid rgba(212,175,55,0.4)",borderRadius:20,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap" }}>
            ♛ Premium
          </button>

          {/* Language flag only */}
          <div style={{ position:"relative" }}>
            <button onClick={()=>setLangOpen(!langOpen)} style={{ display:"flex",alignItems:"center",gap:4,background:"transparent",border:`1px solid ${C.border}`,borderRadius:20,padding:"6px 10px",cursor:"pointer",fontSize:18,lineHeight:1 }}
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

      {/* ── CATEGORY PILLS ROW (CHECK24 style "Beliebteste Vergleiche") ── */}
      <div style={{ borderTop:`1px solid ${C.border}`,background:"#fff",overflowX:"auto",scrollbarWidth:"none" }}>
        <div style={{ display:"flex",gap:0,padding:"0 16px",maxWidth:1400,margin:"0 auto",minWidth:"max-content" }}>
          {CATEGORY_GROUPS.map(g=>(
            <button key={g.id}
              style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"8px 18px",border:"none",borderBottom:"2px solid transparent",background:"transparent",cursor:"pointer",transition:"all 0.15s",flexShrink:0,color:C.textSecondary }}
              onMouseEnter={e=>{e.currentTarget.style.borderBottomColor=g.color;e.currentTarget.style.color=g.color;e.currentTarget.style.background=`${g.color}08`;}}
              onMouseLeave={e=>{e.currentTarget.style.borderBottomColor="transparent";e.currentTarget.style.color=C.textSecondary;e.currentTarget.style.background="transparent";}}>
              <span style={{ fontSize:20 }}>{g.emoji}</span>
              <span style={{ fontSize:11,fontWeight:600,whiteSpace:"nowrap" }}>{catName(g.id,lang)}</span>
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

function QuestionScreen({ category, onComplete, onBack, t }) {
  const tree = TREES[category];
  const catColor = CATEGORIES_LIST.find(c => c.id === category)?.color || C.accent;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [animKey, setAnimKey] = useState(0);

  if (!tree) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
        <div style={{ fontSize: 48 }}>🔧</div>
        <h2 style={{ color: C.text, fontWeight: 800, margin: 0 }}>Category coming soon</h2>
        <p style={{ color: C.muted }}>We're building questions for <strong>{catName(category, "en")}</strong>. Check back soon!</p>
        <button onClick={onBack} style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 12, padding: "12px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>← Go back</button>
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
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <div style={{
        height: 260, backgroundImage: `url(${tree.image})`,
        backgroundSize: "cover", backgroundPosition: "center", position: "relative", overflow: "hidden",
      }}>
        {/* Light overlay - keeps image visible and catchy */}
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${catColor}CC 0%, rgba(0,0,0,0.45) 100%)` }} />

        {/* Category title prominent center */}
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingBottom: 40 }}>
          <div style={{ fontSize: 44, marginBottom: 8, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.4))" }}>{tree.emoji}</div>
          <div style={{ color: "#fff", fontSize: "clamp(22px, 4vw, 34px)", fontWeight: 900, letterSpacing: -0.5, textShadow: "0 2px 16px rgba(0,0,0,0.5)" }}>{tree.label}</div>
        </div>

        {/* Progress bars at bottom */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
          <div style={{ display: "flex", gap: 3, padding: "0 20px 8px" }}>
            {tree.questions.map((_, i) => (
              <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < step ? catColor : i === step ? "#fff" : "rgba(255,255,255,0.3)", transition: "background 0.3s", boxShadow: i === step ? `0 0 8px ${catColor}` : "none" }} />
            ))}
          </div>
        </div>

        {/* Top bar: Back + Step counter */}
        <div style={{ position: "absolute", top: 16, left: 16, right: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={onBack} style={{
            background: "rgba(255,255,255,0.18)", backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.35)", color: "#fff",
            borderRadius: 10, padding: "7px 14px", cursor: "pointer", fontSize: 13, fontWeight: 700,
          }}>← Back</button>
          <span style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: 10, padding: "7px 14px", fontSize: 12, fontWeight: 800, letterSpacing: 0.5 }}>
            {step + 1} / {total}
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 170px" }}>
        <div key={animKey} style={{ animation: "fadeUp 0.35s ease" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 36, flexWrap: "wrap" }}>
            <h2 style={{
              color: C.text, fontSize: "clamp(22px, 3.5vw, 32px)",
              fontWeight: 900, letterSpacing: -0.8, lineHeight: 1.25,
              margin: 0, textAlign: "center",
            }}>{question.q}</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {question.options.map((opt, i) => (
              <button key={opt} onClick={() => handleSelect(opt)}
                style={{
                  background: selected === opt ? catColor + "14" : C.card,
                  border: `1.5px solid ${selected === opt ? catColor : C.border}`,
                  borderRadius: 14, padding: "16px 22px", textAlign: "left",
                  cursor: "pointer", color: selected === opt ? catColor : C.text,
                  fontSize: 15, fontWeight: selected === opt ? 700 : 500,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  transition: "all 0.15s", boxShadow: selected === opt ? `0 4px 16px ${catColor}22` : C.shadow,
                  animation: `fadeUp 0.3s ease ${i * 0.04}s both`,
                }}
                onMouseEnter={e => { if (selected !== opt) { e.currentTarget.style.borderColor = catColor + "66"; e.currentTarget.style.transform = "translateX(4px)"; } }}
                onMouseLeave={e => { if (selected !== opt) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "translateX(0)"; } }}>
                <span>{opt}</span>
                {selected === opt
                  ? <span style={{ color: catColor, fontSize: 18 }}>✓</span>
                  : <span style={{ color: C.muted, fontSize: 18 }}>›</span>}
              </button>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 24 }}>
            <button onClick={() => handleSelect("No preference")}
              style={{ background: "none", border: "none", color: C.muted, fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>
              Skip this question
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

function LoadingScreen({ category }) {
  const tree = TREES[category];
  const [step, setStep] = useState(0);
  const catColor = CATEGORIES_LIST.find(c => c.id === category)?.color || "#1A56DB";
  const steps = [
    `Analyzing your ${tree?.label?.toLowerCase()} preferences...`,
    "Searching trusted review sources...",
    "Comparing top options worldwide...",
    "Calculating best matches for you...",
    "Almost ready — finalizing recommendations...",
  ];

  useEffect(() => {
    const timer = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 1200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32,
    }}>
      <div style={{ textAlign: "center", maxWidth: 520, width: "100%" }}>
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
          <div style={{ color: catColor, fontWeight: 800, fontSize: 13, letterSpacing: 1.2, textTransform: "uppercase" }}>
            {tree?.label} · AI Analysis
          </div>
        </div>

        <h2 style={{ color: C.text, fontSize: 26, fontWeight: 900, marginBottom: 8, letterSpacing: -0.5 }}>
          Finding your perfect {tree?.label?.toLowerCase()}...
        </h2>
        <p style={{ color: C.textSecondary, fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
          Asel is analyzing reviews from CNET, TechRadar, Wirecutter, and more.
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

function RecommendationCard({ pick, index }) {
  const [hovered, setHovered] = useState(false);
  const isTop = index === 0;
  const c = isTop ? C.gold : C.accent;

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: C.card, borderRadius: 20,
        border: `1.5px solid ${hovered ? c + "55" : C.border}`,
        boxShadow: hovered ? `0 16px 48px ${c}18` : C.shadow,
        overflow: "hidden", transition: "all 0.25s cubic-bezier(.4,0,.2,1)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        marginBottom: 20, animation: `fadeUp 0.4s ease ${index * 0.1}s both`,
      }}>
      <div style={{
        background: `linear-gradient(135deg, ${c}12, ${c}05)`,
        borderBottom: `1px solid ${c}22`, padding: "20px 24px",
        display: "flex", alignItems: "center", gap: 14,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `linear-gradient(135deg, ${c}, ${c}CC)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 18, fontWeight: 900, flexShrink: 0,
        }}>{index + 1}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ color: C.text, fontWeight: 800, fontSize: 18, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{pick.name}</span>
            {isTop && <Badge color={C.gold}>Top pick</Badge>}
            {pick.badge && <Badge color={c}>{pick.badge}</Badge>}
          </div>
          <div style={{ color: C.muted, fontSize: 13, fontWeight: 500 }}>{pick.price}</div>
        </div>
      </div>

      <div style={{ padding: "20px 24px" }}>
        <div style={{
          background: C.accentLight, borderRadius: 10, padding: "12px 16px",
          marginBottom: 16, borderLeft: `3px solid ${C.accent}`,
        }}>
          <span style={{ color: C.accent, fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Why this for you · </span>
          <span style={{ color: C.textSecondary, fontSize: 14, lineHeight: 1.6 }}>{pick.why}</span>
        </div>

        <div className="pros-cons-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
          <div style={{ background: "#DCFCE7", border: "2px solid #4ADE80", borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ color: "#15803D", fontWeight: 900, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <svg viewBox="0 0 16 16" width="15" height="15" fill="none"><circle cx="8" cy="8" r="7" fill="#15803D"/><path d="m5 8 2 2 4-4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Pros
            </div>
            {pick.pros?.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                <span style={{ color: "#15803D", fontSize: 14, fontWeight: 900, marginTop: 0, flexShrink: 0 }}>+</span>
                <span style={{ color: "#14532D", fontSize: 13.5, lineHeight: 1.55, fontWeight: 700 }}>{p}</span>
              </div>
            ))}
          </div>
          <div style={{ background: "#FEE2E2", border: "2px solid #F87171", borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ color: "#B91C1C", fontWeight: 900, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <svg viewBox="0 0 16 16" width="15" height="15" fill="none"><circle cx="8" cy="8" r="7" fill="#B91C1C"/><path d="m5.5 5.5 5 5M10.5 5.5l-5 5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/></svg>
              Cons
            </div>
            {pick.cons?.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                <span style={{ color: "#DC2626", fontSize: 14, fontWeight: 900, marginTop: 0, flexShrink: 0 }}>−</span>
                <span style={{ color: "#7F1D1D", fontSize: 13.5, lineHeight: 1.55, fontWeight: 700 }}>{p}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <span style={{ color: C.muted, fontSize: 12 }}>Source: {pick.source}</span>
          <a href={pick.link} target="_blank" rel="noopener noreferrer"
            style={{
              background: c, color: "#fff", textDecoration: "none",
              padding: "9px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700,
              display: "inline-flex", alignItems: "center", gap: 6, transition: "opacity 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            View deal →
          </a>
        </div>
      </div>
    </div>
  );
}

function ResultsScreen({ category, answers, onRestart, onBack, t }) {
  const tree = TREES[category];
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRecs() {
      try {
        const response = await fetch("/api/chat", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "tree_result", category, answers }),
        });
        const result = await response.json();
        if (result.type === "recommendations") setData(result.data);
        else setError("Could not load recommendations. Please try again.");
      } catch { setError("Connection error. Please try again."); }
      finally { setLoading(false); }
    }
    fetchRecs();
  }, []);

  if (loading) return <LoadingScreen category={category} />;

  if (error) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 48 }}>😕</div>
      <p style={{ color: C.text, fontSize: 18, fontWeight: 600 }}>{error}</p>
      <button onClick={onRestart} style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 12, padding: "12px 24px", cursor: "pointer", fontSize: 15, fontWeight: 700 }}>Try Again</button>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <div style={{
        height: 200, backgroundImage: `url(${tree.image})`,
        backgroundSize: "cover", backgroundPosition: "center", position: "relative",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.7))" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, maxWidth: 800, margin: "0 auto", padding: "0 24px 28px" }}>
          <button onClick={onBack} style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, marginBottom: 12 }}>← Back</button>
          <h1 style={{ color: "#fff", fontSize: "clamp(20px, 3.5vw, 28px)", fontWeight: 900, margin: 0, letterSpacing: -0.5, textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>{data?.title}</h1>
          {data?.subtitle && <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, margin: "6px 0 0", lineHeight: 1.5 }}>{data.subtitle}</p>}
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px 170px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
          <span style={{ color: C.muted, fontSize: 13 }}>Powered by AI · Sources: CNET, TechRadar, Wirecutter & more</span>
          <button onClick={onRestart} style={{ background: C.accentLight, color: C.accent, border: `1px solid ${C.accent}33`, borderRadius: 10, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
            🔄 Start over
          </button>
        </div>

        {data?.picks?.map((pick, i) => <RecommendationCard key={i} pick={pick} index={i} />)}

        <div style={{ marginTop: 40, background: C.card, borderRadius: 16, padding: "24px", boxShadow: C.shadow, textAlign: "center" }}>
          <p style={{ color: C.textSecondary, fontSize: 15, marginBottom: 16 }}>Want more personalized advice? Chat with our AI directly.</p>
          <button onClick={() => window.dispatchEvent(new CustomEvent("openChat"))}
            style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 12, padding: "12px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 10 }}>
            <img src="/asel-mascot.png" style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover", objectPosition: "30% 8%", border: "2px solid rgba(255,255,255,0.6)" }} alt="Asel" />
            Chat with Asel
          </button>
        </div>
      </div>
    </div>
  );
}

function Landing({ onStart, t, lang, setLang }) {
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
      <TopNav showBack={false} t={t} lang={lang} setLang={setLang} count={count} />
      <HeroBanner onStart={onStart} t={t} lang={lang} />

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
                    <span style={{ fontSize: 16 }}>{sub.emoji}</span>
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
              While others have been comparing since 1999, we're redefining what comparison means in the AI era — personalized intelligence, zero bias, always evolving.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[
                { icon: "🧠", text: "AI learns your priorities" },
                { icon: "⚡", text: "Answer in under 60 seconds" },
                { icon: "🌍", text: "30 languages supported" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 600, color: C.text }}>
                  <span>{item.icon}</span>{item.text}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, flexShrink: 0 }}>
            {[
              { num: "66+", label: lang === "de" ? "Kategorien" : lang === "ro" ? "Subcategorii" : "Categories", color: C.accent },
              { num: "30+", label: lang === "de" ? "Sprachen" : lang === "ro" ? "Limbi" : "Languages", color: "#7048E8" },
              { num: "AI", label: lang === "de" ? "Powered" : "Powered", color: "#059669" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center", padding: "20px 24px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, minWidth: 80 }}>
                <div style={{ color: s.color, fontSize: 28, fontWeight: 900, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: -1 }}>{s.num}</div>
                <div style={{ color: C.muted, fontSize: 11, marginTop: 4, fontWeight: 600 }}>{s.label}</div>
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14, marginBottom: 32 }}>
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

      {/* ⑤ POPULAR PRODUCT COMPARISONS — concrete cards like CHECK24 */}
      {[
        { section: lang === "de" ? "Handys vergleichen" : lang === "ro" ? "Compară telefoane" : "Compare Smartphones", gid: "tech", items: [
          { id: "phone", label: "Apple iPhone 17", sub: "ab 1,00€ / Handyeinmalig", img: "photo-1510557880182-3d4d3cba35a5", rating: "4.8", reviews: "12.431" },
          { id: "phone", label: "Samsung Galaxy S26", sub: "ab 1,00€ / Handyeinmalig", img: "photo-1610945415295-d9bbf067e59c", rating: "4.7", reviews: "8.922" },
          { id: "phone", label: "Google Pixel 10", sub: "ab 1,00€ / Handyeinmalig", img: "photo-1598300042247-d088f8ab3a91", rating: "4.6", reviews: "4.211" },
        ]},
        { section: lang === "de" ? "Kredite vergleichen" : lang === "ro" ? "Compară credite" : "Compare Loans", gid: "financial", items: [
          { id: "personal_loan", label: "10.000 €", sub: "ab 314,18€ / Monat · 36 Monate", img: null, badge: "€", rating: null },
          { id: "personal_loan", label: "20.000 €", sub: "ab 489,92€ / Monat · 48 Monate", img: null, badge: "€€", rating: null },
          { id: "personal_loan", label: "50.000 €", sub: "ab 783,72€ / Monat · 84 Monate", img: null, badge: "€€€", rating: null },
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
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

        {/* How it works */}
        <div style={{ marginBottom: 0 }}>
          {/* Full-width section banner */}
          <div style={{ background: `linear-gradient(135deg, ${C.accent} 0%, #7048E8 100%)`, padding: "40px 24px", textAlign: "center", margin: "0 -24px 48px" }}>
            <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 20, padding: "4px 14px", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Guide</div>
            <h2 style={{ color: "#fff", fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 900, letterSpacing: -1, margin: "0 0 10px" }}>How it works</h2>
            <p style={{ color: "rgba(255,255,255,0.82)", fontSize: 17, margin: 0 }}>Get your answer in under 60 seconds</p>
          </div>
          <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {[
              {
                num: "Step 1", title: t?.step1_title || "Choose a category", desc: t?.step1_desc || "Pick from 21 decision categories", grad: [C.accent, C.purple],
                icon: <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
              },
              {
                num: "Step 2", title: t?.step2_title || "Answer a few questions", desc: t?.step2_desc || "Our AI learns exactly what you need", grad: [C.purple, C.gold],
                icon: <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="13" x2="12" y2="13"/></svg>
              },
              {
                num: "Step 3", title: "AI analyzes options", desc: "Searches CNET, Wirecutter, Booking & more in real-time", grad: [C.gold, C.success],
                icon: <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/><path d="M8 11h6"/><path d="M11 8v6"/></svg>
              },
              {
                num: "Step 4", title: t?.step3_title || "Get your top matches", desc: t?.step3_desc || "Personalized picks with pros, cons & direct links", grad: [C.success, C.accent],
                icon: <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="m9 12 2 2 4-4"/></svg>
              },
            ].map((s, i) => (
              <div key={i} style={{
                background: "rgba(26,86,219,0.07)", border: `1px solid rgba(26,86,219,0.18)`, borderRadius: 18, padding: "28px 24px",
                boxShadow: C.shadow, transition: "all 0.2s ease",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = C.shadowMd; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = C.shadow; }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: `linear-gradient(135deg, ${s.grad[0]}, ${s.grad[1]})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", boxShadow: `0 4px 14px ${s.grad[0]}40`,
                  }}>{s.icon}</div>
                  <span style={{ color: s.grad[0], fontWeight: 800, fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase" }}>{s.num}</span>
                </div>
                <div style={{ color: C.text, fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{s.title}</div>
                <div style={{ color: C.muted, fontSize: 13, lineHeight: 1.6 }}>{s.desc}</div>
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
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `${group.color}16`, border: `1.5px solid ${group.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{group.emoji}</div>
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
                      <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{sub.emoji}</span>
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
              Chat with Asel about any decision — from choosing a university to planning a wedding.
            </p>
            <button onClick={() => onStart("chat")} style={{
              background: "#fff", color: C.accent, border: "none", borderRadius: 14,
              padding: "14px 32px", fontSize: 16, fontWeight: 800, cursor: "pointer",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)", transition: "all 0.2s",
              display: "inline-flex", alignItems: "center", gap: 10,
            }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
              <img src="/asel-mascot.png" style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover", objectPosition: "30% 8%" }} alt="Asel" />
              Chat with Asel →
            </button>
          </div>
        </div>

        {/* Pricing - after CTA */}
        <div id="pricing" style={{ marginBottom: 80 }}>
          {/* Full-width pricing banner - clickable */}
          <div
            onClick={() => setShowPricing(p => !p)}
            style={{
              background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
              padding: "40px 24px", textAlign: "center", margin: "0 -24px 0",
              cursor: "pointer", position: "relative",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.92"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            <div style={{ display: "inline-block", background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)", borderRadius: 20, padding: "4px 14px", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Plans</div>
            <h2 style={{ color: "#fff", fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 900, letterSpacing: -1, margin: "0 0 10px" }}>Simple, transparent pricing</h2>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 17, margin: "0 0 20px" }}>Start free. Upgrade when you need more.</p>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: 12, padding: "10px 20px", color: "#fff", fontSize: 14, fontWeight: 700,
              transition: "background 0.2s",
            }}>
              {showPricing ? "▲ Hide plans" : "▼ See all plans"}
            </div>
          </div>

          {/* Pricing grid — visible only when banner clicked */}
          <div style={{
            maxHeight: showPricing ? "1000px" : "0",
            overflow: "hidden",
            transition: "max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          }}>
            <div style={{ padding: "48px 0 0" }}>
              <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto" }}>
                <div className="pricing-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, maxWidth: 960, margin: "0 auto" }}>
            {/* Free */}
            <div style={{ background: "rgba(212,175,55,0.12)", border: "1.5px solid rgba(212,175,55,0.45)", borderRadius: 20, padding: "32px 28px", boxShadow: C.shadow, transition: "transform 0.25s ease, box-shadow 0.25s ease" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.035)"; e.currentTarget.style.boxShadow = "0 20px 48px rgba(212,175,55,0.22)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = C.shadow; }}>
              <div style={{ color: C.text, fontWeight: 800, fontSize: 20, marginBottom: 4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Free</div>
              <div style={{ color: C.accent, fontSize: 36, fontWeight: 900, letterSpacing: -1, marginBottom: 20, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>$0<span style={{ fontSize: 16, color: C.muted, fontWeight: 500 }}>/month</span></div>
              {["3 AI decisions per day", "All categories", "AI Chat (5 messages/day)", "Global recommendations"].map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ color: C.success }}>✓</span>
                  <span style={{ color: C.textSecondary, fontSize: 14 }}>{f}</span>
                </div>
              ))}
              <button style={{ width: "100%", marginTop: 20, background: C.bg, color: C.text, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "default" }}>
                Current plan
              </button>
            </div>

            {/* Pro */}
            <div style={{ background: "rgba(26,86,219,0.14)", border: "1.5px solid rgba(26,86,219,0.45)", borderRadius: 20, padding: "32px 28px", boxShadow: C.shadow, position: "relative", overflow: "hidden", transition: "transform 0.25s ease, box-shadow 0.25s ease" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.035)"; e.currentTarget.style.boxShadow = "0 20px 48px rgba(26,86,219,0.22)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = C.shadow; }}>
              <div style={{ position: "absolute", top: 16, right: 16, background: C.accent, color: "#fff", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>POPULAR</div>
              <div style={{ color: C.text, fontWeight: 800, fontSize: 20, marginBottom: 4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Pro</div>
              <div style={{ color: C.accent, fontSize: 36, fontWeight: 900, letterSpacing: -1, marginBottom: 20, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>$4.99<span style={{ fontSize: 16, color: C.muted, fontWeight: 500 }}>/month</span></div>
              {["Unlimited AI decisions", "Unlimited AI Chat", "Priority processing", "Save decision history", "All categories", "30+ languages"].map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ color: C.accent }}>✓</span>
                  <span style={{ color: C.textSecondary, fontSize: 14 }}>{f}</span>
                </div>
              ))}
              <button onClick={() => handleUpgrade("pro")}
                style={{ width: "100%", marginTop: 20, background: C.accent, color: "#fff", border: "none", borderRadius: 12, padding: "13px", fontSize: 15, fontWeight: 800, cursor: "pointer", boxShadow: `0 4px 16px ${C.accent}40`, transition: "all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                Upgrade to Pro →
              </button>
            </div>

            {/* Premium */}
            <div style={{ background: "rgba(10,10,14,0.88)", border: "1px solid rgba(212,175,55,0.35)", borderRadius: 20, padding: "32px 28px", boxShadow: "0 16px 48px rgba(0,0,0,0.35)", position: "relative", overflow: "hidden", transition: "transform 0.25s ease, box-shadow 0.25s ease" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.035)"; e.currentTarget.style.boxShadow = "0 24px 56px rgba(0,0,0,0.55)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.35)"; }}>
              <div style={{ position: "absolute", top: 16, right: 16, display: "flex", alignItems: "center", gap: 5, background: "#1E1A0E", color: "#D4AF37", border: "1px solid #3A2F12", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
                ♛ PREMIUM
              </div>
              <div style={{ color: "#F4E7C1", fontWeight: 800, fontSize: 20, marginBottom: 4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Premium</div>
              <div style={{ color: "#F4E7C1", fontSize: 36, fontWeight: 900, letterSpacing: -1, marginBottom: 20, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>$9.99<span style={{ fontSize: 16, color: "#8A7B52", fontWeight: 500 }}>/month</span></div>
              {["Everything in Pro", "PDF export of decisions", "Priority support", "Early access to new categories"].map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ color: "#D4AF37" }}>✓</span>
                  <span style={{ color: "#C9CEE0", fontSize: 14 }}>{f}</span>
                </div>
              ))}
              <button onClick={() => handleUpgrade("premium")}
                style={{ width: "100%", marginTop: 20, background: "linear-gradient(135deg, #D4AF37, #F4E7C1)", color: "#1A1A1E", border: "none", borderRadius: 12, padding: "13px", fontSize: 15, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 16px rgba(212,175,55,0.35)", transition: "all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                Upgrade to Premium →
              </button>
            </div>
          </div>
        </div>
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
              { name: "Thomas B.", tag: "Car", grad: [C.purple, C.accent], stars: 5, quote: "I was stuck choosing between two cars for weeks. Asel sorted it out in one chat." },
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
              { q: "Is DecisionPilot really free?", a: "Yes — our Free plan lets you make decisions every day with no signup required. Pro and Premium add extra features like saved history and PDF exports." },
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
                  <a key={g.id} href="#categories" style={{ color: "#94A3B8", fontSize: 13, textDecoration: "none" }}
                    onMouseEnter={e=>e.currentTarget.style.color="#fff"}
                    onMouseLeave={e=>e.currentTarget.style.color="#94A3B8"}>
                    {g.emoji} {catName(g.id, "en")}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 14, letterSpacing: 0.4 }}>More</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {CATEGORY_GROUPS.slice(5,10).map(g => (
                  <a key={g.id} href="#categories" style={{ color: "#94A3B8", fontSize: 13, textDecoration: "none" }}
                    onMouseEnter={e=>e.currentTarget.style.color="#fff"}
                    onMouseLeave={e=>e.currentTarget.style.color="#94A3B8"}>
                    {g.emoji} {catName(g.id, "en")}
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
    content: "Hi, I'm Asel! 👋 Tell me about any decision you're facing — vacation, car, home, phone, career, beauty, insurance, or anything else. I'll ask a few smart questions and give you a personalized recommendation.",
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
                <img src="/asel-mascot.png" alt="Asel" style={{ width: 38, height: 38, objectFit: "cover", objectPosition: "top center" }} />
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
              <img src="/asel-mascot.png" alt="Asel" style={{ width: 38, height: 38, objectFit: "cover", objectPosition: "top center", animation: "aselLoadPulse 1.2s ease-in-out infinite" }} />
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

const FREE_DAILY_LIMIT = 3;

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

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [category, setCategory] = useState(null);
  const [answers, setAnswers] = useState(null);
  const [lang, setLang] = useState("en");
  const [showLimitModal, setShowLimitModal] = useState(false);

  useEffect(() => { setLang(detectLanguage()); }, []);

  useEffect(() => {
    function handleOpenChat() { setScreen("chat"); }
    window.addEventListener("openChat", handleOpenChat);
    return () => window.removeEventListener("openChat", handleOpenChat);
  }, []);

  const t = getTranslation(lang);

  function handleStart(mode, id = null) {
    if (mode === "tree" && id) {
      if (getDecisionCount() >= FREE_DAILY_LIMIT) {
        setShowLimitModal(true);
        return;
      }
      incrementDecisionCount();
      setCategory(id);
      setScreen("questions");
    }
    else if (mode === "chat") { setScreen("chat"); }
    else { setScreen("landing"); }
  }

  if (screen === "questions" && category) {
    return (
      <>
        <QuestionScreen category={category} onComplete={(ans) => { setAnswers(ans); setScreen("results"); }} onBack={() => setScreen("landing")} t={t} />
        <AselCorner screen="questions" />
      </>
    );
  }

  if (screen === "results" && category && answers) {
    return (
      <>
        <ResultsScreen category={category} answers={answers} onRestart={() => { setAnswers(null); setScreen("questions"); }} onBack={() => { setAnswers(null); setScreen("questions"); }} t={t} />
        <AselCorner screen="results" />
      </>
    );
  }

  if (screen === "chat") return <ChatScreen onBack={() => setScreen("landing")} t={t} lang={lang} setLang={setLang} />;

  return (
    <>
      <Landing onStart={handleStart} t={t} lang={lang} setLang={setLang} />
      <AselCorner screen="landing" />
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
              Daily limit reached
            </h3>
            <p style={{ color: "#475569", fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
              You've used your {FREE_DAILY_LIMIT} free decisions for today. Upgrade for unlimited access, or come back tomorrow.
            </p>
            <button onClick={() => handleUpgrade("pro")} style={{
              width: "100%", background: "linear-gradient(135deg, #1A56DB, #3B5BDB)",
              color: "#fff", border: "none", borderRadius: 12, padding: "13px",
              fontSize: 15, fontWeight: 800, cursor: "pointer", marginBottom: 10,
            }}>
              ✦ Upgrade to Pro · $4.99/mo
            </button>
            <button onClick={() => setShowLimitModal(false)} style={{
              width: "100%", background: "transparent", color: "#94A3B8",
              border: "none", padding: "8px", fontSize: 13, cursor: "pointer",
            }}>
              Maybe later
            </button>
          </div>
        </div>
      )}
    </>
  );
}
