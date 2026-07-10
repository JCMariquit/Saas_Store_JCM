<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WarehouseStock extends Model
{
    use HasFactory;

    protected $connection = 'mysql';

    protected $table = 'warehouse_stocks';

    protected $fillable = [
        'tenant_id',
        'warehouse_id',
        'product_id',
        'quantity',
        'reorder_level',
        'max_stock_level',
        'average_cost',
        'last_movement_at',
    ];

    protected function casts(): array
    {
        return [
            'tenant_id' => 'integer',
            'warehouse_id' => 'integer',
            'product_id' => 'integer',

            'quantity' => 'decimal:3',
            'reorder_level' => 'decimal:3',
            'max_stock_level' => 'decimal:3',
            'average_cost' => 'decimal:2',

            'last_movement_at' => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
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

    public function scopeForWarehouse(
        Builder $query,
        int $warehouseId
    ): Builder {
        return $query->where(
            'warehouse_id',
            $warehouseId
        );
    }

    public function scopeForProduct(
        Builder $query,
        int $productId
    ): Builder {
        return $query->where(
            'product_id',
            $productId
        );
    }

    public function scopeInStock(Builder $query): Builder
    {
        return $query->where('quantity', '>', 0);
    }

    public function scopeOutOfStock(Builder $query): Builder
    {
        return $query->where('quantity', '<=', 0);
    }

    public function scopeLowStock(Builder $query): Builder
    {
        return $query
            ->where('quantity', '>', 0)
            ->whereColumn(
                'quantity',
                '<=',
                'reorder_level'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function isOutOfStock(): bool
    {
        return (float) $this->quantity <= 0;
    }

    public function isLowStock(): bool
    {
        return (float) $this->quantity > 0
            && (float) $this->quantity
                <= (float) $this->reorder_level;
    }

    public function getStockStatusAttribute(): string
    {
        if ($this->isOutOfStock()) {
            return 'out_of_stock';
        }

        if ($this->isLowStock()) {
            return 'low_stock';
        }

        return 'in_stock';
    }
}