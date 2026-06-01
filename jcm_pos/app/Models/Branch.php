<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Branch extends Model
{
    use SoftDeletes;

    protected $connection = 'pos';

    protected $table = 'branches';

    protected $fillable = [
        'tenant_id',
        'name',
        'code',
        'is_main',
        'is_active',
    ];

    protected $casts = [
        'is_main' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function storeProfile()
    {
        return $this->hasOne(StoreProfile::class, 'branch_id', 'id');
    }
}