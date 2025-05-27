#!/usr/bin/env node

/**
 * Enhanced Faction Content Update via API
 * Updates faction data with detailed content and Wookieepedia URLs
 */

const axios = require('axios');

class EnhancedFactionUpdater {
  
  constructor() {
    this.apiBase = 'http://localhost:3000/api';
  }

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
      }
    ];
  }

  async updateFactionViaAPI(faction) {
    try {
      // First delete existing faction
      await axios.delete(`${this.apiBase}/world/factions/${faction.id}`, {
        timeout: 5000
      }).catch(() => {}); // Ignore if doesn't exist
      
      // Then create the enhanced faction
      const response = await axios.post(`${this.apiBase}/world/factions`, faction, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Failed to update faction ${faction.name}:`, error.message);
      throw error;
    }
  }

  async updateFactions() {
    try {
      console.log('🔄 Enhanced Faction Content Update via API');
      console.log('==========================================');
      console.log('');

      const enhancedFactions = this.getEnhancedCanonicalFactions();
      
      console.log('⚔️ Updating enhanced factions...');
      
      let successCount = 0;
      for (const faction of enhancedFactions) {
        try {
          await this.updateFactionViaAPI(faction);
          console.log(`   ✅ Updated: ${faction.name}`);
          successCount++;
        } catch (error) {
          console.log(`   ❌ Failed: ${faction.name} - ${error.message}`);
        }
      }
      
      console.log('');
      console.log(`🎯 Enhanced faction update complete! (${successCount}/${enhancedFactions.length} successful)`);
      console.log('');
      console.log('📊 Enhanced Features Added:');
      console.log('   • Detailed 2-3 paragraph content for each faction');
      console.log('   • Wookieepedia URLs for direct source access');
      console.log('   • Key figures and leadership information');
      console.log('   • Enhanced organizational details');
      console.log('');
      
    } catch (error) {
      console.error('💥 Enhanced faction update failed:', error.message);
      throw error;
    }
  }
}

// Run the update
async function main() {
  try {
    const updater = new EnhancedFactionUpdater();
    await updater.updateFactions();
    console.log('✨ Enhanced faction content ready for improved lore page!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();