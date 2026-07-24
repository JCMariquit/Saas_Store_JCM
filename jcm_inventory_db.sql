-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 23, 2026 at 08:04 AM
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
(2, 1, NULL, 'Soap', 'soap', NULL, 0, 1, 1, '2026-07-16 01:14:18', '2026-07-16 01:14:18', NULL);

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
  `selling_price` decimal(14,2) NOT NULL DEFAULT 0.00,
  `wholesale_price` decimal(14,2) DEFAULT NULL,
  `stock_tracking` enum('tracked','not_tracked') NOT NULL DEFAULT 'tracked',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `tenant_id`, `category_id`, `name`, `slug`, `sku`, `barcode`, `description`, `image_path`, `unit`, `cost_price`, `selling_price`, `wholesale_price`, `stock_tracking`, `is_active`, `created_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 1, 'qw', 'qw', 'QW', 'qw', '0', NULL, 'pcs', 10.0000, 50.00, 40.00, 'tracked', 1, 1, '2026-07-10 06:13:07', '2026-07-10 06:13:07', NULL),
(2, 1, 2, 'Safeguard', 'safeguard', 'QW1', NULL, NULL, NULL, 'pcs', 25.0000, 52.00, NULL, 'tracked', 1, 1, '2026-07-16 01:14:47', '2026-07-16 01:14:47', NULL);

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
) ;

--
-- Dumping data for table `purchase_orders`
--

INSERT INTO `purchase_orders` (`id`, `tenant_id`, `supplier_id`, `branch_id`, `warehouse_id`, `po_number`, `order_date`, `expected_delivery_date`, `status`, `payment_terms`, `subtotal`, `discount_amount`, `tax_amount`, `shipping_amount`, `total_amount`, `notes`, `created_by`, `submitted_by`, `submitted_at`, `approved_by`, `approved_at`, `cancelled_by`, `cancelled_at`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 1, 3, 2, 'PO-20260720-RDS4QP', '2026-07-20', '5555-05-05', 'cancelled', 'qwerty', 25000.00, 2.00, 1.00, 20.00, 25019.00, NULL, 1, 1, '2026-07-20 04:33:18', NULL, NULL, 1, '2026-07-20 04:58:00', '2026-07-20 02:43:18', '2026-07-20 04:58:00', NULL),
(2, 1, 1, 3, 2, 'PO-20260720-ZLP2ZW', '2026-07-20', '2026-07-31', 'received', 'qwerty', 2500.00, 5.00, 2.00, 222.00, 2719.00, NULL, 1, 1, '2026-07-20 05:02:34', 1, '2026-07-20 05:19:16', NULL, NULL, '2026-07-20 04:54:27', '2026-07-20 05:48:37', NULL),
(3, 1, 1, 3, 2, 'PO-20260720-RTRG0E', '2026-07-20', '2026-07-22', 'draft', 'qwerty', 2000.00, 500.00, 200.00, 200.00, 1900.00, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-20 05:04:16', '2026-07-20 05:04:16', NULL),
(4, 1, 1, 3, 2, 'PO-20260721-IRZAO3', '2026-07-21', '2026-08-23', 'received', 'qwerty', 1250.00, 100.00, 50.00, 600.00, 1800.00, NULL, 1, 1, '2026-07-21 03:54:20', 1, '2026-07-21 03:54:26', NULL, NULL, '2026-07-21 03:54:16', '2026-07-21 03:54:45', NULL);

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
) ;

--
-- Dumping data for table `purchase_order_items`
--

INSERT INTO `purchase_order_items` (`id`, `tenant_id`, `purchase_order_id`, `product_id`, `product_name`, `product_sku`, `unit`, `quantity`, `received_quantity`, `unit_cost`, `line_total`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 2, 'Safeguard', 'QW1', 'pcs', 1000.000, 0.000, 25.0000, 25000.00, NULL, '2026-07-20 02:43:18', '2026-07-20 02:43:18'),
(2, 1, 2, 2, 'Safeguard', 'QW1', 'pcs', 100.000, 100.000, 25.0000, 2500.00, NULL, '2026-07-20 04:54:27', '2026-07-20 05:48:37'),
(3, 1, 3, 1, 'qw', 'QW', 'pcs', 200.000, 0.000, 10.0000, 2000.00, NULL, '2026-07-20 05:04:16', '2026-07-20 05:04:16'),
(4, 1, 4, 2, 'Safeguard', 'QW1', 'pcs', 50.000, 50.000, 25.0000, 1250.00, NULL, '2026-07-21 03:54:16', '2026-07-21 03:54:45');

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
) ;

--
-- Dumping data for table `purchase_receipts`
--

INSERT INTO `purchase_receipts` (`id`, `tenant_id`, `purchase_order_id`, `supplier_id`, `branch_id`, `warehouse_id`, `receipt_number`, `delivery_reference`, `received_date`, `status`, `total_quantity`, `total_amount`, `notes`, `received_by`, `posted_at`, `voided_by`, `voided_at`, `void_reason`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 1, 3, 2, 'RCV-20260720-6YEO6T', NULL, '2026-07-20', 'posted', 100.000, 2500.00, NULL, 1, '2026-07-20 05:48:37', NULL, NULL, NULL, '2026-07-20 05:48:37', '2026-07-20 05:48:37'),
(2, 1, 4, 1, 3, 2, 'RCV-20260721-QHE5FY', NULL, '2026-07-21', 'posted', 50.000, 1250.00, NULL, 1, '2026-07-21 03:54:45', NULL, NULL, NULL, '2026-07-21 03:54:45', '2026-07-21 03:54:45');

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
) ;

--
-- Dumping data for table `purchase_receipt_items`
--

INSERT INTO `purchase_receipt_items` (`id`, `tenant_id`, `purchase_receipt_id`, `purchase_order_item_id`, `product_id`, `stock_movement_id`, `void_stock_movement_id`, `product_name`, `product_sku`, `unit`, `quantity_received`, `unit_cost`, `line_total`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 2, 2, 3, NULL, 'Safeguard', 'QW1', 'pcs', 100.000, 25.0000, 2500.00, NULL, '2026-07-20 05:48:37', '2026-07-20 05:48:37'),
(2, 1, 2, 4, 2, 4, NULL, 'Safeguard', 'QW1', 'pcs', 50.000, 25.0000, 1250.00, NULL, '2026-07-21 03:54:45', '2026-07-21 03:54:45');

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
) ;

--
-- Dumping data for table `stock_issuances`
--

INSERT INTO `stock_issuances` (`id`, `tenant_id`, `branch_id`, `warehouse_id`, `issuance_number`, `issuance_date`, `reason`, `issued_to`, `department`, `purpose`, `reference_no`, `status`, `total_quantity`, `total_cost`, `notes`, `issued_by`, `posted_at`, `voided_by`, `voided_at`, `void_reason`, `created_at`, `updated_at`) VALUES
(1, 1, 3, 2, 'ISS-20260721-UOEW3U', '2026-07-21', 'used_consumed', NULL, NULL, NULL, NULL, 'posted', 1.000, 25.00, NULL, 1, '2026-07-21 08:46:29', NULL, NULL, NULL, '2026-07-21 08:46:29', '2026-07-21 08:46:29'),
(2, 1, 3, 2, 'ISS-20260721-JOSTEU', '2026-07-21', 'used_consumed', NULL, NULL, NULL, NULL, 'posted', 1.000, 25.00, NULL, 1, '2026-07-21 08:46:44', NULL, NULL, NULL, '2026-07-21 08:46:44', '2026-07-21 08:46:44'),
(3, 1, 3, 2, 'ISS-20260723-P8RPMR', '2026-07-23', 'used_consumed', NULL, NULL, NULL, NULL, 'posted', 3.000, 75.00, NULL, 1, '2026-07-23 01:19:10', NULL, NULL, NULL, '2026-07-23 01:19:10', '2026-07-23 01:19:10'),
(4, 1, 3, 2, 'ISS-20260723-C8KYGF', '2026-07-23', 'used_consumed', 'jc', 'jcjc', NULL, 'cjjjjc', 'posted', 2.000, 50.00, NULL, 1, '2026-07-23 01:19:39', NULL, NULL, NULL, '2026-07-23 01:19:39', '2026-07-23 01:19:39'),
(5, 1, 3, 2, 'ISS-20260723-GGYKMP', '2026-07-23', 'used_consumed', NULL, NULL, NULL, NULL, 'posted', 1.000, 50.00, NULL, 1, '2026-07-23 03:26:50', NULL, NULL, NULL, '2026-07-23 03:26:50', '2026-07-23 03:26:50');

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
) ;

--
-- Dumping data for table `stock_issuance_items`
--

INSERT INTO `stock_issuance_items` (`id`, `tenant_id`, `stock_issuance_id`, `product_id`, `stock_movement_id`, `void_stock_movement_id`, `product_name`, `product_sku`, `unit`, `quantity_issued`, `unit_cost`, `line_total`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 2, 5, NULL, 'Safeguard', 'QW1', 'pcs', 1.000, 25.0000, 25.00, NULL, '2026-07-21 08:46:29', '2026-07-21 08:46:29'),
(2, 1, 2, 2, 6, NULL, 'Safeguard', 'QW1', 'pcs', 1.000, 25.0000, 25.00, NULL, '2026-07-21 08:46:44', '2026-07-21 08:46:44'),
(3, 1, 3, 2, 7, NULL, 'Safeguard', 'QW1', 'pcs', 3.000, 25.0000, 75.00, NULL, '2026-07-23 01:19:10', '2026-07-23 01:19:10'),
(4, 1, 4, 2, 8, NULL, 'Safeguard', 'QW1', 'pcs', 2.000, 25.0000, 50.00, NULL, '2026-07-23 01:19:39', '2026-07-23 01:19:39'),
(5, 1, 5, 1, 10, NULL, 'qw', 'QW', 'pcs', 1.000, 50.0000, 50.00, NULL, '2026-07-23 03:26:50', '2026-07-23 03:26:50');

-- --------------------------------------------------------

--
-- Table structure for table `stock_movements`
--

CREATE TABLE `stock_movements` (
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
) ;

--
-- Dumping data for table `stock_movements`
--

INSERT INTO `stock_movements` (`id`, `tenant_id`, `warehouse_id`, `product_id`, `movement_type`, `quantity`, `quantity_before`, `quantity_after`, `unit_cost`, `total_cost`, `average_cost_before`, `average_cost_after`, `reference_type`, `reference_id`, `reference_no`, `related_warehouse_id`, `reversal_of_movement_id`, `remarks`, `movement_date`, `created_by`, `created_at`, `updated_at`) VALUES
(2, 1, 2, 2, 'opening_stock', 50.000, 0.000, 50.000, 25.0000, 1250.00, NULL, NULL, 'opening_stock', NULL, 'OPEN-20260716091506-KN1VI1', NULL, NULL, NULL, '2026-07-16 09:15:06', 1, '2026-07-16 01:15:06', '2026-07-16 01:15:06'),
(3, 1, 2, 2, 'purchase_receipt', 100.000, 50.000, 150.000, 25.0000, 2500.00, 25.0000, 25.0000, 'purchase_receipt', 1, 'RCV-20260720-6YEO6T', NULL, NULL, 'Received from PO PO-20260720-ZLP2ZW', '2026-07-20 13:48:37', 1, '2026-07-20 05:48:37', '2026-07-20 05:48:37'),
(4, 1, 2, 2, 'purchase_receipt', 50.000, 150.000, 200.000, 25.0000, 1250.00, 25.0000, 25.0000, 'purchase_receipt', 2, 'RCV-20260721-QHE5FY', NULL, NULL, 'Received from PO PO-20260721-IRZAO3', '2026-07-21 11:54:45', 1, '2026-07-21 03:54:45', '2026-07-21 03:54:45'),
(5, 1, 2, 2, 'stock_out', 1.000, 200.000, 199.000, 25.0000, 25.00, 25.0000, 25.0000, 'stock_issuance', 1, 'ISS-20260721-UOEW3U', NULL, NULL, 'Stock issuance ISS-20260721-UOEW3U | Reason: Used / Consumed', '2026-07-21 16:46:29', 1, '2026-07-21 08:46:29', '2026-07-21 08:46:29'),
(6, 1, 2, 2, 'stock_out', 1.000, 199.000, 198.000, 25.0000, 25.00, 25.0000, 25.0000, 'stock_issuance', 2, 'ISS-20260721-JOSTEU', NULL, NULL, 'Stock issuance ISS-20260721-JOSTEU | Reason: Used / Consumed', '2026-07-21 16:46:44', 1, '2026-07-21 08:46:44', '2026-07-21 08:46:44'),
(7, 1, 2, 2, 'stock_out', 3.000, 198.000, 195.000, 25.0000, 75.00, 25.0000, 25.0000, 'stock_issuance', 3, 'ISS-20260723-P8RPMR', NULL, NULL, 'Stock issuance ISS-20260723-P8RPMR | Reason: Used / Consumed', '2026-07-23 09:19:10', 1, '2026-07-23 01:19:10', '2026-07-23 01:19:10'),
(8, 1, 2, 2, 'stock_out', 2.000, 195.000, 193.000, 25.0000, 50.00, 25.0000, 25.0000, 'stock_issuance', 4, 'ISS-20260723-C8KYGF', NULL, NULL, 'Stock issuance ISS-20260723-C8KYGF | Reason: Used / Consumed | Issued to: jc | Department: jcjc | Reference: cjjjjc', '2026-07-23 09:19:39', 1, '2026-07-23 01:19:39', '2026-07-23 01:19:39'),
(9, 1, 2, 1, 'opening_stock', 50.000, 0.000, 50.000, 50.0000, 2500.00, NULL, NULL, 'opening_stock', NULL, 'OPEN-20260723105039-C7QTY3', NULL, NULL, NULL, '2026-07-23 10:50:39', 1, '2026-07-23 02:50:39', '2026-07-23 02:50:39'),
(10, 1, 2, 1, 'stock_out', 1.000, 50.000, 49.000, 50.0000, 50.00, 50.0000, 50.0000, 'stock_issuance', 5, 'ISS-20260723-GGYKMP', NULL, NULL, 'Stock issuance ISS-20260723-GGYKMP | Reason: Used / Consumed', '2026-07-23 11:26:50', 1, '2026-07-23 03:26:50', '2026-07-23 03:26:50');

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
) ;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `tenant_id`, `code`, `name`, `contact_person`, `email`, `phone`, `alternate_phone`, `address`, `tax_number`, `payment_terms`, `credit_limit`, `notes`, `is_active`, `created_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 'QT', 'w', 'wet', 'wt@gmail.com', 'ewt', 'qt', 'qwerty', 'qt', 'qwerty', 25.00, NULL, 1, 1, '2026-07-14 01:46:04', '2026-07-14 01:46:04', NULL);

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
) ;

