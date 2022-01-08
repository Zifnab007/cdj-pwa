<?php
	header('Access-Control-Allow-Origin: *');
	header('Content-Type: application/json; charset: UTF-8');

	$PATH_INCLUDE = 'include/';
	include_once($PATH_INCLUDE."class.utilisateur.php");
	include_once($PATH_INCLUDE."singleton.database.php");
	include_once($PATH_INCLUDE."configuration.php");

	$utilisateur = isset ($_GET['pseudo']) ? $_GET['pseudo'] : "" ;
	$motDePasse = isset ($_GET['motDePasse']) ? $_GET['motDePasse'] : "" ;
	$laCle = "";
	$message = "";

	// Vérifier que l'utilisateur n'existe pas
	$DB_utilisateurs = new Utilisateurs();

	if (empty($utilisateur)) {
		$message = "Le pseudo est vide.";
	} else if (empty($motDePasse)) {
		$message = "Le mot de passe est vide.";
	} else if (!$DB_utilisateurs->pseudoDejaDefini($utilisateur)) {
		$message = "Le compte n'existe pas.";
	} else if (!$DB_utilisateurs->estValide($utilisateur, $motDePasse)) {
		$message = "Le compte n'existe pas.";
	} else if (!$DB_utilisateurs->estActif($utilisateur)) {
		$message = "Le compte n'est pas actif.";
	}
	if (empty($message)) {
		$laCle = $DB_utilisateurs->mettreAJourCle($utilisateur);
		$DB_utilisateurs->lireUtilisateur($utilisateur);
//		print_r($DB_utilisateurs->data);
	}

	// Construire la réponse et la retourner
	$reponse = array (
		"pseudo" => $utilisateur,
		"page" => "CON",
		"cle" => $laCle,
		"erreur" => $message,
		"table" => "",
		"data" => []);
	echo json_encode($reponse, JSON_INVALID_UTF8_SUBSTITUTE|JSON_PRESERVE_ZERO_FRACTION|JSON_UNESCAPED_LINE_TERMINATORS|JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);

?>
