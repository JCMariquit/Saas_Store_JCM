<?php

return [
    /*
    |--------------------------------------------------------------------------
    | JCM SaaS connection
    |--------------------------------------------------------------------------
    |
    | This must be the connection key in config/database.php, not the MySQL
    | driver name. The expected key for this project is "saas".
    |
    */
    'saas_connection' => env('JCM_SAAS_CONNECTION', 'saas'),

    /*
    |--------------------------------------------------------------------------
    | Current product
    |--------------------------------------------------------------------------
    */
    'product_code' => env('JCM_PRODUCT_CODE', 'JCM-INVENTORY-001'),

    /*
    |--------------------------------------------------------------------------
    | Current access session
    |--------------------------------------------------------------------------
    */
    'current_access_session_key' => 'jcm.current_access_id',
];
