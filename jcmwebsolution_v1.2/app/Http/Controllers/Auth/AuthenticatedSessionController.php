<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\LoginActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        $user = $request->user();

        if (! $user?->is_active) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return back()->withErrors([
                'email' => 'This account is inactive. Contact the JCM administrator.',
            ]);
        }

        LoginActivityLogger::record(
            $request,
            LoginActivityLogger::LOGIN_SUCCESS,
            $user,
        );

        // Admin accounts must always enter the central control panel.
        // Do not use redirect()->intended() for admins because Laravel may
        // have stored /dashboard as the intended URL before authentication.
        if ($user->isAdmin()) {
            $request->session()->forget('url.intended');

            return redirect()->route('admin.dashboard');
        }

        return redirect()->intended(
            route('store.dashboard', absolute: false),
        );
    }

    public function destroy(Request $request): RedirectResponse
    {
        LoginActivityLogger::record(
            $request,
            LoginActivityLogger::LOGOUT,
            $request->user(),
        );

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
