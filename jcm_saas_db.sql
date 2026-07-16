-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 16, 2026 at 10:51 AM
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
-- Database: `jcm_saas_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `account_role_sidebar_items`
--

CREATE TABLE `account_role_sidebar_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `account_owner_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `product_user_type_id` bigint(20) UNSIGNED NOT NULL,
  `sidebar_item_id` bigint(20) UNSIGNED NOT NULL,
  `is_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `assigned_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `account_role_sidebar_items`
--

INSERT INTO `account_role_sidebar_items` (`id`, `account_owner_id`, `product_id`, `product_user_type_id`, `sidebar_item_id`, `is_enabled`, `assigned_by`, `created_at`, `updated_at`) VALUES
(14, 1, 11, 5, 1, 1, 1, '2026-07-14 06:10:40', '2026-07-14 06:10:40'),
(15, 1, 11, 5, 3, 1, 1, '2026-07-14 06:10:40', '2026-07-14 06:10:40'),
(16, 1, 11, 5, 6, 1, 1, '2026-07-14 06:10:40', '2026-07-14 06:10:40'),
(17, 1, 11, 5, 17, 1, 1, '2026-07-14 06:10:40', '2026-07-14 06:10:40'),
(18, 1, 11, 5, 18, 1, 1, '2026-07-14 06:10:40', '2026-07-14 06:10:40'),
(43, 1, 11, 1, 1, 1, 1, '2026-07-16 05:49:25', '2026-07-16 05:49:25'),
(44, 1, 11, 1, 3, 1, 1, '2026-07-16 05:49:25', '2026-07-16 05:49:25'),
(45, 1, 11, 1, 4, 1, 1, '2026-07-16 05:49:25', '2026-07-16 05:49:25'),
(46, 1, 11, 1, 5, 1, 1, '2026-07-16 05:49:25', '2026-07-16 05:49:25'),
(47, 1, 11, 1, 6, 1, 1, '2026-07-16 05:49:25', '2026-07-16 05:49:25'),
(48, 1, 11, 1, 7, 1, 1, '2026-07-16 05:49:25', '2026-07-16 05:49:25'),
(49, 1, 11, 1, 16, 1, 1, '2026-07-16 05:49:25', '2026-07-16 05:49:25'),
(50, 1, 11, 1, 17, 1, 1, '2026-07-16 05:49:25', '2026-07-16 05:49:25'),
(51, 1, 11, 1, 18, 1, 1, '2026-07-16 05:49:25', '2026-07-16 05:49:25'),
(52, 1, 11, 1, 19, 1, 1, '2026-07-16 05:49:25', '2026-07-16 05:49:25'),
(53, 1, 11, 1, 20, 1, 1, '2026-07-16 05:49:25', '2026-07-16 05:49:25'),
(54, 1, 11, 1, 21, 1, 1, '2026-07-16 05:49:25', '2026-07-16 05:49:25');

-- --------------------------------------------------------

--
-- Table structure for table `app_features`
--

CREATE TABLE `app_features` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `feature_code` varchar(100) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `is_developer_ready` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `app_features`
--

INSERT INTO `app_features` (`id`, `product_id`, `feature_code`, `name`, `description`, `is_developer_ready`, `sort_order`, `status`, `created_at`, `updated_at`) VALUES
(1, 11, 'dashboard', 'Dashboard', 'Main Inventory dashboard.', 1, 10, 'active', '2026-07-13 02:00:57', '2026-07-13 02:11:28'),
(2, 11, 'inventory_overview', 'Stock Overview', 'Inventory health, valuation, warehouse distribution, movement, and replenishment overview.', 1, 20, 'active', '2026-07-13 02:00:57', '2026-07-16 08:44:47'),
(3, 11, 'categories', 'Categories', 'Inventory category management.', 1, 30, 'active', '2026-07-13 02:00:57', '2026-07-13 02:11:28'),
(4, 11, 'products', 'Products', 'Inventory product management.', 1, 40, 'active', '2026-07-13 02:00:57', '2026-07-13 02:11:28'),
(5, 11, 'stock_management', 'Stock Management', 'Current stock management.', 1, 50, 'active', '2026-07-13 02:00:57', '2026-07-13 02:11:28'),
(6, 11, 'stock_adjustment', 'Stock Adjustment', 'Increase, decrease or correct stock.', 1, 60, 'active', '2026-07-13 02:00:57', '2026-07-13 02:11:28'),
(7, 11, 'stock_transfer', 'Stock Transfer', 'Transfer stock between warehouses.', 1, 90, 'active', '2026-07-13 02:00:57', '2026-07-13 02:11:28'),
(8, 11, 'stock_movements', 'Stock Movements', 'View stock movement history.', 1, 100, 'active', '2026-07-13 02:00:57', '2026-07-13 06:28:46'),
(9, 11, 'branch_management', 'Branch Management', 'Manage business branches.', 1, 70, 'active', '2026-07-13 02:00:57', '2026-07-13 02:11:28'),
(10, 11, 'warehouse_management', 'Warehouse Management', 'Manage warehouse locations.', 1, 80, 'active', '2026-07-13 02:00:57', '2026-07-13 02:11:28'),
(11, 11, 'supplier_management', 'Supplier Management', 'Manage supplier records.', 1, 110, 'active', '2026-07-13 02:00:57', '2026-07-14 01:41:09'),
(12, 11, 'purchase_orders', 'Purchase Orders', 'Create and track purchase orders.', 1, 120, 'active', '2026-07-13 02:00:57', '2026-07-14 01:41:09'),
(13, 11, 'receiving', 'Receiving', 'Receive ordered inventory.', 1, 130, 'active', '2026-07-13 02:00:57', '2026-07-14 01:41:09'),
(14, 11, 'team_overview', 'Team Overview', 'View team account summaries, role distribution, and team activity.', 1, 140, 'active', '2026-07-13 02:00:57', '2026-07-14 03:32:48'),
(15, 11, 'staff_management', 'Team Members', 'Create and manage manager and staff accounts.', 1, 150, 'active', '2026-07-13 02:00:57', '2026-07-14 02:43:32'),
(16, 11, 'roles_access', 'Roles & Access', 'Manage module access for inventory team roles.', 1, 160, 'active', '2026-07-13 02:00:57', '2026-07-14 02:43:32');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('laravel-cache-696d286ffe0da48445dcbf8fb537c827', 'i:1;', 1779162289),
('laravel-cache-696d286ffe0da48445dcbf8fb537c827:timer', 'i:1779162289;', 1779162289);

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
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `plan_id` bigint(20) UNSIGNED DEFAULT NULL,
  `quantity` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `status` varchar(30) NOT NULL DEFAULT 'active',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `carts`
--

INSERT INTO `carts` (`id`, `user_id`, `product_id`, `plan_id`, `quantity`, `status`, `notes`, `created_at`, `updated_at`) VALUES
(8, 2, 6, 5, 1, 'active', NULL, '2026-05-03 22:58:24', '2026-05-03 22:58:24'),
(9, 1, 7, NULL, 1, 'active', NULL, '2026-05-07 22:43:14', '2026-05-07 22:43:14');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `sender_id` bigint(20) UNSIGNED NOT NULL,
  `receiver_id` bigint(20) UNSIGNED NOT NULL,
  `message` text NOT NULL,
  `sender_type` enum('user','admin') NOT NULL DEFAULT 'user',
  `is_read` tinyint(1) NOT NULL DEFAULT 1,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `user_id`, `sender_id`, `receiver_id`, `message`, `sender_type`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES
(8, 1, 1, 1, 'ss', 'user', 1, NULL, '2026-05-07 22:42:57', '2026-05-07 22:42:57');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2025_08_14_170933_add_two_factor_columns_to_users_table', 1);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(100) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 1,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES
(1, 1, '1Welcome to JCM Web Solution', 'Your account is ready. You can now send inquiries and receive project updates.', 'system', 0, '2026-04-26 18:36:33', '2026-04-26 04:24:39', '2026-04-26 18:36:33');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_code` varchar(100) NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED DEFAULT NULL,
  `service_id` bigint(20) UNSIGNED DEFAULT NULL,
  `plan_id` bigint(20) UNSIGNED DEFAULT NULL,
  `billing_type` enum('trial','monthly','quarterly','yearly','custom') NOT NULL DEFAULT 'monthly',
  `subscription_id` bigint(20) UNSIGNED DEFAULT NULL,
  `order_type` enum('new_subscription','renewal','upgrade','downgrade','custom_service') NOT NULL DEFAULT 'new_subscription',
  `amount` decimal(10,2) NOT NULL,
  `currency` char(3) NOT NULL DEFAULT 'PHP',
  `duration_days` int(11) DEFAULT NULL,
  `status` enum('pending','payment_submitted','paid','verified','failed','cancelled') NOT NULL DEFAULT 'pending',
  `ordered_at` timestamp NULL DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_methods`
--

CREATE TABLE `payment_methods` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `account_name` varchar(150) DEFAULT NULL,
  `account_number` varchar(100) DEFAULT NULL,
  `account_owner` varchar(150) DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `background_image_path` varchar(255) DEFAULT NULL,
  `instructions` text DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment_methods`
