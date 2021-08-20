import generateConnection from "./generateConnection.js";
import generateCommode from "./generateCommode.js";

export default function generateUI(maPage){

	console.log('DEBUG Appel de la fonction generateUI');

	console.log('DEBUG charger la page '+maPage);
	if (0 == maPage) {
		// afficher un page pour se connecter
		generateConnection();
	} else if (3 == maPage) {
		// Charger les info pour afficher la commode
		fetch("data.php")
			.then(response => response.json(), err => console.error('DEBUG Une erreur lors du fetch data.php : ' + err))
			.then(json => generateCommode(json) );
	} else {
		// afficher un page pour se connecter
		console.info('La page n\'est pas définie');
		generateConnection();
	}

};
