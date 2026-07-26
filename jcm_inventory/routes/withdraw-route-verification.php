<?php

// Verification only. Do not paste duplicate routes when these already exist.
// These routes belong inside the existing authenticated inventory route group.

Route::prefix('inventory')->name('inventory.')->group(function (): void {
    Route::prefix('withdraw')
        ->name('withdraw.')
        ->middleware('feature:stock_issuance_terminal')
        ->controller(StockIssuanceController::class)
        ->group(function (): void {
            Route::get('/', 'terminal')->name('index');
            Route::post('/', 'store')->name('store');
        });

    Route::prefix('history')
        ->name('history.')
        ->middleware('feature:stock_issuance_history')
        ->controller(StockIssuanceHistoryController::class)
        ->group(function (): void {
            Route::get('/', 'index')->name('index');
            Route::post('/{issuance}/void', 'void')->name('void');
        });
});
