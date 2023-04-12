// file  poorbee
/**
 * main function for script
 * @param { NS } ns */

export async function main(ns) {
    function canHack(server) {
		var pHackLvl = ns.getHackingLevel(); // player
		var sHackLvl = ns.getServerRequiredHackingLevel(server);
		return pHackLvl >= sHackLvl;
	}

	const getNodeInfo = (node) => {
		const maxMoney = ns.getServerMaxMoney(node);

		const server = ns.getServer(node);
		const player = ns.getPlayer();
		const hackChance = hackChance(server, player);
		const revYield = maxMoney * hackChance;

		return {
			node,
			maxMoney,
			revYield
		}
        
        function hackChance(server, person) {
            const hackFactor = 1.75;
            const difficultyMult = (100 - server.hackDifficulty) / 100;
            const skillMult = hackFactor * person.skills.hacking;
            const skillChance = (skillMult - server.requiredHackingSkill) / skillMult;
            const chance =
              skillChance *
              difficultyMult *
              person.mults.hacking_chance *
              (1 + (1 * Math.pow(1, 0.8)) / 600);
            if (chance > 1) {
              return 1;
            }
            if (chance < 0) {
              return 0;
            }
          
            return chance;
          }
	};

} // end function main

// end file poorbee