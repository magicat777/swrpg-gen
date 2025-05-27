#!/usr/bin/env node

/**
 * Load comprehensive sample data into Weaviate vector database
 * Addresses the empty database issue affecting story generation
 */

const axios = require('axios');

const WEAVIATE_URL = 'http://localhost:8080';

// Sample data for each Weaviate class
const worldKnowledgeData = [
  {
    title: "Luke Skywalker Character Profile",
    content: "Luke Skywalker is a legendary Jedi Knight from Tatooine. Human male, pilot and Force-sensitive. Son of Anakin Skywalker and Padmé Amidala. Key participant in the Galactic Civil War. Known for optimism, determination, and compassion.",
    category: "character",
    era: "imperial_era",
    canonicity: "canon",
    importance: 10
  },
  {
    title: "Mos Eisley Cantina",
    content: "The Mos Eisley Cantina is a rough drinking establishment in the Mos Eisley spaceport on Tatooine. Known for its diverse alien clientele, shady dealings, and 'no droids' policy. Popular meeting place for smugglers, bounty hunters, and other spacers.",
    category: "location",
    era: "imperial_era", 
    canonicity: "canon",
    importance: 8
  },
  {
    title: "The Force Philosophy",
    content: "The Force is an energy field created by all living things. It surrounds us, penetrates us, and binds the galaxy together. Light side represents peace, knowledge, and serenity. Dark side feeds on anger, fear, and aggression.",
    category: "technology",
    era: "all_eras",
    canonicity: "canon", 
    importance: 10
  },
  {
    title: "Imperial Era Politics",
    content: "The Galactic Empire rules through fear and oppression. Emperor Palpatine has dissolved the Senate. Stormtroopers enforce Imperial will. The Rebel Alliance fights for freedom and democracy against Imperial tyranny.",
    category: "politics",
    era: "imperial_era",
    canonicity: "canon",
    importance: 9
  },
  {
    title: "Millennium Falcon Specifications",
    content: "The Millennium Falcon is a YT-1300 light freighter heavily modified for speed and combat. Capable of .5 past lightspeed. Piloted by Han Solo and Chewbacca. Features enhanced hyperdrive, quad laser cannons, and illegal modifications.",
    category: "technology", 
    era: "imperial_era",
    canonicity: "canon",
    importance: 7
  },
  {
    title: "Tatooine Desert World",
    content: "Tatooine is a harsh desert planet in the Outer Rim with twin suns. Home to moisture farmers, Tusken Raiders, and Jawas. Controlled by Hutt crime lords. Binary sunset is a iconic sight. Dangerous but strategically important.",
    category: "location",
    era: "all_eras", 
    canonicity: "canon",
    importance: 8
  }
];

const narrativeElementsData = [
  {
    title: "Cantina Scene Opening",
    content: "The heavy doors swing open, revealing a haze of exotic smoke and the low murmur of conversation in a dozen alien languages. The cantina is dimly lit, with shadowy alcoves perfect for clandestine meetings.",
    type: "description",
    tone: "mysterious",
    useContext: "entering a seedy establishment",
    quality: 8
  },
  {
    title: "Imperial Patrol Encounter", 
    content: "White-armored stormtroopers march in formation, their helmet visors scanning the crowd methodically. Their presence brings an immediate hush to conversations as beings try to avoid unwanted attention.",
    type: "description",
    tone: "tense",
    useContext: "Imperial presence",
    quality: 9
  },
  {
    title: "Force Meditation Scene",
    content: "Closing their eyes, the character reaches out with the Force, feeling the living energy that connects all things. The galaxy seems to pulse with life, revealing truths hidden from ordinary perception.",
    type: "description", 
    tone: "mystical",
    useContext: "Force user meditation",
    quality: 8
  },
  {
    title: "Hyperdrive Jump",
    content: "Stars elongate into brilliant lines as the ship leaps into hyperspace. The familiar blue-white tunnel of hyperspace envelops the vessel, carrying it across the galaxy faster than light.",
    type: "description",
    tone: "dramatic",
    useContext: "space travel",
    quality: 7
  }
];

const storyEventsData = [
  {
    title: "Luke's Discovery of Princess Leia's Message",
    description: "While cleaning R2-D2, Luke accidentally triggers part of Leia's desperate plea for help to Obi-Wan Kenobi, setting the saga in motion.",
    participants: ["Luke Skywalker", "R2-D2", "Princess Leia"],
    location: "Lars Homestead, Tatooine",
    importance: 10,
    type: "discovery"
  },
  {
    title: "Binary Sunset Contemplation",
    description: "Luke gazes at Tatooine's twin suns setting over the desert horizon, dreaming of adventure beyond his mundane moisture farming life.",
    participants: ["Luke Skywalker"],
    location: "Tatooine Desert",
    importance: 8,
    type: "character_development"
  },
  {
    title: "Cantina Negotiation",
    description: "In the notorious Mos Eisley Cantina, desperate travelers seek passage off-world while smugglers and criminals conduct their shadowy business.",
    participants: ["Various Smugglers", "Alien Patrons"],
    location: "Mos Eisley Cantina",
    importance: 7,
    type: "negotiation"
  }
];

