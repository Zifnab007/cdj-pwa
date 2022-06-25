<?php
function formaterObjet ($objet, $structure, $repertoire){
	$unObjet["id"] = $objet["id"];
	$unObjet["nom"] = $objet["Nom"];
	$unObjet["created_at"] = $objet["Creation"];
	$unObjet["updated_at"] = $objet["MiseAJour"];
	if (empty($objet["Photo"])) {
		$unObjet["icone"] = "";
	} else {
		$unObjet["icone"] = "$repertoire".$objet['Photo'];
	}
	$unObjet["supprimer"] = $objet["supprimer"];
	$unObjet["record"] = [];
	$i = 0;
	foreach ($structure as $champ){
		$unObjet["record"][$champ->nom] = $objet["ch".$i];
		$i++;
	}
	return $unObjet;
}

?>
