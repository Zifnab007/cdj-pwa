<?php
    header('Access-Control-Allow-Origin: *');
    header('Content-Type: application/json; charset: UTF-8');

    $str = <<<STR
[
  {
    "id": 1,
    "node_id": "MDEwfjBuglfJaXRvcnk2NjEwNDg2Mw==",
    "name": "Tissu",
    "icon": "images/icons/icon-96x96.png",
    "html_url": "https://github.com/EmmanuelDemey/10K-Project",
    "description": null,
    "created_at": "2016-08-19T18:46:12Z",
    "updated_at": "2016-10-09T12:08:54Z"
  },
  {
    "id": 2,
    "node_id": "MDEwOlJlcG9zaXRvcnk2NjEwNDg2Mw==",
    "name": "Médaille",
    "icon": "images/icons/icon-96x96.png",
    "html_url": "https://github.com/EmmanuelDemey/10K-Project",
    "description": "Médailles de la Monnaie de Paris",
    "created_at": "2016-08-19T18:46:12Z",
    "updated_at": "2016-10-09T12:08:54Z"
  },
  {
    "id": 3,
    "node_id": "dhgsvFkbvdyoaXRvcnk2NjEwNDg2Mw==",
    "name": "Bière",
    "icon": "images/icons/icon-96x96.png",
    "html_url": "https://github.com/EmmanuelDemey/10K-Project",
    "description": "Bières bues ou à boire",
    "created_at": "2016-08-19T18:46:12Z",
    "updated_at": "2016-10-09T12:08:54Z"
  }
]
STR;

    echo $str;

?>
