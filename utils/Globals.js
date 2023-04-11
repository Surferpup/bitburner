/** File to keep global values for all scripts */
/**
 * @const { obj } DIRS - Default Directory paths for scripts
 * @property { string } HIVE - Location of hive scripts
 * @property { string } HACKS - Location of hacking scripts
 * @property { string } STOCKS - Location of stock scripts
 * @property { string } UTILS - Location of utility scripts (including this file)
*/
export const DIRS = { HIVE: "hive", HACKS: "hacks", STOCKS: "stocks", UTILS: "utils" };
/**
 * Driver function to access some of the global functions
 * @param { NS } ns Netscript namespace
 * @remarks
 * Can take up to five arguments, all of which are optional.
 * The first argument is a useage arguement (--help, etc)
 *
 * @see getFileList for details
 **/
export async function main(ns) {
    const switchCase = (ns.args[0]) ? ns.args[0] : "export";
    switch (switchCase) {
        case "export":
            const filelist = getFileList(ns, ns.args[1], ns.args[2], ns.args[3], ns.args[4])
            for (const filename of filelist) {
                ns.tprintf(filename);
            } //end for
            ns.tprintf(`------------------\nPrinted ${filelist.length}`)
        // end case
    } // end switch
} // end function main(ns)
/**
 * Returns a directory listing of files on a server (only *.js and *.txt files are returned)
 * @param { NS } ns  Netscript Namespace
 * @param { string } [server="home"] Name of server (default = "home" )
 * @param { string } [grep]  Search string (default = "." for all files)
 * @param { boolean } [root_only] Only return files in root directory (default = false)
 * @param { boolean } [debug] Prints to terminal result of every file for debugging (default = false)
 * @returns { string[]  } A list of file names
 **/
export function getFileList(ns, server = "home", grep = ".", root_only = false, debug = false) {
    let filelist = [];
    if (!server) {
        server = "home";
    }
    if (!grep) {
        grep = ".";
    }
    let directory_list = ns.ls(server, grep);
    for (const filename of directory_list) {
        if (((root_only) && (filename.startsWith("/"))) ||
            ((! (filename.includes(".js"))) && (!(filename.includes(".txt"))))) {
            if (debug) {
                ns.tprintf(`SKIPPED ${filename}`);
            } //end if

            continue // skip this file
        } // end if
        if (filename.startsWith("/")) {
            filelist.push(filename.slice(1));

            //check debug
            if (debug) {
                ns.tprintf(filename.slice(1));
            } //end if
            
        } else {
            filelist.push(filename);
            
            // check debug
            if (debug) {
                ns.tprintf(filename);
            } //end if
            
        } // end if .. else
    } // end for
    return filelist;
} // end function getFileList
//end file Globals.js