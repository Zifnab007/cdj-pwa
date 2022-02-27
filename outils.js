let optionsDateHeure = {
	year: 'numeric',
	month: 'numeric',
	day: 'numeric',
	hour: 'numeric',
	minute: 'numeric',
	hour12: false };
export const dateHeureFormatage = Intl.DateTimeFormat("fr", optionsDateHeure);

let optionsDate = {
	year: 'numeric',
	month: 'numeric',
	day: 'numeric',
	hour12: false };
export const dateFormatage = Intl.DateTimeFormat("fr", optionsDate);

export function dateENEnFR(date) {
	let dateFR = ""
	if ((null != date) && ("" != date) && ("0000-00-00" != date)) { dateFR = dateFormatage.format(new Date(date)); }
	return dateFR;
}

export function elementFormatage(valeur, type) {
	let texte = "";
	if (null == valeur) {
		texte = "";
	} else {
		texte = valeur;
	}
	return texte;
}

export function aujourdHui() {
	return dateFormatage.format(Date.now());
}

