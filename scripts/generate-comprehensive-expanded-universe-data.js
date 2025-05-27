const { MongoClient } = require('mongodb');
const neo4j = require('neo4j-driver');
const weaviate = require('weaviate-ts-client').default;

// Comprehensive Expanded Universe Data Generator
// Generates 150 characters, 150 locations, 75 factions focused on Force users

console.log('🌌 Generating Comprehensive Expanded Universe Data');
console.log('=================================================');
console.log('📊 Target: 150 Characters, 150 Locations, 75 Factions');
console.log('🔥 Focus: Force-sensitive beings and organizations');
console.log('');

// Era-based character generation with Force user focus
const EXPANDED_UNIVERSE_CHARACTERS = [];
const EXPANDED_UNIVERSE_LOCATIONS = [];
const EXPANDED_UNIVERSE_FACTIONS = [];

// Major Force-using characters from EU/Legends
const CORE_FORCE_USERS = [
  // Ancient Era Force Users (25,000-5,000 BBY)
  { name: "Arca Jeth", era: "Ancient Jedi", type: "Jedi Master", importance: "major", force_level: "Very High" },
  { name: "Odan-Urr", era: "Ancient Jedi", type: "Jedi Master", importance: "major", force_level: "Very High" },
  { name: "Memit Nadill", era: "Ancient Jedi", type: "Jedi Master", importance: "major", force_level: "High" },
  { name: "Ooroo", era: "Ancient Jedi", type: "Jedi Master", importance: "major", force_level: "High" },
  
  // Old Republic Era (5,000-1,000 BBY)
  { name: "Revan", era: "Old Republic", type: "Jedi/Sith", importance: "major", force_level: "Legendary" },
  { name: "Darth Malak", era: "Old Republic", type: "Sith Lord", importance: "major", force_level: "Very High" },
  { name: "Bastila Shan", era: "Old Republic", type: "Jedi Knight", importance: "major", force_level: "Very High" },
  { name: "Jolee Bindo", era: "Old Republic", type: "Former Jedi", importance: "major", force_level: "High" },
  { name: "Juhani", era: "Old Republic", type: "Jedi Knight", importance: "major", force_level: "High" },
  { name: "Kreia/Darth Traya", era: "Old Republic", type: "Jedi/Sith", importance: "major", force_level: "Legendary" },
  { name: "Meetra Surik", era: "Old Republic", type: "Jedi Exile", importance: "major", force_level: "Very High" },
  { name: "Darth Nihilus", era: "Old Republic", type: "Sith Lord", importance: "major", force_level: "Legendary" },
  { name: "Darth Sion", era: "Old Republic", type: "Sith Lord", importance: "major", force_level: "Very High" },
  { name: "Atris", era: "Old Republic", type: "Jedi Master", importance: "major", force_level: "High" },
  { name: "Visas Marr", era: "Old Republic", type: "Jedi Knight", importance: "major", force_level: "High" },
  { name: "Mira", era: "Old Republic", type: "Jedi Knight", importance: "major", force_level: "Medium" },
  { name: "Hanharr", era: "Old Republic", type: "Dark Jedi", importance: "minor", force_level: "Low" },
  
  // Darth Bane Era (1,000 BBY)
  { name: "Darth Bane", era: "New Sith Wars", type: "Sith Lord", importance: "major", force_level: "Legendary" },
  { name: "Darth Zannah", era: "New Sith Wars", type: "Sith Lord", importance: "major", force_level: "Very High" },
  { name: "Darth Cognus", era: "New Sith Wars", type: "Sith Lord", importance: "major", force_level: "Very High" },
  { name: "Darth Millennial", era: "New Sith Wars", type: "Sith Lord", importance: "major", force_level: "High" },
  
  // Prequel Era Force Users
  { name: "Qui-Gon Jinn", era: "Prequel Era", type: "Jedi Master", importance: "major", force_level: "Very High" },
  { name: "Mace Windu", era: "Prequel Era", type: "Jedi Master", importance: "major", force_level: "Very High" },
  { name: "Kit Fisto", era: "Prequel Era", type: "Jedi Master", importance: "major", force_level: "High" },
  { name: "Plo Koon", era: "Prequel Era", type: "Jedi Master", importance: "major", force_level: "High" },
  { name: "Ki-Adi-Mundi", era: "Prequel Era", type: "Jedi Master", importance: "major", force_level: "High" },
  { name: "Aayla Secura", era: "Prequel Era", type: "Jedi Knight", importance: "major", force_level: "High" },
  { name: "Shaak Ti", era: "Prequel Era", type: "Jedi Master", importance: "major", force_level: "High" },
  { name: "Luminara Unduli", era: "Prequel Era", type: "Jedi Master", importance: "major", force_level: "High" },
  { name: "Barriss Offee", era: "Prequel Era", type: "Jedi Padawan", importance: "major", force_level: "High" },
  { name: "Even Piell", era: "Prequel Era", type: "Jedi Master", importance: "minor", force_level: "High" },
  { name: "Eeth Koth", era: "Prequel Era", type: "Jedi Master", importance: "minor", force_level: "High" },
  { name: "Saesee Tiin", era: "Prequel Era", type: "Jedi Master", importance: "minor", force_level: "High" },
  { name: "Agen Kolar", era: "Prequel Era", type: "Jedi Master", importance: "minor", force_level: "High" },
  { name: "Coleman Trebor", era: "Prequel Era", type: "Jedi Master", importance: "minor", force_level: "High" },
  
  // Clone Wars Era Characters
  { name: "Asajj Ventress", era: "Clone Wars", type: "Dark Acolyte", importance: "major", force_level: "High" },
  { name: "Savage Opress", era: "Clone Wars", type: "Nightbrother", importance: "major", force_level: "High" },
  { name: "Mother Talzin", era: "Clone Wars", type: "Nightsister", importance: "major", force_level: "Very High" },
  { name: "Quinlan Vos", era: "Clone Wars", type: "Jedi Master", importance: "major", force_level: "High" },
  
  // Imperial Era Force Users
  { name: "Galen Marek", era: "Imperial Era", type: "Sith Apprentice", importance: "major", force_level: "Legendary" },
  { name: "Rahm Kota", era: "Imperial Era", type: "Jedi General", importance: "major", force_level: "High" },
  { name: "Jerec", era: "Imperial Era", type: "Dark Jedi", importance: "major", force_level: "Very High" },
  { name: "Sariss", era: "Imperial Era", type: "Dark Jedi", importance: "minor", force_level: "High" },
  { name: "Yun", era: "Imperial Era", type: "Dark Jedi", importance: "minor", force_level: "Medium" },
  { name: "Boc", era: "Imperial Era", type: "Dark Jedi", importance: "minor", force_level: "Medium" },
  { name: "Gorc", era: "Imperial Era", type: "Dark Jedi", importance: "minor", force_level: "Medium" },
  { name: "Pic", era: "Imperial Era", type: "Dark Jedi", importance: "minor", force_level: "Medium" },
  { name: "Maw", era: "Imperial Era", type: "Dark Jedi", importance: "minor", force_level: "High" },
  
  // New Republic Era Force Users  
  { name: "Luke Skywalker", era: "New Republic", type: "Jedi Master", importance: "major", force_level: "Legendary" },
  { name: "Mara Jade", era: "New Republic", type: "Jedi Master", importance: "major", force_level: "Very High" },
  { name: "Kyle Katarn", era: "New Republic", type: "Jedi Master", importance: "major", force_level: "High" },
  { name: "Corran Horn", era: "New Republic", type: "Jedi Knight", importance: "major", force_level: "High" },
  { name: "Kam Solusar", era: "New Republic", type: "Jedi Knight", importance: "major", force_level: "High" },
  { name: "Tionne", era: "New Republic", type: "Jedi Knight", importance: "major", force_level: "Medium" },
  { name: "Streen", era: "New Republic", type: "Jedi Knight", importance: "minor", force_level: "Medium" },
  { name: "Kirana Ti", era: "New Republic", type: "Jedi Knight", importance: "minor", force_level: "Medium" },
  { name: "Dorsk 81", era: "New Republic", type: "Jedi Knight", importance: "minor", force_level: "Medium" },
  
  // Solo Children Era
  { name: "Jaina Solo", era: "New Jedi Order", type: "Jedi Knight", importance: "major", force_level: "Very High" },
  { name: "Jacen Solo", era: "New Jedi Order", type: "Jedi Knight/Sith", importance: "major", force_level: "Very High" },
  { name: "Anakin Solo", era: "New Jedi Order", type: "Jedi Knight", importance: "major", force_level: "Very High" },
  { name: "Ben Skywalker", era: "New Jedi Order", type: "Jedi Knight", importance: "major", force_level: "Very High" },
  
  // Legacy Era Characters
  { name: "Darth Krayt", era: "Legacy Era", type: "Sith Lord", importance: "major", force_level: "Legendary" },
  { name: "Darth Nihl", era: "Legacy Era", type: "Sith Lord", importance: "major", force_level: "Very High" },
  { name: "Darth Talon", era: "Legacy Era", type: "Sith Lord", importance: "major", force_level: "High" },
  { name: "Cade Skywalker", era: "Legacy Era", type: "Jedi Knight", importance: "major", force_level: "Very High" },
  { name: "Wolf Sazen", era: "Legacy Era", type: "Jedi Master", importance: "major", force_level: "High" },
  { name: "Shado Vao", era: "Legacy Era", type: "Jedi Knight", importance: "major", force_level: "High" }
];

