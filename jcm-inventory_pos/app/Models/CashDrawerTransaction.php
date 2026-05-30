<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CashDrawerTransaction extends Model
{
    protected $connection = 'pos';

    protected $table = 'cash_drawer_transactions';

    protected $fillable = [
        'tenant_id',
        'cash_drawer_id',
        'type',
        'amount',
        'reference_type',
        'reference_id',
        'remarks',
        'created_by',
    ];

    protected $casts = [
        'tenant_id' => 'integer',
        'cash_drawer_id' => 'integer',
        'amount' => 'decimal:2',
        'reference_id' => 'integer',
        'created_by' => 'integer',
    ];

    public function drawer()
    {
        return $this->belongsTo(CashDrawer::class, 'cash_drawer_id');
    }
}