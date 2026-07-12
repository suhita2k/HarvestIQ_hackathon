export const INDIAN_STATES: string[] = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

export const SOIL_TYPES: string[] = [
  "Alluvial Soil", "Black Soil", "Red Soil", "Laterite Soil",
  "Sandy Soil", "Clay Soil", "Loamy Soil", "Saline Soil", "Peaty Soil",
];

export const IRRIGATION_METHODS: string[] = [
  "Drip Irrigation", "Sprinkler Irrigation", "Flood Irrigation",
  "Rainwater Harvesting", "Surface Irrigation", "Micro Irrigation",
];

export interface CropInfo {
  name: string;
  season: string;
  duration: string;
  waterRequirement: "Low" | "Medium" | "High";
  suitableSoils: string[];
  expectedYieldPerAcre: number;
  marketPricePerQuintal: number;
  costPerAcre: number;
}

export const CROPS: CropInfo[] = [
  { name: "Rice (Paddy)", season: "Kharif", duration: "90-150 days", waterRequirement: "High", suitableSoils: ["Clay Soil", "Alluvial Soil"], expectedYieldPerAcre: 25, marketPricePerQuintal: 2050, costPerAcre: 35000 },
  { name: "Wheat", season: "Rabi", duration: "100-130 days", waterRequirement: "Medium", suitableSoils: ["Loamy Soil", "Alluvial Soil"], expectedYieldPerAcre: 20, marketPricePerQuintal: 2125, costPerAcre: 28000 },
  { name: "Maize", season: "Kharif/Rabi", duration: "80-110 days", waterRequirement: "Medium", suitableSoils: ["Loamy Soil", "Sandy Soil"], expectedYieldPerAcre: 22, marketPricePerQuintal: 1962, costPerAcre: 24000 },
  { name: "Cotton", season: "Kharif", duration: "150-180 days", waterRequirement: "Medium", suitableSoils: ["Black Soil", "Alluvial Soil"], expectedYieldPerAcre: 18, marketPricePerQuintal: 6620, costPerAcre: 42000 },
  { name: "Sugarcane", season: "Annual", duration: "10-18 months", waterRequirement: "High", suitableSoils: ["Loamy Soil", "Alluvial Soil"], expectedYieldPerAcre: 300, marketPricePerQuintal: 315, costPerAcre: 60000 },
  { name: "Tomato", season: "Year-round", duration: "70-90 days", waterRequirement: "Medium", suitableSoils: ["Loamy Soil", "Sandy Soil"], expectedYieldPerAcre: 200, marketPricePerQuintal: 1200, costPerAcre: 30000 },
  { name: "Onion", season: "Rabi/Kharif", duration: "90-120 days", waterRequirement: "Low", suitableSoils: ["Loamy Soil", "Alluvial Soil"], expectedYieldPerAcre: 150, marketPricePerQuintal: 1500, costPerAcre: 26000 },
  { name: "Potato", season: "Rabi", duration: "75-100 days", waterRequirement: "Medium", suitableSoils: ["Loamy Soil", "Sandy Soil"], expectedYieldPerAcre: 120, marketPricePerQuintal: 1100, costPerAcre: 32000 },
  { name: "Groundnut", season: "Kharif", duration: "90-120 days", waterRequirement: "Low", suitableSoils: ["Sandy Soil", "Loamy Soil"], expectedYieldPerAcre: 12, marketPricePerQuintal: 5850, costPerAcre: 22000 },
  { name: "Soybean", season: "Kharif", duration: "90-110 days", waterRequirement: "Medium", suitableSoils: ["Black Soil", "Loamy Soil"], expectedYieldPerAcre: 10, marketPricePerQuintal: 4990, costPerAcre: 20000 },
  { name: "Mustard", season: "Rabi", duration: "100-130 days", waterRequirement: "Low", suitableSoils: ["Loamy Soil", "Alluvial Soil"], expectedYieldPerAcre: 9, marketPricePerQuintal: 5650, costPerAcre: 18000 },
  { name: "Banana", season: "Year-round", duration: "9-15 months", waterRequirement: "High", suitableSoils: ["Loamy Soil", "Alluvial Soil"], expectedYieldPerAcre: 300, marketPricePerQuintal: 1500, costPerAcre: 55000 },
  { name: "Turmeric", season: "Kharif", duration: "7-10 months", waterRequirement: "Medium", suitableSoils: ["Loamy Soil", "Laterite Soil"], expectedYieldPerAcre: 25, marketPricePerQuintal: 11500, costPerAcre: 48000 },
  { name: "Chilli", season: "Kharif/Rabi", duration: "90-120 days", waterRequirement: "Medium", suitableSoils: ["Loamy Soil", "Sandy Soil"], expectedYieldPerAcre: 15, marketPricePerQuintal: 9500, costPerAcre: 28000 },
];

