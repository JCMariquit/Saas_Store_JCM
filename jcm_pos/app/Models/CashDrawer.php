<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CashDrawer extends Model
{
    protected $connection = 'pos';

    protected $table = 'cash_drawers';

    protected $fillable = [
        'tenant_id',
        'branch_id',
        'opened_by',
        'closed_by',
        'opening_balance',
        'expected_balance',
        'actual_balance',
        'variance_amount',
        'total_cash_sales',
        'total_refunds',
        'total_cash_in',
        'total_cash_out',
        'status',
        'opened_at',
        'closed_at',
        'notes',
    ];

    protected $casts = [
        'tenant_id' => 'integer',
        'branch_id' => 'integer',
        'opened_by' => 'integer',
        'closed_by' => 'integer',
        'opening_balance' => 'decimal:2',
        'expected_balance' => 'decimal:2',
        'actual_balance' => 'decimal:2',
        'variance_amount' => 'decimal:2',
        'total_cash_sales' => 'decimal:2',
        'total_refunds' => 'decimal:2',
        'total_cash_in' => 'decimal:2',
        'total_cash_out' => 'decimal:2',
        'opened_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    public function transactions()
    {
        return $this->hasMany(CashDrawerTransaction::class, 'cash_drawer_id');
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }
}