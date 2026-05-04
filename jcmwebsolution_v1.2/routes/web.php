<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Store\DashboardController;
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

/* ===================== STORE ===================== */
Route::prefix('store')->middleware('auth')->name('store.')->group(fn () => [
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard'),
    Route::get('/', [PublicStoreController::class, 'welcome'])->name('home'),
]);

/* ===================== ADMIN ===================== */
Route::prefix('admin')->middleware(['auth', 'admin.only'])->name('admin.')->group(fn () => [
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard'),
]);

/* ===================== USER FLOW ===================== */
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', fn () => redirect()->route('store.dashboard'))->name('dashboard');

    Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');
    Route::get('/services/{service}', [ServiceController::class, 'show'])->name('services.show');

    Route::get('/cart', fn () => inertia('cart/index'))->name('cart.index');
    Route::post('/cart', fn () => response()->json(['ok' => true]))->name('cart.store');
    Route::delete('/cart/{id}', fn () => response()->json(['ok' => true]))->name('cart.destroy');

    Route::get('/checkout', fn () => inertia('checkout/index'))->name('checkout.index');

    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/create', [OrderController::class, 'create'])->name('orders.create');
    Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');

    Route::get('/notifications', fn () => response()->json(['count' => 0, 'items' => []]));
    Route::get('/carts', fn () => response()->json(['count' => 0, 'items' => []]));
    Route::get('/messages', fn () => response()->json(['count' => 0, 'items' => []]));
});

/* ===================== EXTRA ===================== */
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';