<?php

// Verify these imports exist near the top of routes/web.php:
use App\Http\Controllers\Reports\ProductReportController;
use App\Http\Controllers\Reports\StockReportController;

// Verify these routes exist INSIDE your authenticated/product-access group.
// Do not add duplicates when they already exist.

Route::prefix('reports/inventory/products')
    ->name('reports.inventory.products.')
    ->middleware('feature:products')
    ->controller(ProductReportController::class)
    ->group(function (): void {
        Route::get('/pdf', 'pdf')->name('pdf');
        Route::get('/excel-preview', 'excelPreview')->name('excel-preview');
        Route::get('/excel', 'excel')->name('excel');
    });

Route::prefix('reports/inventory/stocks')
    ->name('reports.inventory.stocks.')
    ->middleware('feature:stock_management')
    ->controller(StockReportController::class)
    ->group(function (): void {
        Route::get('/pdf', 'pdf')->name('pdf');
        Route::get('/excel-preview', 'excelPreview')->name('excel-preview');
        Route::get('/excel', 'excel')->name('excel');
    });
