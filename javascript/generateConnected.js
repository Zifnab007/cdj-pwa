import { chunkArray, dateTimeFormat } from "./utils.js";
import generateCommode from "./generateCommode.js";

function requestCommodePage() {
	fetch("connection.php")
		.then(response => response.json(), err => console.error('DEBUG Une erreur lors du fetch connection.php : ' + err))
		.then(json => generateCommode(json) );
}

export default function generateConnectedPage(){

	console.info('appel de la fonction generateConnectedPage');

  let html = `
          <div class="column">
            <div class="card has-background-white">
              <div class="card-content">
                <div class="content">
		   Ouvrir la commode:
                </div>
                <div class="button" onclick='alert("xxx")'>ouvrir</div>
              </div>
            </div>
          </div>`;

  document.querySelector(".container").innerHTML = html;
	console.log("DEBUG La page CONNECTED est chargée");
}
