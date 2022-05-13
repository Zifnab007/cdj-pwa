import { debug } from "./config.js";

export var archiverLesTraces = true;
export var tracesArchivees = "... ";

export function tracer(texte) {
	var archiveTrace;
	if (debug) {console.info('DEBUG '+texte);}
	if (archiverLesTraces) {tracesArchivees += texte+"<br/>"; }
}

export function tracerTable(table) {
	if (debug) {console.table(table);}
}
