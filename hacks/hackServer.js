let HiveDir = "/hive/"
let HackDir = "/hacks/"
/** @param {NS} ns */
export async function main(ns) {
    var puff = HackDir + "enervate.js";
    var targetServer = null;
    if (ns.args.length > 0){
        puff = ns.args[0];
    } //First arg is what you'd like the pufferfish to puff out to the server
    if (ns.args.length > 1){
        targetServer = ns.args[1];
    } //Second arg is what server you'd like all of this to target.

    ns.killall("home"); //a controversial line to be sure.
    await ns.sleep(1 * 1000) //Let the kill do something.
    //QueenBee will eventually push this command out to the hive, among other things.
    ns.exec(HiveDir + "queenBee.js", "home", 1, puff, targetServer);
    //Lets exec this command on home.
    ns.exec(HackDir + "pufferFish.js", "home", 1, puff, targetServer);
} //end main
