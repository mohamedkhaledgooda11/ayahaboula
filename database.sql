-- ==============================================================================
-- صالون آية هبولة - قاعدة بيانات MySQL الكاملة (database.sql)
-- Aya Haboula Beauty Salon - Production Database Schema
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `beauty_salon_aya` 
    DEFAULT CHARACTER SET utf8mb4 
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE `beauty_salon_aya`;

CREATE TABLE IF NOT EXISTS `orders` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `order_code` VARCHAR(50) NOT NULL UNIQUE COMMENT 'كود الحجز الفريد',
    `cairo_date` VARCHAR(150) NOT NULL COMMENT 'تاريخ ووقت الحجز بتوقيت القاهرة',
    `customer_name` VARCHAR(150) NOT NULL COMMENT 'اسم العميلة',
    `phone1` VARCHAR(30) NOT NULL COMMENT 'رقم الهاتف الأساسي',
    `phone2` VARCHAR(30) DEFAULT NULL COMMENT 'رقم هاتف بديل',
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
('admin_password', 'admin123')
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);
