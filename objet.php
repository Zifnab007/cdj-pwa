<?php
	header('Access-Control-Allow-Origin: *');
	header('Content-Type: application/json; charset: UTF-8');

	$PATH_INCLUDE = 'include/';
	include_once($PATH_INCLUDE."class.utilisateur.php");
	include_once($PATH_INCLUDE."class.table.php");
	include_once($PATH_INCLUDE."formaterObjet.php");
	include_once($PATH_INCLUDE."singleton.database.php");
	include_once($PATH_INCLUDE."configuration.php");
	include_once($PATH_INCLUDE."verificateur.php");

	function supprimerUnePhoto($tiroirs, $utilisateurs, $idTiroir, $idObjet) {
		if (!empty($idObjet)) {
			$photo = $tiroirs->photoDUnObjet($utilisateurs->id, $idTiroir, $idObjet);
			if (!empty($photo)) {
			 	unlink("$utilisateurs->repertoire$photo");
			}
		}
	}
	$utilisateur = isset ($_POST['pseudo']) ? $_POST['pseudo'] : "" ;
	$cle = isset ($_POST['cle']) ? $_POST['cle'] : "" ;
	$tiroir = isset ($_POST['tiroir']) ? $_POST['tiroir'] : "" ;
	$objetCree = isset ($_POST['objet']) ? $_POST['objet'] : "" ;
	$supprimerPhoto = isset ($_POST['supprimerPhoto']) ? $_POST['supprimerPhoto'] : "0" ;
	$listeDesTables = [];
	$laCle = "";
	$nomTiroir = "";
	$config = "";
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
				$config = $table["Configuration"];
				$configTable = json_decode($config);
				$laStructure = $configTable->structure;
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
			if (empty($idObjet)) {
				$objetDansTable["Creation"] = date('Y-m-d H:i:s');
			}
			$objetDansTable["MiseAJour"] = date('Y-m-d H:i:s');
			$objetDansTable["supprimer"] = $lObjet["supprimer"];
			if (empty($message)) {
				$i = 0;
				foreach ($laStructure as $champ){
					$messageValidation = champEstValide($lObjet[$champ->nom], $champ->type, $champ->nom);
					if ("DATE" == $champ->type) {
						$objetDansTable["ch".$i] = convertirDate($lObjet[$champ->nom]);
					} else {
						$objetDansTable["ch".$i] = $lObjet[$champ->nom];
					}
					$message = $message.$messageValidation;
					$i++;
				}
			}
			if (isset ($_FILES['photo'])) {
				$nomImage = md5(uniqid(rand(), true));
				$objetDansTable["Photo"] = $nomImage;
				if (1048576 < $_FILES['photo']['size']) {
					$message = "La taille du fichier est trop grande";
				} else {
					if (	('image/jpeg' == $_FILES['photo']['type']) ||
						('image/webp' == $_FILES['photo']['type']) ||
						('image/gif' == $_FILES['photo']['type'])) {
						if (move_uploaded_file($_FILES['photo']['tmp_name'], "$DB_utilisateurs->repertoire$nomImage")) {
							// Si c'est une nouvelle photo il faut supprimer l'ancienne
							supprimerUnePhoto($lesTiroirs, $DB_utilisateurs, $tiroir, $idObjet);
						} else {
							$message = "Erreur sur le serveur lors de la copie du fichier";
						}
					} else {
						$message = "Il faut selectionner une image JPEG, GIF ou WEBP (pas ".$_FILES['photo']['type'].").";
					}
				}
			} else if ($supprimerPhoto) {
				$objetDansTable["Photo"] = null;
				supprimerUnePhoto($lesTiroirs, $DB_utilisateurs, $tiroir, $idObjet);
			}
			if (empty($message)) {
				$message = $lesTiroirs->creerObjet($DB_utilisateurs->id, $tiroir, $idObjet, $objetDansTable);
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
