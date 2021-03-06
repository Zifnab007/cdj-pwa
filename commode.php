<?php
	header('Access-Control-Allow-Origin: *');
	header('Content-Type: application/json; charset: UTF-8');

	$PATH_INCLUDE = 'include/';
	include_once($PATH_INCLUDE."class.utilisateur.php");
	include_once($PATH_INCLUDE."singleton.database.php");
	include_once($PATH_INCLUDE."configuration.php");
	include_once($PATH_INCLUDE."verificateur.php");

	$utilisateur = isset ($_GET['pseudo']) ? $_GET['pseudo'] : "" ;
	$cle = isset ($_GET['cle']) ? $_GET['cle'] : "" ;
	$laCle = "";
	$message = pseudoEstValide($utilisateur);
	$listeDesTables = [];

	// Vérifier l'utilisateur
	$DB_utilisateurs = new Utilisateurs();
	if (empty($message)) {

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
	}

	if (empty($message)) {
		$DB_utilisateurs->lireUtilisateur($utilisateur);
		$laCle = $DB_utilisateurs->data["Cle"];
//		print_r($DB_utilisateurs->bases);
		$listeDesTables = $DB_utilisateurs->bases;
//		print_r($DB_utilisateurs->data);
	}

	// Construire la réponse et la retourner
	$reponse = array (
		"pseudo" => $utilisateur,
		"page" => "COM",
		"cle" => $laCle,
		"erreur" => $message,
		"table" => "",
		"data" => $listeDesTables);
	echo json_encode($reponse, JSON_INVALID_UTF8_SUBSTITUTE|JSON_PRESERVE_ZERO_FRACTION|JSON_UNESCAPED_LINE_TERMINATORS|JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);

?>
