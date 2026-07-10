<?php

use App\Http\Controllers\BranchController;
use App\Http\Controllers\WarehouseController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

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

    Route::prefix('warehouses')
        ->name('warehouses.')
        ->controller(WarehouseController::class)
        ->group(function () {
            Route::get('/', 'index')
                ->name('index');

            Route::post('/', 'store')
                ->name('store');

            Route::put('/{warehouse}', 'update')
                ->name('update');

            Route::patch(
                '/{warehouse}/status',
                'updateStatus'
            )->name('status');

            Route::delete('/{warehouse}', 'destroy')
                ->name('destroy');
        });

    Route::prefix('inventory')
        ->name('inventory.')
        ->group(function () {
            Route::get('/overview', function () {
                return Inertia::render(
                    'inventory/overview/index'
                );
            })->name('overview');

            Route::get('/products', function () {
                return Inertia::render(
                    'inventory/products/index'
                );
            })->name('products.index');

            Route::get('/categories', function () {
                return Inertia::render(
                    'inventory/categories/index'
                );
            })->name('categories.index');

            Route::get('/stocks', function () {
                return Inertia::render(
                    'inventory/stocks/index'
                );
            })->name('stocks.index');
        });

    Route::get('/stock-movements', function () {
        return Inertia::render(
            'stock-movements/index'
        );
    })->name('stock-movements.index');

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

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';