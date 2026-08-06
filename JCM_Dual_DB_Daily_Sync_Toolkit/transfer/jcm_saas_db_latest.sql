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

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `jcm_saas_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;

USE `jcm_saas_db`;

--
-- Table structure for table `account_business_branding`
--

DROP TABLE IF EXISTS `account_business_branding`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `account_business_branding` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `account_owner_id` bigint(20) unsigned NOT NULL,
  `tagline` varchar(180) DEFAULT NULL,
  `logo_disk` varchar(50) NOT NULL DEFAULT 'public',
  `logo_path` varchar(500) DEFAULT NULL,
  `square_logo_path` varchar(500) DEFAULT NULL,
  `favicon_path` varchar(500) DEFAULT NULL,
  `logo_alt_text` varchar(180) DEFAULT NULL,
  `primary_color` char(7) DEFAULT NULL,
  `secondary_color` char(7) DEFAULT NULL,
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `updated_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `account_business_branding_owner_unique` (`account_owner_id`),
  KEY `account_business_branding_created_by_index` (`created_by`),
  KEY `account_business_branding_updated_by_index` (`updated_by`),
  CONSTRAINT `account_business_branding_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `account_business_branding_owner_foreign` FOREIGN KEY (`account_owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `account_business_branding_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_business_branding`
--

