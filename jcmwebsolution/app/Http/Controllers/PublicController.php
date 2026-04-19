<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class PublicController extends Controller
{
    public function home(): Response
    {
        $products = Product::with(['plans' => function ($query) {
                $query->where('status', 'active')->orderBy('price');
            }])
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

        return Inertia::render('welcome', [
            'canRegister' => Features::enabled(Features::registration()),
            'products' => $products,
        ]);
    }
}