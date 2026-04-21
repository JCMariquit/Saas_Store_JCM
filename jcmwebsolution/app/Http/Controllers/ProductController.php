<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function show(Product $product)
    {
        $product->load([
            'plans' => function ($query) {
                $query->orderBy('price');
            }
        ]);

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
                'price_label' => '₱' . number_format((float) $plan->price, 2),
                'billing_cycle' => $plan->billing_cycle,
                'status' => $plan->status,
                'features' => $this->normalizeFeatures($plan->features ?? null),
            ];
        })->values();

        return Inertia::render('products/show', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'code' => $product->code ?? null,
                'description' => $product->description,
                'pricing_type' => $product->pricing_type,
                'pricing_type_label' => $pricingTypeLabel,
                'status' => $product->status,
                'status_label' => $statusLabel,
                'starting_price' => $product->starting_price,
                'starting_price_label' => $product->starting_price !== null
                    ? '₱' . number_format((float) $product->starting_price, 2)
                    : 'Custom Quote',
                'features' => $this->normalizeFeatures($product->features ?? null),
                'plans' => $plans,
            ],
        ]);
    }

    private function normalizeFeatures($features): array
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