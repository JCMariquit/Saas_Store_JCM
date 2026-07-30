<?php

use App\Http\Controllers\BranchController;
use App\Http\Controllers\BusinessProfileController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\Reports\CategoryReportController;
use App\Http\Controllers\Reports\ProductReportController;
use App\Http\Controllers\Reports\ProcurementReportController;
use App\Http\Controllers\Reports\StockIssuanceReportController;
use App\Http\Controllers\Reports\StockMovementReportController;
use App\Http\Controllers\Reports\StockReportController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\PurchaseApprovalController;
use App\Http\Controllers\ReceivingController;
use App\Http\Controllers\ReceivedOrderController;
use App\Http\Controllers\StockIssuanceController;
use App\Http\Controllers\StockIssuanceHistoryController;
use App\Http\Controllers\Subscriptions\SubscriptionActionController;
use App\Http\Controllers\Subscriptions\SubscriptionCheckoutController;
use App\Http\Controllers\Subscriptions\SubscriptionController;
use App\Http\Controllers\Subscriptions\SubscriptionPaymentController;
use App\Http\Controllers\Subscriptions\SubscriptionWorkspaceController;
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
    /*
    |--------------------------------------------------------------------------
    | Subscription and Billing
    |--------------------------------------------------------------------------
    |
    | These routes intentionally stay OUTSIDE subscription.access.
    | An expired or blocked owner must still be able to open this page,
    | choose a plan, and submit a renewal payment.
    |
    */

    Route::prefix('settings/subscription')
        ->name('subscription.')
        ->group(function () {
            Route::get(
                '/',
                [SubscriptionController::class, 'index']
            )->name('index');

            Route::get(
                '/history',
                [SubscriptionWorkspaceController::class, 'history']
            )->name('history');

            Route::get(
                '/invoices',
                [SubscriptionWorkspaceController::class, 'invoices']
            )->name('invoices');

            Route::get(
                '/usage',
                [SubscriptionWorkspaceController::class, 'usage']
            )->name('usage');

            Route::get(
                '/activity',
                [SubscriptionWorkspaceController::class, 'activity']
            )->name('activity');

            Route::post(
                '/checkout',
                [SubscriptionCheckoutController::class, 'store']
            )->name('checkout.store');

            Route::patch(
                '/checkout/{order}/cancel',
                [
                    SubscriptionActionController::class,
                    'cancelCheckout',
                ]
            )
                ->whereNumber('order')
                ->name('checkout.cancel');

            Route::post(
                '/payment',
                [SubscriptionPaymentController::class, 'store']
            )->name('payment.store');

            Route::patch(
                '/cancel-at-period-end',
                [
                    SubscriptionActionController::class,
                    'cancelAtPeriodEnd',
                ]
            )->name('cancel-at-period-end');

            Route::patch(
                '/resume',
                [SubscriptionActionController::class, 'resume']
            )->name('resume');
        });

    /*
    |--------------------------------------------------------------------------
    | Subscription-protected Inventory application
    |--------------------------------------------------------------------------
    |
    | Every operational Inventory route below inherits the account owner's
    | subscription. When the owner is read-only, write requests are blocked.
    |
    */

    Route::middleware('subscription.access')
        ->group(function () {
    /*
    |--------------------------------------------------------------------------
    | Dashboard
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/dashboard',
        [DashboardController::class, 'index']
    )
        ->middleware('feature:dashboard')
        ->name('dashboard');

    /*
    |--------------------------------------------------------------------------
    | Locations
    |--------------------------------------------------------------------------
    */

    Route::prefix('locations')
        ->name('locations.')
        ->group(function () {
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
                        ->middleware(
                            'subscription.capability:write'
                        )
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
            | Inventory Overview
            |--------------------------------------------------------------------------
            */

            Route::get(
                '/overview',
                [StockOverviewController::class, 'index']
            )
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

                    Route::put(
                        '/{product}',
                        'update'
                    )
                        ->middleware(
                            'subscription.capability:write'
                        )
                        ->name('update');

                    Route::patch(
                        '/{product}/status',
                        'updateStatus'
                    )
                        ->middleware(
                            'subscription.capability:write'
                        )
                        ->name('status');

                    Route::delete(
                        '/{product}',
                        'destroy'
                    )
                        ->middleware(
                            'subscription.capability:write'
                        )
                        ->name('destroy');
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
            | Stock Management
            |--------------------------------------------------------------------------
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

            /*
            |--------------------------------------------------------------------------
            | Withdraw Stock
            |--------------------------------------------------------------------------
            */

            Route::prefix('withdraw')
                ->name('withdraw.')
                ->middleware([
                    'feature:stock_issuance_terminal',
                    'subscription.capability:active',
                ])
                ->controller(
                    StockIssuanceController::class
                )
                ->group(function () {
                    Route::get('/', 'terminal')
                        ->name('index');

                    Route::post('/', 'store')
                        ->name('store');
                });

            /*
            |--------------------------------------------------------------------------
            | Withdrawal History
            |--------------------------------------------------------------------------
            */

            Route::prefix('history')
                ->name('history.')
                ->middleware([
                    'feature:stock_issuance_history',
                    'subscription.capability:active',
                ])
                ->controller(
                    StockIssuanceHistoryController::class
                )
                ->group(function () {
                    Route::get('/', 'index')
                        ->name('index');

                    Route::post(
                        '/{issuance}/void',
                        'void'
                    )->name('void');
                });
            /*
            |--------------------------------------------------------------------------
            | Stock Movements
            |--------------------------------------------------------------------------
            */

            Route::prefix('stock-movements')
                ->name('stock-movements.')
                ->middleware([
                    'feature:stock_movements',
                    'subscription.capability:active',
                ])
                ->controller(
                    StockMovementController::class
                )
                ->group(function () {
                    Route::get('/', 'index')
                        ->name('index');
                });

        });


    /*
    |--------------------------------------------------------------------------
    | Reports
    |--------------------------------------------------------------------------
    */

    Route::prefix('reports/inventory/products')
        ->name('reports.inventory.products.')
        ->middleware('feature:products')
        ->controller(ProductReportController::class)
        ->group(function () {
            Route::get('/pdf', 'pdf')
                ->middleware(
                    'subscription.capability:export'
                )
                ->name('pdf');

            Route::get('/excel-preview', 'excelPreview')
                ->middleware(
                    'subscription.capability:export'
                )
                ->name('excel-preview');

            Route::get('/excel', 'excel')
                ->middleware(
                    'subscription.capability:export'
                )
                ->name('excel');
        });

    Route::prefix('reports/inventory/stocks')
        ->name('reports.inventory.stocks.')
        ->middleware('feature:stock_management')
        ->controller(StockReportController::class)
        ->group(function () {
            Route::get('/pdf', 'pdf')
                ->middleware(
                    'subscription.capability:export'
                )
                ->name('pdf');

            Route::get('/excel-preview', 'excelPreview')
                ->middleware(
                    'subscription.capability:export'
                )
                ->name('excel-preview');

            Route::get('/excel', 'excel')
                ->middleware(
                    'subscription.capability:export'
                )
                ->name('excel');
        });

    Route::prefix('reports/inventory/categories')
        ->name('reports.inventory.categories.')
        ->middleware('feature:categories')
        ->controller(CategoryReportController::class)
        ->group(function () {
            Route::get('/pdf', 'pdf')
                ->middleware(
                    'subscription.capability:export'
                )
                ->name('pdf');

            Route::get(
                '/excel-preview',
                'excelPreview'
            )
                ->middleware(
                    'subscription.capability:export'
                )
                ->name('excel-preview');

            Route::get('/excel', 'excel')
                ->middleware(
                    'subscription.capability:export'
                )
                ->name('excel');
        });

    Route::prefix('reports/inventory/withdrawals')
        ->name('reports.inventory.withdrawals.')
        ->middleware(
            'feature:stock_issuance_history'
        )
        ->controller(
            StockIssuanceReportController::class
        )
        ->group(function () {
            Route::get('/pdf', 'pdf')
                ->middleware(
                    'subscription.capability:export'
                )
                ->name('pdf');

            Route::get(
                '/excel-preview',
                'excelPreview'
            )
                ->middleware(
                    'subscription.capability:export'
                )
                ->name('excel-preview');

            Route::get('/excel', 'excel')
                ->middleware(
                    'subscription.capability:export'
                )
                ->name('excel');
        });

    Route::prefix(
        'reports/inventory/stock-movements'
    )
        ->name(
            'reports.inventory.stock-movements.'
        )
        ->middleware(
            'feature:stock_movements'
        )
        ->controller(
            StockMovementReportController::class
        )
        ->group(function () {
            Route::get('/pdf', 'pdf')
                ->middleware(
                    'subscription.capability:export'
                )
                ->name('pdf');

            Route::get(
                '/excel-preview',
                'excelPreview'
            )
                ->middleware(
                    'subscription.capability:export'
                )
                ->name('excel-preview');

            Route::get('/excel', 'excel')
                ->middleware(
                    'subscription.capability:export'
                )
                ->name('excel');
        });


    /*
    |--------------------------------------------------------------------------
    | Procurement Reports
    |--------------------------------------------------------------------------
    */

    Route::prefix('reports/procurement')
        ->name('reports.procurement.')
        ->middleware('subscription.capability:export')
        ->controller(ProcurementReportController::class)
        ->group(function () {
            Route::prefix('suppliers')
                ->name('suppliers.')
                ->middleware('feature:supplier_management')
                ->group(function () {
                    Route::get('/pdf', 'suppliersPdf')->name('pdf');
                    Route::get('/excel-preview', 'suppliersExcelPreview')
                        ->name('excel-preview');
                    Route::get('/excel', 'suppliersExcel')->name('excel');
                });

            Route::prefix('purchase-orders')
                ->name('purchase-orders.')
                ->middleware('feature:purchase_orders')
                ->group(function () {
                    Route::get('/pdf', 'purchaseOrdersPdf')->name('pdf');
                    Route::get('/excel-preview', 'purchaseOrdersExcelPreview')
                        ->name('excel-preview');
                    Route::get('/excel', 'purchaseOrdersExcel')->name('excel');
                });

            Route::prefix('purchase-approvals')
                ->name('purchase-approvals.')
                ->middleware('feature:purchase_orders')
                ->group(function () {
                    Route::get('/pdf', 'purchaseApprovalsPdf')->name('pdf');
                    Route::get('/excel-preview', 'purchaseApprovalsExcelPreview')
                        ->name('excel-preview');
                    Route::get('/excel', 'purchaseApprovalsExcel')->name('excel');
                });

            Route::prefix('receiving')
                ->name('receiving.')
                ->middleware('feature:receiving')
                ->group(function () {
                    Route::get('/pdf', 'receivingPdf')->name('pdf');
                    Route::get('/excel-preview', 'receivingExcelPreview')
                        ->name('excel-preview');
                    Route::get('/excel', 'receivingExcel')->name('excel');
                });

            Route::prefix('received-orders')
                ->name('received-orders.')
                ->middleware('feature:received_order_history')
                ->group(function () {
                    Route::get('/pdf', 'receivedOrdersPdf')->name('pdf');
                    Route::get('/excel-preview', 'receivedOrdersExcelPreview')
                        ->name('excel-preview');
                    Route::get('/excel', 'receivedOrdersExcel')->name('excel');
                });
        });


    /*
    |--------------------------------------------------------------------------
    | Received Orders Direct Route
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/procurement/received-orders',
        [ReceivedOrderController::class, 'index']
    )
        ->middleware(
            'feature:received_order_history'
        )
        ->name('procurement.received-orders.index');


    /*
    |--------------------------------------------------------------------------
    | Procurement
    |--------------------------------------------------------------------------
    */

    Route::prefix('suppliers')
        ->name('suppliers.')
        ->group(function () {
            /*
            |--------------------------------------------------------------------------
            | Suppliers
            |--------------------------------------------------------------------------
            */

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

            /*
            |--------------------------------------------------------------------------
            | Purchase Orders
            |--------------------------------------------------------------------------
            */

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

            /*
            |--------------------------------------------------------------------------
            | Purchase Approvals
            |--------------------------------------------------------------------------
            */

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

            /*
            |--------------------------------------------------------------------------
            | Receiving
            |--------------------------------------------------------------------------
            */

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

            /*
            |--------------------------------------------------------------------------
            | Received Orders
            |--------------------------------------------------------------------------
            */

            Route::prefix('received-orders')
                ->name('received-orders.')
                ->middleware(
                    'feature:received_order_history'
                )
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
    | Team Management
    |--------------------------------------------------------------------------
    */

    Route::prefix('team')
        ->name('team.')
        ->group(function () {
            /*
            |--------------------------------------------------------------------------
            | Team Overview
            |--------------------------------------------------------------------------
            */

            Route::get(
                '/overview',
                [TeamOverviewController::class, 'index']
            )
                ->middleware([
                    'feature:team_overview',
                    'subscription.capability:active',
                ])
                ->name('overview');

            /*
            |--------------------------------------------------------------------------
            | Team Members
            |--------------------------------------------------------------------------
            */

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

            /*
            |--------------------------------------------------------------------------
            | Roles and Access
            |--------------------------------------------------------------------------
            */

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


    /*
    |--------------------------------------------------------------------------
    | Business Profile
    |--------------------------------------------------------------------------
    */

    Route::redirect(
        '/management/business-profile',
        '/management/business-profile/general'
    );

    Route::prefix('management/business-profile')
        ->name('business-profile.')
        ->controller(
            BusinessProfileController::class
        )
        ->group(function () {
            /*
            |--------------------------------------------------------------------------
            | General Information
            |--------------------------------------------------------------------------
            */

            Route::get(
                '/general',
                'general'
            )
                ->middleware(
                    'feature:business_profile_general'
                )
                ->name('general.index');

            Route::post(
                '/general',
                'updateGeneral'
            )
                ->middleware(
                    'feature:business_profile_general'
                )
                ->name('general.update');

            /*
            |--------------------------------------------------------------------------
            | Branding
            |--------------------------------------------------------------------------
            */

            Route::get(
                '/branding',
                'branding'
            )
                ->middleware(
                    'feature:business_profile_branding'
                )
                ->name('branding.index');

            Route::post(
                '/branding',
                'updateBranding'
            )
                ->middleware(
                    'feature:business_profile_branding'
                )
                ->name('branding.update');
        });

    /*
    |--------------------------------------------------------------------------
    | Compatibility Redirects
    |--------------------------------------------------------------------------
    */

    Route::redirect(
        '/team/staff',
        '/team/members'
    );

    Route::redirect(
        '/branches',
        '/locations/branches'
    );

    Route::redirect(
        '/warehouses',
        '/locations/warehouses'
    );

    Route::redirect(
        '/inventory/branches',
        '/locations/branches'
    );

    Route::redirect(
        '/inventory/locations',
        '/locations/warehouses'
    );

    Route::redirect(
        '/inventory/warehouses',
        '/locations/warehouses'
    );

    Route::redirect(
        '/inventory/movements',
        '/inventory/stock-movements'
    );
        });

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';