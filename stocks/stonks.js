/** @param {NS} ns */

export const RESERVE_PORT = 5 // The port to publish the reserve for other programs to read

//let global,ReserveFunds;
let SHORTS = false; //By default, you can't short stocks, but we'll see if you can in the main loop.
let FORECAST = false; //By default, we can't use forecasts.
let ReservePortHandle = null;  // ADDED
let ReserveFunds = 200 * 10 ** 6; //10**9 = 1B
let OldReserveFunds = ReserveFunds //To Detect Change



export async function main(ns) {
	var logging = false;

	ReservePortHandle = ns.getPortHandle(RESERVE_PORT)
	if (ReservePortHandle.empty()) {
		ReservePortHandle.write(ReserveFunds)
	}
	else {
		ReserveFunds = (ReservePortHandle.peek()) * 1
		OldReserveFunds = ReserveFunds
	}
	//Figure out SHORTS and FORECAST
	//Potentially buy 4s (we also do this in simpleInvestor)
	//We exit early in case we don't have the WISE or TIX access.
	var necessaryApis = checkApis(ns, logging);
	if (!necessaryApis) {
		if (logging) {
			var msg = "Purchase either the WISE account or TIX access to continue, as this script requires both.";
			ns.tprint(msg);
		}
		return false; //Don't continue; we need those apis
	} //end if !necessaryApis
	//Here we are handling potential arguments, ie things other than buying and selling stonks forever.
	// Options include check, sell, and reserve.
	if (ns.args.length > 0) {
		switch (ns.args[0]) {
			case "check":
				ns.tprint(`InSwitch statement with ${ns.args}`)
				//Print out what our portfolio is worth to the terminal
				var totalValue = checkPortfolio(ns);
				return true; //lets not go off on a stock investing spree forever after this.

			case "sell":
				var amount = null;
				if (ns.args.length > 1) {
					amount = ns.args[1];
				}
				if ((amount != null) && (amount > 0)) {
					sellPosition(ns, amount);
				}
				else {
					ns.tprintf("\u001b[31m" + "Invalid Amount -- Useage: stonks.js sell <Positive Integer>" + "\u001b[0m")
				}
				return true; //lets not go off on a stock investing spree forever after this.
			//end case sell
			case "reserve":
				// establish current values for ReserveFunds, OldReserveFunds
				if (ReservePortHandle.empty()) {
					ns.tprintf("Empty")
					ReserveFunds = OldReserveFunds
					ReservePortHandle.write(ReserveFunds)
				}
				else {
					ReserveFunds = (ReservePortHandle.peek()) * 1
					OldReserveFunds = ReserveFunds
				}

				// Update or just report value

				var amount = null;
				if (ns.args.length > 1) {
					amount = (ns.args[1] * 1) //This will force conversion to a number
					if ((amount != NaN) && (amount > 0)) {
						ReserveFunds = amount
						ReservePortHandle.clear()
						ReservePortHandle.write(ReserveFunds)
						if (OldReserveFunds != ReserveFunds) {
							ns.tprintf(`Reserve funds changed from ${OldReserveFunds} to ${ReserveFunds}.`)
							OldReserveFunds = ReserveFunds
						}
						else {
							ns.tprintf(`Reserve funds remain unchanged at ${ReserveFunds}.`)
						}
					}
					else {
						ns.tprintf(`Error: "${ns.args[1]}" does not evaluate to a positive number. Reserve funds remain unchanged at ${ReserveFunds}.`)
					}
				} //end if ns.args.length >1
				else {
					ns.tprintf(`Reserve funds are currently set to ${ReserveFunds}.`)
				}
				return true;
			//end case reservef
			default:
				ns.tprintf("Useage: Options: check | reserve <optional amount> | sell <required amount>")
				return true;
		} //end switch
	} // end if args.length > 0

	var stockSymbol = null;

	var delayTime = 0.1; // Time in seconds to wait before calling investor again.
	//The reason this is such a small delay is that every call to simpleInvestor will call logObservation.
	//LogObservation starts by sleeping for the amount of time necessary to wait for a new stock market update.
	//Also generally, simpleInvestor doesn't return.
	var estimator = {} //we will be using this to store a stock liklihood of increasing function
	var stockObservations = {} //This will store a bunch of observations of the stock market.
	while (true) //There is really never a reason to stop investing, you might as well just while true your initializers.
	{
		//Creates the estimator of liklihood of increase for all stocks
		//INVESTOR (one below as well) -- Literally invest our money.
		// It will update the estimator, then attempt to buy stocks with our money using the estimator.
		// It will then use the estimator to decide what stocks to sell.
		estimator = await simpleInvestor(ns, estimator, stockObservations, logging);
		await ns.sleep(delayTime * 1000); // wait for end of main investor loop (we could do things other than stonks here.)
	} //end while true - reinvest again
	//You'll never get here.
	return false;
} //end main

