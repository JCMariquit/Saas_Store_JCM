<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\ServiceFeature;
use App\Models\ServiceImage;
use App\Models\ServiceOverview;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->get('search', ''));

        $servicesQuery = Service::query()
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('code', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('service_type', 'like', "%{$search}%")
                        ->orWhere('pricing_type', 'like', "%{$search}%")
                        ->orWhere('status', 'like', "%{$search}%");
                });
            })
            ->orderBy('sort_order')
            ->orderByDesc('id');

        $services = $servicesQuery->get()->map(function ($service) {
            return [
                'id' => $service->id,
                'code' => $service->code,
                'name' => $service->name,
                'description' => $service->description,
                'thumbnail' => $service->thumbnail,
                'service_type' => $service->service_type,
                'pricing_type' => $service->pricing_type,
                'base_price' => $service->base_price,
                'base_price_label' => $service->base_price_label,
                'status' => $service->status,
                'sort_order' => $service->sort_order,
                'created_at' => optional($service->created_at)?->format('M d, Y h:i A'),
            ];
        });

        return Inertia::render('services/index', [
            'filters' => [
                'search' => $search,
            ],
            'services' => $services,
            'stats' => [
                'total' => Service::count(),
                'active' => Service::where('status', 'active')->count(),
                'inactive' => Service::where('status', 'inactive')->count(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('services/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:100', 'unique:services,code'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'service_type' => [
                'required',
                Rule::in(['custom', 'maintenance', 'support', 'consulting', 'implementation', 'other']),
            ],
            'pricing_type' => ['required', Rule::in(['fixed', 'quote'])],
            'base_price' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'sort_order' => ['nullable', 'integer', 'min:0'],

            'features' => ['nullable', 'array'],
            'features.*.title' => ['required_with:features', 'string'],

            'overviews' => ['nullable', 'array'],
            'overviews.*.title' => ['required_with:overviews', 'string'],
            'overviews.*.content' => ['required_with:overviews', 'string'],

            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        if ($validated['pricing_type'] === 'quote') {
            $validated['base_price'] = null;
        }

        $validated['sort_order'] = $validated['sort_order'] ?? 0;

        DB::transaction(function () use ($validated, $request) {
            $thumbnailPath = null;

            $service = Service::create([
                'code' => $validated['code'],
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'thumbnail' => null,
                'service_type' => $validated['service_type'],
                'pricing_type' => $validated['pricing_type'],
                'base_price' => $validated['base_price'],
                'status' => $validated['status'],
                'sort_order' => $validated['sort_order'],
            ]);

            if (!empty($validated['features'])) {
                foreach ($validated['features'] as $index => $feature) {
                    ServiceFeature::create([
                        'service_id' => $service->id,
                        'feature_title' => $feature['title'],
                        'sort_order' => $index,
                    ]);
                }
            }

            if (!empty($validated['overviews'])) {
                foreach ($validated['overviews'] as $index => $overview) {
                    ServiceOverview::create([
                        'service_id' => $service->id,
                        'title' => $overview['title'],
                        'content' => $overview['content'],
                        'sort_order' => $index,
                    ]);
                }
            }

            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $index => $imageFile) {
                    $path = $imageFile->store('services', 'public');

                    if ($index === 0) {
                        $thumbnailPath = $path;
                    }

                    ServiceImage::create([
                        'service_id' => $service->id,
                        'image_path' => $path,
                        'alt_text' => $validated['name'] . ' image ' . ($index + 1),
                        'sort_order' => $index,
                    ]);
                }
            }

            if ($thumbnailPath) {
                $service->update([
                    'thumbnail' => $thumbnailPath,
                ]);
            }
        });

        return redirect()
            ->route('admin.services.index')
            ->with('success', 'Service created successfully.');
    }

    public function update(Request $request, Service $service): RedirectResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:100', Rule::unique('services', 'code')->ignore($service->id)],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'service_type' => [
                'required',
                Rule::in(['custom', 'maintenance', 'support', 'consulting', 'implementation', 'other']),
            ],
            'pricing_type' => ['required', Rule::in(['fixed', 'quote'])],
            'base_price' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        if ($validated['pricing_type'] === 'quote') {
            $validated['base_price'] = null;
        }

        $validated['sort_order'] = $validated['sort_order'] ?? 0;

        $service->update($validated);

        return redirect()
            ->route('admin.services.index')
            ->with('success', 'Service updated successfully.');
    }

    public function destroy(Service $service): RedirectResponse
    {
        if ($service->thumbnail && Storage::disk('public')->exists($service->thumbnail)) {
            Storage::disk('public')->delete($service->thumbnail);
        }

        foreach ($service->images as $image) {
            if ($image->image_path && Storage::disk('public')->exists($image->image_path)) {
                Storage::disk('public')->delete($image->image_path);
            }
        }

        $service->delete();

        return redirect()
            ->route('admin.services.index')
            ->with('success', 'Service deleted successfully.');
    }
}