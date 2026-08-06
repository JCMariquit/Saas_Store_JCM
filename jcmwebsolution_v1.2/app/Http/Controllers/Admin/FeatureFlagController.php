<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\PlatformAuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class FeatureFlagController extends Controller
{
    public function __construct(private readonly PlatformAuditLogger $audit)
    {
    }

    public function index(Request $request): Response
    {
        $productId = $request->integer('product_id');
        $environment = trim((string) $request->string('environment'));
        $search = trim((string) $request->string('search'));

        $flags = DB::table('feature_flags')
            ->join('products', 'products.id', '=', 'feature_flags.product_id')
            ->leftJoin('users as creators', 'creators.id', '=', 'feature_flags.created_by')
            ->select([
                'feature_flags.id',
                'feature_flags.product_id',
                'feature_flags.flag_key',
                'feature_flags.name',
                'feature_flags.description',
                'feature_flags.environment',
                'feature_flags.is_enabled',
                'feature_flags.rollout_percentage',
                'feature_flags.conditions',
                'feature_flags.updated_at',
                'products.name as product_name',
                'products.product_code',
                'creators.name as creator_name',
            ])
            ->when($productId > 0, fn ($query) => $query->where('feature_flags.product_id', $productId))
            ->when(in_array($environment, ['local', 'staging', 'production'], true), fn ($query) => $query->where('feature_flags.environment', $environment))
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($nested) use ($search): void {
                    $nested->where('feature_flags.flag_key', 'like', "%{$search}%")
                        ->orWhere('feature_flags.name', 'like', "%{$search}%")
                        ->orWhere('products.name', 'like', "%{$search}%");
                });
            })
            ->orderBy('products.name')
            ->orderBy('feature_flags.flag_key')
            ->paginate(20)
            ->withQueryString();

        $flags->getCollection()->transform(function (object $flag): object {
            $decoded = json_decode((string) ($flag->conditions ?? ''), true);
            $flag->conditions = is_array($decoded) ? $decoded : [];
            $flag->is_enabled = (bool) $flag->is_enabled;
            $flag->rollout_percentage = (int) $flag->rollout_percentage;

            return $flag;
        });

        $products = DB::table('products')
            ->select('id', 'name', 'product_code', 'status')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/feature-flags/index', [
            'flags' => $flags,
            'products' => $products,
            'filters' => [
                'product_id' => $productId ?: null,
                'environment' => $environment,
                'search' => $search,
            ],
            'stats' => [
                'total' => DB::table('feature_flags')->count(),
                'enabled' => DB::table('feature_flags')->where('is_enabled', true)->count(),
                'production' => DB::table('feature_flags')->where('environment', 'production')->count(),
                'partial_rollout' => DB::table('feature_flags')->whereBetween('rollout_percentage', [1, 99])->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'flag_key' => ['required', 'string', 'max:120', 'regex:/^[a-z0-9][a-z0-9._-]*$/'],
            'name' => ['required', 'string', 'max:160'],
            'description' => ['nullable', 'string', 'max:500'],
            'environment' => ['required', Rule::in(['local', 'staging', 'production'])],
            'is_enabled' => ['required', 'boolean'],
            'rollout_percentage' => ['required', 'integer', 'between:0,100'],
            'conditions' => ['nullable', 'array'],
        ]);

        $exists = DB::table('feature_flags')
            ->where('product_id', $validated['product_id'])
            ->where('flag_key', $validated['flag_key'])
            ->where('environment', $validated['environment'])
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'flag_key' => 'This flag already exists for the selected product and environment.',
            ]);
        }

        $id = DB::table('feature_flags')->insertGetId([
            'product_id' => $validated['product_id'],
            'flag_key' => $validated['flag_key'],
            'name' => $validated['name'],
            'description' => $validated['description'] ?: null,
            'environment' => $validated['environment'],
            'is_enabled' => $validated['is_enabled'],
            'rollout_percentage' => $validated['rollout_percentage'],
            'conditions' => json_encode($validated['conditions'] ?? [], JSON_UNESCAPED_SLASHES),
            'created_by' => $request->user()?->getKey(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->audit->write(
            $request,
            'feature_flags',
            'created',
            "Created feature flag {$validated['flag_key']}.",
            'feature_flags',
            $id,
            null,
            $validated,
        );

        return back()->with('success', 'Feature flag created.');
    }

    public function update(Request $request, int $flag): RedirectResponse
    {
        $existing = DB::table('feature_flags')->where('id', $flag)->first();
        abort_unless($existing, 404);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'description' => ['nullable', 'string', 'max:500'],
            'is_enabled' => ['required', 'boolean'],
            'rollout_percentage' => ['required', 'integer', 'between:0,100'],
            'conditions' => ['nullable', 'array'],
        ]);

        DB::table('feature_flags')->where('id', $flag)->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?: null,
            'is_enabled' => $validated['is_enabled'],
            'rollout_percentage' => $validated['rollout_percentage'],
            'conditions' => json_encode($validated['conditions'] ?? [], JSON_UNESCAPED_SLASHES),
            'updated_at' => now(),
        ]);

        $this->audit->write(
            $request,
            'feature_flags',
            'updated',
            "Updated feature flag {$existing->flag_key}.",
            'feature_flags',
            $flag,
            $existing,
            $validated,
        );

        return back()->with('success', 'Feature flag updated.');
    }

    public function toggle(Request $request, int $flag): RedirectResponse
    {
        $existing = DB::table('feature_flags')->where('id', $flag)->first();
        abort_unless($existing, 404);

        $validated = $request->validate([
            'is_enabled' => ['required', 'boolean'],
        ]);

        DB::table('feature_flags')->where('id', $flag)->update([
            'is_enabled' => $validated['is_enabled'],
            'updated_at' => now(),
        ]);

        $this->audit->write(
            $request,
            'feature_flags',
            'toggled',
            sprintf('%s feature flag %s.', $validated['is_enabled'] ? 'Enabled' : 'Disabled', $existing->flag_key),
            'feature_flags',
            $flag,
            ['is_enabled' => (bool) $existing->is_enabled],
            ['is_enabled' => $validated['is_enabled']],
        );

        return back();
    }

    public function destroy(Request $request, int $flag): RedirectResponse
    {
        $existing = DB::table('feature_flags')->where('id', $flag)->first();
        abort_unless($existing, 404);

        DB::table('feature_flags')->where('id', $flag)->delete();

        $this->audit->write(
            $request,
            'feature_flags',
            'deleted',
            "Deleted feature flag {$existing->flag_key}.",
            'feature_flags',
            $flag,
            $existing,
        );

        return back()->with('success', 'Feature flag deleted.');
    }
}
