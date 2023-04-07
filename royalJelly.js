let QueenName = "Queen"
let HiveDir = "/hive/"
let HackDir = "/hacks/"
let ScriptDir = "/scripts/"
/** @param {NS} ns */
export async function main(ns) {
	//ns.tprint("Royal Jelly main Called.")
	var myServers = ns.getPurchasedServers();
	var queenMemory = 64
	if (myServers.length == 0) {
		buildQueen(ns, queenMemory)
		myServers = ns.getPurchasedServers(); //update since we probably bought a server
	} //end if myServers.length = 0
	
	if (myServers.length > 0) {
		feedQueen(ns, queenMemory)		
	} //end if myServers.length > 0
}
//This will buy the queen server if we don't have one yet.
function buildQueen(ns, queenMemory=64){
	//ns.tprint("Build Queen Called.")
	ns.purchaseServer(QueenName, newServerMemory); //this can fail, requires money
} //buildQueen
//This will make sure the server we have found is a proper queen.
//For now, what this means is we rename it, we upgrade it's size, and we copy over required files.
function feedQueen(ns, queenMemory=64){
	//ns.tprint("Feed Queen Called.")
	var originalServerName = chooseQueen(ns)
	ns.renamePurchasedServer(originalServerName, QueenName);
	ns.upgradePurchasedServer(QueenName, queenMemory); //this can fail, requires money.
	copyFiles(ns, QueenName)
} //feedQueen
//Returns the name of the server we will make into the queen.
//You could do something clever here, like finding the biggest one or something like that.
function chooseQueen(ns){
	return ns.getPurchasedServers()[0]
} //chooseQueen
//For now, this function just copies a bunch of required scripts over onto the queen's server.
function copyFiles(ns, serverName=QueenName) {
	var queenRequiredFiles = ["hackServer.js"] //Root level required files
	var scriptFiles = [	ScriptDir + "runHacknet.js", ScriptDir + "stonks.js", ScriptDir + "supahaka.js",  
											ScriptDir + "setStockReserve.js", ScriptDir + "sharingIsCaring.js"] //scriptFiles
	var hiveFiles = [	HiveDir + "hiveManagement.js", HiveDir + "buildHive.js", HiveDir + "upgradeHive.js",
										HiveDir + "queenBee.js",HiveDir + "royalJelly.js"] //hiveFiles
	var hackFiles = [	HackDir + "pufferFish.js", HackDir + "inquiryHack.js", 
										HackDir + "BusinessBusinessBusiness.js", HackDir + "fluffer2.js",] //hackFiles
	queenRequiredFiles = queenRequiredFiles.concat(hiveFiles)
	queenRequiredFiles = queenRequiredFiles.concat(hackFiles)
	queenRequiredFiles = queenRequiredFiles.concat(scriptFiles)
	
	for (var j=0; j < queenRequiredFiles.length; j++){
					ns.scp(queenRequiredFiles[j], serverName);
				}
} //end copyFiles