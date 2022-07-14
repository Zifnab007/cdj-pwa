// Classe "RequeteGet" pour construire les requêtes GET
export class RequeteGet {
	constructor (base, page) {
		let reference = new URL(base);
		this.url = "https://"+reference.hostname+reference.pathname.replace("index.html","")+"/"+page;
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