// Generate additional Force users to reach 120 total
function generateAdditionalForceUsers() {
  const additionalUsers = [];
  const species = ["Human", "Twi'lek", "Zabrak", "Rodian", "Nautolan", "Togruta", "Kel Dor", "Cerean", "Mirialan", "Chiss"];
  const forceOrganizations = ["Jedi Order", "Sith Order", "Dark Jedi", "Gray Jedi", "Nightsisters", "Matukai", "Zeison Sha", "Saber Rakes"];
  const eras = ["Old Republic", "New Republic", "Imperial Era", "Legacy Era"];
  
  for (let i = 0; i < 50; i++) {
    const species_choice = species[Math.floor(Math.random() * species.length)];
    const era_choice = eras[Math.floor(Math.random() * eras.length)];
    const org_choice = forceOrganizations[Math.floor(Math.random() * forceOrganizations.length)];
    
    additionalUsers.push({
      name: `${generateName()} ${generateSurname()}`,
      era: era_choice,
      type: org_choice.includes("Jedi") ? "Jedi Knight" : org_choice.includes("Sith") ? "Sith Acolyte" : "Force Adept",
      importance: "minor",
      force_level: Math.random() > 0.7 ? "High" : Math.random() > 0.4 ? "Medium" : "Low",
      species: species_choice,
      affiliation: org_choice
    });
  }
  
  return additionalUsers;
}

