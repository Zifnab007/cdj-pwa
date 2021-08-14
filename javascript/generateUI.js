import genererCommode from "./genererCommode.js";

export default function generateUI(){

	console.log('DEBUG Appel de la fonction generateUI');

	fetch("https://zifnab-pwa.go.yo.fr/data.php")
		.then(response => response.json(), err => console.error('DEBUG Une erreur lors du fetch data.php : ' + err))
		.then(json => genererCommode(json) );

};