LOCK TABLES `account_business_branding` WRITE;
/*!40000 ALTER TABLE `account_business_branding` DISABLE KEYS */;
INSERT INTO `account_business_branding` VALUES (1,1,'Tagline Testing','public','business-profiles/1/VbXdl0jWe7ntViO1W2yDbhuMdnS5KYnic7mym34S.png','business-profiles/1/kf5zR1Vz8hbak10DA8GJzXFVLFs22bvAN21TEprz.png','business-profiles/1/kp53wvGKMkEwuYAz3f7TVg3WIAs4owWnKpPJy0Dj.png','Alt Logo test testing',NULL,NULL,1,1,'2026-07-28 05:34:17','2026-07-28 05:34:17');
/*!40000 ALTER TABLE `account_business_branding` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `account_business_profiles`
--

DROP TABLE IF EXISTS `account_business_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `account_business_profiles` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `account_owner_id` bigint(20) unsigned NOT NULL,
  `business_name` varchar(180) NOT NULL,
  `business_category` varchar(120) DEFAULT NULL,
  `short_description` text DEFAULT NULL,
  `contact_email` varchar(180) DEFAULT NULL,
  `contact_phone` varchar(50) DEFAULT NULL,
  `alternate_phone` varchar(50) DEFAULT NULL,
  `website_url` varchar(255) DEFAULT NULL,
  `facebook_url` varchar(255) DEFAULT NULL,
  `address_line` varchar(255) DEFAULT NULL,
  `barangay` varchar(120) DEFAULT NULL,
  `city_municipality` varchar(120) DEFAULT NULL,
  `province` varchar(120) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `country_code` char(2) NOT NULL DEFAULT 'PH',
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `updated_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `account_business_profiles_owner_unique` (`account_owner_id`),
  KEY `account_business_profiles_email_index` (`contact_email`),
  KEY `account_business_profiles_created_by_index` (`created_by`),
  KEY `account_business_profiles_updated_by_index` (`updated_by`),
  CONSTRAINT `account_business_profiles_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `account_business_profiles_owner_foreign` FOREIGN KEY (`account_owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `account_business_profiles_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_business_profiles`
--

LOCK TABLES `account_business_profiles` WRITE;
/*!40000 ALTER TABLE `account_business_profiles` DISABLE KEYS */;
INSERT INTO `account_business_profiles` VALUES (1,1,'123','123',NULL,'mariquit.junecharles@marsu.edu.ph','01','01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'PH',1,1,'2026-07-28 05:34:51','2026-07-28 05:34:51'),(3,21,'gg','g',NULL,'mariquit.junecharles@marsu.edu.ph','42',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'PH',1,1,'2026-08-05 06:19:35','2026-08-05 06:19:35');
/*!40000 ALTER TABLE `account_business_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `account_product_trials`
--

DROP TABLE IF EXISTS `account_product_trials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `account_product_trials` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `account_owner_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  `subscription_id` bigint(20) unsigned DEFAULT NULL,
  `trial_started_at` timestamp NULL DEFAULT NULL,
  `trial_ends_at` timestamp NULL DEFAULT NULL,
  `consumed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `account_product_trials_owner_product_unique` (`account_owner_id`,`product_id`),
  KEY `account_product_trials_subscription_index` (`subscription_id`),
  KEY `account_product_trials_product_foreign` (`product_id`),
  CONSTRAINT `account_product_trials_owner_foreign` FOREIGN KEY (`account_owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `account_product_trials_product_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `account_product_trials_subscription_foreign` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_product_trials`
--

LOCK TABLES `account_product_trials` WRITE;
/*!40000 ALTER TABLE `account_product_trials` DISABLE KEYS */;
/*!40000 ALTER TABLE `account_product_trials` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_role_sidebar_items`
--

LOCK TABLES `account_role_sidebar_items` WRITE;
/*!40000 ALTER TABLE `account_role_sidebar_items` DISABLE KEYS */;
INSERT INTO `account_role_sidebar_items` VALUES (66,1,11,3,39,1,1,'2026-07-28 03:26:29','2026-07-28 03:26:29'),(67,1,11,3,40,1,1,'2026-07-28 03:26:29','2026-07-28 03:26:29'),(68,1,11,3,41,1,1,'2026-07-28 03:26:29','2026-07-28 03:26:29'),(69,1,11,1,1,1,1,'2026-07-28 07:15:53','2026-07-28 07:15:53'),(70,1,11,5,1,1,1,'2026-07-28 07:16:02','2026-07-28 07:16:02');
/*!40000 ALTER TABLE `account_role_sidebar_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `api_integrations`
--

DROP TABLE IF EXISTS `api_integrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `api_integrations` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(160) NOT NULL,
  `integration_code` varchar(100) NOT NULL,
  `provider` varchar(120) NOT NULL,
  `base_url` varchar(500) DEFAULT NULL,
  `webhook_url` varchar(500) DEFAULT NULL,
  `environment` enum('local','sandbox','production') NOT NULL DEFAULT 'sandbox',
  `status` enum('active','inactive','error') NOT NULL DEFAULT 'active',
  `scopes` longtext DEFAULT NULL,
  `secret_encrypted` longtext NOT NULL,
  `secret_last_four` varchar(4) DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `api_integrations_code_unique` (`integration_code`),
  KEY `api_integrations_status_environment_index` (`status`,`environment`),
  KEY `api_integrations_created_by_index` (`created_by`),
  CONSTRAINT `api_integrations_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `api_integrations`
--

LOCK TABLES `api_integrations` WRITE;
/*!40000 ALTER TABLE `api_integrations` DISABLE KEYS */;
/*!40000 ALTER TABLE `api_integrations` ENABLE KEYS */;
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
  UNIQUE KEY `app_features_id_product_unique` (`id`,`product_id`),
  KEY `app_features_product_status_sort_index` (`product_id`,`status`,`sort_order`),
  CONSTRAINT `app_features_product_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `app_features`
--

LOCK TABLES `app_features` WRITE;
/*!40000 ALTER TABLE `app_features` DISABLE KEYS */;
INSERT INTO `app_features` VALUES (1,11,'dashboard','Dashboard','Main Inventory dashboard.',1,10,'active','2026-07-13 02:00:57','2026-07-13 02:11:28'),(2,11,'inventory_overview','Stock Overview','Inventory health, valuation, warehouse distribution, movement, and replenishment overview.',1,20,'active','2026-07-13 02:00:57','2026-07-16 08:44:47'),(3,11,'categories','Categories','Inventory category management.',1,30,'active','2026-07-13 02:00:57','2026-07-13 02:11:28'),(4,11,'products','Products','Inventory product management.',1,40,'active','2026-07-13 02:00:57','2026-07-13 02:11:28'),(5,11,'stock_management','Stock Management','Current stock management.',1,50,'active','2026-07-13 02:00:57','2026-07-13 02:11:28'),(6,11,'stock_adjustment','Stock Adjustment','Increase, decrease or correct stock.',1,60,'active','2026-07-13 02:00:57','2026-07-13 02:11:28'),(7,11,'stock_transfer','Stock Transfer','Transfer stock between warehouses.',1,90,'active','2026-07-13 02:00:57','2026-07-13 02:11:28'),(8,11,'stock_movements','Stock Movements','View stock movement history.',1,100,'active','2026-07-13 02:00:57','2026-07-13 06:28:46'),(9,11,'branch_management','Branch Management','Manage business branches.',1,70,'active','2026-07-13 02:00:57','2026-07-13 02:11:28'),(10,11,'warehouse_management','Warehouse Management','Manage warehouse locations.',1,80,'active','2026-07-13 02:00:57','2026-07-13 02:11:28'),(11,11,'supplier_management','Supplier Management','Manage supplier records.',1,110,'active','2026-07-13 02:00:57','2026-07-14 01:41:09'),(12,11,'purchase_orders','Purchase Orders','Create and track purchase orders.',1,120,'active','2026-07-13 02:00:57','2026-07-14 01:41:09'),(13,11,'receiving','Receiving','Receive ordered inventory.',1,130,'active','2026-07-13 02:00:57','2026-07-14 01:41:09'),(14,11,'team_overview','Team Overview','View team account summaries, role distribution, and team activity.',1,140,'active','2026-07-13 02:00:57','2026-07-14 03:32:48'),(15,11,'staff_management','Team Members','Create and manage manager and staff accounts.',1,150,'active','2026-07-13 02:00:57','2026-07-14 02:43:32'),(16,11,'roles_access','Roles & Access','Manage module access for inventory team roles.',1,160,'active','2026-07-13 02:00:57','2026-07-14 02:43:32'),(33,11,'stock_issuance_terminal','Withdraw Stock','Withdraw available inventory for internal use, employee or department use, damaged, expired, lost, giveaway, and other authorized stock-out transactions.',1,55,'active','2026-07-21 06:04:47','2026-07-22 03:18:58'),(34,11,'stock_issuance_history','Withdrawal History','View posted, voided, and reversed inventory withdrawal transactions with item and audit details.',1,56,'active','2026-07-21 06:04:47','2026-07-22 03:18:58'),(35,11,'business_profile_general','Business Profile - General Information','Manage the shared business name, description, contact information, and primary address.',1,170,'active','2026-07-28 03:26:29','2026-07-28 03:26:29'),(36,11,'business_profile_branding','Business Profile - Branding','Manage the shared business logo, icon, tagline, and brand colors.',1,180,'active','2026-07-28 03:26:29','2026-07-28 03:26:29'),(37,11,'received_order_history','Received Order History','Read-only history of fully received purchase orders and their receipt records.',1,145,'active','2026-07-29 06:13:57','2026-07-29 06:13:57');
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
-- Table structure for table `feature_flags`
--

DROP TABLE IF EXISTS `feature_flags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `feature_flags` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint(20) unsigned NOT NULL,
  `flag_key` varchar(120) NOT NULL,
  `name` varchar(160) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `environment` enum('local','staging','production') NOT NULL DEFAULT 'staging',
  `is_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `rollout_percentage` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `conditions` longtext DEFAULT NULL,
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `feature_flags_product_key_environment_unique` (`product_id`,`flag_key`,`environment`),
  KEY `feature_flags_environment_enabled_index` (`environment`,`is_enabled`),
  KEY `feature_flags_created_by_index` (`created_by`),
  CONSTRAINT `feature_flags_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `feature_flags_product_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feature_flags`
--

LOCK TABLES `feature_flags` WRITE;
/*!40000 ALTER TABLE `feature_flags` DISABLE KEYS */;
/*!40000 ALTER TABLE `feature_flags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice_items`
--

DROP TABLE IF EXISTS `invoice_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `invoice_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `invoice_id` bigint(20) unsigned NOT NULL,
  `description` varchar(255) NOT NULL,
  `quantity` decimal(12,2) NOT NULL DEFAULT 1.00,
  `unit_price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `line_total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `invoice_items_invoice_index` (`invoice_id`),
  CONSTRAINT `invoice_items_invoice_foreign` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice_items`
--

LOCK TABLES `invoice_items` WRITE;
/*!40000 ALTER TABLE `invoice_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `invoice_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `invoices` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(100) NOT NULL,
  `order_id` bigint(20) unsigned DEFAULT NULL,
  `subscription_id` bigint(20) unsigned DEFAULT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned DEFAULT NULL,
  `status` enum('draft','issued','paid','overdue','void') NOT NULL DEFAULT 'draft',
  `issue_date` date NOT NULL,
  `due_date` date NOT NULL,
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `tax_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `discount_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `currency` char(3) NOT NULL DEFAULT 'PHP',
  `notes` text DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoices_number_unique` (`invoice_number`),
  KEY `invoices_status_due_index` (`status`,`due_date`),
  KEY `invoices_user_index` (`user_id`),
  KEY `invoices_order_index` (`order_id`),
  KEY `invoices_subscription_index` (`subscription_id`),
  KEY `invoices_product_index` (`product_id`),
  KEY `invoices_created_by_index` (`created_by`),
  CONSTRAINT `invoices_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoices_order_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoices_product_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoices_subscription_foreign` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoices_user_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
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
-- Table structure for table `login_activities`
--

DROP TABLE IF EXISTS `login_activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `login_activities` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `email_attempted` varchar(255) DEFAULT NULL,
  `event_type` varchar(30) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `browser` varchar(100) DEFAULT NULL,
  `platform` varchar(100) DEFAULT NULL,
  `device_type` varchar(50) DEFAULT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `occurred_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `login_activities_user_event_date_index` (`user_id`,`event_type`,`occurred_at`),
  KEY `login_activities_email_date_index` (`email_attempted`,`occurred_at`),
  KEY `login_activities_session_index` (`session_id`),
  KEY `login_activities_occurred_at_index` (`occurred_at`),
  CONSTRAINT `login_activities_user_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login_activities`
--

LOCK TABLES `login_activities` WRITE;
/*!40000 ALTER TABLE `login_activities` DISABLE KEYS */;
INSERT INTO `login_activities` VALUES (1,1,'junecharlesmariquit553@gmail.com','logout','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0','Microsoft Edge','Windows','Desktop','dai6CykT98L8JdtGj7etfaSZ3B2R81i1ef6L0NZd','2026-08-01 08:46:03','2026-08-01 08:46:03','2026-08-01 08:46:03'),(2,1,'junecharlesmariquit553@gmail.com','login_success','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0','Microsoft Edge','Windows','Desktop','i8BLdBgwo1KN7575397iRIpMbr6w2Y9FecKgGyoV','2026-08-01 08:46:13','2026-08-01 08:46:13','2026-08-01 08:46:13'),(3,1,'junecharlesmariquit553@gmail.com','login_success','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0','Microsoft Edge','Windows','Desktop','upeoUn9Oad68F6IVBvsTwolxYOXjH2mNfoS9nSoa','2026-08-01 11:33:58','2026-08-01 11:33:58','2026-08-01 11:33:58'),(4,1,'junecharlesmariquit553@gmail.com','login_success','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0','Microsoft Edge','Windows','Desktop','RTCVEbgVcWfNtpZ7nkUovLHupOuZya0Vw2po2JBy','2026-08-02 07:00:28','2026-08-02 07:00:28','2026-08-02 07:00:28'),(5,1,'junecharlesmariquit553@gmail.com','login_success','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','Google Chrome','Windows','Desktop','Qz8bXzysaeCMsgJLfRux3o7hJXAUVpmkKNVTloV0','2026-08-03 02:18:05','2026-08-03 02:18:05','2026-08-03 02:18:05'),(6,1,'junecharlesmariquit553@gmail.com','login_success','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','Google Chrome','Windows','Desktop','sW3dcXKd45494D3vhZSW4RvgQFrgvSIg1qWRBHKG','2026-08-03 05:22:27','2026-08-03 05:22:27','2026-08-03 05:22:27'),(7,1,'junecharlesmariquit553@gmail.com','logout','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','Google Chrome','Windows','Desktop','sW3dcXKd45494D3vhZSW4RvgQFrgvSIg1qWRBHKG','2026-08-03 05:48:09','2026-08-03 05:48:09','2026-08-03 05:48:09'),(8,1,'junecharlesmariquit553@gmail.com','login_success','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','Google Chrome','Windows','Desktop','VFTM6r2meozYPv5jWZGnoHp2ONUiuiF0rfGTpjXh','2026-08-03 05:48:19','2026-08-03 05:48:19','2026-08-03 05:48:19'),(9,1,'junecharlesmariquit553@gmail.com','login_success','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','Google Chrome','Windows','Desktop','SRdi0oPd2QBwX2n60gf99G22mzkCgpGcUVivSwC5','2026-08-04 03:48:00','2026-08-04 03:48:00','2026-08-04 03:48:00'),(10,1,'junecharlesmariquit553@gmail.com','logout','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','Google Chrome','Windows','Desktop','SRdi0oPd2QBwX2n60gf99G22mzkCgpGcUVivSwC5','2026-08-04 05:29:10','2026-08-04 05:29:10','2026-08-04 05:29:10'),(11,1,'junecharlesmariquit553@gmail.com','login_success','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','Google Chrome','Windows','Desktop','WO0LxRAzIntbdKqKaAduL0nK9p8n0nXoWc0hEzyF','2026-08-04 05:29:21','2026-08-04 05:29:21','2026-08-04 05:29:21'),(12,1,'junecharlesmariquit553@gmail.com','logout','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','Google Chrome','Windows','Desktop','WO0LxRAzIntbdKqKaAduL0nK9p8n0nXoWc0hEzyF','2026-08-04 05:33:28','2026-08-04 05:33:28','2026-08-04 05:33:28'),(13,1,'junecharlesmariquit553@gmail.com','login_success','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','Google Chrome','Windows','Desktop','lKJy2975i4wKiWup5hzmyP9cDTPxSuWHiDqbkpLT','2026-08-04 05:33:54','2026-08-04 05:33:54','2026-08-04 05:33:54'),(14,1,'junecharlesmariquit553@gmail.com','logout','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','Google Chrome','Windows','Desktop','lKJy2975i4wKiWup5hzmyP9cDTPxSuWHiDqbkpLT','2026-08-04 05:34:33','2026-08-04 05:34:33','2026-08-04 05:34:33'),(15,1,'junecharlesmariquit553@gmail.com','login_success','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','Google Chrome','Windows','Desktop','3mwpXo9RiiifkpUq13KidBPAA3n8WpVepVrId0Px','2026-08-04 05:34:43','2026-08-04 05:34:43','2026-08-04 05:34:43'),(16,1,'junecharlesmariquit553@gmail.com','logout','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','Google Chrome','Windows','Desktop','3mwpXo9RiiifkpUq13KidBPAA3n8WpVepVrId0Px','2026-08-04 06:42:02','2026-08-04 06:42:02','2026-08-04 06:42:02'),(17,1,'junecharlesmariquit553@gmail.com','login_success','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','Google Chrome','Windows','Desktop','KYnutoSIWiB74NhFVFmAmdRCfX9Tf1b5S2xPNvFi','2026-08-04 06:42:15','2026-08-04 06:42:15','2026-08-04 06:42:15'),(18,1,'junecharlesmariquit553@gmail.com','login_success','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','Google Chrome','Windows','Desktop','GAsvQJQAN37swTx1dxor8qU9C2I9Zdid7EfGSNTp','2026-08-04 06:45:00','2026-08-04 06:45:00','2026-08-04 06:45:00'),(19,1,'junecharlesmariquit553@gmail.com','login_success','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','Google Chrome','Windows','Desktop','aG3dyeamukcTXjfvxOnzfGrunFPvY8baCkOzZMQR','2026-08-05 02:06:39','2026-08-05 02:06:39','2026-08-05 02:06:39'),(20,1,'junecharlesmariquit553@gmail.com','login_failed','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','Google Chrome','Windows','Desktop','UbIU5N2lP8vwhsVRTvPjHQegy2IKqoAj8ugRNrw1','2026-08-06 02:22:06','2026-08-06 02:22:06','2026-08-06 02:22:06'),(21,1,'junecharlesmariquit553@gmail.com','login_success','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','Google Chrome','Windows','Desktop','MlDo55OVgezWH8V0RKZvRWfhHiPNDIUL4lyqT3mE','2026-08-06 02:22:13','2026-08-06 02:22:13','2026-08-06 02:22:13');
/*!40000 ALTER TABLE `login_activities` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (8,1,1,1,'ss','user',0,'2026-08-06 03:19:25','2026-05-07 22:42:57','2026-08-06 03:19:25'),(9,1,1,1,'k;','admin',1,NULL,'2026-08-06 03:19:32','2026-08-06 03:19:32'),(10,1,1,1,'pop[','admin',1,NULL,'2026-08-06 03:19:35','2026-08-06 03:19:35'),(11,1,1,1,'d','admin',1,NULL,'2026-08-06 03:51:57','2026-08-06 03:51:57'),(12,1,1,1,'l','admin',1,NULL,'2026-08-06 05:23:29','2026-08-06 05:23:29'),(13,1,1,1,'l','admin',1,NULL,'2026-08-06 05:23:30','2026-08-06 05:23:30'),(14,1,1,1,'l','admin',1,NULL,'2026-08-06 05:23:32','2026-08-06 05:23:32'),(15,1,1,1,'l','admin',1,NULL,'2026-08-06 05:23:33','2026-08-06 05:23:33'),(16,1,1,1,'l','admin',1,NULL,'2026-08-06 05:23:34','2026-08-06 05:23:34');
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,1,'1Welcome to JCM Web Solution','Your account is ready. You can now send inquiries and receive project updates.','system',0,'2026-04-26 18:36:33','2026-04-26 04:24:39','2026-04-26 18:36:33'),(9,1,'Payment approved','Your payment for ORD-TEST-BASIC-20260805104218-4665E466 has been approved. Subscription access is now active.','payment_approved',1,NULL,'2026-08-05 02:42:56','2026-08-05 02:42:56');
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
  `account_owner_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned DEFAULT NULL,
  `service_id` bigint(20) unsigned DEFAULT NULL,
  `plan_id` bigint(20) unsigned DEFAULT NULL,
  `plan_price_id` bigint(20) unsigned DEFAULT NULL,
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
  KEY `orders_owner_status_index` (`account_owner_id`,`status`),
  KEY `orders_plan_price_index` (`plan_price_id`),
  KEY `orders_subscription_scope_index` (`subscription_id`,`product_id`,`account_owner_id`),
  KEY `orders_plan_price_plan_foreign` (`plan_price_id`,`plan_id`),
  CONSTRAINT `fk_orders_plan_product` FOREIGN KEY (`plan_id`, `product_id`) REFERENCES `plans` (`id`, `product_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_orders_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_orders_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_orders_subscription` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `orders_account_owner_foreign` FOREIGN KEY (`account_owner_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `orders_plan_price_plan_foreign` FOREIGN KEY (`plan_price_id`, `plan_id`) REFERENCES `plan_prices` (`id`, `plan_id`) ON UPDATE CASCADE,
  CONSTRAINT `orders_subscription_scope_foreign` FOREIGN KEY (`subscription_id`, `product_id`, `account_owner_id`) REFERENCES `subscriptions` (`id`, `product_id`, `account_owner_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (18,'ORD-SUB-1-20260729145952-0LEMHD',1,1,11,NULL,12,1,'monthly',19,'downgrade',499.00,'PHP',30,'cancelled','2026-07-29 08:32:41',NULL,NULL,'[TEST RESET 2026-07-30 11:05:07] Open subscription order cancelled to allow a new plan selection.','2026-07-29 06:59:52','2026-07-30 03:05:07'),(19,'ORD-SUB-1-20260730110529-SNIK8E',1,1,11,NULL,12,1,'monthly',19,'downgrade',499.00,'PHP',30,'cancelled','2026-07-30 03:05:29',NULL,NULL,'[TEST RESET 2026-07-30 11:29:36] Open subscription order cancelled to allow a new plan selection.','2026-07-30 03:05:29','2026-07-30 03:29:36'),(20,'ORD-SUB-1-20260730112940-2NMVUC',1,1,11,NULL,12,1,'monthly',19,'downgrade',499.00,'PHP',30,'cancelled','2026-07-30 03:29:40',NULL,NULL,'[2026-07-30 11:42:04] Checkout cancelled by the account owner.','2026-07-30 03:29:40','2026-07-30 03:42:04'),(21,'ORD-SUB-1-20260730114207-TVET8L',1,1,11,NULL,13,4,'monthly',19,'renewal',1299.00,'PHP',30,'cancelled','2026-07-30 03:42:07',NULL,NULL,'[2026-07-30 11:42:24] Checkout cancelled by the account owner.','2026-07-30 03:42:07','2026-07-30 03:42:24'),(22,'ORD-SUB-1-20260730132718-9XJIXK',1,1,11,NULL,12,1,'monthly',19,'downgrade',499.00,'PHP',30,'cancelled','2026-07-30 05:27:18',NULL,NULL,'[2026-07-30 13:27:23] Checkout cancelled by the account owner.','2026-07-30 05:27:18','2026-07-30 05:27:23'),(23,'ORD-TEST-BASIC-20260805104218-4665E466',1,1,11,NULL,12,1,'monthly',19,'downgrade',499.00,'PHP',30,'verified','2026-08-05 02:42:18','2026-08-05 02:42:18','2026-08-05 02:42:56','[TEST] Manual payment submission for Basic Inventory approval testing.','2026-08-05 02:42:18','2026-08-05 02:42:56');
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
  `product_id` bigint(20) unsigned NOT NULL,
  `plan_id` bigint(20) unsigned NOT NULL,
  `feature_id` bigint(20) unsigned NOT NULL,
  `is_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `limit_value` int(10) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `plan_features_unique` (`plan_id`,`feature_id`),
  KEY `plan_features_feature_index` (`feature_id`),
  KEY `plan_features_product_plan_index` (`product_id`,`plan_id`),
  KEY `plan_features_plan_product_foreign` (`plan_id`,`product_id`),
  KEY `plan_features_feature_product_foreign` (`feature_id`,`product_id`),
  CONSTRAINT `plan_features_feature_foreign` FOREIGN KEY (`feature_id`) REFERENCES `app_features` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `plan_features_feature_product_foreign` FOREIGN KEY (`feature_id`, `product_id`) REFERENCES `app_features` (`id`, `product_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `plan_features_plan_foreign` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `plan_features_plan_product_foreign` FOREIGN KEY (`plan_id`, `product_id`) REFERENCES `plans` (`id`, `product_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plan_features`
--

LOCK TABLES `plan_features` WRITE;
/*!40000 ALTER TABLE `plan_features` DISABLE KEYS */;
INSERT INTO `plan_features` VALUES (1,11,12,3,1,NULL,'2026-07-13 02:00:58','2026-07-29 06:13:57'),(2,11,12,1,1,NULL,'2026-07-13 02:00:58','2026-07-29 06:13:57'),(3,11,12,2,1,NULL,'2026-07-13 02:00:58','2026-07-29 06:13:57'),(4,11,12,4,1,NULL,'2026-07-13 02:00:58','2026-07-29 06:13:57'),(5,11,12,6,1,NULL,'2026-07-13 02:00:58','2026-07-29 06:13:57'),(6,11,12,5,1,NULL,'2026-07-13 02:00:58','2026-07-29 06:13:57'),(7,11,12,8,0,NULL,'2026-07-13 02:00:58','2026-07-29 06:13:57'),(8,11,13,1,1,NULL,'2026-07-13 02:00:58','2026-07-29 06:13:57'),(9,11,13,2,1,NULL,'2026-07-13 02:00:58','2026-07-29 06:13:57'),(10,11,13,3,1,NULL,'2026-07-13 02:00:58','2026-07-29 06:13:57'),(11,11,13,4,1,NULL,'2026-07-13 02:00:58','2026-07-29 06:13:57'),(12,11,13,5,1,NULL,'2026-07-13 02:00:58','2026-07-29 06:13:57'),(13,11,13,6,1,NULL,'2026-07-13 02:00:58','2026-07-29 06:13:57'),(14,11,13,7,1,NULL,'2026-07-13 02:00:58','2026-07-29 06:13:57'),(15,11,13,8,1,NULL,'2026-07-13 02:00:58','2026-07-29 06:13:57'),(16,11,13,9,1,NULL,'2026-07-13 02:00:58','2026-07-29 06:13:57'),(17,11,13,10,1,NULL,'2026-07-13 02:00:58','2026-07-29 06:13:57'),(18,11,13,11,1,NULL,'2026-07-13 02:00:58','2026-07-29 06:13:57'),(19,11,13,12,1,NULL,'2026-07-13 02:00:58','2026-07-29 06:13:57'),(20,11,13,13,1,NULL,'2026-07-13 02:00:58','2026-07-29 06:13:57'),(21,11,13,14,1,NULL,'2026-07-13 02:00:58','2026-07-29 06:13:57'),(22,11,13,15,1,NULL,'2026-07-13 02:00:58','2026-07-29 06:13:57'),(23,11,13,16,1,NULL,'2026-07-13 02:00:58','2026-07-29 06:13:57'),(39,11,12,12,1,NULL,'2026-07-13 02:11:28','2026-07-29 06:13:57'),(40,11,12,13,1,NULL,'2026-07-13 02:11:28','2026-07-29 06:13:57'),(41,11,12,11,1,NULL,'2026-07-13 02:11:28','2026-07-29 06:13:57'),(43,11,12,33,1,NULL,'2026-07-21 06:04:47','2026-07-29 06:13:57'),(44,11,13,33,1,NULL,'2026-07-21 06:04:47','2026-07-29 06:13:57'),(46,11,12,34,1,NULL,'2026-07-21 06:04:47','2026-07-29 06:13:57'),(47,11,13,34,1,NULL,'2026-07-21 06:04:47','2026-07-29 06:13:57'),(48,11,12,35,1,NULL,'2026-07-28 03:26:29','2026-07-29 06:13:57'),(49,11,13,35,1,NULL,'2026-07-28 03:26:29','2026-07-29 06:13:57'),(50,11,12,36,1,NULL,'2026-07-28 03:26:29','2026-07-29 06:13:57'),(51,11,13,36,1,NULL,'2026-07-28 03:26:29','2026-07-29 06:13:57'),(55,11,12,9,0,NULL,'2026-07-28 12:07:50','2026-07-29 06:13:57'),(56,11,12,10,0,NULL,'2026-07-28 12:07:50','2026-07-29 06:13:57'),(60,11,13,37,1,NULL,'2026-07-29 06:13:57','2026-07-29 06:13:57'),(61,11,12,14,1,NULL,'2026-08-05 06:58:27','2026-08-05 06:58:27');
/*!40000 ALTER TABLE `plan_features` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plan_limits`
--

DROP TABLE IF EXISTS `plan_limits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `plan_limits` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `plan_id` bigint(20) unsigned NOT NULL,
  `limit_code` varchar(100) NOT NULL,
  `limit_value` bigint(20) unsigned DEFAULT NULL,
  `is_unlimited` tinyint(1) NOT NULL DEFAULT 0,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `plan_limits_plan_code_unique` (`plan_id`,`limit_code`),
  KEY `plan_limits_code_index` (`limit_code`),
  CONSTRAINT `plan_limits_plan_foreign` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plan_limits`
--

LOCK TABLES `plan_limits` WRITE;
/*!40000 ALTER TABLE `plan_limits` DISABLE KEYS */;
INSERT INTO `plan_limits` VALUES (1,12,'max_branches',1,0,'Basic Inventory includes one branch.','2026-07-28 12:07:50','2026-07-29 06:13:57'),(2,12,'max_warehouses',1,0,'Basic Inventory includes one warehouse.','2026-07-28 12:07:50','2026-07-29 06:13:57'),(3,12,'max_team_members',0,0,'Basic Inventory is owner-only.','2026-07-28 12:07:50','2026-07-29 06:13:57'),(4,13,'max_branches',3,0,'Premium Inventory includes up to three branches.','2026-07-28 12:07:50','2026-07-29 06:13:57'),(5,13,'max_warehouses',6,0,'Premium Inventory includes up to six warehouses.','2026-07-28 12:07:50','2026-07-29 06:13:57'),(6,13,'max_team_members',10,0,'Premium Inventory includes up to ten additional team members.','2026-07-28 12:07:50','2026-07-29 06:13:57');
/*!40000 ALTER TABLE `plan_limits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plan_prices`
--

DROP TABLE IF EXISTS `plan_prices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `plan_prices` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `plan_id` bigint(20) unsigned NOT NULL,
  `billing_interval` enum('monthly','quarterly','yearly','custom') NOT NULL DEFAULT 'monthly',
  `price` decimal(12,2) NOT NULL,
  `compare_at_price` decimal(12,2) DEFAULT NULL,
  `currency` char(3) NOT NULL DEFAULT 'PHP',
  `duration_days` int(10) unsigned NOT NULL,
  `trial_days_override` int(10) unsigned DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `status` enum('active','inactive','archived') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `plan_prices_plan_interval_currency_unique` (`plan_id`,`billing_interval`,`currency`),
  UNIQUE KEY `plan_prices_id_plan_unique` (`id`,`plan_id`),
  KEY `plan_prices_catalog_index` (`plan_id`,`status`,`sort_order`),
  CONSTRAINT `plan_prices_plan_foreign` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plan_prices`
--

LOCK TABLES `plan_prices` WRITE;
/*!40000 ALTER TABLE `plan_prices` DISABLE KEYS */;
INSERT INTO `plan_prices` VALUES (1,12,'monthly',499.00,NULL,'PHP',30,NULL,1,10,'active','2026-07-28 12:07:50','2026-07-29 06:13:57'),(2,12,'quarterly',1425.00,1497.00,'PHP',90,NULL,0,20,'active','2026-07-28 12:07:50','2026-07-29 06:13:57'),(3,12,'yearly',4990.00,5988.00,'PHP',365,NULL,0,30,'active','2026-07-28 12:07:50','2026-07-29 06:13:57'),(4,13,'monthly',1299.00,NULL,'PHP',30,NULL,1,10,'active','2026-07-28 12:07:50','2026-07-29 06:13:57'),(5,13,'quarterly',3700.00,3897.00,'PHP',90,NULL,0,20,'active','2026-07-28 12:07:50','2026-07-29 06:13:57'),(6,13,'yearly',12990.00,15588.00,'PHP',365,NULL,0,30,'active','2026-07-28 12:07:50','2026-07-29 06:13:57');
/*!40000 ALTER TABLE `plan_prices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plan_user_types`
--

DROP TABLE IF EXISTS `plan_user_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `plan_user_types` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint(20) unsigned NOT NULL,
  `plan_id` bigint(20) unsigned NOT NULL,
  `product_user_type_id` bigint(20) unsigned NOT NULL,
  `is_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `max_accounts` int(10) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `plan_user_types_plan_role_unique` (`plan_id`,`product_user_type_id`),
  KEY `plan_user_types_product_plan_index` (`product_id`,`plan_id`,`is_enabled`),
  KEY `plan_user_types_product_role_index` (`product_id`,`product_user_type_id`,`is_enabled`),
  KEY `plan_user_types_plan_product_foreign` (`plan_id`,`product_id`),
  KEY `plan_user_types_role_product_foreign` (`product_user_type_id`,`product_id`),
  CONSTRAINT `plan_user_types_plan_product_foreign` FOREIGN KEY (`plan_id`, `product_id`) REFERENCES `plans` (`id`, `product_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `plan_user_types_role_product_foreign` FOREIGN KEY (`product_user_type_id`, `product_id`) REFERENCES `product_user_types` (`id`, `product_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plan_user_types`
--

LOCK TABLES `plan_user_types` WRITE;
/*!40000 ALTER TABLE `plan_user_types` DISABLE KEYS */;
INSERT INTO `plan_user_types` VALUES (5,11,12,3,1,1,'2026-07-29 06:13:57','2026-07-29 06:13:57'),(6,11,13,1,1,NULL,'2026-07-29 06:13:57','2026-07-29 06:13:57'),(7,11,13,3,1,1,'2026-07-29 06:13:57','2026-07-29 06:13:57'),(8,11,13,5,1,NULL,'2026-07-29 06:13:57','2026-07-29 06:13:57');
/*!40000 ALTER TABLE `plan_user_types` ENABLE KEYS */;
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
INSERT INTO `plans` VALUES (9,10,'basic','Basic POS',499.00,'monthly','PHP',30,0,'Single owner POS with inventory and sales management.',0,0,0,NULL,1,NULL,1,10,'active','2026-06-09 07:03:22','2026-07-13 01:47:56'),(10,10,'business','Business POS',1299.00,'monthly','PHP',30,0,'POS with cashier, staff, and manager role-based access.',1,0,0,NULL,1,NULL,10,20,'active','2026-06-09 07:03:22','2026-07-13 01:47:56'),(11,10,'enterprise','Enterprise POS',1999.00,'monthly','PHP',30,0,'Multi branch POS with employee activity logs and audit trail.',1,1,1,365,NULL,NULL,NULL,30,'active','2026-06-09 07:03:22','2026-07-13 01:47:56'),(12,11,'solo','Basic Inventory',499.00,'monthly','PHP',30,30,'Core inventory and procurement for one owner, one branch, and one warehouse.',0,0,0,NULL,1,1,0,10,'active','2026-07-13 01:47:56','2026-07-29 06:13:57'),(13,11,'team','Premium Inventory',1299.00,'monthly','PHP',30,30,'Complete inventory operations with locations, transfers, movement history, received-order history, and team access.',1,1,0,NULL,3,6,10,20,'active','2026-07-13 01:47:56','2026-07-29 06:13:57');
/*!40000 ALTER TABLE `plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `platform_audit_logs`
--

DROP TABLE IF EXISTS `platform_audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `platform_audit_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `actor_user_id` bigint(20) unsigned DEFAULT NULL,
  `module` varchar(100) NOT NULL,
  `action` varchar(100) NOT NULL,
  `subject_type` varchar(150) DEFAULT NULL,
  `subject_id` varchar(100) DEFAULT NULL,
  `description` text NOT NULL,
  `old_values` longtext DEFAULT NULL,
  `new_values` longtext DEFAULT NULL,
  `metadata` longtext DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(1000) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `platform_audit_module_date_index` (`module`,`created_at`),
  KEY `platform_audit_actor_index` (`actor_user_id`,`created_at`),
  CONSTRAINT `platform_audit_actor_foreign` FOREIGN KEY (`actor_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platform_audit_logs`
--

LOCK TABLES `platform_audit_logs` WRITE;
/*!40000 ALTER TABLE `platform_audit_logs` DISABLE KEYS */;
INSERT INTO `platform_audit_logs` VALUES (1,1,'payment_verification','approved','App\\Models\\Transaction','8','Approved a submitted subscription payment and synchronized access.',NULL,'{\"order_id\":23,\"transaction_id\":8,\"subscription_id\":19}','{\"review_notes\":null}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','2026-08-05 02:42:56'),(2,1,'systems','provisioned','subscription','21','Provisioned JCM Inventory for mariquit.junecharles@marsu.edu.ph.',NULL,'{\"user_id\":21,\"product_id\":11,\"plan_id\":12,\"branch_id\":4,\"warehouse_id\":3}',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','2026-08-05 06:19:36'),(3,1,'system_access','updated','user_product_access','11','Updated product access assignment.','{\"id\":11,\"user_id\":19,\"product_id\":10,\"product_user_type_id\":6,\"account_owner_id\":1,\"subscription_id\":18,\"status\":\"inactive\",\"assigned_by\":1,\"joined_at\":\"2026-07-14 11:59:29\",\"last_accessed_at\":null,\"created_at\":\"2026-07-28 21:17:39\",\"updated_at\":\"2026-07-28 21:17:39\"}','{\"product_user_type_id\":\"6\",\"status\":\"removed\"}',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','2026-08-05 06:20:01'),(4,1,'system_access','updated','user_product_access','11','Updated product access assignment.','{\"id\":11,\"user_id\":19,\"product_id\":10,\"product_user_type_id\":6,\"account_owner_id\":1,\"subscription_id\":18,\"status\":\"removed\",\"assigned_by\":1,\"joined_at\":\"2026-07-14 11:59:29\",\"last_accessed_at\":null,\"created_at\":\"2026-07-28 21:17:39\",\"updated_at\":\"2026-08-05 14:20:01\"}','{\"product_user_type_id\":\"6\",\"status\":\"removed\"}',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','2026-08-05 06:20:02'),(5,1,'system_access','updated','user_product_access','11','Updated product access assignment.','{\"id\":11,\"user_id\":19,\"product_id\":10,\"product_user_type_id\":6,\"account_owner_id\":1,\"subscription_id\":18,\"status\":\"removed\",\"assigned_by\":1,\"joined_at\":\"2026-07-14 11:59:29\",\"last_accessed_at\":null,\"created_at\":\"2026-07-28 21:17:39\",\"updated_at\":\"2026-08-05 14:20:02\"}','{\"product_user_type_id\":\"6\",\"status\":\"removed\"}',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','2026-08-05 06:20:03'),(6,1,'system_access','updated','user_product_access','11','Updated product access assignment.','{\"id\":11,\"user_id\":19,\"product_id\":10,\"product_user_type_id\":6,\"account_owner_id\":1,\"subscription_id\":18,\"status\":\"removed\",\"assigned_by\":1,\"joined_at\":\"2026-07-14 11:59:29\",\"last_accessed_at\":null,\"created_at\":\"2026-07-28 21:17:39\",\"updated_at\":\"2026-08-05 14:20:03\"}','{\"product_user_type_id\":\"6\",\"status\":\"inactive\"}',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','2026-08-05 06:20:10');
/*!40000 ALTER TABLE `platform_audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `platform_permissions`
--

DROP TABLE IF EXISTS `platform_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `platform_permissions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `permission_code` varchar(100) NOT NULL,
  `name` varchar(140) NOT NULL,
  `module` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `platform_permissions_code_unique` (`permission_code`),
  KEY `platform_permissions_module_status_index` (`module`,`status`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platform_permissions`
--

LOCK TABLES `platform_permissions` WRITE;
/*!40000 ALTER TABLE `platform_permissions` DISABLE KEYS */;
INSERT INTO `platform_permissions` VALUES (1,'integrations.manage','Manage integrations','Integrations','Create, update, reveal, rotate, and delete API integrations.','active','2026-08-06 07:27:27','2026-08-06 07:27:27'),(2,'roles.manage','Manage roles and permissions','Identity','Create platform roles, permissions, and assignments.','active','2026-08-06 07:27:27','2026-08-06 07:27:27'),(3,'feature_flags.manage','Manage feature flags','Products','Create and control product feature flags.','active','2026-08-06 07:27:27','2026-08-06 07:27:27'),(4,'invoices.manage','Manage invoices','Billing','Create and control invoices.','active','2026-08-06 07:27:27','2026-08-06 07:27:27'),(5,'refunds.manage','Manage refunds','Billing','Review and process payment refunds.','active','2026-08-06 07:27:27','2026-08-06 07:27:27'),(6,'support.manage','Manage support tickets','Support','Create, assign, update, and reply to support tickets.','active','2026-08-06 07:27:27','2026-08-06 07:27:27'),(7,'system_health.view','Run system health checks','Operations','View and run platform health diagnostics.','active','2026-08-06 07:27:27','2026-08-06 07:27:27');
/*!40000 ALTER TABLE `platform_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `platform_role_permissions`
--

DROP TABLE IF EXISTS `platform_role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `platform_role_permissions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `platform_role_id` bigint(20) unsigned NOT NULL,
  `permission_id` bigint(20) unsigned NOT NULL,
  `is_allowed` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `platform_role_permissions_unique` (`platform_role_id`,`permission_id`),
  KEY `platform_role_permissions_permission_index` (`permission_id`),
  CONSTRAINT `platform_role_permissions_permission_foreign` FOREIGN KEY (`permission_id`) REFERENCES `platform_permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `platform_role_permissions_role_foreign` FOREIGN KEY (`platform_role_id`) REFERENCES `platform_roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platform_role_permissions`
--

LOCK TABLES `platform_role_permissions` WRITE;
/*!40000 ALTER TABLE `platform_role_permissions` DISABLE KEYS */;
INSERT INTO `platform_role_permissions` VALUES (1,2,3,1,'2026-08-06 07:27:27','2026-08-06 07:27:27'),(2,1,3,1,'2026-08-06 07:27:27','2026-08-06 07:27:27'),(3,2,1,1,'2026-08-06 07:27:27','2026-08-06 07:27:27'),(4,1,1,1,'2026-08-06 07:27:27','2026-08-06 07:27:27'),(5,2,4,1,'2026-08-06 07:27:27','2026-08-06 07:27:27'),(6,1,4,1,'2026-08-06 07:27:27','2026-08-06 07:27:27'),(7,2,5,1,'2026-08-06 07:27:27','2026-08-06 07:27:27'),(8,1,5,1,'2026-08-06 07:27:27','2026-08-06 07:27:27'),(9,2,2,1,'2026-08-06 07:27:27','2026-08-06 07:27:27'),(10,1,2,1,'2026-08-06 07:27:27','2026-08-06 07:27:27'),(11,2,6,1,'2026-08-06 07:27:27','2026-08-06 07:27:27'),(12,1,6,1,'2026-08-06 07:27:27','2026-08-06 07:27:27'),(13,2,7,1,'2026-08-06 07:27:27','2026-08-06 07:27:27'),(14,1,7,1,'2026-08-06 07:27:27','2026-08-06 07:27:27');
/*!40000 ALTER TABLE `platform_role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `platform_roles`
--

DROP TABLE IF EXISTS `platform_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `platform_roles` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `role_code` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_system_role` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `platform_roles_code_unique` (`role_code`),
  KEY `platform_roles_status_sort_index` (`status`,`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platform_roles`
--

LOCK TABLES `platform_roles` WRITE;
/*!40000 ALTER TABLE `platform_roles` DISABLE KEYS */;
INSERT INTO `platform_roles` VALUES (1,'super_admin','Super Administrator','Full control of the central JCM SaaS platform.',1,10,'active','2026-07-28 13:24:59','2026-07-28 13:24:59'),(2,'admin','Administrator','Administrative access to the central JCM SaaS platform.',1,20,'active','2026-07-28 13:24:59','2026-08-04 03:55:46'),(3,'user','Platform User','Standard JCM account that may access subscribed products.',1,100,'active','2026-07-28 13:24:59','2026-07-28 13:24:59');
/*!40000 ALTER TABLE `platform_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `platform_sidebar_items`
--

DROP TABLE IF EXISTS `platform_sidebar_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `platform_sidebar_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` bigint(20) unsigned DEFAULT NULL,
  `item_key` varchar(100) NOT NULL,
  `item_type` enum('link','group','heading') NOT NULL DEFAULT 'link',
  `label` varchar(150) NOT NULL,
  `route_name` varchar(200) DEFAULT NULL,
  `url_override` varchar(255) DEFAULT NULL,
  `icon_key` varchar(100) DEFAULT NULL,
  `badge` varchar(30) DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `allowed_roles` longtext DEFAULT NULL,
  `is_visible` tinyint(1) NOT NULL DEFAULT 1,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `platform_sidebar_items_key_unique` (`item_key`),
  KEY `platform_sidebar_items_parent_index` (`parent_id`),
  KEY `platform_sidebar_items_render_index` (`status`,`is_visible`,`sort_order`),
  CONSTRAINT `platform_sidebar_items_parent_foreign` FOREIGN KEY (`parent_id`) REFERENCES `platform_sidebar_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platform_sidebar_items`
--

LOCK TABLES `platform_sidebar_items` WRITE;
/*!40000 ALTER TABLE `platform_sidebar_items` DISABLE KEYS */;
INSERT INTO `platform_sidebar_items` VALUES (1,NULL,'control-center','group','Control Center',NULL,NULL,'LayoutDashboard',NULL,10,'[\"super_admin\",\"admin\"]',0,'inactive','2026-08-05 01:59:33','2026-08-05 03:04:40'),(2,NULL,'systems','group','Systems',NULL,NULL,'Boxes',NULL,20,'[\"super_admin\",\"admin\"]',1,'active','2026-08-05 01:59:33','2026-08-06 02:44:39'),(3,NULL,'platform','group','Platform',NULL,NULL,'ShieldCheck',NULL,30,'[\"super_admin\",\"admin\"]',0,'inactive','2026-08-05 01:59:33','2026-08-06 02:44:40'),(4,NULL,'commerce','group','Commerce',NULL,NULL,'ShoppingCart',NULL,40,'[\"super_admin\",\"admin\"]',0,'inactive','2026-08-05 01:59:33','2026-08-06 02:44:40'),(5,NULL,'governance','group','Governance',NULL,NULL,'ScrollText',NULL,70,'[\"super_admin\",\"admin\"]',1,'active','2026-08-05 01:59:33','2026-08-06 02:44:39'),(21,40,'dashboard','link','Main Overview','admin.dashboard',NULL,'LayoutDashboard','MAIN',10,'[\"super_admin\",\"admin\"]',1,'active','2026-08-05 02:06:10','2026-08-05 03:04:40'),(22,40,'systems-overview','link','Systems Overview','admin.systems.index',NULL,'Boxes',NULL,50,'[\"super_admin\",\"admin\"]',1,'active','2026-08-05 02:06:10','2026-08-05 03:04:40'),(23,2,'provision-account','link','Provision Account','admin.systems.provision',NULL,'UserPlus',NULL,10,'[\"super_admin\",\"admin\"]',1,'active','2026-08-05 02:06:10','2026-08-06 02:44:40'),(24,2,'system-access','link','System Access','admin.systems.access',NULL,'KeyRound',NULL,20,'[\"super_admin\",\"admin\"]',1,'active','2026-08-05 02:06:10','2026-08-06 02:44:40'),(25,2,'modules-capabilities','link','Modules & Capabilities','admin.modules.index',NULL,'Blocks',NULL,30,'[\"super_admin\",\"admin\"]',1,'active','2026-08-05 02:06:10','2026-08-06 02:44:40'),(26,2,'sidebar-controls','link','Sidebar Controls','admin.sidebar-controls.index',NULL,'PanelLeft','DYNAMIC',40,'[\"super_admin\",\"admin\"]',1,'active','2026-08-05 02:06:10','2026-08-06 02:44:40'),(27,46,'users','link','Users & Accounts','admin.users.index',NULL,'Users',NULL,10,'[\"super_admin\",\"admin\"]',1,'active','2026-08-05 02:06:10','2026-08-06 02:44:40'),(28,47,'products','link','Product Catalog','admin.products.index',NULL,'PackageSearch',NULL,10,'[\"super_admin\",\"admin\"]',1,'active','2026-08-05 02:06:10','2026-08-06 02:44:40'),(29,47,'services','link','Services','admin.services.index',NULL,'Wrench',NULL,20,'[\"super_admin\",\"admin\"]',1,'active','2026-08-05 02:06:10','2026-08-06 02:44:40'),(30,47,'plans','link','Plans & Pricing','admin.plans.index',NULL,'SlidersHorizontal',NULL,30,'[\"super_admin\",\"admin\"]',1,'active','2026-08-05 02:06:10','2026-08-06 02:44:40'),(31,47,'subscription-policies','link','Subscription Policies','admin.subscription-policies.index',NULL,'FileKey2',NULL,40,'[\"super_admin\",\"admin\"]',1,'active','2026-08-05 02:06:10','2026-08-06 02:44:40'),(32,48,'orders','link','Orders','admin.orders.index',NULL,'ReceiptText',NULL,10,'[\"super_admin\",\"admin\"]',1,'active','2026-08-05 02:06:10','2026-08-06 02:44:40'),(33,48,'subscriptions','link','Subscription Control','admin.subscriptions.index',NULL,'CreditCard','CORE',30,'[\"super_admin\",\"admin\"]',1,'active','2026-08-05 02:06:10','2026-08-06 02:44:40'),(34,48,'transactions','link','Transactions','admin.transactions.index',NULL,'CircleDollarSign',NULL,40,'[\"super_admin\",\"admin\"]',1,'active','2026-08-05 02:06:10','2026-08-06 02:44:40'),(35,48,'payment-methods','link','Payment Methods','admin.payment-methods.index',NULL,'WalletCards',NULL,50,'[\"super_admin\",\"admin\"]',1,'active','2026-08-05 02:06:10','2026-08-06 02:44:40'),(36,5,'audit-trail','link','Platform Audit Trail','admin.audit-trail.index',NULL,'ScrollText',NULL,10,'[\"super_admin\",\"admin\"]',1,'active','2026-08-05 02:06:10','2026-08-06 02:44:40'),(37,5,'website-builder','link','Website Builder','admin.website.builder.index',NULL,'Globe2',NULL,20,'[\"super_admin\",\"admin\"]',1,'active','2026-08-05 02:06:10','2026-08-06 02:44:40'),(39,4,'payment-verifications','link','Payment Verification','admin.payment-verifications.index',NULL,'BadgeCheck','VERIFY',15,'[\"super_admin\",\"admin\"]',1,'active','2026-08-05 02:32:39','2026-08-05 02:32:39'),(40,NULL,'overview','heading','Overview',NULL,NULL,'ChartNoAxesCombined',NULL,5,'[\"super_admin\",\"admin\"]',1,'active','2026-08-05 03:04:40','2026-08-05 03:04:40'),(42,40,'sales-overview','link','Sales Overview','admin.overviews.sales',NULL,'ChartColumnIncreasing',NULL,20,'[\"super_admin\",\"admin\"]',1,'active','2026-08-05 03:04:40','2026-08-05 03:04:40'),(43,40,'users-overview','link','Users Overview','admin.overviews.users',NULL,'UsersRound',NULL,30,'[\"super_admin\",\"admin\"]',1,'active','2026-08-05 03:04:40','2026-08-05 03:04:40'),(44,40,'subscriptions-overview','link','Subscriptions Overview','admin.overviews.subscriptions',NULL,'CalendarClock',NULL,40,'[\"super_admin\",\"admin\"]',1,'active','2026-08-05 03:04:40','2026-08-05 03:04:40'),(46,NULL,'accounts','group','Accounts',NULL,NULL,'UsersRound',NULL,30,'[\"super_admin\",\"admin\"]',1,'active','2026-08-06 02:44:39','2026-08-06 02:44:39'),(47,NULL,'catalog-plans','group','Catalog & Plans',NULL,NULL,'PackageSearch',NULL,40,'[\"super_admin\",\"admin\"]',1,'active','2026-08-06 02:44:39','2026-08-06 02:44:39'),(48,NULL,'sales-billing','group','Sales & Billing',NULL,NULL,'CircleDollarSign',NULL,50,'[\"super_admin\",\"admin\"]',1,'active','2026-08-06 02:44:39','2026-08-06 02:44:39'),(49,NULL,'operations','group','Operations',NULL,NULL,'LifeBuoy',NULL,60,'[\"super_admin\",\"admin\"]',1,'active','2026-08-06 02:44:39','2026-08-06 02:44:39'),(52,2,'integrations-api','link','Integrations & API','admin.integrations-api.index',NULL,'PlugZap','DEV',50,'[\"super_admin\",\"admin\"]',1,'active','2026-08-06 02:44:40','2026-08-06 07:27:27'),(53,46,'roles-permissions','link','Roles & Permissions','admin.roles-permissions.index',NULL,'ShieldUser','DEV',20,'[\"super_admin\",\"admin\"]',1,'active','2026-08-06 02:44:40','2026-08-06 07:27:27'),(54,47,'feature-flags','link','Feature Flags','admin.feature-flags.index',NULL,'Flag','DEV',50,'[\"super_admin\",\"admin\"]',1,'active','2026-08-06 02:44:40','2026-08-06 07:27:27'),(55,48,'invoices','link','Invoices','admin.invoices.index',NULL,'FileText','DEV',60,'[\"super_admin\",\"admin\"]',1,'active','2026-08-06 02:44:40','2026-08-06 07:27:27'),(56,48,'refunds','link','Refunds','admin.refunds.index',NULL,'RotateCcw','DEV',70,'[\"super_admin\",\"admin\"]',1,'active','2026-08-06 02:44:40','2026-08-06 07:27:27'),(57,49,'support-tickets','link','Support Tickets','admin.support-tickets.index',NULL,'TicketCheck','DEV',10,'[\"super_admin\",\"admin\"]',1,'active','2026-08-06 02:44:40','2026-08-06 07:27:27'),(58,49,'system-health','link','System Health','admin.system-health.index',NULL,'Activity','DEV',20,'[\"super_admin\",\"admin\"]',1,'active','2026-08-06 02:44:40','2026-08-06 07:27:27');
/*!40000 ALTER TABLE `platform_sidebar_items` ENABLE KEYS */;
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
-- Table structure for table `product_subscription_policies`
--

DROP TABLE IF EXISTS `product_subscription_policies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `product_subscription_policies` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint(20) unsigned NOT NULL,
  `default_trial_days` int(10) unsigned NOT NULL DEFAULT 0,
  `grace_period_days` int(10) unsigned NOT NULL DEFAULT 0,
  `past_due_access_mode` enum('blocked','read_only') NOT NULL DEFAULT 'read_only',
  `expired_access_mode` enum('blocked','read_only') NOT NULL DEFAULT 'read_only',
  `allow_manual_payment` tinyint(1) NOT NULL DEFAULT 1,
  `allow_auto_renew` tinyint(1) NOT NULL DEFAULT 0,
  `lock_after_expiry_days` int(10) unsigned DEFAULT 30,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_subscription_policies_product_unique` (`product_id`),
  CONSTRAINT `product_subscription_policies_product_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_subscription_policies`
--

LOCK TABLES `product_subscription_policies` WRITE;
/*!40000 ALTER TABLE `product_subscription_policies` DISABLE KEYS */;
INSERT INTO `product_subscription_policies` VALUES (1,11,30,7,'read_only','read_only',1,0,30,'active','2026-07-28 12:07:50','2026-07-29 06:13:57');
/*!40000 ALTER TABLE `product_subscription_policies` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=77 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_user_type_sidebar_items`
--

LOCK TABLES `product_user_type_sidebar_items` WRITE;
/*!40000 ALTER TABLE `product_user_type_sidebar_items` DISABLE KEYS */;
INSERT INTO `product_user_type_sidebar_items` VALUES (2,3,16,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(3,3,1,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(4,3,3,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(5,3,2,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(6,3,17,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(7,3,20,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(8,3,21,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(9,3,23,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(10,3,22,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(11,3,18,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(12,3,6,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(13,3,19,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(14,3,7,1,'2026-07-13 02:00:58','2026-07-20 04:29:27'),(15,3,9,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(16,3,8,1,'2026-07-13 02:00:58','2026-07-14 03:32:48'),(17,3,5,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(32,1,4,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(33,1,16,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(34,1,1,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(35,1,3,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(36,1,2,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(37,1,17,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(38,1,20,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(39,1,21,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(40,1,18,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(41,1,6,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(42,1,19,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(43,1,7,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(44,1,5,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(47,5,1,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(48,5,3,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(49,5,17,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(50,5,18,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(51,5,6,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(57,3,4,1,'2026-07-13 02:00:58','2026-07-13 02:11:28'),(59,3,33,1,'2026-07-20 04:29:27','2026-07-20 04:29:27'),(60,3,34,1,'2026-07-21 03:09:47','2026-07-21 03:09:47'),(61,1,34,1,'2026-07-21 03:09:47','2026-07-21 03:09:47'),(66,3,36,1,'2026-07-21 06:04:47','2026-07-21 06:04:47'),(67,1,36,1,'2026-07-21 06:04:47','2026-07-21 06:04:47'),(68,5,36,1,'2026-07-21 06:04:47','2026-07-21 06:04:47'),(69,3,37,1,'2026-07-21 06:04:47','2026-07-21 06:04:47'),(70,1,37,1,'2026-07-21 06:04:47','2026-07-21 06:04:47'),(71,5,37,1,'2026-07-21 06:04:47','2026-07-21 06:04:47'),(72,1,38,1,'2026-07-22 03:57:12','2026-07-22 03:57:12'),(73,3,38,1,'2026-07-22 03:57:12','2026-07-22 03:57:12'),(74,3,39,1,'2026-07-28 03:26:29','2026-07-28 03:26:29'),(75,3,40,1,'2026-07-28 03:26:29','2026-07-28 03:26:29'),(76,3,41,1,'2026-07-28 03:26:29','2026-07-28 03:26:29');
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
  UNIQUE KEY `product_user_types_id_product_unique` (`id`,`product_id`),
  KEY `product_user_types_user_type_index` (`user_type_id`),
  CONSTRAINT `product_user_types_product_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `product_user_types_user_type_foreign` FOREIGN KEY (`user_type_id`) REFERENCES `user_types` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_user_types`
--

LOCK TABLES `product_user_types` WRITE;
/*!40000 ALTER TABLE `product_user_types` DISABLE KEYS */;
INSERT INTO `product_user_types` VALUES (1,11,2,'Manager','active','2026-07-13 02:00:57','2026-07-13 02:11:28'),(2,10,2,'Manager','active','2026-07-13 02:00:57','2026-07-13 02:00:57'),(3,11,1,'Client / Owner','active','2026-07-13 02:00:57','2026-07-13 02:11:28'),(4,10,1,'Client / Owner','active','2026-07-13 02:00:57','2026-07-13 02:00:57'),(5,11,3,'Staff','active','2026-07-13 02:00:57','2026-07-13 02:11:28'),(6,10,3,'Staff','active','2026-07-13 02:00:57','2026-07-13 02:00:57'),(9,10,5,'Cashier','active','2026-07-28 13:17:39','2026-07-28 13:17:39');
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
-- Table structure for table `refunds`
--

DROP TABLE IF EXISTS `refunds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `refunds` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `refund_code` varchar(100) NOT NULL,
  `transaction_id` bigint(20) unsigned DEFAULT NULL,
  `order_id` bigint(20) unsigned DEFAULT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `currency` char(3) NOT NULL DEFAULT 'PHP',
  `reason` text NOT NULL,
  `status` enum('requested','approved','rejected','processing','refunded','cancelled') NOT NULL DEFAULT 'requested',
  `requested_by` bigint(20) unsigned DEFAULT NULL,
  `reviewed_by` bigint(20) unsigned DEFAULT NULL,
  `processed_by` bigint(20) unsigned DEFAULT NULL,
  `requested_at` timestamp NULL DEFAULT current_timestamp(),
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `admin_notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `refunds_code_unique` (`refund_code`),
  KEY `refunds_status_created_index` (`status`,`created_at`),
  KEY `refunds_transaction_index` (`transaction_id`),
  KEY `refunds_order_index` (`order_id`),
  KEY `refunds_user_index` (`user_id`),
  KEY `refunds_requested_by_index` (`requested_by`),
  KEY `refunds_reviewed_by_index` (`reviewed_by`),
  KEY `refunds_processed_by_index` (`processed_by`),
  CONSTRAINT `refunds_order_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `refunds_processed_by_foreign` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `refunds_requested_by_foreign` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `refunds_reviewed_by_foreign` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `refunds_transaction_foreign` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `refunds_user_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refunds`
--

LOCK TABLES `refunds` WRITE;
/*!40000 ALTER TABLE `refunds` DISABLE KEYS */;
/*!40000 ALTER TABLE `refunds` ENABLE KEYS */;
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
INSERT INTO `sessions` VALUES ('DCHehZAxBX4VgHaobqHkPaiXtqvDQgfXE44zcfAV',1,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','YTo0OntzOjY6Il90b2tlbiI7czo0MDoiU2U2a3k1RHBqOUZmOXdFbERFYzRDbVdJQ0lHRHE3MTZBaTAwY0c1ciI7czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MTtzOjk6Il9wcmV2aW91cyI7YToyOntzOjM6InVybCI7czo0NDoiaHR0cDovLzEyNy4wLjAuMTo4MDAwL2FkbWluL2ludGVncmF0aW9ucy1hcGkiO3M6NToicm91dGUiO3M6Mjg6ImFkbWluLmludGVncmF0aW9ucy1hcGkuaW5kZXgiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1786006213),('MlDo55OVgezWH8V0RKZvRWfhHiPNDIUL4lyqT3mE',1,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','YTo1OntzOjY6Il90b2tlbiI7czo0MDoibHl4NklaeDZZaWgzdHNDaGRyMlJRc2dXUUFwTEI1QkhlZWw3QnFpVCI7czozOiJ1cmwiO2E6MDp7fXM6OToiX3ByZXZpb3VzIjthOjI6e3M6MzoidXJsIjtzOjQzOiJodHRwOi8vMTI3LjAuMC4xOjgwMDAvYWRtaW4vbWVzc2FnZXM/cGFnZT0xIjtzOjU6InJvdXRlIjtzOjIwOiJhZG1pbi5tZXNzYWdlcy5pbmRleCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtpOjE7fQ==',1785995784);
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
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sidebar_items`
--

LOCK TABLES `sidebar_items` WRITE;
/*!40000 ALTER TABLE `sidebar_items` DISABLE KEYS */;
INSERT INTO `sidebar_items` VALUES (1,11,NULL,1,'dashboard','overview','link','Main Dashboard','dashboard','/dashboard','LayoutDashboard','TEST',5,10,1,1,'active','2026-07-13 02:00:58','2026-07-23 05:58:25'),(2,11,NULL,2,'inventory-overview','overview','link','Stock Overview','inventory.overview','/inventory/overview','BarChart3','TEST',5,20,1,1,'active','2026-07-13 02:00:58','2026-07-23 05:58:25'),(3,11,NULL,NULL,'inventory-group','management','group','Inventory',NULL,NULL,'Boxes','TEST',5,10,1,1,'active','2026-07-13 02:00:58','2026-07-23 05:58:25'),(4,11,38,9,'branches','management','link','Branches','branches.index','/locations/branches','Building2',NULL,NULL,10,1,1,'active','2026-07-13 02:00:58','2026-07-24 05:57:07'),(5,11,38,10,'warehouses','management','link','Warehouses','warehouses.index','/locations/warehouses','Warehouse',NULL,NULL,20,1,1,'active','2026-07-13 02:00:58','2026-07-24 05:57:01'),(6,11,3,8,'stock-movements','management','link','Stock Movements','inventory.stock-movements.index','/inventory/stock-movements','History',NULL,NULL,60,1,1,'active','2026-07-13 02:00:58','2026-07-29 06:13:57'),(7,11,NULL,NULL,'suppliers-group','management','group','Procurement',NULL,NULL,'ShoppingCart','TEST',5,30,1,1,'active','2026-07-13 02:00:58','2026-07-23 05:58:25'),(8,11,NULL,14,'team-overview','overview','link','Team Overview','team.overview','/team/overview','Users','TEST',5,30,1,1,'active','2026-07-13 02:00:58','2026-07-23 05:58:25'),(9,11,NULL,NULL,'team-group','management','group','Team Management',NULL,NULL,'Users','TEST',5,40,1,1,'active','2026-07-13 02:00:58','2026-07-23 05:58:25'),(16,11,3,3,'categories','management','link','Categories','inventory.categories.index','/inventory/categories','Tags',NULL,NULL,10,1,1,'active','2026-07-13 02:00:58','2026-07-22 03:57:12'),(17,11,3,4,'products','management','link','Products','inventory.products.index','/inventory/products','Package2',NULL,NULL,20,1,1,'active','2026-07-13 02:00:58','2026-07-22 03:57:12'),(18,11,3,5,'stock-management','management','link','Stock Management','inventory.stocks.index','/inventory/stocks','Boxes',NULL,NULL,30,1,1,'active','2026-07-13 02:00:58','2026-07-22 03:57:12'),(19,11,7,11,'suppliers','management','link','Suppliers','suppliers.index','/suppliers','Truck',NULL,NULL,10,1,1,'active','2026-07-13 02:00:58','2026-07-22 03:57:12'),(20,11,7,12,'purchase-orders','management','link','Purchase Orders','suppliers.purchase-orders.index','/suppliers/purchase-orders','ClipboardCheck',NULL,NULL,20,1,1,'active','2026-07-13 02:00:58','2026-07-22 03:57:12'),(21,11,7,13,'receiving','management','link','Receiving','suppliers.receiving.index','/suppliers/receiving','PackageCheck',NULL,NULL,40,1,1,'active','2026-07-13 02:00:58','2026-07-22 03:57:12'),(22,11,9,15,'staff-accounts','management','link','Team Members','team.members.index','/team/members','Users',NULL,NULL,10,1,1,'active','2026-07-13 02:00:58','2026-07-22 03:57:12'),(23,11,9,16,'roles-access','management','link','Roles & Access','team.roles.index','/team/roles','UserCog',NULL,NULL,20,1,1,'active','2026-07-13 02:00:58','2026-07-22 03:57:12'),(33,11,7,12,'purchase-approvals','management','link','Purchase Approvals','suppliers.purchase-approvals.index','/suppliers/purchase-approvals','ClipboardCheck',NULL,NULL,30,1,1,'active','2026-07-20 04:29:27','2026-07-22 03:57:12'),(34,11,7,37,'received-orders','management','link','Received Orders','procurement.received-orders.index','/procurement/received-orders','History',NULL,NULL,50,1,1,'active','2026-07-21 03:09:47','2026-07-29 06:13:57'),(36,11,3,33,'stock-issuance-terminal','management','link','Withdraw Stock','inventory.withdraw.index','/inventory/withdraw','PackageMinus',NULL,NULL,40,1,1,'active','2026-07-21 06:04:47','2026-07-29 06:13:57'),(37,11,3,34,'stock-issuance-history','management','link','Withdrawal History','inventory.history.index','/inventory/history','History',NULL,NULL,50,1,1,'active','2026-07-21 06:04:47','2026-07-29 06:13:57'),(38,11,NULL,NULL,'locations-group','management','group','Locations',NULL,NULL,'MapPin','TEST',5,20,1,1,'active','2026-07-22 03:57:12','2026-07-23 05:58:25'),(39,11,NULL,NULL,'business-profile-group','management','group','Business Profile',NULL,NULL,'Building2','TEST',5,50,1,1,'active','2026-07-28 03:26:29','2026-07-28 07:11:42'),(40,11,39,35,'business-profile-general','management','link','General Information','business-profile.general.index','/management/business-profile/general','FileText',NULL,NULL,10,1,1,'active','2026-07-28 03:26:29','2026-07-28 03:26:29'),(41,11,39,36,'business-profile-branding','management','link','Branding','business-profile.branding.index','/management/business-profile/branding','Image',NULL,NULL,20,1,1,'active','2026-07-28 03:26:29','2026-07-28 03:26:29');
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
  `plan_price_id` bigint(20) unsigned DEFAULT NULL,
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
  KEY `subscription_cycles_plan_price_index` (`plan_price_id`),
  KEY `subscription_cycles_plan_price_plan_foreign` (`plan_price_id`,`plan_id`),
  CONSTRAINT `subscription_cycles_order_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `subscription_cycles_plan_foreign` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `subscription_cycles_plan_price_plan_foreign` FOREIGN KEY (`plan_price_id`, `plan_id`) REFERENCES `plan_prices` (`id`, `plan_id`) ON UPDATE CASCADE,
  CONSTRAINT `subscription_cycles_subscription_foreign` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `subscription_cycles_transaction_foreign` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription_cycles`
--

LOCK TABLES `subscription_cycles` WRITE;
/*!40000 ALTER TABLE `subscription_cycles` DISABLE KEYS */;
INSERT INTO `subscription_cycles` VALUES (1,18,9,NULL,NULL,NULL,1,'monthly','expired','2026-06-09','2026-07-09',499.00,'PHP','2026-06-09 00:00:00','2026-07-09 23:59:59','2026-06-09 07:47:30','2026-07-13 01:47:56'),(2,19,13,6,NULL,NULL,1,'yearly','expired','2026-07-28','2026-07-28',0.00,'PHP','2026-07-13 02:33:41','2026-07-29 00:55:13','2026-07-13 02:33:41','2026-07-29 00:55:13'),(3,19,13,4,NULL,NULL,2,'monthly','expired','2026-07-29','2026-07-28',1299.00,'PHP','2026-07-29 00:56:30','2026-07-29 01:01:30','2026-07-29 00:56:30','2026-07-29 01:01:30'),(4,19,13,4,NULL,NULL,3,'monthly','expired','2026-07-29','2026-07-28',1299.00,'PHP','2026-07-29 01:25:28','2026-07-29 01:47:36','2026-07-29 01:25:28','2026-07-29 01:47:36'),(5,19,13,4,NULL,NULL,4,'monthly','expired','2026-07-29','2026-07-29',1299.00,'PHP','2026-07-29 07:15:29','2026-07-30 03:42:50','2026-07-29 06:25:33','2026-07-30 03:42:50'),(6,19,13,4,NULL,NULL,5,'monthly','expired','2026-07-30','2026-07-29',1299.00,'PHP','2026-07-30 05:26:46','2026-07-30 05:29:43','2026-07-30 05:26:46','2026-07-30 05:29:43'),(7,19,13,4,NULL,NULL,6,'monthly','expired','2026-07-30','2026-07-29',1299.00,'PHP','2026-07-30 05:42:26','2026-07-30 05:42:54','2026-07-30 05:37:59','2026-07-30 05:42:54'),(8,19,13,4,NULL,NULL,7,'monthly','expired','2026-07-30','2026-07-29',1299.00,'PHP','2026-07-30 06:31:28','2026-07-30 08:36:39','2026-07-30 06:31:28','2026-07-30 08:36:39');
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
  `order_id` bigint(20) unsigned DEFAULT NULL,
  `transaction_id` bigint(20) unsigned DEFAULT NULL,
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
  KEY `subscription_events_order_index` (`order_id`),
  KEY `subscription_events_transaction_index` (`transaction_id`),
  CONSTRAINT `subscription_events_actor_foreign` FOREIGN KEY (`actor_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `subscription_events_new_plan_foreign` FOREIGN KEY (`new_plan_id`) REFERENCES `plans` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `subscription_events_old_plan_foreign` FOREIGN KEY (`old_plan_id`) REFERENCES `plans` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `subscription_events_order_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `subscription_events_subscription_foreign` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `subscription_events_transaction_foreign` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription_events`
--

LOCK TABLES `subscription_events` WRITE;
/*!40000 ALTER TABLE `subscription_events` DISABLE KEYS */;
INSERT INTO `subscription_events` VALUES (1,18,1,NULL,NULL,'created',NULL,9,NULL,'active','Migrated from the original JCM SaaS subscription.',NULL,'2026-06-09 07:47:30'),(2,18,NULL,NULL,NULL,'expired',9,9,'active','expired','Automatically expired because its end date passed.',NULL,'2026-07-09 23:59:59'),(3,19,1,NULL,NULL,'activated',NULL,13,'pending','active','JCM Inventory development access activated.',NULL,'2026-07-13 02:33:41'),(4,19,1,NULL,NULL,'activated',NULL,13,NULL,'active','Comped Inventory development subscription activated.','{\"source\": \"manual-development-injection\", \"comped\": true}','2026-07-28 13:41:53'),(5,19,1,NULL,NULL,'expired',13,13,'active','expired','Inventory subscription expired manually for middleware testing.','{\"source\": \"manual-test\", \"test_case\": \"expired-subscription\"}','2026-07-29 00:55:13'),(6,19,1,NULL,NULL,'renewed',13,13,'expired','active','Team monthly subscription restored manually for development testing.','{\"source\": \"manual-test\", \"billing_interval\": \"monthly\", \"catalog_price\": 1299.00}','2026-07-29 00:56:30'),(7,19,1,NULL,NULL,'renewed',13,13,'expired','active','Team monthly subscription restored manually for development testing.','{\"source\": \"manual-test\", \"billing_interval\": \"monthly\", \"catalog_price\": 1299.00}','2026-07-29 01:25:28'),(8,19,1,NULL,NULL,'downgraded',13,12,'expired','active','User 1 switched to Basic Inventory monthly for development testing.','{\"source\": \"manual-test\", \"test_case\": \"basic-inventory-plan\", \"billing_interval\": \"monthly\", \"catalog_price\": 499.00, \"non_owner_memberships\": \"set-inactive\"}','2026-07-29 06:25:33'),(9,19,1,NULL,NULL,'renewed',13,13,'expired','active','Team monthly subscription restored manually for development testing.','{\"source\": \"manual-test\", \"billing_interval\": \"monthly\", \"catalog_price\": 1299.00}','2026-07-29 07:15:29'),(10,19,1,NULL,NULL,'renewed',13,13,'expired','active','Team monthly subscription restored manually for development testing.','{\"source\": \"manual-test\", \"billing_interval\": \"monthly\", \"catalog_price\": 1299.00}','2026-07-30 05:26:46'),(11,19,1,NULL,NULL,'downgraded',13,12,'expired','active','User 1 switched to Basic Inventory monthly for development testing.','{\"source\": \"manual-test\", \"test_case\": \"basic-inventory-plan\", \"billing_interval\": \"monthly\", \"catalog_price\": 499.00, \"non_owner_memberships\": \"set-inactive\"}','2026-07-30 05:37:59'),(12,19,1,NULL,NULL,'renewed',13,13,'expired','active','Team monthly subscription restored manually for development testing.','{\"source\": \"manual-test\", \"billing_interval\": \"monthly\", \"catalog_price\": 1299.00}','2026-07-30 05:42:27'),(13,19,1,NULL,NULL,'renewed',13,13,'expired','active','Team monthly subscription restored manually for development testing.','{\"source\": \"manual-test\", \"billing_interval\": \"monthly\", \"catalog_price\": 1299.00}','2026-07-30 06:31:28'),(14,19,1,23,8,'downgraded',13,12,'expired','active',NULL,'{\"source\":\"flagship_manual_payment_verification\",\"amount_matches\":true}','2026-08-05 02:42:56'),(16,21,1,NULL,NULL,'activated',NULL,12,NULL,'active','Provisioned from JCM Flagship Administration.','{\"source\":\"systems_provisioner\"}','2026-08-05 06:19:35');
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
  `account_owner_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  `plan_id` bigint(20) unsigned NOT NULL,
  `plan_price_id` bigint(20) unsigned DEFAULT NULL,
  `subscription_code` varchar(100) NOT NULL,
  `subscription_type` enum('trial','monthly','quarterly','yearly','custom') NOT NULL DEFAULT 'trial',
  `status` enum('pending','trial','active','past_due','grace_period','expired','cancelled','suspended','locked') NOT NULL DEFAULT 'pending',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `trial_ends_at` timestamp NULL DEFAULT NULL,
  `current_period_start` timestamp NULL DEFAULT NULL,
  `current_period_end` timestamp NULL DEFAULT NULL,
  `grace_ends_at` timestamp NULL DEFAULT NULL,
  `next_billing_at` timestamp NULL DEFAULT NULL,
  `duration_days` int(11) NOT NULL DEFAULT 0,
  `amount` decimal(10,2) DEFAULT NULL,
  `currency` char(3) NOT NULL DEFAULT 'PHP',
  `auto_renew` tinyint(1) NOT NULL DEFAULT 0,
  `cancel_at_period_end` tinyint(1) NOT NULL DEFAULT 0,
  `activated_at` timestamp NULL DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `cancellation_reason` varchar(500) DEFAULT NULL,
  `ended_at` timestamp NULL DEFAULT NULL,
  `last_payment_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `live_scope_key` varchar(100) GENERATED ALWAYS AS (case when `status` in ('pending','trial','active','past_due','grace_period','suspended','locked') then concat(`account_owner_id`,':',`product_id`) else NULL end) STORED,
  PRIMARY KEY (`id`),
  UNIQUE KEY `subscription_code` (`subscription_code`),
  UNIQUE KEY `subscriptions_id_product_owner_unique` (`id`,`product_id`,`account_owner_id`),
  UNIQUE KEY `subscriptions_live_scope_unique` (`live_scope_key`),
  KEY `fk_subscriptions_user` (`user_id`),
  KEY `fk_subscriptions_product` (`product_id`),
  KEY `idx_subscriptions_plan_id` (`plan_id`),
  KEY `subscriptions_plan_product_index` (`plan_id`,`product_id`),
  KEY `subscriptions_user_product_status_index` (`user_id`,`product_id`,`status`),
  KEY `subscriptions_status_end_date_index` (`status`,`end_date`),
  KEY `subscriptions_owner_product_status_index` (`account_owner_id`,`product_id`,`status`),
  KEY `subscriptions_plan_price_index` (`plan_price_id`),
  KEY `subscriptions_plan_price_plan_foreign` (`plan_price_id`,`plan_id`),
  CONSTRAINT `fk_subscriptions_plan_product` FOREIGN KEY (`plan_id`, `product_id`) REFERENCES `plans` (`id`, `product_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_subscriptions_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_subscriptions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `subscriptions_account_owner_foreign` FOREIGN KEY (`account_owner_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `subscriptions_plan_price_plan_foreign` FOREIGN KEY (`plan_price_id`, `plan_id`) REFERENCES `plan_prices` (`id`, `plan_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscriptions`
--

LOCK TABLES `subscriptions` WRITE;
/*!40000 ALTER TABLE `subscriptions` DISABLE KEYS */;
INSERT INTO `subscriptions` VALUES (18,1,1,10,9,NULL,'SUB-1780991250','monthly','expired','2026-06-09','2026-07-09',NULL,'2026-06-08 16:00:00','2026-07-09 15:59:59',NULL,NULL,30,499.00,'PHP',0,0,'2026-06-09 00:00:00',NULL,NULL,'2026-07-09 23:59:59',NULL,'Basic POS subscription for testing','2026-06-09 07:47:30','2026-07-28 11:37:28',NULL),(19,1,1,11,12,1,'SUB-INV-DEV-1-1783910021','monthly','active','2026-08-05','2026-09-04',NULL,'2026-08-05 02:42:56','2026-09-04 02:42:56',NULL,'2026-09-04 02:42:56',30,499.00,'PHP',0,0,'2026-07-30 06:31:28',NULL,NULL,NULL,'2026-08-05 02:42:56','Expired manually for JCM Inventory subscription testing.','2026-07-13 02:33:41','2026-08-05 02:42:56','1:11'),(21,21,21,11,12,1,'SUB-20260805141935-JCJIRJ','monthly','active','2026-08-05','2026-09-04',NULL,'2026-08-05 06:19:35','2026-09-04 06:19:35',NULL,NULL,30,499.00,'PHP',0,0,'2026-08-05 06:19:35',NULL,NULL,NULL,NULL,NULL,'2026-08-05 06:19:35','2026-08-05 06:19:35','21:11');
/*!40000 ALTER TABLE `subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `support_ticket_replies`
--

DROP TABLE IF EXISTS `support_ticket_replies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `support_ticket_replies` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `ticket_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `sender_type` enum('user','admin','system') NOT NULL DEFAULT 'admin',
  `message` text NOT NULL,
  `is_internal` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `support_ticket_replies_ticket_index` (`ticket_id`,`created_at`),
  KEY `support_ticket_replies_user_index` (`user_id`),
  CONSTRAINT `support_ticket_replies_ticket_foreign` FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `support_ticket_replies_user_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `support_ticket_replies`
--

LOCK TABLES `support_ticket_replies` WRITE;
/*!40000 ALTER TABLE `support_ticket_replies` DISABLE KEYS */;
/*!40000 ALTER TABLE `support_ticket_replies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `support_tickets`
--

DROP TABLE IF EXISTS `support_tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `support_tickets` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `ticket_code` varchar(100) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `subject` varchar(180) NOT NULL,
  `category` varchar(80) NOT NULL DEFAULT 'general',
  `priority` enum('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
  `status` enum('open','in_progress','waiting_customer','resolved','closed') NOT NULL DEFAULT 'open',
  `assigned_to` bigint(20) unsigned DEFAULT NULL,
  `last_reply_at` timestamp NULL DEFAULT NULL,
  `closed_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `support_tickets_code_unique` (`ticket_code`),
  KEY `support_tickets_queue_index` (`status`,`priority`,`last_reply_at`),
  KEY `support_tickets_user_index` (`user_id`),
  KEY `support_tickets_assigned_to_index` (`assigned_to`),
  KEY `support_tickets_created_by_index` (`created_by`),
  CONSTRAINT `support_tickets_assigned_to_foreign` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `support_tickets_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `support_tickets_user_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `support_tickets`
--

LOCK TABLES `support_tickets` WRITE;
/*!40000 ALTER TABLE `support_tickets` DISABLE KEYS */;
/*!40000 ALTER TABLE `support_tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_health_snapshots`
--

DROP TABLE IF EXISTS `system_health_snapshots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `system_health_snapshots` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `overall_status` enum('healthy','degraded','critical') NOT NULL,
  `checks` longtext NOT NULL,
  `response_time_ms` int(10) unsigned NOT NULL DEFAULT 0,
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `system_health_status_date_index` (`overall_status`,`created_at`),
  KEY `system_health_created_by_index` (`created_by`),
  CONSTRAINT `system_health_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_health_snapshots`
--

LOCK TABLES `system_health_snapshots` WRITE;
/*!40000 ALTER TABLE `system_health_snapshots` DISABLE KEYS */;
/*!40000 ALTER TABLE `system_health_snapshots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_provisioning_logs`
--

DROP TABLE IF EXISTS `system_provisioning_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `system_provisioning_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `account_owner_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  `plan_id` bigint(20) unsigned DEFAULT NULL,
  `subscription_id` bigint(20) unsigned DEFAULT NULL,
  `provisioned_by` bigint(20) unsigned DEFAULT NULL,
  `status` enum('pending','completed','failed','rolled_back') NOT NULL DEFAULT 'pending',
  `business_name` varchar(180) NOT NULL,
  `branch_id` bigint(20) unsigned DEFAULT NULL,
  `warehouse_id` bigint(20) unsigned DEFAULT NULL,
  `details` longtext DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `system_provisioning_owner_index` (`account_owner_id`,`product_id`),
  KEY `system_provisioning_status_index` (`status`,`created_at`),
  KEY `system_provisioning_product_foreign` (`product_id`),
  KEY `system_provisioning_plan_foreign` (`plan_id`),
  KEY `system_provisioning_subscription_foreign` (`subscription_id`),
  KEY `system_provisioning_actor_foreign` (`provisioned_by`),
  CONSTRAINT `system_provisioning_actor_foreign` FOREIGN KEY (`provisioned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `system_provisioning_owner_foreign` FOREIGN KEY (`account_owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `system_provisioning_plan_foreign` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `system_provisioning_product_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `system_provisioning_subscription_foreign` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_provisioning_logs`
--

LOCK TABLES `system_provisioning_logs` WRITE;
/*!40000 ALTER TABLE `system_provisioning_logs` DISABLE KEYS */;
INSERT INTO `system_provisioning_logs` VALUES (1,21,11,12,21,1,'completed','gg',4,3,'{\"access_id\":21,\"product_code\":\"JCM-INVENTORY-001\"}',NULL,'2026-08-05 06:19:35','2026-08-05 06:19:35');
/*!40000 ALTER TABLE `system_provisioning_logs` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES (6,'TXN-SUB-20260729163254-X9USV2HL',18,1,4,NULL,NULL,NULL,499.00,'subscription-payments/1/rPIvrPlEFujqpFZNboE6AHjFKCfHGRBwxltk4l1r.jpg','rejected','2026-07-29 08:32:54',NULL,NULL,NULL,'[TEST RESET 2026-07-30 11:05:07] Payment attempt closed to allow a new subscription checkout.',NULL,'2026-07-29 08:32:54','2026-07-30 03:05:07'),(7,'TXN-SUB-20260730110651-HBQYUTUL',19,1,4,NULL,NULL,NULL,499.00,'subscription-payments/1/ChEzyeGtSgRewilJ3ymxo6mWMO2UjyqfTnWHYCS4.jpg','rejected','2026-07-30 03:06:51',NULL,NULL,NULL,'[TEST RESET 2026-07-30 11:29:36] Payment attempt closed to allow a new subscription checkout.',NULL,'2026-07-30 03:06:51','2026-07-30 03:29:36'),(8,'TXN-TEST-BASIC-20260805104218-4665E466',23,1,4,'TEST-GCASH-20260805104218','June Charles Mariquit',NULL,499.00,'subscription-payments/1/ChEzyeGtSgRewilJ3ymxo6mWMO2UjyqfTnWHYCS4.jpg','verified','2026-08-05 02:42:18','2026-08-05 02:42:18','2026-08-05 02:42:56',NULL,'[TEST] Submitted payment awaiting manual administrator verification.',1,'2026-08-05 02:42:18','2026-08-05 02:42:56');
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_legacy_access_archive`
--

DROP TABLE IF EXISTS `user_legacy_access_archive`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_legacy_access_archive` (
  `user_id` bigint(20) unsigned NOT NULL,
  `legacy_role` varchar(50) DEFAULT NULL,
  `legacy_client_id` bigint(20) unsigned DEFAULT NULL,
  `legacy_branch_id` bigint(20) unsigned DEFAULT NULL,
  `legacy_system_used` varchar(100) DEFAULT NULL,
  `archived_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`user_id`),
  CONSTRAINT `user_legacy_access_archive_user_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_legacy_access_archive`
--

LOCK TABLES `user_legacy_access_archive` WRITE;
/*!40000 ALTER TABLE `user_legacy_access_archive` DISABLE KEYS */;
INSERT INTO `user_legacy_access_archive` VALUES (1,'client',NULL,NULL,'pos','2026-07-28 13:24:59'),(7,'admin',NULL,NULL,NULL,'2026-07-28 13:24:59'),(12,'cashier',1,1,'pos','2026-07-28 13:24:59'),(13,'manager',1,1,'pos','2026-07-28 13:24:59'),(14,'manager',1,1,'pos','2026-07-28 13:24:59'),(15,'staff',1,1,'pos','2026-07-28 13:24:59'),(16,'staff',1,1,'pos','2026-07-28 13:24:59'),(17,'cashier',1,1,'pos','2026-07-28 13:24:59'),(18,'cashier',1,1,'pos','2026-07-28 13:24:59'),(19,'staff',1,3,NULL,'2026-07-28 13:24:59');
/*!40000 ALTER TABLE `user_legacy_access_archive` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_platform_roles`
--

DROP TABLE IF EXISTS `user_platform_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_platform_roles` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `platform_role_id` bigint(20) unsigned NOT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `assigned_by` bigint(20) unsigned DEFAULT NULL,
  `assigned_at` timestamp NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_platform_roles_user_role_unique` (`user_id`,`platform_role_id`),
  KEY `user_platform_roles_role_status_index` (`platform_role_id`,`status`),
  KEY `user_platform_roles_assigned_by_index` (`assigned_by`),
  CONSTRAINT `user_platform_roles_assigned_by_foreign` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `user_platform_roles_role_foreign` FOREIGN KEY (`platform_role_id`) REFERENCES `platform_roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_platform_roles_user_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_platform_roles`
--

LOCK TABLES `user_platform_roles` WRITE;
/*!40000 ALTER TABLE `user_platform_roles` DISABLE KEYS */;
INSERT INTO `user_platform_roles` VALUES (1,1,3,0,'inactive',NULL,'2026-04-13 21:58:39','2026-07-28 13:24:59','2026-08-05 02:06:09'),(2,7,2,1,'active',NULL,'2026-04-13 21:58:39','2026-07-28 13:24:59','2026-07-28 13:24:59'),(3,12,3,1,'active',1,'2026-05-29 18:52:57','2026-07-28 13:24:59','2026-07-28 13:24:59'),(4,13,3,1,'active',1,'2026-06-05 01:41:18','2026-07-28 13:24:59','2026-07-28 13:24:59'),(5,14,3,1,'active',1,'2026-06-05 01:41:18','2026-07-28 13:24:59','2026-07-28 13:24:59'),(6,15,3,1,'active',1,'2026-06-05 01:41:18','2026-07-28 13:24:59','2026-07-28 13:24:59'),(7,16,3,1,'active',1,'2026-06-05 01:41:18','2026-07-28 13:24:59','2026-07-28 13:24:59'),(8,17,3,1,'active',1,'2026-06-05 01:43:20','2026-07-28 13:24:59','2026-07-28 13:24:59'),(9,18,3,1,'active',1,'2026-05-29 18:52:57','2026-07-28 13:24:59','2026-07-28 13:24:59'),(10,19,3,1,'active',1,'2026-07-14 03:59:29','2026-07-28 13:24:59','2026-07-28 13:24:59'),(11,1,2,1,'active',1,'2026-08-05 02:06:10','2026-08-04 03:55:46','2026-08-05 02:06:10'),(18,21,3,1,'active',1,'2026-08-05 06:19:35','2026-08-05 06:19:35','2026-08-05 06:19:35');
/*!40000 ALTER TABLE `user_platform_roles` ENABLE KEYS */;
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
  `last_accessed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_product_access_context_unique` (`user_id`,`product_id`,`account_owner_id`),
  KEY `user_product_access_product_role_index` (`product_id`,`product_user_type_id`,`status`),
  KEY `user_product_access_owner_index` (`account_owner_id`,`product_id`,`status`),
  KEY `user_product_access_subscription_index` (`subscription_id`),
  KEY `user_product_access_product_user_type_foreign` (`product_user_type_id`),
  KEY `user_product_access_assigned_by_foreign` (`assigned_by`),
  KEY `user_product_access_role_product_scope_foreign` (`product_user_type_id`,`product_id`),
  KEY `user_product_access_subscription_scope_foreign` (`subscription_id`,`product_id`,`account_owner_id`),
  KEY `user_product_access_user_recent_index` (`user_id`,`last_accessed_at`),
  CONSTRAINT `user_product_access_assigned_by_foreign` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `user_product_access_owner_foreign` FOREIGN KEY (`account_owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_product_access_product_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_product_access_product_user_type_foreign` FOREIGN KEY (`product_user_type_id`) REFERENCES `product_user_types` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `user_product_access_role_product_scope_foreign` FOREIGN KEY (`product_user_type_id`, `product_id`) REFERENCES `product_user_types` (`id`, `product_id`) ON UPDATE CASCADE,
  CONSTRAINT `user_product_access_subscription_foreign` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `user_product_access_subscription_scope_foreign` FOREIGN KEY (`subscription_id`, `product_id`, `account_owner_id`) REFERENCES `subscriptions` (`id`, `product_id`, `account_owner_id`) ON UPDATE CASCADE,
  CONSTRAINT `user_product_access_user_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_product_access`
--

LOCK TABLES `user_product_access` WRITE;
/*!40000 ALTER TABLE `user_product_access` DISABLE KEYS */;
INSERT INTO `user_product_access` VALUES (1,1,10,4,1,18,'inactive',1,NULL,NULL,'2026-07-13 02:00:57','2026-07-28 13:17:39'),(2,1,11,3,1,19,'active',1,'2026-08-05 02:42:56','2026-08-04 06:43:24','2026-07-13 02:33:41','2026-08-05 02:42:56'),(3,19,11,5,1,19,'active',1,'2026-07-14 03:59:29',NULL,'2026-07-14 03:59:29','2026-07-30 06:31:28'),(4,12,10,9,1,18,'inactive',1,'2026-05-29 18:52:57',NULL,'2026-07-28 13:17:39','2026-07-28 13:17:39'),(5,13,10,2,1,18,'inactive',1,'2026-06-05 01:41:18',NULL,'2026-07-28 13:17:39','2026-07-28 13:17:39'),(6,14,10,2,1,18,'inactive',1,'2026-06-05 01:41:18',NULL,'2026-07-28 13:17:39','2026-07-28 13:17:39'),(7,15,10,6,1,18,'inactive',1,'2026-06-05 01:41:18',NULL,'2026-07-28 13:17:39','2026-07-28 13:17:39'),(8,16,10,6,1,18,'inactive',1,'2026-06-05 01:41:18',NULL,'2026-07-28 13:17:39','2026-07-28 13:17:39'),(9,17,10,9,1,18,'inactive',1,'2026-06-05 01:43:20',NULL,'2026-07-28 13:17:39','2026-07-28 13:17:39'),(10,18,10,9,1,18,'inactive',1,'2026-05-29 18:52:57',NULL,'2026-07-28 13:17:39','2026-07-28 13:17:39'),(11,19,10,6,1,18,'inactive',1,'2026-07-14 03:59:29',NULL,'2026-07-28 13:17:39','2026-08-05 06:20:10'),(21,21,11,3,21,21,'active',1,'2026-08-05 06:19:35',NULL,'2026-08-05 06:19:35','2026-08-05 06:19:35');
/*!40000 ALTER TABLE `user_product_access` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_product_access_scopes`
--

DROP TABLE IF EXISTS `user_product_access_scopes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_product_access_scopes` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `access_id` bigint(20) unsigned NOT NULL,
  `scope_type` varchar(50) NOT NULL,
  `scope_id` bigint(20) unsigned NOT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `metadata` longtext DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_product_access_scopes_unique` (`access_id`,`scope_type`,`scope_id`),
  KEY `user_product_access_scopes_lookup_index` (`access_id`,`scope_type`,`status`),
  KEY `user_product_access_scopes_external_index` (`scope_type`,`scope_id`,`status`),
  CONSTRAINT `user_product_access_scopes_access_foreign` FOREIGN KEY (`access_id`) REFERENCES `user_product_access` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_product_access_scopes`
--

LOCK TABLES `user_product_access_scopes` WRITE;
/*!40000 ALTER TABLE `user_product_access_scopes` DISABLE KEYS */;
INSERT INTO `user_product_access_scopes` VALUES (1,5,'branch',1,1,'active','{\"source\": \"users.branch_id\", \"resolution_method\": \"explicit_pos\", \"migration\": \"legacy-cleanup-safe-resume-v1.2\"}','2026-07-28 13:24:59','2026-07-28 13:34:43'),(2,6,'branch',1,1,'active','{\"source\": \"users.branch_id\", \"resolution_method\": \"explicit_pos\", \"migration\": \"legacy-cleanup-safe-resume-v1.2\"}','2026-07-28 13:24:59','2026-07-28 13:34:43'),(3,7,'branch',1,1,'active','{\"source\": \"users.branch_id\", \"resolution_method\": \"explicit_pos\", \"migration\": \"legacy-cleanup-safe-resume-v1.2\"}','2026-07-28 13:24:59','2026-07-28 13:34:43'),(4,8,'branch',1,1,'active','{\"source\": \"users.branch_id\", \"resolution_method\": \"explicit_pos\", \"migration\": \"legacy-cleanup-safe-resume-v1.2\"}','2026-07-28 13:24:59','2026-07-28 13:34:43'),(5,4,'branch',1,1,'active','{\"source\": \"users.branch_id\", \"resolution_method\": \"explicit_pos\", \"migration\": \"legacy-cleanup-safe-resume-v1.2\"}','2026-07-28 13:24:59','2026-07-28 13:34:43'),(6,9,'branch',1,1,'active','{\"source\": \"users.branch_id\", \"resolution_method\": \"explicit_pos\", \"migration\": \"legacy-cleanup-safe-resume-v1.2\"}','2026-07-28 13:24:59','2026-07-28 13:34:43'),(7,10,'branch',1,1,'active','{\"source\": \"users.branch_id\", \"resolution_method\": \"explicit_pos\", \"migration\": \"legacy-cleanup-safe-resume-v1.2\"}','2026-07-28 13:24:59','2026-07-28 13:34:43'),(8,3,'branch',3,1,'active','{\"source\": \"users.branch_id\", \"resolution_method\": \"single_active_access\", \"migration\": \"legacy-cleanup-safe-resume-v1.2\"}','2026-07-28 13:34:43','2026-07-28 13:34:43'),(9,21,'branch',4,1,'active','{\"provisioned\":true}','2026-08-05 06:19:35','2026-08-05 06:19:35'),(10,21,'warehouse',3,1,'active','{\"provisioned\":true}','2026-08-05 06:19:35','2026-08-05 06:19:35');
/*!40000 ALTER TABLE `user_product_access_scopes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_product_preferences`
--

DROP TABLE IF EXISTS `user_product_preferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_product_preferences` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `default_access_id` bigint(20) unsigned DEFAULT NULL,
  `last_access_id` bigint(20) unsigned DEFAULT NULL,
  `landing_behavior` enum('last_used','default','selector') NOT NULL DEFAULT 'last_used',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_product_preferences_user_unique` (`user_id`),
  KEY `user_product_preferences_default_access_index` (`default_access_id`),
  KEY `user_product_preferences_last_access_index` (`last_access_id`),
  CONSTRAINT `user_product_preferences_default_access_foreign` FOREIGN KEY (`default_access_id`) REFERENCES `user_product_access` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `user_product_preferences_last_access_foreign` FOREIGN KEY (`last_access_id`) REFERENCES `user_product_access` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `user_product_preferences_user_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_product_preferences`
--

LOCK TABLES `user_product_preferences` WRITE;
/*!40000 ALTER TABLE `user_product_preferences` DISABLE KEYS */;
INSERT INTO `user_product_preferences` VALUES (1,19,3,11,'last_used','2026-07-28 13:17:39','2026-07-28 13:17:39'),(2,1,2,2,'last_used','2026-08-04 06:43:24','2026-08-04 06:43:24'),(3,12,NULL,4,'last_used','2026-07-28 13:17:39','2026-07-28 13:17:39'),(4,13,NULL,5,'last_used','2026-07-28 13:17:39','2026-07-28 13:17:39'),(5,14,NULL,6,'last_used','2026-07-28 13:17:39','2026-07-28 13:17:39'),(6,15,NULL,7,'last_used','2026-07-28 13:17:39','2026-07-28 13:17:39'),(7,16,NULL,8,'last_used','2026-07-28 13:17:39','2026-07-28 13:17:39'),(8,17,NULL,9,'last_used','2026-07-28 13:17:39','2026-07-28 13:17:39'),(9,18,NULL,10,'last_used','2026-07-28 13:17:39','2026-07-28 13:17:39');
/*!40000 ALTER TABLE `user_product_preferences` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_types`
--

LOCK TABLES `user_types` WRITE;
/*!40000 ALTER TABLE `user_types` DISABLE KEYS */;
INSERT INTO `user_types` VALUES (1,'owner','Client / Owner','Owner of a subscribed JCM SaaS account.',1,10,'active','2026-07-13 02:00:57','2026-07-13 02:11:28'),(2,'manager','Manager','Manages operations assigned by the owner.',0,20,'active','2026-07-13 02:00:57','2026-07-13 02:11:28'),(3,'staff','Staff','Performs assigned inventory tasks.',0,30,'active','2026-07-13 02:00:57','2026-07-13 02:11:28'),(5,'cashier','Cashier','Processes sales and payment transactions for an assigned product account.',0,25,'active','2026-07-28 13:17:38','2026-07-28 13:17:38');
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
  `role` enum('admin','client') NOT NULL DEFAULT 'client',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `two_factor_secret` text DEFAULT NULL,
  `two_factor_recovery_codes` text DEFAULT NULL,
  `two_factor_confirmed_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_created_by_foreign` (`created_by`),
  CONSTRAINT `users_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'June Charles Mariquit','junecharlesmariquit553@gmail.com','admin',NULL,'$2y$12$knLKVXIAam08KApxVgv6eOA7nnoZykl8Ef2r4H3kmdOBOI40.2FOi',NULL,NULL,NULL,'9JBOAudIQEwEwivs77UjkTIUXSJBU6reFUHleYeCoCKw6kvTHQR1z2RN12ht','2026-04-13 21:58:39','2026-08-05 02:06:09',NULL,1),(7,'admin','admin@gmail.com','client',NULL,'$2y$12$knLKVXIAam08KApxVgv6eOA7nnoZykl8Ef2r4H3kmdOBOI40.2FOi',NULL,NULL,NULL,'AKzQuJt0QVa7Gfsmsdgbl7sZzNkzjrD04AxBAX7SjbmjrBx0ZVXnNHNNyqCn','2026-04-13 21:58:39','2026-04-13 21:58:39',NULL,1),(12,'cashier','cashier@pos.com','client',NULL,'$2y$12$m/UNFXRTz3F57XWwWS4Wku1MqmOCQUPC1FxK11n7UpTFPUJKOI8NO',NULL,NULL,NULL,NULL,'2026-05-29 18:52:57','2026-05-29 18:52:57',1,1),(13,'Store Manager 1','manager1@pos.com','client','2026-06-05 01:41:18','$2y$12$m/UNFXRTz3F57XWwWS4Wku1MqmOCQUPC1FxK11n7UpTFPUJKOI8NO',NULL,NULL,NULL,NULL,'2026-06-05 01:41:18','2026-06-05 01:41:18',1,1),(14,'Store Manager 2','manager2@pos.com','client','2026-06-05 01:41:18','$2y$12$m/UNFXRTz3F57XWwWS4Wku1MqmOCQUPC1FxK11n7UpTFPUJKOI8NO',NULL,NULL,NULL,NULL,'2026-06-05 01:41:18','2026-06-05 01:41:18',1,1),(15,'Store Staff 1','staff1@pos.com','client','2026-06-05 01:41:18','$2y$12$m/UNFXRTz3F57XWwWS4Wku1MqmOCQUPC1FxK11n7UpTFPUJKOI8NO',NULL,NULL,NULL,NULL,'2026-06-05 01:41:18','2026-06-05 01:41:18',1,1),(16,'Store Staff 2','staff2@pos.com','client','2026-06-05 01:41:18','$2y$12$m/UNFXRTz3F57XWwWS4Wku1MqmOCQUPC1FxK11n7UpTFPUJKOI8NO',NULL,NULL,NULL,NULL,'2026-06-05 01:41:18','2026-06-08 19:38:03',1,1),(17,'Cashier 2','cashier2@pos.com','client','2026-06-05 01:43:20','$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',NULL,NULL,NULL,NULL,'2026-06-05 01:43:20','2026-06-05 01:43:20',1,1),(18,'cashier1','cashier1@pos.com','client',NULL,'$2y$12$m/UNFXRTz3F57XWwWS4Wku1MqmOCQUPC1FxK11n7UpTFPUJKOI8NO',NULL,NULL,NULL,NULL,'2026-05-29 18:52:57','2026-05-29 18:52:57',1,1),(19,'staff','staff@inventory.com','client',NULL,'$2y$12$NdDKLmZaROoi/5YdtQeVYOE77wbMgLXLjAhHixLGlPC9VSUn0wfkK',NULL,NULL,NULL,NULL,'2026-07-14 03:59:29','2026-07-23 01:00:53',1,1),(21,'June Charles Mariquit','mariquit.junecharles@marsu.edu.ph','client',NULL,'$2y$12$QDn0yP9jyqgTx7HQYYXH3e4PFh819HrdCDUEGb7kuu6bL4hSCn99.',NULL,NULL,NULL,NULL,'2026-08-05 06:19:35','2026-08-05 06:19:35',1,1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary table structure for view `v_plan_allowed_roles`
--

DROP TABLE IF EXISTS `v_plan_allowed_roles`;
/*!50001 DROP VIEW IF EXISTS `v_plan_allowed_roles`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `v_plan_allowed_roles` AS SELECT
 1 AS `product_id`,
  1 AS `product_code`,
  1 AS `plan_id`,
  1 AS `plan_code`,
  1 AS `plan_name`,
  1 AS `product_user_type_id`,
  1 AS `type_code`,
  1 AS `role_name`,
  1 AS `max_accounts`,
  1 AS `is_enabled` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_plan_catalog`
--

DROP TABLE IF EXISTS `v_plan_catalog`;
/*!50001 DROP VIEW IF EXISTS `v_plan_catalog`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `v_plan_catalog` AS SELECT
 1 AS `product_id`,
  1 AS `product_code`,
  1 AS `product_name`,
  1 AS `plan_id`,
  1 AS `plan_code`,
  1 AS `plan_name`,
  1 AS `description`,
  1 AS `plan_sort_order`,
  1 AS `plan_status`,
  1 AS `plan_price_id`,
  1 AS `billing_interval`,
  1 AS `price`,
  1 AS `compare_at_price`,
  1 AS `currency`,
  1 AS `duration_days`,
  1 AS `trial_days`,
  1 AS `is_default`,
  1 AS `price_sort_order`,
  1 AS `price_status` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_user_identity`
--

DROP TABLE IF EXISTS `v_user_identity`;
/*!50001 DROP VIEW IF EXISTS `v_user_identity`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `v_user_identity` AS SELECT
 1 AS `id`,
  1 AS `name`,
  1 AS `email`,
  1 AS `email_verified_at`,
  1 AS `is_active`,
  1 AS `created_by`,
  1 AS `created_at`,
  1 AS `updated_at`,
  1 AS `platform_roles`,
  1 AS `product_count` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_user_product_portfolio`
--

DROP TABLE IF EXISTS `v_user_product_portfolio`;
/*!50001 DROP VIEW IF EXISTS `v_user_product_portfolio`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `v_user_product_portfolio` AS SELECT
 1 AS `access_id`,
  1 AS `user_id`,
  1 AS `user_name`,
  1 AS `email`,
  1 AS `account_owner_id`,
  1 AS `account_owner_name`,
  1 AS `product_id`,
  1 AS `product_code`,
  1 AS `product_slug`,
  1 AS `product_name`,
  1 AS `app_url`,
  1 AS `role_code`,
  1 AS `role_name`,
  1 AS `membership_status`,
  1 AS `subscription_id`,
  1 AS `subscription_status`,
  1 AS `plan_id`,
  1 AS `plan_code`,
  1 AS `plan_name`,
  1 AS `joined_at`,
  1 AS `last_accessed_at`,
  1 AS `is_default_access`,
  1 AS `is_last_access` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_user_subscription_access`
--

DROP TABLE IF EXISTS `v_user_subscription_access`;
/*!50001 DROP VIEW IF EXISTS `v_user_subscription_access`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `v_user_subscription_access` AS SELECT
 1 AS `access_id`,
  1 AS `user_id`,
  1 AS `account_owner_id`,
  1 AS `product_id`,
  1 AS `product_code`,
  1 AS `product_user_type_id`,
  1 AS `role_code`,
  1 AS `role_name`,
  1 AS `membership_status`,
  1 AS `subscription_id`,
  1 AS `subscription_code`,
  1 AS `subscription_status`,
  1 AS `plan_id`,
  1 AS `plan_code`,
  1 AS `plan_name`,
  1 AS `plan_price_id`,
  1 AS `billing_interval`,
  1 AS `price`,
  1 AS `currency`,
  1 AS `trial_ends_at`,
  1 AS `current_period_start`,
  1 AS `current_period_end`,
  1 AS `grace_ends_at`,
  1 AS `access_mode` */;
SET character_set_client = @saved_cs_client;

--
-- Dumping events for database 'jcm_saas_db'
--

--
-- Dumping routines for database 'jcm_saas_db'
--

--
-- Current Database: `jcm_saas_db`
--

USE `jcm_saas_db`;

--
-- Final view structure for view `v_plan_allowed_roles`
--

/*!50001 DROP VIEW IF EXISTS `v_plan_allowed_roles`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_plan_allowed_roles` AS select `product`.`id` AS `product_id`,`product`.`product_code` AS `product_code`,`plan`.`id` AS `plan_id`,`plan`.`plan_code` AS `plan_code`,`plan`.`plan_name` AS `plan_name`,`product_role`.`id` AS `product_user_type_id`,`user_type`.`type_code` AS `type_code`,coalesce(`product_role`.`display_name`,`user_type`.`name`) AS `role_name`,`plan_role`.`max_accounts` AS `max_accounts`,`plan_role`.`is_enabled` AS `is_enabled` from ((((`plan_user_types` `plan_role` join `products` `product` on(`product`.`id` = `plan_role`.`product_id`)) join `plans` `plan` on(`plan`.`id` = `plan_role`.`plan_id`)) join `product_user_types` `product_role` on(`product_role`.`id` = `plan_role`.`product_user_type_id`)) join `user_types` `user_type` on(`user_type`.`id` = `product_role`.`user_type_id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_plan_catalog`
--

/*!50001 DROP VIEW IF EXISTS `v_plan_catalog`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_plan_catalog` AS select `product`.`id` AS `product_id`,`product`.`product_code` AS `product_code`,`product`.`name` AS `product_name`,`plan`.`id` AS `plan_id`,`plan`.`plan_code` AS `plan_code`,`plan`.`plan_name` AS `plan_name`,`plan`.`description` AS `description`,`plan`.`sort_order` AS `plan_sort_order`,`plan`.`status` AS `plan_status`,`price`.`id` AS `plan_price_id`,`price`.`billing_interval` AS `billing_interval`,`price`.`price` AS `price`,`price`.`compare_at_price` AS `compare_at_price`,`price`.`currency` AS `currency`,`price`.`duration_days` AS `duration_days`,coalesce(`price`.`trial_days_override`,`plan`.`trial_days`) AS `trial_days`,`price`.`is_default` AS `is_default`,`price`.`sort_order` AS `price_sort_order`,`price`.`status` AS `price_status` from ((`products` `product` join `plans` `plan` on(`plan`.`product_id` = `product`.`id`)) join `plan_prices` `price` on(`price`.`plan_id` = `plan`.`id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_user_identity`
--

/*!50001 DROP VIEW IF EXISTS `v_user_identity`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_user_identity` AS select `user_record`.`id` AS `id`,`user_record`.`name` AS `name`,`user_record`.`email` AS `email`,`user_record`.`email_verified_at` AS `email_verified_at`,`user_record`.`is_active` AS `is_active`,`user_record`.`created_by` AS `created_by`,`user_record`.`created_at` AS `created_at`,`user_record`.`updated_at` AS `updated_at`,group_concat(distinct `platform_role`.`role_code` order by `platform_role`.`sort_order` ASC separator ',') AS `platform_roles`,count(distinct `product_access`.`product_id`) AS `product_count` from (((`users` `user_record` left join `user_platform_roles` `user_platform_role` on(`user_platform_role`.`user_id` = `user_record`.`id` and `user_platform_role`.`status` = 'active')) left join `platform_roles` `platform_role` on(`platform_role`.`id` = `user_platform_role`.`platform_role_id`)) left join `user_product_access` `product_access` on(`product_access`.`user_id` = `user_record`.`id` and `product_access`.`status` in ('pending','active','inactive'))) group by `user_record`.`id`,`user_record`.`name`,`user_record`.`email`,`user_record`.`email_verified_at`,`user_record`.`is_active`,`user_record`.`created_by`,`user_record`.`created_at`,`user_record`.`updated_at` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_user_product_portfolio`
--

/*!50001 DROP VIEW IF EXISTS `v_user_product_portfolio`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_user_product_portfolio` AS select `access_record`.`id` AS `access_id`,`access_record`.`user_id` AS `user_id`,`user_record`.`name` AS `user_name`,`user_record`.`email` AS `email`,`access_record`.`account_owner_id` AS `account_owner_id`,`owner_record`.`name` AS `account_owner_name`,`access_record`.`product_id` AS `product_id`,`product_record`.`product_code` AS `product_code`,`product_record`.`slug` AS `product_slug`,`product_record`.`name` AS `product_name`,`product_record`.`app_url` AS `app_url`,`user_type_record`.`type_code` AS `role_code`,coalesce(`product_role`.`display_name`,`user_type_record`.`name`) AS `role_name`,`access_record`.`status` AS `membership_status`,`access_record`.`subscription_id` AS `subscription_id`,`subscription_record`.`status` AS `subscription_status`,`subscription_record`.`plan_id` AS `plan_id`,`plan_record`.`plan_code` AS `plan_code`,`plan_record`.`plan_name` AS `plan_name`,`access_record`.`joined_at` AS `joined_at`,`access_record`.`last_accessed_at` AS `last_accessed_at`,case when `preference_record`.`default_access_id` = `access_record`.`id` then 1 else 0 end AS `is_default_access`,case when `preference_record`.`last_access_id` = `access_record`.`id` then 1 else 0 end AS `is_last_access` from ((((((((`user_product_access` `access_record` join `users` `user_record` on(`user_record`.`id` = `access_record`.`user_id`)) join `users` `owner_record` on(`owner_record`.`id` = `access_record`.`account_owner_id`)) join `products` `product_record` on(`product_record`.`id` = `access_record`.`product_id`)) join `product_user_types` `product_role` on(`product_role`.`id` = `access_record`.`product_user_type_id`)) join `user_types` `user_type_record` on(`user_type_record`.`id` = `product_role`.`user_type_id`)) left join `subscriptions` `subscription_record` on(`subscription_record`.`id` = `access_record`.`subscription_id`)) left join `plans` `plan_record` on(`plan_record`.`id` = `subscription_record`.`plan_id`)) left join `user_product_preferences` `preference_record` on(`preference_record`.`user_id` = `access_record`.`user_id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_user_subscription_access`
--

/*!50001 DROP VIEW IF EXISTS `v_user_subscription_access`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_user_subscription_access` AS select `access_record`.`id` AS `access_id`,`access_record`.`user_id` AS `user_id`,`access_record`.`account_owner_id` AS `account_owner_id`,`access_record`.`product_id` AS `product_id`,`product_record`.`product_code` AS `product_code`,`access_record`.`product_user_type_id` AS `product_user_type_id`,`user_type_record`.`type_code` AS `role_code`,coalesce(`product_role`.`display_name`,`user_type_record`.`name`) AS `role_name`,`access_record`.`status` AS `membership_status`,`subscription_record`.`id` AS `subscription_id`,`subscription_record`.`subscription_code` AS `subscription_code`,`subscription_record`.`status` AS `subscription_status`,`subscription_record`.`plan_id` AS `plan_id`,`plan_record`.`plan_code` AS `plan_code`,`plan_record`.`plan_name` AS `plan_name`,`subscription_record`.`plan_price_id` AS `plan_price_id`,`plan_price`.`billing_interval` AS `billing_interval`,`plan_price`.`price` AS `price`,`plan_price`.`currency` AS `currency`,`subscription_record`.`trial_ends_at` AS `trial_ends_at`,`subscription_record`.`current_period_start` AS `current_period_start`,`subscription_record`.`current_period_end` AS `current_period_end`,`subscription_record`.`grace_ends_at` AS `grace_ends_at`,case when `access_record`.`status` <> 'active' then 'blocked' when `subscription_record`.`status` in ('trial','active') then 'full' when `subscription_record`.`status` in ('past_due','grace_period') then coalesce(`policy_record`.`past_due_access_mode`,'read_only') when `subscription_record`.`status` = 'expired' then coalesce(`policy_record`.`expired_access_mode`,'read_only') else 'blocked' end AS `access_mode` from (((((((`user_product_access` `access_record` join `products` `product_record` on(`product_record`.`id` = `access_record`.`product_id`)) join `product_user_types` `product_role` on(`product_role`.`id` = `access_record`.`product_user_type_id`)) join `user_types` `user_type_record` on(`user_type_record`.`id` = `product_role`.`user_type_id`)) left join `subscriptions` `subscription_record` on(`subscription_record`.`id` = `access_record`.`subscription_id`)) left join `plans` `plan_record` on(`plan_record`.`id` = `subscription_record`.`plan_id`)) left join `plan_prices` `plan_price` on(`plan_price`.`id` = `subscription_record`.`plan_price_id`)) left join `product_subscription_policies` `policy_record` on(`policy_record`.`product_id` = `access_record`.`product_id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-06 16:50:41
