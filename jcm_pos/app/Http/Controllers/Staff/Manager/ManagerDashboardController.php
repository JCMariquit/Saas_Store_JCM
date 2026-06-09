<?php

namespace App\Http\Controllers\Staff\Manager;

use App\Http\Controllers\Controller;
use App\Support\ActivityLogger;
use Inertia\Inertia;

class ManagerDashboardController extends Controller
{
    public function index()
    {
        ActivityLogger::log(
            module: 'manager_dashboard',
            action: 'viewed',
            description: 'Viewed manager dashboard.'
        );

        return Inertia::render('staff/manager/dashboard');
    }
}