<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;

class ProductController extends Controller
{
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

    public function store(Request $request): RedirectResponse
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

        Product::create([
            'product_code' => $this->generateProductCode(),
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'pricing_type' => $validated['pricing_type'],
            'price' => $price,
            'status' => $validated['status'],
        ]);

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
        $product->delete();

        return redirect()
            ->route('admin.products.index')
            ->with('success', 'Product deleted successfully.');
    }

    private function generateProductCode(): string
    {
        do {
            $code = 'PRD-' . strtoupper(Str::random(6));
        } while (Product::where('product_code', $code)->exists());

        return $code;
    }
}