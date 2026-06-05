<?php

namespace App\Http\Controllers\Staff\Cashier;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CashierReturnController extends Controller
{
    public function index()
    {
        return Inertia::render('staff/cashier/returns/index');
    }

    public function store(Request $request)
    {
        return back();
    }
}