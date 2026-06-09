<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SaasSubscription extends Model
{
    protected $connection = 'saas';

    protected $table = 'subscriptions';

    public function plan()
    {
        return $this->belongsTo(SaasPlan::class, 'plan_id');
    }
}