-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 22, 2026 at 10:58 AM
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

INSERT INTO `payments` (`id`, `tenant_id`, `sale_id`, `method`, `amount`, `reference_no`, `remarks`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'cash', 1000.00, NULL, NULL, '2026-05-21 19:20:37', '2026-05-21 19:20:37'),
(2, 1, 2, 'cash', 50.00, NULL, NULL, '2026-05-21 19:26:34', '2026-05-21 19:26:34'),
(3, 1, 3, 'cash', 1000.00, NULL, NULL, '2026-05-21 19:52:06', '2026-05-21 19:52:06');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
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

INSERT INTO `products` (`id`, `tenant_id`, `category_id`, `name`, `slug`, `sku`, `barcode`, `description`, `image_path`, `unit`, `cost_price`, `selling_price`, `wholesale_price`, `compare_at_price`, `quantity`, `reorder_level`, `max_stock_level`, `is_taxable`, `tax_rate`, `allow_discount`, `discount_type`, `discount_value`, `product_type`, `stock_tracking`, `low_stock_alert`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 1, 'Safe Guard', 'safe-guard', '123', '123123', NULL, NULL, 'pcs', 25.00, 30.00, NULL, NULL, 0.00, 0.00, NULL, 0, 0.00, 1, NULL, 0.00, 'standard', 'tracked', 1, 'active', '2026-05-20 19:05:30', '2026-05-21 19:52:06', NULL),
(2, 1, 1, 'Dove', 'dove', NULL, NULL, NULL, NULL, 'pcs', 15.00, 25.00, NULL, NULL, 0.00, 0.00, NULL, 0, 0.00, 1, NULL, 0.00, 'standard', 'tracked', 1, 'active', '2026-05-20 23:42:27', '2026-05-21 19:52:06', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `product_stock_batches`
--

CREATE TABLE `product_stock_batches` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
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

INSERT INTO `product_stock_batches` (`id`, `tenant_id`, `product_id`, `batch_no`, `quantity_received`, `quantity_remaining`, `unit_cost`, `selling_price`, `received_date`, `expiry_date`, `remarks`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'BATCH-20260521030530-1', 10.00, 10.00, 0.00, 30.00, '2026-05-21', NULL, 'Initial stock', '2026-05-20 19:05:30', '2026-05-20 19:05:30'),
(2, 1, 2, 'BATCH-20260521074227-2', 10.00, 10.00, 15.00, 25.00, '2026-05-21', NULL, 'Initial stock', '2026-05-20 23:42:27', '2026-05-20 23:42:27');

-- --------------------------------------------------------

--
-- Table structure for table `sales`
--

CREATE TABLE `sales` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
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

INSERT INTO `sales` (`id`, `tenant_id`, `sale_no`, `cashier_user_id`, `subtotal`, `discount_total`, `tax_total`, `grand_total`, `amount_paid`, `change_amount`, `payment_status`, `status`, `remarks`, `sold_at`, `created_at`, `updated_at`) VALUES
(1, 1, 'SALE-20260522-00001', 1, 175.00, 0.00, 0.00, 175.00, 1000.00, 825.00, 'paid', 'completed', NULL, '2026-05-21 19:20:37', '2026-05-21 19:20:37', '2026-05-21 19:20:37'),
(2, 1, 'SALE-20260522-00002', 1, 30.00, 0.00, 0.00, 30.00, 50.00, 20.00, 'paid', 'completed', NULL, '2026-05-21 19:26:34', '2026-05-21 19:26:34', '2026-05-21 19:26:34'),
(3, 1, 'SALE-20260522-00003', 1, 345.00, 0.00, 0.00, 345.00, 1000.00, 655.00, 'paid', 'completed', NULL, '2026-05-21 19:52:06', '2026-05-21 19:52:06', '2026-05-21 19:52:06');

-- --------------------------------------------------------

--
-- Table structure for table `sale_items`
--

CREATE TABLE `sale_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
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

INSERT INTO `sale_items` (`id`, `tenant_id`, `sale_id`, `product_id`, `product_name`, `sku`, `quantity`, `unit_price`, `unit_cost`, `discount_amount`, `line_total`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 'Safe Guard', '123', 5.00, 30.00, 25.00, 0.00, 150.00, '2026-05-21 19:20:37', '2026-05-21 19:20:37'),
(2, 1, 1, 2, 'Dove', NULL, 1.00, 25.00, 15.00, 0.00, 25.00, '2026-05-21 19:20:37', '2026-05-21 19:20:37'),
(3, 1, 2, 1, 'Safe Guard', '123', 1.00, 30.00, 25.00, 0.00, 30.00, '2026-05-21 19:26:34', '2026-05-21 19:26:34'),
(4, 1, 3, 1, 'Safe Guard', '123', 4.00, 30.00, 25.00, 0.00, 120.00, '2026-05-21 19:52:06', '2026-05-21 19:52:06'),
(5, 1, 3, 2, 'Dove', NULL, 9.00, 25.00, 15.00, 0.00, 225.00, '2026-05-21 19:52:06', '2026-05-21 19:52:06');

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
('8pIbRya1Q33evFELAW8Q8gy4XO2qUTdKIXqdIyBi', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiT0RsWmpwaVp4M2l4WWdRcHpzeEpqa013OVJvVEd6eTd0eVNxemRaSSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NTU6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9wb3MvdGVybWluYWw/Y2F0ZWdvcnlfaWQ9JnNlYXJjaD0iO3M6NToicm91dGUiO3M6MTg6InBvcy50ZXJtaW5hbC5pbmRleCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtpOjE7fQ==', 1779422267),
('bM3CnjOtPOp493Jh7V1T1Yek5n2UnZ0e5hOQocc8', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiSU1YRHZDZUlEMDZCcEhDMlNIWlZEeWdzWWJtS0Y0V3ZFRVhEeVNIYyI7czozOiJ1cmwiO2E6MTp7czo4OiJpbnRlbmRlZCI7czo1NToiaHR0cDovLzEyNy4wLjAuMTo4MDAwL3Bvcy90ZXJtaW5hbD9jYXRlZ29yeV9pZD0mc2VhcmNoPSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1779439647),
('kHj9hmJm6aQaHUGdG22Vtlrd2awCcM4WV7QjaQIv', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoibnJkbmljQVc0cHJnMjVIc3Mybm5aSXd4WGxPM0U1VUQyR1VOenBUSyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7czo0OiJob21lIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1779420675),
('YF1aFP7xa1JlqThURiTXRzTfUboygeTKqsXtUJz5', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoidE5OZkVIenRnUEJSV3gzUHVLc21xaGNmWkg0bjBCZ1Z4Z1UwTXlVciI7czozOiJ1cmwiO2E6MTp7czo4OiJpbnRlbmRlZCI7czo1NToiaHR0cDovLzEyNy4wLjAuMTo4MDAwL3Bvcy90ZXJtaW5hbD9jYXRlZ29yeV9pZD0mc2VhcmNoPSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1779439646);

-- --------------------------------------------------------

--
-- Table structure for table `stock_movements`
--

CREATE TABLE `stock_movements` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
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

INSERT INTO `stock_movements` (`id`, `tenant_id`, `product_id`, `product_stock_batch_id`, `movement_type`, `quantity`, `unit_cost`, `total_cost`, `quantity_before`, `quantity_after`, `reference_type`, `reference_id`, `remarks`, `movement_date`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 'initial_stock', 10.00, 0.00, 0.00, 0.00, 10.00, NULL, NULL, 'Initial stock on product creation', '2026-05-21 03:05:30', 1, '2026-05-20 19:05:30', '2026-05-20 19:05:30'),
(2, 1, 2, 2, 'initial_stock', 10.00, 15.00, 150.00, 0.00, 10.00, NULL, NULL, 'Initial stock on product creation', '2026-05-21 07:42:27', 1, '2026-05-20 23:42:27', '2026-05-20 23:42:27'),
(3, 1, 1, NULL, 'sale', 5.00, 25.00, 125.00, 10.00, 5.00, NULL, NULL, 'Sold via POS. Sale No: SALE-20260522-00001', '2026-05-22 03:20:37', 1, '2026-05-21 19:20:37', '2026-05-21 19:20:37'),
(4, 1, 2, NULL, 'sale', 1.00, 15.00, 15.00, 10.00, 9.00, NULL, NULL, 'Sold via POS. Sale No: SALE-20260522-00001', '2026-05-22 03:20:37', 1, '2026-05-21 19:20:37', '2026-05-21 19:20:37'),
(5, 1, 1, NULL, 'sale', 1.00, 25.00, 25.00, 5.00, 4.00, NULL, NULL, 'Sold via POS. Sale No: SALE-20260522-00002', '2026-05-22 03:26:34', 1, '2026-05-21 19:26:34', '2026-05-21 19:26:34'),
(6, 1, 1, NULL, 'sale', 4.00, 25.00, 100.00, 4.00, 0.00, NULL, NULL, 'POS sale: SALE-20260522-00003', '2026-05-22 03:52:06', 1, '2026-05-21 19:52:06', '2026-05-21 19:52:06'),
(7, 1, 2, NULL, 'sale', 9.00, 15.00, 135.00, 9.00, 0.00, NULL, NULL, 'POS sale: SALE-20260522-00003', '2026-05-22 03:52:06', 1, '2026-05-21 19:52:06', '2026-05-21 19:52:06');

--
-- Indexes for dumped tables
--

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
  ADD KEY `payments_sale_id_foreign` (`sale_id`);

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
  ADD KEY `idx_products_barcode` (`barcode`);

--
-- Indexes for table `product_stock_batches`
--
ALTER TABLE `product_stock_batches`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_stock_batches_tenant_id` (`tenant_id`),
  ADD KEY `idx_stock_batches_product_id` (`product_id`),
  ADD KEY `idx_stock_batches_received_date` (`received_date`),
  ADD KEY `idx_stock_batches_expiry_date` (`expiry_date`);

--
-- Indexes for table `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sales_sale_no_unique` (`sale_no`),
  ADD KEY `sales_tenant_id_index` (`tenant_id`),
  ADD KEY `sales_cashier_user_id_index` (`cashier_user_id`),
  ADD KEY `sales_sold_at_index` (`sold_at`),
  ADD KEY `sales_status_index` (`status`);

--
-- Indexes for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sale_items_tenant_sale_index` (`tenant_id`,`sale_id`),
  ADD KEY `sale_items_product_id_index` (`product_id`),
  ADD KEY `sale_items_sale_id_foreign` (`sale_id`);

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
  ADD KEY `idx_stock_movements_date` (`movement_date`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `product_stock_batches`
--
ALTER TABLE `product_stock_batches`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `sales`
--
ALTER TABLE `sales`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `sale_items`
--
ALTER TABLE `sale_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `stock_movements`
--
ALTER TABLE `stock_movements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
