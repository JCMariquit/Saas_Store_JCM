<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Store\{DashboardController, PublicStoreController};
use Illuminate\Support\Facades\Route;

/* ===================== PUBLIC ===================== */
Route::get('/', [PublicStoreController::class, 'welcome'])->name('home');


/* ===================== MEDIA (FIX 403 STORAGE) ===================== */
Route::get('/media/{path}', function (string $path) {
    abort_if(str_contains($path, '..'), 403);

    $file = storage_path('app/public/' . $path);

    abort_unless(file_exists($file), 404);

    return response()->file($file);
})->where('path', '.*')->name('media.show');


/* ===================== STORE (USER) ===================== */
Route::prefix('store')->middleware('auth')->name('store.')->group(fn () => [
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard'),
    Route::get('/', [PublicStoreController::class, 'welcome'])->name('home'),
]);


/* ===================== ADMIN ===================== */
Route::prefix('admin')->middleware(['auth', 'admin.only'])->name('admin.')->group(fn () => [
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard'),
]);


/* ===================== SHARED (AUTH) ===================== */
Route::middleware('auth')->group(fn () => [
    Route::get('/dashboard', fn () => redirect()->route('store.dashboard'))->name('dashboard'),

    Route::get('/notifications', fn () => response()->json(['count' => 0, 'items' => []])),
    Route::get('/carts', fn () => response()->json(['count' => 0, 'items' => []])),
    Route::get('/messages', fn () => response()->json(['count' => 0, 'items' => []])),
]);


/* ===================== EXTRA ===================== */
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';