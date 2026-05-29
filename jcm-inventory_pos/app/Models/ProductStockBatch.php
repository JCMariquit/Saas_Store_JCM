<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductStockBatch extends Model
{
    protected $connection = 'pos';

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

    protected $casts = [
        'quantity_received' => 'decimal:2',
        'quantity_remaining' => 'decimal:2',
        'unit_cost' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'received_date' => 'date',
        'expiry_date' => 'date',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class, 'product_stock_batch_id');
    }
}