--

INSERT INTO `payment_methods` (`id`, `name`, `slug`, `account_name`, `account_number`, `account_owner`, `image_path`, `background_image_path`, `instructions`, `status`, `sort_order`, `created_at`, `updated_at`) VALUES
(4, 'GCash', 'gcash', 'JU*E CH****S M.', '09814302368', NULL, '/storage/payment-methods/gcash_qr.png', '/storage/payment-method-backgrounds/gcash_bg.png', 'Scan the QR Code for payment or send the exact amount to the displayed acc number', 1, 10, '2026-04-29 17:48:43', '2026-07-13 01:47:56'),
(5, 'Maya', 'maya', NULL, NULL, NULL, NULL, NULL, 'Send the exact amount and upload proof.', 1, 20, '2026-07-13 01:47:56', '2026-07-13 01:47:56'),
(6, 'Bank Transfer', 'bank-transfer', NULL, NULL, NULL, NULL, NULL, 'Transfer the exact amount and upload proof.', 1, 30, '2026-07-13 01:47:56', '2026-07-13 01:47:56'),
(7, 'Cash', 'cash', NULL, NULL, NULL, NULL, NULL, 'Payment manually received by administrator.', 1, 40, '2026-07-13 01:47:56', '2026-07-13 01:47:56'),
(8, 'Other', 'other', NULL, NULL, NULL, NULL, NULL, 'Other approved payment method.', 1, 50, '2026-07-13 01:47:56', '2026-07-13 01:47:56');

-- --------------------------------------------------------

--
-- Table structure for table `plans`
--

CREATE TABLE `plans` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `plan_code` varchar(100) NOT NULL,
  `plan_name` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `billing_interval` enum('monthly','quarterly','yearly','custom') NOT NULL DEFAULT 'monthly',
  `currency` char(3) NOT NULL DEFAULT 'PHP',
  `duration_days` int(11) NOT NULL,
  `trial_days` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `description` text DEFAULT NULL,
  `has_role_based_access` tinyint(1) NOT NULL DEFAULT 0,
  `has_multi_branch` tinyint(1) NOT NULL DEFAULT 0,
  `has_activity_logs` tinyint(1) NOT NULL DEFAULT 0,
  `activity_log_retention_days` int(11) DEFAULT NULL,
  `max_branches` int(11) DEFAULT NULL,
  `max_warehouses` int(11) DEFAULT NULL,
  `max_staff` int(11) DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `status` enum('active','inactive','archived') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `plans`
--

INSERT INTO `plans` (`id`, `product_id`, `plan_code`, `plan_name`, `price`, `billing_interval`, `currency`, `duration_days`, `trial_days`, `description`, `has_role_based_access`, `has_multi_branch`, `has_activity_logs`, `activity_log_retention_days`, `max_branches`, `max_warehouses`, `max_staff`, `sort_order`, `status`, `created_at`, `updated_at`) VALUES
(9, 10, 'basic', 'Basic POS', 499.00, 'monthly', 'PHP', 30, 0, 'Single owner POS with inventory and sales management.', 0, 0, 0, NULL, 1, NULL, 1, 10, 'active', '2026-06-09 07:03:22', '2026-07-13 01:47:56'),
(10, 10, 'business', 'Business POS', 1299.00, 'monthly', 'PHP', 30, 0, 'POS with cashier, staff, and manager role-based access.', 1, 0, 0, NULL, 1, NULL, 10, 20, 'active', '2026-06-09 07:03:22', '2026-07-13 01:47:56'),
(11, 10, 'enterprise', 'Enterprise POS', 1999.00, 'monthly', 'PHP', 30, 0, 'Multi branch POS with employee activity logs and audit trail.', 1, 1, 1, 365, NULL, NULL, NULL, 30, 'active', '2026-06-09 07:03:22', '2026-07-13 01:47:56'),
(12, 11, 'solo', 'Solo Inventory', 0.00, 'monthly', 'PHP', 30, 0, 'For one owner managing one branch and one warehouse.', 0, 0, 0, NULL, 1, 1, 0, 10, 'active', '2026-07-13 01:47:56', '2026-07-13 01:47:56'),
(13, 11, 'team', 'Team Inventory', 0.00, 'monthly', 'PHP', 30, 0, 'For owners with staff, multiple branches and warehouses.', 1, 1, 0, NULL, NULL, NULL, NULL, 20, 'active', '2026-07-13 01:47:56', '2026-07-13 01:47:56');

-- --------------------------------------------------------

--
-- Table structure for table `plan_features`
--

