<?php

namespace App\Http\Controllers\Staff\Manager;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ManagerInventoryReportController extends Controller
{
    private function managerBranch(): Branch
    {
        $branchId = auth()->user()->branch_id;

        abort_if(!$branchId, 403, 'No branch assigned to this manager.');

        return Branch::query()
            ->where('id', $branchId)
            ->where('is_active', true)
            ->firstOrFail(['id', 'tenant_id', 'name', 'code', 'is_main', 'is_active']);
    }

    public function index(Request $request)
    {
        $branch = $this->managerBranch();

        $tenantId = (int) $branch->tenant_id;
        $branchId = (int) $branch->id;

        $search = $request->input('search');
        $categoryId = $request->input('category_id');
        $stockStatus = $request->input('stock_status');
        $movementType = $request->input('movement_type');
        $dateFrom = $request->input('date_from') ?: now()->startOfMonth()->toDateString();
        $dateTo = $request->input('date_to') ?: now()->toDateString();

        $from = Carbon::parse($dateFrom)->startOfDay();
        $to = Carbon::parse($dateTo)->endOfDay();

        $productsBase = DB::connection('pos')
            ->table('products')
            ->leftJoin('categories', 'categories.id', '=', 'products.category_id')
            ->where('products.tenant_id', $tenantId)
            ->where('products.branch_id', $branchId)
            ->whereNull('products.deleted_at');

        if ($search) {
            $productsBase->where(function ($query) use ($search) {
                $query->where('products.name', 'like', "%{$search}%")
                    ->orWhere('products.sku', 'like', "%{$search}%")
                    ->orWhere('products.barcode', 'like', "%{$search}%");
            });
        }

        if ($categoryId) {
            $productsBase->where('products.category_id', $categoryId);
        }

        if ($stockStatus === 'in_stock') {
            $productsBase->whereColumn('products.quantity', '>', 'products.reorder_level');
        }

        if ($stockStatus === 'low_stock') {
            $productsBase->where('products.quantity', '>', 0)
                ->whereColumn('products.quantity', '<=', 'products.reorder_level');
        }

        if ($stockStatus === 'out_of_stock') {
            $productsBase->where('products.quantity', '<=', 0);
        }

        $summary = (clone $productsBase)
            ->selectRaw('COUNT(products.id) as total_products')
            ->selectRaw('COALESCE(SUM(products.quantity), 0) as total_quantity')
            ->selectRaw('COALESCE(SUM(products.quantity * products.cost_price), 0) as inventory_cost_value')
            ->selectRaw('COALESCE(SUM(products.quantity * products.selling_price), 0) as inventory_retail_value')
            ->selectRaw('COALESCE(SUM(CASE WHEN products.quantity <= 0 THEN 1 ELSE 0 END), 0) as out_of_stock')
            ->selectRaw('COALESCE(SUM(CASE WHEN products.quantity > 0 AND products.quantity <= products.reorder_level THEN 1 ELSE 0 END), 0) as low_stock')
            ->selectRaw('COALESCE(SUM(CASE WHEN products.quantity > products.reorder_level THEN 1 ELSE 0 END), 0) as in_stock')
            ->first();

        $movementSummary = DB::connection('pos')
            ->table('stock_movements')
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->whereBetween('movement_date', [$from, $to])
            ->when($movementType, fn ($query) => $query->where('movement_type', $movementType))
            ->selectRaw('COUNT(*) as total_movements')
            ->selectRaw('COALESCE(SUM(CASE WHEN movement_type = "stock_in" THEN quantity ELSE 0 END), 0) as stock_in_qty')
            ->selectRaw('COALESCE(SUM(CASE WHEN movement_type = "stock_out" THEN quantity ELSE 0 END), 0) as stock_out_qty')
            ->selectRaw('COALESCE(SUM(CASE WHEN movement_type = "adjustment" THEN quantity ELSE 0 END), 0) as adjustment_qty')
            ->selectRaw('COALESCE(SUM(total_cost), 0) as total_movement_value')
            ->first();

        $categoryBreakdown = (clone $productsBase)
            ->selectRaw('COALESCE(categories.name, "Uncategorized") as category_name')
            ->selectRaw('COUNT(products.id) as product_count')
            ->selectRaw('COALESCE(SUM(products.quantity), 0) as total_quantity')
            ->selectRaw('COALESCE(SUM(products.quantity * products.cost_price), 0) as cost_value')
            ->groupByRaw('COALESCE(categories.name, "Uncategorized")')
            ->orderByDesc('cost_value')
            ->limit(10)
            ->get();

        $lowStockProducts = (clone $productsBase)
            ->select([
                'products.id',
                'products.name',
                'products.sku',
                'products.quantity',
                'products.reorder_level',
                'products.cost_price',
                'products.selling_price',
                DB::raw('COALESCE(categories.name, "Uncategorized") as category_name'),
            ])
            ->where('products.quantity', '>', 0)
            ->whereColumn('products.quantity', '<=', 'products.reorder_level')
            ->orderBy('products.quantity')
            ->limit(10)
            ->get();

        $products = (clone $productsBase)
            ->select([
                'products.id',
                'products.name',
                'products.sku',
                'products.barcode',
                'products.unit',
                'products.quantity',
                'products.reorder_level',
                'products.max_stock_level',
                'products.cost_price',
                'products.selling_price',
                'products.status',
                DB::raw('COALESCE(categories.name, "Uncategorized") as category_name'),
            ])
            ->selectRaw('(products.quantity * products.cost_price) as cost_value')
            ->selectRaw('(products.quantity * products.selling_price) as retail_value')
            ->orderBy('products.name')
            ->paginate(10)
            ->withQueryString();

        $recentMovements = DB::connection('pos')
            ->table('stock_movements')
            ->leftJoin('products', 'products.id', '=', 'stock_movements.product_id')
            ->where('stock_movements.tenant_id', $tenantId)
            ->where('stock_movements.branch_id', $branchId)
            ->whereBetween('stock_movements.movement_date', [$from, $to])
            ->when($movementType, fn ($query) => $query->where('stock_movements.movement_type', $movementType))
            ->select([
                'stock_movements.id',
                'stock_movements.product_id',
                'stock_movements.movement_type',
                'stock_movements.quantity',
                'stock_movements.unit_cost',
                'stock_movements.total_cost',
                'stock_movements.quantity_before',
                'stock_movements.quantity_after',
                'stock_movements.reference_type',
                'stock_movements.reference_id',
                'stock_movements.remarks',
                'stock_movements.movement_date',
                DB::raw('COALESCE(products.name, "Deleted Product") as product_name'),
                'products.sku',
            ])
            ->orderByDesc('stock_movements.movement_date')
            ->limit(15)
            ->get();

        $categories = DB::connection('pos')
            ->table('categories')
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->whereNull('deleted_at')
            ->orderBy('name')
            ->get(['id', 'name']);

        $movementTypes = DB::connection('pos')
            ->table('stock_movements')
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->whereNotNull('movement_type')
            ->distinct()
            ->orderBy('movement_type')
            ->pluck('movement_type');

        return Inertia::render('staff/manager/reports/inventory/index', [
            'branch' => $branch,
            'summary' => [
                'total_products' => (int) ($summary->total_products ?? 0),
                'total_quantity' => (float) ($summary->total_quantity ?? 0),
                'inventory_cost_value' => (float) ($summary->inventory_cost_value ?? 0),
                'inventory_retail_value' => (float) ($summary->inventory_retail_value ?? 0),
                'potential_profit' => (float) ($summary->inventory_retail_value ?? 0) - (float) ($summary->inventory_cost_value ?? 0),
                'in_stock' => (int) ($summary->in_stock ?? 0),
                'low_stock' => (int) ($summary->low_stock ?? 0),
                'out_of_stock' => (int) ($summary->out_of_stock ?? 0),
                'total_movements' => (int) ($movementSummary->total_movements ?? 0),
                'stock_in_qty' => (float) ($movementSummary->stock_in_qty ?? 0),
                'stock_out_qty' => (float) ($movementSummary->stock_out_qty ?? 0),
                'adjustment_qty' => (float) ($movementSummary->adjustment_qty ?? 0),
                'total_movement_value' => (float) ($movementSummary->total_movement_value ?? 0),
            ],
            'products' => $products,
            'categoryBreakdown' => $categoryBreakdown,
            'lowStockProducts' => $lowStockProducts,
            'recentMovements' => $recentMovements,
            'categories' => $categories,
            'movementTypes' => $movementTypes,
            'filters' => [
                'search' => $search,
                'category_id' => $categoryId,
                'stock_status' => $stockStatus,
                'movement_type' => $movementType,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }
}