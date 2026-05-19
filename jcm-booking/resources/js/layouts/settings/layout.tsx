import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';

import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { show } from '@/routes/two-factor';
import { edit as editPassword } from '@/routes/user-password';
import type { NavItem } from '@/types';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: edit(),
        icon: null,
    },
    {
        title: 'Password',
        href: editPassword(),
        icon: null,
    },
    {
        title: 'Two-Factor Auth',
        href: show(),
        icon: null,
    },
    {
        title: 'Appearance',
        href: editAppearance(),
        icon: null,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentUrl } = useCurrentUrl();

    if (typeof window === 'undefined') {
        return null;
    }

    return (
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <Heading
                title="Settings"
                description="Manage your profile and account settings"
            />

            <div className="flex w-full flex-col gap-8 lg:flex-row lg:items-start">
                <aside className="w-full shrink-0 lg:w-56">
                    <nav
                        className="flex flex-col gap-1"
                        aria-label="Settings"
                    >
                        {sidebarNavItems.map((item, index) => (
                            <Button
                                key={`${toUrl(item.href)}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn(
                                    'h-9 w-full justify-start rounded-lg px-3 text-sm font-medium',
                                    {
                                        'bg-muted text-foreground':
                                            isCurrentUrl(item.href),
                                        'text-muted-foreground hover:text-foreground':
                                            !isCurrentUrl(item.href),
                                    },
                                )}
                            >
                                <Link href={item.href}>
                                    {item.icon && (
                                        <item.icon className="mr-2 h-4 w-4" />
                                    )}
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="lg:hidden" />

                <main className="min-w-0 flex-1">
                    <section className="w-full space-y-12">
                        {children}
                    </section>
                </main>
            </div>
        </div>
    );
}