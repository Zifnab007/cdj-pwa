// Les pages:
// CON Connexion		(genererPageConnexion)
// CMP Compte			(genererPageCompte)
// VAL Validation		(genererPageValidation)
// COM Commode			(genererPageCommode)
// TIR Tiroir			(genererPageTiroir)
// CRT CreationTiroir		(genererPageNouveauTiroir)
// MOT ModifTiroir
// SUT SuppressionTiroir
// OBJ Objet
// CRO CreationObjet            (genererPageNouvelObjet)
// MOO ModifObjet               (genererPageObjet)
// SUO SuppressionObjet
// ERR Erreur                   (genererPageErreur)
// FAT Erreur                   (genererPageFatal)
// INF Information		(genererInformation)
// generateUI
import { extention } from "./config.js";
import { tracer, tracerTable } from "./traceur.js";
import { Enregistreur } from "./enregistreur.js";
import { Adresse } from "./adresse.js";
import { Pages } from "./pages.js";
import { FormateurCommode } from "./formateurCommode.js";
import { FormateurPetitTiroir } from "./formateurPetitTiroir.js";
import { FormateurGrandTiroir } from "./formateurGrandTiroir.js";


//
// Données et function principale
//
// Configuration
const nbMaxAvantAffichageCompact = 4;

// Mémoriser la configuration du navigateur
var stockage = false;
if ("localStorage" in window) {
	stockage = true;
}

var laPage = [];
var lesPages = new Pages(stockage);

var laCle = new Enregistreur("cle", stockage);
var lUtilisateur = new Enregistreur("utilisateur", stockage);
var leTiroirId = new Enregistreur("tiroirId", stockage);
var nomDeLaTable = new Enregistreur("tableNom", stockage);
var lesObjets = new Enregistreur("table", stockage);
var lObjet = new Enregistreur("objet", stockage);
var laStructure = new Enregistreur("structure", stockage)
var nomDuSite = "La commode de Julie";

document.addEventListener("DOMContentLoaded", function() {
	tracer('DOMContentLoaded event');
	if (stockage) {
		var pageStockee = localStorage.getItem('laPage');
		if (null != pageStockee) {
			laPage = JSON.parse(pageStockee);
			tracer("Restauration de l'historique des pages avec "+laPage.length+' element');
		}
	}
	generateUI();
});
window.addEventListener("unload", function() {
	tracer('onunload event');
	memoriserDonneePage();
});

// ######
// Outils
//
const dateTimeFormat = Intl.DateTimeFormat("fr");

function pageCourante() {
	tracer('nombre de page '+laPage.length);
	if (0 == laPage.length) {
		return "CON";
	} else {
		return laPage[laPage.length-1];
	}
}

function declarerNouvellePage(page) {
	// Vider l'historique lorsqu'on reviens sur la page de connexion
	if ("CON" == page) {
		while (laPage.length > 0) {laPage.pop()}
	}
	// activer ou désactiver les boutons
	if (("CON" == page) || ("FAT" == page)) {
		document.querySelector("#retour").className = "button is-link is-hidden";
	} else {
		document.querySelector("#retour").className = "button is-link is-flex";
	}
	if ("COM" == page) {
		document.querySelector("#creerTiroir").className = "button is-link is-flex";
	} else {
		document.querySelector("#creerTiroir").className = "button is-link is-hidden";
	}
	if ("TIR" == page) {
		if ("MOO" == pageCourante()) { laPage.pop(); }
		document.querySelector("#creerObjet").className = "button is-link is-flex";
	} else {
		document.querySelector("#creerObjet").className = "button is-link is-hidden";
	}
	// Mémoriser la page si elle est nouvelle
	if ((0 == laPage.length) || (pageCourante() != page)) {
		laPage.push(page);
	}
	tracer('nombre de page '+laPage.length+' page demandée '+page+' dernière '+pageCourante());
	tracerTable(laPage);
	if (stockage) {
		localStorage.setItem('laPage', JSON.stringify(laPage));
	};
}

