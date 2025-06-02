<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Content-Type: application/json");

// Database credentials
$host = "fdb1028.awardspace.net";
$user = "4642576_crimemap";
$password = "@CrimeMap_911";
$dbname = "4642576_crimemap";

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "POST request required"]);
    exit();
}

// Required fields
$required = ['f_name', 'l_name', 'm_number', 'email', 'password', 'badge_number', 'station_name'];
foreach ($required as $field) {
    if (empty($_POST[$field])) {
        echo json_encode(["success" => false, "message" => "$field is required"]);
        exit();
    }
}

$f_name = $_POST['f_name'];
$l_name = $_POST['l_name'];
$m_number = $_POST['m_number'];
$email = $_POST['email'];
$password_input = $_POST['password'];
$badge_number = $_POST['badge_number'];
$station_name = $_POST['station_name'];

// Hash the password
$hashed_password = password_hash($password_input, PASSWORD_DEFAULT);

// Connect to database
$conn = new mysqli($host, $user, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]);
    exit();
}

// Check if email already exists
$check = $conn->prepare("SELECT police_id FROM policeusers WHERE email = ?");
$check->bind_param("s", $email);
$check->execute();
$check->store_result();
if ($check->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Email already registered"]);
    $check->close();
    $conn->close();
    exit();
}
$check->close();

// Insert new police user
$sql = "INSERT INTO policeusers (f_name, l_name, m_number, email, password, badge_number, station_name) VALUES (?, ?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sssssss", $f_name, $l_name, $m_number, $email, $hashed_password, $badge_number, $station_name);

if ($stmt->execute()) {
    $police_id = $stmt->insert_id;
    echo json_encode([
        "success" => true,
        "police_id" => $police_id,
        "user_type" => "police",
        "message" => "Signup successful"
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Signup failed"]);
}

$stmt->close();
$conn->close();
?> 