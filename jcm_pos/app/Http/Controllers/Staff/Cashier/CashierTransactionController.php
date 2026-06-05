<?php

namespace App\Http\Controllers\Staff\Cashier;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class CashierTransactionController extends Controller
{
    public function index()
    {
        return Inertia::render('staff/cashier/transactions/index');
    }
}