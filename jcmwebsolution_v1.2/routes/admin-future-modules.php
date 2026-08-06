<?php

use App\Http\Controllers\Admin\FeatureFlagController;
use App\Http\Controllers\Admin\IntegrationsApiController;
use App\Http\Controllers\Admin\InvoiceController;
use App\Http\Controllers\Admin\RefundController;
use App\Http\Controllers\Admin\RolesPermissionsController;
use App\Http\Controllers\Admin\SupportTicketController;
use App\Http\Controllers\Admin\SystemHealthController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'admin.only'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function (): void {
        Route::prefix('integrations-api')->name('integrations-api.')->group(function (): void {
            Route::get('/', [IntegrationsApiController::class, 'index'])->name('index');
            Route::post('/', [IntegrationsApiController::class, 'store'])->name('store');
            Route::put('/{integration}', [IntegrationsApiController::class, 'update'])->name('update');
            Route::post('/{integration}/rotate', [IntegrationsApiController::class, 'rotate'])->name('rotate');
            Route::get('/{integration}/reveal', [IntegrationsApiController::class, 'reveal'])->name('reveal');
            Route::delete('/{integration}', [IntegrationsApiController::class, 'destroy'])->name('destroy');
        });

        Route::prefix('roles-permissions')->name('roles-permissions.')->group(function (): void {
            Route::get('/', [RolesPermissionsController::class, 'index'])->name('index');
            Route::post('/roles', [RolesPermissionsController::class, 'storeRole'])->name('roles.store');
            Route::put('/roles/{role}', [RolesPermissionsController::class, 'updateRole'])->name('roles.update');
            Route::post('/permissions', [RolesPermissionsController::class, 'storePermission'])->name('permissions.store');
            Route::delete('/permissions/{permission}', [RolesPermissionsController::class, 'destroyPermission'])->name('permissions.destroy');
            Route::post('/toggle', [RolesPermissionsController::class, 'togglePermission'])->name('toggle');
            Route::post('/assignments', [RolesPermissionsController::class, 'assignRole'])->name('assignments.store');
            Route::delete('/assignments/{assignment}', [RolesPermissionsController::class, 'destroyAssignment'])->name('assignments.destroy');
        });

        Route::prefix('feature-flags')->name('feature-flags.')->group(function (): void {
            Route::get('/', [FeatureFlagController::class, 'index'])->name('index');
            Route::post('/', [FeatureFlagController::class, 'store'])->name('store');
            Route::put('/{flag}', [FeatureFlagController::class, 'update'])->name('update');
            Route::post('/{flag}/toggle', [FeatureFlagController::class, 'toggle'])->name('toggle');
            Route::delete('/{flag}', [FeatureFlagController::class, 'destroy'])->name('destroy');
        });

        Route::prefix('invoices')->name('invoices.')->group(function (): void {
            Route::get('/', [InvoiceController::class, 'index'])->name('index');
            Route::post('/', [InvoiceController::class, 'store'])->name('store');
            Route::post('/{invoice}/mark-paid', [InvoiceController::class, 'markPaid'])->name('mark-paid');
            Route::post('/{invoice}/void', [InvoiceController::class, 'void'])->name('void');
            Route::delete('/{invoice}', [InvoiceController::class, 'destroy'])->name('destroy');
        });

        Route::prefix('refunds')->name('refunds.')->group(function (): void {
            Route::get('/', [RefundController::class, 'index'])->name('index');
            Route::post('/', [RefundController::class, 'store'])->name('store');
            Route::post('/{refund}/review', [RefundController::class, 'review'])->name('review');
            Route::post('/{refund}/processing', [RefundController::class, 'markProcessing'])->name('processing');
            Route::post('/{refund}/complete', [RefundController::class, 'complete'])->name('complete');
            Route::post('/{refund}/cancel', [RefundController::class, 'cancel'])->name('cancel');
        });

        Route::prefix('support-tickets')->name('support-tickets.')->group(function (): void {
            Route::get('/', [SupportTicketController::class, 'index'])->name('index');
            Route::post('/', [SupportTicketController::class, 'store'])->name('store');
            Route::put('/{ticket}', [SupportTicketController::class, 'update'])->name('update');
            Route::post('/{ticket}/reply', [SupportTicketController::class, 'reply'])->name('reply');
        });

        Route::prefix('system-health')->name('system-health.')->group(function (): void {
            Route::get('/', [SystemHealthController::class, 'index'])->name('index');
            Route::post('/run', [SystemHealthController::class, 'run'])->name('run');
        });
    });
