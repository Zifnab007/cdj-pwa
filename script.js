// Les pages:
// CON Connexion		(genererPageConnexion)
// CMP Compte			(genererPageCompte)
// VAL Validation		(requeteGenererPageValidation)
// COM Commode			(requeteGenererPageCommode)
// TIR Tiroir			(requeteGenererPageTiroir)
// CRT CreationTiroir		(genererPageNouveauTiroir)
// IMP ImporttatioTiroir	(genererPageImporterTiroir)
// MOT ModifTiroir
// SUT SuppressionTiroir
// OBJ Objet
// CRO CreationObjet            (genererPageNouvelObjet)
// MOO ModifObjet               (genererPageObjet)
// SUO SuppressionObjet         (genererPageSuppressionObjet)
// ERR Erreur                   (genererPageErreur)
// FAT Erreur                   (genererPageFatal)
// INF Information		(genererInformation)
// generateUI
import { extention } from "./config.js";
import { tracer, tracerTable, archiverLesTraces, tracesArchivees } from "./traceur.js";
import { Enregistreur } from "./enregistreur.js";
import { RequeteGet } from "./requeteGet.js";
import { RequetePost } from "./requetePost.js";
import { aujourdHui, dateDataBaseEnFR, elementFormatage } from "./outils.js";
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
var hachageIndisponible = false;
try {
	if ("function" === typeof crypto.subtle.digest) {
		hachageIndisponible = false;
		tracer("La function de hachage des mots de passe est disponible.");
	} else {
		hachageIndisponible = true;
		tracer("La function de hachage des mots de passe n'est pas disponible.");
	}
} catch (e) {
	hachageIndisponible = true;
	tracer("La function de hachage des mots de passe n'est pas disponible.");
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
var avecPhoto = new Enregistreur("photo", stockage)
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
	// Mettre à jour le texte les boutons
	if ("CON" == page) {
		document.getElementById("quiter").innerHTML = "Recharger";
	} else {
		document.getElementById("quiter").innerHTML = "Quiter";
	}
	// activer ou désactiver les boutons
	if (("CON" == page) || ("FAT" == page)) {
		document.getElementById("retour").className = "button is-link is-hidden";
	} else {
		document.getElementById("retour").className = "button is-link is-flex";
	}
	if ("COM" == page) {
		document.getElementById("importerTiroir").className = "button is-link is-flex";
		document.getElementById("creerTiroir").className = "button is-link is-flex";
	} else {
		document.getElementById("importerTiroir").className = "button is-link is-hidden";
		document.getElementById("creerTiroir").className = "button is-link is-hidden";
	}
	if ("TIR" == page) {
		if ("MOO" == pageCourante()) { laPage.pop(); }
		if ("CRT" == pageCourante()) { laPage.pop(); }
		document.getElementById("creerObjet").className = "button is-link is-flex";
	} else {
		document.getElementById("creerObjet").className = "button is-link is-hidden";
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
		donnee["pseudo"] = document.getElementById("pseudoCMP").value;
		donnee["email"] = document.getElementById("eMailCMP").value;
		donnee["stockage"] = document.getElementById("stockageCMP").value;
		lesPages.nouvellePage("CMP", donnee);
	} else if ("CRT" == pageCourante()) {
		let donnee = new Object();
		donnee["nom"] = document.getElementById("base").value;
		document.getElementsByName("questionPhoto").forEach(element => {
			if (element.checked) {
				donnee["photo"] = element.value;
			}
		});
		for (var i=0;i<4;i++) {
			donnee["nom"+i] = document.getElementById("nom"+i).value;
			donnee["type"+i] = document.getElementById("type"+i).value;
		}
		lesPages.nouvellePage("CRT", donnee);
	} else if ("MOO" == pageCourante()) {
		let donnee = new Object();
		donnee["id"] = document.getElementById("elemId").value;
		donnee["nom"] = document.getElementById("elemNom").value;
		donnee["icone"] = "";
		donnee["supprimer"] = 0;
		let champsLibres = new Object();
		laStructure.get().forEach(function (unChamp, index) {
			champsLibres[unChamp.nom] = document.getElementById("elem"+index).value;
			tracer('MOO ' + unChamp.nom + " : " + document.getElementById("elem"+index).value + " id : " + "elem"+index);
		});
		tracerTable(champsLibres);
		tracerTable(donnee);
		donnee["record"] = champsLibres;
		lesPages.nouvellePage("MOO", donnee);
	}
}

function allerPagePrecedante() {
	if (0 != laPage.length) { laPage.pop(); }
	generateUI();
}

function validerMessageEtEnregistrerCle(json) {
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
	} else if (("" == json.cle) || (json.cle != laCle.get()) || (json.pseudo != lUtilisateur.get())) {
		lUtilisateur.reset();
		laCle.reset();
		console.error('Le message est invalide pseudo:'+json.pseudo);
		return false;
	} else {
		console.error('Le message est invalide pseudo:'+json.pseudo+' message :'+json.erreur);
		return false;
	}
}

