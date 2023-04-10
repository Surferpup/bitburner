// file /stocks/scoreboard.js  -- REQUIRES /utils/text-transform.js 
// running this script will create a log window that displays portfolio information and updates every second


import { TextTransforms } from "/utils/text-transform.js"; //required for colored text transforms

/** @param {NS} ns */
export async function main(ns) {
    const color_gain = TextTransforms.Color.Green
    const color_loss = TextTransforms.Color.LRed
    const color_even = TextTransforms.Color.LWhite
    const table_text = TextTransforms.Color.White
    
    // keeps track of all pertinent info on a given stock and allows for formatted output
    class Stock {
        constructor(tix_symbol) {
            this.tix_symbol = tix_symbol
            this.position = [] // [<longshares>,<avg. long price>, <short shares>, <avg short price>]
            this.marketprice = 0 // current market price
            this.updatePosition() //get position and sale info
            
            // ._tostring is used to format each line of a stock on the log output.
            this._tostring = "`${TextTransforms.apply((this.tix_symbol).padEnd(9,' '),[table_text])}" +
                "${TextTransforms.apply(ns.nFormat(this.position[0],\"0.000a\").padStart(12,' '),[table_text])}" +
                "${TextTransforms.apply(ns.nFormat(this.position[5],\"0.000a\").padStart(12,' '),[table_text])}" +
                "${TextTransforms.apply(ns.nFormat(this.position[6],\"0.000a\").padStart(12,' '),[this.position[7]])}" +
                "${TextTransforms.apply(ns.nFormat(this.position[2],\"0.000a\").padStart(12,' '),[table_text])}" +
                "${TextTransforms.apply(ns.nFormat(this.position[9],\"0.000a\").padStart(12,' '),[table_text])}" +
                "${TextTransforms.apply(ns.nFormat(this.position[10],\"0.000a\").padStart(12,' '),[this.position[11]])}`"
        }
        
        getLastPosition() {
            return this.position
        }

        updatePosition() {

            // get current position.
            this.position = ns.stock.getPosition(this.tix_symbol)
        
            // add mareket data including potential sale gains for short and long positions.
            this.marketPrice = ns.stock.getPrice(this.tix_symbol)
            this.position.push(this.position[0] * this.position[1]) //[4] Long Position
            this.position.push(this.position[0] * this.marketPrice) //[5] Long Market
            this.position.push(ns.stock.getSaleGain(this.tix_symbol, this.position[0], "L") - this.position[4]) //[6] Long Return
            this.position.push(this.position[6] > 0 ? color_gain : this.position[6] < 0 ? color_loss : color_even) // [7] Long Return Color
            this.position.push(this.position[2] * this.position[3]) //[8] Short Position
            this.position.push(this.position[2] * this.marketPrice) // [9] Short Market
            this.position.push(ns.stock.getSaleGain(this.tix_symbol, this.position[2], "S") - this.position[8]) //[10] Short Return
            this.position.push(this.position[10] > 0 ? color_gain : this.position[10] < 0 ? color_loss : color_even) // [11] Short Return Color
            
            return this.position
        }
        
            

        get() {
            this.updatePosition()
        }
        
        //function to format the output of a stock for the log
        toString() { return (eval(this._tostring)) }

    }

    try {
        ns.printf(`Now Running ${ns.getScriptName()}`)
        ns.disableLog("ALL");
        ns.tail();

        while (true) {
            ns.clearLog();
            let totals = [0, 0, 0, 0, 0, 0]
            let stock_symbols = ns.stock.getSymbols()
            let first = true
            for (let stock_symbol of stock_symbols) {
                let position = ns.stock.getPosition(stock_symbol)
                if ((!position[0]) && (!position[2])) // this stock is not in portfolio, so skip it
                {
                    continue
                } else // output it to table
                {
                    if (first) {
                        // output table headers
                        first = false
                        ns.printf("Stock".padEnd(9) + "-------- Long Position ---------".padStart(36) +
                            "--------- Short Position --------".padStart(36))
                        ns.printf("Symbol".padEnd(9) + ("Shares".padStart(12) + "Market".padStart(12) + "Return".padStart(12)).repeat(2))
                        ns.printf("------------------------------------------------------------------------------------")
                    }
                    let stock = new Stock(stock_symbol) // get all data on stock

                    //accumulate totals
                    totals[0] += stock.position[4]  // total paid long
                    totals[1] += stock.position[5]  // market price * # shares long
                    totals[2] += stock.position[6]  // total return long
                    totals[3] += stock.position[8]  // total paid short
                    totals[4] += stock.position[9]  // market price * # shares short
                    totals[5] += stock.position[10] // total return short

                    ns.printf(stock.toString()) // print stock to log
                } // end if
            }; //end for
            if (!first) // stocks have been printed so now print table totals and footers
            {
                let overallReturn = totals[2] + totals[5]

                // create text colors for totals based on profit/loss
                let longReturnColor = totals[2] > 0 ? color_gain : totals[2] < 0 ? color_loss : color_even
                let shortReturnColor = totals[5] > 0 ? color_gain : totals[5] < 0 ? color_loss : color_even
                let overallReturnColor = overallReturn > 0 ? color_gain : overallReturn < 0 ? color_loss : color_even
                
                // output formatted totals
                let totalText = "`${'Totals'.padEnd(9,' ')}" +
                    "${TextTransforms.apply(ns.nFormat(totals[0],\"0.000a\").padStart(12,' '),[table_text])}" +
                    "${TextTransforms.apply(ns.nFormat(totals[1],\"0.000a\").padStart(12,' '),[table_text])}" +
                    "${TextTransforms.apply(ns.nFormat(totals[2],\"0.000a\").padStart(12,' '),[longReturnColor])}" +
                    "${TextTransforms.apply(ns.nFormat(totals[3],\"0.000a\").padStart(12,' '),[table_text])}" +
                    "${TextTransforms.apply(ns.nFormat(totals[4],\"0.000a\").padStart(12,' '),[table_text])}" +
                    "${TextTransforms.apply(ns.nFormat(totals[5],\"0.000a\").padStart(12,' '),[shortReturnColor])}`"
                ns.printf("".padEnd(9, " ") + (("------------ ".padStart(12)).repeat(6)))
                ns.printf(eval(totalText))
                ns.printf("".padEnd(9, " ") + (("------------ ".padStart(12)).repeat(6)))

                // overall returns
                ns.printf ( "  TOTAL INVESTED  ....".padEnd(15) + TextTransforms.apply(ns.nFormat(totals[0] + totals[3], "0.000a").padStart(12, ' '), [table_text]) +
                            "  ....  TOTAL RETURN  ====>".padStart(24) + TextTransforms.apply(ns.nFormat(overallReturn, "0.000a").padStart(12, ' '), [overallReturnColor]) + "  <====")

                ns.printf(("-".repeat(78)).padStart(80))
            } //end if
            await ns.sleep(1000); // sleep and then do it all again
        } //end while
    } //end try
    catch (e) {
        ns.printf(`NS.Error ${e} : in script ${ns.getScriptName()}`)
        throw (e) // this will make sure error is reported to user
    } //end catch
    finally { ns.printf(`Exiting script ${ns.getScriptName()}`) }
} // end function main
//end file /stocks/scoreboard.js
