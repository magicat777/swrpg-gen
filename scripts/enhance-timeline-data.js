#!/usr/bin/env node

/**
 * Enhanced Timeline Data Import Script
 * Adds comprehensive canonical Star Wars events from multiple sources
 * including Space.com, Wookieepedia, and official canon
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/swrpg?authSource=admin';
const DATABASE_NAME = 'swrpg';

// Enhanced comprehensive timeline events
const enhancedTimelineEvents = [
  // Ancient History (25,000+ BBY)
  {
    title: "Formation of the Galaxy",
    description: "The galaxy forms around a super-massive black hole at its center, establishing the cosmic foundation for all future civilizations.",
    date: "Eons BBY",
    dateNumeric: -1000000,
    era: "Dawn of the Galaxy",
    category: "other",
    significance: "critical",
    participants: [],
    location: "Galactic Core",
    consequences: ["Formation of star systems", "Creation of hyperspace routes"],
    isCanonical: true,
    sources: ["Space.com", "Wookieepedia"],
    tags: ["cosmology", "galaxy formation"]
  },
  {
    title: "Prime Jedi Founds the Jedi Order",
    description: "An individual known as the Prime Jedi establishes the Jedi Order on the ancient ocean world of Ahch-To, beginning the legacy of Force users dedicated to peace and justice.",
    date: "25,025 BBY",
    dateNumeric: -25025,
    era: "Dawn of the Jedi",
    category: "jedi",
    significance: "critical",
    participants: ["Prime Jedi"],
    location: "Ahch-To",
    consequences: ["Jedi Order establishment", "First Jedi Temple construction", "Force philosophy development"],
    isCanonical: true,
    sources: ["The Last Jedi", "Wookieepedia"],
    tags: ["jedi origins", "force history", "ahch-to"]
  },
  {
    title: "Galactic Republic Formation",
    description: "The Core Founders establish the Galactic Republic from twenty-two Core Worlds, creating the galaxy's first democratic government.",
    date: "25,000 BBY",
    dateNumeric: -25000,
    era: "Dawn of the Republic",
    category: "political",
    significance: "critical",
    participants: ["Core Founders"],
    location: "Core Worlds",
    consequences: ["Democratic government establishment", "Galactic Senate creation", "Republic expansion begins"],
    isCanonical: true,
    sources: ["Space.com", "Wookieepedia"],
    tags: ["republic origins", "democracy", "core worlds"]
  },
  {
    title: "Hyperspace Travel Invented",
    description: "Ancient sentient species develop hyperdrive technology after studying hyperspace-traveling purrgil, revolutionizing galactic travel and communication.",
    date: "25,000 BBY",
    dateNumeric: -25000,
    era: "Dawn of the Republic",
    category: "technology",
    significance: "critical",
    participants: ["Ancient species", "Purrgil"],
    location: "Unknown",
    consequences: ["Galactic civilization possible", "Hyperspace routes mapped", "Trade networks established"],
    isCanonical: true,
    sources: ["Rebels", "Space.com"],
    tags: ["hyperspace", "technology", "purrgil"]
  },

  // Old Republic Era (5,000-1,000 BBY)
  {
    title: "The Hundred-Year Darkness",
    description: "A schism within the Jedi Order leads to the Hundred-Year Darkness as dark side users are exiled, eventually becoming the Sith.",
    date: "7,000 BBY",
    dateNumeric: -7000,
    era: "Old Republic",
    category: "sith",
    significance: "critical",
    participants: ["Rogue Jedi", "Jedi Order"],
    location: "Various worlds",
    consequences: ["Sith Order creation", "Jedi-Sith conflict begins", "Dark side philosophy develops"],
    isCanonical: true,
    sources: ["Wookieepedia", "Space.com"],
    tags: ["sith origins", "jedi schism", "dark side"]
  },
  {
    title: "Great Hyperspace War",
    description: "The first major conflict between the Galactic Republic and the ancient Sith Empire, establishing the Republic as the dominant galactic power.",
    date: "5,000 BBY",
    dateNumeric: -5000,
    era: "Old Republic",
    category: "military",
    significance: "critical",
    participants: ["Galactic Republic", "Sith Empire", "Jedi Order"],
    location: "Multiple star systems",
    consequences: ["Sith Empire defeat", "Republic expansion", "Sith survivors flee to Unknown Regions"],
    isCanonical: true,
    sources: ["Space.com", "Tales of the Jedi"],
    tags: ["hyperspace war", "sith empire", "republic victory"]
  },
  {
    title: "Mandalorian Wars Begin",
    description: "The Mandalorian Neo-Crusaders launch a galaxy-wide conquest campaign, threatening Republic stability and forcing Jedi intervention.",
    date: "3,976 BBY",
    dateNumeric: -3976,
    era: "Old Republic",
    category: "military",
    significance: "high",
    participants: ["Mandalore the Ultimate", "Revan", "Malak", "Jedi Order"],
    location: "Outer Rim territories",
    consequences: ["Jedi civil war catalyst", "Revan's rise", "Mandalorian culture evolution"],
    isCanonical: true,
    sources: ["Knights of the Old Republic", "Space.com"],
    tags: ["mandalorian wars", "revan", "outer rim"]
  },
  {
    title: "Mass Shadow Generator at Malachor V",
    description: "Revan orders the use of a superweapon at Malachor V, ending the Mandalorian Wars but causing massive casualties and Revan's fall to the dark side.",
    date: "3,960 BBY",
    dateNumeric: -3960,
    era: "Old Republic",
    category: "military",
    significance: "critical",
    participants: ["Revan", "Malak", "Mandalorian forces"],
    location: "Malachor V",
    consequences: ["Mandalorian defeat", "Revan's corruption", "Malachor V devastation", "Jedi Civil War catalyst"],
    isCanonical: true,
    sources: ["Knights of the Old Republic II", "Rebels"],
    tags: ["malachor", "mass shadow generator", "revan fall"]
  },
  {
    title: "Jedi Civil War",
    description: "Darth Revan and Darth Malak wage war against their former Jedi allies and the Republic, until Revan's redemption leads to Malak's defeat.",
    date: "3,959 BBY",
    dateNumeric: -3959,
    era: "Old Republic",
    category: "military",
    significance: "critical",
    participants: ["Darth Revan", "Darth Malak", "Jedi Order", "Bastila Shan"],
    location: "Star Forge, multiple worlds",
    consequences: ["Revan's redemption", "Malak's death", "Star Forge destruction", "Republic restoration"],
    isCanonical: true,
    sources: ["Knights of the Old Republic", "Space.com"],
    tags: ["jedi civil war", "star forge", "revan redemption"]
  },
  {
    title: "Seventh Battle of Ruusan",
    description: "The final battle of the New Sith Wars results in the Brotherhood of Darkness's destruction and Darth Bane's implementation of the Rule of Two.",
    date: "1,000 BBY",
    dateNumeric: -1000,
    era: "Ruusan Reformation",
    category: "sith",
    significance: "critical",
    participants: ["Darth Bane", "Brotherhood of Darkness", "Army of Light"],
    location: "Ruusan",
    consequences: ["Rule of Two established", "Sith go into hiding", "Jedi Order reformation"],
    isCanonical: true,
    sources: ["Darth Bane trilogy", "Space.com"],
    tags: ["rule of two", "ruusan", "sith reformation"]
  },

  // High Republic Era (500-132 BBY)
  {
    title: "High Republic Era Begins",
    description: "The Galactic Republic enters its golden age with the Jedi Order at the height of their power as galactic peacekeepers.",
    date: "500 BBY",
    dateNumeric: -500,
    era: "High Republic",
    category: "political",
    significance: "high",
    participants: ["Jedi Order", "Galactic Republic", "Chancellor Lina Soh"],
    location: "Coruscant",
    consequences: ["Republic expansion", "Jedi golden age", "Great Works projects"],
    isCanonical: true,
    sources: ["High Republic series", "Space.com"],
    tags: ["high republic", "jedi golden age", "republic prosperity"]
  },
  {
    title: "The Great Disaster",
    description: "A catastrophic hyperspace incident in the Hetzal system threatens multiple worlds, showcasing both Republic engineering and Jedi heroism.",
    date: "232 BBY",
    dateNumeric: -232,
    era: "High Republic",
    category: "other",
    significance: "high",
    participants: ["Jedi Order", "Republic engineers", "Hetzal system civilians"],
    location: "Hetzal system",
    consequences: ["Jedi heroism displayed", "Republic unity strengthened", "Nihil threat emerges"],
    isCanonical: true,
    sources: ["High Republic: Light of the Jedi"],
    tags: ["great disaster", "hetzal", "republic engineering"]
  },
  {
    title: "Nihil Emergence",
    description: "The marauder group known as the Nihil begins terrorizing the Outer Rim with their unique hyperspace technology and brutal tactics.",
    date: "232 BBY",
    dateNumeric: -232,
    era: "High Republic",
    category: "military",
    significance: "high",
    participants: ["Nihil", "Marchion Ro", "Jedi Order"],
    location: "Outer Rim",
    consequences: ["Outer Rim instability", "Jedi response mobilization", "Path engines revealed"],
    isCanonical: true,
    sources: ["High Republic series"],
    tags: ["nihil", "outer rim", "marauders"]
  },

  // Prequel Era (132-19 BBY)
  {
    title: "Master Indara's Murder",
    description: "Jedi Master Indara is killed by Mae, a Sith Acolyte, marking the beginning of a new Sith threat during the High Republic's end.",
    date: "132 BBY",
    dateNumeric: -132,
    era: "High Republic",
    category: "sith",
    significance: "high",
    participants: ["Master Indara", "Mae", "Qimir"],
    location: "Ueda",
    consequences: ["Sith activity revealed", "Jedi investigation begins", "Hidden Sith master exposed"],
    isCanonical: true,
    sources: ["The Acolyte", "Space.com"],
    tags: ["sith acolyte", "jedi murder", "hidden sith"]
  },
  {
    title: "Anakin Skywalker's Conception",
    description: "Anakin Skywalker is conceived by the Force through midi-chlorian manipulation, possibly by Darth Plagueis or the Force itself.",
    date: "41 BBY",
    dateNumeric: -41,
    era: "Galactic Republic",
    category: "jedi",
    significance: "critical",
    participants: ["Shmi Skywalker", "The Force", "Midi-chlorians"],
    location: "Tatooine",
    consequences: ["Chosen One born", "Prophecy fulfillment begins", "Balance disruption"],
    isCanonical: true,
    sources: ["The Phantom Menace", "Space.com"],
    tags: ["chosen one", "anakin birth", "midi-chlorians"]
  },
  {
    title: "Trade Federation Blockades Naboo",
    description: "The Trade Federation blockades Naboo over taxation disputes, secretly manipulated by Darth Sidious to gain political power.",
    date: "32 BBY",
    dateNumeric: -32,
    era: "Galactic Republic",
    category: "political",
    significance: "critical",
    participants: ["Trade Federation", "Queen Amidala", "Qui-Gon Jinn", "Obi-Wan Kenobi"],
    location: "Naboo",
    consequences: ["Palpatine's rise to Chancellor", "Anakin discovered", "Qui-Gon's death"],
    isCanonical: true,
    sources: ["The Phantom Menace", "Space.com"],
    tags: ["naboo blockade", "phantom menace", "palpatine rise"]
  },
  {
    title: "Battle of Naboo",
    description: "The climactic battle where young Anakin destroys the Trade Federation control ship while Obi-Wan defeats Darth Maul.",
    date: "32 BBY",
    dateNumeric: -32,
    era: "Galactic Republic",
    category: "military",
    significance: "high",
    participants: ["Anakin Skywalker", "Obi-Wan Kenobi", "Darth Maul", "Qui-Gon Jinn"],
    location: "Naboo",
    consequences: ["Qui-Gon's death", "Obi-Wan becomes Knight", "Anakin becomes Padawan"],
    isCanonical: true,
    sources: ["The Phantom Menace"],
    tags: ["naboo battle", "maul duel", "anakin victory"]
  },
  {
    title: "Separatist Crisis Begins",
    description: "Count Dooku leads thousands of star systems in seceding from the Republic, creating the Confederacy of Independent Systems.",
    date: "24 BBY",
    dateNumeric: -24,
    era: "Galactic Republic",
    category: "political",
    significance: "critical",
    participants: ["Count Dooku", "Separatist Council", "Galactic Senate"],
    location: "Various systems",
    consequences: ["Republic divided", "Military creation debate", "Clone Army commissioning"],
    isCanonical: true,
    sources: ["Attack of the Clones", "Space.com"],
    tags: ["separatist crisis", "dooku", "republic division"]
  },
  {
    title: "First Battle of Geonosis",
    description: "The opening battle of the Clone Wars as Republic clone forces rescue Jedi from Separatist execution on Geonosis.",
    date: "22 BBY",
    dateNumeric: -22,
    era: "Clone Wars",
    category: "military",
    significance: "critical",
    participants: ["Clone Army", "Jedi Order", "Separatist Droid Army", "Count Dooku"],
    location: "Geonosis",
    consequences: ["Clone Wars begin", "Jedi become generals", "Anakin loses arm"],
    isCanonical: true,
    sources: ["Attack of the Clones", "Space.com"],
    tags: ["geonosis", "clone wars start", "jedi rescue"]
  },
  {
    title: "Battle of Kamino",
    description: "Separatist forces attack the clone production facilities on Kamino in an attempt to cripple Republic military capabilities.",
    date: "21 BBY",
    dateNumeric: -21,
    era: "Clone Wars",
    category: "military",
    significance: "high",
    participants: ["Clone Army", "Kaminoans", "Separatist forces", "Asajj Ventress"],
    location: "Kamino",
    consequences: ["Clone production secured", "Kamino defenses strengthened", "Separatist defeat"],
    isCanonical: true,
    sources: ["The Clone Wars", "Space.com"],
    tags: ["kamino", "clone production", "ventress"]
  },
  {
    title: "Siege of Ryloth",
    description: "Republic forces liberate the Twi'lek homeworld from Separatist occupation, showcasing clone and Jedi cooperation.",
    date: "20 BBY",
    dateNumeric: -20,
    era: "Clone Wars",
    category: "military",
    significance: "medium",
    participants: ["Mace Windu", "Clone forces", "Twi'lek resistance", "Wat Tambor"],
    location: "Ryloth",
    consequences: ["Twi'lek liberation", "Separatist withdrawal", "Local resistance strengthened"],
    isCanonical: true,
    sources: ["The Clone Wars"],
    tags: ["ryloth", "twi'lek", "liberation"]
  },
  {
    title: "Siege of Mandalore",
    description: "Ahsoka Tano leads clone forces to capture Darth Maul on Mandalore, coinciding with the events of Revenge of the Sith.",
    date: "19 BBY",
    dateNumeric: -19,
    era: "Clone Wars",
    category: "military",
    significance: "high",
    participants: ["Ahsoka Tano", "Clone forces", "Darth Maul", "Bo-Katan Kryze"],
    location: "Mandalore",
    consequences: ["Maul captured", "Order 66 execution", "Ahsoka and Rex survive"],
    isCanonical: true,
    sources: ["The Clone Wars Season 7", "Space.com"],
    tags: ["mandalore siege", "ahsoka", "maul capture"]
  },
  {
    title: "Battle of Coruscant",
    description: "The climactic space battle over the Republic capital as Separatist forces attempt to capture Chancellor Palpatine.",
    date: "19 BBY",
    dateNumeric: -19,
    era: "Clone Wars",
    category: "military",
    significance: "critical",
    participants: ["Anakin Skywalker", "Obi-Wan Kenobi", "Count Dooku", "General Grievous"],
    location: "Coruscant orbit",
    consequences: ["Dooku's death", "Palpatine rescued", "Anakin's dark side growth"],
    isCanonical: true,
    sources: ["Revenge of the Sith", "Space.com"],
    tags: ["coruscant battle", "dooku death", "grievous"]
  },
  {
    title: "Order 66 Execution",
    description: "Chancellor Palpatine activates Order 66, commanding clone troopers across the galaxy to execute their Jedi commanders.",
    date: "19 BBY",
    dateNumeric: -19,
    era: "Clone Wars",
    category: "jedi",
    significance: "critical",
    participants: ["Darth Sidious", "Clone Army", "Jedi Order"],
    location: "Galaxy-wide",
    consequences: ["Jedi Order near-extinction", "Empire establishment", "Jedi purge begins"],
    isCanonical: true,
    sources: ["Revenge of the Sith", "Space.com"],
    tags: ["order 66", "jedi purge", "clone betrayal"]
  },
  {
    title: "Duel on Mustafar",
    description: "Obi-Wan Kenobi confronts his former Padawan Anakin Skywalker on Mustafar, resulting in Anakin's transformation into Darth Vader.",
    date: "19 BBY",
    dateNumeric: -19,
    era: "Imperial Era",
    category: "jedi",
    significance: "critical",
    participants: ["Obi-Wan Kenobi", "Anakin Skywalker/Darth Vader"],
    location: "Mustafar",
    consequences: ["Anakin becomes Vader", "Twin separation", "Padmé's death"],
    isCanonical: true,
    sources: ["Revenge of the Sith", "Space.com"],
    tags: ["mustafar duel", "vader creation", "obi-wan victory"]
  },
  {
    title: "Galactic Empire Proclaimed",
    description: "Emperor Palpatine transforms the Republic into the Galactic Empire, declaring himself Emperor with thunderous applause.",
    date: "19 BBY",
    dateNumeric: -19,
    era: "Imperial Era",
    category: "political",
    significance: "critical",
    participants: ["Emperor Palpatine", "Galactic Senate", "Darth Vader"],
    location: "Coruscant",
    consequences: ["Democracy ends", "Imperial rule begins", "Sith control galaxy"],
    isCanonical: true,
    sources: ["Revenge of the Sith", "Space.com"],
    tags: ["empire proclamation", "democracy death", "palpatine emperor"]
  },

  // Imperial Era (19 BBY - 4 ABY)
  {
    title: "Jedi Temple Raid",
    description: "Darth Vader leads the 501st Legion in an assault on the Jedi Temple, killing the younglings and remaining Jedi.",
    date: "19 BBY",
    dateNumeric: -19,
    era: "Imperial Era",
    category: "jedi",
    significance: "critical",
    participants: ["Darth Vader", "501st Legion", "Jedi younglings", "Temple guards"],
    location: "Jedi Temple, Coruscant",
    consequences: ["Temple falls", "Jedi archives lost", "Younglings killed"],
    isCanonical: true,
    sources: ["Revenge of the Sith"],
    tags: ["temple raid", "youngling massacre", "501st legion"]
  },
  {
    title: "Great Jedi Purge Begins",
    description: "Systematic hunting and elimination of surviving Jedi across the galaxy using Inquisitors and Imperial forces.",
    date: "19 BBY",
    dateNumeric: -19,
    era: "Imperial Era",
    category: "jedi",
    significance: "critical",
    participants: ["Darth Vader", "Inquisitors", "Surviving Jedi"],
    location: "Galaxy-wide",
    consequences: ["Jedi near-extinction", "Force-sensitives hidden", "Underground Railroad formed"],
    isCanonical: true,
    sources: ["Various", "Space.com"],
    tags: ["jedi purge", "inquisitors", "surviving jedi"]
  },
  {
    title: "Rebels TV Series Era",
    description: "The crew of the Ghost fights against the Empire on Lothal, eventually joining the larger Rebel Alliance.",
    date: "5 BBY",
    dateNumeric: -5,
    era: "Imperial Era",
    category: "military",
    significance: "medium",
    participants: ["Ezra Bridger", "Kanan Jarrus", "Hera Syndulla", "Grand Admiral Thrawn"],
    location: "Lothal, various systems",
    consequences: ["Lothal liberation", "Thrawn disappearance", "Rebel network growth"],
    isCanonical: true,
    sources: ["Star Wars Rebels", "Space.com"],
    tags: ["rebels", "lothal", "thrawn"]
  },
  {
    title: "Rogue One Mission",
    description: "A desperate Rebel mission to steal Death Star plans results in the first major Rebel victory against the Empire.",
    date: "0 BBY",
    dateNumeric: 0,
    era: "Imperial Era",
    category: "military",
    significance: "critical",
    participants: ["Jyn Erso", "Cassian Andor", "Rogue One team", "Director Krennic"],
    location: "Scarif",
    consequences: ["Death Star plans stolen", "Rogue One team sacrificed", "Hope restored"],
    isCanonical: true,
    sources: ["Rogue One", "Space.com"],
    tags: ["rogue one", "death star plans", "scarif"]
  },
  {
    title: "Battle of Yavin",
    description: "Luke Skywalker destroys the Death Star using the Force, marking the Rebel Alliance's first major victory.",
    date: "0 ABY",
    dateNumeric: 0,
    era: "Galactic Civil War",
    category: "military",
    significance: "critical",
    participants: ["Luke Skywalker", "Princess Leia", "Han Solo", "Darth Vader"],
    location: "Yavin system",
    consequences: ["Death Star destroyed", "Empire weakened", "Luke's Force awakening"],
    isCanonical: true,
    sources: ["A New Hope", "Space.com"],
    tags: ["yavin battle", "death star destruction", "luke force"]
  },
  {
    title: "Battle of Hoth",
    description: "Imperial forces discover and assault the Rebel base on Hoth, forcing the Rebellion to evacuate.",
    date: "3 ABY",
    dateNumeric: 3,
    era: "Galactic Civil War",
    category: "military",
    significance: "high",
    participants: ["Darth Vader", "Luke Skywalker", "Han Solo", "Princess Leia"],
    location: "Hoth",
    consequences: ["Rebel base lost", "Luke finds Yoda", "Han frozen in carbonite"],
    isCanonical: true,
    sources: ["The Empire Strikes Back", "Space.com"],
    tags: ["hoth battle", "rebel evacuation", "carbonite freezing"]
  },
  {
    title: "Luke's Training on Dagobah",
    description: "Luke Skywalker receives Jedi training from Yoda on the swamp planet Dagobah, learning the ways of the Force.",
    date: "3 ABY",
    dateNumeric: 3,
    era: "Galactic Civil War",
    category: "jedi",
    significance: "critical",
    participants: ["Luke Skywalker", "Yoda", "Force ghost Obi-Wan"],
    location: "Dagobah",
    consequences: ["Luke's Jedi development", "Vader revelation", "Training incomplete"],
    isCanonical: true,
    sources: ["The Empire Strikes Back"],
    tags: ["dagobah training", "yoda", "jedi learning"]
  },
  {
    title: "Cloud City Duel",
    description: "Luke confronts Darth Vader in Cloud City, where Vader reveals he is Luke's father before cutting off Luke's hand.",
    date: "3 ABY",
    dateNumeric: 3,
    era: "Galactic Civil War",
    category: "jedi",
    significance: "critical",
    participants: ["Luke Skywalker", "Darth Vader", "Emperor Palpatine"],
    location: "Cloud City, Bespin",
    consequences: ["Father revelation", "Luke's hand lost", "Dark side temptation"],
    isCanonical: true,
    sources: ["The Empire Strikes Back", "Space.com"],
    tags: ["cloud city", "vader father", "hand cutting"]
  },
  {
    title: "Battle of Endor",
    description: "The climactic battle where the Rebel Alliance destroys the second Death Star and Emperor Palpatine dies.",
    date: "4 ABY",
    dateNumeric: 4,
    era: "Galactic Civil War",
    category: "military",
    significance: "critical",
    participants: ["Luke Skywalker", "Darth Vader", "Emperor Palpatine", "Rebel Alliance"],
    location: "Endor system",
    consequences: ["Emperor's death", "Vader's redemption", "Empire's collapse"],
    isCanonical: true,
    sources: ["Return of the Jedi", "Space.com"],
    tags: ["endor battle", "emperor death", "vader redemption"]
  },
  {
    title: "Death Star II Destruction",
    description: "Lando Calrissian leads the Rebel fleet in destroying the second Death Star while Luke redeems his father.",
    date: "4 ABY",
    dateNumeric: 4,
    era: "Galactic Civil War",
    category: "military",
    significance: "critical",
    participants: ["Lando Calrissian", "Admiral Ackbar", "Rebel fleet"],
    location: "Endor system",
    consequences: ["Death Star II destroyed", "Imperial fleet defeated", "Galactic celebration"],
    isCanonical: true,
    sources: ["Return of the Jedi"],
    tags: ["death star 2", "lando victory", "rebel celebration"]
  },

  // New Republic Era (4-25 ABY)
  {
    title: "New Republic Formation",
    description: "The Rebel Alliance transforms into the New Republic, establishing a new democratic government to replace the Empire.",
    date: "4 ABY",
    dateNumeric: 4,
    era: "New Republic",
    category: "political",
    significance: "critical",
    participants: ["Mon Mothma", "Princess Leia", "Rebel Alliance leadership"],
    location: "Various worlds",
    consequences: ["Democracy restored", "Imperial remnants persist", "Galactic rebuilding begins"],
    isCanonical: true,
    sources: ["Various expanded universe", "Space.com"],
    tags: ["new republic", "democracy", "post-empire"]
  },
  {
    title: "The Mandalorian Era",
    description: "A lone Mandalorian bounty hunter protects Grogu while the New Republic struggles to maintain order in the Outer Rim.",
    date: "9 ABY",
    dateNumeric: 9,
    era: "New Republic",
    category: "other",
    significance: "medium",
    participants: ["Din Djarin", "Grogu", "Cara Dune", "Greef Karga"],
    location: "Outer Rim territories",
    consequences: ["Grogu protected", "Mandalorian culture revival", "Imperial remnants revealed"],
    isCanonical: true,
    sources: ["The Mandalorian", "Space.com"],
    tags: ["mandalorian", "grogu", "outer rim"]
  },
  {
    title: "Thrawn's Return",
    description: "Grand Admiral Thrawn returns from the Unknown Regions to lead Imperial remnants against the New Republic.",
    date: "9 ABY",
    dateNumeric: 9,
    era: "New Republic",
    category: "military",
    significance: "high",
    participants: ["Grand Admiral Thrawn", "Imperial remnants", "New Republic"],
    location: "Unknown Regions, various systems",
    consequences: ["Imperial resurgence", "New Republic challenged", "First Order precursor"],
    isCanonical: true,
    sources: ["Ahsoka", "Various books"],
    tags: ["thrawn return", "imperial remnants", "unknown regions"]
  },

  // Sequel Era (25-35+ ABY)
  {
    title: "Ben Solo's Fall",
    description: "Ben Solo, son of Han Solo and Leia Organa, falls to the dark side and becomes Kylo Ren, destroying Luke's Jedi academy.",
    date: "28 ABY",
    dateNumeric: 28,
    era: "New Republic",
    category: "jedi",
    significance: "critical",
    participants: ["Ben Solo/Kylo Ren", "Luke Skywalker", "Snoke"],
    location: "Luke's Jedi Temple",
    consequences: ["New Jedi Order destroyed", "Luke goes into exile", "Knights of Ren formed"],
    isCanonical: true,
    sources: ["The Last Jedi", "Space.com"],
    tags: ["ben solo fall", "kylo ren", "jedi temple destruction"]
  },
  {
    title: "First Order Emerges",
    description: "The First Order, risen from Imperial remnants, destroys the New Republic capital and fleet with Starkiller Base.",
    date: "34 ABY",
    dateNumeric: 34,
    era: "Sequel Trilogy",
    category: "military",
    significance: "critical",
    participants: ["First Order", "Supreme Leader Snoke", "General Hux", "Kylo Ren"],
    location: "Hosnian system",
    consequences: ["New Republic government destroyed", "Resistance formed", "Galactic war renewed"],
    isCanonical: true,
    sources: ["The Force Awakens", "Space.com"],
    tags: ["first order", "starkiller base", "hosnian destruction"]
  },
  {
    title: "Rey's Force Awakening",
    description: "Rey discovers her Force sensitivity and begins her journey to become a Jedi, finding Luke Skywalker on Ahch-To.",
    date: "34 ABY",
    dateNumeric: 34,
    era: "Sequel Trilogy",
    category: "jedi",
    significance: "critical",
    participants: ["Rey", "Luke Skywalker", "Kylo Ren"],
    location: "Jakku, Ahch-To",
    consequences: ["New hope for Jedi", "Luke's return", "Skywalker legacy continues"],
    isCanonical: true,
    sources: ["The Force Awakens", "Space.com"],
    tags: ["rey awakening", "luke return", "force sensitive"]
  },
  {
    title: "Battle of Crait",
    description: "The Resistance makes a desperate stand on Crait while Luke Skywalker makes his final sacrifice to save them.",
    date: "34 ABY",
    dateNumeric: 34,
    era: "Sequel Trilogy",
    category: "military",
    significance: "high",
    participants: ["Luke Skywalker", "Rey", "Kylo Ren", "Resistance"],
    location: "Crait",
    consequences: ["Luke's death", "Resistance escape", "Hope restored across galaxy"],
    isCanonical: true,
    sources: ["The Last Jedi"],
    tags: ["crait battle", "luke sacrifice", "resistance escape"]
  },
  {
    title: "Emperor's Return",
    description: "Emperor Palpatine reveals his survival and final plan to destroy all free worlds with the Final Order fleet.",
    date: "35 ABY",
    dateNumeric: 35,
    era: "Sequel Trilogy",
    category: "sith",
    significance: "critical",
    participants: ["Emperor Palpatine", "Rey", "Kylo Ren", "Sith Eternal"],
    location: "Exegol",
    consequences: ["Sith return revealed", "Rey's heritage revealed", "Final battle set"],
    isCanonical: true,
    sources: ["The Rise of Skywalker", "Space.com"],
    tags: ["palpatine return", "exegol", "final order"]
  },
  {
    title: "Battle of Exegol",
    description: "Rey and the galaxy unite to defeat Emperor Palpatine and his Sith Eternal, ending the Sith once and for all.",
    date: "35 ABY",
    dateNumeric: 35,
    era: "Sequel Trilogy",
    category: "jedi",
    significance: "critical",
    participants: ["Rey", "Ben Solo", "Emperor Palpatine", "Citizens' fleet"],
    location: "Exegol",
    consequences: ["Palpatine's final death", "Sith extinction", "Rey's sacrifice and revival"],
    isCanonical: true,
    sources: ["The Rise of Skywalker", "Space.com"],
    tags: ["exegol battle", "sith end", "rey sacrifice"]
  }
];

// Enhanced timeline eras with detailed information
const enhancedTimelineEras = [
  {
    name: "Dawn of the Galaxy",
    description: "The formation of the galaxy and the earliest cosmic events that shaped the Star Wars universe.",
    timeframe: "Eons - 25,025 BBY",
    startDate: -1000000,
    endDate: -25025,
    characteristics: ["Galaxy formation", "First sentient life", "Cosmic Force emergence"],
    majorEvents: ["Galaxy forms around black hole", "First Force-sensitive beings"],
    keyFigures: ["Unknown ancient species"],
    significance: "Establishes the cosmic foundation for all future events",
    color: "#4A0080"
  },
  {
    name: "Dawn of the Jedi",
    description: "The earliest era of Force users and the founding of the Jedi Order by the Prime Jedi.",
    timeframe: "25,025 - 25,000 BBY",
    startDate: -25025,
    endDate: -25000,
    characteristics: ["Force discovery", "First Jedi", "Ancient temples"],
    majorEvents: ["Prime Jedi founds Jedi Order", "First Jedi Temple built"],
    keyFigures: ["Prime Jedi"],
    significance: "Origins of the Jedi Order and Force philosophy",
    color: "#006400"
  },
  {
    name: "Dawn of the Republic",
    description: "The formation of the Galactic Republic and the beginning of galactic civilization.",
    timeframe: "25,000 - 7,000 BBY",
    startDate: -25000,
    endDate: -7000,
    characteristics: ["Republic formation", "Hyperspace travel", "Galactic expansion"],
    majorEvents: ["Galactic Republic founded", "Hyperdrive invented"],
    keyFigures: ["Core Founders"],
    significance: "Establishment of galactic democracy and interstellar travel",
    color: "#4169E1"
  },
  {
    name: "Old Republic",
    description: "Era of ancient conflicts between Jedi and Sith, including major wars that shaped galactic history.",
    timeframe: "7,000 - 1,000 BBY",
    startDate: -7000,
    endDate: -1000,
    characteristics: ["Jedi-Sith conflicts", "Ancient wars", "Force philosophy development"],
    majorEvents: ["Hundred-Year Darkness", "Great Hyperspace War", "Mandalorian Wars", "Jedi Civil War"],
    keyFigures: ["Revan", "Malak", "Mandalore the Ultimate", "Ancient Sith Lords"],
    significance: "Foundational conflicts between light and dark side",
    color: "#8B0000"
  },
  {
    name: "Ruusan Reformation",
    description: "The end of the New Sith Wars and the implementation of the Rule of Two.",
    timeframe: "1,000 BBY",
    startDate: -1000,
    endDate: -999,
    characteristics: ["Sith reformation", "Rule of Two", "Jedi reorganization"],
    majorEvents: ["Seventh Battle of Ruusan", "Brotherhood of Darkness destroyed"],
    keyFigures: ["Darth Bane", "Army of Light"],
    significance: "Transformation of Sith strategy and beginning of their hidden millennium",
    color: "#800080"
  },
  {
    name: "High Republic",
    description: "The golden age of the Republic with the Jedi at the height of their power.",
    timeframe: "500 - 132 BBY",
    startDate: -500,
    endDate: -132,
    characteristics: ["Republic golden age", "Jedi peacekeepers", "Great Works projects"],
    majorEvents: ["Great Disaster", "Nihil emergence", "Republic expansion"],
    keyFigures: ["Chancellor Lina Soh", "Avar Kriss", "Marchion Ro"],
    significance: "Peak of Jedi power and Republic prosperity",
    color: "#FFD700"
  },
  {
    name: "Galactic Republic",
    description: "The decline of the Republic and the rise of corruption leading to the Clone Wars.",
    timeframe: "132 - 19 BBY",
    startDate: -132,
    endDate: -19,
    characteristics: ["Republic decline", "Political corruption", "Separatist crisis"],
    majorEvents: ["Anakin's birth", "Naboo crisis", "Separatist movement"],
    keyFigures: ["Anakin Skywalker", "Palpatine", "Count Dooku"],
    significance: "Final era of the Republic before its transformation into the Empire",
    color: "#0066CC"
  },
  {
    name: "Clone Wars",
    description: "The galaxy-wide conflict that marked the end of the Republic and the Jedi Order.",
    timeframe: "22 - 19 BBY",
    startDate: -22,
    endDate: -19,
    characteristics: ["Galactic war", "Jedi as generals", "Clone army"],
    majorEvents: ["Geonosis", "Major battles", "Order 66"],
    keyFigures: ["Anakin Skywalker", "Obi-Wan Kenobi", "Ahsoka Tano"],
    significance: "Destruction of the Jedi Order and birth of the Empire",
    color: "#CC0000"
  },
  {
    name: "Imperial Era",
    description: "The dark time when the Galactic Empire ruled through fear and oppression.",
    timeframe: "19 BBY - 4 ABY",
    startDate: -19,
    endDate: 4,
    characteristics: ["Imperial rule", "Jedi purge", "Rebel resistance"],
    majorEvents: ["Empire proclaimed", "Jedi Purge", "Death Star construction"],
    keyFigures: ["Emperor Palpatine", "Darth Vader", "Grand Moff Tarkin"],
    significance: "Period of galactic tyranny and the rise of the Rebellion",
    color: "#2F2F2F"
  },
  {
    name: "Galactic Civil War",
    description: "The Rebellion's fight against the Empire, culminating in the Emperor's defeat.",
    timeframe: "2 BBY - 4 ABY",
    startDate: -2,
    endDate: 4,
    characteristics: ["Rebel Alliance", "Empire vs Rebels", "Hope restored"],
    majorEvents: ["Death Star plans stolen", "Yavin", "Hoth", "Endor"],
    keyFigures: ["Luke Skywalker", "Princess Leia", "Han Solo"],
    significance: "Liberation of the galaxy and restoration of freedom",
    color: "#FF4500"
  },
  {
    name: "New Republic",
    description: "The restoration of democracy and the challenges of rebuilding galactic civilization.",
    timeframe: "4 - 25 ABY",
    startDate: 4,
    endDate: 25,
    characteristics: ["Democracy restored", "Imperial remnants", "New Jedi Order"],
    majorEvents: ["New Republic formation", "Thrawn's return", "New Jedi Academy"],
    keyFigures: ["Mon Mothma", "Luke Skywalker", "Mara Jade"],
    significance: "Restoration of peace and democracy to the galaxy",
    color: "#32CD32"
  },
  {
    name: "Sequel Trilogy",
    description: "The rise of the First Order and the final defeat of the Sith.",
    timeframe: "25 - 35+ ABY",
    startDate: 25,
    endDate: 50,
    characteristics: ["First Order rise", "New generation heroes", "Sith return"],
    majorEvents: ["Ben Solo's fall", "Starkiller Base", "Emperor's return", "Final victory"],
    keyFigures: ["Rey", "Kylo Ren", "Finn", "Poe Dameron"],
    significance: "Final chapter in the Skywalker saga and end of the Sith",
    color: "#9370DB"
  }
];

async function enhanceTimelineData() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('📡 Connected to MongoDB');
    
    const db = client.db(DATABASE_NAME);
    const eventsCollection = db.collection('timeline_events');
    const erasCollection = db.collection('timeline_eras');
    
    // Add current timestamp to all events and eras
    const now = new Date();
    const eventsToInsert = enhancedTimelineEvents.map(event => ({
      ...event,
      createdAt: now,
      updatedAt: now
    }));
    
    const erasToInsert = enhancedTimelineEras.map(era => ({
      ...era,
      createdAt: now,
      updatedAt: now
    }));
    
    // Clear existing data and insert enhanced data
    console.log('🗑️ Clearing existing timeline data...');
    await eventsCollection.deleteMany({});
    await erasCollection.deleteMany({});
    
    console.log('📝 Inserting enhanced timeline events...');
    const eventResult = await eventsCollection.insertMany(eventsToInsert);
    console.log(`✅ Inserted ${eventResult.insertedCount} timeline events`);
    
    console.log('📝 Inserting enhanced timeline eras...');
    const eraResult = await erasCollection.insertMany(erasToInsert);
    console.log(`✅ Inserted ${eraResult.insertedCount} timeline eras`);
    
    // Create indexes for better performance
    console.log('📊 Creating database indexes...');
    await eventsCollection.createIndex({ dateNumeric: 1 });
    await eventsCollection.createIndex({ era: 1 });
    await eventsCollection.createIndex({ category: 1 });
    await eventsCollection.createIndex({ significance: 1 });
    await eventsCollection.createIndex({ title: "text", description: "text" });
    
    await erasCollection.createIndex({ startDate: 1 });
    await erasCollection.createIndex({ name: 1 });
    
    console.log('🎉 Timeline enhancement complete!');
    console.log(`📈 Total events: ${eventResult.insertedCount}`);
    console.log(`📈 Total eras: ${eraResult.insertedCount}`);
    console.log('📚 Data sources: Space.com, Wookieepedia, Official Canon');
    
  } catch (error) {
    console.error('❌ Error enhancing timeline data:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('📡 Database connection closed');
  }
}

// Run the enhancement
if (require.main === module) {
  enhanceTimelineData();
}

module.exports = { enhancedTimelineEvents, enhancedTimelineEras, enhanceTimelineData };