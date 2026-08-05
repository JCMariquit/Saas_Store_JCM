JCM WEBSOLUTION FLAGSHIP CONTROL CENTER RENOVATION V1
=====================================================

1. BACK UP YOUR CURRENT PROJECT AND DATABASE.

2. Extract this ZIP.

3. Copy everything inside the extracted folder directly into the root of the
   JCM Websolution project, where artisan, app, routes, and resources are found.

4. Choose "Replace the files in the destination" when Windows asks.

5. In phpMyAdmin, select:

   jcm_saas_db

6. Import:

   RUN_IN_PHPMYADMIN_jcm_saas_db.sql

   This adds only the login_activities table. It is safe to run more than once.

7. Confirm the real project .env uses the correct database and URL. Do not
   overwrite a production .env with .env.example.

   Recommended local values:

   APP_TIMEZONE=Asia/Manila
   APP_URL=http://127.0.0.1:8000
   DB_DATABASE=jcm_saas_db

8. Run:

   APPLY_JCM_FLAGSHIP_RENOVATION.bat

9. Start the project:

   php artisan serve

10. Open one consistent host only, preferably:

   http://127.0.0.1:8000

11. Refresh with Ctrl + Shift + R.

MANUAL COMMANDS
===============

composer dump-autoload
php artisan package:discover --ansi
php artisan optimize:clear
php artisan route:list --path=admin
npm run build

If npm reports missing or incompatible native packages, delete node_modules and
run:

npm install
npm run build

IMPORTANT
=========

- The logged-in administrator must have an active super_admin or admin role in
  platform_roles + user_platform_roles.
- No SQL is required in jcm_inventory_db.
- Use database/sql/verify_flagship_control_center.sql for read-only verification.
