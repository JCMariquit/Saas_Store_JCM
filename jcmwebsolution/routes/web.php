<?php

use App\Http\Controllers\MySubscriptionController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PublicController;
use Illuminate\Support\Facades\Route;

Route::get('/', [PublicController::class, 'home'])
    ->name('home');

Route::get('/dashboard', [PublicController::class, 'dashboard'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::get('/my-subscription', [MySubscriptionController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('my-subscription');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/products/{product}', [ProductController::class, 'show'])
        ->name('products.show');

    Route::get('/orders/create', [OrderController::class, 'create'])
        ->name('orders.create');

    Route::post('/orders', [OrderController::class, 'store'])
        ->name('orders.store');
});

require __DIR__ . '/settings.php';