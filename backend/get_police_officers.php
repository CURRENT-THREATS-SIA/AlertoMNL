<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
$host = "fdb1028.awardspace.net";
$user = "4642576_crimemap";
$password = "@CrimeMap_911";
$dbname = "4642576_crimemap";
$conn = new mysqli($host, $user, $password, $dbname);

$result = $conn->query("SELECT police_id, first_name, last_name FROM police");
$officers = [];
while ($row = $result->fetch_assoc()) {
    $officers[] = $row;
}
echo json_encode(['success' => true, 'officers' => $officers]);
$conn->close();
?> 