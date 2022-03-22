// Classe "RequeteGet" pour construire les requêtes GET
export class RequeteGet {
	constructor (base, page) {
		this.url = base+"/"+page;
	}
	requete() {
		return this.url;
	}
	option() {
		return null;
	}
	ajouter(cle, valeur) {
		let urlLocale = ""
		if (-1 == this.url.indexOf("?")) {
			urlLocale = this.url+"?";
		} else {
			urlLocale = this.url+"&";
		}
		this.url=urlLocale+cle+"="+valeur;
	}
}