function memoriserDonneePage() {
	if ("CMP" == pageCourante()) {
		let donnee = new Object();
		donnee["pseudo"] = document.querySelector("#pseudo").value;
		donnee["email"] = document.querySelector("#eMail").value;
		donnee["mdp"] = document.querySelector("#motDePasse").value;
		lesPages.nouvellePage("CMP", donnee);
		tracer('memoriserDonneePage '+donnee.length+' element');
	} else if ("CRT" == pageCourante()) {
		let donnee = new Object();
		donnee["nom"] = document.querySelector("#base").value;
		for (var i=0;i<4;i++) {
			donnee["nom"+i] = document.querySelector("#nom"+i).value;
			donnee["type"+i] = document.querySelector("#type"+i).value;
		}
		lesPages.nouvellePage("CRT", donnee);
	} else if ("MOO" == pageCourante()) {
		let donnee = new Object();
		donnee["id"] = document.querySelector("#elemId").value;
		donnee["name"] = document.querySelector("#elemNom").value;
		donnee["icon"] = "";
		donnee["supprimer"] = 0;
		let champsLibres = [];
		laStructure.get().forEach(function (structure, index) {
tracer('MOO '+structure.nom+" a l'index "+index);
			champsLibres[index] = document.querySelector("#elem"+index).value;
		});
tracerTable(champsLibres);
tracerTable(donnee);
tracer('MOO taille champsLibres'+champsLibres.length);
		donnee["champsLibres"] = champsLibres;
		lesPages.nouvellePage("MOO", donnee);
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
	laCle.reset();
	return false;
}
}

function messageEstValide(json) {
	// le message est valide si:
	// - l'utilisateur est celui enregistré localement lors de la connection
	// - la clé est celle enregistrée localement lors de la connection
	// - le message d'erreur est vide
	tracer('validation ' + json.cle+" de "+json.pseudo+" Erreur :"+json.erreur+".");
	if ((json.cle == laCle.get()) && (json.pseudo == lUtilisateur.get()) && ("" == json.erreur)) {
		return true;
	} else {
		console.error('Invalider '+json.pseudo+' message :'+json.erreur);
		return false;
	}
}

function chapitreEnHTML(titre, texte) {
	let TitreHTML = "";
	let TexteHTML = "";
	if ("" != titre) { TitreHTML = `<label class="label">${titre}</label>`; }
	if ("" != texte) { TexteHTML = `${texte}<br/>`; }
	return TitreHTML+TexteHTML;
}

function elementEnHTML(key, value){
	let elementStr = "";
	if (null != value) { 
	elementStr = `<b>${key}</b> : ${value}<br/>
`;
	}
	return elementStr;
}

function saisieEnHTML(titre, id, type, fond, valeur, aide) {
	return `
              <div class="field">
                <label class="label">${titre}</label>
                <div class="control has-icons-left has-icons-right">
                  <input id="${id}" class="input is-success" type="${type}" placeholder="${fond}" value="${valeur}">
                  <span class="icon is-small is-left">
                    <i class="fas fa-user"></i>
                  </span>
                  <span class="icon is-small is-right">
                    <i class="fas fa-check"></i>
                  </span>
                </div>
                <p class="help is-success">${aide}</p>
              </div>`;
}

function choixEnHTML(titre, id, choix, selection, aide) {
	let html = `
              <div class="field">
                <label class="label">${titre}</label>
                <div class="control has-icons-left has-icons-right">
		  <div class="select">
			<select id="${id}" class="input is-success">`;
	for (var y in choix) {
		if (choix[y] == selection) {
			html += `
				<option value="${choix[y]}" selected>${choix[y]}</option>`;
		} else {
			html += `
				<option value="${choix[y]}">${choix[y]}</option>`;
		}
	};
	html += `
			</select>
		  </div>
                  <span class="icon is-small is-left">
                    <i class="fas fa-user"></i>
                  </span>
                  <span class="icon is-small is-right">
                    <i class="fas fa-check"></i>
                  </span>
                </div>
                <p class="help is-success">${aide}</p>
              </div>`;
	return html;
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
	tracer('Clic sur demanderConnexion ' + url.get());
	fetch(url.get())
		.then(response => response.json(), err => console.error('DEBUG Une erreur lors du fetch ' + url.href + ' : ' + err))
		.then(json => validerConnexion(json) );
}

