<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductFeature;
use App\Models\ProductImage;
use App\Models\ProductOverview;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    private string $mediaBaseUrl = 'https://jcmwebsolution.com/storage';

    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $products = Product::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('product_code', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('status', 'like', "%{$search}%")
                        ->orWhere('pricing_type', 'like', "%{$search}%");
                });
            }) 
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString()
            ->through(fn ($product) => [
                'id' => $product->id,
                'product_code' => $product->product_code,
                'name' => $product->name,
                'description' => $product->description,
                'thumbnail' => $product->thumbnail,
                'thumbnail_url' => $this->buildMediaUrl($product->thumbnail),
                'price' => $product->price,
                'pricing_type' => $product->pricing_type,
                'status' => $product->status,
                'created_at' => optional($product->created_at)?->format('M d, Y h:i A'),
            ]);

        return Inertia::render('products/index', [
            'filters' => [
                'search' => $search,
            ],
            'products' => $products,
            'stats' => [
                'total_products' => Product::count(),
                'active_products' => Product::where('status', 'active')->count(),
                'inactive_products' => Product::where('status', 'inactive')->count(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('products/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'pricing_type' => ['required', 'in:plan,custom'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', 'in:active,inactive'],

            'features' => ['nullable', 'array'],
            'features.*.title' => ['required_with:features', 'string'],

            'overviews' => ['nullable', 'array'],
            'overviews.*.title' => ['required_with:overviews', 'string'],
            'overviews.*.content' => ['required_with:overviews', 'string'],

            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        DB::transaction(function () use ($validated, $request) {
            $price = $validated['pricing_type'] === 'custom'
                ? ($validated['price'] ?? null)
                : null;

            $thumbnailPath = null;

            $product = Product::create([
                'product_code' => $this->generateProductCode(),
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'thumbnail' => null,
                'pricing_type' => $validated['pricing_type'],
                'price' => $price,
                'status' => $validated['status'],
            ]);

            if (!empty($validated['features'])) {
                foreach ($validated['features'] as $index => $feature) {
                    ProductFeature::create([
                        'product_id' => $product->id,
                        'feature_title' => $feature['title'],
                        'sort_order' => $index,
                    ]);
                }
            }

            if (!empty($validated['overviews'])) {
                foreach ($validated['overviews'] as $index => $overview) {
                    ProductOverview::create([
                        'product_id' => $product->id,
                        'title' => $overview['title'],
                        'content' => $overview['content'],
                        'sort_order' => $index,
                    ]);
                }
            }

            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $index => $imageFile) {
                    $path = $imageFile->store('products', 'public');

                    if ($index === 0) {
                        $thumbnailPath = $path;
                    }

                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_path' => $path,
                        'alt_text' => $validated['name'] . ' image ' . ($index + 1),
                        'sort_order' => $index,
                    ]);
                }
            }

            if ($thumbnailPath) {
                $product->update([
                    'thumbnail' => $thumbnailPath,
                ]);
            }
        });

        return redirect()
            ->route('admin.products.index')
            ->with('success', 'Product created successfully.');
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'pricing_type' => ['required', 'in:plan,custom'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', 'in:active,inactive'],
        ]);

        $price = $validated['pricing_type'] === 'custom'
            ? ($validated['price'] ?? null)
            : null;

        $product->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'pricing_type' => $validated['pricing_type'],
            'price' => $price,
            'status' => $validated['status'],
        ]);

        return redirect()
            ->route('admin.products.index')
            ->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        if ($product->thumbnail && Storage::disk('public')->exists($product->thumbnail)) {
            Storage::disk('public')->delete($product->thumbnail);
        }

        foreach ($product->images as $image) {
            if ($image->image_path && Storage::disk('public')->exists($image->image_path)) {
                Storage::disk('public')->delete($image->image_path);
            }
        }

        $product->delete();

        return redirect()
            ->route('admin.products.index')
            ->with('success', 'Product deleted successfully.');
    }

    private function buildMediaUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        if (Str::startsWith($path, ['http://', 'https://'])) {
            return $path;
        }

        return rtrim($this->mediaBaseUrl, '/') . '/' . ltrim($path, '/');
    }

    private function generateProductCode(): string
    {
        do {
            $code = 'PRD-' . strtoupper(Str::random(6));
        } while (Product::where('product_code', $code)->exists());

        return $code;
    }
}