//This function serves a number of functions.
//First and foremost, if you dont' have the necessary apis to trade stocks (WISE and TIX)
//  Return false and fail out.
//Otherwise, see if short are available and update SHORTS if they are.
//Also check and see if it's time to buy the 4s for either the player or the api for this algorithm.
//If its time, buy that stuff and if appropriate update FORECAST.
//Right now its always time, and we just buy stuff the moment we can.
//TODO: fix that, lets wait until we have at least some capital saved beyond our cost.
//      UNTESTED -- but we may have the right code for this now in here.
function checkApis(ns, logging = false) {
	var msg = null; //generic string var for holding messages to print
	var necessaryApis = true;
	//I need a test here for WISE access.  Currently, I believe the test below handles both, but I'm not sure.
	//I believe this will catch not having TIX
	try {
		var stonks = ns.stock.getSymbols();
	} catch {
		necessaryApis = false
	}
	if (!necessaryApis) { return false; }

	//Can we use shorts yet?
	try {
		ns.stock.buyShort('JGN', 0);
		SHORTS = true; //Didn't throw an error, so we must have shorts!
		if (logging) { ns.tprint("We have shorts, party on!") }
	}
	catch {
		if (logging) { ns.tprint("We don't have shorts, disabling them.") } //Shorts remain disabled
	}
	if (ns.stock.has4SDataTIXAPI()) {
		FORECAST = true;
	} //end if ns.stock.has4SDataTIXAPI()
	var availableFunds = getAvailableFunds(ns);
	//Don't buy the api unless we have at least twice what it costs floating around.
	var apiCost = 1 * 10 ** 9; //1 billion dollars : Just the cost it was in node 1.
	var reservedFunds = apiCost * 2; // Wait until you have at least 2 times the cost.
	if (availableFunds > reservedFunds) {
		if (!ns.stock.purchase4SMarketData()) {
			msg = "This script will attempt to proceed without the 4S Market Data, but it'd really help.";
			if (logging) { ns.tprint(msg); }
		} //end if !ns.stock.purchase4sMarketData
	} //end if availableFunds < reserveFundsd

	availableFunds = getAvailableFunds(ns); //update this, may have bought something.
	//Don't buy the api unless we have at least twice what it costs floating around.
	apiCost = 25 * 10 ** 9; //25 billion dollars : Just the cost it was in bitnode 1.
	reservedFunds = apiCost * 2; //Save 2x the cost before you buy the api.
	if (availableFunds > reservedFunds) {
		if (!ns.stock.purchase4SMarketDataTixApi()) {
			msg = "This script will attempt to proceed without the 4S Market Data TIX API access, but it'd really help.";
			if (logging) { ns.tprint(msg); }
		} //end if !ns.stock.purchase4SMarketDataTixApi()
		return true;
	} //end if availableFunds > reserveFunds
	return true;
} //end checkApis
//This function is designed to sell stonks when it is time to do so.
//They use a sellThreshold that is passed in (generally slightly below 0.5 but not much)
// as well as an estimator that is passed in, which for a given stock estimator[stockSymbol]
// is the liklihood of that stock rising or falling.  We sell if estimator[stockSymbol] < sellThreshold.
// Logging merely turns on or off debugging for printing purposes.
function checkForSales(ns, estimator, sellThreshold, shortThreshold, logging) {
	var msg = null;
	var stonks = ns.stock.getSymbols();
	for (var i = 0; i < stonks.length; i++) {
		var stockSymbol = stonks[i];
		if (logging) {
			ns.tprint("Should I sell " + stockSymbol);
			if (!FORECAST) { msg = "Estimator: " + estimator[stockSymbol]; }
			else { msg = "SaleForecast: " + ns.stock.getForecast(stockSymbol); }
			ns.tprint(msg);

		} //end if logging
		if (shouldISell(ns, stockSymbol, sellThreshold, estimator)) {
			sellStonks(ns, stockSymbol, "L", logging)
		}
		else {
			if (shouldISellShort(ns, stockSymbol, shortThreshold, estimator)) {
				sellStonks(ns, stockSymbol, "S", logging)
				msg = "soldShort " + stockSymbol
				if (logging) { ns.tprint(msg); }
			}
			else {
				msg = "Didn't sell.";
				if (logging) { ns.tprint(msg); }
			}
		} //end else
	}	// end for i < ownedStonks.length
} //end checkForSales

