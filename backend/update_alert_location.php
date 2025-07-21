<?php
header('Content-Type: application/json');
require_once '../db_connection.php'; // Adjust path as needed

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
    exit;
}

$alert_id = isset($_POST['alert_id']) ? $_POST['alert_id'] : null;
$latitude = isset($_POST['latitude']) ? $_POST['latitude'] : null;
$longitude = isset($_POST['longitude']) ? $_POST['longitude'] : null;

if (!$alert_id || !$latitude || !$longitude) {
    echo json_encode(['success' => false, 'error' => 'Missing parameters']);
    exit;
}

// Update the alert location in the sosalert table
$conn = getDbConnection();
$stmt = $conn->prepare('UPDATE sosalert SET a_latitude = ?, a_longitude = ? WHERE alert_id = ?');
$stmt->bind_param('ddi', $latitude, $longitude, $alert_id);
if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => $stmt->error]);
}
$stmt->close();
$conn->close(); 