#!/usr/bin/env node

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/swrpg?authSource=admin';

// Enhanced faction content with Wookieepedia URLs and detailed information
const factionEnhancements = {
  "Bounty Hunters' Guild": {
    detailed_content: "The Bounty Hunters' Guild was a loose professional organization that provided structure and contracts for independent bounty hunters operating across the galaxy. While not formally aligned with any government, many members took contracts from the Empire, crime syndicates, and private clients seeking to capture fugitives.\n\nNotable members included Boba Fett, the most feared bounty hunter in the galaxy and son of clone template Jango Fett. Other prominent hunters like Dengar, Bossk, IG-88, 4-LOM, and Zuckuss competed for high-value targets. The Guild provided networking opportunities, shared intelligence, and occasionally mediated disputes between hunters.\n\nDuring the Original Trilogy era, Darth Vader personally hired multiple bounty hunters to track down the Millennium Falcon and its crew. Boba Fett successfully tracked them to Cloud City, earning a substantial reward for delivering Han Solo to Jabba the Hutt. The Guild's reputation for effectiveness made them valuable assets to anyone needing discrete capture services.",
    key_figures: "Boba Fett, Dengar, Bossk, IG-88, 4-LOM, Zuckuss",
    wookieepedia_url: "https://starwars.fandom.com/wiki/Bounty_Hunters'_Guild"
  },
  "Rebel Alliance": {
    detailed_content: "The Alliance to Restore the Republic was formed by Senator Mon Mothma, Princess Leia Organa, and other dissidents who opposed Emperor Palpatine's tyrannical rule. Operating from hidden bases across the galaxy, the Rebellion grew from a small insurgency into a full-scale military force capable of challenging Imperial supremacy.\n\nKey leaders included Princess Leia as a prominent senator and field commander, General Dodonna as chief military strategist, and Admiral Ackbar commanding the fleet. The Alliance's greatest victory came at the Battle of Yavin, where pilot Luke Skywalker destroyed the Death Star. After setbacks like the evacuation of Hoth, the Rebellion ultimately defeated the Empire at Endor.\n\nThe Alliance maintained strict operational security through cell-based organization, with individual units knowing only their immediate contacts. This structure protected the movement from Imperial infiltration while allowing coordinated strikes against key Imperial assets.",
    key_figures: "Princess Leia Organa, Mon Mothma, Luke Skywalker, Han Solo, General Dodonna, Admiral Ackbar",
    wookieepedia_url: "https://starwars.fandom.com/wiki/Alliance_to_Restore_the_Republic"
  },
  "Galactic Empire": {
    detailed_content: "The Galactic Empire emerged from the ashes of the Clone Wars when Chancellor Palpatine declared himself Emperor, transforming the democratic Republic into an authoritarian state. Ruling through fear and military might, the Empire maintained control over thousands of star systems with its massive fleet of Star Destroyers and the ultimate weapon, the Death Star.\n\nThe Empire's military hierarchy was dominated by ambitious officers like Grand Moff Tarkin, Admiral Ozzel, and countless other officials who competed for the Emperor's favor. At the apex stood Emperor Palpatine and his enforcer Darth Vader, who served as the Empire's primary agent of terror. The Imperial military doctrine emphasized overwhelming force and rapid deployment.\n\nImperial governance relied on regional governors called Moffs who administered entire star systems, often through brutal suppression of dissent. The Empire's xenophobic policies favored humans while oppressing alien species, contributing to widespread resentment that fueled the Rebel Alliance.",
    key_figures: "Emperor Palpatine, Darth Vader, Grand Moff Tarkin, Admiral Ozzel, Admiral Piett",
    wookieepedia_url: "https://starwars.fandom.com/wiki/Galactic_Empire"
  },
  "Jedi Order": {
    detailed_content: "The Jedi Order served as guardians of peace and justice in the Old Republic for over a thousand generations before being systematically destroyed during Order 66. The ancient organization trained Force-sensitive individuals to become knights and masters who wielded lightsabers and served as diplomats, protectors, and spiritual guides throughout the galaxy.\n\nBy the time of the Galactic Civil War, only a handful of Jedi remained alive: Obi-Wan Kenobi in exile on Tatooine, Yoda hidden on Dagobah, and eventually Luke Skywalker, who would restore the Order. The Jedi Code emphasized emotional control, selfless service, and harmony with the light side of the Force. Masters like Yoda taught that fear, anger, and hatred led to the dark side.\n\nLuke's training under both Obi-Wan and Yoda represented the continuation of ancient Jedi traditions, though he would ultimately forge a new path for the Order. The Jedi's connection to the Force allowed them to perform extraordinary feats, see the future, and influence others through mind tricks.",
    key_figures: "Luke Skywalker, Obi-Wan Kenobi, Yoda, Anakin Skywalker (fallen)",
    wookieepedia_url: "https://starwars.fandom.com/wiki/Jedi_Order"
  },
  "Hutt Cartel": {
    detailed_content: "The Hutt Cartel was one of the galaxy's most powerful criminal organizations, dominated by the slug-like Hutt species who controlled vast territories in the Outer Rim. Led by figures like Jabba the Hutt, the Cartel operated outside Imperial jurisdiction through a combination of bribery, intimidation, and strategic partnerships.\n\nJabba's palace on Tatooine served as the cartel's most visible stronghold, where the crime lord held court surrounded by bounty hunters, smugglers, and various alien species. The Cartel's operations included spice smuggling, slavery, gambling, and protection rackets. Han Solo's debt to Jabba for dumping a spice cargo became a major plot point, leading to his carbonite freezing.\n\nThe organization's power derived from its control of hyperspace routes in lawless regions where the Empire's reach was limited. Hutt space served as a haven for criminals and rebels alike, though the Hutts cared little for politics beyond profit. Their influence extended through generations of accumulated wealth and carefully maintained criminal networks.",
    key_figures: "Jabba the Hutt, Bib Fortuna, various enforcers and bounty hunters",
    wookieepedia_url: "https://starwars.fandom.com/wiki/Hutt_Clan"
  },
  "Cloud City Administration": {
    detailed_content: "Cloud City was a tibanna gas mining operation and independent city floating in the atmosphere of the gas giant Bespin. Under the administration of Baron Administrator Lando Calrissian, the city maintained careful neutrality during the Galactic Civil War, seeking to avoid Imperial entanglements while maintaining profitable mining operations.\n\nThe city's economy depended on tibanna gas extraction, which was essential for blaster and starship weapon manufacturing. Cloud City's strategic location and valuable resources made it attractive to the Empire, though Lando worked to keep Imperial presence minimal. The administration employed thousands of workers, including humans, Ugnaughts, and other species.\n\nLando's leadership was tested when Darth Vader arrived and forced him to betray his old friend Han Solo to protect the city's population. This difficult choice demonstrated the precarious position of neutral governments caught between the Empire and Rebellion. After the Imperial occupation, Lando evacuated the city and joined the Rebel Alliance.",
    key_figures: "Lando Calrissian, Lobot, Ugnaught workers",
    wookieepedia_url: "https://starwars.fandom.com/wiki/Cloud_City"
  }
};