//Sells all stonks of a given stockSymbol that you own.
function sellStonks(ns, stockSymbol, saleType = "L", logging = false) {
	var numShares = 0;
	var position = ns.stock.getPosition(stockSymbol);
	if (position.length < 4) { return false; } //starter error checking
	if (saleType == "L") {
		numShares = position[0]; //If the stockSymbol is invalid, I haven't tested this.
		ns.stock.sellStock(stockSymbol, numShares);
		var msg = "Sold " + numShares + " shares of stock " + stockSymbol;
		if (logging) { ns.print(msg); }
	} //end if saleType == "L"
	else if (saleType == "S") {
		numShares = position[2]; //If the stockSymbol is invalid, I haven't tested this.
		ns.stock.sellShort(stockSymbol, numShares);
		var msg = "Sold " + numShares + " shares of stock " + stockSymbol;
		if (logging) { ns.print(msg); }
	} //end else if saletype == "S"

} //endsellStock


//This function figures out how much money we can spend.
//This is primarily a function of ReserveFunds, which is for now a local that we initialize here.
//  Eventually, I intend to make it at least a global, but perhaps even something we can listen for over a port.
function getAvailableFunds(ns) {

	var commissionCost = 100000; //Cost per trade
	var availableFunds = ns.getServerMoneyAvailable("home") - commissionCost - ReserveFunds;//ReserveFunds = 1 * 10 ** 9;//global.ReserveFunds;
	return availableFunds;
} //getAvailableFunds
//Buys as much of the stock in question as it can, saving only reserveFunds
//We have already decided this is our best investment right now, so grab it!
function investIn(ns, stockSymbol, saleType = "L", logging = false) {

	var askPrice = ns.stock.getAskPrice(stockSymbol);
	var maxShares = ns.stock.getMaxShares(stockSymbol); //maxShares that can exist for this stock
	var stockPosition = ns.stock.getPosition(stockSymbol)
	var ownedLongs = stockPosition[0]; //How many long shares do we have
	var ownedShorts = stockPosition[2]; //How many short shares do we have?
	maxShares = maxShares - ownedLongs - ownedShorts; //Can't buy shares if you already own them

	var numShares = 0;
	var availableFunds = getAvailableFunds(ns);

	if (askPrice > 0) {
		numShares = Math.floor(availableFunds / askPrice);
		numShares = (numShares < maxShares) ? numShares : maxShares; //Use maxShares if it is smaller.
	}
	else { numShares = 0; }
	if (numShares > 0) {
		if (saleType == "L") {
			numShares = ns.stock.buyStock(stockSymbol, numShares);
			var msg = "Bought " + numShares + " long shares of stock " + stockSymbol;
			if (logging) {
				ns.print(msg);
				ns.tprint(msg);
			}
		} //end if saleType == "L"
		if (saleType == "S") {
			try {
				numShares = ns.stock.buyShort(stockSymbol, numShares);
			} //end try
			catch (error) {
				var msg = "Caught error: " + error;
				if (logging) {
					ns.print(msg);
					ns.tprint(msg);
				}
			} //end catch
			var msg = "Bought " + numShares + " short shares of stock " + stockSymbol;
			if (logging) {
				ns.print(msg);
				ns.tprint(msg);
			}
		} //end if saleType == "S"
	} //end if numShares > 0 
	return numShares;
} // end investIn

