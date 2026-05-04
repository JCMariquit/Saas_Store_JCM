<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    public function index(): JsonResponse
    {
        $authId = Auth::id();

        if (!$authId) {
            return response()->json([
                'auth_id' => null,
                'items' => [],
                'count' => 0,
                'total' => 0,
                'message' => 'User not authenticated.',
            ], 401);
        }

        $items = DB::table('carts')
            ->leftJoin('products', 'products.id', '=', 'carts.product_id')
            ->leftJoin('plans', 'plans.id', '=', 'carts.plan_id')
            ->leftJoin('product_images', function ($join) {
                $join->on('product_images.product_id', '=', 'products.id')
                    ->whereRaw('product_images.id = (
                        SELECT pi.id
                        FROM product_images pi
                        WHERE pi.product_id = products.id
                        ORDER BY pi.sort_order ASC, pi.id ASC
                        LIMIT 1
                    )');
            })
            ->where('carts.user_id', $authId)
            ->where(function ($query) {
                $query->where('carts.status', 'active')
                    ->orWhereNull('carts.status')
                    ->orWhere('carts.status', '');
            })
            ->select([
                'carts.id',
                'carts.user_id',
                'carts.product_id',
                'carts.plan_id',
                'carts.quantity',
                'carts.status',
                'carts.notes',
                'carts.created_at',
                'carts.updated_at',

                'products.name as product_name',
                'products.description as product_description',

                'plans.plan_name as plan_name',
                'plans.price as plan_price',
                'plans.description as plan_description',

                'product_images.image_path as product_image',
            ])
            ->orderByDesc('carts.id')
            ->get()
            ->map(function ($item) {
                $imagePath = $item->product_image;

                return (object) [
                    'id' => $item->id,
                    'user_id' => $item->user_id,
                    'product_id' => $item->product_id,
                    'plan_id' => $item->plan_id,
                    'product_name' => $item->product_name ?? "Product #{$item->product_id}",
                    'product_description' => $item->product_description,

                    // Local public image path
                    // Example DB value: images/products/sample.png
                    // Actual file: public/images/products/sample.png
                    'product_image' => $imagePath
                        ? asset(ltrim($imagePath, '/'))
                        : null,

                    'plan_name' => $item->plan_name ?? 'No plan',
                    'plan_price' => (float) ($item->plan_price ?? 0),
                    'plan_description' => $item->plan_description,
                    'quantity' => (int) ($item->quantity ?? 1),
                    'status' => $item->status ?: 'active',
                    'notes' => $item->notes,
                    'created_at' => $item->created_at,
                    'updated_at' => $item->updated_at,
                ];
            });

        $total = $items->sum(function ($item) {
            return ((float) $item->plan_price) * ((int) $item->quantity);
        });

        return response()->json([
            'auth_id' => $authId,
            'items' => $items,
            'count' => (int) $items->sum('quantity'),
            'total' => (float) $total,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'plan_id' => ['nullable', 'integer', 'exists:plans,id'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $authId = Auth::id();
        $planId = $validated['plan_id'] ?? null;

        $existingCartQuery = DB::table('carts')
            ->where('user_id', $authId)
            ->where('product_id', $validated['product_id'])
            ->where(function ($query) {
                $query->where('status', 'active')
                    ->orWhereNull('status')
                    ->orWhere('status', '');
            });

        if ($planId === null) {
            $existingCartQuery->whereNull('plan_id');
        } else {
            $existingCartQuery->where('plan_id', $planId);
        }

        $existingCart = $existingCartQuery->first();

        if ($existingCart) {
            DB::table('carts')
                ->where('id', $existingCart->id)
                ->where('user_id', $authId)
                ->update([
                    'quantity' => 1,
                    'status' => 'active',
                    'notes' => $validated['notes'] ?? $existingCart->notes,
                    'updated_at' => now(),
                ]);
        } else {
            DB::table('carts')->insert([
                'user_id' => $authId,
                'product_id' => $validated['product_id'],
                'plan_id' => $planId,
                'quantity' => 1,
                'status' => 'active',
                'notes' => $validated['notes'] ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return back()->with('success', 'Product added to cart successfully.');
    }

    public function destroy(int $cart): JsonResponse
    {
        DB::table('carts')
            ->where('id', $cart)
            ->where('user_id', Auth::id())
            ->delete();

        return response()->json([
            'message' => 'Cart item removed successfully.',
        ]);
    }
}