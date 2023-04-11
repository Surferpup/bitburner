// file  CreatePull

import { getFileList, DIRS } from "/utils/Globals";

/**
 * main function for script
 * @param { NS } ns */
export async function main(ns) {
    
} // end function main
// end file CreatePull


/**
 * Serializes the file list
 * @param { NS } ns */
export async function MakeFileList(ns) {
    let filelist = getFileList(ns)
     ns.write(`/${DIRS.UTILS}/${file}`,"Test.js",'w')
} // end function main
