-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 02, 2026 at 09:14 AM
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
-- Database: `jcm_inventory_pos`
--

-- --------------------------------------------------------

--
-- Table structure for table `branches`
--

CREATE TABLE `branches` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(180) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `is_main` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `branches`
--

INSERT INTO `branches` (`id`, `tenant_id`, `name`, `code`, `is_main`, `is_active`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 'June Charles Mariquit\'s Store', 'MAIN', 1, 1, '2026-05-28 02:32:27', '2026-05-28 02:32:27', NULL),
(9, 1, '123', '123', 0, 1, '2026-05-27 23:15:29', '2026-05-27 23:21:57', '2026-05-27 23:21:57'),
(11, 1, '132', '1312', 0, 1, '2026-05-27 23:23:22', '2026-05-27 23:23:22', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cash_drawers`
--

CREATE TABLE `cash_drawers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `branch_id` bigint(20) UNSIGNED DEFAULT NULL,
  `opened_by` bigint(20) UNSIGNED NOT NULL,
  `closed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `opening_balance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `expected_balance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `actual_balance` decimal(12,2) DEFAULT NULL,
  `variance_amount` decimal(12,2) DEFAULT 0.00,
  `total_cash_sales` decimal(12,2) DEFAULT 0.00,
  `total_refunds` decimal(12,2) DEFAULT 0.00,
  `total_cash_in` decimal(12,2) DEFAULT 0.00,
  `total_cash_out` decimal(12,2) DEFAULT 0.00,
  `status` enum('open','closed') NOT NULL DEFAULT 'open',
  `opened_at` timestamp NULL DEFAULT NULL,
  `closed_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cash_drawers`
--

INSERT INTO `cash_drawers` (`id`, `tenant_id`, `branch_id`, `opened_by`, `closed_by`, `opening_balance`, `expected_balance`, `actual_balance`, `variance_amount`, `total_cash_sales`, `total_refunds`, `total_cash_in`, `total_cash_out`, `status`, `opened_at`, `closed_at`, `notes`, `created_at`, `updated_at`) VALUES
(3, 1, 1, 1, NULL, 0.00, 2096.00, NULL, NULL, 156.00, 0.00, 2000.00, 60.00, 'open', '2026-06-01 22:10:14', NULL, 'DEV AUTO OPEN DRAWER', '2026-06-01 22:10:14', '2026-06-01 23:06:43'),
(4, 1, 11, 1, NULL, 0.00, 500.00, NULL, NULL, 0.00, 0.00, 500.00, 0.00, 'open', '2026-06-01 22:32:11', NULL, 'DEV AUTO OPEN DRAWER', '2026-06-01 22:32:11', '2026-06-01 22:32:11');

-- --------------------------------------------------------

--
-- Table structure for table `cash_drawer_transactions`
--

CREATE TABLE `cash_drawer_transactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `cash_drawer_id` bigint(20) UNSIGNED NOT NULL,
  `type` enum('opening','cash_sale','refund','cash_in','cash_out','closing_adjustment') NOT NULL,
  `cash_out_source` enum('change_fund','cash_sales') DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` bigint(20) UNSIGNED DEFAULT NULL,
  `withdrawn_at` timestamp NULL DEFAULT NULL,
  `withdrawn_by` bigint(20) UNSIGNED DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cash_drawer_transactions`
--

INSERT INTO `cash_drawer_transactions` (`id`, `tenant_id`, `cash_drawer_id`, `type`, `cash_out_source`, `amount`, `reference_type`, `reference_id`, `withdrawn_at`, `withdrawn_by`, `remarks`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'opening', NULL, 100.00, NULL, NULL, NULL, NULL, 'Opening cash drawer balance', 1, '2026-05-30 16:40:30', '2026-05-30 16:40:30'),
(2, 1, 1, 'cash_sale', NULL, 30.00, 'sale', 20, NULL, NULL, 'POS cash sale: SALE-20260531-00002', 1, '2026-05-30 18:30:34', '2026-05-30 18:30:34'),
(3, 1, 1, 'cash_out', NULL, 130.00, NULL, NULL, NULL, NULL, NULL, 1, '2026-05-30 18:30:59', '2026-05-30 18:30:59'),
(4, 1, 1, 'cash_out', NULL, 100.00, NULL, NULL, NULL, NULL, NULL, 1, '2026-06-01 21:39:36', '2026-06-01 21:39:36'),
(5, 1, 2, 'cash_in', NULL, 1000.00, NULL, NULL, NULL, NULL, 'Add cash / pang-barya', 1, '2026-06-01 21:59:31', '2026-06-01 21:59:31'),
(6, 1, 2, 'cash_sale', NULL, 60.00, 'sale', 23, NULL, NULL, 'POS cash sale: SALE-20260602-00001', 1, '2026-06-01 22:00:37', '2026-06-01 22:00:37'),
(7, 1, 2, 'cash_out', NULL, 60.00, NULL, NULL, NULL, NULL, 'Cash out / owner withdrawal', 1, '2026-06-01 22:00:53', '2026-06-01 22:00:53'),
(8, 1, 3, 'cash_in', NULL, 2000.00, NULL, NULL, NULL, NULL, 'Add cash / pang-barya', 1, '2026-06-01 22:10:14', '2026-06-01 22:10:14'),
(9, 1, 3, 'cash_sale', NULL, 60.00, 'sale', 25, '2026-06-01 22:17:02', 1, 'POS cash sale: SALE-20260602-00002', 1, '2026-06-01 22:16:38', '2026-06-01 22:17:02'),
(10, 1, 3, 'cash_out', 'cash_sales', 60.00, NULL, NULL, NULL, NULL, 'Cash out from sales', 1, '2026-06-01 22:17:02', '2026-06-01 22:17:02'),
(11, 1, 4, 'cash_in', NULL, 500.00, NULL, NULL, NULL, NULL, 'Add cash / pang-barya', 1, '2026-06-01 22:32:11', '2026-06-01 22:32:11'),
(12, 1, 3, 'cash_sale', NULL, 96.00, 'sale', 26, NULL, NULL, 'POS cash sale: SALE-20260602-00003', 1, '2026-06-01 23:06:43', '2026-06-01 23:06:43');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `branch_id` bigint(20) UNSIGNED DEFAULT NULL,
  `parent_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `slug` varchar(180) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `tenant_id`, `branch_id`, `parent_id`, `name`, `slug`, `description`, `sort_order`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 1, NULL, 'Soap', 'soap', 'Bath Soap, Cloth Soap', 0, 'active', '2026-05-20 18:54:10', '2026-05-21 00:32:30', NULL),
(2, 1, 11, NULL, '123', '123', '123', 0, 'active', '2026-05-29 00:02:49', '2026-05-29 00:02:49', NULL),
(3, 1, 11, NULL, '13', '13', '123', 0, 'active', '2026-05-29 00:02:56', '2026-05-29 00:02:56', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `discounts`
--

CREATE TABLE `discounts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `branch_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(100) DEFAULT NULL,
  `type` enum('percent','fixed') NOT NULL DEFAULT 'percent',
  `value` decimal(12,2) NOT NULL DEFAULT 0.00,
  `min_purchase` decimal(12,2) NOT NULL DEFAULT 0.00,
  `max_discount` decimal(12,2) DEFAULT NULL,
  `starts_at` datetime DEFAULT NULL,
  `ends_at` datetime DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `discounts`
--

INSERT INTO `discounts` (`id`, `tenant_id`, `branch_id`, `name`, `code`, `type`, `value`, `min_purchase`, `max_discount`, `starts_at`, `ends_at`, `is_active`, `notes`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 1, 'Senior citezen', 'SENIOR@)', 'percent', 20.00, 100.00, 50.00, '2026-01-05 00:00:00', '2026-12-25 00:00:00', 1, NULL, '2026-06-01 22:51:47', '2026-06-01 22:51:47', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `branch_id` bigint(20) UNSIGNED NOT NULL,
  `sale_id` bigint(20) UNSIGNED NOT NULL,
  `method` enum('cash','gcash','card','bank_transfer') NOT NULL DEFAULT 'cash',
  `amount` decimal(12,2) NOT NULL,
  `reference_no` varchar(150) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `tenant_id`, `branch_id`, `sale_id`, `method`, `amount`, `reference_no`, `remarks`, `created_at`, `updated_at`) VALUES
(3, 1, 1, 3, 'cash', 1000.00, NULL, NULL, '2026-05-21 19:52:06', '2026-05-21 19:52:06'),
(4, 1, 1, 4, 'cash', 500.00, NULL, NULL, '2026-05-24 17:05:05', '2026-05-24 17:05:05'),
(5, 1, 1, 5, 'cash', 1000.00, NULL, NULL, '2026-05-24 21:55:49', '2026-05-24 21:55:49'),
(6, 1, 1, 6, 'cash', 500.00, NULL, NULL, '2026-05-24 21:55:55', '2026-05-24 21:55:55'),
(7, 1, 1, 7, 'cash', 500.00, NULL, NULL, '2026-05-24 21:56:01', '2026-05-24 21:56:01'),
(8, 1, 1, 8, 'cash', 1000.00, NULL, NULL, '2026-05-24 22:09:21', '2026-05-24 22:09:21'),
(9, 1, 1, 9, 'gcash', 1000.00, '112', NULL, '2026-05-24 22:09:37', '2026-05-24 22:09:37'),
(10, 1, 1, 10, 'cash', 100.00, NULL, NULL, '2026-05-24 22:09:47', '2026-05-24 22:09:47'),
(11, 1, 1, 11, 'cash', 55.00, NULL, NULL, '2026-05-24 22:09:52', '2026-05-24 22:09:52'),
(12, 1, 1, 12, 'cash', 100.00, NULL, NULL, '2026-05-24 22:09:56', '2026-05-24 22:09:56'),
(13, 1, 1, 13, 'cash', 1000.00, NULL, NULL, '2026-05-25 23:24:52', '2026-05-25 23:24:52'),
(14, 1, 1, 14, 'cash', 1000.00, NULL, NULL, '2026-05-26 19:34:39', '2026-05-26 19:34:39'),
(15, 1, 1, 15, 'cash', 500.00, NULL, NULL, '2026-05-26 19:35:42', '2026-05-26 19:35:42'),
(16, 1, 1, 16, 'cash', 100.00, NULL, NULL, '2026-05-26 19:53:35', '2026-05-26 19:53:35'),
(17, 1, 1, 17, 'cash', 500.00, NULL, NULL, '2026-05-26 21:39:27', '2026-05-26 21:39:27'),
(18, 1, 1, 18, 'cash', 1000.00, NULL, NULL, '2026-05-30 18:19:41', '2026-05-30 18:19:41'),
(20, 1, 1, 20, 'cash', 500.00, NULL, NULL, '2026-05-30 18:30:34', '2026-05-30 18:30:34'),
(23, 1, 1, 23, 'cash', 1000.00, NULL, NULL, '2026-06-01 22:00:37', '2026-06-01 22:00:37'),
(25, 1, 1, 25, 'cash', 1000.00, NULL, NULL, '2026-06-01 22:16:38', '2026-06-01 22:16:38'),
(26, 1, 1, 26, 'cash', 500.00, NULL, NULL, '2026-06-01 23:06:43', '2026-06-01 23:06:43');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `branch_id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(180) NOT NULL,
  `slug` varchar(200) DEFAULT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `barcode` varchar(120) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `unit` varchar(50) DEFAULT 'pcs',
  `cost_price` decimal(12,2) DEFAULT 0.00,
  `selling_price` decimal(12,2) DEFAULT 0.00,
  `wholesale_price` decimal(12,2) DEFAULT NULL,
  `compare_at_price` decimal(12,2) DEFAULT NULL,
  `quantity` decimal(12,2) DEFAULT 0.00,
  `reorder_level` decimal(12,2) DEFAULT 0.00,
  `max_stock_level` decimal(12,2) DEFAULT NULL,
  `is_taxable` tinyint(1) DEFAULT 0,
  `tax_rate` decimal(5,2) DEFAULT 0.00,
  `allow_discount` tinyint(1) DEFAULT 1,
  `discount_type` enum('fixed','percentage') DEFAULT NULL,
  `discount_value` decimal(12,2) DEFAULT 0.00,
  `product_type` enum('standard','service') DEFAULT 'standard',
  `stock_tracking` enum('tracked','not_tracked') DEFAULT 'tracked',
  `low_stock_alert` tinyint(1) DEFAULT 1,
  `status` enum('active','inactive','draft') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `tenant_id`, `branch_id`, `category_id`, `name`, `slug`, `sku`, `barcode`, `description`, `image_path`, `unit`, `cost_price`, `selling_price`, `wholesale_price`, `compare_at_price`, `quantity`, `reorder_level`, `max_stock_level`, `is_taxable`, `tax_rate`, `allow_discount`, `discount_type`, `discount_value`, `product_type`, `stock_tracking`, `low_stock_alert`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 1, 1, 'Safe Guard', 'safe-guard', '123', '123123', NULL, NULL, 'pcs', 25.00, 30.00, NULL, NULL, 2.00, 0.00, NULL, 0, 0.00, 1, NULL, 0.00, 'standard', 'tracked', 1, 'active', '2026-05-20 19:05:30', '2026-06-01 23:06:43', NULL),
