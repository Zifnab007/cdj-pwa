<?php
	header('Access-Control-Allow-Origin: *');
	header('Content-Type: application/json; charset: UTF-8');

	$PATH_INCLUDE = 'include/';
	include_once($PATH_INCLUDE."verificateur.php");
	include_once($PATH_INCLUDE."class.utilisateur.php");
	include_once($PATH_INCLUDE."singleton.database.php");
	include_once($PATH_INCLUDE."configuration.php");

	$utilisateur = isset ($_GET['pseudo']) ? $_GET['pseudo'] : "" ;
	$cle = isset ($_GET['cle']) ? $_GET['cle'] : "" ;
	$motDePasse = isset ($_GET['mdp']) ? $_GET['mdp'] : "" ;
	$enClair = isset ($_GET['enClair']) ? $_GET['enClair'] : "" ;
	$laCle = "";
	$message = "";

	// Vérifier la syntaxe des variables
	$message = $message.pseudoEstValide($utilisateur);
	if (empty($enClair)) {
		$message = $message.mdpEstValide($motDePasse);
	}

	// Vérifier que l'utilisateur n'existe pas
	if (empty($message)) {
		$DB_utilisateurs = new Utilisateurs();

		if (empty($utilisateur)) {
			$message = "Le pseudo est vide.";
		} else if (empty($cle)) {
			$message = "La clé est vide.";
		} else if (empty($motDePasse)) {
			$message = "Le mot de passe est vide.";
		} else if (!$DB_utilisateurs->pseudoDejaDefini($utilisateur)) {
			$message = "Le compte n'existe pas.";
		} else if (!$DB_utilisateurs->estValide($utilisateur, $motDePasse, $enClair)) {
			$message = "Le mot de passe est faux.";
		} else if ($DB_utilisateurs->estActif($utilisateur)) {
			$message = "Le compte est déjà actif.";
		} else if (!$DB_utilisateurs->estConnecte($utilisateur, $cle)) {
			$message = "Les informations de validations sont incorectes. Il faut vous reconnecter.";
		}
	}

	if (empty($message)) {
		$laCle = $DB_utilisateurs->activerLeCompte($utilisateur);
		if (empty($laCle)) {
			$message = "Erreur interne: Impossible d'allouer une clé.";
		}
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
