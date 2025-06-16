<?php
header('Content-Type: application/json');
require_once 'db_connect.php'; // Make sure this file sets up $conn (MySQLi)

$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['police_id'], $data['alert_id'], $data['lat'], $data['lng'])) {
    echo json_encode(['success' => false, 'error' => 'Missing required fields.']);
    exit;
}
$police_id = intval($data['police_id']);
$alert_id = intval($data['alert_id']);
$lat = floatval($data['lat']);
$lng = floatval($data['lng']);

// Upsert location (insert or update if exists for this police_id + alert_id)
$stmt = $conn->prepare("INSERT INTO police_locations (police_id, alert_id, latitude, longitude, updated_at)
    VALUES (?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE latitude = VALUES(latitude), longitude = VALUES(longitude), updated_at = NOW()");
$stmt->bind_param('iidd', $police_id, $alert_id, $lat, $lng);
if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => $stmt->error]);
}
$stmt->close();
$conn->close();
