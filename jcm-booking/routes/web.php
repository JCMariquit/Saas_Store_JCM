<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', fn () => Inertia::render('welcome', [
    'canRegister' => Features::enabled(Features::registration()),
]))->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::prefix('dashboard')->name('dashboard.')->group(function () {
        Route::inertia('/', 'dashboard/dashboard_1')->name('index');
    });

    Route::prefix('starter-page')->name('starter_page.')->group(function () {
        Route::inertia('/blank', 'starter-page/blank_page')->name('blank_page');
    });

});

require __DIR__ . '/settings.php';