CREATE TABLE `plan_features` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `plan_id` bigint(20) UNSIGNED NOT NULL,
  `feature_id` bigint(20) UNSIGNED NOT NULL,
  `is_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `limit_value` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `plan_features`
--

INSERT INTO `plan_features` (`id`, `plan_id`, `feature_id`, `is_enabled`, `limit_value`, `created_at`, `updated_at`) VALUES
(1, 12, 3, 1, NULL, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(2, 12, 1, 1, NULL, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(3, 12, 2, 1, NULL, '2026-07-13 02:00:58', '2026-07-16 08:44:47'),
(4, 12, 4, 1, NULL, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(5, 12, 6, 1, NULL, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(6, 12, 5, 1, NULL, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(7, 12, 8, 1, NULL, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(8, 13, 1, 1, NULL, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(9, 13, 2, 1, NULL, '2026-07-13 02:00:58', '2026-07-16 08:44:47'),
(10, 13, 3, 1, NULL, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(11, 13, 4, 1, NULL, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(12, 13, 5, 1, NULL, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(13, 13, 6, 1, NULL, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(14, 13, 7, 1, NULL, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(15, 13, 8, 1, NULL, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(16, 13, 9, 1, NULL, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(17, 13, 10, 1, NULL, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(18, 13, 11, 1, NULL, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(19, 13, 12, 1, NULL, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(20, 13, 13, 1, NULL, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(21, 13, 14, 1, NULL, '2026-07-13 02:00:58', '2026-07-14 03:32:48'),
(22, 13, 15, 1, NULL, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(23, 13, 16, 1, NULL, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(39, 12, 12, 1, NULL, '2026-07-13 02:11:28', '2026-07-13 02:11:28'),
(40, 12, 13, 1, NULL, '2026-07-13 02:11:28', '2026-07-13 02:11:28'),
(41, 12, 11, 1, NULL, '2026-07-13 02:11:28', '2026-07-13 02:11:28');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_code` varchar(100) NOT NULL,
  `slug` varchar(150) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `thumbnail` varchar(255) DEFAULT NULL,
  `app_url` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `pricing_type` enum('plan','custom') DEFAULT 'plan',
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `status` enum('development','active','maintenance','paused','inactive') NOT NULL DEFAULT 'development',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `product_code`, `slug`, `name`, `description`, `thumbnail`, `app_url`, `price`, `pricing_type`, `sort_order`, `status`, `created_at`, `updated_at`) VALUES
(10, 'JCM-POS-001', 'jcm-pos', 'JCM POS', 'Cloud-based Point of Sale and Inventory Management System for retail businesses.', NULL, NULL, 0.00, 'plan', 20, 'paused', '2026-06-09 07:02:14', '2026-07-13 01:47:56'),
(11, 'JCM-INVENTORY-001', 'jcm-inventory', 'JCM Inventory', 'Cloud-based inventory management system for solo owners and teams.', NULL, NULL, 0.00, 'plan', 10, 'development', '2026-07-13 01:47:56', '2026-07-13 02:11:28');

-- --------------------------------------------------------

--
-- Table structure for table `product_features`
--

CREATE TABLE `product_features` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `feature_title` varchar(255) NOT NULL,
  `feature_description` text DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `image_path` varchar(255) NOT NULL,
  `alt_text` varchar(255) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_overview`
--

CREATE TABLE `product_overview` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_user_types`
--

CREATE TABLE `product_user_types` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `user_type_id` bigint(20) UNSIGNED NOT NULL,
  `display_name` varchar(100) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_user_types`
--

INSERT INTO `product_user_types` (`id`, `product_id`, `user_type_id`, `display_name`, `status`, `created_at`, `updated_at`) VALUES
(1, 11, 2, 'Manager', 'active', '2026-07-13 02:00:57', '2026-07-13 02:11:28'),
(2, 10, 2, 'Manager', 'active', '2026-07-13 02:00:57', '2026-07-13 02:00:57'),
(3, 11, 1, 'Client / Owner', 'active', '2026-07-13 02:00:57', '2026-07-13 02:11:28'),
(4, 10, 1, 'Client / Owner', 'active', '2026-07-13 02:00:57', '2026-07-13 02:00:57'),
(5, 11, 3, 'Staff', 'active', '2026-07-13 02:00:57', '2026-07-13 02:11:28'),
(6, 10, 3, 'Staff', 'active', '2026-07-13 02:00:57', '2026-07-13 02:00:57');

-- --------------------------------------------------------

--
-- Table structure for table `product_user_type_sidebar_items`
--

CREATE TABLE `product_user_type_sidebar_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_user_type_id` bigint(20) UNSIGNED NOT NULL,
  `sidebar_item_id` bigint(20) UNSIGNED NOT NULL,
  `is_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_user_type_sidebar_items`
--

INSERT INTO `product_user_type_sidebar_items` (`id`, `product_user_type_id`, `sidebar_item_id`, `is_enabled`, `created_at`, `updated_at`) VALUES
(2, 3, 16, 1, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(3, 3, 1, 1, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(4, 3, 3, 1, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(5, 3, 2, 1, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(6, 3, 17, 1, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(7, 3, 20, 1, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(8, 3, 21, 1, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(9, 3, 23, 1, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(10, 3, 22, 1, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(11, 3, 18, 1, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(12, 3, 6, 1, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(13, 3, 19, 1, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(14, 3, 7, 1, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(15, 3, 9, 1, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(16, 3, 8, 1, '2026-07-13 02:00:58', '2026-07-14 03:32:48'),
(17, 3, 5, 1, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(32, 1, 4, 1, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(33, 1, 16, 1, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(34, 1, 1, 1, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(35, 1, 3, 1, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(36, 1, 2, 1, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(37, 1, 17, 1, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(38, 1, 20, 1, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(39, 1, 21, 1, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(40, 1, 18, 1, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(41, 1, 6, 1, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(42, 1, 19, 1, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(43, 1, 7, 1, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(44, 1, 5, 1, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(47, 5, 1, 1, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(48, 5, 3, 1, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(49, 5, 17, 1, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(50, 5, 18, 1, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(51, 5, 6, 1, '2026-07-13 02:00:58', '2026-07-13 02:11:28'),
(57, 3, 4, 1, '2026-07-13 02:00:58', '2026-07-13 02:11:28');

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(100) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `thumbnail` varchar(255) DEFAULT NULL,
  `service_type` enum('custom','maintenance','support','consulting','implementation','other') NOT NULL DEFAULT 'custom',
  `pricing_type` enum('fixed','quote') NOT NULL DEFAULT 'quote',
  `base_price` decimal(12,2) DEFAULT NULL,
  `currency` char(3) NOT NULL DEFAULT 'PHP',
  `status` enum('active','inactive','archived') NOT NULL DEFAULT 'active',
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`id`, `code`, `name`, `description`, `thumbnail`, `service_type`, `pricing_type`, `base_price`, `currency`, `status`, `sort_order`, `created_at`, `updated_at`) VALUES
(6, 'qewf3', 'test', 'terwq', 'services/wcf3ML4zRaNZ79YGB4YWqm2JdhyxDqhieFxt7hhx.png', 'custom', 'fixed', NULL, 'PHP', 'active', 10000, '2026-05-07 22:35:05', '2026-05-07 22:35:05');

-- --------------------------------------------------------

--
-- Table structure for table `service_features`
--

CREATE TABLE `service_features` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `service_id` bigint(20) UNSIGNED NOT NULL,
  `feature_title` varchar(255) NOT NULL,
  `feature_description` text DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `service_features`
--

INSERT INTO `service_features` (`id`, `service_id`, `feature_title`, `feature_description`, `icon`, `sort_order`, `created_at`, `updated_at`) VALUES
(3, 6, 'f1', NULL, NULL, 0, '2026-05-07 22:35:05', '2026-05-07 22:35:05');

-- --------------------------------------------------------

--
-- Table structure for table `service_images`
--

CREATE TABLE `service_images` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `service_id` bigint(20) UNSIGNED NOT NULL,
  `image_path` varchar(255) NOT NULL,
  `alt_text` varchar(255) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `service_images`
--

INSERT INTO `service_images` (`id`, `service_id`, `image_path`, `alt_text`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 6, 'services/wcf3ML4zRaNZ79YGB4YWqm2JdhyxDqhieFxt7hhx.png', 'test image 1', 0, '2026-05-07 22:35:05', '2026-05-07 22:35:05'),
(2, 6, 'services/9uTcBfpX9YtR70MADDJ9JXcWMWVlfipcwyoarWFK.png', 'test image 2', 1, '2026-05-07 22:35:05', '2026-05-07 22:35:05'),
(3, 6, 'services/UUd4SW1v99bQwJxjKBTUmjtKxHyzXV5vFbWTGRsR.png', 'test image 3', 2, '2026-05-07 22:35:05', '2026-05-07 22:35:05');

-- --------------------------------------------------------

--
-- Table structure for table `service_overview`
--

CREATE TABLE `service_overview` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `service_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `service_overview`
--

