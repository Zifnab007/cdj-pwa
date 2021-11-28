
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


// **********************
// CLASS DECLARATION
// **********************

class Utilisateurs extends table
{ // class : begin


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
				$utilisateurValide = password_verify($mdp, $this->data->Pass);
			}
		}
		return $utilisateurValide;
	}

	function estActif($pseudo)
	{
		$utilisateurActif = FALSE;
		if ($this->isPresent("Nom",$pseudo)) {
			if ( $this->selectByReference("Nom",$pseudo) ) {
				$utilisateurActif = $this->data->Actif;
			}
		}
		return $utilisateurActif;
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

	function creerUtilisateur($pseudo, $email, $motDePasse)
	{
		$message = "";
		if ($this->pseudoDejaDefini($pseudo)) {
			$message = "L'utilisateur ".$utilisateur." existe déjà";
		} else if ($this->emailDejaDefini($email)) {
			$message = "L'adresse mail ".$cwemailutilisateur." existe déjà";
		} else {
			$lUtilisateur = array();
			$lUtilisateur['Nom'] = $pseudo;
			$lUtilisateur['Email'] = $email;
			// Encoder le mot de passe
			$lUtilisateur['Pass'] = password_hash($motDePasse, PASSWORD_DEFAULT);
			$lUtilisateur['Cle'] = md5(uniqid(rand(), true));
			$lUtilisateur['Actif'] = FALSE;
			if ($this->insert($lUtilisateur)) {
				if (!$this->selectByReference("Nom", $pseudo)) {
					$message = "Erreur interne à la lecture de la database.";
				};
			} else {
				$message = "Erreur interne d'insertion dans la database.";
			}
		}
		return $message;
	}

} // class : end

?>
