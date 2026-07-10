<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMovement extends Model
{
    use HasFactory;

    protected $connection = 'mysql';

    public const OPENING_STOCK = 'opening_stock';
    public const STOCK_IN = 'stock_in';
    public const STOCK_OUT = 'stock_out';
    public const ADJUSTMENT_IN = 'adjustment_in';
    public const ADJUSTMENT_OUT = 'adjustment_out';
    public const TRANSFER_IN = 'transfer_in';
    public const TRANSFER_OUT = 'transfer_out';
    public const SALE = 'sale';
    public const RETURN_IN = 'return_in';
    public const RETURN_OUT = 'return_out';
    public const DAMAGE = 'damage';
    public const EXPIRED = 'expired';

    protected $fillable = [
        'tenant_id',
        'warehouse_id',
        'product_id',
        'movement_type',
        'quantity',
        'quantity_before',
        'quantity_after',
        'unit_cost',
        'total_cost',
        'reference_type',
        'reference_id',
        'reference_no',
        'related_warehouse_id',
        'remarks',
        'movement_date',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'tenant_id' => 'integer',
            'warehouse_id' => 'integer',
            'product_id' => 'integer',
            'reference_id' => 'integer',
            'related_warehouse_id' => 'integer',
            'created_by' => 'integer',

            'quantity' => 'decimal:3',
            'quantity_before' => 'decimal:3',
            'quantity_after' => 'decimal:3',

            'unit_cost' => 'decimal:2',
            'total_cost' => 'decimal:2',

            'movement_date' => 'datetime',
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

    public function relatedWarehouse(): BelongsTo
    {
        return $this->belongsTo(
            Warehouse::class,
            'related_warehouse_id'
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

    public function scopeOfType(
        Builder $query,
        string $movementType
    ): Builder {
        return $query->where(
            'movement_type',
            $movementType
        );
    }

    public function scopeIncoming(Builder $query): Builder
    {
        return $query->whereIn('movement_type', [
            self::OPENING_STOCK,
            self::STOCK_IN,
            self::ADJUSTMENT_IN,
            self::TRANSFER_IN,
            self::RETURN_IN,
        ]);
    }

    public function scopeOutgoing(Builder $query): Builder
    {
        return $query->whereIn('movement_type', [
            self::STOCK_OUT,
            self::ADJUSTMENT_OUT,
            self::TRANSFER_OUT,
            self::SALE,
            self::RETURN_OUT,
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
            self::OPENING_STOCK,
            self::STOCK_IN,
            self::ADJUSTMENT_IN,
            self::TRANSFER_IN,
            self::RETURN_IN,
        ], true);
    }

    public function isOutgoing(): bool
    {
        return in_array($this->movement_type, [
            self::STOCK_OUT,
            self::ADJUSTMENT_OUT,
            self::TRANSFER_OUT,
            self::SALE,
            self::RETURN_OUT,
            self::DAMAGE,
            self::EXPIRED,
        ], true);
    }
}