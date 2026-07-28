import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import type { SubscriptionSummary } from '@/types/subscription';
import { type User } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    CreditCard,
    LogOut,
    Settings,
    ShieldCheck,
} from 'lucide-react';

interface UserMenuContentProps {
    user: User;
}

function planLabel(
    subscription: SubscriptionSummary | null | undefined,
): string {
    if (!subscription?.plan_name) {
        return 'No plan';
    }

    return subscription.plan_name
        .replace(' Inventory', '')
        .trim();
}

function planBadgeClasses(
    subscription: SubscriptionSummary | null | undefined,
): string {
    if (!subscription || subscription.access_mode === 'blocked') {
        return 'border-rose-500/20 bg-rose-500/10 text-rose-300';
    }

    if (subscription.access_mode === 'read_only') {
        return 'border-amber-500/20 bg-amber-500/10 text-amber-300';
    }

    return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';
}

export function UserMenuContent({
    user,
}: UserMenuContentProps) {
    const cleanup = useMobileNavigation();

    const { subscription } = usePage().props as {
        subscription?: SubscriptionSummary | null;
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="m-1 rounded-xl border border-sidebar-border/70 bg-sidebar-accent/30 p-3">
                    <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/45">
                        <ShieldCheck className="size-3.5 text-primary" />
                        JCM Inventory
                    </div>

                    <UserInfo
                        user={user}
                        showEmail={true}
                    />
                </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup className="space-y-0.5">
                <DropdownMenuItem asChild>
                    <Link
                        href={route('subscription.index')}
                        prefetch
                        onClick={cleanup}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2"
                    >
                        <div className="flex size-7 items-center justify-center rounded-md border border-primary/15 bg-primary/10 text-primary">
                            <CreditCard className="size-3.5" />
                        </div>

                        <span className="flex-1 font-medium">
                            Subscription
                        </span>

                        <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${planBadgeClasses(
                                subscription,
                            )}`}
                        >
                            {planLabel(subscription)}
                        </span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link
                        href={route('profile.edit')}
                        prefetch
                        onClick={cleanup}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2"
                    >
                        <div className="flex size-7 items-center justify-center rounded-md border border-sidebar-border bg-sidebar-accent/50 text-sidebar-foreground/70">
                            <Settings className="size-3.5" />
                        </div>

                        <span className="font-medium">
                            Settings
                        </span>
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
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-rose-400 focus:text-rose-300"
                >
                    <div className="flex size-7 items-center justify-center rounded-md border border-rose-500/15 bg-rose-500/10">
                        <LogOut className="size-3.5" />
                    </div>

                    <span className="font-medium">
                        Log out
                    </span>
                </Link>
            </DropdownMenuItem>
        </>
    );
}