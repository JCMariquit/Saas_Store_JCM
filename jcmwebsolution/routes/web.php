<?php

use App\Http\Controllers\MySubscriptionController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\MessageController;
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
    Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');

    Route::get('/orders/create', [OrderController::class, 'create'])->name('orders.create');

    Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');

    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('/notifications/{notification}', [NotificationController::class, 'show'])->name('notifications.show');
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');

    Route::get('/messages', [MessageController::class, 'index'])->name('messages.index');
    Route::post('/messages', [MessageController::class, 'store'])->name('messages.store');
    Route::post('/messages/{message}/read', [MessageController::class, 'markAsRead'])->name('messages.read');

    Route::post('/admin/messages/{user}/reply', [MessageController::class, 'adminReply'])->name('admin.messages.reply');
});

require __DIR__ . '/settings.php';