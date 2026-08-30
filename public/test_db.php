<?php
/**
 * فحص الاتصال السريع بقاعدة بيانات MySQL
 */
require_once __DIR__ . '/config.php';

header('Content-Type: text/html; charset=utf-8');

echo "<h2>فحص اتصال MySQL - صالون آية هبولة</h2>";
echo "<p><strong>المضيف:</strong> " . DB_HOST . ":" . DB_PORT . "</p>";
echo "<p><strong>قاعدة البيانات:</strong> " . DB_NAME . "</p>";
echo "<p><strong>المستخدم:</strong> " . DB_USER . "</p>";

$pdo = getDbConnection();

if ($pdo) {
    echo "<p style='color:green;font-weight:bold;'>✅ الاتصال بـ MySQL ناجح 100%!</p>";
    try {
        $stmt = $pdo->query("SELECT COUNT(*) AS total FROM `orders`");
        $count = $stmt->fetchColumn();
        echo "<p>عدد الحجوزات الموجودة حالياً في جدول orders: <strong>$count</strong></p>";
    } catch (Exception $e) {
        echo "<p style='color:orange;'>⚠️ جدول orders غير موجود بعد. يرجى تشغيل <a href='install.php'>install.php</a> لإنشاء الجداول.</p>";
    }
} else {
    echo "<p style='color:red;font-weight:bold;'>❌ فشل الاتصال بقاعدة البيانات! يرجى مراجعة إعدادات الاتصال في config.php</p>";
}
