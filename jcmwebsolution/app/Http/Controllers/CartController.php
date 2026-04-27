<?php

namespace App\Http\Controllers;

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

        $items = DB::table('carts')
            ->leftJoin('products', 'products.id', '=', 'carts.product_id')
            ->leftJoin('plans', 'plans.id', '=', 'carts.plan_id')
            ->where('carts.user_id', $authId)
            ->where('carts.status', 'active')
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
                'products.image as product_image',
                'plans.name as plan_name',
                'plans.price as plan_price',
                'plans.description as plan_description',
            ])
            ->orderByDesc('carts.id')
            ->get();

        $total = $items->sum(function ($item) {
            return ((float) ($item->plan_price ?? 0)) * ((int) ($item->quantity ?? 1));
        });

        return response()->json([
            'auth_id' => $authId,
            'items' => $items,
            'count' => (int) $items->sum('quantity'),
            'total' => $total,
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

        $existingCart = DB::table('carts')
            ->where('user_id', $authId)
            ->where('product_id', $validated['product_id'])
            ->where('plan_id', $validated['plan_id'] ?? null)
            ->where('status', 'active')
            ->first();

        if ($existingCart) {
            DB::table('carts')
                ->where('id', $existingCart->id)
                ->where('user_id', $authId)
                ->update([
                    'quantity' => 1,
                    'notes' => $validated['notes'] ?? $existingCart->notes,
                    'status' => 'active',
                    'updated_at' => now(),
                ]);
        } else {
            DB::table('carts')->insert([
                'user_id' => $authId,
                'product_id' => $validated['product_id'],
                'plan_id' => $validated['plan_id'] ?? null,
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