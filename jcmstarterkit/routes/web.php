<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::prefix('/')->group(function () {

    Route::get('/', function () {
        return Inertia::render('welcome', [
            'canRegister' => Features::enabled(Features::registration()),
        ]);
    })->name('home');

    Route::middleware(['auth', 'verified'])
        ->prefix('dashboard')
        ->group(function () {

            Route::get('/', function () {
                return Inertia::render('dashboard');
            })->name('dashboard');

        });

});

require __DIR__ . '/settings.php';