// Classe "Adresse" pour construire les requêttes
export class Adresse {
	constructor (base, page) {
		this.url = base+"/"+page;
	}
	get() {
		return this.url;
	}
	add(cle, valeur) {
		let urlLocale = ""
		if (-1 == this.url.indexOf("?")) {
			urlLocale = this.url+"?";
		} else {
			urlLocale = this.url+"&";
		}
		this.url=urlLocale+cle+"="+valeur;
	}
}
