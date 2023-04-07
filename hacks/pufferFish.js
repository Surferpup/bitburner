/** @param {NS} ns */
export async function main(ns) {
    var host = ns.getHostname(); // Defaults to wherever you ran it, but you can pass a server in.
    var target = null;
    var scriptName = null;
    if (ns.args.length > 0){
        scriptName = ns.args[0];
    }
    else 
    {
        
        //scriptName = "/hacks/enervate.js";
        scriptName = "/hacks/fluffer.js";
        //scriptName = "/hacks/genHack.js";
    }
    if (ns.args.length > 1) {
        target = ns.args[1];
    }
    else {target = "defcomm";}
    //ns.tprint("Firing up " + threadCount + " threads of " + scriptName + " at " + target + " on " + host);

    var freeRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
    var ramCost = ns.getScriptRam(scriptName);
    
    if ((ramCost == 0) || (freeRam < ramCost)) {return null;} //This occurs if your scriptName wasn't found
    
    var threadCount = Math.floor(freeRam / ramCost);
    if (threadCount == null) {return null;} //should sese why this is necessary.
    if (threadCount > 0) 
    {
        ns.tprint("Firing up " + threadCount + "threads of " + scriptName + " at " + target + " on " + host);    ns.tprint("Firing up " + threadCount + "threads of " + scriptName + " at " + target + " on " + host);
        ns.exec(scriptName, host, threadCount, target);
    }
}
