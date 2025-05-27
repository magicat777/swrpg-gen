#!/usr/bin/env node

const MongoDBService = require('../src/backend/services/mongodbService');
const Neo4jService = require('../src/backend/services/neo4jService');

class EnhancedFactionUpdater {
  
  // Enhanced Canonical Factions with detailed content and Wookieepedia URLs
  getEnhancedCanonicalFactions() {
    return [
      {
        id: "rebel-alliance",
        name: "Rebel Alliance",
        type: "Military Organization",
        alignment: "Light Side",
        era: "Galactic Civil War",
        headquarters: "Yavin 4, Hoth, various mobile bases",
        philosophy: "Restore freedom and democracy to the galaxy",
        description: "Military resistance movement fighting against the tyrannical Galactic Empire to restore the Republic.",
        detailed_content: "The Alliance to Restore the Republic was formed by Senator Mon Mothma, Princess Leia Organa, and other dissidents who opposed Emperor Palpatine's tyrannical rule. Operating from hidden bases across the galaxy, the Rebellion grew from a small insurgency into a full-scale military force capable of challenging Imperial supremacy.\n\nKey leaders included Princess Leia as a prominent senator and field commander, General Dodonna as chief military strategist, and Admiral Ackbar commanding the fleet. The Alliance's greatest victory came at the Battle of Yavin, where pilot Luke Skywalker destroyed the Death Star. After setbacks like the evacuation of Hoth, the Rebellion ultimately defeated the Empire at Endor.\n\nThe Alliance maintained strict operational security through cell-based organization, with individual units knowing only their immediate contacts. This structure protected the movement from Imperial infiltration while allowing coordinated strikes against key Imperial assets.",
        key_figures: "Princess Leia Organa, Mon Mothma, Luke Skywalker, Han Solo, General Dodonna, Admiral Ackbar",
        source: "A New Hope, The Empire Strikes Back, Return of the Jedi",
        wookieepedia_url: "https://starwars.fandom.com/wiki/Alliance_to_Restore_the_Republic"
      },
      {
        id: "galactic-empire",
        name: "Galactic Empire",
        type: "Government",
        alignment: "Dark Side",
        era: "Galactic Civil War",
        headquarters: "Imperial Center (Coruscant)",
        philosophy: "Order through strength and control",
        description: "Authoritarian regime that replaced the Republic, ruled by Emperor Palpatine through fear and oppression.",
        detailed_content: "The Galactic Empire emerged from the ashes of the Clone Wars when Chancellor Palpatine declared himself Emperor, transforming the democratic Republic into an authoritarian state. Ruling through fear and military might, the Empire maintained control over thousands of star systems with its massive fleet of Star Destroyers and the ultimate weapon, the Death Star.\n\nThe Empire's military hierarchy was dominated by ambitious officers like Grand Moff Tarkin, Admiral Ozzel, and countless other officials who competed for the Emperor's favor. At the apex stood Emperor Palpatine and his enforcer Darth Vader, who served as the Empire's primary agent of terror. The Imperial military doctrine emphasized overwhelming force and rapid deployment.\n\nImperial governance relied on regional governors called Moffs who administered entire star systems, often through brutal suppression of dissent. The Empire's xenophobic policies favored humans while oppressing alien species, contributing to widespread resentment that fueled the Rebel Alliance.",
        key_figures: "Emperor Palpatine, Darth Vader, Grand Moff Tarkin, Admiral Ozzel, Admiral Piett",
        source: "A New Hope, The Empire Strikes Back, Return of the Jedi", 
        wookieepedia_url: "https://starwars.fandom.com/wiki/Galactic_Empire"
      },
      {
        id: "jedi-order",
        name: "Jedi Order",
        type: "Religious Order",
        alignment: "Light Side",
        era: "Galactic Civil War",
        headquarters: "Jedi Temple (destroyed), various locations",
        philosophy: "Peace, knowledge, serenity, harmony through the Force",
        description: "Ancient order of Force-sensitive peacekeepers, nearly extinct during the Empire but restored by Luke Skywalker.",
        detailed_content: "The Jedi Order served as guardians of peace and justice in the Old Republic for over a thousand generations before being systematically destroyed during Order 66. The ancient organization trained Force-sensitive individuals to become knights and masters who wielded lightsabers and served as diplomats, protectors, and spiritual guides throughout the galaxy.\n\nBy the time of the Galactic Civil War, only a handful of Jedi remained alive: Obi-Wan Kenobi in exile on Tatooine, Yoda hidden on Dagobah, and eventually Luke Skywalker, who would restore the Order. The Jedi Code emphasized emotional control, selfless service, and harmony with the light side of the Force. Masters like Yoda taught that fear, anger, and hatred led to the dark side.\n\nLuke's training under both Obi-Wan and Yoda represented the continuation of ancient Jedi traditions, though he would ultimately forge a new path for the Order. The Jedi's connection to the Force allowed them to perform extraordinary feats, see the future, and influence others through mind tricks.",
        key_figures: "Luke Skywalker, Obi-Wan Kenobi, Yoda, Anakin Skywalker (fallen)",
        source: "A New Hope, The Empire Strikes Back, Return of the Jedi",
        wookieepedia_url: "https://starwars.fandom.com/wiki/Jedi_Order"
      },
      {
        id: "sith-order",
        name: "Sith Order",
        type: "Religious Order", 
        alignment: "Dark Side",
        era: "Galactic Civil War",
        headquarters: "Various dark side locations",
        philosophy: "Power through passion and the dark side of the Force",
        description: "Ancient order of dark side Force users following the Rule of Two, led by Emperor Palpatine and Darth Vader.",
        detailed_content: "The Sith Order was an ancient organization of dark side Force users who sought power through passion, strength, and domination. Following the Rule of Two established by Darth Bane, only two Sith existed at any time: a master and an apprentice. This ensured that the dark side remained concentrated and that the stronger would always prevail through conflict.\n\nDuring the Original Trilogy era, the Sith were represented by Emperor Palpatine (Darth Sidious) as the master and his apprentice Darth Vader (formerly Anakin Skywalker). Palpatine orchestrated the fall of the Republic and the Jedi Order through decades of manipulation, while Vader served as his enforcer and the face of Imperial terror.\n\nThe Sith philosophy embraced emotion, particularly anger and hatred, as sources of power. Unlike the Jedi's emphasis on peace and selflessness, Sith teachings encouraged ambition, aggression, and the pursuit of personal power. The Rule of Two created an inherent tension between master and apprentice, as the apprentice was expected to eventually challenge and destroy their master.",
        key_figures: "Emperor Palpatine (Darth Sidious), Darth Vader (Anakin Skywalker)",
        source: "A New Hope, The Empire Strikes Back, Return of the Jedi",
        wookieepedia_url: "https://starwars.fandom.com/wiki/Order_of_the_Sith_Lords"
      },
      {
        id: "imperial-navy",
        name: "Imperial Navy",
        type: "Military Organization",
        alignment: "Dark Side",
        era: "Galactic Civil War", 
        headquarters: "Imperial Center, Kuat Drive Yards",
        philosophy: "Superiority through technological might",
        description: "Primary naval force of the Galactic Empire, featuring massive Star Destroyers and the Death Star.",
        detailed_content: "The Imperial Navy was the space-based military force of the Galactic Empire, built around the imposing wedge-shaped Star Destroyers that served as symbols of Imperial power. The fleet grew from the Republic Navy's assets during the Clone Wars, expanding massively under Imperial rule to maintain control over thousands of systems.\n\nImperial-class Star Destroyers formed the backbone of the fleet, each capable of carrying TIE fighter squadrons and deploying ground forces. The Navy's crown jewel was the Death Star, a moon-sized battle station capable of destroying entire planets. Admiral Ozzel, Admiral Piett, and other senior officers commanded various fleet elements under Darth Vader's direct authority.\n\nNaval doctrine emphasized overwhelming firepower and psychological intimidation. Imperial crews were highly trained but often promoted based on political loyalty rather than pure merit. The Navy's primary weakness was overconfidence in conventional tactics, which the more nimble Rebel fleet exploited at battles like Yavin and Endor.",
        key_figures: "Admiral Ozzel, Admiral Piett, Captain Needa, Admiral Ackbar (enemy)",
        source: "A New Hope, The Empire Strikes Back, Return of the Jedi",
        wookieepedia_url: "https://starwars.fandom.com/wiki/Imperial_Navy"
      },
      {
        id: "bounty-hunters-guild",
        name: "Bounty Hunters' Guild",
        type: "Professional Organization",
        alignment: "Neutral",
        era: "Galactic Civil War",
        headquarters: "Various locations",
        philosophy: "Profit through capture of wanted individuals",
        description: "Professional organization of bounty hunters operating throughout the galaxy.",
        detailed_content: "The Bounty Hunters' Guild was a loose professional organization that provided structure and contracts for independent bounty hunters operating across the galaxy. While not formally aligned with any government, many members took contracts from the Empire, crime syndicates, and private clients seeking to capture fugitives.\n\nNotable members included Boba Fett, the most feared bounty hunter in the galaxy and son of clone template Jango Fett. Other prominent hunters like Dengar, Bossk, IG-88, 4-LOM, and Zuckuss competed for high-value targets. The Guild provided networking opportunities, shared intelligence, and occasionally mediated disputes between hunters.\n\nDuring the Original Trilogy era, Darth Vader personally hired multiple bounty hunters to track down the Millennium Falcon and its crew. Boba Fett successfully tracked them to Cloud City, earning a substantial reward for delivering Han Solo to Jabba the Hutt. The Guild's reputation for effectiveness made them valuable assets to anyone needing discrete capture services.",
        key_figures: "Boba Fett, Dengar, Bossk, IG-88, 4-LOM, Zuckuss",
        source: "The Empire Strikes Back, Return of the Jedi",
        wookieepedia_url: "https://starwars.fandom.com/wiki/Bounty_Hunters'_Guild"
      },
      {
        id: "hutt-cartel",
        name: "Hutt Cartel",
        type: "Criminal Organization",
        alignment: "Neutral",
        era: "Galactic Civil War",
        headquarters: "Nal Hutta, Tatooine",
        philosophy: "Profit through crime and intimidation",
        description: "Criminal syndicate controlled by Hutt crime lords, dominating illegal activities in the Outer Rim.",
        detailed_content: "The Hutt Cartel was one of the galaxy's most powerful criminal organizations, dominated by the slug-like Hutt species who controlled vast territories in the Outer Rim. Led by figures like Jabba the Hutt, the Cartel operated outside Imperial jurisdiction through a combination of bribery, intimidation, and strategic partnerships.\n\nJabba's palace on Tatooine served as the cartel's most visible stronghold, where the crime lord held court surrounded by bounty hunters, smugglers, and various alien species. The Cartel's operations included spice smuggling, slavery, gambling, and protection rackets. Han Solo's debt to Jabba for dumping a spice cargo became a major plot point, leading to his carbonite freezing.\n\nThe organization's power derived from its control of hyperspace routes in lawless regions where the Empire's reach was limited. Hutt space served as a haven for criminals and rebels alike, though the Hutts cared little for politics beyond profit. Their influence extended through generations of accumulated wealth and carefully maintained criminal networks.",
        key_figures: "Jabba the Hutt, Bib Fortuna, various enforcers and bounty hunters",
        source: "A New Hope, Return of the Jedi",
        wookieepedia_url: "https://starwars.fandom.com/wiki/Hutt_Clan"
      },
      {
        id: "cloud-city-administration",
        name: "Cloud City Administration",
        type: "Local Government",
        alignment: "Neutral",
        era: "Galactic Civil War",
        headquarters: "Cloud City, Bespin",
        philosophy: "Independence through neutrality and profit",
        description: "Local government of Cloud City, administered by Lando Calrissian during the Galactic Civil War.",
        detailed_content: "Cloud City was a tibanna gas mining operation and independent city floating in the atmosphere of the gas giant Bespin. Under the administration of Baron Administrator Lando Calrissian, the city maintained careful neutrality during the Galactic Civil War, seeking to avoid Imperial entanglements while maintaining profitable mining operations.\n\nThe city's economy depended on tibanna gas extraction, which was essential for blaster and starship weapon manufacturing. Cloud City's strategic location and valuable resources made it attractive to the Empire, though Lando worked to keep Imperial presence minimal. The administration employed thousands of workers, including humans, Ugnaughts, and other species.\n\nLando's leadership was tested when Darth Vader arrived and forced him to betray his old friend Han Solo to protect the city's population. This difficult choice demonstrated the precarious position of neutral governments caught between the Empire and Rebellion. After the Imperial occupation, Lando evacuated the city and joined the Rebel Alliance.",
        key_figures: "Lando Calrissian, Lobot, Ugnaught workers",
        source: "The Empire Strikes Back",
        wookieepedia_url: "https://starwars.fandom.com/wiki/Cloud_City"
      },
      {
        id: "death-star-command",
        name: "Death Star Command",
        type: "Military Organization",
        alignment: "Dark Side",
        era: "Galactic Civil War",
        headquarters: "Death Star",
        philosophy: "Rule through fear of ultimate destruction",
        description: "Military command structure of the Death Star battle station, led by Grand Moff Tarkin.",
        detailed_content: "Death Star Command represented the Empire's ultimate expression of the Tarkin Doctrine: rule through fear of force rather than force itself. The battle station's command structure was headed by Grand Moff Wilhuff Tarkin, with various military officers managing different operational aspects of the massive facility.\n\nThe Death Star housed over a million Imperial personnel, including naval officers, stormtroopers, technicians, and support staff. Key personnel included Commander Praji, General Tagge, and Chief Bast, who advised Tarkin on operational matters. The station's primary purpose was psychological: the ability to destroy entire planets would supposedly end all rebellion against Imperial rule.\n\nThe command structure reflected typical Imperial hierarchy, with competing officers vying for position and favor. This internal politics sometimes hampered effectiveness, as seen in the dismissal of concerns about the Rebel attack on Yavin. The Death Star's destruction at the Battle of Yavin eliminated most of the command staff and proved that the Empire's technological terror could be defeated.",
        key_figures: "Grand Moff Tarkin, Chief Bast, General Tagge, Commander Praji",
        source: "A New Hope",
        wookieepedia_url: "https://starwars.fandom.com/wiki/Death_Star"
      },
      {
        id: "endor-indigenous-ewoks",
        name: "Endor Indigenous Ewoks",
        type: "Indigenous People",
        alignment: "Light Side",
        era: "Galactic Civil War",
        headquarters: "Bright Tree Village, Endor",
        philosophy: "Harmony with forest moon ecosystem",
        description: "Native species of the forest moon Endor who aided the Rebel Alliance against the Empire.",
        detailed_content: "The Ewoks were a primitive but resourceful species of small furry humanoids who inhabited the forest moon of Endor. Living in elaborate tree villages, they had developed a sophisticated culture based on shamanistic traditions, tribal governance, and harmony with their forest environment. Chief Chirpa led the Bright Tree Village tribe during the Galactic Civil War.\n\nDespite their primitive technology, the Ewoks proved to be formidable warriors when defending their homeland. They initially captured and planned to sacrifice Luke Skywalker, Han Solo, and Chewbacca, but C-3PO's apparent divine status (as a 'golden god') convinced them to aid the Rebels. Wicket W. Warrick became particularly attached to Princess Leia after finding her unconscious in the forest.\n\nThe Ewoks' intimate knowledge of Endor's terrain proved crucial during the Battle of Endor. Using primitive weapons, traps, and guerrilla tactics, they helped the Rebel strike team destroy the Death Star II's shield generator. Their contribution was essential to the Rebellion's ultimate victory over the Empire, proving that courage and determination could overcome technological superiority.",
        key_figures: "Chief Chirpa, Wicket W. Warrick, Logray, Paploo",
        source: "Return of the Jedi",
        wookieepedia_url: "https://starwars.fandom.com/wiki/Ewok"
      },
      {
        id: "jabba-criminal-empire",
        name: "Jabba's Criminal Empire",
        type: "Criminal Organization",
        alignment: "Dark Side",
        era: "Galactic Civil War",
        headquarters: "Jabba's Palace, Tatooine",
        philosophy: "Power through fear and entertainment",
        description: "Personal criminal organization of Jabba the Hutt, controlling illegal activities on Tatooine.",
        detailed_content: "Jabba the Hutt's personal criminal empire operated from his fortress palace on Tatooine, where the Hutt crime lord held court surrounded by a diverse array of criminals, aliens, and entertainers. The organization's power extended throughout Tatooine's underworld and connected to broader galactic criminal networks.\n\nThe palace served as both headquarters and entertainment venue, featuring a throne room where Jabba conducted business while enjoying musical performances and feeding enemies to his pet rancor. Key lieutenants included Bib Fortuna, the Twi'lek majordomo who managed daily operations, and various enforcers like Salacious Crumb and the Max Rebo Band.\n\nJabba's empire controlled smuggling routes, protection rackets, and slave trading throughout the Outer Rim. The crime lord's collection of frozen Han Solo in carbonite demonstrated his power and served as a warning to other debtors. The organization's downfall came when Luke Skywalker infiltrated the palace and killed Jabba during the rescue of Han Solo, scattering his criminal network.",
        key_figures: "Jabba the Hutt, Bib Fortuna, Salacious Crumb, various bounty hunters",
        source: "Return of the Jedi",
        wookieepedia_url: "https://starwars.fandom.com/wiki/Jabba_Desilijic_Tiure"
      },
      {
        id: "imperial-intelligence",
        name: "Imperial Intelligence",
        type: "Government",
        alignment: "Dark Side",
        era: "Galactic Civil War",
        headquarters: "Imperial Center",
        philosophy: "Information as the ultimate weapon",
        description: "Intelligence and security service of the Galactic Empire, gathering information on threats to Imperial rule.",
        detailed_content: "Imperial Intelligence served as the Empire's primary information gathering and analysis organization, tasked with identifying and neutralizing threats to Imperial security. Operating through a vast network of agents, informants, and surveillance systems, the organization monitored both external enemies and internal dissidents.\n\nThe service's operations ranged from infiltrating Rebel cells to conducting counterintelligence against alien governments. Imperial Intelligence analysts provided threat assessments to military commanders and regional governors, helping coordinate responses to Rebel activities. The organization also managed propaganda efforts to maintain public support for Imperial policies.\n\nDuring the Original Trilogy era, Imperial Intelligence faced the challenge of tracking the elusive Rebel Alliance while managing information about the Death Star project. The service's effectiveness was hampered by the Empire's rigid hierarchy and political infighting between different Imperial agencies. Despite advanced surveillance technology, they consistently underestimated the Rebellion's capabilities and popular support.",
        key_figures: "Various intelligence officers and analysts",
        source: "A New Hope, The Empire Strikes Back, Return of the Jedi",
        wookieepedia_url: "https://starwars.fandom.com/wiki/Imperial_Intelligence"
      },
      {
        id: "moisture-farmers-cooperative",
        name: "Moisture Farmers' Cooperative",
        type: "Trade Organization",
        alignment: "Neutral",
        era: "Galactic Civil War",
        headquarters: "Anchorhead, Tatooine",
        philosophy: "Survival through cooperation and water conservation",
        description: "Loose organization of Tatooine moisture farmers working together for survival in the harsh desert environment.",
        detailed_content: "The Moisture Farmers' Cooperative was an informal association of settlers who operated moisture farms across Tatooine's desert landscape. These hardy individuals extracted water from the planet's dry atmosphere using vaporator technology, creating small oases of life in the otherwise hostile environment.\n\nOwen and Beru Lars were prominent members of this community, operating their farm in relative isolation while maintaining connections to other farmers through occasional gatherings at Anchorhead. The cooperative shared information about weather patterns, equipment maintenance, and market prices for moisture and agricultural products.\n\nLife for moisture farmers was characterized by constant vigilance against Tusken Raider attacks, equipment failures, and the harsh desert climate. The cooperative provided mutual support during emergencies and served as a social network for the scattered farming community. Their simple lifestyle represented the backbone of Tatooine's legitimate economy, contrasting sharply with the criminal activities centered in Mos Eisley.",
        key_figures: "Owen Lars, Beru Lars, various Anchorhead farmers",
        source: "A New Hope",
        wookieepedia_url: "https://starwars.fandom.com/wiki/Moisture_farmer"
      },
      {
        id: "rebel-fleet-command",
        name: "Rebel Fleet Command",
        type: "Military Organization",
        alignment: "Light Side",
        era: "Galactic Civil War",
        headquarters: "Various mobile fleet locations",
        philosophy: "Mobility and tactical flexibility against superior forces",
        description: "Naval command structure of the Rebel Alliance, coordinating starfighter and capital ship operations.",
        detailed_content: "Rebel Fleet Command coordinated the Alliance's naval operations through a decentralized structure designed to avoid the catastrophic losses that centralized command might suffer. Led by Admiral Ackbar and other experienced officers, the fleet relied on mobility, intelligence, and tactical innovation to overcome Imperial numerical superiority.\n\nThe Rebel fleet consisted primarily of smaller, more maneuverable ships like Mon Calamari cruisers, Corellian corvettes, and various classes of starfighters including X-wings, Y-wings, and A-wings. Each ship type served specific tactical roles, with starfighters providing precision strikes while larger vessels engaged Imperial Star Destroyers.\n\nFleet operations emphasized hit-and-run tactics, avoiding prolonged engagements with superior Imperial forces. The fleet's greatest triumph came at the Battle of Endor, where Admiral Ackbar commanded a coordinated assault that destroyed the second Death Star and broke Imperial naval power. This victory demonstrated how effective leadership and tactical flexibility could overcome technological disadvantages.",
        key_figures: "Admiral Ackbar, General Dodonna, various squadron leaders",
        source: "A New Hope, The Empire Strikes Back, Return of the Jedi",
        wookieepedia_url: "https://starwars.fandom.com/wiki/Alliance_Fleet"
      },
      {
        id: "tusken-raiders",
        name: "Tusken Raiders",
        type: "Indigenous People",
        alignment: "Neutral",
        era: "Galactic Civil War",
        headquarters: "Various desert camps, Tatooine",
        philosophy: "Preservation of traditional desert nomad culture",
        description: "Nomadic desert dwellers of Tatooine who fiercely defend their territory against outsiders.",
        detailed_content: "The Tusken Raiders, also known as Sand People, were the indigenous nomadic inhabitants of Tatooine who had adapted to survive in the planet's harsh desert environment. Organized into small tribal bands, they moved across the desert in seasonal patterns, fiercely defending their territory against moisture farmers, traders, and other off-world settlers.\n\nTusken culture was built around survival in the desert, with traditions emphasizing warrior prowess, desert navigation, and respect for the harsh environment. They rode banthas, large mammoth-like creatures perfectly adapted to desert life, and their distinctive robes and masks protected them from Tatooine's twin suns while concealing their faces from outsiders.\n\nThe Tuskens viewed off-world colonists as invaders who disrupted the desert's natural balance. Their raids on moisture farms and travelers created ongoing tension with the settler community. While often portrayed as savage by colonists, the Tusken Raiders possessed a complex culture with sophisticated desert survival techniques developed over generations of harsh desert living.",
        key_figures: "Various tribal chieftains and warriors",
        source: "A New Hope",
        wookieepedia_url: "https://starwars.fandom.com/wiki/Tusken_Raider"
      }
    ];
  }

