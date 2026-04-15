<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', function () { return inertia('dashboard'); })->name('dashboard');

    Route::get('/users', [UserController::class, 'index'])->name('users.index');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
