// file WipeFiles.js
// Wipes all *.js and *.txt from server.

/** @param { NS } ns */

import { getFileList } from "/utils/Globals"

/** WIll wipe all files fom home server */
/** @param { NS } ns **/
export async function main(ns) {
    const result =  await ns.prompt("This will wipe ALL files from the server (except for this utility)\n -- are you sure you want to do this?")

    const exclusions = ["utils/wget.js"]

    if (result) {
        
        var filelist = getFileList(ns,null,".",null,false)
        ns.tprintf(`Started with ${filelist.length} Files.`)
        for (let filename of filelist) {
            if (( exclusions.indexOf(filename) < 0 ) && ns.rm("/" + filename))
                ns.tprintf(`Removed ${filename}`)
            else
                ns.tprintf(`SKIPPED ${filename}`)
        } //end for

        filelist = getFileList(ns)
        ns.tprintf(`Ended with ${filelist.length} Files.`)
        
    } // end if
} // end function main
//end file WipeFiles.js