export const PEST_LIST: string[] = [
  "Aphids", "Whitefly", "Bollworm", "Stem Borer", "Leaf Folder",
  "Brown Planthopper", "Fruit Borer", "Mites", "Thrips", "Termites",
];

export const FERTILIZER_TYPES = {
  organic: [
    { name: "Compost", npk: "1-1-1", use: "Soil amendment" },
    { name: "Vermicompost", npk: "2-1-1", use: "Rich organic matter" },
    { name: "Farm Yard Manure (FYM)", npk: "0.5-0.2-0.5", use: "General soil fertility" },
    { name: "Bone Meal", npk: "3-15-0", use: "Phosphorus source" },
    { name: "Neem Cake", npk: "2-1-1", use: "Pest repellent + nutrients" },
  ],
  bio: [
    { name: "Rhizobium", npk: "N-fixing", use: "Legume root nodulation" },
    { name: "Azotobacter", npk: "N-fixing", use: "Free-living nitrogen fixer" },
    { name: "Azospirillum", npk: "N-fixing", use: "Associative N-fixing" },
    { name: "PSB (Phosphate Solubilising Bacteria)", npk: "P-solubilising", use: "Phosphorus availability" },
    { name: "Mycorrhiza", npk: "P-solubilising", use: "Root symbiosis" },
  ],
  chemical: [
    { name: "Urea", npk: "46-0-0", use: "Nitrogen source" },
    { name: "DAP (Di-Ammonium Phosphate)", npk: "18-46-0", use: "Phosphorus source" },
    { name: "MOP (Muriate of Potash)", npk: "0-0-60", use: "Potassium source" },
    { name: "NPK 10-26-26", npk: "10-26-26", use: "Complex fertilizer" },
    { name: "NPK 19-19-19", npk: "19-19-19", use: "Balanced growth" },
  ],
};

export const FARMING_TIPS: string[] = [
  "Rotate crops each season to maintain soil health and break pest cycles.",
  "Test your soil every 2-3 years to optimize fertilizer application.",
  "Use drip irrigation to save up to 50% water compared to flood irrigation.",
  "Apply mulch to retain soil moisture and suppress weeds.",
  "Integrate cover crops like legumes to naturally fix nitrogen.",
  "Monitor weather forecasts daily to plan irrigation and pesticide application.",
  "Practice integrated pest management (IPM) before resorting to chemicals.",
  "Maintain organic matter above 1% in soil for healthy microbial activity.",
  "Time your planting based on soil temperature, not just calendar dates.",
  "Use neem oil as a natural pesticide for soft-bodied insects.",
];

export const NOTIFICATION_TYPES = {
  RAINFALL: "rainfall",
  HEATWAVE: "heatwave",
  DISEASE_OUTBREAK: "disease_outbreak",
  MARKET_PRICE: "market_price",
  SCHEME_UPDATE: "scheme_update",
};

