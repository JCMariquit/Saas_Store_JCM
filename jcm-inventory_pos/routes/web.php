<?php

use App\Http\Controllers\Pos\CategoryController;
use App\Http\Controllers\Pos\ProductController;
use App\Http\Controllers\Pos\StocksController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
 
    Route::get('/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('/pos', function () {
        return Inertia::render('dashboard');
    })->name('pos');

    Route::prefix('inventory')->name('inventory.')->group(function () {
        Route::resource('products', ProductController::class)
            ->except(['create', 'show', 'edit']);

        Route::resource('categories', CategoryController::class)
            ->except(['create', 'show', 'edit']);

        Route::get('/stocks', [StocksController::class, 'index'])->name('stocks.index');
        Route::post('/stocks/adjust', [StocksController::class, 'adjust'])->name('stocks.adjust');
    });

    Route::prefix('sales')->name('sales.')->group(function () {
        Route::get('/transactions', function () {
            return Inertia::render('sales/transactions/index');
        })->name('transactions');

        Route::get('/returns', function () {
            return Inertia::render('sales/returns/index');
        })->name('returns');
    });

    Route::get('/customers', function () {
        return Inertia::render('customers/index');
    })->name('customers');

    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/sales', function () {
            return Inertia::render('reports/sales/index');
        })->name('sales');

        Route::get('/inventory', function () {
            return Inertia::render('reports/inventory/index');
        })->name('inventory');
    });

    Route::get('/billing', function () {
        return Inertia::render('billing/index');
    })->name('billing');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';