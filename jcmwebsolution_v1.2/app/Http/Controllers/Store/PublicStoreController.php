<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Service;
use Inertia\Inertia;
use Inertia\Response;

class PublicStoreController extends Controller
{
    public function welcome(): Response
    {
        return Inertia::render('welcome', [
            'canRegister' => true,
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
                    ->orderBy('price'),
                'images',
                'features',
                'overviews',
            ])
            ->where('status', 'active')
            ->latest()
            ->get()
            ->map(function ($product) {
                $firstImage = $product->images->first();
                $lowestPlan = $product->plans->first();

                $imageUrl = null;

                if (!empty($product->thumbnail)) {
                    $imageUrl = asset('storage/' . $product->thumbnail);
                } elseif ($firstImage) {
                    $imageUrl = asset('storage/' . $firstImage->image_path);
                }

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'description' => $product->description,
                    'pricing_type' => $product->pricing_type,
                    'thumbnail_url' => $imageUrl,
                    'image_url' => $imageUrl,
                    'starting_price_label' => $lowestPlan
                        ? 'Starts at ₱' . number_format((float) $lowestPlan->price, 2)
                        : ($product->pricing_type === 'custom' ? 'Custom Quote' : 'Plan Based'),
                    'features' => $product->features,
                    'overviews' => $product->overviews,
                ];
            })
            ->values();
    }

    private function services()
    {
        return Service::query()
            ->with([
                'images',
                'features',
                'overviews',
            ])
            ->where('status', 'active')
            ->orderBy('sort_order')
            ->latest()
            ->get()
            ->map(function ($service) {
                $firstImage = $service->images->first();

                $imageUrl = null;

                if (!empty($service->thumbnail)) {
                    $imageUrl = asset('storage/' . $service->thumbnail);
                } elseif ($firstImage) {
                    $imageUrl = asset('storage/' . $firstImage->image_path);
                }

                return [
                    'id' => $service->id,
                    'name' => $service->name,
                    'description' => $service->description,
                    'service_type' => $service->service_type,
                    'pricing_type' => $service->pricing_type,
                    'thumbnail_url' => $imageUrl,
                    'image_url' => $imageUrl,
                    'base_price_label' => $service->base_price
                        ? 'Starts at ₱' . number_format((float) $service->base_price, 2)
                        : 'Custom Quote',
                    'features' => $service->features,
                    'overviews' => $service->overviews,
                ];
            })
            ->values();
    }
}