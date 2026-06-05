<?php

namespace App\Http\Controllers\Staff\Manager;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ManagerDashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('staff/manager/dashboard');
    }
}