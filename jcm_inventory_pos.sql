-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 28, 2026 at 09:32 AM
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
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
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

INSERT INTO `categories` (`id`, `tenant_id`, `parent_id`, `name`, `slug`, `description`, `sort_order`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, NULL, 'Soap', 'soap', 'Bath Soap, Cloth Soap', 0, 'active', '2026-05-20 18:54:10', '2026-05-21 00:32:30', NULL);

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
(1, 1, 1, 1, 'cash', 1000.00, NULL, NULL, '2026-05-21 19:20:37', '2026-05-21 19:20:37'),
(2, 1, 1, 2, 'cash', 50.00, NULL, NULL, '2026-05-21 19:26:34', '2026-05-21 19:26:34'),
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
(17, 1, 1, 17, 'cash', 500.00, NULL, NULL, '2026-05-26 21:39:27', '2026-05-26 21:39:27');

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
(1, 1, 1, 1, 'Safe Guard', 'safe-guard', '123', '123123', NULL, NULL, 'pcs', 25.00, 30.00, NULL, NULL, 0.00, 0.00, NULL, 0, 0.00, 1, NULL, 0.00, 'standard', 'tracked', 1, 'active', '2026-05-20 19:05:30', '2026-05-21 19:52:06', NULL),
(2, 1, 1, 1, 'Dove', 'dove', NULL, NULL, NULL, NULL, 'pcs', 15.00, 25.00, NULL, NULL, 0.00, 0.00, NULL, 0, 0.00, 1, NULL, 0.00, 'standard', 'tracked', 1, 'active', '2026-05-20 23:42:27', '2026-05-21 19:52:06', NULL),
(3, 1, 1, 1, 'SafeGuard', 'safeguard', NULL, NULL, NULL, NULL, 'pcs', 45.00, 55.00, NULL, NULL, 70.00, 0.00, NULL, 0, 0.00, 1, NULL, 0.00, 'standard', 'tracked', 1, 'active', '2026-05-24 17:04:06', '2026-05-26 21:39:27', NULL);

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
(3, 1, 1, 3, 'BATCH-20260525010406-3', 100.00, 100.00, 45.00, 55.00, '2026-05-25', NULL, 'Initial stock', '2026-05-24 17:04:06', '2026-05-24 17:04:06');

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

