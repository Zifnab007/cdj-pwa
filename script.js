// Les pages:
// CON Connexion			(genererPageConnexion)
// CMP Compte			(genererPageCompte)
// VAL Validation		(genererPageValidation)
// COM Commode			(genererPageCommode)
// TIR Tiroir			(genererPageTiroir)
// CRT CreationTiroir
// MOT ModifTiroir
// SUT SuppressionTiroir
// OBJ Objet
// CRO CreationObjet             (genererPageNouvelObjet)
// MOO ModifObjet                (genererPageObjet)
// SUO SuppressionObjet
// ERR Erreur                    (genererPageErreur)
// FAT Erreur                    (genererPageFatal)
// INF Information		(genererInformation)
// generateUI
import { extention } from "./config.js";
//
// Données et function principale
//
// Classe Enregistreur pour stoker les données et les restituer
class Enregistreur {
	constructor (selecteur) {
		this.donnee = null;
		this.selecteur = selecteur;
	}
	get () {
		console.log('DEBUG enregistreur '+this.selecteur+' get '+this.donnee);
		return this.donnee;
	}
	set (donnee) {
		this.donnee = donnee;
		console.log('DEBUG enregistreur '+this.selecteur+' set '+this.donnee);
	}
	reset () {
		this.donnee = null;
		console.log('DEBUG enregistreur '+this.selecteur+' reset ');
	}
}

var laPage = [];
var lesPages = [];
lesPages["CON"] = [];
lesPages["CMP"] = [];
lesPages["VAL"] = [];
lesPages["COM"] = [];
lesPages["TIR"] = [];
lesPages["CRT"] = [];
lesPages["MOT"] = [];
lesPages["SUT"] = [];
lesPages["OBJ"] = [];
lesPages["CRO"] = [];
lesPages["MOO"] = [];
lesPages["SUO"] = [];
lesPages["ERR"] = [];
lesPages["FAT"] = [];
lesPages["INF"] = [];
var laCle = new Enregistreur("cle");
var lUtilisateur = new Enregistreur("utilisateur");
var leTiroirId = new Enregistreur("tiroirId");
var nomDeLaTable = new Enregistreur("tableNom");
var lesObjets = new Enregistreur("table");
var lObjet = new Enregistreur("objet");
var laStructure = new Enregistreur("structure")
var nomDuSite = "La commode de Julie";

document.addEventListener("DOMContentLoaded", function() {
console.log('DEBUG DOMContentLoaded event');
generateUI();
});

// ######
// Outils
//
const dateTimeFormat = Intl.DateTimeFormat("fr");

function pageCourante() {
	console.log('DEBUG nombre de page '+laPage.length);
	if (0 == laPage.length) {
		return "CON";
	} else {
		return laPage[laPage.length-1];
	}
}

function donneePageCourante() {
	console.log('DEBUG nombre de page '+laPage.length);
	if (0 == laPage.length) {
		return [];
	} else {
		return laPage[laPage.length-1];
	}
}

function enregistrerNouvellePage(page) {
	// Vider l'historique lorsqu'on reviens sur la page de connexion
	if ("CON" == page) {
		while (laPage.length > 0) {laPage.pop()}
	}
	// Mémoriser la page si elle est nouvelle
	if ((0 == laPage.length) || (pageCourante() != page)) {
		laPage.push(page);
	}
	// activer ou désactiver les boutons
	if (("CON" == page) || ("FAT" == page)) {
		document.querySelector("#retour").className = "button is-link is-hidden";
	} else {
		document.querySelector("#retour").className = "button is-link is-flex";
	}
	if ("TIR" == page) {
		document.querySelector("#creerObjet").className = "button is-link is-flex";
	} else {
		document.querySelector("#creerObjet").className = "button is-link is-hidden";
	}
	console.log('DEBUG nombre de page '+laPage.length+ ' dernière page '+pageCourante());
	console.table(laPage);
}

function memoriserDonneePage() {
	if ("CMP" == pageCourante()) {
		let donnee = [];
		donnee["pseudo"] = document.querySelector("#pseudo").value;
		donnee["email"] = document.querySelector("#eMail").value;
		donnee["mdp"] = document.querySelector("#motDePasse").value;
		lesPages["CMP"] = donnee;
	}

}

function allerPagePrecedante() {
if (0 != laPage.length) { laPage.pop(); }
generateUI();
}

