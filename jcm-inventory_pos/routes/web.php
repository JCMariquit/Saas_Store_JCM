<?php

use App\Http\Controllers\Owner\BranchController;
use App\Http\Controllers\Owner\CategoryController;
use App\Http\Controllers\Owner\PosTerminalController;
use App\Http\Controllers\Owner\ProductController;
use App\Http\Controllers\Owner\StaffController;
use App\Http\Controllers\Owner\StocksController;
use App\Http\Controllers\Owner\StoreProfileController;
use App\Http\Controllers\Owner\TransactionsController;
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
            'cashier' => redirect()->route('cashier.dashboard'),
            default => abort(403, 'Unauthorized access.'),
        };
    })->name('dashboard');

    Route::middleware(['role:client'])->prefix('client')->name('client.')->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('owner/dashboard');
        })->name('dashboard');

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
        Route::get('/sales/sold-items', function () {return Inertia::render('owner/sales/sold-items/index');})->name('sales.sold-items.index');
        Route::get('/sales/returns', function () {return Inertia::render('owner/sales/returns/index');})->name('sales.returns.index');
        Route::get('/sales/discounts', function () {return Inertia::render('owner/sales/discounts/index');})->name('sales.discounts.index');
        Route::get('/sales/cash-drawer', function () {return Inertia::render('owner/sales/cash-drawer/index');})->name('sales.cash-drawer.index');

        Route::get('/customers', function () {return Inertia::render('owner/customers/index');})->name('customers.index');

        Route::get('/reports/sales', function () {return Inertia::render('owner/reports/sales/index');})->name('reports.sales.index');
        Route::get('/reports/inventory', function () {return Inertia::render('owner/reports/inventory/index');})->name('reports.inventory.index');

        Route::get('/billing', function () {return Inertia::render('owner/billing/index');})->name('billing.index');
    });

    Route::middleware(['role:cashier'])->prefix('cashier')->name('cashier.')->group(function () {
        Route::get('/dashboard', function () {return Inertia::render('staff/dashboard');})->name('dashboard');
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';