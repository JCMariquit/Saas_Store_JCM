<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Service;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class PublicController extends Controller
{
    private string $mediaBaseUrl = 'https://jcmwebsolution.com/jcm_admin/storage/app/public';

    public function home(): Response
    {
        $data = $this->storeData();

        return Inertia::render('welcome', [
            'canRegister' => Features::enabled(Features::registration()),
            'products' => $data['products'],
            'services' => $data['services'],
        ]);
    }

    public function dashboard(): Response
    {
        $data = $this->storeData();

        return Inertia::render('dashboard', [
            'products' => $data['products'],
            'services' => $data['services'],
        ]);
    }

    private function storeData(): array
    {
        $products = Product::with([
                'plans' => function ($query) {
                    $query->where('status', 'active')->orderBy('price');
                },
                'images' => function ($query) {
                    $query->orderBy('sort_order')->orderBy('id');
                },
            ])
            ->where('status', 'active')
            ->orderBy('name')
            ->get()
            ->map(function ($product) {
                $lowestPlan = $product->plans->first();
                $firstImage = $product->images->first();

                $thumbnailUrl = $firstImage?->image_path
                    ? $this->buildMediaUrl($firstImage->image_path)
                    : null;

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'description' => $product->description,
                    'pricing_type' => $product->pricing_type,
                    'status' => $product->status,
                    'image_url' => $thumbnailUrl,
                    'thumbnail_url' => $thumbnailUrl,
                    'starting_price' => $lowestPlan?->price,
                    'starting_price_label' => match ($product->pricing_type) {
                        'custom' => 'Custom',
                        default => $lowestPlan
                            ? '₱' . number_format((float) $lowestPlan->price, 2) . '+'
                            : 'Contact us',
                    },
                ];
            })
            ->values();

        $services = Service::query()
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
            })
            ->values();

        return [
            'products' => $products,
            'services' => $services,
        ];
    }

    private function buildMediaUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return rtrim($this->mediaBaseUrl, '/') . '/' . ltrim($path, '/');
    }
}