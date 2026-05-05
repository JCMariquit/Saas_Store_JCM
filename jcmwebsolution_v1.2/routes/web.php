<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\MessageController as AdminMessageController;
use App\Http\Controllers\Admin\NotificationController as AdminNotificationController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\PaymentMethodController;
use App\Http\Controllers\Admin\PlanController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\ServiceController as AdminServiceController;
use App\Http\Controllers\Admin\SubscriptionController;
use App\Http\Controllers\Admin\TransactionController;
use App\Http\Controllers\Admin\UsersController;
use App\Http\Controllers\Admin\WebsiteBuilderController;
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

/* ===================== STORE / USER ===================== */
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/store/dashboard', [DashboardController::class, 'index'])->name('store.dashboard');
    Route::get('/store', [PublicStoreController::class, 'welcome'])->name('store.home');

    Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');
    Route::get('/services/{service}', [ServiceController::class, 'show'])->name('services.show');

    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/create', [OrderController::class, 'create'])->name('orders.create');
    Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');

    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('/notifications/{notification}', [NotificationController::class, 'show'])->name('notifications.show');
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');

    Route::get('/messages', [MessageController::class, 'index'])->name('messages.index');
    Route::post('/messages', [MessageController::class, 'store'])->name('messages.store');
    Route::post('/messages/{message}/read', [MessageController::class, 'markAsRead'])->name('messages.read');
    Route::post('/messages/read-all', [MessageController::class, 'readAll'])->name('messages.read-all');

    Route::get('/carts', [CartController::class, 'index'])->name('carts.index');
    Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
    Route::post('/cart', [CartController::class, 'store'])->name('cart.store');
    Route::post('/carts', [CartController::class, 'store'])->name('carts.store');
    Route::delete('/carts/{cart}', [CartController::class, 'destroy'])->name('carts.destroy');
    Route::delete('/cart/{cart}', [CartController::class, 'destroy'])->name('cart.destroy');
});

/* ===================== ADMIN ===================== */
Route::middleware(['auth', 'verified', 'admin.only'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

        Route::prefix('users')->name('users.')->group(function () {
            Route::get('/', [UsersController::class, 'index'])->name('index');
            Route::get('/list', [UsersController::class, 'list'])->name('list');
            Route::post('/', [UsersController::class, 'store'])->name('store');
            Route::put('/{user}', [UsersController::class, 'update'])->name('update');
            Route::delete('/{user}', [UsersController::class, 'destroy'])->name('destroy');
        });

        Route::prefix('products')->name('products.')->group(function () {
            Route::get('/', [AdminProductController::class, 'index'])->name('index');
            Route::get('/create', [AdminProductController::class, 'create'])->name('create');
            Route::post('/', [AdminProductController::class, 'store'])->name('store');
            Route::get('/{product}/edit', [AdminProductController::class, 'edit'])->name('edit');
            Route::put('/{product}', [AdminProductController::class, 'update'])->name('update');
            Route::delete('/{product}', [AdminProductController::class, 'destroy'])->name('destroy');
        });

        Route::prefix('services')->name('services.')->group(function () {
            Route::get('/', [AdminServiceController::class, 'index'])->name('index');
            Route::get('/create', [AdminServiceController::class, 'create'])->name('create');
            Route::post('/', [AdminServiceController::class, 'store'])->name('store');
            Route::get('/{service}/edit', [AdminServiceController::class, 'edit'])->name('edit');
            Route::put('/{service}', [AdminServiceController::class, 'update'])->name('update');
            Route::delete('/{service}', [AdminServiceController::class, 'destroy'])->name('destroy');
        });

        Route::prefix('plans')->name('plans.')->group(function () {
            Route::get('/', [PlanController::class, 'index'])->name('index');
            Route::post('/', [PlanController::class, 'store'])->name('store');
            Route::put('/{plan}', [PlanController::class, 'update'])->name('update');
            Route::delete('/{plan}', [PlanController::class, 'destroy'])->name('destroy');
        });

        Route::prefix('payment-methods')->name('payment-methods.')->group(function () {
            Route::get('/', [PaymentMethodController::class, 'index'])->name('index');
            Route::post('/', [PaymentMethodController::class, 'store'])->name('store');
            Route::post('/{paymentMethod}', [PaymentMethodController::class, 'update'])->name('update');
            Route::delete('/{paymentMethod}', [PaymentMethodController::class, 'destroy'])->name('destroy');
        });

        Route::prefix('orders')->name('orders.')->group(function () {
            Route::get('/', [AdminOrderController::class, 'index'])->name('index');
            Route::post('/', [AdminOrderController::class, 'store'])->name('store');
            Route::post('/{order}/submit-payment', [AdminOrderController::class, 'submitPayment'])->name('submit-payment');
            Route::post('/{order}/verify', [AdminOrderController::class, 'verify'])->name('verify');
            Route::post('/{order}/reject', [AdminOrderController::class, 'reject'])->name('reject');
            Route::delete('/{order}', [AdminOrderController::class, 'destroy'])->name('destroy');
        });

        Route::prefix('subscriptions')->name('subscriptions.')->group(function () {
            Route::get('/', [SubscriptionController::class, 'index'])->name('index');
            Route::post('/', [SubscriptionController::class, 'store'])->name('store');
            Route::post('/{subscription}/verify', [SubscriptionController::class, 'verify'])->name('verify');
            Route::delete('/{subscription}', [SubscriptionController::class, 'destroy'])->name('destroy');
        });

        Route::prefix('transactions')->name('transactions.')->group(function () {
            Route::get('/', [TransactionController::class, 'index'])->name('index');
            Route::post('/{transaction}/reject', [TransactionController::class, 'reject'])->name('reject');
            Route::delete('/{transaction}', [TransactionController::class, 'destroy'])->name('destroy');
        });

        Route::prefix('messages')->name('messages.')->group(function () {
            Route::get('/', [AdminMessageController::class, 'adminThreads'])->name('index');
            Route::get('/{user}', [AdminMessageController::class, 'adminConversation'])->name('conversation');
            Route::post('/{user}/reply', [AdminMessageController::class, 'adminReply'])->name('reply');
        });

        Route::prefix('notifications')->name('notifications.')->group(function () {
            Route::get('/', [AdminNotificationController::class, 'adminIndex'])->name('index');
            Route::post('/send', [AdminNotificationController::class, 'adminSend'])->name('send');
            Route::get('/users-list', [UsersController::class, 'list'])->name('users.list');
            Route::get('/{notification}', [AdminNotificationController::class, 'adminShow'])->name('show');
        });

        Route::prefix('website')->name('website.')->group(function () {
            Route::get('/builder', [WebsiteBuilderController::class, 'index'])->name('builder.index');
            Route::get('/builder/{product}', [WebsiteBuilderController::class, 'show'])->name('builder.show');
        });
    });

/* ===================== EXTRA ===================== */
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';