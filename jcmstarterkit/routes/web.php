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
        Route::inertia('/dashboard-1', 'dashboard/dashboard_1')->name('dashboard_1');
        Route::inertia('/dashboard-2', 'dashboard/dashboard_2')->name('dashboard_2');
        Route::inertia('/dashboard-3', 'dashboard/dashboard_3')->name('dashboard_3');
        Route::inertia('/dashboard-4', 'dashboard/dashboard_4')->name('dashboard_4');
    });

    Route::prefix('starter-page')->name('starter_page.')->group(function () {
        Route::inertia('/landing', 'starter-page/landing_page')->name('landing');
        Route::inertia('/pricing', 'starter-page/pricing_page')->name('pricing');
        Route::inertia('/profile', 'starter-page/profile_page')->name('profile');
        Route::inertia('/settings-page', 'starter-page/setting_page')->name('settings_page');
        Route::inertia('/blank', 'starter-page/black_page')->name('blank');
    });

    Route::prefix('buttons')->name('buttons.')->group(function () {
        Route::inertia('/button-group', 'buttons/button_group')->name('button_group');
        Route::inertia('/button-variants', 'buttons/button_variants')->name('button_variants');
        Route::inertia('/icon-buttons', 'buttons/icon_buttons')->name('icon_buttons');
        Route::inertia('/loading-buttons', 'buttons/loading_buttons')->name('loading_buttons');
        Route::inertia('/split-buttons', 'buttons/split_button')->name('split_button');
        Route::inertia('/dropdown-buttons', 'buttons/dropdown_button')->name('dropdown_button');
        Route::inertia('/floating-buttons', 'buttons/floating_button')->name('floating_button');
    });

    Route::prefix('accordions')->name('accordions.')->group(function () {
        Route::inertia('/basic-accordion', 'accordions/basic_accordion')->name('basic_accordion');
        Route::inertia('/borderless-accordion', 'accordions/borderless_accordion')->name('borderless_accordion');
        Route::inertia('/faq-accordion', 'accordions/faq_accordion')->name('faq_accordion');
        Route::inertia('/nested-accordion', 'accordions/nested_accordion')->name('nested_accordion');
        Route::inertia('/card-accordion', 'accordions/card_accordion')->name('card_accordion');
        Route::inertia('/setting-accordion', 'accordions/setting_accordion')->name('setting_accordion');
    });

    Route::prefix('cards')->name('cards.')->group(function () {
        Route::inertia('/basic-cards', 'cards/basic_card')->name('basic_card');
        Route::inertia('/stat-cards', 'cards/stat_card')->name('stat_card');
        Route::inertia('/profile-cards', 'cards/profile_card')->name('profile_card');
        Route::inertia('/pricing-cards', 'cards/pricing_card')->name('pricing_card');
        Route::inertia('/feature-cards', 'cards/feature_card')->name('feature_card');
        Route::inertia('/action-cards', 'cards/action_card')->name('action_card');
        Route::inertia('/kanban-cards', 'cards/kanban_card')->name('kanban_card');
    });

    Route::prefix('apps')->name('apps.')->group(function () {
        Route::inertia('/app-shell', 'apps/app-shell')->name('app_shell');
        Route::inertia('/layouts', 'apps/layout')->name('layouts');
        Route::inertia('/navigation', 'apps/navigation')->name('navigation');
        Route::inertia('/auth-screens', 'apps/auth-screen')->name('auth_screens');
        Route::inertia('/error-pages', 'apps/error-pages')->name('error_pages');
    });
});

require __DIR__ . '/settings.php';