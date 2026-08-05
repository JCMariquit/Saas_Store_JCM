-- =====================================================================
-- JCM Websolution Flagship Control Center - Read-only verification
-- Target database: jcm_saas_db
-- This file does not insert, update, or delete data.
-- =====================================================================

SELECT
    table_name,
    table_rows
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name IN (
      'users',
      'platform_roles',
      'user_platform_roles',
      'products',
      'plans',
      'plan_prices',
      'orders',
      'transactions',
      'subscriptions',
      'subscription_events',
      'user_product_access',
      'product_user_types',
      'user_types',
      'payment_methods',
      'login_activities'
  )
ORDER BY table_name;

SELECT
    role_code,
    name,
    status,
    sort_order
FROM platform_roles
ORDER BY sort_order, id;

SELECT
    u.id,
    u.name,
    u.email,
    u.is_active,
    pr.role_code,
    pr.name AS role_name,
    upr.is_primary,
    upr.status AS assignment_status
FROM users AS u
LEFT JOIN user_platform_roles AS upr
    ON upr.user_id = u.id
LEFT JOIN platform_roles AS pr
    ON pr.id = upr.platform_role_id
ORDER BY u.id, upr.is_primary DESC, pr.sort_order;

SELECT
    p.id AS product_id,
    p.product_code,
    p.name AS product_name,
    p.status AS product_status,
    p.app_url,
    pl.id AS plan_id,
    pl.plan_code,
    pl.plan_name,
    pl.status AS plan_status,
    pl.max_branches,
    pl.max_warehouses,
    pl.max_staff,
    pp.billing_interval,
    pp.price,
    pp.duration_days,
    pp.is_default,
    pp.status AS price_status
FROM products AS p
LEFT JOIN plans AS pl
    ON pl.product_id = p.id
LEFT JOIN plan_prices AS pp
    ON pp.plan_id = pl.id
ORDER BY p.sort_order, p.id, pl.sort_order, pl.id, pp.sort_order, pp.id;

SELECT
    s.id,
    s.subscription_code,
    owner.name AS account_owner,
    owner.email,
    p.product_code,
    p.name AS product_name,
    pl.plan_name,
    s.subscription_type,
    s.status,
    s.start_date,
    s.end_date,
    s.current_period_end,
    s.grace_ends_at,
    s.updated_at
FROM subscriptions AS s
JOIN users AS owner
    ON owner.id = s.account_owner_id
JOIN products AS p
    ON p.id = s.product_id
JOIN plans AS pl
    ON pl.id = s.plan_id
ORDER BY s.updated_at DESC, s.id DESC;

SELECT
    access.id,
    access.user_id,
    access.account_owner_id,
    p.product_code,
    ut.type_code AS user_type,
    access.subscription_id,
    access.status,
    access.joined_at,
    access.last_accessed_at
FROM user_product_access AS access
JOIN products AS p
    ON p.id = access.product_id
JOIN product_user_types AS put
    ON put.id = access.product_user_type_id
JOIN user_types AS ut
    ON ut.id = put.user_type_id
ORDER BY access.account_owner_id, p.product_code, access.user_id;
