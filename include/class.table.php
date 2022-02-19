<?php
/*
*
* -------------------------------------------------------
* CLASSNAME:        table
* GENERATION DATE:  09/11/2007
* CLASS FILE:       class.table.php
* -------------------------------------------------------
*
* **********************
* Funtion definition
* **********************
* isPresent
* filterContain
* filterEqual
* filterUpper
* filterLower
* filterEmpty
* filterNotEmpty
* filterNotEqual
* filterAnd
* defineOrder
* defineLimit
* defineJoin
* selectAll
* selectByReference
* selectWhere
* selectNext
* deleteByReference
* insert
* update
*   $refName     : 
*   $refValue    : 
*   $fieldsValue : 
* updateOrInsert
* get_db_stat

*/


// **********************
// CLASS DECLARATION
// **********************

class table
{ // class : begin

  // **********************
  // ATTRIBUTE DECLARATION
  // **********************

  var $data;
  var $mode;

  var $database; // Instance of class database
  var $maTable;
  var $nbOfField;
  var $fieldName;

  var $order;
  var $join;
  var $limit;






  // **********************
  // CONSTRUCTOR METHOD
  // **********************
  function __construct($nomDeLaTable)
  {

    $this->database = Database::GetInstance();
    $this->maTable = $nomDeLaTable;
    $this->order = "";
    $this->join = "";
    $this->mode = MYSQLI_ASSOC;

  }

  // **********************
  // ISREF
  // **********************

  function exist()
  {


	  $Exist = FALSE;
	  $sql =  "SHOW TABLES LIKE  '$this->maTable';";

	  if ($this->database->query($sql))  {

		  $Result = $this->database->result;
		  $Exist = ($data = mysqli_fetch_array($Result, $this->mode));
		  mysqli_free_result($Result);

	  }

	  return $Exist;
  }

  function isPresent($fieldName, $reference)
  {


	  $IsPresent = FALSE;
	  $sql =  "SELECT * FROM $this->maTable WHERE ".mysqli_real_escape_string($this->database->link, $fieldName)." = '".mysqli_real_escape_string($this->database->link, $reference)."';";

	  if ($this->database->query($sql))  {

		  $Result = $this->database->result;
		  $IsPresent = FALSE;
		  $IsPresent = ($data = mysqli_fetch_array($Result, $this->mode));
		  mysqli_free_result($Result);

	  }

	  return $IsPresent;

  }

  function filterContain($fieldName, $value)
  {

    if (("" == $fieldName) || ("" == $value)) { return ""; };

    return "".mysqli_real_escape_string($this->database->link, $fieldName).""." LIKE "."\"%".mysqli_real_escape_string($this->database->link, $value)."%\"";

  }

  function filterEqual($fieldName, $value)
  {

    if (("" == $fieldName) || ("" == $value)) { return ""; };

    return "(".mysqli_real_escape_string($this->database->link, $fieldName)." = '".mysqli_real_escape_string($this->database->link, $value)."')";

  }

  function filterNotEqual($fieldName, $value)
  {

    if (("" == $fieldName) || ("" == $value)) { return ""; };

    return "(".mysqli_real_escape_string($this->database->link, $fieldName)." != '".mysqli_real_escape_string($this->database->link, $value)."')";

  }

  function filterUpper($fieldName, $value)
  {

    if (("" == $fieldName) || ("" == $value)) { return ""; };

    return "".mysqli_real_escape_string($this->database->link, $fieldName).""." >= "."\"".mysqli_real_escape_string($this->database->link, $value)."\"";

  }

  function filterLower($fieldName, $value)
  {

    if (("" == $fieldName) || ("" == $value)) { return ""; };

    return "".mysqli_real_escape_string($this->database->link, $fieldName).""." <= "."\"".mysqli_real_escape_string($this->database->link, $value)."\"";

  }

  function filterEmpty($fieldName)
  {

    if ("" == $fieldName) { return ""; };

    return "".mysqli_real_escape_string($this->database->link, $fieldName)." IS NULL";

  }

  function filterNotEmpty($fieldName)
  {

    if ("" == $fieldName) { return ""; };

    return "".mysqli_real_escape_string($this->database->link, $fieldName)." IS NOT NULL";

  }

  function filterAnd()
  {

    $newFilter = "";
    $numargs = func_num_args();

    if ($numargs > 0) {
      $arg_list = func_get_args();
      for ($i = 0; $i < $numargs; $i++) {
        if ("" != $arg_list[$i])
        {
          if ("" == $newFilter)
          {
            $newFilter = "(".$arg_list[$i].")";
          } else {
            $newFilter = $newFilter." and (".$arg_list[$i].")";
          }
        }
      }
    }

    return $newFilter;

  }

  function defineOrder()
  {

    $this->order = "";
    $numargs = func_num_args();

    if ($numargs > 0) {
      $arg_list = func_get_args();
      for ($i = 0; $i < $numargs; $i++) {
        if ("" != $arg_list[$i])
        {
          if ("" == $this->order)
          {
            $this->order = " ORDER BY ".$arg_list[$i];
          } else {
            $this->order = $this->order." , ".$arg_list[$i];
          }
        }
      }
    } else {
      $this->order = "";
    }

  }

  function defineLimit ($limit)
  {
    if (empty($limit))
    {
       $this->limit = "";
    } else {
       $this->limit = " LIMIT $limit ";
    }
  }

  function defineJoin ($fieldName, $joinTableName, $joinFieldName)
  {
    $this->join = "LEFT JOIN $joinTableName ON $this->maTable.$fieldName = $joinTableName.$joinFieldName";
  }

