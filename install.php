<?php
/**
 * ==============================================================================
 * صالون آية هبولة - مثبت قاعدة البيانات التلقائي (install.php)
 * Aya Haboula Beauty Salon - MySQL Automatic One-Click Installer
 * ==============================================================================
 * افتح هذا الملف في المتصفح لتثبيت جداول قاعدة البيانات تلقائياً بضغطة زر واحدة!
 */

require_once __DIR__ . '/config.php';

$pageTitle = "صالون آية هبولة - مثبت قاعدة بيانات MySQL";
$messages = [];
$status = 'pending';

if ($_SERVER['REQUEST_METHOD'] === 'POST' || isset($_GET['run'])) {
    try {
        // الاتصال المباشر بخادم MySQL أولاً لإنشاء قاعدة البيانات إن لم تكن موجودة
        $dsnWithoutDb = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";charset=utf8mb4";
        $pdoInit = new PDO($dsnWithoutDb, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]);

        $dbName = DB_NAME;
        $pdoInit->exec("CREATE DATABASE IF NOT EXISTS `$dbName` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        $messages[] = "تم التحقق من وجود قاعدة البيانات: <strong>$dbName</strong> بنجاح.";

        // الاتصال بقاعدة البيانات المحددة
        $pdo = getDbConnection();
        if (!$pdo) {
            throw new Exception("تعذر الاتصال بقاعدة البيانات عبر PDO. تحقق من بيانات DB_USER و DB_PASS في config.php");
        }

        // إنشاء جدول الطلبات orders
        $sqlOrders = "CREATE TABLE IF NOT EXISTS `orders` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `order_code` VARCHAR(50) NOT NULL UNIQUE,
            `cairo_date` VARCHAR(150) NOT NULL,
            `customer_name` VARCHAR(150) NOT NULL,
            `phone1` VARCHAR(30) NOT NULL,
            `phone2` VARCHAR(30) DEFAULT NULL,
            `governorate` VARCHAR(100) NOT NULL DEFAULT 'القاهرة',
            `branch` VARCHAR(150) NOT NULL DEFAULT 'فرع القاهرة - مصر الجديدة',
            `address` TEXT NOT NULL,
            `package_id` VARCHAR(50) NOT NULL DEFAULT 'offer-1',
            `package_name` VARCHAR(150) NOT NULL DEFAULT 'باقة الكافيار والصبغة الملكية',
            `package_price` DECIMAL(10,2) NOT NULL DEFAULT 500.00,
            `add_hair_wash` TINYINT(1) NOT NULL DEFAULT 0,
            `hair_wash_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            `selected_shade` VARCHAR(150) DEFAULT NULL,
            `won_prize` VARCHAR(200) DEFAULT NULL,
            `deposit_amount` DECIMAL(10,2) NOT NULL DEFAULT 150.00,
            `remaining_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            `total_price` DECIMAL(10,2) NOT NULL DEFAULT 500.00,
            `notes` TEXT DEFAULT NULL,
            `status` ENUM('deposit_pending', 'confirmed', 'completed', 'cancelled') NOT NULL DEFAULT 'deposit_pending',
            `synced_to_sheet` TINYINT(1) NOT NULL DEFAULT 0,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX `idx_order_code` (`order_code`),
            INDEX `idx_phone1` (`phone1`),
            INDEX `idx_status` (`status`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
        $pdo->exec($sqlOrders);
        $messages[] = "تم إنشاء وتجهيز جدول الحجوزات <code>orders</code> بترميز utf8mb4.";

        // إنشاء جدول الإعدادات settings
        $sqlSettings = "CREATE TABLE IF NOT EXISTS `settings` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `setting_key` VARCHAR(100) NOT NULL UNIQUE,
            `setting_value` TEXT DEFAULT NULL,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
        $pdo->exec($sqlSettings);
        $messages[] = "تم إنشاء وتجهيز جدول الإعدادات <code>settings</code>.";

        // إدراج الإعدادات الأولية
        $sqlSeed = "INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
            ('store_name', 'صالون آية هبولة لتجميل والعناية بالشعر'),
            ('phone_primary', '01016766611'),
            ('whatsapp_deposit', '01016766611'),
            ('instapay_username', 'ayahaboula@instapay'),
            ('deposit_amount', '150'),
            ('google_sheet_url', ''),
            ('admin_password', 'admin')
            ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);";
        $pdo->exec($sqlSeed);
        $messages[] = "تم إدراج إعدادات الصالون الافتراضية وحساب إنستاباي بنجاح.";

        $status = 'success';
    } catch (Exception $e) {
        $status = 'error';
        $messages[] = "حدث خطأ أثناء التثبيت: " . htmlspecialchars($e->getMessage());
    }
}
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $pageTitle ?></title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 40px 20px; direction: rtl; }
        .container { max-width: 650px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); border: 1px solid #334155; }
        h1 { color: #ff6600; margin-top: 0; font-size: 24px; border-bottom: 2px solid #ff6600; padding-bottom: 12px; }
        .info-box { background: #0f172a; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #334155; font-size: 14px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .info-label { color: #94a3b8; }
        .info-val { color: #38bdf8; font-family: monospace; font-weight: bold; }
        .btn { background: #ff6600; color: #fff; border: none; padding: 14px 28px; font-size: 16px; font-weight: bold; border-radius: 8px; cursor: pointer; width: 100%; transition: all 0.2s; }
        .btn:hover { background: #ea580c; }
        .msg-list { list-style: none; padding: 0; margin: 20px 0; }
        .msg-list li { padding: 10px 14px; margin-bottom: 8px; border-radius: 6px; font-size: 14px; }
        .msg-list li.success { background: rgba(34, 197, 94, 0.2); border: 1px solid #22c55e; color: #4ade80; }
        .msg-list li.error { background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #f87171; }
        .back-link { display: inline-block; margin-top: 20px; color: #94a3b8; text-decoration: none; font-size: 14px; }
        .back-link:hover { color: #ff6600; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🛠️ مثبت قاعدة بيانات MySQL - صالون آية هبولة</h1>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
            هذا الملف يقوم بإنشاء قاعدة البيانات <strong><?= DB_NAME ?></strong> وجدول الحجوزات <code>orders</code> وجدول الإعدادات تلقائياً بضغطة زر واحدة.
        </p>

        <div class="info-box">
            <div class="info-row"><span class="info-label">مضيف القاعدة (DB_HOST):</span><span class="info-val"><?= DB_HOST ?>:<?= DB_PORT ?></span></div>
            <div class="info-row"><span class="info-label">اسم قاعدة البيانات (DB_NAME):</span><span class="info-val"><?= DB_NAME ?></span></div>
            <div class="info-row"><span class="info-label">اسم المستخدم (DB_USER):</span><span class="info-val"><?= DB_USER ?></span></div>
            <div class="info-row"><span class="info-label">توقيت الخادم:</span><span class="info-val"><?= date_default_timezone_get() ?> (<?= date('Y-m-d H:i') ?>)</span></div>
        </div>

        <?php if (!empty($messages)): ?>
            <ul class="msg-list">
                <?php foreach ($messages as $msg): ?>
                    <li class="<?= $status === 'success' ? 'success' : 'error' ?>"><?= $msg ?></li>
                <?php endforeach; ?>
            </ul>
        <?php endif; ?>

        <?php if ($status === 'success'): ?>
            <div style="background: rgba(34, 197, 94, 0.15); border: 1px solid #22c55e; padding: 16px; border-radius: 8px; color: #4ade80; text-align: center; margin-bottom: 20px;">
                🎉 <strong>تم اكتمال التثبيت بنجاح! قاعدة البيانات جاهزة الآن لاستقبال الحجوزات.</strong>
            </div>
            <a href="index.html" class="btn" style="text-align:center; display:block; text-decoration:none;">الذهاب لصفحة الهبوط الرئيسية</a>
        <?php else: ?>
            <form method="POST">
                <button type="submit" class="btn">🚀 ابدأ تثبيت وإنشاء الجداول الآن</button>
            </form>
        <?php endif; ?>

        <a href="api.php?action=ping" target="_blank" class="back-link">🔍 فحص استجابة API (api.php?action=ping)</a>
    </div>
</body>
</html>
