// file  CreatePull.js
// creates a javascript routine that will execute a wget against a repository

import { getFileList, DIRS } from "/utils/Globals";

/**
 * main function for script
 * @param { NS } ns */
export async function main(ns) {
    await MakeFileList(ns)
} // end function main
// end file CreatePull


/**
 * Serializes the file list
 * @param { NS } ns */
export async function MakeFileList(ns) {
    const codefile = "wget.js"
    const file = `/${DIRS.UTILS}/${codefile}`
    const repository = "https://raw.githubusercontent.com/Surferpup/bitburner/"
    const branch = "Mike-Working"

    // get filelist from directory
    let filelist = getFileList(ns)
    
    // manually specify exlusions

    const exclusions = ["$utils/test.js",".vscode/testnewfile.js"]

    // remove exclusions from filelist
    for (let exclusion of exclusions ) {
        let index = filelist.indexOf(exclusion)
        if (index > -1) { filelist.splice(index,1)}
    }

    // convert fileist to a string
    filelist  = JSON.stringify(filelist)
    
    // create lines for codefile
    let code = []
    code.push(`//file ${codefile} (generated) by ${ns.getScriptName()})`)
    code.push('/** @param {NS} ns */')
    code.push('export async function main(ns) {')
    code.push(`\tconst repo = "${repository}${branch}/"`)
    code.push(`\tconst files = ${filelist}`)
    code.push('\tfor (const file of files) {')
    code.push('\t\tlet arg1 = root + file')
    code.push('\t\tlet arg2 = file.startsWith("/") ? file : "/" + file')
    code.push('\t\t//ns.tprintf(arg1, arg2)')
    code.push('\t\tawait ns.wget(arg1, arg2)')
    code.push('\t} // end for')
    code.push('} //end main')
    code.push(`// end file ${codefile}`)
    
    // write codefile
    try {
        if (ns.fileExists(file))
            ns.rm(file)
        ns.write(file,code.join('\n'),'w') 
        ns.tprintf(`Javascript file ${file} successfully created.`)    
    }
    catch (e) {
        ns.printf(`Creation of ${codefile} failed -- Error: ${e}`)       
    }

    // ns.tprintf(code.join("\n")) // debug
    
} // end function main
// end file createPull.js