INSERT INTO `service_overview` (`id`, `service_id`, `title`, `content`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 6, 'f1', 'f1', 0, '2026-05-07 22:35:05', '2026-05-07 22:35:05');

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
('rLAqrldWqiVidTmVr8QtBqZ4MbHO2LVVFLhf7zvk', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiWFE3bXFXOFhDaVRDdVVoYUV5NlVubmlXbVJzU01hSklJemp4QlVKWSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1779175480);

-- --------------------------------------------------------

--
-- Table structure for table `sidebar_badges`
--

CREATE TABLE `sidebar_badges` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `badge_code` varchar(30) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `icon_key` varchar(100) DEFAULT NULL,
  `style_key` varchar(50) NOT NULL DEFAULT 'default',
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sidebar_badges`
--

INSERT INTO `sidebar_badges` (`id`, `badge_code`, `name`, `description`, `icon_key`, `style_key`, `sort_order`, `status`, `created_at`, `updated_at`) VALUES
(1, 'LIVE', 'Live', 'Feature is complete, stable and available for production use.', 'Sparkles', 'live', 10, 'active', '2026-07-13 02:20:23', '2026-07-13 02:20:23'),
(2, 'CORE', 'Core', 'Core feature required by the product.', 'Boxes', 'core', 20, 'active', '2026-07-13 02:20:23', '2026-07-13 02:20:23'),
(3, 'DEV', 'Development', 'Feature is currently under development.', 'Code2', 'development', 30, 'active', '2026-07-13 02:20:23', '2026-07-13 02:20:23'),
(4, 'TUNE', 'Tuning', 'Feature is functional but still being optimized or refined.', 'Settings', 'tuning', 40, 'active', '2026-07-13 02:20:23', '2026-07-13 02:20:23'),
(5, 'TEST', 'Testing', 'Feature is ready for internal testing.', 'FlaskConical', 'testing', 50, 'active', '2026-07-13 02:20:23', '2026-07-13 02:20:23'),
(6, 'NEW', 'New', 'Feature was recently added or released.', 'Sparkles', 'new', 60, 'active', '2026-07-13 02:20:23', '2026-07-13 02:20:23'),
(7, 'BETA', 'Beta', 'Feature is available in beta and may still change.', 'Beaker', 'beta', 70, 'active', '2026-07-13 02:20:23', '2026-07-13 02:20:23'),
(8, 'SOON', 'Coming Soon', 'Feature or page is planned but not yet ready.', 'Clock3', 'soon', 80, 'active', '2026-07-13 02:20:23', '2026-07-13 02:20:23');

-- --------------------------------------------------------

--
-- Table structure for table `sidebar_items`
--

CREATE TABLE `sidebar_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `parent_id` bigint(20) UNSIGNED DEFAULT NULL,
  `feature_id` bigint(20) UNSIGNED DEFAULT NULL,
  `item_key` varchar(100) NOT NULL,
  `section_key` varchar(100) NOT NULL DEFAULT 'management',
  `item_type` enum('link','group','heading') NOT NULL DEFAULT 'link',
  `label` varchar(150) NOT NULL,
  `route_name` varchar(200) DEFAULT NULL,
  `url_override` varchar(255) DEFAULT NULL,
  `icon_key` varchar(100) DEFAULT NULL,
  `badge` varchar(30) DEFAULT NULL,
  `badge_id` bigint(20) UNSIGNED DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_developer_ready` tinyint(1) NOT NULL DEFAULT 0,
  `is_visible` tinyint(1) NOT NULL DEFAULT 1,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sidebar_items`
--