// Valider la connexion
function validerConnexion(json) {
	if (validerMessage(json)) {
		const url = new Adresse(window.location.href,'commode'+extention);
		url.add("pseudo", json.pseudo);
		url.add("cle", json.cle);
		tracer('execution de validerConnexion ' + url.get());
		fetch(url.get())
			.then(response => response.json(), err => console.error('DEBUG Une erreur lors du fetch ' + url.href + ' : ' + err))
			.then(json => genererPageCommode(json) );
	} else {
		genererPageFatal("LA CONNEXION EST REFUSEE", json.erreur);
	}
}

// Generer la page
function genererPageConnexion(){

	tracer('appel de la fonction genererPageConnexion');
	if (stockage) { localStorage.clear(); }
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

            <div class="box">`;

	html += chapitreEnHTML("Connectez vous avec vos", "");
	html += saisieEnHTML("Pseudo", "pseudo", "text", "Votre pseudo", "", "Saisir son pseudo");
	html += saisieEnHTML("Mot de passe", "mdp", "password", "Votre mot de passe", "", "Saisir son mot de passe d'au moins 6 caractères");

	html += `
              <div class="field is-grouped">
                <div class="control">
                  <button id="demanderConnexion" class="button is-link">Se connecter</button>
                </div>
              </div>

            </div>

          </div>`;

	document.querySelector(".corpDePage").innerHTML = html;
	document.querySelector(".title").innerHTML = nomDuSite;
	document.querySelector("#creerCompte").onclick = genererPageCompte;
	document.querySelector("#demanderConnexion").onclick = demanderConnexion;
	declarerNouvellePage("CON");
	tracer("La page CONNEXION (CON) est chargée");
}

// ###############################################
// Génération de la page de création de compte ("CMP")
//
//
function demanderCreationCompte() {
	memoriserDonneePage();
	const url = new Adresse(window.location.href,'compte'+extention);
	url.add("pseudo", document.querySelector("#pseudo").value);
	url.add("email", document.querySelector("#eMail").value);
	url.add("mdp", document.querySelector("#motDePasse").value);
	tracer('Clic sur demanderCreationCompte ' + url.get());
	fetch(url.get())
		.then(
			response => response.json(),
			err => genererPageErreur(err, null))
		.then(json => genererPageValidation(json) )
		.catch(err => genererPageFatal(err, "Erreur interne levée lors de la création d'un compte pour "+document.querySelector("#pseudo").value+" avec l'email "+document.querySelector("#eMail").value));

}

// Generer la page de demande de création de compte
function genererPageCompte(){

	tracer('appel de la fonction genererPageCompte');
	let pseudo = lesPages.lireElement("CMP", "pseudo");
	let email = lesPages.lireElement("CMP", "email");
	let mdp = "";

	let html = `
          <div class="column">

            <div class="box">

              <label class="label">Créer un compte avec:</label>`;

	html += chapitreEnHTML("Créer un compte avec:", "");
	html += saisieEnHTML("Pseudo", "pseudo", "text", "Votre pseudo", pseudo, "Ce pseudo est valide");
	html += saisieEnHTML("Adresse e-mail", "eMail", "email", "Votre adresse e-mail", email, "Cette adresse e-mail est valide");
	html += saisieEnHTML("Mot de passe", "motDePasse", "password", "Votre mot de passe", "", "Ce mot de passe est valide");

	html += `
              <div class="field is-grouped">
                <div class="control">
                  <button id="demanderCreationCompte" class="button is-link">Créer</button>
                </div>
              </div>

           </div>`;

	document.querySelector(".corpDePage").innerHTML = html;
	document.querySelector(".title").innerHTML = nomDuSite;
	document.querySelector("#demanderCreationCompte").onclick = demanderCreationCompte;
	declarerNouvellePage("CMP");
	tracer("La page COMPTE (CMP) est chargée");

}

// ###############################################
// Génération de la page de validation ("VAL")
//
//

// Generer la page de demande de création de compte
function genererPageValidation(json){

	tracer('appel de la fonction genererPageValidation');

	if ("" == json.cle) {
		tracer("La page VALIDATION (VAL) n'est pas chargable");
		genererPageErreur("ERREUR DE CREATION DE COMPTE", json.erreur);
	} else {
		let html = `
          <div class="column">

            <div class="box">

              <!-- label class="label">Vous devez activer votre compte en cliquant sur le lien envoyé par e-mail.</label -->
              <label class="label">La méthode d'activation du compte n'est pas encore implémentée.</label>

            </div>

          </div>`;

		document.querySelector(".corpDePage").innerHTML = html;
		document.querySelector(".title").innerHTML = nomDuSite;
		declarerNouvellePage("VAL");
		tracer("La page VALIDATION (VAL) est chargée");
	}

}

// #################################
// Génération de la page Commode ("COM")
//
function demanderOuvrirTiroir(tiroirId) {
	const url = new Adresse(window.location.href,'tiroir'+extention);
	url.add("pseudo", lUtilisateur.get());
	url.add("cle", laCle.get());
	url.add("tiroir", tiroirId);
	tracer('Clic sur demanderOuvrirTiroir ' + url.get());
	fetch(url.get())
		.then(response => response.json(), err => console.error('ERREUR Une erreur lors du fetch ' + url.href + ' : ' + err))
		.then(json => genererPageTiroir(json) );
	return true;
}

//
function genererPageCommode(json){

	tracer('appel de la fonction genererPageCommode '+json.cle);

	nomDeLaTable.reset();
	lesObjets.reset();
	laStructure.reset();
	if (messageEstValide(json)) {

		const tiroirs = json.data.map(j => ({
			name: j.Nom,
			id: j.id,
			icon: j.icon,
			description: j.Description || "",
			created_at: j.Creation || "",
			updated_at: j.MiseAJour
		}));

		let html = "";
		let formateur = new FormateurCommode();
		tiroirs.forEach(tiroir => {
			html += formateur.ajouter(tiroir);
		});
		html += formateur.finir();

                document.querySelector(".corpDePage").innerHTML = html;
		document.querySelector(".title").innerHTML = nomDuSite;

		tiroirs.forEach(tiroir => {
			tracer("test creation onclick "+tiroir.id);
			document.querySelector("#T"+tiroir.id).onclick = function() {demanderOuvrirTiroir(tiroir.id);};
		});
		declarerNouvellePage("COM");

		tracer("La page COMMODE (COM) est chargée");

	} else {
		genererPageFatal("IMPOSSIBLE D'AFFICHER LA COMMONDE", "Les informations de validations sont incorectes. Il faut vous reconnecter. "+json.erreur);
	}

}

// #################################
// Génération de la page Tiroir ("TIR")
//
function genererPageTiroir(leTiroir){

	tracer('appel de la fonction genererPageTiroir '+leTiroir.cle);
//	tracerTable(leTiroir);

	if (messageEstValide(leTiroir)) {

		lesObjets.set(leTiroir.data);
		leTiroirId.set(leTiroir.id);
		nomDeLaTable.set(leTiroir.table);
		laStructure.set(JSON.parse(leTiroir.structure));

		let html = "";
		if (0 == leTiroir.data.length) {
			html += chapitreEnHTML("Le tiroir est vide.", "");
		} else {
			let formateur = null;
			if (leTiroir.data.length > nbMaxAvantAffichageCompact) {
				formateur = new FormateurGrandTiroir();
			} else {
				formateur = new FormateurPetitTiroir();
			}
			html += formateur.commencer(laStructure.get());
			lesObjets.get().forEach(objet => {
				html += formateur.ajouter(objet);
			});
			html += formateur.finir();
		}

                document.querySelector(".corpDePage").innerHTML = html;
		document.querySelector(".title").innerHTML = nomDuSite+" : "+leTiroir.table;

		lesObjets.get().forEach(objet => {
			tracer("test modification objet "+objet.id);
			document.querySelector("#M"+objet.id).onclick = function() {genererPageObjet(objet);};
			document.querySelector("#S"+objet.id).onclick = function() {genererPageSuppressionObjet(objet);};
		});
		declarerNouvellePage("TIR");

		tracer("La page TIROIR (TIR) est chargée");

	} else {
		genererPageErreur("L'AFFICHAGE DU TIROIR EST REFUSE", leTiroir.erreur);
	}

}

// #####################################################
// Génération de la page de creation d'un Tiroir ("CRT")
//
function demanderCreationTiroir() {
	memoriserDonneePage();
	const url = new Adresse(window.location.href,'tiroirCreer'+extention);
	url.add("pseudo", lUtilisateur.get());
	url.add("cle", laCle.get());
	url.add("nom", document.querySelector("#base").value);
	for (var i=0;i<4;i++) {
		let elementNom = document.querySelector("#nom"+i).value;
		if ("" != elementNom) {
			url.add("nom"+i, elementNom);
			url.add("type"+i, document.querySelector("#type"+i).value);
		}
	}
	tracer('Clic sur demanderCreationTiroir ' + url.get());
	fetch(url.get())
		.then(
			response => response.json(),
			err => genererPageErreur(err, null))
		.then(json => validerCreationTiroir(json) )
		.catch(err => genererPageFatal(err, "Erreur interne levée lors de la création du tiroir "+document.querySelector("#base").value));
}

// Valider la creation du tiroir
function validerCreationTiroir(json) {
	if (validerMessage(json)) {
		tracer('execution de validerCreationTiroir '+json.table);
		demanderOuvrirTiroir(json.id);
	} else {
		genererPageErreur("LA CREATION DU TIROIR EST REFUSEE", json.erreur);
	}
}

function genererPageNouveauTiroir(){

	tracer('appel de la fonction genererPageNouveauTiroir ');

	let html = `
          <div class="column">

            <div class="box">`;

	html += `
              <div class="field is-grouped">
                <div class="control">
                  <button id="demanderCreationTiroir" class="button is-link">Créer le tiroir</button>
                </div>
	      </div>`;

	html += chapitreEnHTML("Créer un nouveau tiroir:", "");
	html += saisieEnHTML("Nom du tiroir", "base", "text", "Nom du tiroir", lesPages.lireElement("CRT", "nom"), "");
	html += `
	    <hr/>`;

	html += chapitreEnHTML("", "Il y a déjà par défaut les champs id, Non, creation et MiseAJour.");
	html += `
	    <hr/>`;

	html += chapitreEnHTML("Décrire les autres champs d'un objet du tiroir:", "");

	for (var i=0;i<4;i++) {
		html += saisieEnHTML("Nom du champ", "nom"+i, "text", "Nom du champ", lesPages.lireElement("CRT", "nom"+i), "");
		html += choixEnHTML("Type du champ", "type"+i, ["DATE", "ENTIER", "TEXTE", "BOOLEEN"], lesPages.lireElement("CRT", "type"+i), "");
	}

	html += "</div></div>";

	document.querySelector(".corpDePage").innerHTML = html;
	document.querySelector(".title").innerHTML = nomDuSite;
	document.querySelector("#demanderCreationTiroir").onclick = demanderCreationTiroir;

	declarerNouvellePage("CRT");

	tracer("La page NOUVEAU TIROIR (CRT) est chargée");

}
// #################################
// Génération de la page de suppression d'un élément ("SUO")
//
// Demander au server la suppression de l'objet
function genererPageSuppressionObjet(objet){

	tracer('appel de la fonction genererPageObjet '+objet.id);

}

// #################################
// Génération de la page de modification d'un élément ("MOO")
//
// Demander au server l'enregistrement
function demanderEnregistrement() {
	memoriserDonneePage();
	const url = new Adresse(window.location.href,'objet'+extention);
	url.add("pseudo", lUtilisateur.get());
	url.add("cle", laCle.get());
	url.add("tiroir", leTiroirId.get());
	let commande = "";
	let jsonCmd = new Object();
	let jsonRecord = new Object();
	jsonCmd["id"] = document.querySelector("#elemId").value;
	jsonCmd["name"] = document.querySelector("#elemNom").value;
	jsonCmd["icon"] = "";
	jsonCmd["supprimer"] = 0;
	laStructure.get().forEach(function (structure, index) {
		jsonCmd[structure.nom] = document.querySelector("#elem"+index).value;
	});
	lObjet.set(jsonCmd);
	tracer(JSON.stringify(jsonCmd));
	commande = JSON.stringify(jsonCmd);
	url.add("objet", commande);
	tracer('Clic sur demanderEnregistrement ' + url.get());
	fetch(url.get())
		.then(
			response => response.json(),
			err => genererPageErreur(err, null))
		.then(json => genererPageTiroir(json) )
		.catch(err => genererPageFatal(err, "Erreur interne levée lors de l'enregistrement d'un élément du tiroir "+nomDeLaTable.get()+" de l'utilisateur "+lUtilisateur.get()+". Commande fautive : "+commande));
}

function genererPageObjet(objet){

	tracer('appel de la fonction genererPageObjet '+objet.id);

		let html = "";
		let texte = "";

		html += `
          <div class="column">
            <div class="box">`
		if (null == objet.id) {texte = ""} else {texte = objet.id};
		html += `
              <input id="elemId" class="input is-success is-hidden" type="text" placeholder="" value="${texte}">`;
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

	tracerTable(laStructure);
		laStructure.get().forEach(function (structure, index) {
//			tracerTable(objet);
			if (null == objet.champsLibres[index]) {texte = ""} else {texte = objet.champsLibres[index]};
			html += `
              <div class="field">
                <label class="label">${structure.nom} (${structure.type})</label>
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
                document.querySelector(".corpDePage").innerHTML = html;
		document.querySelector(".title").innerHTML = nomDuSite+" : "+nomDeLaTable.get();
		document.querySelector("#demanderEnregistrement").onclick = demanderEnregistrement;

		declarerNouvellePage("MOO");

		tracer("La page MODIFIER ELEMENT (MOO) est chargée");

}