// Generate names
function generateName() {
  const names = ["Aeron", "Brial", "Corran", "Dain", "Eron", "Fynn", "Garen", "Haran", "Iden", "Jaxon", "Kael", "Laren", "Mira", "Nara", "Orin", "Pax", "Quinn", "Raven", "Saber", "Tara", "Ulric", "Vera", "Wren", "Xara", "Yen", "Zara"];
  return names[Math.floor(Math.random() * names.length)];
}

function generateSurname() {
  const surnames = ["Antilles", "Bridger", "Calrissian", "Dameron", "Erso", "Fett", "Ghent", "Horn", "Iblis", "Jade", "Karrde", "Lars", "Mothma", "Naberrie", "Organa", "Piett", "Qrygg", "Rand", "Solo", "Thrawn", "Urdal", "Veers", "Wedge", "Xizor", "Ysanne", "Zahn"];
  return surnames[Math.floor(Math.random() * surnames.length)];
}

// Major Force-sensitive locations
const FORCE_SENSITIVE_LOCATIONS = [
  // Ancient Force Worlds
  { name: "Tython", type: "Force Nexus", alignment: "Light", era: "Dawn of the Jedi" },
  { name: "Korriban", type: "Sith Homeworld", alignment: "Dark", era: "Ancient Sith" },
  { name: "Dromund Kaas", type: "Sith Capital", alignment: "Dark", era: "Old Republic" },
  { name: "Yavin 4", type: "Massassi Temples", alignment: "Dark", era: "Multiple" },
  { name: "Dantooine", type: "Jedi Enclave", alignment: "Light", era: "Old Republic" },
  { name: "Malachor V", type: "Force Wound", alignment: "Dark", era: "Old Republic" },
  { name: "Lehon", type: "Star Forge", alignment: "Neutral", era: "Ancient" },
  { name: "Dathomir", type: "Nightsister World", alignment: "Dark", era: "Multiple" },
  { name: "Ziost", type: "Sith World", alignment: "Dark", era: "Old Republic" },
  { name: "Ossus", type: "Jedi Library", alignment: "Light", era: "Old Republic" },
  
  // Jedi Temples and Training Grounds
  { name: "Coruscant Jedi Temple", type: "Jedi Headquarters", alignment: "Light", era: "Republic" },
  { name: "Ilum", type: "Crystal Caves", alignment: "Light", era: "Multiple" },
  { name: "Jedha", type: "Holy City", alignment: "Light", era: "Imperial" },
  { name: "Lothal Jedi Temple", type: "Jedi Temple", alignment: "Light", era: "Imperial" },
  { name: "Ahch-To", type: "First Jedi Temple", alignment: "Light", era: "Ancient" },
  
  // Sith Strongholds
  { name: "Exegol", type: "Sith Eternal", alignment: "Dark", era: "Sequel" },
  { name: "Byss", type: "Emperor's Retreat", alignment: "Dark", era: "Imperial" },
  { name: "Khar Delba", type: "Sith Fortress", alignment: "Dark", era: "Old Republic" },
  { name: "Rhelg", type: "Sith Academy", alignment: "Dark", era: "Old Republic" },
  
  // Force Nexus Worlds
  { name: "Dagobah", type: "Force Cave", alignment: "Dark Vergence", era: "Imperial" },
  { name: "Cave of Evil", type: "Dark Side Cave", alignment: "Dark", era: "Multiple" },
  { name: "Mortis", type: "Force Plane", alignment: "Balance", era: "Timeless" },
  { name: "Vergesso Asteroids", type: "Force Sensitive", alignment: "Neutral", era: "Multiple" }
];

