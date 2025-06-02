<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Content-Type: application/json");

// Database credentials
$host = "localhost";
$user = "root";
$password = ""; // (or whatever password you set)
$dbname = "crimemap";

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "POST request required"]);
    exit();
}

// Get POST data
$email = isset($_POST['email']) ? $_POST['email'] : null;
$password_input = isset($_POST['password']) ? $_POST['password'] : null;

if (!$email || !$password_input) {
    echo json_encode(["success" => false, "message" => "Email and password are required"]);
    exit();
}

// Connect to database
$conn = new mysqli($host, $user, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]);
    exit();
}

// Try normal user first
$sql = "SELECT * FROM normalusers WHERE email = ? AND password = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $email, $password_input);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode(["success" => true, "user_type" => "regular", "message" => "Login successful"]);
    $stmt->close();
    $conn->close();
    exit();
}
$stmt->close();

// Try police user
$sql = "SELECT * FROM policeusers WHERE email = ? AND password = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $email, $password_input);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode(["success" => true, "user_type" => "police", "message" => "Login successful"]);
} else {
    echo json_encode(["success" => false, "message" => "Invalid credentials"]);
}
$stmt->close();
$conn->close();
?>