function validerMessage(json) {
if (json.pseudo == lUtilisateur.get() && ("" == json.erreur)) {
	laCle.set(json.cle);
	return true;
} else {
	console.error(lUtilisateur.get()+' recu different de '+json.pseudo+' ou il y a une erreur '+json.erreur);
	lUtilisateur.reset();
	return false;
}
}

function messageEstValide(json) {
	// le message est valide si:
	// - l'utilisateur est celui enregistré localement lors de la connection
	// - la clé est celle enregistrée localement lors de la connection
	// - le message d'erreur est vide
if ("CON" == laPage) {
	return validerMessage(json);
} else {
	if ((json.cle == laCle.get()) && (json.pseudo == lUtilisateur.get()) && ("" == json.erreur)) {
		return true;
	} else {
		console.error('Invalider '+json.pseudo+' message :'+json.erreur);
		return false;
	}
}
}

// Classe "Adresse" pour construire les requêttes
class Adresse {
	constructor (base, page) {
		this.name = base+"/"+page;
	}
	get() {
		return this.name;
	}
	add(cle, valeur) {
		let urlLocale = ""
		if (-1 == this.name.indexOf("?")) {
			urlLocale = this.name+"?";
		} else {
			urlLocale = this.name+"&";
		}
		this.name=urlLocale+cle+"="+valeur;
	}
}

// ###################################
// Génération de la page Connexion ("CON")
//
// Demander au server de valider la connexion
function demanderConnexion() {
	const url = new Adresse(window.location.href,'connection'+extention);
	lUtilisateur.set(document.querySelector("#pseudo").value);
	url.add("pseudo", lUtilisateur.get());
	url.add("motDePasse", document.querySelector("#mdp").value);
	console.info('DEBUG Clic sur demanderConnexion ' + url.get());
	fetch(url.get())
		.then(response => response.json(), err => console.error('DEBUG Une erreur lors du fetch ' + url.href + ' : ' + err))
		.then(json => genererPageCommode(json) );
}

