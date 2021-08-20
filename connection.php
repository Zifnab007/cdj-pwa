<?php
    header('Access-Control-Allow-Origin: *');
    header('Content-Type: application/json; charset: UTF-8');

    $str = <<<STR
{
    "cle": "99020c395a0b3a91f2879ba10d3e7684",
    "name": "Tissu",
    "updated_at": "2016-10-09T12:08:54Z"
}
STR;

    echo $str;

?>
