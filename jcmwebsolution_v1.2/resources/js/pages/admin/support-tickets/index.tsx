import {
    FieldLabel,
    inputClassName,
    ModuleDrawer,
    ModuleEmpty,
    ModuleMetric,
    ModulePageHeader,
    ModuleStatus,
    selectClassName,
    textareaClassName,
} from '@/components/admin-ui/module-workspace';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    Clock3,
    LifeBuoy,
    MessageSquareReply,
    Plus,
    Search,
    Send,
    TicketCheck,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';

type Ticket = {
    id: number;
    ticket_code: string;
    user_id?: number | null;
    subject: string;
    category: string;
    priority: string;
    status: string;
    assigned_to?: number | null;
    last_reply_at?: string | null;
    closed_at?: string | null;
    created_at: string;
    user_name?: string | null;
    user_email?: string | null;
    assigned_to_name?: string | null;
};

type Reply = {
    id: number;
    ticket_id: number;
    user_id?: number | null;
    sender_type: string;
    message: string;
    is_internal: boolean;
    created_at: string;
    sender_name?: string | null;
    sender_email?: string | null;
};

type User = { id: number; name: string; email: string };

type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    prev_page_url?: string | null;
    next_page_url?: string | null;
};

type Props = {
    tickets: Paginated<Ticket>;
    selectedTicket?: Ticket | null;
    replies: Reply[];
    users: User[];
    admins: User[];
    filters: {
        search?: string;
        status?: string;
        priority?: string;
        ticket_id?: number | null;
    };
    stats: {
        open: number;
        waiting: number;
        urgent: number;
        resolved: number;
    };
};


type CreateTicketFormData = {
    user_id: string;
    subject: string;
    category: string;
    priority: string;
    message: string;
    assigned_to: string;
};

type ReplyFormData = {
    message: string;
    is_internal: boolean;
};

type TicketControlFormData = {
    status: string;
    priority: string;
    assigned_to: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Operations', href: '/admin/support-tickets' },
    { title: 'Support Tickets', href: '/admin/support-tickets' },
];

