<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMovement extends Model
{
    use HasFactory;

    public const INITIAL_STOCK = 'initial_stock';
    public const STOCK_IN = 'stock_in';
    public const SALE = 'sale';
    public const RETURN_IN = 'return_in';
    public const RETURN_OUT = 'return_out';
    public const ADJUSTMENT_IN = 'adjustment_in';
    public const ADJUSTMENT_OUT = 'adjustment_out';
    public const DAMAGE = 'damage';
    public const EXPIRED = 'expired';

    protected $fillable = [
        'tenant_id',
        'branch_id',
        'product_id',
        'product_stock_batch_id',
        'movement_type',
        'quantity',
        'unit_cost',
        'total_cost',
        'quantity_before',
        'quantity_after',
        'reference_type',
        'reference_id',
        'remarks',
        'movement_date',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'tenant_id' => 'integer',
            'branch_id' => 'integer',
            'product_id' => 'integer',
            'product_stock_batch_id' => 'integer',
            'reference_id' => 'integer',
            'created_by' => 'integer',

            'quantity' => 'decimal:2',
            'unit_cost' => 'decimal:2',
            'total_cost' => 'decimal:2',
            'quantity_before' => 'decimal:2',
            'quantity_after' => 'decimal:2',

            'movement_date' => 'datetime',
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

    public function stockBatch(): BelongsTo
    {
        return $this->belongsTo(
            ProductStockBatch::class,
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

    public function scopeForProduct(
        Builder $query,
        int $productId
    ): Builder {
        return $query->where('product_id', $productId);
    }

    public function scopeOfType(
        Builder $query,
        string $movementType
    ): Builder {
        return $query->where('movement_type', $movementType);
    }

    public function scopeStockIn(Builder $query): Builder
    {
        return $query->whereIn('movement_type', [
            self::INITIAL_STOCK,
            self::STOCK_IN,
            self::RETURN_IN,
            self::ADJUSTMENT_IN,
        ]);
    }

    public function scopeStockOut(Builder $query): Builder
    {
        return $query->whereIn('movement_type', [
            self::SALE,
            self::RETURN_OUT,
            self::ADJUSTMENT_OUT,
            self::DAMAGE,
            self::EXPIRED,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function isIncoming(): bool
    {
        return in_array($this->movement_type, [
            self::INITIAL_STOCK,
            self::STOCK_IN,
            self::RETURN_IN,
            self::ADJUSTMENT_IN,
        ], true);
    }

    public function isOutgoing(): bool
    {
        return in_array($this->movement_type, [
            self::SALE,
            self::RETURN_OUT,
            self::ADJUSTMENT_OUT,
            self::DAMAGE,
            self::EXPIRED,
        ], true);
    }
}