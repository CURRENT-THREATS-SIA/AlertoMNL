<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header('Content-Type: application/json');

$host = "fdb1028.awardspace.net";
$user = "4642576_crimemap";
$password = "@CrimeMap_911";
$dbname = "4642576_crimemap";
$conn = new mysqli($host, $user, $password, $dbname);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Accept both form data and JSON
    $input = json_decode(file_get_contents('php://input'), true);
    $alert_id = $_POST['alert_id'] ?? $input['alert_id'] ?? null;
    $police_id = $_POST['police_id'] ?? $input['police_id'] ?? null;
    $assigned_at = date('Y-m-d H:i:s');

    if ($alert_id && $police_id) {
        // Start transaction
        $conn->begin_transaction();
        try {
            // Insert into sosofficerassignments
            $stmt1 = $conn->prepare("INSERT INTO sosofficerassignments (alert_id, police_id, assigned_at, status) VALUES (?, ?, ?, 'assigned')");
            $stmt1->bind_param('iis', $alert_id, $police_id, $assigned_at);
            $stmt1->execute();
            $stmt1->close();

            // Update sosalert status
            $stmt2 = $conn->prepare("UPDATE sosalert SET a_status = 'active' WHERE alert_id = ?");
            $stmt2->bind_param('i', $alert_id);
            $stmt2->execute();
            $stmt2->close();

            // Insert notification for the police officer
            $stmt3 = $conn->prepare("INSERT INTO notifications (police_id, title, description) VALUES (?, ?, ?)");
            $title = "Crime Incident Alert";
            $description = "A new crime incident has been assigned to you. Alert ID: $alert_id";
            $stmt3->bind_param('iss', $police_id, $title, $description);
            $stmt3->execute();
            $stmt3->close();

            $conn->commit();
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            $conn->rollback();
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    } else {
        echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
}
$conn->close();
?> 