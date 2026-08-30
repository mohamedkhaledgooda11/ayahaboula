-- ============================================================
-- Beauty Salon Aya Haboula - MySQL Database Schema
-- Encoding: UTF8MB4 Unicode CI
-- Timezone: Africa/Cairo
-- ============================================================

CREATE DATABASE IF NOT EXISTS `beauty_salon_aya` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `beauty_salon_aya`;

-- ------------------------------------------------------------
-- Table: orders (جدول الحجوزات والطلبات)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_code` VARCHAR(50) NOT NULL UNIQUE COMMENT 'كود الحجز الفريد مثل AYA-78412',
    `cairo_date` VARCHAR(150) NOT NULL COMMENT 'التاريخ العربي المنسق بتوقيت القاهرة',
    `customer_name` VARCHAR(150) NOT NULL COMMENT 'اسم العميلة',
    `phone1` VARCHAR(30) NOT NULL COMMENT 'رقم الهاتف الأساسي',
    `phone2` VARCHAR(30) DEFAULT NULL COMMENT 'رقم هاتف إضافي',
    `governorate` VARCHAR(100) NOT NULL COMMENT 'المحافظة',
    `branch` VARCHAR(100) NOT NULL COMMENT 'الفرع المختار (الإسماعيلية/مصر الجديدة/جسر السويس)',
    `address` TEXT NOT NULL COMMENT 'العنوان التفصيلي',
    `package_id` VARCHAR(50) NOT NULL COMMENT 'معرف الباقة',
    `package_name` VARCHAR(150) NOT NULL COMMENT 'اسم باقة العرض',
    `package_price` DECIMAL(10,2) NOT NULL COMMENT 'سعر الباقة (500 أو 999)',
    `add_hair_wash` TINYINT(1) DEFAULT 0 COMMENT 'إضافة غسيل شعر +100 ج',
    `hair_wash_price` DECIMAL(10,2) DEFAULT 0.00 COMMENT 'سعر غسيل الشعر',
    `selected_shade` VARCHAR(150) DEFAULT NULL COMMENT 'درجة الصبغة المختارة',
    `won_prize` VARCHAR(200) DEFAULT NULL COMMENT 'الجائزة المكتسبة من ساعة حظ هبولة',
    `deposit_amount` DECIMAL(10,2) NOT NULL DEFAULT 150.00 COMMENT 'مبلغ العربون إنستاباي',
    `remaining_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'المبلغ المتبقي عند الحضور',
    `total_price` DECIMAL(10,2) NOT NULL COMMENT 'الإجمالي الكلي للباقة والإضافات',
    `notes` TEXT DEFAULT NULL COMMENT 'ملاحظات وتفاصيل الشعر',
    `status` VARCHAR(50) NOT NULL DEFAULT 'deposit_pending' COMMENT 'حالة الطلب: new / deposit_pending / confirmed / completed / cancelled',
    `synced_to_sheet` TINYINT(1) DEFAULT 0 COMMENT 'تمت المزامنة مع جوجل شيت',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_order_code` (`order_code`),
    INDEX `idx_phone1` (`phone1`),
    INDEX `idx_status` (`status`),
    INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: settings (جدول إعدادات المتجر ولوحة التحكم)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `settings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `setting_key` VARCHAR(100) NOT NULL UNIQUE,
    `setting_value` TEXT NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Default Seed Data
-- ------------------------------------------------------------
INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
('store_name', 'Beauty Salon Aya Haboula'),
('salon_owner', 'آية هبولة'),
('whatsapp_number', '201286886296'),
('whatsapp_deposit_number', '01286886296'),
('instapay_username', '01286886296 / ayanailss'),
('deposit_amount', '150'),
('hair_wash_price', '100'),
('facebook_url', 'https://www.facebook.com/profile.php?id=100076153371113'),
('google_sheet_url', ''),
('meta_pixel_id', ''),
('admin_password', 'admin123')
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);
