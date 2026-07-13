<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Current JCM SaaS Product
    |--------------------------------------------------------------------------
    |
    | This Laravel application is the JCM Inventory product. The product code
    | connects this app to its product, plans, roles, features and sidebars
    | stored in the central JCM SaaS database.
    |
    */

    'product_code' => env(
        'JCM_PRODUCT_CODE',
        'JCM-INVENTORY-001'
    ),
];