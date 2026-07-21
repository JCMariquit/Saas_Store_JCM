<?php

use App\Http\Controllers\BranchController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\PurchaseApprovalController;
use App\Http\Controllers\ReceivingController;
use App\Http\Controllers\ReceivedOrderController;
use App\Http\Controllers\RoleAccessController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\StockMovementController;
use App\Http\Controllers\StockOverviewController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\TeamMemberController;
use App\Http\Controllers\TeamOverviewController;
use App\Http\Controllers\WarehouseController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get(
        '/dashboard',
        [DashboardController::class, 'index']
    )
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
            Route::get(
                '/overview',
                [StockOverviewController::class, 'index']
            )
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

    /*
    |--------------------------------------------------------------------------
    | Procurement
    |--------------------------------------------------------------------------
    |
    | Canonical procurement URLs and route names use "procurement".
    | Temporary legacy /suppliers aliases are registered below so existing
    | frontend requests continue working while page paths are migrated.
    |
    */

    Route::prefix('procurement')
        ->name('procurement.')
        ->group(function () {
            Route::prefix('suppliers')
                ->name('suppliers.')
                ->middleware(
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
                        '/{purchaseOrder}/cancel',
                        'cancel'
                    )->name('cancel');

                    Route::delete(
                        '/{purchaseOrder}',
                        'destroy'
                    )->name('destroy');
                });

            Route::prefix('purchase-approvals')
                ->name('purchase-approvals.')
                ->middleware(
                    'feature:purchase_orders'
                )
                ->controller(
                    PurchaseApprovalController::class
                )
                ->group(function () {
                    Route::get('/', 'index')
                        ->name('index');

                    Route::post(
                        '/{purchaseOrder}/approve',
                        'approve'
                    )->name('approve');

                    Route::post(
                        '/{purchaseOrder}/return-to-draft',
                        'returnToDraft'
                    )->name('return-to-draft');
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

                    Route::post(
                        '/{receipt}/void',
                        'void'
                    )->name('void');
                });

            Route::prefix('received-orders')
                ->name('received-orders.')
                ->middleware('feature:receiving')
                ->controller(
                    ReceivedOrderController::class
                )
                ->group(function () {
                    Route::get('/', 'index')
                        ->name('index');
                });
        });

    /*
    |--------------------------------------------------------------------------
    | Temporary legacy supplier URLs
    |--------------------------------------------------------------------------
    |
    | These aliases intentionally have no route names. Remove this block after
    | every frontend request, breadcrumb, controller redirect, and sidebar URL
    | has been migrated from /suppliers to /procurement.
    |
    */

    Route::prefix('suppliers')
        ->group(function () {
            Route::middleware(
                'feature:supplier_management'
            )
                ->controller(
                    SupplierController::class
                )
                ->group(function () {
                    Route::get('/', 'index');

                    Route::post('/', 'store');

                    Route::put(
                        '/{supplier}',
                        'update'
                    );

                    Route::patch(
                        '/{supplier}/status',
                        'updateStatus'
                    );

                    Route::delete(
                        '/{supplier}',
                        'destroy'
                    );
                });

            Route::prefix('purchase-orders')
                ->middleware(
                    'feature:purchase_orders'
                )
                ->controller(
                    PurchaseOrderController::class
                )
                ->group(function () {
                    Route::get('/', 'index');

                    Route::post('/', 'store');

                    Route::put(
                        '/{purchaseOrder}',
                        'update'
                    );

                    Route::post(
                        '/{purchaseOrder}/submit',
                        'submit'
                    );

                    Route::post(
                        '/{purchaseOrder}/cancel',
                        'cancel'
                    );

                    Route::delete(
                        '/{purchaseOrder}',
                        'destroy'
                    );
                });

            Route::prefix('purchase-approvals')
                ->middleware(
                    'feature:purchase_orders'
                )
                ->controller(
                    PurchaseApprovalController::class
                )
                ->group(function () {
                    Route::get('/', 'index');

                    Route::post(
                        '/{purchaseOrder}/approve',
                        'approve'
                    );

                    Route::post(
                        '/{purchaseOrder}/return-to-draft',
                        'returnToDraft'
                    );
                });

            Route::prefix('receiving')
                ->middleware('feature:receiving')
                ->controller(
                    ReceivingController::class
                )
                ->group(function () {
                    Route::get('/', 'index');

                    Route::post('/', 'store');

                    Route::post(
                        '/{receipt}/void',
                        'void'
                    );
                });

            Route::prefix('received-orders')
                ->middleware('feature:receiving')
                ->controller(
                    ReceivedOrderController::class
                )
                ->group(function () {
                    Route::get('/', 'index');
                });
        });

    Route::prefix('team')
        ->name('team.')
        ->group(function () {
            Route::get(
                '/overview',
                [TeamOverviewController::class, 'index']
            )
                ->middleware('feature:team_overview')
                ->name('overview');

            Route::prefix('members')
                ->name('members.')
                ->middleware(
                    'feature:staff_management'
                )
                ->controller(
                    TeamMemberController::class
                )
                ->group(function () {
                    Route::get('/', 'index')
                        ->name('index');

                    Route::post('/', 'store')
                        ->name('store');

                    Route::put(
                        '/{member}',
                        'update'
                    )->name('update');

                    Route::patch(
                        '/{member}/status',
                        'updateStatus'
                    )->name('status');

                    Route::post(
                        '/{member}/reset-password',
                        'resetPassword'
                    )->name('reset-password');

                    Route::delete(
                        '/{member}',
                        'destroy'
                    )->name('destroy');
                });

            Route::prefix('roles')
                ->name('roles.')
                ->middleware(
                    'feature:roles_access'
                )
                ->controller(
                    RoleAccessController::class
                )
                ->group(function () {
                    Route::get('/', 'index')
                        ->name('index');

                    Route::put(
                        '/{role}',
                        'update'
                    )->name('update');
                });
        });

    Route::redirect(
        '/team/staff',
        '/team/members'
    );

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