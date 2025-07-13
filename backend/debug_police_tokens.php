<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = "fdb1028.awardspace.net";
$user = "4642576_crimemap";
$password = "@CrimeMap_911";
$dbname = "4642576_crimemap";

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $conn = new mysqli($host, $user, $password, $dbname);
    if ($conn->connect_error) {
        echo json_encode(['success' => false, 'error' => 'Database connection failed']);
        exit();
    }
    
    // Check police users and their tokens
    $sql = "SELECT police_id, f_name, l_name, expoPushToken, 
            CASE 
                WHEN expoPushToken IS NULL THEN 'NULL'
                WHEN expoPushToken = '' THEN 'EMPTY'
                WHEN expoPushToken = 'null' THEN 'STRING_NULL'
                ELSE 'VALID'
            END as token_status
            FROM policeusers 
            ORDER BY police_id";
    
    $result = $conn->query($sql);
    $police_users = [];
    $stats = [
        'total_police' => 0,
        'with_valid_tokens' => 0,
        'with_null_tokens' => 0,
        'with_empty_tokens' => 0
    ];
    
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $stats['total_police']++;
            
            switch ($row['token_status']) {
                case 'VALID':
                    $stats['with_valid_tokens']++;
                    break;
                case 'NULL':
                    $stats['with_null_tokens']++;
                    break;
                case 'EMPTY':
                case 'STRING_NULL':
                    $stats['with_empty_tokens']++;
                    break;
            }
            
            $police_users[] = [
                'police_id' => $row['police_id'],
                'name' => $row['f_name'] . ' ' . $row['l_name'],
                'expoPushToken' => $row['expoPushToken'],
                'token_status' => $row['token_status'],
                'token_preview' => $row['expoPushToken'] ? substr($row['expoPushToken'], 0, 20) . '...' : 'N/A'
            ];
        }
    }
    
    echo json_encode([
        'success' => true,
        'stats' => $stats,
        'police_users' => $police_users,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
    $conn->close();
} else {
    echo json_encode(['success' => false, 'error' => 'GET request required']);
}
?> 