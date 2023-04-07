/** @param {NS} ns */
// File to keep global values for all scripts
export const DIRS = { HIVE: "hive", HACKS: "hacks", STOCKS: "stocks", UTILS: "utils" }

export async function main(ns) {
	switch (ns.args[0]) {
		case "export":
			for (const property in DIRS) {
				ns.tprintf(`${property}: ${DIRS[property]}`)
			} // end for
			getFileList(ns, ns.args[1], ns.args[2], ns.args[3]);
		// end case
	} // end switch
}// end function main(ns)

/*
	This function returns a list of copyable files from a server.
	Copyable files include .js and .txt files only.
	
	Requires: server    -- the name of the server to run the
			       directory command
	
	Optional: grep      -- what to grep for ("." is everything)
		  root_only -- use true if only want root level files
*/
export function getFileList(ns, server, grep, root_only) {
	if (server == "") { server = "home" }
	if (match = "") { match = "." }
	let directory_list = ns.ls(server, match)
	for (const filename of directory_list) {
		if (((root_only) && (filename.startsWith("/"))) ||
			((!filename.includes(".js")) && (!filename.includes(".txt")))) 
		{
			ns.tprintf(`SKIPPED ${filename}`)
			continue;
		} // end if
		if (filename.startsWith("/")) {
			ns.tprintf(filename.slice(1))
		} else {
			ns.tprintf(filename)
		} // end if .. else
	} // end for
} // end function getFileList
