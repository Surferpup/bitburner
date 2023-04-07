/** @param {NS} ns */
// File to keep global values for all scripts
export const DIRS = {HIVE : "hive", HACKS: "hacks", STOCKS : "stocks", UTILS : "utils"}

export async function main(ns) {
	switch (ns.args[0]) {
		case "export":
			for( const property in DIRS ) {
				ns.tprintf(`${property}: ${DIRS[property]}`)
			}
	getSparky(ns,"home",ns.args[1],true);
	} // end switch
}// end function main(ns)

function getSparky(ns,server,dir,all) {
	let list = ns.ls(server,dir)
	for (const t of list) {
		if ((! all)  && (t.startsWith("/"))) {
			continue;
		}
		ns.tprintf(t)
	} // end for
} // end function getSparky
