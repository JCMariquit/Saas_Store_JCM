<?php

use App\Http\Controllers\BranchController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\ReceivingController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\StockMovementController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\WarehouseController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('dashboard');
    })
        ->middleware('feature:dashboard')
        ->name('dashboard');

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

    Route::prefix('inventory')
        ->name('inventory.')
        ->group(function () {
            Route::get('/overview', function () {
                return Inertia::render(
                    'inventory/overview/index'
                );
            })
                ->middleware(
                    'feature:inventory_overview'
                )
                ->name('overview');

            Route::prefix('products')
                ->name('products.')
                ->middleware('feature:products')
                ->controller(ProductController::class)
                ->group(function () {
                    Route::get('/', 'index')
                        ->name('index');

                    Route::post('/', 'store')
                        ->name('store');

                    Route::put(
                        '/{product}',
                        'update'
                    )->name('update');

                    Route::patch(
                        '/{product}/status',
                        'updateStatus'
                    )->name('status');

                    Route::delete(
                        '/{product}',
                        'destroy'
                    )->name('destroy');
                });

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
                    )
                        ->middleware(
                            'feature:stock_adjustment'
                        )
                        ->name('adjust');

                    Route::post(
                        '/{stock}/transfer',
                        'transfer'
                    )
                        ->middleware(
                            'feature:stock_transfer'
                        )
                        ->name('transfer');

                    Route::delete(
                        '/{stock}',
                        'destroy'
                    )->name('destroy');
                });
        });

    Route::get(
        '/stock-movements',
        [StockMovementController::class, 'index']
    )
        ->middleware('feature:stock_movements')
        ->name('stock-movements.index');

    Route::prefix('suppliers')
        ->name('suppliers.')
        ->group(function () {
            Route::middleware(
                'feature:supplier_management'
            )
                ->controller(
                    SupplierController::class
                )
                ->group(function () {
                    Route::get('/', 'index')
                        ->name('index');

                    Route::post('/', 'store')
                        ->name('store');

                    Route::put(
                        '/{supplier}',
                        'update'
                    )->name('update');

                    Route::patch(
                        '/{supplier}/status',
                        'updateStatus'
                    )->name('status');

                    Route::delete(
                        '/{supplier}',
                        'destroy'
                    )->name('destroy');
                });

            Route::prefix('purchase-orders')
                ->name('purchase-orders.')
                ->middleware(
                    'feature:purchase_orders'
                )
                ->controller(
                    PurchaseOrderController::class
                )
                ->group(function () {
                    Route::get('/', 'index')
                        ->name('index');

                    Route::post('/', 'store')
                        ->name('store');

                    Route::put(
                        '/{purchaseOrder}',
                        'update'
                    )->name('update');

                    Route::post(
                        '/{purchaseOrder}/submit',
                        'submit'
                    )->name('submit');

                    Route::post(
                        '/{purchaseOrder}/approve',
                        'approve'
                    )->name('approve');

                    Route::post(
                        '/{purchaseOrder}/cancel',
                        'cancel'
                    )->name('cancel');

                    Route::delete(
                        '/{purchaseOrder}',
                        'destroy'
                    )->name('destroy');
                });

            Route::prefix('receiving')
                ->name('receiving.')
                ->middleware('feature:receiving')
                ->controller(
                    ReceivingController::class
                )
                ->group(function () {
                    Route::get('/', 'index')
                        ->name('index');

                    Route::post('/', 'store')
                        ->name('store');
                });
        });

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