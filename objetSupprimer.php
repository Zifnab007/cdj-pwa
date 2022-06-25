<?php
	header('Access-Control-Allow-Origin: *');
	header('Content-Type: application/json; charset: UTF-8');

	$PATH_INCLUDE = 'include/';
	include_once($PATH_INCLUDE."singleton.database.php");
	include_once($PATH_INCLUDE."class.table.php");
	include_once($PATH_INCLUDE."class.utilisateur.php");
	include_once($PATH_INCLUDE."class.commerce.php");
	include_once($PATH_INCLUDE."formatage.php");
	include_once($PATH_INCLUDE."configuration.php");
	include_once($PATH_INCLUDE."verificateur.php");

	$utilisateur = isset ($_POST['pseudo']) ? $_POST['pseudo'] : "" ;
	$cle = isset ($_POST['cle']) ? $_POST['cle'] : "" ;
	$tiroir = isset ($_POST['tiroir']) ? $_POST['tiroir'] : "" ;
	$objetId = isset ($_POST['objetId']) ? $_POST['objetId'] : "" ;
	$listeDesTables = [];
	$laCle = "";
	$nomTiroir = "";
	$config = "";
	$laConfig = "";
	$laStructure = "";
	$lesObjets = [];
	$commerceListe = [];
	$lesCommerces = null;
       	$message = pseudoEstValide($utilisateur);

	// Vérifier l'utilisateur
	if (empty($message)) {
		$DB_utilisateurs = new Utilisateurs();

		if (empty($tiroir)) {
			$message = "Le tiroir n'est pas valide.";
		} else if (empty($objetId)) {
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
				$config = $table["Configuration"];
				$laConfig = json_decode($config);
				$laStructure = $laConfig->structure;
			}
		}
	}
	if (empty($message)) {
		$lesTiroirs = new Tiroir();
		if (empty($message)) {
			if (empty($message)) {
				$message = $lesTiroirs->supprimerObjet($DB_utilisateurs->id, $tiroir, $objetId);
			}
		}
		// Ajouter le commerce
		if (empty($message)) {
			if (isset($laConfig->commerce)) {
				if ($laConfig->commerce) {
					$lesCommerces = new Commerce();
					$lesCommerces->supprimerLien($DB_utilisateurs->id, $tiroir, $objetId);
				}
			} else {
				$message = "Il n'y a pas d'information sur les commerces dans la structure du tiroir ".$tiroir." de l'utilsateur ".$DB_utilisateurs->id.".";
			}
		}
		if (empty($message)) {
			// Lire le tiroir
			$message = $lesTiroirs->lireTiroir($DB_utilisateurs->id, $tiroir);
		}
		if (empty($message)) {
			foreach ($lesTiroirs->objets as $objet){
				$lesObjets[] = formaterObjet ($objet, $laStructure, $DB_utilisateurs->repertoire);
			}
			if ($laConfig->commerce) {
				$message = $lesCommerces->lireCommerce($DB_utilisateurs->id, $DB_utilisateurs->commerceId);
				if (empty($message)) {
					foreach ($lesCommerces->commerces as $commerce){
						$commerceListe[] = $commerce;
					}
				}
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
		"commerces" => $commerceListe,
		"data" => $lesObjets);
	echo json_encode($reponse, JSON_INVALID_UTF8_SUBSTITUTE|JSON_PRESERVE_ZERO_FRACTION|JSON_UNESCAPED_LINE_TERMINATORS|JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);

?>
