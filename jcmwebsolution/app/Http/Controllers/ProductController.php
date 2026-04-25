<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function show(Product $product)
    {
        $product->load([
            'images' => function ($query) {
                $query->orderBy('sort_order');
            },
            'features' => function ($query) {
                $query->orderBy('sort_order');
            },
            'overviews' => function ($query) {
                $query->orderBy('sort_order');
            },
            'plans' => function ($query) {
                $query->where('status', 'active')->orderBy('price');
            },
        ]);

        /*
        |--------------------------------------------------------------------------
        | LOCAL ADMIN STORAGE BASE URL
        |--------------------------------------------------------------------------
        | Habang local pa, dito kukunin ng store project ang images mula sa admin.
        | Palitan mo later pag naka-live na.
        |
        | Example local:
        | http://localhost/jcmwebsolution/jcm_admin/public/storage
        |
        */
        $mediaBaseUrl = 'https://jcmwebsolution.com/jcm_admin/storage/app/public/';

        $pricingTypeLabel = match ($product->pricing_type) {
            'plan' => 'Plan Based',
            'custom' => 'Custom Pricing',
            'fixed' => 'Fixed Price',
            'quote' => 'Request Quote',
            default => ucfirst((string) $product->pricing_type),
        };

        $statusLabel = match ($product->status) {
            'active' => 'Active',
            'inactive' => 'Inactive',
            default => ucfirst((string) $product->status),
        };

        $plans = $product->plans->map(function ($plan) {
            return [
                'id' => $plan->id,
                'name' => $plan->name,
                'description' => $plan->description,
                'price' => $plan->price,
                'price_label' => $plan->price !== null
                    ? '₱' . number_format((float) $plan->price, 2)
                    : 'Custom Quote',
                'billing_cycle' => $plan->billing_cycle,
                'status' => $plan->status,
                'features' => $this->normalizePlanFeatures($plan->features ?? null),
            ];
        })->values();

        $images = $product->images->map(function ($image) use ($mediaBaseUrl) {
            return [
                'id' => $image->id,
                'image_path' => $image->image_path,
                'image_url' => $image->image_path
                    ? rtrim($mediaBaseUrl, '/') . '/' . ltrim($image->image_path, '/')
                    : null,
                'alt_text' => $image->alt_text,
                'sort_order' => $image->sort_order,
            ];
        })->values();

        $features = $product->features->map(function ($feature) {
            return [
                'id' => $feature->id,
                'title' => $feature->feature_title,
                'description' => $feature->feature_description,
                'icon' => $feature->icon,
                'sort_order' => $feature->sort_order,
            ];
        })->values();

        $overviews = $product->overviews->map(function ($overview) {
            return [
                'id' => $overview->id,
                'title' => $overview->title,
                'content' => $overview->content,
                'sort_order' => $overview->sort_order,
            ];
        })->values();

        $thumbnailUrl = $product->thumbnail
            ? rtrim($mediaBaseUrl, '/') . '/' . ltrim($product->thumbnail, '/')
            : ($images->first()['image_url'] ?? null);

        $startingPrice = $product->plans->count() > 0
            ? $product->plans->min('price')
            : $product->price;

        return Inertia::render('products/show', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'code' => $product->product_code ?? null,
                'description' => $product->description,
                'thumbnail' => $product->thumbnail,
                'thumbnail_url' => $thumbnailUrl,
                'pricing_type' => $product->pricing_type,
                'pricing_type_label' => $pricingTypeLabel,
                'status' => $product->status,
                'status_label' => $statusLabel,
                'starting_price' => $startingPrice,
                'starting_price_label' => $startingPrice !== null
                    ? '₱' . number_format((float) $startingPrice, 2)
                    : 'Custom Quote',
                'images' => $images,
                'features' => $features,
                'overviews' => $overviews,
                'plans' => $plans,
            ],
        ]);
    }

    private function normalizePlanFeatures($features): array
    {
        if (is_array($features)) {
            return array_values(array_filter(array_map(
                fn ($item) => trim((string) $item),
                $features
            )));
        }

        if (is_string($features) && trim($features) !== '') {
            $decoded = json_decode($features, true);

            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                return array_values(array_filter(array_map(
                    fn ($item) => trim((string) $item),
                    $decoded
                )));
            }

            return array_values(array_filter(array_map(
                fn ($item) => trim($item),
                preg_split('/\r\n|\r|\n|,/', $features)
            )));
        }

        return [];
    }
}