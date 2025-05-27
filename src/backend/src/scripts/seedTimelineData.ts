import fs from 'fs';
import path from 'path';
import mongodbService from '../services/mongodbService';
import { logger } from '../utils/logger';

// Convert BBY/ABY date string to numeric value for sorting
function convertDateToNumeric(dateString: string): number {
  const match = dateString.match(/(\d+(?:,\d+)*)\s*(BBY|ABY)/i);
  if (!match) return 0;
  
  const number = parseInt(match[1].replace(/,/g, ''));
  const era = match[2].toUpperCase();
  
  return era === 'BBY' ? -number : number;
}

// Extract participants from event data
function extractParticipants(eventData: any): string[] {
  const participants: string[] = [];
  
  if (eventData.participants) {
    participants.push(...eventData.participants);
  }
  
  if (eventData.key_figures) {
    participants.push(...eventData.key_figures);
  }
  
  if (eventData.keyFigures) {
    participants.push(...eventData.keyFigures);
  }
  
  return [...new Set(participants)]; // Remove duplicates
}

// Extract consequences from event data
function extractConsequences(eventData: any): string[] {
  const consequences: string[] = [];
  
  if (eventData.consequences) {
    consequences.push(...eventData.consequences);
  }
  
  if (eventData.aftermath) {
    if (Array.isArray(eventData.aftermath)) {
      consequences.push(...eventData.aftermath);
    } else {
      consequences.push(eventData.aftermath);
    }
  }
  
  if (eventData.impact) {
    if (Array.isArray(eventData.impact)) {
      consequences.push(...eventData.impact);
    } else {
      consequences.push(eventData.impact);
    }
  }
  
  return consequences;
}

// Determine event category based on content
function categorizeEvent(title: string, description: string, participants: string[]): string {
  const content = (title + ' ' + description + ' ' + participants.join(' ')).toLowerCase();
  
  if (content.includes('jedi') || content.includes('force') || content.includes('lightsaber')) {
    return 'jedi';
  }
  if (content.includes('sith') || content.includes('dark side') || content.includes('darth')) {
    return 'sith';
  }
  if (content.includes('battle') || content.includes('war') || content.includes('conflict')) {
    return 'military';
  }
  if (content.includes('republic') || content.includes('empire') || content.includes('senate')) {
    return 'political';
  }
  if (content.includes('technology') || content.includes('death star') || content.includes('hyperspace')) {
    return 'technology';
  }
  
  return 'other';
}

// Determine event significance
function determineSignificance(eventData: any): string {
  const significance = eventData.significance?.toLowerCase() || '';
  
  if (significance.includes('galaxy') || significance.includes('fundamental') || significance.includes('balance')) {
    return 'critical';
  }
  if (significance.includes('major') || significance.includes('established') || significance.includes('destruction')) {
    return 'high';
  }
  if (significance.includes('minor') || significance.includes('local')) {
    return 'low';
  }
  
  return 'medium';
}