INSERT INTO `sidebar_items` (`id`, `product_id`, `parent_id`, `feature_id`, `item_key`, `section_key`, `item_type`, `label`, `route_name`, `url_override`, `icon_key`, `badge`, `badge_id`, `sort_order`, `is_developer_ready`, `is_visible`, `status`, `created_at`, `updated_at`) VALUES
(1, 11, NULL, 1, 'dashboard', 'overview', 'link', 'Main Dashboard', 'dashboard', '/dashboard', 'LayoutDashboard', 'DEV', 3, 10, 1, 1, 'active', '2026-07-13 02:00:58', '2026-07-13 04:50:39'),
(2, 11, NULL, 2, 'inventory-overview', 'overview', 'link', 'Stock Overview', 'inventory.overview', '/inventory/overview', 'BarChart3', 'DEV', 3, 20, 1, 1, 'active', '2026-07-13 02:00:58', '2026-07-16 08:44:47'),
(3, 11, NULL, NULL, 'inventory-group', 'management', 'group', 'Inventory', NULL, NULL, 'Boxes', 'DEV', 3, 10, 1, 1, 'active', '2026-07-13 02:00:58', '2026-07-13 02:20:23'),
(4, 11, NULL, 9, 'branches', 'management', 'link', 'Branches', 'branches.index', '/branches', 'Building2', 'DEV', 3, 20, 1, 1, 'active', '2026-07-13 02:00:58', '2026-07-13 02:20:23'),
(5, 11, NULL, 10, 'warehouses', 'management', 'link', 'Warehouse', 'warehouses.index', '/warehouses', 'Warehouse', 'DEV', 3, 30, 1, 1, 'active', '2026-07-13 02:00:58', '2026-07-13 02:20:23'),
(6, 11, NULL, 8, 'stock-movements', 'management', 'link', 'Stock Movements', 'stock-movements.index', '/stock-movements', 'History', 'DEV', 3, 40, 1, 1, 'active', '2026-07-13 02:00:58', '2026-07-13 06:28:46'),
(7, 11, NULL, NULL, 'suppliers-group', 'management', 'group', 'Suppliers', NULL, NULL, 'Truck', 'DEV', 3, 50, 1, 1, 'active', '2026-07-13 02:00:58', '2026-07-14 01:41:09'),
(8, 11, NULL, 14, 'team-overview', 'overview', 'link', 'Team Overview', 'team.overview', '/team/overview', 'Users', 'DEV', 3, 30, 1, 1, 'active', '2026-07-13 02:00:58', '2026-07-14 03:32:48'),
(9, 11, NULL, NULL, 'team-group', 'management', 'group', 'Team Management', NULL, NULL, 'Users', 'DEV', 3, 60, 1, 1, 'active', '2026-07-13 02:00:58', '2026-07-14 02:43:32'),
(16, 11, 3, 3, 'categories', 'management', 'link', 'Categories', 'inventory.categories.index', '/inventory/categories', 'Tags', 'DEV', 3, 10, 1, 1, 'active', '2026-07-13 02:00:58', '2026-07-13 02:20:23'),
(17, 11, 3, 4, 'products', 'management', 'link', 'Products', 'inventory.products.index', '/inventory/products', 'Package2', 'DEV', 3, 20, 1, 1, 'active', '2026-07-13 02:00:58', '2026-07-13 02:20:23'),
(18, 11, 3, 5, 'stock-management', 'management', 'link', 'Stock Management', 'inventory.stocks.index', '/inventory/stocks', 'Boxes', 'DEV', 3, 30, 1, 1, 'active', '2026-07-13 02:00:58', '2026-07-13 02:20:23'),
(19, 11, 7, 11, 'suppliers', 'management', 'link', 'Supplier List', 'suppliers.index', '/suppliers', 'Truck', 'DEV', 3, 10, 1, 1, 'active', '2026-07-13 02:00:58', '2026-07-14 01:41:09'),
(20, 11, 7, 12, 'purchase-orders', 'management', 'link', 'Purchase Orders', 'suppliers.purchase-orders.index', '/suppliers/purchase-orders', 'ClipboardCheck', 'DEV', 3, 20, 1, 1, 'active', '2026-07-13 02:00:58', '2026-07-14 01:41:09'),
(21, 11, 7, 13, 'receiving', 'management', 'link', 'Receiving', 'suppliers.receiving.index', '/suppliers/receiving', 'PackageCheck', 'DEV', 3, 30, 1, 1, 'active', '2026-07-13 02:00:58', '2026-07-14 01:41:09'),
(22, 11, 9, 15, 'staff-accounts', 'management', 'link', 'Team Members', 'team.members.index', '/team/members', 'Users', 'DEV', 3, 10, 1, 1, 'active', '2026-07-13 02:00:58', '2026-07-14 02:43:32'),
(23, 11, 9, 16, 'roles-access', 'management', 'link', 'Roles & Access', 'team.roles.index', '/team/roles', 'UserCog', 'DEV', 3, 20, 1, 1, 'active', '2026-07-13 02:00:58', '2026-07-14 02:43:32');

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `plan_id` bigint(20) UNSIGNED NOT NULL,
  `subscription_code` varchar(100) NOT NULL,
  `subscription_type` enum('trial','monthly','quarterly','yearly','custom') NOT NULL DEFAULT 'trial',
  `status` enum('pending','trial','active','past_due','expired','cancelled','suspended','locked') NOT NULL DEFAULT 'pending',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `duration_days` int(11) NOT NULL DEFAULT 0,
  `amount` decimal(10,2) DEFAULT NULL,
  `currency` char(3) NOT NULL DEFAULT 'PHP',
  `auto_renew` tinyint(1) NOT NULL DEFAULT 0,
  `activated_at` timestamp NULL DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `ended_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subscriptions`
--

INSERT INTO `subscriptions` (`id`, `user_id`, `product_id`, `plan_id`, `subscription_code`, `subscription_type`, `status`, `start_date`, `end_date`, `duration_days`, `amount`, `currency`, `auto_renew`, `activated_at`, `cancelled_at`, `ended_at`, `notes`, `created_at`, `updated_at`) VALUES
(18, 1, 10, 9, 'SUB-1780991250', 'monthly', 'expired', '2026-06-09', '2026-07-09', 30, 499.00, 'PHP', 0, '2026-06-09 00:00:00', NULL, '2026-07-09 23:59:59', 'Basic POS subscription for testing', '2026-06-09 07:47:30', '2026-07-13 01:47:56'),
(19, 1, 11, 13, 'SUB-INV-DEV-1-1783910021', 'monthly', 'active', '2026-07-13', '2027-07-13', 365, 0.00, 'PHP', 0, '2026-07-13 02:33:41', NULL, NULL, 'Development access for JCM Inventory.', '2026-07-13 02:33:41', '2026-07-13 02:33:41');

-- --------------------------------------------------------

--
-- Table structure for table `subscription_cycles`
--

CREATE TABLE `subscription_cycles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `subscription_id` bigint(20) UNSIGNED NOT NULL,
  `plan_id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED DEFAULT NULL,
  `transaction_id` bigint(20) UNSIGNED DEFAULT NULL,
  `cycle_number` int(10) UNSIGNED NOT NULL,
  `billing_type` enum('trial','monthly','quarterly','yearly','custom') NOT NULL DEFAULT 'monthly',
  `status` enum('pending','active','completed','expired','cancelled','unpaid') NOT NULL DEFAULT 'pending',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `currency` char(3) NOT NULL DEFAULT 'PHP',
  `activated_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subscription_cycles`
--

INSERT INTO `subscription_cycles` (`id`, `subscription_id`, `plan_id`, `order_id`, `transaction_id`, `cycle_number`, `billing_type`, `status`, `start_date`, `end_date`, `amount`, `currency`, `activated_at`, `completed_at`, `created_at`, `updated_at`) VALUES
(1, 18, 9, NULL, NULL, 1, 'monthly', 'expired', '2026-06-09', '2026-07-09', 499.00, 'PHP', '2026-06-09 00:00:00', '2026-07-09 23:59:59', '2026-06-09 07:47:30', '2026-07-13 01:47:56'),
(2, 19, 13, NULL, NULL, 1, 'monthly', 'active', '2026-07-13', '2027-07-13', 0.00, 'PHP', '2026-07-13 02:33:41', NULL, '2026-07-13 02:33:41', '2026-07-13 02:33:41');

-- --------------------------------------------------------

--
-- Table structure for table `subscription_events`
--

CREATE TABLE `subscription_events` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `subscription_id` bigint(20) UNSIGNED NOT NULL,
  `actor_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `event_type` enum('created','trial_started','activated','renewed','upgraded','downgraded','payment_failed','past_due','suspended','resumed','expired','cancelled') NOT NULL,
  `old_plan_id` bigint(20) UNSIGNED DEFAULT NULL,
  `new_plan_id` bigint(20) UNSIGNED DEFAULT NULL,
  `old_status` varchar(50) DEFAULT NULL,
  `new_status` varchar(50) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `metadata` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subscription_events`
--

