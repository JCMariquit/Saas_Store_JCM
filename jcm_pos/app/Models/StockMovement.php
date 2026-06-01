<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    protected $connection = 'pos';

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

    protected $casts = [
        'tenant_id' => 'integer',
        'branch_id' => 'integer',
        'product_id' => 'integer',
        'product_stock_batch_id' => 'integer',
        'quantity' => 'decimal:2',
        'unit_cost' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'quantity_before' => 'decimal:2',
        'quantity_after' => 'decimal:2',
        'movement_date' => 'datetime',
        'created_by' => 'integer',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function batch()
    {
        return $this->belongsTo(ProductStockBatch::class, 'product_stock_batch_id');
    }
}