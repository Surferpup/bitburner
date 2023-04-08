/** @param {NS} ns */
export async function main(ns) {
    //const root = "https://raw.githubusercontent.com/suferpup/bitburner/main/";
    const root = "https://raw.githubusercontent.com/Surferpup/bitburner/main/"
    const files = [ "hackServer.js","hacks/supahaka.js","hacks/inquiyHack.js","hacks/openSesame.js","hacks/pufferFish.js",
                    "hive/royalJelly.js","hive/queenBee.js","hive/buildHive.js","hive/hiveManagement.js","hive/updateHive.js",
                    "stocks/stonks.js","surferpup_playground/directoryPull.js"];
    for (const file of files) {
        let arg1 = root + file
        let arg2 =  file.includes("/") ? "/" + file : file
        ns.tprintf(arg1,arg2)
        await ns.wget(arg1,arg2);
    } // end for
} //end main
// end file wget_surfer.js
