import { chunkArray, dateTimeFormat } from "./utils.js";
import generateCommodePage from "./generateCommode.js";

function requestCommodePage() {
	fetch("data-patch.json")
		.then(response => response.json(), err => console.error('DEBUG Une erreur lors du fetch connection.php : ' + err))
		.then(json => generateCommodePage(json) );
}

export default function generateConnectedPage(json){

	console.info('appel de la fonction generateConnectedPage');

  let html = `
          <div class="column">
            <div class="card has-background-white">
              <div class="card-content">
                <div class="content">
		   Ouvrir la commode:
                </div>
                <div class="button" id="ouvrirCommode">ouvrir</div>
              </div>
            </div>
          </div>`;

  document.querySelector(".container").innerHTML = html;
  document.querySelector("#ouvrirCommode").onclick = requestCommodePage;
	console.log("DEBUG La page CONNECTED est chargée");
}
