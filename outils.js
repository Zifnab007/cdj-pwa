// Note : L'analyse de chaîne de caractères représentant des dates avec le constructeur Date
// (ou Date.parse qui est équivalent) est fortement déconseillée en raison des différences
// de comportement existant entre les navigateurs.
// Il est donc préférable de regrouper l'utilisation de Date dans 1 seult fichier.

let optionsDateHeure = {
	year: 'numeric',
	month: 'numeric',
	day: 'numeric',
	hour: 'numeric',
	minute: 'numeric',
	hour12: false };
const dateHeureFormatage = Intl.DateTimeFormat("fr-FR", optionsDateHeure);

let optionsDate = {
	year: 'numeric',
	month: 'numeric',
	day: 'numeric',
	hour12: false };
const dateFormatage = Intl.DateTimeFormat("fr-FR", optionsDate);

export function tempsDataBaseEnFR(temps) {
	let dateFR = ""
	try {
		if ((null != temps) && ("" != temps) && ("0000-00-00 00-00-00" != temps)) {
			dateFR = dateFormatage.format(new Date(temps.replace(' ', 'T')));
		}
	} catch (e) {
		dateFR = temps+" ERREUR "+e;
	}
	return dateFR;
}

export function dateDataBaseEnFR(date) {
	let dateFR = ""
	if ((null != date) && ("" != date) && ("0000-00-00" != date)) {
		dateFR = dateFormatage.format(new Date(date));
	}
	return dateFR;
}

export function dateFREnDataBase(date) {
	let dateFR = ""
	if ((null != date) && ("" != date) && ("0000-00-00" != date)) { dateFR = dateFormatage.format(new Date(date)); }
	return dateFR;
}

export function elementFormatage(valeur, type) {
	let texte = "";
	if (null == valeur) {
		texte = "";
	} else {
		texte = valeur.replace(/\n/g,'<br/>');
	}
	return texte;
}

export function aujourdHui() {
	return dateFormatage.format(Date.now());
}

