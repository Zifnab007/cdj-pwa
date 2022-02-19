<?php
	header('Access-Control-Allow-Origin: *');
	header('Content-Type: application/json; charset: UTF-8');

	$PATH_INCLUDE = 'include/';
	include_once($PATH_INCLUDE."class.utilisateur.php");
	include_once($PATH_INCLUDE."class.table.php");
	include_once($PATH_INCLUDE."singleton.database.php");
	include_once($PATH_INCLUDE."configuration.php");
	include_once($PATH_INCLUDE."verificateur.php");

	$utilisateur = isset ($_GET['pseudo']) ? $_GET['pseudo'] : "" ;
	$cle = isset ($_GET['cle']) ? $_GET['cle'] : "" ;
	$tiroir = isset ($_GET['tiroir']) ? $_GET['tiroir'] : "" ;
	$objetCree = isset ($_GET['objet']) ? $_GET['objet'] : "" ;
	$listeDesTables = [];
	$laCle = "";
	$nomTiroir = "";
	$structure = "";
	$laStructure = "";
	$lesObjets = [];
       	$message = pseudoEstValide($utilisateur);

	// Vérifier l'utilisateur
	if (empty($message)) {
		$DB_utilisateurs = new Utilisateurs();

		if (empty($tiroir)) {
			$message = "Le tiroir n'est pas valide.";
		} else if (empty($objetCree)) {
			$message = "La commande n'est pas valide.";
		} else if (empty($utilisateur)) {
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
	}

	if (empty($message)) {
		$DB_utilisateurs->lireUtilisateur($utilisateur);
		$listeDesTables = $DB_utilisateurs->bases;
		// Vérifier que la base existe pour cet utilisateur
		$message = "Le tiroir ".$tiroir." n'existe pas.";
		foreach ($DB_utilisateurs->bases as $table){
			if ($table["id"] == $tiroir) {
				$message = "";
				$nomTiroir = $table["Nom"];
				$structure = $table["Structure"];
				$laStructure = json_decode($structure);
			}
		}
	}
	if (empty($message)) {
		$lesTiroirs = new Tiroir();
		if (empty($message)) {
			$lObjet = [];
			$objetDansTable = [];
			$lObjet = json_decode($objetCree, true);
			$idObjet = $lObjet["id"];
			$objetDansTable["Nom"] = $lObjet["nom"];
			$objetDansTable["Creation"] = date('Y-m-d H:i:s');
			$objetDansTable["MiseAJour"] = date('Y-m-d H:i:s');
			$objetDansTable["Photo"] = $lObjet["icon"];
			$objetDansTable["supprimer"] = $lObjet["supprimer"];
			$i = 0;
			foreach ($laStructure as $champ){
				$objetDansTable["ch".$i] = $lObjet[$champ->nom];
				$message = $message.champEstValide($objetDansTable["ch".$i], $champ->type, $champ->nom);
				$i++;
			}
			if (empty($message)) {
				$message = $lesTiroirs->nouvelObjet($DB_utilisateurs->id, $tiroir, $idObjet, $objetDansTable);
			}
		}
		if (empty($message)) {
			// Lire le tiroir
			$message = $lesTiroirs->lireTiroir($DB_utilisateurs->id, $tiroir);
		}
		if (empty($message)) {
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
