<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Dashboard
    |--------------------------------------------------------------------------
    */
    Route::get('/dashboard', function () {return Inertia::render('dashboard');})->name('dashboard');

    /*
    |--------------------------------------------------------------------------
    | POS
    |--------------------------------------------------------------------------
    */
    Route::get('/pos', function () {return Inertia::render('dashboard');})->name('pos');

    /*
    |--------------------------------------------------------------------------
    | Inventory Module
    |--------------------------------------------------------------------------
    */
    Route::prefix('inventory')->name('inventory.')->group(function () {
        Route::get('/products', function () {return Inertia::render('inventory/products/index');})->name('products');
        Route::get('/categories', function () {return Inertia::render('inventory/categories/index');})->name('categories');
        Route::get('/stocks', function () {return Inertia::render('inventory/stocks/index');})->name('stocks');
    });

    /*
    |--------------------------------------------------------------------------
    | Sales Module
    |--------------------------------------------------------------------------
    */
    Route::prefix('sales')->name('sales.')->group(function () {
        Route::get('/transactions', function () {return Inertia::render('sales/transactions/index');})->name('transactions');
        Route::get('/returns', function () {return Inertia::render('sales/returns/index');})->name('returns');
    });

    /*
    |--------------------------------------------------------------------------
    | Customers
    |--------------------------------------------------------------------------
    */
    Route::get('/customers', function () {return Inertia::render('customers/index');})->name('customers');

    /*
    |--------------------------------------------------------------------------
    | Reports Module
    |--------------------------------------------------------------------------
    */
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/sales', function () {return Inertia::render('reports/sales/index');})->name('sales');
        Route::get('/inventory', function () {return Inertia::render('reports/inventory/index');})->name('inventory');
    });

    /*
    |--------------------------------------------------------------------------
    | Billing
    |--------------------------------------------------------------------------
    */
    Route::get('/billing', function () {return Inertia::render('billing/index');})->name('billing');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';