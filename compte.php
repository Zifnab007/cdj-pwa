<?php
	header('Access-Control-Allow-Origin: *');
	header('Content-Type: application/json; charset: UTF-8');

	$PATH_INCLUDE = 'include/';
	include_once($PATH_INCLUDE."class.utilisateur.php");
	include_once($PATH_INCLUDE."singleton.database.php");
	include_once($PATH_INCLUDE."configuration.php");

	$utilisateur = isset ($_GET['pseudo']) ? $_GET['pseudo'] : "" ;
	$eMail = isset ($_GET['email']) ? $_GET['email'] : "" ;
	$motDePasse = isset ($_GET['mdp']) ? $_GET['mdp'] : "" ;
	$laCle = "";
	$message = "";

	// Vérifier que l'utilisateur n'existe pas
	$DB_utilisateurs = new Utilisateurs();

	if (UTILISATEUR_MAX <= $DB_utilisateurs->get_db_stat()) {
		$message = "Le nombre max d'utilisateur est atteint.";
	} else if ($DB_utilisateurs->pseudoDejaDefini($utilisateur)) {
		$message = "L'utilisateur ".$utilisateur." existe déjà.";
	} else if ($DB_utilisateurs->emailDejaDefini($eMail)) {
		$message = "L'adresse e-mail ".$eMail." est déjà utilisée.";
	} else {
		$message = $DB_utilisateurs->creerUtilisateur($utilisateur, $eMail, $motDePasse);
	}
	if (empty($message)) {
		$laCle = $DB_utilisateurs->data["Cle"];
	}

	// Construire la réponse et la retourner
	$reponse = array (
		"pseudo" => $utilisateur,
		"page" => 11,
		"cle" => $laCle,
		"erreur" => $message);
	echo json_encode($reponse, JSON_INVALID_UTF8_SUBSTITUTE|JSON_PRESERVE_ZERO_FRACTION|JSON_UNESCAPED_LINE_TERMINATORS|JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);

?>
