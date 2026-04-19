<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ServiceController extends Controller
{
    public function index(Request $request)
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

    public function store(Request $request)
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
        ]);

        if ($validated['pricing_type'] === 'quote') {
            $validated['base_price'] = null;
        }

        $validated['sort_order'] = $validated['sort_order'] ?? 0;

        Service::create($validated);

        return redirect()
            ->route('admin.services.index')
            ->with('success', 'Service created successfully.');
    }

    public function update(Request $request, Service $service)
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

    public function destroy(Service $service)
    {
        $service->delete();

        return redirect()
            ->route('admin.services.index')
            ->with('success', 'Service deleted successfully.');
    }
}