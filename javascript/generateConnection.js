import { chunkArray, dateTimeFormat } from "./utils.js";
import generateConnection from "./generateConnected.js";

function requestAccountPage() {
	fetch("connection.php")
		.then(response => response.json(), err => console.error('DEBUG Une erreur lors du fetch connection.php : ' + err))
		.then(json => generateCconnectedPage(json) );
}

export default function generateConnectionPage(json){

	console.info('appel de la fonction generateConnection');

  let html = `
          <div class="column">
            <div class="card has-background-white">
              <div class="card-content">
                <div class="content">
		   Demander à créer un compte:
                </div>
                <div class="button" onclick='requestAccountPage()'>Nouveau compte</div>
              </div>
            </div>
          </div>
          <div class="column">
            <div class="card has-background-white">
              <div class="card-content">
                <div class="content">
		   Connectez vous avec vos
                </div>
                <div class="content">
		   pseudo:
                </div>
                <div class="content">
		   mot de passe:
                </div>
              </div>
            </div>
          </div>`;

  document.querySelector(".container").innerHTML = html;
	console.log("DEBUG La page CONNEXION est chargée");
}
