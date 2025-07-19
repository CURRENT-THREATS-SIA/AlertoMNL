<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

try {
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON input');
    }
    
    // Validate required fields
    $required_fields = ['alert_id', 'viewed_by', 'viewed_at', 'record_type', 'action'];
    foreach ($required_fields as $field) {
        if (!isset($input[$field]) || empty($input[$field])) {
            throw new Exception("Missing required field: $field");
        }
    }
    
    // Database connection
    $host = 'localhost';
    $dbname = 'u123456789_alerto';
    $username = 'u123456789_alerto';
    $password = 'Alerto@2024';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create admin_activity_logs table if it doesn't exist
    $createTableSQL = "
    CREATE TABLE IF NOT EXISTS admin_activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        alert_id VARCHAR(50) NOT NULL,
        user_type VARCHAR(20) NOT NULL,
        user_identifier VARCHAR(100) NOT NULL,
        action_type VARCHAR(50) NOT NULL,
        record_type VARCHAR(50) NOT NULL,
        activity_timestamp DATETIME NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_alert_id (alert_id),
        INDEX idx_user_type (user_type),
        INDEX idx_action_type (action_type),
        INDEX idx_activity_timestamp (activity_timestamp)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    $pdo->exec($createTableSQL);
    
    // Insert the log entry
    $sql = "INSERT INTO admin_activity_logs (
        alert_id, 
        user_type, 
        user_identifier, 
        action_type, 
        record_type, 
        activity_timestamp, 
        ip_address, 
        user_agent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $input['alert_id'],
        'admin',
        $input['viewed_by'],
        $input['action'],
        $input['record_type'],
        $input['viewed_at'],
        $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Crime record view logged successfully',
        'log_id' => $pdo->lastInsertId()
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?> 