<?php

namespace App\Http\Controllers\Staff\Staff;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class StaffProductController extends Controller
{
    public function index()
    {
        return Inertia::render('staff/staff/products/index');
    }
}