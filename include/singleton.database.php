<?php
/*
*
* MARCO VOEGELI 31.12.2005
* www.voegeli.li
*
* This class provides one central database-connection for
* al your php applications. Define only once your connection
* settings and use it in all your applications.
*
*
*/

  
class Database
{ // Class : begin
 
  var $host;  		//Hostname, Server
  var $password; 	//Passwort MySQL
  var $user; 		//User MySQL
  var $database; 	//Datenbankname MySQL
  var $DBDisponible;
  var $link;
  var $query;
  var $result;
  var $rows;
 
  function Database()
  { // Method : begin
    //Konstruktor
 
    function singleton_lock() {
    } 

 
    // ********** DIESE WERTE ANPASSEN **************
    // ********** ADJUST THESE VALUES HERE **********
 
    $this->host = "localhost";                  //          <<---------
    $this->password = 'mon password';           //          <<---------
    $this->user = "mon user";                   //          <<---------
    $this->database = "ma database";           //          <<---------
    $this->rows = 0;

    // **********************************************
    // **********************************************
 
    $this->OpenLink();
    $this->SelectDB();
  
  }
 
  function &GetInstance() {
    static $instance = array();
    if ( ! count( $instance ) ) { $instance[0] = new Database(); };
    return $instance[0];
  }

  function OpenLink()
  {
	  if ($this->link = @mysql_connect($this->host,$this->user,$this->password))
	  { 
		  $this->DBDisponible = TRUE;
	  }
	  else 
	  { 
		  $this->DBDisponible = FALSE;
		  print "Class Database OpenLink : Error while connecting to DB.";
		  // print "Class Database OpenLink : Error while connecting to DB (".mysql_error().")";
	  }
  }
 
  function SelectDB()
  {

	  if ($this->DBDisponible) {

		  if (!@mysql_select_db($this->database,$this->link)) {
			  $this->DBDisponible = FALSE;
			  print "Class Database select: Error while selecting DB.";
			  // print "Class Database select: Error while selecting DB (".mysql_error().")";
		  }
	  }
  
  }
 
  function CloseDB()
  {
    // mysql_close();
  }
 
  function Query($query)
  {
	  if ($this->DBDisponible) {

		  $this->query = $query;
		  $this->result = @mysql_query($query,$this->link) or die (print "Class Database: Error while executing Query $query");
		  return TRUE;

	  } else {

		  $this->query = "";
		  $this->result = "";
		  return FALSE;

	  }
 
  }
  
}
 
?>