async function enhanceFactionContent() {
  console.log('🔄 Enhancing Faction Content with Wookieepedia URLs');
  console.log('=================================================');
  console.log('');

  let client;
  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    const factionsCollection = db.collection('factions');
    
    console.log('');
    console.log('⚔️ Enhancing faction content...');
    
    let enhancedCount = 0;
    for (const [factionName, enhancement] of Object.entries(factionEnhancements)) {
      try {
        const result = await factionsCollection.updateOne(
          { name: factionName },
          { 
            $set: {
              detailed_content: enhancement.detailed_content,
              key_figures: enhancement.key_figures,
              wookieepedia_url: enhancement.wookieepedia_url
            }
          }
        );
        
        if (result.matchedCount > 0) {
          console.log(`   ✅ Enhanced: ${factionName}`);
          enhancedCount++;
        } else {
          console.log(`   ⚠️  Not found: ${factionName}`);
        }
      } catch (error) {
        console.log(`   ❌ Failed: ${factionName} - ${error.message}`);
      }
    }
    
    console.log('');
    console.log(`🎯 Enhancement complete! (${enhancedCount}/${Object.keys(factionEnhancements).length} enhanced)`);
    console.log('');
    console.log('📊 Enhanced Features Added:');
    console.log('   • Detailed 2-3 paragraph content for each faction');
    console.log('   • Wookieepedia URLs for direct source access');
    console.log('   • Key figures and leadership information');
    console.log('');
    
  } catch (error) {
    console.error('💥 Enhancement failed:', error.message);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log('📡 Disconnected from MongoDB');
    }
  }
}

// Run the enhancement
enhanceFactionContent()
  .then(() => {
    console.log('✨ Enhanced faction content ready!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error.message);
    process.exit(1);
  });