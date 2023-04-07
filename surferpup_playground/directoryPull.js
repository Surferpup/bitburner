/** @param {NS} ns */
// File to keep global values for all scripts
export const DIRS = {HIVE : "hive", HACKS: "hacks", STOCKS : "stocks", UTILS : "utils"}

export async function main(ns) {
	switch (ns.args[0]) {
		case "export":
			for( const property in DIRS ) {
				ns.tprintf(`${property}: ${DIRS[property]}`)
			} // end for
			getFileList(ns,"home",ns.args[1],ns.args[2]);
		// end case
	} // end switch
}// end function main(ns)

export function getFileList(ns,server,dir,root_only) {
	let directory_list = ns.ls(server,dir)
	for (const filename of directory_list) {
		if ((root_only)  && (filename.startsWith("/"))) {
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
