-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 27, 2026 at 03:31 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `jcm_inventory_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `branches`
--

CREATE TABLE `branches` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(180) NOT NULL,
  `code` varchar(50) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(180) DEFAULT NULL,
  `is_main` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `active_main_tenant_id` bigint(20) UNSIGNED GENERATED ALWAYS AS (case when `is_main` = 1 and `is_active` = 1 and `deleted_at` is null then `tenant_id` else NULL end) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `branches`
--

INSERT INTO `branches` (`id`, `tenant_id`, `name`, `code`, `address`, `phone`, `email`, `is_main`, `is_active`, `created_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(3, 1, 'Main Branch', 'MAIN', 'Mogpog Marinduque', '09321654987', 'main@gmail.com', 1, 1, 1, '2026-07-16 01:12:59', '2026-07-16 01:12:59', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `parent_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `slug` varchar(180) NOT NULL,
  `description` text DEFAULT NULL,
  `sort_order` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `tenant_id`, `parent_id`, `name`, `slug`, `description`, `sort_order`, `is_active`, `created_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, NULL, '1', '1', '1', 4, 1, 1, '2026-07-10 06:00:11', '2026-07-10 06:00:11', NULL),
(2, 1, NULL, 'Soap', 'soap', NULL, 0, 1, 1, '2026-07-16 01:14:18', '2026-07-16 01:14:18', NULL),
(3, 1, NULL, 'Drinks', 'drinks', NULL, 0, 1, 1, '2026-07-26 10:05:02', '2026-07-26 10:05:02', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `inventory_settings`
--

CREATE TABLE `inventory_settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `batch_code_prefix` varchar(20) NOT NULL DEFAULT 'BAT',
  `batch_code_sequence_padding` tinyint(3) UNSIGNED NOT NULL DEFAULT 6,
  `auto_generate_batch_code` tinyint(1) NOT NULL DEFAULT 1,
  `default_batch_issue_policy` enum('fifo','fefo','manual') NOT NULL DEFAULT 'fifo',
  `expiry_warning_days` smallint(5) UNSIGNED NOT NULL DEFAULT 30,
  `expiry_critical_days` smallint(5) UNSIGNED NOT NULL DEFAULT 7,
  `allow_expired_issue` tinyint(1) NOT NULL DEFAULT 0,
  `allow_negative_stock` tinyint(1) NOT NULL DEFAULT 0,
  `require_batch_for_tracked_products` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

--
-- Dumping data for table `inventory_settings`
--

INSERT INTO `inventory_settings` (`id`, `tenant_id`, `batch_code_prefix`, `batch_code_sequence_padding`, `auto_generate_batch_code`, `default_batch_issue_policy`, `expiry_warning_days`, `expiry_critical_days`, `allow_expired_issue`, `allow_negative_stock`, `require_batch_for_tracked_products`, `created_at`, `updated_at`) VALUES
(1, 1, 'BAT', 6, 1, 'fifo', 30, 7, 0, 0, 1, '2026-07-25 06:37:37', '2026-07-26 04:27:50');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(180) NOT NULL,
  `slug` varchar(200) NOT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `barcode` varchar(120) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `unit` varchar(50) NOT NULL DEFAULT 'pcs',
  `cost_price` decimal(18,4) NOT NULL DEFAULT 0.0000,
  `stock_tracking` enum('tracked','not_tracked') NOT NULL DEFAULT 'tracked',
  `batch_tracking_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `batch_issue_policy` enum('fifo','fefo','manual') NOT NULL DEFAULT 'fifo',
  `requires_expiration_date` tinyint(1) NOT NULL DEFAULT 0,
  `expiry_warning_days` smallint(5) UNSIGNED DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `tenant_id`, `category_id`, `name`, `slug`, `sku`, `barcode`, `description`, `image_path`, `unit`, `cost_price`, `stock_tracking`, `batch_tracking_enabled`, `batch_issue_policy`, `requires_expiration_date`, `expiry_warning_days`, `is_active`, `created_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 1, 'qw', 'qw', 'QW', 'qw', '0', NULL, 'pcs', 10.0000, 'tracked', 0, 'fifo', 0, NULL, 1, 1, '2026-07-10 06:13:07', '2026-07-10 06:13:07', NULL),
(2, 1, 2, 'Safeguard', 'safeguard', 'QW1', NULL, NULL, NULL, 'pcs', 25.0000, 'tracked', 0, 'fifo', 0, NULL, 1, 1, '2026-07-16 01:14:47', '2026-07-16 01:14:47', NULL),
(3, 1, 2, 'Dove', 'dove', NULL, NULL, NULL, NULL, 'pcs', 50.0000, 'tracked', 1, 'fifo', 1, 100, 1, 1, '2026-07-25 16:57:09', '2026-07-25 16:57:09', NULL),
(4, 1, 3, 'Royal', 'royal', NULL, NULL, NULL, NULL, 'pcs', 15.0000, 'tracked', 1, 'fifo', 0, 30, 1, 1, '2026-07-26 10:06:51', '2026-07-26 10:06:51', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `products_backup_before_batching_20260725`
--

CREATE TABLE `products_backup_before_batching_20260725` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(180) NOT NULL,
  `slug` varchar(200) NOT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `barcode` varchar(120) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `unit` varchar(50) NOT NULL DEFAULT 'pcs',
  `cost_price` decimal(18,4) NOT NULL DEFAULT 0.0000,
  `selling_price` decimal(14,2) NOT NULL DEFAULT 0.00,
  `wholesale_price` decimal(14,2) DEFAULT NULL,
  `stock_tracking` enum('tracked','not_tracked') NOT NULL DEFAULT 'tracked',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products_backup_before_batching_20260725`
--

INSERT INTO `products_backup_before_batching_20260725` (`id`, `tenant_id`, `category_id`, `name`, `slug`, `sku`, `barcode`, `description`, `image_path`, `unit`, `cost_price`, `selling_price`, `wholesale_price`, `stock_tracking`, `is_active`, `created_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 1, 'qw', 'qw', 'QW', 'qw', '0', NULL, 'pcs', 10.0000, 50.00, 40.00, 'tracked', 1, 1, '2026-07-10 06:13:07', '2026-07-10 06:13:07', NULL),
(2, 1, 2, 'Safeguard', 'safeguard', 'QW1', NULL, NULL, NULL, 'pcs', 25.0000, 52.00, NULL, 'tracked', 1, 1, '2026-07-16 01:14:47', '2026-07-16 01:14:47', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `products_backup_before_batch_core_v3_20260725`
--

CREATE TABLE `products_backup_before_batch_core_v3_20260725` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(180) NOT NULL,
  `slug` varchar(200) NOT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `barcode` varchar(120) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `unit` varchar(50) NOT NULL DEFAULT 'pcs',
  `cost_price` decimal(18,4) NOT NULL DEFAULT 0.0000,
  `stock_tracking` enum('tracked','not_tracked') NOT NULL DEFAULT 'tracked',
  `batch_tracking_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `batch_issue_policy` enum('fifo','fefo','manual') NOT NULL DEFAULT 'fifo',
  `requires_expiration_date` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ;

--
-- Dumping data for table `products_backup_before_batch_core_v3_20260725`
--

INSERT INTO `products_backup_before_batch_core_v3_20260725` (`id`, `tenant_id`, `category_id`, `name`, `slug`, `sku`, `barcode`, `description`, `image_path`, `unit`, `cost_price`, `stock_tracking`, `batch_tracking_enabled`, `batch_issue_policy`, `requires_expiration_date`, `is_active`, `created_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 1, 'qw', 'qw', 'QW', 'qw', '0', NULL, 'pcs', 10.0000, 'tracked', 0, 'fifo', 0, 1, 1, '2026-07-10 06:13:07', '2026-07-10 06:13:07', NULL),
(2, 1, 2, 'Safeguard', 'safeguard', 'QW1', NULL, NULL, NULL, 'pcs', 25.0000, 'tracked', 0, 'fifo', 0, 1, 1, '2026-07-16 01:14:47', '2026-07-16 01:14:47', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `purchase_orders`
--

CREATE TABLE `purchase_orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `supplier_id` bigint(20) UNSIGNED NOT NULL,
  `branch_id` bigint(20) UNSIGNED NOT NULL,
  `warehouse_id` bigint(20) UNSIGNED NOT NULL,
  `po_number` varchar(80) NOT NULL,
  `order_date` date NOT NULL,
  `expected_delivery_date` date DEFAULT NULL,
  `status` enum('draft','pending','approved','partially_received','received','cancelled') NOT NULL DEFAULT 'draft',
  `payment_terms` varchar(100) DEFAULT NULL,
  `subtotal` decimal(14,2) NOT NULL DEFAULT 0.00,
  `discount_amount` decimal(14,2) NOT NULL DEFAULT 0.00,
  `tax_amount` decimal(14,2) NOT NULL DEFAULT 0.00,
  `shipping_amount` decimal(14,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(14,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `submitted_by` bigint(20) UNSIGNED DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `approved_by` bigint(20) UNSIGNED DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `cancelled_by` bigint(20) UNSIGNED DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `purchase_orders`
--

INSERT INTO `purchase_orders` (`id`, `tenant_id`, `supplier_id`, `branch_id`, `warehouse_id`, `po_number`, `order_date`, `expected_delivery_date`, `status`, `payment_terms`, `subtotal`, `discount_amount`, `tax_amount`, `shipping_amount`, `total_amount`, `notes`, `created_by`, `submitted_by`, `submitted_at`, `approved_by`, `approved_at`, `cancelled_by`, `cancelled_at`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 1, 3, 2, 'PO-20260720-RDS4QP', '2026-07-20', '5555-05-05', 'cancelled', 'qwerty', 25000.00, 2.00, 1.00, 20.00, 25019.00, NULL, 1, 1, '2026-07-20 04:33:18', NULL, NULL, 1, '2026-07-20 04:58:00', '2026-07-20 02:43:18', '2026-07-20 04:58:00', NULL),
(2, 1, 1, 3, 2, 'PO-20260720-ZLP2ZW', '2026-07-20', '2026-07-31', 'received', 'qwerty', 2500.00, 5.00, 2.00, 222.00, 2719.00, NULL, 1, 1, '2026-07-20 05:02:34', 1, '2026-07-20 05:19:16', NULL, NULL, '2026-07-20 04:54:27', '2026-07-20 05:48:37', NULL),
(3, 1, 1, 3, 2, 'PO-20260720-RTRG0E', '2026-07-20', '2026-07-22', 'draft', 'qwerty', 2000.00, 500.00, 200.00, 200.00, 1900.00, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-20 05:04:16', '2026-07-20 05:04:16', NULL),
(4, 1, 1, 3, 2, 'PO-20260721-IRZAO3', '2026-07-21', '2026-08-23', 'received', 'qwerty', 1250.00, 100.00, 50.00, 600.00, 1800.00, NULL, 1, 1, '2026-07-21 03:54:20', 1, '2026-07-21 03:54:26', NULL, NULL, '2026-07-21 03:54:16', '2026-07-21 03:54:45', NULL),
(5, 1, 2, 3, 2, 'PO-20260726-6QFBLO', '2026-07-26', '2026-07-27', 'received', 'Cash Before Delivery', 15000.00, 0.00, 0.00, 500.00, 15500.00, NULL, 1, 1, '2026-07-26 10:01:48', 1, '2026-07-26 10:01:59', NULL, NULL, '2026-07-26 10:01:42', '2026-07-26 11:38:47', NULL),
(6, 1, 2, 3, 2, 'PO-20260726-POEDFK', '2026-07-26', '2026-07-30', 'partially_received', 'Cash Before Delivery', 1500.00, 0.00, 0.00, 0.00, 1500.00, NULL, 1, 1, '2026-07-26 11:45:12', 1, '2026-07-26 11:45:23', NULL, NULL, '2026-07-26 11:44:52', '2026-07-26 11:45:40', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `purchase_order_items`
--

CREATE TABLE `purchase_order_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `purchase_order_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `product_name` varchar(180) NOT NULL,
  `product_sku` varchar(100) DEFAULT NULL,
  `unit` varchar(50) NOT NULL DEFAULT 'pcs',
  `quantity` decimal(14,3) NOT NULL DEFAULT 0.000,
  `received_quantity` decimal(14,3) NOT NULL DEFAULT 0.000,
  `unit_cost` decimal(18,4) NOT NULL DEFAULT 0.0000,
  `line_total` decimal(14,2) NOT NULL DEFAULT 0.00,
  `notes` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `purchase_order_items`
--

INSERT INTO `purchase_order_items` (`id`, `tenant_id`, `purchase_order_id`, `product_id`, `product_name`, `product_sku`, `unit`, `quantity`, `received_quantity`, `unit_cost`, `line_total`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 2, 'Safeguard', 'QW1', 'pcs', 1000.000, 0.000, 25.0000, 25000.00, NULL, '2026-07-20 02:43:18', '2026-07-20 02:43:18'),
(2, 1, 2, 2, 'Safeguard', 'QW1', 'pcs', 100.000, 100.000, 25.0000, 2500.00, NULL, '2026-07-20 04:54:27', '2026-07-20 05:48:37'),
(3, 1, 3, 1, 'qw', 'QW', 'pcs', 200.000, 0.000, 10.0000, 2000.00, NULL, '2026-07-20 05:04:16', '2026-07-20 05:04:16'),
(4, 1, 4, 2, 'Safeguard', 'QW1', 'pcs', 50.000, 50.000, 25.0000, 1250.00, NULL, '2026-07-21 03:54:16', '2026-07-21 03:54:45'),
(5, 1, 5, 3, 'Dove', NULL, 'pcs', 300.000, 300.000, 50.0000, 15000.00, NULL, '2026-07-26 10:01:42', '2026-07-26 11:38:47'),
(6, 1, 6, 4, 'Royal', NULL, 'pcs', 100.000, 99.998, 15.0000, 1500.00, NULL, '2026-07-26 11:44:52', '2026-07-26 11:45:40');

-- --------------------------------------------------------

--
-- Table structure for table `purchase_receipts`
--

CREATE TABLE `purchase_receipts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `purchase_order_id` bigint(20) UNSIGNED NOT NULL,
  `supplier_id` bigint(20) UNSIGNED NOT NULL,
  `branch_id` bigint(20) UNSIGNED NOT NULL,
  `warehouse_id` bigint(20) UNSIGNED NOT NULL,
  `receipt_number` varchar(80) NOT NULL,
  `delivery_reference` varchar(120) DEFAULT NULL,
  `received_date` date NOT NULL,
  `status` enum('posted','voided') NOT NULL DEFAULT 'posted',
  `total_quantity` decimal(14,3) NOT NULL DEFAULT 0.000,
  `total_amount` decimal(14,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `received_by` bigint(20) UNSIGNED DEFAULT NULL,
  `posted_at` timestamp NULL DEFAULT NULL,
  `voided_by` bigint(20) UNSIGNED DEFAULT NULL,
  `voided_at` timestamp NULL DEFAULT NULL,
  `void_reason` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `purchase_receipts`
--

INSERT INTO `purchase_receipts` (`id`, `tenant_id`, `purchase_order_id`, `supplier_id`, `branch_id`, `warehouse_id`, `receipt_number`, `delivery_reference`, `received_date`, `status`, `total_quantity`, `total_amount`, `notes`, `received_by`, `posted_at`, `voided_by`, `voided_at`, `void_reason`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 1, 3, 2, 'RCV-20260720-6YEO6T', NULL, '2026-07-20', 'posted', 100.000, 2500.00, NULL, 1, '2026-07-20 05:48:37', NULL, NULL, NULL, '2026-07-20 05:48:37', '2026-07-20 05:48:37'),
(2, 1, 4, 1, 3, 2, 'RCV-20260721-QHE5FY', NULL, '2026-07-21', 'posted', 50.000, 1250.00, NULL, 1, '2026-07-21 03:54:45', NULL, NULL, NULL, '2026-07-21 03:54:45', '2026-07-21 03:54:45'),
(5, 1, 5, 2, 3, 2, 'RCV-20260726-DBMC7J', NULL, '2026-07-26', 'posted', 300.000, 15000.00, NULL, 1, '2026-07-26 11:38:47', NULL, NULL, NULL, '2026-07-26 11:38:47', '2026-07-26 11:38:47'),
(6, 1, 6, 2, 3, 2, 'RCV-20260726-3ISROM', NULL, '2026-07-26', 'posted', 99.998, 1499.97, NULL, 1, '2026-07-26 11:45:40', NULL, NULL, NULL, '2026-07-26 11:45:40', '2026-07-26 11:45:40');

-- --------------------------------------------------------

--
-- Table structure for table `purchase_receipt_items`
--

CREATE TABLE `purchase_receipt_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `purchase_receipt_id` bigint(20) UNSIGNED NOT NULL,
  `purchase_order_item_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `stock_movement_id` bigint(20) UNSIGNED DEFAULT NULL,
  `void_stock_movement_id` bigint(20) UNSIGNED DEFAULT NULL,
  `product_name` varchar(180) NOT NULL,
  `product_sku` varchar(100) DEFAULT NULL,
  `unit` varchar(50) NOT NULL DEFAULT 'pcs',
  `quantity_received` decimal(14,3) NOT NULL DEFAULT 0.000,
  `unit_cost` decimal(18,4) NOT NULL DEFAULT 0.0000,
  `line_total` decimal(14,2) NOT NULL DEFAULT 0.00,
  `notes` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `purchase_receipt_items`
--

INSERT INTO `purchase_receipt_items` (`id`, `tenant_id`, `purchase_receipt_id`, `purchase_order_item_id`, `product_id`, `stock_movement_id`, `void_stock_movement_id`, `product_name`, `product_sku`, `unit`, `quantity_received`, `unit_cost`, `line_total`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 2, 2, 3, NULL, 'Safeguard', 'QW1', 'pcs', 100.000, 25.0000, 2500.00, NULL, '2026-07-20 05:48:37', '2026-07-20 05:48:37'),
(2, 1, 2, 4, 2, 4, NULL, 'Safeguard', 'QW1', 'pcs', 50.000, 25.0000, 1250.00, NULL, '2026-07-21 03:54:45', '2026-07-21 03:54:45'),
(5, 1, 5, 5, 3, 17, NULL, 'Dove', NULL, 'pcs', 300.000, 50.0000, 15000.00, NULL, '2026-07-26 11:38:47', '2026-07-26 11:38:47'),
(6, 1, 6, 6, 4, 19, NULL, 'Royal', NULL, 'pcs', 99.998, 15.0000, 1499.97, NULL, '2026-07-26 11:45:40', '2026-07-26 11:45:40');

-- --------------------------------------------------------

--
-- Table structure for table `purchase_receipt_item_batches`
--

CREATE TABLE `purchase_receipt_item_batches` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `purchase_receipt_item_id` bigint(20) UNSIGNED NOT NULL,
  `warehouse_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `stock_batch_id` bigint(20) UNSIGNED NOT NULL,
  `stock_movement_batch_id` bigint(20) UNSIGNED DEFAULT NULL,
  `void_stock_movement_batch_id` bigint(20) UNSIGNED DEFAULT NULL,
  `quantity_received` decimal(14,3) NOT NULL,
  `unit_cost` decimal(18,4) NOT NULL DEFAULT 0.0000,
  `line_total` decimal(18,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

--
-- Dumping data for table `purchase_receipt_item_batches`
--

INSERT INTO `purchase_receipt_item_batches` (`id`, `tenant_id`, `purchase_receipt_item_id`, `warehouse_id`, `product_id`, `stock_batch_id`, `stock_movement_batch_id`, `void_stock_movement_batch_id`, `quantity_received`, `unit_cost`, `line_total`, `created_at`, `updated_at`) VALUES
(1, 1, 5, 2, 3, 7, 6, NULL, 300.000, 50.0000, 15000.00, '2026-07-26 11:38:47', '2026-07-26 11:38:47'),
(2, 1, 6, 2, 4, 9, 8, NULL, 99.998, 15.0000, 1499.97, '2026-07-26 11:45:40', '2026-07-26 11:45:40');

-- --------------------------------------------------------

--
-- Table structure for table `stock_adjustments`
--

CREATE TABLE `stock_adjustments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `branch_id` bigint(20) UNSIGNED NOT NULL,
  `warehouse_id` bigint(20) UNSIGNED NOT NULL,
  `adjustment_number` varchar(80) NOT NULL,
  `adjustment_date` date NOT NULL,
  `adjustment_type` enum('opening_stock','stock_in','stock_out','correction_in','correction_out','stock_count_in','stock_count_out','damage','expired','lost_missing','return_in','return_out','other') NOT NULL,
  `status` enum('draft','posted','voided') NOT NULL DEFAULT 'draft',
  `reference_no` varchar(120) DEFAULT NULL,
  `reason` varchar(500) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `total_quantity` decimal(14,3) NOT NULL DEFAULT 0.000,
  `total_cost` decimal(18,2) NOT NULL DEFAULT 0.00,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `posted_by` bigint(20) UNSIGNED DEFAULT NULL,
  `posted_at` timestamp NULL DEFAULT NULL,
  `voided_by` bigint(20) UNSIGNED DEFAULT NULL,
  `voided_at` timestamp NULL DEFAULT NULL,
  `void_reason` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ;

--
-- Dumping data for table `stock_adjustments`
--

INSERT INTO `stock_adjustments` (`id`, `tenant_id`, `branch_id`, `warehouse_id`, `adjustment_number`, `adjustment_date`, `adjustment_type`, `status`, `reference_no`, `reason`, `notes`, `total_quantity`, `total_cost`, `created_by`, `posted_by`, `posted_at`, `voided_by`, `voided_at`, `void_reason`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 3, 2, 'OPEN-20260726005745-E1V5IK', '2026-07-26', 'opening_stock', 'posted', NULL, 'Initial warehouse stock position', NULL, 100.000, 5000.00, 1, 1, '2026-07-25 16:57:45', NULL, NULL, NULL, '2026-07-25 16:57:45', '2026-07-25 16:57:45', NULL),
(2, 1, 3, 2, 'STK-20260726010949-F7RBXI', '2026-07-26', 'stock_in', 'posted', NULL, 'Additional warehouse stock', NULL, 100.000, 5500.00, 1, 1, '2026-07-25 17:09:49', NULL, NULL, NULL, '2026-07-25 17:09:49', '2026-07-25 17:09:49', NULL),
(3, 1, 3, 2, 'OPEN-20260726180723-ZN0YLL', '2026-07-26', 'opening_stock', 'posted', NULL, 'Initial warehouse stock position', NULL, 20.000, 300.00, 1, 1, '2026-07-26 10:07:23', NULL, NULL, NULL, '2026-07-26 10:07:23', '2026-07-26 10:07:23', NULL),
(4, 1, 3, 2, 'STK-20260726194200-KR4M95', '2026-07-26', 'stock_in', 'posted', NULL, 'Additional warehouse stock', NULL, 50.000, 750.00, 1, 1, '2026-07-26 11:42:00', NULL, NULL, NULL, '2026-07-26 11:42:00', '2026-07-26 11:42:00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `stock_adjustment_items`
--

CREATE TABLE `stock_adjustment_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `stock_adjustment_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `direction` enum('in','out') NOT NULL,
  `quantity` decimal(14,3) NOT NULL,
  `unit_cost` decimal(18,4) NOT NULL DEFAULT 0.0000,
  `line_total` decimal(18,2) NOT NULL DEFAULT 0.00,
  `stock_movement_id` bigint(20) UNSIGNED DEFAULT NULL,
  `void_stock_movement_id` bigint(20) UNSIGNED DEFAULT NULL,
  `notes` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

--
-- Dumping data for table `stock_adjustment_items`
--

INSERT INTO `stock_adjustment_items` (`id`, `tenant_id`, `stock_adjustment_id`, `product_id`, `direction`, `quantity`, `unit_cost`, `line_total`, `stock_movement_id`, `void_stock_movement_id`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 3, 'in', 100.000, 50.0000, 5000.00, 12, NULL, NULL, '2026-07-25 16:57:45', '2026-07-25 16:57:45'),
(2, 1, 2, 3, 'in', 100.000, 55.0000, 5500.00, 13, NULL, NULL, '2026-07-25 17:09:49', '2026-07-25 17:09:49'),
(3, 1, 3, 4, 'in', 20.000, 15.0000, 300.00, 15, NULL, NULL, '2026-07-26 10:07:23', '2026-07-26 10:07:23'),
(4, 1, 4, 4, 'in', 50.000, 15.0000, 750.00, 18, NULL, NULL, '2026-07-26 11:42:00', '2026-07-26 11:42:00');

-- --------------------------------------------------------

--
-- Table structure for table `stock_adjustment_item_batches`
--

CREATE TABLE `stock_adjustment_item_batches` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `stock_adjustment_item_id` bigint(20) UNSIGNED NOT NULL,
  `warehouse_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `stock_batch_id` bigint(20) UNSIGNED NOT NULL,
  `direction` enum('in','out') NOT NULL,
  `quantity` decimal(14,3) NOT NULL,
  `unit_cost` decimal(18,4) NOT NULL DEFAULT 0.0000,
  `line_total` decimal(18,2) NOT NULL DEFAULT 0.00,
  `stock_movement_batch_id` bigint(20) UNSIGNED DEFAULT NULL,
  `void_stock_movement_batch_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

--
-- Dumping data for table `stock_adjustment_item_batches`
--

INSERT INTO `stock_adjustment_item_batches` (`id`, `tenant_id`, `stock_adjustment_item_id`, `warehouse_id`, `product_id`, `stock_batch_id`, `direction`, `quantity`, `unit_cost`, `line_total`, `stock_movement_batch_id`, `void_stock_movement_batch_id`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 2, 3, 4, 'in', 100.000, 50.0000, 5000.00, 1, NULL, '2026-07-25 16:57:45', '2026-07-25 16:57:45'),
(2, 1, 2, 2, 3, 5, 'in', 100.000, 55.0000, 5500.00, 2, NULL, '2026-07-25 17:09:49', '2026-07-25 17:09:49'),
(3, 1, 3, 2, 4, 6, 'in', 20.000, 15.0000, 300.00, 4, NULL, '2026-07-26 10:07:23', '2026-07-26 10:07:23'),
(4, 1, 4, 2, 4, 8, 'in', 50.000, 15.0000, 750.00, 7, NULL, '2026-07-26 11:42:00', '2026-07-26 11:42:00');

-- --------------------------------------------------------

--
-- Table structure for table `stock_batches`
--

CREATE TABLE `stock_batches` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `supplier_id` bigint(20) UNSIGNED DEFAULT NULL,
  `purchase_receipt_item_id` bigint(20) UNSIGNED DEFAULT NULL,
  `batch_code` varchar(100) NOT NULL,
  `lot_number` varchar(120) DEFAULT NULL,
  `source_type` enum('legacy_import','opening_stock','purchase_receipt','adjustment','transfer','return_in','other') NOT NULL DEFAULT 'other',
  `source_reference` varchar(120) DEFAULT NULL,
  `received_date` date NOT NULL,
  `manufactured_date` date DEFAULT NULL,
  `expiration_date` date DEFAULT NULL,
  `unit_cost` decimal(18,4) NOT NULL DEFAULT 0.0000,
  `original_quantity` decimal(14,3) NOT NULL DEFAULT 0.000,
  `status` enum('active','depleted','expired','quarantined','recalled','closed') NOT NULL DEFAULT 'active',
  `notes` text DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

--
-- Dumping data for table `stock_batches`
--

INSERT INTO `stock_batches` (`id`, `tenant_id`, `product_id`, `supplier_id`, `purchase_receipt_item_id`, `batch_code`, `lot_number`, `source_type`, `source_reference`, `received_date`, `manufactured_date`, `expiration_date`, `unit_cost`, `original_quantity`, `status`, `notes`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 1, 2, NULL, NULL, 'LEGACY-P2-W2', NULL, 'legacy_import', 'warehouse_stocks#2', '2026-07-23', NULL, NULL, 25.0000, 193.000, 'active', 'Legacy opening batch created from the existing warehouse stock balance before batch tracking was enabled.', NULL, '2026-07-16 01:15:06', '2026-07-25 06:19:00'),
(2, 1, 1, NULL, NULL, 'LEGACY-P1-W2', NULL, 'legacy_import', 'warehouse_stocks#5', '2026-07-24', NULL, NULL, 50.0000, 48.000, 'active', 'Legacy opening batch created from the existing warehouse stock balance before batch tracking was enabled.', NULL, '2026-07-23 02:50:39', '2026-07-25 06:19:00'),
(4, 1, 3, NULL, NULL, 'BAT-20260726-OS8H3I', NULL, 'opening_stock', 'OPEN-20260726005745-E1V5IK', '2026-07-26', NULL, '2026-07-31', 50.0000, 100.000, 'active', NULL, 1, '2026-07-25 16:57:45', '2026-07-26 04:27:50'),
(5, 1, 3, NULL, NULL, 'BAT-20260726-HPO0EO', NULL, 'adjustment', 'STK-20260726010949-F7RBXI', '2026-07-26', NULL, '2026-08-20', 55.0000, 100.000, 'active', NULL, 1, '2026-07-25 17:09:49', '2026-07-25 17:09:49'),
(6, 1, 4, NULL, NULL, 'BAT-20260726-WHVF5E', NULL, 'opening_stock', 'OPEN-20260726180723-ZN0YLL', '2026-07-26', NULL, NULL, 15.0000, 20.000, 'active', NULL, 1, '2026-07-26 10:07:23', '2026-07-26 10:07:23'),
(7, 1, 3, 2, 5, 'BAT-20260726-RPA9PX', NULL, 'purchase_receipt', 'RCV-20260726-DBMC7J', '2026-07-26', NULL, '2026-08-12', 50.0000, 300.000, 'active', NULL, 1, '2026-07-26 11:38:47', '2026-07-26 11:38:47'),
(8, 1, 4, NULL, NULL, 'BAT-20260726-SYA30Q', NULL, 'adjustment', 'STK-20260726194200-KR4M95', '2026-07-26', NULL, NULL, 15.0000, 50.000, 'active', NULL, 1, '2026-07-26 11:42:00', '2026-07-26 11:42:00'),
(9, 1, 4, 2, 6, 'BAT-20260726-HP0KJM', NULL, 'purchase_receipt', 'RCV-20260726-3ISROM', '2026-07-26', NULL, NULL, 15.0000, 99.998, 'active', NULL, 1, '2026-07-26 11:45:40', '2026-07-26 11:45:40');

-- --------------------------------------------------------

--
-- Table structure for table `stock_batches_backup_before_batch_core_v3_20260725`
--

CREATE TABLE `stock_batches_backup_before_batch_core_v3_20260725` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `supplier_id` bigint(20) UNSIGNED DEFAULT NULL,
  `purchase_receipt_item_id` bigint(20) UNSIGNED DEFAULT NULL,
  `batch_code` varchar(100) NOT NULL,
  `lot_number` varchar(120) DEFAULT NULL,
  `source_type` enum('legacy_import','opening_stock','purchase_receipt','adjustment','transfer','return_in','other') NOT NULL DEFAULT 'other',
  `source_reference` varchar(120) DEFAULT NULL,
  `received_date` date NOT NULL,
  `manufactured_date` date DEFAULT NULL,
  `expiration_date` date DEFAULT NULL,
  `unit_cost` decimal(18,4) NOT NULL DEFAULT 0.0000,
  `original_quantity` decimal(14,3) NOT NULL DEFAULT 0.000,
  `status` enum('active','depleted','expired','quarantined','recalled','closed') NOT NULL DEFAULT 'active',
  `notes` text DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

--
-- Dumping data for table `stock_batches_backup_before_batch_core_v3_20260725`
--

INSERT INTO `stock_batches_backup_before_batch_core_v3_20260725` (`id`, `tenant_id`, `product_id`, `supplier_id`, `purchase_receipt_item_id`, `batch_code`, `lot_number`, `source_type`, `source_reference`, `received_date`, `manufactured_date`, `expiration_date`, `unit_cost`, `original_quantity`, `status`, `notes`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 1, 2, NULL, NULL, 'LEGACY-P2-W2', NULL, 'legacy_import', 'warehouse_stocks#2', '2026-07-23', NULL, NULL, 25.0000, 193.000, 'active', 'Legacy opening batch created from the existing warehouse stock balance before batch tracking was enabled.', NULL, '2026-07-16 01:15:06', '2026-07-25 06:19:00'),
(2, 1, 1, NULL, NULL, 'LEGACY-P1-W2', NULL, 'legacy_import', 'warehouse_stocks#5', '2026-07-24', NULL, NULL, 50.0000, 48.000, 'active', 'Legacy opening batch created from the existing warehouse stock balance before batch tracking was enabled.', NULL, '2026-07-23 02:50:39', '2026-07-25 06:19:00');

-- --------------------------------------------------------

--
-- Table structure for table `stock_batch_status_histories`
--

CREATE TABLE `stock_batch_status_histories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `stock_batch_id` bigint(20) UNSIGNED NOT NULL,
  `previous_status` enum('active','depleted','expired','quarantined','recalled','closed') DEFAULT NULL,
  `new_status` enum('active','depleted','expired','quarantined','recalled','closed') NOT NULL,
  `reason` varchar(500) DEFAULT NULL,
  `reference_type` varchar(100) DEFAULT NULL,
  `reference_id` bigint(20) UNSIGNED DEFAULT NULL,
  `reference_no` varchar(120) DEFAULT NULL,
  `changed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `changed_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stock_issuances`
--

CREATE TABLE `stock_issuances` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `branch_id` bigint(20) UNSIGNED NOT NULL,
  `warehouse_id` bigint(20) UNSIGNED NOT NULL,
  `issuance_number` varchar(80) NOT NULL,
  `issuance_date` date NOT NULL,
  `reason` enum('used_consumed','employee_issuance','department_issuance','damaged','expired','lost_missing','giveaway_sample','other') NOT NULL,
  `issued_to` varchar(150) DEFAULT NULL,
  `department` varchar(150) DEFAULT NULL,
  `purpose` varchar(500) DEFAULT NULL,
  `reference_no` varchar(120) DEFAULT NULL,
  `status` enum('posted','voided') NOT NULL DEFAULT 'posted',
  `total_quantity` decimal(14,3) NOT NULL DEFAULT 0.000,
  `total_cost` decimal(18,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `issued_by` bigint(20) UNSIGNED DEFAULT NULL,
  `posted_at` timestamp NULL DEFAULT NULL,
  `voided_by` bigint(20) UNSIGNED DEFAULT NULL,
  `voided_at` timestamp NULL DEFAULT NULL,
  `void_reason` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stock_issuances`
--

INSERT INTO `stock_issuances` (`id`, `tenant_id`, `branch_id`, `warehouse_id`, `issuance_number`, `issuance_date`, `reason`, `issued_to`, `department`, `purpose`, `reference_no`, `status`, `total_quantity`, `total_cost`, `notes`, `issued_by`, `posted_at`, `voided_by`, `voided_at`, `void_reason`, `created_at`, `updated_at`) VALUES
(1, 1, 3, 2, 'ISS-20260721-UOEW3U', '2026-07-21', 'used_consumed', NULL, NULL, NULL, NULL, 'posted', 1.000, 25.00, NULL, 1, '2026-07-21 08:46:29', NULL, NULL, NULL, '2026-07-21 08:46:29', '2026-07-21 08:46:29'),
(2, 1, 3, 2, 'ISS-20260721-JOSTEU', '2026-07-21', 'used_consumed', NULL, NULL, NULL, NULL, 'posted', 1.000, 25.00, NULL, 1, '2026-07-21 08:46:44', NULL, NULL, NULL, '2026-07-21 08:46:44', '2026-07-21 08:46:44'),
(3, 1, 3, 2, 'ISS-20260723-P8RPMR', '2026-07-23', 'used_consumed', NULL, NULL, NULL, NULL, 'posted', 3.000, 75.00, NULL, 1, '2026-07-23 01:19:10', NULL, NULL, NULL, '2026-07-23 01:19:10', '2026-07-23 01:19:10'),
(4, 1, 3, 2, 'ISS-20260723-C8KYGF', '2026-07-23', 'used_consumed', 'jc', 'jcjc', NULL, 'cjjjjc', 'posted', 2.000, 50.00, NULL, 1, '2026-07-23 01:19:39', NULL, NULL, NULL, '2026-07-23 01:19:39', '2026-07-23 01:19:39'),
(5, 1, 3, 2, 'ISS-20260723-GGYKMP', '2026-07-23', 'used_consumed', NULL, NULL, NULL, NULL, 'posted', 1.000, 50.00, NULL, 1, '2026-07-23 03:26:50', NULL, NULL, NULL, '2026-07-23 03:26:50', '2026-07-23 03:26:50'),
(6, 1, 3, 2, 'ISS-20260724-T6FGMY', '2026-07-24', 'used_consumed', NULL, NULL, NULL, NULL, 'posted', 1.000, 50.00, NULL, 1, '2026-07-24 05:52:53', NULL, NULL, NULL, '2026-07-24 05:52:53', '2026-07-24 05:52:53'),
(7, 1, 3, 2, 'ISS-20260726-BS8W3J', '2026-07-26', 'used_consumed', NULL, NULL, NULL, NULL, 'posted', 13.000, 650.00, NULL, 1, '2026-07-26 02:35:26', NULL, NULL, NULL, '2026-07-26 02:35:26', '2026-07-26 04:27:50'),
(8, 1, 3, 2, 'ISS-20260726-GMMSKT', '2026-07-26', 'used_consumed', NULL, NULL, NULL, NULL, 'posted', 2.000, 30.00, NULL, 1, '2026-07-26 11:35:37', NULL, NULL, NULL, '2026-07-26 11:35:37', '2026-07-26 11:35:37'),
(9, 1, 3, 2, 'ISS-20260726-AEYWWI', '2026-07-26', 'used_consumed', NULL, NULL, NULL, NULL, 'posted', 5.000, 190.00, NULL, 1, '2026-07-26 14:33:05', NULL, NULL, NULL, '2026-07-26 14:33:05', '2026-07-26 14:33:05'),
(10, 1, 3, 2, 'ISS-20260726-B66V0Y', '2026-07-26', 'used_consumed', NULL, NULL, NULL, NULL, 'posted', 5.000, 250.00, NULL, 1, '2026-07-26 14:33:11', NULL, NULL, NULL, '2026-07-26 14:33:11', '2026-07-26 14:33:11');

-- --------------------------------------------------------

--
-- Table structure for table `stock_issuance_items`
--

CREATE TABLE `stock_issuance_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `stock_issuance_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `stock_movement_id` bigint(20) UNSIGNED DEFAULT NULL,
  `void_stock_movement_id` bigint(20) UNSIGNED DEFAULT NULL,
  `product_name` varchar(180) NOT NULL,
  `product_sku` varchar(100) DEFAULT NULL,
  `unit` varchar(50) NOT NULL DEFAULT 'pcs',
  `quantity_issued` decimal(14,3) NOT NULL DEFAULT 0.000,
  `unit_cost` decimal(18,4) NOT NULL DEFAULT 0.0000,
  `line_total` decimal(18,2) NOT NULL DEFAULT 0.00,
  `notes` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stock_issuance_items`
--

INSERT INTO `stock_issuance_items` (`id`, `tenant_id`, `stock_issuance_id`, `product_id`, `stock_movement_id`, `void_stock_movement_id`, `product_name`, `product_sku`, `unit`, `quantity_issued`, `unit_cost`, `line_total`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 2, 5, NULL, 'Safeguard', 'QW1', 'pcs', 1.000, 25.0000, 25.00, NULL, '2026-07-21 08:46:29', '2026-07-21 08:46:29'),
(2, 1, 2, 2, 6, NULL, 'Safeguard', 'QW1', 'pcs', 1.000, 25.0000, 25.00, NULL, '2026-07-21 08:46:44', '2026-07-21 08:46:44'),
(3, 1, 3, 2, 7, NULL, 'Safeguard', 'QW1', 'pcs', 3.000, 25.0000, 75.00, NULL, '2026-07-23 01:19:10', '2026-07-23 01:19:10'),
(4, 1, 4, 2, 8, NULL, 'Safeguard', 'QW1', 'pcs', 2.000, 25.0000, 50.00, NULL, '2026-07-23 01:19:39', '2026-07-23 01:19:39'),
(5, 1, 5, 1, 10, NULL, 'qw', 'QW', 'pcs', 1.000, 50.0000, 50.00, NULL, '2026-07-23 03:26:50', '2026-07-23 03:26:50'),
(6, 1, 6, 1, 11, NULL, 'qw', 'QW', 'pcs', 1.000, 50.0000, 50.00, NULL, '2026-07-24 05:52:53', '2026-07-24 05:52:53'),
(7, 1, 7, 3, 14, NULL, 'Dove', NULL, 'pcs', 13.000, 50.0000, 650.00, NULL, '2026-07-26 02:35:26', '2026-07-26 04:27:50'),
(8, 1, 8, 4, 16, NULL, 'Royal', NULL, 'pcs', 2.000, 15.0000, 30.00, NULL, '2026-07-26 11:35:37', '2026-07-26 11:35:37'),
(9, 1, 9, 1, 20, NULL, 'qw', 'QW', 'pcs', 1.000, 50.0000, 50.00, NULL, '2026-07-26 14:33:05', '2026-07-26 14:33:05'),
(10, 1, 9, 4, 21, NULL, 'Royal', NULL, 'pcs', 1.000, 15.0000, 15.00, NULL, '2026-07-26 14:33:05', '2026-07-26 14:33:05'),
(11, 1, 9, 2, 22, NULL, 'Safeguard', 'QW1', 'pcs', 1.000, 25.0000, 25.00, NULL, '2026-07-26 14:33:05', '2026-07-26 14:33:05'),
(12, 1, 9, 3, 23, NULL, 'Dove', NULL, 'pcs', 2.000, 50.0000, 100.00, NULL, '2026-07-26 14:33:05', '2026-07-26 14:33:05'),
(13, 1, 10, 3, 24, NULL, 'Dove', NULL, 'pcs', 5.000, 50.0000, 250.00, NULL, '2026-07-26 14:33:11', '2026-07-26 14:33:11');

-- --------------------------------------------------------

--
-- Table structure for table `stock_issuance_item_batches`
--

CREATE TABLE `stock_issuance_item_batches` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `stock_issuance_item_id` bigint(20) UNSIGNED NOT NULL,
  `warehouse_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `stock_batch_id` bigint(20) UNSIGNED NOT NULL,
  `stock_movement_batch_id` bigint(20) UNSIGNED DEFAULT NULL,
  `void_stock_movement_batch_id` bigint(20) UNSIGNED DEFAULT NULL,
  `quantity_issued` decimal(14,3) NOT NULL,
  `unit_cost` decimal(18,4) NOT NULL DEFAULT 0.0000,
  `line_total` decimal(18,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

--
-- Dumping data for table `stock_issuance_item_batches`
--

INSERT INTO `stock_issuance_item_batches` (`id`, `tenant_id`, `stock_issuance_item_id`, `warehouse_id`, `product_id`, `stock_batch_id`, `stock_movement_batch_id`, `void_stock_movement_batch_id`, `quantity_issued`, `unit_cost`, `line_total`, `created_at`, `updated_at`) VALUES
(1, 1, 7, 2, 3, 4, 3, NULL, 13.000, 50.0000, 650.00, '2026-07-26 02:35:26', '2026-07-26 04:27:50'),
(2, 1, 8, 2, 4, 6, 5, NULL, 2.000, 15.0000, 30.00, '2026-07-26 11:35:37', '2026-07-26 11:35:37'),
(3, 1, 9, 2, 1, 2, 9, NULL, 1.000, 50.0000, 50.00, '2026-07-26 14:33:05', '2026-07-26 14:33:05'),
(4, 1, 10, 2, 4, 6, 10, NULL, 1.000, 15.0000, 15.00, '2026-07-26 14:33:05', '2026-07-26 14:33:05'),
(5, 1, 11, 2, 2, 1, 11, NULL, 1.000, 25.0000, 25.00, '2026-07-26 14:33:05', '2026-07-26 14:33:05'),
(6, 1, 12, 2, 3, 4, 12, NULL, 2.000, 50.0000, 100.00, '2026-07-26 14:33:05', '2026-07-26 14:33:05'),
(7, 1, 13, 2, 3, 4, 13, NULL, 5.000, 50.0000, 250.00, '2026-07-26 14:33:11', '2026-07-26 14:33:11');

-- --------------------------------------------------------

--
-- Table structure for table `stock_movements`
--

CREATE TABLE `stock_movements` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `warehouse_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `is_batch_tracked` tinyint(1) NOT NULL DEFAULT 0,
  `batch_allocation_status` enum('not_required','pending','allocated','reversed') NOT NULL DEFAULT 'not_required',
  `movement_type` enum('opening_stock','stock_in','stock_out','adjustment_in','adjustment_out','transfer_in','transfer_out','purchase_receipt','purchase_receipt_void','sale','return_in','return_out','damage','expired') NOT NULL,
  `quantity` decimal(14,3) NOT NULL,
  `quantity_before` decimal(14,3) NOT NULL DEFAULT 0.000,
  `quantity_after` decimal(14,3) NOT NULL DEFAULT 0.000,
  `unit_cost` decimal(18,4) NOT NULL DEFAULT 0.0000,
  `total_cost` decimal(18,2) NOT NULL DEFAULT 0.00,
  `average_cost_before` decimal(18,4) DEFAULT NULL,
  `average_cost_after` decimal(18,4) DEFAULT NULL,
  `reference_type` varchar(100) DEFAULT NULL,
  `reference_id` bigint(20) UNSIGNED DEFAULT NULL,
  `reference_no` varchar(120) DEFAULT NULL,
  `related_warehouse_id` bigint(20) UNSIGNED DEFAULT NULL,
  `reversal_of_movement_id` bigint(20) UNSIGNED DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `movement_date` datetime NOT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stock_movements`
--

INSERT INTO `stock_movements` (`id`, `tenant_id`, `warehouse_id`, `product_id`, `is_batch_tracked`, `batch_allocation_status`, `movement_type`, `quantity`, `quantity_before`, `quantity_after`, `unit_cost`, `total_cost`, `average_cost_before`, `average_cost_after`, `reference_type`, `reference_id`, `reference_no`, `related_warehouse_id`, `reversal_of_movement_id`, `remarks`, `movement_date`, `created_by`, `created_at`, `updated_at`) VALUES
(2, 1, 2, 2, 0, 'not_required', 'opening_stock', 50.000, 0.000, 50.000, 25.0000, 1250.00, NULL, NULL, 'opening_stock', NULL, 'OPEN-20260716091506-KN1VI1', NULL, NULL, NULL, '2026-07-16 09:15:06', 1, '2026-07-16 01:15:06', '2026-07-16 01:15:06'),
(3, 1, 2, 2, 0, 'not_required', 'purchase_receipt', 100.000, 50.000, 150.000, 25.0000, 2500.00, 25.0000, 25.0000, 'purchase_receipt', 1, 'RCV-20260720-6YEO6T', NULL, NULL, 'Received from PO PO-20260720-ZLP2ZW', '2026-07-20 13:48:37', 1, '2026-07-20 05:48:37', '2026-07-20 05:48:37'),
(4, 1, 2, 2, 0, 'not_required', 'purchase_receipt', 50.000, 150.000, 200.000, 25.0000, 1250.00, 25.0000, 25.0000, 'purchase_receipt', 2, 'RCV-20260721-QHE5FY', NULL, NULL, 'Received from PO PO-20260721-IRZAO3', '2026-07-21 11:54:45', 1, '2026-07-21 03:54:45', '2026-07-21 03:54:45'),
(5, 1, 2, 2, 0, 'not_required', 'stock_out', 1.000, 200.000, 199.000, 25.0000, 25.00, 25.0000, 25.0000, 'stock_issuance', 1, 'ISS-20260721-UOEW3U', NULL, NULL, 'Stock issuance ISS-20260721-UOEW3U | Reason: Used / Consumed', '2026-07-21 16:46:29', 1, '2026-07-21 08:46:29', '2026-07-21 08:46:29'),
(6, 1, 2, 2, 0, 'not_required', 'stock_out', 1.000, 199.000, 198.000, 25.0000, 25.00, 25.0000, 25.0000, 'stock_issuance', 2, 'ISS-20260721-JOSTEU', NULL, NULL, 'Stock issuance ISS-20260721-JOSTEU | Reason: Used / Consumed', '2026-07-21 16:46:44', 1, '2026-07-21 08:46:44', '2026-07-21 08:46:44'),
(7, 1, 2, 2, 0, 'not_required', 'stock_out', 3.000, 198.000, 195.000, 25.0000, 75.00, 25.0000, 25.0000, 'stock_issuance', 3, 'ISS-20260723-P8RPMR', NULL, NULL, 'Stock issuance ISS-20260723-P8RPMR | Reason: Used / Consumed', '2026-07-23 09:19:10', 1, '2026-07-23 01:19:10', '2026-07-23 01:19:10'),
(8, 1, 2, 2, 0, 'not_required', 'stock_out', 2.000, 195.000, 193.000, 25.0000, 50.00, 25.0000, 25.0000, 'stock_issuance', 4, 'ISS-20260723-C8KYGF', NULL, NULL, 'Stock issuance ISS-20260723-C8KYGF | Reason: Used / Consumed | Issued to: jc | Department: jcjc | Reference: cjjjjc', '2026-07-23 09:19:39', 1, '2026-07-23 01:19:39', '2026-07-23 01:19:39'),
(9, 1, 2, 1, 0, 'not_required', 'opening_stock', 50.000, 0.000, 50.000, 50.0000, 2500.00, NULL, NULL, 'opening_stock', NULL, 'OPEN-20260723105039-C7QTY3', NULL, NULL, NULL, '2026-07-23 10:50:39', 1, '2026-07-23 02:50:39', '2026-07-23 02:50:39'),
(10, 1, 2, 1, 0, 'not_required', 'stock_out', 1.000, 50.000, 49.000, 50.0000, 50.00, 50.0000, 50.0000, 'stock_issuance', 5, 'ISS-20260723-GGYKMP', NULL, NULL, 'Stock issuance ISS-20260723-GGYKMP | Reason: Used / Consumed', '2026-07-23 11:26:50', 1, '2026-07-23 03:26:50', '2026-07-23 03:26:50'),
(11, 1, 2, 1, 0, 'not_required', 'stock_out', 1.000, 49.000, 48.000, 50.0000, 50.00, 50.0000, 50.0000, 'stock_issuance', 6, 'ISS-20260724-T6FGMY', NULL, NULL, 'Stock issuance ISS-20260724-T6FGMY | Reason: Used / Consumed', '2026-07-24 13:52:53', 1, '2026-07-24 05:52:53', '2026-07-24 05:52:53'),
(12, 1, 2, 3, 1, 'allocated', 'opening_stock', 100.000, 0.000, 100.000, 50.0000, 5000.00, 0.0000, 50.0000, 'stock_adjustment', 1, 'OPEN-20260726005745-E1V5IK', NULL, NULL, NULL, '2026-07-26 00:57:45', 1, '2026-07-25 16:57:45', '2026-07-25 16:57:45'),
(13, 1, 2, 3, 1, 'allocated', 'stock_in', 100.000, 100.000, 200.000, 55.0000, 5500.00, 50.0000, 52.5000, 'stock_adjustment', 2, 'STK-20260726010949-F7RBXI', NULL, NULL, NULL, '2026-07-26 01:09:49', 1, '2026-07-25 17:09:49', '2026-07-25 17:09:49'),
(14, 1, 2, 3, 1, 'allocated', 'stock_out', 13.000, 200.000, 187.000, 50.0000, 650.00, 52.5000, 52.6738, 'stock_issuance', 7, 'ISS-20260726-BS8W3J', NULL, NULL, 'Stock issuance ISS-20260726-BS8W3J | Reason: Used / Consumed', '2026-07-26 10:35:26', 1, '2026-07-26 02:35:26', '2026-07-26 04:27:50'),
(15, 1, 2, 4, 1, 'allocated', 'opening_stock', 20.000, 0.000, 20.000, 15.0000, 300.00, 0.0000, 15.0000, 'stock_adjustment', 3, 'OPEN-20260726180723-ZN0YLL', NULL, NULL, NULL, '2026-07-26 18:07:23', 1, '2026-07-26 10:07:23', '2026-07-26 10:07:23'),
(16, 1, 2, 4, 1, 'allocated', 'stock_out', 2.000, 20.000, 18.000, 15.0000, 30.00, 15.0000, 15.0000, 'stock_issuance', 8, 'ISS-20260726-GMMSKT', NULL, NULL, 'Stock issuance ISS-20260726-GMMSKT | Reason: Used / Consumed', '2026-07-26 19:35:37', 1, '2026-07-26 11:35:37', '2026-07-26 11:35:37'),
(17, 1, 2, 3, 1, 'allocated', 'purchase_receipt', 300.000, 187.000, 487.000, 50.0000, 15000.00, 52.6738, 51.0267, 'purchase_receipt', 5, 'RCV-20260726-DBMC7J', NULL, NULL, 'Received from PO PO-20260726-6QFBLO', '2026-07-26 19:38:47', 1, '2026-07-26 11:38:47', '2026-07-26 11:38:47'),
(18, 1, 2, 4, 1, 'allocated', 'stock_in', 50.000, 18.000, 68.000, 15.0000, 750.00, 15.0000, 15.0000, 'stock_adjustment', 4, 'STK-20260726194200-KR4M95', NULL, NULL, NULL, '2026-07-26 19:42:00', 1, '2026-07-26 11:42:00', '2026-07-26 11:42:00'),
(19, 1, 2, 4, 1, 'allocated', 'purchase_receipt', 99.998, 68.000, 167.998, 15.0000, 1499.97, 15.0000, 15.0000, 'purchase_receipt', 6, 'RCV-20260726-3ISROM', NULL, NULL, 'Received from PO PO-20260726-POEDFK', '2026-07-26 19:45:40', 1, '2026-07-26 11:45:40', '2026-07-26 11:45:40'),
(20, 1, 2, 1, 1, 'allocated', 'stock_out', 1.000, 48.000, 47.000, 50.0000, 50.00, 50.0000, 50.0000, 'stock_issuance', 9, 'ISS-20260726-AEYWWI', NULL, NULL, 'Stock issuance ISS-20260726-AEYWWI | Reason: Used / Consumed', '2026-07-26 22:33:05', 1, '2026-07-26 14:33:05', '2026-07-26 14:33:05'),
(21, 1, 2, 4, 1, 'allocated', 'stock_out', 1.000, 167.998, 166.998, 15.0000, 15.00, 15.0000, 15.0000, 'stock_issuance', 9, 'ISS-20260726-AEYWWI', NULL, NULL, 'Stock issuance ISS-20260726-AEYWWI | Reason: Used / Consumed', '2026-07-26 22:33:05', 1, '2026-07-26 14:33:05', '2026-07-26 14:33:05'),
(22, 1, 2, 2, 1, 'allocated', 'stock_out', 1.000, 193.000, 192.000, 25.0000, 25.00, 25.0000, 25.0000, 'stock_issuance', 9, 'ISS-20260726-AEYWWI', NULL, NULL, 'Stock issuance ISS-20260726-AEYWWI | Reason: Used / Consumed', '2026-07-26 22:33:05', 1, '2026-07-26 14:33:05', '2026-07-26 14:33:05'),
(23, 1, 2, 3, 1, 'allocated', 'stock_out', 2.000, 487.000, 485.000, 50.0000, 100.00, 51.0267, 51.0309, 'stock_issuance', 9, 'ISS-20260726-AEYWWI', NULL, NULL, 'Stock issuance ISS-20260726-AEYWWI | Reason: Used / Consumed', '2026-07-26 22:33:05', 1, '2026-07-26 14:33:05', '2026-07-26 14:33:05'),
(24, 1, 2, 3, 1, 'allocated', 'stock_out', 5.000, 485.000, 480.000, 50.0000, 250.00, 51.0309, 51.0417, 'stock_issuance', 10, 'ISS-20260726-B66V0Y', NULL, NULL, 'Stock issuance ISS-20260726-B66V0Y | Reason: Used / Consumed', '2026-07-26 22:33:11', 1, '2026-07-26 14:33:11', '2026-07-26 14:33:11');

-- --------------------------------------------------------

--
-- Table structure for table `stock_movements_backup_before_batch_core_v3_20260725`
--

CREATE TABLE `stock_movements_backup_before_batch_core_v3_20260725` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `warehouse_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `movement_type` enum('opening_stock','stock_in','stock_out','adjustment_in','adjustment_out','transfer_in','transfer_out','purchase_receipt','purchase_receipt_void','sale','return_in','return_out','damage','expired') NOT NULL,
  `quantity` decimal(14,3) NOT NULL,
  `quantity_before` decimal(14,3) NOT NULL DEFAULT 0.000,
  `quantity_after` decimal(14,3) NOT NULL DEFAULT 0.000,
  `unit_cost` decimal(18,4) NOT NULL DEFAULT 0.0000,
  `total_cost` decimal(18,2) NOT NULL DEFAULT 0.00,
  `average_cost_before` decimal(18,4) DEFAULT NULL,
  `average_cost_after` decimal(18,4) DEFAULT NULL,
  `reference_type` varchar(100) DEFAULT NULL,
  `reference_id` bigint(20) UNSIGNED DEFAULT NULL,
  `reference_no` varchar(120) DEFAULT NULL,
  `related_warehouse_id` bigint(20) UNSIGNED DEFAULT NULL,
  `reversal_of_movement_id` bigint(20) UNSIGNED DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `movement_date` datetime NOT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stock_movements_backup_before_batch_core_v3_20260725`
--

INSERT INTO `stock_movements_backup_before_batch_core_v3_20260725` (`id`, `tenant_id`, `warehouse_id`, `product_id`, `movement_type`, `quantity`, `quantity_before`, `quantity_after`, `unit_cost`, `total_cost`, `average_cost_before`, `average_cost_after`, `reference_type`, `reference_id`, `reference_no`, `related_warehouse_id`, `reversal_of_movement_id`, `remarks`, `movement_date`, `created_by`, `created_at`, `updated_at`) VALUES
(2, 1, 2, 2, 'opening_stock', 50.000, 0.000, 50.000, 25.0000, 1250.00, NULL, NULL, 'opening_stock', NULL, 'OPEN-20260716091506-KN1VI1', NULL, NULL, NULL, '2026-07-16 09:15:06', 1, '2026-07-16 01:15:06', '2026-07-16 01:15:06'),
(3, 1, 2, 2, 'purchase_receipt', 100.000, 50.000, 150.000, 25.0000, 2500.00, 25.0000, 25.0000, 'purchase_receipt', 1, 'RCV-20260720-6YEO6T', NULL, NULL, 'Received from PO PO-20260720-ZLP2ZW', '2026-07-20 13:48:37', 1, '2026-07-20 05:48:37', '2026-07-20 05:48:37'),
(4, 1, 2, 2, 'purchase_receipt', 50.000, 150.000, 200.000, 25.0000, 1250.00, 25.0000, 25.0000, 'purchase_receipt', 2, 'RCV-20260721-QHE5FY', NULL, NULL, 'Received from PO PO-20260721-IRZAO3', '2026-07-21 11:54:45', 1, '2026-07-21 03:54:45', '2026-07-21 03:54:45'),
(5, 1, 2, 2, 'stock_out', 1.000, 200.000, 199.000, 25.0000, 25.00, 25.0000, 25.0000, 'stock_issuance', 1, 'ISS-20260721-UOEW3U', NULL, NULL, 'Stock issuance ISS-20260721-UOEW3U | Reason: Used / Consumed', '2026-07-21 16:46:29', 1, '2026-07-21 08:46:29', '2026-07-21 08:46:29'),
(6, 1, 2, 2, 'stock_out', 1.000, 199.000, 198.000, 25.0000, 25.00, 25.0000, 25.0000, 'stock_issuance', 2, 'ISS-20260721-JOSTEU', NULL, NULL, 'Stock issuance ISS-20260721-JOSTEU | Reason: Used / Consumed', '2026-07-21 16:46:44', 1, '2026-07-21 08:46:44', '2026-07-21 08:46:44'),
(7, 1, 2, 2, 'stock_out', 3.000, 198.000, 195.000, 25.0000, 75.00, 25.0000, 25.0000, 'stock_issuance', 3, 'ISS-20260723-P8RPMR', NULL, NULL, 'Stock issuance ISS-20260723-P8RPMR | Reason: Used / Consumed', '2026-07-23 09:19:10', 1, '2026-07-23 01:19:10', '2026-07-23 01:19:10'),
(8, 1, 2, 2, 'stock_out', 2.000, 195.000, 193.000, 25.0000, 50.00, 25.0000, 25.0000, 'stock_issuance', 4, 'ISS-20260723-C8KYGF', NULL, NULL, 'Stock issuance ISS-20260723-C8KYGF | Reason: Used / Consumed | Issued to: jc | Department: jcjc | Reference: cjjjjc', '2026-07-23 09:19:39', 1, '2026-07-23 01:19:39', '2026-07-23 01:19:39'),
(9, 1, 2, 1, 'opening_stock', 50.000, 0.000, 50.000, 50.0000, 2500.00, NULL, NULL, 'opening_stock', NULL, 'OPEN-20260723105039-C7QTY3', NULL, NULL, NULL, '2026-07-23 10:50:39', 1, '2026-07-23 02:50:39', '2026-07-23 02:50:39'),
(10, 1, 2, 1, 'stock_out', 1.000, 50.000, 49.000, 50.0000, 50.00, 50.0000, 50.0000, 'stock_issuance', 5, 'ISS-20260723-GGYKMP', NULL, NULL, 'Stock issuance ISS-20260723-GGYKMP | Reason: Used / Consumed', '2026-07-23 11:26:50', 1, '2026-07-23 03:26:50', '2026-07-23 03:26:50'),
(11, 1, 2, 1, 'stock_out', 1.000, 49.000, 48.000, 50.0000, 50.00, 50.0000, 50.0000, 'stock_issuance', 6, 'ISS-20260724-T6FGMY', NULL, NULL, 'Stock issuance ISS-20260724-T6FGMY | Reason: Used / Consumed', '2026-07-24 13:52:53', 1, '2026-07-24 05:52:53', '2026-07-24 05:52:53');

-- --------------------------------------------------------

--
-- Table structure for table `stock_movement_batches`
--

CREATE TABLE `stock_movement_batches` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `stock_movement_id` bigint(20) UNSIGNED NOT NULL,
  `warehouse_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `stock_batch_id` bigint(20) UNSIGNED NOT NULL,
  `reversal_of_stock_movement_batch_id` bigint(20) UNSIGNED DEFAULT NULL,
  `direction` enum('in','out') NOT NULL,
  `quantity` decimal(14,3) NOT NULL,
  `batch_quantity_before` decimal(14,3) NOT NULL DEFAULT 0.000,
  `batch_quantity_after` decimal(14,3) NOT NULL DEFAULT 0.000,
  `unit_cost` decimal(18,4) NOT NULL DEFAULT 0.0000,
  `total_cost` decimal(18,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

--
-- Dumping data for table `stock_movement_batches`
--

INSERT INTO `stock_movement_batches` (`id`, `tenant_id`, `stock_movement_id`, `warehouse_id`, `product_id`, `stock_batch_id`, `reversal_of_stock_movement_batch_id`, `direction`, `quantity`, `batch_quantity_before`, `batch_quantity_after`, `unit_cost`, `total_cost`, `created_at`, `updated_at`) VALUES
(1, 1, 12, 2, 3, 4, NULL, 'in', 100.000, 0.000, 100.000, 50.0000, 5000.00, '2026-07-25 16:57:45', '2026-07-25 16:57:45'),
(2, 1, 13, 2, 3, 5, NULL, 'in', 100.000, 0.000, 100.000, 55.0000, 5500.00, '2026-07-25 17:09:49', '2026-07-25 17:09:49'),
(3, 1, 14, 2, 3, 4, NULL, 'out', 13.000, 100.000, 87.000, 50.0000, 650.00, '2026-07-26 02:35:26', '2026-07-26 04:27:50'),
(4, 1, 15, 2, 4, 6, NULL, 'in', 20.000, 0.000, 20.000, 15.0000, 300.00, '2026-07-26 10:07:23', '2026-07-26 10:07:23'),
(5, 1, 16, 2, 4, 6, NULL, 'out', 2.000, 20.000, 18.000, 15.0000, 30.00, '2026-07-26 11:35:37', '2026-07-26 11:35:37'),
(6, 1, 17, 2, 3, 7, NULL, 'in', 300.000, 0.000, 300.000, 50.0000, 15000.00, '2026-07-26 11:38:47', '2026-07-26 11:38:47'),
(7, 1, 18, 2, 4, 8, NULL, 'in', 50.000, 0.000, 50.000, 15.0000, 750.00, '2026-07-26 11:42:00', '2026-07-26 11:42:00'),
(8, 1, 19, 2, 4, 9, NULL, 'in', 99.998, 0.000, 99.998, 15.0000, 1499.97, '2026-07-26 11:45:40', '2026-07-26 11:45:40'),
(9, 1, 20, 2, 1, 2, NULL, 'out', 1.000, 48.000, 47.000, 50.0000, 50.00, '2026-07-26 14:33:05', '2026-07-26 14:33:05'),
(10, 1, 21, 2, 4, 6, NULL, 'out', 1.000, 18.000, 17.000, 15.0000, 15.00, '2026-07-26 14:33:05', '2026-07-26 14:33:05'),
(11, 1, 22, 2, 2, 1, NULL, 'out', 1.000, 193.000, 192.000, 25.0000, 25.00, '2026-07-26 14:33:05', '2026-07-26 14:33:05'),
(12, 1, 23, 2, 3, 4, NULL, 'out', 2.000, 87.000, 85.000, 50.0000, 100.00, '2026-07-26 14:33:05', '2026-07-26 14:33:05'),
(13, 1, 24, 2, 3, 4, NULL, 'out', 5.000, 85.000, 80.000, 50.0000, 250.00, '2026-07-26 14:33:11', '2026-07-26 14:33:11');

-- --------------------------------------------------------

--
-- Table structure for table `stock_transfers`
--

CREATE TABLE `stock_transfers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `from_branch_id` bigint(20) UNSIGNED NOT NULL,
  `from_warehouse_id` bigint(20) UNSIGNED NOT NULL,
  `to_branch_id` bigint(20) UNSIGNED NOT NULL,
  `to_warehouse_id` bigint(20) UNSIGNED NOT NULL,
  `transfer_number` varchar(80) NOT NULL,
  `transfer_date` date NOT NULL,
  `expected_receive_date` date DEFAULT NULL,
  `status` enum('draft','pending','approved','in_transit','received','cancelled','voided') NOT NULL DEFAULT 'draft',
  `reference_no` varchar(120) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `total_quantity_sent` decimal(14,3) NOT NULL DEFAULT 0.000,
  `total_quantity_received` decimal(14,3) NOT NULL DEFAULT 0.000,
  `total_cost` decimal(18,2) NOT NULL DEFAULT 0.00,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `submitted_by` bigint(20) UNSIGNED DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `approved_by` bigint(20) UNSIGNED DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `dispatched_by` bigint(20) UNSIGNED DEFAULT NULL,
  `dispatched_at` timestamp NULL DEFAULT NULL,
  `received_by` bigint(20) UNSIGNED DEFAULT NULL,
  `received_at` timestamp NULL DEFAULT NULL,
  `cancelled_by` bigint(20) UNSIGNED DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `cancel_reason` text DEFAULT NULL,
  `voided_by` bigint(20) UNSIGNED DEFAULT NULL,
  `voided_at` timestamp NULL DEFAULT NULL,
  `void_reason` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `stock_transfer_items`
--

CREATE TABLE `stock_transfer_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `stock_transfer_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `quantity_requested` decimal(14,3) NOT NULL DEFAULT 0.000,
  `quantity_sent` decimal(14,3) NOT NULL DEFAULT 0.000,
  `quantity_received` decimal(14,3) NOT NULL DEFAULT 0.000,
  `unit_cost` decimal(18,4) NOT NULL DEFAULT 0.0000,
  `line_total` decimal(18,2) NOT NULL DEFAULT 0.00,
  `transfer_out_stock_movement_id` bigint(20) UNSIGNED DEFAULT NULL,
  `transfer_in_stock_movement_id` bigint(20) UNSIGNED DEFAULT NULL,
  `void_out_stock_movement_id` bigint(20) UNSIGNED DEFAULT NULL,
  `void_in_stock_movement_id` bigint(20) UNSIGNED DEFAULT NULL,
  `notes` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `stock_transfer_item_batches`
--

CREATE TABLE `stock_transfer_item_batches` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `stock_transfer_item_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `stock_batch_id` bigint(20) UNSIGNED NOT NULL,
  `from_warehouse_id` bigint(20) UNSIGNED NOT NULL,
  `to_warehouse_id` bigint(20) UNSIGNED NOT NULL,
  `quantity_sent` decimal(14,3) NOT NULL DEFAULT 0.000,
  `quantity_received` decimal(14,3) NOT NULL DEFAULT 0.000,
  `unit_cost` decimal(18,4) NOT NULL DEFAULT 0.0000,
  `line_total` decimal(18,2) NOT NULL DEFAULT 0.00,
  `transfer_out_stock_movement_batch_id` bigint(20) UNSIGNED DEFAULT NULL,
  `transfer_in_stock_movement_batch_id` bigint(20) UNSIGNED DEFAULT NULL,
  `void_out_stock_movement_batch_id` bigint(20) UNSIGNED DEFAULT NULL,
  `void_in_stock_movement_batch_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(180) NOT NULL,
  `contact_person` varchar(180) DEFAULT NULL,
  `email` varchar(180) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `alternate_phone` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `tax_number` varchar(100) DEFAULT NULL,
  `payment_terms` varchar(100) DEFAULT NULL,
  `credit_limit` decimal(14,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `tenant_id`, `code`, `name`, `contact_person`, `email`, `phone`, `alternate_phone`, `address`, `tax_number`, `payment_terms`, `credit_limit`, `notes`, `is_active`, `created_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 'QT', 'w', 'wet', 'wt@gmail.com', 'ewt', 'qt', 'qwerty', 'qt', 'qwerty', 25.00, NULL, 1, 1, '2026-07-14 01:46:04', '2026-07-26 09:58:39', '2026-07-26 09:58:39'),
(2, 1, 'S1', 'ABC traiding', 'Juan Test', NULL, '21212121212212', '21212', NULL, '12121212121212', 'Cash Before Delivery', 10000.00, NULL, 1, 1, '2026-07-26 10:00:54', '2026-07-26 10:00:54', NULL);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_batch_inventory`
-- (See below for the actual view)
--
CREATE TABLE `vw_batch_inventory` (
`warehouse_batch_stock_id` bigint(20) unsigned
,`tenant_id` bigint(20) unsigned
,`branch_id` bigint(20) unsigned
,`branch_code` varchar(50)
,`branch_name` varchar(180)
,`warehouse_id` bigint(20) unsigned
,`warehouse_code` varchar(50)
,`warehouse_name` varchar(180)
,`product_id` bigint(20) unsigned
,`product_sku` varchar(100)
,`product_name` varchar(180)
,`product_unit` varchar(50)
,`batch_tracking_enabled` tinyint(1)
,`batch_issue_policy` enum('fifo','fefo','manual')
,`requires_expiration_date` tinyint(1)
,`stock_batch_id` bigint(20) unsigned
,`batch_code` varchar(100)
,`lot_number` varchar(120)
,`source_type` enum('legacy_import','opening_stock','purchase_receipt','adjustment','transfer','return_in','other')
,`source_reference` varchar(120)
,`received_date` date
,`manufactured_date` date
,`expiration_date` date
,`unit_cost` decimal(18,4)
,`original_quantity` decimal(14,3)
,`batch_status` enum('active','depleted','expired','quarantined','recalled','closed')
,`quantity` decimal(14,3)
,`batch_value` decimal(28,2)
,`last_movement_at` datetime
,`days_to_expiry` int(7)
,`expiry_state` varchar(9)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_batch_issue_candidates`
-- (See below for the actual view)
--
CREATE TABLE `vw_batch_issue_candidates` (
`warehouse_batch_stock_id` bigint(20) unsigned
,`tenant_id` bigint(20) unsigned
,`branch_id` bigint(20) unsigned
,`branch_code` varchar(50)
,`branch_name` varchar(180)
,`warehouse_id` bigint(20) unsigned
,`warehouse_code` varchar(50)
,`warehouse_name` varchar(180)
,`product_id` bigint(20) unsigned
,`product_sku` varchar(100)
,`product_name` varchar(180)
,`product_unit` varchar(50)
,`batch_tracking_enabled` tinyint(1)
,`batch_issue_policy` enum('fifo','fefo','manual')
,`requires_expiration_date` tinyint(1)
,`stock_batch_id` bigint(20) unsigned
,`batch_code` varchar(100)
,`lot_number` varchar(120)
,`source_type` enum('legacy_import','opening_stock','purchase_receipt','adjustment','transfer','return_in','other')
,`source_reference` varchar(120)
,`received_date` date
,`manufactured_date` date
,`expiration_date` date
,`unit_cost` decimal(18,4)
,`original_quantity` decimal(14,3)
,`batch_status` enum('active','depleted','expired','quarantined','recalled','closed')
,`quantity` decimal(14,3)
,`batch_value` decimal(28,2)
,`last_movement_at` datetime
,`days_to_expiry` int(7)
,`expiry_state` varchar(9)
,`issue_sort_date` varchar(10)
,`is_issue_eligible` int(1)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_batch_stock_reconciliation`
-- (See below for the actual view)
--
CREATE TABLE `vw_batch_stock_reconciliation` (
`warehouse_stock_id` bigint(20) unsigned
,`tenant_id` bigint(20) unsigned
,`warehouse_id` bigint(20) unsigned
,`warehouse_code` varchar(50)
,`warehouse_name` varchar(180)
,`product_id` bigint(20) unsigned
,`product_sku` varchar(100)
,`product_name` varchar(180)
,`aggregate_quantity` decimal(14,3)
,`batch_quantity` decimal(36,3)
,`quantity_difference` decimal(37,3)
,`reconciliation_status` varchar(8)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_purchase_receipt_batch_reconciliation`
-- (See below for the actual view)
--
CREATE TABLE `vw_purchase_receipt_batch_reconciliation` (
`purchase_receipt_item_id` bigint(20) unsigned
,`tenant_id` bigint(20) unsigned
,`purchase_receipt_id` bigint(20) unsigned
,`product_id` bigint(20) unsigned
,`quantity_received` decimal(14,3)
,`batch_quantity_received` decimal(36,3)
,`quantity_difference` decimal(37,3)
,`reconciliation_status` varchar(12)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_stock_adjustment_batch_reconciliation`
-- (See below for the actual view)
--
CREATE TABLE `vw_stock_adjustment_batch_reconciliation` (
`stock_adjustment_item_id` bigint(20) unsigned
,`tenant_id` bigint(20) unsigned
,`stock_adjustment_id` bigint(20) unsigned
,`product_id` bigint(20) unsigned
,`direction` enum('in','out')
,`quantity` decimal(14,3)
,`batch_quantity` decimal(36,3)
,`quantity_difference` decimal(37,3)
,`reconciliation_status` varchar(12)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_stock_issuance_batch_reconciliation`
-- (See below for the actual view)
--
CREATE TABLE `vw_stock_issuance_batch_reconciliation` (
`stock_issuance_item_id` bigint(20) unsigned
,`tenant_id` bigint(20) unsigned
,`stock_issuance_id` bigint(20) unsigned
,`product_id` bigint(20) unsigned
,`quantity_issued` decimal(14,3)
,`batch_quantity_issued` decimal(36,3)
,`quantity_difference` decimal(37,3)
,`reconciliation_status` varchar(12)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_stock_movement_batch_reconciliation`
-- (See below for the actual view)
--
CREATE TABLE `vw_stock_movement_batch_reconciliation` (
`stock_movement_id` bigint(20) unsigned
,`tenant_id` bigint(20) unsigned
,`warehouse_id` bigint(20) unsigned
,`product_id` bigint(20) unsigned
,`movement_type` enum('opening_stock','stock_in','stock_out','adjustment_in','adjustment_out','transfer_in','transfer_out','purchase_receipt','purchase_receipt_void','sale','return_in','return_out','damage','expired')
,`movement_date` datetime
,`is_batch_tracked` tinyint(1)
,`batch_allocation_status` enum('not_required','pending','allocated','reversed')
,`movement_quantity` decimal(14,3)
,`allocated_quantity` decimal(36,3)
,`quantity_difference` decimal(37,3)
,`reconciliation_status` varchar(12)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_stock_transfer_batch_reconciliation`
-- (See below for the actual view)
--
CREATE TABLE `vw_stock_transfer_batch_reconciliation` (
`stock_transfer_item_id` bigint(20) unsigned
,`tenant_id` bigint(20) unsigned
,`stock_transfer_id` bigint(20) unsigned
,`product_id` bigint(20) unsigned
,`quantity_sent` decimal(14,3)
,`quantity_received` decimal(14,3)
,`batch_quantity_sent` decimal(36,3)
,`batch_quantity_received` decimal(36,3)
,`sent_difference` decimal(37,3)
,`received_difference` decimal(37,3)
,`reconciliation_status` varchar(12)
);

-- --------------------------------------------------------

--
-- Table structure for table `warehouses`
--

CREATE TABLE `warehouses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `branch_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(180) NOT NULL,
  `code` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `contact_person` varchar(180) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `is_main` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `active_main_tenant_id` bigint(20) UNSIGNED GENERATED ALWAYS AS (case when `is_main` = 1 and `is_active` = 1 and `deleted_at` is null then `tenant_id` else NULL end) STORED,
  `active_main_branch_id` bigint(20) UNSIGNED GENERATED ALWAYS AS (case when `is_main` = 1 and `is_active` = 1 and `deleted_at` is null then `branch_id` else NULL end) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `warehouses`
--

INSERT INTO `warehouses` (`id`, `tenant_id`, `branch_id`, `name`, `code`, `description`, `address`, `contact_person`, `phone`, `is_main`, `is_active`, `created_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(2, 1, 3, 'main Warehouse', 'WH1', 'qwerty', 'qwerty', 'qwerty', '09123456789', 1, 1, 1, '2026-07-16 01:13:39', '2026-07-16 01:13:39', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `warehouse_batch_stocks`
--

CREATE TABLE `warehouse_batch_stocks` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `warehouse_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `stock_batch_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` decimal(14,3) NOT NULL DEFAULT 0.000,
  `last_movement_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

--
-- Dumping data for table `warehouse_batch_stocks`
--

INSERT INTO `warehouse_batch_stocks` (`id`, `tenant_id`, `warehouse_id`, `product_id`, `stock_batch_id`, `quantity`, `last_movement_at`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 2, 1, 192.000, '2026-07-26 22:33:05', '2026-07-16 01:15:06', '2026-07-26 14:33:05'),
(2, 1, 2, 1, 2, 47.000, '2026-07-26 22:33:05', '2026-07-23 02:50:39', '2026-07-26 14:33:05'),
(4, 1, 2, 3, 4, 80.000, '2026-07-26 22:33:11', '2026-07-25 16:57:45', '2026-07-26 14:33:11'),
(5, 1, 2, 3, 5, 100.000, '2026-07-26 01:09:49', '2026-07-25 17:09:49', '2026-07-25 17:09:49'),
(6, 1, 2, 4, 6, 17.000, '2026-07-26 22:33:05', '2026-07-26 10:07:23', '2026-07-26 14:33:05'),
(7, 1, 2, 3, 7, 300.000, '2026-07-26 19:38:47', '2026-07-26 11:38:47', '2026-07-26 11:38:47'),
(8, 1, 2, 4, 8, 50.000, '2026-07-26 19:42:00', '2026-07-26 11:42:00', '2026-07-26 11:42:00'),
(9, 1, 2, 4, 9, 99.998, '2026-07-26 19:45:40', '2026-07-26 11:45:40', '2026-07-26 11:45:40');

-- --------------------------------------------------------

--
-- Table structure for table `warehouse_batch_stocks_backup_before_batch_core_v3_20260725`
--

CREATE TABLE `warehouse_batch_stocks_backup_before_batch_core_v3_20260725` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `warehouse_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `stock_batch_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` decimal(14,3) NOT NULL DEFAULT 0.000,
  `last_movement_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

--
-- Dumping data for table `warehouse_batch_stocks_backup_before_batch_core_v3_20260725`
--

INSERT INTO `warehouse_batch_stocks_backup_before_batch_core_v3_20260725` (`id`, `tenant_id`, `warehouse_id`, `product_id`, `stock_batch_id`, `quantity`, `last_movement_at`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 2, 1, 193.000, '2026-07-23 09:19:39', '2026-07-16 01:15:06', '2026-07-25 06:19:00'),
(2, 1, 2, 1, 2, 48.000, '2026-07-24 13:52:53', '2026-07-23 02:50:39', '2026-07-25 06:19:00');

-- --------------------------------------------------------

--
-- Table structure for table `warehouse_stocks`
--

CREATE TABLE `warehouse_stocks` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `warehouse_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` decimal(14,3) NOT NULL DEFAULT 0.000,
  `reorder_level` decimal(14,3) NOT NULL DEFAULT 0.000,
  `max_stock_level` decimal(14,3) DEFAULT NULL,
  `average_cost` decimal(18,4) NOT NULL DEFAULT 0.0000,
  `last_movement_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `warehouse_stocks`
--

INSERT INTO `warehouse_stocks` (`id`, `tenant_id`, `warehouse_id`, `product_id`, `quantity`, `reorder_level`, `max_stock_level`, `average_cost`, `last_movement_at`, `created_at`, `updated_at`) VALUES
(2, 1, 2, 2, 192.000, 5.000, NULL, 25.0000, '2026-07-26 22:33:05', '2026-07-16 01:15:06', '2026-07-26 14:33:05'),
(5, 1, 2, 1, 47.000, 5.000, NULL, 50.0000, '2026-07-26 22:33:05', '2026-07-23 02:50:39', '2026-07-26 14:33:05'),
(6, 1, 2, 3, 480.000, 5.000, NULL, 51.0417, '2026-07-26 22:33:11', '2026-07-25 16:57:45', '2026-07-26 14:33:11'),
(7, 1, 2, 4, 166.998, 5.000, NULL, 15.0000, '2026-07-26 22:33:05', '2026-07-26 10:07:23', '2026-07-26 14:33:05');

--
-- Triggers `warehouse_stocks`
--
DELIMITER $$
CREATE TRIGGER `trg_ws_batch_guard_before_insert` BEFORE INSERT ON `warehouse_stocks` FOR EACH ROW BEGIN
    DECLARE v_stock_tracking VARCHAR(20) DEFAULT 'not_tracked';
    DECLARE v_batch_quantity DECIMAL(30,3) DEFAULT 0.000;
    DECLARE v_batch_value DECIMAL(38,4) DEFAULT 0.0000;
    DECLARE v_expected_average DECIMAL(18,4) DEFAULT 0.0000;

    SELECT `stock_tracking`
    INTO v_stock_tracking
    FROM `products`
    WHERE `tenant_id` = NEW.`tenant_id`
      AND `id` = NEW.`product_id`
    LIMIT 1;

    IF v_stock_tracking = 'tracked' THEN
        SELECT
            ROUND(COALESCE(SUM(`wbs`.`quantity`), 0), 3),
            ROUND(COALESCE(SUM(`wbs`.`quantity` * `sb`.`unit_cost`), 0), 4)
        INTO
            v_batch_quantity,
            v_batch_value
        FROM `warehouse_batch_stocks` AS `wbs`
        INNER JOIN `stock_batches` AS `sb`
            ON `sb`.`tenant_id` = `wbs`.`tenant_id`
           AND `sb`.`id` = `wbs`.`stock_batch_id`
           AND `sb`.`product_id` = `wbs`.`product_id`
        WHERE `wbs`.`tenant_id` = NEW.`tenant_id`
          AND `wbs`.`warehouse_id` = NEW.`warehouse_id`
          AND `wbs`.`product_id` = NEW.`product_id`;

        IF v_batch_quantity > 0 THEN
            SET v_expected_average = ROUND(
                v_batch_value / v_batch_quantity,
                4
            );
        END IF;

        IF ABS(NEW.`quantity` - v_batch_quantity) > 0.0001 THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT =
                    'Tracked inventory blocked: warehouse_stocks quantity must equal its batch/cost-layer total.';
        END IF;

        IF v_batch_quantity > 0
           AND ABS(NEW.`average_cost` - v_expected_average) > 0.0001 THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT =
                    'Tracked inventory blocked: warehouse_stocks average cost must equal its weighted batch cost.';
        END IF;
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_ws_batch_guard_before_update` BEFORE UPDATE ON `warehouse_stocks` FOR EACH ROW BEGIN
    DECLARE v_stock_tracking VARCHAR(20) DEFAULT 'not_tracked';
    DECLARE v_batch_quantity DECIMAL(30,3) DEFAULT 0.000;
    DECLARE v_batch_value DECIMAL(38,4) DEFAULT 0.0000;
    DECLARE v_expected_average DECIMAL(18,4) DEFAULT 0.0000;

    SELECT `stock_tracking`
    INTO v_stock_tracking
    FROM `products`
    WHERE `tenant_id` = NEW.`tenant_id`
      AND `id` = NEW.`product_id`
    LIMIT 1;

    IF v_stock_tracking = 'tracked' THEN
        SELECT
            ROUND(COALESCE(SUM(`wbs`.`quantity`), 0), 3),
            ROUND(COALESCE(SUM(`wbs`.`quantity` * `sb`.`unit_cost`), 0), 4)
        INTO
            v_batch_quantity,
            v_batch_value
        FROM `warehouse_batch_stocks` AS `wbs`
        INNER JOIN `stock_batches` AS `sb`
            ON `sb`.`tenant_id` = `wbs`.`tenant_id`
           AND `sb`.`id` = `wbs`.`stock_batch_id`
           AND `sb`.`product_id` = `wbs`.`product_id`
        WHERE `wbs`.`tenant_id` = NEW.`tenant_id`
          AND `wbs`.`warehouse_id` = NEW.`warehouse_id`
          AND `wbs`.`product_id` = NEW.`product_id`;

        IF v_batch_quantity > 0 THEN
            SET v_expected_average = ROUND(
                v_batch_value / v_batch_quantity,
                4
            );
        END IF;

        IF ABS(NEW.`quantity` - v_batch_quantity) > 0.0001 THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT =
                    'Tracked inventory blocked: update batch/cost layers first, then synchronize warehouse_stocks.';
        END IF;

        IF v_batch_quantity > 0
           AND ABS(NEW.`average_cost` - v_expected_average) > 0.0001 THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT =
                    'Tracked inventory blocked: aggregate average cost does not match weighted batch cost.';
        END IF;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `warehouse_stocks_backup_before_batch_core_v3_20260725`
--

CREATE TABLE `warehouse_stocks_backup_before_batch_core_v3_20260725` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `warehouse_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` decimal(14,3) NOT NULL DEFAULT 0.000,
  `reorder_level` decimal(14,3) NOT NULL DEFAULT 0.000,
  `max_stock_level` decimal(14,3) DEFAULT NULL,
  `average_cost` decimal(18,4) NOT NULL DEFAULT 0.0000,
  `last_movement_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `warehouse_stocks_backup_before_batch_core_v3_20260725`
--

INSERT INTO `warehouse_stocks_backup_before_batch_core_v3_20260725` (`id`, `tenant_id`, `warehouse_id`, `product_id`, `quantity`, `reorder_level`, `max_stock_level`, `average_cost`, `last_movement_at`, `created_at`, `updated_at`) VALUES
(2, 1, 2, 2, 193.000, 5.000, NULL, 25.0000, '2026-07-23 09:19:39', '2026-07-16 01:15:06', '2026-07-23 01:19:39'),
(5, 1, 2, 1, 48.000, 5.000, NULL, 50.0000, '2026-07-24 13:52:53', '2026-07-23 02:50:39', '2026-07-24 05:52:53');

-- --------------------------------------------------------

--
-- Structure for view `vw_batch_inventory`
--
DROP TABLE IF EXISTS `vw_batch_inventory`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_batch_inventory`  AS SELECT `wbs`.`id` AS `warehouse_batch_stock_id`, `wbs`.`tenant_id` AS `tenant_id`, `branch`.`id` AS `branch_id`, `branch`.`code` AS `branch_code`, `branch`.`name` AS `branch_name`, `warehouse`.`id` AS `warehouse_id`, `warehouse`.`code` AS `warehouse_code`, `warehouse`.`name` AS `warehouse_name`, `product`.`id` AS `product_id`, `product`.`sku` AS `product_sku`, `product`.`name` AS `product_name`, `product`.`unit` AS `product_unit`, `product`.`batch_tracking_enabled` AS `batch_tracking_enabled`, `product`.`batch_issue_policy` AS `batch_issue_policy`, `product`.`requires_expiration_date` AS `requires_expiration_date`, `batch`.`id` AS `stock_batch_id`, `batch`.`batch_code` AS `batch_code`, `batch`.`lot_number` AS `lot_number`, `batch`.`source_type` AS `source_type`, `batch`.`source_reference` AS `source_reference`, `batch`.`received_date` AS `received_date`, `batch`.`manufactured_date` AS `manufactured_date`, `batch`.`expiration_date` AS `expiration_date`, `batch`.`unit_cost` AS `unit_cost`, `batch`.`original_quantity` AS `original_quantity`, `batch`.`status` AS `batch_status`, `wbs`.`quantity` AS `quantity`, round(`wbs`.`quantity` * `batch`.`unit_cost`,2) AS `batch_value`, `wbs`.`last_movement_at` AS `last_movement_at`, CASE WHEN `batch`.`expiration_date` is null THEN NULL ELSE to_days(`batch`.`expiration_date`) - to_days(curdate()) END AS `days_to_expiry`, cast(case when `batch`.`expiration_date` is null then _utf8mb4'no_expiry' when `batch`.`expiration_date` < curdate() then _utf8mb4'expired' when to_days(`batch`.`expiration_date`) - to_days(curdate()) <= coalesce(`settings`.`expiry_critical_days`,7) then _utf8mb4'critical' when to_days(`batch`.`expiration_date`) - to_days(curdate()) <= coalesce(`product`.`expiry_warning_days`,`settings`.`expiry_warning_days`) then _utf8mb4'warning' else _utf8mb4'safe' end as char charset utf8mb4) FROM (((((`warehouse_batch_stocks` `wbs` join `stock_batches` `batch` on(`batch`.`tenant_id` = `wbs`.`tenant_id` and `batch`.`id` = `wbs`.`stock_batch_id` and `batch`.`product_id` = `wbs`.`product_id`)) join `products` `product` on(`product`.`tenant_id` = `wbs`.`tenant_id` and `product`.`id` = `wbs`.`product_id`)) join `warehouses` `warehouse` on(`warehouse`.`tenant_id` = `wbs`.`tenant_id` and `warehouse`.`id` = `wbs`.`warehouse_id`)) join `branches` `branch` on(`branch`.`tenant_id` = `warehouse`.`tenant_id` and `branch`.`id` = `warehouse`.`branch_id`)) left join `inventory_settings` `settings` on(`settings`.`tenant_id` = `wbs`.`tenant_id`)) ;

-- --------------------------------------------------------

--
-- Structure for view `vw_batch_issue_candidates`
--
DROP TABLE IF EXISTS `vw_batch_issue_candidates`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_batch_issue_candidates`  AS SELECT `inventory`.`warehouse_batch_stock_id` AS `warehouse_batch_stock_id`, `inventory`.`tenant_id` AS `tenant_id`, `inventory`.`branch_id` AS `branch_id`, `inventory`.`branch_code` AS `branch_code`, `inventory`.`branch_name` AS `branch_name`, `inventory`.`warehouse_id` AS `warehouse_id`, `inventory`.`warehouse_code` AS `warehouse_code`, `inventory`.`warehouse_name` AS `warehouse_name`, `inventory`.`product_id` AS `product_id`, `inventory`.`product_sku` AS `product_sku`, `inventory`.`product_name` AS `product_name`, `inventory`.`product_unit` AS `product_unit`, `inventory`.`batch_tracking_enabled` AS `batch_tracking_enabled`, `inventory`.`batch_issue_policy` AS `batch_issue_policy`, `inventory`.`requires_expiration_date` AS `requires_expiration_date`, `inventory`.`stock_batch_id` AS `stock_batch_id`, `inventory`.`batch_code` AS `batch_code`, `inventory`.`lot_number` AS `lot_number`, `inventory`.`source_type` AS `source_type`, `inventory`.`source_reference` AS `source_reference`, `inventory`.`received_date` AS `received_date`, `inventory`.`manufactured_date` AS `manufactured_date`, `inventory`.`expiration_date` AS `expiration_date`, `inventory`.`unit_cost` AS `unit_cost`, `inventory`.`original_quantity` AS `original_quantity`, `inventory`.`batch_status` AS `batch_status`, `inventory`.`quantity` AS `quantity`, `inventory`.`batch_value` AS `batch_value`, `inventory`.`last_movement_at` AS `last_movement_at`, `inventory`.`days_to_expiry` AS `days_to_expiry`, `inventory`.`expiry_state` AS `expiry_state`, CASE END FROM `vw_batch_inventory` AS `inventory` ;

-- --------------------------------------------------------

--
-- Structure for view `vw_batch_stock_reconciliation`
--
DROP TABLE IF EXISTS `vw_batch_stock_reconciliation`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_batch_stock_reconciliation`  AS SELECT `ws`.`id` AS `warehouse_stock_id`, `ws`.`tenant_id` AS `tenant_id`, `ws`.`warehouse_id` AS `warehouse_id`, `warehouse`.`code` AS `warehouse_code`, `warehouse`.`name` AS `warehouse_name`, `ws`.`product_id` AS `product_id`, `product`.`sku` AS `product_sku`, `product`.`name` AS `product_name`, `ws`.`quantity` AS `aggregate_quantity`, coalesce(sum(`wbs`.`quantity`),0.000) AS `batch_quantity`, round(`ws`.`quantity` - coalesce(sum(`wbs`.`quantity`),0.000),3) AS `quantity_difference`, cast(case when abs(`ws`.`quantity` - coalesce(sum(`wbs`.`quantity`),0.000)) <= 0.0001 then 'matched' else 'mismatch' end as char charset utf8mb4) FROM (((`warehouse_stocks` `ws` join `warehouses` `warehouse` on(`warehouse`.`tenant_id` = `ws`.`tenant_id` and `warehouse`.`id` = `ws`.`warehouse_id`)) join `products` `product` on(`product`.`tenant_id` = `ws`.`tenant_id` and `product`.`id` = `ws`.`product_id`)) left join `warehouse_batch_stocks` `wbs` on(`wbs`.`tenant_id` = `ws`.`tenant_id` and `wbs`.`warehouse_id` = `ws`.`warehouse_id` and `wbs`.`product_id` = `ws`.`product_id`)) GROUP BY `ws`.`id`, `ws`.`tenant_id`, `ws`.`warehouse_id`, `warehouse`.`code`, `warehouse`.`name`, `ws`.`product_id`, `product`.`sku`, `product`.`name`, `ws`.`quantity` ;

-- --------------------------------------------------------

--
-- Structure for view `vw_purchase_receipt_batch_reconciliation`
--
DROP TABLE IF EXISTS `vw_purchase_receipt_batch_reconciliation`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_purchase_receipt_batch_reconciliation`  AS SELECT `item`.`id` AS `purchase_receipt_item_id`, `item`.`tenant_id` AS `tenant_id`, `item`.`purchase_receipt_id` AS `purchase_receipt_id`, `item`.`product_id` AS `product_id`, `item`.`quantity_received` AS `quantity_received`, coalesce(sum(`batch_item`.`quantity_received`),0.000) AS `batch_quantity_received`, round(`item`.`quantity_received` - coalesce(sum(`batch_item`.`quantity_received`),0.000),3) AS `quantity_difference`, cast(case when `item`.`stock_movement_id` is null or `movement`.`id` is null then 'mismatch' when `movement`.`is_batch_tracked` = 0 then 'not_required' when `movement`.`batch_allocation_status` in ('allocated','reversed') and abs(`item`.`quantity_received` - coalesce(sum(`batch_item`.`quantity_received`),0.000)) <= 0.0001 then 'matched' else 'mismatch' end as char charset utf8mb4) FROM ((`purchase_receipt_items` `item` left join `stock_movements` `movement` on(`movement`.`tenant_id` = `item`.`tenant_id` and `movement`.`id` = `item`.`stock_movement_id`)) left join `purchase_receipt_item_batches` `batch_item` on(`batch_item`.`tenant_id` = `item`.`tenant_id` and `batch_item`.`purchase_receipt_item_id` = `item`.`id`)) GROUP BY `item`.`id`, `item`.`tenant_id`, `item`.`purchase_receipt_id`, `item`.`product_id`, `item`.`quantity_received`, `item`.`stock_movement_id`, `movement`.`id`, `movement`.`is_batch_tracked`, `movement`.`batch_allocation_status` ;

-- --------------------------------------------------------

--
-- Structure for view `vw_stock_adjustment_batch_reconciliation`
--
DROP TABLE IF EXISTS `vw_stock_adjustment_batch_reconciliation`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_stock_adjustment_batch_reconciliation`  AS SELECT `item`.`id` AS `stock_adjustment_item_id`, `item`.`tenant_id` AS `tenant_id`, `item`.`stock_adjustment_id` AS `stock_adjustment_id`, `item`.`product_id` AS `product_id`, `item`.`direction` AS `direction`, `item`.`quantity` AS `quantity`, coalesce(sum(`batch_item`.`quantity`),0.000) AS `batch_quantity`, round(`item`.`quantity` - coalesce(sum(`batch_item`.`quantity`),0.000),3) AS `quantity_difference`, cast(case when `item`.`stock_movement_id` is null or `movement`.`id` is null then 'mismatch' when `movement`.`is_batch_tracked` = 0 then 'not_required' when `movement`.`batch_allocation_status` in ('allocated','reversed') and abs(`item`.`quantity` - coalesce(sum(`batch_item`.`quantity`),0.000)) <= 0.0001 then 'matched' else 'mismatch' end as char charset utf8mb4) FROM ((`stock_adjustment_items` `item` left join `stock_movements` `movement` on(`movement`.`tenant_id` = `item`.`tenant_id` and `movement`.`id` = `item`.`stock_movement_id`)) left join `stock_adjustment_item_batches` `batch_item` on(`batch_item`.`tenant_id` = `item`.`tenant_id` and `batch_item`.`stock_adjustment_item_id` = `item`.`id`)) GROUP BY `item`.`id`, `item`.`tenant_id`, `item`.`stock_adjustment_id`, `item`.`product_id`, `item`.`direction`, `item`.`quantity`, `item`.`stock_movement_id`, `movement`.`id`, `movement`.`is_batch_tracked`, `movement`.`batch_allocation_status` ;

-- --------------------------------------------------------

--
-- Structure for view `vw_stock_issuance_batch_reconciliation`
--
DROP TABLE IF EXISTS `vw_stock_issuance_batch_reconciliation`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_stock_issuance_batch_reconciliation`  AS SELECT `item`.`id` AS `stock_issuance_item_id`, `item`.`tenant_id` AS `tenant_id`, `item`.`stock_issuance_id` AS `stock_issuance_id`, `item`.`product_id` AS `product_id`, `item`.`quantity_issued` AS `quantity_issued`, coalesce(sum(`batch_item`.`quantity_issued`),0.000) AS `batch_quantity_issued`, round(`item`.`quantity_issued` - coalesce(sum(`batch_item`.`quantity_issued`),0.000),3) AS `quantity_difference`, cast(case when `item`.`stock_movement_id` is null or `movement`.`id` is null then 'mismatch' when `movement`.`is_batch_tracked` = 0 then 'not_required' when `movement`.`batch_allocation_status` in ('allocated','reversed') and abs(`item`.`quantity_issued` - coalesce(sum(`batch_item`.`quantity_issued`),0.000)) <= 0.0001 then 'matched' else 'mismatch' end as char charset utf8mb4) FROM ((`stock_issuance_items` `item` left join `stock_movements` `movement` on(`movement`.`tenant_id` = `item`.`tenant_id` and `movement`.`id` = `item`.`stock_movement_id`)) left join `stock_issuance_item_batches` `batch_item` on(`batch_item`.`tenant_id` = `item`.`tenant_id` and `batch_item`.`stock_issuance_item_id` = `item`.`id`)) GROUP BY `item`.`id`, `item`.`tenant_id`, `item`.`stock_issuance_id`, `item`.`product_id`, `item`.`quantity_issued`, `item`.`stock_movement_id`, `movement`.`id`, `movement`.`is_batch_tracked`, `movement`.`batch_allocation_status` ;

-- --------------------------------------------------------

--
-- Structure for view `vw_stock_movement_batch_reconciliation`
--
DROP TABLE IF EXISTS `vw_stock_movement_batch_reconciliation`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_stock_movement_batch_reconciliation`  AS SELECT `movement`.`id` AS `stock_movement_id`, `movement`.`tenant_id` AS `tenant_id`, `movement`.`warehouse_id` AS `warehouse_id`, `movement`.`product_id` AS `product_id`, `movement`.`movement_type` AS `movement_type`, `movement`.`movement_date` AS `movement_date`, `movement`.`is_batch_tracked` AS `is_batch_tracked`, `movement`.`batch_allocation_status` AS `batch_allocation_status`, abs(`movement`.`quantity`) AS `movement_quantity`, coalesce(sum(`allocation`.`quantity`),0.000) AS `allocated_quantity`, round(abs(`movement`.`quantity`) - coalesce(sum(`allocation`.`quantity`),0.000),3) AS `quantity_difference`, cast(case when `movement`.`is_batch_tracked` = 0 then 'not_required' when `movement`.`batch_allocation_status` in ('allocated','reversed') and abs(abs(`movement`.`quantity`) - coalesce(sum(`allocation`.`quantity`),0.000)) <= 0.0001 then 'matched' else 'mismatch' end as char charset utf8mb4) FROM (`stock_movements` `movement` left join `stock_movement_batches` `allocation` on(`allocation`.`tenant_id` = `movement`.`tenant_id` and `allocation`.`stock_movement_id` = `movement`.`id`)) GROUP BY `movement`.`id`, `movement`.`tenant_id`, `movement`.`warehouse_id`, `movement`.`product_id`, `movement`.`movement_type`, `movement`.`movement_date`, `movement`.`is_batch_tracked`, `movement`.`batch_allocation_status`, `movement`.`quantity` ;

-- --------------------------------------------------------

--
-- Structure for view `vw_stock_transfer_batch_reconciliation`
--
DROP TABLE IF EXISTS `vw_stock_transfer_batch_reconciliation`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_stock_transfer_batch_reconciliation`  AS SELECT `item`.`id` AS `stock_transfer_item_id`, `item`.`tenant_id` AS `tenant_id`, `item`.`stock_transfer_id` AS `stock_transfer_id`, `item`.`product_id` AS `product_id`, `item`.`quantity_sent` AS `quantity_sent`, `item`.`quantity_received` AS `quantity_received`, coalesce(sum(`batch_item`.`quantity_sent`),0.000) AS `batch_quantity_sent`, coalesce(sum(`batch_item`.`quantity_received`),0.000) AS `batch_quantity_received`, round(`item`.`quantity_sent` - coalesce(sum(`batch_item`.`quantity_sent`),0.000),3) AS `sent_difference`, round(`item`.`quantity_received` - coalesce(sum(`batch_item`.`quantity_received`),0.000),3) AS `received_difference`, cast(case when `item`.`transfer_out_stock_movement_id` is null or `item`.`transfer_in_stock_movement_id` is null or `out_movement`.`id` is null or `in_movement`.`id` is null then 'mismatch' when `out_movement`.`is_batch_tracked` = 0 and `in_movement`.`is_batch_tracked` = 0 then 'not_required' when `out_movement`.`batch_allocation_status` in ('allocated','reversed') and `in_movement`.`batch_allocation_status` in ('allocated','reversed') and abs(`item`.`quantity_sent` - coalesce(sum(`batch_item`.`quantity_sent`),0.000)) <= 0.0001 and abs(`item`.`quantity_received` - coalesce(sum(`batch_item`.`quantity_received`),0.000)) <= 0.0001 then 'matched' else 'mismatch' end as char charset utf8mb4) FROM (((`stock_transfer_items` `item` left join `stock_movements` `out_movement` on(`out_movement`.`tenant_id` = `item`.`tenant_id` and `out_movement`.`id` = `item`.`transfer_out_stock_movement_id`)) left join `stock_movements` `in_movement` on(`in_movement`.`tenant_id` = `item`.`tenant_id` and `in_movement`.`id` = `item`.`transfer_in_stock_movement_id`)) left join `stock_transfer_item_batches` `batch_item` on(`batch_item`.`tenant_id` = `item`.`tenant_id` and `batch_item`.`stock_transfer_item_id` = `item`.`id`)) GROUP BY `item`.`id`, `item`.`tenant_id`, `item`.`stock_transfer_id`, `item`.`product_id`, `item`.`quantity_sent`, `item`.`quantity_received`, `item`.`transfer_out_stock_movement_id`, `item`.`transfer_in_stock_movement_id`, `out_movement`.`id`, `out_movement`.`is_batch_tracked`, `out_movement`.`batch_allocation_status`, `in_movement`.`id`, `in_movement`.`is_batch_tracked`, `in_movement`.`batch_allocation_status` ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `branches`
--
ALTER TABLE `branches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `branches_tenant_code_unique` (`tenant_id`,`code`),
  ADD UNIQUE KEY `branches_tenant_id_unique` (`tenant_id`,`id`),
  ADD UNIQUE KEY `branches_one_active_main_per_tenant` (`active_main_tenant_id`),
  ADD KEY `branches_tenant_id_index` (`tenant_id`),
  ADD KEY `branches_tenant_active_index` (`tenant_id`,`is_active`),
  ADD KEY `branches_created_by_index` (`created_by`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categories_tenant_slug_unique` (`tenant_id`,`slug`),
  ADD UNIQUE KEY `categories_tenant_id_unique` (`tenant_id`,`id`),
  ADD KEY `categories_tenant_id_index` (`tenant_id`),
  ADD KEY `categories_parent_id_index` (`parent_id`),
  ADD KEY `categories_tenant_active_index` (`tenant_id`,`is_active`),
  ADD KEY `categories_created_by_index` (`created_by`),
  ADD KEY `categories_tenant_parent_index` (`tenant_id`,`parent_id`);

--
-- Indexes for table `inventory_settings`
--
ALTER TABLE `inventory_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `inventory_settings_tenant_unique` (`tenant_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `products_tenant_slug_unique` (`tenant_id`,`slug`),
  ADD UNIQUE KEY `products_tenant_id_unique` (`tenant_id`,`id`),
  ADD UNIQUE KEY `products_tenant_sku_unique` (`tenant_id`,`sku`),
  ADD UNIQUE KEY `products_tenant_barcode_unique` (`tenant_id`,`barcode`),
  ADD KEY `products_tenant_id_index` (`tenant_id`),
  ADD KEY `products_category_id_index` (`category_id`),
  ADD KEY `products_tenant_category_index` (`tenant_id`,`category_id`),
  ADD KEY `products_tenant_active_index` (`tenant_id`,`is_active`),
  ADD KEY `products_created_by_index` (`created_by`),
  ADD KEY `products_tenant_batch_tracking_index` (`tenant_id`,`batch_tracking_enabled`);

--
-- Indexes for table `products_backup_before_batching_20260725`
--
ALTER TABLE `products_backup_before_batching_20260725`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `products_tenant_slug_unique` (`tenant_id`,`slug`),
  ADD UNIQUE KEY `products_tenant_id_unique` (`tenant_id`,`id`),
  ADD UNIQUE KEY `products_tenant_sku_unique` (`tenant_id`,`sku`),
  ADD UNIQUE KEY `products_tenant_barcode_unique` (`tenant_id`,`barcode`),
  ADD KEY `products_tenant_id_index` (`tenant_id`),
  ADD KEY `products_category_id_index` (`category_id`),
  ADD KEY `products_tenant_category_index` (`tenant_id`,`category_id`),
  ADD KEY `products_tenant_active_index` (`tenant_id`,`is_active`),
  ADD KEY `products_created_by_index` (`created_by`);

--
-- Indexes for table `products_backup_before_batch_core_v3_20260725`
--
ALTER TABLE `products_backup_before_batch_core_v3_20260725`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `products_tenant_slug_unique` (`tenant_id`,`slug`),
  ADD UNIQUE KEY `products_tenant_id_unique` (`tenant_id`,`id`),
  ADD UNIQUE KEY `products_tenant_sku_unique` (`tenant_id`,`sku`),
  ADD UNIQUE KEY `products_tenant_barcode_unique` (`tenant_id`,`barcode`),
  ADD KEY `products_tenant_id_index` (`tenant_id`),
  ADD KEY `products_category_id_index` (`category_id`),
  ADD KEY `products_tenant_category_index` (`tenant_id`,`category_id`),
  ADD KEY `products_tenant_active_index` (`tenant_id`,`is_active`),
  ADD KEY `products_created_by_index` (`created_by`),
  ADD KEY `products_tenant_batch_tracking_index` (`tenant_id`,`batch_tracking_enabled`);

--
-- Indexes for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `purchase_orders_tenant_po_number_unique` (`tenant_id`,`po_number`),
  ADD UNIQUE KEY `purchase_orders_tenant_id_unique` (`tenant_id`,`id`),
  ADD UNIQUE KEY `purchase_orders_context_unique` (`tenant_id`,`id`,`supplier_id`,`branch_id`,`warehouse_id`),
  ADD KEY `purchase_orders_tenant_id_index` (`tenant_id`),
  ADD KEY `purchase_orders_supplier_id_index` (`supplier_id`),
  ADD KEY `purchase_orders_branch_id_index` (`branch_id`),
  ADD KEY `purchase_orders_warehouse_id_index` (`warehouse_id`),
  ADD KEY `purchase_orders_tenant_status_index` (`tenant_id`,`status`),
  ADD KEY `purchase_orders_tenant_supplier_index` (`tenant_id`,`supplier_id`),
  ADD KEY `purchase_orders_tenant_order_date_index` (`tenant_id`,`order_date`),
  ADD KEY `purchase_orders_created_by_index` (`created_by`),
  ADD KEY `purchase_orders_tenant_branch_warehouse_index` (`tenant_id`,`branch_id`,`warehouse_id`);

--
-- Indexes for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `purchase_order_items_order_product_unique` (`purchase_order_id`,`product_id`),
  ADD UNIQUE KEY `purchase_order_items_tenant_id_unique` (`tenant_id`,`id`),
  ADD UNIQUE KEY `purchase_order_items_context_unique` (`tenant_id`,`id`,`product_id`),
  ADD KEY `purchase_order_items_tenant_id_index` (`tenant_id`),
  ADD KEY `purchase_order_items_purchase_order_id_index` (`purchase_order_id`),
  ADD KEY `purchase_order_items_product_id_index` (`product_id`),
  ADD KEY `purchase_order_items_tenant_product_index` (`tenant_id`,`product_id`),
  ADD KEY `purchase_order_items_tenant_order_index` (`tenant_id`,`purchase_order_id`);

--
-- Indexes for table `purchase_receipts`
--
ALTER TABLE `purchase_receipts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `purchase_receipts_tenant_number_unique` (`tenant_id`,`receipt_number`),
  ADD UNIQUE KEY `purchase_receipts_tenant_id_unique` (`tenant_id`,`id`),
  ADD KEY `purchase_receipts_tenant_id_index` (`tenant_id`),
  ADD KEY `purchase_receipts_purchase_order_id_index` (`purchase_order_id`),
  ADD KEY `purchase_receipts_supplier_id_index` (`supplier_id`),
  ADD KEY `purchase_receipts_branch_id_index` (`branch_id`),
  ADD KEY `purchase_receipts_warehouse_id_index` (`warehouse_id`),
  ADD KEY `purchase_receipts_tenant_status_index` (`tenant_id`,`status`),
  ADD KEY `purchase_receipts_tenant_date_index` (`tenant_id`,`received_date`),
  ADD KEY `purchase_receipts_received_by_index` (`received_by`),
  ADD KEY `purchase_receipts_order_context_index` (`tenant_id`,`purchase_order_id`,`supplier_id`,`branch_id`,`warehouse_id`);

--
-- Indexes for table `purchase_receipt_items`
--
ALTER TABLE `purchase_receipt_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `purchase_receipt_items_receipt_order_item_unique` (`purchase_receipt_id`,`purchase_order_item_id`),
  ADD UNIQUE KEY `receipt_items_stock_move_unique` (`tenant_id`,`stock_movement_id`),
  ADD UNIQUE KEY `receipt_items_void_move_unique` (`tenant_id`,`void_stock_movement_id`),
  ADD KEY `purchase_receipt_items_tenant_id_index` (`tenant_id`),
  ADD KEY `purchase_receipt_items_receipt_id_index` (`purchase_receipt_id`),
  ADD KEY `purchase_receipt_items_order_item_id_index` (`purchase_order_item_id`),
  ADD KEY `purchase_receipt_items_product_id_index` (`product_id`),
  ADD KEY `purchase_receipt_items_tenant_product_index` (`tenant_id`,`product_id`),
  ADD KEY `purchase_receipt_items_tenant_receipt_index` (`tenant_id`,`purchase_receipt_id`),
  ADD KEY `purchase_receipt_items_tenant_order_item_product_index` (`tenant_id`,`purchase_order_item_id`,`product_id`);

--
-- Indexes for table `purchase_receipt_item_batches`
--
ALTER TABLE `purchase_receipt_item_batches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `prib_item_batch_warehouse_unique` (`purchase_receipt_item_id`,`stock_batch_id`,`warehouse_id`),
  ADD UNIQUE KEY `prib_tenant_id_unique` (`tenant_id`,`id`),
  ADD UNIQUE KEY `prib_movement_batch_unique` (`tenant_id`,`stock_movement_batch_id`),
  ADD UNIQUE KEY `prib_void_move_batch_unique` (`tenant_id`,`void_stock_movement_batch_id`),
  ADD KEY `prib_tenant_item_index` (`tenant_id`,`purchase_receipt_item_id`),
  ADD KEY `prib_tenant_product_index` (`tenant_id`,`product_id`),
  ADD KEY `prib_tenant_batch_index` (`tenant_id`,`stock_batch_id`),
  ADD KEY `prib_warehouse_foreign` (`tenant_id`,`warehouse_id`),
  ADD KEY `prib_batch_product_foreign` (`tenant_id`,`stock_batch_id`,`product_id`);

--
-- Indexes for table `stock_adjustments`
--
ALTER TABLE `stock_adjustments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `stock_adjustments_tenant_number_unique` (`tenant_id`,`adjustment_number`),
  ADD UNIQUE KEY `stock_adjustments_tenant_id_unique` (`tenant_id`,`id`),
  ADD UNIQUE KEY `stock_adjustments_context_unique` (`tenant_id`,`id`,`branch_id`,`warehouse_id`),
  ADD KEY `stock_adjustments_tenant_status_date_index` (`tenant_id`,`status`,`adjustment_date`),
  ADD KEY `stock_adjustments_tenant_type_date_index` (`tenant_id`,`adjustment_type`,`adjustment_date`),
  ADD KEY `stock_adjustments_tenant_warehouse_date_index` (`tenant_id`,`warehouse_id`,`adjustment_date`),
  ADD KEY `stock_adjustments_reference_index` (`tenant_id`,`reference_no`),
  ADD KEY `stock_adjustments_warehouse_context_foreign` (`tenant_id`,`branch_id`,`warehouse_id`);

--
-- Indexes for table `stock_adjustment_items`
--
ALTER TABLE `stock_adjustment_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `stock_adjustment_items_adjustment_product_unique` (`stock_adjustment_id`,`product_id`),
  ADD UNIQUE KEY `stock_adjustment_items_tenant_id_unique` (`tenant_id`,`id`),
  ADD UNIQUE KEY `stock_adjustment_items_context_unique` (`tenant_id`,`id`,`product_id`),
  ADD UNIQUE KEY `stock_adjustment_items_stock_move_unique` (`tenant_id`,`stock_movement_id`),
  ADD UNIQUE KEY `stock_adjustment_items_void_move_unique` (`tenant_id`,`void_stock_movement_id`),
  ADD KEY `stock_adjustment_items_tenant_adjustment_index` (`tenant_id`,`stock_adjustment_id`),
  ADD KEY `stock_adjustment_items_tenant_product_index` (`tenant_id`,`product_id`);

--
-- Indexes for table `stock_adjustment_item_batches`
--
ALTER TABLE `stock_adjustment_item_batches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `saib_item_batch_direction_unique` (`stock_adjustment_item_id`,`stock_batch_id`,`direction`),
  ADD UNIQUE KEY `saib_tenant_id_unique` (`tenant_id`,`id`),
  ADD UNIQUE KEY `saib_stock_move_batch_unique` (`tenant_id`,`stock_movement_batch_id`),
  ADD UNIQUE KEY `saib_void_move_batch_unique` (`tenant_id`,`void_stock_movement_batch_id`),
  ADD KEY `saib_tenant_item_index` (`tenant_id`,`stock_adjustment_item_id`),
  ADD KEY `saib_tenant_batch_index` (`tenant_id`,`stock_batch_id`),
  ADD KEY `saib_tenant_product_index` (`tenant_id`,`product_id`),
  ADD KEY `saib_item_product_foreign` (`tenant_id`,`stock_adjustment_item_id`,`product_id`),
  ADD KEY `saib_warehouse_foreign` (`tenant_id`,`warehouse_id`),
  ADD KEY `saib_batch_product_foreign` (`tenant_id`,`stock_batch_id`,`product_id`);

--
-- Indexes for table `stock_batches`
--
ALTER TABLE `stock_batches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `stock_batches_tenant_code_unique` (`tenant_id`,`batch_code`),
  ADD UNIQUE KEY `stock_batches_tenant_id_unique` (`tenant_id`,`id`),
  ADD UNIQUE KEY `stock_batches_tenant_id_product_unique` (`tenant_id`,`id`,`product_id`),
  ADD KEY `stock_batches_tenant_product_index` (`tenant_id`,`product_id`),
  ADD KEY `stock_batches_tenant_status_index` (`tenant_id`,`status`),
  ADD KEY `stock_batches_tenant_expiration_index` (`tenant_id`,`expiration_date`),
  ADD KEY `stock_batches_supplier_index` (`supplier_id`),
  ADD KEY `stock_batches_receipt_item_index` (`purchase_receipt_item_id`),
  ADD KEY `stock_batches_supplier_foreign` (`tenant_id`,`supplier_id`),
  ADD KEY `stock_batches_receipt_item_foreign` (`tenant_id`,`purchase_receipt_item_id`);

--
-- Indexes for table `stock_batches_backup_before_batch_core_v3_20260725`
--
ALTER TABLE `stock_batches_backup_before_batch_core_v3_20260725`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `stock_batches_tenant_code_unique` (`tenant_id`,`batch_code`),
  ADD UNIQUE KEY `stock_batches_tenant_id_unique` (`tenant_id`,`id`),
  ADD UNIQUE KEY `stock_batches_tenant_id_product_unique` (`tenant_id`,`id`,`product_id`),
  ADD KEY `stock_batches_tenant_product_index` (`tenant_id`,`product_id`),
  ADD KEY `stock_batches_tenant_status_index` (`tenant_id`,`status`),
  ADD KEY `stock_batches_tenant_expiration_index` (`tenant_id`,`expiration_date`),
  ADD KEY `stock_batches_supplier_index` (`supplier_id`),
  ADD KEY `stock_batches_receipt_item_index` (`purchase_receipt_item_id`),
  ADD KEY `stock_batches_supplier_foreign` (`tenant_id`,`supplier_id`),
  ADD KEY `stock_batches_receipt_item_foreign` (`tenant_id`,`purchase_receipt_item_id`);

--
-- Indexes for table `stock_batch_status_histories`
--
ALTER TABLE `stock_batch_status_histories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sbsh_tenant_id_unique` (`tenant_id`,`id`),
  ADD KEY `sbsh_tenant_batch_index` (`tenant_id`,`stock_batch_id`),
  ADD KEY `sbsh_tenant_status_date_index` (`tenant_id`,`new_status`,`changed_at`),
  ADD KEY `sbsh_reference_index` (`tenant_id`,`reference_type`,`reference_id`);

--
-- Indexes for table `stock_issuances`
--
ALTER TABLE `stock_issuances`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `stock_issuances_tenant_number_unique` (`tenant_id`,`issuance_number`),
  ADD UNIQUE KEY `stock_issuances_tenant_id_unique` (`tenant_id`,`id`),
  ADD UNIQUE KEY `stock_issuances_context_unique` (`tenant_id`,`id`,`branch_id`,`warehouse_id`),
  ADD KEY `stock_issuances_tenant_index` (`tenant_id`),
  ADD KEY `stock_issuances_branch_index` (`branch_id`),
  ADD KEY `stock_issuances_warehouse_index` (`warehouse_id`),
  ADD KEY `stock_issuances_tenant_status_date_index` (`tenant_id`,`status`,`issuance_date`),
  ADD KEY `stock_issuances_tenant_branch_date_index` (`tenant_id`,`branch_id`,`issuance_date`),
  ADD KEY `stock_issuances_tenant_warehouse_date_index` (`tenant_id`,`warehouse_id`,`issuance_date`),
  ADD KEY `stock_issuances_tenant_reason_date_index` (`tenant_id`,`reason`,`issuance_date`),
  ADD KEY `stock_issuances_reference_index` (`tenant_id`,`reference_no`),
  ADD KEY `stock_issuances_issued_by_index` (`issued_by`),
  ADD KEY `stock_issuances_voided_by_index` (`voided_by`),
  ADD KEY `stock_issuances_tenant_branch_warehouse_foreign` (`tenant_id`,`branch_id`,`warehouse_id`);

--
-- Indexes for table `stock_issuance_items`
--
ALTER TABLE `stock_issuance_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `stock_issuance_items_tenant_id_unique` (`tenant_id`,`id`),
  ADD UNIQUE KEY `stock_issuance_items_issuance_product_unique` (`stock_issuance_id`,`product_id`),
  ADD UNIQUE KEY `stock_issuance_items_stock_move_unique` (`tenant_id`,`stock_movement_id`),
  ADD UNIQUE KEY `stock_issuance_items_void_move_unique` (`tenant_id`,`void_stock_movement_id`),
  ADD KEY `stock_issuance_items_tenant_index` (`tenant_id`),
  ADD KEY `stock_issuance_items_issuance_index` (`stock_issuance_id`),
  ADD KEY `stock_issuance_items_product_index` (`product_id`),
  ADD KEY `stock_issuance_items_tenant_issuance_index` (`tenant_id`,`stock_issuance_id`),
  ADD KEY `stock_issuance_items_tenant_product_index` (`tenant_id`,`product_id`);

--
-- Indexes for table `stock_issuance_item_batches`
--
ALTER TABLE `stock_issuance_item_batches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `siib_item_batch_warehouse_unique` (`stock_issuance_item_id`,`stock_batch_id`,`warehouse_id`),
  ADD UNIQUE KEY `siib_tenant_id_unique` (`tenant_id`,`id`),
  ADD UNIQUE KEY `siib_movement_batch_unique` (`tenant_id`,`stock_movement_batch_id`),
  ADD UNIQUE KEY `siib_void_move_batch_unique` (`tenant_id`,`void_stock_movement_batch_id`),
  ADD KEY `siib_tenant_item_index` (`tenant_id`,`stock_issuance_item_id`),
  ADD KEY `siib_tenant_product_index` (`tenant_id`,`product_id`),
  ADD KEY `siib_tenant_batch_index` (`tenant_id`,`stock_batch_id`),
  ADD KEY `siib_warehouse_foreign` (`tenant_id`,`warehouse_id`),
  ADD KEY `siib_batch_product_foreign` (`tenant_id`,`stock_batch_id`,`product_id`);

--
-- Indexes for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `stock_movements_tenant_id_unique` (`tenant_id`,`id`),
  ADD UNIQUE KEY `stock_movements_one_reversal_unique` (`tenant_id`,`reversal_of_movement_id`),
  ADD KEY `stock_movements_tenant_id_index` (`tenant_id`),
  ADD KEY `stock_movements_warehouse_id_index` (`warehouse_id`),
  ADD KEY `stock_movements_product_id_index` (`product_id`),
  ADD KEY `stock_movements_tenant_warehouse_index` (`tenant_id`,`warehouse_id`),
  ADD KEY `stock_movements_tenant_product_index` (`tenant_id`,`product_id`),
  ADD KEY `stock_movements_type_date_index` (`movement_type`,`movement_date`),
  ADD KEY `stock_movements_reference_index` (`reference_type`,`reference_id`),
  ADD KEY `stock_movements_created_by_index` (`created_by`),
  ADD KEY `stock_movements_related_warehouse_index` (`related_warehouse_id`),
  ADD KEY `stock_movements_tenant_related_warehouse_index` (`tenant_id`,`related_warehouse_id`),
  ADD KEY `stock_movements_batch_status_index` (`tenant_id`,`is_batch_tracked`,`batch_allocation_status`);

--
-- Indexes for table `stock_movements_backup_before_batch_core_v3_20260725`
--
ALTER TABLE `stock_movements_backup_before_batch_core_v3_20260725`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `stock_movements_tenant_id_unique` (`tenant_id`,`id`),
  ADD UNIQUE KEY `stock_movements_one_reversal_unique` (`tenant_id`,`reversal_of_movement_id`),
  ADD KEY `stock_movements_tenant_id_index` (`tenant_id`),
  ADD KEY `stock_movements_warehouse_id_index` (`warehouse_id`),
  ADD KEY `stock_movements_product_id_index` (`product_id`),
  ADD KEY `stock_movements_tenant_warehouse_index` (`tenant_id`,`warehouse_id`),
  ADD KEY `stock_movements_tenant_product_index` (`tenant_id`,`product_id`),
  ADD KEY `stock_movements_type_date_index` (`movement_type`,`movement_date`),
  ADD KEY `stock_movements_reference_index` (`reference_type`,`reference_id`),
  ADD KEY `stock_movements_created_by_index` (`created_by`),
  ADD KEY `stock_movements_related_warehouse_index` (`related_warehouse_id`),
  ADD KEY `stock_movements_tenant_related_warehouse_index` (`tenant_id`,`related_warehouse_id`);

--
-- Indexes for table `stock_movement_batches`
--
ALTER TABLE `stock_movement_batches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `smb_move_batch_unique` (`stock_movement_id`,`stock_batch_id`),
  ADD UNIQUE KEY `smb_tenant_id_unique` (`tenant_id`,`id`),
  ADD UNIQUE KEY `smb_one_reversal_unique` (`tenant_id`,`reversal_of_stock_movement_batch_id`),
  ADD KEY `smb_tenant_movement_index` (`tenant_id`,`stock_movement_id`),
  ADD KEY `smb_tenant_batch_index` (`tenant_id`,`stock_batch_id`),
  ADD KEY `smb_tenant_product_index` (`tenant_id`,`product_id`),
  ADD KEY `smb_warehouse_foreign` (`tenant_id`,`warehouse_id`),
  ADD KEY `smb_batch_product_foreign` (`tenant_id`,`stock_batch_id`,`product_id`);

--
-- Indexes for table `stock_transfers`
--
ALTER TABLE `stock_transfers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `stock_transfers_tenant_number_unique` (`tenant_id`,`transfer_number`),
  ADD UNIQUE KEY `stock_transfers_tenant_id_unique` (`tenant_id`,`id`),
  ADD UNIQUE KEY `stock_transfers_context_unique` (`tenant_id`,`id`,`from_warehouse_id`,`to_warehouse_id`),
  ADD KEY `stock_transfers_tenant_status_date_index` (`tenant_id`,`status`,`transfer_date`),
  ADD KEY `stock_transfers_from_warehouse_date_index` (`tenant_id`,`from_warehouse_id`,`transfer_date`),
  ADD KEY `stock_transfers_to_warehouse_date_index` (`tenant_id`,`to_warehouse_id`,`transfer_date`),
  ADD KEY `stock_transfers_reference_index` (`tenant_id`,`reference_no`),
  ADD KEY `stock_transfers_from_warehouse_foreign` (`tenant_id`,`from_branch_id`,`from_warehouse_id`),
  ADD KEY `stock_transfers_to_warehouse_foreign` (`tenant_id`,`to_branch_id`,`to_warehouse_id`);

--
-- Indexes for table `stock_transfer_items`
--
ALTER TABLE `stock_transfer_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `stock_transfer_items_transfer_product_unique` (`stock_transfer_id`,`product_id`),
  ADD UNIQUE KEY `stock_transfer_items_tenant_id_unique` (`tenant_id`,`id`),
  ADD UNIQUE KEY `stock_transfer_items_context_unique` (`tenant_id`,`id`,`product_id`),
  ADD UNIQUE KEY `stock_transfer_items_out_move_unique` (`tenant_id`,`transfer_out_stock_movement_id`),
  ADD UNIQUE KEY `stock_transfer_items_in_move_unique` (`tenant_id`,`transfer_in_stock_movement_id`),
  ADD UNIQUE KEY `stock_transfer_items_void_out_move_unique` (`tenant_id`,`void_out_stock_movement_id`),
  ADD UNIQUE KEY `stock_transfer_items_void_in_move_unique` (`tenant_id`,`void_in_stock_movement_id`),
  ADD KEY `stock_transfer_items_tenant_transfer_index` (`tenant_id`,`stock_transfer_id`),
  ADD KEY `stock_transfer_items_tenant_product_index` (`tenant_id`,`product_id`);

--
-- Indexes for table `stock_transfer_item_batches`
--
ALTER TABLE `stock_transfer_item_batches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `stib_item_batch_unique` (`stock_transfer_item_id`,`stock_batch_id`),
  ADD UNIQUE KEY `stib_tenant_id_unique` (`tenant_id`,`id`),
  ADD UNIQUE KEY `stib_out_move_batch_unique` (`tenant_id`,`transfer_out_stock_movement_batch_id`),
  ADD UNIQUE KEY `stib_in_move_batch_unique` (`tenant_id`,`transfer_in_stock_movement_batch_id`),
  ADD UNIQUE KEY `stib_void_out_move_batch_unique` (`tenant_id`,`void_out_stock_movement_batch_id`),
  ADD UNIQUE KEY `stib_void_in_move_batch_unique` (`tenant_id`,`void_in_stock_movement_batch_id`),
  ADD KEY `stib_tenant_item_index` (`tenant_id`,`stock_transfer_item_id`),
  ADD KEY `stib_tenant_batch_index` (`tenant_id`,`stock_batch_id`),
  ADD KEY `stib_from_warehouse_index` (`tenant_id`,`from_warehouse_id`),
  ADD KEY `stib_to_warehouse_index` (`tenant_id`,`to_warehouse_id`),
  ADD KEY `stib_item_product_foreign` (`tenant_id`,`stock_transfer_item_id`,`product_id`),
  ADD KEY `stib_batch_product_foreign` (`tenant_id`,`stock_batch_id`,`product_id`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `suppliers_tenant_code_unique` (`tenant_id`,`code`),
  ADD UNIQUE KEY `suppliers_tenant_id_unique` (`tenant_id`,`id`),
  ADD KEY `suppliers_tenant_id_index` (`tenant_id`),
  ADD KEY `suppliers_tenant_name_index` (`tenant_id`,`name`),
  ADD KEY `suppliers_tenant_active_index` (`tenant_id`,`is_active`),
  ADD KEY `suppliers_created_by_index` (`created_by`),
  ADD KEY `suppliers_email_index` (`email`),
  ADD KEY `suppliers_phone_index` (`phone`);

--
-- Indexes for table `warehouses`
--
ALTER TABLE `warehouses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `warehouses_branch_code_unique` (`tenant_id`,`branch_id`,`code`),
  ADD UNIQUE KEY `warehouses_tenant_id_unique` (`tenant_id`,`id`),
  ADD UNIQUE KEY `warehouses_tenant_branch_id_unique` (`tenant_id`,`branch_id`,`id`),
  ADD UNIQUE KEY `warehouses_one_active_main_per_branch` (`active_main_tenant_id`,`active_main_branch_id`),
  ADD KEY `warehouses_tenant_id_index` (`tenant_id`),
  ADD KEY `warehouses_branch_id_index` (`branch_id`),
  ADD KEY `warehouses_tenant_branch_index` (`tenant_id`,`branch_id`),
  ADD KEY `warehouses_tenant_active_index` (`tenant_id`,`is_active`),
  ADD KEY `warehouses_created_by_index` (`created_by`);

--
-- Indexes for table `warehouse_batch_stocks`
--
ALTER TABLE `warehouse_batch_stocks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `wbs_warehouse_batch_unique` (`warehouse_id`,`stock_batch_id`),
  ADD UNIQUE KEY `wbs_tenant_id_unique` (`tenant_id`,`id`),
  ADD KEY `wbs_tenant_warehouse_index` (`tenant_id`,`warehouse_id`),
  ADD KEY `wbs_tenant_product_index` (`tenant_id`,`product_id`),
  ADD KEY `wbs_tenant_batch_index` (`tenant_id`,`stock_batch_id`),
  ADD KEY `wbs_batch_product_foreign` (`tenant_id`,`stock_batch_id`,`product_id`);

--
-- Indexes for table `warehouse_batch_stocks_backup_before_batch_core_v3_20260725`
--
ALTER TABLE `warehouse_batch_stocks_backup_before_batch_core_v3_20260725`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `wbs_warehouse_batch_unique` (`warehouse_id`,`stock_batch_id`),
  ADD UNIQUE KEY `wbs_tenant_id_unique` (`tenant_id`,`id`),
  ADD KEY `wbs_tenant_warehouse_index` (`tenant_id`,`warehouse_id`),
  ADD KEY `wbs_tenant_product_index` (`tenant_id`,`product_id`),
  ADD KEY `wbs_tenant_batch_index` (`tenant_id`,`stock_batch_id`),
  ADD KEY `wbs_batch_product_foreign` (`tenant_id`,`stock_batch_id`,`product_id`);

--
-- Indexes for table `warehouse_stocks`
--
ALTER TABLE `warehouse_stocks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `warehouse_stocks_warehouse_product_unique` (`warehouse_id`,`product_id`),
  ADD KEY `warehouse_stocks_tenant_id_index` (`tenant_id`),
  ADD KEY `warehouse_stocks_warehouse_id_index` (`warehouse_id`),
  ADD KEY `warehouse_stocks_product_id_index` (`product_id`),
  ADD KEY `warehouse_stocks_tenant_warehouse_index` (`tenant_id`,`warehouse_id`),
  ADD KEY `warehouse_stocks_tenant_product_index` (`tenant_id`,`product_id`);

--
-- Indexes for table `warehouse_stocks_backup_before_batch_core_v3_20260725`
--
ALTER TABLE `warehouse_stocks_backup_before_batch_core_v3_20260725`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `warehouse_stocks_warehouse_product_unique` (`warehouse_id`,`product_id`),
  ADD KEY `warehouse_stocks_tenant_id_index` (`tenant_id`),
  ADD KEY `warehouse_stocks_warehouse_id_index` (`warehouse_id`),
  ADD KEY `warehouse_stocks_product_id_index` (`product_id`),
  ADD KEY `warehouse_stocks_tenant_warehouse_index` (`tenant_id`,`warehouse_id`),
  ADD KEY `warehouse_stocks_tenant_product_index` (`tenant_id`,`product_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `branches`
--
ALTER TABLE `branches`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `inventory_settings`
--
ALTER TABLE `inventory_settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products_backup_before_batching_20260725`
--
ALTER TABLE `products_backup_before_batching_20260725`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `products_backup_before_batch_core_v3_20260725`
--
ALTER TABLE `products_backup_before_batch_core_v3_20260725`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `purchase_receipts`
--
ALTER TABLE `purchase_receipts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `purchase_receipt_items`
--
ALTER TABLE `purchase_receipt_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `purchase_receipt_item_batches`
--
ALTER TABLE `purchase_receipt_item_batches`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock_adjustments`
--
ALTER TABLE `stock_adjustments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock_adjustment_items`
--
ALTER TABLE `stock_adjustment_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock_adjustment_item_batches`
--
ALTER TABLE `stock_adjustment_item_batches`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock_batches`
--
ALTER TABLE `stock_batches`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock_batches_backup_before_batch_core_v3_20260725`
--
ALTER TABLE `stock_batches_backup_before_batch_core_v3_20260725`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock_batch_status_histories`
--
ALTER TABLE `stock_batch_status_histories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock_issuances`
--
ALTER TABLE `stock_issuances`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `stock_issuance_items`
--
ALTER TABLE `stock_issuance_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `stock_issuance_item_batches`
--
ALTER TABLE `stock_issuance_item_batches`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock_movements`
--
ALTER TABLE `stock_movements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `stock_movements_backup_before_batch_core_v3_20260725`
--
ALTER TABLE `stock_movements_backup_before_batch_core_v3_20260725`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `stock_movement_batches`
--
ALTER TABLE `stock_movement_batches`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock_transfers`
--
ALTER TABLE `stock_transfers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock_transfer_items`
--
ALTER TABLE `stock_transfer_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock_transfer_item_batches`
--
ALTER TABLE `stock_transfer_item_batches`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `warehouses`
--
ALTER TABLE `warehouses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `warehouse_batch_stocks`
--
ALTER TABLE `warehouse_batch_stocks`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `warehouse_batch_stocks_backup_before_batch_core_v3_20260725`
--
ALTER TABLE `warehouse_batch_stocks_backup_before_batch_core_v3_20260725`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `warehouse_stocks`
--
ALTER TABLE `warehouse_stocks`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `warehouse_stocks_backup_before_batch_core_v3_20260725`
--
ALTER TABLE `warehouse_stocks_backup_before_batch_core_v3_20260725`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `categories_tenant_parent_foreign` FOREIGN KEY (`tenant_id`,`parent_id`) REFERENCES `categories` (`tenant_id`, `id`) ON UPDATE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `products_tenant_category_foreign` FOREIGN KEY (`tenant_id`,`category_id`) REFERENCES `categories` (`tenant_id`, `id`) ON UPDATE CASCADE;

--
-- Constraints for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  ADD CONSTRAINT `purchase_orders_branch_id_foreign` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `purchase_orders_supplier_id_foreign` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `purchase_orders_tenant_branch_warehouse_foreign` FOREIGN KEY (`tenant_id`,`branch_id`,`warehouse_id`) REFERENCES `warehouses` (`tenant_id`, `branch_id`, `id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `purchase_orders_tenant_supplier_foreign` FOREIGN KEY (`tenant_id`,`supplier_id`) REFERENCES `suppliers` (`tenant_id`, `id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `purchase_orders_warehouse_id_foreign` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  ADD CONSTRAINT `purchase_order_items_order_id_foreign` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchase_order_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `purchase_order_items_tenant_order_foreign` FOREIGN KEY (`tenant_id`,`purchase_order_id`) REFERENCES `purchase_orders` (`tenant_id`, `id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchase_order_items_tenant_product_foreign` FOREIGN KEY (`tenant_id`,`product_id`) REFERENCES `products` (`tenant_id`, `id`) ON UPDATE CASCADE;

--
-- Constraints for table `purchase_receipts`
--
ALTER TABLE `purchase_receipts`
  ADD CONSTRAINT `purchase_receipts_branch_id_foreign` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `purchase_receipts_order_context_foreign` FOREIGN KEY (`tenant_id`,`purchase_order_id`,`supplier_id`,`branch_id`,`warehouse_id`) REFERENCES `purchase_orders` (`tenant_id`, `id`, `supplier_id`, `branch_id`, `warehouse_id`),
  ADD CONSTRAINT `purchase_receipts_order_id_foreign` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `purchase_receipts_supplier_id_foreign` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `purchase_receipts_warehouse_id_foreign` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `purchase_receipt_items`
--
ALTER TABLE `purchase_receipt_items`
  ADD CONSTRAINT `purchase_receipt_items_order_item_id_foreign` FOREIGN KEY (`purchase_order_item_id`) REFERENCES `purchase_order_items` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `purchase_receipt_items_order_item_product_foreign` FOREIGN KEY (`tenant_id`,`purchase_order_item_id`,`product_id`) REFERENCES `purchase_order_items` (`tenant_id`, `id`, `product_id`),
  ADD CONSTRAINT `purchase_receipt_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `purchase_receipt_items_receipt_id_foreign` FOREIGN KEY (`purchase_receipt_id`) REFERENCES `purchase_receipts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchase_receipt_items_tenant_receipt_foreign` FOREIGN KEY (`tenant_id`,`purchase_receipt_id`) REFERENCES `purchase_receipts` (`tenant_id`, `id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `receipt_items_stock_move_foreign` FOREIGN KEY (`tenant_id`,`stock_movement_id`) REFERENCES `stock_movements` (`tenant_id`, `id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `receipt_items_void_move_foreign` FOREIGN KEY (`tenant_id`,`void_stock_movement_id`) REFERENCES `stock_movements` (`tenant_id`, `id`) ON UPDATE CASCADE;

--
-- Constraints for table `purchase_receipt_item_batches`
--
ALTER TABLE `purchase_receipt_item_batches`
  ADD CONSTRAINT `prib_batch_product_foreign` FOREIGN KEY (`tenant_id`,`stock_batch_id`,`product_id`) REFERENCES `stock_batches` (`tenant_id`, `id`, `product_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `prib_movement_batch_foreign` FOREIGN KEY (`tenant_id`,`stock_movement_batch_id`) REFERENCES `stock_movement_batches` (`tenant_id`, `id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `prib_receipt_item_foreign` FOREIGN KEY (`tenant_id`,`purchase_receipt_item_id`) REFERENCES `purchase_receipt_items` (`tenant_id`, `id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `prib_void_move_batch_foreign` FOREIGN KEY (`tenant_id`,`void_stock_movement_batch_id`) REFERENCES `stock_movement_batches` (`tenant_id`, `id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `prib_warehouse_foreign` FOREIGN KEY (`tenant_id`,`warehouse_id`) REFERENCES `warehouses` (`tenant_id`, `id`) ON UPDATE CASCADE;

--
-- Constraints for table `stock_adjustments`
--
ALTER TABLE `stock_adjustments`
  ADD CONSTRAINT `stock_adjustments_warehouse_context_foreign` FOREIGN KEY (`tenant_id`,`branch_id`,`warehouse_id`) REFERENCES `warehouses` (`tenant_id`, `branch_id`, `id`) ON UPDATE CASCADE;

--
-- Constraints for table `stock_adjustment_items`
--
ALTER TABLE `stock_adjustment_items`
  ADD CONSTRAINT `stock_adjustment_items_adjustment_foreign` FOREIGN KEY (`tenant_id`,`stock_adjustment_id`) REFERENCES `stock_adjustments` (`tenant_id`, `id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `stock_adjustment_items_product_foreign` FOREIGN KEY (`tenant_id`,`product_id`) REFERENCES `products` (`tenant_id`, `id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `stock_adjustment_items_stock_move_foreign` FOREIGN KEY (`tenant_id`,`stock_movement_id`) REFERENCES `stock_movements` (`tenant_id`, `id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `stock_adjustment_items_void_move_foreign` FOREIGN KEY (`tenant_id`,`void_stock_movement_id`) REFERENCES `stock_movements` (`tenant_id`, `id`) ON UPDATE CASCADE;

--
-- Constraints for table `stock_adjustment_item_batches`
--
ALTER TABLE `stock_adjustment_item_batches`
  ADD CONSTRAINT `saib_batch_product_foreign` FOREIGN KEY (`tenant_id`,`stock_batch_id`,`product_id`) REFERENCES `stock_batches` (`tenant_id`, `id`, `product_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `saib_item_product_foreign` FOREIGN KEY (`tenant_id`,`stock_adjustment_item_id`,`product_id`) REFERENCES `stock_adjustment_items` (`tenant_id`, `id`, `product_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `saib_stock_move_batch_foreign` FOREIGN KEY (`tenant_id`,`stock_movement_batch_id`) REFERENCES `stock_movement_batches` (`tenant_id`, `id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `saib_void_move_batch_foreign` FOREIGN KEY (`tenant_id`,`void_stock_movement_batch_id`) REFERENCES `stock_movement_batches` (`tenant_id`, `id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `saib_warehouse_foreign` FOREIGN KEY (`tenant_id`,`warehouse_id`) REFERENCES `warehouses` (`tenant_id`, `id`) ON UPDATE CASCADE;

--
-- Constraints for table `stock_batches`
--
ALTER TABLE `stock_batches`
  ADD CONSTRAINT `stock_batches_product_foreign` FOREIGN KEY (`tenant_id`,`product_id`) REFERENCES `products` (`tenant_id`, `id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `stock_batches_receipt_item_foreign` FOREIGN KEY (`tenant_id`,`purchase_receipt_item_id`) REFERENCES `purchase_receipt_items` (`tenant_id`, `id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `stock_batches_supplier_foreign` FOREIGN KEY (`tenant_id`,`supplier_id`) REFERENCES `suppliers` (`tenant_id`, `id`) ON UPDATE CASCADE;

--
-- Constraints for table `stock_batch_status_histories`
--
ALTER TABLE `stock_batch_status_histories`
  ADD CONSTRAINT `sbsh_batch_foreign` FOREIGN KEY (`tenant_id`,`stock_batch_id`) REFERENCES `stock_batches` (`tenant_id`, `id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `stock_issuances`
--
ALTER TABLE `stock_issuances`
  ADD CONSTRAINT `stock_issuances_branch_id_foreign` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `stock_issuances_tenant_branch_warehouse_foreign` FOREIGN KEY (`tenant_id`,`branch_id`,`warehouse_id`) REFERENCES `warehouses` (`tenant_id`, `branch_id`, `id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `stock_issuances_warehouse_id_foreign` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `stock_issuance_items`
--
ALTER TABLE `stock_issuance_items`
  ADD CONSTRAINT `stock_issuance_items_issuance_id_foreign` FOREIGN KEY (`stock_issuance_id`) REFERENCES `stock_issuances` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `stock_issuance_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `stock_issuance_items_stock_move_foreign` FOREIGN KEY (`tenant_id`,`stock_movement_id`) REFERENCES `stock_movements` (`tenant_id`, `id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `stock_issuance_items_tenant_issuance_foreign` FOREIGN KEY (`tenant_id`,`stock_issuance_id`) REFERENCES `stock_issuances` (`tenant_id`, `id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `stock_issuance_items_tenant_product_foreign` FOREIGN KEY (`tenant_id`,`product_id`) REFERENCES `products` (`tenant_id`, `id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `stock_issuance_items_void_move_foreign` FOREIGN KEY (`tenant_id`,`void_stock_movement_id`) REFERENCES `stock_movements` (`tenant_id`, `id`) ON UPDATE CASCADE;

--
-- Constraints for table `stock_issuance_item_batches`
--
ALTER TABLE `stock_issuance_item_batches`
  ADD CONSTRAINT `siib_batch_product_foreign` FOREIGN KEY (`tenant_id`,`stock_batch_id`,`product_id`) REFERENCES `stock_batches` (`tenant_id`, `id`, `product_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `siib_issuance_item_foreign` FOREIGN KEY (`tenant_id`,`stock_issuance_item_id`) REFERENCES `stock_issuance_items` (`tenant_id`, `id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `siib_movement_batch_foreign` FOREIGN KEY (`tenant_id`,`stock_movement_batch_id`) REFERENCES `stock_movement_batches` (`tenant_id`, `id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `siib_void_move_batch_foreign` FOREIGN KEY (`tenant_id`,`void_stock_movement_batch_id`) REFERENCES `stock_movement_batches` (`tenant_id`, `id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `siib_warehouse_foreign` FOREIGN KEY (`tenant_id`,`warehouse_id`) REFERENCES `warehouses` (`tenant_id`, `id`) ON UPDATE CASCADE;

--
-- Constraints for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD CONSTRAINT `stock_movements_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `stock_movements_related_warehouse_id_foreign` FOREIGN KEY (`related_warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `stock_movements_tenant_product_foreign` FOREIGN KEY (`tenant_id`,`product_id`) REFERENCES `products` (`tenant_id`, `id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `stock_movements_tenant_related_warehouse_foreign` FOREIGN KEY (`tenant_id`,`related_warehouse_id`) REFERENCES `warehouses` (`tenant_id`, `id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `stock_movements_tenant_reversal_foreign` FOREIGN KEY (`tenant_id`,`reversal_of_movement_id`) REFERENCES `stock_movements` (`tenant_id`, `id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `stock_movements_tenant_warehouse_foreign` FOREIGN KEY (`tenant_id`,`warehouse_id`) REFERENCES `warehouses` (`tenant_id`, `id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `stock_movements_warehouse_id_foreign` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `stock_movement_batches`
--
ALTER TABLE `stock_movement_batches`
  ADD CONSTRAINT `smb_batch_product_foreign` FOREIGN KEY (`tenant_id`,`stock_batch_id`,`product_id`) REFERENCES `stock_batches` (`tenant_id`, `id`, `product_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `smb_movement_foreign` FOREIGN KEY (`tenant_id`,`stock_movement_id`) REFERENCES `stock_movements` (`tenant_id`, `id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `smb_reversal_foreign` FOREIGN KEY (`tenant_id`,`reversal_of_stock_movement_batch_id`) REFERENCES `stock_movement_batches` (`tenant_id`, `id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `smb_warehouse_foreign` FOREIGN KEY (`tenant_id`,`warehouse_id`) REFERENCES `warehouses` (`tenant_id`, `id`) ON UPDATE CASCADE;

--
-- Constraints for table `stock_transfers`
--
ALTER TABLE `stock_transfers`
  ADD CONSTRAINT `stock_transfers_from_warehouse_foreign` FOREIGN KEY (`tenant_id`,`from_branch_id`,`from_warehouse_id`) REFERENCES `warehouses` (`tenant_id`, `branch_id`, `id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `stock_transfers_to_warehouse_foreign` FOREIGN KEY (`tenant_id`,`to_branch_id`,`to_warehouse_id`) REFERENCES `warehouses` (`tenant_id`, `branch_id`, `id`) ON UPDATE CASCADE;

--
-- Constraints for table `stock_transfer_items`
--
ALTER TABLE `stock_transfer_items`
  ADD CONSTRAINT `stock_transfer_items_in_move_foreign` FOREIGN KEY (`tenant_id`,`transfer_in_stock_movement_id`) REFERENCES `stock_movements` (`tenant_id`, `id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `stock_transfer_items_out_move_foreign` FOREIGN KEY (`tenant_id`,`transfer_out_stock_movement_id`) REFERENCES `stock_movements` (`tenant_id`, `id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `stock_transfer_items_product_foreign` FOREIGN KEY (`tenant_id`,`product_id`) REFERENCES `products` (`tenant_id`, `id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `stock_transfer_items_transfer_foreign` FOREIGN KEY (`tenant_id`,`stock_transfer_id`) REFERENCES `stock_transfers` (`tenant_id`, `id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `stock_transfer_items_void_in_move_foreign` FOREIGN KEY (`tenant_id`,`void_in_stock_movement_id`) REFERENCES `stock_movements` (`tenant_id`, `id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `stock_transfer_items_void_out_move_foreign` FOREIGN KEY (`tenant_id`,`void_out_stock_movement_id`) REFERENCES `stock_movements` (`tenant_id`, `id`) ON UPDATE CASCADE;

--
-- Constraints for table `stock_transfer_item_batches`
--
ALTER TABLE `stock_transfer_item_batches`
  ADD CONSTRAINT `stib_batch_product_foreign` FOREIGN KEY (`tenant_id`,`stock_batch_id`,`product_id`) REFERENCES `stock_batches` (`tenant_id`, `id`, `product_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `stib_from_warehouse_foreign` FOREIGN KEY (`tenant_id`,`from_warehouse_id`) REFERENCES `warehouses` (`tenant_id`, `id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `stib_in_move_batch_foreign` FOREIGN KEY (`tenant_id`,`transfer_in_stock_movement_batch_id`) REFERENCES `stock_movement_batches` (`tenant_id`, `id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `stib_item_product_foreign` FOREIGN KEY (`tenant_id`,`stock_transfer_item_id`,`product_id`) REFERENCES `stock_transfer_items` (`tenant_id`, `id`, `product_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `stib_out_move_batch_foreign` FOREIGN KEY (`tenant_id`,`transfer_out_stock_movement_batch_id`) REFERENCES `stock_movement_batches` (`tenant_id`, `id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `stib_to_warehouse_foreign` FOREIGN KEY (`tenant_id`,`to_warehouse_id`) REFERENCES `warehouses` (`tenant_id`, `id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `stib_void_in_move_batch_foreign` FOREIGN KEY (`tenant_id`,`void_in_stock_movement_batch_id`) REFERENCES `stock_movement_batches` (`tenant_id`, `id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `stib_void_out_move_batch_foreign` FOREIGN KEY (`tenant_id`,`void_out_stock_movement_batch_id`) REFERENCES `stock_movement_batches` (`tenant_id`, `id`) ON UPDATE CASCADE;

--
-- Constraints for table `warehouses`
--
ALTER TABLE `warehouses`
  ADD CONSTRAINT `warehouses_branch_id_foreign` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `warehouses_tenant_branch_foreign` FOREIGN KEY (`tenant_id`,`branch_id`) REFERENCES `branches` (`tenant_id`, `id`) ON UPDATE CASCADE;

--
-- Constraints for table `warehouse_batch_stocks`
--
ALTER TABLE `warehouse_batch_stocks`
  ADD CONSTRAINT `wbs_batch_product_foreign` FOREIGN KEY (`tenant_id`,`stock_batch_id`,`product_id`) REFERENCES `stock_batches` (`tenant_id`, `id`, `product_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `wbs_warehouse_foreign` FOREIGN KEY (`tenant_id`,`warehouse_id`) REFERENCES `warehouses` (`tenant_id`, `id`) ON UPDATE CASCADE;

--
-- Constraints for table `warehouse_stocks`
--
ALTER TABLE `warehouse_stocks`
  ADD CONSTRAINT `warehouse_stocks_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `warehouse_stocks_tenant_product_foreign` FOREIGN KEY (`tenant_id`,`product_id`) REFERENCES `products` (`tenant_id`, `id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `warehouse_stocks_tenant_warehouse_foreign` FOREIGN KEY (`tenant_id`,`warehouse_id`) REFERENCES `warehouses` (`tenant_id`, `id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `warehouse_stocks_warehouse_id_foreign` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
