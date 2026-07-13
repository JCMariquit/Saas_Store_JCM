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

    protected $table = 'stock_movements';

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

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(
            Warehouse::class,
            'warehouse_id'
        );
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(
            Product::class,
            'product_id'
        );
    }

    public function relatedWarehouse(): BelongsTo
    {
        return $this->belongsTo(
            Warehouse::class,
            'related_warehouse_id'
        );
    }

    public function scopeForTenant(
        Builder $query,
        int $tenantId
    ): Builder {
        return $query->where(
            $this->qualifyColumn('tenant_id'),
            $tenantId
        );
    }

    public function scopeForWarehouse(
        Builder $query,
        int $warehouseId
    ): Builder {
        return $query->where(
            $this->qualifyColumn('warehouse_id'),
            $warehouseId
        );
    }

    public function scopeForProduct(
        Builder $query,
        int $productId
    ): Builder {
        return $query->where(
            $this->qualifyColumn('product_id'),
            $productId
        );
    }

    public function scopeOfType(
        Builder $query,
        string $movementType
    ): Builder {
        return $query->where(
            $this->qualifyColumn('movement_type'),
            $movementType
        );
    }

    public function scopeIncoming(
        Builder $query
    ): Builder {
        return $query->whereIn(
            $this->qualifyColumn('movement_type'),
            self::incomingTypes()
        );
    }

    public function scopeOutgoing(
        Builder $query
    ): Builder {
        return $query->whereIn(
            $this->qualifyColumn('movement_type'),
            self::outgoingTypes()
        );
    }

    public static function incomingTypes(): array
    {
        return [
            self::OPENING_STOCK,
            self::STOCK_IN,
            self::ADJUSTMENT_IN,
            self::TRANSFER_IN,
            self::RETURN_IN,
        ];
    }

    public static function outgoingTypes(): array
    {
        return [
            self::STOCK_OUT,
            self::ADJUSTMENT_OUT,
            self::TRANSFER_OUT,
            self::SALE,
            self::RETURN_OUT,
            self::DAMAGE,
            self::EXPIRED,
        ];
    }

    public static function movementLabels(): array
    {
        return [
            self::OPENING_STOCK => 'Opening Stock',
            self::STOCK_IN => 'Stock In',
            self::STOCK_OUT => 'Stock Out',
            self::ADJUSTMENT_IN => 'Adjustment In',
            self::ADJUSTMENT_OUT => 'Adjustment Out',
            self::TRANSFER_IN => 'Transfer In',
            self::TRANSFER_OUT => 'Transfer Out',
            self::SALE => 'Sale',
            self::RETURN_IN => 'Return In',
            self::RETURN_OUT => 'Return Out',
            self::DAMAGE => 'Damage',
            self::EXPIRED => 'Expired',
        ];
    }

    public function isIncoming(): bool
    {
        return in_array(
            $this->movement_type,
            self::incomingTypes(),
            true
        );
    }

    public function isOutgoing(): bool
    {
        return in_array(
            $this->movement_type,
            self::outgoingTypes(),
            true
        );
    }

    public function movementLabel(): string
    {
        return self::movementLabels()[
            $this->movement_type
        ] ?? ucfirst(
            str_replace(
                '_',
                ' ',
                $this->movement_type
            )
        );
    }

    public function direction(): string
    {
        return $this->isIncoming()
            ? 'in'
            : 'out';
    }
}