// Generer la page
function genererPageConnexion(){

	console.info('DEBUG appel de la fonction genererPageConnexion');
	laCle.reset();
	lUtilisateur.reset();

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
                  <input id="pseudo" class="input is-success" type="text" placeholder="Votre pseudo">
                  <span class="icon is-small is-left">
                    <i class="fas fa-user"></i>
                  </span>
                  <span class="icon is-small is-right">
                    <i class="fas fa-check"></i>
                  </span>
                </div>
                <p class="help is-success">Saisir son pseudo</p>
              </div>

              <div class="field">
                <label class="label">Mot de passe</label>
                <div class="control has-icons-left has-icons-right">
                  <input id="mdp" class="input is-success" type="password" placeholder="Votre mot de passe">
                  <span class="icon is-small is-left">
                    <i class="fas fa-password"></i>
                  </span>
                  <span class="icon is-small is-right">
                    <i class="fas fa-check"></i>
                  </span>
                </div>
                <p class="help is-success">Saisir son mot de passe d'au moins 6 caractères</p>
              </div>

              <div class="field is-grouped">
                <div class="control">
                  <button id="demanderConnexion" class="button is-link">Se connecter</button>
                </div>
              </div>

            </div>

          </div>`;

	document.querySelector(".container").innerHTML = html;
	document.querySelector(".title").innerHTML = nomDuSite;
	document.querySelector("#creerCompte").onclick = genererPageCompte;
	document.querySelector("#demanderConnexion").onclick = demanderConnexion;
	enregistrerNouvellePage("CON",[]);
	console.log("DEBUG La page CONNEXION (CON) est chargée");
}

// ###############################################
// Génération de la page de création de compte ("CMP")
//
//
function demanderCreationCompte() {
	memoriserDonneePage();
	const url = new Adresse(window.location.href,'compte'+extention);
	url.add("user", document.querySelector("#pseudo").value);
	url.add("email", document.querySelector("#eMail").value);
	url.add("mdp", document.querySelector("#motDePasse").value);
	console.info('DEBUG Clic sur demanderCreationCompte ' + url.get());
	fetch(url.get())
		.then(
			response => response.json(),
			err => genererPageErreur(err, null))
		.then(json => genererPageValidation(json) )
		.catch(err => genererPageFatal(err, "Erreur interne levée lors de la création d'un compte pour "+document.querySelector("#pseudo").value+" avec l'email "+document.querySelector("#eMail").value));

}

// Generer la page de demande de création de compte
function genererPageCompte(){

	console.info('DEBUG appel de la fonction genererPageCompte');
	let pseudo = "";
	let email = "";
	let mdp = "";
	if (null != lesPages["CMP"]["pseudo"]) { pseudo = lesPages["CMP"]["pseudo"];}
	if (null != lesPages["CMP"]["email"]) { email = lesPages["CMP"]["email"];}

	let html = `
          <div class="column">

            <div class="box">

              <label class="label">Créer un compte avec:</label>

              <div class="field">
                <label class="label">Pseudo</label>
                <div class="control has-icons-left has-icons-right">
                  <input id="pseudo" class="input is-success" type="text" placeholder="Votre pseudo" value="${pseudo}">
                  <span class="icon is-small is-left">
                    <i class="fas fa-user"></i>
                  </span>
                  <span class="icon is-small is-right">
                    <i class="fas fa-check"></i>
                  </span>
                </div>
                <p class="help is-success">Ce pseudo est valide</p>
              </div>

              <div class="field">
                <label class="label">adresse e-mail</label>
                <div class="control has-icons-left has-icons-right">
                  <input id="eMail" class="input is-success" type="email" placeholder="Votre adresse e-mail" value="${email}">
                  <span class="icon is-small is-left">
                    <i class="fas fa-password"></i>
                  </span>
                  <span class="icon is-small is-right">
                    <i class="fas fa-check"></i>
                  </span>
                </div>
                <p class="help is-success">Cette adresse e-mail est valide</p>
              </div>

              <div class="field">
                <label class="label">Mot de passe</label>
                <div class="control has-icons-left has-icons-right">
                  <input id="motDePasse" class="input is-success" type="password" placeholder="Votre mot de passe" value="">
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
                  <button id="demanderCreationCompte" class="button is-link">Créer</button>
                </div>
              </div>

           </div>`;

	document.querySelector(".container").innerHTML = html;
	document.querySelector(".title").innerHTML = nomDuSite;
	document.querySelector("#demanderCreationCompte").onclick = demanderCreationCompte;
	enregistrerNouvellePage("CMP",[]);
	console.log("DEBUG La page COMPTE (CMP) est chargée");

}

// ###############################################
// Génération de la page de validation ("VAL")
//
//

// Generer la page de demande de création de compte
function genererPageValidation(json){

	console.info('DEBUG appel de la fonction genererPageValidation');

	if ("" == json.cle) {
		console.log("DEBUG La page VALIDATION (VAL) n'est pas chargable");
		genererPageErreur("ERREUR DE CREATION DE COMPTE", json.erreur);
	} else {
		let html = `
          <div class="column">

            <div class="box">

              <!-- label class="label">Vous devez activer votre compte en cliquant sur le lien envoyé par e-mail.</label -->
              <label class="label">La méthode d'activation du compte ne'st pas encore implémentée.</label>

            </div>

          </div>`;

		document.querySelector(".container").innerHTML = html;
		document.querySelector(".title").innerHTML = nomDuSite;
		enregistrerNouvellePage("VAL",[]);
		console.log("DEBUG La page VALIDATION (VAL) est chargée");
	}

}

// #################################
// Génération de la page Commode ("COM")
//
function demanderOuvrirTiroir(tiroirId) {
	const url = new Adresse(window.location.href,'tiroir'+extention);
	url.add("user", lUtilisateur.get());
	url.add("cle", laCle.get());
	url.add("tiroir", tiroirId);
	console.info('DEBUG Clic sur demanderOuvrirTiroir ' + url.get());
	fetch(url.get())
		.then(response => response.json(), err => console.error('ERREUR Une erreur lors du fetch ' + url.href + ' : ' + err))
		.then(json => genererPageTiroir(json) );
	return true;
}

//
function genererPageCommode(json){

	console.info('DEBUG appel de la fonction genererPageCommode '+json.cle);

	nomDeLaTable.reset();
	lesObjets.reset();
	laStructure.reset();
	if (messageEstValide(json)) {

		const tiroirs = json.data.map(j => ({
			name: j.name,
			id: j.id,
			icon: j.icon,
			description: j.description || "",
			updated_at: j.updated_at
		}));

		let html = "";

		html += '<div class="section"><div class="columns">';

		tiroirs.forEach(tiroir => {
			html += `
          <div class="column">
            <div class="card has-background-white">
              <div class="card-content">
                <div class="media">
                  <div class="media-lefti">
                    <figure class="image is-48x48">
                      <img class="has-background-info is-rounded"
                        src="${tiroir.icon}"
                        alt="Placeholder image"
                      />
                    </figure>
                  </div>
                  <div class="media-content">
                    <p class="title is-4">${tiroir.name}</p>
                    <label class="input is-hidden">${tiroir.id}</label>
                    <div class="button" id="T${tiroir.id}">Ouvrir</div>
                  </div>
                </div>
  
                <div class="content">
                   ${tiroir.description}
                  <br />
                  Dernière mise à jour: <time datetime="${
                    tiroir.updated_at
                  }">${dateTimeFormat.format(new Date(tiroir.updated_at))}</time>
                </div>
              </div>
            </div>
          </div>`;
		});
		html += "</div></div>";
                document.querySelector(".container").innerHTML = html;
		document.querySelector(".title").innerHTML = nomDuSite;

		tiroirs.forEach(tiroir => {
			console.log("test creation onclick "+tiroir.id);
			document.querySelector("#T"+tiroir.id).onclick = function() {demanderOuvrirTiroir(tiroir.id);};
		});
		enregistrerNouvellePage("COM",[]);

		console.log("DEBUG La page COMMODE (COM) est chargée");

	} else {
		genererPageFatal("IMPOSSIBLE D'AFFICHER LA COMMONDE", json.erreur);
	}

}

function requestCommodePage() {
	fetch('commode'+extention)
		.then(response => response.json(), err => console.error('ERREUR Une erreur lors du fetch commode.php : ' + err))
		.then(json => genererPageCommode(json) );
}

// #################################
// Génération de la page Tiroir ("TIR")
//
function afficherUnElement(key, value){
	let elementStr = "";
	if (null != value) { 
	elementStr = `<b>${key}</b> : ${value}<br/>
