<?php
/**
 * ==============================================================================
 * صالون آية هبولة - واجهة برمجة التطبيقات والباك إند (api.php)
 * Aya Haboula Beauty Salon - REST API Controller
 * ==============================================================================
 * معالج الطلبات الكامل بلغة PHP وقاعدة بيانات MySQL
 */

require_once __DIR__ . '/config.php';

// ضبط ترويسات CORS للسماح بالطلبات من أي نطاق
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// معالجة طلبات Preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// قراءة بيانات الطلب (سواء JSON Body أو POST أو GET)
$rawInput = file_get_contents('php://input');
$jsonInput = json_decode($rawInput, true) ?: [];
$requestData = array_merge($_GET, $_POST, $jsonInput);
$action = $requestData['action'] ?? ($_GET['action'] ?? 'ping');

// الحصول على اتصال PDO
$pdo = getDbConnection();

/**
 * دالة مساعدة لإعادة توجيه الطلب إلى Google Sheets في الخلفية (مزامنة مزدوجة)
 */
function forwardOrderToGoogleSheet($sheetUrl, $orderData) {
    if (empty($sheetUrl) || !filter_var($sheetUrl, FILTER_VALIDATE_URL)) {
        return false;
    }

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $sheetUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'action' => 'addOrder',
        'order'  => $orderData
    ], JSON_UNESCAPED_UNICODE));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json; charset=utf-8'
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return ($httpCode >= 200 && $httpCode < 300);
}

