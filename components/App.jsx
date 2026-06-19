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
          { name: "Sony Bravia 9", tag: "Best Processing", desc: "Sony's AI processor makes everything look cin