INSERT INTO `subscription_events` (`id`, `subscription_id`, `actor_user_id`, `event_type`, `old_plan_id`, `new_plan_id`, `old_status`, `new_status`, `notes`, `metadata`, `created_at`) VALUES
(1, 18, 1, 'created', NULL, 9, NULL, 'active', 'Migrated from the original JCM SaaS subscription.', NULL, '2026-06-09 07:47:30'),
(2, 18, NULL, 'expired', 9, 9, 'active', 'expired', 'Automatically expired because its end date passed.', NULL, '2026-07-09 23:59:59'),
(3, 19, 1, 'activated', NULL, 13, 'pending', 'active', 'JCM Inventory development access activated.', NULL, '2026-07-13 02:33:41');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `transaction_code` varchar(100) NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `payment_method_id` bigint(20) UNSIGNED NOT NULL,
  `reference_number` varchar(150) DEFAULT NULL,
  `account_name` varchar(255) DEFAULT NULL,
  `account_number` varchar(100) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_proof` varchar(255) DEFAULT NULL,
  `status` enum('pending','submitted','verified','rejected','failed','refunded') NOT NULL DEFAULT 'pending',
  `submitted_at` timestamp NULL DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `refunded_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `verified_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `two_factor_secret` text DEFAULT NULL,
  `two_factor_recovery_codes` text DEFAULT NULL,
  `two_factor_confirmed_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'client',
  `client_id` bigint(20) UNSIGNED DEFAULT NULL,
  `branch_id` bigint(20) UNSIGNED DEFAULT NULL,
  `system_used` enum('pos') DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `two_factor_secret`, `two_factor_recovery_codes`, `two_factor_confirmed_at`, `remember_token`, `created_at`, `updated_at`, `role`, `client_id`, `branch_id`, `system_used`, `created_by`, `is_active`) VALUES
