-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 10, 2026 at 08:25 AM
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
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `branches`
--

INSERT INTO `branches` (`id`, `tenant_id`, `name`, `code`, `address`, `phone`, `email`, `is_main`, `is_active`, `created_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 'Main brach', 'MAIN', '123123', '09752475', 'branch@gmail.com', 1, 1, 1, '2026-07-10 03:20:38', '2026-07-10 03:20:38', NULL);

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
(1, 1, NULL, '1', '1', '1', 4, 1, 1, '2026-07-10 06:00:11', '2026-07-10 06:00:11', NULL);

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
  `cost_price` decimal(14,2) NOT NULL DEFAULT 0.00,
  `selling_price` decimal(14,2) NOT NULL DEFAULT 0.00,
  `wholesale_price` decimal(14,2) DEFAULT NULL,
  `stock_tracking` enum('tracked','not_tracked') NOT NULL DEFAULT 'tracked',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `tenant_id`, `category_id`, `name`, `slug`, `sku`, `barcode`, `description`, `image_path`, `unit`, `cost_price`, `selling_price`, `wholesale_price`, `stock_tracking`, `is_active`, `created_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 1, 'qw', 'qw', 'QW', 'qw', '0', NULL, 'pcs', 10.00, 50.00, 40.00, 'tracked', 1, 1, '2026-07-10 06:13:07', '2026-07-10 06:13:07', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `stock_movements`
--

CREATE TABLE `stock_movements` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `warehouse_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `movement_type` enum('opening_stock','stock_in','stock_out','adjustment_in','adjustment_out','transfer_in','transfer_out','sale','return_in','return_out','damage','expired') NOT NULL,
  `quantity` decimal(14,3) NOT NULL,
  `quantity_before` decimal(14,3) NOT NULL DEFAULT 0.000,
  `quantity_after` decimal(14,3) NOT NULL DEFAULT 0.000,
  `unit_cost` decimal(14,2) NOT NULL DEFAULT 0.00,
  `total_cost` decimal(14,2) NOT NULL DEFAULT 0.00,
  `reference_type` varchar(100) DEFAULT NULL,
  `reference_id` bigint(20) UNSIGNED DEFAULT NULL,
  `reference_no` varchar(120) DEFAULT NULL,
  `related_warehouse_id` bigint(20) UNSIGNED DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `movement_date` datetime NOT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `warehouses`
--

INSERT INTO `warehouses` (`id`, `tenant_id`, `branch_id`, `name`, `code`, `description`, `address`, `contact_person`, `phone`, `is_main`, `is_active`, `created_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 1, '1', '1', '1', '1', '1', '1', 1, 1, 1, '2026-07-10 05:59:54', '2026-07-10 05:59:54', NULL);

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
  `average_cost` decimal(14,2) NOT NULL DEFAULT 0.00,
  `last_movement_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  ADD KEY `branches_tenant_active_index` (`tenant_id`,`is_active`),
  ADD KEY `branches_created_by_index` (`created_by`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categories_tenant_slug_unique` (`tenant_id`,`slug`),
  ADD KEY `categories_tenant_id_index` (`tenant_id`),
  ADD KEY `categories_parent_id_index` (`parent_id`),
  ADD KEY `categories_tenant_active_index` (`tenant_id`,`is_active`),
  ADD KEY `categories_created_by_index` (`created_by`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `products_tenant_slug_unique` (`tenant_id`,`slug`),
  ADD UNIQUE KEY `products_tenant_sku_unique` (`tenant_id`,`sku`),
  ADD UNIQUE KEY `products_tenant_barcode_unique` (`tenant_id`,`barcode`),
  ADD KEY `products_tenant_id_index` (`tenant_id`),
  ADD KEY `products_category_id_index` (`category_id`),
  ADD KEY `products_tenant_category_index` (`tenant_id`,`category_id`),
  ADD KEY `products_tenant_active_index` (`tenant_id`,`is_active`),
  ADD KEY `products_created_by_index` (`created_by`);

--
-- Indexes for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `stock_movements_tenant_id_index` (`tenant_id`),
  ADD KEY `stock_movements_warehouse_id_index` (`warehouse_id`),
  ADD KEY `stock_movements_product_id_index` (`product_id`),
  ADD KEY `stock_movements_tenant_warehouse_index` (`tenant_id`,`warehouse_id`),
  ADD KEY `stock_movements_tenant_product_index` (`tenant_id`,`product_id`),
  ADD KEY `stock_movements_type_date_index` (`movement_type`,`movement_date`),
  ADD KEY `stock_movements_reference_index` (`reference_type`,`reference_id`),
  ADD KEY `stock_movements_created_by_index` (`created_by`),
  ADD KEY `stock_movements_related_warehouse_index` (`related_warehouse_id`);

--
-- Indexes for table `warehouses`
--
ALTER TABLE `warehouses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `warehouses_branch_code_unique` (`tenant_id`,`branch_id`,`code`),
  ADD KEY `warehouses_tenant_id_index` (`tenant_id`),
  ADD KEY `warehouses_branch_id_index` (`branch_id`),
  ADD KEY `warehouses_tenant_branch_index` (`tenant_id`,`branch_id`),
  ADD KEY `warehouses_tenant_active_index` (`tenant_id`,`is_active`),
  ADD KEY `warehouses_created_by_index` (`created_by`);

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
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `branches`
--
ALTER TABLE `branches`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `stock_movements`
--
ALTER TABLE `stock_movements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `warehouses`
--
ALTER TABLE `warehouses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `warehouse_stocks`
--
ALTER TABLE `warehouse_stocks`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD CONSTRAINT `stock_movements_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `stock_movements_related_warehouse_id_foreign` FOREIGN KEY (`related_warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `stock_movements_warehouse_id_foreign` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `warehouses`
--
ALTER TABLE `warehouses`
  ADD CONSTRAINT `warehouses_branch_id_foreign` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `warehouse_stocks`
--
ALTER TABLE `warehouse_stocks`
  ADD CONSTRAINT `warehouse_stocks_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `warehouse_stocks_warehouse_id_foreign` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
