// Classe "Adresse" pour construire les requêttes
export class Adresse {
	constructor (base, page) {
		this.name = base+"/"+page;
	}
	get() {
		return this.name;
	}
	add(cle, valeur) {
		let urlLocale = ""
		if (-1 == this.name.indexOf("?")) {
			urlLocale = this.name+"?";
		} else {
			urlLocale = this.name+"&";
		}
		this.name=urlLocale+cle+"="+valeur;
	}
}
