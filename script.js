// Les pages:
// CON Connexion		(genererPageConnexion)
// CMP Compte			(genererPageCompte)
// VAL Validation		(requeteGenererPageValidation)
// COM Commode			(requeteGenererPageCommode)
// TIR Tiroir			(requeteGenererPageTiroir)
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
		document.getElementById("retour").className = "button is-link is-hidden";
	} else {
		document.getElementById("retour").className = "button is-link is-flex";
	}
	if ("COM" == page) {
		document.getElementById("creerTiroir").className = "button is-link is-flex";
	} else {
		document.getElementById("creerTiroir").className = "button is-link is-hidden";
	}
	if ("TIR" == page) {
		if ("MOO" == pageCourante()) { laPage.pop(); }
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
		donnee["mdp"] = document.getElementById("motDePasseCMP").value;
		donnee["stockage"] = document.getElementById("stockageCMP").value;
		lesPages.nouvellePage("CMP", donnee);
	} else if ("CRT" == pageCourante()) {
		let donnee = new Object();
		donnee["nom"] = document.getElementById("base").value;
		for (var i=0;i<4;i++) {
			donnee["nom"+i] = document.getElementById("nom"+i).value;
			donnee["type"+i] = document.getElementById("type"+i).value;
		}
		lesPages.nouvellePage("CRT", donnee);
	} else if ("MOO" == pageCourante()) {
		let donnee = new Object();
		donnee["id"] = document.getElementById("elemId").value;
		donnee["nom"] = document.getElementById("elemNom").value;
		donnee["icon"] = "";
		donnee["supprimer"] = 0;
		let champsLibres = new Object();
		laStructure.get().forEach(function (structure, index) {
			champsLibres[structure.nom] = document.getElementById("elem"+index).value;
			tracer('MOO ' + structure.nom + " : " + document.getElementById("elem"+index).value + " id : " + "elem"+index);
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
	} else if ("" == json.erreur) {
		lUtilisateur.reset();
		laCle.reset();
		console.error('Invalider '+json.pseudo);
		return false;
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
};

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
          <label class="label">${titre}</label>
          <div class="control">
            <input class="input" type="${typeAffichage}" placeholder="${fond}" id="${id}" value="${valeur}">`;

	if ("ENTIER" == type) {
		if ("" == aideKO) { aideKO = "Ce nombre est invalide. Il doit comporter uniquement un maximum de 10 chiffres [0-9]."; }
		if ("" == aideOK) { aideOK = "Ce nombre est valide."; }
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

// ###################################
// Génération de la page Connexion ("CON")
//
// Demander au server de valider la connexion
function demanderConnexion() {
	const url = new Adresse(window.location.href,'connection'+extention);
	lUtilisateur.set(document.getElementById("pseudo").value);
	url.add("pseudo", lUtilisateur.get());
	url.add("motDePasse", document.getElementById("mdp").value);
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
	document.getElementById("mdp").addEventListener('input', function (){validerEntree(this, "mdpOK", "mdpKO", "password")});
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
	url.add("pseudo", document.getElementById("pseudoCMP").value);
	url.add("email", document.getElementById("eMailCMP").value);
	url.add("mdp", document.getElementById("motDePasseCMP").value);
	url.add("stockage", document.getElementById("stockageCMP").value);
	tracer('Clic sur demanderCreationCompte ' + url.get());
	fetch(url.get())
		.then(
			response => response.json(),
			err => genererPageErreur(err, null))
		.then(json => requeteGenererPageValidation(json) )
		.catch(err => genererPageFatal(err, "Erreur interne levée lors de la création d'un compte pour "+document.getElementById("pseudo").value+" avec l'email "+document.getElementById("eMail").value));

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
	const url = new Adresse(window.location.href,'tiroir'+extention);
	url.add("pseudo", lUtilisateur.get());
	url.add("cle", laCle.get());
	url.add("tiroir", tiroirId);
	tracer('Clic sur demanderOuvrirTiroir ' + url.get());
	fetch(url.get())
		.then(response => response.json(), err => console.error('ERREUR Une erreur lors du fetch ' + url.href + ' : ' + err))
		.then(json => requeteGenererPageTiroir(json) );
	return true;
}

//
function requeteGenererPageCommode(json){

	tracer('appel de la fonction requeteGenererPageCommode '+json.cle);

	nomDeLaTable.reset();
	lesObjets.reset();
	laStructure.reset();
	if (messageEstValide(json)) {

		const tiroirs = json.data.map(j => ({
			nom: j.Nom,
			id: j.id,
			icon: j.icon,
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
				html += formateur.ajouter(tiroir);
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
function requeteGenererPageTiroir(leTiroir){

	tracer('appel de la fonction requeteGenererPageTiroir '+leTiroir.cle);
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
// Génération de la page de creation d'un Tiroir ("CRT")
//
function demanderCreationTiroir() {
	memoriserDonneePage();
	const url = new Adresse(window.location.href,'tiroirCreer'+extention);
	url.add("pseudo", lUtilisateur.get());
	url.add("cle", laCle.get());
	url.add("nom", document.getElementById("base").value);
	for (var i=0;i<4;i++) {
		let elementNom = document.getElementById("nom"+i).value;
		if ("" != elementNom) {
			url.add("nom"+i, elementNom);
			url.add("type"+i, document.getElementById("type"+i).value);
		}
	}
	tracer('Clic sur demanderCreationTiroir ' + url.get());
	fetch(url.get())
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
                  <button id="demanderCreationTiroir" class="button is-link">Créer le tiroir</button>
                </div>
	      </div>`;

	html += chapitreEnHTML("Créer un nouveau tiroir:", "");
	html += saisieEnHTML("Nom du tiroir", "base", "text", "Nom du tiroir", lesPages.lireElement("CRT", "nom"), null, null);
	html += `
	    <hr/>`;

	html += chapitreEnHTML("", "Il y a déjà par défaut les champs identification (id), nom (Non), date de création (creation) et de modifixation (MiseAJour).");
	html += `
	    <hr/>`;

	html += chapitreEnHTML("Décrire les autres champs d'un objet du tiroir:", "");

	for (var i=0;i<4;i++) {
		html += saisieEnHTML("Nom du champ", "nom"+i, "text", "Nom du champ", lesPages.lireElement("CRT", "nom"+i), null, null);
		html += choixEnHTML("Type du champ", "type"+i, ["DATE", "ENTIER", "TEXTE", "BOOLEEN"], lesPages.lireElement("CRT", "type"+i), "");
	}

	html += "</div></div>";

	document.querySelector(".corpDePage").innerHTML = html;
	document.querySelector(".title").innerHTML = nomDuSite;
	document.getElementById("demanderCreationTiroir").onclick = demanderCreationTiroir;

	declarerNouvellePage("CRT");

	tracer("La page NOUVEAU TIROIR (CRT) est chargée");

}
// #################################
// Génération de la page de suppression d'un élément ("SUO")
//
// Demander au server la suppression de l'objet
function genererPageSuppressionObjet(objet){

	tracer('appel de la fonction genererPageSuppressionObjet '+objet.id);

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
	jsonCmd["id"] = document.getElementById("elemId").value;
	jsonCmd["nom"] = document.getElementById("elemNom").value;
	jsonCmd["icon"] = "";
	jsonCmd["supprimer"] = 0;
	laStructure.get().forEach(function (structure, index) {
		jsonCmd[structure.nom] = document.getElementById("elem"+index).value;
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
		.then(json => requeteGenererPageTiroir(json) )
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

		tracerTable(laStructure);
		laStructure.get().forEach(function (structure, index) {
			if (null == objet.record[structure.nom]) {texte = ""} else {texte = objet.record[structure.nom]};
			html += saisieEnHTML(structure.nom, "elem"+index, structure.type, null, texte, "", "");
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
		laStructure.get().forEach(function (structure, index) {
			validerEntree(document.getElementById("elem"+index), "elem"+index+'OK', "elem"+index+'KO', structure.type);
			document.getElementById("elem"+index).addEventListener('input', function (){validerEntree(this, "elem"+index+'OK', "elem"+index+'KO', structure.type)});
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
	objet["icon"] = null;
	objet["supprimer"] = 0;
	laStructure.get().forEach(function (structure, index) {
		champsLibres[structure.nom] = null;
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
			.then(json => requeteGenererPageTiroir(json) );
	} else {
		// afficher un page pour se connecter
		tracer("La page n'est pas définie");
		genererPageFatal("LA PAGE PRECEDANTE EST INVALIDE", "");
	}
	document.getElementById("retour").onclick = allerPagePrecedante;
	document.getElementById("config").onclick = genererInformation;
	document.getElementById("creerTiroir").onclick = genererPageNouveauTiroir;
	document.getElementById("creerObjet").onclick = function() {genererPageNouvelObjet();};

};
