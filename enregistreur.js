import { tracer, tracerTable } from "./traceur.js";

// Classe Enregistreur pour stoker les données et les restituer
export class Enregistreur {
	constructor (selecteur, stockageLocal) {
		this.donnee = null;
		this.selecteur = selecteur;
		this.stockageLocal = stockageLocal;
		if (this.stockageLocal) {
			var donnee = localStorage.getItem(selecteur);
			if ((null != donnee) && ("" != donnee)) {
				this.donnee = JSON.parse(donnee);
			}
			tracer("Restauration de l'enregisterment "+selecteur);
		}
	}
	get () {
		tracer('enregistreur '+this.selecteur+' get '+this.donnee);
		return this.donnee;
	}
	set (donnee) {
		this.donnee = donnee;
		let aStocker = JSON.stringify(this.donnee);
		if (this.stockageLocal) { localStorage.setItem(this.selecteur, aStocker); }
		tracer('enregistreur '+this.selecteur+' set '+aStocker);
	}
	reset () {
		this.donnee = null
		if (this.stockageLocal) { localStorage.setItem(this.selecteur, ""); }
		tracer('enregistreur '+this.selecteur+' reset ');
	}
	estVide () {
		return (null == this.donnee);
	}
}
