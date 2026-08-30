-- ==============================================================================
-- صالون آية هبولة - قاعدة بيانات MySQL الكاملة (schema.sql)
-- Aya Haboula Beauty Salon - Production Database Schema
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `beauty_salon_aya` 
    DEFAULT CHARACTER SET utf8mb4 
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE `beauty_salon_aya`;

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

CREATE TABLE IF NOT EXISTS `settings` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `setting_key` VARCHAR(100) NOT NULL UNIQUE,
    `setting_value` TEXT DEFAULT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
('store_name', 'صالون آية هبولة لتجميل والعناية بالشعر'),
('phone_primary', '01016766611'),
('whatsapp_deposit', '01016766611'),
('instapay_username', 'ayahaboula@instapay'),
('deposit_amount', '150'),
('google_sheet_url', ''),
('admin_password', 'admin')
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);
