<?php

use App\Http\Controllers\PublicController;
use App\Models\Product;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [PublicController::class, 'home'])->name('home');

Route::get('/dashboard', function () {
    $products = Product::with([
            'plans' => function ($query) {
                $query->where('status', 'active')->orderBy('price');
            }
        ])
        ->where('status', 'active')
        ->orderBy('name')
        ->get()
        ->map(function ($product) {
            $lowestPlan = $product->plans->first();

            return [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'pricing_type' => $product->pricing_type,
                'status' => $product->status,
                'starting_price' => $lowestPlan?->price,
                'starting_price_label' => match ($product->pricing_type) {
                    'custom' => 'Custom',
                    default => $lowestPlan
                        ? '₱' . number_format((float) $lowestPlan->price, 2) . '+'
                        : 'Contact us',
                },
            ];
        });

    $services = \App\Models\Service::query()
        ->where('status', 'active')
        ->orderBy('name')
        ->get()
        ->map(function ($service) {
            return [
                'id' => $service->id,
                'code' => $service->code,
                'name' => $service->name,
                'description' => $service->description,
                'service_type' => $service->service_type,
                'pricing_type' => $service->pricing_type,
                'base_price' => $service->base_price,
                'base_price_label' => $service->base_price_label,
                'status' => $service->status,
            ];
        });

    return Inertia::render('dashboard', [
        'products' => $products,
        'services' => $services,
        'stats' => [
            'total_products' => Product::where('status', 'active')->count(),
            'plan_products' => Product::where('status', 'active')
                ->where('pricing_type', 'plan')
                ->count(),
            'custom_products' => Product::where('status', 'active')
                ->where('pricing_type', 'custom')
                ->count(),
        ],
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');
require __DIR__ . '/settings.php'; 