-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: 127.0.0.1    Database: jcm_saas_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `jcm_saas_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `jcm_saas_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;

USE `jcm_saas_db`;

--
-- Table structure for table `account_role_sidebar_items`
--

DROP TABLE IF EXISTS `account_role_sidebar_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `account_role_sidebar_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `account_owner_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  `product_user_type_id` bigint(20) unsigned NOT NULL,
  `sidebar_item_id` bigint(20) unsigned NOT NULL,
  `is_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `assigned_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `account_role_sidebar_unique` (`account_owner_id`,`product_id`,`product_user_type_id`,`sidebar_item_id`),
  KEY `account_role_sidebar_lookup_index` (`account_owner_id`,`product_id`,`product_user_type_id`,`is_enabled`),
  KEY `account_role_sidebar_item_index` (`sidebar_item_id`),
  KEY `account_role_sidebar_assigned_by_index` (`assigned_by`),
  KEY `account_role_sidebar_product_foreign` (`product_id`),
  KEY `account_role_sidebar_role_foreign` (`product_user_type_id`),
  CONSTRAINT `account_role_sidebar_assigned_by_foreign` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `account_role_sidebar_item_foreign` FOREIGN KEY (`sidebar_item_id`) REFERENCES `sidebar_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `account_role_sidebar_owner_foreign` FOREIGN KEY (`account_owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `account_role_sidebar_product_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `account_role_sidebar_role_foreign` FOREIGN KEY (`product_user_type_id`) REFERENCES `product_user_types` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_role_sidebar_items`
--

LOCK TABLES `account_role_sidebar_items` WRITE;
/*!40000 ALTER TABLE `account_role_sidebar_items` DISABLE KEYS */;
INSERT INTO `account_role_sidebar_items` VALUES (14,1,11,5,1,1,1,'2026-07-14 06:10:40','2026-07-14 06:10:40'),(15,1,11,5,3,1,1,'2026-07-14 06:10:40','2026-07-14 06:10:40'),(16,1,11,5,6,1,1,'2026-07-14 06:10:40','2026-07-14 06:10:40'),(17,1,11,5,17,1,1,'2026-07-14 06:10:40','2026-07-14 06:10:40'),(18,1,11,5,18,1,1,'2026-07-14 06:10:40','2026-07-14 06:10:40'),(43,1,11,1,1,1,1,'2026-07-16 05:49:25','2026-07-16 05:49:25'),(44,1,11,1,3,1,1,'2026-07-16 05:49:25','2026-07-16 05:49:25'),(45,1,11,1,4,1,1,'2026-07-16 05:49:25','2026-07-16 05:49:25'),(46,1,11,1,5,1,1,'2026-07-16 05:49:25','2026-07-16 05:49:25'),(47,1,11,1,6,1,1,'2026-07-16 05:49:25','2026-07-16 05:49:25'),(48,1,11,1,7,1,1,'2026-07-16 05:49:25','2026-07-16 05:49:25'),(49,1,11,1,16,1,1,'2026-07-16 05:49:25','2026-07-16 05:49:25'),(50,1,11,1,17,1,1,'2026-07-16 05:49:25','2026-07-16 05:49:25'),(51,1,11,1,18,1,1,'2026-07-16 05:49:25','2026-07-16 05:49:25'),(52,1,11,1,19,1,1,'2026-07-16 05:49:25','2026-07-16 05:49:25'),(53,1,11,1,20,1,1,'2026-07-16 05:49:25','2026-07-16 05:49:25'),(54,1,11,1,21,1,1,'2026-07-16 05:49:25','2026-07-16 05:49:25'),(55,1,11,1,34,1,1,'2026-07-21 03:09:47','2026-07-21 03:09:47'),(59,1,11,5,36,1,1,'2026-07-21 06:04:47','2026-07-21 06:04:47'),(60,1,11,1,36,1,1,'2026-07-21 06:04:47','2026-07-21 06:04:47'),(62,1,11,5,37,1,1,'2026-07-21 06:04:47','2026-07-21 06:04:47'),(63,1,11,1,37,1,1,'2026-07-21 06:04:47','2026-07-21 06:04:47'),(65,1,11,1,38,1,1,'2026-07-22 03:57:12','2026-07-22 03:57:12');
/*!40000 ALTER TABLE `account_role_sidebar_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `app_features`
--

DROP TABLE IF EXISTS `app_features`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `app_features` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint(20) unsigned NOT NULL,
  `feature_code` varchar(100) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `is_developer_ready` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `app_features_product_code_unique` (`product_id`,`feature_code`),
  KEY `app_features_product_status_sort_index` (`product_id`,`status`,`sort_order`),
  CONSTRAINT `app_features_product_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `app_features`
--

LOCK TABLES `app_features` WRITE;
/*!40000 ALTER TABLE `app_features` DISABLE KEYS */;
INSERT INTO `app_features` VALUES (1,11,'dashboard','Dashboard','Main Inventory dashboard.',1,10,'active','2026-07-13 02:00:57','2026-07-13 02:11:28'),(2,11,'inventory_overview','Stock Overview','Inventory health, valuation, warehouse distribution, movement, and replenishment overview.',1,20,'active','2026-07-13 02:00:57','2026-07-16 08:44:47'),(3,11,'categories','Categories','Inventory category management.',1,30,'active','2026-07-13 02:00:57','2026-07-13 02:11:28'),(4,11,'products','Products','Inventory product management.',1,40,'active','2026-07-13 02:00:57','2026-07-13 02:11:28'),(5,11,'stock_management','Stock Management','Current stock management.',1,50,'active','2026-07-13 02:00:57','2026-07-13 02:11:28'),(6,11,'stock_adjustment','Stock Adjustment','Increase, decrease or correct stock.',1,60,'active','2026-07-13 02:00:57','2026-07-13 02:11:28'),(7,11,'stock_transfer','Stock Transfer','Transfer stock between warehouses.',1,90,'active','2026-07-13 02:00:57','2026-07-13 02:11:28'),(8,11,'stock_movements','Stock Movements','View stock movement history.',1,100,'active','2026-07-13 02:00:57','2026-07-13 06:28:46'),(9,11,'branch_management','Branch Management','Manage business branches.',1,70,'active','2026-07-13 02:00:57','2026-07-13 02:11:28'),(10,11,'warehouse_management','Warehouse Management','Manage warehouse locations.',1,80,'active','2026-07-13 02:00:57','2026-07-13 02:11:28'),(11,11,'supplier_management','Supplier Management','Manage supplier records.',1,110,'active','2026-07-13 02:00:57','2026-07-14 01:41:09'),(12,11,'purchase_orders','Purchase Orders','Create and track purchase orders.',1,120,'active','2026-07-13 02:00:57','2026-07-14 01:41:09'),(13,11,'receiving','Receiving','Receive ordered inventory.',1,130,'active','2026-07-13 02:00:57','2026-07-14 01:41:09'),(14,11,'team_overview','Team Overview','View team account summaries, role distribution, and team activity.',1,140,'active','2026-07-13 02:00:57','2026-07-14 03:32:48'),(15,11,'staff_management','Team Members','Create and manage manager and staff accounts.',1,150,'active','2026-07-13 02:00:57','2026-07-14 02:43:32'),(16,11,'roles_access','Roles & Access','Manage module access for inventory team roles.',1,160,'active','2026-07-13 02:00:57','2026-07-14 02:43:32'),(33,11,'stock_issuance_terminal','Withdraw Stock','Withdraw available inventory for internal use, employee or department use, damaged, expired, lost, giveaway, and other authorized stock-out transactions.',1,55,'active','2026-07-21 06:04:47','2026-07-22 03:18:58'),(34,11,'stock_issuance_history','Withdrawal History','View posted, voided, and reversed inventory withdrawal transactions with item and audit details.',1,56,'active','2026-07-21 06:04:47','2026-07-22 03:18:58');
/*!40000 ALTER TABLE `app_features` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
INSERT INTO `cache` VALUES ('laravel-cache-696d286ffe0da48445dcbf8fb537c827','i:1;',1779162289),('laravel-cache-696d286ffe0da48445dcbf8fb537c827:timer','i:1779162289;',1779162289);
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `carts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  `plan_id` bigint(20) unsigned DEFAULT NULL,
  `quantity` int(10) unsigned NOT NULL DEFAULT 1,
  `status` varchar(30) NOT NULL DEFAULT 'active',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `carts_user_product_plan_unique` (`user_id`,`product_id`,`plan_id`),
  KEY `carts_user_id_index` (`user_id`),
  KEY `carts_product_id_index` (`product_id`),
  KEY `carts_plan_id_index` (`plan_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
INSERT INTO `carts` VALUES (8,2,6,5,1,'active',NULL,'2026-05-03 22:58:24','2026-05-03 22:58:24'),(9,1,7,NULL,1,'active',NULL,'2026-05-07 22:43:14','2026-05-07 22:43:14');
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `messages` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `sender_id` bigint(20) unsigned NOT NULL,
  `receiver_id` bigint(20) unsigned NOT NULL,
  `message` text NOT NULL,
  `sender_type` enum('user','admin') NOT NULL DEFAULT 'user',
  `is_read` tinyint(1) NOT NULL DEFAULT 1,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `messages_receiver_id_foreign` (`receiver_id`),
  KEY `messages_user_read_index` (`user_id`,`is_read`),
  KEY `messages_sender_receiver_index` (`sender_id`,`receiver_id`),
  CONSTRAINT `messages_receiver_id_foreign` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_sender_id_foreign` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (8,1,1,1,'ss','user',1,NULL,'2026-05-07 22:42:57','2026-05-07 22:42:57');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2025_08_14_170933_add_two_factor_columns_to_users_table',1);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(100) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 1,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `notifications_user_read_index` (`user_id`,`is_read`),
  CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,1,'1Welcome to JCM Web Solution','Your account is ready. You can now send inquiries and receive project updates.','system',0,'2026-04-26 18:36:33','2026-04-26 04:24:39','2026-04-26 18:36:33');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `orders` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `order_code` varchar(100) NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned DEFAULT NULL,
  `service_id` bigint(20) unsigned DEFAULT NULL,
  `plan_id` bigint(20) unsigned DEFAULT NULL,
  `billing_type` enum('trial','monthly','quarterly','yearly','custom') NOT NULL DEFAULT 'monthly',
  `subscription_id` bigint(20) unsigned DEFAULT NULL,
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
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_code` (`order_code`),
  KEY `fk_orders_product` (`product_id`),
  KEY `idx_orders_user_id` (`user_id`),
  KEY `idx_orders_plan_id` (`plan_id`),
  KEY `idx_orders_status` (`status`),
  KEY `idx_orders_subscription_id` (`subscription_id`),
  KEY `orders_service_id_index` (`service_id`),
  KEY `orders_plan_product_index` (`plan_id`,`product_id`),
  KEY `orders_user_status_index` (`user_id`,`status`),
  KEY `orders_subscription_type_index` (`subscription_id`,`order_type`),
  CONSTRAINT `fk_orders_plan_product` FOREIGN KEY (`plan_id`, `product_id`) REFERENCES `plans` (`id`, `product_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_orders_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_orders_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_orders_subscription` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_methods`
--

DROP TABLE IF EXISTS `payment_methods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payment_methods` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
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
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_methods`
--

LOCK TABLES `payment_methods` WRITE;
/*!40000 ALTER TABLE `payment_methods` DISABLE KEYS */;
INSERT INTO `payment_methods` VALUES (4,'GCash','gcash','JU*E CH****S M.','09814302368',NULL,'/storage/payment-methods/gcash_qr.png','/storage/payment-method-backgrounds/gcash_bg.png','Scan the QR Code for payment or send the exact amount to the displayed acc number',1,10,'2026-04-29 17:48:43','2026-07-13 01:47:56'),(5,'Maya','maya',NULL,NULL,NULL,NULL,NULL,'Send the exact amount and upload proof.',1,20,'2026-07-13 01:47:56','2026-07-13 01:47:56'),(6,'Bank Transfer','bank-transfer',NULL,NULL,NULL,NULL,NULL,'Transfer the exact amount and upload proof.',1,30,'2026-07-13 01:47:56','2026-07-13 01:47:56'),(7,'Cash','cash',NULL,NULL,NULL,NULL,NULL,'Payment manually received by administrator.',1,40,'2026-07-13 01:47:56','2026-07-13 01:47:56'),(8,'Other','other',NULL,NULL,NULL,NULL,NULL,'Other approved payment method.',1,50,'2026-07-13 01:47:56','2026-07-13 01:47:56');
/*!40000 ALTER TABLE `payment_methods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plan_features`
--

DROP TABLE IF EXISTS `plan_features`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `plan_features` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `plan_id` bigint(20) unsigned NOT NULL,
  `feature_id` bigint(20) unsigned NOT NULL,
  `is_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `limit_value` int(10) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `plan_features_unique` (`plan_id`,`feature_id`),
  KEY `plan_features_feature_index` (`feature_id`),
  CONSTRAINT `plan_features_feature_foreign` FOREIGN KEY (`feature_id`) REFERENCES `app_features` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `plan_features_plan_foreign` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plan_features`
--

LOCK TABLES `plan_features` WRITE;
/*!40000 ALTER TABLE `plan_features` DISABLE KEYS */;
INSERT INTO `plan_features` VALUES (1,12,3,1,NULL,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(2,12,1,1,NULL,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(3,12,2,1,NULL,'2026-07-13 02:00:58','2026-07-16 08:44:47'),(4,12,4,1,NULL,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(5,12,6,1,NULL,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(6,12,5,1,NULL,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(7,12,8,1,NULL,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(8,13,1,1,NULL,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(9,13,2,1,NULL,'2026-07-13 02:00:58','2026-07-16 08:44:47'),(10,13,3,1,NULL,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(11,13,4,1,NULL,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(12,13,5,1,NULL,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(13,13,6,1,NULL,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(14,13,7,1,NULL,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(15,13,8,1,NULL,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(16,13,9,1,NULL,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(17,13,10,1,NULL,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(18,13,11,1,NULL,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(19,13,12,1,NULL,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(20,13,13,1,NULL,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(21,13,14,1,NULL,'2026-07-13 02:00:58','2026-07-14 03:32:48'),(22,13,15,1,NULL,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(23,13,16,1,NULL,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(39,12,12,1,NULL,'2026-07-13 02:11:28','2026-07-13 02:11:28'),(40,12,13,1,NULL,'2026-07-13 02:11:28','2026-07-13 02:11:28'),(41,12,11,1,NULL,'2026-07-13 02:11:28','2026-07-13 02:11:28'),(43,12,33,1,NULL,'2026-07-21 06:04:47','2026-07-21 06:04:47'),(44,13,33,1,NULL,'2026-07-21 06:04:47','2026-07-21 06:04:47'),(46,12,34,1,NULL,'2026-07-21 06:04:47','2026-07-21 06:04:47'),(47,13,34,1,NULL,'2026-07-21 06:04:47','2026-07-21 06:04:47');
/*!40000 ALTER TABLE `plan_features` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plans`
--

DROP TABLE IF EXISTS `plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `plans` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint(20) unsigned NOT NULL,
  `plan_code` varchar(100) NOT NULL,
  `plan_name` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `billing_interval` enum('monthly','quarterly','yearly','custom') NOT NULL DEFAULT 'monthly',
  `currency` char(3) NOT NULL DEFAULT 'PHP',
  `duration_days` int(11) NOT NULL,
  `trial_days` int(10) unsigned NOT NULL DEFAULT 0,
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
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `plans_product_code_unique` (`product_id`,`plan_code`),
  UNIQUE KEY `plans_id_product_unique` (`id`,`product_id`),
  UNIQUE KEY `plans_product_plan_code_unique` (`product_id`,`plan_code`),
  KEY `fk_plans_product` (`product_id`),
  KEY `plans_product_status_sort_index` (`product_id`,`status`,`sort_order`),
  CONSTRAINT `fk_plans_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plans`
--

LOCK TABLES `plans` WRITE;
/*!40000 ALTER TABLE `plans` DISABLE KEYS */;
INSERT INTO `plans` VALUES (9,10,'basic','Basic POS',499.00,'monthly','PHP',30,0,'Single owner POS with inventory and sales management.',0,0,0,NULL,1,NULL,1,10,'active','2026-06-09 07:03:22','2026-07-13 01:47:56'),(10,10,'business','Business POS',1299.00,'monthly','PHP',30,0,'POS with cashier, staff, and manager role-based access.',1,0,0,NULL,1,NULL,10,20,'active','2026-06-09 07:03:22','2026-07-13 01:47:56'),(11,10,'enterprise','Enterprise POS',1999.00,'monthly','PHP',30,0,'Multi branch POS with employee activity logs and audit trail.',1,1,1,365,NULL,NULL,NULL,30,'active','2026-06-09 07:03:22','2026-07-13 01:47:56'),(12,11,'solo','Solo Inventory',0.00,'monthly','PHP',30,0,'For one owner managing one branch and one warehouse.',0,0,0,NULL,1,1,0,10,'active','2026-07-13 01:47:56','2026-07-13 01:47:56'),(13,11,'team','Team Inventory',0.00,'monthly','PHP',30,0,'For owners with staff, multiple branches and warehouses.',1,1,0,NULL,NULL,NULL,NULL,20,'active','2026-07-13 01:47:56','2026-07-13 01:47:56');
/*!40000 ALTER TABLE `plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_features`
--

DROP TABLE IF EXISTS `product_features`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `product_features` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint(20) unsigned NOT NULL,
  `feature_title` varchar(255) NOT NULL,
  `feature_description` text DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_product_features_product` (`product_id`),
  CONSTRAINT `fk_product_features_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_features`
--

LOCK TABLES `product_features` WRITE;
/*!40000 ALTER TABLE `product_features` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_features` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `product_images` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint(20) unsigned NOT NULL,
  `image_path` varchar(255) NOT NULL,
  `alt_text` varchar(255) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_product_images_product` (`product_id`),
  CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_overview`
--

DROP TABLE IF EXISTS `product_overview`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `product_overview` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint(20) unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_product_overview_product` (`product_id`),
  CONSTRAINT `fk_product_overview_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_overview`
--

LOCK TABLES `product_overview` WRITE;
/*!40000 ALTER TABLE `product_overview` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_overview` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_user_type_sidebar_items`
--

DROP TABLE IF EXISTS `product_user_type_sidebar_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `product_user_type_sidebar_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `product_user_type_id` bigint(20) unsigned NOT NULL,
  `sidebar_item_id` bigint(20) unsigned NOT NULL,
  `is_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_user_type_sidebar_unique` (`product_user_type_id`,`sidebar_item_id`),
  KEY `product_user_type_sidebar_item_index` (`sidebar_item_id`),
  CONSTRAINT `product_user_type_sidebar_item_foreign` FOREIGN KEY (`sidebar_item_id`) REFERENCES `sidebar_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `product_user_type_sidebar_role_foreign` FOREIGN KEY (`product_user_type_id`) REFERENCES `product_user_types` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_user_type_sidebar_items`
--

LOCK TABLES `product_user_type_sidebar_items` WRITE;
/*!40000 ALTER TABLE `product_user_type_sidebar_items` DISABLE KEYS */;
INSERT INTO `product_user_type_sidebar_items` VALUES (2,3,16,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(3,3,1,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(4,3,3,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(5,3,2,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(6,3,17,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(7,3,20,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(8,3,21,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(9,3,23,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(10,3,22,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(11,3,18,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(12,3,6,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(13,3,19,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(14,3,7,1,'2026-07-13 02:00:58','2026-07-20 04:29:27'),(15,3,9,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(16,3,8,1,'2026-07-13 02:00:58','2026-07-14 03:32:48'),(17,3,5,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(32,1,4,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(33,1,16,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(34,1,1,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(35,1,3,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(36,1,2,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(37,1,17,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(38,1,20,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(39,1,21,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(40,1,18,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(41,1,6,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(42,1,19,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(43,1,7,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(44,1,5,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(47,5,1,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(48,5,3,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(49,5,17,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(50,5,18,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(51,5,6,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(57,3,4,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(59,3,33,1,'2026-07-20 04:29:27','2026-07-20 04:29:27'),(60,3,34,1,'2026-07-21 03:09:47','2026-07-21 03:09:47'),(61,1,34,1,'2026-07-21 03:09:47','2026-07-21 03:09:47'),(66,3,36,1,'2026-07-21 06:04:47','2026-07-21 06:04:47'),(67,1,36,1,'2026-07-21 06:04:47','2026-07-21 06:04:47'),(68,5,36,1,'2026-07-21 06:04:47','2026-07-21 06:04:47'),(69,3,37,1,'2026-07-21 06:04:47','2026-07-21 06:04:47'),(70,1,37,1,'2026-07-21 06:04:47','2026-07-21 06:04:47'),(71,5,37,1,'2026-07-21 06:04:47','2026-07-21 06:04:47'),(72,1,38,1,'2026-07-22 03:57:12','2026-07-22 03:57:12'),(73,3,38,1,'2026-07-22 03:57:12','2026-07-22 03:57:12');
/*!40000 ALTER TABLE `product_user_type_sidebar_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_user_types`
--

DROP TABLE IF EXISTS `product_user_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `product_user_types` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint(20) unsigned NOT NULL,
  `user_type_id` bigint(20) unsigned NOT NULL,
  `display_name` varchar(100) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_user_types_unique` (`product_id`,`user_type_id`),
  KEY `product_user_types_user_type_index` (`user_type_id`),
  CONSTRAINT `product_user_types_product_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `product_user_types_user_type_foreign` FOREIGN KEY (`user_type_id`) REFERENCES `user_types` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_user_types`
--

LOCK TABLES `product_user_types` WRITE;
/*!40000 ALTER TABLE `product_user_types` DISABLE KEYS */;
INSERT INTO `product_user_types` VALUES (1,11,2,'Manager','active','2026-07-13 02:00:57','2026-07-13 02:11:28'),(2,10,2,'Manager','active','2026-07-13 02:00:57','2026-07-13 02:00:57'),(3,11,1,'Client / Owner','active','2026-07-13 02:00:57','2026-07-13 02:11:28'),(4,10,1,'Client / Owner','active','2026-07-13 02:00:57','2026-07-13 02:00:57'),(5,11,3,'Staff','active','2026-07-13 02:00:57','2026-07-13 02:11:28'),(6,10,3,'Staff','active','2026-07-13 02:00:57','2026-07-13 02:00:57');
/*!40000 ALTER TABLE `product_user_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `products` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
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
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_code` (`product_code`),
  UNIQUE KEY `products_slug_unique` (`slug`),
  KEY `products_status_sort_index` (`status`,`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (10,'JCM-POS-001','jcm-pos','JCM POS','Cloud-based Point of Sale and Inventory Management System for retail businesses.',NULL,NULL,0.00,'plan',20,'paused','2026-06-09 07:02:14','2026-07-13 01:47:56'),(11,'JCM-INVENTORY-001','jcm-inventory','JCM Inventory','Cloud-based inventory management system for solo owners and teams.',NULL,NULL,0.00,'plan',10,'development','2026-07-13 01:47:56','2026-07-13 02:11:28');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_features`
--

DROP TABLE IF EXISTS `service_features`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `service_features` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `service_id` bigint(20) unsigned NOT NULL,
  `feature_title` varchar(255) NOT NULL,
  `feature_description` text DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_service_features_service` (`service_id`),
  CONSTRAINT `fk_service_features_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_features`
--

LOCK TABLES `service_features` WRITE;
/*!40000 ALTER TABLE `service_features` DISABLE KEYS */;
INSERT INTO `service_features` VALUES (3,6,'f1',NULL,NULL,0,'2026-05-07 22:35:05','2026-05-07 22:35:05');
/*!40000 ALTER TABLE `service_features` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_images`
--

DROP TABLE IF EXISTS `service_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `service_images` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `service_id` bigint(20) unsigned NOT NULL,
  `image_path` varchar(255) NOT NULL,
  `alt_text` varchar(255) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_service_images_service` (`service_id`),
  CONSTRAINT `fk_service_images_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_images`
--

LOCK TABLES `service_images` WRITE;
/*!40000 ALTER TABLE `service_images` DISABLE KEYS */;
INSERT INTO `service_images` VALUES (1,6,'services/wcf3ML4zRaNZ79YGB4YWqm2JdhyxDqhieFxt7hhx.png','test image 1',0,'2026-05-07 22:35:05','2026-05-07 22:35:05'),(2,6,'services/9uTcBfpX9YtR70MADDJ9JXcWMWVlfipcwyoarWFK.png','test image 2',1,'2026-05-07 22:35:05','2026-05-07 22:35:05'),(3,6,'services/UUd4SW1v99bQwJxjKBTUmjtKxHyzXV5vFbWTGRsR.png','test image 3',2,'2026-05-07 22:35:05','2026-05-07 22:35:05');
/*!40000 ALTER TABLE `service_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_overview`
--

DROP TABLE IF EXISTS `service_overview`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `service_overview` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `service_id` bigint(20) unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_service_overview_service` (`service_id`),
  CONSTRAINT `fk_service_overview_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_overview`
--

LOCK TABLES `service_overview` WRITE;
/*!40000 ALTER TABLE `service_overview` DISABLE KEYS */;
INSERT INTO `service_overview` VALUES (1,6,'f1','f1',0,'2026-05-07 22:35:05','2026-05-07 22:35:05');
/*!40000 ALTER TABLE `service_overview` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `services` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
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
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
INSERT INTO `services` VALUES (6,'qewf3','test','terwq','services/wcf3ML4zRaNZ79YGB4YWqm2JdhyxDqhieFxt7hhx.png','custom','fixed',NULL,'PHP','active',10000,'2026-05-07 22:35:05','2026-05-07 22:35:05');
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('rLAqrldWqiVidTmVr8QtBqZ4MbHO2LVVFLhf7zvk',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','YToyOntzOjY6Il90b2tlbiI7czo0MDoiWFE3bXFXOFhDaVRDdVVoYUV5NlVubmlXbVJzU01hSklJemp4QlVKWSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1779175480);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sidebar_badges`
--

DROP TABLE IF EXISTS `sidebar_badges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sidebar_badges` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `badge_code` varchar(30) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `icon_key` varchar(100) DEFAULT NULL,
  `style_key` varchar(50) NOT NULL DEFAULT 'default',
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `sidebar_badges_code_unique` (`badge_code`),
  KEY `sidebar_badges_status_sort_index` (`status`,`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sidebar_badges`
--

LOCK TABLES `sidebar_badges` WRITE;
/*!40000 ALTER TABLE `sidebar_badges` DISABLE KEYS */;
INSERT INTO `sidebar_badges` VALUES (1,'LIVE','Live','Feature is complete, stable and available for production use.','Sparkles','live',10,'active','2026-07-13 02:20:23','2026-07-13 02:20:23'),(2,'CORE','Core','Core feature required by the product.','Boxes','core',20,'active','2026-07-13 02:20:23','2026-07-13 02:20:23'),(3,'DEV','Development','Feature is currently under development.','Code2','development',30,'active','2026-07-13 02:20:23','2026-07-13 02:20:23'),(4,'TUNE','Tuning','Feature is functional but still being optimized or refined.','Settings','tuning',40,'active','2026-07-13 02:20:23','2026-07-13 02:20:23'),(5,'TEST','Testing','Feature is ready for internal testing.','FlaskConical','testing',50,'active','2026-07-13 02:20:23','2026-07-13 02:20:23'),(6,'NEW','New','Feature was recently added or released.','Sparkles','new',60,'active','2026-07-13 02:20:23','2026-07-13 02:20:23'),(7,'BETA','Beta','Feature is available in beta and may still change.','Beaker','beta',70,'active','2026-07-13 02:20:23','2026-07-13 02:20:23'),(8,'SOON','Coming Soon','Feature or page is planned but not yet ready.','Clock3','soon',80,'active','2026-07-13 02:20:23','2026-07-13 02:20:23');
/*!40000 ALTER TABLE `sidebar_badges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sidebar_items`
--

DROP TABLE IF EXISTS `sidebar_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sidebar_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint(20) unsigned NOT NULL,
  `parent_id` bigint(20) unsigned DEFAULT NULL,
  `feature_id` bigint(20) unsigned DEFAULT NULL,
  `item_key` varchar(100) NOT NULL,
  `section_key` varchar(100) NOT NULL DEFAULT 'management',
  `item_type` enum('link','group','heading') NOT NULL DEFAULT 'link',
  `label` varchar(150) NOT NULL,
  `route_name` varchar(200) DEFAULT NULL,
  `url_override` varchar(255) DEFAULT NULL,
  `icon_key` varchar(100) DEFAULT NULL,
  `badge` varchar(30) DEFAULT NULL,
  `badge_id` bigint(20) unsigned DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_developer_ready` tinyint(1) NOT NULL DEFAULT 0,
  `is_visible` tinyint(1) NOT NULL DEFAULT 1,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `sidebar_items_product_key_unique` (`product_id`,`item_key`),
  KEY `sidebar_items_parent_index` (`parent_id`),
  KEY `sidebar_items_feature_index` (`feature_id`),
  KEY `sidebar_items_render_index` (`product_id`,`section_key`,`status`,`is_visible`,`sort_order`),
  KEY `sidebar_items_badge_id_index` (`badge_id`),
  CONSTRAINT `sidebar_items_badge_foreign` FOREIGN KEY (`badge_id`) REFERENCES `sidebar_badges` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `sidebar_items_feature_foreign` FOREIGN KEY (`feature_id`) REFERENCES `app_features` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `sidebar_items_parent_foreign` FOREIGN KEY (`parent_id`) REFERENCES `sidebar_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `sidebar_items_product_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sidebar_items`
--

LOCK TABLES `sidebar_items` WRITE;
/*!40000 ALTER TABLE `sidebar_items` DISABLE KEYS */;
INSERT INTO `sidebar_items` VALUES (1,11,NULL,1,'dashboard','overview','link','Main Dashboard','dashboard','/dashboard','LayoutDashboard','TEST',5,10,1,1,'active','2026-07-13 02:00:58','2026-07-23 05:58:25'),(2,11,NULL,2,'inventory-overview','overview','link','Stock Overview','inventory.overview','/inventory/overview','BarChart3','TEST',5,20,1,1,'active','2026-07-13 02:00:58','2026-07-23 05:58:25'),(3,11,NULL,NULL,'inventory-group','management','group','Inventory',NULL,NULL,'Boxes','TEST',5,10,1,1,'active','2026-07-13 02:00:58','2026-07-23 05:58:25'),(4,11,38,9,'branches','management','link','Branches','branches.index','/locations/branches','Building2',NULL,NULL,10,1,1,'active','2026-07-13 02:00:58','2026-07-24 05:57:07'),(5,11,38,10,'warehouses','management','link','Warehouses','warehouses.index','/locations/warehouses','Warehouse',NULL,NULL,20,1,1,'active','2026-07-13 02:00:58','2026-07-24 05:57:01'),(6,11,3,8,'stock-movements','management','link','Stock Movements','stock-movements.index','/inventory/stock-movements','History',NULL,NULL,60,1,1,'active','2026-07-13 02:00:58','2026-07-24 05:44:50'),(7,11,NULL,NULL,'suppliers-group','management','group','Procurement',NULL,NULL,'ShoppingCart','TEST',5,30,1,1,'active','2026-07-13 02:00:58','2026-07-23 05:58:25'),(8,11,NULL,14,'team-overview','overview','link','Team Overview','team.overview','/team/overview','Users','TEST',5,30,1,1,'active','2026-07-13 02:00:58','2026-07-23 05:58:25'),(9,11,NULL,NULL,'team-group','management','group','Team Management',NULL,NULL,'Users','TEST',5,40,1,1,'active','2026-07-13 02:00:58','2026-07-23 05:58:25'),(16,11,3,3,'categories','management','link','Categories','inventory.categories.index','/inventory/categories','Tags',NULL,NULL,10,1,1,'active','2026-07-13 02:00:58','2026-07-22 03:57:12'),(17,11,3,4,'products','management','link','Products','inventory.products.index','/inventory/products','Package2',NULL,NULL,20,1,1,'active','2026-07-13 02:00:58','2026-07-22 03:57:12'),(18,11,3,5,'stock-management','management','link','Stock Management','inventory.stocks.index','/inventory/stocks','Boxes',NULL,NULL,30,1,1,'active','2026-07-13 02:00:58','2026-07-22 03:57:12'),(19,11,7,11,'suppliers','management','link','Suppliers','suppliers.index','/suppliers','Truck',NULL,NULL,10,1,1,'active','2026-07-13 02:00:58','2026-07-22 03:57:12'),(20,11,7,12,'purchase-orders','management','link','Purchase Orders','suppliers.purchase-orders.index','/suppliers/purchase-orders','ClipboardCheck',NULL,NULL,20,1,1,'active','2026-07-13 02:00:58','2026-07-22 03:57:12'),(21,11,7,13,'receiving','management','link','Receiving','suppliers.receiving.index','/suppliers/receiving','PackageCheck',NULL,NULL,40,1,1,'active','2026-07-13 02:00:58','2026-07-22 03:57:12'),(22,11,9,15,'staff-accounts','management','link','Team Members','team.members.index','/team/members','Users',NULL,NULL,10,1,1,'active','2026-07-13 02:00:58','2026-07-22 03:57:12'),(23,11,9,16,'roles-access','management','link','Roles & Access','team.roles.index','/team/roles','UserCog',NULL,NULL,20,1,1,'active','2026-07-13 02:00:58','2026-07-22 03:57:12'),(33,11,7,12,'purchase-approvals','management','link','Purchase Approvals','suppliers.purchase-approvals.index','/suppliers/purchase-approvals','ClipboardCheck',NULL,NULL,30,1,1,'active','2026-07-20 04:29:27','2026-07-22 03:57:12'),(34,11,7,13,'received-orders','management','link','Received Orders','procurement.received-orders.index','/procurement/received-orders','History',NULL,NULL,50,1,1,'active','2026-07-21 03:09:47','2026-07-22 03:57:12'),(36,11,3,33,'stock-issuance-terminal','management','link','Withdraw Stock','inventory.withdraw.index','/inventory/withdraw','PackageMinus',NULL,NULL,40,1,1,'active','2026-07-21 06:04:47','2026-07-22 03:57:12'),(37,11,3,34,'stock-issuance-history','management','link','Withdrawal History','inventory.history.index','/inventory/history','History',NULL,NULL,50,1,1,'active','2026-07-21 06:04:47','2026-07-22 03:57:12'),(38,11,NULL,NULL,'locations-group','management','group','Locations',NULL,NULL,'MapPin','TEST',5,20,1,1,'active','2026-07-22 03:57:12','2026-07-23 05:58:25');
/*!40000 ALTER TABLE `sidebar_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscription_cycles`
--

DROP TABLE IF EXISTS `subscription_cycles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `subscription_cycles` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `subscription_id` bigint(20) unsigned NOT NULL,
  `plan_id` bigint(20) unsigned NOT NULL,
  `order_id` bigint(20) unsigned DEFAULT NULL,
  `transaction_id` bigint(20) unsigned DEFAULT NULL,
  `cycle_number` int(10) unsigned NOT NULL,
  `billing_type` enum('trial','monthly','quarterly','yearly','custom') NOT NULL DEFAULT 'monthly',
  `status` enum('pending','active','completed','expired','cancelled','unpaid') NOT NULL DEFAULT 'pending',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `currency` char(3) NOT NULL DEFAULT 'PHP',
  `activated_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `subscription_cycles_number_unique` (`subscription_id`,`cycle_number`),
  KEY `subscription_cycles_plan_index` (`plan_id`),
  KEY `subscription_cycles_order_index` (`order_id`),
  KEY `subscription_cycles_transaction_index` (`transaction_id`),
  CONSTRAINT `subscription_cycles_order_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `subscription_cycles_plan_foreign` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `subscription_cycles_subscription_foreign` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `subscription_cycles_transaction_foreign` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription_cycles`
--

LOCK TABLES `subscription_cycles` WRITE;
/*!40000 ALTER TABLE `subscription_cycles` DISABLE KEYS */;
INSERT INTO `subscription_cycles` VALUES (1,18,9,NULL,NULL,1,'monthly','expired','2026-06-09','2026-07-09',499.00,'PHP','2026-06-09 00:00:00','2026-07-09 23:59:59','2026-06-09 07:47:30','2026-07-13 01:47:56'),(2,19,13,NULL,NULL,1,'monthly','active','2026-07-13','2027-07-13',0.00,'PHP','2026-07-13 02:33:41',NULL,'2026-07-13 02:33:41','2026-07-13 02:33:41');
/*!40000 ALTER TABLE `subscription_cycles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscription_events`
--

DROP TABLE IF EXISTS `subscription_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `subscription_events` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `subscription_id` bigint(20) unsigned NOT NULL,
  `actor_user_id` bigint(20) unsigned DEFAULT NULL,
  `event_type` enum('created','trial_started','activated','renewed','upgraded','downgraded','payment_failed','past_due','suspended','resumed','expired','cancelled') NOT NULL,
  `old_plan_id` bigint(20) unsigned DEFAULT NULL,
  `new_plan_id` bigint(20) unsigned DEFAULT NULL,
  `old_status` varchar(50) DEFAULT NULL,
  `new_status` varchar(50) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `metadata` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `subscription_events_subscription_date_index` (`subscription_id`,`created_at`),
  KEY `subscription_events_actor_foreign` (`actor_user_id`),
  KEY `subscription_events_old_plan_foreign` (`old_plan_id`),
  KEY `subscription_events_new_plan_foreign` (`new_plan_id`),
  CONSTRAINT `subscription_events_actor_foreign` FOREIGN KEY (`actor_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `subscription_events_new_plan_foreign` FOREIGN KEY (`new_plan_id`) REFERENCES `plans` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `subscription_events_old_plan_foreign` FOREIGN KEY (`old_plan_id`) REFERENCES `plans` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `subscription_events_subscription_foreign` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription_events`
--

LOCK TABLES `subscription_events` WRITE;
/*!40000 ALTER TABLE `subscription_events` DISABLE KEYS */;
INSERT INTO `subscription_events` VALUES (1,18,1,'created',NULL,9,NULL,'active','Migrated from the original JCM SaaS subscription.',NULL,'2026-06-09 07:47:30'),(2,18,NULL,'expired',9,9,'active','expired','Automatically expired because its end date passed.',NULL,'2026-07-09 23:59:59'),(3,19,1,'activated',NULL,13,'pending','active','JCM Inventory development access activated.',NULL,'2026-07-13 02:33:41');
/*!40000 ALTER TABLE `subscription_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscriptions`
--

DROP TABLE IF EXISTS `subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `subscriptions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  `plan_id` bigint(20) unsigned NOT NULL,
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
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `subscription_code` (`subscription_code`),
  KEY `fk_subscriptions_user` (`user_id`),
  KEY `fk_subscriptions_product` (`product_id`),
  KEY `idx_subscriptions_plan_id` (`plan_id`),
  KEY `subscriptions_plan_product_index` (`plan_id`,`product_id`),
  KEY `subscriptions_user_product_status_index` (`user_id`,`product_id`,`status`),
  KEY `subscriptions_status_end_date_index` (`status`,`end_date`),
  CONSTRAINT `fk_subscriptions_plan_product` FOREIGN KEY (`plan_id`, `product_id`) REFERENCES `plans` (`id`, `product_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_subscriptions_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_subscriptions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscriptions`
--

LOCK TABLES `subscriptions` WRITE;
/*!40000 ALTER TABLE `subscriptions` DISABLE KEYS */;
INSERT INTO `subscriptions` VALUES (18,1,10,9,'SUB-1780991250','monthly','expired','2026-06-09','2026-07-09',30,499.00,'PHP',0,'2026-06-09 00:00:00',NULL,'2026-07-09 23:59:59','Basic POS subscription for testing','2026-06-09 07:47:30','2026-07-13 01:47:56'),(19,1,11,13,'SUB-INV-DEV-1-1783910021','monthly','active','2026-07-13','2027-07-13',365,0.00,'PHP',0,'2026-07-13 02:33:41',NULL,NULL,'Development access for JCM Inventory.','2026-07-13 02:33:41','2026-07-13 02:33:41');
/*!40000 ALTER TABLE `subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `transactions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `transaction_code` varchar(100) NOT NULL,
  `order_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `payment_method_id` bigint(20) unsigned NOT NULL,
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
  `verified_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `transaction_code` (`transaction_code`),
  KEY `idx_transactions_order_id` (`order_id`),
  KEY `idx_transactions_user_id` (`user_id`),
  KEY `idx_transactions_status` (`status`),
  KEY `transactions_payment_method_index` (`payment_method_id`),
  KEY `transactions_order_status_index` (`order_id`,`status`),
  KEY `transactions_verified_by_index` (`verified_by`),
  CONSTRAINT `fk_transactions_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_transactions_payment_method` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_transactions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_transactions_verified_by` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_product_access`
--

DROP TABLE IF EXISTS `user_product_access`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_product_access` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  `product_user_type_id` bigint(20) unsigned NOT NULL,
  `account_owner_id` bigint(20) unsigned NOT NULL,
  `subscription_id` bigint(20) unsigned DEFAULT NULL,
  `status` enum('pending','active','inactive','removed') NOT NULL DEFAULT 'pending',
  `assigned_by` bigint(20) unsigned DEFAULT NULL,
  `joined_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_product_access_context_unique` (`user_id`,`product_id`,`account_owner_id`),
  KEY `user_product_access_product_role_index` (`product_id`,`product_user_type_id`,`status`),
  KEY `user_product_access_owner_index` (`account_owner_id`,`product_id`,`status`),
  KEY `user_product_access_subscription_index` (`subscription_id`),
  KEY `user_product_access_product_user_type_foreign` (`product_user_type_id`),
  KEY `user_product_access_assigned_by_foreign` (`assigned_by`),
  CONSTRAINT `user_product_access_assigned_by_foreign` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `user_product_access_owner_foreign` FOREIGN KEY (`account_owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_product_access_product_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_product_access_product_user_type_foreign` FOREIGN KEY (`product_user_type_id`) REFERENCES `product_user_types` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `user_product_access_subscription_foreign` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `user_product_access_user_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_product_access`
--

LOCK TABLES `user_product_access` WRITE;
/*!40000 ALTER TABLE `user_product_access` DISABLE KEYS */;
INSERT INTO `user_product_access` VALUES (1,1,10,4,1,18,'inactive',1,NULL,'2026-07-13 02:00:57','2026-07-13 02:00:57'),(2,1,11,3,1,19,'active',1,'2026-07-13 02:33:41','2026-07-13 02:33:41','2026-07-13 02:33:41'),(3,19,11,5,1,19,'active',1,'2026-07-14 03:59:29','2026-07-14 03:59:29','2026-07-23 01:00:53');
/*!40000 ALTER TABLE `user_product_access` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_types`
--

DROP TABLE IF EXISTS `user_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_types` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `type_code` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `is_owner_type` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_types_code_unique` (`type_code`),
  KEY `user_types_status_sort_index` (`status`,`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_types`
--

LOCK TABLES `user_types` WRITE;
/*!40000 ALTER TABLE `user_types` DISABLE KEYS */;
INSERT INTO `user_types` VALUES (1,'owner','Client / Owner','Owner of a subscribed JCM SaaS account.',1,10,'active','2026-07-13 02:00:57','2026-07-13 02:11:28'),(2,'manager','Manager','Manages operations assigned by the owner.',0,20,'active','2026-07-13 02:00:57','2026-07-13 02:11:28'),(3,'staff','Staff','Performs assigned inventory tasks.',0,30,'active','2026-07-13 02:00:57','2026-07-13 02:11:28');
/*!40000 ALTER TABLE `user_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
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
  `client_id` bigint(20) unsigned DEFAULT NULL,
  `branch_id` bigint(20) unsigned DEFAULT NULL,
  `system_used` enum('pos') DEFAULT NULL,
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_role_client_id_index` (`role`,`client_id`),
  KEY `users_created_by_foreign` (`created_by`),
  KEY `users_branch_id_index` (`branch_id`),
  KEY `users_system_used_index` (`system_used`),
  KEY `users_client_branch_system_index` (`client_id`,`branch_id`,`system_used`),
  CONSTRAINT `users_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `users_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'June Charles Mariquit','junecharlesmariquit553@gmail.com',NULL,'$2y$12$knLKVXIAam08KApxVgv6eOA7nnoZykl8Ef2r4H3kmdOBOI40.2FOi',NULL,NULL,NULL,'bCiTS8i0vfMumaF5bgJplgSy6OcBJP1me5FQhVuln6pYrZscKxPadt6yUr0s','2026-04-13 21:58:39','2026-04-13 21:58:39','client',NULL,NULL,'pos',NULL,1),(7,'admin','admin@gmail.com',NULL,'$2y$12$knLKVXIAam08KApxVgv6eOA7nnoZykl8Ef2r4H3kmdOBOI40.2FOi',NULL,NULL,NULL,'AKzQuJt0QVa7Gfsmsdgbl7sZzNkzjrD04AxBAX7SjbmjrBx0ZVXnNHNNyqCn','2026-04-13 21:58:39','2026-04-13 21:58:39','admin',NULL,NULL,NULL,NULL,1),(12,'cashier','cashier@pos.com',NULL,'$2y$12$m/UNFXRTz3F57XWwWS4Wku1MqmOCQUPC1FxK11n7UpTFPUJKOI8NO',NULL,NULL,NULL,NULL,'2026-05-29 18:52:57','2026-05-29 18:52:57','cashier',1,1,'pos',1,1),(13,'Store Manager 1','manager1@pos.com','2026-06-05 01:41:18','$2y$12$m/UNFXRTz3F57XWwWS4Wku1MqmOCQUPC1FxK11n7UpTFPUJKOI8NO',NULL,NULL,NULL,NULL,'2026-06-05 01:41:18','2026-06-05 01:41:18','manager',1,1,'pos',1,1),(14,'Store Manager 2','manager2@pos.com','2026-06-05 01:41:18','$2y$12$m/UNFXRTz3F57XWwWS4Wku1MqmOCQUPC1FxK11n7UpTFPUJKOI8NO',NULL,NULL,NULL,NULL,'2026-06-05 01:41:18','2026-06-05 01:41:18','manager',1,1,'pos',1,1),(15,'Store Staff 1','staff1@pos.com','2026-06-05 01:41:18','$2y$12$m/UNFXRTz3F57XWwWS4Wku1MqmOCQUPC1FxK11n7UpTFPUJKOI8NO',NULL,NULL,NULL,NULL,'2026-06-05 01:41:18','2026-06-05 01:41:18','staff',1,1,'pos',1,1),(16,'Store Staff 2','staff2@pos.com','2026-06-05 01:41:18','$2y$12$m/UNFXRTz3F57XWwWS4Wku1MqmOCQUPC1FxK11n7UpTFPUJKOI8NO',NULL,NULL,NULL,NULL,'2026-06-05 01:41:18','2026-06-08 19:38:03','staff',1,1,'pos',1,1),(17,'Cashier 2','cashier2@pos.com','2026-06-05 01:43:20','$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',NULL,NULL,NULL,NULL,'2026-06-05 01:43:20','2026-06-05 01:43:20','cashier',1,1,'pos',1,1),(18,'cashier1','cashier1@pos.com',NULL,'$2y$12$m/UNFXRTz3F57XWwWS4Wku1MqmOCQUPC1FxK11n7UpTFPUJKOI8NO',NULL,NULL,NULL,NULL,'2026-05-29 18:52:57','2026-05-29 18:52:57','cashier',1,1,'pos',1,1),(19,'staff','staff@inventory.com',NULL,'$2y$12$NdDKLmZaROoi/5YdtQeVYOE77wbMgLXLjAhHixLGlPC9VSUn0wfkK',NULL,NULL,NULL,NULL,'2026-07-14 03:59:29','2026-07-23 01:00:53','staff',1,3,NULL,1,1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'jcm_saas_db'
--

--
-- Dumping routines for database 'jcm_saas_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-27 10:49:28
