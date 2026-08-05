import DeleteUser from '@/components/delete-user';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { AlertTriangle, Database, ShieldAlert, UserX } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Account removal',
        href: '/settings/account-removal',
    },
];

export default function AccountRemoval() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Account removal" />

            <SettingsLayout>
                <section className="via-card/70 to-card/40 overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/[0.055]">
                    <div className="border-border/60 flex flex-col gap-4 border-b px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3.5">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-red-500/25 bg-red-500/10 text-red-300">
                                <UserX className="size-5" />
                            </span>

                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold tracking-[0.13em] text-red-300 uppercase">Permanent action</p>
                                <h1 className="text-foreground mt-1 text-lg font-semibold tracking-tight">Account removal</h1>
                                <p className="text-muted-foreground mt-1 max-w-2xl text-xs leading-5">
                                    Remove access to your signed-in user account.
                                </p>
                            </div>
                        </div>

                        <Badge
                            variant="outline"
                            className="h-7 w-fit rounded-full border-red-500/20 bg-red-500/[0.07] px-2.5 text-[10px] font-semibold text-red-300"
                        >
                            <ShieldAlert className="mr-1.5 size-3.5" />
                            Cannot be undone
                        </Badge>
                    </div>

                    <div className="grid min-w-0 lg:grid-cols-[280px_minmax(0,1fr)]">
                        <aside className="border-border/60 bg-background/20 border-b p-5 lg:border-r lg:border-b-0">
                            <div className="flex items-start gap-3">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-300">
                                    <AlertTriangle className="size-4.5" />
                                </span>

                                <div className="min-w-0">
                                    <p className="text-foreground text-sm font-semibold">Before continuing</p>
                                    <p className="text-muted-foreground mt-1 text-[10px] leading-5">
                                        Confirm that you no longer need access to this account.
                                    </p>
                                </div>
                            </div>

                            <div className="border-border/60 mt-5 space-y-3 border-y py-4">
                                <RemovalFact icon={UserX} text="Your sign-in access will be permanently removed." />
                                <RemovalFact icon={ShieldAlert} text="You will be signed out immediately." />
                                <RemovalFact icon={Database} text="Required platform records may remain for audit integrity." />
                            </div>
                        </aside>

                        <div className="min-w-0 p-5 md:p-6">
                            <div className="mb-5">
                                <p className="text-foreground text-sm font-semibold">Confirm account removal</p>
                                <p className="text-muted-foreground mt-1 text-xs leading-5">
                                    Password confirmation is required before account removal.
                                </p>
                            </div>

                            <DeleteUser />
                        </div>
                    </div>
                </section>
            </SettingsLayout>
        </AppLayout>
    );
}

function RemovalFact({ icon: Icon, text }: { icon: typeof UserX; text: string }) {
    return (
        <div className="flex items-start gap-2.5">
            <Icon className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
            <p className="text-muted-foreground text-[10px] leading-5">{text}</p>
        </div>
    );
}