export const DEFAULT_GOVERNMENT_SCHEMES = [
  {
    name: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    description: "Income support of ₹6,000 per year to small and marginal farmer families in three equal installments.",
    eligibility: "Small and marginal farmer families holding cultivable land. Excludes institutional landholders and high-income taxpayers.",
    benefits: "₹6,000 per year in three installments of ₹2,000 each, directly to bank accounts.",
    requiredDocuments: "Aadhaar card, land records (khatauni), bank passbook, mobile number, caste certificate (if applicable).",
    applicationProcess: "Visit pmkisan.gov.in, click 'New Farmer Registration', fill the form with Aadhaar and land details, and submit. Verification done by state authorities.",
    ministry: "Ministry of Agriculture & Farmers Welfare",
  },
  {
    name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    description: "Crop insurance scheme protecting farmers against natural calamities, pests and diseases.",
    eligibility: "Loanee and non-loanee farmers growing notified crops in notified areas.",
    benefits: "Up to 90% of sum insured for crop loss. Premium: 2% (Kharif), 1.5% (Rabi), 5% (commercial/horticultural).",
    requiredDocuments: "Aadhaar card, land records, bank passbook, crop sowing certificate, mobile number.",
    applicationProcess: "Register on pmfby.gov.in or through CSCs/banks. Pay premium at the time of loan sanction or before cutoff date.",
    ministry: "Ministry of Agriculture & Farmers Welfare",
  },
  {
    name: "Soil Health Card Scheme",
    description: "Provides free soil testing and nutrient status reports to farmers every 2 years.",
    eligibility: "All farmers in India.",
    benefits: "Free soil testing, customized fertilizer recommendations, soil health card with 12 parameters.",
    requiredDocuments: "Aadhaar card, land ownership documents, mobile number.",
    applicationProcess: "Apply at nearest soil testing lab or through soilhealth.dac.gov.in. Sample collected by field staff.",
    ministry: "Department of Agriculture & Farmers Welfare",
  },
  {
    name: "Kisan Credit Card (KCC)",
    description: "Provides farmers with affordable credit for agricultural inputs and allied activities.",
    eligibility: "All farmers, share croppers, tenant farmers, and oral lessees.",
    benefits: "Credit limit up to ₹3 lakh at 4% interest (with subvention). ATM/Debit card facility.",
    requiredDocuments: "Aadhaar card, land records, passport photos, bank statement, mobile number.",
    applicationProcess: "Apply at any bank (SBI, PNB, etc.) with documents. Bank verifies and issues KCC within 14 days.",
    ministry: "RBI / NABARD",
  },
  {
    name: "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)",
    description: "Improves farm water availability through micro-irrigation and water management.",
    eligibility: "All farmers, FPOs, and cooperatives.",
    benefits: "Subsidy up to 55% on micro-irrigation systems (drip/sprinkler).",
    requiredDocuments: "Aadhaar card, land records, bank details, water source details.",
    applicationProcess: "Apply through pmksy.gov.in or state agriculture departments. Approved agencies install the system.",
    ministry: "Ministry of Jal Shakti",
  },
  {
    name: "Sub-Mission on Agricultural Mechanization (SMAM)",
    description: "Promotes agricultural mechanization through subsidies on farm equipment.",
    eligibility: "Individual farmers, FPOs, and custom hiring centers.",
    benefits: "40-50% subsidy on tractors and farm machinery.",
    requiredDocuments: "Aadhaar card, land records, bank details, project report (for CHCs).",
    applicationProcess: "Apply through state agriculture departments or online portals.",
    ministry: "Ministry of Agriculture & Farmers Welfare",
  },
];

