import { chunkArray, dateTimeFormat } from "./utils.js";
import generateConnectedPage from "./generateConnected.js";

function requestAccountPage() {
	fetch("connection-patch.json")
		.then(response => response.json(), err => console.error('DEBUG Une erreur lors du fetch connection.php : ' + err))
		.then(json => generateConnectedPage(json) );
}

function requestConnection() {
	let urlForm = 'connection-patch.json';
	const url = new URL(urlForm, window.location.href);
	console.info('Clic sur requestConnection ' + url.href);
	fetch(url.href)
		.then(response => response.json(), err => console.error('DEBUG Une erreur lors du fetch ' + urlForm + ' : ' + err))
		.then(json => generateConnectedPage(json) );
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
                <div class="button" id="creerCompte">Nouveau compte</div>
              </div>
            </div>
          </div>
          <div class="column">

            <div class="box">

              <label class="label">Connectez vous avec vos</label>

              <div class="field">
                <label class="label">Pseudo</label>
                <div class="control has-icons-left has-icons-right">
                  <input class="input is-success" type="text" placeholder="Votre pseudo">
                  <span class="icon is-small is-left">
                    <i class="fas fa-user"></i>
                  </span>
                  <span class="icon is-small is-right">
                    <i class="fas fa-check"></i>
                  </span>
                </div>
                <p class="help is-success">Ce mot de passe est valide</p>
              </div>

              <div class="field">
                <label class="label">Mot de passe</label>
                <div class="control has-icons-left has-icons-right">
                  <input class="input is-success" type="text" placeholder="Votre mot de passe">
                  <span class="icon is-small is-left">
                    <i class="fas fa-password"></i>
                  </span>
                  <span class="icon is-small is-right">
                    <i class="fas fa-check"></i>
                  </span>
                </div>
                <p class="help is-success">Ce mot de passe est valide</p>
              </div>

              <div class="field is-grouped">
                <div class="control">
                  <button id="validerConnexion" class="button is-link">Submit</button>
                </div>
              </div>

            </div>

          </div>`;

  document.querySelector(".container").innerHTML = html;
  document.querySelector("#creerCompte").onclick = requestAccountPage;
  document.querySelector("#validerConnexion").onclick = requestConnection;
	console.log("DEBUG La page CONNEXION est chargée");
}
