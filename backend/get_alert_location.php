<?php
header('Content-Type: application/json');
require_once '../db_connection.php'; // Adjust path as needed

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
    exit;
}

$alert_id = isset($_GET['alert_id']) ? $_GET['alert_id'] : null;
if (!$alert_id) {
    echo json_encode(['success' => false, 'error' => 'Missing alert_id']);
    exit;
}

$conn = getDbConnection();
$stmt = $conn->prepare('SELECT a_latitude, a_longitude FROM sosalert WHERE alert_id = ?');
$stmt->bind_param('i', $alert_id);
$stmt->execute();
$stmt->bind_result($latitude, $longitude);
if ($stmt->fetch()) {
    echo json_encode(['success' => true, 'latitude' => $latitude, 'longitude' => $longitude]);
} else {
    echo json_encode(['success' => false, 'error' => 'Alert not found']);
}
$stmt->close();
$conn->close(); 