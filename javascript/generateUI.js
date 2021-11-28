import generateConnectionPage from "./generateConnection.js";
import generateCommodePage from "./generateCommode.js";
import { chunkArray, dateTimeFormat, laPage } from "./utils.js";

export default function generateUI(laPage){

	console.log('DEBUG Appel de la fonction generateUI');

	console.log('DEBUG charger la page '+laPage);
	if (0 == laPage) {
		// afficher un page pour se connecter
		generateConnectionPage();
	} else if (3 == laPage) {
		// Charger les info pour afficher la commode
		fetch("data-patch.json")
			.then(response => response.json(), err => console.error('DEBUG Une erreur lors du fetch data.php : ' + err))
			.then(json => generateCommodePage(json) );
	} else {
		// afficher un page pour se connecter
		console.info('La page n\'est pas définie');
		generateConnectionPage();
	}

};
