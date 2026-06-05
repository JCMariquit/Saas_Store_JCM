<?php

namespace App\Http\Controllers\Staff\Cashier;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CashierProductController extends Controller
{
    public function index()
    {
        return Inertia::render('staff/cashier/products/index');
    }

    public function store(Request $request)
    {
        return back();
    }
}