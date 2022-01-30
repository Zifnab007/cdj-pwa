import { tracer, tracerTable } from "./traceur.js";

// Classe Pages pour stoker les donnees des differentes pas et les restituer
export class Pages {
	constructor (stockageLocal) {
		this.lesPages = new Object();
		this.selecteur = "pages";
		this.stockageLocal = stockageLocal;
		if (this.stockageLocal) {
			let donnee = localStorage.getItem(this.selecteur);
			if ((null != donnee) && ("" != donnee)) {
				this.lesPages = JSON.parse(donnee);
			}
			tracer("Restauration des "+this.lesPages.length+" pages dans "+this.selecteur+" "+JSON.stringify(this.lesPages));
		} else {
			tracer("Restauration d'aucune page dans "+this.selecteur);
		}
	}

	enregistrer () {
		if (this.stockageLocal) { localStorage.setItem(this.selecteur, JSON.stringify(this.lesPages)); }
		tracer("Enregistrer "+this.lesPages.length+" pages dans "+this.selecteur+" "+JSON.stringify(this.lesPages));
	}

	lireElement (page, id) {
		let donnee = "";
		if (this.lesPages.hasOwnProperty(page) && this.lesPages[page].hasOwnProperty(id)) {
			donnee = this.lesPages[page][id];
		}
		return donnee;
	}

	lirePage (page) {
		let donnee = "";
		if (this.lesPages.hasOwnProperty(page)) {
			donnee = this.lesPages[page];
		}
		return donnee;
	}

	nouvelElement (page, id, donnee) {
		if (!this.lesPages.hasOwnProperty(page)) {
			this.lesPages[page] = [];
		}
		this.lesPages[page][id] = donnee;
	}

	nouvellePage (page, donnee) {
		this.lesPages[page] = donnee;
		this.enregistrer();
		tracer('Nouvelle page '+page+' dans '+this.selecteur+"("+this.lesPages.length+" pages) : "+JSON.stringify(this.lesPages));
	}

	vider (page) {
		this.lesPages[page] = [];
		this.enregistrer();
		tracer('Vider la page '+page+' dans '+this.selecteur);
	}
}
