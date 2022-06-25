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
include_once($PATH_INCLUDE."class.commerce.php");


// **********************
// CLASS DECLARATION
// **********************

class Utilisateurs extends table
{ // class : begin

	var $bases;
	var $derniereTable;
	var $id;
	var $repertoire;
	var $pseudo;
	var $config;
	var $commerceId;

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

  // Les functions
  //  pseudoDejaDefini
  //  emailDejaDefini
  //  estValide
  //  estValide
  //  estActif
  //  estConnecte
  //  validerConfig
  //  mettreAJourCle
  //  mettreAJourConfig
  //  creerUtilisateur
  //  lireUtilisateur
  //  creerTable

	// **********************
	// CONSTRUCTOR METHOD
	// **********************
	function __construct()
	{
		parent::__construct("utilisateur");
		$this->bases = array();
		$this->derniereTable = 0;
		$this->id = 0;
		$this->repertoire = "/tmp/";
		$this->pseudo = 0;
		$this->config = array();
		$this->commerceId = 0;
	}

	function pseudoDejaDefini($pseudo)
	{
		return ($this->isPresent("Nom",$pseudo));
	}

	function emailDejaDefini($email)
	{
		return ($this->isPresent("Email",$email));
	}

	function estValide($pseudo, $mdp, $enClair)
	{
		$utilisateurValide = FALSE;
		if ($this->isPresent("Nom",$pseudo)) {
			if ( $this->selectByReference("Nom",$pseudo) ) {
				$motDePasse = "";
				if (!empty($enClair)) {
					$motDePasse = hash("sha256", $mdp);
				} else {
					$motDePasse = $mdp;
				}
				$utilisateurValide = password_verify($motDePasse, $this->data["Pass"]);
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
			if(!$this->update("Nom",$pseudo,$lUtilisateur)) {
				$laCle = "";
			}
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
				$lUtilisateur['Config'] = json_encode($config);
				if (!$this->update("Nom",$pseudo,$lUtilisateur)) {
					$message = "Erreur interne à la mise à jour.";
				}
			}
		} else {
			$message = "Le pseudo n'existe pas.";
		}
		return $message;
	}

	function creerUtilisateur($pseudo, $email, $motDePasse, $config, $enClair)
	{
		$message = "";
		if ($this->pseudoDejaDefini($pseudo)) {
			$message = "L'utilisateur ".$utilisateur." existe déjà";
		} else if ($this->emailDejaDefini($email)) {
			$message = "L'adresse mail ".$cwemailutilisateur." existe déjà";
		} else {
			$message = $this->validerConfig($config);

			// Création de l'urilisateur
			if (empty($message)) {
				$lUtilisateur = array();
				$lUtilisateur['Nom'] = $pseudo;
				$lUtilisateur['Email'] = $email;
				if (!empty($enClair)) {
					$motDePasse = hash("sha256", $motDePasse);
				}
				// Encoder le mot de passe
				$lUtilisateur['Pass'] = password_hash($motDePasse, PASSWORD_DEFAULT);
				$lUtilisateur['Cle'] = md5(uniqid(rand(), true));
				$lUtilisateur['Actif'] = "0";
				$lUtilisateur['Config'] = json_encode($config);
				if (!$this->insert($lUtilisateur)) {
					$message = "Erreur interne d'insertion dans la database.";
				}
			}

			// Creer le repertoire pour stoker les photos et la table de donnée des commerces
			if (empty($message)) {
				if ($this->selectByReference("Nom", $pseudo)) {
					// Verifier la creation et mettre a jour les attributs
					$this->id = $this->data["id"];
					$this->repertoire = "images/u".$this->id."/";
					$this->pseudo = $pseudo;
					$this->config = json_decode($this->data["Config"]);
					// Creer le repertoire pour stoker les photos
					if (!is_dir($this->repertoire)) {
						mkdir($this->repertoire);
					}
					// Creer la table de donnée des commerces
					$lesCommerces = new Commerce();
					$message = $lesCommerces->creerLesTablesCommerce($this->id);
					if (empty($message)) {
						$config['commerce'] = $lesCommerces->id;
					}
				} else {
					$message = "Erreur interne à la lecture de la database.";
				};
			};

			// Mettre à jour la config
			if (empty($message)) {
				$this->mettreAJourConfig($pseudo, $config);
			}
		}
		return $message;
	}

	function lireUtilisateur($pseudo)
	{
		$message = "";
		if ($this->selectByReference("Nom", $pseudo)) {
			$this->id = $this->data["id"];
			$this->repertoire = "images/u".$this->id."/";
			$this->pseudo = $pseudo;
			$this->config = json_decode($this->data["Config"], true);
			if (array_key_exists("commerce",$this->config)) {
				$this->commerceId = $this->config['commerce'];
			} else {
				$this->commerceId = 0;
			}
			$lesbases = new table("base");
			if ($lesbases->selectByReference("Ecrivain", $this->data["id"])) {
				$index = 1;
				$commerceBase = [];
				$prochaineBase = true;
				while (($index < TABLE_MAX) && $prochaineBase) {
					$index++;
					if ((!empty($this->commerceId)) && ($this->commerceId == $lesbases->data["id"])) {
						$commerceBase = $lesbases->data;
					} else {
						$this->bases[] = $lesbases->data;
					}
					$prochaineBase = $lesbases->selectNext();
				}
				if (!empty($commerceBase)) {
					$this->bases[] = $commerceBase;
				}
			} else {
				$this->bases = [];
			}
		} else {
			$message = "L'utilisateur n'est pas défini.";
		}
		return $message;
	}

	function creerTable($nomDuTiroir, $description, $lesChamps, $avecPhoto, $avecCommerce)
	{
		$message = "";
		if (empty($this->id) || empty($this->pseudo)) {
			$message = "L'utilisateur n'est pas séléctionné";
		} else {
			$tiroir = new Tiroir();
			$message = $tiroir->creerTiroir($this->id, $nomDuTiroir, $description, $lesChamps, $avecPhoto, $avecCommerce);
			if (empty($message)) {
				$this->derniereTable = $tiroir->id;
			}
		}
		return $message;
	}

} // class : end

?>
