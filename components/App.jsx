import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "../context/AuthContext";
import { useSubscription } from "../hooks/useSubscription";
import { LANGUAGES, getTranslation, detectLanguage } from "./translations";
import { HeroBanner } from "./HeroBanner";
import AselCorner from "./AselCorner";
import { PricingSection } from "../features/marketing/PricingSection";

export const C = {
  bg: "#F8F9FC", surface: "#FFFFFF", card: "#FFFFFF", border: "#E8ECF4",
  accent: "#1A56DB", accentDark: "#1240A8", accentLight: "#EEF3FF",
  text: "#0F172A", textSecondary: "#475569", muted: "#94A3B8",
  success: "#059669", gold: "#D97706", purple: "#7C3AED",
  shadow: "0 1px 4px rgba(15,23,42,0.08)", shadowMd: "0 4px 16px rgba(15,23,42,0.10)",
  shadowLg: "0 12px 40px rgba(15,23,42,0.13)",
};

function img(id, w = 800, h = 500) {
  return `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;
}
function bkg(ss) { return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(ss)}&aid=decisionpilot`; }
function amz(k) { return `/go?url=${encodeURIComponent(`https://www.amazon.com/s?k=${encodeURIComponent(k)}`)}` }


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

export function catName(id, lang) {
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

export const STATUSES = [
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
export const CATEGORIES_LIST = CATEGORY_GROUPS.flatMap(g => g.subs.map(s => ({...s, groupId: g.id, groupLabel: g.label, color: g.color, desc: g.label})));


async function handleUpgrade(plan = "pro", userId = "") {
  try {
    const response = await fetch("/api/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, user_id: userId }),
    });
    const data = await response.json();
    if (data.url) window.location.href = data.url;
    else alert("Something went wrong. Please try again.");
  } catch {
    alert("Connection error. Please try again.");
  }
}
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

// DecisionOS's real 9 decision categories (core/decision/Decision.constants.ts DecisionCategory),
// replacing the legacy 66+ product-category tree on the landing page.
const DECISIONOS_CATEGORIES = [
  { id: "financial", label: "Financial", desc: "Budgeting, investing, major purchases", color: "#1A56DB", icon: CAT_SVG_ICONS.financial },
  { id: "technology", label: "Technology", desc: "Devices, software, tech decisions", color: "#7C3AED", icon: CAT_SVG_ICONS.tech },
  { id: "health", label: "Health", desc: "Medical, wellness, fitness", color: "#DC2626", icon: CAT_SVG_ICONS.health },
  { id: "travel", label: "Travel", desc: "Trips, relocation, travel planning", color: "#0369A1", icon: CAT_SVG_ICONS.tourism },
  { id: "career", label: "Career", desc: "Job offers, career moves", color: "#059669",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> },
  { id: "insurance", label: "Insurance", desc: "Coverage and policy decisions", color: "#7048E8",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 4 5v6c0 5 3.4 9 8 11 4.6-2 8-6 8-11V5z"/></svg> },
  { id: "home", label: "Home", desc: "Buying, renting, renovating", color: "#B45309", icon: CAT_SVG_ICONS.home },
  { id: "education", label: "Education", desc: "Courses, degrees, certifications", color: "#0891B2", icon: CAT_SVG_ICONS.education },
  { id: "lifestyle", label: "Lifestyle", desc: "Everyday and personal decisions", color: "#DB2777",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15 9 22 9.5 17 14.5 18.5 21.5 12 18 5.5 21.5 7 14.5 2 9.5 9 9 12 2"/></svg> },
];

function TopNav({ onBack, showBack, t, lang, setLang, count, onStartSearch, onCategoryClick, profile, onShowProfile, favoritesCount, onShowFavorites }) {
const { user, signOut } = useAuth();
const { plan } = useSubscription();
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
          <span style={{ color:C.text,fontWeight:900,fontSize:16,letterSpacing:-0.5,fontFamily:"'Plus Jakarta Sans',sans-serif" }}>DecisionOS</span>
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
          <button onClick={()=>handleUpgrade("pro")}style={{ background:"rgba(26,86,219,0.1)",color:C.accent,border:"1.5px solid rgba(26,86,219,0.35)",borderRadius:20,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer",transition:"all 0.2s",whiteSpace:"nowrap" }}
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
{/* ── Login/Logout button ── */}
{user ? (
  <button onClick={signOut}
    style={{ display:"flex",alignItems:"center",gap:6,background:"transparent",border:`1px solid ${C.border}`,borderRadius:20,padding:"5px 14px",cursor:"pointer",fontSize:13,color:C.text }}
    onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent;}}
    onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;}}
  >
{plan !== 'free' && (
      <span style={{ background: plan === 'premium' ? '#F59E0B' : '#1A56DB', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 10, fontWeight: 700, marginRight: 4 }}>
        {plan.toUpperCase()}
      </span>
    )}
    {user.email.split("@")[0]} · Logout
  </button>
) : (
  <a href="/auth/login"
    style={{ display:"flex",alignItems:"center",gap:6,background:C.accent,border:"none",borderRadius:20,padding:"5px 14px",cursor:"pointer",fontSize:13,color:"#fff",textDecoration:"none" }}
  >
    Login
  </a>
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
export function getIcon(id, size=22, color="currentColor") {
  const el = ICONS[id];
  if (!el) return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2.5"/></svg>;
  return el;
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
      <HeroBanner onStart={onStart} />

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

      {/* ③ WHY DECISIONOS */}
      <div style={{ padding: "40px 0 32px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ display:"inline-flex",alignItems:"center",gap:6,background:`${C.accent}12`,border:`1px solid ${C.accent}30`,borderRadius:20,padding:"4px 12px",fontSize:11,fontWeight:700,color:C.accent,letterSpacing:0.8,textTransform:"uppercase",marginBottom:14 }}>
            <span style={{ width:6,height:6,borderRadius:"50%",background:C.accent,display:"inline-block",animation:"aselLoadPulse 1.4s ease-in-out infinite" }} />
            AI-Powered · Not just a checklist
          </div>
          <h2 style={{ color: C.text, fontSize: "clamp(22px, 3vw, 34px)", fontWeight: 900, letterSpacing: -0.8, margin: "0 0 10px" }}>
            Decisions, structured — with AI to help you <span style={{ color: C.accent }}>see clearly</span>
          </h2>
          <p style={{ color: C.textSecondary, fontSize: 15, lineHeight: 1.7, margin: "0 0 20px", maxWidth: 560 }}>
            DecisionOS doesn't just compare products — it works through your context, goals, constraints, and alternatives with you, then produces a clear recommendation with reasoning, an action plan, and a way to track how it turned out.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>, text: "9 decision categories", action: () => document.getElementById("categories")?.scrollIntoView({behavior:"smooth"}), color: C.accent },
              { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V10a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z"/><line x1="9" y1="14" x2="9.01" y2="14" strokeWidth="3"/><line x1="12" y1="14" x2="12.01" y2="14" strokeWidth="3"/><line x1="15" y1="14" x2="15.01" y2="14" strokeWidth="3"/></svg>, text: "AI recommendation with reasoning", action: () => document.getElementById("how-it-works")?.scrollIntoView({behavior:"smooth"}), color: "#7048E8" },
              { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="m9 12 2 2 4-4"/></svg>, text: "Free to start", action: () => onStart("new-decision"), color: "#059669" },
            ].map((item, i) => (
              <button key={i} onClick={item.action}
                style={{ display:"flex",alignItems:"center",gap:8,background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"8px 14px",fontSize:13,fontWeight:600,color:C.text,cursor:"pointer",transition:"all 0.18s" }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor=item.color; e.currentTarget.style.color=item.color; e.currentTarget.style.background=`${item.color}08`; e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 4px 12px ${item.color}20`; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.text; e.currentTarget.style.background=C.card; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}>
                <span style={{ color:item.color }}>{item.icon}</span>{item.text}
              </button>
            ))}
          </div>
        </div>
      </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px" }}>

        {/* ══ HOW IT WORKS ══ */}
        <div id="how-it-works" style={{ marginBottom: 0 }}>
          <div style={{ background:`linear-gradient(135deg,${C.accent} 0%,#7048E8 100%)`,padding:"40px 24px",textAlign:"center",margin:"0 -24px 48px",position:"relative",overflow:"hidden" }}>
            <div style={{ display:"inline-block",background:"rgba(255,255,255,0.15)",color:"#fff",borderRadius:20,padding:"4px 14px",fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:12 }}>Guide</div>
            <h2 style={{ color:"#fff",fontSize:"clamp(26px,4vw,42px)",fontWeight:900,letterSpacing:-1,margin:"0 0 10px" }}>
              How it works
            </h2>
            <p style={{ color:"rgba(255,255,255,0.82)",fontSize:17,margin:0 }}>
              From an open question to a clear recommendation and a plan
            </p>
          </div>

          <div className="steps-grid" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:18,marginBottom:32 }}>
            {[
              { num:1, grad:[C.accent,C.purple],
                title: "Tell us the decision",
                desc: "Describe your context, your goal, and any constraints — budget, timeline, must-haves.",
                icon:<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
              { num:2, grad:[C.purple,"#059669"],
                title: "Add your alternatives",
                desc: "List the options you're actually weighing, whatever they are.",
                icon:<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg> },
              { num:3, grad:["#059669",C.gold],
                title: "Get an AI recommendation",
                desc: "The AI weighs your alternatives against your goals and constraints, and explains its reasoning.",
                icon:<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg> },
              { num:4, grad:[C.gold,C.accent],
                title: "Act on it, then track the outcome",
                desc: "Follow the action plan it builds for you, then record what happened and what you'd do differently.",
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

        {/* Categories — DecisionOS's actual 9 decision categories (H03), linking straight
            into the real wizard at /decision/new?category=... (already accepts this param,
            see pages/decision/new.tsx). Replaces the legacy 66+ product-category tree. */}
        <div id="categories" style={{ marginTop: 48, marginBottom: 80 }}>
          <div style={{ background: `linear-gradient(135deg, ${C.purple} 0%, ${C.accent} 100%)`, padding: "40px 24px", textAlign: "center", margin: "0 -24px 40px" }}>
            <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 20, padding: "4px 14px", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Explore</div>
            <h2 style={{ color: "#fff", fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 900, letterSpacing: -1, margin: "0 0 10px" }}>What can you decide?</h2>
            <p style={{ color: "rgba(255,255,255,0.82)", fontSize: 17, margin: 0 }}>9 decision categories, one AI-guided process</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 14 }}>
            {DECISIONOS_CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => { window.location.href = `/decision/new?category=${cat.id}`; }}
                style={{
                  background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 18,
                  padding: "22px 14px", cursor: "pointer", textAlign: "center",
                  transition: "all 0.2s cubic-bezier(.4,0,.2,1)",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = `${cat.color}10`;
                  e.currentTarget.style.borderColor = `${cat.color}60`;
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = `0 12px 30px ${cat.color}20`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = C.card;
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                  background: `${cat.color}16`, border: `1.5px solid ${cat.color}35`,
                  display: "flex", alignItems: "center", justifyContent: "center", color: cat.color,
                }}>{cat.icon}</div>
                <div style={{ color: C.text, fontSize: 13, fontWeight: 700, lineHeight: 1.3, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {cat.label}
                </div>
                <div style={{ color: C.muted, fontSize: 11, fontWeight: 500, lineHeight: 1.3 }}>
                  {cat.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Section — H08-aligned, IR01-074. id="pricing" is the anchor every
            "Upgrade plan" prompt elsewhere in the app (History, Chat) links to, since
            this is the only place a plan can actually be chosen. */}
        <div id="pricing">
          <PricingSection />
        </div>
      </div>

      {/*
        Removed: a "Global Vision" concept section (fabricated 30+ languages / 66+ categories /
        "no account needed" claims and a decorative country-flag list), the animated globe
        WorldwideSection (fabricated "190+ Countries · 1M+ Decisions" stats), fabricated named
        testimonials, and a "Trusted partners" strip naming AutoScout24/CHECK24/Booking.com/
        Wayfair/Sixt/Europcar — none of which DecisionOS has any relationship with. DecisionOS
        doesn't have real usage numbers or testimonials yet; better to show nothing than invent them.
      */}

      {/* FAQ */}
      <div style={{ background: "#fff", padding: "64px 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ display: "inline-block", background: C.accentLight, color: C.accent, borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 16 }}>FAQ</div>
            <h2 style={{ color: C.text, fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, letterSpacing: -1, margin: "0 0 12px" }}>Frequently asked questions</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { q: "Is DecisionOS free?", a: "Yes — the Free plan gives you unlimited decisions with AI recommendations and up to 10 saved decisions, no time limit. Pro (€4.99/mo) and Premium (€9.99/mo) add AI chat, unlimited history, and priority processing." },
              { q: "How does the AI make recommendations?", a: "You give it your context, goal, constraints, and alternatives. It weighs your alternatives against what you told it matters, and gives you a recommendation with its reasoning, pros/cons, and any risks — not a ranked list from a database." },
              { q: "Do you sell my data?", a: "No. We don't sell your personal data to third parties, and we don't run affiliate links or commission-based recommendations — the AI has no financial incentive to favor one option over another." },
              { q: "Which categories can I get help with?", a: "Financial, technology, health, travel, career, insurance, home, education, and lifestyle decisions." },
              { q: "What happens after I get a recommendation?", a: "You record your final decision, get an action plan to follow, and once you're executing it you can log the outcome and reflect on what worked — so your decision history actually helps next time." },
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
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 16, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>DecisionOS</span>
              </div>
              <p style={{ color: "#64748B", fontSize: 13, lineHeight: 1.6, marginTop: 0, maxWidth: 200 }}>
                Your AI decision assistant. Free to start.
              </p>
            </div>

            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 14, letterSpacing: 0.4 }}>Explore</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {DECISIONOS_CATEGORIES.slice(0,5).map(cat => (
                  <a key={cat.id} href="#categories" style={{ color:"#94A3B8", fontSize:13, textDecoration:"none", display:"flex", alignItems:"center", gap:8, transition:"color 0.15s" }}
                    onMouseEnter={e=>e.currentTarget.style.color="#fff"}
                    onMouseLeave={e=>e.currentTarget.style.color="#94A3B8"}>
                    <span style={{ display:"flex", color:"inherit", opacity:0.5, flexShrink:0 }}>{React.cloneElement(cat.icon, { width:13, height:13 })}</span>
                    {cat.label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 14, letterSpacing: 0.4 }}>More</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {DECISIONOS_CATEGORIES.slice(5,9).map(cat => (
                  <a key={cat.id} href="#categories" style={{ color:"#94A3B8", fontSize:13, textDecoration:"none", display:"flex", alignItems:"center", gap:8, transition:"color 0.15s" }}
                    onMouseEnter={e=>e.currentTarget.style.color="#fff"}
                    onMouseLeave={e=>e.currentTarget.style.color="#94A3B8"}>
                    <span style={{ display:"flex", color:"inherit", opacity:0.5, flexShrink:0 }}>{React.cloneElement(cat.icon, { width:13, height:13 })}</span>
                    {cat.label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 14, letterSpacing: 0.4 }}>Company</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <a href="/about" style={{ color: "#94A3B8", fontSize: 13, textDecoration: "none" }}>About</a>
                <a href="/contact" style={{ color: "#94A3B8", fontSize: 13, textDecoration: "none" }}>Contact</a>
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

          {/* Bottom bar */}
          <div style={{ borderTop: "1px solid #1E293B", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ color: "#334155", fontSize: 12 }}>© 2026 DecisionOS</span>
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
          </div>
        </div>
      </div>

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

// Legacy quiz engine (QuestionScreen/ResultsScreen/ChatScreen/FavoritesScreen/
// ProfileModal) — not linked from the rebuilt landing content's main CTAs, but
// still reachable via the Favorites button, the Profile button, and the
// Ai·sel mascot's chat trigger below. Loaded on demand only when one of those
// is actually clicked, so it is excluded from the homepage's initial bundle.
const QuestionScreen = dynamic(() => import("./legacy/QuizEngine").then(m => m.QuestionScreen), { ssr: false });
const ResultsScreen = dynamic(() => import("./legacy/QuizEngine").then(m => m.ResultsScreen), { ssr: false });
const ChatScreen = dynamic(() => import("./legacy/QuizEngine").then(m => m.ChatScreen), { ssr: false });
const FavoritesScreen = dynamic(() => import("./legacy/QuizEngine").then(m => m.FavoritesScreen), { ssr: false });
const ProfileModal = dynamic(() => import("./legacy/QuizEngine").then(m => m.ProfileModal), { ssr: false });

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
    if (mode === "new-decision") { window.location.href = "/decision/new"; }
    else if (mode === "tree" && id) {
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
