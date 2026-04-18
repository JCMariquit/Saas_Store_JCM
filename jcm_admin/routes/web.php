<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\TransactionController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {

    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::prefix('admin')->as('admin.')->group(function () {

        Route::prefix('users')->as('users.')->group(function () {
            Route::get('/', [UsersController::class, 'index'])->name('index');
            Route::post('/', [UsersController::class, 'store'])->name('store');
            Route::put('/{user}', [UsersController::class, 'update'])->name('update');
            Route::delete('/{user}', [UsersController::class, 'destroy'])->name('destroy');
        });

        Route::prefix('subscriptions')->as('subscriptions.')->group(function () {
            Route::get('/', [SubscriptionController::class, 'index'])->name('index');
            Route::post('/', [SubscriptionController::class, 'store'])->name('store');
            Route::post('/{subscription}/verify', [SubscriptionController::class, 'verify'])->name('verify');
            Route::delete('/{subscription}', [SubscriptionController::class, 'destroy'])->name('destroy');
        });

        Route::prefix('products')->as('products.')->group(function () {
            Route::get('/', [ProductController::class, 'index'])->name('index');
            Route::post('/', [ProductController::class, 'store'])->name('store');
            Route::put('/{product}', [ProductController::class, 'update'])->name('update');
            Route::delete('/{product}', [ProductController::class, 'destroy'])->name('destroy');
        });

        Route::prefix('plans')->as('plans.')->group(function () {
            Route::get('/', [PlanController::class, 'index'])->name('index');
            Route::post('/', [PlanController::class, 'store'])->name('store');
            Route::put('/{plan}', [PlanController::class, 'update'])->name('update');
            Route::delete('/{plan}', [PlanController::class, 'destroy'])->name('destroy');
        });

        Route::prefix('orders')->as('orders.')->group(function () {
            Route::get('/', [OrderController::class, 'index'])->name('index');
            Route::post('/', [OrderController::class, 'store'])->name('store');
            Route::post('/{order}/submit-payment', [OrderController::class, 'submitPayment'])->name('submit-payment');
            Route::post('/{order}/verify', [OrderController::class, 'verify'])->name('verify');
            Route::post('/{order}/reject', [OrderController::class, 'reject'])->name('reject');
            Route::delete('/{order}', [OrderController::class, 'destroy'])->name('destroy');
        });
        
        Route::prefix('transactions')->as('transactions.')->group(function () {
            Route::get('/', [TransactionController::class, 'index'])->name('index');Route::post('/{transaction}/reject', [TransactionController::class, 'reject'])->name('reject');
            Route::delete('/{transaction}', [TransactionController::class, 'destroy'])->name('destroy');
        });

    });

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';