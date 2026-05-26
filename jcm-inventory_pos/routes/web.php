<?php

use App\Http\Controllers\Pos\CategoryController;
use App\Http\Controllers\Pos\PosTerminalController;
use App\Http\Controllers\Pos\ProductController;
use App\Http\Controllers\Pos\StocksController;
use App\Http\Controllers\Sales\TransactionsController;
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

    /*
    |--------------------------------------------------------------------------
    | Shared Area
    | Client + Cashier
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:client,cashier'])
        ->prefix('shared')
        ->name('shared.')
        ->group(function () {
            Route::get('/pos/terminal', [PosTerminalController::class, 'index'])
                ->name('pos.terminal.index');

            Route::post('/pos/checkout', [PosTerminalController::class, 'checkout'])
                ->name('pos.checkout');
        });

    /*
    |--------------------------------------------------------------------------
    | Client Area
    | Store owner / subscriber
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:client'])
        ->prefix('client')
        ->name('client.')
        ->group(function () {

            Route::get('/dashboard', function () {
                return Inertia::render('owner/dashboard');
            })->name('dashboard');

            Route::prefix('inventory')->name('inventory.')->group(function () {
                Route::resource('products', ProductController::class)
                    ->except(['create', 'show', 'edit']);

                Route::resource('categories', CategoryController::class)
                    ->except(['create', 'show', 'edit']);

                Route::get('/stocks', [StocksController::class, 'index'])
                    ->name('stocks.index');

                Route::post('/stocks/adjust', [StocksController::class, 'adjust'])
                    ->name('stocks.adjust');
            });

            Route::prefix('sales')->name('sales.')->group(function () {
                Route::get('/transactions', [TransactionsController::class, 'index'])
                    ->name('transactions.index');

                Route::get('/returns', function () {
                    return Inertia::render('owner/sales/returns/index');
                })->name('returns.index');
            });

            Route::get('/customers', function () {
                return Inertia::render('owner/customers/index');
            })->name('customers.index');

            Route::prefix('reports')->name('reports.')->group(function () {
                Route::get('/sales', function () {
                    return Inertia::render('owner/reports/sales/index');
                })->name('sales.index');

                Route::get('/inventory', function () {
                    return Inertia::render('owner/reports/inventory/index');
                })->name('inventory.index');
            });

            Route::get('/billing', function () {
                return Inertia::render('owner/billing/index');
            })->name('billing.index');
        });

    /*
    |--------------------------------------------------------------------------
    | Cashier Area
    |--------------------------------------------------------------------------
    */
    Route::middleware(['role:cashier'])
        ->prefix('cashier')
        ->name('cashier.')
        ->group(function () {
            Route::get('/dashboard', function () {
                return Inertia::render('cashier/dashboard');
            })->name('dashboard');
        });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';