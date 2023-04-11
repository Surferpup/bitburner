/** @param { NS } ns */

import { getFileList } from "/utils/Globals"
//export { getFileList } ;

/** WIll wipe all files fom home server */
/** @param { NS } ns **/
export async function main(ns) {
    const result =  ns.prompt("This will wipe all files from the server (except for this utility -- are you sure you want to do this?")

    if (result) {
        
        var filelist = getFileList(ns,null,".",null,false)
        ns.tprintf(`Started with ${filelist.length} Files.`)
        for (let filename of filelist) {
            if (ns.rm("/" + filename))
                ns.tprintf(`Removed ${filename}`)
            else
                ns.tprintf(`SKIPPED ${filename}`)
        } //end for

        filelist = getFileList(ns)
        ns.tprintf(`Ended with ${filelist.length} Files.`)
        
    } // end if
} // end function main
//end file WipeFiles.js
