<?php
	header('Access-Control-Allow-Origin: *');
	header('Content-Type: application/json; charset: UTF-8');

	$PATH_INCLUDE = 'include/';
	include_once($PATH_INCLUDE."class.utilisateur.php");
	include_once($PATH_INCLUDE."singleton.database.php");
	include_once($PATH_INCLUDE."configuration.php");

	$utilisateur = isset ($_GET['pseudo']) ? $_GET['pseudo'] : "" ;
	$cle = isset ($_GET['cle']) ? $_GET['cle'] : "" ;
	$nomDuTiroir = isset ($_GET['nom']) ? $_GET['nom'] : "" ;
	$avecPhoto = isset ($_GET['photo']) ? $_GET['photo'] : 0 ;
	$laCle = "";
	$message = "";
	$identifiant = 0;
	$listeDesTables = [];

	// Vérifier l'utilisateur
	$DB_utilisateurs = new Utilisateurs();

	if (empty($utilisateur)) {
		$message = "Le pseudo est vide.";
	} else if (empty($cle)) {
		$message = "La clé est vide.";
	} else if (!$DB_utilisateurs->pseudoDejaDefini($utilisateur)) {
		$message = "Le compte n'existe pas ou n'est pas actif.";
	} else if (!$DB_utilisateurs->estActif($utilisateur)) {
		$message = "Le compte n'existe pas ou n'est pas actif.";
	} else if (!$DB_utilisateurs->estConnecte($utilisateur, $cle)) {
		$message = "Les informations de validations sont incorectes. Il faut vous reconnecter.";
	}
	if (empty($message)) {
		$DB_utilisateurs->lireUtilisateur($utilisateur);
		$laCle = $DB_utilisateurs->data["Cle"];
		$listeDesTables = $DB_utilisateurs->bases;
		// Vérifier que la base n'existe pas pour cet utilisateur
		foreach ($DB_utilisateurs->bases as $table){
			if ($table["Nom"] == $nomDuTiroir) { $message = "Le tiroir ".$nomDuTiroir." existe déjà."; }
		}
	}
	if (empty($message)) {
		// extraire les champs libres
		$lesChamps = [];
		$nom = "";
		$type = "";
		for ($i = 0; $i<4; $i++) {
			$nom = isset ($_GET["nom".$i]) ? $_GET["nom".$i] : "" ;
			$type = isset ($_GET["type".$i]) ? $_GET["type".$i] : "" ;
			if (!empty($nom)) {
				$lesChamps[] = array( "nom" => $nom, "type" => $type);
			}
		}
		// Créer la nouvelle table
		$message = $DB_utilisateurs->creerTable($nomDuTiroir, $lesChamps, $avecPhoto);
		if (empty($message)) {
			$identifiant = $DB_utilisateurs->derniereTable;
		}
	}

	// Construire la réponse et la retourner
	$reponse = array (
		"pseudo" => $utilisateur,
		"page" => "COM",
		"cle" => $laCle,
		"erreur" => $message,
		"id" => $identifiant,
		"table" => "");
	echo json_encode($reponse, JSON_INVALID_UTF8_SUBSTITUTE|JSON_PRESERVE_ZERO_FRACTION|JSON_UNESCAPED_LINE_TERMINATORS|JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);

?>
