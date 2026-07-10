<?php

use App\Http\Controllers\BranchController;
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
    | Branch Management
    |--------------------------------------------------------------------------
    |
    | Page:
    | resources/js/pages/branches/index.tsx
    |
    */

    Route::prefix('branches')
        ->name('branches.')
        ->controller(BranchController::class)
        ->group(function () {
            Route::get('/', 'index')
                ->name('index');

            Route::post('/', 'store')
                ->name('store');

            Route::put('/{branch}', 'update')
                ->name('update');

            Route::patch('/{branch}/status', 'updateStatus')
                ->name('status');

            Route::delete('/{branch}', 'destroy')
                ->name('destroy');
        });

    /*
    |--------------------------------------------------------------------------
    | Warehouse Management
    |--------------------------------------------------------------------------
    |
    | Page:
    | resources/js/pages/warehouses/index.tsx
    |
    */

    Route::get('/warehouses', function () {
        return Inertia::render('warehouses/index');
    })->name('warehouses.index');

    /*
    |--------------------------------------------------------------------------
    | Inventory Management
    |--------------------------------------------------------------------------
    |
    | Folder:
    | resources/js/pages/inventory/
    |
    */

    Route::prefix('inventory')
        ->name('inventory.')
        ->group(function () {

            /*
            |--------------------------------------------------------------------------
            | Stock Overview
            |--------------------------------------------------------------------------
            |
            | Page:
            | resources/js/pages/inventory/overview/index.tsx
            |
            */

            Route::get('/overview', function () {
                return Inertia::render(
                    'inventory/overview/index'
                );
            })->name('overview');

            /*
            |--------------------------------------------------------------------------
            | Products
            |--------------------------------------------------------------------------
            |
            | Page:
            | resources/js/pages/inventory/products/index.tsx
            |
            */

            Route::get('/products', function () {
                return Inertia::render(
                    'inventory/products/index'
                );
            })->name('products.index');

            /*
            |--------------------------------------------------------------------------
            | Categories
            |--------------------------------------------------------------------------
            |
            | Page:
            | resources/js/pages/inventory/categories/index.tsx
            |
            */

            Route::get('/categories', function () {
                return Inertia::render(
                    'inventory/categories/index'
                );
            })->name('categories.index');

            /*
            |--------------------------------------------------------------------------
            | Stock Management
            |--------------------------------------------------------------------------
            |
            | Page:
            | resources/js/pages/inventory/stocks/index.tsx
            |
            */

            Route::get('/stocks', function () {
                return Inertia::render(
                    'inventory/stocks/index'
                );
            })->name('stocks.index');
        });

    /*
    |--------------------------------------------------------------------------
    | Stock Movements
    |--------------------------------------------------------------------------
    |
    | Page:
    | resources/js/pages/stock-movements/index.tsx
    |
    */

    Route::get('/stock-movements', function () {
        return Inertia::render(
            'stock-movements/index'
        );
    })->name('stock-movements.index');

    /*
    |--------------------------------------------------------------------------
    | Supplier Management
    |--------------------------------------------------------------------------
    |
    | These routes are preserved for the planned supplier module.
    |
    */

    Route::prefix('suppliers')
        ->name('suppliers.')
        ->group(function () {
            Route::get('/', function () {
                return Inertia::render(
                    'suppliers/index'
                );
            })->name('index');

            Route::get('/purchase-orders', function () {
                return Inertia::render(
                    'suppliers/purchase-orders/index'
                );
            })->name('purchase-orders.index');

            Route::get('/receiving', function () {
                return Inertia::render(
                    'suppliers/receiving/index'
                );
            })->name('receiving.index');
        });

    /*
    |--------------------------------------------------------------------------
    | Team Management
    |--------------------------------------------------------------------------
    |
    | These routes are preserved for the planned team module.
    |
    */

    Route::prefix('team')
        ->name('team.')
        ->group(function () {
            Route::get('/overview', function () {
                return Inertia::render(
                    'team/overview/index'
                );
            })->name('overview');

            Route::get('/staff', function () {
                return Inertia::render(
                    'team/staff/index'
                );
            })->name('staff.index');

            Route::get('/roles', function () {
                return Inertia::render(
                    'team/roles/index'
                );
            })->name('roles.index');
        });

    /*
    |--------------------------------------------------------------------------
    | Temporary Legacy Redirects
    |--------------------------------------------------------------------------
    |
    | These redirects prevent the old sidebar URLs from returning 404
    | while we are still restructuring the sidebar.
    |
    */

    Route::redirect(
        '/inventory/branches',
        '/branches'
    );

    Route::redirect(
        '/inventory/locations',
        '/warehouses'
    );

    Route::redirect(
        '/inventory/warehouses',
        '/warehouses'
    );

    Route::redirect(
        '/inventory/movements',
        '/stock-movements'
    );
});

/*
|--------------------------------------------------------------------------
| Additional Route Files
|--------------------------------------------------------------------------
*/

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';