--
-- Dumping data for table `warehouse_stocks`
--

INSERT INTO `warehouse_stocks` (`id`, `tenant_id`, `warehouse_id`, `product_id`, `quantity`, `reorder_level`, `max_stock_level`, `average_cost`, `last_movement_at`, `created_at`, `updated_at`) VALUES
(2, 1, 2, 2, 193.000, 5.000, NULL, 25.0000, '2026-07-23 09:19:39', '2026-07-16 01:15:06', '2026-07-23 01:19:39'),
(5, 1, 2, 1, 49.000, 5.000, NULL, 50.0000, '2026-07-23 11:26:50', '2026-07-23 02:50:39', '2026-07-23 03:26:50');

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
  ADD KEY `products_created_by_index` (`created_by`);

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
  ADD KEY `stock_movements_tenant_related_warehouse_index` (`tenant_id`,`related_warehouse_id`);

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `purchase_receipts`
--
ALTER TABLE `purchase_receipts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `purchase_receipt_items`
--
ALTER TABLE `purchase_receipt_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock_issuances`
--
ALTER TABLE `stock_issuances`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock_issuance_items`
--
ALTER TABLE `stock_issuance_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock_movements`
--
ALTER TABLE `stock_movements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `warehouses`
--
ALTER TABLE `warehouses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

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
-- Constraints for table `warehouses`
--
ALTER TABLE `warehouses`
  ADD CONSTRAINT `warehouses_branch_id_foreign` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `warehouses_tenant_branch_foreign` FOREIGN KEY (`tenant_id`,`branch_id`) REFERENCES `branches` (`tenant_id`, `id`) ON UPDATE CASCADE;

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