// Major Force Organizations
const FORCE_ORGANIZATIONS = [
  // Light Side Organizations
  { name: "Ancient Jedi Order", type: "Religious Order", alignment: "Light", era: "Old Republic" },
  { name: "New Jedi Order", type: "Religious Order", alignment: "Light", era: "New Republic" },
  { name: "Je'daii Order", type: "Force Order", alignment: "Balance", era: "Dawn of the Jedi" },
  { name: "Jedi Covenant", type: "Jedi Sect", alignment: "Light", era: "Old Republic" },
  
  // Dark Side Organizations  
  { name: "Sith Empire", type: "Dark Empire", alignment: "Dark", era: "Ancient Sith" },
  { name: "Brotherhood of Darkness", type: "Sith Army", alignment: "Dark", era: "New Sith Wars" },
  { name: "Rule of Two Sith", type: "Sith Order", alignment: "Dark", era: "Republic" },
  { name: "One Sith", type: "Sith Order", alignment: "Dark", era: "Legacy" },
  { name: "Sith Triumvirate", type: "Sith Lords", alignment: "Dark", era: "Old Republic" },
  { name: "Dark Jedi", type: "Fallen Jedi", alignment: "Dark", era: "Multiple" },
  { name: "Nightsisters", type: "Witch Clan", alignment: "Dark", era: "Multiple" },
  { name: "Nightbrothers", type: "Warrior Clan", alignment: "Dark", era: "Multiple" },
  { name: "Prophets of the Dark Side", type: "Cult", alignment: "Dark", era: "Imperial" },
  { name: "Shadow Academy", type: "Dark Jedi School", alignment: "Dark", era: "New Republic" },
  
  // Neutral/Gray Organizations
  { name: "Potentium", type: "Force Philosophy", alignment: "Gray", era: "New Republic" },
  { name: "Matukai", type: "Force Adepts", alignment: "Neutral", era: "Multiple" },
  { name: "Zeison Sha", type: "Force Warriors", alignment: "Neutral", era: "New Republic" },
  { name: "Fallanassi", type: "Force Illusion", alignment: "Neutral", era: "New Republic" },
  { name: "Aing-Tii", type: "Force Monks", alignment: "Neutral", era: "Multiple" },
  { name: "Baran Do", type: "Kel Dor Sages", alignment: "Light", era: "Multiple" },
  { name: "Jensaarai", type: "Force Defenders", alignment: "Gray", era: "New Republic" },
  { name: "Saber Rakes", type: "Force Gang", alignment: "Dark", era: "Old Republic" }
];