export const DEFAULT_ARTICLES = [
  {
    title: "Organic Farming: A Complete Beginner's Guide",
    slug: "organic-farming-beginners-guide",
    category: "Organic Farming",
    summary: "Learn the principles of organic farming, how to transition from conventional methods, and practical steps to grow chemical-free produce.",
    content: "Organic farming is a method of agriculture that avoids synthetic chemicals, genetically modified organisms, and focuses on ecological balance.\n\nKey principles include:\n1. Crop rotation to maintain soil fertility\n2. Use of compost and green manure\n3. Biological pest control\n4. Biodiversity preservation\n\nTo start, transition gradually — begin with one plot and learn. Test your soil, build organic matter, and choose resistant varieties. Certification typically takes 2-3 years of practicing organic methods.",
  },
  {
    title: "Smart Farming with IoT and AI",
    slug: "smart-farming-iot-ai",
    category: "Smart Farming",
    summary: "How Internet of Things sensors and artificial intelligence are transforming modern agriculture.",
    content: "Smart farming integrates IoT sensors, drones, AI, and data analytics to optimize agricultural operations.\n\nKey technologies:\n- Soil moisture sensors for precise irrigation\n- Drone imaging for crop health monitoring\n- AI-driven pest detection\n- Weather stations for micro-climate data\n\nBenefits include 20-30% yield increase, 30% water savings, and reduced chemical use. Start with affordable sensors and scale as you learn.",
  },
  {
    title: "Hydroponics: Growing Without Soil",
    slug: "hydroponics-growing-without-soil",
    category: "Hydroponics",
    summary: "A practical introduction to soil-less farming, systems, and crop choices for hydroponics.",
    content: "Hydroponics grows plants in nutrient-rich water solutions without soil.\n\nCommon systems:\n1. NFT (Nutrient Film Technique)\n2. Deep Water Culture (DWC)\n3. Ebb and Flow\n4. Drip System\n\nBest crops: lettuce, spinach, strawberries, tomatoes, herbs. Initial investment is higher but yields 3-10x traditional farming in less space.",
  },
  {
    title: "Greenhouse Farming for Year-Round Production",
    slug: "greenhouse-farming-year-round",
    category: "Greenhouse Farming",
    summary: "Maximize yields and extend growing seasons with controlled-environment agriculture.",
    content: "Greenhouse farming protects crops from extreme weather, pests, and diseases while extending growing seasons.\n\nTypes: polyhouse, glasshouse, shade nets.\n\nKey considerations: ventilation, temperature control, irrigation, pollination. Suitable crops: tomatoes, cucumbers, peppers, flowers.\n\nROI is typically 2-3 years for polyhouses with high-value crops.",
  },
  {
    title: "Fertilizer Management: NPK Ratio Explained",
    slug: "fertilizer-management-npk-ratio",
    category: "Fertilizer Management",
    summary: "Understand nitrogen, phosphorus, and potassium ratios to optimize crop nutrition.",
    content: "NPK stands for Nitrogen (N), Phosphorus (P), and Potassium (K) — the three primary nutrients.\n\n- Nitrogen promotes leaf growth\n- Phosphorus supports root and flower development\n- Potassium strengthens overall plant health\n\nApply based on soil test results. Split applications reduce waste. Over-fertilization pollutes water and reduces yields.",
  },
  {
    title: "Drip Irrigation: Maximum Crop Per Drop",
    slug: "drip-irrigation-maximum-crop-per-drop",
    category: "Irrigation",
    summary: "How drip irrigation saves water and boosts yields with precise delivery.",
    content: "Drip irrigation delivers water directly to plant roots through a network of valves, pipes, and emitters.\n\nBenefits:\n- 40-60% water savings vs flood irrigation\n- 20-30% yield increase\n- Reduced weed growth\n- Fertigation capability\n\nDesign depends on crop, soil type, and field layout. Maintenance includes regular flushing and filter cleaning.",
  },
  {
    title: "Common Crop Diseases and Their Management",
    slug: "common-crop-diseases-management",
    category: "Crop Diseases",
    summary: "Identify and manage the most prevalent crop diseases affecting Indian agriculture.",
    content: "Common diseases include:\n\n1. Bacterial Blight (rice) — copper-based sprays\n2. Powdery Mildew — sulfur fungicides\n3. Late Blight (potato/tomato) — mancozeb\n4. Rust (wheat) — resistant varieties\n5. Wilt disease — Trichoderma treatment\n\nPrevention: crop rotation, resistant varieties, proper spacing, balanced nutrition. Early detection saves up to 70% of potential loss.",
  },
  {
    title: "Integrated Pest Management (IPM)",
    slug: "integrated-pest-management",
    category: "Pest Control",
    summary: "Combine biological, cultural, and chemical methods for sustainable pest control.",
    content: "IPM uses multiple strategies:\n\n1. Biological: predators like ladybugs, Trichogramma wasps\n2. Cultural: crop rotation, trap crops, sanitation\n3. Mechanical: handpicking, barriers, light traps\n4. Chemical: as last resort, targeted application\n\nMonitor with pheromone traps. Apply action thresholds before spraying. Rotate chemical groups to prevent resistance.",
  },
  {
    title: "Government Policies Supporting Indian Farmers",
    slug: "government-policies-indian-farmers",
    category: "Government Policies",
    summary: "Overview of key agricultural policies, subsidies, and support schemes.",
    content: "Major policies include:\n\n- PM-KISAN: ₹6,000/year income support\n- PMFBY: Crop insurance\n- MSP: Minimum Support Price for 23 crops\n- KCC: Affordable credit\n- PMKSY: Micro-irrigation subsidy\n- Soil Health Card: Free soil testing\n\nStates also offer additional schemes. Stay updated through agriculture department websites.",
  },
];

