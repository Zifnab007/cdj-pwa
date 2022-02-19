<?php
/*
*
* -------------------------------------------------------
* CLASSNAME:        Utilisateur
* GENERATION DATE:  09/11/2007
* CLASS FILE:       class.utilisateur.php
* -------------------------------------------------------
*
*/
include_once($PATH_INCLUDE."class.table.php");
include_once($PATH_INCLUDE."class.tiroir.php");


// **********************
// CLASS DECLARATION
// **********************

class Utilisateurs extends table
{ // class : begin

	var $bases;
	var $derniereTable;
	var $id;
	var $pseudo;
	var $config;

  // **********************
  // ATTRIBUTE DECLARATION
  // **********************

  // Cette classe utilise une table avec les champs suivants:
  //  Id (entier, auto-indent)
  //  Nom (chaine de caractères)
  //  Email (chaine de caractères)
  //  Pass (chaine de caractères)
  //  Cle (chaine de caractères)
  //  Actif (boolean)

	// **********************
	// CONSTRUCTOR METHOD
	// **********************
	function __construct()
	{
		parent::__construct("utilisateur");
		$this->bases = array();
		$this->derniereTable = 0;
		$this->id = 0;
		$this->pseudo = 0;
		$this->config = array();
	}

	function pseudoDejaDefini($pseudo)
	{
		return ($this->isPresent("Nom",$pseudo));
	}

	function emailDejaDefini($email)
	{
		return ($this->isPresent("Email",$email));
	}

	function estValide($pseudo, $mdp)
	{
		$utilisateurValide = FALSE;
		if ($this->isPresent("Nom",$pseudo)) {
			if ( $this->selectByReference("Nom",$pseudo) ) {
				$utilisateurValide = password_verify($mdp, $this->data["Pass"]);
			}
		}
		return $utilisateurValide;
	}

	function estActif($pseudo)
	{
		$utilisateurActif = FALSE;
		if ($this->isPresent("Nom",$pseudo)) {
			if ( $this->selectByReference("Nom",$pseudo) ) {
				$utilisateurActif = $this->data["Actif"];
			}
		}
		return $utilisateurActif;
	}

	function estConnecte($pseudo, $cle)
	{
		$utilisateurValide = FALSE;
		if ($this->isPresent("Nom",$pseudo)) {
			if ( $this->selectByReference("Nom",$pseudo) ) {
				$utilisateurValide = ($cle == $this->data["Cle"]);
			}
		}
		return $utilisateurValide;
	}

	function validerConfig($config)
	{
		$message = "";
		return $message;
	}

	function mettreAJourCle($pseudo)
	{
		$laCle = "";
		if ( $this->selectByReference("Nom",$pseudo) ) {
			$laCle = md5(uniqid(rand(), true));
			$lUtilisateur = array();
			$lUtilisateur['Cle'] = $laCle;
			$this->update("Nom",$pseudo,$lUtilisateur);
		}
		return $laCle;
	}

	function mettreAJourConfig($pseudo, $config)
	{
		$message = "";
		if ( $this->selectByReference("Nom",$pseudo) ) {
			$message = $this->validerConfig($config);
			if ("" == $message) {
				$lUtilisateur = array();
				$lUtilisateur['Config'] = json_encode($Config);
				$this->update("Nom",$pseudo,$lUtilisateur);
			}
		} else {
			$message = "Le pseudo n'existe pas.";
		}
		return $message;
	}

	function creerUtilisateur($pseudo, $email, $motDePasse, $config)
	{
		$message = "";
		if ($this->pseudoDejaDefini($pseudo)) {
			$message = "L'utilisateur ".$utilisateur." existe déjà";
		} else if ($this->emailDejaDefini($email)) {
			$message = "L'adresse mail ".$cwemailutilisateur." existe déjà";
		} else {
			$message = $this->validerConfig($config);
			if ("" == $message) {
				$lUtilisateur = array();
				$lUtilisateur['Nom'] = $pseudo;
				$lUtilisateur['Email'] = $email;
				// Encoder le mot de passe
				$lUtilisateur['Pass'] = password_hash($motDePasse, PASSWORD_DEFAULT);
				$lUtilisateur['Cle'] = md5(uniqid(rand(), true));
				$lUtilisateur['Actif'] = FALSE;
				$lUtilisateur['Config'] = json_encode($config);
				if ($this->insert($lUtilisateur)) {
					if (!$this->selectByReference("Nom", $pseudo)) {
						$message = "Erreur interne à la lecture de la database.";
					};
				} else {
					$message = "Erreur interne d'insertion dans la database.";
				}
			}
		}
		return $message;
	}

	function lireUtilisateur($pseudo)
	{
		$message = "";
		if ($this->selectByReference("Nom", $pseudo)) {
			$this->id = $this->data["id"];
			$this->pseudo = $pseudo;
			$this->config = json_decode($this->data["Config"]);
			$lesbases = new table("base");
			if ($lesbases->selectByReference("Ecrivain", $this->data["id"])) {
				$this->bases[] = $lesbases->data;
				$index = 1;
				while (($index < TABLE_MAX) && $lesbases->selectNext()) {
					$index++;
					$this->bases[] = $lesbases->data;
				}
			} else {
				$this->bases = [];
			}
		} else {
			$message = "L'utilisateur n'est pas défini.";
		}
		return $message;
	}

	function creerTable($nomDuTiroir, $lesChamps)
	{
		$message = "";
		if (empty($this->id) || empty($this->pseudo)) {
			$message = "L'utilisateur n'est pas séléctionné";
		} else {
			$tiroir = new Tiroir();
			$message = $tiroir->creerTiroir($this->id, $nomDuTiroir, $lesChamps);
			if (empty($message)) {
				$this->derniereTable = $tiroir->id;
			}
		}
		return $message;
	}

} // class : end

?>
