<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/dashboard/index', [
            'message' => 'Welcome to Admin Dashboard',
        ]);
    }
}