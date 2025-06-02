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
$sql = "SELECT nuser_id, password FROM normalusers WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    if (password_verify($password_input, $row['password'])) {
        echo json_encode([
            "success" => true,
            "user_type" => "regular",
            "nuser_id" => $row['nuser_id'],
            "message" => "Login successful"
        ]);
        $stmt->close();
        $conn->close();
        exit();
    }
}
$stmt->close();

// Try police user
$sql = "SELECT police_id, password FROM policeusers WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    if (password_verify($password_input, $row['password'])) {
        echo json_encode([
            "success" => true,
            "user_type" => "police",
            "police_id" => $row['police_id'],
            "message" => "Login successful"
        ]);
        $stmt->close();
        $conn->close();
        exit();
    }
}
$stmt->close();
$conn->close();
echo json_encode(["success" => false, "message" => "Invalid credentials"]);
?> 