// Enhanced character generation
function generateComprehensiveCharacter(baseChar, index) {
  const species = ["Human", "Twi'lek", "Zabrak", "Togruta", "Nautolan", "Kel Dor", "Cerean", "Mirialan", "Chiss", "Miraluka"];
  const homeworlds = ["Coruscant", "Alderaan", "Corellia", "Naboo", "Ryloth", "Shili", "Glee Anselm", "Dorin", "Cerea", "Mirial"];
  
  const forceMap = {
    "Legendary": ["Telekinesis Mastery", "Force Lightning", "Battle Meditation", "Force Drain", "Precognition"],
    "Very High": ["Advanced Telekinesis", "Mind Trick", "Force Push/Pull", "Enhanced Reflexes", "Force Jump"],
    "High": ["Telekinesis", "Force Sense", "Lightsaber Combat", "Force Speed", "Force Heal"],
    "Medium": ["Basic Force Sense", "Minor Telekinesis", "Force-enhanced Athletics"],
    "Low": ["Force Sensitivity", "Intuition"]
  };

  return {
    id: `${baseChar.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${index}`,
    name: baseChar.name,
    species: baseChar.species || species[Math.floor(Math.random() * species.length)],
    homeworld: homeworlds[Math.floor(Math.random() * homeworlds.length)],
    era: baseChar.era,
    force_sensitivity: baseChar.force_level,
    affiliation: [baseChar.affiliation || (baseChar.type.includes("Jedi") ? "Jedi Order" : baseChar.type.includes("Sith") ? "Sith Order" : "Independent")],
    rank: baseChar.type,
    importance: baseChar.importance,
    description: `${baseChar.type} from the ${baseChar.era} era, known for their ${baseChar.force_level.toLowerCase()} connection to the Force`,
    special_abilities: forceMap[baseChar.force_level] || forceMap["Low"],
    personality: generatePersonality(baseChar.type),
    lightsaber_forms: generateLightsaberForms(baseChar.force_level)
  };
}

function generatePersonality(type) {
  const jediTraits = ["Wise", "Compassionate", "Disciplined", "Peaceful", "Protective"];
  const sithTraits = ["Ambitious", "Powerful", "Ruthless", "Passionate", "Cunning"];
  const neutralTraits = ["Independent", "Pragmatic", "Skilled", "Adaptable", "Mysterious"];
  
  if (type.includes("Jedi")) return jediTraits.slice(0, 3);
  if (type.includes("Sith")) return sithTraits.slice(0, 3);
  return neutralTraits.slice(0, 3);
}

function generateLightsaberForms(forceLevel) {
  const forms = ["Form I: Shii-Cho", "Form II: Makashi", "Form III: Soresu", "Form IV: Ataru", "Form V: Djem So", "Form VI: Niman", "Form VII: Juyo"];
  const count = forceLevel === "Legendary" ? 3 : forceLevel === "Very High" ? 2 : 1;
  return forms.slice(0, count);
}