INSERT INTO `sales` (`id`, `tenant_id`, `branch_id`, `sale_no`, `cashier_user_id`, `subtotal`, `discount_total`, `tax_total`, `grand_total`, `amount_paid`, `change_amount`, `payment_status`, `status`, `remarks`, `sold_at`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'SALE-20260522-00001', 1, 175.00, 0.00, 0.00, 175.00, 1000.00, 825.00, 'paid', 'completed', NULL, '2026-05-21 19:20:37', '2026-05-21 19:20:37', '2026-05-21 19:20:37'),
(2, 1, 1, 'SALE-20260522-00002', 1, 30.00, 0.00, 0.00, 30.00, 50.00, 20.00, 'paid', 'completed', NULL, '2026-05-21 19:26:34', '2026-05-21 19:26:34', '2026-05-21 19:26:34'),
(3, 1, 1, 'SALE-20260522-00003', 1, 345.00, 0.00, 0.00, 345.00, 1000.00, 655.00, 'paid', 'completed', NULL, '2026-05-21 19:52:06', '2026-05-21 19:52:06', '2026-05-21 19:52:06'),
(4, 1, 1, 'SALE-20260525-00001', 1, 110.00, 0.00, 0.00, 110.00, 500.00, 390.00, 'paid', 'completed', NULL, '2026-05-24 17:05:05', '2026-05-24 17:05:05', '2026-05-24 17:05:05'),
(5, 1, 1, 'SALE-20260525-00002', 1, 110.00, 0.00, 0.00, 110.00, 1000.00, 890.00, 'paid', 'completed', NULL, '2026-05-24 21:55:49', '2026-05-24 21:55:49', '2026-05-24 21:55:49'),
(6, 1, 1, 'SALE-20260525-00003', 1, 55.00, 0.00, 0.00, 55.00, 500.00, 445.00, 'paid', 'completed', NULL, '2026-05-24 21:55:55', '2026-05-24 21:55:55', '2026-05-24 21:55:55'),
(7, 1, 1, 'SALE-20260525-00004', 1, 55.00, 0.00, 0.00, 55.00, 500.00, 445.00, 'paid', 'completed', NULL, '2026-05-24 21:56:01', '2026-05-24 21:56:01', '2026-05-24 21:56:01'),
(8, 1, 1, 'SALE-20260525-00005', 1, 55.00, 0.00, 0.00, 55.00, 1000.00, 945.00, 'paid', 'completed', NULL, '2026-05-24 22:09:21', '2026-05-24 22:09:21', '2026-05-24 22:09:21'),
(9, 1, 1, 'SALE-20260525-00006', 1, 55.00, 0.00, 0.00, 55.00, 1000.00, 945.00, 'paid', 'completed', NULL, '2026-05-24 22:09:37', '2026-05-24 22:09:37', '2026-05-24 22:09:37'),
(10, 1, 1, 'SALE-20260525-00007', 1, 55.00, 0.00, 0.00, 55.00, 100.00, 45.00, 'paid', 'completed', NULL, '2026-05-24 22:09:47', '2026-05-24 22:09:47', '2026-05-24 22:09:47'),
(11, 1, 1, 'SALE-20260525-00008', 1, 55.00, 0.00, 0.00, 55.00, 55.00, 0.00, 'paid', 'completed', NULL, '2026-05-24 22:09:52', '2026-05-24 22:09:52', '2026-05-24 22:09:52'),
(12, 1, 1, 'SALE-20260525-00009', 1, 55.00, 0.00, 0.00, 55.00, 100.00, 45.00, 'paid', 'completed', NULL, '2026-05-24 22:09:56', '2026-05-24 22:09:56', '2026-05-24 22:09:56'),
(13, 1, 1, 'SALE-20260526-00001', 1, 660.00, 0.00, 0.00, 660.00, 1000.00, 340.00, 'paid', 'completed', NULL, '2026-05-25 23:24:52', '2026-05-25 23:24:52', '2026-05-25 23:24:52'),
(14, 1, 1, 'SALE-20260527-00001', 1, 55.00, 0.00, 0.00, 55.00, 1000.00, 945.00, 'paid', 'completed', NULL, '2026-05-26 19:34:39', '2026-05-26 19:34:39', '2026-05-26 19:34:39'),
(15, 1, 1, 'SALE-20260527-00002', 2, 110.00, 0.00, 0.00, 110.00, 500.00, 390.00, 'paid', 'completed', NULL, '2026-05-26 19:35:42', '2026-05-26 19:35:42', '2026-05-26 19:35:42'),
(16, 1, 1, 'SALE-20260527-00003', 2, 55.00, 0.00, 0.00, 55.00, 100.00, 45.00, 'paid', 'completed', NULL, '2026-05-26 19:53:35', '2026-05-26 19:53:35', '2026-05-26 19:53:35'),
(17, 1, 1, 'SALE-20260527-00004', 2, 165.00, 0.00, 0.00, 165.00, 500.00, 335.00, 'paid', 'completed', NULL, '2026-05-26 21:39:27', '2026-05-26 21:39:27', '2026-05-26 21:39:27');

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
(1, 1, 1, 1, 1, 'Safe Guard', '123', 5.00, 30.00, 25.00, 0.00, 150.00, '2026-05-21 19:20:37', '2026-05-21 19:20:37'),
(2, 1, 1, 1, 2, 'Dove', NULL, 1.00, 25.00, 15.00, 0.00, 25.00, '2026-05-21 19:20:37', '2026-05-21 19:20:37'),
(3, 1, 1, 2, 1, 'Safe Guard', '123', 1.00, 30.00, 25.00, 0.00, 30.00, '2026-05-21 19:26:34', '2026-05-21 19:26:34'),
(4, 1, 1, 3, 1, 'Safe Guard', '123', 4.00, 30.00, 25.00, 0.00, 120.00, '2026-05-21 19:52:06', '2026-05-21 19:52:06'),
(5, 1, 1, 3, 2, 'Dove', NULL, 9.00, 25.00, 15.00, 0.00, 225.00, '2026-05-21 19:52:06', '2026-05-21 19:52:06'),
(6, 1, 1, 4, 3, 'SafeGuard', NULL, 2.00, 55.00, 45.00, 0.00, 110.00, '2026-05-24 17:05:05', '2026-05-24 17:05:05'),
(7, 1, 1, 5, 3, 'SafeGuard', NULL, 2.00, 55.00, 45.00, 0.00, 110.00, '2026-05-24 21:55:49', '2026-05-24 21:55:49'),
(8, 1, 1, 6, 3, 'SafeGuard', NULL, 1.00, 55.00, 45.00, 0.00, 55.00, '2026-05-24 21:55:55', '2026-05-24 21:55:55'),
(9, 1, 1, 7, 3, 'SafeGuard', NULL, 1.00, 55.00, 45.00, 0.00, 55.00, '2026-05-24 21:56:01', '2026-05-24 21:56:01'),
(10, 1, 1, 8, 3, 'SafeGuard', NULL, 1.00, 55.00, 45.00, 0.00, 55.00, '2026-05-24 22:09:21', '2026-05-24 22:09:21'),
(11, 1, 1, 9, 3, 'SafeGuard', NULL, 1.00, 55.00, 45.00, 0.00, 55.00, '2026-05-24 22:09:37', '2026-05-24 22:09:37'),
(12, 1, 1, 10, 3, 'SafeGuard', NULL, 1.00, 55.00, 45.00, 0.00, 55.00, '2026-05-24 22:09:47', '2026-05-24 22:09:47'),
(13, 1, 1, 11, 3, 'SafeGuard', NULL, 1.00, 55.00, 45.00, 0.00, 55.00, '2026-05-24 22:09:52', '2026-05-24 22:09:52'),
(14, 1, 1, 12, 3, 'SafeGuard', NULL, 1.00, 55.00, 45.00, 0.00, 55.00, '2026-05-24 22:09:56', '2026-05-24 22:09:56'),
(15, 1, 1, 13, 3, 'SafeGuard', NULL, 12.00, 55.00, 45.00, 0.00, 660.00, '2026-05-25 23:24:52', '2026-05-25 23:24:52'),
(16, 1, 1, 14, 3, 'SafeGuard', NULL, 1.00, 55.00, 45.00, 0.00, 55.00, '2026-05-26 19:34:39', '2026-05-26 19:34:39'),
(17, 1, 1, 15, 3, 'SafeGuard', NULL, 2.00, 55.00, 45.00, 0.00, 110.00, '2026-05-26 19:35:42', '2026-05-26 19:35:42'),
(18, 1, 1, 16, 3, 'SafeGuard', NULL, 1.00, 55.00, 45.00, 0.00, 55.00, '2026-05-26 19:53:35', '2026-05-26 19:53:35'),
(19, 1, 1, 17, 3, 'SafeGuard', NULL, 3.00, 55.00, 45.00, 0.00, 165.00, '2026-05-26 21:39:27', '2026-05-26 21:39:27');

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
('vTsMGd81cj64OCUoScYdQtN2IlOhgCHfE2goE6Q6', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiMGp4M0p1UTR0Uk0yV016Z2tMTlpBalpNVXpRbllYNWxiR3A3OUoxTiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDg6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9jbGllbnQvbWFuYWdlbWVudC9icmFuY2hlcyI7czo1OiJyb3V0ZSI7czozMjoiY2xpZW50Lm1hbmFnZW1lbnQuYnJhbmNoZXMuaW5kZXgiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aToxO30=', 1779953485);

-- --------------------------------------------------------

--
-- Table structure for table `staff`
--

CREATE TABLE `staff` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `branch_id` bigint(20) UNSIGNED NOT NULL,
  `original_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `username` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('manager','cashier','inventory_staff') NOT NULL DEFAULT 'cashier',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `staff`
--

INSERT INTO `staff` (`id`, `tenant_id`, `branch_id`, `original_user_id`, `name`, `email`, `phone`, `username`, `password`, `role`, `is_active`, `last_login_at`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 1, 2, 'cashier', 'cashier@gmail.com', NULL, 'cashier@gmail.com', '$2y$12$ZEOBWD0I/XP.g5WFLoZ14OP9s1d96zvlmXjU1SLoKoPtk42DGHb4K', 'cashier', 1, NULL, '2026-04-14 08:44:29', '2026-05-27 17:19:51', NULL),
(2, 1, 3, NULL, '123', '123@gmail.com', NULL, '123@gmail.com', '$2y$12$h3Lck5GR7E1fJgQIhkqIFONym5IyqB8UnOm6/djLYdb2XCWGnPbau', 'cashier', 1, NULL, '2026-05-27 22:23:33', '2026-05-27 23:29:32', '2026-05-27 23:29:32'),
(3, 1, 11, NULL, '123', 'junecharlesmariquit553@gmail.com', NULL, 'junecharlesmariquit553@gmail.com', '$2y$12$kQNoUxa3K7EdZTjfJVlB..7WID6eeAtIoQfaTW.74eyJyAILa6S/O', 'cashier', 1, NULL, '2026-05-27 23:29:25', '2026-05-27 23:29:25', NULL);

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
(22, 1, 1, 3, NULL, 'sale', 3.00, 45.00, 135.00, 73.00, 70.00, NULL, NULL, 'POS sale: SALE-20260527-00004', '2026-05-27 05:39:27', 2, '2026-05-26 21:39:27', '2026-05-26 21:39:27');

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
(41, 1, 11, '132', 'Hardware', '123', '123@gmail.com', '123', '123', '123', '123', '123', '123', 'Philippines', NULL, NULL, '123', '123', 'PHP', 'Asia/Manila', '123', '123', 1, '2026-05-27 23:23:22', '2026-05-27 23:24:00'),
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
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_category_name_per_tenant` (`tenant_id`,`name`),
  ADD KEY `idx_categories_tenant_id` (`tenant_id`),
  ADD KEY `idx_categories_parent_id` (`parent_id`);

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
-- Indexes for table `staff`
--
ALTER TABLE `staff`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `staff_tenant_username_unique` (`tenant_id`,`username`),
  ADD UNIQUE KEY `staff_original_user_id_unique` (`original_user_id`),
  ADD UNIQUE KEY `staff_tenant_email_unique` (`tenant_id`,`email`),
  ADD KEY `staff_tenant_id_index` (`tenant_id`),
  ADD KEY `staff_branch_id_index` (`branch_id`),
  ADD KEY `staff_role_index` (`role`),
  ADD KEY `staff_is_active_index` (`is_active`);

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
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `product_stock_batches`
--
ALTER TABLE `product_stock_batches`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `sales`
--
ALTER TABLE `sales`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `sale_items`
--
ALTER TABLE `sale_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `staff`
--
ALTER TABLE `staff`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `stock_movements`
--
ALTER TABLE `stock_movements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `store_profiles`
--
ALTER TABLE `store_profiles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- Constraints for dumped tables
--

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
