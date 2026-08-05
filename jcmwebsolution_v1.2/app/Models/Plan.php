<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    protected $fillable = [
        'product_id',
        'plan_code',
        'plan_name',
        'price',
        'billing_interval',
        'currency',
        'duration_days',
        'trial_days',
        'description',
        'has_role_based_access',
        'has_multi_branch',
        'has_activity_logs',
        'activity_log_retention_days',
        'max_branches',
        'max_warehouses',
        'max_staff',
        'sort_order',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'duration_days' => 'integer',
            'trial_days' => 'integer',
            'has_role_based_access' => 'boolean',
            'has_multi_branch' => 'boolean',
            'has_activity_logs' => 'boolean',
            'activity_log_retention_days' => 'integer',
            'max_branches' => 'integer',
            'max_warehouses' => 'integer',
            'max_staff' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function prices(): HasMany
    {
        return $this->hasMany(PlanPrice::class)->orderBy('sort_order');
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }
}
