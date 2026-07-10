<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'branch_id',
        'category_id',
        'name',
        'slug',
        'sku',
        'barcode',
        'description',
        'image_path',
        'unit',
        'cost_price',
        'selling_price',
        'wholesale_price',
        'compare_at_price',
        'quantity',
        'reorder_level',
        'max_stock_level',
        'is_taxable',
        'tax_rate',
        'allow_discount',
        'discount_type',
        'discount_value',
        'product_type',
        'stock_tracking',
        'low_stock_alert',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'tenant_id' => 'integer',
            'branch_id' => 'integer',
            'category_id' => 'integer',

            'cost_price' => 'decimal:2',
            'selling_price' => 'decimal:2',
            'wholesale_price' => 'decimal:2',
            'compare_at_price' => 'decimal:2',
            'quantity' => 'decimal:2',
            'reorder_level' => 'decimal:2',
            'max_stock_level' => 'decimal:2',
            'tax_rate' => 'decimal:2',
            'discount_value' => 'decimal:2',

            'is_taxable' => 'boolean',
            'allow_discount' => 'boolean',
            'low_stock_alert' => 'boolean',
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

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function stockBatches(): HasMany
    {
        return $this->hasMany(ProductStockBatch::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
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

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    public function scopeTracked(Builder $query): Builder
    {
        return $query->where('stock_tracking', 'tracked');
    }

    public function scopeLowStock(Builder $query): Builder
    {
        return $query
            ->where('stock_tracking', 'tracked')
            ->where('low_stock_alert', true)
            ->where('quantity', '>', 0)
            ->whereColumn('quantity', '<=', 'reorder_level');
    }

    public function scopeOutOfStock(Builder $query): Builder
    {
        return $query
            ->where('stock_tracking', 'tracked')
            ->where('quantity', '<=', 0);
    }

    public function scopeSearch(
        Builder $query,
        ?string $search
    ): Builder {
        return $query->when(
            filled($search),
            fn (Builder $query) => $query->where(
                fn (Builder $query) => $query
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('barcode', 'like', "%{$search}%")
            )
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function isStockTracked(): bool
    {
        return $this->stock_tracking === 'tracked';
    }

    public function isOutOfStock(): bool
    {
        return $this->isStockTracked()
            && (float) $this->quantity <= 0;
    }

    public function isLowStock(): bool
    {
        return $this->isStockTracked()
            && $this->low_stock_alert
            && (float) $this->quantity > 0
            && (float) $this->quantity <= (float) $this->reorder_level;
    }

    public function getStockStatusAttribute(): string
    {
        if (! $this->isStockTracked()) {
            return 'not_tracked';
        }

        if ($this->isOutOfStock()) {
            return 'out_of_stock';
        }

        if ($this->isLowStock()) {
            return 'low_stock';
        }

        return 'in_stock';
    }
}