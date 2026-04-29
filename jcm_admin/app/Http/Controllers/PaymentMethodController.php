<?php

namespace App\Http\Controllers;

use App\Models\PaymentMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PaymentMethodController extends Controller
{
    public function index()
    {
        $paymentMethods = PaymentMethod::query()
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->get()
            ->map(fn ($method) => [
                'id' => $method->id,
                'name' => $method->name,
                'slug' => $method->slug,
                'account_name' => $method->account_name,
                'account_number' => $method->account_number,
                'account_owner' => $method->account_owner,
                'image_path' => $method->image_path,
                'instructions' => $method->instructions,
                'status' => (bool) $method->status,
                'sort_order' => $method->sort_order,
                'created_at' => $method->created_at?->format('M d, Y'),
            ]);

        return Inertia::render('payment-methods/index', [
            'paymentMethods' => $paymentMethods,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'slug' => ['nullable', 'string', 'max:100', 'unique:payment_methods,slug'],
            'account_name' => ['nullable', 'string', 'max:150'],
            'account_number' => ['nullable', 'string', 'max:100'],
            'account_owner' => ['nullable', 'string', 'max:150'],
            'instructions' => ['nullable', 'string'],
            'status' => ['required', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'image' => ['nullable', 'image', 'max:5120'],
        ]);

        $imagePath = null;

        if ($request->hasFile('image')) {
            $storedPath = $request->file('image')->store('payment-methods', 'public');
            $imagePath = Storage::url($storedPath);
        }

        PaymentMethod::create([
            'name' => $validated['name'],
            'slug' => $validated['slug'] ?: Str::slug($validated['name']),
            'account_name' => $validated['account_name'] ?? null,
            'account_number' => $validated['account_number'] ?? null,
            'account_owner' => $validated['account_owner'] ?? null,
            'image_path' => $imagePath,
            'instructions' => $validated['instructions'] ?? null,
            'status' => $validated['status'],
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        return back()->with('success', 'Payment method added successfully.');
    }

    public function update(Request $request, PaymentMethod $paymentMethod)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'slug' => ['nullable', 'string', 'max:100', 'unique:payment_methods,slug,' . $paymentMethod->id],
            'account_name' => ['nullable', 'string', 'max:150'],
            'account_number' => ['nullable', 'string', 'max:100'],
            'account_owner' => ['nullable', 'string', 'max:150'],
            'instructions' => ['nullable', 'string'],
            'status' => ['required', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'image' => ['nullable', 'image', 'max:5120'],
        ]);

        $imagePath = $paymentMethod->image_path;

        if ($request->hasFile('image')) {
            if ($paymentMethod->image_path) {
                $oldPath = str_replace('/storage/', '', $paymentMethod->image_path);
                Storage::disk('public')->delete($oldPath);
            }

            $storedPath = $request->file('image')->store('payment-methods', 'public');
            $imagePath = Storage::url($storedPath);
        }

        $paymentMethod->update([
            'name' => $validated['name'],
            'slug' => $validated['slug'] ?: Str::slug($validated['name']),
            'account_name' => $validated['account_name'] ?? null,
            'account_number' => $validated['account_number'] ?? null,
            'account_owner' => $validated['account_owner'] ?? null,
            'image_path' => $imagePath,
            'instructions' => $validated['instructions'] ?? null,
            'status' => $validated['status'],
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        return back()->with('success', 'Payment method updated successfully.');
    }

    public function destroy(PaymentMethod $paymentMethod)
    {
        if ($paymentMethod->image_path) {
            $oldPath = str_replace('/storage/', '', $paymentMethod->image_path);
            Storage::disk('public')->delete($oldPath);
        }

        $paymentMethod->delete();

        return back()->with('success', 'Payment method deleted successfully.');
    }
}