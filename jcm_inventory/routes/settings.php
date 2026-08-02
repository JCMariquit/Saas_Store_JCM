<?php

use App\Http\Controllers\Settings\DataPrivacyController;
use App\Http\Controllers\Settings\LoginActivityController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', 'settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])
        ->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])
        ->name('profile.update');

    Route::get('settings/password', [PasswordController::class, 'edit'])
        ->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])
        ->name('password.update');

    Route::get('settings/login-activity', [LoginActivityController::class, 'index'])
        ->name('login-activity.index');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');

    Route::get('settings/data-privacy', [DataPrivacyController::class, 'index'])
        ->name('data-privacy.index');
    Route::get('settings/data-privacy/export', [DataPrivacyController::class, 'export'])
        ->middleware('throttle:10,1')
        ->name('data-privacy.export');

    Route::get('settings/account-removal', function () {
        return Inertia::render('settings/account-removal');
    })->name('account-removal.edit');

    Route::delete('settings/account-removal', [ProfileController::class, 'destroy'])
        ->name('account-removal.destroy');
});
