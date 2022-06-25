<?php
/*
*
* -------------------------------------------------------
* CLASSNAME:        Commerce
* GENERATION DATE:  09/11/2007
* CLASS FILE:       class.tiroir.php
* -------------------------------------------------------
*
*/
include_once($PATH_INCLUDE."class.table.php");
include_once($PATH_INCLUDE."class.tiroir.php");
include_once($PATH_INCLUDE."verificateur.php");

// **********************
// CLASS DECLARATION
// **********************

class Commerce extends Tiroir
{ // class : begin

	// Les fonctions:
	//  formaterCommerce
        //  lireCommerce

	// **********************
	// ATTRIBUTE DECLARATION
	// **********************
        var $commerces;
        // var $objets;
        // var $id;

        // **********************
        // CONSTRUCTOR METHOD
        // **********************
        function __construct()
        {
                parent::__construct();
		$this->commerces = [];
        }

	function formaterCommerce ($commerce){
		$unCommerce["id"] = $commerce["id"];
		$unCommerce["nom"] = $commerce["Nom"];
		$unCommerce["code"] = $commerce["ch1"];
		$unCommerce["lat"] = $commerce["ch2"];
		$unCommerce["long"] = $commerce["ch3"];
		return $unCommerce;
	}

        function creerLesTablesCommerce($idUtilisateur)
        {

		// Créer la table des commerces
		$lesChamps = [];
		$lesChamps[] = array( "nom" => 'Type de commerce', "type" => 'LISTE');
		$lesChamps[] = array( "nom" => 'Code postal', "type" => 'CODE_POSTAL');
		$lesChamps[] = array( "nom" => 'Lat', "type" => 'LAT');
		$lesChamps[] = array( "nom" => 'Long', "type" => 'LONG');
		$lesChamps[] = array( "nom" => 'Commentaire', "type" => 'PARAGRAPHE');
		$lesChamps[] = array( "nom" => 'URL', "type" => 'TEXTE');
		$message = $this->creerTiroir($idUtilisateur, 'Commerces', 'Liste des commerces qui peuvent être référencés par les objets des tiroirs', $lesChamps, 1, 0);

		// Creer la table de jointure
		if (empty($message)) {
          		$nouvelleTable = new table($this->nom($idUtilisateur, 'jointure'));
			$lesChamps = array();
			$lesChamps[] = array( "nom" => 'Commerce', "type" => 'ENTIER');
			$lesChamps[] = array( "nom" => 'Tiroir', "type" => 'LISTE');
			$lesChamps[] = array( "nom" => 'Objet', "type" => 'ENTIER');
			$lesChamps[] = array( "nom" => 'Prix', "type" => 'FLOTTANT');
			$lesChamps[] = array( "nom" => 'Unitee', "type" => 'LISTE');
			$lesChamps[] = array( "nom" => 'Date', "type" => 'DATE');
			if (!$nouvelleTable->create($lesChamps)) {
				$message = "Erreur interne à la création de la table de jointure.";
			}
		}


                return $message;
        }

        function lireCommerce($idUtilisateur, $idTiroir)
        {
                $this->commerces = [];
                $message = $this->lireTiroir($idUtilisateur, $idTiroir);

		if (empty($message)) {
			foreach ($this->objets as $objet){
				$this->commerces[] = $this->formaterCommerce ($objet);
			}
		}
                return $message;
        }

        function lierCommerce($idUtilisateur, $idTiroir, $idCommerce, $idObjet, $prix, $unitee, $date)
        {

                $message = "";
          	$jointure = new table($this->nom($idUtilisateur, 'jointure'));
		$lien = array();
		$lien['Commerce'] = $idCommerce;
		$lien['Tiroir'] = $this->nom($idUtilisateur, $idTiroir);
		$lien['Objet'] = $idObjet;
		$lien['Prix'] =  str_replace(',', '.', $prix);
		$lien['Unitee'] = $unitee;
		$lien['Date'] = convertirDate($date);

		if (!$jointure->insert($lien)) {
			$message = "Erreur interne: Imposible de mettre à jour la jointure";
		}

                return $message;
        }

        function supprimerLien($idUtilisateur, $idTiroir, $idObjet)
        {

                $message = "";
          	$jointure = new table($this->nom($idUtilisateur, 'jointure'));
		$lesChamps = array(
			'Tiroir' => $this->nom($idUtilisateur, $idTiroir),
			'Objet' => $idObjet);

		if (!$jointure->deleteByFields($lesChamps)) {
			$message = "Erreur interne: Imposible de supprimer la jointure";
		}
                return $message;

	}

} // class : end

?>
