/** @param {NS} ns */
export async function main(ns) {
    var scriptsToMove = ["inquiryHack.js"];
    var scriptDir = "/hacks/";
    var commands = ["FTPCrack.exe", "HTTPWorm.exe", "BruteSSH.exe", "RelaySMTP.exe", "SQLInject.exe"];
    var target = ns.getHostname(); // Defaults to wherever you ran it, but you can pass a server in.
    if (ns.args.length > 0){
        target = ns.args[0];
    }
    if (target == null){
        return null;
    }
    for(var i = 0; i< commands.length; i++)
    {
        var fileName = commands[i];
        if (ns.fileExists(fileName)){
            if (fileName == "BruteSSH.exe"){ns.brutessh(target);}
            if (fileName == "FTPCrack.exe"){ns.ftpcrack(target);}
            if (fileName == "HTTPWorm.exe"){ns.httpworm(target);}
            if (fileName == "RelaySMTP.exe"){ns.relaysmtp(target);}
            if (fileName == "SQLInject.exe"){ns.sqlinject(target);}
        }
    }
    ns.nuke(target);
    //await installBackdoor();
    for(var i = 0; i< scriptsToMove.length; i++)
    {
        var scriptName = scriptsToMove[i];
        //alert( "Moving: " + scriptDir + scriptName + " to " + target);
        ns.scp(scriptDir + scriptName, target);
    }
}
