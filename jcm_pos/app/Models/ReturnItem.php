<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReturnItem extends Model
{
    protected $connection = 'pos';

    protected $table = 'return_items';

    protected $fillable = [
        'tenant_id',
        'branch_id',
        'sale_id',
        'sale_item_id',
        'product_id',
        'return_no',
        'quantity',
        'unit_price',
        'line_total',
        'reason',
        'status',
        'returned_by',
        'returned_at',
    ];

    protected $casts = [
        'tenant_id' => 'integer',
        'branch_id' => 'integer',
        'sale_id' => 'integer',
        'sale_item_id' => 'integer',
        'product_id' => 'integer',
        'returned_by' => 'integer',
        'quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'line_total' => 'decimal:2',
        'returned_at' => 'datetime',
    ];

    public function sale()
    {
        return $this->belongsTo(Sale::class, 'sale_id');
    }

    public function saleItem()
    {
        return $this->belongsTo(SaleItem::class, 'sale_item_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }
}