(1, 'June Charles Mariquit', 'junecharlesmariquit553@gmail.com', NULL, '$2y$12$knLKVXIAam08KApxVgv6eOA7nnoZykl8Ef2r4H3kmdOBOI40.2FOi', NULL, NULL, NULL, 'vpUzaGffa1xNA86wt1MoIctJb3oG7RRTu0dx8GRe8mCzsdYZWFgqsO2481aY', '2026-04-13 21:58:39', '2026-04-13 21:58:39', 'client', NULL, NULL, 'pos', NULL, 1),
(7, 'admin', 'admin@gmail.com', NULL, '$2y$12$knLKVXIAam08KApxVgv6eOA7nnoZykl8Ef2r4H3kmdOBOI40.2FOi', NULL, NULL, NULL, 'AKzQuJt0QVa7Gfsmsdgbl7sZzNkzjrD04AxBAX7SjbmjrBx0ZVXnNHNNyqCn', '2026-04-13 21:58:39', '2026-04-13 21:58:39', 'admin', NULL, NULL, NULL, NULL, 1),
(12, 'cashier', 'cashier@pos.com', NULL, '$2y$12$m/UNFXRTz3F57XWwWS4Wku1MqmOCQUPC1FxK11n7UpTFPUJKOI8NO', NULL, NULL, NULL, NULL, '2026-05-29 18:52:57', '2026-05-29 18:52:57', 'cashier', 1, 1, 'pos', 1, 1),
(13, 'Store Manager 1', 'manager1@pos.com', '2026-06-05 01:41:18', '$2y$12$m/UNFXRTz3F57XWwWS4Wku1MqmOCQUPC1FxK11n7UpTFPUJKOI8NO', NULL, NULL, NULL, NULL, '2026-06-05 01:41:18', '2026-06-05 01:41:18', 'manager', 1, 1, 'pos', 1, 1),
(14, 'Store Manager 2', 'manager2@pos.com', '2026-06-05 01:41:18', '$2y$12$m/UNFXRTz3F57XWwWS4Wku1MqmOCQUPC1FxK11n7UpTFPUJKOI8NO', NULL, NULL, NULL, NULL, '2026-06-05 01:41:18', '2026-06-05 01:41:18', 'manager', 1, 1, 'pos', 1, 1),
(15, 'Store Staff 1', 'staff1@pos.com', '2026-06-05 01:41:18', '$2y$12$m/UNFXRTz3F57XWwWS4Wku1MqmOCQUPC1FxK11n7UpTFPUJKOI8NO', NULL, NULL, NULL, NULL, '2026-06-05 01:41:18', '2026-06-05 01:41:18', 'staff', 1, 1, 'pos', 1, 1),
(16, 'Store Staff 2', 'staff2@pos.com', '2026-06-05 01:41:18', '$2y$12$m/UNFXRTz3F57XWwWS4Wku1MqmOCQUPC1FxK11n7UpTFPUJKOI8NO', NULL, NULL, NULL, NULL, '2026-06-05 01:41:18', '2026-06-08 19:38:03', 'staff', 1, 1, 'pos', 1, 1),
(17, 'Cashier 2', 'cashier2@pos.com', '2026-06-05 01:43:20', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, NULL, NULL, NULL, '2026-06-05 01:43:20', '2026-06-05 01:43:20', 'cashier', 1, 1, 'pos', 1, 1),
(18, 'cashier1', 'cashier1@pos.com', NULL, '$2y$12$m/UNFXRTz3F57XWwWS4Wku1MqmOCQUPC1FxK11n7UpTFPUJKOI8NO', NULL, NULL, NULL, NULL, '2026-05-29 18:52:57', '2026-05-29 18:52:57', 'cashier', 1, 1, 'pos', 1, 1),
(19, 'staff', 'staff@inventory.com', NULL, '$2y$12$NdDKLmZaROoi/5YdtQeVYOE77wbMgLXLjAhHixLGlPC9VSUn0wfkK', NULL, NULL, NULL, NULL, '2026-07-14 03:59:29', '2026-07-14 03:59:29', 'staff', 1, 1, NULL, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `user_product_access`
--

CREATE TABLE `user_product_access` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `product_user_type_id` bigint(20) UNSIGNED NOT NULL,
  `account_owner_id` bigint(20) UNSIGNED NOT NULL,
  `subscription_id` bigint(20) UNSIGNED DEFAULT NULL,
  `status` enum('pending','active','inactive','removed') NOT NULL DEFAULT 'pending',
  `assigned_by` bigint(20) UNSIGNED DEFAULT NULL,
  `joined_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_product_access`
--

INSERT INTO `user_product_access` (`id`, `user_id`, `product_id`, `product_user_type_id`, `account_owner_id`, `subscription_id`, `status`, `assigned_by`, `joined_at`, `created_at`, `updated_at`) VALUES
(1, 1, 10, 4, 1, 18, 'inactive', 1, NULL, '2026-07-13 02:00:57', '2026-07-13 02:00:57'),
(2, 1, 11, 3, 1, 19, 'active', 1, '2026-07-13 02:33:41', '2026-07-13 02:33:41', '2026-07-13 02:33:41'),
(3, 19, 11, 5, 1, 19, 'active', 1, '2026-07-14 03:59:29', '2026-07-14 03:59:29', '2026-07-14 03:59:29');

-- --------------------------------------------------------

--
-- Table structure for table `user_types`
--

CREATE TABLE `user_types` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `type_code` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `is_owner_type` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_types`
--

INSERT INTO `user_types` (`id`, `type_code`, `name`, `description`, `is_owner_type`, `sort_order`, `status`, `created_at`, `updated_at`) VALUES
(1, 'owner', 'Client / Owner', 'Owner of a subscribed JCM SaaS account.', 1, 10, 'active', '2026-07-13 02:00:57', '2026-07-13 02:11:28'),
(2, 'manager', 'Manager', 'Manages operations assigned by the owner.', 0, 20, 'active', '2026-07-13 02:00:57', '2026-07-13 02:11:28'),
(3, 'staff', 'Staff', 'Performs assigned inventory tasks.', 0, 30, 'active', '2026-07-13 02:00:57', '2026-07-13 02:11:28');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `account_role_sidebar_items`
--
ALTER TABLE `account_role_sidebar_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `account_role_sidebar_unique` (`account_owner_id`,`product_id`,`product_user_type_id`,`sidebar_item_id`),
  ADD KEY `account_role_sidebar_lookup_index` (`account_owner_id`,`product_id`,`product_user_type_id`,`is_enabled`),
  ADD KEY `account_role_sidebar_item_index` (`sidebar_item_id`),
  ADD KEY `account_role_sidebar_assigned_by_index` (`assigned_by`),
  ADD KEY `account_role_sidebar_product_foreign` (`product_id`),
  ADD KEY `account_role_sidebar_role_foreign` (`product_user_type_id`);

--
-- Indexes for table `app_features`
--
ALTER TABLE `app_features`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `app_features_product_code_unique` (`product_id`,`feature_code`),
  ADD KEY `app_features_product_status_sort_index` (`product_id`,`status`,`sort_order`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `carts_user_product_plan_unique` (`user_id`,`product_id`,`plan_id`),
  ADD KEY `carts_user_id_index` (`user_id`),
  ADD KEY `carts_product_id_index` (`product_id`),
  ADD KEY `carts_plan_id_index` (`plan_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `messages_receiver_id_foreign` (`receiver_id`),
  ADD KEY `messages_user_read_index` (`user_id`,`is_read`),
  ADD KEY `messages_sender_receiver_index` (`sender_id`,`receiver_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_user_read_index` (`user_id`,`is_read`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_code` (`order_code`),
  ADD KEY `fk_orders_product` (`product_id`),
  ADD KEY `idx_orders_user_id` (`user_id`),
  ADD KEY `idx_orders_plan_id` (`plan_id`),
  ADD KEY `idx_orders_status` (`status`),
  ADD KEY `idx_orders_subscription_id` (`subscription_id`),
  ADD KEY `orders_service_id_index` (`service_id`),
  ADD KEY `orders_plan_product_index` (`plan_id`,`product_id`),
  ADD KEY `orders_user_status_index` (`user_id`,`status`),
  ADD KEY `orders_subscription_type_index` (`subscription_id`,`order_type`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `payment_methods`
--
ALTER TABLE `payment_methods`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `plans`
--
ALTER TABLE `plans`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `plans_product_code_unique` (`product_id`,`plan_code`),
  ADD UNIQUE KEY `plans_id_product_unique` (`id`,`product_id`),
  ADD UNIQUE KEY `plans_product_plan_code_unique` (`product_id`,`plan_code`),
  ADD KEY `fk_plans_product` (`product_id`),
  ADD KEY `plans_product_status_sort_index` (`product_id`,`status`,`sort_order`);

--
-- Indexes for table `plan_features`
--
ALTER TABLE `plan_features`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `plan_features_unique` (`plan_id`,`feature_id`),
  ADD KEY `plan_features_feature_index` (`feature_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `product_code` (`product_code`),
  ADD UNIQUE KEY `products_slug_unique` (`slug`),
  ADD KEY `products_status_sort_index` (`status`,`sort_order`);

--
-- Indexes for table `product_features`
--
ALTER TABLE `product_features`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_product_features_product` (`product_id`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_product_images_product` (`product_id`);

--
-- Indexes for table `product_overview`
--
ALTER TABLE `product_overview`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_product_overview_product` (`product_id`);

--
-- Indexes for table `product_user_types`
--
ALTER TABLE `product_user_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `product_user_types_unique` (`product_id`,`user_type_id`),
  ADD KEY `product_user_types_user_type_index` (`user_type_id`);

--
-- Indexes for table `product_user_type_sidebar_items`
--
ALTER TABLE `product_user_type_sidebar_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `product_user_type_sidebar_unique` (`product_user_type_id`,`sidebar_item_id`),
  ADD KEY `product_user_type_sidebar_item_index` (`sidebar_item_id`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `service_features`
--
ALTER TABLE `service_features`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_service_features_service` (`service_id`);

--
-- Indexes for table `service_images`
--
ALTER TABLE `service_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_service_images_service` (`service_id`);

--
-- Indexes for table `service_overview`
--
ALTER TABLE `service_overview`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_service_overview_service` (`service_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `sidebar_badges`
--
ALTER TABLE `sidebar_badges`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sidebar_badges_code_unique` (`badge_code`),
  ADD KEY `sidebar_badges_status_sort_index` (`status`,`sort_order`);

--
-- Indexes for table `sidebar_items`
--
ALTER TABLE `sidebar_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sidebar_items_product_key_unique` (`product_id`,`item_key`),
  ADD KEY `sidebar_items_parent_index` (`parent_id`),
  ADD KEY `sidebar_items_feature_index` (`feature_id`),
  ADD KEY `sidebar_items_render_index` (`product_id`,`section_key`,`status`,`is_visible`,`sort_order`),
  ADD KEY `sidebar_items_badge_id_index` (`badge_id`);

--
-- Indexes for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `subscription_code` (`subscription_code`),
  ADD KEY `fk_subscriptions_user` (`user_id`),
  ADD KEY `fk_subscriptions_product` (`product_id`),
  ADD KEY `idx_subscriptions_plan_id` (`plan_id`),
  ADD KEY `subscriptions_plan_product_index` (`plan_id`,`product_id`),
  ADD KEY `subscriptions_user_product_status_index` (`user_id`,`product_id`,`status`),
  ADD KEY `subscriptions_status_end_date_index` (`status`,`end_date`);

--
-- Indexes for table `subscription_cycles`
--
ALTER TABLE `subscription_cycles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `subscription_cycles_number_unique` (`subscription_id`,`cycle_number`),
  ADD KEY `subscription_cycles_plan_index` (`plan_id`),
  ADD KEY `subscription_cycles_order_index` (`order_id`),
  ADD KEY `subscription_cycles_transaction_index` (`transaction_id`);

--
-- Indexes for table `subscription_events`
--
ALTER TABLE `subscription_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subscription_events_subscription_date_index` (`subscription_id`,`created_at`),
  ADD KEY `subscription_events_actor_foreign` (`actor_user_id`),
  ADD KEY `subscription_events_old_plan_foreign` (`old_plan_id`),
  ADD KEY `subscription_events_new_plan_foreign` (`new_plan_id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transaction_code` (`transaction_code`),
  ADD KEY `idx_transactions_order_id` (`order_id`),
  ADD KEY `idx_transactions_user_id` (`user_id`),
  ADD KEY `idx_transactions_status` (`status`),
  ADD KEY `transactions_payment_method_index` (`payment_method_id`),
  ADD KEY `transactions_order_status_index` (`order_id`,`status`),
  ADD KEY `transactions_verified_by_index` (`verified_by`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD KEY `users_role_client_id_index` (`role`,`client_id`),
  ADD KEY `users_created_by_foreign` (`created_by`),
  ADD KEY `users_branch_id_index` (`branch_id`),
  ADD KEY `users_system_used_index` (`system_used`),
  ADD KEY `users_client_branch_system_index` (`client_id`,`branch_id`,`system_used`);

--
-- Indexes for table `user_product_access`
--
ALTER TABLE `user_product_access`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_product_access_context_unique` (`user_id`,`product_id`,`account_owner_id`),
  ADD KEY `user_product_access_product_role_index` (`product_id`,`product_user_type_id`,`status`),
  ADD KEY `user_product_access_owner_index` (`account_owner_id`,`product_id`,`status`),
  ADD KEY `user_product_access_subscription_index` (`subscription_id`),
  ADD KEY `user_product_access_product_user_type_foreign` (`product_user_type_id`),
  ADD KEY `user_product_access_assigned_by_foreign` (`assigned_by`);

--
-- Indexes for table `user_types`
--
ALTER TABLE `user_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_types_code_unique` (`type_code`),
  ADD KEY `user_types_status_sort_index` (`status`,`sort_order`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `account_role_sidebar_items`
--
ALTER TABLE `account_role_sidebar_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT for table `app_features`
--
ALTER TABLE `app_features`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `carts`
--
ALTER TABLE `carts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `payment_methods`
--
ALTER TABLE `payment_methods`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `plans`
--
ALTER TABLE `plans`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `plan_features`
--
ALTER TABLE `plan_features`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `product_features`
--
ALTER TABLE `product_features`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `product_overview`
--
ALTER TABLE `product_overview`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `product_user_types`
--
ALTER TABLE `product_user_types`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `product_user_type_sidebar_items`
--
ALTER TABLE `product_user_type_sidebar_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `service_features`
--
ALTER TABLE `service_features`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `service_images`
--
ALTER TABLE `service_images`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `service_overview`
--
ALTER TABLE `service_overview`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `sidebar_badges`
--
ALTER TABLE `sidebar_badges`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `sidebar_items`
--
ALTER TABLE `sidebar_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `subscription_cycles`
--
ALTER TABLE `subscription_cycles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `subscription_events`
--
ALTER TABLE `subscription_events`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `user_product_access`
--
ALTER TABLE `user_product_access`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `user_types`
--
ALTER TABLE `user_types`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `account_role_sidebar_items`
--
ALTER TABLE `account_role_sidebar_items`
  ADD CONSTRAINT `account_role_sidebar_assigned_by_foreign` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `account_role_sidebar_item_foreign` FOREIGN KEY (`sidebar_item_id`) REFERENCES `sidebar_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `account_role_sidebar_owner_foreign` FOREIGN KEY (`account_owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `account_role_sidebar_product_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `account_role_sidebar_role_foreign` FOREIGN KEY (`product_user_type_id`) REFERENCES `product_user_types` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `app_features`
--
ALTER TABLE `app_features`
  ADD CONSTRAINT `app_features_product_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_receiver_id_foreign` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_sender_id_foreign` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_plan_product` FOREIGN KEY (`plan_id`,`product_id`) REFERENCES `plans` (`id`, `product_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_orders_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_orders_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_orders_subscription` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `plans`
--
ALTER TABLE `plans`
  ADD CONSTRAINT `fk_plans_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `plan_features`
--
ALTER TABLE `plan_features`
  ADD CONSTRAINT `plan_features_feature_foreign` FOREIGN KEY (`feature_id`) REFERENCES `app_features` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `plan_features_plan_foreign` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `product_features`
--
ALTER TABLE `product_features`
  ADD CONSTRAINT `fk_product_features_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_overview`
--
ALTER TABLE `product_overview`
  ADD CONSTRAINT `fk_product_overview_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_user_types`
--
ALTER TABLE `product_user_types`
  ADD CONSTRAINT `product_user_types_product_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `product_user_types_user_type_foreign` FOREIGN KEY (`user_type_id`) REFERENCES `user_types` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `product_user_type_sidebar_items`
--
ALTER TABLE `product_user_type_sidebar_items`
  ADD CONSTRAINT `product_user_type_sidebar_item_foreign` FOREIGN KEY (`sidebar_item_id`) REFERENCES `sidebar_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `product_user_type_sidebar_role_foreign` FOREIGN KEY (`product_user_type_id`) REFERENCES `product_user_types` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `service_features`
--
ALTER TABLE `service_features`
  ADD CONSTRAINT `fk_service_features_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `service_images`
--
ALTER TABLE `service_images`
  ADD CONSTRAINT `fk_service_images_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `service_overview`
--
ALTER TABLE `service_overview`
  ADD CONSTRAINT `fk_service_overview_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sidebar_items`
--
ALTER TABLE `sidebar_items`
  ADD CONSTRAINT `sidebar_items_badge_foreign` FOREIGN KEY (`badge_id`) REFERENCES `sidebar_badges` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `sidebar_items_feature_foreign` FOREIGN KEY (`feature_id`) REFERENCES `app_features` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `sidebar_items_parent_foreign` FOREIGN KEY (`parent_id`) REFERENCES `sidebar_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `sidebar_items_product_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD CONSTRAINT `fk_subscriptions_plan_product` FOREIGN KEY (`plan_id`,`product_id`) REFERENCES `plans` (`id`, `product_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_subscriptions_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_subscriptions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `subscription_cycles`
--
ALTER TABLE `subscription_cycles`
  ADD CONSTRAINT `subscription_cycles_order_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `subscription_cycles_plan_foreign` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `subscription_cycles_subscription_foreign` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `subscription_cycles_transaction_foreign` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `subscription_events`
--
ALTER TABLE `subscription_events`
  ADD CONSTRAINT `subscription_events_actor_foreign` FOREIGN KEY (`actor_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `subscription_events_new_plan_foreign` FOREIGN KEY (`new_plan_id`) REFERENCES `plans` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `subscription_events_old_plan_foreign` FOREIGN KEY (`old_plan_id`) REFERENCES `plans` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `subscription_events_subscription_foreign` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `fk_transactions_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_transactions_payment_method` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_transactions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_transactions_verified_by` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `users_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `user_product_access`
--
ALTER TABLE `user_product_access`
  ADD CONSTRAINT `user_product_access_assigned_by_foreign` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `user_product_access_owner_foreign` FOREIGN KEY (`account_owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_product_access_product_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_product_access_product_user_type_foreign` FOREIGN KEY (`product_user_type_id`) REFERENCES `product_user_types` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `user_product_access_subscription_foreign` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `user_product_access_user_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
