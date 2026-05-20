import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        url: '/settings/profile',
        icon: null,
    },
    {
        title: 'Password',
        url: '/settings/password',
        icon: null,
    },
    {
        title: 'Appearance',
        url: '/settings/appearance',
        icon: null,
    },
];

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const currentPath = window.location.pathname;

    return (
        <div className="px-4 py-6">
            <div className="mb-8">
                <Heading
                    title="Settings"
                    description="Manage your profile and account settings"
                />
            </div>

            <div className="flex flex-col gap-8 lg:flex-row lg:gap-8">
                {/* Sidebar */}
                <aside className="w-full shrink-0 lg:w-[220px]">
                    <div className="rounded-[22px] border border-border/60 bg-card p-2 shadow-sm">
                        <nav className="flex flex-col gap-1">
                            {sidebarNavItems.map((item) => {
                                const isActive =
                                    currentPath === item.url;

                                return (
                                    <Button
                                        key={item.url}
                                        variant="ghost"
                                        asChild
                                        className={cn(
                                            'h-11 justify-start rounded-[14px] px-4 text-sm font-medium transition-all duration-200',
                                            'hover:bg-muted/70 hover:text-foreground',
                                            isActive
                                                ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary'
                                                : 'text-muted-foreground',
                                        )}
                                    >
                                        <Link href={item.url} prefetch>
                                            {item.title}
                                        </Link>
                                    </Button>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                <Separator className="lg:hidden" />

                {/* Content */}
                <div className="min-w-0 flex-1">
                    <section className="w-full max-w-none space-y-8">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}