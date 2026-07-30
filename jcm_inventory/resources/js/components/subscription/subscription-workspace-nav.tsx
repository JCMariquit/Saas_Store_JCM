import { Link } from '@inertiajs/react';
import {
    Activity,
    CreditCard,
    Gauge,
    ReceiptText,
    ScrollText,
} from 'lucide-react';

export type SubscriptionWorkspacePage =
    | 'overview'
    | 'history'
    | 'invoices'
    | 'usage'
    | 'activity';

interface SubscriptionWorkspaceNavProps {
    active: SubscriptionWorkspacePage;
    isOwner?: boolean;
}

const items: Array<{
    key: SubscriptionWorkspacePage;
    label: string;
    routeName: string;
    icon: typeof CreditCard;
    ownerOnly: boolean;
}> = [
    {
        key: 'overview',
        label: 'Plans & Overview',
        routeName: 'subscription.index',
        icon: CreditCard,
        ownerOnly: false,
    },
    {
        key: 'history',
        label: 'Billing History',
        routeName: 'subscription.history',
        icon: ReceiptText,
        ownerOnly: true,
    },
    {
        key: 'invoices',
        label: 'Invoices & Receipts',
        routeName: 'subscription.invoices',
        icon: ScrollText,
        ownerOnly: true,
    },
    {
        key: 'usage',
        label: 'Usage & Limits',
        routeName: 'subscription.usage',
        icon: Gauge,
        ownerOnly: true,
    },
    {
        key: 'activity',
        label: 'Activity',
        routeName: 'subscription.activity',
        icon: Activity,
        ownerOnly: true,
    },
];

export function SubscriptionWorkspaceNav({
    active,
    isOwner = true,
}: SubscriptionWorkspaceNavProps) {
    const visibleItems = items.filter(
        (item) =>
            !item.ownerOnly || isOwner,
    );

    return (
        <nav className="overflow-x-auto rounded-xl border border-border/70 bg-card p-1.5">
            <div className="flex min-w-max items-center gap-1">
                {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                        item.key === active;

                    return (
                        <Link
                            key={item.key}
                            href={route(
                                item.routeName,
                            )}
                            prefetch
                            className={[
                                'inline-flex h-9 items-center gap-2',
                                'rounded-lg px-3 text-xs font-semibold',
                                'transition-colors',
                                isActive
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                            ].join(' ')}
                        >
                            <Icon className="size-3.5" />
                            {item.label}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}