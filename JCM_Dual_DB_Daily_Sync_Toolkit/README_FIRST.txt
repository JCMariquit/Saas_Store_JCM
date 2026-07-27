JCM DUAL DATABASE DAILY SYNC TOOLKIT
====================================

DATABASES
---------
1. jcm_inventory_db
2. jcm_saas_db

This replaces the older inventory-only workflow. One export creates the latest
files for BOTH databases, and one import restores BOTH databases.

FIRST-TIME SETUP
----------------
1. Put this entire folder inside your private Git project.
2. Keep every file and folder together.
3. Confirm XAMPP is installed at:
       C:\xampp\mysql\bin
4. Confirm both databases use:
       Host: 127.0.0.1
       Port: 3306
       User: root
       Password: blank

Edit the CONFIGURATION section inside both BAT files when your setup differs.

DAILY SOURCE-PC WORKFLOW
------------------------
1. Finish your work.
2. Double-click:
       01_EXPORT_BOTH_DATABASES.bat
3. Wait for:
       BOTH DATABASES EXPORTED SUCCESSFULLY
4. Run:
       git add .
       git commit -m "Sync latest development databases"
       git push

The script overwrites only these two Git transfer files:
    transfer\jcm_inventory_db_latest.sql
    transfer\jcm_saas_db_latest.sql

DAILY TARGET-PC WORKFLOW
------------------------
1. Run:
       git pull
2. Double-click:
       02_IMPORT_BOTH_DATABASES.bat
3. Type:
       IMPORT
4. Wait for:
       BOTH DATABASES IMPORTED AND VERIFIED
5. Run:
       php artisan optimize:clear
6. Open and test the Laravel system.

NO DRAGGING IS REQUIRED
-----------------------
The import script automatically reads the two latest SQL files from the
"transfer" folder.

IMPORTANT: ONE ACTIVE SOURCE OF TRUTH
-------------------------------------
This is full database replacement, not database merging.

Work on one PC, export and push, then pull and import on the other PC before
continuing there. Do not make separate database changes on both PCs between
syncs because one side will overwrite the other.

SECURITY
--------
jcm_saas_db contains users, account access, subscriptions, and authentication
records. Use this only in a PRIVATE Git repository with development/test data.
Never push a production/client database to GitHub.

SAFETY BACKUPS
--------------
Before every import, both current databases are backed up automatically inside:
    safety_backups\TIMESTAMP\

The included nested .gitignore prevents these safety backups from being pushed.
Do not delete the latest safety backup until the imported application has been
tested successfully.

WHY INVENTORY VIEWS ARE HANDLED DIFFERENTLY
-------------------------------------------
The current phpMyAdmin exporter corrupted complex inventory views. The export
tool therefore excludes the 8 views from the normal dump and appends the
canonical working definitions from:
    jcm_inventory_views.sql

The jcm_saas_db dump does not currently require that special view handling.
