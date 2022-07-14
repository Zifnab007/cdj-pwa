<?php
	header('Access-Control-Allow-Origin: *');
	header('Content-Type: application/json; charset: UTF-8');

	$PATH_INCLUDE = 'include/';
	include_once($PATH_INCLUDE."class.utilisateur.php");
	include_once($PATH_INCLUDE."class.tiroir.php");
	include_once($PATH_INCLUDE."singleton.database.php");
	include_once($PATH_INCLUDE."configuration.php");
	include_once($PATH_INCLUDE."verificateur.php");

	$utilisateur = isset ($_POST['pseudo']) ? $_POST['pseudo'] : "" ;
	$cle = isset ($_POST['cle']) ? $_POST['cle'] : "" ;
	$nomDuTiroir = "";
	$description = "";
	$avecPhoto = 0;
	$avecCommerce = 0;
	$laCle = "";
	$message = "";
	$identifiant = 0;
	$listeDesTables = [];
	$sep = "	";
	$nomDesChamps = "";
	$typeDesChamps = "";
	$listeDesDonnees = [];
	$numDeLigne = 0;
	$nbDeChamps = 0;
	$fImport = "";

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
	}
	if (empty($message)) {
		$DB_utilisateurs->lireUtilisateur($utilisateur);
		$laCle = $DB_utilisateurs->data["Cle"];
		$listeDesTables = $DB_utilisateurs->bases;
	}

	if (empty($message)) {
		// Ouverture du fichier
		if (isset ($_FILES['fichierTsv'])) {
			// extraire les champs libres
			if (1048576 < $_FILES['fichierTsv']['size']) {
					$message = "La taille du fichier est trop grande";
			} else {
				$fImport = @fopen($_FILES['fichierTsv']['tmp_name'], "r");
				if (empty($fImport)) {
					$message = "Impossible d\'ouvrir le fichier!";
				}
			}
		} else {
			$message = "Il manque fichier!";
		}
	}

	if (empty($message)) {
		// Lecture des caracteristiques de la table
		$entete = true;
		while (($entete) && empty($message) && ($ligne = fgets($fImport, 4096)) !== false) {
			$numDeLigne++;
			$rang = explode($sep,$ligne);
//print_r($rang);
			if ("Nom" == $rang[0]) {
				if ((count($rang) < 2) || (empty($rang[1]))) {
					$message .= "La ligne Nom doit avoir au moins 2 colonnes! ";
				} else {
					$nomDuTiroir = $rang[1];
				}
			} else if ("Description" == $rang[0]) {
				if (count($rang) < 2) {
					$message .= "La ligne Description doit avoir au moin 2 colonnes! ";
 
				} else {
					$description = $rang[1];
				}
			} else if ("Photo" == $rang[0]) {
				if ((count($rang) < 2) || (("0" != $rang[1]) && ("1" != $rang[1]))) {
					$message .= "La ligne Photo doit avoir au moin 2 colonnes! ";
 
				} else {
					$avecPhoto = $rang[1];
				}
			} else if ("Commerce" == $rang[0]) {
				if ((count($rang) < 2) || (("0" != $rang[1]) && ("1" != $rang[1]))) {
					$message .= "La ligne Commerce doit avoir au moin 2 colonnes! ";
 
				} else {
					$avecCommerce = $rang[1];
				}
			} else if ("Champs" == $rang[0]) {
				// Lecture du nom des champs
				if (($ligne = fgets($fImport, 4096)) !== false) {
					$numDeLigne++;
					$nomDesChamps = explode($sep,$ligne);
//print_r($nomDesChamps);
					if (1 > count($nomDesChamps)) {
						$message .= "Il faut au moins un nom de champ! ";
					}
				} else {
					$message .= "Apres la ligne Champs il doit y avoir une ligne avec les noms des champs suivie d'une ligne avec les types de ces champs! ";
				}
				// Lecture du type des champs
				if (($ligne = fgets($fImport, 4096)) !== false) {
					$numDeLigne++;
					$typeDesChamps = explode($sep,$ligne);
//print_r($typeDesChamps);
					if (count($nomDesChamps) != count($typeDesChamps)) {
						$message .= "Il faut autant de type de champ que de nom! ";
					}
					foreach ($typeDesChamps as $type){
						if (!typeDeChampEstValide(trim($type))) {
							$message .= "Le type ".$type." n'est pas valide. ";
						}
					}
				} else {
					$message .= "Apres la ligne Champs il doit y avoir une ligne avec les noms des champs suivie d'une ligne avec les types de ces champs! ";
				}
				if (count($nomDesChamps) != count($typeDesChamps)) {
					$message .= "Apres la ligne Champs il doit y avoir une ligne avec les noms des champs suivie d'une ligne avec les types de ces champs! ";
				} else {
					$nbDeChamps = count($nomDesChamps);
					$element = array_shift($nomDesChamps);
					$element = array_shift($typeDesChamps);
				}
				$entete = false;
			} else {
				$message .= "Il manque Nom, Photo ou Champs. ";
				$entete = false;
			}
		}
	}

	if (empty($message)) {
		// Verification des lignes obligatoires
		if (empty($nomDuTiroir)) {
			$message = "Une ligne avec Nom est obligatoire. ";
		} else {
			// Vérifier que la base n'existe pas pour cet utilisateur
			foreach ($DB_utilisateurs->bases as $table){
				if ($table["Nom"] == $nomDuTiroir) { $message = "Le tiroir ".$nomDuTiroir." existe déjà."; }
			}
		}
		if (empty($nomDesChamps)) {
			$message .= "Apres la ligne Champs il doit y avoir une ligne avec les noms des champs suivie d'une ligne avec les types de ces champs! ";
		}
	}
