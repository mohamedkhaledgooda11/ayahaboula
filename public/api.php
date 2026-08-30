<?php
/**
 * Beauty Salon Aya Haboula - Dual-Engine REST Controller (api.php)
 * Handles MySQL persistence + Google Sheets Web App Auto-Forwarding (cURL 302 follow)
 */

require_once __DIR__ . '/backend-php/config.php';

// Set CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get input payload from JSON or POST
$rawInput = file_get_contents('php://input');
$jsonInput = json_decode($rawInput, true) ?: [];
$requestData = array_merge($_GET, $_POST, $jsonInput);

$action = $requestData['action'] ?? ($_GET['action'] ?? '');

$pdo = getDbConnection();
if ($pdo) {
    initDatabaseTables($pdo);
}

// Helper to get a setting
function getSettingValue($pdo, $key, $default = '') {
    if (!$pdo) return $default;
    try {
        $stmt = $pdo->prepare("SELECT setting_value FROM settings WHERE setting_key = :k LIMIT 1");
        $stmt->execute([':k' => $key]);
        $row = $stmt->fetch();
        return $row ? $row['setting_value'] : $default;
    } catch (Exception $e) {
        return $default;
    }
}

// Helper to forward order to Google Sheet via cURL
function forwardOrderToGoogleSheet($sheetUrl, $orderData) {
    if (empty($sheetUrl) || !filter_var($sheetUrl, FILTER_VALIDATE_URL)) {
        return ['success' => false, 'error' => 'No valid Google Sheet URL configured'];
    }

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $sheetUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'action' => 'addOrder',
        'order' => $orderData
    ]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json; charset=utf-8'
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // Crucial for Google Apps Script 302 redirects
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        return ['success' => false, 'error' => $curlError];
    }

    return ['success' => true, 'response' => $response, 'httpCode' => $httpCode];
}

