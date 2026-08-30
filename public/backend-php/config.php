<?php
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

/**
 * Arabic Cairo Date Formatter
 * Format: [اسم اليوم]، [اليوم بالأرقام] [اسم الشهر بالعربية] [السنة] - [الساعة 12]:[الدقيقة] [ص/م]
 */
function formatArabicCairoDateNow($timestamp = null) {
    $time = $timestamp ? (is_numeric($timestamp) ? $timestamp : strtotime($timestamp)) : time();
    
    $days = [
        'Sunday' => 'الأحد',
        'Monday' => 'الإثنين',
        'Tuesday' => 'الثلاثاء',
        'Wednesday' => 'الأربعاء',
        'Thursday' => 'الخميس',
        'Friday' => 'الجمعة',
        'Saturday' => 'السبت'
    ];

    $months = [
        1 => 'يناير',
        2 => 'فبراير',
        3 => 'مارس',
        4 => 'أبريل',
        5 => 'مايو',
        6 => 'يونيو',
        7 => 'يوليو',
        8 => 'أغسطس',
        9 => 'سبتمبر',
        10 => 'أكتوبر',
        11 => 'نوفمبر',
        12 => 'ديسمبر'
    ];

    $dayNameEn = date('l', $time);
    $dayNameAr = $days[$dayNameEn] ?? $dayNameEn;
    
    $dayNum = date('j', $time);
    $monthNum = (int)date('n', $time);
    $monthNameAr = $months[$monthNum] ?? date('F', $time);
    $yearNum = date('Y', $time);
    
    $hour12 = date('g', $time);
    $minute = date('i', $time);
    $amPm = date('A', $time) === 'PM' ? 'م' : 'ص';

    return "{$dayNameAr}، {$dayNum} {$monthNameAr} {$yearNum} - {$hour12}:{$minute} {$amPm}";
}

/**
 * Standardized JSON Response
 */
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

/**
 * Get PDO Database Connection
 */
function getDbConnection() {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

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
        // If DB not found or offline, return null for fallback handling
        return null;
    }
}

/**
 * Auto-Migration on First Run
 */
function initDatabaseTables($pdo) {
    if (!$pdo) return false;

    try {
        // Create orders table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_code VARCHAR(50) NOT NULL UNIQUE,
                cairo_date VARCHAR(150) NOT NULL,
                customer_name VARCHAR(150) NOT NULL,
                phone1 VARCHAR(30) NOT NULL,
                phone2 VARCHAR(30) DEFAULT NULL,
                governorate VARCHAR(100) NOT NULL,
                branch VARCHAR(100) NOT NULL,
                address TEXT NOT NULL,
                package_id VARCHAR(50) NOT NULL,
                package_name VARCHAR(150) NOT NULL,
                package_price DECIMAL(10,2) NOT NULL,
                add_hair_wash TINYINT(1) DEFAULT 0,
                hair_wash_price DECIMAL(10,2) DEFAULT 0.00,
                selected_shade VARCHAR(150) DEFAULT NULL,
                won_prize VARCHAR(200) DEFAULT NULL,
                deposit_amount DECIMAL(10,2) NOT NULL DEFAULT 150.00,
                remaining_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                total_price DECIMAL(10,2) NOT NULL,
                notes TEXT DEFAULT NULL,
                status VARCHAR(50) NOT NULL DEFAULT 'deposit_pending',
                synced_to_sheet TINYINT(1) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_order_code (order_code),
                INDEX idx_phone1 (phone1),
                INDEX idx_status (status),
                INDEX idx_created (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // Create settings table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                setting_key VARCHAR(100) NOT NULL UNIQUE,
                setting_value TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // Seed default settings if empty
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM settings");
        $row = $stmt->fetch();
        if ($row && $row['count'] == 0) {
            $defaults = [
                'store_name' => 'Beauty Salon Aya Haboula',
                'salon_owner' => 'آية هبولة',
                'whatsapp_number' => '201286886296',
                'whatsapp_deposit_number' => '01286886296',
                'instapay_username' => '01286886296 / ayanailss',
                'deposit_amount' => '150',
                'hair_wash_price' => '100',
                'facebook_url' => 'https://www.facebook.com/profile.php?id=100076153371113',
                'google_sheet_url' => '',
                'meta_pixel_id' => '',
                'admin_password' => 'admin123'
            ];

            $insert = $pdo->prepare("INSERT INTO settings (setting_key, setting_value) VALUES (:key, :val)");
            foreach ($defaults as $k => $v) {
                $insert->execute([':key' => $k, ':val' => $v]);
            }
        }

        return true;
    } catch (Exception $e) {
        return false;
    }
}