// Generate comprehensive datasets
async function generateComprehensiveData() {
  console.log('🔧 Generating comprehensive character dataset...');
  
  // Combine core Force users with generated ones
  const allForceUsers = [...CORE_FORCE_USERS, ...generateAdditionalForceUsers()];
  
  // Generate 30 non-Force users (pilots, soldiers, politicians, etc.)
  for (let i = 0; i < 30; i++) {
    allForceUsers.push({
      name: `${generateName()} ${generateSurname()}`,
      era: ["Imperial Era", "New Republic", "Old Republic"][Math.floor(Math.random() * 3)],
      type: ["Pilot", "Soldier", "Politician", "Smuggler", "Bounty Hunter"][Math.floor(Math.random() * 5)],
      importance: "minor",
      force_level: "None",
      species: ["Human", "Twi'lek", "Rodian", "Sullustan", "Duros"][Math.floor(Math.random() * 5)]
    });
  }

  // Convert to full character objects
  for (let i = 0; i < allForceUsers.length && i < 150; i++) {
    EXPANDED_UNIVERSE_CHARACTERS.push(generateComprehensiveCharacter(allForceUsers[i], i));
  }

  console.log(`✅ Generated ${EXPANDED_UNIVERSE_CHARACTERS.length} characters`);

  // Generate 150 locations
  console.log('🌍 Generating comprehensive location dataset...');
  
  // Add all Force-sensitive locations
  FORCE_SENSITIVE_LOCATIONS.forEach((loc, i) => {
    EXPANDED_UNIVERSE_LOCATIONS.push({
      id: `${loc.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${i}`,
      name: loc.name,
      system: `${loc.name} System`,
      region: ["Core Worlds", "Inner Rim", "Mid Rim", "Outer Rim", "Unknown Regions"][Math.floor(Math.random() * 5)],
      climate: ["Temperate", "Arid", "Tropical", "Cold", "Varied"][Math.floor(Math.random() * 5)],
      terrain: loc.type.includes("Temple") ? "Ancient ruins, temples" : loc.type.includes("Cave") ? "Caves, caverns" : "Varied terrain",
      force_nexus: loc.alignment,
      significance: loc.type,
      era: loc.era,
      importance: FORCE_SENSITIVE_LOCATIONS.indexOf(loc) < 15 ? "major" : "minor",
      description: `${loc.type} significant to ${loc.alignment} side Force users during the ${loc.era} era`
    });
  });

  // Generate additional planets and locations
  const additionalWorlds = ["Tatooine", "Hoth", "Endor", "Bespin", "Sullust", "Mon Calamari", "Kashyyyk", "Kamino", "Geonosis", "Mustafar"];
  additionalWorlds.forEach((world, i) => {
    EXPANDED_UNIVERSE_LOCATIONS.push({
      id: `${world.toLowerCase()}-${i}`,
      name: world,
      system: `${world} System`,
      region: ["Outer Rim", "Mid Rim", "Inner Rim"][Math.floor(Math.random() * 3)],
      climate: ["Desert", "Ice", "Forest", "Gas Giant", "Ocean", "Volcanic"][Math.floor(Math.random() * 6)],
      terrain: "Varied",
      force_nexus: "Neutral",
      significance: "Notable world in galactic history",
      era: "Multiple",
      importance: "minor",
      description: `Notable world that played a role in galactic events`
    });
  });

  // Fill remaining locations with generated ones
  for (let i = EXPANDED_UNIVERSE_LOCATIONS.length; i < 150; i++) {
    EXPANDED_UNIVERSE_LOCATIONS.push({
      id: `generated-world-${i}`,
      name: `${generateName()} ${["Prime", "Major", "Minor", "Alpha", "Beta"][Math.floor(Math.random() * 5)]}`,
      system: `System ${i}`,
      region: ["Outer Rim", "Mid Rim", "Inner Rim", "Unknown Regions"][Math.floor(Math.random() * 4)],
      climate: ["Temperate", "Arid", "Tropical", "Cold", "Varied"][Math.floor(Math.random() * 5)],
      terrain: "Varied terrain",
      force_nexus: "Neutral",
      significance: "Minor world",
      era: "Multiple",
      importance: "minor",
      description: "Lesser-known world in the galaxy"
    });
  }

  console.log(`✅ Generated ${EXPANDED_UNIVERSE_LOCATIONS.length} locations`);

  // Generate 75 factions
  console.log('⚔️ Generating comprehensive faction dataset...');
  
  // Add all Force organizations
  FORCE_ORGANIZATIONS.forEach((org, i) => {
    EXPANDED_UNIVERSE_FACTIONS.push({
      id: `${org.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${i}`,
      name: org.name,
      type: org.type,
      era: org.era,
      alignment: org.alignment,
      headquarters: "Various locations",
      philosophy: `${org.alignment} side Force teachings and practices`,
      description: `${org.type} dedicated to ${org.alignment} side Force practices`,
      importance: FORCE_ORGANIZATIONS.indexOf(org) < 10 ? "major" : "minor"
    });
  });

  // Generate additional military/political factions
  const additionalFactions = [
    "Galactic Republic", "Galactic Empire", "Rebel Alliance", "New Republic", "First Order", "Resistance",
    "Trade Federation", "Techno Union", "Banking Clan", "Corporate Alliance", "Commerce Guild",
    "Mandalorian Clans", "Hutt Cartel", "Black Sun", "Crimson Dawn", "Pyke Syndicate"
  ];

  additionalFactions.forEach((faction, i) => {
    EXPANDED_UNIVERSE_FACTIONS.push({
      id: `${faction.toLowerCase().replace(/[^a-z0-9]/g, '-')}-add-${i}`,
      name: faction,
      type: faction.includes("Empire") || faction.includes("Republic") ? "Government" : faction.includes("Cartel") || faction.includes("Syndicate") ? "Criminal Organization" : "Military Organization",
      era: "Multiple",
      alignment: "Neutral",
      headquarters: "Various",
      philosophy: "Political/Military objectives",
      description: `Major galactic ${faction.includes("Criminal") ? "criminal" : "political"} organization`,
      importance: "major"
    });
  });

  console.log(`✅ Generated ${EXPANDED_UNIVERSE_FACTIONS.length} factions`);
}

