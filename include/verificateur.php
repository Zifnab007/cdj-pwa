<?php
/*
* -------------------------------------------------------
* FONCTION: Ensemble de focntion pour valider les donn
* -------------------------------------------------------
 */

function mdpEstValide($mdp) {
	$message = "";
	if (1 === preg_match("/^[ -~]{6,32}$/", $mdp)) {
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

function champEstValide($valeur, $type, $nom) {
	$message = "";

	if ("ENTIER" == $type) {
		if (1 === preg_match("/^[0-9]{0,10}$/", $valeur)) {
			$message = "";
		} else {
			$message = "Le champ \"".$nom."\" n'est pas valide. ";
		}
	}

        return $message;
}