export default function SupportTickets({
    tickets,
    selectedTicket,
    replies,
    users,
    admins,
    filters,
    stats,
}: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [priority, setPriority] = useState(filters.priority ?? '');

    const createForm = useForm<CreateTicketFormData>({
        user_id: '',
        subject: '',
        category: 'general',
        priority: 'normal',
        message: '',
        assigned_to: '',
    });

    const replyForm = useForm<ReplyFormData>({
        message: '',
        is_internal: false,
    });

    const controlForm = useForm<TicketControlFormData>({
        status: selectedTicket?.status ?? 'open',
        priority: selectedTicket?.priority ?? 'normal',
        assigned_to: selectedTicket?.assigned_to
            ? String(selectedTicket.assigned_to)
            : '',
    });

    function applyFilters(event: FormEvent) {
        event.preventDefault();
        router.get(
            '/admin/support-tickets',
            { search, status, priority },
            { preserveState: true, replace: true },
        );
    }

    function openTicket(ticket: Ticket) {
        router.get(
            '/admin/support-tickets',
            {
                search,
                status,
                priority,
                ticket_id: ticket.id,
            },
            { preserveState: true, replace: true },
        );
    }

    function closeTicket() {
        router.get(
            '/admin/support-tickets',
            { search, status, priority },
            { preserveState: true, replace: true },
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Support Tickets" />

            <div className="space-y-5">
                <ModulePageHeader
                    eyebrow="Customer Operations"
                    title="Support Tickets"
                    description="Prioritize user concerns, assign responsible administrators, maintain replies, and control each ticket through resolution."
                    actions={
                        <Button
                            type="button"
                            onClick={() => setCreateOpen(true)}
                            className="rounded-xl"
                        >
                            <Plus className="size-4" />
                            New ticket
                        </Button>
                    }
                />

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <ModuleMetric
                        label="Open"
                        value={stats.open}
                        hint="Open and in progress"
                        icon={LifeBuoy}
                    />
                    <ModuleMetric
                        label="Waiting"
                        value={stats.waiting}
                        hint="Waiting for customer"
                        icon={Clock3}
                    />
                    <ModuleMetric
                        label="Urgent"
                        value={stats.urgent}
                        hint="Unresolved urgent tickets"
                        icon={AlertTriangle}
                    />
                    <ModuleMetric
                        label="Resolved"
                        value={stats.resolved}
                        hint="Resolved and closed"
                        icon={CheckCircle2}
                    />
                </div>

                <section className="border-border/70 bg-card overflow-hidden rounded-2xl border shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
                    <div className="border-border/70 flex flex-col gap-3 border-b px-4 py-4 xl:flex-row xl:items-center xl:justify-between">
                        <div>
                            <h2 className="text-foreground text-sm font-semibold">
                                Ticket queue
                            </h2>
                            <p className="text-muted-foreground mt-1 text-xs">
                                Urgent and high-priority tickets are shown first.
                            </p>
                        </div>

                        <form
                            onSubmit={applyFilters}
                            className="grid gap-2 sm:grid-cols-4"
                        >
                            <div className="relative sm:col-span-2">
                                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                                <input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Ticket, subject, or account..."
                                    className={`${inputClassName} pl-9`}
                                />
                            </div>
                            <select
                                value={status}
                                onChange={(event) =>
                                    setStatus(event.target.value)
                                }
                                className={selectClassName}
                            >
                                <option value="">All statuses</option>
                                <option value="open">Open</option>
                                <option value="in_progress">
                                    In progress
                                </option>
                                <option value="waiting_customer">
                                    Waiting customer
                                </option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </select>
                            <select
                                value={priority}
                                onChange={(event) =>
                                    setPriority(event.target.value)
                                }
                                className={selectClassName}
                            >
                                <option value="">All priorities</option>
                                <option value="urgent">Urgent</option>
                                <option value="high">High</option>
                                <option value="normal">Normal</option>
                                <option value="low">Low</option>
                            </select>
                            <Button
                                type="submit"
                                variant="outline"
                                className="sm:col-start-4"
                            >
                                Apply
                            </Button>
                        </form>
                    </div>

                    {tickets.data.length === 0 ? (
                        <ModuleEmpty
                            icon={TicketCheck}
                            title="No support tickets"
                            description="Create an admin ticket or wait for user support requests."
                        />
                    ) : (
                        <div className="divide-border/60 divide-y">
                            {tickets.data.map((ticket) => (
                                <button
                                    key={ticket.id}
                                    type="button"
                                    onClick={() => openTicket(ticket)}
                                    className="hover:bg-primary/[0.035] flex w-full flex-col gap-3 px-4 py-4 text-left lg:flex-row lg:items-center"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-primary font-mono text-[10px] font-semibold">
                                                {ticket.ticket_code}
                                            </span>
                                            <ModuleStatus
                                                value={ticket.status}
                                            />
                                            <span
                                                className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase ${
                                                    ticket.priority === 'urgent'
                                                        ? 'border-rose-500/25 bg-rose-500/10 text-rose-500'
                                                        : ticket.priority === 'high'
                                                          ? 'border-amber-500/25 bg-amber-500/10 text-amber-500'
                                                          : 'border-border text-muted-foreground'
                                                }`}
                                            >
                                                {ticket.priority}
                                            </span>
                                        </div>
                                        <h3 className="text-foreground mt-2 truncate text-sm font-semibold">
                                            {ticket.subject}
                                        </h3>
                                        <p className="text-muted-foreground mt-1 truncate text-xs">
                                            {ticket.user_name ??
                                                'Internal / no linked user'}
                                            {ticket.user_email
                                                ? ` · ${ticket.user_email}`
                                                : ''}
                                        </p>
                                    </div>

                                    <div className="text-muted-foreground shrink-0 text-xs lg:text-right">
                                        <p>
                                            {ticket.assigned_to_name
                                                ? `Assigned to ${ticket.assigned_to_name}`
                                                : 'Unassigned'}
                                        </p>
                                        <p className="mt-1 text-[10px]">
                                            {new Date(
                                                ticket.last_reply_at ??
                                                    ticket.created_at,
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="border-border/70 flex items-center justify-between border-t px-4 py-3">
                        <p className="text-muted-foreground text-xs">
                            Page {tickets.current_page} of{' '}
                            {tickets.last_page}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!tickets.prev_page_url}
                                onClick={() =>
                                    tickets.prev_page_url &&
                                    router.visit(tickets.prev_page_url)
                                }
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!tickets.next_page_url}
                                onClick={() =>
                                    tickets.next_page_url &&
                                    router.visit(tickets.next_page_url)
                                }
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </section>
            </div>

            <ModuleDrawer
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                title="Create support ticket"
                description="Open a tracked support issue and add the first admin message."
                footer={
                    <Button
                        type="button"
                        className="w-full rounded-xl"
                        disabled={createForm.processing}
                        onClick={() =>
                            createForm.post('/admin/support-tickets', {
                                onSuccess: () => {
                                    createForm.reset();
                                    setCreateOpen(false);
                                },
                            })
                        }
                    >
                        Create ticket
                    </Button>
                }
            >
                <div className="space-y-4">
                    <div>
                        <FieldLabel>Linked user (optional)</FieldLabel>
                        <select
                            value={createForm.data.user_id}
                            onChange={(event) =>
                                createForm.setData(
                                    'user_id',
                                    event.target.value,
                                )
                            }
                            className={selectClassName}
                        >
                            <option value="">Internal ticket</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name} — {user.email}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <FieldLabel>Subject</FieldLabel>
                        <input
                            value={createForm.data.subject}
                            onChange={(event) =>
                                createForm.setData(
                                    'subject',
                                    event.target.value,
                                )
                            }
                            className={inputClassName}
                            placeholder="Unable to access Inventory system"
                        />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <FieldLabel>Category</FieldLabel>
                            <select
                                value={createForm.data.category}
                                onChange={(event) =>
                                    createForm.setData(
                                        'category',
                                        event.target.value,
                                    )
                                }
                                className={selectClassName}
                            >
                                <option value="general">General</option>
                                <option value="account">Account</option>
                                <option value="billing">Billing</option>
                                <option value="technical">Technical</option>
                                <option value="feature_request">
                                    Feature request
                                </option>
                            </select>
                        </div>
                        <div>
                            <FieldLabel>Priority</FieldLabel>
                            <select
                                value={createForm.data.priority}
                                onChange={(event) =>
                                    createForm.setData(
                                        'priority',
                                        event.target.value,
                                    )
                                }
                                className={selectClassName}
                            >
                                <option value="low">Low</option>
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <FieldLabel>Assign to</FieldLabel>
                        <select
                            value={createForm.data.assigned_to}
                            onChange={(event) =>
                                createForm.setData(
                                    'assigned_to',
                                    event.target.value,
                                )
                            }
                            className={selectClassName}
                        >
                            <option value="">Current administrator</option>
                            {admins.map((admin) => (
                                <option key={admin.id} value={admin.id}>
                                    {admin.name} — {admin.email}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <FieldLabel>Initial message</FieldLabel>
                        <textarea
                            rows={7}
                            value={createForm.data.message}
                            onChange={(event) =>
                                createForm.setData(
                                    'message',
                                    event.target.value,
                                )
                            }
                            className={textareaClassName}
                        />
                    </div>
                </div>
            </ModuleDrawer>

            <ModuleDrawer
                open={selectedTicket !== null && selectedTicket !== undefined}
                onClose={closeTicket}
                title={selectedTicket?.ticket_code ?? 'Support ticket'}
                description={selectedTicket?.subject}
                widthClassName="max-w-3xl"
                footer={
                    selectedTicket && (
                        <div className="grid gap-2 sm:grid-cols-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-xl"
                                disabled={controlForm.processing}
                                onClick={() =>
                                    controlForm.put(
                                        `/admin/support-tickets/${selectedTicket.id}`,
                                    )
                                }
                            >
                                Save ticket controls
                            </Button>
                            <Button
                                type="button"
                                className="rounded-xl"
                                disabled={replyForm.processing}
                                onClick={() =>
                                    replyForm.post(
                                        `/admin/support-tickets/${selectedTicket.id}/reply`,
                                        {
                                            preserveScroll: true,
                                            onSuccess: () =>
                                                replyForm.reset(
                                                    'message',
                                                ),
                                        },
                                    )
                                }
                            >
                                <Send className="size-4" />
                                Add reply
                            </Button>
                        </div>
                    )
                }
            >
                {selectedTicket && (
                    <div className="space-y-5">
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                                <FieldLabel>Status</FieldLabel>
                                <select
                                    value={controlForm.data.status}
                                    onChange={(event) =>
                                        controlForm.setData(
                                            'status',
                                            event.target.value,
                                        )
                                    }
                                    className={selectClassName}
                                >
                                    <option value="open">Open</option>
                                    <option value="in_progress">
                                        In progress
                                    </option>
                                    <option value="waiting_customer">
                                        Waiting customer
                                    </option>
                                    <option value="resolved">
                                        Resolved
                                    </option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                            <div>
                                <FieldLabel>Priority</FieldLabel>
                                <select
                                    value={controlForm.data.priority}
                                    onChange={(event) =>
                                        controlForm.setData(
                                            'priority',
                                            event.target.value,
                                        )
                                    }
                                    className={selectClassName}
                                >
                                    <option value="low">Low</option>
                                    <option value="normal">Normal</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                            <div>
                                <FieldLabel>Assigned admin</FieldLabel>
                                <select
                                    value={controlForm.data.assigned_to}
                                    onChange={(event) =>
                                        controlForm.setData(
                                            'assigned_to',
                                            event.target.value,
                                        )
                                    }
                                    className={selectClassName}
                                >
                                    <option value="">Unassigned</option>
                                    {admins.map((admin) => (
                                        <option
                                            key={admin.id}
                                            value={admin.id}
                                        >
                                            {admin.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="border-border/70 bg-muted/20 rounded-xl border p-4 text-xs">
                            <div className="flex flex-wrap gap-x-6 gap-y-2">
                                <span>
                                    <b>Category:</b>{' '}
                                    {selectedTicket.category}
                                </span>
                                <span>
                                    <b>Account:</b>{' '}
                                    {selectedTicket.user_name ??
                                        'Internal ticket'}
                                </span>
                                <span>
                                    <b>Created:</b>{' '}
                                    {new Date(
                                        selectedTicket.created_at,
                                    ).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <section className="border-border/70 bg-card rounded-2xl border p-4">
                            <div className="flex items-center gap-2">
                                <MessageSquareReply className="text-primary size-4" />
                                <h3 className="text-foreground text-sm font-semibold">
                                    Conversation
                                </h3>
                            </div>

                            {replies.length === 0 ? (
                                <p className="text-muted-foreground py-10 text-center text-xs">
                                    No replies yet.
                                </p>
                            ) : (
                                <div className="mt-4 space-y-3">
                                    {replies.map((reply) => {
                                        const admin =
                                            reply.sender_type === 'admin';
                                        return (
                                            <div
                                                key={reply.id}
                                                className={`flex ${
                                                    admin
                                                        ? 'justify-end'
                                                        : 'justify-start'
                                                }`}
                                            >
                                                <div
                                                    className={`max-w-[86%] rounded-2xl px-4 py-3 text-sm ${
                                                        admin
                                                            ? 'bg-primary text-primary-foreground rounded-br-md'
                                                            : 'border-border/70 bg-background text-foreground rounded-bl-md border'
                                                    }`}
                                                >
                                                    {reply.is_internal && (
                                                        <p className="mb-2 text-[9px] font-semibold uppercase opacity-70">
                                                            Internal note
                                                        </p>
                                                    )}
                                                    <p className="whitespace-pre-wrap leading-6">
                                                        {reply.message}
                                                    </p>
                                                    <p
                                                        className={`mt-2 text-[10px] ${
                                                            admin
                                                                ? 'text-primary-foreground/70 text-right'
                                                                : 'text-muted-foreground'
                                                        }`}
                                                    >
                                                        {reply.sender_name ??
                                                            reply.sender_type}
                                                        {' · '}
                                                        {new Date(
                                                            reply.created_at,
                                                        ).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        <div>
                            <FieldLabel>Reply</FieldLabel>
                            <textarea
                                rows={6}
                                value={replyForm.data.message}
                                onChange={(event) =>
                                    replyForm.setData(
                                        'message',
                                        event.target.value,
                                    )
                                }
                                className={textareaClassName}
                                placeholder="Write an admin reply..."
                            />
                            <label className="text-muted-foreground mt-2 flex items-center gap-2 text-xs">
                                <input
                                    type="checkbox"
                                    checked={replyForm.data.is_internal}
                                    onChange={(event) =>
                                        replyForm.setData(
                                            'is_internal',
                                            event.target.checked,
                                        )
                                    }
                                    className="accent-primary"
                                />
                                Internal note — hidden from the customer
                            </label>
                        </div>
                    </div>
                )}
            </ModuleDrawer>
        </AppLayout>
    );
}