//Technically, this function invests all of the money.
//First, if you don't have forecasts available, it'll attempt to estimateForecasts for all of the stocks.
//   This can be an involved process where we pause and gather some number of stock observations before continuing.
//   As such, if you have a forecast, we just don't even make an estimator and proceed using the forecast.
//   In order to achieve this, we end up testing Forecast all over and making decisions based on it.
//   We only update it in checkApis, which is called here and once in main.
//
//While you have money left that it can use, it will buy as many stocks as it can in descending order of that list.
//Simple investor returns the estimator it generated.
export async function simpleInvestor(ns, estimator, stockObservations, logging = false) {
	if (logging) { ns.tprint("SimpleInvestor called."); }
	var minInvestment = 1000000;
	var availableFunds = getAvailableFunds(ns);

	//No reason to ever stop investing unless you are killed really.
	while (true) {
		//If necessaryApis comes back false, we can't even buy stocks so fail.
		//Otherwise, buy the apis if it makes sense to do so, which may update FORCAST and/or SHORTS.
		var necessaryApis = checkApis(ns, logging);
		if (!necessaryApis) { return null } //this is really bad, so fail however you do.
		if (!FORECAST) {
			estimator = await estimateForecasts(ns, estimator, stockObservations, logging); //hopefully this actually does let us modify the passedVariable
			var msg = "postEstimateForecasts";
			if (logging) { ns.tprint(msg); }
		}
		//Returns a sorted list of stocks where the first one has the highest forecast.	
		if (logging) { ns.tprint("preSortStonks"); }
		var stonks = await sortStonks(ns, estimator, logging)
		if (logging) { ns.tprint("postSortStonks"); }
		var firstStock = true;
		//For each stock, buy it if we want to.  Most of this for loop is printing for debugging.  Feel free to ignore any if logging blocks.
		for (var i = 0; i < stonks.length; i++) {
			var stockSymbol = stonks[i];
			//var buyThreshold = 0.60 ; //Wait until you're pretty sure to invest in a stock.
			var buyThreshold = 0.6; //Temporarily disabling buying.
			var shortThreshold = 0.4; //Below this threshold, go ahead and short the stock, if shorts are available.
			if (FORECAST) { buyThreshold = 0.55; } //We can be a bit more confident with a forecast.
			if (firstStock) {
				firstStock = false;
				if (!FORECAST) { msg = "First stock estimate: " + estimator[stockSymbol]; }
				else { msg = "First stock forecast: " + ns.stock.getForecast(stockSymbol) }
				if (logging) { ns.tprint(msg); }
			} //end if firstStock
			//Here we actually buy stock if we can/want to.
			var boughtSomething = optimizeStock(ns, stockSymbol, buyThreshold, shortThreshold, estimator, logging)
			if (logging && boughtSomething) {
				msg = "Bought some of " + stockSymbol;
				ns.tprint(msg);
			} //end if logging && boughtSomething
		} //end for i < stonks.length
		var sellThreshold = 0.50; //Sell anything with less than 60% chance of going up as estimated by your estimator.
		var shortSellThreshold = 0.50; //sell anything with more than this percent chance of going up
		checkForSales(ns, estimator, sellThreshold, shortSellThreshold, logging); //Sell stuff if we think its a good idea.
		availableFunds = getAvailableFunds(ns);
		await ns.sleep(1.0 * 1000); //just make absolutely sure we do not cause a loop, even though estimateForecast should give us a delay.
	} //end while true
	return estimator;
} // function simpleInvestor
//Just starting this guy, its meant to buy or short a stock, whatever is best for this stock.
//Right now it'll work for long positions, but it can't detect shorts yet.
function optimizeStock(ns, stockSymbol, buyThreshold, shortThreshold, estimator, logging = false) {
	var boughtSomething = false;
	var shortApproved = false;
	var longApproved = false;
	var msg = null;
	//Should I  buy long (the normal way) into this stock
	longApproved = shouldIBuy(ns, stockSymbol, buyThreshold, estimator);
	if (longApproved) {
		var newStonks = investIn(ns, stockSymbol, "L", logging);
		if (newStonks > 0) { boughtSomething = true; }
		if (logging && (newStonks > 0)) {
			msg = "Investing long in " + stockSymbol;
			ns.print(msg);
			ns.tprint(msg);
		} //end if logging
	} //end if longApproved
	else {
		//Should I short this stock?  Also is shorting available? (see shouldISort below)
		shortApproved = shouldIShort(ns, stockSymbol, shortThreshold, estimator)
		if (shortApproved) {
			var newStonks = investIn(ns, stockSymbol, "S", logging);
			if (newStonks > 0) { boughtSomething = true; }
			if (logging && (newStonks > 0)) {
				msg = "Investing short in " + stockSymbol;
				ns.print(msg);
				ns.tprint(msg);

			} //end if logging
		} //end if shortApproved
	} //end else (Check for shorting)
	return boughtSomething;
} //end optimizeStock
function shouldIShort(ns, stockSymbol, shortThreshold, estimator) {
	if (!SHORTS) { return false; }
	//var forecastAvailable = ns.stock.purchase4SMarketDataTixApi();
	if (FORECAST) {
		return (ns.stock.getForecast(stockSymbol) < shortThreshold);
	}
	else {
		//The estimator should give us a 0 < 1 estimate of the likliehood of a stock going up or down, where 0.5 is 50 percent chance of either.
		return (estimator[stockSymbol] < shortThreshold);
	}
} //ShouldIShort
//Should I buy this stock or not?
//The stock symbol is a string identifer of the stock.
//The buy threshold is a threshold of what liklihood 0-1 you would like to start selling your stock at.  0.51 is the lowest sensible value, in my humble programmer opinion.
//The estimator is an object that when accessed estimator[stockSymbol] will produce a liklihood from 0-1 of the stock going up or down, where any liklihood below 0.5 is going down and any above it is going up.
function shouldIBuy(ns, stockSymbol, buyThreshold, estimator) {
	//var forecastAvailable = ns.stock.purchase4SMarketDataTixApi();
	if (FORECAST) {
		return (ns.stock.getForecast(stockSymbol) > buyThreshold);
	}
	else {
		//The estimator should give us a 0 < 1 estimate of the likliehood of a stock going up or down, where 0.5 is 50 percent chance of either.
		return (estimator[stockSymbol] > buyThreshold);
	}
} //ShouldISell
//The stock symbol is a string identifer of the stock.
//The sell threshold is a threshold of what liklihood 0-1 you would like to start selling your stock at.  0.5 is the highest sensible value, in my humble programmer opinion.
//The estimator is an object that when accessed estimator[stockSymbol] will produce a liklihood from 0-1 of the stock going up or down, where any liklihood below 0.5 is going down and any above it is going up..
function shouldISell(ns, stockSymbol, sellThreshold, estimator) {
	//var forecastAvailable = ns.stock.purchase4SMarketDataTixApi();
	if (FORECAST) {
		return (ns.stock.getForecast(stockSymbol) < sellThreshold);
	}
	else {
		//The estimator should give us a 0 < 1 estimate of the likliehood of a stock going up or down, where 0.5 is 50 percent chance of either.
		return (estimator[stockSymbol] < sellThreshold);
	}
} //ShouldISell
//The stock symbol is a string identifer of the stock.
//The sell threshold is a threshold of what liklihood 0-1 you would like to start selling your stock at.  0.5 is the highest sensible value, in my humble programmer opinion.
//The estimator is an object that when accessed estimator[stockSymbol] will produce a liklihood from 0-1 of the stock going up or down, where any liklihood below 0.5 is going down and any above it is going up..
function shouldISellShort(ns, stockSymbol, shortThreshold, estimator) {
	if (!SHORTS) { return false; }
	//var forecastAvailable = ns.stock.purchase4SMarketDataTixApi();
	if (FORECAST) {
		return (ns.stock.getForecast(stockSymbol) > shortThreshold);
	}
	else {
		//The estimator should give us a 0 < 1 estimate of the liklihood of a stock going up or down, where 0.5 is 50 percent chance of either.
		return (estimator[stockSymbol] > shortThreshold);
	}
} //ShouldISellShort
//This function needs to estimate something like the stock forecast.
//To a first order, we are interested in the liklihood the stock will increase.
//Both the amount of increases the algorithm has seen and the size of the increases should be relevant.
async function estimateForecasts(ns, estimator, stockObservations, logging = false) {
	var stonks = ns.stock.getSymbols();
	var samplesToKeep = 20; //How many stock observations should we base our estimations on?
	stockObservations = await logObservation(ns, stockObservations, samplesToKeep, logging);
	var msg = "Stock Observations initialized to something!";
	if (logging) { ns.tprint(msg); }

	//What we do is use the stockObservations to calculate  a simpler function: 
	//F(stockSymbol) = Expected Value where 0.5 is 50% chance of up or down.
	//Our current approximation (one can only approximate) is to average the last 10 normalized changes.
	//These observations are simply the ones logged above, and we calculate normalized percentage changes between observations.
	// We then throw these observations out and simply map to -1 for negative values and 1 for postive values.
	// Averaged out, these produce a liklihood function for a stock going up or down.
	// We calculate something like 0.23 for a 23% chance to increase.  We then map this to the 0.5 expected value world,
	// where a 23% chance to increase actually comes out to 0.5*0.23 +0.5 = 0.625. (This is the range the forecast function from 4s returns)
	// This result is then averaged across all of the observations (usually around 10).
	for (var i = 0; i < stonks.length; i++) {
		var stockSymbol = stonks[i];
		estimator[stockSymbol] = 0;
		var sampleList = stockObservations[stockSymbol];
		for (var j = 0; j < sampleList.length - 1; j++) {
			//This should just be the percentage difference between a stock at a later time vs an earlier time, normalized as a percentager of the earlier time's value.
			//For example, 0.21 would mean a 21% increase, whereas -0.13 would be a 13% decrease in value between the two observations.
			var difference = (sampleList[j + 1] - sampleList[j]) / sampleList[j]; //should be a normalized difference
			if (difference > 0) { difference = 1; }
			if (difference < 0) { difference = -1; }
			estimator[stockSymbol] += 0.5 + (0.5 * difference);
		} // end for j < sampleList.length - 1
		estimator[stockSymbol] /= (sampleList.length - 1.0); //hopefully we get floating point here.
	} // end for i < stonks.length
	msg = "Got an estimator!";
	if (logging) { ns.tprint(msg); }
	return estimator;
} // end estimateForecasts

