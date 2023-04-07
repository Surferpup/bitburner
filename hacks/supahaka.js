/** @param {NS} ns */
let QueenName = "Queen"
export async function main(ns) {
	var hackDir = "/hacks/";
	var scriptDir = "/scripts/";
	
	var delay = 10; //if we ever want to await something.
	
	var baseServers = ns.scan("home");
	
	var manualServers = ["neo-net", "max-hardware", "phantasy", "the-hub", "computek", "nectar-net", "catalyst"];
	var manualServers2 =["omega-net", "zer0", "silver-helix", "netlink", "icarus", "defcomm", "syscore"];
	var manualServers3 = ["aevum-police", "rho-construction", "alpha-ent", "zb-def", "galactic-cyber"];
	var manualServers4 = ["unitalife", "omnia", "global-pharm", ".", "vitalife", "solaris"];
	var hospitals = ["johnson-ortho", "nova-med", "zeus-med"]; 
	var schools = ["rothman-uni", "summit-uni", "zb-institute"];
	var gyms = ["snap-fitness", "crush-fitness", "millenium-fitness", "iron-gym", "powerhouse-fitness"];
	var corpos = ["lexo-corp", "aerocorp", "deltaone", "univ-energy", "infocomm", "solaris", "taiyang-digital"];
	var corpos2 = ["helios", "kuai-gong", "megacorp", "vitalife", "applied-energetics", "microdyne", "nwo", "fulcrumassets", "ecorp"];
	var corpos3 = ["titan-labs", "fulcrumtech", "stormtech", "omnitek", "b-and-a", "The-Cave", "4sigma", "clarkinc", "blade"];
	var factionServers = ["CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z"]; //Need to backdoor these too

	manualServers = manualServers.concat(corpos);
	manualServers = manualServers.concat(corpos2);
	manualServers = manualServers.concat(corpos3);
	manualServers = manualServers.concat(gyms);	
	manualServers = manualServers.concat(schools);
	manualServers = manualServers.concat(hospitals);
	manualServers = manualServers.concat(manualServers2);
	manualServers = manualServers.concat(manualServers3);
	manualServers = manualServers.concat(manualServers4);
	manualServers = manualServers.concat(factionServers);
	baseServers = baseServers.concat(manualServers); 
	//var servers = [];
	//Find all servers of depth 2
	/*
	for (var i = 0; i < baseServers.length; i++)
	{
		var server= baseServers[i]
		servers = servers.concat(server);
		var subServers = ns.scan(server);
		servers = servers.concat(subServers);
	}
	*/ //we are having some issues with duplicates in the server list: resolve when a deeper search is needed.
	//ns.print(servers);
	
	//Possible passed argument for later
	var passed = null;
	if (ns.args.length > 0){
		passed = ns.args[0];
	} // does nothing right now, just leaving it for an argument later.

	while (true){
		//Just keep trying to hack servers until the end of time.
		//Eventually, the server list should have all the games server in it, so this will just executing hacks.
		await hackServers(ns, factionServers); //This should favor hacking these servers.  They are still there in baseServers too.
		await hackServers(ns, baseServers);
		await ns.sleep(delay * 1000); //
	}
}
//Hack Servers:
export async function hackServers(ns, serverList){
	var hackDir = "/hacks/"
	var hackName = hackDir + "inquiryHack.js";
	//These are all the commands that open ports
	var commands = ["FTPCrack.exe", "HTTPWorm.exe", "BruteSSH.exe", "RelaySMTP.exe", "SQLInject.exe"];
	for (var i = 0; i < serverList.length; i++)
		{
			//Player Stats:
			var hackingSkill = await ns.getHackingLevel(); //Player's hacking skill
			var portHacks = 0 //How many port hacks do we have available right now?
			for (var j = 0; j<commands.length; j++) {if (ns.fileExists(commands[j])) {portHacks++;}}
			
			var targetServer = serverList[i];
			if (targetServer == null) {continue;}
			if (targetServer == QueenName) {continue;} //Don't hack the queen please
		 	
			var hackLevel = ns.getServerRequiredHackingLevel(targetServer);
			var portsRequired = ns.getServerNumPortsRequired(targetServer);
			if ((hackingSkill >= hackLevel) && (portsRequired <= portHacks))
			{
				ns.exec(hackDir + "openSesame.js", "home", 1, targetServer);
				//if (!ns.hasRootAccess(targetServer)) {ns.exec("backdoor", targetServer, 1);}
				var freeRam = ns.getServerMaxRam(targetServer) - ns.getServerUsedRam(targetServer);
				
				var ramCost = ns.getScriptRam(hackName);
				if (ramCost == 0) {continue;} //Don't divide by 0, lets keep working in case the script wasn't found
				//ns.alert("ramCost: " + ramCost + " on " + (hackDir + "fluffer.js"));
				var threadCount = Math.floor(freeRam / ramCost);

				if (threadCount > 0) {ns.exec(hackName, targetServer, threadCount, targetServer);}
			} // end if hackingSkil >= hackLevel && portsRequired <= portHacks
		} //end for
} //end hackServers