function genererPageNouvelObjet(){

	tracer('appel de la fonction genererPageNouvelObjet ');

	let objet = new Object();
	let champsLibres = new Object();
	objet["id"] = null;
	objet["name"] = null;
	objet["icon"] = null;
	objet["supprimer"] = 0;
	laStructure.get().forEach(function (structure, index) {
		champsLibres[structure.nom] = null;
	});
	tracerTable(champsLibres);
	objet["champsLibres"] = champsLibres;
	tracerTable(objet);
	lObjet.reset();

	genererPageObjet(objet);

}

// ###################################
// Génération de la page d'erreur ("ERR")
//
// Generer la page
function genererPageErreur(erreur = "ERREUR INDEFINIE", info = "Aucun information"){

	tracer('appel de la fonction genererPageErreur');

	let html = `
          <div class="column">

            <div class="box">`;

	html += chapitreEnHTML("Erreur :", erreur);

	if (null != info) {
		html += chapitreEnHTML("Information :", info);
	}

	html += `
	      <br/>Cliquer sur "Retour" en haut à droite pour revenir sur la page générant l'erreur.<br/>

            </div>

          </div>`;

	document.querySelector(".corpDePage").innerHTML = html;
	declarerNouvellePage("ERR");
	tracer("La page ERREUR (ERR) est chargée");
}
// ###################################
// Génération de la page d'erreur fatale ("FAT")
//
// Generer la page
function genererPageFatal(erreur = "ERREUR FATALE INDEFINIE", info = "Aucun information"){

	tracer('appel de la fonction genererPageFatal');

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

	document.querySelector(".corpDePage").innerHTML = html;
	document.querySelector("#revenirConnexion").onclick = genererPageConnexion;
	declarerNouvellePage("FAT");
	tracer("La page FATAL (FAT) est chargée");
}

