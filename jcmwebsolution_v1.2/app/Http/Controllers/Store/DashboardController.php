<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Service;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('dashboard', [
            'products' => $this->products(),
            'services' => $this->services(),
        ]);
    }

    private function products()
    {
        return Product::query()
            ->with([
                'plans' => fn ($query) => $query
                    ->where('status', 'active')
                    ->orderBy('price', 'asc'),

                'images' => fn ($query) => $query
                    ->orderBy('sort_order', 'asc'),
            ])
            ->where('status', 'active')
            ->latest()
            ->get()
            ->map(function ($product) {
                $plan = $product->plans->first();
                $image = $product->images->first();

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'pricing_type' => $product->pricing_type,

                    'thumbnail_url' => $product->thumbnail
                        ? asset('storage/' . $product->thumbnail)
                        : null,

                    'image_url' => $image
                        ? asset('storage/' . $image->image_path)
                        : null,

                    'starting_price_label' => $plan
                        ? 'Starts at ₱' . number_format((float) $plan->price, 2)
                        : 'Plan Based',
                ];
            });
    }

    private function services()
    {
        return Service::query()
            ->where('status', 'active')
            ->latest()
            ->get()
            ->map(function ($service) {
                return [
                    'id' => $service->id,
                    'name' => $service->name,
                    'service_type' => $service->service_type,

                    'thumbnail_url' => $service->thumbnail
                        ? asset('storage/' . $service->thumbnail)
                        : null,

                    'image_url' => $service->image
                        ? asset('storage/' . $service->image)
                        : null,

                    'base_price_label' => $service->base_price
                        ? 'Starts at ₱' . number_format((float) $service->base_price, 2)
                        : 'Custom Quote',
                ];
            });
    }
}