  // **********************
  // SELECT METHOD / LOAD
  // **********************

  function selectAll()
  {

    $sql =  "SELECT * FROM $this->maTable $this->join $this->order $this->limit;";
    $Existe = FALSE;

    if ($this->database->query($sql)) {
    	$Exist = ($this->data = mysqli_fetch_array($this->database->result, $this->mode));

	if (! $Exist)
	{
		mysqli_free_result($this->database->result);
	}

    }

    return $Exist;

  }

  function selectByReference($fieldName, $value)
  {

    $LocalFilter = $this->filterEqual($this->maTable.".".$fieldName, $value);
    $sql =  "SELECT * FROM $this->maTable $this->join WHERE $LocalFilter $this->order $this->limit;";
    $Exist = FALSE;
    if ($this->database->query($sql)) {
	    $Exist = ($this->data = mysqli_fetch_array($this->database->result, $this->mode));
    }

    if (! $Exist) { mysqli_free_result($this->database->result); }
    return $Exist;

  }

  function selectWhere($filter)
  {

    $sql =  "SELECT * FROM $this->maTable $this->join WHERE $filter $this->order $this->limit;";
    $Exist = FALSE;
    if ($this->database->query($sql)) {
	    $Exist = ($this->data = mysqli_free_result($this->database->result));
    }

    if (! $Exist) { mysqli_free_result($this->database->result); }
    return $Exist;

  }

  function selectNext()
  {

    $Exist = FALSE;
    if ($this->data = mysqli_fetch_array($this->database->result, $this->mode)) {
	    $Exist = TRUE;
    } else {
	    mysqli_free_result($this->database->result);
    }
    return $Exist;

  }

  // **********************
  // DELETE
  // **********************

  function deleteByReference($fieldName, $value)
  {

    $sql = "DELETE FROM $this->maTable WHERE ".mysqli_real_escape_string($this->database->link, $fieldName)." = ".mysqli_real_escape_string($this->database->link, $value).";";
    $result = $this->database->query($sql);

  }

  // **********************
  // INSERT
  // **********************

  function insert($fieldsValue)
  {
      $DataValueStr = "";
      $DataFieldStr = "";
      foreach ($fieldsValue as $cle => $valeur)
      {
        if ($DataFieldStr == "")
        {
          $DataFieldStr = mysqli_real_escape_string($this->database->link, $cle);
          $DataValueStr = "'".mysqli_real_escape_string($this->database->link, $valeur)."'";
        } else {
          $DataFieldStr = $DataFieldStr." , ".mysqli_real_escape_string($this->database->link, $cle);
          $DataValueStr = $DataValueStr." , '".mysqli_real_escape_string($this->database->link, $valeur)."'";
        }
      }
      $sql = "INSERT INTO $this->maTable ( $DataFieldStr ) VALUES ( $DataValueStr )";
      $report = $this->database->query($sql);
      return $report;
  }

  // **********************
  // UPDATE
  // **********************

  function update($refName, $refValue, $fieldsValue)
  {

    $DataUpdStr = "";
    foreach ($fieldsValue as $cle => $valeur)
    {
      if ($DataUpdStr == "")
      {
        $DataUpdStr = mysqli_real_escape_string($this->database->link, $cle)." = '".mysqli_real_escape_string($this->database->link, $valeur)."'";
      } else {
        $DataUpdStr = $DataUpdStr." , ".mysqli_real_escape_string($this->database->link, $cle)." = '".mysqli_real_escape_string($this->database->link, $valeur)."'";
      }
    } 
    $LocalFilter = $this->filterEqual($refName, $refValue);
    $sql = " UPDATE $this->maTable SET $DataUpdStr WHERE $LocalFilter;";
    $this->database->query($sql);

  }

  // **********************
  // UPDATE / INSERT
  // **********************

  function updateOrInsert($refName, $refValue, $fieldsValue)
  {

    if ($this->selectByReference($refName, $refValue))
    {
      $this->update($refName, $refValue, $fieldsValue);
    } else {
      $this->insert($fieldsValue);
    }

  }

  // **********************
  // CREATE
  // **********************

  function create($fields)
  {
	  $sql = " CREATE TABLE `".$this->maTable."` ( `id` INT NOT NULL AUTO_INCREMENT ";
	  foreach ($fields as $value) {
		  if ("DATE" == $value["type"]) {
			  $type = "datetime DEFAULT NULL";
		  } else if ("ENTIER" == $value["type"]) {
			  $type = "int(11) DEFAULT NULL";
		  } else if ("TEXTE" == $value["type"]) {
			  $type = "text CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL";
		  } else if ("BOOLEEN" == $value["type"]) {
			  $type = "tinyint(1) DEFAULT 0";
		  } else {
			  $type = "tinyint(1) DEFAULT 0";
		  }
		$sql = $sql.", `".$value["nom"]."` ".$type." ";
	  }
	  $sql = $sql.", PRIMARY KEY (`id`)) ENGINE = MyISAM;";
	  return $this->database->query($sql);
  }

  function get_db_stat($filter = "")
  {

    if ("" != $filter) {$filter = " WHERE ".$filter; };

    $sql = "SELECT COUNT(*) FROM $this->maTable $this->join $filter $this->limit";

    $existe = FALSE;
    if ($this->database->query($sql)) {

    	$existe = ($row = mysqli_fetch_row($this->database->result, $this->mode));
	mysqli_free_result($this->database->result);

    }

    if ( !($existe) )
	{
		return "<B> erreur interne </B>";
	}

    return $row[0];
	
  }

} // class : end

?>
