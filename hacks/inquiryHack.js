export async function main(ns) {
	var logging = false;
	var msg = null; //variable for holding messages for printing.
	if (logging) {
		msg = "InquiryHack called."
		ns.tprint(msg)
	} //end logging
	var delay = 1 //How many seconds should we wait at the end of each loop before starting again?
	var target = ns.getHostname()//The target of the hack
	var homeServer = ns.getHostname()//The server that will host the hack.
	
	
	//Handle passed args (homeServer and target)
	if (ns.args.length > 0){
		target = ns.args[0]
	}
	if (ns.args.length > 1){
		homeServer = ns.args[1]
	}
	if ((target == null) || (homeServer == null)) 
	{
		if (logging) {
			msg = "InquiryHack: Either target or homeserver was null, exiting."
			ns.tprint(msg)
		}
		return false; //Can't go on if either of these is null
	} //end if target == null || homeServer == null

	//Install Files
	var requiredFiles = ["/hacks/inquiryHack.js"];
	var installSuccess = install(ns, homeServer, requiredFiles);
	if (!installSuccess) {
		if (logging) {
			msg = "InquiryHack failed to install files."
			ns.tprint(msg)	
		}
		return false; //Can't go on without requiredFiles
	}

	var maxMoney = ns.getServerMaxMoney(target);
	var minSecurity = ns.getServerMinSecurityLevel(target);
	//Defines all hack thresholds:
	var sufficientHackMoney = maxMoney * 0.9;
	var minHackMoney = maxMoney * 0.2;
	var securityThreshold = minSecurity * 1.10;
	var msg = "Targeting: " + target + " with " + maxMoney + " maxMoney" + " and "+ securityThreshold + " minSercurity.";
	if (logging) {ns.tprint(msg);}

	var currentMoney = ns.getServerMoneyAvailable(target);
	//While true, weaken whenever server security is above our threshold.
	//While you don't have enough money, grow/weaken
	//While you have enough money, hack/weaken.
	while (true){
		//Weaken/Grow for grow, we run 1 grow and then go back to the top of the loop for weakening.
		while (currentMoney < sufficientHackMoney) {
			await weakener(ns, target, securityThreshold, logging);
			msg = "Growing " + target + " at " + currentMoney + "$ waiting for "+ sufficientHackMoney;
			if (logging) {ns.tprint(msg)}
			await ns.grow(target)
			currentMoney = ns.getServerMoneyAvailable(target); //This update is required for the while loop
		}// end while currentMoney < sufficientHackMoney
		
		//Weaken/Hack.  For hacks, we do one and then run weakener again.
		while (currentMoney > minHackMoney){
			await weakener(ns, target, securityThreshold, logging);
			msg = "Hacking " + target + " at " + currentMoney + "$. Growing at: " + minHackMoney;
			if (logging) {ns.tprint(msg)}
			await ns.hack(target);
			currentMoney = ns.getServerMoneyAvailable(target); //This update is required for the while loop
		} //end while currentMoney > minHackMoney
		
		await ns.sleep(delay * 1000);
	}
}
async function weakener(ns, target, securityThreshold, logging=false){
	var currentSecurity = ns.getServerSecurityLevel(target);
	while (currentSecurity > securityThreshold){
			var msg = "Weakening " + target + " at " + currentSecurity + " waiting for " + securityThreshold;
			if (logging) {ns.tprint(msg)}
			await ns.weaken(target);
			currentSecurity = ns.getServerSecurityLevel(target);
	}
}

function install(ns, homeServer, requiredFiles=null){
		//var targetServer = myServers[i];
		//var homeServer = baseName + i;
		if (("requiredFiles" == null) || (requiredFiles.length <= 0)) {requiredFiles =[scriptToRun];}
		for (var j=0; j < requiredFiles.length; j++){
			ns.scp(requiredFiles[j], homeServer);
		}
		/*		
		var freeRam = ns.getServerMaxRam(homeServer) - ns.getServerUsedRam(homeServer);
		var ramCost = ns.getScriptRam(scriptToRun);
		//alert("ramCost: " + ramCost + " freeRam: " + freeRam)
		if (ramCost == 0) {return null} //This occurs if your scriptName wasn't found
		var threadCount = Math.floor(freeRam / ramCost);
		if (threadCount > 0) {ns.exec(scriptToRun, homeServer, threadCount, targetServer);}
		*/
		return true
}
