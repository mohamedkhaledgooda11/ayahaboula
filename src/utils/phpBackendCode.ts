export const CONFIG_PHP_CODE = `<?php
/**
 * Beauty Salon Aya Haboula - Backend Configuration & PDO Engine
 * Strict Cairo Timezone & UTF-8 Arabized Storage
 */

date_default_timezone_set('Africa/Cairo');

// Database Connection Constants
define('DB_HOST', getenv('DB_HOST') ?: '127.0.0.1');
define('DB_PORT', getenv('DB_PORT') ?: '3306');
define('DB_NAME', getenv('DB_NAME') ?: 'beauty_salon_aya');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');

function formatArabicCairoDateNow($timestamp = null) {
    $time = $timestamp ? (is_numeric($timestamp) ? $timestamp : strtotime($timestamp)) : time();
    $days = ['Sunday'=>'الأحد','Monday'=>'الإثنين','Tuesday'=>'الثلاثاء','Wednesday'=>'الأربعاء','Thursday'=>'الخميس','Friday'=>'الجمعة','Saturday'=>'السبت'];
    $months = [1=>'يناير',2=>'فبراير',3=>'مارس',4=>'أبريل',5=>'مايو',6=>'يونيو',7=>'يوليو',8=>'أغسطس',9=>'سبتمبر',10=>'أكتوبر',11=>'نوفمبر',12=>'ديسمبر'];

    $dayNameAr = $days[date('l', $time)] ?? date('l', $time);
    $dayNum = date('j', $time);
    $monthNameAr = $months[(int)date('n', $time)] ?? date('F', $time);
    $yearNum = date('Y', $time);
    $hour12 = date('g', $time);
    $minute = date('i', $time);
    $amPm = date('A', $time) === 'PM' ? 'م' : 'ص';

    return "{$dayNameAr}، {$dayNum} {$monthNameAr} {$yearNum} - {$hour12}:{$minute} {$amPm}";
}

function sendJsonResponse($status, $data = null, $message = '', $httpCode = 200) {
    http_response_code($httpCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'status' => $status,
        'message' => $message,
        'data' => $data,
        'timestamp' => formatArabicCairoDateNow()
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

function getDbConnection() {
    static $pdo = null;
    if ($pdo !== null) return $pdo;
    try {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        ];
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
    } catch (PDOException $e) {
        return null;
    }
}
`;

export const API_PHP_CODE = `<?php
/**
 * Beauty Salon Aya Haboula - Dual-Engine REST Controller (api.php)
 */
require_once __DIR__ . '/backend-php/config.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$rawInput = file_get_contents('php://input');
$jsonInput = json_decode($rawInput, true) ?: [];
$requestData = array_merge($_GET, $_POST, $jsonInput);
$action = $requestData['action'] ?? ($_GET['action'] ?? '');
$pdo = getDbConnection();

// Auto forward to Google Sheets with 302 follow
function forwardOrderToGoogleSheet($sheetUrl, $orderData) {
    if (empty($sheetUrl)) return false;
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $sheetUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['action' => 'addOrder', 'order' => $orderData]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json; charset=utf-8']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    $res = curl_exec($ch);
    curl_close($ch);
    return $res;
}
`;

export const SCHEMA_SQL_CODE = `-- ============================================================
-- Beauty Salon Aya Haboula - MySQL Database Schema
-- ============================================================
CREATE DATABASE IF NOT EXISTS \`beauty_salon_aya\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`beauty_salon_aya\`;

CREATE TABLE IF NOT EXISTS \`orders\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`order_code\` VARCHAR(50) NOT NULL UNIQUE,
    \`cairo_date\` VARCHAR(150) NOT NULL,
    \`customer_name\` VARCHAR(150) NOT NULL,
    \`phone1\` VARCHAR(30) NOT NULL,
    \`phone2\` VARCHAR(30) DEFAULT NULL,
    \`governorate\` VARCHAR(100) NOT NULL,
    \`branch\` VARCHAR(100) NOT NULL,
    \`address\` TEXT NOT NULL,
    \`package_id\` VARCHAR(50) NOT NULL,
    \`package_name\` VARCHAR(150) NOT NULL,
    \`package_price\` DECIMAL(10,2) NOT NULL,
    \`add_hair_wash\` TINYINT(1) DEFAULT 0,
    \`hair_wash_price\` DECIMAL(10,2) DEFAULT 0.00,
    \`selected_shade\` VARCHAR(150) DEFAULT NULL,
    \`won_prize\` VARCHAR(200) DEFAULT NULL,
    \`deposit_amount\` DECIMAL(10,2) NOT NULL DEFAULT 150.00,
    \`remaining_amount\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    \`total_price\` DECIMAL(10,2) NOT NULL,
    \`notes\` TEXT DEFAULT NULL,
    \`status\` VARCHAR(50) NOT NULL DEFAULT 'deposit_pending',
    \`synced_to_sheet\` TINYINT(1) DEFAULT 0,
    \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX \`idx_order_code\` (\`order_code\`),
    INDEX \`idx_phone1\` (\`phone1\`),
    INDEX \`idx_status\` (\`status\`),
    INDEX \`idx_created\` (\`created_at\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;
