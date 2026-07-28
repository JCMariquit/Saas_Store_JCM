-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: 127.0.0.1    Database: jcm_inventory_db
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
-- Current Database: `jcm_inventory_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `jcm_inventory_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;

USE `jcm_inventory_db`;

--
-- Table structure for table `branches`
--

DROP TABLE IF EXISTS `branches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `branches` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `name` varchar(180) NOT NULL,
  `code` varchar(50) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(180) DEFAULT NULL,
  `is_main` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `active_main_tenant_id` bigint(20) unsigned GENERATED ALWAYS AS (case when `is_main` = 1 and `is_active` = 1 and `deleted_at` is null then `tenant_id` else NULL end) STORED,
  PRIMARY KEY (`id`),
  UNIQUE KEY `branches_tenant_code_unique` (`tenant_id`,`code`),
  UNIQUE KEY `branches_tenant_id_unique` (`tenant_id`,`id`),
  UNIQUE KEY `branches_one_active_main_per_tenant` (`active_main_tenant_id`),
  KEY `branches_tenant_id_index` (`tenant_id`),
  KEY `branches_tenant_active_index` (`tenant_id`,`is_active`),
  KEY `branches_created_by_index` (`created_by`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `branches`
--

LOCK TABLES `branches` WRITE;
/*!40000 ALTER TABLE `branches` DISABLE KEYS */;
INSERT INTO `branches` VALUES (3,1,'Main Branch','MAIN','Mogpog Marinduque','09321654987','main@gmail.com',1,1,1,'2026-07-16 01:12:59','2026-07-16 01:12:59',NULL,1);
/*!40000 ALTER TABLE `branches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categories` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `parent_id` bigint(20) unsigned DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `slug` varchar(180) NOT NULL,
  `description` text DEFAULT NULL,
  `sort_order` int(10) unsigned NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_tenant_slug_unique` (`tenant_id`,`slug`),
  UNIQUE KEY `categories_tenant_id_unique` (`tenant_id`,`id`),
  KEY `categories_tenant_id_index` (`tenant_id`),
  KEY `categories_parent_id_index` (`parent_id`),
  KEY `categories_tenant_active_index` (`tenant_id`,`is_active`),
  KEY `categories_created_by_index` (`created_by`),
  KEY `categories_tenant_parent_index` (`tenant_id`,`parent_id`),
  CONSTRAINT `categories_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `categories_tenant_parent_foreign` FOREIGN KEY (`tenant_id`, `parent_id`) REFERENCES `categories` (`tenant_id`, `id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,1,NULL,'1','1','1',4,1,1,'2026-07-10 06:00:11','2026-07-10 06:00:11',NULL),(2,1,NULL,'Soap','soap',NULL,0,1,1,'2026-07-16 01:14:18','2026-07-16 01:14:18',NULL),(3,1,NULL,'Drinks','drinks',NULL,0,1,1,'2026-07-26 10:05:02','2026-07-26 10:05:02',NULL),(4,1,NULL,'Snacks','snacks',NULL,0,1,1,'2026-07-27 02:06:51','2026-07-27 02:06:51',NULL);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_settings`
--

DROP TABLE IF EXISTS `inventory_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inventory_settings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `batch_code_prefix` varchar(20) NOT NULL DEFAULT 'BAT',
  `batch_code_sequence_padding` tinyint(3) unsigned NOT NULL DEFAULT 6,
  `auto_generate_batch_code` tinyint(1) NOT NULL DEFAULT 1,
  `default_batch_issue_policy` enum('fifo','fefo','manual') NOT NULL DEFAULT 'fifo',
  `expiry_warning_days` smallint(5) unsigned NOT NULL DEFAULT 30,
  `expiry_critical_days` smallint(5) unsigned NOT NULL DEFAULT 7,
  `allow_expired_issue` tinyint(1) NOT NULL DEFAULT 0,
  `allow_negative_stock` tinyint(1) NOT NULL DEFAULT 0,
  `require_batch_for_tracked_products` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inventory_settings_tenant_unique` (`tenant_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_settings`
--

LOCK TABLES `inventory_settings` WRITE;
/*!40000 ALTER TABLE `inventory_settings` DISABLE KEYS */;
INSERT INTO `inventory_settings` VALUES (1,1,'BAT',6,1,'fifo',30,7,0,0,1,'2026-07-25 06:37:37','2026-07-26 04:27:50');
/*!40000 ALTER TABLE `inventory_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `products` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `category_id` bigint(20) unsigned DEFAULT NULL,
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
  `expiry_warning_days` smallint(5) unsigned DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `products_tenant_slug_unique` (`tenant_id`,`slug`),
  UNIQUE KEY `products_tenant_id_unique` (`tenant_id`,`id`),
  UNIQUE KEY `products_tenant_sku_unique` (`tenant_id`,`sku`),
  UNIQUE KEY `products_tenant_barcode_unique` (`tenant_id`,`barcode`),
  KEY `products_tenant_id_index` (`tenant_id`),
  KEY `products_category_id_index` (`category_id`),
  KEY `products_tenant_category_index` (`tenant_id`,`category_id`),
  KEY `products_tenant_active_index` (`tenant_id`,`is_active`),
  KEY `products_created_by_index` (`created_by`),
  KEY `products_tenant_batch_tracking_index` (`tenant_id`,`batch_tracking_enabled`),
  CONSTRAINT `products_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `products_tenant_category_foreign` FOREIGN KEY (`tenant_id`, `category_id`) REFERENCES `categories` (`tenant_id`, `id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,1,1,'qw','qw','QW','qw','0',NULL,'pcs',10.0000,'tracked',0,'fifo',0,NULL,1,1,'2026-07-10 06:13:07','2026-07-10 06:13:07',NULL),(2,1,2,'Safeguard','safeguard','QW1',NULL,NULL,NULL,'pcs',25.0000,'tracked',0,'fifo',0,NULL,1,1,'2026-07-16 01:14:47','2026-07-16 01:14:47',NULL),(3,1,2,'Dove','dove',NULL,NULL,NULL,NULL,'pcs',50.0000,'tracked',1,'fifo',1,100,1,1,'2026-07-25 16:57:09','2026-07-25 16:57:09',NULL),(4,1,3,'Royal','royal',NULL,NULL,NULL,NULL,'pcs',15.0000,'tracked',1,'fifo',0,30,1,1,'2026-07-26 10:06:51','2026-07-26 10:06:51',NULL),(5,1,4,'Clover Chips','clover-chips',NULL,NULL,NULL,NULL,'pcs',0.0000,'tracked',1,'fifo',0,NULL,1,1,'2026-07-27 02:07:10','2026-07-27 02:07:26',NULL);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products_backup_before_batch_core_v3_20260725`
--

DROP TABLE IF EXISTS `products_backup_before_batch_core_v3_20260725`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `products_backup_before_batch_core_v3_20260725` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `category_id` bigint(20) unsigned DEFAULT NULL,
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
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `products_tenant_slug_unique` (`tenant_id`,`slug`),
  UNIQUE KEY `products_tenant_id_unique` (`tenant_id`,`id`),
  UNIQUE KEY `products_tenant_sku_unique` (`tenant_id`,`sku`),
  UNIQUE KEY `products_tenant_barcode_unique` (`tenant_id`,`barcode`),
  KEY `products_tenant_id_index` (`tenant_id`),
  KEY `products_category_id_index` (`category_id`),
  KEY `products_tenant_category_index` (`tenant_id`,`category_id`),
  KEY `products_tenant_active_index` (`tenant_id`,`is_active`),
  KEY `products_created_by_index` (`created_by`),
  KEY `products_tenant_batch_tracking_index` (`tenant_id`,`batch_tracking_enabled`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products_backup_before_batch_core_v3_20260725`
--

