<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Inertia\Inertia;

class ServiceController extends Controller
{
    public function show(Service $service)
    {
        abort_if($service->status !== 'active', 404);

        $service->load([
            'images' => function ($query) {
                $query->orderBy('sort_order');
            },
            'features' => function ($query) {
                $query->orderBy('sort_order');
            },
            'overviews' => function ($query) {
                $query->orderBy('sort_order');
            },
        ]);

        $mediaBaseUrl = asset('storage');

        $images = $service->images->map(function ($image) use ($mediaBaseUrl) {
            return [
                'id' => $image->id,
                'image_path' => $image->image_path,
                'image_url' => $image->image_path
                    ? rtrim($mediaBaseUrl, '/') . '/' . ltrim($image->image_path, '/')
                    : null,
                'alt_text' => $image->alt_text,
                'sort_order' => $image->sort_order,
            ];
        })->values();

        $features = $service->features->map(function ($feature) {
            return [
                'id' => $feature->id,
                'title' => $feature->feature_title,
                'description' => $feature->feature_description,
                'icon' => $feature->icon,
                'sort_order' => $feature->sort_order,
            ];
        })->values();

        $overviews = $service->overviews->map(function ($overview) {
            return [
                'id' => $overview->id,
                'title' => $overview->title,
                'content' => $overview->content,
                'sort_order' => $overview->sort_order,
            ];
        })->values();

        $thumbnailUrl = $service->thumbnail
            ? rtrim($mediaBaseUrl, '/') . '/' . ltrim($service->thumbnail, '/')
            : ($images->first()['image_url'] ?? null);

        return Inertia::render('services/show', [
            'service' => [
                'id' => $service->id,
                'code' => $service->code,
                'name' => $service->name,
                'description' => $service->description,
                'thumbnail' => $service->thumbnail,
                'thumbnail_url' => $thumbnailUrl,
                'service_type' => $service->service_type,
                'pricing_type' => $service->pricing_type,
                'base_price' => $service->base_price,
                'base_price_label' => $service->base_price !== null
                    ? '₱' . number_format((float) $service->base_price, 2)
                    : 'Custom',
                'status' => $service->status,
                'sort_order' => $service->sort_order,
                'features' => $features,
                'images' => $images,
                'overviews' => $overviews,
            ],
        ]);
    }
}