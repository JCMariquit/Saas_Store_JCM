<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends Model
{
    use HasFactory;
    use SoftDeletes;

    /*
    |--------------------------------------------------------------------------
    | Database Configuration
    |--------------------------------------------------------------------------
    */

    protected $connection = 'mysql';

    protected $table = 'suppliers';

    /*
    |--------------------------------------------------------------------------
    | Mass Assignable Fields
    |--------------------------------------------------------------------------
    */

    protected $fillable = [
        'tenant_id',
        'code',
        'name',
        'contact_person',
        'email',
        'phone',
        'alternate_phone',
        'address',
        'tax_number',
        'payment_terms',
        'credit_limit',
        'notes',
        'is_active',
        'created_by',
    ];

    /*
    |--------------------------------------------------------------------------
    | Attribute Casting
    |--------------------------------------------------------------------------
    */

    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'tenant_id' => 'integer',
            'credit_limit' => 'decimal:2',
            'is_active' => 'boolean',
            'created_by' => 'integer',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Query Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeForTenant(
        Builder $query,
        int $tenantId
    ): Builder {
        return $query->where(
            'tenant_id',
            $tenantId
        );
    }

    public function scopeActive(
        Builder $query
    ): Builder {
        return $query->where(
            'is_active',
            true
        );
    }

    public function scopeInactive(
        Builder $query
    ): Builder {
        return $query->where(
            'is_active',
            false
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function displayContact(): string
    {
        return $this->contact_person
            ?: $this->phone
            ?: $this->email
            ?: 'No contact provided';
    }
}