//Here we use some kind of estimation of the forecast to sort the stonks.
//An estimator should produce estimator[stockSymbol] = value from [0, 1] where 0.5 is a 50 % chance of stock increasing.
//We simply sort the stonks according to this function's results.
//Typically this sorted stock list is then used for investing in those stonks.
async function sortStonksPre4s(ns, estimator, logging = false) {

	return ns.stock.getSymbols().sort(function (a, b) { return Math.abs(0.5 - estimator[b]) - Math.abs(0.5 - estimator[a]); })
}
//This function returns a list of stonks sorted by their forecast.
//Typically this sorted stock list is then used for investing in those stonks.
async function sortStonks(ns, estimator, logging = false) {
	if (logging) { ns.tprint("Sort Stonks called.") }
	//var forecastAvailable = ns.stock.purchase4SMarketDataTixApi();
	if (!FORECAST) {

		return await sortStonksPre4s(ns, estimator, logging)
	}
	//I should clean this later, but else do the normal forecast sort
	return ns.stock.getSymbols().sort(function (a, b) { return Math.abs(0.5 - ns.stock.getForecast(b)) - Math.abs(0.5 - ns.stock.getForecast(a)); })
} //function sortStonks

//This function calculates how much money you would gain if you sold your whole portfolio long right now.
function checkPortfolio(ns, logging = false) {
	if (logging) { ns.tprint("Check Portfolio called."); }
	var totalValue = 0;
	var stonks = ns.stock.getSymbols();
	for (var i = 0; i < stonks.length; i++) {
		var stockSym = stonks[i];
		var stockPosition = ns.stock.getPosition(stockSym);

		var numShares = stockPosition[0];
		var saleGain = ns.stock.getSaleGain(stockSym, numShares, "L");
		totalValue += saleGain;

		if (SHORTS) {
			numShares = stockPosition[2];
			saleGain = ns.stock.getSaleGain(stockSym, numShares, "S");
			totalValue += saleGain;
		} //end if SHORTS
	} // end for i < stonks.length
	const formatted = ns.nFormat(totalValue, "$0.000a");
	ns.tprint("Total Invested: " + formatted);
	return totalValue;
} //checkPortfolio

