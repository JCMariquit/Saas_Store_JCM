import { Head } from '@inertiajs/react';
import {
    ArrowRight,
    Bell,
    Check,
    ChevronRight,
    Download,
    ExternalLink,
    Heart,
    Loader2,
    Mail,
    Plus,
    Save,
    Search,
    Settings,
    ShieldCheck,
    Sparkles,
    Star,
    Trash2,
    Upload,
    Zap,
} from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const pageTitle = 'Buttons';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: pageTitle,
        href: '/components/buttons',
    },
];

function PreviewCard({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-xl border bg-card p-5 shadow-xs">
            <div className="mb-5">
                <h2 className="text-sm font-semibold">{title}</h2>
                {description && (
                    <p className="mt-1 text-xs text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-3">{children}</div>
        </section>
    );
}

export default function Buttons() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={pageTitle} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
                    <div className="relative p-6">
                        <div className="absolute right-6 top-6 hidden rounded-full bg-primary/10 p-3 text-primary md:block">
                            <Sparkles className="size-5" />
                        </div>

                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            Components
                        </p>

                        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                            Buttons
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                            A wide collection of reusable JCM button styles for
                            dashboards, forms, actions, cards, sidebars, and
                            premium interfaces.
                        </p>

                        <div className="mt-5 flex flex-wrap gap-3">
                            <Button variant="premium">
                                <Sparkles className="size-4" />
                                Premium Button
                            </Button>

                            <Button variant="outline">
                                Documentation
                                <ExternalLink className="size-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <PreviewCard title="Default UI Variants">
                    <Button>Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                    <Button variant="destructive">Destructive</Button>
                </PreviewCard>

                <PreviewCard title="Soft Variants">
                    <Button variant="soft">Soft</Button>
                    <Button variant="successSoft">Success Softs</Button>
                    <Button variant="warningSoft">Warning Soft</Button>
                    <Button variant="infoSoft">Info Soft</Button>
                    <Button variant="dangerSoft">Danger Soft</Button>
                    <Button variant="muted">Muted</Button>
                    <Button variant="selected">Selected</Button>
                </PreviewCard>

                <PreviewCard title="Solid Action Variants">
                    <Button variant="success">
                        <Check className="size-4" />
                        Success
                    </Button>

                    <Button variant="warning">
                        <Upload className="size-4" />
                        Warning
                    </Button>

                    <Button variant="info">
                        <Mail className="size-4" />
                        Info
                    </Button>

                    <Button variant="dark">Dark</Button>
                    <Button variant="black">Black</Button>
                    <Button variant="white">White</Button>
                </PreviewCard>

                <PreviewCard title="Premium / Modern Designs">
                    <Button variant="premium">
                        <Sparkles className="size-4" />
                        Premium
                    </Button>

                    <Button variant="gradient">
                        <Zap className="size-4" />
                        Gradient
                    </Button>

                    <Button variant="gradientBlue">Blue Gradient</Button>
                    <Button variant="gradientPurple">Purple Gradient</Button>
                    <Button variant="gradientGreen">Green Gradient</Button>
                    <Button variant="gradientOrange">Orange Gradient</Button>

                    <Button variant="glass">
                        <Sparkles className="size-4" />
                        Glass
                    </Button>

                    <Button variant="glassDark">Glass Dark</Button>
                </PreviewCard>

                <PreviewCard title="Neon Variants">
                    <Button variant="neon">
                        <Zap className="size-4" />
                        Neon
                    </Button>

                    <Button variant="neonBlue">Neon Blue</Button>
                    <Button variant="neonGreen">Neon Green</Button>
                </PreviewCard>

                <PreviewCard title="Enterprise / Corporate">
                    <Button variant="enterprise">
                        <ShieldCheck className="size-4" />
                        Enterprise
                    </Button>

                    <Button variant="corporate">Corporate</Button>
                    <Button variant="elevated">Elevated</Button>
                    <Button variant="surface">Surface</Button>
                    <Button variant="clean">Clean</Button>
                    <Button variant="minimal">Minimal</Button>
                </PreviewCard>

                <PreviewCard title="Border Styles">
                    <Button variant="outline">Outline</Button>
                    <Button variant="dashed">Dashed</Button>
                    <Button variant="dotted">Dotted</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="iconSoft">
                        <Star className="size-4" />
                        Icon Soft
                    </Button>
                </PreviewCard>

                <PreviewCard title="Sizes">
                    <Button size="xs">Extra Small</Button>
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                    <Button size="xl">Extra Large</Button>
                    <Button size="2xl">2XL Button</Button>
                </PreviewCard>

                <PreviewCard title="Radius Options">
                    <Button radius="none">None</Button>
                    <Button radius="sm">Small</Button>
                    <Button radius="md">Medium</Button>
                    <Button radius="lg">Large</Button>
                    <Button radius="xl">XL</Button>
                    <Button radius="2xl">2XL</Button>
                    <Button radius="full">Full</Button>
                </PreviewCard>

                <PreviewCard title="With Icons">
                    <Button>
                        <Plus className="size-4" />
                        Create
                    </Button>

                    <Button variant="secondary">
                        <Save className="size-4" />
                        Save
                    </Button>

                    <Button variant="outline">
                        <Upload className="size-4" />
                        Upload
                    </Button>

                    <Button variant="ghost">
                        <Download className="size-4" />
                        Download
                    </Button>

                    <Button variant="destructive">
                        <Trash2 className="size-4" />
                        Delete
                    </Button>

                    <Button variant="premium">
                        Continue
                        <ArrowRight className="size-4" />
                    </Button>
                </PreviewCard>

                <PreviewCard title="Icon Buttons">
                    <Button size="iconXs" variant="iconGhost" aria-label="Search">
                        <Search className="size-4" />
                    </Button>

                    <Button size="iconSm" variant="secondary" aria-label="Mail">
                        <Mail className="size-4" />
                    </Button>

                    <Button size="icon" variant="outline" aria-label="Bell">
                        <Bell className="size-4" />
                    </Button>

                    <Button size="iconMd" variant="iconSoft" aria-label="Heart">
                        <Heart className="size-4" />
                    </Button>

                    <Button size="iconLg" variant="premium" aria-label="Settings">
                        <Settings className="size-4" />
                    </Button>

                    <Button size="iconXl" variant="gradientBlue" aria-label="Sparkles">
                        <Sparkles className="size-5" />
                    </Button>
                </PreviewCard>

                <PreviewCard title="Loading / Disabled">
                    <Button disabled>
                        <Loader2 className="size-4 animate-spin" />
                        Saving...
                    </Button>

                    <Button disabled variant="secondary">
                        Loading
                    </Button>

                    <Button disabled variant="outline">
                        Disabled
                    </Button>

                    <Button disabled variant="premium">
                        Processing
                        <Loader2 className="size-4 animate-spin" />
                    </Button>
                </PreviewCard>

                <PreviewCard title="Sidebar Buttons">
                    <div className="w-full max-w-xs space-y-2 rounded-xl border bg-background p-3">
                        <Button variant="sidebarActive" className="w-full">
                            <Settings className="size-4" />
                            Active Menu
                        </Button>

                        <Button variant="sidebar" className="w-full">
                            <Bell className="size-4" />
                            Notifications
                        </Button>

                        <Button variant="sidebar" className="w-full">
                            <Mail className="size-4" />
                            Messages
                            <ChevronRight className="ml-auto size-4" />
                        </Button>
                    </div>
                </PreviewCard>

                <PreviewCard title="Tabs">
                    <Button variant="tabActive">Overview</Button>
                    <Button variant="tab">Analytics</Button>
                    <Button variant="tab">Reports</Button>
                    <Button variant="tab">Settings</Button>
                </PreviewCard>

                <PreviewCard title="Button Groups">
                    <div className="inline-flex overflow-hidden rounded-md border bg-background">
                        <Button variant="ghost" className="rounded-none border-r">
                            Day
                        </Button>
                        <Button variant="ghost" className="rounded-none border-r">
                            Week
                        </Button>
                        <Button variant="ghost" className="rounded-none">
                            Month
                        </Button>
                    </div>

                    <div className="inline-flex overflow-hidden rounded-md border bg-background">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-none border-r"
                        >
                            <Upload className="size-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-none border-r"
                        >
                            <Download className="size-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-none"
                        >
                            <Settings className="size-4" />
                        </Button>
                    </div>
                </PreviewCard>

                <PreviewCard title="Enterprise Actions">
                    <Button variant="success">
                        <Check className="size-4" />
                        Approve
                    </Button>

                    <Button variant="info">
                        <Mail className="size-4" />
                        Send Email
                    </Button>

                    <Button variant="warning">
                        <Upload className="size-4" />
                        Import
                    </Button>

                    <Button variant="outline">
                        Export
                        <Download className="size-4" />
                    </Button>

                    <Button variant="premium">
                        Continue
                        <ArrowRight className="size-4" />
                    </Button>
                </PreviewCard>
            </div>
        </AppLayout>
    );
}   