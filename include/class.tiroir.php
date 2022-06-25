<?php
/*
*
* -------------------------------------------------------
* CLASSNAME:        Tiroir
* GENERATION DATE:  09/11/2007
* CLASS FILE:       class.tiroir.php
* -------------------------------------------------------
*
*/
include_once($PATH_INCLUDE."class.table.php");

// **********************
// CLASS DECLARATION
// **********************

class Tiroir
{ // class : begin

        var $objets;
        var $id;
	var $dernierObjetId;

  // **********************
  // ATTRIBUTE DECLARATION
  // **********************

        // **********************
        // CONSTRUCTOR METHOD
        // **********************
        function __construct()
        {
                $this->objets = [];
                $this->id = 0;
		$this->dernierObjetId = 0;
        }

        function nom($idUtilisateur, $idTiroir) {
                return "u".$idUtilisateur."_t".$idTiroir;
        }

        function lireTiroir($idUtilisateur, $idTiroir)
        {
                $message = "";
                $this->objets = [];
                $this->id = 0;
                $leTiroir = new table($this->nom($idUtilisateur, $idTiroir));
		if ($leTiroir->exist()) {
                	if ($leTiroir->selectAll()) {
                        	$this->objets[] = $leTiroir->data;
                        	$index = 1;
                        	while (($index < ELEMENT_MAX) && $leTiroir->selectNext()) {
                                	$index++;
                                	$this->objets[] = $leTiroir->data;
                        	}
			}
		} else {
			$message = "Le tiroir ".$idTiroir." n'existe pas.";
                }
                return $message;
        }

        function photoDUnObjet($idUtilisateur, $idTiroir, $idObjet)
	{
		$photo = "";
                $leTiroir = new table($this->nom($idUtilisateur, $idTiroir));
		if ($leTiroir->exist()) {
			if ($leTiroir->selectByReference('id', $idObjet)) {
				if (isset ($leTiroir->data['Photo'])) {
					$photo = $leTiroir->data['Photo'];
				}
			}
		}
		return $photo;
	}

	// Aussi bien utilise pour creer ou mettre a jour
        function creerObjet($idUtilisateur, $idTiroir, $idObjet, $objet)
        {
                $message = "";
                $this->objets = [];
                $this->id = 0;
                $leTiroir = new table($this->nom($idUtilisateur, $idTiroir));
		if ($leTiroir->exist()) {
			if (empty($idObjet)) {
				if ($leTiroir->insert($objet)) {
                        		$this->dernierObjetId = mysqli_insert_id($leTiroir->database->link);
				} else {
                			$message = "Imposible de creer un objet.";
				}
			} else if ($leTiroir->isPresent("id", $idObjet)) {
                		if ($leTiroir->update("id", $idObjet, $objet)) {
                        		$this->dernierObjetId = $idObjet;
				} else {
                			$message = "Imposible de mettre a jour l'objet ".$idObjet.".";
				}
			} else {
                		$message = "L'objet ".$idObjet." n'existe pas.";
			}
		} else {
			$message = "Le tiroir ".$idTiroir." n'existe pas.";
                }
                return $message;
        }

	function supprimerObjet($idUtilisateur, $idTiroir, $idObjet)
        {
                $message = "";
                $leTiroir = new table($this->nom($idUtilisateur, $idTiroir));
		if ($leTiroir->exist()) {
			if (empty($idObjet)) {
                		$message = "L'objet ".$idObjet." n'existe pas.";
			} else {
				if ($leTiroir->deleteByReference("id", $idObjet)) {
                        		$this->dernierObjetId = 0;
				} else {
                			$message = "Imposible de supprimer un objet.";
				}
			}
		} else {
			$message = "Le tiroir ".$idTiroir." n'existe pas.";
                }
                return $message;
	}

        function creerTiroir($idUtilisateur, $nomDuTiroir, $decription, $lesChamps, $avecPhoto, $avecCommerce)
        {
                $message = "";
                $lesbases = new table("base");
                $laTable = array();
                $laTable['Nom'] = $nomDuTiroir;
                $laTable['Ecrivain'] = $idUtilisateur;
                $laTable['Creation'] = date('Y-m-d H:i:s');
                $laTable['MiseAJour'] = date('Y-m-d H:i:s');
                $laConfig['structure'] = $lesChamps;
                $laConfig['photo'] = $avecPhoto;
                $laConfig['commerce'] = $avecCommerce;
                $laTable['Configuration'] = json_encode($laConfig, JSON_INVALID_UTF8_SUBSTITUTE|JSON_PRESERVE_ZERO_FRACTION|JSON_UNESCAPED_LINE_TERMINATORS|JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);
                $laTable['Description'] = $decription;
                if ($lesbases->insert($laTable)) {
                        $champ = [];
                        $this->id = mysqli_insert_id($lesbases->database->link);
                        $nouvelleTable = new table($this->nom($idUtilisateur, $this->id));
                        $champs[] = array( "nom" => "Nom", "type" => "TEXTE");
                        $champs[] = array( "nom" => "Creation", "type" => "DATETIME");
                        $champs[] = array( "nom" => "MiseAJour", "type" => "DATETIME");
                        $champs[] = array( "nom" => "Photo", "type" => "TEXTE");
                        $champs[] = array( "nom" => "supprimer", "type" => "BOOLEEN");
                        $index = 0;
                        foreach ($lesChamps as $value) {
                                $champs[] = array( "nom" => "ch".$index, "type" => $value["type"]);
                                $index++;
                        }
                        if ($nouvelleTable->create($champs)) {
                        	$this->dernierObjetId = 0;
			} else {
                                $message = "Erreur de creation de la table";
                        }
                } else {
                        $message = "Erreur interne lors de la declaration dans Base";
                }
                return $message;
        }

} // class : end

?>
