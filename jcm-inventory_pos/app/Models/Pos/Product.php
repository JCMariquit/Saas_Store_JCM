<?php

namespace App\Models\Pos;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;

    protected $connection = 'pos';

    protected $fillable = [
        'tenant_id',
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

    protected $casts = [
        'cost_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'wholesale_price' => 'decimal:2',
        'compare_at_price' => 'decimal:2',
        'quantity' => 'decimal:2',
        'reorder_level' => 'decimal:2',
        'max_stock_level' => 'decimal:2',
        'is_taxable' => 'boolean',
        'allow_discount' => 'boolean',
        'low_stock_alert' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function stockBatches()
    {
        return $this->hasMany(ProductStockBatch::class);
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }
}