//echo "<br/>";
//print_r($nomDesChamps);
//print_r($typeDesChamps);
	if (empty($message)) {
		// Lecture des donnees de la table
		while (empty($messag) && ($ligne = fgets($fImport, 4096)) !== false) {
			$numDeLigne++;
			$rang = explode($sep,$ligne);
			if (count($rang) == $nbDeChamps) {
				$messageValidation = champEstValide($rang[0], "TEXTE", "Nom");
				for ($i = 1; $i < $nbDeChamps; $i++) {
					$messageValidation .= champEstValide(trim($rang[$i]), $typeDesChamps[$i-1], $nomDesChamps[$i-1]);
					if (!empty($messageValidation)) {
						$message .= "Ligne ".$numDeLigne.", colonne ".($i+1)." : ".$rang[$i]." : ".$messageValidation;
					}
				}
				if (empty($messageValidation)) {
					$listeDesDonnees[] = $rang;
				}
			} else {
				$message = "A la ligne ".$numDeLigne." il doit y avoir autan d'element (".count($rang).") que de champs (".$nbDeChamps."). ";
			}
		}
	}

	if (empty($message)) {
		// Créer la nouvelle table
		$lesChamps = [];
		$unChamp = [];
		$index = 0;
		foreach ($nomDesChamps as $nom){
			$unChamp["nom"] = $nom;
			$unChamp["type"] = $typeDesChamps[$index];
			$index++;
			$lesChamps[] = $unChamp;
		}
		$message = $DB_utilisateurs->creerTable($nomDuTiroir, $description, $lesChamps, $avecPhoto, $avecCommerce);
		if (empty($message)) {
			$identifiant = $DB_utilisateurs->derniereTable;
			$lesTiroirs = new Tiroir();
			foreach ($listeDesDonnees as $rang){
				if (count($rang) == $nbDeChamps) {
					$objetDansTable = [];
					$objetDansTable["Nom"] = $rang[0];
					$objetDansTable["Creation"] = date('Y-m-d H:i:s');
					$objetDansTable["MiseAJour"] = date('Y-m-d H:i:s');
					$objetDansTable["supprimer"] = 0;
					for ($i = 1; $i < $nbDeChamps; $i++) {
						if ("DATE" == $typeDesChamps[$i-1]) {
							$objetDansTable["ch".($i-1)] = convertirDate($rang[$i]);
						} else {
							$objetDansTable["ch".($i-1)] = $rang[$i];
						}
					}
					$message .= $lesTiroirs->creerObjet($DB_utilisateurs->id, $identifiant, "", $objetDansTable);
				} else {
					$message .= "Le nombre de champ de la ligne ".$numDeLigne." est invalide";
				}
			}
		} else {
			$message .= "Impossible de creer le tiroir! ";
		}
	}

	// Construire la réponse et la retourner
	$reponse = array (
		"pseudo" => $utilisateur,
		"page" => "IMP",
		"cle" => $laCle,
		"erreur" => $message,
		"id" => $identifiant,
		"table" => "");
	echo json_encode($reponse, JSON_INVALID_UTF8_SUBSTITUTE|JSON_PRESERVE_ZERO_FRACTION|JSON_UNESCAPED_LINE_TERMINATORS|JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);

?>
