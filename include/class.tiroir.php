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
                        	while (($index < TABLE_MAX) && $leTiroir->selectNext()) {
                                	$index++;
                                	$this->objets[] = $leTiroir->data;
                        	}
			}
		} else {
			$message = "Le tiroir ".$idTiroir." n'existe pas.";
                }
                return $message;
        }

        function nouvelObjet($idUtilisateur, $idTiroir, $idObjet, $objet)
        {
                $message = "";
                $this->objets = [];
                $this->id = 0;
                $leTiroir = new table($this->nom($idUtilisateur, $idTiroir));
		if ($leTiroir->exist()) {
			if (empty($idObjet)) {
				if (!$leTiroir->insert($objet)) {
                			$message = "Imposible de creer un objet.";
				}
			} else if ($leTiroir->isPresent("id", $idObjet)) {
                		if ($leTiroir->update("id", $idObjet, $objet)) {
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

        function creerTiroir($idUtilisateur, $nomDuTiroir, $lesChamps)
        {
                $message = "";
                $lesbases = new table("base");
                $laTable = array();
                $laTable['Nom'] = $nomDuTiroir;
                $laTable['Ecrivain'] = $idUtilisateur;
                $laTable['Creation'] = date('Y-m-d H:i:s');
                $laTable['MiseAJour'] = date('Y-m-d H:i:s');
                $laTable['Structure'] = json_encode($lesChamps, JSON_INVALID_UTF8_SUBSTITUTE|JSON_PRESERVE_ZERO_FRACTION|JSON_UNESCAPED_LINE_TERMINATORS|JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);
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
                        if (!$nouvelleTable->create($champs)) {
                                $message = "Erreur de creation de la table";
                        }
                } else {
                        $message = "Erreur interne lors de la declaration dans Base";
                }
                return $message;
        }

} // class : end

?>
