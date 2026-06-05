<?php

namespace App\Http\Controllers\Staff\Staff;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class StaffDashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('staff/staff/dashboard');
    }
}