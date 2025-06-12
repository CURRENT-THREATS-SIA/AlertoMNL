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
    $input = json_decode(file_get_contents('php://input'), true);
    $alert_id = $_POST['alert_id'] ?? $input['alert_id'] ?? null;
    $police_id = $_POST['police_id'] ?? $input['police_id'] ?? null;
    $resolved_at = date('Y-m-d H:i:s');

    if ($alert_id && $police_id) {
        $conn->begin_transaction();
        try {
            // Update sosalert status
            $stmt1 = $conn->prepare("UPDATE sosalert SET a_status = 'resolved' WHERE alert_id = ?");
            $stmt1->bind_param('i', $alert_id);
            $stmt1->execute();
            $stmt1->close();

            // Update assignment status (optional)
            $stmt2 = $conn->prepare("UPDATE sosofficerassignments SET status = 'resolved', resolved_at = ? WHERE alert_id = ? AND police_id = ?");
            $stmt2->bind_param('sii', $resolved_at, $alert_id, $police_id);
            $stmt2->execute();
            $stmt2->close();

            // Optionally insert into history table here
            // ...

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