# JCM Websolution Flagship Control Center Renovation V1

## Purpose

This renovation converts the original JCM Websolution project into the central control platform for all JCM products, subscriptions, users, payments, and future systems. It uses the current `jcm_saas_db` canonical access architecture and the same visual language as JCM Inventory.

## Platform Control Modules

- Control Center dashboard
- Users & Accounts
- Products / application catalog
- Services
- Plans and monthly / quarterly / yearly pricing
- Orders and payment submission
- Subscription Control
- Transactions
- Payment Methods
- Website Builder
- Messages and notifications
- Profile, Password, Login Activity, Appearance, Data & Privacy, Account Removal

## Subscription Control Actions

- Activate
- Restore full access
- Expire now
- Mark past due
- Start grace period
- Lock
- Suspend
- Cancel
- Change plan

Every control action synchronizes the subscription and canonical `user_product_access` record, then writes an audit entry to `subscription_events`.

## Canonical Access Architecture

Platform administration uses:

- `platform_roles`
- `user_platform_roles`

Product access uses:

- `user_product_access`
- `product_user_types`
- `user_types`
- `user_product_access_scopes`

Legacy fields such as `users.role`, `users.client_id`, `users.branch_id`, and `users.system_used` are not used as access authority.

## Appearance

- Light and Dark display modes
- JCM Control Dark
- Ocean Enterprise
- Violet Command
- Amber Operations
- Slate Minimal
- Theme preference is applied across Admin, Store, Settings, and Auth surfaces

## Required Database Change

Import `RUN_IN_PHPMYADMIN_jcm_saas_db.sql` into `jcm_saas_db` to add the `login_activities` table.

No change is required in `jcm_inventory_db`.

## Validation Completed

- PHP syntax validation passed for application, routes, bootstrap, and configuration files
- Laravel route boot passed through JSON output
- 96 non-vendor routes registered
- TypeScript `tsc --noEmit` passed
- Full ESLint validation passed with zero warnings
- Model fillable fields were reconciled against the latest `jcm_saas_db` schema

## Runtime Validation Still Required

- Import the SQL on the actual database
- Run the Windows Vite production build
- Browser-test Admin and Store pages
- Test real order verification and subscription synchronization
- Test Inventory reaction to Activate, Expire, Grace Period, Past Due, Lock, and Change Plan controls
