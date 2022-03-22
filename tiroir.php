<?php
	header('Access-Control-Allow-Origin: *');
	header('Content-Type: application/json; charset: UTF-8');

	$PATH_INCLUDE = 'include/';
	include_once($PATH_INCLUDE."class.utilisateur.php");
	include_once($PATH_INCLUDE."class.table.php");
	include_once($PATH_INCLUDE."formaterObjet.php");
	include_once($PATH_INCLUDE."singleton.database.php");
	include_once($PATH_INCLUDE."configuration.php");

	$utilisateur = "";
	$cle = "";
	$tiroir = "";
	$utilisateur = isset ($_POST['pseudo']) ? $_POST['pseudo'] : "" ;
	$cle = isset ($_POST['cle']) ? $_POST['cle'] : "" ;
	$tiroir = isset ($_POST['tiroir']) ? $_POST['tiroir'] : "" ;
	$listeDesTables = [];
	$laCle = "";
	$nomTiroir = "";
	$config = "";
	$lesObjets = [];

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
	} else {
		$laCle = $cle;
	}
	if (empty($message)) {
		$DB_utilisateurs->lireUtilisateur($utilisateur);
		$listeDesTables = $DB_utilisateurs->bases;
		// Vérifier que la base n'existe pas pour cet utilisateur
		$message = "Le tiroir ".$tiroir." n'existe pas.";
		foreach ($DB_utilisateurs->bases as $table){
			if ($table["id"] == $tiroir) {
				$message = "";
				$nomTiroir = $table["Nom"];
				$config = $table["Configuration"];
			}
		}
	}
	if (empty($message)) {
		// Lire le tiroir
		$lesTiroirs = new Tiroir();
		$message = $lesTiroirs->lireTiroir($DB_utilisateurs->id, $tiroir);
		if (empty($message)) {
			$laConfig = json_decode($config);
			foreach ($lesTiroirs->objets as $objet){
				$lesObjets[] = formaterObjet ($objet, $laConfig->structure, $DB_utilisateurs->repertoire);
			}
		}
	}
       
	if (!empty($message)) {
		$tiroir = 0;
	}

	// Construire la réponse et la retourner
	$reponse = array (
		"pseudo" => $utilisateur,
		"page" => "TIR",
		"cle" => $laCle,
		"erreur" => $message,
		"id" => $tiroir,
		"table" => $nomTiroir,
		"config" => $config,
		"data" => $lesObjets);
	echo json_encode($reponse, JSON_INVALID_UTF8_SUBSTITUTE|JSON_PRESERVE_ZERO_FRACTION|JSON_UNESCAPED_LINE_TERMINATORS|JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);

?>
