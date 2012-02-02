<?php
# Use to automatically load in data into TILE

$host='http://'.$_SERVER['HTTP_HOST'].$_SERVER['PHP_SELF'];
$prefix=preg_replace('/plugins\/AutoLoad\/autoLoadConfig\.php/','',$host);
// $prefix=preg_replace('/\//','\/',$prefix);

# SET DEFAULT SCRIPT HERE
$DEFAULT_SCRIPT=$prefix."/plugins/CoreData/importDataScript.php?file=http://localhost:8080/fedora/objects/islandora%3A898/datastreams/TILE_JSON/content";
$DEFAULT_SCRIPT=$prefix."/plugins/CoreData/importDataScript.php?file=" . $_GET['file'];
echo $DEFAULT_SCRIPT;

?>