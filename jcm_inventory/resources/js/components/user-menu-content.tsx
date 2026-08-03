import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import type { User } from '@/types';
import type { SubscriptionSummary } from '@/types/subscription';
import { Link, usePage } from '@inertiajs/react';
import { Activity, CreditCard, Gauge, LogOut, ReceiptText, ScrollText, Settings } from 'lucide-react';
import type { ComponentType } from 'react';

interface UserMenuContentProps {
    user: User;
}

type SubscriptionMenuItem = {
    title: string;
    description: string;
    routeName: string;
    icon: ComponentType<{
        className?: string;
    }>;
};

const subscriptionPages: SubscriptionMenuItem[] = [
    {
        title: 'Subscription Overview',
        description: 'Current plan, renewal, and checkout',
        routeName: 'subscription.index',
        icon: CreditCard,
    },
    {
        title: 'Billing History',
        description: 'Orders, payments, and verification status',
        routeName: 'subscription.history',
        icon: ReceiptText,
    },
    {
        title: 'Invoices & Receipts',
        description: 'Verified payment records and receipts',
        routeName: 'subscription.invoices',
        icon: ScrollText,
    },
    {
        title: 'Usage & Limits',
        description: 'Branches, warehouses, and team utilization',
        routeName: 'subscription.usage',
        icon: Gauge,
    },
    {
        title: 'Subscription Activity',
        description: 'Renewals, plan changes, and billing events',
        routeName: 'subscription.activity',
        icon: Activity,
    },
];

function initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
        return 'U';
    }

    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts.at(-1)?.[0] ?? ''}`.toUpperCase();
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();

    const { subscription } = usePage().props as {
        subscription?: SubscriptionSummary | null;
    };

    const isOwner = subscription?.is_owner ?? true;

    const visibleSubscriptionPages = isOwner ? subscriptionPages : subscriptionPages.slice(0, 1);

    return (
        <div className="max-w-[calc(100vw-1.5rem)] min-w-[21rem]">
            <DropdownMenuLabel className="px-3 py-2.5 font-normal">
                <div className="flex min-w-0 items-center gap-2.5">
                    <span className="border-primary/15 bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold">
                        {initials(user.name)}
                    </span>

                    <div className="min-w-0 flex-1">
                        <p className="text-foreground truncate text-xs font-semibold">{user.name}</p>

                        <p className="text-muted-foreground mt-0.5 truncate text-[10px]">{user.email}</p>
                    </div>
                </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuLabel className="text-muted-foreground px-3 pt-1.5 pb-1 text-[9px] font-semibold tracking-[0.14em] uppercase">
                Subscription & Billing
            </DropdownMenuLabel>

            <DropdownMenuGroup className="space-y-0.5">
                {visibleSubscriptionPages.map((item) => {
                    const Icon = item.icon;

                    return (
                        <DropdownMenuItem key={item.routeName} asChild>
                            <Link
                                href={route(item.routeName, undefined, false)}
                                onClick={cleanup}
                                className="flex w-full min-w-0 items-center gap-2.5 rounded-lg px-2.5 py-2"
                            >
                                <div className="border-sidebar-border bg-sidebar-accent/40 text-sidebar-foreground/70 flex size-8 shrink-0 items-center justify-center rounded-lg border">
                                    <Icon className="size-4" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-semibold">{item.title}</p>

                                    <p className="text-muted-foreground truncate text-[10px]">{item.description}</p>
                                </div>
                            </Link>
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuLabel className="text-muted-foreground px-3 pt-1.5 pb-1 text-[9px] font-semibold tracking-[0.14em] uppercase">
                Account
            </DropdownMenuLabel>

            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        href={route('profile.edit')}
                        prefetch
                        onClick={cleanup}
                        className="flex w-full min-w-0 items-center gap-2.5 rounded-lg px-2.5 py-2"
                    >
                        <div className="border-sidebar-border bg-sidebar-accent/40 text-sidebar-foreground/70 flex size-8 shrink-0 items-center justify-center rounded-lg border">
                            <Settings className="size-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold">Account Settings</p>

                            <p className="text-muted-foreground truncate text-[10px]">Profile, password, and preferences</p>
                        </div>
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
                <Link
                    method="post"
                    href={route('logout')}
                    as="button"
                    onClick={cleanup}
                    className="flex w-full min-w-0 items-center gap-2.5 rounded-lg px-2.5 py-2 text-rose-400 focus:text-rose-300"
                >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-rose-500/15 bg-rose-500/10">
                        <LogOut className="size-4" />
                    </div>

                    <div className="min-w-0 flex-1 text-left">
                        <p className="truncate text-xs font-semibold">Log out</p>

                        <p className="truncate text-[10px] text-rose-300/60">End the current account session</p>
                    </div>
                </Link>
            </DropdownMenuItem>
        </div>
    );
}
