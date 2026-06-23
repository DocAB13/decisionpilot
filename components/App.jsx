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
      { id: "os", q: "Which operating system do you prefer?", options: ["🍎 iOS (Apple)", "🤖 Android", "No preference — show me the best"] },
      { id: "priority", q: "What matters most to you?", options: ["📸 Camera quality", "🔋 Battery life", "⚡ Raw performance", "💎 Premium design & build", "🤖 AI & smart features", "💰 Best value"] },
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
    image: img("photo-1541643600914-78b084683702"),
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
};

const CATEGORIES_LIST = [
  // — Existing —
  { id: "vacation",    label: "Vacation",          emoji: "✈️",  desc: "Hotels & destinations worldwide",    color: "#0369A1", image: img("photo-1514282401047-d79a71a590e8") },
  { id: "car",         label: "Cars",              emoji: "🚗",  desc: "Electric, sport & family",           color: "#111827", image: img("photo-1617469767053-d3b523a0b982") },
  { id: "realestate",  label: "Real Estate",       emoji: "🏡",  desc: "Buy or rent your perfect home",     color: "#064E3B", image: img("photo-1613977257363-707ba9348227") },
  { id: "phone",       label: "Smartphone",        emoji: "📱",  desc: "Find your perfect device",          color: "#7C3AED", image: img("photo-1511707171634-5f897ff02aa9") },
  { id: "laptop",      label: "Laptop",            emoji: "💻",  desc: "Work, gaming & study",              color: "#0891B2", image: img("photo-1496181133206-80ce9b88a853") },
  { id: "tv",          label: "TV",                emoji: "📺",  desc: "Picture-perfect viewing",           color: "#059669", image: img("photo-1593784991095-a205069470b6") },
  { id: "fitness",     label: "Fitness",           emoji: "🏋️", desc: "Gym & wellness equipment",          color: "#D97706", image: img("photo-1517836357463-d25dfeac3438") },
  { id: "pet",         label: "Pet",               emoji: "🐕",  desc: "Find your ideal companion",         color: "#7C3AED", image: img("photo-1587300003388-59208cc962cb") },
  { id: "dining",      label: "Dining Out",        emoji: "🍽️", desc: "Restaurants & experiences",         color: "#DB2777", image: img("photo-1414235077428-338989a2e8c0") },
  { id: "career",      label: "Career",            emoji: "💼",  desc: "Jobs, skills & growth",             color: "#1A56DB", image: img("photo-1454165804606-c3d57bc86b40") },
  // — New —
  { id: "land",        label: "Land & Property",  emoji: "🌍",  desc: "Plots, terrain & land investment",  color: "#78350F", image: img("photo-1500382017468-9049fed747ef") },
  { id: "beauty",      label: "Beauty & Salons",  emoji: "💅",  desc: "Salons, spas & beauty services",    color: "#BE185D", image: img("photo-1560066984-138dadb4c035") },
  { id: "clinic",      label: "Clinics & Health",  emoji: "🏥", desc: "Doctors, clinics & treatments",     color: "#0F766E", image: img("photo-1666214280557-f1b5022eb634") },
  { id: "insurance",   label: "Insurance",         emoji: "🛡️", desc: "Health, car & life coverage",       color: "#1E40AF", image: img("photo-1450101499163-c8848c66ca85") },
  { id: "loans",       label: "Loans & Credit",   emoji: "💳",  desc: "Personal loans & credit cards",     color: "#065F46", image: img("photo-1565514020179-026b92b84bb6") },
  { id: "perfume",     label: "Perfumes",          emoji: "🌸",  desc: "Fragrances for every mood",         color: "#9D174D", image: img("photo-1541643600914-78b084683702") },
  { id: "cruise",      label: "Cruises",           emoji: "🚢",  desc: "Mediterranean, Caribbean & beyond", color: "#0C4A6E", image: img("photo-1544551763-46a013bb70d5") },
  { id: "furniture",   label: "Furniture",         emoji: "🛋️", desc: "Home decor & interior design",      color: "#44403C", image: img("photo-1555041469-a586c61ea9bc") },
  { id: "restaurant",  label: "Restaurants",       emoji: "🍴",  desc: "Find the best table in town",       color: "#991B1B", image: img("photo-1517248135467-4c7edcad34c4") },
  { id: "sports",      label: "Sports Activities", emoji: "🏄",  desc: "Surfing, climbing, skiing & more",  color: "#1D4ED8", image: img("photo-1530549387789-4c1017266635") },
  { id: "outdoor",     label: "Outdoor Adventures",emoji: "🧗",  desc: "Hiking, camping & expeditions",     color: "#166534", image: img("photo-1551632811-561732d1e306") },
];

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

