/** @param { NS } ns **/
// File to keep global values for all scripts
export const DIRS = { HIVE: "hive", HACKS: "hacks", STOCKS: "stocks", UTILS: "utils" }

/** @param { NS } ns */
export async function main(ns) {
	switch (ns.args[0]) {
		case "export":
			
			for (const filename of getFileList(ns, ns.args[1], ns.args[2], ns.args[3], false)) {
				ns.tprintf(filename)
                
			} //end for
			
		// end case
	} // end switch
}// end function main(ns)

/* function getFileList(ns, server, grep, root_only, debug)

	This function returns a list of copyable files from a server.
	Copyable files include .js and .txt files only.
	
	Requires: 	server    	-- 	the name of the server to run thef
								directory command
	
	Optional: 	grep      	--	what to grep for ("." is everything)
				root_only 	--	use true if only want root level files
				debug		--	use true only if you want terminal output for debugging
*/
/** @param { NS } ns **/
export function getFileList(ns, server = "home", grep = ".", root_only, debug = false) {
	let filelist = []
	//if ( ! server ) { server = "home" }
	//if ( ! grep ) { grep = "." }
	let directory_list = ns.ls(server, grep)
	for (const filename of directory_list) {
		if (((root_only) && (filename.startsWith("/"))) ||
			((!filename.includes(".js")) && (!filename.includes(".txt")))) {
			if (debug) ns.tprintf(`SKIPPED ${filename}`)
			continue;
		} // end if
		if (filename.startsWith("/")) {
			if (debug) ns.tprintf(filename.slice(1))
			filelist.push(filename.slice(1))
		} else {
			if (debug) ns.tprintf(filename)
			filelist.push(filename)
		} // end if .. else
	} // end for
	return filelist
} // end function getFileList