<?php

use App\Http\Controllers\BranchController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\WarehouseController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

/*
|--------------------------------------------------------------------------
| Authenticated Inventory routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth'])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Dashboard
    |--------------------------------------------------------------------------
    */

    Route::get('/dashboard', function () {
        return Inertia::render('dashboard');
    })
        ->middleware('feature:dashboard')
        ->name('dashboard');

    /*
    |--------------------------------------------------------------------------
    | Branches
    |--------------------------------------------------------------------------
    */

    Route::prefix('branches')
        ->name('branches.')
        ->middleware('feature:branch_management')
        ->controller(BranchController::class)
        ->group(function () {
            Route::get('/', 'index')
                ->name('index');

            Route::post('/', 'store')
                ->name('store');

            Route::put('/{branch}', 'update')
                ->name('update');

            Route::patch(
                '/{branch}/status',
                'updateStatus'
            )->name('status');

            Route::delete('/{branch}', 'destroy')
                ->name('destroy');
        });

    /*
    |--------------------------------------------------------------------------
    | Warehouses
    |--------------------------------------------------------------------------
    */

    Route::prefix('warehouses')
        ->name('warehouses.')
        ->middleware('feature:warehouse_management')
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

    /*
    |--------------------------------------------------------------------------
    | Inventory
    |--------------------------------------------------------------------------
    */

    Route::prefix('inventory')
        ->name('inventory.')
        ->group(function () {

            /*
            |--------------------------------------------------------------------------
            | Inventory overview
            |--------------------------------------------------------------------------
            */

            Route::get('/overview', function () {
                return Inertia::render(
                    'inventory/overview/index'
                );
            })
                ->middleware(
                    'feature:inventory_overview'
                )
                ->name('overview');

            /*
            |--------------------------------------------------------------------------
            | Products
            |--------------------------------------------------------------------------
            */

            Route::prefix('products')
                ->name('products.')
                ->middleware('feature:products')
                ->controller(ProductController::class)
                ->group(function () {
                    Route::get('/', 'index')
                        ->name('index');

                    Route::post('/', 'store')
                        ->name('store');

                    Route::put('/{product}', 'update')
                        ->name('update');

                    Route::patch(
                        '/{product}/status',
                        'updateStatus'
                    )->name('status');

                    Route::delete(
                        '/{product}',
                        'destroy'
                    )->name('destroy');
                });

            /*
            |--------------------------------------------------------------------------
            | Categories
            |--------------------------------------------------------------------------
            */

            Route::prefix('categories')
                ->name('categories.')
                ->middleware('feature:categories')
                ->controller(CategoryController::class)
                ->group(function () {
                    Route::get('/', 'index')
                        ->name('index');

                    Route::post('/', 'store')
                        ->name('store');

                    Route::put(
                        '/{category}',
                        'update'
                    )->name('update');

                    Route::patch(
                        '/{category}/status',
                        'updateStatus'
                    )->name('status');

                    Route::delete(
                        '/{category}',
                        'destroy'
                    )->name('destroy');
                });

            /*
            |--------------------------------------------------------------------------
            | Stocks
            |--------------------------------------------------------------------------
            |
            | Sa ngayon, lahat ng stock actions ay protected ng
            | stock_management feature.
            |
            | Later puwede tayong gumawa ng separate action permissions para:
            | - stock_adjustment
            | - stock_transfer
            |
            */

            Route::prefix('stocks')
                ->name('stocks.')
                ->middleware(
                    'feature:stock_management'
                )
                ->controller(StockController::class)
                ->group(function () {
                    Route::get('/', 'index')
                        ->name('index');

                    Route::post('/', 'store')
                        ->name('store');

                    Route::patch(
                        '/{stock}/settings',
                        'updateSettings'
                    )->name('settings');

                    Route::post(
                        '/{stock}/adjust',
                        'adjust'
                    )->name('adjust');

                    Route::post(
                        '/{stock}/transfer',
                        'transfer'
                    )->name('transfer');

                    Route::delete(
                        '/{stock}',
                        'destroy'
                    )->name('destroy');
                });
        });

    /*
    |--------------------------------------------------------------------------
    | Stock movements
    |--------------------------------------------------------------------------
    */

    Route::get('/stock-movements', function () {
        return Inertia::render(
            'stock-movements/index'
        );
    })
        ->middleware('feature:stock_movements')
        ->name('stock-movements.index');

    /*
    |--------------------------------------------------------------------------
    | Suppliers
    |--------------------------------------------------------------------------
    */

    Route::prefix('suppliers')
        ->name('suppliers.')
        ->group(function () {
            Route::get('/', function () {
                return Inertia::render(
                    'suppliers/index'
                );
            })
                ->middleware(
                    'feature:supplier_management'
                )
                ->name('index');

            Route::get(
                '/purchase-orders',
                function () {
                    return Inertia::render(
                        'suppliers/purchase-orders/index'
                    );
                }
            )
                ->middleware(
                    'feature:purchase_orders'
                )
                ->name('purchase-orders.index');

            Route::get('/receiving', function () {
                return Inertia::render(
                    'suppliers/receiving/index'
                );
            })
                ->middleware('feature:receiving')
                ->name('receiving.index');
        });

    /*
    |--------------------------------------------------------------------------
    | Team
    |--------------------------------------------------------------------------
    */

    Route::prefix('team')
        ->name('team.')
        ->group(function () {
            Route::get('/overview', function () {
                return Inertia::render(
                    'team/overview/index'
                );
            })
                ->middleware(
                    'feature:team_overview'
                )
                ->name('overview');

            Route::get('/staff', function () {
                return Inertia::render(
                    'team/staff/index'
                );
            })
                ->middleware(
                    'feature:staff_management'
                )
                ->name('staff.index');

            Route::get('/roles', function () {
                return Inertia::render(
                    'team/roles/index'
                );
            })
                ->middleware(
                    'feature:roles_access'
                )
                ->name('roles.index');
        });

    /*
    |--------------------------------------------------------------------------
    | Legacy redirects
    |--------------------------------------------------------------------------
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
| Additional route files
|--------------------------------------------------------------------------
*/

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';