async function seedTimelineData(): Promise<void> {
  try {
    // Initialize database connection
    await mongodbService.initialize();
    
    // Read timeline data
    const timelineDataPath = path.join('/app/data/lore/timeline_events.json');
    const rawData = fs.readFileSync(timelineDataPath, 'utf8');
    const timelineData = JSON.parse(rawData);
    
    const eventsCollection = mongodbService.getTimelineEventsCollection();
    const erasCollection = mongodbService.getTimelineErasCollection();
    
    // Clear existing data
    await eventsCollection.deleteMany({});
    await erasCollection.deleteMany({});
    
    logger.info('Cleared existing timeline data');
    
    // Process eras
    const eras = [];
    const galacticTimeline = timelineData.galactic_timeline;
    
    for (const [eraKey, eraData] of Object.entries(galacticTimeline.major_eras)) {
      const era = {
        name: eraKey.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        description: (eraData as any).description,
        timeframe: (eraData as any).timeframe,
        startDate: convertDateToNumeric((eraData as any).timeframe.split(' - ')[0] || (eraData as any).timeframe),
        endDate: convertDateToNumeric((eraData as any).timeframe.split(' - ')[1] || '0 ABY'),
        characteristics: (eraData as any).characteristics || [],
        majorEvents: (eraData as any).key_events || [],
        keyFigures: (eraData as any).key_figures || [],
        significance: (eraData as any).significance || '',
        color: getEraColor(eraKey),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      eras.push(era);
    }
    
    // Insert eras
    if (eras.length > 0) {
      await erasCollection.insertMany(eras);
      logger.info(`Inserted ${eras.length} timeline eras`);
    }
    
    // Process events
    const events = [];
    
    // Process major era events
    for (const [eraKey, eraData] of Object.entries(galacticTimeline.major_eras)) {
      const eraName = eraKey.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
      
      if ((eraData as any).major_periods) {
        for (const [periodKey, periodData] of Object.entries((eraData as any).major_periods)) {
          const participants = extractParticipants(periodData);
          const consequences = extractConsequences(periodData);
          
          const event = {
            title: periodKey.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
            description: (periodData as any).description,
            date: (periodData as any).date,
            dateNumeric: convertDateToNumeric((periodData as any).date),
            era: eraName,
            category: categorizeEvent(periodKey, (periodData as any).description, participants),
            significance: determineSignificance(periodData),
            participants,
            location: (periodData as any).location || '',
            consequences,
            relatedEvents: [],
            sources: ['Official Timeline Data'],
            tags: [eraKey, periodKey],
            isCanonical: true,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          events.push(event);
        }
      }
      
      // Process key events from the era
      if ((eraData as any).key_events) {
        for (const eventTitle of (eraData as any).key_events) {
          const event = {
            title: eventTitle,
            description: `Key event during the ${eraName}`,
            date: (eraData as any).timeframe.split(' - ')[0] || (eraData as any).timeframe,
            dateNumeric: convertDateToNumeric((eraData as any).timeframe.split(' - ')[0] || (eraData as any).timeframe),
            era: eraName,
            category: categorizeEvent(eventTitle, '', []),
            significance: 'medium' as const,
            participants: [],
            location: '',
            consequences: [],
            relatedEvents: [],
            sources: ['Official Timeline Data'],
            tags: [eraKey],
            isCanonical: true,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          events.push(event);
        }
      }
    }
    
    // Process pivotal moments
    for (const [momentKey, momentData] of Object.entries(galacticTimeline.pivotal_moments)) {
      const participants = extractParticipants(momentData);
      const consequences = extractConsequences(momentData);
      
      const event = {
        title: momentKey.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        description: (momentData as any).description,
        date: (momentData as any).date || (momentData as any).timeframe || '0 ABY',
        dateNumeric: convertDateToNumeric((momentData as any).date || (momentData as any).timeframe || '0 ABY'),
        era: 'Galactic Civil War',
        category: categorizeEvent(momentKey, (momentData as any).description, participants),
        significance: 'critical' as const,
        participants,
        location: (momentData as any).location || '',
        consequences,
        relatedEvents: [],
        sources: ['Official Timeline Data'],
        tags: ['pivotal_moment', momentKey],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      events.push(event);
    }
    
    // Add comprehensive canonical events from space.com timeline and official sources
    const additionalEvents = [
      // ANCIENT HISTORY (25,000+ BBY)
      {
        title: "Prime Jedi Era",
        description: "The very first Jedi establishes the Jedi Order and builds the first Jedi Temple on Ahch-To",
        date: "25,000+ BBY",
        dateNumeric: -25000,
        era: "Dawn Of The Jedi",
        category: "jedi",
        significance: "critical",
        participants: ["Prime Jedi", "Ancient Force-sensitives"],
        location: "Ahch-To",
        consequences: ["Foundation of Jedi Order", "First Jedi Temple established", "Force traditions begin"],
        relatedEvents: [],
        sources: ["The Last Jedi", "Official Timeline"],
        tags: ["prime_jedi", "ahch_to", "first_temple"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // HIGH REPUBLIC ERA (500-100 BBY)
      {
        title: "The High Republic Era Begins",
        description: "The Jedi Order reaches its golden age, serving as peacekeepers across the galaxy during the Republic's expansion",
        date: "500 BBY",
        dateNumeric: -500,
        era: "Galactic Republic",
        category: "jedi",
        significance: "high",
        participants: ["Jedi Order", "Galactic Republic"],
        location: "Galaxy-wide",
        consequences: ["Jedi at height of power", "Republic expansion", "Peace and prosperity"],
        relatedEvents: [],
        sources: ["High Republic novels", "Official Timeline"],
        tags: ["high_republic", "jedi_golden_age"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        title: "The Great Disaster",
        description: "A catastrophic hyperspace accident destroys the Legacy Run, causing the Emergences crisis across the Outer Rim",
        date: "232 BBY",
        dateNumeric: -232,
        era: "Galactic Republic",
        category: "technology",
        significance: "high",
        participants: ["Jedi Order", "Republic", "Nihil raiders"],
        location: "Outer Rim",
        consequences: ["Hyperspace crisis", "Nihil threat emerges", "Jedi response mission"],
        relatedEvents: [],
        sources: ["High Republic: Light of the Jedi"],
        tags: ["great_disaster", "hyperspace", "nihil"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // PREQUEL ERA (100-19 BBY)
      {
        title: "Birth of Anakin Skywalker",
        description: "Anakin Skywalker is born on Tatooine, conceived by the Force itself according to Jedi prophecy",
        date: "41 BBY",
        dateNumeric: -41,
        era: "Galactic Republic",
        category: "jedi",
        significance: "critical",
        participants: ["Anakin Skywalker", "Shmi Skywalker"],
        location: "Tatooine",
        consequences: ["Chosen One born", "Future of galaxy altered", "Prophecy begins"],
        relatedEvents: [],
        sources: ["The Phantom Menace"],
        tags: ["anakin_birth", "chosen_one", "tatooine"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        title: "Invasion of Naboo",
        description: "The Trade Federation invades Naboo, leading to the discovery of Anakin Skywalker and the return of the Sith",
        date: "32 BBY",
        dateNumeric: -32,
        era: "Galactic Republic",
        category: "political",
        significance: "critical",
        participants: ["Qui-Gon Jinn", "Obi-Wan Kenobi", "Anakin Skywalker", "Queen Amidala", "Darth Maul"],
        location: "Naboo",
        consequences: ["Anakin discovered", "Palpatine becomes Chancellor", "Sith revealed", "Qui-Gon's death"],
        relatedEvents: [],
        sources: ["The Phantom Menace"],
        tags: ["naboo_invasion", "anakin_discovery", "sith_return"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        title: "Geonosis Arena Battle",
        description: "The first battle of the Clone Wars begins when Jedi attempt to rescue Obi-Wan from Separatist forces",
        date: "22 BBY",
        dateNumeric: -22,
        era: "Clone Wars",
        category: "military",
        significance: "critical",
        participants: ["Jedi Order", "Clone Army", "Separatist Alliance", "Count Dooku"],
        location: "Geonosis",
        consequences: ["Clone Wars begin", "Secret marriage of Anakin and Padmé", "Republic army revealed"],
        relatedEvents: [],
        sources: ["Attack of the Clones"],
        tags: ["geonosis", "clone_wars_start", "anakin_padme_marriage"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // CLONE WARS ERA (22-19 BBY)
      {
        title: "Ahsoka Tano Becomes Anakin's Padawan",
        description: "Young Togruta Ahsoka Tano is assigned as Anakin Skywalker's Padawan learner during the Clone Wars",
        date: "22 BBY",
        dateNumeric: -22,
        era: "Clone Wars",
        category: "jedi",
        significance: "high",
        participants: ["Ahsoka Tano", "Anakin Skywalker", "Yoda"],
        location: "Christophsis",
        consequences: ["Anakin learns responsibility", "Ahsoka's training begins", "New Jedi partnership"],
        relatedEvents: [],
        sources: ["The Clone Wars movie/series"],
        tags: ["ahsoka", "padawan", "anakin_teaching"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        title: "Discovery of Kamino Clone Army",
        description: "Obi-Wan discovers the secret clone army being produced on Kamino for the Republic",
        date: "22 BBY",
        dateNumeric: -22,
        era: "Clone Wars",
        category: "military",
        significance: "critical",
        participants: ["Obi-Wan Kenobi", "Jango Fett", "Kaminoans", "Clone Troopers"],
        location: "Kamino",
        consequences: ["Clone army revealed", "Jango Fett as template", "Republic military force"],
        relatedEvents: [],
        sources: ["Attack of the Clones"],
        tags: ["kamino", "clone_army", "jango_fett"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        title: "Siege of Mandalore",
        description: "Ahsoka Tano and Bo-Katan lead Republic forces to capture Darth Maul and liberate Mandalore",
        date: "19 BBY",
        dateNumeric: -19,
        era: "Clone Wars",
        category: "military",
        significance: "high",
        participants: ["Ahsoka Tano", "Bo-Katan Kryze", "Darth Maul", "Clone Troopers"],
        location: "Mandalore",
        consequences: ["Maul captured", "Mandalore liberated", "Clone Wars end approaches"],
        relatedEvents: [],
        sources: ["The Clone Wars Season 7"],
        tags: ["mandalore_siege", "maul_capture", "ahsoka"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        title: "Ahsoka Leaves the Jedi Order",
        description: "Ahsoka Tano leaves the Jedi Order after being falsely accused and losing faith in the Council",
        date: "20 BBY",
        dateNumeric: -20,
        era: "Clone Wars",
        category: "jedi",
        significance: "high",
        participants: ["Ahsoka Tano", "Anakin Skywalker", "Jedi Council"],
        location: "Coruscant",
        consequences: ["Ahsoka becomes independent", "Anakin loses faith in Jedi", "Jedi Order weakened"],
        relatedEvents: [],
        sources: ["The Clone Wars Season 5"],
        tags: ["ahsoka_leaves", "jedi_betrayal", "anakin_doubt"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // REVENGE OF THE SITH ERA (19 BBY)
      {
        title: "Rescue of Chancellor Palpatine",
        description: "Anakin and Obi-Wan rescue Chancellor Palpatine from General Grievous, leading to Dooku's death",
        date: "19 BBY",
        dateNumeric: -19,
        era: "Clone Wars",
        category: "military",
        significance: "high",
        participants: ["Anakin Skywalker", "Obi-Wan Kenobi", "Count Dooku", "General Grievous"],
        location: "Coruscant orbit",
        consequences: ["Dooku's death", "Anakin's first step to dark side", "Palpatine saved"],
        relatedEvents: [],
        sources: ["Revenge of the Sith"],
        tags: ["dooku_death", "palpatine_rescue", "anakin_kills"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        title: "Obi-Wan vs General Grievous",
        description: "Obi-Wan Kenobi hunts down and defeats General Grievous on Utapau during the final Clone Wars battle",
        date: "19 BBY",
        dateNumeric: -19,
        era: "Clone Wars",
        category: "military",
        significance: "high",
        participants: ["Obi-Wan Kenobi", "General Grievous", "Clone Troopers"],
        location: "Utapau",
        consequences: ["Grievous defeated", "Separatist leadership eliminated", "Clone Wars ending"],
        relatedEvents: [],
        sources: ["Revenge of the Sith"],
        tags: ["grievous_death", "utapau", "clone_wars_end"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        title: "Palpatine Reveals Himself as Darth Sidious",
        description: "Chancellor Palpatine reveals his true identity as Sith Lord Darth Sidious to Anakin Skywalker",
        date: "19 BBY",
        dateNumeric: -19,
        era: "Imperial Era",
        category: "sith",
        significance: "critical",
        participants: ["Darth Sidious", "Anakin Skywalker", "Mace Windu"],
        location: "Coruscant",
        consequences: ["Sith Lord revealed", "Anakin's final temptation", "Mace Windu's death"],
        relatedEvents: [],
        sources: ["Revenge of the Sith"],
        tags: ["sidious_revealed", "anakin_tempted", "windu_death"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        title: "Anakin Becomes Darth Vader",
        description: "Anakin Skywalker falls to the dark side and becomes Darth Vader, apprentice to Emperor Palpatine",
        date: "19 BBY",
        dateNumeric: -19,
        era: "Imperial Era",
        category: "sith",
        significance: "critical",
        participants: ["Anakin Skywalker", "Darth Sidious", "Jedi Order"],
        location: "Coruscant",
        consequences: ["Chosen One falls", "Jedi Temple attacked", "Empire rises"],
        relatedEvents: [],
        sources: ["Revenge of the Sith"],
        tags: ["vader_birth", "anakin_fall", "dark_side"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        title: "Duel on Mustafar",
        description: "Obi-Wan and Anakin fight their final lightsaber duel on the volcanic planet Mustafar",
        date: "19 BBY",
        dateNumeric: -19,
        era: "Imperial Era",
        category: "jedi",
        significance: "critical",
        participants: ["Obi-Wan Kenobi", "Anakin Skywalker", "Padmé Amidala"],
        location: "Mustafar",
        consequences: ["Anakin severely injured", "Friendship destroyed", "Padmé's death"],
        relatedEvents: [],
        sources: ["Revenge of the Sith"],
        tags: ["mustafar_duel", "obi_wan_anakin", "padme_death"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        title: "Birth of Luke and Leia",
        description: "Padmé Amidala dies giving birth to twins Luke and Leia, who are separated for their protection",
        date: "19 BBY",
        dateNumeric: -19,
        era: "Imperial Era",
        category: "other",
        significance: "critical",
        participants: ["Luke Skywalker", "Leia Skywalker", "Padmé Amidala", "Obi-Wan Kenobi"],
        location: "Polis Massa",
        consequences: ["New hope born", "Twins separated", "Future of galaxy secured"],
        relatedEvents: [],
        sources: ["Revenge of the Sith"],
        tags: ["luke_leia_birth", "twins_separated", "new_hope"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // IMPERIAL ERA EXPANSION (19-0 BBY)
      {
        title: "Vader's Suit and Transformation",
        description: "Anakin Skywalker is reconstructed as the cyborg Darth Vader in his iconic black armor",
        date: "19 BBY",
        dateNumeric: -19,
        era: "Imperial Era",
        category: "sith",
        significance: "critical",
        participants: ["Darth Vader", "Emperor Palpatine", "Medical droids"],
        location: "Coruscant",
        consequences: ["Vader's iconic form", "Ultimate Sith enforcer", "Terror weapon created"],
        relatedEvents: [],
        sources: ["Revenge of the Sith"],
        tags: ["vader_suit", "cyborg_vader", "transformation"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        title: "The Bad Batch Escapes Order 66",
        description: "Clone Force 99 defects from the Empire due to their genetic modifications protecting them from Order 66",
        date: "19 BBY",
        dateNumeric: -19,
        era: "Imperial Era",
        category: "military",
        significance: "medium",
        participants: ["Hunter", "Tech", "Wrecker", "Crosshair", "Echo"],
        location: "Kamino",
        consequences: ["Clone deserters", "Resistance begins", "Imperial pursuit"],
        relatedEvents: [],
        sources: ["The Bad Batch"],
        tags: ["bad_batch", "clone_defection", "order_66_survivors"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        title: "Obi-Wan Goes into Exile",
        description: "Obi-Wan Kenobi goes into exile on Tatooine to watch over young Luke Skywalker",
        date: "19 BBY",
        dateNumeric: -19,
        era: "Imperial Era",
        category: "jedi",
        significance: "high",
        participants: ["Obi-Wan Kenobi", "Luke Skywalker", "Owen Lars"],
        location: "Tatooine",
        consequences: ["Jedi in hiding", "Luke protected", "Guardian established"],
        relatedEvents: [],
        sources: ["Revenge of the Sith", "Obi-Wan Kenobi series"],
        tags: ["obi_wan_exile", "tatooine", "luke_guardian"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        title: "The Great Jedi Purge Begins",
        description: "Darth Vader and the Inquisitors begin systematically hunting down surviving Jedi across the galaxy",
        date: "18 BBY",
        dateNumeric: -18,
        era: "Imperial Era",
        category: "jedi",
        significance: "critical",
        participants: ["Darth Vader", "Inquisitors", "Surviving Jedi", "Imperial forces"],
        location: "Galaxy-wide",
        consequences: ["Jedi extinction campaign", "Fear spreads", "Underground networks"],
        relatedEvents: [],
        sources: ["Jedi: Fallen Order", "Rebels", "Various sources"],
        tags: ["jedi_purge", "inquisitors", "jedi_hunting"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        title: "Obi-Wan vs Darth Vader Rematch",
        description: "Obi-Wan and Vader meet again ten years after Mustafar, with Obi-Wan emerging victorious",
        date: "9 BBY",
        dateNumeric: -9,
        era: "Imperial Era",
        category: "jedi",
        significance: "high",
        participants: ["Obi-Wan Kenobi", "Darth Vader", "Princess Leia"],
        location: "Jabiim",
        consequences: ["Vader defeated again", "Leia rescued", "Obi-Wan's confidence restored"],
        relatedEvents: [],
        sources: ["Obi-Wan Kenobi series"],
        tags: ["obi_wan_vader_rematch", "leia_rescue", "jabiim"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // REBELS ERA (14-0 BBY)
      {
        title: "Formation of the Rebel Alliance",
        description: "Various rebel cells unite to form the official Rebel Alliance against the Empire",
        date: "2 BBY",
        dateNumeric: -2,
        era: "Imperial Era",
        category: "political",
        significance: "critical",
        participants: ["Mon Mothma", "Bail Organa", "Saw Gerrera", "Rebel cells"],
        location: "Yavin 4",
        consequences: ["Unified resistance", "Coordinated rebellion", "Hope restored"],
        relatedEvents: [],
        sources: ["Rebels", "Rogue One"],
        tags: ["rebel_alliance", "mon_mothma", "organized_resistance"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        title: "Ezra Bridger Joins the Ghost Crew",
        description: "Young Force-sensitive Ezra Bridger joins Kanan Jarrus and the Ghost crew on Lothal",
        date: "14 BBY",
        dateNumeric: -14,
        era: "Imperial Era",
        category: "jedi",
        significance: "medium",
        participants: ["Ezra Bridger", "Kanan Jarrus", "Hera Syndulla", "Ghost crew"],
        location: "Lothal",
        consequences: ["New Jedi training", "Rebel cell strengthened", "Force awakens"],
        relatedEvents: [],
        sources: ["Rebels"],
        tags: ["ezra_bridger", "ghost_crew", "lothal"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        title: "Grand Admiral Thrawn Arrives",
        description: "The brilliant Imperial tactician Grand Admiral Thrawn takes command of Imperial forces",
        date: "2 BBY",
        dateNumeric: -2,
        era: "Imperial Era",
        category: "military",
        significance: "high",
        participants: ["Grand Admiral Thrawn", "Imperial Navy", "Rebel Alliance"],
        location: "Outer Rim",
        consequences: ["Imperial strategy improved", "Rebel threat increases", "Tactical genius deployed"],
        relatedEvents: [],
        sources: ["Rebels"],
        tags: ["thrawn", "imperial_tactics", "strategic_genius"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // ROGUE ONE ERA (0 BBY)
      {
        title: "Theft of Death Star Plans",
        description: "Jyn Erso and the Rogue One team steal the Death Star plans from the Imperial facility on Scarif",
        date: "0 BBY",
        dateNumeric: 0,
        era: "Imperial Era",
        category: "military",
        significance: "critical",
        participants: ["Jyn Erso", "Cassian Andor", "K-2SO", "Chirrut Îmwe", "Baze Malbus"],
        location: "Scarif",
        consequences: ["Death Star weakness revealed", "Rogue One sacrificed", "New Hope enabled"],
        relatedEvents: [],
        sources: ["Rogue One"],
        tags: ["death_star_plans", "rogue_one", "scarif_battle"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        title: "Darth Vader's Hallway Massacre",
        description: "Darth Vader single-handedly slaughters Rebel soldiers to retrieve the stolen Death Star plans",
        date: "0 BBY",
        dateNumeric: 0,
        era: "Imperial Era",
        category: "military",
        significance: "high",
        participants: ["Darth Vader", "Rebel soldiers", "Princess Leia"],
        location: "Tantive IV",
        consequences: ["Vader's power displayed", "Plans escaped", "Rebels terrified"],
        relatedEvents: [],
        sources: ["Rogue One"],
        tags: ["vader_hallway", "tantive_iv", "vader_power"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // ORIGINAL TRILOGY ERA (0-4 ABY)
      {
        title: "Luke Skywalker Discovers His Heritage",
        description: "Owen and Beru Lars are killed by Imperial troops, leading Luke to discover his Jedi heritage from Obi-Wan",
        date: "0 ABY",
        dateNumeric: 0,
        era: "Galactic Civil War",
        category: "jedi",
        significance: "critical",
        participants: ["Luke Skywalker", "Obi-Wan Kenobi", "Owen Lars", "Beru Lars"],
        location: "Tatooine",
        consequences: ["Luke begins Jedi training", "Hero's journey starts", "New Hope emerges"],
        relatedEvents: [],
        sources: ["A New Hope"],
        tags: ["luke_heritage", "obi_wan_reveals", "lars_death"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        title: "Rescue of Princess Leia",
        description: "Luke, Han, and Obi-Wan rescue Princess Leia from the Death Star, though Obi-Wan sacrifices himself",
        date: "0 ABY",
        dateNumeric: 0,
        era: "Galactic Civil War",
        category: "military",
        significance: "high",
        participants: ["Luke Skywalker", "Princess Leia", "Han Solo", "Obi-Wan Kenobi", "Darth Vader"],
        location: "Death Star",
        consequences: ["Leia rescued", "Obi-Wan becomes Force ghost", "Death Star tracked"],
        relatedEvents: [],
        sources: ["A New Hope"],
        tags: ["leia_rescue", "obi_wan_sacrifice", "death_star_escape"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        title: "Luke Destroys the Death Star",
        description: "Luke uses the Force to destroy the Death Star at the Battle of Yavin, dealing a crushing blow to the Empire",
        date: "0 ABY",
        dateNumeric: 0,
        era: "Galactic Civil War",
        category: "military",
        significance: "critical",
        participants: ["Luke Skywalker", "Darth Vader", "Rebel pilots", "Grand Moff Tarkin"],
        location: "Yavin system",
        consequences: ["Death Star destroyed", "Empire weakened", "Luke emerges as hero"],
        relatedEvents: [],
        sources: ["A New Hope"],
        tags: ["death_star_destroyed", "yavin_battle", "luke_hero"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        title: "Vader Discovers Luke is His Son",
        description: "Darth Vader learns that Luke Skywalker is his son and begins his plan to turn him to the dark side",
        date: "0 ABY",
        dateNumeric: 0,
        era: "Galactic Civil War",
        category: "sith",
        significance: "critical",
        participants: ["Darth Vader", "Luke Skywalker", "Emperor Palpatine"],
        location: "Imperial Fleet",
        consequences: ["Father-son conflict begins", "Vader's internal struggle", "Palpatine's new plan"],
        relatedEvents: [],
        sources: ["The Empire Strikes Back"],
        tags: ["vader_learns_son", "family_revelation", "dark_side_temptation"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        title: "Luke Loses His Hand",
        description: "Luke duels Vader in Cloud City, losing his hand and learning that Vader is his father",
        date: "3 ABY",
        dateNumeric: 3,
        era: "Galactic Civil War",
        category: "jedi",
        significance: "critical",
        participants: ["Luke Skywalker", "Darth Vader", "Han Solo", "Princess Leia"],
        location: "Cloud City",
        consequences: ["Luke traumatized", "Han frozen in carbonite", "Father revealed"],
        relatedEvents: [],
        sources: ["The Empire Strikes Back"],
        tags: ["cloud_city_duel", "luke_hand_lost", "han_frozen"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        title: "Rescue of Han Solo",
        description: "Luke, Leia, and allies rescue Han Solo from Jabba the Hutt's palace on Tatooine",
        date: "4 ABY",
        dateNumeric: 4,
        era: "Galactic Civil War",
        category: "other",
        significance: "medium",
        participants: ["Luke Skywalker", "Princess Leia", "Han Solo", "Jabba the Hutt"],
        location: "Tatooine",
        consequences: ["Han rescued", "Luke shows Jedi powers", "Team reunited"],
        relatedEvents: [],
        sources: ["Return of the Jedi"],
        tags: ["han_rescue", "jabba_palace", "luke_jedi_powers"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        title: "Emperor's Death and Vader's Redemption",
        description: "Luke redeems Vader, who kills Emperor Palpatine but dies in the process, ending Sith rule",
        date: "4 ABY",
        dateNumeric: 4,
        era: "Galactic Civil War",
        category: "jedi",
        significance: "critical",
        participants: ["Luke Skywalker", "Darth Vader", "Emperor Palpatine"],
        location: "Death Star II",
        consequences: ["Emperor killed", "Vader redeemed", "Sith defeated", "Balance restored"],
        relatedEvents: [],
        sources: ["Return of the Jedi"],
        tags: ["emperor_death", "vader_redeemed", "sith_end", "balance_restored"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // POST-RETURN OF THE JEDI (5-25 ABY)
      {
        title: "Luke Begins Training New Jedi",
        description: "Luke Skywalker establishes a new Jedi training temple and begins training the next generation of Jedi",
        date: "6 ABY",
        dateNumeric: 6,
        era: "New Republic",
        category: "jedi",
        significance: "high",
        participants: ["Luke Skywalker", "New Jedi students"],
        location: "Various locations",
        consequences: ["Jedi Order reborn", "New students trained", "Force tradition continues"],
        relatedEvents: [],
        sources: ["Sequel Trilogy background"],
        tags: ["new_jedi_temple", "luke_teaching", "jedi_reborn"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        title: "Ben Solo is Born",
        description: "Han Solo and Leia Organa's son Ben Solo is born, destined to become Kylo Ren",
        date: "5 ABY",
        dateNumeric: 5,
        era: "New Republic",
        category: "other",
        significance: "high",
        participants: ["Ben Solo", "Han Solo", "Leia Organa"],
        location: "Unknown",
        consequences: ["Future Kylo Ren born", "Skywalker bloodline continues", "New generation begins"],
        relatedEvents: [],
        sources: ["Sequel Trilogy"],
        tags: ["ben_solo_birth", "skywalker_legacy", "future_kylo"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // SEQUEL TRILOGY ERA (28-35 ABY)
      {
        title: "Ben Solo Destroys Luke's Jedi Temple",
        description: "Ben Solo falls to the dark side, destroys Luke's Jedi temple, and becomes Kylo Ren",
        date: "28 ABY",
        dateNumeric: 28,
        era: "New Republic",
        category: "sith",
        significance: "critical",
        participants: ["Ben Solo", "Luke Skywalker", "Jedi students", "Knights of Ren"],
        location: "Jedi Temple",
        consequences: ["Jedi temple destroyed", "Students killed", "Luke goes into exile", "Kylo Ren born"],
        relatedEvents: [],
        sources: ["The Last Jedi"],
        tags: ["temple_destruction", "ben_falls", "kylo_ren_birth", "luke_exile"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        title: "Rey Discovers Her Force Powers",
        description: "Rey, a scavenger from Jakku, discovers she is Force-sensitive and begins her journey",
        date: "34 ABY",
        dateNumeric: 34,
        era: "New Republic",
        category: "jedi",
        significance: "critical",
        participants: ["Rey", "Finn", "BB-8", "Han Solo"],
        location: "Jakku",
        consequences: ["New Force user emerges", "Resistance gains ally", "Hope renewed"],
        relatedEvents: [],
        sources: ["The Force Awakens"],
        tags: ["rey_awakens", "force_discovery", "jakku"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        title: "Destruction of Hosnian Prime",
        description: "The First Order uses Starkiller Base to destroy the Hosnian system and New Republic fleet",
        date: "34 ABY",
        dateNumeric: 34,
        era: "New Republic",
        category: "military",
        significance: "critical",
        participants: ["First Order", "General Hux", "Resistance", "New Republic"],
        location: "Hosnian system",
        consequences: ["New Republic crippled", "First Order dominance", "Billions killed"],
        relatedEvents: [],
        sources: ["The Force Awakens"],
        tags: ["starkiller_base", "hosnian_destruction", "republic_falls"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        title: "Han Solo's Death",
        description: "Kylo Ren kills his father Han Solo on Starkiller Base in an attempt to fully embrace the dark side",
        date: "34 ABY",
        dateNumeric: 34,
        era: "New Republic",
        category: "sith",
        significance: "critical",
        participants: ["Kylo Ren", "Han Solo", "Rey", "Finn"],
        location: "Starkiller Base",
        consequences: ["Han Solo dies", "Kylo torn by guilt", "Rey and Finn traumatized"],
        relatedEvents: [],
        sources: ["The Force Awakens"],
        tags: ["han_solo_death", "kylo_kills_father", "starkiller_base"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        title: "Rey Begins Training with Luke",
        description: "Rey finds Luke Skywalker on Ahch-To and convinces him to train her in the ways of the Force",
        date: "34 ABY",
        dateNumeric: 34,
        era: "New Republic",
        category: "jedi",
        significance: "high",
        participants: ["Rey", "Luke Skywalker", "Porgs"],
        location: "Ahch-To",
        consequences: ["Rey's training begins", "Luke overcomes reluctance", "Jedi knowledge preserved"],
        relatedEvents: [],
        sources: ["The Last Jedi"],
        tags: ["rey_training", "luke_teaching", "ahch_to"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        title: "Luke's Force Projection Sacrifice",
        description: "Luke sacrifices himself using a massive Force projection to save the Resistance on Crait",
        date: "34 ABY",
        dateNumeric: 34,
        era: "New Republic",
        category: "jedi",
        significance: "critical",
        participants: ["Luke Skywalker", "Kylo Ren", "Resistance", "Leia Organa"],
        location: "Crait",
        consequences: ["Luke becomes one with Force", "Resistance escapes", "Legend of Luke spreads"],
        relatedEvents: [],
        sources: ["The Last Jedi"],
        tags: ["luke_sacrifice", "force_projection", "crait_battle"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        title: "Rise of Emperor Palpatine",
        description: "Emperor Palpatine reveals he has returned from death and commands the Final Order fleet",
        date: "35 ABY",
        dateNumeric: 35,
        era: "New Republic",
        category: "sith",
        significance: "critical",
        participants: ["Emperor Palpatine", "Kylo Ren", "Rey", "Sith Eternal"],
        location: "Exegol",
        consequences: ["Sith return", "Final Order revealed", "Ultimate threat emerges"],
        relatedEvents: [],
        sources: ["The Rise of Skywalker"],
        tags: ["palpatine_returns", "final_order", "exegol"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        title: "Rey Defeats Emperor Palpatine",
        description: "Rey, with help from all past Jedi, destroys Emperor Palpatine and the Sith once and for all",
        date: "35 ABY",
        dateNumeric: 35,
        era: "New Republic",
        category: "jedi",
        significance: "critical",
        participants: ["Rey", "Emperor Palpatine", "Ben Solo", "All Jedi spirits"],
        location: "Exegol",
        consequences: ["Sith finally destroyed", "Rey dies but is revived", "Galaxy freed"],
        relatedEvents: [],
        sources: ["The Rise of Skywalker"],
        tags: ["rey_kills_palpatine", "sith_destroyed", "final_victory"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // THE MANDALORIAN ERA (9-12 ABY)
      {
        title: "The Mandalorian Finds Grogu",
        description: "Din Djarin, a Mandalorian bounty hunter, rescues Grogu (The Child) and becomes his protector",
        date: "9 ABY",
        dateNumeric: 9,
        era: "New Republic",
        category: "other",
        significance: "medium",
        participants: ["Din Djarin", "Grogu", "Imperial remnants"],
        location: "Arvala-7",
        consequences: ["Surrogate father-son bond", "Imperial remnant threat", "Mandalorian culture explored"],
        relatedEvents: [],
        sources: ["The Mandalorian"],
        tags: ["mandalorian", "grogu", "din_djarin", "child"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        title: "Moff Gideon's Dark Troopers",
        description: "Moff Gideon unleashes Dark Trooper droids and wields the Darksaber against the Mandalorian",
        date: "9 ABY",
        dateNumeric: 9,
        era: "New Republic",
        category: "military",
        significance: "medium",
        participants: ["Moff Gideon", "Din Djarin", "Dark Troopers"],
        location: "Imperial cruiser",
        consequences: ["Dark Trooper threat", "Darksaber revealed", "Imperial remnant power"],
        relatedEvents: [],
        sources: ["The Mandalorian"],
        tags: ["moff_gideon", "dark_troopers", "darksaber"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        title: "Luke Rescues Grogu",
        description: "Luke Skywalker arrives to rescue Grogu and take him for Jedi training, saying goodbye to Din",
        date: "9 ABY",
        dateNumeric: 9,
        era: "New Republic",
        category: "jedi",
        significance: "high",
        participants: ["Luke Skywalker", "Grogu", "Din Djarin", "R2-D2"],
        location: "Imperial cruiser",
        consequences: ["Grogu begins Jedi training", "Father-son separation", "Luke's Jedi mission continues"],
        relatedEvents: [],
        sources: ["The Mandalorian Season 2"],
        tags: ["luke_rescues_grogu", "jedi_training", "mandalorian_goodbye"],
        isCanonical: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }];
    
    // Add all additional events
    events.push(...additionalEvents);
    
    // Insert events
    if (events.length > 0) {
      await eventsCollection.insertMany(events);
      logger.info(`Inserted ${events.length} timeline events`);
    }
    
    // Create indexes for better query performance
    await eventsCollection.createIndex({ dateNumeric: 1 });
    await eventsCollection.createIndex({ era: 1 });
    await eventsCollection.createIndex({ category: 1 });
    await eventsCollection.createIndex({ significance: 1 });
    await eventsCollection.createIndex({ tags: 1 });
    await eventsCollection.createIndex({ title: "text", description: "text" });
    
    // Create indexes for eras collection
    await erasCollection.createIndex({ key: 1 }, { unique: true });
    await erasCollection.createIndex({ startDate: 1 });
    await erasCollection.createIndex({ endDate: 1 });
    
    logger.info('Created database indexes for timeline collections');
    logger.info('Timeline data seeding completed successfully');
    
  } catch (error) {
    logger.error('Failed to seed timeline data:', error);
    throw error;
  }
}

function getEraColor(eraKey: string): string {
  const colors: { [key: string]: string } = {
    'dawn_of_the_jedi': '#FFD700',
    'old_republic': '#4169E1',
    'ruusan_reformation': '#8A2BE2',
    'galactic_republic': '#00CED1',
    'clone_wars': '#DC143C',
    'imperial_era': '#2F4F4F',
    'galactic_civil_war': '#FF6347',
    'new_republic': '#32CD32'
  };
  
  return colors[eraKey] || '#808080';
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedTimelineData()
    .then(() => {
      logger.info('Timeline seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Timeline seeding failed:', error);
      process.exit(1);
    });
}

export default seedTimelineData;