import { debug } from "./config.js";

export function tracer(texte) {
	if (debug) {console.info('DEBUG '+texte);}
}

export function tracerTable(table) {
	if (debug) {console.table(table);}
}
