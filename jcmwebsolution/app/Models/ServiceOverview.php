<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceOverview extends Model
{
    protected $table = 'service_overview';

    protected $fillable = [
        'service_id',
        'title',
        'content',
        'sort_order',
    ];

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}