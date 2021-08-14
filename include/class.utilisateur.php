
<?php
/*
*
* -------------------------------------------------------
* CLASSNAME:        table
* GENERATION DATE:  09/11/2007
* CLASS FILE:       class.page.php
* -------------------------------------------------------
*
*/
include_once($PATH_INCLUDE."class.table.php");


// **********************
// CLASS DECLARATION
// **********************

class page extends table
{ // class : begin


  // **********************
  // ATTRIBUTE DECLARATION
  // **********************
  var $nbOfUpdate;
  var $creationDate;
  var $updateDate;
  var $lastLoadDate;

  // Cette classe utilise une table avec les champs suivants:
  //  NOM (chaine de caractères)
  //  CREATION (date)
  //  MISEAJOUR (date)
  //  ACCES (date)
  //  COMPTEUR (entier)

  // **********************
  // CONSTRUCTOR METHOD
  // **********************
  function page($tableName)
  {

    $this->table($tableName);

    $this->nbOfUpdate = 0;
    $this->creationDate = "";
    $this->updateDate = "";
    $this->lastLoadDate = "";

    if (isset ($_COOKIE['compte']))
    {
        echo '<div class="Debug ecran"><br /><br />Ce chargement n\'est pas compt&eacute; car vous &eacute;tes sur un PC administrateur<br /></div>';
    } else {
    	$maPage = "index";
    	if (isset ($_SERVER["QUERY_STRING"]) && (!empty ($_SERVER["QUERY_STRING"]))) {
	  $maPage = urldecode($_SERVER["QUERY_STRING"]);
	} else if (isset ($_SERVER["REQUEST_URI"]) && (!empty ($_SERVER["REQUEST_URI"]))) {
	  $maPage = $_SERVER["REQUEST_URI"];

    	}
	$this->loaded($maPage);
        echo '<div class="Debug"><br /><br />Cette page a &eacute;t&eacute; charg&eacute;e '.$this->nbOfUpdate.' fois.<br /></div>';
    }

  }

  // **********************
  // LOADED
  // **********************

  function loaded($pageName)
  {

    date_default_timezone_set('Europe/Paris');
    if ($this->isPresent("NOM",$pageName))
    {
       tracer("La page $pageName existe");
       // Lire le compteur et la date et les modifier
       if ( $this->selectByReference("NOM",$pageName) )
       {
          $MaPage = array();
          $lastLoadDate = strftime("%Y-%m-%d");
          $MaPage['acces'] = strftime("%Y-%m-%d");
          $MaPage['compteur'] = $this->data->compteur + 1;
          $this->update("nom",$pageName,$MaPage);
       } else {
          echo "erreur interne";
       }
    } else {
       tracer("La page $pageName n'existe pas");
       // Creer une entrée à la date courrante
       $MaPage = array();
       $MaPage['nom'] = $pageName;
       $MaPage['creation'] = strftime("%Y-%m-%d");
       $MaPage['miseajour'] = strftime("%Y-%m-%d");
       $MaPage['miseazero'] = strftime("%Y-%m-%d");
       $MaPage['acces'] = strftime("%Y-%m-%d");
       $MaPage['compteur'] = 1;
       $this->insert($MaPage);
    }
    $this->nbOfUpdate = $MaPage['compteur'];

  }

  function nouvelAcces($pageName)
  {
    if ($this->isPresent("NOM",$pageName))
    {
       tracer("La page $pageName existe");
       $MaPage = array();
       $MaPage['acces'] = strftime("%Y-%m-%d");
       $MaPage['compteur'] = $this->data->compteur + 1;
       $this->update("nom",$pageName,$MaPage);
    } else {
       echo "<BR>Erreur: La page n'existe pas.<BR>";
       tracer("La page $pageName n'existe pas");
    }
  }
  
  function miseAJour($pageName)
  {
    if ($this->isPresent("NOM",$pageName))
    {
       tracer("La page $pageName existe");
       $MaPage = array();
       $MaPage['miseajour'] = strftime("%Y-%m-%d");
       $this->update("nom",$pageName,$MaPage);
    } else {
       echo "<BR>Erreur: La page n'existe pas.<BR>";
       tracer("La page $pageName n'existe pas");
    }

  }

} // class : end

?>
