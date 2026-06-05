<?php

namespace App\Http\Controllers\Staff\Cashier;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class CashierDashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('staff/cashier/dashboard');
    }
}