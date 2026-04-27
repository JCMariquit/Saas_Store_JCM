<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
public function store(Request $request): RedirectResponse
{
    $validated = $request->validate([
        'product_id' => ['required', 'integer', 'exists:products,id'],
        'plan_id' => ['nullable', 'integer', 'exists:plans,id'],
        'notes' => ['nullable', 'string', 'max:1000'],
    ]);

    DB::table('carts')->updateOrInsert(
        [
            'user_id' => Auth::id(),
            'product_id' => $validated['product_id'],
            'plan_id' => $validated['plan_id'] ?? null,
        ],
        [
            'quantity' => 1, // FIXED
            'status' => 'active',
            'notes' => $validated['notes'] ?? null,
            'updated_at' => now(),
            'created_at' => now(),
        ]
    );

    return back()->with('success', 'Product added to cart.');
}
}