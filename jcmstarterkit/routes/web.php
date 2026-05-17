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
        Route::inertia('/blank', 'starter-page/blank_page')->name('blank_page');
        Route::inertia('/landing', 'starter-page/landing_page')->name('landing_page');
        Route::inertia('/pricing', 'starter-page/pricing_page')->name('pricing_page');
        Route::inertia('/profile', 'starter-page/profile_page')->name('profile_page');
        Route::inertia('/settings-page', 'starter-page/setting_page')->name('setting_page');
        Route::inertia('/contact', 'starter-page/contact_page')->name('contact_page');
        Route::inertia('/about', 'starter-page/about_page')->name('about_page');
    });

    Route::prefix('components')->name('components.')->group(function () {
        // Existing
        Route::inertia('/buttons', 'components/buttons')->name('buttons');
        Route::inertia('/accordions', 'components/accordions')->name('accordions');
        Route::inertia('/cards', 'components/cards')->name('cards');
        Route::inertia('/badges', 'components/badges')->name('badges');
        Route::inertia('/alerts', 'components/alerts')->name('alerts');
        Route::inertia('/avatars', 'components/avatars')->name('avatars');
        Route::inertia('/tabs', 'components/tabs')->name('tabs');
        Route::inertia('/tooltips', 'components/tooltips')->name('tooltips');
        Route::inertia('/dropdowns', 'components/dropdowns')->name('dropdowns');
        Route::inertia('/popovers', 'components/popovers')->name('popovers');
        Route::inertia('/modals', 'components/modals')->name('modals');
        Route::inertia('/drawers', 'components/drawers')->name('drawers');

        // Added from ui folder
        Route::inertia('/checkboxes', 'components/checkboxes')->name('checkboxes');
        Route::inertia('/collapsibles', 'components/collapsibles')->name('collapsibles');
        Route::inertia('/dialogs', 'components/dialogs')->name('dialogs');
        Route::inertia('/icons', 'components/icons')->name('icons');
        Route::inertia('/input-otp', 'components/input_otp')->name('input_otp');
        Route::inertia('/inputs', 'components/inputs')->name('inputs');
        Route::inertia('/labels', 'components/labels')->name('labels');
        Route::inertia('/navigation-menus', 'components/navigation_menus')->name('navigation_menus');
        Route::inertia('/placeholder-patterns', 'components/placeholder_patterns')->name('placeholder_patterns');
        Route::inertia('/selects', 'components/selects')->name('selects');
        Route::inertia('/separators', 'components/separators')->name('separators');
        Route::inertia('/sheets', 'components/sheets')->name('sheets');
        Route::inertia('/sidebars', 'components/sidebars')->name('sidebars');
        Route::inertia('/skeletons', 'components/skeletons')->name('skeletons');
        Route::inertia('/spinners', 'components/spinners')->name('spinners');
        Route::inertia('/toggle-groups', 'components/toggle_groups')->name('toggle_groups');
        Route::inertia('/toggles', 'components/toggles')->name('toggles');
    });

    Route::prefix('forms')->name('forms.')->group(function () {
        Route::inertia('/inputs', 'forms/inputs')->name('inputs');
        Route::inertia('/selects', 'forms/selects')->name('selects');
        Route::inertia('/checkboxes', 'forms/checkboxes')->name('checkboxes');
        Route::inertia('/radio-groups', 'forms/radio_groups')->name('radio_groups');
        Route::inertia('/switches', 'forms/switches')->name('switches');
        Route::inertia('/date-pickers', 'forms/date_pickers')->name('date_pickers');
        Route::inertia('/file-uploads', 'forms/file_uploads')->name('file_uploads');
        Route::inertia('/layouts', 'forms/layouts')->name('layouts');
        Route::inertia('/validation', 'forms/validation')->name('validation');
        Route::inertia('/multi-step', 'forms/multi_step')->name('multi_step');
    });

    Route::prefix('content')->name('content.')->group(function () {
        Route::inertia('/heroes', 'content/heroes')->name('heroes');
        Route::inertia('/features', 'content/features')->name('features');
        Route::inertia('/cta', 'content/cta')->name('cta');
        Route::inertia('/pricing', 'content/pricing')->name('pricing');
        Route::inertia('/faqs', 'content/faqs')->name('faqs');
        Route::inertia('/team', 'content/team')->name('team');
        Route::inertia('/testimonials', 'content/testimonials')->name('testimonials');
        Route::inertia('/footers', 'content/footers')->name('footers');
    });

    Route::prefix('pages')->name('pages.')->group(function () {
        Route::inertia('/about', 'pages/about')->name('about');
        Route::inertia('/contact', 'pages/contact')->name('contact');
        Route::inertia('/faq', 'pages/faq')->name('faq');
        Route::inertia('/terms', 'pages/terms')->name('terms');
        Route::inertia('/privacy', 'pages/privacy')->name('privacy');
        Route::inertia('/maintenance', 'pages/maintenance')->name('maintenance');
        Route::inertia('/coming-soon', 'pages/coming_soon')->name('coming_soon');
    });

    Route::prefix('data')->name('data.')->group(function () {
        Route::inertia('/tables', 'data/tables')->name('tables');
        Route::inertia('/data-tables', 'data/data_tables')->name('data_tables');
        Route::inertia('/lists', 'data/lists')->name('lists');
        Route::inertia('/timeline', 'data/timeline')->name('timeline');
        Route::inertia('/kanban', 'data/kanban')->name('kanban');
        Route::inertia('/calendar', 'data/calendar')->name('calendar');
        Route::inertia('/descriptions', 'data/descriptions')->name('descriptions');
        Route::inertia('/empty-states', 'data/empty_states')->name('empty_states');
    });

    Route::prefix('analytics')->name('analytics.')->group(function () {
        Route::inertia('/charts', 'analytics/charts')->name('charts');
        Route::inertia('/kpi-widgets', 'analytics/kpi_widgets')->name('kpi_widgets');
        Route::inertia('/reports', 'analytics/reports')->name('reports');
        Route::inertia('/heatmaps', 'analytics/heatmaps')->name('heatmaps');
        Route::inertia('/statistics', 'analytics/statistics')->name('statistics');
        Route::inertia('/exports', 'analytics/exports')->name('exports');
    });

    Route::prefix('navigation')->name('navigation.')->group(function () {
        Route::inertia('/navbar', 'navigation/navbar')->name('navbar');
        Route::inertia('/sidebar', 'navigation/sidebar')->name('sidebar');
        Route::inertia('/tabs', 'navigation/tabs')->name('tabs');
        Route::inertia('/breadcrumbs', 'navigation/breadcrumbs')->name('breadcrumbs');
        Route::inertia('/pagination', 'navigation/pagination')->name('pagination');
        Route::inertia('/menus', 'navigation/menus')->name('menus');
    });

    Route::prefix('flows')->name('flows.')->group(function () {
        Route::inertia('/stepper', 'flows/stepper')->name('stepper');
        Route::inertia('/wizard', 'flows/wizard')->name('wizard');
        Route::inertia('/checkout', 'flows/checkout')->name('checkout');
        Route::inertia('/setup', 'flows/setup')->name('setup');
    });

    Route::prefix('layouts')->name('layouts.')->group(function () {
        Route::inertia('/grids', 'layouts/grids')->name('grids');
        Route::inertia('/splits', 'layouts/splits')->name('splits');
        Route::inertia('/sidebars', 'layouts/sidebars')->name('sidebars');
        Route::inertia('/auth', 'layouts/auth')->name('auth');
        Route::inertia('/errors', 'layouts/errors')->name('errors');
    });

    Route::prefix('apps')->name('apps.')->group(function () {
        Route::inertia('/booking', 'apps/booking')->name('booking');
        Route::inertia('/pos', 'apps/pos')->name('pos');
        Route::inertia('/inventory', 'apps/inventory')->name('inventory');
        Route::inertia('/subscriptions', 'apps/subscriptions')->name('subscriptions');
        Route::inertia('/projects', 'apps/projects')->name('projects');
        Route::inertia('/crm', 'apps/crm')->name('crm');
        Route::inertia('/hris', 'apps/hris')->name('hris');
        Route::inertia('/accounting', 'apps/accounting')->name('accounting');
    });

    Route::prefix('commerce')->name('commerce.')->group(function () {
        Route::inertia('/products', 'commerce/products')->name('products');
        Route::inertia('/categories', 'commerce/categories')->name('categories');
        Route::inertia('/orders', 'commerce/orders')->name('orders');
        Route::inertia('/customers', 'commerce/customers')->name('customers');
        Route::inertia('/invoices', 'commerce/invoices')->name('invoices');
        Route::inertia('/payments', 'commerce/payments')->name('payments');
        Route::inertia('/coupons', 'commerce/coupons')->name('coupons');
    });

    Route::prefix('communication')->name('communication.')->group(function () {
        Route::inertia('/inbox', 'communication/inbox')->name('inbox');
        Route::inertia('/messages', 'communication/messages')->name('messages');
        Route::inertia('/notifications', 'communication/notifications')->name('notifications');
        Route::inertia('/announcements', 'communication/announcements')->name('announcements');
        Route::inertia('/chat', 'communication/chat')->name('chat');
    });

    Route::prefix('users')->name('users.')->group(function () {
        Route::inertia('/', 'users/index')->name('index');
        Route::inertia('/profile', 'users/profile')->name('profile');
    });

    Route::inertia('/roles', 'roles/index')->name('roles.index');
    Route::inertia('/permissions', 'permissions/index')->name('permissions.index');
    Route::inertia('/activity-logs', 'activity-logs/index')->name('activity_logs.index');
    Route::inertia('/audit-trail', 'audit-trail/index')->name('audit_trail.index');
});

require __DIR__ . '/settings.php';