// Route handlers
switch ($action) {
    case 'addOrder':
        $order = $requestData['order'] ?? $requestData;
        
        $customerName = trim($order['customerName'] ?? $order['customer_name'] ?? '');
        $phone1 = trim($order['phone1'] ?? '');
        $phone2 = trim($order['phone2'] ?? '');
        $governorate = trim($order['governorate'] ?? '');
        $branch = trim($order['branch'] ?? 'فرع القاهرة مصر الجديدة');
        $address = trim($order['address'] ?? '');
        $packageId = trim($order['packageId'] ?? $order['package_id'] ?? 'offer-1');
        $packageName = trim($order['packageName'] ?? $order['package_name'] ?? 'باقة الكافيار والصبغة الملكية');
        $packagePrice = floatval($order['packagePrice'] ?? $order['package_price'] ?? 500);
        $addHairWash = !empty($order['addHairWash']) || !empty($order['add_hair_wash']) ? 1 : 0;
        $hairWashPrice = $addHairWash ? floatval($order['hairWashPrice'] ?? $order['hair_wash_price'] ?? 100) : 0.00;
        $selectedShade = trim($order['selectedShade'] ?? $order['selected_shade'] ?? '');
        $wonPrize = trim($order['wonPrize'] ?? $order['won_prize'] ?? '');
        $depositAmount = floatval($order['depositAmount'] ?? $order['deposit_amount'] ?? 150);
        $totalPrice = $packagePrice + $hairWashPrice;
        $remainingAmount = max(0, $totalPrice - $depositAmount);
        $notes = trim($order['notes'] ?? '');
        $status = trim($order['status'] ?? 'deposit_pending');
        $orderCode = trim($order['orderCode'] ?? $order['order_code'] ?? ('AYA-' . rand(10000, 99999)));
        $cairoDate = trim($order['cairoFormattedDate'] ?? $order['cairo_date'] ?? formatArabicCairoDateNow());

        if (empty($customerName) || empty($phone1)) {
            sendJsonResponse('error', null, 'الرجاء إدخال اسم العميلة ورقم الهاتف الأساسي', 400);
        }

        $orderId = null;
        $syncedToSheet = 0;

        // 1. Save to MySQL if available
        if ($pdo) {
            try {
                $stmt = $pdo->prepare("
                    INSERT INTO orders (
                        order_code, cairo_date, customer_name, phone1, phone2,
                        governorate, branch, address, package_id, package_name,
                        package_price, add_hair_wash, hair_wash_price, selected_shade,
                        won_prize, deposit_amount, remaining_amount, total_price,
                        notes, status, synced_to_sheet
                    ) VALUES (
                        :order_code, :cairo_date, :customer_name, :phone1, :phone2,
                        :governorate, :branch, :address, :package_id, :package_name,
                        :package_price, :add_hair_wash, :hair_wash_price, :selected_shade,
                        :won_prize, :deposit_amount, :remaining_amount, :total_price,
                        :notes, :status, :synced_to_sheet
                    )
                ");

                $stmt->execute([
                    ':order_code' => $orderCode,
                    ':cairo_date' => $cairoDate,
                    ':customer_name' => $customerName,
                    ':phone1' => $phone1,
                    ':phone2' => $phone2,
                    ':governorate' => $governorate,
                    ':branch' => $branch,
                    ':address' => $address,
                    ':package_id' => $packageId,
                    ':package_name' => $packageName,
                    ':package_price' => $packagePrice,
                    ':add_hair_wash' => $addHairWash,
                    ':hair_wash_price' => $hairWashPrice,
                    ':selected_shade' => $selectedShade,
                    ':won_prize' => $wonPrize,
                    ':deposit_amount' => $depositAmount,
                    ':remaining_amount' => $remainingAmount,
                    ':total_price' => $totalPrice,
                    ':notes' => $notes,
                    ':status' => $status,
                    ':synced_to_sheet' => 0
                ]);
                $orderId = $pdo->lastInsertId();
            } catch (Exception $e) {
                // Database save error log
            }
        }

        // 2. Dual Sync: Read Google Sheet URL from Settings and forward via cURL
        $googleSheetUrl = getSettingValue($pdo, 'google_sheet_url', '');
        $sheetResult = null;

        $orderPayload = [
            'id' => $orderId ?: $orderCode,
            'orderCode' => $orderCode,
            'cairoFormattedDate' => $cairoDate,
            'customerName' => $customerName,
            'phone1' => $phone1,
            'phone2' => $phone2,
            'governorate' => $governorate,
            'branch' => $branch,
            'address' => $address,
            'packageId' => $packageId,
            'packageName' => $packageName,
            'packagePrice' => $packagePrice,
            'addHairWash' => (bool)$addHairWash,
            'hairWashPrice' => $hairWashPrice,
            'selectedShade' => $selectedShade,
            'wonPrize' => $wonPrize,
            'depositAmount' => $depositAmount,
            'remainingAmount' => $remainingAmount,
            'totalPrice' => $totalPrice,
            'notes' => $notes,
            'status' => $status
        ];

        if (!empty($googleSheetUrl)) {
            $sheetResult = forwardOrderToGoogleSheet($googleSheetUrl, $orderPayload);
            if (!empty($sheetResult['success']) && $pdo && $orderId) {
                $pdo->prepare("UPDATE orders SET synced_to_sheet = 1 WHERE id = :id")->execute([':id' => $orderId]);
                $syncedToSheet = 1;
            }
        }

        sendJsonResponse('success', [
            'order' => $orderPayload,
            'orderId' => $orderId,
            'syncedToSheet' => (bool)$syncedToSheet,
            'sheetResult' => $sheetResult
        ], 'تم حفظ الحجز بنجاح');
        break;

    case 'getOrders':
        if (!$pdo) {
            sendJsonResponse('success', [], 'Server in fallback mode');
        }

        $search = trim($requestData['search'] ?? '');
        $statusFilter = trim($requestData['status'] ?? '');
        
        $sql = "SELECT * FROM orders WHERE 1=1";
        $params = [];

        if (!empty($search)) {
            $sql .= " AND (customer_name LIKE :s OR phone1 LIKE :s OR phone2 LIKE :s OR order_code LIKE :s OR governorate LIKE :s OR branch LIKE :s)";
            $params[':s'] = "%$search%";
        }

        if (!empty($statusFilter) && $statusFilter !== 'all') {
            $sql .= " AND status = :st";
            $params[':st'] = $statusFilter;
        }

        $sql .= " ORDER BY id DESC LIMIT 200";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        // Format rows to frontend camelCase model
        $formatted = array_map(function($r) {
            return [
                'id' => (string)$r['id'],
                'orderCode' => $r['order_code'],
                'cairoFormattedDate' => $r['cairo_date'],
                'customerName' => $r['customer_name'],
                'phone1' => $r['phone1'],
                'phone2' => $r['phone2'] ?? '',
                'governorate' => $r['governorate'],
                'branch' => $r['branch'],
                'address' => $r['address'],
                'packageId' => $r['package_id'],
                'packageName' => $r['package_name'],
                'packagePrice' => floatval($r['package_price']),
                'addHairWash' => (bool)$r['add_hair_wash'],
                'hairWashPrice' => floatval($r['hair_wash_price']),
                'selectedShade' => $r['selected_shade'] ?? '',
                'wonPrize' => $r['won_prize'] ?? '',
                'depositAmount' => floatval($r['deposit_amount']),
                'remainingAmount' => floatval($r['remaining_amount']),
                'totalPrice' => floatval($r['total_price']),
                'notes' => $r['notes'] ?? '',
                'status' => $r['status'],
                'syncedToGoogleSheet' => (bool)$r['synced_to_sheet'],
                'createdAt' => $r['created_at']
            ];
        }, $rows);

        sendJsonResponse('success', $formatted, 'تم جلب الطلبات بنجاح');
        break;

    case 'updateStatus':
        $orderId = $requestData['orderId'] ?? $requestData['id'] ?? null;
        $newStatus = $requestData['status'] ?? '';

        if (!$pdo || empty($orderId) || empty($newStatus)) {
            sendJsonResponse('error', null, 'بيانات غير مكتملة', 400);
        }

        $stmt = $pdo->prepare("UPDATE orders SET status = :st WHERE id = :id OR order_code = :code");
        $stmt->execute([':st' => $newStatus, ':id' => $orderId, ':code' => $orderId]);

        sendJsonResponse('success', ['orderId' => $orderId, 'status' => $newStatus], 'تم تحديث حالة الحجز بنجاح');
        break;

    case 'getSettings':
        if (!$pdo) {
            sendJsonResponse('success', [], 'Server in fallback mode');
        }

        $stmt = $pdo->query("SELECT setting_key, setting_value FROM settings");
        $settingsRaw = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

        sendJsonResponse('success', [
            'storeName' => $settingsRaw['store_name'] ?? 'Beauty Salon Aya Haboula',
            'salonOwner' => $settingsRaw['salon_owner'] ?? 'آية هبولة',
            'whatsappNumber' => $settingsRaw['whatsapp_number'] ?? '201286886296',
            'whatsappDepositNumber' => $settingsRaw['whatsapp_deposit_number'] ?? '01286886296',
            'instapayUsername' => $settingsRaw['instapay_username'] ?? '01286886296 / ayanailss',
            'depositAmount' => floatval($settingsRaw['deposit_amount'] ?? 150),
            'hairWashPrice' => floatval($settingsRaw['hair_wash_price'] ?? 100),
            'facebookUrl' => $settingsRaw['facebook_url'] ?? 'https://www.facebook.com/profile.php?id=100076153371113',
            'googleSheetUrl' => $settingsRaw['google_sheet_url'] ?? '',
            'metaPixelId' => $settingsRaw['meta_pixel_id'] ?? '',
            'currency' => 'جنيه'
        ], 'تم جلب الإعدادات');
        break;

    case 'updateSettings':
        if (!$pdo) {
            sendJsonResponse('error', null, 'Database unavailable', 500);
        }

        $settings = $requestData['settings'] ?? $requestData;
        $map = [
            'storeName' => 'store_name',
            'salonOwner' => 'salon_owner',
            'whatsappNumber' => 'whatsapp_number',
            'whatsappDepositNumber' => 'whatsapp_deposit_number',
            'instapayUsername' => 'instapay_username',
            'depositAmount' => 'deposit_amount',
            'hairWashPrice' => 'hair_wash_price',
            'facebookUrl' => 'facebook_url',
            'googleSheetUrl' => 'google_sheet_url',
            'metaPixelId' => 'meta_pixel_id',
            'adminPassword' => 'admin_password'
        ];

        $stmt = $pdo->prepare("INSERT INTO settings (setting_key, setting_value) VALUES (:k, :v) ON DUPLICATE KEY UPDATE setting_value = :v2");
        foreach ($map as $frontKey => $dbKey) {
            if (isset($settings[$frontKey])) {
                $val = (string)$settings[$frontKey];
                $stmt->execute([':k' => $dbKey, ':v' => $val, ':v2' => $val]);
            }
        }

        sendJsonResponse('success', null, 'تم حفظ الإعدادات بنجاح');
        break;

    case 'stats':
        if (!$pdo) {
            sendJsonResponse('success', [
                'totalOrders' => 0,
                'totalSales' => 0,
                'totalDeposits' => 0,
                'newOrders' => 0,
                'confirmedOrders' => 0,
                'completedOrders' => 0,
                'cancelledOrders' => 0
            ]);
        }

        $stmt = $pdo->query("
            SELECT 
                COUNT(*) as total_orders,
                COALESCE(SUM(total_price), 0) as total_sales,
                COALESCE(SUM(deposit_amount), 0) as total_deposits,
                COALESCE(SUM(CASE WHEN status = 'new' OR status = 'deposit_pending' THEN 1 ELSE 0 END), 0) as new_orders,
                COALESCE(SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END), 0) as confirmed_orders,
                COALESCE(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END), 0) as completed_orders,
                COALESCE(SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END), 0) as cancelled_orders
            FROM orders
        ");
        $stats = $stmt->fetch();

        sendJsonResponse('success', [
            'totalOrders' => intval($stats['total_orders']),
            'totalSales' => floatval($stats['total_sales']),
            'totalDeposits' => floatval($stats['total_deposits']),
            'newOrders' => intval($stats['new_orders']),
            'confirmedOrders' => intval($stats['confirmed_orders']),
            'completedOrders' => intval($stats['completed_orders']),
            'cancelledOrders' => intval($stats['cancelled_orders'])
        ], 'تم احتساب الإحصائيات');
        break;

    case 'testGoogleSheet':
        $url = trim($requestData['googleSheetUrl'] ?? getSettingValue($pdo, 'google_sheet_url', ''));
        if (empty($url)) {
            sendJsonResponse('error', null, 'الرجاء إدخال رابط Google Apps Script Web App', 400);
        }

        $res = forwardOrderToGoogleSheet($url, [
            'orderCode' => 'TEST-' . rand(100, 999),
            'cairoFormattedDate' => formatArabicCairoDateNow(),
            'customerName' => 'طلب تجريبي - اختبار الاتصال',
            'phone1' => '01286886296',
            'governorate' => 'القاهرة',
            'branch' => 'فرع مصر الجديدة',
            'packageName' => 'باقة تجريبية لاختبار جوجل شيت',
            'packagePrice' => 500,
            'depositAmount' => 150,
            'remainingAmount' => 350,
            'totalPrice' => 500,
            'status' => 'new'
        ]);

        if ($res['success']) {
            sendJsonResponse('success', $res, 'تم الاتصال بنجاح وتأكيد استجابة Google Sheets!');
        } else {
            sendJsonResponse('error', $res, 'فشل الاتصال برابط جوجل شيت: ' . ($res['error'] ?? 'خطأ غير معروف'), 500);
        }
        break;

    case 'ping':
    default:
        sendJsonResponse('success', [
            'server' => 'Beauty Salon Aya Haboula Dual-Engine API',
            'time' => formatArabicCairoDateNow(),
            'database' => $pdo ? 'connected' : 'offline_fallback'
        ], 'API is running properly');
        break;
}
