<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth'])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Main Dashboard
    |--------------------------------------------------------------------------
    */

    Route::get('/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    /*
    |--------------------------------------------------------------------------
    | Inventory Management
    |--------------------------------------------------------------------------
    */

    Route::prefix('inventory')
        ->name('inventory.')
        ->group(function () {

            /*
            |--------------------------------------------------------------------------
            | Products
            |--------------------------------------------------------------------------
            */

            Route::get('/products', function () {
                return Inertia::render('inventory/products/index');
            })->name('products.index');

            /*
            |--------------------------------------------------------------------------
            | Categories
            |--------------------------------------------------------------------------
            */

            Route::get('/categories', function () {
                return Inertia::render('inventory/categories/index');
            })->name('categories.index');

            /*
            |--------------------------------------------------------------------------
            | Warehouses
            |--------------------------------------------------------------------------
            */

            Route::get('/warehouses', function () {
                return Inertia::render('inventory/warehouses/index');
            })->name('warehouses.index');

            /*
            |--------------------------------------------------------------------------
            | Stock Management
            |--------------------------------------------------------------------------
            */

            Route::get('/stocks', function () {
                return Inertia::render('inventory/stocks/index');
            })->name('stocks.index');

            /*
            |--------------------------------------------------------------------------
            | Stock Movements
            |--------------------------------------------------------------------------
            */

            Route::get('/movements', function () {
                return Inertia::render('inventory/movements/index');
            })->name('movements.index');
        });
});

/*
|--------------------------------------------------------------------------
| Additional Route Files
|--------------------------------------------------------------------------
*/

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';