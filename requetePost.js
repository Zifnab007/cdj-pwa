// Classe "RequetePost" pour construire les requêtes POST
export class RequetePost {
	constructor (base, page) {
		let reference = new URL(base);
		this.url = "https://"+reference.hostname+reference.pathname.replace("index.html","")+"/"+page;
		this.maForme = new FormData;
	}
	requete() {
		return this.url;
	}
	option() {
		const fetchOptions  = {
			method: 'POST',
			body: this.maForme,
		};
		return fetchOptions;
	}
	ajouter(cle, valeur) {
		this.maForme.set(cle, valeur);
	}
}
