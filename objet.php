<?php
	header('Access-Control-Allow-Origin: *');
	header('Content-Type: application/json; charset: UTF-8');

	$PATH_INCLUDE = 'include/';
	include_once($PATH_INCLUDE."class.utilisateur.php");
	include_once($PATH_INCLUDE."class.table.php");
	include_once($PATH_INCLUDE."class.tiroir.php");
	include_once($PATH_INCLUDE."class.commerce.php");
	include_once($PATH_INCLUDE."formatage.php");
	include_once($PATH_INCLUDE."configuration.php");
	include_once($PATH_INCLUDE."verificateur.php");

	// Délaration des fonctions
	function supprimerUnePhoto($tiroirs, $utilisateurs, $idTiroir, $idObjet) {
		if (!empty($idObjet)) {
			$photo = $tiroirs->photoDUnObjet($utilisateurs->id, $idTiroir, $idObjet);
			if (!empty($photo)) {
			 	unlink("$utilisateurs->repertoire$photo");
			}
		}
	}
	function sauvegarderPhoto ($fichier, $type, $fichierCible) {
		$pasDErreur = false;
		$imageSrc = "";
		switch($type) {
			case 'image/gif':
				$imageSrc = imagecreatefromgif( $fichier );
				$pasDErreur = true;
				break;
			case 'image/jpeg':
				$imageSrc = imagecreatefromjpeg( $fichier );
				$pasDErreur = true;
				break;
			case 'image/png':
				$imageSrc = imagecreatefrompng( $fichier );
				$pasDErreur = true;
				break;
			case 'image/webp':
				$imageSrc = imagecreatefromwebp( $fichier );
				$pasDErreur = true;
				break;
			default:
				$pasDErreur = false;
		}
		if ($pasDErreur) {
			$imageSrcLargeur = imagesx($imageSrc);
			$imageSrcHauteur = imagesy($imageSrc);
			$imageSrcPosX = 0;
			$imageSrcPosY = 0;
			if (($imageSrcLargeur < IMAGE_TAILLE_MAX) || ($imageSrcHauteur < IMAGE_TAILLE_MAX)) {
				if (!move_uploaded_file($fichier, $fichierCible)) {
					$pasDErreur = false;
				}
			} else {
				$imageDest = imagecreatetruecolor(IMAGE_TAILLE_MAX, IMAGE_TAILLE_MAX);
				if ($imageSrcLargeur > $imageSrcHauteur) {
					$imageSrcPosX = ($imageSrcLargeur - $imageSrcHauteur)/2;
					$imageSrcLargeur = $imageSrcHauteur;
				} else {
					$imageSrcPosY = ($imageSrcHauteur - $imageSrcLargeur)/2;
					$imageSrcHauteur = $imageSrcLargeur;
				}
				$pasDErreur = imagecopyresampled(
					$imageDest,
					$imageSrc,
					0,
					0,
					$imageSrcPosX,
					$imageSrcPosY,
					IMAGE_TAILLE_MAX,
					IMAGE_TAILLE_MAX,
					$imageSrcLargeur,
					$imageSrcHauteur);
				if ($pasDErreur) {
					switch($type) {
						case 'image/gif':
							$pasDErreur = imagegif($imageDest, $fichierCible);
							break;
						case 'image/jpeg':
							$pasDErreur = imagejpeg($imageDest, $fichierCible);
							break;
						case 'image/png':
							$pasDErreur = imagepng($imageDest, $fichierCible);
							break;
						case 'image/webp':
							$pasDErreur = imagewebp($imageDest, $fichierCible);
							break;
						default:
							$pasDErreur = false;
					}
				}
			}
		}
		return $pasDErreur;
	}

	// Délaration des données
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
	$laConfig = "";
	$objetListe = [];
	$commerceListe = [];
       	$message = pseudoEstValide($utilisateur);
	$DB_utilisateurs = "";

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

	// Charger les info de l'utilisateur
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

	// Contruire l'objet
	if (empty($message)) {
		$lesTiroirs = new Tiroir();
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
		$i = 0;
		foreach ($laStructure as $champ){
			$messageValidation = champEstValide($lObjet[$champ->nom], $champ->type, $champ->nom);
			switch($champ->type) {
				case "DATE";
					$objetDansTable["ch".$i] = convertirDate($lObjet[$champ->nom]);
					break;
				case "FLOTTANT":
				case "LAT":
				case "LONG":
					$objetDansTable["ch".$i] = str_replace(',', '.', $lObjet[$champ->nom]);
					break;
				default:
					$objetDansTable["ch".$i] = $lObjet[$champ->nom];
			}
			$message = $message.$messageValidation;
			$i++;
		}
	}

	// Gérer les photos
	if (empty($message)) {
		if (isset($laConfig->photo)) {
			if ($laConfig->photo && isset ($_FILES['photo'])) {
				$nomImage = md5(uniqid(rand(), true));
				$objetDansTable["Photo"] = $nomImage;
				if (	('image/gif' == $_FILES['photo']['type']) ||
					('image/jpeg' == $_FILES['photo']['type']) ||
					('image/png' == $_FILES['photo']['type']) ||
					('image/webp' == $_FILES['photo']['type'])) {
					if (sauvegarderPhoto($_FILES['photo']['tmp_name'],
					                     $_FILES['photo']['type'],
					                     $DB_utilisateurs->repertoire.$nomImage)) {
						// Si c'est une nouvelle photo il faut supprimer l'ancienne
						supprimerUnePhoto($lesTiroirs, $DB_utilisateurs, $tiroir, $idObjet);
					} else {
						$message = "Erreur sur le serveur lors de la copie du fichier";
					}
				} else {
					$message = "Il faut selectionner une image GIF, JPEG, PNG ou WEBP (pas ".$_FILES['photo']['type'].").";
				}
			} else if ($supprimerPhoto) {
				$objetDansTable["Photo"] = null;
				supprimerUnePhoto($lesTiroirs, $DB_utilisateurs, $tiroir, $idObjet);
			}
		} else {
			$message = "Il n'y a pas d'information sur les photo dans la structure du tiroir ".$tiroir." de l'utilsateur ".$DB_utilisateurs->id.".";
		}
	}

	// Créer ou modifier l'objet
	if (empty($message)) {
		$message = $lesTiroirs->creerObjet($DB_utilisateurs->id, $tiroir, $idObjet, $objetDansTable);
		$idObjet = $lesTiroirs->dernierObjetId;
	}

	// Ajouter le commerce
	if (empty($message)) {
		if (isset($laConfig->commerce)) {
			if (($laConfig->commerce) && !empty($lObjet["commerceId"])) {
				$lesCommerces = new Commerce();
				$lesCommerces->lierCommerce($DB_utilisateurs->id, $tiroir, $lObjet["commerceId"], $idObjet, $lObjet["commercePrix"], $lObjet["commerceQuan"], $lObjet["commerceUnit"], $lObjet["commerceDate"]);
			}
		} else {
			$message = "Il n'y a pas d'information sur les commerces dans la structure du tiroir ".$tiroir." de l'utilsateur ".$DB_utilisateurs->id.".";
		}
	}

	// Lire le tiroir pour le retourner au client
	if (empty($message)) {
		$message = $lesTiroirs->lireTiroir($DB_utilisateurs->id, $tiroir);
		if (empty($message)) {
			if (!isset($laConfig->commerce)) {
				$message = "Il n'y a pas d'information sur les commerces dans la structure du tiroir ".$tiroir." de l'utilsateur ".$DB_utilisateurs->id.".";
			}
		}
	}
	if (empty($message)) {
		if ($laConfig->commerce) {
			$lesCommerces = new Commerce();
		}
		foreach ($lesTiroirs->objets as $objet){
			$unObjet = formaterObjet ($objet, $laConfig->structure, $DB_utilisateurs->repertoire);
			if ($laConfig->commerce) {
				$unObjet['Commerces'] = $lesCommerces->lireCommerceParObjet($DB_utilisateurs->id, $tiroir, $unObjet['id'], $DB_utilisateurs->commerceId);
			}
			$objetListe[] = $unObjet;
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
		"data" => $objetListe);
	echo json_encode($reponse, JSON_INVALID_UTF8_SUBSTITUTE|JSON_PRESERVE_ZERO_FRACTION|JSON_UNESCAPED_LINE_TERMINATORS|JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);

?>
