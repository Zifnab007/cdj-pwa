<?php
	header('Access-Control-Allow-Origin: *');
	header('Content-Type: application/json; charset: UTF-8');

	$PATH_INCLUDE = 'include/';
	include_once($PATH_INCLUDE."class.utilisateur.php");
	include_once($PATH_INCLUDE."class.table.php");
	include_once($PATH_INCLUDE."singleton.database.php");
	include_once($PATH_INCLUDE."configuration.php");

	$utilisateur = isset ($_GET['pseudo']) ? $_GET['pseudo'] : "" ;
	$cle = isset ($_GET['cle']) ? $_GET['cle'] : "" ;
	$tiroir = isset ($_GET['tiroir']) ? $_GET['tiroir'] : "" ;
	$listeDesTables = [];
	$laCle = "";
	$nomTiroir = "";
	$structure = "";
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
				$structure = $table["Structure"];
			}
		}
	}
	if (empty($message)) {
		// Lire le tiroir
		$lesTiroirs = new Tiroir();
		$message = $lesTiroirs->lireTiroir($DB_utilisateurs->id, $tiroir);
		if (empty($message)) {
			$laStructure = json_decode($structure);
			foreach ($lesTiroirs->objets as $objet){
				$unObjet["id"] = $objet["id"];
				$unObjet["nom"] = $objet["Nom"];
				$unObjet["created_at"] = $objet["Creation"];
				$unObjet["updated_at"] = $objet["MiseAJour"];
				$unObjet["icon"] = $objet["Photo"];
				$unObjet["supprimer"] = $objet["supprimer"];
				$unObjet["record"] = [];
				$i = 0;
				foreach ($laStructure as $champ){
					$unObjet["record"][$champ->nom] = $objet["ch".$i];
					$i++;
				}
				$lesObjets[] = $unObjet;
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
		"structure" => $structure,
		"data" => $lesObjets);
	echo json_encode($reponse, JSON_INVALID_UTF8_SUBSTITUTE|JSON_PRESERVE_ZERO_FRACTION|JSON_UNESCAPED_LINE_TERMINATORS|JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);

?>