function TopNav({ onBack, showBack, t, lang, setLang }) {
  const [langOpen, setLangOpen] = useState(false);
  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return (
    <div style={{
      background: "#fff", borderBottom: `1px solid ${C.border}`,
      padding: "0 32px", position: "sticky", top: 0, zIndex: 100,
      boxShadow: "0 1px 0 #E8ECF4",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: 12, height: 68 }}>
        {showBack && (
          <button onClick={onBack} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "transparent", border: `1px solid ${C.border}`,
            color: C.textSecondary, borderRadius: 10, padding: "7px 14px",
            cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.accent; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSecondary; }}>
            ← Back
          </button>
        )}

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `linear-gradient(135deg, ${C.accent}, #6B8EFF)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, boxShadow: `0 4px 12px ${C.accent}40`,
          }}>🧭</div>
          <span style={{ color: C.text, fontWeight: 800, fontSize: 19, letterSpacing: -0.5, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>DecisionPilot</span>
        </div>

        {/* Right side */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>

{/* Upgrade buttons */}
          <button onClick={() => handleUpgrade("pro")} style={{
            background: `linear-gradient(135deg, #D97706, #F59E0B)`,
            color: "#fff", border: "none", borderRadius: 10,
            padding: "8px 14px", fontSize: 13, fontWeight: 700,
            cursor: "pointer", boxShadow: "0 4px 12px rgba(217,119,6,0.4)",
            transition: "all 0.2s", whiteSpace: "nowrap",
          }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
            ✦ Pro · $4.99
          </button>
          <button onClick={() => handleUpgrade("premium")} style={{
            background: `linear-gradient(135deg, #7C3AED, #A78BFA)`,
            color: "#fff", border: "none", borderRadius: 10,
            padding: "8px 14px", fontSize: 13, fontWeight: 700,
            cursor: "pointer", boxShadow: "0 4px 12px rgba(124,58,237,0.4)",
            transition: "all 0.2s", whiteSpace: "nowrap",
          }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
            ★ Premium · $9.99
          </button>

          {/* Free badge */}
          <span style={{
            background: "#ECFDF5", color: "#059669",
            border: "1px solid #A7F3D0",
            borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600,
          }}>Free</span>

          {/* Language switcher */}
          <div style={{ position: "relative" }}>
            <button onClick={() => setLangOpen(!langOpen)} style={{
              display: "flex", alignItems: "center", gap: 6,
              background: C.bg, border: `1px solid ${C.border}`,
              borderRadius: 10, padding: "7px 12px", cursor: "pointer",
              fontSize: 13, fontWeight: 600, color: C.text, transition: "all 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.accent}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
              <span style={{ fontSize: 18 }}>{current.flag}</span>
              <span style={{ fontSize: 9, color: C.muted }}>{langOpen ? "▲" : "▼"}</span>
            </button>

            {langOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0,
                background: "#fff", border: `1px solid ${C.border}`,
                borderRadius: 16, boxShadow: C.shadowLg,
                width: 210, maxHeight: 360, overflowY: "auto",
                padding: "6px 0", zIndex: 200,
              }}>
                {LANGUAGES.map(l => (
                  <button key={l.code} onClick={() => { setLang(l.code); setLangOpen(false); }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 10,
                      padding: "9px 16px", border: "none", cursor: "pointer",
                      background: l.code === lang ? C.accentLight : "transparent",
                      color: l.code === lang ? C.accent : C.text,
                      fontSize: 14, fontWeight: l.code === lang ? 700 : 400,
                    }}
                    onMouseEnter={e => { if (l.code !== lang) e.currentTarget.style.background = C.bg; }}
                    onMouseLeave={e => { if (l.code !== lang) e.currentTarget.style.background = "transparent"; }}>
                    <span style={{ fontSize: 18 }}>{l.flag}</span>
                    <span>{l.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
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
        height: 180, backgroundImage: `url(${tree.image})`,
        backgroundSize: "cover", backgroundPosition: "center", position: "relative",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.65))" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
          <div style={{ display: "flex", gap: 4, padding: "0 32px 10px" }}>
            {tree.questions.map((_, i) => (
              <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? catColor : "rgba(255,255,255,0.25)", transition: "background 0.3s" }} />
            ))}
          </div>
          <div style={{ height: 3, background: "rgba(255,255,255,0.2)" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: catColor, transition: "width 0.4s ease" }} />
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 28, left: 32, display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={onBack} style={{
            background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.3)", color: "#fff",
            borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600,
          }}>← Back</button>
          <span style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, letterSpacing: 0.4 }}>
            Step {step + 1} of {total}
          </span>
          <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 500 }}>
            {tree.emoji} {tree.label}
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

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <div style={{ background: "#F0FDF4", border: "1.5px solid #86EFAC", borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ color: "#15803D", fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none"><circle cx="8" cy="8" r="7" stroke="#15803D" strokeWidth="1.5"/><path d="m5 8 2 2 4-4" stroke="#15803D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Pros
            </div>
            {pick.pros?.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 7 }}>
                <span style={{ width: 16, height: 16, minWidth: 16, borderRadius: "50%", background: "#DCFCE7", color: "#16A34A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, marginTop: 1 }}>✓</span>
                <span style={{ color: "#166534", fontSize: 13, lineHeight: 1.5 }}>{p}</span>
              </div>
            ))}
          </div>
          <div style={{ background: "#FFF5F5", border: "1.5px solid #FCA5A5", borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ color: "#B91C1C", fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none"><circle cx="8" cy="8" r="7" stroke="#B91C1C" strokeWidth="1.5"/><path d="m5.5 5.5 5 5M10.5 5.5l-5 5" stroke="#B91C1C" strokeWidth="1.8" strokeLinecap="round"/></svg>
              Cons
            </div>
            {pick.cons?.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 7 }}>
                <span style={{ width: 16, height: 16, minWidth: 16, borderRadius: "50%", background: "#FEE2E2", color: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, marginTop: 1 }}>✕</span>
                <span style={{ color: "#991B1B", fontSize: 13, lineHeight: 1.5 }}>{p}</span>
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
            style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 12, padding: "12px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
            🤖 Chat with AI instead
          </button>
        </div>
      </div>
    </div>
  );
}

