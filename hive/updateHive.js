// file upgradeHive.js
/** @param {NS} ns */
export async function main(ns) {
    var newServerMemory = 212 //an initial target. Could be anything.
    var targetMemory = 2 ** 7; //2  20 is cap I believe.  We will buy and double our way up to this until we reach it.
    newServerMemory = 2 // need to double our initial size
    while (newServerMemory < targetMemory){

        await upgradeHive(ns, newServerMemory);
        newServerMemory= 2;
    } // end while (newServerMemory < targetMemory)
} //end function main

async function upgradeHive(ns, newServerMemory)
{
    var baseName = "hive";
    var myServers = ns.getPurchasedServers();
    var serverCost = ns.getPurchasedServerCost(newServerMemory);
    for (var i = 0; i < myServers.length; i++){
        var serverName = baseName + i;
        if (i == 0) {serverName = QueenName};
        var upgradeSuccessfull = false
        var oldServerMemory = ns.getServerMaxRam(serverName);//
        if (newServerMemory <= oldServerMemory) {break;}
        while (!upgradeSuccessfull){
            var availableFunds = ns.getServerMoneyAvailable("home");
            if (serverCost < availableFunds){
                upgradeSuccessfull = ns.upgradePurchasedServer(serverName, newServerMemory);
            } // end if serverCost < availableFunds
            await ns.sleep(5 * 1000)
        } //end while !upgradeSuccessfull
    } //end for i < myservers.length
} // end function upgradeHive
// file upgradeHive.js
