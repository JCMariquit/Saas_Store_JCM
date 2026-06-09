<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SaasPlan extends Model
{
    protected $connection = 'saas';

    protected $table = 'plans';

    protected $fillable = [
        'product_id',
        'plan_name',
        'price',
        'duration_days',
        'description',
        'status',

        'has_role_based_access',
        'has_multi_branch',
        'has_activity_logs',
        'activity_log_retention_days',
        'max_branches',
        'max_staff',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',

            'has_role_based_access' => 'boolean',
            'has_multi_branch' => 'boolean',
            'has_activity_logs' => 'boolean',

            'activity_log_retention_days' => 'integer',
            'max_branches' => 'integer',
            'max_staff' => 'integer',
        ];
    }
}