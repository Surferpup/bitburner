//file hiveManagement.js
/** @param {NS} ns */

const QueenName = "Queen"
export async function main(ns) {
	
	var targetServer = "joesguns";
	var scriptToRun = "/hacks/pufferFish.js";
	var puff = "/scripts/sharingIsCaring.js";
	var requiredFiles = ["/hacks/fluffer.js", "/hacks/pufferFish.js", "/scripts/sharingIsCaring.js", "/hacks/BusinessBusinessBusiness.js",
	 "/hacks/genHack.js","/hacks/enervate.js", "/hacks/fluffer2.js", "/hacks/pumpStock.js", "/hacks/dumpStock.js",
	 "/hacks/inquiryHack.js"];
	var queenRequiredFiles = ["/scripts/runHacknet.js", "/scripts/stonks.js", "/scripts/hiveManagement.js", "/scripts/buildHive.js",
														"/scripts/supahaka.js", "hackServer.js","/scripts/setStockReserve.js"]
	if (ns.args.length > 0){
		puff = ns.args[0];
	}
	if (ns.args.length > 1){
		targetServer = ns.args[1];
	}

	var msg = "no_msg_specified";
	var baseName = "hive";
	var waitTime = 5; //Time to sleep per loop to avoid causing ui lag.

	var firstTime = true; //The first time we run, we want to free up all space on each server.
	while (true)
	{
		//For each server, execute the script.
		var myServers = ns.getPurchasedServers();
		for (var i = 0; i < myServers.length; i++) 
		{
			var server = myServers[i];
			var serverName = null;
			if (i == 0) {
				serverName = QueenName; //Defined in buildHive as well, or was at one time.
			}
			else
			{
				serverName = baseName + i;
			}
			
			ns.renamePurchasedServer(server, serverName);
			for (var j=0; j < requiredFiles.length; j++){
				ns.scp(requiredFiles[j], serverName);
			}
			if (serverName == QueenName) {
				for (var j=0; j < queenRequiredFiles.length; j++){
					ns.scp(queenRequiredFiles[j], serverName);
				}
			}
			if (firstTime && (serverName != QueenName)) {
				await ns.killall(serverName); //Free up all that space
			}
			if (serverName != QueenName){
				await ns.exec(scriptToRun, serverName, 1, puff, targetServer);
			}
		} // end for i < myServers.length
		firstTime = false;
		await ns.sleep(waitTime * 1000);
	}//end while true
} //end function main
//end file hiveManagement.js