const plotTemplatesData = [
  {
    title: "Rescue Mission Template",
    summary: "Characters must infiltrate an Imperial facility to rescue a captured ally or important figure.",
    structure: "Planning → Infiltration → Discovery → Escape → Resolution",
    type: "rescue",
    complexity: "moderate",
    recommendedLength: "2-3 sessions", 
    challenges: "Security systems, Imperial guards, time pressure, extraction under fire"
  },
  {
    title: "Smuggling Run Template", 
    summary: "Characters transport illegal cargo while avoiding Imperial entanglements and rival smugglers.",
    structure: "Job Acquisition → Preparation → Transit → Complications → Delivery",
    type: "heist",
    complexity: "simple",
    recommendedLength: "1-2 sessions",
    challenges: "Imperial inspections, pirate attacks, cargo complications, payment disputes"
  },
  {
    title: "Force Mystery Template",
    summary: "Characters investigate ancient Jedi/Sith artifacts or locations with mysterious Force phenomena.",
    structure: "Discovery → Research → Investigation → Revelation → Confrontation",
    type: "investigation", 
    complexity: "complex",
    recommendedLength: "3-4 sessions",
    challenges: "Ancient traps, Force ghosts, dark side corruption, rival archaeologists"
  }
];

const characterResponsesData = [
  {
    situation: "Approached by Imperial patrol",
    response: "Keep calm, avoid eye contact, and provide minimal but truthful identification. Any nervousness could raise suspicion.",
    characterType: "Smuggler",
    alignment: "neutral",
    emotionalState: "wary",
    quality: 8
  },
  {
    situation: "Witnessing injustice",
    response: "Step forward despite personal danger, drawing upon inner strength and conviction to do what's right.",
    characterType: "Jedi",
    alignment: "light", 
    emotionalState: "determined",
    quality: 9
  },
  {
    situation: "Offered a dangerous but profitable job",
    response: "Calculate the risks, negotiate better terms, and ensure there's a clear escape plan before accepting.",
    characterType: "Bounty Hunter",
    alignment: "neutral",
    emotionalState: "calculating", 
    quality: 7
  }
];

async function loadDataToWeaviate() {
  console.log('🚀 Loading sample data into Weaviate vector database...');
  
  try {
    // Load WorldKnowledge data
    console.log('📚 Loading WorldKnowledge entries...');
    for (const item of worldKnowledgeData) {
      await axios.post(`${WEAVIATE_URL}/v1/objects`, {
        class: 'WorldKnowledge',
        properties: item
      });
    }
    console.log(`✅ Loaded ${worldKnowledgeData.length} WorldKnowledge entries`);

    // Load NarrativeElement data
    console.log('📝 Loading NarrativeElement entries...');
    for (const item of narrativeElementsData) {
      await axios.post(`${WEAVIATE_URL}/v1/objects`, {
        class: 'NarrativeElement', 
        properties: item
      });
    }
    console.log(`✅ Loaded ${narrativeElementsData.length} NarrativeElement entries`);

    // Load StoryEvent data
    console.log('📖 Loading StoryEvent entries...');
    for (const item of storyEventsData) {
      await axios.post(`${WEAVIATE_URL}/v1/objects`, {
        class: 'StoryEvent',
        properties: item
      });
    }
    console.log(`✅ Loaded ${storyEventsData.length} StoryEvent entries`);

    // Load PlotTemplate data
    console.log('🎭 Loading PlotTemplate entries...');
    for (const item of plotTemplatesData) {
      await axios.post(`${WEAVIATE_URL}/v1/objects`, {
        class: 'PlotTemplate',
        properties: item
      });
    }
    console.log(`✅ Loaded ${plotTemplatesData.length} PlotTemplate entries`);

    // Load CharacterResponse data
    console.log('💬 Loading CharacterResponse entries...');
    for (const item of characterResponsesData) {
      await axios.post(`${WEAVIATE_URL}/v1/objects`, {
        class: 'CharacterResponse',
        properties: item
      });
    }
    console.log(`✅ Loaded ${characterResponsesData.length} CharacterResponse entries`);

    // Verify total count
    const totalResponse = await axios.get(`${WEAVIATE_URL}/v1/meta`);
    console.log('\n📊 Data loading complete!');
    console.log('🎯 Weaviate now contains comprehensive Star Wars RPG data for story generation');
    
    // Check each class count
    const classes = ['WorldKnowledge', 'NarrativeElement', 'StoryEvent', 'PlotTemplate', 'CharacterResponse'];
    for (const className of classes) {
      const response = await axios.get(`${WEAVIATE_URL}/v1/objects?class=${className}&limit=1`);
      const count = response.data.objects ? response.data.objects.length : 0;
      console.log(`   ${className}: ${count > 0 ? 'Has data' : 'Empty'}`);
    }

  } catch (error) {
    console.error('❌ Error loading data:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run the data loading
loadDataToWeaviate();