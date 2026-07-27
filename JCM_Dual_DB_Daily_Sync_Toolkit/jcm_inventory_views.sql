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