(2, 1, 1, 1, 'Dove', 'dove', NULL, NULL, NULL, NULL, 'pcs', 15.00, 25.00, NULL, NULL, 0.00, 0.00, NULL, 0, 0.00, 1, NULL, 0.00, 'standard', 'tracked', 1, 'active', '2026-05-20 23:42:27', '2026-05-21 19:52:06', NULL),
(3, 1, 1, 1, 'SafeGuard', 'safeguard', NULL, NULL, NULL, NULL, 'pcs', 45.00, 55.00, NULL, NULL, 70.00, 0.00, NULL, 0, 0.00, 1, NULL, 0.00, 'standard', 'tracked', 1, 'active', '2026-05-24 17:04:06', '2026-06-01 21:27:49', NULL),
(7, 1, 11, 3, '13', '13', NULL, NULL, '123', NULL, 'pcs', 123.00, 123.00, NULL, NULL, 123.00, 13.00, NULL, 0, 0.00, 1, NULL, 0.00, 'standard', 'tracked', 1, 'active', '2026-05-29 00:09:38', '2026-05-29 00:09:38', NULL),
(8, 1, 11, 2, 'sf', 'sf', NULL, NULL, NULL, NULL, 'pcs', 12.00, 50.00, NULL, NULL, 22.00, 0.00, NULL, 0, 0.00, 1, NULL, 0.00, 'standard', 'tracked', 1, 'active', '2026-05-29 00:17:54', '2026-05-29 00:18:02', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `product_stock_batches`
--

CREATE TABLE `product_stock_batches` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `branch_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `batch_no` varchar(100) DEFAULT NULL,
  `quantity_received` decimal(12,2) NOT NULL DEFAULT 0.00,
  `quantity_remaining` decimal(12,2) NOT NULL DEFAULT 0.00,
  `unit_cost` decimal(12,2) NOT NULL DEFAULT 0.00,
  `selling_price` decimal(12,2) DEFAULT NULL,
  `received_date` date NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_stock_batches`
--

INSERT INTO `product_stock_batches` (`id`, `tenant_id`, `branch_id`, `product_id`, `batch_no`, `quantity_received`, `quantity_remaining`, `unit_cost`, `selling_price`, `received_date`, `expiry_date`, `remarks`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 'BATCH-20260521030530-1', 10.00, 10.00, 0.00, 30.00, '2026-05-21', NULL, 'Initial stock', '2026-05-20 19:05:30', '2026-05-20 19:05:30'),
(2, 1, 1, 2, 'BATCH-20260521074227-2', 10.00, 10.00, 15.00, 25.00, '2026-05-21', NULL, 'Initial stock', '2026-05-20 23:42:27', '2026-05-20 23:42:27'),
(3, 1, 1, 3, 'BATCH-20260525010406-3', 100.00, 100.00, 45.00, 55.00, '2026-05-25', NULL, 'Initial stock', '2026-05-24 17:04:06', '2026-05-24 17:04:06'),
(5, 1, 11, 7, 'BATCH-20260529080938-7', 123.00, 123.00, 123.00, 123.00, '2026-05-29', NULL, 'Initial stock', '2026-05-29 00:09:38', '2026-05-29 00:09:38'),
(6, 1, 11, 8, 'BATCH-20260529081754-8', 22.00, 22.00, 12.00, 50.00, '2026-05-29', NULL, 'Initial stock', '2026-05-29 00:17:54', '2026-05-29 00:17:54');

-- --------------------------------------------------------

--
-- Table structure for table `return_items`
--

CREATE TABLE `return_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `branch_id` bigint(20) UNSIGNED DEFAULT NULL,
  `sale_id` bigint(20) UNSIGNED NOT NULL,
  `sale_item_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `return_no` varchar(100) NOT NULL,
  `quantity` decimal(12,2) NOT NULL DEFAULT 0.00,
  `unit_price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `line_total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `reason` varchar(255) DEFAULT NULL,
  `status` enum('completed','cancelled') DEFAULT 'completed',
  `returned_by` bigint(20) UNSIGNED DEFAULT NULL,
  `returned_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `return_items`
--

INSERT INTO `return_items` (`id`, `tenant_id`, `branch_id`, `sale_id`, `sale_item_id`, `product_id`, `return_no`, `quantity`, `unit_price`, `line_total`, `reason`, `status`, `returned_by`, `returned_at`, `created_at`, `updated_at`) VALUES
(5, 1, 1, 1, 1, 1, 'RET-20260530-00001', 2.00, 30.00, 60.00, NULL, 'completed', 1, '2026-05-29 22:15:11', '2026-05-29 22:15:11', '2026-05-29 22:15:11'),
(6, 1, 1, 2, 3, 1, 'RET-20260530-00002', 1.00, 30.00, 30.00, NULL, 'completed', 1, '2026-05-30 14:55:52', '2026-05-30 14:55:52', '2026-05-30 14:55:52'),
(7, 1, 1, 1, 1, 1, 'RET-20260601-00001', 1.00, 30.00, 30.00, NULL, 'completed', 1, '2026-06-01 07:16:48', '2026-06-01 07:16:48', '2026-06-01 07:16:48'),
(8, 1, 1, 3, 4, 1, 'RET-20260602-00001', 1.00, 30.00, 30.00, NULL, 'completed', 1, '2026-06-01 21:23:08', '2026-06-01 21:23:08', '2026-06-01 21:23:08'),
(9, 1, 1, 3, 4, 1, 'RET-20260602-00002', 1.00, 30.00, 30.00, NULL, 'completed', 1, '2026-06-01 21:23:24', '2026-06-01 21:23:24', '2026-06-01 21:23:24'),
(10, 1, 1, 1, 1, 1, 'RET-20260602-00003', 2.00, 30.00, 60.00, NULL, 'completed', 1, '2026-06-01 21:24:13', '2026-06-01 21:24:13', '2026-06-01 21:24:13'),
(11, 1, 1, 8, 10, 3, 'RET-20260602-00004', 1.00, 55.00, 55.00, NULL, 'completed', 1, '2026-06-01 21:27:49', '2026-06-01 21:27:49', '2026-06-01 21:27:49');

-- --------------------------------------------------------

--
-- Table structure for table `sales`
--

CREATE TABLE `sales` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `branch_id` bigint(20) UNSIGNED NOT NULL,
  `sale_no` varchar(100) NOT NULL,
  `cashier_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `discount_id` bigint(20) UNSIGNED DEFAULT NULL,
  `discount_name` varchar(255) DEFAULT NULL,
  `discount_code` varchar(100) DEFAULT NULL,
  `discount_type` enum('percent','fixed') DEFAULT NULL,
  `discount_value` decimal(12,2) DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `discount_total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `tax_total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `grand_total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `amount_paid` decimal(12,2) NOT NULL DEFAULT 0.00,
  `change_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `payment_status` enum('paid','partial','unpaid') NOT NULL DEFAULT 'paid',
  `status` enum('completed','voided','refunded') NOT NULL DEFAULT 'completed',
  `remarks` text DEFAULT NULL,
  `sold_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sales`
--

INSERT INTO `sales` (`id`, `tenant_id`, `branch_id`, `sale_no`, `cashier_user_id`, `discount_id`, `discount_name`, `discount_code`, `discount_type`, `discount_value`, `subtotal`, `discount_total`, `tax_total`, `grand_total`, `amount_paid`, `change_amount`, `payment_status`, `status`, `remarks`, `sold_at`, `created_at`, `updated_at`) VALUES
(3, 1, 1, 'SALE-20260522-00003', 1, NULL, NULL, NULL, NULL, NULL, 285.00, 0.00, 0.00, 285.00, 940.00, 655.00, 'paid', 'completed', NULL, '2026-05-21 19:52:06', '2026-05-21 19:52:06', '2026-06-01 21:23:24'),
(4, 1, 1, 'SALE-20260525-00001', 1, NULL, NULL, NULL, NULL, NULL, 110.00, 0.00, 0.00, 110.00, 500.00, 390.00, 'paid', 'completed', NULL, '2026-05-24 17:05:05', '2026-05-24 17:05:05', '2026-05-24 17:05:05'),
(5, 1, 1, 'SALE-20260525-00002', 1, NULL, NULL, NULL, NULL, NULL, 110.00, 0.00, 0.00, 110.00, 1000.00, 890.00, 'paid', 'completed', NULL, '2026-05-24 21:55:49', '2026-05-24 21:55:49', '2026-05-24 21:55:49'),
(6, 1, 1, 'SALE-20260525-00003', 1, NULL, NULL, NULL, NULL, NULL, 55.00, 0.00, 0.00, 55.00, 500.00, 445.00, 'paid', 'completed', NULL, '2026-05-24 21:55:55', '2026-05-24 21:55:55', '2026-05-24 21:55:55'),
(7, 1, 1, 'SALE-20260525-00004', 1, NULL, NULL, NULL, NULL, NULL, 55.00, 0.00, 0.00, 55.00, 500.00, 445.00, 'paid', 'completed', NULL, '2026-05-24 21:56:01', '2026-05-24 21:56:01', '2026-05-24 21:56:01'),
(8, 1, 1, 'SALE-20260525-00005', 1, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 1000.00, 1000.00, 'paid', 'completed', NULL, '2026-05-24 22:09:21', '2026-05-24 22:09:21', '2026-06-01 21:27:49'),
(9, 1, 1, 'SALE-20260525-00006', 1, NULL, NULL, NULL, NULL, NULL, 55.00, 0.00, 0.00, 55.00, 1000.00, 945.00, 'paid', 'completed', NULL, '2026-05-24 22:09:37', '2026-05-24 22:09:37', '2026-05-24 22:09:37'),
(10, 1, 1, 'SALE-20260525-00007', 1, NULL, NULL, NULL, NULL, NULL, 55.00, 0.00, 0.00, 55.00, 100.00, 45.00, 'paid', 'completed', NULL, '2026-05-24 22:09:47', '2026-05-24 22:09:47', '2026-05-24 22:09:47'),
(11, 1, 1, 'SALE-20260525-00008', 1, NULL, NULL, NULL, NULL, NULL, 55.00, 0.00, 0.00, 55.00, 55.00, 0.00, 'paid', 'completed', NULL, '2026-05-24 22:09:52', '2026-05-24 22:09:52', '2026-05-24 22:09:52'),
(12, 1, 1, 'SALE-20260525-00009', 1, NULL, NULL, NULL, NULL, NULL, 55.00, 0.00, 0.00, 55.00, 100.00, 45.00, 'paid', 'completed', NULL, '2026-05-24 22:09:56', '2026-05-24 22:09:56', '2026-05-24 22:09:56'),
(13, 1, 1, 'SALE-20260526-00001', 1, NULL, NULL, NULL, NULL, NULL, 660.00, 0.00, 0.00, 660.00, 1000.00, 340.00, 'paid', 'completed', NULL, '2026-05-25 23:24:52', '2026-05-25 23:24:52', '2026-05-25 23:24:52'),
(14, 1, 1, 'SALE-20260527-00001', 1, NULL, NULL, NULL, NULL, NULL, 55.00, 0.00, 0.00, 55.00, 1000.00, 945.00, 'paid', 'completed', NULL, '2026-05-26 19:34:39', '2026-05-26 19:34:39', '2026-05-26 19:34:39'),
(15, 1, 1, 'SALE-20260527-00002', 2, NULL, NULL, NULL, NULL, NULL, 110.00, 0.00, 0.00, 110.00, 500.00, 390.00, 'paid', 'completed', NULL, '2026-05-26 19:35:42', '2026-05-26 19:35:42', '2026-05-26 19:35:42'),
(16, 1, 1, 'SALE-20260527-00003', 2, NULL, NULL, NULL, NULL, NULL, 55.00, 0.00, 0.00, 55.00, 100.00, 45.00, 'paid', 'completed', NULL, '2026-05-26 19:53:35', '2026-05-26 19:53:35', '2026-05-26 19:53:35'),
(17, 1, 1, 'SALE-20260527-00004', 2, NULL, NULL, NULL, NULL, NULL, 165.00, 0.00, 0.00, 165.00, 500.00, 335.00, 'paid', 'completed', NULL, '2026-05-26 21:39:27', '2026-05-26 21:39:27', '2026-05-26 21:39:27'),
(18, 1, 1, 'SALE-20260531-00001', 1, NULL, NULL, NULL, NULL, NULL, 85.00, 0.00, 0.00, 85.00, 1000.00, 915.00, 'paid', 'completed', NULL, '2026-05-30 18:19:41', '2026-05-30 18:19:41', '2026-05-30 18:19:41'),
(20, 1, 1, 'SALE-20260531-00002', 1, NULL, NULL, NULL, NULL, NULL, 30.00, 0.00, 0.00, 30.00, 500.00, 470.00, 'paid', 'completed', NULL, '2026-05-30 18:30:34', '2026-05-30 18:30:34', '2026-05-30 18:30:34'),
(23, 1, 1, 'SALE-20260602-00001', 1, NULL, NULL, NULL, NULL, NULL, 60.00, 0.00, 0.00, 60.00, 1000.00, 940.00, 'paid', 'completed', NULL, '2026-06-01 22:00:37', '2026-06-01 22:00:37', '2026-06-01 22:00:37'),
(25, 1, 1, 'SALE-20260602-00002', 1, NULL, NULL, NULL, NULL, NULL, 60.00, 0.00, 0.00, 60.00, 1000.00, 940.00, 'paid', 'completed', NULL, '2026-06-01 22:16:38', '2026-06-01 22:16:38', '2026-06-01 22:16:38'),
(26, 1, 1, 'SALE-20260602-00003', 1, 1, 'Senior citezen', 'SENIOR@)', 'percent', 20.00, 120.00, 24.00, 0.00, 96.00, 500.00, 404.00, 'paid', 'completed', NULL, '2026-06-01 23:06:43', '2026-06-01 23:06:43', '2026-06-01 23:06:43');

-- --------------------------------------------------------

--
-- Table structure for table `sale_items`
--

CREATE TABLE `sale_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `branch_id` bigint(20) UNSIGNED NOT NULL,
  `sale_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `product_name` varchar(180) NOT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `quantity` decimal(12,2) NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `unit_cost` decimal(12,2) NOT NULL DEFAULT 0.00,
  `discount_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `line_total` decimal(12,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sale_items`
--

INSERT INTO `sale_items` (`id`, `tenant_id`, `branch_id`, `sale_id`, `product_id`, `product_name`, `sku`, `quantity`, `unit_price`, `unit_cost`, `discount_amount`, `line_total`, `created_at`, `updated_at`) VALUES
(4, 1, 1, 3, 1, 'Safe Guard', '123', 2.00, 30.00, 25.00, 0.00, 60.00, '2026-05-21 19:52:06', '2026-06-01 21:23:24'),
(5, 1, 1, 3, 2, 'Dove', NULL, 9.00, 25.00, 15.00, 0.00, 225.00, '2026-05-21 19:52:06', '2026-05-21 19:52:06'),
(6, 1, 1, 4, 3, 'SafeGuard', NULL, 2.00, 55.00, 45.00, 0.00, 110.00, '2026-05-24 17:05:05', '2026-05-24 17:05:05'),
(7, 1, 1, 5, 3, 'SafeGuard', NULL, 2.00, 55.00, 45.00, 0.00, 110.00, '2026-05-24 21:55:49', '2026-05-24 21:55:49'),
(8, 1, 1, 6, 3, 'SafeGuard', NULL, 1.00, 55.00, 45.00, 0.00, 55.00, '2026-05-24 21:55:55', '2026-05-24 21:55:55'),
(9, 1, 1, 7, 3, 'SafeGuard', NULL, 1.00, 55.00, 45.00, 0.00, 55.00, '2026-05-24 21:56:01', '2026-05-24 21:56:01'),
(10, 1, 1, 8, 3, 'SafeGuard', NULL, 0.00, 55.00, 45.00, 0.00, 0.00, '2026-05-24 22:09:21', '2026-06-01 21:27:49'),
(11, 1, 1, 9, 3, 'SafeGuard', NULL, 1.00, 55.00, 45.00, 0.00, 55.00, '2026-05-24 22:09:37', '2026-05-24 22:09:37'),
(12, 1, 1, 10, 3, 'SafeGuard', NULL, 1.00, 55.00, 45.00, 0.00, 55.00, '2026-05-24 22:09:47', '2026-05-24 22:09:47'),
(13, 1, 1, 11, 3, 'SafeGuard', NULL, 1.00, 55.00, 45.00, 0.00, 55.00, '2026-05-24 22:09:52', '2026-05-24 22:09:52'),
(14, 1, 1, 12, 3, 'SafeGuard', NULL, 1.00, 55.00, 45.00, 0.00, 55.00, '2026-05-24 22:09:56', '2026-05-24 22:09:56'),
(15, 1, 1, 13, 3, 'SafeGuard', NULL, 12.00, 55.00, 45.00, 0.00, 660.00, '2026-05-25 23:24:52', '2026-05-25 23:24:52'),
(16, 1, 1, 14, 3, 'SafeGuard', NULL, 1.00, 55.00, 45.00, 0.00, 55.00, '2026-05-26 19:34:39', '2026-05-26 19:34:39'),
(17, 1, 1, 15, 3, 'SafeGuard', NULL, 2.00, 55.00, 45.00, 0.00, 110.00, '2026-05-26 19:35:42', '2026-05-26 19:35:42'),
(18, 1, 1, 16, 3, 'SafeGuard', NULL, 1.00, 55.00, 45.00, 0.00, 55.00, '2026-05-26 19:53:35', '2026-05-26 19:53:35'),
(19, 1, 1, 17, 3, 'SafeGuard', NULL, 3.00, 55.00, 45.00, 0.00, 165.00, '2026-05-26 21:39:27', '2026-05-26 21:39:27'),
(20, 1, 1, 18, 3, 'SafeGuard', NULL, 1.00, 55.00, 45.00, 0.00, 55.00, '2026-05-30 18:19:41', '2026-05-30 18:19:41'),
(21, 1, 1, 18, 1, 'Safe Guard', '123', 1.00, 30.00, 25.00, 0.00, 30.00, '2026-05-30 18:19:41', '2026-05-30 18:19:41'),
(23, 1, 1, 20, 1, 'Safe Guard', '123', 1.00, 30.00, 25.00, 0.00, 30.00, '2026-05-30 18:30:34', '2026-05-30 18:30:34'),
(26, 1, 1, 23, 1, 'Safe Guard', '123', 2.00, 30.00, 25.00, 0.00, 60.00, '2026-06-01 22:00:37', '2026-06-01 22:00:37'),
(28, 1, 1, 25, 1, 'Safe Guard', '123', 2.00, 30.00, 25.00, 0.00, 60.00, '2026-06-01 22:16:38', '2026-06-01 22:16:38'),
(29, 1, 1, 26, 1, 'Safe Guard', '123', 4.00, 30.00, 25.00, 24.00, 120.00, '2026-06-01 23:06:43', '2026-06-01 23:06:43');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('ryQCQ2G3UEfOB8ZQIDw3tdgRzWoDv9FZ1JYWojdn', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiUFltcDN3S3JEZ2VQSVpaTGVYaG0wWEdrVUJOdzJtckdJUXhucVI5SyI7czozOiJ1cmwiO2E6MTp7czo4OiJpbnRlbmRlZCI7czo2MToiaHR0cDovLzEyNy4wLjAuMTo4MDAwL2NsaWVudC9zYWxlcy9yZXR1cm5zP2JyYW5jaF9pZD0mc2VhcmNoPSI7fXM6OToiX3ByZXZpb3VzIjthOjI6e3M6MzoidXJsIjtzOjYxOiJodHRwOi8vMTI3LjAuMC4xOjgwMDAvY2xpZW50L3NhbGVzL3JldHVybnM/YnJhbmNoX2lkPSZzZWFyY2g9IjtzOjU6InJvdXRlIjtzOjI2OiJjbGllbnQuc2FsZXMucmV0dXJucy5pbmRleCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1780377765),
('vnDIwRyrUvBbLoE6uXdSn3AaP638KFlSsHjzBw8m', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'YTo1OntzOjY6Il90b2tlbiI7czo0MDoiQzJUZnZCNHJPTVlzWGs5WDFFZTRLZ0Rld2JIVkVQdDVxRmZsN1YyNSI7czozOiJ1cmwiO2E6MDp7fXM6OToiX3ByZXZpb3VzIjthOjI6e3M6MzoidXJsIjtzOjg4OiJodHRwOi8vMTI3LjAuMC4xOjgwMDAvY2xpZW50L3Bvcy90ZXJtaW5hbD9icmFuY2hfaWQ9MSZjYXRlZ29yeV9pZD0mc2VhcmNoPSZzdG9ja19zdGF0dXM9IjtzOjU6InJvdXRlIjtzOjI1OiJjbGllbnQucG9zLnRlcm1pbmFsLmluZGV4Ijt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MTt9', 1780384079);

-- --------------------------------------------------------

--
-- Table structure for table `stock_movements`
--

CREATE TABLE `stock_movements` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `branch_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `product_stock_batch_id` bigint(20) UNSIGNED DEFAULT NULL,
  `movement_type` enum('initial_stock','stock_in','sale','return_in','return_out','adjustment_in','adjustment_out','damage','expired') NOT NULL,
  `quantity` decimal(12,2) NOT NULL,
  `unit_cost` decimal(12,2) DEFAULT 0.00,
  `total_cost` decimal(12,2) DEFAULT 0.00,
  `quantity_before` decimal(12,2) DEFAULT 0.00,
  `quantity_after` decimal(12,2) DEFAULT 0.00,
  `reference_type` varchar(100) DEFAULT NULL,
  `reference_id` bigint(20) UNSIGNED DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `movement_date` datetime NOT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stock_movements`
--

INSERT INTO `stock_movements` (`id`, `tenant_id`, `branch_id`, `product_id`, `product_stock_batch_id`, `movement_type`, `quantity`, `unit_cost`, `total_cost`, `quantity_before`, `quantity_after`, `reference_type`, `reference_id`, `remarks`, `movement_date`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 1, 'initial_stock', 10.00, 0.00, 0.00, 0.00, 10.00, NULL, NULL, 'Initial stock on product creation', '2026-05-21 03:05:30', 1, '2026-05-20 19:05:30', '2026-05-20 19:05:30'),
(2, 1, 1, 2, 2, 'initial_stock', 10.00, 15.00, 150.00, 0.00, 10.00, NULL, NULL, 'Initial stock on product creation', '2026-05-21 07:42:27', 1, '2026-05-20 23:42:27', '2026-05-20 23:42:27'),
(3, 1, 1, 1, NULL, 'sale', 5.00, 25.00, 125.00, 10.00, 5.00, NULL, NULL, 'Sold via POS. Sale No: SALE-20260522-00001', '2026-05-22 03:20:37', 1, '2026-05-21 19:20:37', '2026-05-21 19:20:37'),
(4, 1, 1, 2, NULL, 'sale', 1.00, 15.00, 15.00, 10.00, 9.00, NULL, NULL, 'Sold via POS. Sale No: SALE-20260522-00001', '2026-05-22 03:20:37', 1, '2026-05-21 19:20:37', '2026-05-21 19:20:37'),
(5, 1, 1, 1, NULL, 'sale', 1.00, 25.00, 25.00, 5.00, 4.00, NULL, NULL, 'Sold via POS. Sale No: SALE-20260522-00002', '2026-05-22 03:26:34', 1, '2026-05-21 19:26:34', '2026-05-21 19:26:34'),
(6, 1, 1, 1, NULL, 'sale', 4.00, 25.00, 100.00, 4.00, 0.00, NULL, NULL, 'POS sale: SALE-20260522-00003', '2026-05-22 03:52:06', 1, '2026-05-21 19:52:06', '2026-05-21 19:52:06'),
(7, 1, 1, 2, NULL, 'sale', 9.00, 15.00, 135.00, 9.00, 0.00, NULL, NULL, 'POS sale: SALE-20260522-00003', '2026-05-22 03:52:06', 1, '2026-05-21 19:52:06', '2026-05-21 19:52:06'),
(8, 1, 1, 3, 3, 'initial_stock', 100.00, 45.00, 4500.00, 0.00, 100.00, NULL, NULL, 'Initial stock on product creation', '2026-05-25 01:04:06', 1, '2026-05-24 17:04:06', '2026-05-24 17:04:06'),
(9, 1, 1, 3, NULL, 'sale', 2.00, 45.00, 90.00, 100.00, 98.00, NULL, NULL, 'POS sale: SALE-20260525-00001', '2026-05-25 01:05:05', 1, '2026-05-24 17:05:05', '2026-05-24 17:05:05'),
(10, 1, 1, 3, NULL, 'sale', 2.00, 45.00, 90.00, 98.00, 96.00, NULL, NULL, 'POS sale: SALE-20260525-00002', '2026-05-25 05:55:49', 1, '2026-05-24 21:55:49', '2026-05-24 21:55:49'),
(11, 1, 1, 3, NULL, 'sale', 1.00, 45.00, 45.00, 96.00, 95.00, NULL, NULL, 'POS sale: SALE-20260525-00003', '2026-05-25 05:55:55', 1, '2026-05-24 21:55:55', '2026-05-24 21:55:55'),
(12, 1, 1, 3, NULL, 'sale', 1.00, 45.00, 45.00, 95.00, 94.00, NULL, NULL, 'POS sale: SALE-20260525-00004', '2026-05-25 05:56:01', 1, '2026-05-24 21:56:01', '2026-05-24 21:56:01'),
(13, 1, 1, 3, NULL, 'sale', 1.00, 45.00, 45.00, 94.00, 93.00, NULL, NULL, 'POS sale: SALE-20260525-00005', '2026-05-25 06:09:21', 1, '2026-05-24 22:09:21', '2026-05-24 22:09:21'),
(14, 1, 1, 3, NULL, 'sale', 1.00, 45.00, 45.00, 93.00, 92.00, NULL, NULL, 'POS sale: SALE-20260525-00006', '2026-05-25 06:09:37', 1, '2026-05-24 22:09:37', '2026-05-24 22:09:37'),
(15, 1, 1, 3, NULL, 'sale', 1.00, 45.00, 45.00, 92.00, 91.00, NULL, NULL, 'POS sale: SALE-20260525-00007', '2026-05-25 06:09:47', 1, '2026-05-24 22:09:47', '2026-05-24 22:09:47'),
(16, 1, 1, 3, NULL, 'sale', 1.00, 45.00, 45.00, 91.00, 90.00, NULL, NULL, 'POS sale: SALE-20260525-00008', '2026-05-25 06:09:52', 1, '2026-05-24 22:09:52', '2026-05-24 22:09:52'),
(17, 1, 1, 3, NULL, 'sale', 1.00, 45.00, 45.00, 90.00, 89.00, NULL, NULL, 'POS sale: SALE-20260525-00009', '2026-05-25 06:09:56', 1, '2026-05-24 22:09:56', '2026-05-24 22:09:56'),
(18, 1, 1, 3, NULL, 'sale', 12.00, 45.00, 540.00, 89.00, 77.00, NULL, NULL, 'POS sale: SALE-20260526-00001', '2026-05-26 07:24:52', 1, '2026-05-25 23:24:52', '2026-05-25 23:24:52'),
(19, 1, 1, 3, NULL, 'sale', 1.00, 45.00, 45.00, 77.00, 76.00, NULL, NULL, 'POS sale: SALE-20260527-00001', '2026-05-27 03:34:39', 1, '2026-05-26 19:34:39', '2026-05-26 19:34:39'),
(20, 1, 1, 3, NULL, 'sale', 2.00, 45.00, 90.00, 76.00, 74.00, NULL, NULL, 'POS sale: SALE-20260527-00002', '2026-05-27 03:35:42', 2, '2026-05-26 19:35:42', '2026-05-26 19:35:42'),
(21, 1, 1, 3, NULL, 'sale', 1.00, 45.00, 45.00, 74.00, 73.00, NULL, NULL, 'POS sale: SALE-20260527-00003', '2026-05-27 03:53:35', 2, '2026-05-26 19:53:35', '2026-05-26 19:53:35'),
(22, 1, 1, 3, NULL, 'sale', 3.00, 45.00, 135.00, 73.00, 70.00, NULL, NULL, 'POS sale: SALE-20260527-00004', '2026-05-27 05:39:27', 2, '2026-05-26 21:39:27', '2026-05-26 21:39:27'),
(23, 1, 11, 7, 5, 'initial_stock', 123.00, 123.00, 15129.00, 0.00, 123.00, NULL, NULL, 'Initial stock on product creation', '2026-05-29 08:09:38', 1, '2026-05-29 00:09:38', '2026-05-29 00:09:38'),
(24, 1, 11, 8, 6, 'initial_stock', 22.00, 12.00, 264.00, 0.00, 22.00, NULL, NULL, 'Initial stock on product creation', '2026-05-29 08:17:54', 1, '2026-05-29 00:17:54', '2026-05-29 00:17:54'),
(25, 1, 1, 1, NULL, 'return_in', 2.00, 25.00, 50.00, 4.00, 6.00, NULL, NULL, 'POS return: SALE-20260522-00001', '2026-05-30 06:15:11', 1, '2026-05-29 22:15:11', '2026-05-29 22:15:11'),
(26, 1, 1, 1, NULL, 'return_in', 1.00, 25.00, 25.00, 6.00, 7.00, NULL, NULL, 'POS return: SALE-20260522-00002', '2026-05-30 22:55:52', 1, '2026-05-30 14:55:52', '2026-05-30 14:55:52'),
(27, 1, 1, 3, NULL, 'sale', 1.00, 45.00, 45.00, 70.00, 69.00, NULL, NULL, 'POS sale: SALE-20260531-00001', '2026-05-31 02:19:41', 1, '2026-05-30 18:19:41', '2026-05-30 18:19:41'),
(28, 1, 1, 1, NULL, 'sale', 1.00, 25.00, 25.00, 7.00, 6.00, NULL, NULL, 'POS sale: SALE-20260531-00001', '2026-05-31 02:19:41', 1, '2026-05-30 18:19:41', '2026-05-30 18:19:41'),
(30, 1, 1, 1, NULL, 'sale', 1.00, 25.00, 25.00, 6.00, 5.00, 'App\\Models\\Sale', 20, 'POS sale: SALE-20260531-00002', '2026-05-31 02:30:34', 1, '2026-05-30 18:30:34', '2026-05-30 18:30:34'),
(31, 1, 1, 1, NULL, 'return_in', 1.00, 25.00, 25.00, 5.00, 6.00, NULL, NULL, 'POS return: SALE-20260522-00001', '2026-06-01 15:16:48', 1, '2026-06-01 07:16:48', '2026-06-01 07:16:48'),
(32, 1, 1, 1, NULL, 'return_in', 1.00, 25.00, 25.00, 6.00, 7.00, NULL, NULL, 'POS return: SALE-20260522-00003', '2026-06-02 05:23:08', 1, '2026-06-01 21:23:08', '2026-06-01 21:23:08'),
(33, 1, 1, 1, NULL, 'return_in', 1.00, 25.00, 25.00, 7.00, 8.00, NULL, NULL, 'POS return: SALE-20260522-00003', '2026-06-02 05:23:24', 1, '2026-06-01 21:23:24', '2026-06-01 21:23:24'),
(34, 1, 1, 1, NULL, 'return_in', 2.00, 25.00, 50.00, 8.00, 10.00, NULL, NULL, 'POS return: SALE-20260522-00001', '2026-06-02 05:24:13', 1, '2026-06-01 21:24:13', '2026-06-01 21:24:13'),
(35, 1, 1, 3, NULL, 'return_in', 1.00, 45.00, 45.00, 69.00, 70.00, NULL, NULL, 'POS return: SALE-20260525-00005', '2026-06-02 05:27:49', 1, '2026-06-01 21:27:49', '2026-06-01 21:27:49'),
(38, 1, 1, 1, NULL, 'sale', 2.00, 25.00, 50.00, 10.00, 8.00, 'App\\Models\\Sale', 23, 'POS sale: SALE-20260602-00001', '2026-06-02 06:00:37', 1, '2026-06-01 22:00:37', '2026-06-01 22:00:37'),
(40, 1, 1, 1, NULL, 'sale', 2.00, 25.00, 50.00, 8.00, 6.00, 'App\\Models\\Sale', 25, 'POS sale: SALE-20260602-00002', '2026-06-02 06:16:38', 1, '2026-06-01 22:16:38', '2026-06-01 22:16:38'),
(41, 1, 1, 1, NULL, 'sale', 4.00, 25.00, 100.00, 6.00, 2.00, 'App\\Models\\Sale', 26, 'POS sale: SALE-20260602-00003', '2026-06-02 07:06:43', 1, '2026-06-01 23:06:43', '2026-06-01 23:06:43');

-- --------------------------------------------------------

--
-- Table structure for table `store_profiles`
--

CREATE TABLE `store_profiles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `client_id` bigint(20) UNSIGNED NOT NULL,
  `branch_id` bigint(20) UNSIGNED NOT NULL,
  `store_name` varchar(255) NOT NULL,
  `business_type` varchar(150) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address_line` varchar(255) DEFAULT NULL,
  `barangay` varchar(150) DEFAULT NULL,
  `city` varchar(150) DEFAULT NULL,
  `province` varchar(150) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `country` varchar(100) NOT NULL DEFAULT 'Philippines',
  `logo_path` varchar(255) DEFAULT NULL,
  `cover_path` varchar(255) DEFAULT NULL,
  `tin` varchar(100) DEFAULT NULL,
  `permit_no` varchar(100) DEFAULT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'PHP',
  `timezone` varchar(100) NOT NULL DEFAULT 'Asia/Manila',
  `receipt_header` text DEFAULT NULL,
  `receipt_footer` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `store_profiles`
--

INSERT INTO `store_profiles` (`id`, `client_id`, `branch_id`, `store_name`, `business_type`, `description`, `email`, `phone`, `address_line`, `barangay`, `city`, `province`, `postal_code`, `country`, `logo_path`, `cover_path`, `tin`, `permit_no`, `currency`, `timezone`, `receipt_header`, `receipt_footer`, `is_active`, `created_at`, `updated_at`) VALUES
(41, 1, 11, '132', 'Hardware', '123', '123@gmail.com', '123', '123', '123', '123', '123', '123', 'Philippines', 'store-profiles/logos/mb1Pr6OHgxeOfDjpOmgZvBqrodPHu9mkv1j3PdLW.png', 'store-profiles/covers/VcVQ0eczEYUILDHiIl56Smv31X1B1haVGfySG7jA.png', '123', '123', 'PHP', 'Asia/Manila', '123', '123', 1, '2026-05-27 23:23:22', '2026-05-28 00:29:31'),
(43, 1, 1, '11', 'Retail Store', NULL, 'junecharlesmariquit553@gmail.com', '11', '11', '11', '11', '11', '11', 'Philippines', 'store-profiles/logos/1KRA1P9BlfixC1KhiqV71KaFVTyfWScIcpJnz27g.png', 'store-profiles/covers/InylFgyJg8J5YCV9wTsOXEwgcGlzLtwVUwMmRQAt.png', '11', '11', 'PHP', 'Asia/Manila', '11', '11', 1, '2026-05-27 23:25:26', '2026-05-27 23:28:49');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `branches`
--
ALTER TABLE `branches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `branches_tenant_code_unique` (`tenant_id`,`code`),
  ADD KEY `branches_tenant_id_index` (`tenant_id`),
  ADD KEY `branches_is_main_index` (`is_main`),
  ADD KEY `branches_is_active_index` (`is_active`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cash_drawers`
--
ALTER TABLE `cash_drawers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tenant` (`tenant_id`),
  ADD KEY `idx_branch` (`branch_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `cash_drawer_transactions`
--
ALTER TABLE `cash_drawer_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tenant` (`tenant_id`),
  ADD KEY `idx_cash_drawer` (`cash_drawer_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_category_name_per_tenant` (`tenant_id`,`name`),
  ADD KEY `idx_categories_tenant_id` (`tenant_id`),
  ADD KEY `idx_categories_parent_id` (`parent_id`),
  ADD KEY `categories_tenant_branch_index` (`tenant_id`,`branch_id`),
  ADD KEY `categories_branch_id_foreign` (`branch_id`);

--
-- Indexes for table `discounts`
--
ALTER TABLE `discounts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_discounts_tenant_id` (`tenant_id`),
  ADD KEY `idx_discounts_branch_id` (`branch_id`),
  ADD KEY `idx_discounts_code` (`code`),
  ADD KEY `idx_discounts_active` (`is_active`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payments_tenant_sale_index` (`tenant_id`,`sale_id`),
  ADD KEY `payments_method_index` (`method`),
  ADD KEY `payments_sale_id_foreign` (`sale_id`),
  ADD KEY `payments_branch_id_index` (`branch_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_product_sku_per_tenant` (`tenant_id`,`sku`),
  ADD UNIQUE KEY `unique_product_barcode_per_tenant` (`tenant_id`,`barcode`),
  ADD KEY `idx_products_tenant_id` (`tenant_id`),
  ADD KEY `idx_products_category_id` (`category_id`),
  ADD KEY `idx_products_status` (`status`),
  ADD KEY `idx_products_sku` (`sku`),
  ADD KEY `idx_products_barcode` (`barcode`),
  ADD KEY `products_branch_id_index` (`branch_id`);

--
-- Indexes for table `product_stock_batches`
--
ALTER TABLE `product_stock_batches`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_stock_batches_tenant_id` (`tenant_id`),
  ADD KEY `idx_stock_batches_product_id` (`product_id`),
  ADD KEY `idx_stock_batches_received_date` (`received_date`),
  ADD KEY `idx_stock_batches_expiry_date` (`expiry_date`),
  ADD KEY `product_stock_batches_branch_id_index` (`branch_id`);

--
-- Indexes for table `return_items`
--
ALTER TABLE `return_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tenant` (`tenant_id`),
  ADD KEY `idx_branch` (`branch_id`),
  ADD KEY `idx_sale` (`sale_id`),
  ADD KEY `idx_sale_item` (`sale_item_id`),
  ADD KEY `idx_product` (`product_id`),
  ADD KEY `idx_return_no` (`return_no`);

--
-- Indexes for table `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sales_sale_no_unique` (`sale_no`),
  ADD KEY `sales_tenant_id_index` (`tenant_id`),
  ADD KEY `sales_cashier_user_id_index` (`cashier_user_id`),
  ADD KEY `sales_sold_at_index` (`sold_at`),
  ADD KEY `sales_status_index` (`status`),
  ADD KEY `sales_branch_id_index` (`branch_id`);

--
-- Indexes for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sale_items_tenant_sale_index` (`tenant_id`,`sale_id`),
  ADD KEY `sale_items_product_id_index` (`product_id`),
  ADD KEY `sale_items_sale_id_foreign` (`sale_id`),
  ADD KEY `sale_items_branch_id_index` (`branch_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_stock_movements_tenant_id` (`tenant_id`),
  ADD KEY `idx_stock_movements_product_id` (`product_id`),
  ADD KEY `idx_stock_movements_batch_id` (`product_stock_batch_id`),
  ADD KEY `idx_stock_movements_type` (`movement_type`),
  ADD KEY `idx_stock_movements_date` (`movement_date`),
  ADD KEY `stock_movements_branch_id_index` (`branch_id`);

--
-- Indexes for table `store_profiles`
--
ALTER TABLE `store_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_client_branch` (`client_id`,`branch_id`),
  ADD KEY `fk_store_profiles_branch_id` (`branch_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `branches`
--
ALTER TABLE `branches`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `cash_drawers`
--
ALTER TABLE `cash_drawers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `cash_drawer_transactions`
--
ALTER TABLE `cash_drawer_transactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `discounts`
--
ALTER TABLE `discounts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `product_stock_batches`
--
ALTER TABLE `product_stock_batches`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `return_items`
--
ALTER TABLE `return_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `sales`
--
ALTER TABLE `sales`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `sale_items`
--
ALTER TABLE `sale_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `stock_movements`
--
ALTER TABLE `stock_movements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `store_profiles`
--
ALTER TABLE `store_profiles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_branch_id_foreign` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_sale_id_foreign` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD CONSTRAINT `sale_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `sale_items_sale_id_foreign` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `store_profiles`
--
ALTER TABLE `store_profiles`
  ADD CONSTRAINT `fk_store_profiles_branch_id` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