`;
	}
	return elementStr;
}

function genererPageTiroir(leTiroir){

	console.info('DEBUG appel de la fonction genererPageTiroir '+leTiroir.cle);
//	console.table(leTiroir);

	if (messageEstValide(leTiroir)) {

		lesObjets.set(leTiroir.data);
		leTiroirId.set(leTiroir.id);
		nomDeLaTable.set(leTiroir.table);
		laStructure.set(leTiroir.structure);

		let html = "";

		html += `
        <div class="section"> <div class="columns">`;

//			console.table(lesObjets.get());
		lesObjets.get().forEach(objet => {
			html += `
          <div class="column">
            <div class="card has-background-white">
              <div class="card-content">
                <div class="media">
                  <div class="media-lefti">
                    <figure class="image is-96x96">
                      <img class="has-background-info is-rounded"
                        src="${objet.icon}"
                        alt="Placeholder image"
                      />
                    </figure>
                  </div>
                  <div class="media-content">
                    <p class="title is-4">${objet.name}</p>
                    <label class="input is-hidden">${objet.id}</label>
                    <div class="button" id="T${objet.id}">Modifier</div>
                  </div>
                </div>
  
                <div class="content">`;

			for (const [key, value] of Object.entries(objet.record)) {
				html += afficherUnElement(key, value); 
			}
//			console.table(objet);

			html += `
                  <hr />
                  Créé le: <time datetime="${
                    objet.created_at
                  }">${dateTimeFormat.format(new Date(objet.created_at))}</time>
                  <br />
                  Dernière mise à jour: <time datetime="${
                    objet.updated_at
                  }">${dateTimeFormat.format(new Date(objet.updated_at))}</time>
                </div>
              </div>
            </div>
	  </div>
	</div> </div>`;
		});
		html += "</div></div>";
                document.querySelector(".container").innerHTML = html;
		document.querySelector(".title").innerHTML = nomDuSite+" : "+leTiroir.table;

		lesObjets.get().forEach(objet => {
			console.log("test creation objet "+objet.id);
			document.querySelector("#T"+objet.id).onclick = function() {genererPageObjet(objet);};
		});
		enregistrerNouvellePage("TIR",[]);

		console.log("DEBUG La page TIROIR (TIR) est chargée");

	} else {
		genererPageConnexion();
	}

}

// #################################
// Génération de la page de modification d'un élément ("MOO")
//
// Demander au server l'enregistrement
function demanderEnregistrement() {
	const url = new Adresse(window.location.href,'objet'+extention);
	url.add("user", lUtilisateur.get());
	url.add("cle", laCle.get());
	url.add("tiroir", leTiroirId.get());
	let commande = "";
	let jsonCmd = new Object();
	let jsonRecord = new Object();
	jsonCmd["id"] = 0;
	jsonCmd["node_id"] = 0;
	jsonCmd["name"] = 0;
	jsonCmd["icon"] = "images/icons/icon-96x96.png";
	jsonCmd["supprimer"] = 0;
	laStructure.get().forEach(function (structure, index) {
		jsonRecord[structure.Nom] = document.querySelector("#elem"+index).value;
	});
	jsonCmd["record"] = jsonRecord;
	lObjet.set(jsonCmd);
	console.log(JSON.stringify(jsonCmd));
	commande = JSON.stringify(jsonCmd);
	url.add("objet", commande);
	console.info('DEBUG Clic sur demanderEnregistrement ' + url.get());
	fetch(url.get())
		.then(
			response => response.json(),
			err => genererPageErreur(err, null))
		.then(json => genererPageTiroir(json) )
		.catch(err => genererPageFatal(err, "Erreur interne levée lors de l'enregistrement d'un élément du tiroir "+nomDeLaTable.get()+" de l'utilisateur "+lUtilisateur.get()+". Commande fautive : "+commande));
}

function genererPageObjet(objet){

	console.info('DEBUG appel de la fonction genererPageObjet '+objet.id);

		let html = "";
		let texte = "";

		html += `
          <div class="column">
            <div class="box">`
		if (null == objet.id) {texte = ""} else {texte = objet.id};
		html += `
              <input id="elemId" class="input is-success is-hidden" type="text" placeholder="" value="${texte}">`;
		if (null == objet.node_id) {texte = ""} else {texte = objet.node_id};
		html += `
              <input id="elemNodeId" class="input is-success is-hidden" type="text" placeholder="" value="${texte}">`;
		if (null == objet.name) {texte = ""} else {texte = objet.name};
		html += `
              <div class="field">
                <label class="label">Nom</label>
                <div class="control has-icons-left has-icons-right">
                  <input id="elemNom" class="input is-success" type="text" placeholder="" value="${texte}">
                  <span class="icon is-small is-left">
                    <i class="fas fa-user"></i>
                  </span>
                  <span class="icon is-small is-right">
                    <i class="fas fa-check"></i>
                  </span>
                </div>
              </div>`;

		laStructure.get().forEach(function (structure, index) {
//			console.table(objet);
			if (null == objet.record[structure.Nom]) {texte = ""} else {texte = objet.record[structure.Nom]};
			html += `
              <div class="field">
                <label class="label">${structure.Nom}</label>
                <div class="control has-icons-left has-icons-right">
                  <input id="elem${index}" class="input is-success" type="text" placeholder="" value="${texte}">
                  <span class="icon is-small is-left">
                    <i class="fas fa-user"></i>
                  </span>
                  <span class="icon is-small is-right">
                    <i class="fas fa-check"></i>
                  </span>
                </div>
              </div>`;
		});

		html += `

              <div class="field is-grouped">
                <div class="control">
                  <button id="demanderEnregistrement" class="button is-link">Enregistrer</button>
                </div>
              </div>

            </div>
          </div>`
                document.querySelector(".container").innerHTML = html;
		document.querySelector(".title").innerHTML = nomDuSite+" : "+nomDeLaTable.get();
		document.querySelector("#demanderEnregistrement").onclick = demanderEnregistrement;

		enregistrerNouvellePage("MOO",[]);

		console.log("DEBUG La page MODIFIER ELEMENT (MOO) est chargée");

}

function genererPageNouvelObjet(){

	console.info('DEBUG appel de la fonction genererPageNouvelObjet ');

	let objet = new Object();
	let record = new Object();
	objet["id"] = null;
	objet["node_id"] = null;
	objet["name"] = null;
	objet["icon"] = null;
	objet["supprimer"] = 0;
	laStructure.get().forEach(function (structure, index) {
		record[structure.Nom] = null;
	});
	objet["record"] = record;
	lObjet.reset();

	genererPageObjet(objet);

}

// ###################################
// Génération de la page d'erreur ("ERR")
//
// Generer la page
function genererPageErreur(erreur, info){

	console.info('DEBUG appel de la fonction genererPageErreur');

	let html = `
          <div class="column">

            <div class="box">

              <label class="label">Erreur : </label>${erreur}<br/>`

	if (null != info) {
		html += `
              <br/><label class="label">Information : </label>${info}<br/>`
	}

	html += `
	      <br/>Cliquer sur "Retour" en haut à droite pour revenir sur la page générant l'erreur.<br/>

            </div>

          </div>`;

	document.querySelector(".container").innerHTML = html;
	enregistrerNouvellePage("ERR",[]);
	console.log("DEBUG La page ERREUR (ERR) est chargée");
}
// ###################################
// Génération de la page d'erreur fatale ("FAT")
//
// Generer la page
function genererPageFatal(erreur, info){

	console.info('DEBUG appel de la fonction genererPageFatal');

	let html = `
          <div class="column">

            <div class="box">

              <label class="label">Erreur : </label>${erreur}<br/>`

	if (null != info) {
		html += `
              <br/><label class="label">Information : </label>${info}<br/>`
	}

	html += `
              <div class="column">
                <div class="card has-background-white">
                  <div class="card-content">
                    <div class="content">
		       Revenir sur la page de connexion : 
                    </div>
                    <div class="button" id="revenirConnexion">Se reconnecter</div>
                  </div>
                </div>
              </div>

            </div>

          </div>`;

	document.querySelector(".container").innerHTML = html;
	document.querySelector("#revenirConnexion").onclick = genererPageConnexion;
	enregistrerNouvellePage("FAT",[]);
	console.log("DEBUG La page FATAL (FAT) est chargée");
}

// ########################################
// Génération de la page d'information ("INF")
//
// Generer la page
function genererInformation() {

	console.info('DEBUG appel de la fonction genererInformation');
	memoriserDonneePage();

	let utilisateur = lUtilisateur.get();
	if (null == utilisateur) { utilisateur = "non connecté"; }
	let LeServiceWorker = "indéfini";
	if ("serviceWorker" in navigator) {
		LeServiceWorker = "actif";
	}

	let html = `
          <div class="column">

            <div class="box">

              Utilisateur : ${utilisateur}<br/><br/>

              Service worker : ${LeServiceWorker}<br/><br/>

	      Ce site est hébergé sur PlanetHost.<br/>
	      Ce site est mis en forme avec Bulma.<br/>

            </div>

          </div>`;

	document.querySelector(".container").innerHTML = html;
	enregistrerNouvellePage("INF",[]);
	console.log("DEBUG La page ERREUR (INF) est chargée");

}

// #####################################################
// Génération de la l'interface au chargement de l'appli
//
function generateUI(){

	console.log('DEBUG Appel de la fonction generateUI');

	console.log('DEBUG charger la page '+pageCourante());
	if ("CON" == pageCourante()) {
		// afficher un page pour se connecter
		genererPageConnexion();
	} else if ("COM" == pageCourante()) {
		// Charger les info pour afficher la commode
		fetch('commode'+extention)
			.then(response => response.json(), err => console.error('ERREUR Une erreur lors du fetch commode.php : ' + err))
			.then(json => genererPageCommode(json) );
	} else if ("CMP" == pageCourante()) {
		// Afficher la céation d'un compte
		genererPageCompte();
	} else if ("TIR" == pageCourante()) {
		// Charger les info pour afficher le tiroir
		const url = new Adresse(window.location.href,'tiroir'+extention);
		url.add("user", lUtilisateur.get());
		url.add("cle", laCle.get());
		url.add("tiroir", leTiroirId.get());
		console.info('DEBUG Clic sur demanderOuvrirTiroir ' + url.get());
		fetch(url.get())
			.then(response => response.json(), err => console.error('ERREUR Une erreur lors du fetch ' + url.href + ' : ' + err))
			.then(json => genererPageTiroir(json) );
	} else {
		// afficher un page pour se connecter
		console.info("DEBUG La page n'est pas définie");
		genererPageConnexion();
	}
	document.querySelector("#retour").onclick = allerPagePrecedante;
	document.querySelector("#config").onclick = genererInformation;
	document.querySelector("#creerObjet").onclick = function() {genererPageNouvelObjet();};

};