export const DEFAULT_MARKET_PRICES = [
  { crop: "Rice (Paddy)", market: "Chennai", price: 2050, unit: "quintal" },
  { crop: "Rice (Paddy)", market: "Coimbatore", price: 2100, unit: "quintal" },
  { crop: "Wheat", market: "Delhi", price: 2125, unit: "quintal" },
  { crop: "Wheat", market: "Ludhiana", price: 2150, unit: "quintal" },
  { crop: "Maize", market: "Hyderabad", price: 1962, unit: "quintal" },
  { crop: "Cotton", market: "Coimbatore", price: 6620, unit: "quintal" },
  { crop: "Sugarcane", market: "Pune", price: 315, unit: "quintal" },
  { crop: "Tomato", market: "Bangalore", price: 1200, unit: "quintal" },
  { crop: "Onion", market: "Pune", price: 1500, unit: "quintal" },
  { crop: "Potato", market: "Agra", price: 1100, unit: "quintal" },
  { crop: "Groundnut", market: "Rajkot", price: 5850, unit: "quintal" },
  { crop: "Soybean", market: "Indore", price: 4990, unit: "quintal" },
  { crop: "Mustard", market: "Jaipur", price: 5650, unit: "quintal" },
  { crop: "Banana", market: "Madurai", price: 1500, unit: "quintal" },
  { crop: "Turmeric", market: "Erode", price: 11500, unit: "quintal" },
  { crop: "Chilli", market: "Guntur", price: 9500, unit: "quintal" },
];

export const FARMING_CALENDAR = [
  { month: "January", activities: ["Sow Rabi crops (wheat, mustard, peas)", "Harvest late Kharif", "Apply winter irrigation"] },
  { month: "February", activities: ["Harvest wheat and barley", "Apply 3rd dose of nitrogen to wheat", "Prepare Kharif nursery"] },
  { month: "March", activities: ["Harvest Rabi crops", "Sow summer vegetables", "Apply pre-emergence herbicide"] },
  { month: "April", activities: ["Harvest Rabi crops", "Sow Kharif nursery (rice, cotton)", "Maintain orchard sanitation"] },
  { month: "May", activities: ["Transplant rice", "Sow cotton and maize", "Monitor pest outbreaks"] },
  { month: "June", activities: ["Transplant rice", "Apply basal fertilizer to Kharif", "Install pheromone traps"] },
  { month: "July", activities: ["Sow pulses and oilseeds", "Apply top dressing to rice", "Weed management"] },
  { month: "August", activities: ["Apply second dose of nitrogen", "Monitor for pest/disease outbreaks", "Maintain drainage"] },
  { month: "September", activities: ["Harvest early Kharif", "Prepare for Rabi sowing", "Manage late-sown crops"] },
  { month: "October", activities: ["Harvest Kharif crops", "Sow Rabi crops (wheat, mustard)", "Apply basal fertilizer"] },
  { month: "November", activities: ["Sow Rabi crops", "Apply pre-emergence herbicide", "Harvest sugarcane"] },
  { month: "December", activities: ["Apply first irrigation to wheat", "Monitor for frost damage", "Plan for next season"] },
];