// ==============================================================================
// معالجة الأوامر والعمليات (Actions Routing)
// ==============================================================================
switch ($action) {

    // --------------------------------------------------------------------------
    // 1. إضافة وحفظ حجز جديد (addOrder)
    // --------------------------------------------------------------------------
    case 'addOrder':
        $order = $requestData['order'] ?? $requestData;

        $orderCode       = trim($order['orderCode'] ?? $order['order_code'] ?? ('AYA-' . rand(10000, 99999)));
        $cairoDate       = trim($order['cairoFormattedDate'] ?? $order['cairo_date'] ?? formatArabicCairoDateNow());
        $customerName    = trim($order['customerName'] ?? $order['customer_name'] ?? '');
        $phone1          = trim($order['phone1'] ?? '');
        $phone2          = trim($order['phone2'] ?? '');
        $governorate     = trim($order['governorate'] ?? 'القاهرة');
        $branch          = trim($order['branch'] ?? 'فرع القاهرة - مصر الجديدة');
        $address         = trim($order['address'] ?? '');
        $packageId       = trim($order['packageId'] ?? $order['package_id'] ?? 'offer-1');
        $packageName     = trim($order['packageName'] ?? $order['package_name'] ?? 'باقة الكافيار والصبغة الملكية');
        $packagePrice    = floatval($order['packagePrice'] ?? $order['package_price'] ?? 500);
        $addHairWash     = (!empty($order['addHairWash']) || !empty($order['add_hair_wash'])) ? 1 : 0;
        $hairWashPrice   = $addHairWash ? floatval($order['hairWashPrice'] ?? $order['hair_wash_price'] ?? 100) : 0;
        $selectedShade   = trim($order['selectedShade'] ?? $order['selected_shade'] ?? '');
        $wonPrize        = trim($order['wonPrize'] ?? $order['won_prize'] ?? '');
        $depositAmount   = floatval($order['depositAmount'] ?? $order['deposit_amount'] ?? 150);
        $totalPrice      = $packagePrice + $hairWashPrice;
        $remainingAmount = max(0, $totalPrice - $depositAmount);
        $notes           = trim($order['notes'] ?? '');
        $status          = trim($order['status'] ?? 'deposit_pending');

        if (empty($customerName) || empty($phone1)) {
            sendJsonResponse('error', null, 'الرجاء إدخال اسم العميلة ورقم الهاتف الأساسي', 400);
        }

        // مزامنة Google Sheets التلقائية إذا كان الرابط مضبوطاً
        $syncedToSheet = 0;
        $targetSheetUrl = !empty($requestData['googleSheetUrl']) ? $requestData['googleSheetUrl'] : GOOGLE_SHEET_URL;
        if (!empty($targetSheetUrl)) {
            $sheetOk = forwardOrderToGoogleSheet($targetSheetUrl, array_merge($order, [
                'orderCode'          => $orderCode,
                'cairoFormattedDate' => $cairoDate,
                'packagePrice'       => $packagePrice,
                'hairWashPrice'      => $hairWashPrice,
                'totalPrice'         => $totalPrice,
                'depositAmount'      => $depositAmount,
                'remainingAmount'    => $remainingAmount
            ]));
            if ($sheetOk) {
                $syncedToSheet = 1;
            }
        }

        // الحفظ في قاعدة بيانات MySQL عبر PDO
        if ($pdo) {
            try {
                $stmt = $pdo->prepare("INSERT INTO `orders` (
                    `order_code`, `cairo_date`, `customer_name`, `phone1`, `phone2`,
                    `governorate`, `branch`, `address`, `package_id`, `package_name`,
                    `package_price`, `add_hair_wash`, `hair_wash_price`, `selected_shade`,
                    `won_prize`, `deposit_amount`, `remaining_amount`, `total_price`,
                    `notes`, `status`, `synced_to_sheet`
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    `customer_name` = VALUES(`customer_name`),
                    `phone1` = VALUES(`phone1`),
                    `status` = VALUES(`status`),
                    `synced_to_sheet` = VALUES(`synced_to_sheet`)
                ");

                $stmt->execute([
                    $orderCode, $cairoDate, $customerName, $phone1, $phone2,
                    $governorate, $branch, $address, $packageId, $packageName,
                    $packagePrice, $addHairWash, $hairWashPrice, $selectedShade,
                    $wonPrize, $depositAmount, $remainingAmount, $totalPrice,
                    $notes, $status, $syncedToSheet
                ]);
            } catch (PDOException $e) {
                error_log("DB Insert Error: " . $e->getMessage());
            }
        }

        sendJsonResponse('success', [
            'orderCode'       => $orderCode,
            'cairoDate'       => $cairoDate,
            'totalPrice'      => $totalPrice,
            'depositAmount'   => $depositAmount,
            'remainingAmount' => $remainingAmount,
            'syncedToSheet'   => (bool)$syncedToSheet,
            'dbSaved'         => (bool)$pdo
        ], 'تم استلام وتأكيد الحجز بنجاح');
        break;

    // --------------------------------------------------------------------------
    // 2. جلب الحجوزات من MySQL (getOrders)
    // --------------------------------------------------------------------------
    case 'getOrders':
        if (!$pdo) {
            sendJsonResponse('success', [], 'قاعدة بيانات MySQL غير متصلة، يتم الاعتماد على التخزين المؤقت');
        }

        try {
            $stmt = $pdo->query("SELECT 
                `id`,
                `order_code` AS orderCode,
                `cairo_date` AS cairoFormattedDate,
                `customer_name` AS customerName,
                `phone1`,
                `phone2`,
                `governorate`,
                `branch`,
                `address`,
                `package_id` AS packageId,
                `package_name` AS packageName,
                `package_price` AS packagePrice,
                `add_hair_wash` AS addHairWash,
                `hair_wash_price` AS hairWashPrice,
                `selected_shade` AS selectedShade,
                `won_prize` AS wonPrize,
                `deposit_amount` AS depositAmount,
                `remaining_amount` AS remainingAmount,
                `total_price` AS totalPrice,
                `notes`,
                `status`,
                `synced_to_sheet` AS syncedToGoogleSheet,
                `created_at` AS createdAt
            FROM `orders` ORDER BY `id` DESC LIMIT 200");

            $orders = $stmt->fetchAll();
            foreach ($orders as &$ord) {
                $ord['addHairWash'] = (bool)$ord['addHairWash'];
                $ord['syncedToGoogleSheet'] = (bool)$ord['syncedToGoogleSheet'];
                $ord['packagePrice'] = (float)$ord['packagePrice'];
                $ord['totalPrice'] = (float)$ord['totalPrice'];
                $ord['depositAmount'] = (float)$ord['depositAmount'];
                $ord['remainingAmount'] = (float)$ord['remainingAmount'];
            }

            sendJsonResponse('success', $orders, 'تم جلب الحجوزات بنجاح من MySQL');
        } catch (PDOException $e) {
            sendJsonResponse('error', [], 'خطأ في استعلام MySQL: ' . $e->getMessage(), 500);
        }
        break;

    // --------------------------------------------------------------------------
    // 3. تحديث حالة الحجز (updateStatus)
    // --------------------------------------------------------------------------
    case 'updateStatus':
        $orderCode = trim($requestData['orderCode'] ?? $requestData['orderId'] ?? '');
        $newStatus = trim($requestData['status'] ?? '');

        if (empty($orderCode) || empty($newStatus)) {
            sendJsonResponse('error', null, 'البيانات غير مكتملة لتحديث الحالة', 400);
        }

        if ($pdo) {
            try {
                $stmt = $pdo->prepare("UPDATE `orders` SET `status` = ? WHERE `order_code` = ? OR `id` = ?");
                $stmt->execute([$newStatus, $orderCode, $orderCode]);
                sendJsonResponse('success', [
                    'orderCode' => $orderCode,
                    'status'    => $newStatus
                ], 'تم تحديث حالة الحجز بنجاح');
            } catch (PDOException $e) {
                sendJsonResponse('error', null, 'خطأ أثناء التحديث: ' . $e->getMessage(), 500);
            }
        } else {
            sendJsonResponse('success', [
                'orderCode' => $orderCode,
                'status'    => $newStatus
            ], 'تم التحديث ظاهرياً (قاعدة البيانات غير متصلة)');
        }
        break;

    // --------------------------------------------------------------------------
    // 4. إحصائيات لوحة التحكم (getStats)
    // --------------------------------------------------------------------------
    case 'getStats':
        if ($pdo) {
            try {
                $stmt = $pdo->query("SELECT
                    COUNT(*) AS totalOrders,
                    COALESCE(SUM(total_price), 0) AS totalSales,
                    COALESCE(SUM(deposit_amount), 0) AS totalDeposits,
                    SUM(CASE WHEN status IN ('new', 'deposit_pending') THEN 1 ELSE 0 END) AS pendingOrders,
                    SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) AS confirmedOrders,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completedOrders,
                    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelledOrders
                FROM `orders`");
                $stats = $stmt->fetch();
                sendJsonResponse('success', $stats, 'تم حساب الإحصائيات');
            } catch (PDOException $e) {
                sendJsonResponse('error', null, $e->getMessage(), 500);
            }
        }
        sendJsonResponse('success', [
            'totalOrders' => 0,
            'totalSales' => 0,
            'totalDeposits' => 0
        ], 'إحصائيات افتراضية');
        break;

    // --------------------------------------------------------------------------
    // 5. جلب الإعدادات (getSettings)
    // --------------------------------------------------------------------------
    case 'getSettings':
        $settings = [];
        if ($pdo) {
            try {
                $stmt = $pdo->query("SELECT setting_key, setting_value FROM `settings`");
                while ($row = $stmt->fetch()) {
                    $settings[$row['setting_key']] = $row['setting_value'];
                }
            } catch (Exception $e) {
                // Ignore
            }
        }
        sendJsonResponse('success', $settings, 'تم جلب الإعدادات');
        break;

    // --------------------------------------------------------------------------
    // 6. حفظ وتحديث الإعدادات (updateSettings)
    // --------------------------------------------------------------------------
    case 'updateSettings':
        $newSettings = $requestData['settings'] ?? $requestData;
        if ($pdo && is_array($newSettings)) {
            try {
                $stmt = $pdo->prepare("INSERT INTO `settings` (setting_key, setting_value) 
                    VALUES (?, ?) 
                    ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)");
                foreach ($newSettings as $k => $v) {
                    if ($k === 'action') continue;
                    $stmt->execute([strval($k), is_scalar($v) ? strval($v) : json_encode($v)]);
                }
                sendJsonResponse('success', null, 'تم حفظ الإعدادات في MySQL بنجاح');
            } catch (Exception $e) {
                sendJsonResponse('error', null, 'فشل حفظ الإعدادات: ' . $e->getMessage(), 500);
            }
        }
        sendJsonResponse('error', null, 'بيانات غير صالحة', 400);
        break;

    // --------------------------------------------------------------------------
    // 7. فحص الحالة والاتصال (ping)
    // --------------------------------------------------------------------------
    case 'ping':
    default:
        $dbStatus = false;
        if ($pdo) {
            try {
                $pdo->query("SELECT 1");
                $dbStatus = true;
            } catch (Exception $e) {
                $dbStatus = false;
            }
        }

        sendJsonResponse('success', [
            'engine'    => 'PHP & MySQL Dedicated Backend',
            'version'   => '2.5.0',
            'phpVersion'=> PHP_VERSION,
            'database'  => $dbStatus ? 'Connected (MySQL)' : 'Disconnected (Check config.php)',
            'cairoTime' => formatArabicCairoDateNow()
        ], 'خادم PHP وقاعدة بيانات صالون آية هبولة يعمل بنجاح');
        break;
}
