<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreProfile extends Model
{
    protected $connection = 'pos';

    protected $table = 'store_profiles';

    protected $fillable = [
        'client_id',
        'branch_id',
        'store_name',
        'business_type',
        'description',
        'email',
        'phone',
        'address_line',
        'barangay',
        'city',
        'province',
        'postal_code',
        'country',
        'logo_path',
        'cover_path',
        'tin',
        'permit_no',
        'currency',
        'timezone',
        'receipt_header',
        'receipt_footer',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id', 'id');
    }
}