  async updateFactions() {
    try {
      console.log('🔄 Enhanced Faction Content Update');
      console.log('===================================');
      console.log('');

      // Connect to databases
      console.log('📡 Connecting to databases...');
      await MongoDBService.connect();
      
      const neo4jService = new Neo4jService();
      await neo4jService.connect();
      
      console.log('✅ Connected to databases');
      console.log('');

      const enhancedFactions = this.getEnhancedCanonicalFactions();
      
      console.log('🗑️ Removing existing faction data...');
      
      // Clear existing factions from MongoDB
      const mongoDb = MongoDBService.getDatabase();
      const factionsCollection = mongoDb.collection('factions');
      const deleteResult = await factionsCollection.deleteMany({});
      console.log(`   ✅ Removed ${deleteResult.deletedCount} factions from MongoDB`);
      
      // Clear existing factions from Neo4j
      const neo4jQuery = `
        MATCH (n:Faction) 
        DETACH DELETE n
      `;
      const neo4jResult = await neo4jService.run(neo4jQuery);
      console.log(`   ✅ Removed faction nodes from Neo4j`);
      
      console.log('');

      console.log('⚔️ Importing enhanced factions...');
      
      // Import to MongoDB
      for (const faction of enhancedFactions) {
        await factionsCollection.insertOne(faction);
      }
      console.log(`   ✅ Inserted ${enhancedFactions.length} enhanced factions into MongoDB`);
      
      // Import to Neo4j
      for (const faction of enhancedFactions) {
        const neo4jQuery = `
          CREATE (f:Faction {
            id: $id,
            name: $name,
            type: $type,
            alignment: $alignment,
            era: $era,
            headquarters: $headquarters,
            philosophy: $philosophy,
            description: $description,
            detailed_content: $detailed_content,
            key_figures: $key_figures,
            source: $source,
            wookieepedia_url: $wookieepedia_url
          })
        `;
        await neo4jService.run(neo4jQuery, faction);
      }
      console.log(`   ✅ Inserted ${enhancedFactions.length} enhanced factions into Neo4j`);
      
      console.log('');
      console.log('🎯 Enhanced faction update complete!');
      console.log('');
      console.log('📊 Enhanced Features Added:');
      console.log('   • Detailed 2-3 paragraph content for each faction');
      console.log('   • Wookieepedia URLs for direct source access');
      console.log('   • Key figures and leadership information');
      console.log('   • Enhanced organizational details');
      console.log('');

      await neo4jService.disconnect();
      await MongoDBService.disconnect();
      
    } catch (error) {
      console.error('💥 Enhanced faction update failed:', error.message);
      process.exit(1);
    }
  }
}

// Run the update
const updater = new EnhancedFactionUpdater();
updater.updateFactions().then(() => {
  console.log('✨ Enhanced faction content ready for improved lore page!');
  process.exit(0);
}).catch(error => {
  console.error('Error:', error);
  process.exit(1);
});