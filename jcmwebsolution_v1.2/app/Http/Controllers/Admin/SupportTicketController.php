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

class SupportTicketController extends Controller
{
    public function __construct(private readonly PlatformAuditLogger $audit)
    {
    }

    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $status = trim((string) $request->string('status'));
        $priority = trim((string) $request->string('priority'));
        $selectedId = $request->integer('ticket_id');

        $tickets = DB::table('support_tickets')
            ->leftJoin('users as customers', 'customers.id', '=', 'support_tickets.user_id')
            ->leftJoin('users as assignees', 'assignees.id', '=', 'support_tickets.assigned_to')
            ->select([
                'support_tickets.id',
                'support_tickets.ticket_code',
                'support_tickets.user_id',
                'support_tickets.subject',
                'support_tickets.category',
                'support_tickets.priority',
                'support_tickets.status',
                'support_tickets.assigned_to',
                'support_tickets.last_reply_at',
                'support_tickets.closed_at',
                'support_tickets.created_at',
                'customers.name as user_name',
                'customers.email as user_email',
                'assignees.name as assigned_to_name',
            ])
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($nested) use ($search): void {
                    $nested->where('support_tickets.ticket_code', 'like', "%{$search}%")
                        ->orWhere('support_tickets.subject', 'like', "%{$search}%")
                        ->orWhere('customers.name', 'like', "%{$search}%")
                        ->orWhere('customers.email', 'like', "%{$search}%");
                });
            })
            ->when(in_array($status, ['open', 'in_progress', 'waiting_customer', 'resolved', 'closed'], true), fn ($query) => $query->where('support_tickets.status', $status))
            ->when(in_array($priority, ['low', 'normal', 'high', 'urgent'], true), fn ($query) => $query->where('support_tickets.priority', $priority))
            ->orderByRaw("FIELD(support_tickets.priority, 'urgent','high','normal','low')")
            ->orderByDesc(DB::raw('COALESCE(support_tickets.last_reply_at, support_tickets.created_at)'))
            ->paginate(25)
            ->withQueryString();

        $selectedTicket = null;
        $replies = collect();

        if ($selectedId > 0) {
            $selectedTicket = DB::table('support_tickets')
                ->leftJoin('users as customers', 'customers.id', '=', 'support_tickets.user_id')
                ->leftJoin('users as assignees', 'assignees.id', '=', 'support_tickets.assigned_to')
                ->select([
                    'support_tickets.*',
                    'customers.name as user_name',
                    'customers.email as user_email',
                    'assignees.name as assigned_to_name',
                ])
                ->where('support_tickets.id', $selectedId)
                ->first();

            if ($selectedTicket) {
                $replies = DB::table('support_ticket_replies')
                    ->leftJoin('users', 'users.id', '=', 'support_ticket_replies.user_id')
                    ->select([
                        'support_ticket_replies.id',
                        'support_ticket_replies.ticket_id',
                        'support_ticket_replies.user_id',
                        'support_ticket_replies.sender_type',
                        'support_ticket_replies.message',
                        'support_ticket_replies.is_internal',
                        'support_ticket_replies.created_at',
                        'users.name as sender_name',
                        'users.email as sender_email',
                    ])
                    ->where('support_ticket_replies.ticket_id', $selectedTicket->id)
                    ->orderBy('support_ticket_replies.id')
                    ->get();
            }
        }

        $users = DB::table('users')
            ->select('id', 'name', 'email')
            ->where('is_active', true)
            ->orderBy('name')
            ->limit(500)
            ->get();

        $admins = DB::table('users')
            ->join('user_platform_roles', 'user_platform_roles.user_id', '=', 'users.id')
            ->join('platform_roles', 'platform_roles.id', '=', 'user_platform_roles.platform_role_id')
            ->select('users.id', 'users.name', 'users.email')
            ->where('users.is_active', true)
            ->where('user_platform_roles.status', 'active')
            ->whereIn('platform_roles.role_code', ['admin', 'super_admin'])
            ->distinct()
            ->orderBy('users.name')
            ->get();

        return Inertia::render('admin/support-tickets/index', [
            'tickets' => $tickets,
            'selectedTicket' => $selectedTicket,
            'replies' => $replies,
            'users' => $users,
            'admins' => $admins,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'priority' => $priority,
                'ticket_id' => $selectedId ?: null,
            ],
            'stats' => [
                'open' => DB::table('support_tickets')->whereIn('status', ['open', 'in_progress'])->count(),
                'waiting' => DB::table('support_tickets')->where('status', 'waiting_customer')->count(),
                'urgent' => DB::table('support_tickets')->where('priority', 'urgent')->whereNotIn('status', ['resolved', 'closed'])->count(),
                'resolved' => DB::table('support_tickets')->whereIn('status', ['resolved', 'closed'])->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'subject' => ['required', 'string', 'max:180'],
            'category' => ['required', 'string', 'max:80'],
            'priority' => ['required', Rule::in(['low', 'normal', 'high', 'urgent'])],
            'message' => ['required', 'string', 'max:5000'],
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $ticketId = DB::transaction(function () use ($validated, $request): int {
            $ticketCode = $this->nextTicketCode();

            $id = DB::table('support_tickets')->insertGetId([
                'ticket_code' => $ticketCode,
                'user_id' => $validated['user_id'] ?: null,
                'subject' => $validated['subject'],
                'category' => $validated['category'],
                'priority' => $validated['priority'],
                'status' => 'open',
                'assigned_to' => $validated['assigned_to'] ?: $request->user()?->getKey(),
                'last_reply_at' => now(),
                'created_by' => $request->user()?->getKey(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('support_ticket_replies')->insert([
                'ticket_id' => $id,
                'user_id' => $request->user()?->getKey(),
                'sender_type' => 'admin',
                'message' => $validated['message'],
                'is_internal' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return $id;
        });

        $ticketCode = DB::table('support_tickets')->where('id', $ticketId)->value('ticket_code');

        $this->audit->write(
            $request,
            'support_tickets',
            'created',
            "Created support ticket {$ticketCode}.",
            'support_tickets',
            $ticketId,
            null,
            $validated,
        );

        return redirect()->route('admin.support-tickets.index', ['ticket_id' => $ticketId])
            ->with('success', 'Support ticket created.');
    }

    public function update(Request $request, int $ticket): RedirectResponse
    {
        $existing = DB::table('support_tickets')->where('id', $ticket)->first();
        abort_unless($existing, 404);

        $validated = $request->validate([
            'status' => ['required', Rule::in(['open', 'in_progress', 'waiting_customer', 'resolved', 'closed'])],
            'priority' => ['required', Rule::in(['low', 'normal', 'high', 'urgent'])],
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        DB::table('support_tickets')->where('id', $ticket)->update([
            'status' => $validated['status'],
            'priority' => $validated['priority'],
            'assigned_to' => $validated['assigned_to'] ?: null,
            'closed_at' => in_array($validated['status'], ['resolved', 'closed'], true) ? now() : null,
            'updated_at' => now(),
        ]);

        $this->audit->write(
            $request,
            'support_tickets',
            'updated',
            "Updated support ticket {$existing->ticket_code}.",
            'support_tickets',
            $ticket,
            $existing,
            $validated,
        );

        return back()->with('success', 'Ticket controls updated.');
    }

    public function reply(Request $request, int $ticket): RedirectResponse
    {
        $record = DB::table('support_tickets')->where('id', $ticket)->first();
        abort_unless($record, 404);

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:5000'],
            'is_internal' => ['required', 'boolean'],
        ]);

        DB::transaction(function () use ($request, $ticket, $validated, $record): void {
            DB::table('support_ticket_replies')->insert([
                'ticket_id' => $ticket,
                'user_id' => $request->user()?->getKey(),
                'sender_type' => 'admin',
                'message' => $validated['message'],
                'is_internal' => $validated['is_internal'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $newStatus = $record->status;
            if (! $validated['is_internal'] && in_array($record->status, ['open', 'waiting_customer'], true)) {
                $newStatus = 'in_progress';
            }

            DB::table('support_tickets')->where('id', $ticket)->update([
                'last_reply_at' => now(),
                'status' => $newStatus,
                'updated_at' => now(),
            ]);
        });

        $this->audit->write(
            $request,
            'support_tickets',
            'reply_added',
            "Added a reply to {$record->ticket_code}.",
            'support_tickets',
            $ticket,
            null,
            ['is_internal' => $validated['is_internal']],
        );

        return back()->with('success', 'Reply added.');
    }

    private function nextTicketCode(): string
    {
        $prefix = 'TKT-'.now()->format('Ym').'-';
        $latest = DB::table('support_tickets')
            ->where('ticket_code', 'like', $prefix.'%')
            ->orderByDesc('id')
            ->value('ticket_code');

        $sequence = 1;
        if ($latest && preg_match('/(\d+)$/', (string) $latest, $matches)) {
            $sequence = ((int) $matches[1]) + 1;
        }

        return $prefix.str_pad((string) $sequence, 5, '0', STR_PAD_LEFT);
    }
}
