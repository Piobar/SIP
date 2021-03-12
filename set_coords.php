<?php

require 'config.php';
$server     = 'localhost';
$username   = 'root';
$password   = '';
$database   = 'db';
$port       = '3306';
$dsn        = "mysql:host=$server;port=$port;dbname=$database";
try {

    $db = new PDO($dsn, $username, $password);
    $db->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );

    $sth = $db->prepare("UPDATE locations SET lat = ?, lon = ? WHERE id = ?");
    if ($sth->execute(array($_GET['lat'], $_GET['lon'], $_GET['id'])))
        echo "OK";

} catch (Exception $e) {
    echo $e->getMessage();
}