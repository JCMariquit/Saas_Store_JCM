<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WebsiteBuilderController extends Controller
{
    public function index(Request $request): Response
    {
        $products = Product::query()
            ->where('status', 'active')
            ->orderBy('name')
            ->get()
            ->map(fn ($product) => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'pricing_type' => $product->pricing_type,
                'status' => $product->status,
            ]);

        return Inertia::render('admin/website/builder/index', [
            'products' => $products,
        ]);
    }

    public function show(Product $product): Response
    {
        return Inertia::render('website/builder/show', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'pricing_type' => $product->pricing_type,
                'status' => $product->status,
            ],
        ]);
    }
}