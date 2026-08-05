<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return to_route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        if ($this->hasHistoricalRecords($user->getKey())) {
            $user->update(['is_active' => false]);
        } else {
            if (Schema::connection(config('database.default'))->hasTable('login_activities')) {
                DB::connection()
                    ->table('login_activities')
                    ->where('user_id', $user->getKey())
                    ->orWhere('email_attempted', $user->email)
                    ->delete();
            }

            $user->delete();
        }

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
    private function hasHistoricalRecords(int $userId): bool
    {
        return DB::table('orders')
            ->where('user_id', $userId)
            ->orWhere('account_owner_id', $userId)
            ->exists()
            || DB::table('subscriptions')
                ->where('user_id', $userId)
                ->orWhere('account_owner_id', $userId)
                ->exists()
            || DB::table('transactions')->where('user_id', $userId)->exists()
            || DB::table('user_product_access')
                ->where('user_id', $userId)
                ->orWhere('account_owner_id', $userId)
                ->exists();
    }

}
