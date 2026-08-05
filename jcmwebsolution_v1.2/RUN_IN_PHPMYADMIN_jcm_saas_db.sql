-- =====================================================================
-- JCM Websolution Flagship Control Center - Login Activity
-- Target database: jcm_saas_db
-- Safe to run more than once.
-- =====================================================================

CREATE TABLE IF NOT EXISTS `login_activities` (
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
  CONSTRAINT `login_activities_user_foreign`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Read-only verification
SHOW COLUMNS FROM `login_activities`;
SELECT COUNT(*) AS `current_login_activity_rows` FROM `login_activities`;
