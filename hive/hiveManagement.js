//file hiveManagement.js
/** @param {NS} ns */

let QueenName = "Queen"
let HiveDir = "/hive/"
let HackDir = "/hacks/"
let ScriptDir = "/scripts/"

export async function main(ns) {
    importBrain(ns)

    deployToHive(ns);
    //Get supahaka going
    ns.exec(HackDir + "supahaka.js", "home", 1)
    //var player = ns.getPlayer();
} //end function main

//This just imports all the scripts we need onto the queen server.
//If the queen server doesn't exist, it'll try to make one.
function importBrain(ns) {
    var royalJellyHost = "home" //needs to be on home to get the scripts
    ns.exec(HiveDir + "royalJelly.js", royalJellyHost, 1)
} end function importBrain

function deployToHive(ns, hiveManagementHost="home")
{

    var puff = HackDir + "inquiryHack.js";
    if (ns.args.length > 0){
        puff = ns.args[0];
    }
    var targetServer = "joesguns";
    if (ns.args.length > 1){
        targetServer = ns.args[1];
    }

    ns.scriptKill(HiveDir + "hiveManagement.js", hiveManagementHost);
    ns.exec(HiveDir + "hiveManagement.js", hiveManagementHost, 1, puff, targetServer);

} //end function deployToHive

//Fire up a copy of the script if it isn't up, ignore it if it is.
function maintain(ns, scriptName, targetServer, scriptArgs)
{
    if (targetServer == null) {targetServer = "home";}
    //if (scriptArgs == null) {scriptArgs = [];}
    if (!ns.isRunning(scriptName, targetServer)) {
        ns.exec(scriptName, targetServer, scriptArgs);
    }
} //end function maintain

//end file hiveManagement.js