function Landing({ onStart, t, lang, setLang }) {
  const [count, setCount] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  useEffect(() => {
    const target = 24891;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => setCount(c => Math.min(c + step, target)), 16);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <style>{`h1, h2, h3 { font-family: 'Plus Jakarta Sans', sans-serif; }`}</style>
      <TopNav showBack={false} t={t} lang={lang} setLang={setLang} />
      <HeroBanner onStart={onStart} t={t} lang={lang} />

      {/* Stats bar */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, padding: "18px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", justifyContent: "center", gap: 56, flexWrap: "wrap" }}>
          {[
            { value: `${count.toLocaleString()}+`, label: t?.decisions_made || "Decisions made" },
            { value: "9", label: t?.categories || "Categories" },
            { value: "30+", label: "Languages" },
            { value: "100%", label: t?.free || "Free" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ color: C.accent, fontSize: 24, fontWeight: 900, letterSpacing: -0.5, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</div>
              <div style={{ color: C.muted, fontSize: 12, marginTop: 3, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "72px 24px 0" }}>

        {/* How it works */}
        <div style={{ marginBottom: 80 }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ display: "inline-block", background: C.accentLight, color: C.accent, borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 16 }}>How it works</div>
            <h2 style={{ color: C.text, fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, letterSpacing: -1, margin: "0 0 12px" }}>{t?.how_title || "Decide smarter, faster"}</h2>
            <p style={{ color: C.textSecondary, fontSize: 17, maxWidth: 500, margin: "0 auto", lineHeight: 1.65 }}>{t?.how_desc || "Get your personalized answer in under 60 seconds"}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
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
                background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: "28px 24px",
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

        {/* Pricing */}
        <div id="pricing" style={{ marginBottom: 80 }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ display: "inline-block", background: C.accentLight, color: C.accent, borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 16 }}>Pricing</div>
            <h2 style={{ color: C.text, fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, letterSpacing: -1, margin: "0 0 12px" }}>Simple, transparent pricing</h2>
          </div>

          {/* Grid + Asel leaning */}
          <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, maxWidth: 960, margin: "0 auto" }}>
            {/* Free */}
            <div style={{ background: `${C.gold}14`, border: `1.5px solid ${C.gold}40`, borderRadius: 20, padding: "32px 28px", boxShadow: C.shadow }}>
              <div style={{ color: C.text, fontWeight: 800, fontSize: 20, marginBottom: 4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Free</div>
              <div style={{ color: C.accent, fontSize: 36, fontWeight: 900, letterSpacing: -1, marginBottom: 20, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>$0<span style={{ fontSize: 16, color: C.muted, fontWeight: 500 }}>/month</span></div>
              {["3 AI decisions per day", "All 9 categories", "AI Chat (5 messages/day)", "Global recommendations"].map((f, i) => (
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
            <div style={{ background: `linear-gradient(135deg, ${C.accent}, #3B5BDB)`, border: "none", borderRadius: 20, padding: "32px 28px", boxShadow: `0 16px 48px ${C.accent}33`, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 16, right: 16, background: C.gold, color: "#fff", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>POPULAR</div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 20, marginBottom: 4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Pro</div>
              <div style={{ color: "#fff", fontSize: 36, fontWeight: 900, letterSpacing: -1, marginBottom: 20, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>$4.99<span style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>/month</span></div>
              {["Unlimited AI decisions", "Unlimited AI Chat", "Priority processing", "Save decision history", "All 9 categories", "30+ languages"].map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ color: "#4ADE80" }}>✓</span>
                  <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 14 }}>{f}</span>
                </div>
              ))}
              <button onClick={() => handleUpgrade("pro")}
                style={{ width: "100%", marginTop: 20, background: "#fff", color: C.accent, border: "none", borderRadius: 12, padding: "13px", fontSize: 15, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.2)", transition: "all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                Upgrade to Pro →
              </button>
            </div>

            {/* Premium */}
            <div style={{ background: "linear-gradient(160deg, #1A1A1E, #0B0B0E)", border: "1px solid #2A2A2E", borderRadius: 20, padding: "32px 28px", boxShadow: "0 16px 48px rgba(0,0,0,0.35)", position: "relative", overflow: "hidden" }}>
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

          {/* Asel below pricing on white background - right aligned, no overlap */}
          <div style={{ display: "flex", justifyContent: "flex-end", paddingRight: "clamp(20px, 6vw, 80px)", marginTop: -20, lineHeight: 0, pointerEvents: "none" }}>
            <img
              src="/asel-mascot.png"
              alt="Asel"
              style={{
                width: "clamp(180px, 18vw, 260px)",
                height: "auto",
                display: "block",
                filter: "drop-shadow(0 4px 16px rgba(29,78,216,0.15))",
                animation: "aselLeanBob 3.5s ease-in-out infinite",
              }}
            />
          </div>
        </div>
        </div>

        {/* Categories */}
        <div id="categories" style={{ marginBottom: 80 }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ display: "inline-block", background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`, color: "#fff", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 16 }}>Categories</div>
            <h2 style={{ color: C.text, fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, letterSpacing: -1, margin: "0 0 12px" }}>{t?.what_title || "What are you deciding today?"}</h2>
            <p style={{ color: C.textSecondary, fontSize: 17, margin: "0 auto", lineHeight: 1.65 }}>{t?.what_desc || "Click any category to start — no signup required"}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 18 }}>
            {CATEGORIES_LIST.map(cat => (
              <CategoryCard key={cat.id} cat={cat} onClick={() => onStart("tree", cat.id)} />
            ))}
          </div>
        </div>

        {/* AI Chat CTA */}
        <div style={{ marginBottom: 80 }}>
          <div style={{
            background: `linear-gradient(135deg, ${C.accent} 0%, #3B5BDB 50%, #7048E8 100%)`,
            borderRadius: 24, padding: "52px 40px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 28, boxShadow: `0 20px 60px ${C.accent}30`,
          }}>
            <div>
              <h2 style={{ color: "#fff", fontSize: "clamp(22px, 3.5vw, 34px)", fontWeight: 900, letterSpacing: -0.8, margin: "0 0 10px" }}>
                Can't find your category?
              </h2>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 16, margin: 0, lineHeight: 1.6, maxWidth: 440 }}>
                Chat with our AI about any decision — from choosing a university to planning a wedding.
              </p>
            </div>
            <button onClick={() => onStart("chat")} style={{
              background: "#fff", color: C.accent, border: "none", borderRadius: 14,
              padding: "16px 32px", fontSize: 16, fontWeight: 800, cursor: "pointer",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)", transition: "all 0.2s", whiteSpace: "nowrap",
            }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
              🤖 {t?.btn_chat || "Chat with AI"} →
            </button>
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

      {/* Footer */}
      <div style={{ background: "#0F172A", padding: "56px 24px 160px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 32, marginBottom: 40 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${C.accent}, #6B8EFF)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🧭</div>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 16, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>DecisionPilot</span>
              </div>
              <p style={{ color: "#64748B", fontSize: 12.5, lineHeight: 1.6, maxWidth: 220 }}>
                {t?.footer || "Free forever · No signup · AI-powered · Global"}
              </p>
            </div>

            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 14, letterSpacing: 0.4 }}>Explore</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <a href="#" style={{ color: "#94A3B8", fontSize: 13, textDecoration: "none" }}>Home</a>
                <a href="/guides" style={{ color: "#94A3B8", fontSize: 13, textDecoration: "none" }}>Decision Guides</a>
                <a href="#categories" style={{ color: "#94A3B8", fontSize: 13, textDecoration: "none" }}>Categories</a>
                <a href="#pricing" style={{ color: "#94A3B8", fontSize: 13, textDecoration: "none" }}>Pricing</a>
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

          <div style={{ borderTop: "1px solid #1E293B", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <span style={{ color: "#475569", fontSize: 12 }}>© 2026 DecisionPilot. All rights reserved.</span>
            <span style={{ color: "#475569", fontSize: 12 }}>Made with care · 30+ languages</span>
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