// Main loading function
async function loadComprehensiveExpandedUniverse() {
  try {
    console.log('🚀 Starting comprehensive data generation...');
    await generateComprehensiveData();
    
    console.log('🔗 Connecting to databases...');
    
    // Database connections
    const mongoClient = new MongoClient(process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/swrpg?authSource=admin');
    await mongoClient.connect();

    const neo4jDriver = neo4j.driver(
      process.env.NEO4J_URI || 'bolt://localhost:7687',
      neo4j.auth.basic(process.env.NEO4J_USER || 'neo4j', process.env.NEO4J_PASSWORD || 'password')
    );

    const weaviateClient = weaviate.client({
      scheme: 'http', 
      host: process.env.WEAVIATE_HOST || 'localhost:8080',
    });

    console.log('✅ Database connections established');

    // Load into Neo4j
    console.log('📊 Loading data into Neo4j...');
    const neo4jSession = neo4jDriver.session();

    // Load characters (using MERGE to handle existing data)
    for (const character of EXPANDED_UNIVERSE_CHARACTERS) {
      await neo4jSession.run(`
        MERGE (c:Character {name: $name})
        SET c.id = $id,
            c.species = $species,
            c.homeworld = $homeworld,
            c.era = $era,
            c.force_sensitivity = $force_sensitivity,
            c.affiliation = $affiliation,
            c.rank = $rank,
            c.importance = $importance,
            c.description = $description,
            c.special_abilities = $special_abilities,
            c.personality = $personality,
            c.lightsaber_forms = $lightsaber_forms,
            c.updatedAt = datetime()
      `, character);
      console.log(`✓ Processed character: ${character.name}`);
    }

    // Load locations (using MERGE to handle existing data)
    for (const location of EXPANDED_UNIVERSE_LOCATIONS) {
      await neo4jSession.run(`
        MERGE (l:Location {name: $name})
        SET l.id = $id,
            l.system = $system,
            l.region = $region,
            l.climate = $climate,
            l.terrain = $terrain,
            l.force_nexus = $force_nexus,
            l.significance = $significance,
            l.era = $era,
            l.importance = $importance,
            l.description = $description,
            l.updatedAt = datetime()
      `, location);
      console.log(`✓ Processed location: ${location.name}`);
    }

    // Load factions (using MERGE to handle existing data)
    for (const faction of EXPANDED_UNIVERSE_FACTIONS) {
      await neo4jSession.run(`
        MERGE (f:Faction {name: $name})
        SET f.id = $id,
            f.type = $type,
            f.era = $era,
            f.alignment = $alignment,
            f.headquarters = $headquarters,
            f.philosophy = $philosophy,
            f.description = $description,
            f.importance = $importance,
            f.updatedAt = datetime()
      `, faction);
      console.log(`✓ Processed faction: ${faction.name}`);
    }

    await neo4jSession.close();
    
    // Load into Weaviate
    console.log('🧠 Loading semantic data into Weaviate...');
    
    for (const character of EXPANDED_UNIVERSE_CHARACTERS) {
      await weaviateClient.data.creator()
        .withClassName('WorldKnowledge')
        .withProperties({
          title: character.name,
          content: `${character.description} ${character.personality.join(', ')}. ${character.special_abilities.join(', ')}.`,
          category: 'character',
          entityId: character.id,
          entityType: 'Character',
          era: character.era,
          forceAlignment: character.force_sensitivity
        })
        .do();
    }

    for (const location of EXPANDED_UNIVERSE_LOCATIONS) {
      await weaviateClient.data.creator()
        .withClassName('WorldKnowledge')
        .withProperties({
          title: location.name,
          content: location.description,
          category: 'location',
          entityId: location.id,
          entityType: 'Location',
          era: location.era,
          forceAlignment: location.force_nexus || 'Neutral'
        })
        .do();
    }

    for (const faction of EXPANDED_UNIVERSE_FACTIONS) {
      await weaviateClient.data.creator()
        .withClassName('WorldKnowledge')
        .withProperties({
          title: faction.name,
          content: faction.description,
          category: 'faction',
          entityId: faction.id,
          entityType: 'Faction',
          era: faction.era,
          forceAlignment: faction.alignment
        })
        .do();
    }

    await mongoClient.close();
    await neo4jDriver.close();

    console.log('');
    console.log('🎉 COMPREHENSIVE EXPANDED UNIVERSE DATA LOADING COMPLETE!');
    console.log('========================================================');
    console.log(`📊 Statistics:`);
    console.log(`   • Characters: ${EXPANDED_UNIVERSE_CHARACTERS.length}/150`);
    console.log(`   • Locations: ${EXPANDED_UNIVERSE_LOCATIONS.length}/150`);
    console.log(`   • Factions: ${EXPANDED_UNIVERSE_FACTIONS.length}/75`);
    console.log(`   • Force Users: ${EXPANDED_UNIVERSE_CHARACTERS.filter(c => c.force_sensitivity !== 'None').length}`);
    console.log(`   • Force Nexus Locations: ${EXPANDED_UNIVERSE_LOCATIONS.filter(l => l.force_nexus).length}`);
    console.log(`   • Force Organizations: ${EXPANDED_UNIVERSE_FACTIONS.filter(f => f.alignment !== 'Neutral').length}`);
    console.log('');
    console.log('🌟 The galaxy is now fully populated with Expanded Universe content!');

  } catch (error) {
    console.error('💥 Error loading comprehensive data:', error);
    throw error;
  }
}

if (require.main === module) {
  loadComprehensiveExpandedUniverse()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Failed to load comprehensive data:', error);
      process.exit(1);
    });
}

module.exports = {
  loadComprehensiveExpandedUniverse,
  EXPANDED_UNIVERSE_CHARACTERS,
  EXPANDED_UNIVERSE_LOCATIONS,
  EXPANDED_UNIVERSE_FACTIONS
};