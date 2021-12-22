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
                if ($leTiroir->selectAll()) {
                        $this->data = $leTiroir->data;
                        $this->objets[] = $leTiroir->data;
                        $index = 1;
                        while (($index < TABLE_MAX) && $leTiroir->selectNext()) {
                                $index++;
                                $this->objets[] = $lesbases->data;
                        }
                } else {
                        $message = "Le tiroir n'est pas lisible.";
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
                $laTable['Structure'] = json_encode($lesChamps, JSON_INVALID_UTF8_SUBSTITUTE);
                if ($lesbases->insert($laTable)) {
                        $champ = [];
                        $this->id = mysqli_insert_id($lesbases->database->link);
                        $nouvelleTable = new table($this->nom($idUtilisateur, $this->id));
                        $champs[] = array( "nom" => "Nom", "type" => "TEXT");
                        $champs[] = array( "nom" => "Creation", "type" => "DATETIME");
                        $champs[] = array( "nom" => "MiseAJour", "type" => "DATETIME");
                        $champs[] = array( "nom" => "Photo", "type" => "TEXT");
                        $champs[] = array( "nom" => "supprimer", "type" => "BOOLEAN");
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