LOCK TABLES `products_backup_before_batch_core_v3_20260725` WRITE;
/*!40000 ALTER TABLE `products_backup_before_batch_core_v3_20260725` DISABLE KEYS */;
INSERT INTO `products_backup_before_batch_core_v3_20260725` VALUES (1,1,1,'qw','qw','QW','qw','0',NULL,'pcs',10.0000,'tracked',0,'fifo',0,1,1,'2026-07-10 06:13:07','2026-07-10 06:13:07',NULL),(2,1,2,'Safeguard','safeguard','QW1',NULL,NULL,NULL,'pcs',25.0000,'tracked',0,'fifo',0,1,1,'2026-07-16 01:14:47','2026-07-16 01:14:47',NULL);
/*!40000 ALTER TABLE `products_backup_before_batch_core_v3_20260725` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products_backup_before_batching_20260725`
--

DROP TABLE IF EXISTS `products_backup_before_batching_20260725`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `products_backup_before_batching_20260725` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `category_id` bigint(20) unsigned DEFAULT NULL,
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
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `products_tenant_slug_unique` (`tenant_id`,`slug`),
  UNIQUE KEY `products_tenant_id_unique` (`tenant_id`,`id`),
  UNIQUE KEY `products_tenant_sku_unique` (`tenant_id`,`sku`),
  UNIQUE KEY `products_tenant_barcode_unique` (`tenant_id`,`barcode`),
  KEY `products_tenant_id_index` (`tenant_id`),
  KEY `products_category_id_index` (`category_id`),
  KEY `products_tenant_category_index` (`tenant_id`,`category_id`),
  KEY `products_tenant_active_index` (`tenant_id`,`is_active`),
  KEY `products_created_by_index` (`created_by`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products_backup_before_batching_20260725`
--

LOCK TABLES `products_backup_before_batching_20260725` WRITE;
/*!40000 ALTER TABLE `products_backup_before_batching_20260725` DISABLE KEYS */;
INSERT INTO `products_backup_before_batching_20260725` VALUES (1,1,1,'qw','qw','QW','qw','0',NULL,'pcs',10.0000,50.00,40.00,'tracked',1,1,'2026-07-10 06:13:07','2026-07-10 06:13:07',NULL),(2,1,2,'Safeguard','safeguard','QW1',NULL,NULL,NULL,'pcs',25.0000,52.00,NULL,'tracked',1,1,'2026-07-16 01:14:47','2026-07-16 01:14:47',NULL);
/*!40000 ALTER TABLE `products_backup_before_batching_20260725` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_order_items`
--

DROP TABLE IF EXISTS `purchase_order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `purchase_order_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `purchase_order_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  `product_name` varchar(180) NOT NULL,
  `product_sku` varchar(100) DEFAULT NULL,
  `unit` varchar(50) NOT NULL DEFAULT 'pcs',
  `quantity` decimal(14,3) NOT NULL DEFAULT 0.000,
  `received_quantity` decimal(14,3) NOT NULL DEFAULT 0.000,
  `unit_cost` decimal(18,4) NOT NULL DEFAULT 0.0000,
  `line_total` decimal(14,2) NOT NULL DEFAULT 0.00,
  `notes` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `purchase_order_items_order_product_unique` (`purchase_order_id`,`product_id`),
  UNIQUE KEY `purchase_order_items_tenant_id_unique` (`tenant_id`,`id`),
  UNIQUE KEY `purchase_order_items_context_unique` (`tenant_id`,`id`,`product_id`),
  KEY `purchase_order_items_tenant_id_index` (`tenant_id`),
  KEY `purchase_order_items_purchase_order_id_index` (`purchase_order_id`),
  KEY `purchase_order_items_product_id_index` (`product_id`),
  KEY `purchase_order_items_tenant_product_index` (`tenant_id`,`product_id`),
  KEY `purchase_order_items_tenant_order_index` (`tenant_id`,`purchase_order_id`),
  CONSTRAINT `purchase_order_items_order_id_foreign` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `purchase_order_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `purchase_order_items_tenant_order_foreign` FOREIGN KEY (`tenant_id`, `purchase_order_id`) REFERENCES `purchase_orders` (`tenant_id`, `id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `purchase_order_items_tenant_product_foreign` FOREIGN KEY (`tenant_id`, `product_id`) REFERENCES `products` (`tenant_id`, `id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_order_items`
--

LOCK TABLES `purchase_order_items` WRITE;
/*!40000 ALTER TABLE `purchase_order_items` DISABLE KEYS */;
INSERT INTO `purchase_order_items` VALUES (1,1,1,2,'Safeguard','QW1','pcs',1000.000,0.000,25.0000,25000.00,NULL,'2026-07-20 02:43:18','2026-07-20 02:43:18'),(2,1,2,2,'Safeguard','QW1','pcs',100.000,100.000,25.0000,2500.00,NULL,'2026-07-20 04:54:27','2026-07-20 05:48:37'),(3,1,3,1,'qw','QW','pcs',200.000,0.000,10.0000,2000.00,NULL,'2026-07-20 05:04:16','2026-07-20 05:04:16'),(4,1,4,2,'Safeguard','QW1','pcs',50.000,50.000,25.0000,1250.00,NULL,'2026-07-21 03:54:16','2026-07-21 03:54:45'),(5,1,5,3,'Dove',NULL,'pcs',300.000,300.000,50.0000,15000.00,NULL,'2026-07-26 10:01:42','2026-07-26 11:38:47'),(6,1,6,4,'Royal',NULL,'pcs',100.000,100.000,15.0000,1500.00,NULL,'2026-07-26 11:44:52','2026-07-28 01:38:29'),(7,1,7,5,'Clover Chips',NULL,'pcs',50.000,50.000,10.0000,500.00,NULL,'2026-07-27 02:09:12','2026-07-27 02:09:42'),(8,1,8,5,'Clover Chips',NULL,'pcs',50.000,50.000,0.0000,0.00,NULL,'2026-07-27 07:23:06','2026-07-28 01:39:16'),(9,1,9,3,'Dove',NULL,'pcs',50.000,0.000,50.0000,2500.00,NULL,'2026-07-28 02:13:17','2026-07-28 02:13:17');
/*!40000 ALTER TABLE `purchase_order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_orders`
--

DROP TABLE IF EXISTS `purchase_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `purchase_orders` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `supplier_id` bigint(20) unsigned NOT NULL,
  `branch_id` bigint(20) unsigned NOT NULL,
  `warehouse_id` bigint(20) unsigned NOT NULL,
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
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `submitted_by` bigint(20) unsigned DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `approved_by` bigint(20) unsigned DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `cancelled_by` bigint(20) unsigned DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `purchase_orders_tenant_po_number_unique` (`tenant_id`,`po_number`),
  UNIQUE KEY `purchase_orders_tenant_id_unique` (`tenant_id`,`id`),
  UNIQUE KEY `purchase_orders_context_unique` (`tenant_id`,`id`,`supplier_id`,`branch_id`,`warehouse_id`),
  KEY `purchase_orders_tenant_id_index` (`tenant_id`),
  KEY `purchase_orders_supplier_id_index` (`supplier_id`),
  KEY `purchase_orders_branch_id_index` (`branch_id`),
  KEY `purchase_orders_warehouse_id_index` (`warehouse_id`),
  KEY `purchase_orders_tenant_status_index` (`tenant_id`,`status`),
  KEY `purchase_orders_tenant_supplier_index` (`tenant_id`,`supplier_id`),
  KEY `purchase_orders_tenant_order_date_index` (`tenant_id`,`order_date`),
  KEY `purchase_orders_created_by_index` (`created_by`),
  KEY `purchase_orders_tenant_branch_warehouse_index` (`tenant_id`,`branch_id`,`warehouse_id`),
  CONSTRAINT `purchase_orders_branch_id_foreign` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `purchase_orders_supplier_id_foreign` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `purchase_orders_tenant_branch_warehouse_foreign` FOREIGN KEY (`tenant_id`, `branch_id`, `warehouse_id`) REFERENCES `warehouses` (`tenant_id`, `branch_id`, `id`) ON UPDATE CASCADE,
  CONSTRAINT `purchase_orders_tenant_supplier_foreign` FOREIGN KEY (`tenant_id`, `supplier_id`) REFERENCES `suppliers` (`tenant_id`, `id`) ON UPDATE CASCADE,
  CONSTRAINT `purchase_orders_warehouse_id_foreign` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_orders`
--

LOCK TABLES `purchase_orders` WRITE;
/*!40000 ALTER TABLE `purchase_orders` DISABLE KEYS */;
INSERT INTO `purchase_orders` VALUES (1,1,1,3,2,'PO-20260720-RDS4QP','2026-07-20','5555-05-05','cancelled','qwerty',25000.00,2.00,1.00,20.00,25019.00,NULL,1,1,'2026-07-20 04:33:18',NULL,NULL,1,'2026-07-20 04:58:00','2026-07-20 02:43:18','2026-07-20 04:58:00',NULL),(2,1,1,3,2,'PO-20260720-ZLP2ZW','2026-07-20','2026-07-31','received','qwerty',2500.00,5.00,2.00,222.00,2719.00,NULL,1,1,'2026-07-20 05:02:34',1,'2026-07-20 05:19:16',NULL,NULL,'2026-07-20 04:54:27','2026-07-20 05:48:37',NULL),(3,1,1,3,2,'PO-20260720-RTRG0E','2026-07-20','2026-07-22','draft','qwerty',2000.00,500.00,200.00,200.00,1900.00,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,'2026-07-20 05:04:16','2026-07-20 05:04:16',NULL),(4,1,1,3,2,'PO-20260721-IRZAO3','2026-07-21','2026-08-23','received','qwerty',1250.00,100.00,50.00,600.00,1800.00,NULL,1,1,'2026-07-21 03:54:20',1,'2026-07-21 03:54:26',NULL,NULL,'2026-07-21 03:54:16','2026-07-21 03:54:45',NULL),(5,1,2,3,2,'PO-20260726-6QFBLO','2026-07-26','2026-07-27','received','Cash Before Delivery',15000.00,0.00,0.00,500.00,15500.00,NULL,1,1,'2026-07-26 10:01:48',1,'2026-07-26 10:01:59',NULL,NULL,'2026-07-26 10:01:42','2026-07-26 11:38:47',NULL),(6,1,2,3,2,'PO-20260726-POEDFK','2026-07-26','2026-07-30','received','Cash Before Delivery',1500.00,0.00,0.00,0.00,1500.00,NULL,1,1,'2026-07-26 11:45:12',1,'2026-07-26 11:45:23',NULL,NULL,'2026-07-26 11:44:52','2026-07-28 01:38:29',NULL),(7,1,2,3,2,'PO-20260727-J0SX27','2026-07-27',NULL,'received','Cash Before Delivery',500.00,0.00,0.00,0.00,500.00,NULL,1,1,'2026-07-27 02:09:16',1,'2026-07-27 02:09:24',NULL,NULL,'2026-07-27 02:09:12','2026-07-27 02:09:42',NULL),(8,1,2,3,2,'PO-20260727-96YHUH','2026-07-27','2026-07-30','received','Cash Before Delivery',0.00,0.00,0.00,0.00,0.00,NULL,1,1,'2026-07-27 07:23:18',1,'2026-07-28 01:38:03',NULL,NULL,'2026-07-27 07:23:06','2026-07-28 01:39:16',NULL),(9,1,2,3,2,'PO-20260728-XIXZTV','2026-07-28',NULL,'approved','Cash Before Delivery',2500.00,0.00,0.00,0.00,2500.00,NULL,1,1,'2026-07-28 02:13:22',1,'2026-07-28 02:13:32',NULL,NULL,'2026-07-28 02:13:17','2026-07-28 02:13:32',NULL);
/*!40000 ALTER TABLE `purchase_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_receipt_item_batches`
--

DROP TABLE IF EXISTS `purchase_receipt_item_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `purchase_receipt_item_batches` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `purchase_receipt_item_id` bigint(20) unsigned NOT NULL,
  `warehouse_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  `stock_batch_id` bigint(20) unsigned NOT NULL,
  `stock_movement_batch_id` bigint(20) unsigned DEFAULT NULL,
  `void_stock_movement_batch_id` bigint(20) unsigned DEFAULT NULL,
  `quantity_received` decimal(14,3) NOT NULL,
  `unit_cost` decimal(18,4) NOT NULL DEFAULT 0.0000,
  `line_total` decimal(18,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `prib_item_batch_warehouse_unique` (`purchase_receipt_item_id`,`stock_batch_id`,`warehouse_id`),
  UNIQUE KEY `prib_tenant_id_unique` (`tenant_id`,`id`),
  UNIQUE KEY `prib_movement_batch_unique` (`tenant_id`,`stock_movement_batch_id`),
  UNIQUE KEY `prib_void_move_batch_unique` (`tenant_id`,`void_stock_movement_batch_id`),
  KEY `prib_tenant_item_index` (`tenant_id`,`purchase_receipt_item_id`),
  KEY `prib_tenant_product_index` (`tenant_id`,`product_id`),
  KEY `prib_tenant_batch_index` (`tenant_id`,`stock_batch_id`),
  KEY `prib_warehouse_foreign` (`tenant_id`,`warehouse_id`),
  KEY `prib_batch_product_foreign` (`tenant_id`,`stock_batch_id`,`product_id`),
  CONSTRAINT `prib_batch_product_foreign` FOREIGN KEY (`tenant_id`, `stock_batch_id`, `product_id`) REFERENCES `stock_batches` (`tenant_id`, `id`, `product_id`) ON UPDATE CASCADE,
  CONSTRAINT `prib_movement_batch_foreign` FOREIGN KEY (`tenant_id`, `stock_movement_batch_id`) REFERENCES `stock_movement_batches` (`tenant_id`, `id`) ON UPDATE CASCADE,
  CONSTRAINT `prib_receipt_item_foreign` FOREIGN KEY (`tenant_id`, `purchase_receipt_item_id`) REFERENCES `purchase_receipt_items` (`tenant_id`, `id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `prib_void_move_batch_foreign` FOREIGN KEY (`tenant_id`, `void_stock_movement_batch_id`) REFERENCES `stock_movement_batches` (`tenant_id`, `id`) ON UPDATE CASCADE,
  CONSTRAINT `prib_warehouse_foreign` FOREIGN KEY (`tenant_id`, `warehouse_id`) REFERENCES `warehouses` (`tenant_id`, `id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_receipt_item_batches`
--

LOCK TABLES `purchase_receipt_item_batches` WRITE;
/*!40000 ALTER TABLE `purchase_receipt_item_batches` DISABLE KEYS */;
INSERT INTO `purchase_receipt_item_batches` VALUES (1,1,5,2,3,7,6,NULL,300.000,50.0000,15000.00,'2026-07-26 11:38:47','2026-07-26 11:38:47'),(2,1,6,2,4,9,8,NULL,99.998,15.0000,1499.97,'2026-07-26 11:45:40','2026-07-26 11:45:40'),(3,1,7,2,5,12,17,NULL,50.000,10.0000,500.00,'2026-07-27 02:09:42','2026-07-27 02:09:42'),(4,1,8,2,4,13,18,NULL,0.002,15.0000,0.03,'2026-07-28 01:38:29','2026-07-28 01:38:29'),(5,1,9,2,5,14,19,NULL,50.000,0.0000,0.00,'2026-07-28 01:39:16','2026-07-28 01:39:16');
/*!40000 ALTER TABLE `purchase_receipt_item_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_receipt_items`
--

DROP TABLE IF EXISTS `purchase_receipt_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `purchase_receipt_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `purchase_receipt_id` bigint(20) unsigned NOT NULL,
  `purchase_order_item_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  `stock_movement_id` bigint(20) unsigned DEFAULT NULL,
  `void_stock_movement_id` bigint(20) unsigned DEFAULT NULL,
  `product_name` varchar(180) NOT NULL,
  `product_sku` varchar(100) DEFAULT NULL,
  `unit` varchar(50) NOT NULL DEFAULT 'pcs',
  `quantity_received` decimal(14,3) NOT NULL DEFAULT 0.000,
  `unit_cost` decimal(18,4) NOT NULL DEFAULT 0.0000,
  `line_total` decimal(14,2) NOT NULL DEFAULT 0.00,
  `notes` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `purchase_receipt_items_receipt_order_item_unique` (`purchase_receipt_id`,`purchase_order_item_id`),
  UNIQUE KEY `receipt_items_stock_move_unique` (`tenant_id`,`stock_movement_id`),
  UNIQUE KEY `receipt_items_void_move_unique` (`tenant_id`,`void_stock_movement_id`),
  KEY `purchase_receipt_items_tenant_id_index` (`tenant_id`),
  KEY `purchase_receipt_items_receipt_id_index` (`purchase_receipt_id`),
  KEY `purchase_receipt_items_order_item_id_index` (`purchase_order_item_id`),
  KEY `purchase_receipt_items_product_id_index` (`product_id`),
  KEY `purchase_receipt_items_tenant_product_index` (`tenant_id`,`product_id`),
  KEY `purchase_receipt_items_tenant_receipt_index` (`tenant_id`,`purchase_receipt_id`),
  KEY `purchase_receipt_items_tenant_order_item_product_index` (`tenant_id`,`purchase_order_item_id`,`product_id`),
  CONSTRAINT `purchase_receipt_items_order_item_id_foreign` FOREIGN KEY (`purchase_order_item_id`) REFERENCES `purchase_order_items` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `purchase_receipt_items_order_item_product_foreign` FOREIGN KEY (`tenant_id`, `purchase_order_item_id`, `product_id`) REFERENCES `purchase_order_items` (`tenant_id`, `id`, `product_id`),
  CONSTRAINT `purchase_receipt_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `purchase_receipt_items_receipt_id_foreign` FOREIGN KEY (`purchase_receipt_id`) REFERENCES `purchase_receipts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `purchase_receipt_items_tenant_receipt_foreign` FOREIGN KEY (`tenant_id`, `purchase_receipt_id`) REFERENCES `purchase_receipts` (`tenant_id`, `id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `receipt_items_stock_move_foreign` FOREIGN KEY (`tenant_id`, `stock_movement_id`) REFERENCES `stock_movements` (`tenant_id`, `id`) ON UPDATE CASCADE,
  CONSTRAINT `receipt_items_void_move_foreign` FOREIGN KEY (`tenant_id`, `void_stock_movement_id`) REFERENCES `stock_movements` (`tenant_id`, `id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_receipt_items`
--

LOCK TABLES `purchase_receipt_items` WRITE;
/*!40000 ALTER TABLE `purchase_receipt_items` DISABLE KEYS */;
INSERT INTO `purchase_receipt_items` VALUES (1,1,1,2,2,3,NULL,'Safeguard','QW1','pcs',100.000,25.0000,2500.00,NULL,'2026-07-20 05:48:37','2026-07-20 05:48:37'),(2,1,2,4,2,4,NULL,'Safeguard','QW1','pcs',50.000,25.0000,1250.00,NULL,'2026-07-21 03:54:45','2026-07-21 03:54:45'),(5,1,5,5,3,17,NULL,'Dove',NULL,'pcs',300.000,50.0000,15000.00,NULL,'2026-07-26 11:38:47','2026-07-26 11:38:47'),(6,1,6,6,4,19,NULL,'Royal',NULL,'pcs',99.998,15.0000,1499.97,NULL,'2026-07-26 11:45:40','2026-07-26 11:45:40'),(7,1,7,7,5,28,NULL,'Clover Chips',NULL,'pcs',50.000,10.0000,500.00,NULL,'2026-07-27 02:09:42','2026-07-27 02:09:42'),(8,1,8,6,4,29,NULL,'Royal',NULL,'pcs',0.002,15.0000,0.03,NULL,'2026-07-28 01:38:29','2026-07-28 01:38:29'),(9,1,9,8,5,30,NULL,'Clover Chips',NULL,'pcs',50.000,0.0000,0.00,NULL,'2026-07-28 01:39:16','2026-07-28 01:39:16');
/*!40000 ALTER TABLE `purchase_receipt_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_receipts`
--

DROP TABLE IF EXISTS `purchase_receipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `purchase_receipts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `purchase_order_id` bigint(20) unsigned NOT NULL,
  `supplier_id` bigint(20) unsigned NOT NULL,
  `branch_id` bigint(20) unsigned NOT NULL,
  `warehouse_id` bigint(20) unsigned NOT NULL,
  `receipt_number` varchar(80) NOT NULL,
  `delivery_reference` varchar(120) DEFAULT NULL,
  `received_date` date NOT NULL,
  `status` enum('posted','voided') NOT NULL DEFAULT 'posted',
  `total_quantity` decimal(14,3) NOT NULL DEFAULT 0.000,
  `total_amount` decimal(14,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `received_by` bigint(20) unsigned DEFAULT NULL,
  `posted_at` timestamp NULL DEFAULT NULL,
  `voided_by` bigint(20) unsigned DEFAULT NULL,
  `voided_at` timestamp NULL DEFAULT NULL,
  `void_reason` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `purchase_receipts_tenant_number_unique` (`tenant_id`,`receipt_number`),
  UNIQUE KEY `purchase_receipts_tenant_id_unique` (`tenant_id`,`id`),
  KEY `purchase_receipts_tenant_id_index` (`tenant_id`),
  KEY `purchase_receipts_purchase_order_id_index` (`purchase_order_id`),
  KEY `purchase_receipts_supplier_id_index` (`supplier_id`),
  KEY `purchase_receipts_branch_id_index` (`branch_id`),
  KEY `purchase_receipts_warehouse_id_index` (`warehouse_id`),
  KEY `purchase_receipts_tenant_status_index` (`tenant_id`,`status`),
  KEY `purchase_receipts_tenant_date_index` (`tenant_id`,`received_date`),
  KEY `purchase_receipts_received_by_index` (`received_by`),
  KEY `purchase_receipts_order_context_index` (`tenant_id`,`purchase_order_id`,`supplier_id`,`branch_id`,`warehouse_id`),
  CONSTRAINT `purchase_receipts_branch_id_foreign` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `purchase_receipts_order_context_foreign` FOREIGN KEY (`tenant_id`, `purchase_order_id`, `supplier_id`, `branch_id`, `warehouse_id`) REFERENCES `purchase_orders` (`tenant_id`, `id`, `supplier_id`, `branch_id`, `warehouse_id`),
  CONSTRAINT `purchase_receipts_order_id_foreign` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `purchase_receipts_supplier_id_foreign` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `purchase_receipts_warehouse_id_foreign` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_receipts`
--

LOCK TABLES `purchase_receipts` WRITE;
/*!40000 ALTER TABLE `purchase_receipts` DISABLE KEYS */;
INSERT INTO `purchase_receipts` VALUES (1,1,2,1,3,2,'RCV-20260720-6YEO6T',NULL,'2026-07-20','posted',100.000,2500.00,NULL,1,'2026-07-20 05:48:37',NULL,NULL,NULL,'2026-07-20 05:48:37','2026-07-20 05:48:37'),(2,1,4,1,3,2,'RCV-20260721-QHE5FY',NULL,'2026-07-21','posted',50.000,1250.00,NULL,1,'2026-07-21 03:54:45',NULL,NULL,NULL,'2026-07-21 03:54:45','2026-07-21 03:54:45'),(5,1,5,2,3,2,'RCV-20260726-DBMC7J',NULL,'2026-07-26','posted',300.000,15000.00,NULL,1,'2026-07-26 11:38:47',NULL,NULL,NULL,'2026-07-26 11:38:47','2026-07-26 11:38:47'),(6,1,6,2,3,2,'RCV-20260726-3ISROM',NULL,'2026-07-26','posted',99.998,1499.97,NULL,1,'2026-07-26 11:45:40',NULL,NULL,NULL,'2026-07-26 11:45:40','2026-07-26 11:45:40'),(7,1,7,2,3,2,'RCV-20260727-IO7DSA',NULL,'2026-07-27','posted',50.000,500.00,NULL,1,'2026-07-27 02:09:42',NULL,NULL,NULL,'2026-07-27 02:09:42','2026-07-27 02:09:42'),(8,1,6,2,3,2,'RCV-20260728-4MUS6J',NULL,'2026-07-28','posted',0.002,0.03,NULL,1,'2026-07-28 01:38:29',NULL,NULL,NULL,'2026-07-28 01:38:29','2026-07-28 01:38:29'),(9,1,8,2,3,2,'RCV-20260728-NPYWCP',NULL,'2026-07-28','posted',50.000,0.00,NULL,1,'2026-07-28 01:39:16',NULL,NULL,NULL,'2026-07-28 01:39:16','2026-07-28 01:39:16');
/*!40000 ALTER TABLE `purchase_receipts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_adjustment_item_batches`
--

DROP TABLE IF EXISTS `stock_adjustment_item_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stock_adjustment_item_batches` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `stock_adjustment_item_id` bigint(20) unsigned NOT NULL,
  `warehouse_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  `stock_batch_id` bigint(20) unsigned NOT NULL,
  `direction` enum('in','out') NOT NULL,
  `quantity` decimal(14,3) NOT NULL,
  `unit_cost` decimal(18,4) NOT NULL DEFAULT 0.0000,
  `line_total` decimal(18,2) NOT NULL DEFAULT 0.00,
  `stock_movement_batch_id` bigint(20) unsigned DEFAULT NULL,
  `void_stock_movement_batch_id` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `saib_item_batch_direction_unique` (`stock_adjustment_item_id`,`stock_batch_id`,`direction`),
  UNIQUE KEY `saib_tenant_id_unique` (`tenant_id`,`id`),
  UNIQUE KEY `saib_stock_move_batch_unique` (`tenant_id`,`stock_movement_batch_id`),
  UNIQUE KEY `saib_void_move_batch_unique` (`tenant_id`,`void_stock_movement_batch_id`),
  KEY `saib_tenant_item_index` (`tenant_id`,`stock_adjustment_item_id`),
  KEY `saib_tenant_batch_index` (`tenant_id`,`stock_batch_id`),
  KEY `saib_tenant_product_index` (`tenant_id`,`product_id`),
  KEY `saib_item_product_foreign` (`tenant_id`,`stock_adjustment_item_id`,`product_id`),
  KEY `saib_warehouse_foreign` (`tenant_id`,`warehouse_id`),
  KEY `saib_batch_product_foreign` (`tenant_id`,`stock_batch_id`,`product_id`),
  CONSTRAINT `saib_batch_product_foreign` FOREIGN KEY (`tenant_id`, `stock_batch_id`, `product_id`) REFERENCES `stock_batches` (`tenant_id`, `id`, `product_id`) ON UPDATE CASCADE,
  CONSTRAINT `saib_item_product_foreign` FOREIGN KEY (`tenant_id`, `stock_adjustment_item_id`, `product_id`) REFERENCES `stock_adjustment_items` (`tenant_id`, `id`, `product_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `saib_stock_move_batch_foreign` FOREIGN KEY (`tenant_id`, `stock_movement_batch_id`) REFERENCES `stock_movement_batches` (`tenant_id`, `id`) ON UPDATE CASCADE,
  CONSTRAINT `saib_void_move_batch_foreign` FOREIGN KEY (`tenant_id`, `void_stock_movement_batch_id`) REFERENCES `stock_movement_batches` (`tenant_id`, `id`) ON UPDATE CASCADE,
  CONSTRAINT `saib_warehouse_foreign` FOREIGN KEY (`tenant_id`, `warehouse_id`) REFERENCES `warehouses` (`tenant_id`, `id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_adjustment_item_batches`
--

LOCK TABLES `stock_adjustment_item_batches` WRITE;
/*!40000 ALTER TABLE `stock_adjustment_item_batches` DISABLE KEYS */;
INSERT INTO `stock_adjustment_item_batches` VALUES (1,1,1,2,3,4,'in',100.000,50.0000,5000.00,1,NULL,'2026-07-25 16:57:45','2026-07-25 16:57:45'),(2,1,2,2,3,5,'in',100.000,55.0000,5500.00,2,NULL,'2026-07-25 17:09:49','2026-07-25 17:09:49'),(3,1,3,2,4,6,'in',20.000,15.0000,300.00,4,NULL,'2026-07-26 10:07:23','2026-07-26 10:07:23'),(4,1,4,2,4,8,'in',50.000,15.0000,750.00,7,NULL,'2026-07-26 11:42:00','2026-07-26 11:42:00'),(5,1,5,2,5,10,'in',50.000,0.0000,0.00,14,NULL,'2026-07-27 02:07:39','2026-07-27 02:07:39'),(6,1,6,2,5,11,'in',50.000,10.0000,500.00,15,NULL,'2026-07-27 02:08:20','2026-07-27 02:08:20');
/*!40000 ALTER TABLE `stock_adjustment_item_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_adjustment_items`
--

DROP TABLE IF EXISTS `stock_adjustment_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stock_adjustment_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `stock_adjustment_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  `direction` enum('in','out') NOT NULL,
  `quantity` decimal(14,3) NOT NULL,
  `unit_cost` decimal(18,4) NOT NULL DEFAULT 0.0000,
  `line_total` decimal(18,2) NOT NULL DEFAULT 0.00,
  `stock_movement_id` bigint(20) unsigned DEFAULT NULL,
  `void_stock_movement_id` bigint(20) unsigned DEFAULT NULL,
  `notes` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `stock_adjustment_items_adjustment_product_unique` (`stock_adjustment_id`,`product_id`),
  UNIQUE KEY `stock_adjustment_items_tenant_id_unique` (`tenant_id`,`id`),
  UNIQUE KEY `stock_adjustment_items_context_unique` (`tenant_id`,`id`,`product_id`),
  UNIQUE KEY `stock_adjustment_items_stock_move_unique` (`tenant_id`,`stock_movement_id`),
  UNIQUE KEY `stock_adjustment_items_void_move_unique` (`tenant_id`,`void_stock_movement_id`),
  KEY `stock_adjustment_items_tenant_adjustment_index` (`tenant_id`,`stock_adjustment_id`),
  KEY `stock_adjustment_items_tenant_product_index` (`tenant_id`,`product_id`),
  CONSTRAINT `stock_adjustment_items_adjustment_foreign` FOREIGN KEY (`tenant_id`, `stock_adjustment_id`) REFERENCES `stock_adjustments` (`tenant_id`, `id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `stock_adjustment_items_product_foreign` FOREIGN KEY (`tenant_id`, `product_id`) REFERENCES `products` (`tenant_id`, `id`) ON UPDATE CASCADE,
  CONSTRAINT `stock_adjustment_items_stock_move_foreign` FOREIGN KEY (`tenant_id`, `stock_movement_id`) REFERENCES `stock_movements` (`tenant_id`, `id`) ON UPDATE CASCADE,
  CONSTRAINT `stock_adjustment_items_void_move_foreign` FOREIGN KEY (`tenant_id`, `void_stock_movement_id`) REFERENCES `stock_movements` (`tenant_id`, `id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_adjustment_items`
--

LOCK TABLES `stock_adjustment_items` WRITE;
/*!40000 ALTER TABLE `stock_adjustment_items` DISABLE KEYS */;
INSERT INTO `stock_adjustment_items` VALUES (1,1,1,3,'in',100.000,50.0000,5000.00,12,NULL,NULL,'2026-07-25 16:57:45','2026-07-25 16:57:45'),(2,1,2,3,'in',100.000,55.0000,5500.00,13,NULL,NULL,'2026-07-25 17:09:49','2026-07-25 17:09:49'),(3,1,3,4,'in',20.000,15.0000,300.00,15,NULL,NULL,'2026-07-26 10:07:23','2026-07-26 10:07:23'),(4,1,4,4,'in',50.000,15.0000,750.00,18,NULL,NULL,'2026-07-26 11:42:00','2026-07-26 11:42:00'),(5,1,5,5,'in',50.000,0.0000,0.00,25,NULL,NULL,'2026-07-27 02:07:39','2026-07-27 02:07:39'),(6,1,6,5,'in',50.000,10.0000,500.00,26,NULL,NULL,'2026-07-27 02:08:20','2026-07-27 02:08:20');
/*!40000 ALTER TABLE `stock_adjustment_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_adjustments`
--

DROP TABLE IF EXISTS `stock_adjustments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stock_adjustments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `branch_id` bigint(20) unsigned NOT NULL,
  `warehouse_id` bigint(20) unsigned NOT NULL,
  `adjustment_number` varchar(80) NOT NULL,
  `adjustment_date` date NOT NULL,
  `adjustment_type` enum('opening_stock','stock_in','stock_out','correction_in','correction_out','stock_count_in','stock_count_out','damage','expired','lost_missing','return_in','return_out','other') NOT NULL,
  `status` enum('draft','posted','voided') NOT NULL DEFAULT 'draft',
  `reference_no` varchar(120) DEFAULT NULL,
  `reason` varchar(500) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `total_quantity` decimal(14,3) NOT NULL DEFAULT 0.000,
  `total_cost` decimal(18,2) NOT NULL DEFAULT 0.00,
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `posted_by` bigint(20) unsigned DEFAULT NULL,
  `posted_at` timestamp NULL DEFAULT NULL,
  `voided_by` bigint(20) unsigned DEFAULT NULL,
  `voided_at` timestamp NULL DEFAULT NULL,
  `void_reason` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `stock_adjustments_tenant_number_unique` (`tenant_id`,`adjustment_number`),
  UNIQUE KEY `stock_adjustments_tenant_id_unique` (`tenant_id`,`id`),
  UNIQUE KEY `stock_adjustments_context_unique` (`tenant_id`,`id`,`branch_id`,`warehouse_id`),
  KEY `stock_adjustments_tenant_status_date_index` (`tenant_id`,`status`,`adjustment_date`),
  KEY `stock_adjustments_tenant_type_date_index` (`tenant_id`,`adjustment_type`,`adjustment_date`),
  KEY `stock_adjustments_tenant_warehouse_date_index` (`tenant_id`,`warehouse_id`,`adjustment_date`),
  KEY `stock_adjustments_reference_index` (`tenant_id`,`reference_no`),
  KEY `stock_adjustments_warehouse_context_foreign` (`tenant_id`,`branch_id`,`warehouse_id`),
  CONSTRAINT `stock_adjustments_warehouse_context_foreign` FOREIGN KEY (`tenant_id`, `branch_id`, `warehouse_id`) REFERENCES `warehouses` (`tenant_id`, `branch_id`, `id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_adjustments`
--

LOCK TABLES `stock_adjustments` WRITE;
/*!40000 ALTER TABLE `stock_adjustments` DISABLE KEYS */;
INSERT INTO `stock_adjustments` VALUES (1,1,3,2,'OPEN-20260726005745-E1V5IK','2026-07-26','opening_stock','posted',NULL,'Initial warehouse stock position',NULL,100.000,5000.00,1,1,'2026-07-25 16:57:45',NULL,NULL,NULL,'2026-07-25 16:57:45','2026-07-25 16:57:45',NULL),(2,1,3,2,'STK-20260726010949-F7RBXI','2026-07-26','stock_in','posted',NULL,'Additional warehouse stock',NULL,100.000,5500.00,1,1,'2026-07-25 17:09:49',NULL,NULL,NULL,'2026-07-25 17:09:49','2026-07-25 17:09:49',NULL),(3,1,3,2,'OPEN-20260726180723-ZN0YLL','2026-07-26','opening_stock','posted',NULL,'Initial warehouse stock position',NULL,20.000,300.00,1,1,'2026-07-26 10:07:23',NULL,NULL,NULL,'2026-07-26 10:07:23','2026-07-26 10:07:23',NULL),(4,1,3,2,'STK-20260726194200-KR4M95','2026-07-26','stock_in','posted',NULL,'Additional warehouse stock',NULL,50.000,750.00,1,1,'2026-07-26 11:42:00',NULL,NULL,NULL,'2026-07-26 11:42:00','2026-07-26 11:42:00',NULL),(5,1,3,2,'OPEN-20260727100739-TINRRF','2026-07-27','opening_stock','posted',NULL,'Initial warehouse stock position',NULL,50.000,0.00,1,1,'2026-07-27 02:07:39',NULL,NULL,NULL,'2026-07-27 02:07:39','2026-07-27 02:07:39',NULL),(6,1,3,2,'ADJ-20260727100820-I3RSOK','2026-07-27','stock_in','posted',NULL,'Manual stock-in',NULL,50.000,500.00,1,1,'2026-07-27 02:08:20',NULL,NULL,NULL,'2026-07-27 02:08:20','2026-07-27 02:08:20',NULL);
/*!40000 ALTER TABLE `stock_adjustments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_batch_status_histories`
--

DROP TABLE IF EXISTS `stock_batch_status_histories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stock_batch_status_histories` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `stock_batch_id` bigint(20) unsigned NOT NULL,
  `previous_status` enum('active','depleted','expired','quarantined','recalled','closed') DEFAULT NULL,
  `new_status` enum('active','depleted','expired','quarantined','recalled','closed') NOT NULL,
  `reason` varchar(500) DEFAULT NULL,
  `reference_type` varchar(100) DEFAULT NULL,
  `reference_id` bigint(20) unsigned DEFAULT NULL,
  `reference_no` varchar(120) DEFAULT NULL,
  `changed_by` bigint(20) unsigned DEFAULT NULL,
  `changed_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sbsh_tenant_id_unique` (`tenant_id`,`id`),
  KEY `sbsh_tenant_batch_index` (`tenant_id`,`stock_batch_id`),
  KEY `sbsh_tenant_status_date_index` (`tenant_id`,`new_status`,`changed_at`),
  KEY `sbsh_reference_index` (`tenant_id`,`reference_type`,`reference_id`),
  CONSTRAINT `sbsh_batch_foreign` FOREIGN KEY (`tenant_id`, `stock_batch_id`) REFERENCES `stock_batches` (`tenant_id`, `id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_batch_status_histories`
--

LOCK TABLES `stock_batch_status_histories` WRITE;
/*!40000 ALTER TABLE `stock_batch_status_histories` DISABLE KEYS */;
/*!40000 ALTER TABLE `stock_batch_status_histories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_batches`
--

DROP TABLE IF EXISTS `stock_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stock_batches` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  `supplier_id` bigint(20) unsigned DEFAULT NULL,
  `purchase_receipt_item_id` bigint(20) unsigned DEFAULT NULL,
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
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `stock_batches_tenant_code_unique` (`tenant_id`,`batch_code`),
  UNIQUE KEY `stock_batches_tenant_id_unique` (`tenant_id`,`id`),
  UNIQUE KEY `stock_batches_tenant_id_product_unique` (`tenant_id`,`id`,`product_id`),
  KEY `stock_batches_tenant_product_index` (`tenant_id`,`product_id`),
  KEY `stock_batches_tenant_status_index` (`tenant_id`,`status`),
  KEY `stock_batches_tenant_expiration_index` (`tenant_id`,`expiration_date`),
  KEY `stock_batches_supplier_index` (`supplier_id`),
  KEY `stock_batches_receipt_item_index` (`purchase_receipt_item_id`),
  KEY `stock_batches_supplier_foreign` (`tenant_id`,`supplier_id`),
  KEY `stock_batches_receipt_item_foreign` (`tenant_id`,`purchase_receipt_item_id`),
  CONSTRAINT `stock_batches_product_foreign` FOREIGN KEY (`tenant_id`, `product_id`) REFERENCES `products` (`tenant_id`, `id`) ON UPDATE CASCADE,
  CONSTRAINT `stock_batches_receipt_item_foreign` FOREIGN KEY (`tenant_id`, `purchase_receipt_item_id`) REFERENCES `purchase_receipt_items` (`tenant_id`, `id`) ON UPDATE CASCADE,
  CONSTRAINT `stock_batches_supplier_foreign` FOREIGN KEY (`tenant_id`, `supplier_id`) REFERENCES `suppliers` (`tenant_id`, `id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_batches`
--

LOCK TABLES `stock_batches` WRITE;
/*!40000 ALTER TABLE `stock_batches` DISABLE KEYS */;
INSERT INTO `stock_batches` VALUES (1,1,2,NULL,NULL,'LEGACY-P2-W2',NULL,'legacy_import','warehouse_stocks#2','2026-07-23',NULL,NULL,25.0000,193.000,'active','Legacy opening batch created from the existing warehouse stock balance before batch tracking was enabled.',NULL,'2026-07-16 01:15:06','2026-07-25 06:19:00'),(2,1,1,NULL,NULL,'LEGACY-P1-W2',NULL,'legacy_import','warehouse_stocks#5','2026-07-24',NULL,NULL,50.0000,48.000,'active','Legacy opening batch created from the existing warehouse stock balance before batch tracking was enabled.',NULL,'2026-07-23 02:50:39','2026-07-25 06:19:00'),(4,1,3,NULL,NULL,'BAT-20260726-OS8H3I',NULL,'opening_stock','OPEN-20260726005745-E1V5IK','2026-07-26',NULL,'2026-07-31',50.0000,100.000,'active',NULL,1,'2026-07-25 16:57:45','2026-07-26 04:27:50'),(5,1,3,NULL,NULL,'BAT-20260726-HPO0EO',NULL,'adjustment','STK-20260726010949-F7RBXI','2026-07-26',NULL,'2026-08-20',55.0000,100.000,'active',NULL,1,'2026-07-25 17:09:49','2026-07-25 17:09:49'),(6,1,4,NULL,NULL,'BAT-20260726-WHVF5E',NULL,'opening_stock','OPEN-20260726180723-ZN0YLL','2026-07-26',NULL,NULL,15.0000,20.000,'active',NULL,1,'2026-07-26 10:07:23','2026-07-26 10:07:23'),(7,1,3,2,5,'BAT-20260726-RPA9PX',NULL,'purchase_receipt','RCV-20260726-DBMC7J','2026-07-26',NULL,'2026-08-12',50.0000,300.000,'active',NULL,1,'2026-07-26 11:38:47','2026-07-26 11:38:47'),(8,1,4,NULL,NULL,'BAT-20260726-SYA30Q',NULL,'adjustment','STK-20260726194200-KR4M95','2026-07-26',NULL,NULL,15.0000,50.000,'active',NULL,1,'2026-07-26 11:42:00','2026-07-26 11:42:00'),(9,1,4,2,6,'BAT-20260726-HP0KJM',NULL,'purchase_receipt','RCV-20260726-3ISROM','2026-07-26',NULL,NULL,15.0000,99.998,'active',NULL,1,'2026-07-26 11:45:40','2026-07-26 11:45:40'),(10,1,5,NULL,NULL,'BAT-20260727-AKHAHS',NULL,'opening_stock','OPEN-20260727100739-TINRRF','2026-07-27',NULL,NULL,0.0000,50.000,'active',NULL,1,'2026-07-27 02:07:39','2026-07-27 02:07:39'),(11,1,5,NULL,NULL,'BAT-20260727-YJISJF',NULL,'adjustment','ADJ-20260727100820-I3RSOK','2026-07-27',NULL,NULL,10.0000,50.000,'active',NULL,1,'2026-07-27 02:08:20','2026-07-27 02:08:20'),(12,1,5,2,7,'BAT-20260727-ROGIYT',NULL,'purchase_receipt','RCV-20260727-IO7DSA','2026-07-27',NULL,NULL,10.0000,50.000,'active',NULL,1,'2026-07-27 02:09:42','2026-07-27 02:09:42'),(13,1,4,2,8,'BAT-20260728-LBXDSZ',NULL,'purchase_receipt','RCV-20260728-4MUS6J','2026-07-28',NULL,NULL,15.0000,0.002,'active',NULL,1,'2026-07-28 01:38:29','2026-07-28 01:38:29'),(14,1,5,2,9,'BAT-20260728-CUVEDJ',NULL,'purchase_receipt','RCV-20260728-NPYWCP','2026-07-28',NULL,NULL,0.0000,50.000,'active',NULL,1,'2026-07-28 01:39:16','2026-07-28 01:39:16');
/*!40000 ALTER TABLE `stock_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_batches_backup_before_batch_core_v3_20260725`
--

DROP TABLE IF EXISTS `stock_batches_backup_before_batch_core_v3_20260725`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stock_batches_backup_before_batch_core_v3_20260725` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  `supplier_id` bigint(20) unsigned DEFAULT NULL,
  `purchase_receipt_item_id` bigint(20) unsigned DEFAULT NULL,
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
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `stock_batches_tenant_code_unique` (`tenant_id`,`batch_code`),
  UNIQUE KEY `stock_batches_tenant_id_unique` (`tenant_id`,`id`),
  UNIQUE KEY `stock_batches_tenant_id_product_unique` (`tenant_id`,`id`,`product_id`),
  KEY `stock_batches_tenant_product_index` (`tenant_id`,`product_id`),
  KEY `stock_batches_tenant_status_index` (`tenant_id`,`status`),
  KEY `stock_batches_tenant_expiration_index` (`tenant_id`,`expiration_date`),
  KEY `stock_batches_supplier_index` (`supplier_id`),
  KEY `stock_batches_receipt_item_index` (`purchase_receipt_item_id`),
  KEY `stock_batches_supplier_foreign` (`tenant_id`,`supplier_id`),
  KEY `stock_batches_receipt_item_foreign` (`tenant_id`,`purchase_receipt_item_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_batches_backup_before_batch_core_v3_20260725`
--

LOCK TABLES `stock_batches_backup_before_batch_core_v3_20260725` WRITE;
/*!40000 ALTER TABLE `stock_batches_backup_before_batch_core_v3_20260725` DISABLE KEYS */;
INSERT INTO `stock_batches_backup_before_batch_core_v3_20260725` VALUES (1,1,2,NULL,NULL,'LEGACY-P2-W2',NULL,'legacy_import','warehouse_stocks#2','2026-07-23',NULL,NULL,25.0000,193.000,'active','Legacy opening batch created from the existing warehouse stock balance before batch tracking was enabled.',NULL,'2026-07-16 01:15:06','2026-07-25 06:19:00'),(2,1,1,NULL,NULL,'LEGACY-P1-W2',NULL,'legacy_import','warehouse_stocks#5','2026-07-24',NULL,NULL,50.0000,48.000,'active','Legacy opening batch created from the existing warehouse stock balance before batch tracking was enabled.',NULL,'2026-07-23 02:50:39','2026-07-25 06:19:00');
/*!40000 ALTER TABLE `stock_batches_backup_before_batch_core_v3_20260725` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_issuance_item_batches`
--

DROP TABLE IF EXISTS `stock_issuance_item_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stock_issuance_item_batches` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `stock_issuance_item_id` bigint(20) unsigned NOT NULL,
  `warehouse_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  `stock_batch_id` bigint(20) unsigned NOT NULL,
  `stock_movement_batch_id` bigint(20) unsigned DEFAULT NULL,
  `void_stock_movement_batch_id` bigint(20) unsigned DEFAULT NULL,
  `quantity_issued` decimal(14,3) NOT NULL,
  `unit_cost` decimal(18,4) NOT NULL DEFAULT 0.0000,
  `line_total` decimal(18,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `siib_item_batch_warehouse_unique` (`stock_issuance_item_id`,`stock_batch_id`,`warehouse_id`),
  UNIQUE KEY `siib_tenant_id_unique` (`tenant_id`,`id`),
  UNIQUE KEY `siib_movement_batch_unique` (`tenant_id`,`stock_movement_batch_id`),
  UNIQUE KEY `siib_void_move_batch_unique` (`tenant_id`,`void_stock_movement_batch_id`),
  KEY `siib_tenant_item_index` (`tenant_id`,`stock_issuance_item_id`),
  KEY `siib_tenant_product_index` (`tenant_id`,`product_id`),
  KEY `siib_tenant_batch_index` (`tenant_id`,`stock_batch_id`),
  KEY `siib_warehouse_foreign` (`tenant_id`,`warehouse_id`),
  KEY `siib_batch_product_foreign` (`tenant_id`,`stock_batch_id`,`product_id`),
  CONSTRAINT `siib_batch_product_foreign` FOREIGN KEY (`tenant_id`, `stock_batch_id`, `product_id`) REFERENCES `stock_batches` (`tenant_id`, `id`, `product_id`) ON UPDATE CASCADE,
  CONSTRAINT `siib_issuance_item_foreign` FOREIGN KEY (`tenant_id`, `stock_issuance_item_id`) REFERENCES `stock_issuance_items` (`tenant_id`, `id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `siib_movement_batch_foreign` FOREIGN KEY (`tenant_id`, `stock_movement_batch_id`) REFERENCES `stock_movement_batches` (`tenant_id`, `id`) ON UPDATE CASCADE,
  CONSTRAINT `siib_void_move_batch_foreign` FOREIGN KEY (`tenant_id`, `void_stock_movement_batch_id`) REFERENCES `stock_movement_batches` (`tenant_id`, `id`) ON UPDATE CASCADE,
  CONSTRAINT `siib_warehouse_foreign` FOREIGN KEY (`tenant_id`, `warehouse_id`) REFERENCES `warehouses` (`tenant_id`, `id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_issuance_item_batches`
--

LOCK TABLES `stock_issuance_item_batches` WRITE;
/*!40000 ALTER TABLE `stock_issuance_item_batches` DISABLE KEYS */;
INSERT INTO `stock_issuance_item_batches` VALUES (1,1,7,2,3,4,3,NULL,13.000,50.0000,650.00,'2026-07-26 02:35:26','2026-07-26 04:27:50'),(2,1,8,2,4,6,5,NULL,2.000,15.0000,30.00,'2026-07-26 11:35:37','2026-07-26 11:35:37'),(3,1,9,2,1,2,9,NULL,1.000,50.0000,50.00,'2026-07-26 14:33:05','2026-07-26 14:33:05'),(4,1,10,2,4,6,10,NULL,1.000,15.0000,15.00,'2026-07-26 14:33:05','2026-07-26 14:33:05'),(5,1,11,2,2,1,11,NULL,1.000,25.0000,25.00,'2026-07-26 14:33:05','2026-07-26 14:33:05'),(6,1,12,2,3,4,12,NULL,2.000,50.0000,100.00,'2026-07-26 14:33:05','2026-07-26 14:33:05'),(7,1,13,2,3,4,13,NULL,5.000,50.0000,250.00,'2026-07-26 14:33:11','2026-07-26 14:33:11'),(8,1,14,2,5,10,16,NULL,3.000,0.0000,0.00,'2026-07-27 02:08:41','2026-07-27 02:08:41');
/*!40000 ALTER TABLE `stock_issuance_item_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_issuance_items`
--

DROP TABLE IF EXISTS `stock_issuance_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stock_issuance_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `stock_issuance_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  `stock_movement_id` bigint(20) unsigned DEFAULT NULL,
  `void_stock_movement_id` bigint(20) unsigned DEFAULT NULL,
  `product_name` varchar(180) NOT NULL,
  `product_sku` varchar(100) DEFAULT NULL,
  `unit` varchar(50) NOT NULL DEFAULT 'pcs',
  `quantity_issued` decimal(14,3) NOT NULL DEFAULT 0.000,
  `unit_cost` decimal(18,4) NOT NULL DEFAULT 0.0000,
  `line_total` decimal(18,2) NOT NULL DEFAULT 0.00,
  `notes` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `stock_issuance_items_tenant_id_unique` (`tenant_id`,`id`),
  UNIQUE KEY `stock_issuance_items_issuance_product_unique` (`stock_issuance_id`,`product_id`),
  UNIQUE KEY `stock_issuance_items_stock_move_unique` (`tenant_id`,`stock_movement_id`),
  UNIQUE KEY `stock_issuance_items_void_move_unique` (`tenant_id`,`void_stock_movement_id`),
  KEY `stock_issuance_items_tenant_index` (`tenant_id`),
  KEY `stock_issuance_items_issuance_index` (`stock_issuance_id`),
  KEY `stock_issuance_items_product_index` (`product_id`),
  KEY `stock_issuance_items_tenant_issuance_index` (`tenant_id`,`stock_issuance_id`),
  KEY `stock_issuance_items_tenant_product_index` (`tenant_id`,`product_id`),
  CONSTRAINT `stock_issuance_items_issuance_id_foreign` FOREIGN KEY (`stock_issuance_id`) REFERENCES `stock_issuances` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `stock_issuance_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `stock_issuance_items_stock_move_foreign` FOREIGN KEY (`tenant_id`, `stock_movement_id`) REFERENCES `stock_movements` (`tenant_id`, `id`) ON UPDATE CASCADE,
  CONSTRAINT `stock_issuance_items_tenant_issuance_foreign` FOREIGN KEY (`tenant_id`, `stock_issuance_id`) REFERENCES `stock_issuances` (`tenant_id`, `id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `stock_issuance_items_tenant_product_foreign` FOREIGN KEY (`tenant_id`, `product_id`) REFERENCES `products` (`tenant_id`, `id`) ON UPDATE CASCADE,
  CONSTRAINT `stock_issuance_items_void_move_foreign` FOREIGN KEY (`tenant_id`, `void_stock_movement_id`) REFERENCES `stock_movements` (`tenant_id`, `id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_issuance_items`
--

LOCK TABLES `stock_issuance_items` WRITE;
/*!40000 ALTER TABLE `stock_issuance_items` DISABLE KEYS */;
INSERT INTO `stock_issuance_items` VALUES (1,1,1,2,5,NULL,'Safeguard','QW1','pcs',1.000,25.0000,25.00,NULL,'2026-07-21 08:46:29','2026-07-21 08:46:29'),(2,1,2,2,6,NULL,'Safeguard','QW1','pcs',1.000,25.0000,25.00,NULL,'2026-07-21 08:46:44','2026-07-21 08:46:44'),(3,1,3,2,7,NULL,'Safeguard','QW1','pcs',3.000,25.0000,75.00,NULL,'2026-07-23 01:19:10','2026-07-23 01:19:10'),(4,1,4,2,8,NULL,'Safeguard','QW1','pcs',2.000,25.0000,50.00,NULL,'2026-07-23 01:19:39','2026-07-23 01:19:39'),(5,1,5,1,10,NULL,'qw','QW','pcs',1.000,50.0000,50.00,NULL,'2026-07-23 03:26:50','2026-07-23 03:26:50'),(6,1,6,1,11,NULL,'qw','QW','pcs',1.000,50.0000,50.00,NULL,'2026-07-24 05:52:53','2026-07-24 05:52:53'),(7,1,7,3,14,NULL,'Dove',NULL,'pcs',13.000,50.0000,650.00,NULL,'2026-07-26 02:35:26','2026-07-26 04:27:50'),(8,1,8,4,16,NULL,'Royal',NULL,'pcs',2.000,15.0000,30.00,NULL,'2026-07-26 11:35:37','2026-07-26 11:35:37'),(9,1,9,1,20,NULL,'qw','QW','pcs',1.000,50.0000,50.00,NULL,'2026-07-26 14:33:05','2026-07-26 14:33:05'),(10,1,9,4,21,NULL,'Royal',NULL,'pcs',1.000,15.0000,15.00,NULL,'2026-07-26 14:33:05','2026-07-26 14:33:05'),(11,1,9,2,22,NULL,'Safeguard','QW1','pcs',1.000,25.0000,25.00,NULL,'2026-07-26 14:33:05','2026-07-26 14:33:05'),(12,1,9,3,23,NULL,'Dove',NULL,'pcs',2.000,50.0000,100.00,NULL,'2026-07-26 14:33:05','2026-07-26 14:33:05'),(13,1,10,3,24,NULL,'Dove',NULL,'pcs',5.000,50.0000,250.00,NULL,'2026-07-26 14:33:11','2026-07-26 14:33:11'),(14,1,11,5,27,NULL,'Clover Chips',NULL,'pcs',3.000,0.0000,0.00,NULL,'2026-07-27 02:08:41','2026-07-27 02:08:41');
/*!40000 ALTER TABLE `stock_issuance_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_issuances`
--

DROP TABLE IF EXISTS `stock_issuances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stock_issuances` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `branch_id` bigint(20) unsigned NOT NULL,
  `warehouse_id` bigint(20) unsigned NOT NULL,
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
  `issued_by` bigint(20) unsigned DEFAULT NULL,
  `posted_at` timestamp NULL DEFAULT NULL,
  `voided_by` bigint(20) unsigned DEFAULT NULL,
  `voided_at` timestamp NULL DEFAULT NULL,
  `void_reason` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `stock_issuances_tenant_number_unique` (`tenant_id`,`issuance_number`),
  UNIQUE KEY `stock_issuances_tenant_id_unique` (`tenant_id`,`id`),
  UNIQUE KEY `stock_issuances_context_unique` (`tenant_id`,`id`,`branch_id`,`warehouse_id`),
  KEY `stock_issuances_tenant_index` (`tenant_id`),
  KEY `stock_issuances_branch_index` (`branch_id`),
  KEY `stock_issuances_warehouse_index` (`warehouse_id`),
  KEY `stock_issuances_tenant_status_date_index` (`tenant_id`,`status`,`issuance_date`),
  KEY `stock_issuances_tenant_branch_date_index` (`tenant_id`,`branch_id`,`issuance_date`),
  KEY `stock_issuances_tenant_warehouse_date_index` (`tenant_id`,`warehouse_id`,`issuance_date`),
  KEY `stock_issuances_tenant_reason_date_index` (`tenant_id`,`reason`,`issuance_date`),
  KEY `stock_issuances_reference_index` (`tenant_id`,`reference_no`),
  KEY `stock_issuances_issued_by_index` (`issued_by`),
  KEY `stock_issuances_voided_by_index` (`voided_by`),
  KEY `stock_issuances_tenant_branch_warehouse_foreign` (`tenant_id`,`branch_id`,`warehouse_id`),
  CONSTRAINT `stock_issuances_branch_id_foreign` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `stock_issuances_tenant_branch_warehouse_foreign` FOREIGN KEY (`tenant_id`, `branch_id`, `warehouse_id`) REFERENCES `warehouses` (`tenant_id`, `branch_id`, `id`) ON UPDATE CASCADE,
  CONSTRAINT `stock_issuances_warehouse_id_foreign` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_issuances`
--

LOCK TABLES `stock_issuances` WRITE;
/*!40000 ALTER TABLE `stock_issuances` DISABLE KEYS */;
INSERT INTO `stock_issuances` VALUES (1,1,3,2,'ISS-20260721-UOEW3U','2026-07-21','used_consumed',NULL,NULL,NULL,NULL,'posted',1.000,25.00,NULL,1,'2026-07-21 08:46:29',NULL,NULL,NULL,'2026-07-21 08:46:29','2026-07-21 08:46:29'),(2,1,3,2,'ISS-20260721-JOSTEU','2026-07-21','used_consumed',NULL,NULL,NULL,NULL,'posted',1.000,25.00,NULL,1,'2026-07-21 08:46:44',NULL,NULL,NULL,'2026-07-21 08:46:44','2026-07-21 08:46:44'),(3,1,3,2,'ISS-20260723-P8RPMR','2026-07-23','used_consumed',NULL,NULL,NULL,NULL,'posted',3.000,75.00,NULL,1,'2026-07-23 01:19:10',NULL,NULL,NULL,'2026-07-23 01:19:10','2026-07-23 01:19:10'),(4,1,3,2,'ISS-20260723-C8KYGF','2026-07-23','used_consumed','jc','jcjc',NULL,'cjjjjc','posted',2.000,50.00,NULL,1,'2026-07-23 01:19:39',NULL,NULL,NULL,'2026-07-23 01:19:39','2026-07-23 01:19:39'),(5,1,3,2,'ISS-20260723-GGYKMP','2026-07-23','used_consumed',NULL,NULL,NULL,NULL,'posted',1.000,50.00,NULL,1,'2026-07-23 03:26:50',NULL,NULL,NULL,'2026-07-23 03:26:50','2026-07-23 03:26:50'),(6,1,3,2,'ISS-20260724-T6FGMY','2026-07-24','used_consumed',NULL,NULL,NULL,NULL,'posted',1.000,50.00,NULL,1,'2026-07-24 05:52:53',NULL,NULL,NULL,'2026-07-24 05:52:53','2026-07-24 05:52:53'),(7,1,3,2,'ISS-20260726-BS8W3J','2026-07-26','used_consumed',NULL,NULL,NULL,NULL,'posted',13.000,650.00,NULL,1,'2026-07-26 02:35:26',NULL,NULL,NULL,'2026-07-26 02:35:26','2026-07-26 04:27:50'),(8,1,3,2,'ISS-20260726-GMMSKT','2026-07-26','used_consumed',NULL,NULL,NULL,NULL,'posted',2.000,30.00,NULL,1,'2026-07-26 11:35:37',NULL,NULL,NULL,'2026-07-26 11:35:37','2026-07-26 11:35:37'),(9,1,3,2,'ISS-20260726-AEYWWI','2026-07-26','used_consumed',NULL,NULL,NULL,NULL,'posted',5.000,190.00,NULL,1,'2026-07-26 14:33:05',NULL,NULL,NULL,'2026-07-26 14:33:05','2026-07-26 14:33:05'),(10,1,3,2,'ISS-20260726-B66V0Y','2026-07-26','used_consumed',NULL,NULL,NULL,NULL,'posted',5.000,250.00,NULL,1,'2026-07-26 14:33:11',NULL,NULL,NULL,'2026-07-26 14:33:11','2026-07-26 14:33:11'),(11,1,3,2,'ISS-20260727-ITYAEL','2026-07-27','used_consumed',NULL,NULL,NULL,NULL,'posted',3.000,0.00,NULL,1,'2026-07-27 02:08:41',NULL,NULL,NULL,'2026-07-27 02:08:41','2026-07-27 02:08:41');
/*!40000 ALTER TABLE `stock_issuances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_movement_batches`
--

DROP TABLE IF EXISTS `stock_movement_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stock_movement_batches` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `stock_movement_id` bigint(20) unsigned NOT NULL,
  `warehouse_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  `stock_batch_id` bigint(20) unsigned NOT NULL,
  `reversal_of_stock_movement_batch_id` bigint(20) unsigned DEFAULT NULL,
  `direction` enum('in','out') NOT NULL,
  `quantity` decimal(14,3) NOT NULL,
  `batch_quantity_before` decimal(14,3) NOT NULL DEFAULT 0.000,
  `batch_quantity_after` decimal(14,3) NOT NULL DEFAULT 0.000,
  `unit_cost` decimal(18,4) NOT NULL DEFAULT 0.0000,
  `total_cost` decimal(18,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `smb_move_batch_unique` (`stock_movement_id`,`stock_batch_id`),
  UNIQUE KEY `smb_tenant_id_unique` (`tenant_id`,`id`),
  UNIQUE KEY `smb_one_reversal_unique` (`tenant_id`,`reversal_of_stock_movement_batch_id`),
  KEY `smb_tenant_movement_index` (`tenant_id`,`stock_movement_id`),
  KEY `smb_tenant_batch_index` (`tenant_id`,`stock_batch_id`),
  KEY `smb_tenant_product_index` (`tenant_id`,`product_id`),
  KEY `smb_warehouse_foreign` (`tenant_id`,`warehouse_id`),
  KEY `smb_batch_product_foreign` (`tenant_id`,`stock_batch_id`,`product_id`),
  CONSTRAINT `smb_batch_product_foreign` FOREIGN KEY (`tenant_id`, `stock_batch_id`, `product_id`) REFERENCES `stock_batches` (`tenant_id`, `id`, `product_id`) ON UPDATE CASCADE,
  CONSTRAINT `smb_movement_foreign` FOREIGN KEY (`tenant_id`, `stock_movement_id`) REFERENCES `stock_movements` (`tenant_id`, `id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `smb_reversal_foreign` FOREIGN KEY (`tenant_id`, `reversal_of_stock_movement_batch_id`) REFERENCES `stock_movement_batches` (`tenant_id`, `id`) ON UPDATE CASCADE,
  CONSTRAINT `smb_warehouse_foreign` FOREIGN KEY (`tenant_id`, `warehouse_id`) REFERENCES `warehouses` (`tenant_id`, `id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_movement_batches`
--

LOCK TABLES `stock_movement_batches` WRITE;
/*!40000 ALTER TABLE `stock_movement_batches` DISABLE KEYS */;
INSERT INTO `stock_movement_batches` VALUES (1,1,12,2,3,4,NULL,'in',100.000,0.000,100.000,50.0000,5000.00,'2026-07-25 16:57:45','2026-07-25 16:57:45'),(2,1,13,2,3,5,NULL,'in',100.000,0.000,100.000,55.0000,5500.00,'2026-07-25 17:09:49','2026-07-25 17:09:49'),(3,1,14,2,3,4,NULL,'out',13.000,100.000,87.000,50.0000,650.00,'2026-07-26 02:35:26','2026-07-26 04:27:50'),(4,1,15,2,4,6,NULL,'in',20.000,0.000,20.000,15.0000,300.00,'2026-07-26 10:07:23','2026-07-26 10:07:23'),(5,1,16,2,4,6,NULL,'out',2.000,20.000,18.000,15.0000,30.00,'2026-07-26 11:35:37','2026-07-26 11:35:37'),(6,1,17,2,3,7,NULL,'in',300.000,0.000,300.000,50.0000,15000.00,'2026-07-26 11:38:47','2026-07-26 11:38:47'),(7,1,18,2,4,8,NULL,'in',50.000,0.000,50.000,15.0000,750.00,'2026-07-26 11:42:00','2026-07-26 11:42:00'),(8,1,19,2,4,9,NULL,'in',99.998,0.000,99.998,15.0000,1499.97,'2026-07-26 11:45:40','2026-07-26 11:45:40'),(9,1,20,2,1,2,NULL,'out',1.000,48.000,47.000,50.0000,50.00,'2026-07-26 14:33:05','2026-07-26 14:33:05'),(10,1,21,2,4,6,NULL,'out',1.000,18.000,17.000,15.0000,15.00,'2026-07-26 14:33:05','2026-07-26 14:33:05'),(11,1,22,2,2,1,NULL,'out',1.000,193.000,192.000,25.0000,25.00,'2026-07-26 14:33:05','2026-07-26 14:33:05'),(12,1,23,2,3,4,NULL,'out',2.000,87.000,85.000,50.0000,100.00,'2026-07-26 14:33:05','2026-07-26 14:33:05'),(13,1,24,2,3,4,NULL,'out',5.000,85.000,80.000,50.0000,250.00,'2026-07-26 14:33:11','2026-07-26 14:33:11'),(14,1,25,2,5,10,NULL,'in',50.000,0.000,50.000,0.0000,0.00,'2026-07-27 02:07:39','2026-07-27 02:07:39'),(15,1,26,2,5,11,NULL,'in',50.000,0.000,50.000,10.0000,500.00,'2026-07-27 02:08:20','2026-07-27 02:08:20'),(16,1,27,2,5,10,NULL,'out',3.000,50.000,47.000,0.0000,0.00,'2026-07-27 02:08:41','2026-07-27 02:08:41'),(17,1,28,2,5,12,NULL,'in',50.000,0.000,50.000,10.0000,500.00,'2026-07-27 02:09:42','2026-07-27 02:09:42'),(18,1,29,2,4,13,NULL,'in',0.002,0.000,0.002,15.0000,0.03,'2026-07-28 01:38:29','2026-07-28 01:38:29'),(19,1,30,2,5,14,NULL,'in',50.000,0.000,50.000,0.0000,0.00,'2026-07-28 01:39:16','2026-07-28 01:39:16');
/*!40000 ALTER TABLE `stock_movement_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_movements`
--

DROP TABLE IF EXISTS `stock_movements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stock_movements` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `warehouse_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
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
  `reference_id` bigint(20) unsigned DEFAULT NULL,
  `reference_no` varchar(120) DEFAULT NULL,
  `related_warehouse_id` bigint(20) unsigned DEFAULT NULL,
  `reversal_of_movement_id` bigint(20) unsigned DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `movement_date` datetime NOT NULL,
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `stock_movements_tenant_id_unique` (`tenant_id`,`id`),
  UNIQUE KEY `stock_movements_one_reversal_unique` (`tenant_id`,`reversal_of_movement_id`),
  KEY `stock_movements_tenant_id_index` (`tenant_id`),
  KEY `stock_movements_warehouse_id_index` (`warehouse_id`),
  KEY `stock_movements_product_id_index` (`product_id`),
  KEY `stock_movements_tenant_warehouse_index` (`tenant_id`,`warehouse_id`),
  KEY `stock_movements_tenant_product_index` (`tenant_id`,`product_id`),
  KEY `stock_movements_type_date_index` (`movement_type`,`movement_date`),
  KEY `stock_movements_reference_index` (`reference_type`,`reference_id`),
  KEY `stock_movements_created_by_index` (`created_by`),
  KEY `stock_movements_related_warehouse_index` (`related_warehouse_id`),
  KEY `stock_movements_tenant_related_warehouse_index` (`tenant_id`,`related_warehouse_id`),
  KEY `stock_movements_batch_status_index` (`tenant_id`,`is_batch_tracked`,`batch_allocation_status`),
  CONSTRAINT `stock_movements_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `stock_movements_related_warehouse_id_foreign` FOREIGN KEY (`related_warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `stock_movements_tenant_product_foreign` FOREIGN KEY (`tenant_id`, `product_id`) REFERENCES `products` (`tenant_id`, `id`) ON UPDATE CASCADE,
  CONSTRAINT `stock_movements_tenant_related_warehouse_foreign` FOREIGN KEY (`tenant_id`, `related_warehouse_id`) REFERENCES `warehouses` (`tenant_id`, `id`) ON UPDATE CASCADE,
  CONSTRAINT `stock_movements_tenant_reversal_foreign` FOREIGN KEY (`tenant_id`, `reversal_of_movement_id`) REFERENCES `stock_movements` (`tenant_id`, `id`) ON UPDATE CASCADE,
  CONSTRAINT `stock_movements_tenant_warehouse_foreign` FOREIGN KEY (`tenant_id`, `warehouse_id`) REFERENCES `warehouses` (`tenant_id`, `id`) ON UPDATE CASCADE,
  CONSTRAINT `stock_movements_warehouse_id_foreign` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_movements`
--

LOCK TABLES `stock_movements` WRITE;
/*!40000 ALTER TABLE `stock_movements` DISABLE KEYS */;
INSERT INTO `stock_movements` VALUES (2,1,2,2,0,'not_required','opening_stock',50.000,0.000,50.000,25.0000,1250.00,NULL,NULL,'opening_stock',NULL,'OPEN-20260716091506-KN1VI1',NULL,NULL,NULL,'2026-07-16 09:15:06',1,'2026-07-16 01:15:06','2026-07-16 01:15:06'),(3,1,2,2,0,'not_required','purchase_receipt',100.000,50.000,150.000,25.0000,2500.00,25.0000,25.0000,'purchase_receipt',1,'RCV-20260720-6YEO6T',NULL,NULL,'Received from PO PO-20260720-ZLP2ZW','2026-07-20 13:48:37',1,'2026-07-20 05:48:37','2026-07-20 05:48:37'),(4,1,2,2,0,'not_required','purchase_receipt',50.000,150.000,200.000,25.0000,1250.00,25.0000,25.0000,'purchase_receipt',2,'RCV-20260721-QHE5FY',NULL,NULL,'Received from PO PO-20260721-IRZAO3','2026-07-21 11:54:45',1,'2026-07-21 03:54:45','2026-07-21 03:54:45'),(5,1,2,2,0,'not_required','stock_out',1.000,200.000,199.000,25.0000,25.00,25.0000,25.0000,'stock_issuance',1,'ISS-20260721-UOEW3U',NULL,NULL,'Stock issuance ISS-20260721-UOEW3U | Reason: Used / Consumed','2026-07-21 16:46:29',1,'2026-07-21 08:46:29','2026-07-21 08:46:29'),(6,1,2,2,0,'not_required','stock_out',1.000,199.000,198.000,25.0000,25.00,25.0000,25.0000,'stock_issuance',2,'ISS-20260721-JOSTEU',NULL,NULL,'Stock issuance ISS-20260721-JOSTEU | Reason: Used / Consumed','2026-07-21 16:46:44',1,'2026-07-21 08:46:44','2026-07-21 08:46:44'),(7,1,2,2,0,'not_required','stock_out',3.000,198.000,195.000,25.0000,75.00,25.0000,25.0000,'stock_issuance',3,'ISS-20260723-P8RPMR',NULL,NULL,'Stock issuance ISS-20260723-P8RPMR | Reason: Used / Consumed','2026-07-23 09:19:10',1,'2026-07-23 01:19:10','2026-07-23 01:19:10'),(8,1,2,2,0,'not_required','stock_out',2.000,195.000,193.000,25.0000,50.00,25.0000,25.0000,'stock_issuance',4,'ISS-20260723-C8KYGF',NULL,NULL,'Stock issuance ISS-20260723-C8KYGF | Reason: Used / Consumed | Issued to: jc | Department: jcjc | Reference: cjjjjc','2026-07-23 09:19:39',1,'2026-07-23 01:19:39','2026-07-23 01:19:39'),(9,1,2,1,0,'not_required','opening_stock',50.000,0.000,50.000,50.0000,2500.00,NULL,NULL,'opening_stock',NULL,'OPEN-20260723105039-C7QTY3',NULL,NULL,NULL,'2026-07-23 10:50:39',1,'2026-07-23 02:50:39','2026-07-23 02:50:39'),(10,1,2,1,0,'not_required','stock_out',1.000,50.000,49.000,50.0000,50.00,50.0000,50.0000,'stock_issuance',5,'ISS-20260723-GGYKMP',NULL,NULL,'Stock issuance ISS-20260723-GGYKMP | Reason: Used / Consumed','2026-07-23 11:26:50',1,'2026-07-23 03:26:50','2026-07-23 03:26:50'),(11,1,2,1,0,'not_required','stock_out',1.000,49.000,48.000,50.0000,50.00,50.0000,50.0000,'stock_issuance',6,'ISS-20260724-T6FGMY',NULL,NULL,'Stock issuance ISS-20260724-T6FGMY | Reason: Used / Consumed','2026-07-24 13:52:53',1,'2026-07-24 05:52:53','2026-07-24 05:52:53'),(12,1,2,3,1,'allocated','opening_stock',100.000,0.000,100.000,50.0000,5000.00,0.0000,50.0000,'stock_adjustment',1,'OPEN-20260726005745-E1V5IK',NULL,NULL,NULL,'2026-07-26 00:57:45',1,'2026-07-25 16:57:45','2026-07-25 16:57:45'),(13,1,2,3,1,'allocated','stock_in',100.000,100.000,200.000,55.0000,5500.00,50.0000,52.5000,'stock_adjustment',2,'STK-20260726010949-F7RBXI',NULL,NULL,NULL,'2026-07-26 01:09:49',1,'2026-07-25 17:09:49','2026-07-25 17:09:49'),(14,1,2,3,1,'allocated','stock_out',13.000,200.000,187.000,50.0000,650.00,52.5000,52.6738,'stock_issuance',7,'ISS-20260726-BS8W3J',NULL,NULL,'Stock issuance ISS-20260726-BS8W3J | Reason: Used / Consumed','2026-07-26 10:35:26',1,'2026-07-26 02:35:26','2026-07-26 04:27:50'),(15,1,2,4,1,'allocated','opening_stock',20.000,0.000,20.000,15.0000,300.00,0.0000,15.0000,'stock_adjustment',3,'OPEN-20260726180723-ZN0YLL',NULL,NULL,NULL,'2026-07-26 18:07:23',1,'2026-07-26 10:07:23','2026-07-26 10:07:23'),(16,1,2,4,1,'allocated','stock_out',2.000,20.000,18.000,15.0000,30.00,15.0000,15.0000,'stock_issuance',8,'ISS-20260726-GMMSKT',NULL,NULL,'Stock issuance ISS-20260726-GMMSKT | Reason: Used / Consumed','2026-07-26 19:35:37',1,'2026-07-26 11:35:37','2026-07-26 11:35:37'),(17,1,2,3,1,'allocated','purchase_receipt',300.000,187.000,487.000,50.0000,15000.00,52.6738,51.0267,'purchase_receipt',5,'RCV-20260726-DBMC7J',NULL,NULL,'Received from PO PO-20260726-6QFBLO','2026-07-26 19:38:47',1,'2026-07-26 11:38:47','2026-07-26 11:38:47'),(18,1,2,4,1,'allocated','stock_in',50.000,18.000,68.000,15.0000,750.00,15.0000,15.0000,'stock_adjustment',4,'STK-20260726194200-KR4M95',NULL,NULL,NULL,'2026-07-26 19:42:00',1,'2026-07-26 11:42:00','2026-07-26 11:42:00'),(19,1,2,4,1,'allocated','purchase_receipt',99.998,68.000,167.998,15.0000,1499.97,15.0000,15.0000,'purchase_receipt',6,'RCV-20260726-3ISROM',NULL,NULL,'Received from PO PO-20260726-POEDFK','2026-07-26 19:45:40',1,'2026-07-26 11:45:40','2026-07-26 11:45:40'),(20,1,2,1,1,'allocated','stock_out',1.000,48.000,47.000,50.0000,50.00,50.0000,50.0000,'stock_issuance',9,'ISS-20260726-AEYWWI',NULL,NULL,'Stock issuance ISS-20260726-AEYWWI | Reason: Used / Consumed','2026-07-26 22:33:05',1,'2026-07-26 14:33:05','2026-07-26 14:33:05'),(21,1,2,4,1,'allocated','stock_out',1.000,167.998,166.998,15.0000,15.00,15.0000,15.0000,'stock_issuance',9,'ISS-20260726-AEYWWI',NULL,NULL,'Stock issuance ISS-20260726-AEYWWI | Reason: Used / Consumed','2026-07-26 22:33:05',1,'2026-07-26 14:33:05','2026-07-26 14:33:05'),(22,1,2,2,1,'allocated','stock_out',1.000,193.000,192.000,25.0000,25.00,25.0000,25.0000,'stock_issuance',9,'ISS-20260726-AEYWWI',NULL,NULL,'Stock issuance ISS-20260726-AEYWWI | Reason: Used / Consumed','2026-07-26 22:33:05',1,'2026-07-26 14:33:05','2026-07-26 14:33:05'),(23,1,2,3,1,'allocated','stock_out',2.000,487.000,485.000,50.0000,100.00,51.0267,51.0309,'stock_issuance',9,'ISS-20260726-AEYWWI',NULL,NULL,'Stock issuance ISS-20260726-AEYWWI | Reason: Used / Consumed','2026-07-26 22:33:05',1,'2026-07-26 14:33:05','2026-07-26 14:33:05'),(24,1,2,3,1,'allocated','stock_out',5.000,485.000,480.000,50.0000,250.00,51.0309,51.0417,'stock_issuance',10,'ISS-20260726-B66V0Y',NULL,NULL,'Stock issuance ISS-20260726-B66V0Y | Reason: Used / Consumed','2026-07-26 22:33:11',1,'2026-07-26 14:33:11','2026-07-26 14:33:11'),(25,1,2,5,1,'allocated','opening_stock',50.000,0.000,50.000,0.0000,0.00,0.0000,0.0000,'stock_adjustment',5,'OPEN-20260727100739-TINRRF',NULL,NULL,NULL,'2026-07-27 10:07:39',1,'2026-07-27 02:07:39','2026-07-27 02:07:39'),(26,1,2,5,1,'allocated','stock_in',50.000,50.000,100.000,10.0000,500.00,0.0000,5.0000,'stock_adjustment',6,'ADJ-20260727100820-I3RSOK',NULL,NULL,NULL,'2026-07-27 10:08:20',1,'2026-07-27 02:08:20','2026-07-27 02:08:20'),(27,1,2,5,1,'allocated','stock_out',3.000,100.000,97.000,0.0000,0.00,5.0000,5.1546,'stock_issuance',11,'ISS-20260727-ITYAEL',NULL,NULL,'Stock issuance ISS-20260727-ITYAEL | Reason: Used / Consumed','2026-07-27 10:08:41',1,'2026-07-27 02:08:41','2026-07-27 02:08:41'),(28,1,2,5,1,'allocated','purchase_receipt',50.000,97.000,147.000,10.0000,500.00,5.1546,6.8027,'purchase_receipt',7,'RCV-20260727-IO7DSA',NULL,NULL,'Received from PO PO-20260727-J0SX27','2026-07-27 10:09:42',1,'2026-07-27 02:09:42','2026-07-27 02:09:42'),(29,1,2,4,1,'allocated','purchase_receipt',0.002,166.998,167.000,15.0000,0.03,15.0000,15.0000,'purchase_receipt',8,'RCV-20260728-4MUS6J',NULL,NULL,'Received from PO PO-20260726-POEDFK','2026-07-28 09:38:29',1,'2026-07-28 01:38:29','2026-07-28 01:38:29'),(30,1,2,5,1,'allocated','purchase_receipt',50.000,147.000,197.000,0.0000,0.00,6.8027,5.0761,'purchase_receipt',9,'RCV-20260728-NPYWCP',NULL,NULL,'Received from PO PO-20260727-96YHUH','2026-07-28 09:39:16',1,'2026-07-28 01:39:16','2026-07-28 01:39:16');
/*!40000 ALTER TABLE `stock_movements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_movements_backup_before_batch_core_v3_20260725`
--

DROP TABLE IF EXISTS `stock_movements_backup_before_batch_core_v3_20260725`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stock_movements_backup_before_batch_core_v3_20260725` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `warehouse_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  `movement_type` enum('opening_stock','stock_in','stock_out','adjustment_in','adjustment_out','transfer_in','transfer_out','purchase_receipt','purchase_receipt_void','sale','return_in','return_out','damage','expired') NOT NULL,
  `quantity` decimal(14,3) NOT NULL,
  `quantity_before` decimal(14,3) NOT NULL DEFAULT 0.000,
  `quantity_after` decimal(14,3) NOT NULL DEFAULT 0.000,
  `unit_cost` decimal(18,4) NOT NULL DEFAULT 0.0000,
  `total_cost` decimal(18,2) NOT NULL DEFAULT 0.00,
  `average_cost_before` decimal(18,4) DEFAULT NULL,
  `average_cost_after` decimal(18,4) DEFAULT NULL,
  `reference_type` varchar(100) DEFAULT NULL,
  `reference_id` bigint(20) unsigned DEFAULT NULL,
  `reference_no` varchar(120) DEFAULT NULL,
  `related_warehouse_id` bigint(20) unsigned DEFAULT NULL,
  `reversal_of_movement_id` bigint(20) unsigned DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `movement_date` datetime NOT NULL,
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `stock_movements_tenant_id_unique` (`tenant_id`,`id`),
  UNIQUE KEY `stock_movements_one_reversal_unique` (`tenant_id`,`reversal_of_movement_id`),
  KEY `stock_movements_tenant_id_index` (`tenant_id`),
  KEY `stock_movements_warehouse_id_index` (`warehouse_id`),
  KEY `stock_movements_product_id_index` (`product_id`),
  KEY `stock_movements_tenant_warehouse_index` (`tenant_id`,`warehouse_id`),
  KEY `stock_movements_tenant_product_index` (`tenant_id`,`product_id`),
  KEY `stock_movements_type_date_index` (`movement_type`,`movement_date`),
  KEY `stock_movements_reference_index` (`reference_type`,`reference_id`),
  KEY `stock_movements_created_by_index` (`created_by`),
  KEY `stock_movements_related_warehouse_index` (`related_warehouse_id`),
  KEY `stock_movements_tenant_related_warehouse_index` (`tenant_id`,`related_warehouse_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_movements_backup_before_batch_core_v3_20260725`
--

LOCK TABLES `stock_movements_backup_before_batch_core_v3_20260725` WRITE;
/*!40000 ALTER TABLE `stock_movements_backup_before_batch_core_v3_20260725` DISABLE KEYS */;
INSERT INTO `stock_movements_backup_before_batch_core_v3_20260725` VALUES (2,1,2,2,'opening_stock',50.000,0.000,50.000,25.0000,1250.00,NULL,NULL,'opening_stock',NULL,'OPEN-20260716091506-KN1VI1',NULL,NULL,NULL,'2026-07-16 09:15:06',1,'2026-07-16 01:15:06','2026-07-16 01:15:06'),(3,1,2,2,'purchase_receipt',100.000,50.000,150.000,25.0000,2500.00,25.0000,25.0000,'purchase_receipt',1,'RCV-20260720-6YEO6T',NULL,NULL,'Received from PO PO-20260720-ZLP2ZW','2026-07-20 13:48:37',1,'2026-07-20 05:48:37','2026-07-20 05:48:37'),(4,1,2,2,'purchase_receipt',50.000,150.000,200.000,25.0000,1250.00,25.0000,25.0000,'purchase_receipt',2,'RCV-20260721-QHE5FY',NULL,NULL,'Received from PO PO-20260721-IRZAO3','2026-07-21 11:54:45',1,'2026-07-21 03:54:45','2026-07-21 03:54:45'),(5,1,2,2,'stock_out',1.000,200.000,199.000,25.0000,25.00,25.0000,25.0000,'stock_issuance',1,'ISS-20260721-UOEW3U',NULL,NULL,'Stock issuance ISS-20260721-UOEW3U | Reason: Used / Consumed','2026-07-21 16:46:29',1,'2026-07-21 08:46:29','2026-07-21 08:46:29'),(6,1,2,2,'stock_out',1.000,199.000,198.000,25.0000,25.00,25.0000,25.0000,'stock_issuance',2,'ISS-20260721-JOSTEU',NULL,NULL,'Stock issuance ISS-20260721-JOSTEU | Reason: Used / Consumed','2026-07-21 16:46:44',1,'2026-07-21 08:46:44','2026-07-21 08:46:44'),(7,1,2,2,'stock_out',3.000,198.000,195.000,25.0000,75.00,25.0000,25.0000,'stock_issuance',3,'ISS-20260723-P8RPMR',NULL,NULL,'Stock issuance ISS-20260723-P8RPMR | Reason: Used / Consumed','2026-07-23 09:19:10',1,'2026-07-23 01:19:10','2026-07-23 01:19:10'),(8,1,2,2,'stock_out',2.000,195.000,193.000,25.0000,50.00,25.0000,25.0000,'stock_issuance',4,'ISS-20260723-C8KYGF',NULL,NULL,'Stock issuance ISS-20260723-C8KYGF | Reason: Used / Consumed | Issued to: jc | Department: jcjc | Reference: cjjjjc','2026-07-23 09:19:39',1,'2026-07-23 01:19:39','2026-07-23 01:19:39'),(9,1,2,1,'opening_stock',50.000,0.000,50.000,50.0000,2500.00,NULL,NULL,'opening_stock',NULL,'OPEN-20260723105039-C7QTY3',NULL,NULL,NULL,'2026-07-23 10:50:39',1,'2026-07-23 02:50:39','2026-07-23 02:50:39'),(10,1,2,1,'stock_out',1.000,50.000,49.000,50.0000,50.00,50.0000,50.0000,'stock_issuance',5,'ISS-20260723-GGYKMP',NULL,NULL,'Stock issuance ISS-20260723-GGYKMP | Reason: Used / Consumed','2026-07-23 11:26:50',1,'2026-07-23 03:26:50','2026-07-23 03:26:50'),(11,1,2,1,'stock_out',1.000,49.000,48.000,50.0000,50.00,50.0000,50.0000,'stock_issuance',6,'ISS-20260724-T6FGMY',NULL,NULL,'Stock issuance ISS-20260724-T6FGMY | Reason: Used / Consumed','2026-07-24 13:52:53',1,'2026-07-24 05:52:53','2026-07-24 05:52:53');
/*!40000 ALTER TABLE `stock_movements_backup_before_batch_core_v3_20260725` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_transfer_item_batches`
--

DROP TABLE IF EXISTS `stock_transfer_item_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stock_transfer_item_batches` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `stock_transfer_item_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  `stock_batch_id` bigint(20) unsigned NOT NULL,
  `from_warehouse_id` bigint(20) unsigned NOT NULL,
  `to_warehouse_id` bigint(20) unsigned NOT NULL,
  `quantity_sent` decimal(14,3) NOT NULL DEFAULT 0.000,
  `quantity_received` decimal(14,3) NOT NULL DEFAULT 0.000,
  `unit_cost` decimal(18,4) NOT NULL DEFAULT 0.0000,
  `line_total` decimal(18,2) NOT NULL DEFAULT 0.00,
  `transfer_out_stock_movement_batch_id` bigint(20) unsigned DEFAULT NULL,
  `transfer_in_stock_movement_batch_id` bigint(20) unsigned DEFAULT NULL,
  `void_out_stock_movement_batch_id` bigint(20) unsigned DEFAULT NULL,
  `void_in_stock_movement_batch_id` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `stib_item_batch_unique` (`stock_transfer_item_id`,`stock_batch_id`),
  UNIQUE KEY `stib_tenant_id_unique` (`tenant_id`,`id`),
  UNIQUE KEY `stib_out_move_batch_unique` (`tenant_id`,`transfer_out_stock_movement_batch_id`),
  UNIQUE KEY `stib_in_move_batch_unique` (`tenant_id`,`transfer_in_stock_movement_batch_id`),
  UNIQUE KEY `stib_void_out_move_batch_unique` (`tenant_id`,`void_out_stock_movement_batch_id`),
  UNIQUE KEY `stib_void_in_move_batch_unique` (`tenant_id`,`void_in_stock_movement_batch_id`),
  KEY `stib_tenant_item_index` (`tenant_id`,`stock_transfer_item_id`),
  KEY `stib_tenant_batch_index` (`tenant_id`,`stock_batch_id`),
  KEY `stib_from_warehouse_index` (`tenant_id`,`from_warehouse_id`),
  KEY `stib_to_warehouse_index` (`tenant_id`,`to_warehouse_id`),
  KEY `stib_item_product_foreign` (`tenant_id`,`stock_transfer_item_id`,`product_id`),
  KEY `stib_batch_product_foreign` (`tenant_id`,`stock_batch_id`,`product_id`),
  CONSTRAINT `stib_batch_product_foreign` FOREIGN KEY (`tenant_id`, `stock_batch_id`, `product_id`) REFERENCES `stock_batches` (`tenant_id`, `id`, `product_id`) ON UPDATE CASCADE,
  CONSTRAINT `stib_from_warehouse_foreign` FOREIGN KEY (`tenant_id`, `from_warehouse_id`) REFERENCES `warehouses` (`tenant_id`, `id`) ON UPDATE CASCADE,
  CONSTRAINT `stib_in_move_batch_foreign` FOREIGN KEY (`tenant_id`, `transfer_in_stock_movement_batch_id`) REFERENCES `stock_movement_batches` (`tenant_id`, `id`) ON UPDATE CASCADE,
  CONSTRAINT `stib_item_product_foreign` FOREIGN KEY (`tenant_id`, `stock_transfer_item_id`, `product_id`) REFERENCES `stock_transfer_items` (`tenant_id`, `id`, `product_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `stib_out_move_batch_foreign` FOREIGN KEY (`tenant_id`, `transfer_out_stock_movement_batch_id`) REFERENCES `stock_movement_batches` (`tenant_id`, `id`) ON UPDATE CASCADE,
  CONSTRAINT `stib_to_warehouse_foreign` FOREIGN KEY (`tenant_id`, `to_warehouse_id`) REFERENCES `warehouses` (`tenant_id`, `id`) ON UPDATE CASCADE,
  CONSTRAINT `stib_void_in_move_batch_foreign` FOREIGN KEY (`tenant_id`, `void_in_stock_movement_batch_id`) REFERENCES `stock_movement_batches` (`tenant_id`, `id`) ON UPDATE CASCADE,
  CONSTRAINT `stib_void_out_move_batch_foreign` FOREIGN KEY (`tenant_id`, `void_out_stock_movement_batch_id`) REFERENCES `stock_movement_batches` (`tenant_id`, `id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_transfer_item_batches`
--

LOCK TABLES `stock_transfer_item_batches` WRITE;
/*!40000 ALTER TABLE `stock_transfer_item_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `stock_transfer_item_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_transfer_items`
--

DROP TABLE IF EXISTS `stock_transfer_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stock_transfer_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `stock_transfer_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  `quantity_requested` decimal(14,3) NOT NULL DEFAULT 0.000,
  `quantity_sent` decimal(14,3) NOT NULL DEFAULT 0.000,
  `quantity_received` decimal(14,3) NOT NULL DEFAULT 0.000,
  `unit_cost` decimal(18,4) NOT NULL DEFAULT 0.0000,
  `line_total` decimal(18,2) NOT NULL DEFAULT 0.00,
  `transfer_out_stock_movement_id` bigint(20) unsigned DEFAULT NULL,
  `transfer_in_stock_movement_id` bigint(20) unsigned DEFAULT NULL,
  `void_out_stock_movement_id` bigint(20) unsigned DEFAULT NULL,
  `void_in_stock_movement_id` bigint(20) unsigned DEFAULT NULL,
  `notes` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `stock_transfer_items_transfer_product_unique` (`stock_transfer_id`,`product_id`),
  UNIQUE KEY `stock_transfer_items_tenant_id_unique` (`tenant_id`,`id`),
  UNIQUE KEY `stock_transfer_items_context_unique` (`tenant_id`,`id`,`product_id`),
  UNIQUE KEY `stock_transfer_items_out_move_unique` (`tenant_id`,`transfer_out_stock_movement_id`),
  UNIQUE KEY `stock_transfer_items_in_move_unique` (`tenant_id`,`transfer_in_stock_movement_id`),
  UNIQUE KEY `stock_transfer_items_void_out_move_unique` (`tenant_id`,`void_out_stock_movement_id`),
  UNIQUE KEY `stock_transfer_items_void_in_move_unique` (`tenant_id`,`void_in_stock_movement_id`),
  KEY `stock_transfer_items_tenant_transfer_index` (`tenant_id`,`stock_transfer_id`),
  KEY `stock_transfer_items_tenant_product_index` (`tenant_id`,`product_id`),
  CONSTRAINT `stock_transfer_items_in_move_foreign` FOREIGN KEY (`tenant_id`, `transfer_in_stock_movement_id`) REFERENCES `stock_movements` (`tenant_id`, `id`) ON UPDATE CASCADE,
  CONSTRAINT `stock_transfer_items_out_move_foreign` FOREIGN KEY (`tenant_id`, `transfer_out_stock_movement_id`) REFERENCES `stock_movements` (`tenant_id`, `id`) ON UPDATE CASCADE,
  CONSTRAINT `stock_transfer_items_product_foreign` FOREIGN KEY (`tenant_id`, `product_id`) REFERENCES `products` (`tenant_id`, `id`) ON UPDATE CASCADE,
  CONSTRAINT `stock_transfer_items_transfer_foreign` FOREIGN KEY (`tenant_id`, `stock_transfer_id`) REFERENCES `stock_transfers` (`tenant_id`, `id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `stock_transfer_items_void_in_move_foreign` FOREIGN KEY (`tenant_id`, `void_in_stock_movement_id`) REFERENCES `stock_movements` (`tenant_id`, `id`) ON UPDATE CASCADE,
  CONSTRAINT `stock_transfer_items_void_out_move_foreign` FOREIGN KEY (`tenant_id`, `void_out_stock_movement_id`) REFERENCES `stock_movements` (`tenant_id`, `id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_transfer_items`
--

LOCK TABLES `stock_transfer_items` WRITE;
/*!40000 ALTER TABLE `stock_transfer_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `stock_transfer_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_transfers`
--

DROP TABLE IF EXISTS `stock_transfers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stock_transfers` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `from_branch_id` bigint(20) unsigned NOT NULL,
  `from_warehouse_id` bigint(20) unsigned NOT NULL,
  `to_branch_id` bigint(20) unsigned NOT NULL,
  `to_warehouse_id` bigint(20) unsigned NOT NULL,
  `transfer_number` varchar(80) NOT NULL,
  `transfer_date` date NOT NULL,
  `expected_receive_date` date DEFAULT NULL,
  `status` enum('draft','pending','approved','in_transit','received','cancelled','voided') NOT NULL DEFAULT 'draft',
  `reference_no` varchar(120) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `total_quantity_sent` decimal(14,3) NOT NULL DEFAULT 0.000,
  `total_quantity_received` decimal(14,3) NOT NULL DEFAULT 0.000,
  `total_cost` decimal(18,2) NOT NULL DEFAULT 0.00,
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `submitted_by` bigint(20) unsigned DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `approved_by` bigint(20) unsigned DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `dispatched_by` bigint(20) unsigned DEFAULT NULL,
  `dispatched_at` timestamp NULL DEFAULT NULL,
  `received_by` bigint(20) unsigned DEFAULT NULL,
  `received_at` timestamp NULL DEFAULT NULL,
  `cancelled_by` bigint(20) unsigned DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `cancel_reason` text DEFAULT NULL,
  `voided_by` bigint(20) unsigned DEFAULT NULL,
  `voided_at` timestamp NULL DEFAULT NULL,
  `void_reason` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `stock_transfers_tenant_number_unique` (`tenant_id`,`transfer_number`),
  UNIQUE KEY `stock_transfers_tenant_id_unique` (`tenant_id`,`id`),
  UNIQUE KEY `stock_transfers_context_unique` (`tenant_id`,`id`,`from_warehouse_id`,`to_warehouse_id`),
  KEY `stock_transfers_tenant_status_date_index` (`tenant_id`,`status`,`transfer_date`),
  KEY `stock_transfers_from_warehouse_date_index` (`tenant_id`,`from_warehouse_id`,`transfer_date`),
  KEY `stock_transfers_to_warehouse_date_index` (`tenant_id`,`to_warehouse_id`,`transfer_date`),
  KEY `stock_transfers_reference_index` (`tenant_id`,`reference_no`),
  KEY `stock_transfers_from_warehouse_foreign` (`tenant_id`,`from_branch_id`,`from_warehouse_id`),
  KEY `stock_transfers_to_warehouse_foreign` (`tenant_id`,`to_branch_id`,`to_warehouse_id`),
  CONSTRAINT `stock_transfers_from_warehouse_foreign` FOREIGN KEY (`tenant_id`, `from_branch_id`, `from_warehouse_id`) REFERENCES `warehouses` (`tenant_id`, `branch_id`, `id`) ON UPDATE CASCADE,
  CONSTRAINT `stock_transfers_to_warehouse_foreign` FOREIGN KEY (`tenant_id`, `to_branch_id`, `to_warehouse_id`) REFERENCES `warehouses` (`tenant_id`, `branch_id`, `id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_transfers`
--

LOCK TABLES `stock_transfers` WRITE;
/*!40000 ALTER TABLE `stock_transfers` DISABLE KEYS */;
/*!40000 ALTER TABLE `stock_transfers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `suppliers` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned NOT NULL,
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
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `suppliers_tenant_code_unique` (`tenant_id`,`code`),
  UNIQUE KEY `suppliers_tenant_id_unique` (`tenant_id`,`id`),
  KEY `suppliers_tenant_id_index` (`tenant_id`),
  KEY `suppliers_tenant_name_index` (`tenant_id`,`name`),
  KEY `suppliers_tenant_active_index` (`tenant_id`,`is_active`),
  KEY `suppliers_created_by_index` (`created_by`),
  KEY `suppliers_email_index` (`email`),
  KEY `suppliers_phone_index` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES (1,1,'QT','w','wet','wt@gmail.com','ewt','qt','qwerty','qt','qwerty',25.00,NULL,1,1,'2026-07-14 01:46:04','2026-07-26 09:58:39','2026-07-26 09:58:39'),(2,1,'S1','ABC traiding','Juan Test',NULL,'21212121212212','21212',NULL,'12121212121212','Cash Before Delivery',10000.00,NULL,1,1,'2026-07-26 10:00:54','2026-07-26 10:00:54',NULL),(3,1,'S@','JCM Traiding','June Charles Mariquit','mariquit.junecharles@marsu.edu.ph','2222222222222222222222222','22222222222225',NULL,'2222222222222',NULL,80000.00,NULL,1,1,'2026-07-27 07:49:22','2026-07-27 07:49:22',NULL);
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `warehouse_batch_stocks`
--

DROP TABLE IF EXISTS `warehouse_batch_stocks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `warehouse_batch_stocks` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `warehouse_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  `stock_batch_id` bigint(20) unsigned NOT NULL,
  `quantity` decimal(14,3) NOT NULL DEFAULT 0.000,
  `last_movement_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `wbs_warehouse_batch_unique` (`warehouse_id`,`stock_batch_id`),
  UNIQUE KEY `wbs_tenant_id_unique` (`tenant_id`,`id`),
  KEY `wbs_tenant_warehouse_index` (`tenant_id`,`warehouse_id`),
  KEY `wbs_tenant_product_index` (`tenant_id`,`product_id`),
  KEY `wbs_tenant_batch_index` (`tenant_id`,`stock_batch_id`),
  KEY `wbs_batch_product_foreign` (`tenant_id`,`stock_batch_id`,`product_id`),
  CONSTRAINT `wbs_batch_product_foreign` FOREIGN KEY (`tenant_id`, `stock_batch_id`, `product_id`) REFERENCES `stock_batches` (`tenant_id`, `id`, `product_id`) ON UPDATE CASCADE,
  CONSTRAINT `wbs_warehouse_foreign` FOREIGN KEY (`tenant_id`, `warehouse_id`) REFERENCES `warehouses` (`tenant_id`, `id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `warehouse_batch_stocks`
--

LOCK TABLES `warehouse_batch_stocks` WRITE;
/*!40000 ALTER TABLE `warehouse_batch_stocks` DISABLE KEYS */;
INSERT INTO `warehouse_batch_stocks` VALUES (1,1,2,2,1,192.000,'2026-07-26 22:33:05','2026-07-16 01:15:06','2026-07-26 14:33:05'),(2,1,2,1,2,47.000,'2026-07-26 22:33:05','2026-07-23 02:50:39','2026-07-26 14:33:05'),(4,1,2,3,4,80.000,'2026-07-26 22:33:11','2026-07-25 16:57:45','2026-07-26 14:33:11'),(5,1,2,3,5,100.000,'2026-07-26 01:09:49','2026-07-25 17:09:49','2026-07-25 17:09:49'),(6,1,2,4,6,17.000,'2026-07-26 22:33:05','2026-07-26 10:07:23','2026-07-26 14:33:05'),(7,1,2,3,7,300.000,'2026-07-26 19:38:47','2026-07-26 11:38:47','2026-07-26 11:38:47'),(8,1,2,4,8,50.000,'2026-07-26 19:42:00','2026-07-26 11:42:00','2026-07-26 11:42:00'),(9,1,2,4,9,99.998,'2026-07-26 19:45:40','2026-07-26 11:45:40','2026-07-26 11:45:40'),(10,1,2,5,10,47.000,'2026-07-27 10:08:41','2026-07-27 02:07:39','2026-07-27 02:08:41'),(11,1,2,5,11,50.000,'2026-07-27 10:08:20','2026-07-27 02:08:20','2026-07-27 02:08:20'),(12,1,2,5,12,50.000,'2026-07-27 10:09:42','2026-07-27 02:09:42','2026-07-27 02:09:42'),(13,1,2,4,13,0.002,'2026-07-28 09:38:29','2026-07-28 01:38:29','2026-07-28 01:38:29'),(14,1,2,5,14,50.000,'2026-07-28 09:39:16','2026-07-28 01:39:16','2026-07-28 01:39:16');
/*!40000 ALTER TABLE `warehouse_batch_stocks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `warehouse_batch_stocks_backup_before_batch_core_v3_20260725`
--

DROP TABLE IF EXISTS `warehouse_batch_stocks_backup_before_batch_core_v3_20260725`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `warehouse_batch_stocks_backup_before_batch_core_v3_20260725` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `warehouse_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  `stock_batch_id` bigint(20) unsigned NOT NULL,
  `quantity` decimal(14,3) NOT NULL DEFAULT 0.000,
  `last_movement_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `wbs_warehouse_batch_unique` (`warehouse_id`,`stock_batch_id`),
  UNIQUE KEY `wbs_tenant_id_unique` (`tenant_id`,`id`),
  KEY `wbs_tenant_warehouse_index` (`tenant_id`,`warehouse_id`),
  KEY `wbs_tenant_product_index` (`tenant_id`,`product_id`),
  KEY `wbs_tenant_batch_index` (`tenant_id`,`stock_batch_id`),
  KEY `wbs_batch_product_foreign` (`tenant_id`,`stock_batch_id`,`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `warehouse_batch_stocks_backup_before_batch_core_v3_20260725`
--

LOCK TABLES `warehouse_batch_stocks_backup_before_batch_core_v3_20260725` WRITE;
/*!40000 ALTER TABLE `warehouse_batch_stocks_backup_before_batch_core_v3_20260725` DISABLE KEYS */;
INSERT INTO `warehouse_batch_stocks_backup_before_batch_core_v3_20260725` VALUES (1,1,2,2,1,193.000,'2026-07-23 09:19:39','2026-07-16 01:15:06','2026-07-25 06:19:00'),(2,1,2,1,2,48.000,'2026-07-24 13:52:53','2026-07-23 02:50:39','2026-07-25 06:19:00');
/*!40000 ALTER TABLE `warehouse_batch_stocks_backup_before_batch_core_v3_20260725` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `warehouse_stocks`
--

DROP TABLE IF EXISTS `warehouse_stocks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `warehouse_stocks` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `warehouse_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  `quantity` decimal(14,3) NOT NULL DEFAULT 0.000,
  `reorder_level` decimal(14,3) NOT NULL DEFAULT 0.000,
  `max_stock_level` decimal(14,3) DEFAULT NULL,
  `average_cost` decimal(18,4) NOT NULL DEFAULT 0.0000,
  `last_movement_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `warehouse_stocks_warehouse_product_unique` (`warehouse_id`,`product_id`),
  KEY `warehouse_stocks_tenant_id_index` (`tenant_id`),
  KEY `warehouse_stocks_warehouse_id_index` (`warehouse_id`),
  KEY `warehouse_stocks_product_id_index` (`product_id`),
  KEY `warehouse_stocks_tenant_warehouse_index` (`tenant_id`,`warehouse_id`),
  KEY `warehouse_stocks_tenant_product_index` (`tenant_id`,`product_id`),
  CONSTRAINT `warehouse_stocks_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `warehouse_stocks_tenant_product_foreign` FOREIGN KEY (`tenant_id`, `product_id`) REFERENCES `products` (`tenant_id`, `id`) ON UPDATE CASCADE,
  CONSTRAINT `warehouse_stocks_tenant_warehouse_foreign` FOREIGN KEY (`tenant_id`, `warehouse_id`) REFERENCES `warehouses` (`tenant_id`, `id`) ON UPDATE CASCADE,
  CONSTRAINT `warehouse_stocks_warehouse_id_foreign` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `warehouse_stocks`
--

LOCK TABLES `warehouse_stocks` WRITE;
/*!40000 ALTER TABLE `warehouse_stocks` DISABLE KEYS */;
INSERT INTO `warehouse_stocks` VALUES (2,1,2,2,192.000,5.000,NULL,25.0000,'2026-07-26 22:33:05','2026-07-16 01:15:06','2026-07-26 14:33:05'),(5,1,2,1,47.000,5.000,NULL,50.0000,'2026-07-26 22:33:05','2026-07-23 02:50:39','2026-07-26 14:33:05'),(6,1,2,3,480.000,5.000,NULL,51.0417,'2026-07-26 22:33:11','2026-07-25 16:57:45','2026-07-26 14:33:11'),(7,1,2,4,167.000,5.000,NULL,15.0000,'2026-07-28 09:38:29','2026-07-26 10:07:23','2026-07-28 01:38:29'),(8,1,2,5,197.000,5.000,NULL,5.0761,'2026-07-28 09:39:16','2026-07-27 02:07:39','2026-07-28 01:39:16');
/*!40000 ALTER TABLE `warehouse_stocks` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_ws_batch_guard_before_insert` BEFORE INSERT ON `warehouse_stocks` FOR EACH ROW BEGIN
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
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_ws_batch_guard_before_update` BEFORE UPDATE ON `warehouse_stocks` FOR EACH ROW BEGIN
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
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `warehouse_stocks_backup_before_batch_core_v3_20260725`
--

DROP TABLE IF EXISTS `warehouse_stocks_backup_before_batch_core_v3_20260725`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `warehouse_stocks_backup_before_batch_core_v3_20260725` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `warehouse_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  `quantity` decimal(14,3) NOT NULL DEFAULT 0.000,
  `reorder_level` decimal(14,3) NOT NULL DEFAULT 0.000,
  `max_stock_level` decimal(14,3) DEFAULT NULL,
  `average_cost` decimal(18,4) NOT NULL DEFAULT 0.0000,
  `last_movement_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `warehouse_stocks_warehouse_product_unique` (`warehouse_id`,`product_id`),
  KEY `warehouse_stocks_tenant_id_index` (`tenant_id`),
  KEY `warehouse_stocks_warehouse_id_index` (`warehouse_id`),
  KEY `warehouse_stocks_product_id_index` (`product_id`),
  KEY `warehouse_stocks_tenant_warehouse_index` (`tenant_id`,`warehouse_id`),
  KEY `warehouse_stocks_tenant_product_index` (`tenant_id`,`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `warehouse_stocks_backup_before_batch_core_v3_20260725`
--

LOCK TABLES `warehouse_stocks_backup_before_batch_core_v3_20260725` WRITE;
/*!40000 ALTER TABLE `warehouse_stocks_backup_before_batch_core_v3_20260725` DISABLE KEYS */;
INSERT INTO `warehouse_stocks_backup_before_batch_core_v3_20260725` VALUES (2,1,2,2,193.000,5.000,NULL,25.0000,'2026-07-23 09:19:39','2026-07-16 01:15:06','2026-07-23 01:19:39'),(5,1,2,1,48.000,5.000,NULL,50.0000,'2026-07-24 13:52:53','2026-07-23 02:50:39','2026-07-24 05:52:53');
/*!40000 ALTER TABLE `warehouse_stocks_backup_before_batch_core_v3_20260725` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `warehouses`
--

DROP TABLE IF EXISTS `warehouses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `warehouses` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `branch_id` bigint(20) unsigned NOT NULL,
  `name` varchar(180) NOT NULL,
  `code` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `contact_person` varchar(180) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `is_main` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `active_main_tenant_id` bigint(20) unsigned GENERATED ALWAYS AS (case when `is_main` = 1 and `is_active` = 1 and `deleted_at` is null then `tenant_id` else NULL end) STORED,
  `active_main_branch_id` bigint(20) unsigned GENERATED ALWAYS AS (case when `is_main` = 1 and `is_active` = 1 and `deleted_at` is null then `branch_id` else NULL end) STORED,
  PRIMARY KEY (`id`),
  UNIQUE KEY `warehouses_branch_code_unique` (`tenant_id`,`branch_id`,`code`),
  UNIQUE KEY `warehouses_tenant_id_unique` (`tenant_id`,`id`),
  UNIQUE KEY `warehouses_tenant_branch_id_unique` (`tenant_id`,`branch_id`,`id`),
  UNIQUE KEY `warehouses_one_active_main_per_branch` (`active_main_tenant_id`,`active_main_branch_id`),
  KEY `warehouses_tenant_id_index` (`tenant_id`),
  KEY `warehouses_branch_id_index` (`branch_id`),
  KEY `warehouses_tenant_branch_index` (`tenant_id`,`branch_id`),
  KEY `warehouses_tenant_active_index` (`tenant_id`,`is_active`),
  KEY `warehouses_created_by_index` (`created_by`),
  CONSTRAINT `warehouses_branch_id_foreign` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `warehouses_tenant_branch_foreign` FOREIGN KEY (`tenant_id`, `branch_id`) REFERENCES `branches` (`tenant_id`, `id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `warehouses`
--

LOCK TABLES `warehouses` WRITE;
/*!40000 ALTER TABLE `warehouses` DISABLE KEYS */;
INSERT INTO `warehouses` VALUES (2,1,3,'main Warehouse','WH1','qwerty','qwerty','qwerty','09123456789',1,1,1,'2026-07-16 01:13:39','2026-07-16 01:13:39',NULL,1,3);
/*!40000 ALTER TABLE `warehouses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'jcm_inventory_db'
--

--
-- Dumping routines for database 'jcm_inventory_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-28 15:49:28


-- ============================================================
-- JCM INVENTORY CANONICAL VIEWS
-- ============================================================
-- ============================================================================
-- JCM INVENTORY - RESTORE ALL 8 VIEWS (FULLY QUALIFIED)
-- Date: 2026-07-27
-- Target: MariaDB 10.4+ / phpMyAdmin
--
-- This version always creates the views inside jcm_inventory_db, even if
-- phpMyAdmin currently has information_schema or another database selected.
--
-- SAFE:
--   No products, quantities, batches, receipts, withdrawals, procurement
--   records, or stock movements are changed. Only VIEW objects are replaced.
-- ============================================================================

USE `jcm_inventory_db`;

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET SESSION collation_connection = 'utf8mb4_unicode_ci';

SELECT DATABASE() AS `target_database`;

CREATE OR REPLACE VIEW `jcm_inventory_db`.`vw_batch_inventory` AS
SELECT
    `wbs`.`id` AS `warehouse_batch_stock_id`,
    `wbs`.`tenant_id` AS `tenant_id`,
    `branch`.`id` AS `branch_id`,
    `branch`.`code` AS `branch_code`,
    `branch`.`name` AS `branch_name`,
    `warehouse`.`id` AS `warehouse_id`,
    `warehouse`.`code` AS `warehouse_code`,
    `warehouse`.`name` AS `warehouse_name`,
    `product`.`id` AS `product_id`,
    `product`.`sku` AS `product_sku`,
    `product`.`name` AS `product_name`,
    `product`.`unit` AS `product_unit`,
    `product`.`batch_tracking_enabled` AS `batch_tracking_enabled`,
    `product`.`batch_issue_policy` AS `batch_issue_policy`,
    `product`.`requires_expiration_date` AS `requires_expiration_date`,
    `batch`.`id` AS `stock_batch_id`,
    `batch`.`batch_code` AS `batch_code`,
    `batch`.`lot_number` AS `lot_number`,
    `batch`.`source_type` AS `source_type`,
    `batch`.`source_reference` AS `source_reference`,
    `batch`.`received_date` AS `received_date`,
    `batch`.`manufactured_date` AS `manufactured_date`,
    `batch`.`expiration_date` AS `expiration_date`,
    `batch`.`unit_cost` AS `unit_cost`,
    `batch`.`original_quantity` AS `original_quantity`,
    `batch`.`status` AS `batch_status`,
    `wbs`.`quantity` AS `quantity`,
    ROUND(`wbs`.`quantity` * `batch`.`unit_cost`, 2) AS `batch_value`,
    `wbs`.`last_movement_at` AS `last_movement_at`,
    CASE
        WHEN `batch`.`expiration_date` IS NULL THEN NULL
        ELSE TO_DAYS(`batch`.`expiration_date`) - TO_DAYS(CURDATE())
    END AS `days_to_expiry`,
    CAST(
        CASE
            WHEN `batch`.`expiration_date` IS NULL
                THEN _utf8mb4'no_expiry'
            WHEN `batch`.`expiration_date` < CURDATE()
                THEN _utf8mb4'expired'
            WHEN TO_DAYS(`batch`.`expiration_date`) - TO_DAYS(CURDATE())
                 <= COALESCE(`settings`.`expiry_critical_days`, 7)
                THEN _utf8mb4'critical'
            WHEN TO_DAYS(`batch`.`expiration_date`) - TO_DAYS(CURDATE())
                 <= COALESCE(
                    `product`.`expiry_warning_days`,
                    `settings`.`expiry_warning_days`
                 )
                THEN _utf8mb4'warning'
            ELSE _utf8mb4'safe'
        END
        AS CHAR CHARACTER SET utf8mb4
    ) COLLATE utf8mb4_unicode_ci AS `expiry_state`
FROM `jcm_inventory_db`.`warehouse_batch_stocks` AS `wbs`
INNER JOIN `jcm_inventory_db`.`stock_batches` AS `batch`
    ON `batch`.`tenant_id` = `wbs`.`tenant_id`
   AND `batch`.`id` = `wbs`.`stock_batch_id`
   AND `batch`.`product_id` = `wbs`.`product_id`
INNER JOIN `jcm_inventory_db`.`products` AS `product`
    ON `product`.`tenant_id` = `wbs`.`tenant_id`
   AND `product`.`id` = `wbs`.`product_id`
INNER JOIN `jcm_inventory_db`.`warehouses` AS `warehouse`
    ON `warehouse`.`tenant_id` = `wbs`.`tenant_id`
   AND `warehouse`.`id` = `wbs`.`warehouse_id`
INNER JOIN `jcm_inventory_db`.`branches` AS `branch`
    ON `branch`.`tenant_id` = `warehouse`.`tenant_id`
   AND `branch`.`id` = `warehouse`.`branch_id`
LEFT JOIN `jcm_inventory_db`.`inventory_settings` AS `settings`
    ON `settings`.`tenant_id` = `wbs`.`tenant_id`;

CREATE OR REPLACE VIEW `jcm_inventory_db`.`vw_batch_issue_candidates` AS
SELECT
    `inventory`.`warehouse_batch_stock_id` AS `warehouse_batch_stock_id`,
    `inventory`.`tenant_id` AS `tenant_id`,
    `inventory`.`branch_id` AS `branch_id`,
    `inventory`.`branch_code` AS `branch_code`,
    `inventory`.`branch_name` AS `branch_name`,
    `inventory`.`warehouse_id` AS `warehouse_id`,
    `inventory`.`warehouse_code` AS `warehouse_code`,
    `inventory`.`warehouse_name` AS `warehouse_name`,
    `inventory`.`product_id` AS `product_id`,
    `inventory`.`product_sku` AS `product_sku`,
    `inventory`.`product_name` AS `product_name`,
    `inventory`.`product_unit` AS `product_unit`,
    `inventory`.`batch_tracking_enabled` AS `batch_tracking_enabled`,
    `inventory`.`batch_issue_policy` AS `batch_issue_policy`,
    `inventory`.`requires_expiration_date` AS `requires_expiration_date`,
    `inventory`.`stock_batch_id` AS `stock_batch_id`,
    `inventory`.`batch_code` AS `batch_code`,
    `inventory`.`lot_number` AS `lot_number`,
    `inventory`.`source_type` AS `source_type`,
    `inventory`.`source_reference` AS `source_reference`,
    `inventory`.`received_date` AS `received_date`,
    `inventory`.`manufactured_date` AS `manufactured_date`,
    `inventory`.`expiration_date` AS `expiration_date`,
    `inventory`.`unit_cost` AS `unit_cost`,
    `inventory`.`original_quantity` AS `original_quantity`,
    `inventory`.`batch_status` AS `batch_status`,
    `inventory`.`quantity` AS `quantity`,
    `inventory`.`batch_value` AS `batch_value`,
    `inventory`.`last_movement_at` AS `last_movement_at`,
    `inventory`.`days_to_expiry` AS `days_to_expiry`,
    `inventory`.`expiry_state` AS `expiry_state`,
    CASE
        WHEN BINARY `inventory`.`batch_issue_policy` = BINARY 'fefo'
            THEN COALESCE(`inventory`.`expiration_date`, '9999-12-31')
        ELSE `inventory`.`received_date`
    END AS `issue_sort_date`,
    CASE
        WHEN BINARY `inventory`.`batch_status` = BINARY 'active'
         AND `inventory`.`quantity` > 0
         AND (
            `inventory`.`expiration_date` IS NULL
            OR `inventory`.`expiration_date` >= CURDATE()
         )
            THEN 1
        ELSE 0
    END AS `is_issue_eligible`
FROM `jcm_inventory_db`.`vw_batch_inventory` AS `inventory`;

-- ============================================================================
-- RECONCILIATION VIEWS
-- ============================================================================

CREATE OR REPLACE VIEW `jcm_inventory_db`.`vw_batch_stock_reconciliation` AS
SELECT
    `ws`.`id` AS `warehouse_stock_id`,
    `ws`.`tenant_id` AS `tenant_id`,
    `ws`.`warehouse_id` AS `warehouse_id`,
    `warehouse`.`code` AS `warehouse_code`,
    `warehouse`.`name` AS `warehouse_name`,
    `ws`.`product_id` AS `product_id`,
    `product`.`sku` AS `product_sku`,
    `product`.`name` AS `product_name`,
    `ws`.`quantity` AS `aggregate_quantity`,
    COALESCE(SUM(`wbs`.`quantity`), 0.000) AS `batch_quantity`,
    ROUND(
        `ws`.`quantity` - COALESCE(SUM(`wbs`.`quantity`), 0.000),
        3
    ) AS `quantity_difference`,
    CAST((
        CASE
            WHEN ABS(
                `ws`.`quantity` - COALESCE(SUM(`wbs`.`quantity`), 0.000)
            ) <= 0.0001
                THEN 'matched'
            ELSE 'mismatch'
        END
    ) AS CHAR CHARACTER SET utf8mb4)
        COLLATE utf8mb4_unicode_ci AS `reconciliation_status`
FROM `jcm_inventory_db`.`warehouse_stocks` AS `ws`
INNER JOIN `jcm_inventory_db`.`warehouses` AS `warehouse`
    ON `warehouse`.`tenant_id` = `ws`.`tenant_id`
   AND `warehouse`.`id` = `ws`.`warehouse_id`
INNER JOIN `jcm_inventory_db`.`products` AS `product`
    ON `product`.`tenant_id` = `ws`.`tenant_id`
   AND `product`.`id` = `ws`.`product_id`
LEFT JOIN `jcm_inventory_db`.`warehouse_batch_stocks` AS `wbs`
    ON `wbs`.`tenant_id` = `ws`.`tenant_id`
   AND `wbs`.`warehouse_id` = `ws`.`warehouse_id`
   AND `wbs`.`product_id` = `ws`.`product_id`
GROUP BY
    `ws`.`id`,
    `ws`.`tenant_id`,
    `ws`.`warehouse_id`,
    `warehouse`.`code`,
    `warehouse`.`name`,
    `ws`.`product_id`,
    `product`.`sku`,
    `product`.`name`,
    `ws`.`quantity`;

CREATE OR REPLACE VIEW `jcm_inventory_db`.`vw_purchase_receipt_batch_reconciliation` AS
SELECT
    `item`.`id` AS `purchase_receipt_item_id`,
    `item`.`tenant_id` AS `tenant_id`,
    `item`.`purchase_receipt_id` AS `purchase_receipt_id`,
    `item`.`product_id` AS `product_id`,
    `item`.`quantity_received` AS `quantity_received`,
    COALESCE(SUM(`batch_item`.`quantity_received`), 0.000)
        AS `batch_quantity_received`,
    ROUND(
        `item`.`quantity_received`
        - COALESCE(SUM(`batch_item`.`quantity_received`), 0.000),
        3
    ) AS `quantity_difference`,
    CAST((
        CASE
            WHEN `item`.`stock_movement_id` IS NULL
              OR `movement`.`id` IS NULL
                THEN 'mismatch'
            WHEN `movement`.`is_batch_tracked` = 0
                THEN 'not_required'
            WHEN `movement`.`batch_allocation_status` IN ('allocated', 'reversed')
             AND ABS(
                    `item`.`quantity_received`
                    - COALESCE(SUM(`batch_item`.`quantity_received`), 0.000)
                 ) <= 0.0001
                THEN 'matched'
            ELSE 'mismatch'
        END
    ) AS CHAR CHARACTER SET utf8mb4)
        COLLATE utf8mb4_unicode_ci AS `reconciliation_status`
FROM `jcm_inventory_db`.`purchase_receipt_items` AS `item`
LEFT JOIN `jcm_inventory_db`.`stock_movements` AS `movement`
    ON `movement`.`tenant_id` = `item`.`tenant_id`
   AND `movement`.`id` = `item`.`stock_movement_id`
LEFT JOIN `jcm_inventory_db`.`purchase_receipt_item_batches` AS `batch_item`
    ON `batch_item`.`tenant_id` = `item`.`tenant_id`
   AND `batch_item`.`purchase_receipt_item_id` = `item`.`id`
GROUP BY
    `item`.`id`,
    `item`.`tenant_id`,
    `item`.`purchase_receipt_id`,
    `item`.`product_id`,
    `item`.`quantity_received`,
    `item`.`stock_movement_id`,
    `movement`.`id`,
    `movement`.`is_batch_tracked`,
    `movement`.`batch_allocation_status`;

CREATE OR REPLACE VIEW `jcm_inventory_db`.`vw_stock_adjustment_batch_reconciliation` AS
SELECT
    `item`.`id` AS `stock_adjustment_item_id`,
    `item`.`tenant_id` AS `tenant_id`,
    `item`.`stock_adjustment_id` AS `stock_adjustment_id`,
    `item`.`product_id` AS `product_id`,
    `item`.`direction` AS `direction`,
    `item`.`quantity` AS `quantity`,
    COALESCE(SUM(`batch_item`.`quantity`), 0.000) AS `batch_quantity`,
    ROUND(
        `item`.`quantity`
        - COALESCE(SUM(`batch_item`.`quantity`), 0.000),
        3
    ) AS `quantity_difference`,
    CAST((
        CASE
            WHEN `item`.`stock_movement_id` IS NULL
              OR `movement`.`id` IS NULL
                THEN 'mismatch'
            WHEN `movement`.`is_batch_tracked` = 0
                THEN 'not_required'
            WHEN `movement`.`batch_allocation_status` IN ('allocated', 'reversed')
             AND ABS(
                    `item`.`quantity`
                    - COALESCE(SUM(`batch_item`.`quantity`), 0.000)
                 ) <= 0.0001
                THEN 'matched'
            ELSE 'mismatch'
        END
    ) AS CHAR CHARACTER SET utf8mb4)
        COLLATE utf8mb4_unicode_ci AS `reconciliation_status`
FROM `jcm_inventory_db`.`stock_adjustment_items` AS `item`
LEFT JOIN `jcm_inventory_db`.`stock_movements` AS `movement`
    ON `movement`.`tenant_id` = `item`.`tenant_id`
   AND `movement`.`id` = `item`.`stock_movement_id`
LEFT JOIN `jcm_inventory_db`.`stock_adjustment_item_batches` AS `batch_item`
    ON `batch_item`.`tenant_id` = `item`.`tenant_id`
   AND `batch_item`.`stock_adjustment_item_id` = `item`.`id`
GROUP BY
    `item`.`id`,
    `item`.`tenant_id`,
    `item`.`stock_adjustment_id`,
    `item`.`product_id`,
    `item`.`direction`,
    `item`.`quantity`,
    `item`.`stock_movement_id`,
    `movement`.`id`,
    `movement`.`is_batch_tracked`,
    `movement`.`batch_allocation_status`;

CREATE OR REPLACE VIEW `jcm_inventory_db`.`vw_stock_issuance_batch_reconciliation` AS
SELECT
    `item`.`id` AS `stock_issuance_item_id`,
    `item`.`tenant_id` AS `tenant_id`,
    `item`.`stock_issuance_id` AS `stock_issuance_id`,
    `item`.`product_id` AS `product_id`,
    `item`.`quantity_issued` AS `quantity_issued`,
    COALESCE(SUM(`batch_item`.`quantity_issued`), 0.000)
        AS `batch_quantity_issued`,
    ROUND(
        `item`.`quantity_issued`
        - COALESCE(SUM(`batch_item`.`quantity_issued`), 0.000),
        3
    ) AS `quantity_difference`,
    CAST((
        CASE
            WHEN `item`.`stock_movement_id` IS NULL
              OR `movement`.`id` IS NULL
                THEN 'mismatch'
            WHEN `movement`.`is_batch_tracked` = 0
                THEN 'not_required'
            WHEN `movement`.`batch_allocation_status` IN ('allocated', 'reversed')
             AND ABS(
                    `item`.`quantity_issued`
                    - COALESCE(SUM(`batch_item`.`quantity_issued`), 0.000)
                 ) <= 0.0001
                THEN 'matched'
            ELSE 'mismatch'
        END
    ) AS CHAR CHARACTER SET utf8mb4)
        COLLATE utf8mb4_unicode_ci AS `reconciliation_status`
FROM `jcm_inventory_db`.`stock_issuance_items` AS `item`
LEFT JOIN `jcm_inventory_db`.`stock_movements` AS `movement`
    ON `movement`.`tenant_id` = `item`.`tenant_id`
   AND `movement`.`id` = `item`.`stock_movement_id`
LEFT JOIN `jcm_inventory_db`.`stock_issuance_item_batches` AS `batch_item`
    ON `batch_item`.`tenant_id` = `item`.`tenant_id`
   AND `batch_item`.`stock_issuance_item_id` = `item`.`id`
GROUP BY
    `item`.`id`,
    `item`.`tenant_id`,
    `item`.`stock_issuance_id`,
    `item`.`product_id`,
    `item`.`quantity_issued`,
    `item`.`stock_movement_id`,
    `movement`.`id`,
    `movement`.`is_batch_tracked`,
    `movement`.`batch_allocation_status`;

CREATE OR REPLACE VIEW `jcm_inventory_db`.`vw_stock_movement_batch_reconciliation` AS
SELECT
    `movement`.`id` AS `stock_movement_id`,
    `movement`.`tenant_id` AS `tenant_id`,
    `movement`.`warehouse_id` AS `warehouse_id`,
    `movement`.`product_id` AS `product_id`,
    `movement`.`movement_type` AS `movement_type`,
    `movement`.`movement_date` AS `movement_date`,
    `movement`.`is_batch_tracked` AS `is_batch_tracked`,
    `movement`.`batch_allocation_status` AS `batch_allocation_status`,
    ABS(`movement`.`quantity`) AS `movement_quantity`,
    COALESCE(SUM(`allocation`.`quantity`), 0.000) AS `allocated_quantity`,
    ROUND(
        ABS(`movement`.`quantity`)
        - COALESCE(SUM(`allocation`.`quantity`), 0.000),
        3
    ) AS `quantity_difference`,
    CAST((
        CASE
            WHEN `movement`.`is_batch_tracked` = 0
                THEN 'not_required'
            WHEN `movement`.`batch_allocation_status` IN ('allocated', 'reversed')
             AND ABS(
                    ABS(`movement`.`quantity`)
                    - COALESCE(SUM(`allocation`.`quantity`), 0.000)
                 ) <= 0.0001
                THEN 'matched'
            ELSE 'mismatch'
        END
    ) AS CHAR CHARACTER SET utf8mb4)
        COLLATE utf8mb4_unicode_ci AS `reconciliation_status`
FROM `jcm_inventory_db`.`stock_movements` AS `movement`
LEFT JOIN `jcm_inventory_db`.`stock_movement_batches` AS `allocation`
    ON `allocation`.`tenant_id` = `movement`.`tenant_id`
   AND `allocation`.`stock_movement_id` = `movement`.`id`
GROUP BY
    `movement`.`id`,
    `movement`.`tenant_id`,
    `movement`.`warehouse_id`,
    `movement`.`product_id`,
    `movement`.`movement_type`,
    `movement`.`movement_date`,
    `movement`.`is_batch_tracked`,
    `movement`.`batch_allocation_status`,
    `movement`.`quantity`;

CREATE OR REPLACE VIEW `jcm_inventory_db`.`vw_stock_transfer_batch_reconciliation` AS
SELECT
    `item`.`id` AS `stock_transfer_item_id`,
    `item`.`tenant_id` AS `tenant_id`,
    `item`.`stock_transfer_id` AS `stock_transfer_id`,
    `item`.`product_id` AS `product_id`,
    `item`.`quantity_sent` AS `quantity_sent`,
    `item`.`quantity_received` AS `quantity_received`,
    COALESCE(SUM(`batch_item`.`quantity_sent`), 0.000)
        AS `batch_quantity_sent`,
    COALESCE(SUM(`batch_item`.`quantity_received`), 0.000)
        AS `batch_quantity_received`,
    ROUND(
        `item`.`quantity_sent`
        - COALESCE(SUM(`batch_item`.`quantity_sent`), 0.000),
        3
    ) AS `sent_difference`,
    ROUND(
        `item`.`quantity_received`
        - COALESCE(SUM(`batch_item`.`quantity_received`), 0.000),
        3
    ) AS `received_difference`,
    CAST((
        CASE
            WHEN `item`.`transfer_out_stock_movement_id` IS NULL
              OR `item`.`transfer_in_stock_movement_id` IS NULL
              OR `out_movement`.`id` IS NULL
              OR `in_movement`.`id` IS NULL
                THEN 'mismatch'
            WHEN `out_movement`.`is_batch_tracked` = 0
             AND `in_movement`.`is_batch_tracked` = 0
                THEN 'not_required'
            WHEN `out_movement`.`batch_allocation_status` IN ('allocated', 'reversed')
             AND `in_movement`.`batch_allocation_status` IN ('allocated', 'reversed')
             AND ABS(
                    `item`.`quantity_sent`
                    - COALESCE(SUM(`batch_item`.`quantity_sent`), 0.000)
                 ) <= 0.0001
             AND ABS(
                    `item`.`quantity_received`
                    - COALESCE(SUM(`batch_item`.`quantity_received`), 0.000)
                 ) <= 0.0001
                THEN 'matched'
            ELSE 'mismatch'
        END
    ) AS CHAR CHARACTER SET utf8mb4)
        COLLATE utf8mb4_unicode_ci AS `reconciliation_status`
FROM `jcm_inventory_db`.`stock_transfer_items` AS `item`
LEFT JOIN `jcm_inventory_db`.`stock_movements` AS `out_movement`
    ON `out_movement`.`tenant_id` = `item`.`tenant_id`
   AND `out_movement`.`id` = `item`.`transfer_out_stock_movement_id`
LEFT JOIN `jcm_inventory_db`.`stock_movements` AS `in_movement`
    ON `in_movement`.`tenant_id` = `item`.`tenant_id`
   AND `in_movement`.`id` = `item`.`transfer_in_stock_movement_id`
LEFT JOIN `jcm_inventory_db`.`stock_transfer_item_batches` AS `batch_item`
    ON `batch_item`.`tenant_id` = `item`.`tenant_id`
   AND `batch_item`.`stock_transfer_item_id` = `item`.`id`
GROUP BY
    `item`.`id`,
    `item`.`tenant_id`,
    `item`.`stock_transfer_id`,
    `item`.`product_id`,
    `item`.`quantity_sent`,
    `item`.`quantity_received`,
    `item`.`transfer_out_stock_movement_id`,
    `item`.`transfer_in_stock_movement_id`,
    `out_movement`.`id`,
    `out_movement`.`is_batch_tracked`,
    `out_movement`.`batch_allocation_status`,
    `in_movement`.`id`,
    `in_movement`.`is_batch_tracked`,
    `in_movement`.`batch_allocation_status`;


-- ============================================================================
-- VALIDATION
-- Expected: 8 view names and no SQL errors.
-- ============================================================================

SELECT `TABLE_NAME`
FROM `information_schema`.`VIEWS`
WHERE `TABLE_SCHEMA` = 'jcm_inventory_db'
  AND `TABLE_NAME` LIKE 'vw_%'
ORDER BY `TABLE_NAME`;

SELECT COUNT(*) AS `batch_inventory_rows`
FROM `jcm_inventory_db`.`vw_batch_inventory`;

SELECT COUNT(*) AS `batch_issue_candidate_rows`
FROM `jcm_inventory_db`.`vw_batch_issue_candidates`;
