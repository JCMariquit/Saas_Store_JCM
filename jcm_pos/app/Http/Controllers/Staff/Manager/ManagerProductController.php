<?php

namespace App\Http\Controllers\Staff\Manager;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ManagerProductController extends Controller
{
    public function index()
    {
        return Inertia::render('staff/manager/products/index');
    }
}