//For now, this just sells all of your stocks and ignores amount.
//Eventually, I'd like to be able to input a dollar amount and have the function
//  A) Determine which stocks are best to sell to generate around amount dollars.
//  B) Only sell what is necesary to get you at least amount dollars.
//  C) Update reserve cash somehow so we don't immediately just reinvest that cash
//       (currently its a local down in getAvailableFunds as ReserveFunds, so this design must change)
function sellPosition(ns, amount, logging = false) {
	var msg = "Sell Position called with " + amount;
	var stonks = ns.stock.getSymbols();
	for (var i = 0; i < stonks.length; i++) {
		var stockSymbol = stonks[i];
		sellStonks(ns, stockSymbol, "L", logging);
		if (SHORTS) { sellStonks(ns, stockSymbol, "S", logging) }
	} //end for i < stonks.length

} //end sellPosition
//This function is meant to log one observation of the price of each stock in the stock market right now.
//It will recursively call itself until it has at least samplesToKeep samples around.
async function logObservation(ns, stockObservations, samplesToKeep, logging = false) {
	var msg = "logObservation Called."
	if (logging) { ns.tprint(msg); }
	var stonks = ns.stock.getSymbols();
	var delay = 6; //Time in seconds to wait before we get another sample if we want one.
	var gatherMoreSamples = false; //Did we want to get more samples or did we have enough for estimators to start?
	await ns.sleep(delay * 1000);
	msg = "Sleeping for " + delay + " seconds before we observe."
	if (logging) { ns.tprint(msg); }
	//Add an observation for all stonks.
	//Prune our stockObservations if we have more than samplesToKeep stored.
	for (var i = 0; i < stonks.length; i++) {

		var stockSymbol = stonks[i];

		var newPrice = ns.stock.getAskPrice(stockSymbol);
		msg = "Observing stock: " + stockSymbol + " at price $" + newPrice;
		//if (logging) {ns.tprint(msg)}

		var numSamples = 0; //Var to keep track of how many samples we saw when we thought we needed more.
		if (!(stockSymbol in stockObservations)) { stockObservations[stockSymbol] = []; } //Initialize the entries
		stockObservations[stockSymbol].push(newPrice);
		//Check to see if we have enough samples yet.
		if (stockObservations[stockSymbol].length < samplesToKeep) {
			numSamples = stockObservations[stockSymbol].length;
			gatherMoreSamples = true; //This will make us recurse
		}
		//Remove one observation if we have too many observations
		if (stockObservations[stockSymbol].length > samplesToKeep) {
			stockObservations[stockSymbol].shift();
		}

	} // end for i < stonks.length
	if (gatherMoreSamples) {
		msg = "We want to gather more samples than " + numSamples + ".";
		if (logging) { ns.tprint(msg); }
		return logObservation(ns, stockObservations, samplesToKeep, logging) //Recursive call
	}
	else {
		msg = "We don't need any more samples.";
		if (logging) { ns.tprint(msg); }
		return stockObservations;
	}
	msg = "We shouldn't be able to get here" + gatherMoreSamples;
	ns.tprint(msg);
	return stockObservations
} // end function logObservation
