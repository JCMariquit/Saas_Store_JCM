<?php

namespace App\Http\Controllers\Staff\Cashier;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CashierPosController extends Controller
{
    public function index()
    {
        return Inertia::render('staff/cashier/pos/terminal');
    }

    public function checkout(Request $request)
    {
        return back();
    }
}