function mettreAJourTiroir(objets, structure) {
	for (var i = 0; i < objets.length; i++) {
		structure.forEach(function (unChamp, index) {
			if ("DATE" == unChamp.type) {
				let valeur = objets[i].record[unChamp.nom];
				if (null == valeur) {
					objets[i].record[unChamp.nom] = "";
				} else {
					objets[i].record[unChamp.nom] = dateDataBaseEnFR(valeur);
				}
			}
		});
	}
	return objets;
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

function validerEntree(element, idAideOK, idAideKO, type) {
	if ("password" == type) {
		let reg = /^[ -~]{6,32}$/;
		let valeur = element.value;
		if (reg.test(valeur)) {
			document.getElementById(idAideKO).className = "help is-danger is-hidden";
			document.getElementById(idAideOK).className = "help is-success is-flex";
		} else {
			document.getElementById(idAideKO).className = "help is-danger is-flex";
			document.getElementById(idAideOK).className = "help is-success is-hidden";
		}
	}
	if ("email" == type) {
		let reg = /^(([^<>()[]\.,;:s@]+(.[^<>()[]\.,;:s@]+)*)|(.+))@(([[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}])|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$/;
		let valeur = element.value;
		if (reg.test(valeur)) {
			document.getElementById(idAideKO).className = "help is-danger is-hidden";
			document.getElementById(idAideOK).className = "help is-success is-flex";
		} else {
			document.getElementById(idAideKO).className = "help is-danger is-flex";
			document.getElementById(idAideOK).className = "help is-success is-hidden";
		}
	}
	if ("pseudo" == type) {
		let reg = /^[A-Za-z0-9- ]{4,32}$/;
		let valeur = element.value;
		if (reg.test(valeur)) {
			document.getElementById(idAideKO).className = "help is-danger is-hidden";
			document.getElementById(idAideOK).className = "help is-success is-flex";
		} else {
			document.getElementById(idAideKO).className = "help is-danger is-flex";
			document.getElementById(idAideOK).className = "help is-success is-hidden";
		}
	}
	if ("ENTIER" == type) {
		let reg = /^[0-9]{0,10}$/;
		let valeur = element.value;
		if ("" == valeur) {
			document.getElementById(idAideKO).className = "help is-danger is-hidden";
			document.getElementById(idAideOK).className = "help is-success is-hidden";
		} else if (reg.test(valeur)) {
			document.getElementById(idAideKO).className = "help is-danger is-hidden";
			document.getElementById(idAideOK).className = "help is-success is-flex";
		} else {
			document.getElementById(idAideKO).className = "help is-danger is-flex";
			document.getElementById(idAideOK).className = "help is-success is-hidden";
		}
	}
	if ("DATE" == type) {
		let reg = /^([012][0-9]|30|31)\/(0[1-9]|10|11|12)\/[1-9][0-9]{3}$/;
		let valeur = element.value;
		if ("" == valeur) {
			document.getElementById(idAideKO).className = "help is-danger is-hidden";
			document.getElementById(idAideOK).className = "help is-success is-hidden";
		} else if (reg.test(valeur)) {
			document.getElementById(idAideKO).className = "help is-danger is-hidden";
			document.getElementById(idAideOK).className = "help is-success is-flex";
		} else {
			document.getElementById(idAideKO).className = "help is-danger is-flex";
			document.getElementById(idAideOK).className = "help is-success is-hidden";
		}
	}
};

function mettreAaujourdHui(id) {
	document.getElementById(id).value = aujourdHui();
}

function saisieEnHTML(titre, id, type, fond, valeur, aideOK, aideKO) {

	let html = "";
	let typeAffichage = "password";
	if (null == valeur) {valeur = ""};
	if ("password" != type) { typeAffichage = "text"; }
	if (null == fond) {
		fond = "";
		if ("BOOLEEN" == type) { fond = "Entrer TRUE ou FALSE"; }
		if ("DATE" == type) { fond = "Entrer une date JJ/MM/AAAA"; }
		if ("ENTIER" == type) { fond = "Entrer un nombre"; }
		if ("TEXTE" == type) { fond = "Entrer le texte"; }
	}
	tracer('saisieEnHTML ' + titre +" "+ type +" "+ typeAffichage +" OK "+ aideOK +" KO "+ aideKO);

	html = `
        <div class="field">
          <label class="label">${titre}`;
	if ("DATE" == type) {
		let dateAuto = aujourdHui();
		html += `
            <a id="${id}Date">(aujourd'hui ${dateAuto})</a>`;
	}
	html += `
	  </label>
          <div class="control">
            <input class="input" type="${typeAffichage}" placeholder="${fond}" id="${id}" value="${valeur}">`;

	if ("ENTIER" == type) {
		if ("" == aideKO) { aideKO = "Ce nombre est invalide. Il doit comporter uniquement un maximum de 10 chiffres [0-9]."; }
		if ("" == aideOK) { aideOK = "Ce nombre est valide."; }
	}
	if ("DATE" == type) {
		if ("" == aideKO) { aideKO = "Cette date est invalide. Elle doit être de la forme JJ/MM/AAAA entre 01/01/1000 et 31/12/9999."; }
		if ("" == aideOK) { aideOK = "Cette date est valide."; }
	}
	if ("password" == type) {
		if ("" == aideKO) { aideKO = "Le mot de passe doit avoir entre 6 et 32 caractères."; }
		if ("" == aideOK) { aideOK = "Ce mot de passe est valide."; }
	}
	if ("email" == type) {
		if ("" == aideKO) { aideKO = "Cet adresse e-mail n'est pas conforme à la syntaxe d'une aresse e-mail.."; }
		if ("" == aideOK) { aideOK = "Cet adresse e-mail est valide."; }
	}
	if ("pseudo" == type) {
		if ("" == aideKO) { aideKO = "Le pseudo doit avoir entre 4 et 32 '-', ' ', chiffre ou lettre sans accent."; }
		if ("" == aideOK) { aideOK = "Ce pseudo est valide."; }
	}
	if (null != aideKO) {
		html += `
	    <p class="help is-danger is-hidden" id="${id}KO">${aideKO}</p>`;
	}
	if (null != aideOK) {
		html += `
            <p class="help is-success" id="${id}OK">${aideOK}</p>`;
	}

	html += `
          </div>
        </div>`;

	return html;

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

async function digestMessage(message) {
	const msgUint8 = new TextEncoder().encode(message);                           // encode as (utf-8) Uint8Array
	const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);           // hash the message
	const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
	const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
	return hashHex;
}

// ###################################
// Génération de la page Connexion ("CON")
//
// Demander au server de valider la connexion
async function demanderConnexion() {
	const url = new RequeteGet(window.location.href,'connection'+extention);
	lUtilisateur.set(document.getElementById("pseudo").value);
	url.ajouter("pseudo", lUtilisateur.get());
	let motDePasseHache = "";
	if (hachageIndisponible) {
		motDePasseHache = document.getElementById("mdp").value;
		url.ajouter("enClair", "1");
	} else {
		 motDePasseHache = await digestMessage(document.getElementById("mdp").value);
	}
	url.ajouter("motDePasse", motDePasseHache);
	tracer('Clic sur demanderConnexion ' + url.requete());
	try {
		fetch(url.requete(), url.option())
			.then(response => response.json(), err => console.error('DEBUG Une erreur lors du fetch ' + url.href + ' : ' + err))
			.then(json => validerConnexion(json) );
	} catch (e) {
		genererPageFatal("JAVASCRIPT", "fetch : "+e);
		return;
	}
}

// Valider la connexion
function validerConnexion(json) {
	if (validerMessageEtEnregistrerCle(json)) {
		const url = new RequeteGet(window.location.href,'commode'+extention);
		url.ajouter("pseudo", json.pseudo);
		url.ajouter("cle", json.cle);
		tracer('execution de validerConnexion ' + url.requete());
		fetch(url.requete(), url.option())
			.then(response => response.json(), err => console.error('DEBUG Une erreur lors du fetch ' + url.href + ' : ' + err))
			.then(json => requeteGenererPageCommode(json) );
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
	html += saisieEnHTML("Pseudo", "pseudo", "pseudo", "Votre pseudo", "", "", "");
	html += saisieEnHTML("Mot de passe", "mdp", "password", "Votre mot de passe", "", "", "");

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
	document.getElementById("creerCompte").onclick = genererPageCompte;
	document.getElementById("demanderConnexion").onclick = demanderConnexion;
	validerEntree(document.getElementById("pseudo"), "pseudoOK", "pseudoKO", "pseudo");
	document.getElementById("pseudo").addEventListener('input', function (){validerEntree(this, "pseudoOK", "pseudoKO", "pseudo")});
	validerEntree(document.getElementById("mdp"), "mdpOK", "mdpKO", "password");
	try {
		document.getElementById("mdp").addEventListener('input', function (){validerEntree(this, "mdpOK", "mdpKO", "password")});
	} catch (e) {
		genererPageFatal("JAVASCRIPT", "addEventListener('input', ...) : "+e);
		return;
	}
	declarerNouvellePage("CON");
	tracer("La page CONNEXION (CON) est chargée");
}

// ###############################################
// Génération de la page de création de compte ("CMP")
//
//
async function demanderCreationCompte() {
	memoriserDonneePage();
	const url = new RequeteGet(window.location.href,'compte'+extention);
	url.ajouter("pseudo", document.getElementById("pseudoCMP").value);
	url.ajouter("email", document.getElementById("eMailCMP").value);
	let motDePasseHache = "";
	if (hachageIndisponible) {
		motDePasseHache = document.getElementById("motDePasseCMP").value;
		url.ajouter("enClair", "1");
	} else {
		 motDePasseHache = await digestMessage(document.getElementById("motDePasseCMP").value);
	}
	url.ajouter("mdp", motDePasseHache);
	url.ajouter("stockage", document.getElementById("stockageCMP").value);
	tracer('Clic sur demanderCreationCompte ' + url.requete());
	fetch(url.requete(), url.option())
		.then(
			response => response.json(),
			err => genererPageErreur(err, null))
		.then(json => requeteGenererPageValidation(json) )
		.catch(err => genererPageFatal(err, "Erreur interne levée lors de la création d'un compte pour "+document.getElementById("pseudoCMP").value+" avec l'email "+document.getElementById("eMailCMP").value));

}

// Generer la page de demande de création de compte
function genererPageCompte(){

	tracer('appel de la fonction genererPageCompte');
	let pseudo = lesPages.lireElement("CMP", "pseudo");
	let email = lesPages.lireElement("CMP", "email");
	let stockage = lesPages.lireElement("CMP", "stockage");
	if ("" == stockage) { stockage = "Stocker"; };
	let mdp = "";

	let html = `
          <div class="column">

            <div class="box">`;

	html += chapitreEnHTML("Créer un compte avec:", "");
	html += saisieEnHTML("Pseudo", "pseudoCMP", "pseudo", "Votre pseudo", pseudo, "", "");
	html += saisieEnHTML("Adresse e-mail", "eMailCMP", "email", "Votre adresse e-mail", email, "", "");
	html += saisieEnHTML("Mot de passe", "motDePasseCMP", "password", "Votre mot de passe", "", "", "");
	html += choixEnHTML("Stocker localement les données", 'stockageCMP', ["Stocker", "Ne pas stocker"], stockage, "");

	html += `
              <div class="field is-grouped">
                <div class="control">
                  <button id="demanderCreationCompte" class="button is-link">Créer</button>
                </div>
              </div>

           </div>`;

	document.querySelector(".corpDePage").innerHTML = html;
	document.querySelector(".title").innerHTML = nomDuSite;
	document.getElementById("demanderCreationCompte").onclick = demanderCreationCompte;
	validerEntree(document.getElementById("pseudoCMP"), "pseudoCMPOK", "pseudoCMPKO", "pseudo");
	document.getElementById("pseudoCMP").addEventListener('input', function (){validerEntree(this, "pseudoCMPOK", "pseudoCMPKO", "pseudo")});
	validerEntree(document.getElementById("eMailCMP"), "eMailCMPOK", "eMailCMPKO", "email");
	document.getElementById("eMailCMP").addEventListener('input', function (){validerEntree(this, "eMailCMPOK", "eMailCMPKO", "email")});
	validerEntree(document.getElementById("motDePasseCMP"), "motDePasseCMPOK", "motDePasseCMPKO", "password");
	document.getElementById("motDePasseCMP").addEventListener('input', function (){validerEntree(this, "motDePasseCMPOK", "motDePasseCMPKO", "password")});
	declarerNouvellePage("CMP");
	tracer("La page COMPTE (CMP) est chargée");

}

// ###############################################
// Génération de la page de validation ("VAL")
//
//

// Generer la page de demande de création de compte
function requeteGenererPageValidation(json){

	tracer('appel de la fonction requeteGenererPageValidation');

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
	const url = new RequetePost(window.location.href,'tiroir'+extention);
	url.ajouter("pseudo", lUtilisateur.get());
	url.ajouter("cle", laCle.get());
	url.ajouter("tiroir", tiroirId);
	tracer('Clic sur demanderOuvrirTiroir ' + url.requete());
	fetch(url.requete(), url.option())
		.then(response => response.text(), err => console.error('ERREUR Une erreur lors du fetch ' + url.href + ' : ' + err))
		.then(texte => requeteGenererPageTiroir(texte) );
	return true;
}

//
function requeteGenererPageCommode(json){

	tracer('appel de la fonction requeteGenererPageCommode '+json.cle);

	nomDeLaTable.reset();
	lesObjets.reset();
	laStructure.reset();
	avecPhoto.reset();
	if (messageEstValide(json)) {

		const tiroirs = json.data.map(j => ({
			nom: j.Nom,
			id: j.id,
			icone: j.icone,
			description: j.Description || "",
			created_at: j.Creation || "",
			updated_at: j.MiseAJour
		}));
		tracer("Afficher une commode avec "+tiroirs.length+" tiroirs");
		let html = "";

		if (0 == tiroirs.length) {
			html += chapitreEnHTML("La commode est vide.", "");
		} else {
			let formateur = new FormateurCommode();
			tiroirs.forEach(tiroir => {
				tracer("Tiroir "+tiroir.nom+" "+tiroir.created_at+" "+tiroir.updated_at);
	try {
				html += formateur.ajouter(tiroir);
	} catch (e) {
		html += "<br/>ERREUR DU SERVEUR Erreur: "+e+"<br/>";
	}
			});
			html += formateur.finir();
		}

                document.querySelector(".corpDePage").innerHTML = html;
		document.querySelector(".title").innerHTML = nomDuSite;

		if (0 != tiroirs.length) {
			tiroirs.forEach(tiroir => {
				tracer("test creation onclick "+tiroir.id);
				document.getElementById("T"+tiroir.id).onclick = function() {demanderOuvrirTiroir(tiroir.id);};
			});
		}
		declarerNouvellePage("COM");

		tracer("La page COMMODE (COM) est chargée");

	} else if (lUtilisateur.estVide()) {
		genererPageFatal("IMPOSSIBLE D'AFFICHER LA COMMONDE", "Les informations de validations sont incorectes. Il faut vous reconnecter. "+json.erreur);
	} else {
		genererPageErreur("IMPOSSIBLE D'AFFICHER LA COMMONDE", json.erreur);
	}

}

// #################################
// Génération de la page Tiroir ("TIR")
//
function requeteGenererPageTiroir(texte){

	tracer('appel de la fonction requeteGenererPageTiroir '+texte);

	let leTiroir = "";
	try {
		leTiroir = JSON.parse(texte);
	} catch (e) {
		genererPageErreur("ERREUR DU SERVEUR", "Erreur: "+e+"<br/>"+texte);
	}

	if ("" == leTiroir) {
		genererPageErreur("ERREUR CLIENT", "Requête: "+texte);
	} else if (messageEstValide(leTiroir)) {

		leTiroirId.set(leTiroir.id);
		nomDeLaTable.set(leTiroir.table);
		let config = JSON.parse(leTiroir.config);
		laStructure.set(config['structure']);
		avecPhoto.set(config['photo']);
		lesObjets.set(mettreAJourTiroir(leTiroir.data, laStructure.get()));

		let html = "";
		if (0 == leTiroir.data.length) {
			html += chapitreEnHTML("Le tiroir est vide.", "");
		} else {
			let formateur = null;
			if (leTiroir.data.length > nbMaxAvantAffichageCompact) {
				formateur = new FormateurGrandTiroir(avecPhoto.get());
			} else {
				formateur = new FormateurPetitTiroir(avecPhoto.get());
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
			document.getElementById("M"+objet.id).onclick = function() {genererPageObjet(objet);};
			document.getElementById("S"+objet.id).onclick = function() {genererPageSuppressionObjet(objet);};
		});
		declarerNouvellePage("TIR");

		tracer("La page TIROIR (TIR) est chargée");

	} else if (lUtilisateur.estVide()) {
		genererPageFatal("L'AFFICHAGE DU TIROIR EST REFUSE", leTiroir.erreur);
	} else {
		genererPageErreur("L'AFFICHAGE DU TIROIR EST REFUSE", leTiroir.erreur);
	}

}

// #####################################################
// Génération de la page d'importation d'un Tiroir ("IMP")
//
// Demander au serveur d'importer un tiroir
function demanderimportationTiroir() {
	memoriserDonneePage();
	const url = new RequetePost(window.location.href,'importer'+extention);
	url.ajouter("pseudo", lUtilisateur.get());
	url.ajouter("cle", laCle.get());
	if (document.getElementById("fichierTsv").files[0]) {
		if (1048576 < document.getElementById("fichierTsv").files[0].size) {
			genererPageErreur("ERREUR DE TAILLE", "Le fichier séléctionné est trop gros. Il doit être inférieur à 1Mo");
			return false;
		}
		url.ajouter("fichierTsv", document.getElementById("fichierTsv").files[0]);
	} else {
		genererPageErreur("ERREUR DE FICHIER", "Il faut séléctionner un fichier inférieur à 1Mo.");
		return false;
	}
	tracer('Clic sur demanderEnregistrement ' + url.requete());
	fetch(url.requete(), url.option())
		.then(
			response => response.text(),
			err => genererPageErreur(err, null))
		.then(texte => validerImportationTiroir(texte) )
		.catch(err => genererPageFatal(err, "Erreur interne levée lors de l'importation d'un tiroir par l'utilisateur "+lUtilisateur.get()+". nom du fichier : "+document.getElementById("fichierTsv").files[0]));
}
// Valider l'importation du tiroir
function validerImportationTiroir(texte) {

	tracer('appel de la fonction validerImportationTiroir '+texte);

	let reponse = "";
	try {
		reponse = JSON.parse(texte);
	} catch (e) {
		genererPageErreur("ERREUR DU SERVEUR", "Erreur: "+e+"<br/>"+texte);
		reponse = "";
	}

	if ("" == reponse) {
		genererPageErreur("ERREUR CLIENT", "Requête: "+texte);
	} else if (messageEstValide(reponse)) {
		if ("" != reponse.id) {
			const url = new RequetePost(window.location.href,'tiroir'+extention);
			url.ajouter("pseudo", lUtilisateur.get());
			url.ajouter("cle", laCle.get());
			url.ajouter("tiroir", reponse.id);
			tracer('Clic sur demanderOuvrirTiroir ' + url.requete());
			fetch(url.requete(), url.option())
				.then(response => response.text(), err => console.error('ERREUR Une erreur lors du fetch ' + url.href + ' : ' + err))
				.then(texte => requeteGenererPageTiroir(texte) );
		} else {
			genererPageErreur("L'IMPORT DU TIROIR EST REFUSEE", reponse.erreur);
		}
	} else if (lUtilisateur.estVide()) {
		genererPageFatal("IMPOSSIBLE D'AFFICHER LA COMMONDE", "Les informations de validations sont incorectes. Il faut vous reconnecter. "+reponse.erreur);
	} else {
		genererPageErreur("ERREUR CLIENT", "Requête: "+texte);
	}
}
//
// Demander au serveur d'importer un tiroir
function genererPageImporterTiroir() {

	tracer('appel de la fonction genererPageImporterTiroir');

		let html = `
          <section class="section is-medium has-background-primary">

            <form class="box">
              <div class="field">
                <div class="control">
                  <label class="file" for="import"> Choisir fichier TSV d'import : 
                    <input type="hidden" name="MAX_FILE_SIZE" value="1048576" />
                    <input type="file" id="fichierTsv">
                  </label>
                </div>
              </div>
            </form>

              <div class="field">
                <div class="control">
                  <button id="demanderimportationTiroir" class="button is-link">Importer le tiroir</button>
                </div>
              </div>

            Créer un tiroir à partir d'un fichier TSV (une tabulation pour séparer les champs d'une ligne).<br/>
            <br/>
            Ce fichier doit avoir la structure par ligne:<br/>
            <table class="table">
              <tr>
                <td>"Nom"</td>
                <td>nom du tiroir</td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>"Photo"</td>
                <td>1 si le tiroir affiche des photos, sinon 0</td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>"Nom"</td>
                <td>nom du tiroir</td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>"Champs"</td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>"Nom" (*)</td>
                <td>nom du 1er champ libre</td>
                <td>nom du 2ème champ libre</td>
                <td>.......</td>
              </tr>
              <tr>
                <td>"TEXTE"</td>
                <td>type du 1er champ libre</td>
                <td>type du 2ème champ libre</td>
                <td>.......</td>
              </tr>
            </table>
            (*) Le premier champ doit être le nom et il est de type TEXTE.
            <br/>
            Le type des champs libres sont: "BOOLEEN", "DATE", "DATETIME", "ENTIER" et "TEXTE".
            <br/>
            <br/>

          </section>`;

                document.querySelector(".corpDePage").innerHTML = html;
//		document.querySelector(".title").innerHTML = nomDuSite+" : "+nomDeLaTable.get();
		document.getElementById("demanderimportationTiroir").onclick = demanderimportationTiroir;

		declarerNouvellePage("IMP");
}

// #####################################################
// Génération de la page de creation d'un Tiroir ("CRT")
//
function demanderCreationTiroir() {
	memoriserDonneePage();
	const url = new RequeteGet(window.location.href,'tiroirCreer'+extention);
	url.ajouter("pseudo", lUtilisateur.get());
	url.ajouter("cle", laCle.get());
	url.ajouter("nom", document.getElementById("base").value);
	document.getElementsByName("questionPhoto").forEach(element => {
		if (element.checked) {
			url.ajouter("photo", element.value);
		}
	});
	for (var i=0;i<4;i++) {
		let elementNom = document.getElementById("nom"+i).value;
		if ("" != elementNom) {
			url.ajouter("nom"+i, elementNom);
			url.ajouter("type"+i, document.getElementById("type"+i).value);
		}
	}
	tracer('Clic sur demanderCreationTiroir ' + url.requete());
	fetch(url.requete(), url.option())
		.then(
			response => response.json(),
			err => genererPageErreur(err, null))
		.then(json => requeteValiderCreationTiroir(json) )
		.catch(err => genererPageFatal(err, "Erreur interne levée lors de la création du tiroir "+document.getElementById("base").value));
}

// Valider la creation du tiroir
function requeteValiderCreationTiroir(json) {
	if (messageEstValide(json)) {
		tracer('execution de requeteValiderCreationTiroir '+json.table);
		demanderOuvrirTiroir(json.id);
	} else if (lUtilisateur.estVide()) {
		genererPageFatal("LA CREATION DU TIROIR EST REFUSEE", json.erreur);
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
                  <button name="demanderCreationTiroir" class="button is-link">Créer le tiroir</button>
                </div>
	      </div>`;

	html += chapitreEnHTML("Créer un nouveau tiroir:", "");
	html += saisieEnHTML("Nom du tiroir", "base", "text", "Nom du tiroir", lesPages.lireElement("CRT", "nom"), null, null);
	html += `
	    <hr/>`;

	html += chapitreEnHTML("", "Il y a déjà par défaut les champs identification (id), nom (Non), date de création (creation) et de modifixation (MiseAJour).");
	html += `
	    <hr/>`;

	let avecPhoto = "";
	let sansPhoto = "";
	if ("1" == lesPages.lireElement("CRT", "photo")) {
		avecPhoto = " checked";
	} else {
		sansPhoto = " checked";
	}
	html += `
	    <div class="field">
	      Voulez vous pouvoir joindre des photos?
              <div class="control">
                <label class="radio"> <input type="radio" name="questionPhoto" value="1"${avecPhoto}> Oui </label>
                <label class="radio"> <input type="radio" name="questionPhoto" value="0"${sansPhoto}> Non </label>
              </div>
            </div>`;
	html += `
	    <hr/>`;

	html += chapitreEnHTML("Décrire les autres champs d'un objet du tiroir:", "");

	for (var i=0;i<4;i++) {
		html += saisieEnHTML("Nom du champ", "nom"+i, "text", "Nom du champ", lesPages.lireElement("CRT", "nom"+i), null, null);
		html += choixEnHTML("Type du champ", "type"+i, ["DATE", "ENTIER", "TEXTE", "BOOLEEN"], lesPages.lireElement("CRT", "type"+i), "");
	}

	html += `
              <div class="field is-grouped">
                <div class="control">
                  <button name="demanderCreationTiroir" class="button is-link">Créer le tiroir</button>
                </div>
	      </div>`;

	html += "</div></div>";

	document.querySelector(".corpDePage").innerHTML = html;
	document.querySelector(".title").innerHTML = nomDuSite;
	document.getElementsByName("demanderCreationTiroir").forEach(element => {
		element.onclick = demanderCreationTiroir;
	});

	declarerNouvellePage("CRT");

	tracer("La page NOUVEAU TIROIR (CRT) est chargée");

}
// #################################
// Génération de la page de suppression d'un élément ("SUO")
//
// Demander au server la suppression de l'objet
function demanderSuppressionObjet(objetId) {
	const url = new RequetePost(window.location.href,'objetSupprimer'+extention);
	url.ajouter("pseudo", lUtilisateur.get());
	url.ajouter("cle", laCle.get());
	url.ajouter("tiroir", leTiroirId.get());
	url.ajouter("objetId", objetId);
	tracer('Clic sur demanderSuppressionObjet ' + url.requete());
	fetch(url.requete(), url.option())
		.then(
			response => response.text(),
			err => genererPageErreur(err, null))
		.then(texte => requeteGenererPageTiroir(texte) )
		.catch(err => genererPageFatal(err, "Erreur interne levée lors de la suppression d'un élément du tiroir "+nomDeLaTable.get()+" de l'utilisateur "+lUtilisateur.get()+". Commande fautive : "+commande));
}

// Generer la page
function genererPageSuppressionObjet(objet){

	tracer('appel de la fonction genererPageSuppressionObjet '+objet.id);

	let html = `
          <section class="section is-medium has-background-primary">

              <div class="field">
                <div class="control">
                  <button id="demanderSuppressionObjet" class="button is-danger">Confirmer la suppression</button>
                </div>
              </div>

              <div class="field">
                <div class="control">
                  <button id="annulerSuppressionObjet" class="button is-link">Annuler</button>
                </div>
              </div>

          </section>`;

	document.querySelector(".corpDePage").innerHTML = html;
	document.getElementById("demanderSuppressionObjet").onclick = function() { demanderSuppressionObjet(objet.id); };
	document.getElementById("annulerSuppressionObjet").onclick = allerPagePrecedante;

	declarerNouvellePage("SUO");

	tracer("La page MODIFIER ELEMENT (SUO) est chargée");

}

// #################################
// Génération de la page de modification d'un élément ("MOO")
//
// Demander au serveur d'enregistrer l'élément modifié ou créé
function demanderEnregistrement() {
	memoriserDonneePage();
	const url = new RequetePost(window.location.href,'objet'+extention);
	url.ajouter("pseudo", lUtilisateur.get());
	url.ajouter("cle", laCle.get());
	url.ajouter("tiroir", leTiroirId.get());
	let commande = "";
	let jsonCmd = new Object();
	let jsonRecord = new Object();
	jsonCmd["id"] = document.getElementById("elemId").value;
	jsonCmd["nom"] = document.getElementById("elemNom").value;
	if ("1" == avecPhoto.get()) {
		if (document.getElementById("photo").files[0]) {
			if (1048576 < document.getElementById("photo").files[0].size) {
				genererPageErreur("ERREUR DE TAILLE", "Le fichier séléctionné est trop gros. Il doit être inférieur à 1Mo");
				return false;
			}
			url.ajouter("photo", document.getElementById("photo").files[0]);
		} else {
			document.getElementsByName("supprimerPhoto").forEach(element => {
				tracer("supprimerPhoto "+element.checked+" valeur "+element.value);
				if ((element.checked) && (1 == element.value)) {
					tracer("supprimerPhoto Photo à supprimer");
					url.ajouter("supprimerPhoto", "1");
				}
			});
		}
	}
	jsonCmd["supprimer"] = 0;
	laStructure.get().forEach(function (unChamp, index) {
		jsonCmd[unChamp.nom] = document.getElementById("elem"+index).value;
	});
	lObjet.set(jsonCmd);
	tracer(JSON.stringify(jsonCmd));
	commande = JSON.stringify(jsonCmd);
	url.ajouter("objet", commande);
	tracer('Clic sur demanderEnregistrement ' + url.requete());
	fetch(url.requete(), url.option())
		.then(
			response => response.text(),
			err => genererPageErreur(err, null))
		.then(texte => requeteGenererPageTiroir(texte) )
		.catch(err => genererPageFatal(err, "Erreur interne levée lors de l'enregistrement d'un élément du tiroir "+nomDeLaTable.get()+" de l'utilisateur "+lUtilisateur.get()+". Commande fautive : "+commande));
}

function genererPageObjet(objet){

	tracer('appel de la fonction genererPageObjet '+objet.id);

		let html = "";
		let texte = "";

		html += `
          <section class="section is-medium has-background-primary">
            <form class="box">`;

		if (null == objet.id) {texte = ""} else {texte = objet.id};
		html += `
              <input id="elemId" class="input is-success is-hidden" type="text" placeholder="" value="${texte}">`;

		html +=  saisieEnHTML("Nom", "elemNom", "TEXTE", "", objet.nom, null, null);

		if ("1" == avecPhoto.get()) {
			html += `
              <div class="field">
                <div class="control">
                  <label class="file" for="photo"> Choisir une photo : 
                    <input type="hidden" name="MAX_FILE_SIZE" value="1048576" />
                    <input type="file" id="photo">
                  </label>
                </div>
              </div>`;
			if ("" != objet.icone) {
				html += `
	      <div class="field">
                <div class="control">
                  <label class="radio"> <input type="radio" name="supprimerPhoto" value="1"> Supprimer la photo </label>
                  <label class="radio"> <input type="radio" name="supprimerPhoto" value="0" checked> Garder la photo </label>
                </div>
              </div>`;
			}
		}

		tracerTable(laStructure);
		laStructure.get().forEach(function (unChamp, index) {
			if (null == objet.record[unChamp.nom]) {texte = ""} else {texte = objet.record[unChamp.nom]};
			html += saisieEnHTML(unChamp.nom, "elem"+index, unChamp.type, null, elementFormatage(texte, unChamp.type), "", "");
		});

		html += `
            </form>

              <div class="field">
                <div class="control">
                  <button id="demanderEnregistrement" class="button is-link">Enregistrer</button>
                </div>
              </div>

          </section>`;

                document.querySelector(".corpDePage").innerHTML = html;
		document.querySelector(".title").innerHTML = nomDuSite+" : "+nomDeLaTable.get();
		laStructure.get().forEach(function (unChamp, index) {
			validerEntree(document.getElementById("elem"+index), "elem"+index+'OK', "elem"+index+'KO', unChamp.type);
			document.getElementById("elem"+index).addEventListener('input', function (){validerEntree(this, "elem"+index+'OK', "elem"+index+'KO', unChamp.type)});
			if ("DATE" == unChamp.type) {
				document.getElementById("elem"+index+"Date").onclick = function() {mettreAaujourdHui("elem"+index);};
			}
		});
		document.getElementById("demanderEnregistrement").onclick = demanderEnregistrement;

		declarerNouvellePage("MOO");

		tracer("La page MODIFIER ELEMENT (MOO) est chargée");

}

function genererPageNouvelObjet(){

	tracer('appel de la fonction genererPageNouvelObjet ');

	let objet = new Object();
	let champsLibres = new Object();
	objet["id"] = null;
	objet["nom"] = null;
	objet["icone"] = null;
	objet["supprimer"] = 0;
	laStructure.get().forEach(function (unChamp, index) {
		champsLibres[unChamp.nom] = null;
	});
	tracerTable(champsLibres);
	objet["record"] = champsLibres;
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
	document.getElementById("revenirConnexion").onclick = genererPageConnexion;
	declarerNouvellePage("FAT");
	tracer("La page FATAL (FAT) est chargée");
}

// ########################################
// Génération de la page d'information ("INF")
//
// Generer la page
async function genererInformation() {

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
		DBLocale = "Disponible.";
	}

	let LeServiceWorker = "Indisponible.";
	if ("serviceWorker" in navigator) {
		LeServiceWorker = "Disponible.";
	}

	let LeXMLHttpRequest = "";
	try {
		if ("function" === typeof XMLHttpRequest) {
			LeXMLHttpRequest = "Fonction disponible.";
		} else {
			LeXMLHttpRequest = "Fonction indisponible.";
		}
	} catch (e) {
		LeXMLHttpRequest = "Function indisponible (Exception: "+e+")";
	}

	let fonctionHachage = "";
	if (hachageIndisponible) {
		fonctionHachage = "La function de hachage des mots de passe n'est pas disponible dans votre navigateur. <strong>Le mot de passe sera envoyé en clair lors de la création du compte et de la connection.</strong> Dans tous les cas le mot de passe est cripté dans le serveur.";
	} else {
		fonctionHachage = "Function disponible.";
	}

	let LeFormData = "";
	try {
		if ("function" === typeof FormData) {
			LeFormData = "Function disponible.";
		} else {
			LeFormData = "Function indisponible.";
		}
	} catch (e) {
		LeFormData = "Indisponible (Exception: "+e+")";
	}

	let html = `
          <div class="column">

            <div class="box">`;

	html += elementEnHTML("Utilisateur :", utilisateur);

	html += elementEnHTML("Stokage local :", stokageLocal);

	html += elementEnHTML("IndexedDB :", DBLocale);

	html += elementEnHTML("Service worker :", LeServiceWorker);

	html += "<hr/>";

	html += elementEnHTML("XMLHttpRequest :", LeXMLHttpRequest);

	html += elementEnHTML("Hachage :", fonctionHachage);

	html += elementEnHTML("FormData :", LeFormData);

	html += `
              <br/>
              <hr/>
              <br/>
	      Ce site est hébergé sur PlanetHost.<br/>
	      Ce site est mis en forme avec Bulma.<br/>

            </div>`;

	html += `<hr/>

            <div class="box">`;

	html += elementEnHTML("Trace interne :", tracesArchivees);

	html += `
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
		const url = new RequeteGet(window.location.href,'commode'+extention);
		url.ajouter("pseudo", lUtilisateur.get());
		url.ajouter("cle", laCle.get());
		tracer('Charger la page COM ' + url.requete());
		fetch(url.requete(), url.option())
			.then(response => response.json(), err => console.error('ERREUR Une erreur lors du fetch commode.php : ' + err))
			.then(json => requeteGenererPageCommode(json) );
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
		// Regéné la page de modification d'un objet
		genererPageObjet(lesPages.lirePage("MOO"));
	} else if ("IMP" == pageCourante()) {
		// Afficher la page d'information
		genererPageImporterTiroir();
	} else if ("INF" == pageCourante()) {
		// Afficher la page d'information
		genererInformation();
	} else if ("FAT" == pageCourante()) {
		// Afficher la page d'erreur fatale
		genererPageFatal("INCONUE", "Une erreur fatale non enregistrée était levée lors de la dernière utilisation du site");
	} else if (("TIR" == pageCourante()) || ("SUO" == pageCourante())) {
		// Charger les info pour afficher le tiroir
		if ("SUO" == pageCourante()) {
			// on ne mémorise pas les info de la page de suppression d'un objet, il faut donc la supprimer de l'historique
			laPage.pop();
		}
		const url = new RequetePost(window.location.href,'tiroir'+extention);
		url.ajouter("pseudo", lUtilisateur.get());
		url.ajouter("cle", laCle.get());
		url.ajouter("tiroir", leTiroirId.get());
		tracer('Charger la page TIR ' + url.requete());
		fetch(url.requete(), url.option())
			.then(response => response.text(), err => console.error('ERREUR Une erreur lors du fetch ' + url.href + ' : ' + err))
			.then(texte => requeteGenererPageTiroir(texte) );
	} else {
		// afficher un page pour se connecter
		tracer("La page n'est pas définie");
		genererPageFatal("LA PAGE PRECEDANTE EST INVALIDE", "");
	}
	document.getElementById("quiter").onclick = genererPageConnexion;
	document.getElementById("retour").onclick = allerPagePrecedante;
	document.getElementById("config").onclick = genererInformation;
	document.getElementById("importerTiroir").onclick = genererPageImporterTiroir;
	document.getElementById("creerTiroir").onclick = genererPageNouveauTiroir;
	document.getElementById("creerObjet").onclick = function() {genererPageNouvelObjet();};

};