// ########################################
// Génération de la page d'information ("INF")
//
// Generer la page
function genererInformation() {

	tracer('appel de la fonction genererInformation');
	memoriserDonneePage();

	let utilisateur = lUtilisateur.get();
	if (null == utilisateur) { utilisateur = "non connecté"; }
	let stokageLocal = "Indisponible.";
	if ("localStorage" in window) {
		stokageLocal = "Disponible.";
	}
	let DBLocale = "Indisponible.";
	if ("indexedDB" in window) {
		DBLocale = "Actif.";
	}
	let LeServiceWorker = "Indisponible.";
	if ("serviceWorker" in navigator) {
		LeServiceWorker = "Actif.";
	}

	let html = `
          <div class="column">

            <div class="box">`;

	html += elementEnHTML("Utilisateur :", utilisateur);

	html += elementEnHTML("Stokage local :", stokageLocal);

	html += elementEnHTML("IndexedDB :", DBLocale);

	html += elementEnHTML("Service worker :", LeServiceWorker);

	html += `
	      Ce site est hébergé sur PlanetHost.<br/>
	      Ce site est mis en forme avec Bulma.<br/>

            </div>

          </div>`;

	document.querySelector(".corpDePage").innerHTML = html;
	declarerNouvellePage("INF");
	tracer("La page ERREUR (INF) est chargée");

}

