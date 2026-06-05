<?php

namespace App\Http\Controllers\Staff\Manager;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ManagerTransactionController extends Controller
{
    public function index()
    {
        return Inertia::render('staff/manager/transactions/index');
    }
}