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

  }

  // **********************
  // ISREF
  // **********************

  function isPresent($fieldName, $reference)
  {


	  $IsPresent = FALSE;
	  $sql =  "SELECT * FROM $this->maTable WHERE $fieldName = '$reference';";

	  if ($this->database->query($sql))  {

		  $Result = $this->database->result;
		  $IsPresent = FALSE;
		  $IsPresent = ($data = mysqli_fetch_object($Result));
		  mysqli_free_result($Result);

	  }

	  return $IsPresent;

  }

  function filterContain($fieldName, $value)
  {

    if (("" == $fieldName) || ("" == $value)) { return ""; };

    return "".$fieldName.""." LIKE "."\"%".$value."%\"";

  }

  function filterEqual($fieldName, $value)
  {

    if (("" == $fieldName) || ("" == $value)) { return ""; };

    return "(".$fieldName.""." = "."'".$value."')";

  }

  function filterNotEqual($fieldName, $value)
  {

    if (("" == $fieldName) || ("" == $value)) { return ""; };

    return "(".$fieldName.""." != "."'".$value."')";

  }

  function filterUpper($fieldName, $value)
  {

    if (("" == $fieldName) || ("" == $value)) { return ""; };

    return "".$fieldName.""." >= "."\"".$value."\"";

  }

  function filterLower($fieldName, $value)
  {

    if (("" == $fieldName) || ("" == $value)) { return ""; };

    return "".$fieldName.""." <= "."\"".$value."\"";

  }

  function filterEmpty($fieldName)
  {

    if ("" == $fieldName) { return ""; };

    return "".$fieldName." IS NULL";

  }

  function filterNotEmpty($fieldName)
  {

    if ("" == $fieldName) { return ""; };

    return "".$fieldName." IS NOT NULL";

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
    	$Existe = ($this->data = mysqli_free_result($this->database->result));

	if (! $Existe)
	{
		mysqli_free_result($this->database->result);
	}

    }

    return $Existe;

  }

  function selectByReference($fieldName, $value)
  {

    $LocalFilter = $this->filterEqual($fieldName, $value);
    $sql =  "SELECT * FROM $this->maTable $this->join WHERE $LocalFilter $this->order $this->limit;";
    $Exist = FALSE;
    if ($this->database->query($sql)) {
	    $Exist = ($this->data = mysqli_fetch_object($this->database->result));
	    mysqli_free_result($this->database->result);
    }

    return $Exist;

  }

  function selectWhere($filter)
  {

    $sql =  "SELECT * FROM $this->maTable $this->join WHERE $filter $this->order $this->limit;";
    $Existe = FALSE;
    if ($this->database->query($sql)) {
	    $Exist = ($this->data = mysqli_free_result($this->database->result));
    }

    if (! $Exist)
    {
      mysqli_free_result($this->database->result);
    }
    return $Exist;

  }

  function selectNext()
  {

    $Existe = FALSE;
    if ($this->data = mysqli_free_result($this->database->result)) {
	    $Existe = TRUE;
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

    $sql = "DELETE FROM $this->maTable WHERE $fieldName = $value;";
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
          $DataFieldStr = $cle;
          $DataValueStr = "'".$valeur."'";
        } else {
          $DataFieldStr = $DataFieldStr." , ".$cle;
          $DataValueStr = $DataValueStr." , '".$valeur."'";
        }
      }
      $sql = "INSERT INTO $this->maTable ( $DataFieldStr ) VALUES ( $DataValueStr )";
      return ($this->database->query($sql));
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
        $DataUpdStr = $cle." = '".$valeur."'";
      } else {
        $DataUpdStr = $DataUpdStr." , ".$cle." = '".$valeur."'";
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

  function get_db_stat($filter = "")
  {

    if ("" != $filter) {$filter = " WHERE ".$filter; };

    $sql = "SELECT COUNT(*) FROM $this->maTable $this->join $filter $this->limit";

    $existe = FALSE;
    if ($this->database->query($sql)) {

    	$existe = ($row = mysqli_fetch_row($this->database->result));
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
