<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Store\CartController;
use App\Http\Controllers\Store\DashboardController;
use App\Http\Controllers\Store\MessageController;
use App\Http\Controllers\Store\NotificationController;
use App\Http\Controllers\Store\OrderController;
use App\Http\Controllers\Store\ProductController;
use App\Http\Controllers\Store\PublicStoreController;
use App\Http\Controllers\Store\ServiceController;
use Illuminate\Support\Facades\Route;

/* ===================== PUBLIC ===================== */
Route::get('/', [PublicStoreController::class, 'welcome'])->name('home');

/* ===================== MEDIA ===================== */
Route::get('/media/{path}', function (string $path) {
    abort_if(str_contains($path, '..'), 403);

    $file = storage_path('app/public/' . $path);

    abort_unless(file_exists($file), 404);

    return response()->file($file);
})->where('path', '.*')->name('media.show');

/* ===================== AUTHENTICATED STORE / USER ===================== */
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');

    Route::get('/store/dashboard', [DashboardController::class, 'index'])
        ->name('store.dashboard');

    Route::get('/store', [PublicStoreController::class, 'welcome'])
        ->name('store.home');

    Route::get('/products/{product}', [ProductController::class, 'show'])
        ->name('products.show');

    Route::get('/services/{service}', [ServiceController::class, 'show'])
        ->name('services.show');

    Route::get('/orders', [OrderController::class, 'index'])
        ->name('orders.index');

    Route::get('/orders/create', [OrderController::class, 'create'])
        ->name('orders.create');

    Route::post('/orders', [OrderController::class, 'store'])
        ->name('orders.store');

    Route::get('/notifications', [NotificationController::class, 'index'])
        ->name('notifications.index');

    Route::get('/notifications/{notification}', [NotificationController::class, 'show'])
        ->name('notifications.show');

    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])
        ->name('notifications.read');

    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])
        ->name('notifications.read-all');

    Route::get('/messages', [MessageController::class, 'index'])
        ->name('messages.index');

    Route::post('/messages', [MessageController::class, 'store'])
        ->name('messages.store');

    Route::post('/messages/{message}/read', [MessageController::class, 'markAsRead'])
        ->name('messages.read');

    Route::post('/messages/read-all', [MessageController::class, 'readAll'])
        ->name('messages.read-all');

    Route::get('/carts', [CartController::class, 'index'])
        ->name('carts.index');

    Route::get('/cart', [CartController::class, 'index'])
        ->name('cart.index');

    Route::post('/cart', [CartController::class, 'store'])
        ->name('cart.store');

    Route::post('/carts', [CartController::class, 'store'])
        ->name('carts.store');

    Route::delete('/carts/{cart}', [CartController::class, 'destroy'])
        ->name('carts.destroy');

    Route::delete('/cart/{cart}', [CartController::class, 'destroy'])
        ->name('cart.destroy');
});

/* ===================== ADMIN ===================== */
Route::middleware(['auth', 'verified', 'admin.only'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])
            ->name('dashboard');

        Route::post('/messages/{user}/reply', [MessageController::class, 'adminReply'])
            ->name('messages.reply');
    });

/* ===================== EXTRA ===================== */
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';