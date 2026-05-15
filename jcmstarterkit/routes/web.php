<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::prefix('/')->group(function () {

    Route::get('/', fn() => Inertia::render('welcome', ['canRegister' => Features::enabled(Features::registration())]))->name('home');

    Route::middleware(['auth', 'verified'])->group(function () {

        Route::prefix('dashboard')->group(function () {
            Route::inertia('/', 'dashboard')->name('dashboard');
        });

        Route::prefix('apps')->name('apps.')->group(function () {
            Route::inertia('/app-shell', 'apps/app-shell')->name('app-shell');
            Route::inertia('/layouts', 'apps/layout')->name('layouts');
            Route::inertia('/navigation', 'apps/navigation')->name('navigation');
            Route::inertia('/auth-screens', 'apps/auth-screen')->name('auth-screens');
            Route::inertia('/error-pages', 'apps/error-pages')->name('error-pages');
        });

    });

});

require __DIR__ . '/settings.php';