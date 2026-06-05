<?php

use App\Http\Controllers\Owner\BranchController;
use App\Http\Controllers\Owner\CashDrawerController;
use App\Http\Controllers\Owner\CategoryController;
use App\Http\Controllers\Owner\DashboardController;
use App\Http\Controllers\Owner\DiscountsController;
use App\Http\Controllers\Owner\InventoryReportController;
use App\Http\Controllers\Owner\PosTerminalController;
use App\Http\Controllers\Owner\ProductController;
use App\Http\Controllers\Owner\ReturnsController;
use App\Http\Controllers\Owner\SalesReportController;
use App\Http\Controllers\Owner\SoldItemsController;
use App\Http\Controllers\Owner\StaffController;
use App\Http\Controllers\Owner\StocksController;
use App\Http\Controllers\Owner\StoreProfileController;
use App\Http\Controllers\Owner\TransactionsController;
use App\Http\Controllers\Staff\Cashier\CashierDashboardController;
use App\Http\Controllers\Staff\Cashier\CashierPosController;
use App\Http\Controllers\Staff\Cashier\CashierProductController;
use App\Http\Controllers\Staff\Cashier\CashierReturnController;
use App\Http\Controllers\Staff\Cashier\CashierTransactionController;
use App\Http\Controllers\Staff\Manager\ManagerDashboardController;
use App\Http\Controllers\Staff\Manager\ManagerPosController;
use App\Http\Controllers\Staff\Manager\ManagerProductController;
use App\Http\Controllers\Staff\Manager\ManagerTransactionController;
use App\Http\Controllers\Staff\Staff\StaffDashboardController;
use App\Http\Controllers\Staff\Staff\StaffProductController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', function () {
        $role = auth()->user()->role;

        return match ($role) {
            'client' => redirect()->route('client.dashboard'),
            'cashier' => redirect()->route('staff.cashier.dashboard'),
            'manager' => redirect()->route('staff.manager.dashboard'),
            'staff' => redirect()->route('staff.staff.dashboard'),
            default => abort(403, 'Unauthorized access.'),
        };
    })->name('dashboard');

    Route::middleware(['role:client'])
        ->prefix('client')
        ->name('client.')
        ->group(function () {
            Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

            Route::get('/pos/terminal', [PosTerminalController::class, 'index'])->name('pos.terminal.index');
            Route::post('/pos/checkout', [PosTerminalController::class, 'checkout'])->name('pos.checkout');

            Route::patch('/management/staff/{staff}/toggle-status', [StaffController::class, 'toggleStatus'])->name('management.staff.toggle-status');
            Route::resource('/management/staff', StaffController::class)->except(['create', 'show', 'edit'])->names('management.staff');

            Route::patch('/management/branches/{branch}/toggle-status', [BranchController::class, 'toggleStatus'])->name('management.branches.toggle-status');
            Route::resource('/management/branches', BranchController::class)->except(['create', 'show', 'edit'])->names('management.branches');

            Route::get('/management/store-profile', [StoreProfileController::class, 'index'])->name('management.store-profile.index');
            Route::post('/management/store-profile', [StoreProfileController::class, 'update'])->name('management.store-profile.update');

            Route::resource('/inventory/products', ProductController::class)->except(['create', 'show', 'edit'])->names('inventory.products');
            Route::resource('/inventory/categories', CategoryController::class)->except(['create', 'show', 'edit'])->names('inventory.categories');

            Route::get('/inventory/stocks', [StocksController::class, 'index'])->name('inventory.stocks.index');
            Route::post('/inventory/stocks/adjust', [StocksController::class, 'adjust'])->name('inventory.stocks.adjust');

            Route::get('/sales/transactions', [TransactionsController::class, 'index'])->name('sales.transactions.index');
            Route::get('/sales/sold-items', [SoldItemsController::class, 'index'])->name('sales.sold-items.index');

            Route::get('/sales/returns', [ReturnsController::class, 'index'])->name('sales.returns.index');
            Route::get('/sales/returns/search-sale', [ReturnsController::class, 'searchSale'])->name('sales.returns.search-sale');
            Route::post('/sales/returns', [ReturnsController::class, 'store'])->name('sales.returns.store');

            Route::get('/sales/discounts', [DiscountsController::class, 'index'])->name('sales.discounts.index');
            Route::post('/sales/discounts', [DiscountsController::class, 'store'])->name('sales.discounts.store');
            Route::put('/sales/discounts/{discount}', [DiscountsController::class, 'update'])->name('sales.discounts.update');
            Route::delete('/sales/discounts/{discount}', [DiscountsController::class, 'destroy'])->name('sales.discounts.destroy');

            Route::get('/sales/cash-drawer', [CashDrawerController::class, 'index'])->name('sales.cash-drawer.index');
            Route::post('/sales/cash-drawer/open', [CashDrawerController::class, 'open'])->name('sales.cash-drawer.open');
            Route::post('/sales/cash-drawer/cash-in', [CashDrawerController::class, 'cashIn'])->name('sales.cash-drawer.cash-in');
            Route::post('/sales/cash-drawer/cash-out', [CashDrawerController::class, 'cashOut'])->name('sales.cash-drawer.cash-out');
            Route::post('/sales/cash-drawer/close', [CashDrawerController::class, 'close'])->name('sales.cash-drawer.close');

            Route::get('/customers', function () {
                return Inertia::render('owner/customers/index');
            })->name('customers.index');

            Route::get('/reports/sales', [SalesReportController::class, 'index'])->name('reports.sales.index');
            Route::get('/reports/inventory', [InventoryReportController::class, 'index'])->name('reports.inventory.index');

            Route::get('/billing', function () {
                return Inertia::render('owner/billing/index');
            })->name('billing.index');
        });

    Route::prefix('staff')
        ->name('staff.')
        ->group(function () {
            Route::middleware(['role:cashier'])
                ->prefix('cashier')
                ->name('cashier.')
                ->group(function () {
                    Route::get('/dashboard', [CashierDashboardController::class, 'index'])->name('dashboard');

                    Route::get('/pos/terminal', [CashierPosController::class, 'index'])->name('pos.terminal.index');
                    Route::post('/pos/checkout', [CashierPosController::class, 'checkout'])->name('pos.checkout');

                    Route::get('/transactions', [CashierTransactionController::class, 'index'])->name('transactions.index');

                    Route::get('/returns', [CashierReturnController::class, 'index'])->name('returns.index');
                    Route::post('/returns', [CashierReturnController::class, 'store'])->name('returns.store');

                    Route::get('/cash-drawer', function () {
                        return Inertia::render('staff/cashier/cash-drawer/index');
                    })->name('cash-drawer.index');

                    Route::get('/products', [CashierProductController::class, 'index'])->name('products.index');
                    Route::post('/products', [CashierProductController::class, 'store'])->name('products.store');
                });

            Route::middleware(['role:manager'])
                ->prefix('manager')
                ->name('manager.')
                ->group(function () {
                    Route::get('/dashboard', [ManagerDashboardController::class, 'index'])->name('dashboard');

                    Route::get('/pos/monitor', [ManagerPosController::class, 'index'])->name('pos.monitor.index');

                    Route::get('/transactions', [ManagerTransactionController::class, 'index'])->name('transactions.index');

                    Route::get('/products', [ManagerProductController::class, 'index'])->name('products.index');

                    Route::get('/categories', function () {
                        return Inertia::render('staff/manager/categories/index');
                    })->name('categories.index');

                    Route::get('/stocks', function () {
                        return Inertia::render('staff/manager/stocks/index');
                    })->name('stocks.index');

                    Route::get('/sold-items', function () {
                        return Inertia::render('staff/manager/sold-items/index');
                    })->name('sold-items.index');

                    Route::get('/returns', function () {
                        return Inertia::render('staff/manager/returns/index');
                    })->name('returns.index');

                    Route::get('/cash-drawer', function () {
                        return Inertia::render('staff/manager/cash-drawer/index');
                    })->name('cash-drawer.index');

                    Route::get('/cashiers', function () {
                        return Inertia::render('staff/manager/cashiers/index');
                    })->name('cashiers.index');

                    Route::get('/staff-activity', function () {
                        return Inertia::render('staff/manager/staff-activity/index');
                    })->name('staff-activity.index');

                    Route::get('/reports/sales', function () {
                        return Inertia::render('staff/manager/reports/sales/index');
                    })->name('reports.sales.index');

                    Route::get('/reports/inventory', function () {
                        return Inertia::render('staff/manager/reports/inventory/index');
                    })->name('reports.inventory.index');
                });

            Route::middleware(['role:staff'])
                ->prefix('staff')
                ->name('staff.')
                ->group(function () {
                    Route::get('/dashboard', [StaffDashboardController::class, 'index'])->name('dashboard');

                    Route::get('/products', [StaffProductController::class, 'index'])->name('products.index');

                    Route::get('/stock-audit', function () {
                        return Inertia::render('staff/staff/stock-audit/index');
                    })->name('stock-audit.index');

                    Route::get('/reports/audit', function () {
                        return Inertia::render('staff/staff/reports/audit/index');
                    })->name('reports.audit.index');
                });
        });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';