let QueenName = "Queen"; //Name for the "Queen" or command and control server
export async function main(ns) {
    var newServerMemory = null

    if (ns.args.length > 0){
        newServerMemory = ns.args[0];
    } 
    else{
        var twoPow = 6; //64 gigabytes, around 3.5 million
        newServerMemory = 2 ** twoPow;
    }
    if ((newServerMemory == null) || (newServerMemory <= 0)) {return null;} //We need a serverSize to proceed.

    var msg = null;
    var baseName = "hive"; //baseName for all servers

    var delay = 5;
    var myServers = ns.getPurchasedServers();
    while (myServers.length < ns.getPurchasedServerLimit())
    {
        //New Name:
        var newServerName = null;

        var newServerID = myServers.length;
        var newServerName = baseName + newServerID;
        if (newServerID == 0) {newServerName = QueenName;}
        var serverCost = ns.getPurchasedServerCost(newServerMemory);
        var availableFunds = ns.getServerMoneyAvailable("home");
        //msg = "Cost: " + serverCost + " Funds: " + availableFunds
        //ns.tprint(msg)
        //ns.print(msg)
        if (serverCost < availableFunds)
        {
            msg = "Buying: " + newServerName + " with " + newServerMemory + " RAM.";
            ns.tprint(msg);
            ns.purchaseServer(newServerName, newServerMemory);
        } //end if
        //Prevent obnoxious spinlocking:
        await ns.sleep(delay * 1000);
        myServers = ns.getPurchasedServers(); //updateServerList for whileLoop
    } // end while (myServers.length < ns.getPurchasedServerLimit())



} //end main
