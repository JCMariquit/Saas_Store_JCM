<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceImage extends Model
{
    protected $table = 'service_images';

    protected $fillable = [
        'service_id',
        'image_path',
        'alt_text',
        'sort_order',
    ];

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}