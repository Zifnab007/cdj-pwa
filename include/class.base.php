
<?php
/*
*
* -------------------------------------------------------
* CLASSNAME:        Utilisateur
* GENERATION DATE:  09/11/2007
* CLASS FILE:       class.base.php
* -------------------------------------------------------
*
*/
include_once($PATH_INCLUDE."class.table.php");


// **********************
// CLASS DECLARATION
// **********************

class Bases extends table
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
		parent::__construct("base");
	}

	function dejaDefini($nom)
	{
		return ($this->isPresent("Nom",$nom));
	}

} // class : end

?>
