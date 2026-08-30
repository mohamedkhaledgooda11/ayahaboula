-- ==============================================================================
-- صالون آية هبولة - قاعدة بيانات MySQL الكاملة (schema.sql)
-- Aya Haboula Beauty Salon - Production Database Schema
-- ==============================================================================

-- 1. إنشاء قاعدة البيانات بالترميز العربي الكامل utf8mb4
CREATE DATABASE IF NOT EXISTS `beauty_salon_aya` 
    DEFAULT CHARACTER SET utf8mb4 
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE `beauty_salon_aya`;

-- ------------------------------------------------------------------------------
-- 2. جدول الحجوزات والطلبات (orders)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `order_code` VARCHAR(50) NOT NULL UNIQUE COMMENT 'كود الحجز الفريد مثل AYA-78214',
    `cairo_date` VARCHAR(150) NOT NULL COMMENT 'تاريخ ووقت الحجز بتوقيت القاهرة بالعربي',
    `customer_name` VARCHAR(150) NOT NULL COMMENT 'اسم العميلة بالكامل',
    `phone1` VARCHAR(30) NOT NULL COMMENT 'رقم الهاتف الأساسي / واتساب',
    `phone2` VARCHAR(30) DEFAULT NULL COMMENT 'رقم هاتف بديل',
    `governorate` VARCHAR(100) NOT NULL DEFAULT 'القاهرة' COMMENT 'المحافظة',
    `branch` VARCHAR(150) NOT NULL DEFAULT 'فرع القاهرة - مصر الجديدة' COMMENT 'الفرع المختار للحضور',
    `address` TEXT NOT NULL COMMENT 'العنوان التفصيلي للعميلة',
    `package_id` VARCHAR(50) NOT NULL DEFAULT 'offer-1' COMMENT 'معرف الباقة',
    `package_name` VARCHAR(150) NOT NULL DEFAULT 'باقة الكافيار والصبغة الملكية' COMMENT 'اسم الباقة المختارة',
    `package_price` DECIMAL(10,2) NOT NULL DEFAULT 500.00 COMMENT 'سعر الباقة بالجنيه',
    `add_hair_wash` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'هل طلبت إضافة غسيل الشعر (+100 ج)؟',
    `hair_wash_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'تكلفة غسيل الشعر',
    `selected_shade` VARCHAR(150) DEFAULT NULL COMMENT 'درجة الصبغة المحددة',
    `won_prize` VARCHAR(200) DEFAULT NULL COMMENT 'الجائزة المكتسبة من ساعة حظ هبولة',
    `deposit_amount` DECIMAL(10,2) NOT NULL DEFAULT 150.00 COMMENT 'عربون الحجز إنستاباي',
    `remaining_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'المبلغ المتبقي للدفع بالصالون',
    `total_price` DECIMAL(10,2) NOT NULL DEFAULT 500.00 COMMENT 'الإجمالي الكلي للحجز',
    `notes` TEXT DEFAULT NULL COMMENT 'ملاحظات إضافية',
    `status` ENUM('deposit_pending', 'confirmed', 'completed', 'cancelled') NOT NULL DEFAULT 'deposit_pending' COMMENT 'حالة الحجز',
    `synced_to_sheet` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'هل تمت المزامنة لشيت جوجل؟',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'توقيت الإنشاء بالخادم',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_order_code` (`order_code`),
    INDEX `idx_phone1` (`phone1`),
    INDEX `idx_status` (`status`),
    INDEX `idx_branch` (`branch`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. جدول إعدادات المتجر والصالون (settings)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `settings` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `setting_key` VARCHAR(100) NOT NULL UNIQUE,
    `setting_value` TEXT DEFAULT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. إدراج الإعدادات الافتراضية
-- ------------------------------------------------------------------------------
INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
('store_name', 'صالون آية هبولة لتجميل والعناية بالشعر'),
('phone_primary', '01016766611'),
('whatsapp_deposit', '01016766611'),
('instapay_username', 'ayahaboula@instapay'),
('deposit_amount', '150'),
('google_sheet_url', ''),
('admin_password', 'admin123')
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

-- ------------------------------------------------------------------------------
-- 5. إضافة حجز تجريبي للتأكد من جاهزية الجدول
-- ------------------------------------------------------------------------------
INSERT INTO `orders` (
    `order_code`, `cairo_date`, `customer_name`, `phone1`, `phone2`,
    `governorate`, `branch`, `address`, `package_id`, `package_name`,
    `package_price`, `add_hair_wash`, `hair_wash_price`, `selected_shade`,
    `won_prize`, `deposit_amount`, `remaining_amount`, `total_price`,
    `notes`, `status`, `synced_to_sheet`
) VALUES (
    'AYA-99001',
    'الأحد، 30 أغسطس 2026 - 10:00 ص',
    'سارة أحمد محمود',
    '01012345678',
    '01123456789',
    'القاهرة',
    'فرع القاهرة - مصر الجديدة',
    'شارع النزهة بجوار سيتي ستارز',
    'offer-1',
    'باقة الكافيار والصبغة الملكية',
    500.00,
    1,
    100.00,
    'بني شوكولاتة لامع',
    'جلسة حمام زيت أرجان علاجي هدية 🎁',
    150.00,
    450.00,
    600.00,
    'تم تأكيد تحويل العربون بالإنستاباي',
    'confirmed',
    1
) ON DUPLICATE KEY UPDATE `customer_name` = VALUES(`customer_name`);