// #####################################################
// Génération de la l'interface au chargement de l'appli
//
function generateUI(){

	tracer('Appel de la fonction generateUI');

	tracer('charger la page '+pageCourante());
	if ("COM" == pageCourante()) {
		// Charger les info pour afficher la commode
		const url = new Adresse(window.location.href,'commode'+extention);
		url.add("pseudo", lUtilisateur.get());
		url.add("cle", laCle.get());
		fetch(url.get())
			.then(response => response.json(), err => console.error('ERREUR Une erreur lors du fetch commode.php : ' + err))
			.then(json => genererPageCommode(json) );
	} else if ("CON" == pageCourante()) {
		// afficher un page pour se connecter
		genererPageConnexion();
	} else if ("CMP" == pageCourante()) {
		// Afficher la céation d'un compte
		genererPageCompte();
	} else if ("CRT" == pageCourante()) {
		// Charger les info pour afficher la creation d'un tiroir
		genererPageNouveauTiroir();
	} else if ("ERR" == pageCourante()) {
		// Afficher la page d'erreur fatale
		genererPageErreur("INCONUE", "Une erreur non enregistrée était levée lors de la dernière utilisation du site");
	} else if ("MOO" == pageCourante()) {
		// Regéné la pasge de modification d'un objet
		genererPageObjet(lesPages.lirePage("MOO"));
	} else if ("INF" == pageCourante()) {
		// Afficher la page d'information
		genererInformation();
	} else if ("FAT" == pageCourante()) {
		// Afficher la page d'erreur fatale
		genererPageFatal("INCONUE", "Une erreur fatale non enregistrée était levée lors de la dernière utilisation du site");
	} else if ("TIR" == pageCourante()) {
		// Charger les info pour afficher le tiroir
		const url = new Adresse(window.location.href,'tiroir'+extention);
		url.add("pseudo", lUtilisateur.get());
		url.add("cle", laCle.get());
		url.add("tiroir", leTiroirId.get());
		tracer('Clic sur demanderOuvrirTiroir ' + url.get());
		fetch(url.get())
			.then(response => response.json(), err => console.error('ERREUR Une erreur lors du fetch ' + url.href + ' : ' + err))
			.then(json => genererPageTiroir(json) );
	} else {
		// afficher un page pour se connecter
		tracer("La page n'est pas définie");
		genererPageFatal("LA PAGE PRECEDANTE EST INVALIDE", "");
	}
	document.querySelector("#retour").onclick = allerPagePrecedante;
	document.querySelector("#config").onclick = genererInformation;
	document.querySelector("#creerTiroir").onclick = genererPageNouveauTiroir;
	document.querySelector("#creerObjet").onclick = function() {genererPageNouvelObjet();};

};
