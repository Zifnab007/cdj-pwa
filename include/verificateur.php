<?php
/*
* -------------------------------------------------------
* FONCTION: Ensemble de focntion pour valider les donn
* -------------------------------------------------------
 */

function mdpEstValide($mdp) {
	$message = "";
	if (1 === preg_match("/^[0-9abcdef]{64}$/", $mdp)) {
		$message = "";
	} else {
		$message = "Le mot de passe \"".$mdp."\" n'est pas valide. ";
		return $message;
	}
}

function pseudoEstValide($pseudo) {
	$message = "";
	if (1 === preg_match("/^[A-Za-z0-9- ]{4,32}$/", $pseudo)) {
		$message = "";
	} else {
		$message = "Le pseudo \"".$pseudo."\" n'est pas valide. ";
	}
        return $message;
}

function emailEstValide($email) {
	$message = "";
	if (1 === preg_match("/^(([^<>()[]\.,;:s@]+(.[^<>()[]\.,;:s@]+)*)|(.+))@(([[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}])|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$/", $email)) {
		$message = "";
	} else {
		$message = "L'adresse e-mail \"".$email."\" n'est pas valide. ";
	}
        return $message;
}

function typeDeChampEstValide($valeur) {
	if (("BOOLEEN" == $valeur) ||
	    ("CODE_POSTAL" == $valeur) ||
	    ("DATETIME" == $valeur) ||
	    ("DATE" == $valeur) ||
	    ("ENTIER" == $valeur) ||
	    ("FLOTTANT" == $valeur) ||
	    ("LAT" == $valeur) ||
	    ("LONG" == $valeur) ||
       	    ("TEXTE" == $valeur)) {
		return true;
	} else {
		return false;
	}
                  

}

function champEstValide($valeur, $type, $nom) {
	$message = "";

	if ("CODE_POSTAL" == $type) {
		if (empty($valeur) || (1 === preg_match("/^[0-9]{5,5}$/", $valeur))) {
			$message = "";
		} else {
			$message = "Le champ CODE_POSTAL \"".$nom."\" n'est pas valide. ";
		}
	}

	/*
	* -------------------------------------------------------
	* La date est verifee syntaximent AAAA/MM/JJ
	* AAAA = 1000 .. 2999
	* MM = 01 .. 12
	* JJ = 01 .. 31
	* Suivit d'une verfication sementique:
	* 2022/02/29 n'est pas valide
	* 2024/02/29 est valide
	* -------------------------------------------------------
 	*/
	if ("DATE" == $type) {
		if (!empty($valeur) && (1 === preg_match("/^([012][0-9]|30|31)\/(0[1-9]|10|11|12)\/[1-9][0-9]{3}$/", $valeur))) {
			$dateTable = explode("/", $valeur);
			if (checkdate($dateTable[1], $dateTable[0], $dateTable[2])) {
				try {
					$date = new DateTime($dateTable[2]."/".$dateTable[1]."/".$dateTable[0]);
					if (false === $date) {
						$message = "Dans le champ DATE \"".$nom."\", la date ".$valeur." n'est pas valide.<br/>";
			 		}
				} catch (Exception $e) {
					$message = "Dans le champ DATE \"".$nom."\", la date ".$valeur." n'est pas valide (exception interne).<br/>";
				}
			} else {
				$message = "Dans le champ DATE \"".$nom."\", la date ".$valeur." n'existe pas.<br/>";
			}
		} else if (!empty($valeur)) {
			$message = "Dans le champ DATE \"".$nom."\", la date ".$valeur."  n'est pas syntaxiquement correcte.<br/>";
		}
	}

	if ("ENTIER" == $type) {
		if (1 === preg_match("/^[0-9]{0,10}$/", $valeur)) {
			$message = "";
		} else {
			$message = "Le champ ENTIER \"".$nom."\" n'est pas valide. ";
		}
	}

	if ("FLOTTANT" == $type) {
		if (1 === preg_match("/^[0-9]{0,10}\,[0-9]{0,10}$/", $valeur)) {
			$message = "";
		} else {
			$message = "Le champ FLOTTANT \"".$nom."\" n'est pas valide. ";
		}
	}

	if ("LAT" == $type) {
		if (empty($valeur) || (1 === preg_match("/^\-{0,1}(([1-8]{0,1}[0-9]{1})\,[0-9]{1,10}|90,0)$/", $valeur))) {
			$message = "";
		} else {
			$message = "Le champ LAT \"".$nom."\" n'est pas valide. ";
		}
	}

	if ("LONG" == $type) {
		if (empty($valeur) || (1 === preg_match("/^\-{0,1}(((1{1}[0-7]{0,1}|[1-8]{0,1})[0-9]{1})\,[0-9]{1,10}|180,0)$/", $valeur))) {
			$message = "";
		} else {
			$message = "Le champ LONG \"".$nom."\" n'est pas valide. ";
		}
	}

        return $message;
}

function convertirDate ($dateFR) {
	$dateEN = "";
	$dateTable = explode("/", $dateFR);
	if (3 == count($dateTable)) {
		$dateEN = $dateTable[2]."/".$dateTable[1]."/".$dateTable[0];
	}
	return $dateEN;
}
