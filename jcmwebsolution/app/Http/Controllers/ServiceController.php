<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ServiceController extends Controller
{
    public function show(int $service)
    {
        $mediaBaseUrl = 'https://jcmwebsolution.com/jcm_admin/storage/app/public/';

        $serviceData = DB::table('services')
            ->where('id', $service)
            ->where('status', 'active')
            ->first();

        abort_if(!$serviceData, 404);

        $features = DB::table('service_features')
            ->where('service_id', $serviceData->id)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn ($feature) => [
                'id' => $feature->id,
                'title' => $feature->feature_title,
                'description' => $feature->feature_description,
                'icon' => $feature->icon,
                'sort_order' => $feature->sort_order,
            ])
            ->values();

        $images = DB::table('service_images')
            ->where('service_id', $serviceData->id)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(function ($image) use ($mediaBaseUrl) {
                return [
                    'id' => $image->id,
                    'image_path' => $image->image_path,
                    'image_url' => $image->image_path
                        ? rtrim($mediaBaseUrl, '/') . '/' . ltrim($image->image_path, '/')
                        : null,
                    'alt_text' => $image->alt_text,
                    'sort_order' => $image->sort_order,
                ];
            })
            ->values();

        $overviews = DB::table('service_overview')
            ->where('service_id', $serviceData->id)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn ($overview) => [
                'id' => $overview->id,
                'title' => $overview->title,
                'content' => $overview->content,
                'sort_order' => $overview->sort_order,
            ])
            ->values();

        return Inertia::render('services/show', [
            'service' => [
                'id' => $serviceData->id,
                'code' => $serviceData->code,
                'name' => $serviceData->name,
                'description' => $serviceData->description,
                'thumbnail' => $serviceData->thumbnail,
                'thumbnail_url' => $serviceData->thumbnail
                    ? rtrim($mediaBaseUrl, '/') . '/' . ltrim($serviceData->thumbnail, '/')
                    : null,
                'service_type' => $serviceData->service_type,
                'pricing_type' => $serviceData->pricing_type,
                'base_price' => $serviceData->base_price,
                'base_price_label' => $serviceData->base_price !== null
                    ? '₱' . number_format((float) $serviceData->base_price, 2)
                    : 'Custom',
                'status' => $serviceData->status,
                'sort_order' => $serviceData->sort_order,
                'features' => $features,
                'images' => $images,
                'overviews' => $overviews,
            ],
        ]);
    }
}