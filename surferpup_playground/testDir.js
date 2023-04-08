/** @param {NS} ns */
// File testdir.js global values and functions for all scripts

export const DIRS = { HIVE: "/hive/", HACKS: "/hacks/", STOCKS: "/stocks/", UTILS: "/utils/" }

export async function main(ns) {
	
	switch (ns.args[0]) {

		case "export":
			for (const filename of getFileList(ns, ns.args[1], ns.args[2], ns.args[3], false)) {
				ns.tprintf(filename)
			} //end for
		// end case

		case "kill_hive":
			let servers = killPurchasedServers(ns, ns.args[1] ?  ns.args[1] : "")
			for (const server of servers) {ns.tprintf(server)}
			ns.tprintf(`--------------------\nKilled ${servers.length}.`)
		//end case

		case "bulk_rename":
			bulkRename(ns,ns.args[1],ns.args[2],ns.args[3])
		//end case

	} // end switch

}// end function main(ns)

export function bulkRename(ns, search, naming, iterStart) {
	
	if (! naming) return
	
	let servers = ns.getPurchasedServers()
	iterStart = iterStart ? iterStart : 0
	
	for (const server of servers) {
		let newName = ""
	
		if (server.includes(search)) {
			newName = `${naming}${iterStart++}`
			ns.renamePurchasedServer(server,newName)
			ns.tprintf(`${server} --> ${newName}`)
		} 
	
	}
}

export function killPurchasedServers(ns,pattern = "") {
	let servers = ns.getPurchasedServers()
	const killed = []

	for (const server of servers) {

		if (server.includes(pattern)) { 
			ns.killall(server) 
			killed.push(server)
		} //end if

	} //end for

	return killed
			
} // end function killPurchasedSeervers

/* function getFileList(ns, server, grep, root_only, debug)

	This function returns a list of copyable files from a server.
	Copyable files include .js and .txt files only.
	
	Requires: 	server    	-- 	the name of the server to run thef
								directory command
	
	Optional: 	grep      	--	what to grep for ("." is everything)
				root_only 	--	use true if only want root level files
				debug		--	use true only if you want terminal output for debugging
*/

export function getFileList(ns, server, grep, root_only, debug) {

	let filelist = []

	if ( ! server ) { server = "home" }

	if ( ! grep ) { grep = "." }

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

// end file testdir.js
