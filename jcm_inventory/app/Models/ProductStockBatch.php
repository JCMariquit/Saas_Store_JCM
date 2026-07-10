<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductStockBatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'branch_id',
        'product_id',
        'batch_no',
        'quantity_received',
        'quantity_remaining',
        'unit_cost',
        'selling_price',
        'received_date',
        'expiry_date',
        'remarks',
    ];

    protected function casts(): array
    {
        return [
            'tenant_id' => 'integer',
            'branch_id' => 'integer',
            'product_id' => 'integer',

            'quantity_received' => 'decimal:2',
            'quantity_remaining' => 'decimal:2',
            'unit_cost' => 'decimal:2',
            'selling_price' => 'decimal:2',

            'received_date' => 'date',
            'expiry_date' => 'date',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(
            StockMovement::class,
            'product_stock_batch_id'
        );
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
        return $query->where('tenant_id', $tenantId);
    }

    public function scopeForBranch(
        Builder $query,
        int $branchId
    ): Builder {
        return $query->where('branch_id', $branchId);
    }

    public function scopeAvailable(Builder $query): Builder
    {
        return $query->where('quantity_remaining', '>', 0);
    }

    public function scopeExpired(Builder $query): Builder
    {
        return $query
            ->whereNotNull('expiry_date')
            ->whereDate('expiry_date', '<', today());
    }

    public function scopeNotExpired(Builder $query): Builder
    {
        return $query->where(
            fn (Builder $query) => $query
                ->whereNull('expiry_date')
                ->orWhereDate('expiry_date', '>=', today())
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function isExpired(): bool
    {
        return $this->expiry_date !== null
            && $this->expiry_date->isBefore(today());
    }

    public function hasAvailableStock(): bool
    {
        return (float) $this->quantity_remaining > 0;
    }
}