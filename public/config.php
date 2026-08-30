<?php
/**
 * ==============================================================================
 * صالون آية هبولة - ملف الإعدادات والاتصال بقاعدة البيانات MySQL
 * Aya Haboula Beauty Salon - PHP & MySQL Configuration (config.php)
 * ==============================================================================
 * يدعم PHP 7.4+ و PHP 8.x بالكامل مع حماية PDO وترميز UTF-8 وتوقيت القاهرة
 */

// 1. ضبط التوقيت الصارم على توقيت القاهرة
date_default_timezone_set('Africa/Cairo');

// 2. إعدادات الاتصال بقاعدة بيانات MySQL
// (قم بتعديل هذه القيم لتناسب بيانات قاعدة البيانات في Hostinger hPanel)
define('DB_HOST', getenv('DB_HOST') ?: '127.0.0.1');
define('DB_PORT', getenv('DB_PORT') ?: '3306');
define('DB_NAME', getenv('DB_NAME') ?: 'beauty_salon_aya');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');

// 3. رابط شيت جوجل التلقائي (Webhook URL) للمزامنة المزدوجة (اختياري)
define('GOOGLE_SHEET_URL', getenv('GOOGLE_SHEET_URL') ?: '');

// 4. كلمة سر لوحة الإدارة الافتراضية
define('ADMIN_PASSWORD', getenv('ADMIN_PASSWORD') ?: 'admin123');

/**
 * دالة الاتصال الآمن بقاعدة البيانات عبر PDO
 * @return PDO|null
 */
function getDbConnection() {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    try {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        ];
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
    } catch (PDOException $e) {
        error_log("Database Connection Error: " . $e->getMessage());
        return null;
    }
}

/**
 * دالة صياغة التاريخ والوقت العربي بتوقيت القاهرة
 */
function formatArabicCairoDateNow($timestamp = null) {
    $time = $timestamp ? (is_numeric($timestamp) ? $timestamp : strtotime($timestamp)) : time();

    $days = [
        'Sunday'    => 'الأحد',
        'Monday'    => 'الإثنين',
        'Tuesday'   => 'الثلاثاء',
        'Wednesday' => 'الأربعاء',
        'Thursday'  => 'الخميس',
        'Friday'    => 'الجمعة',
        'Saturday'  => 'السبت'
    ];

    $months = [
        1  => 'يناير',
        2  => 'فبراير',
        3  => 'مارس',
        4  => 'أبريل',
        5  => 'مايو',
        6  => 'يونيو',
        7  => 'يوليو',
        8  => 'أغسطس',
        9  => 'سبتمبر',
        10 => 'أكتوبر',
        11 => 'نوفمبر',
        12 => 'ديسمبر'
    ];

    $dayName = $days[date('l', $time)] ?? date('l', $time);
    $dayNum = date('j', $time);
    $monthName = $months[(int)date('n', $time)] ?? date('F', $time);
    $yearNum = date('Y', $time);
    $hour12 = date('g', $time);
    $minute = date('i', $time);
    $amPm = date('A', $time) === 'PM' ? 'م' : 'ص';

    return "{$dayName}، {$dayNum} {$monthName} {$yearNum} - {$hour12}:{$minute} {$amPm}";
}

/**
 * إرسال استجابة JSON موحدة
 */
function sendJsonResponse($status, $data = null, $message = '', $httpCode = 200) {
    http_response_code($httpCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'status'    => $status,
        'message'   => $message,
        'data'      => $data,
        'timestamp' => formatArabicCairoDateNow()
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}
