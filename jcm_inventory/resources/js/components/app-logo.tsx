import { usePage } from '@inertiajs/react';
import {
    useEffect,
    useState,
} from 'react';

import type { SharedData } from '@/types';

import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    const { businessProfile } =
        usePage<SharedData>().props;

    const businessName =
        businessProfile.businessName.trim()
        || 'JCM Inventory';

    const preferredLogoUrl =
        businessProfile.squareLogoUrl
        || businessProfile.logoUrl;

    const [
        imageFailed,
        setImageFailed,
    ] = useState(false);

    useEffect(() => {
        setImageFailed(false);
    }, [preferredLogoUrl]);

    const showBusinessLogo =
        Boolean(preferredLogoUrl)
        && !imageFailed;

    const logoAltText =
        businessProfile.logoAltText?.trim()
        || `${businessName} logo`;

    return (
        <div className="group/logo flex min-w-0 items-center gap-3">
            <div
                className={[
                    'relative flex aspect-square size-10 shrink-0 items-center justify-center',
                    'overflow-hidden rounded-xl',
                    'border border-primary/15',
                    'bg-primary/[0.07]',
                    'text-primary',
                    'shadow-[0_0_22px_rgba(15,23,42,0.06)]',
                    'transition-all duration-200',
                    'group-hover/logo:border-primary/25',
                    'group-hover/logo:bg-primary/[0.10]',
                ].join(' ')}
            >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.12),transparent_42%)]" />

                {showBusinessLogo ? (
                    <img
                        src={
                            preferredLogoUrl
                            ?? undefined
                        }
                        alt={logoAltText}
                        className="relative max-h-full max-w-full object-contain p-1.5"
                        onError={() =>
                            setImageFailed(true)
                        }
                    />
                ) : (
                    <AppLogoIcon className="relative size-5.5 fill-current" />
                )}

                <span
                    aria-hidden="true"
                    className={[
                        'absolute right-1 top-1 size-2 rounded-full',
                        'border-2 border-sidebar',
                        'bg-emerald-400',
                        'shadow-[0_0_0_2px_rgba(52,211,153,0.10)]',
                    ].join(' ')}
                />
            </div>

            <div className="min-w-0 flex-1 text-left transition-all duration-200 group-data-[collapsible=icon]/sidebar:hidden">
                <div className="flex min-w-0 items-center gap-2">
                    <span
                        title={businessName}
                        className="truncate text-[13px] font-semibold tracking-tight text-sidebar-foreground"
                    >
                        {businessName}
                    </span>

                    <span
                        className={[
                            'hidden shrink-0 rounded-full',
                            'border border-primary/15',
                            'bg-primary/[0.07]',
                            'px-1.5 py-0.5',
                            'text-[7px] font-semibold uppercase tracking-[0.12em]',
                            'text-primary',
                            'xl:inline-flex',
                        ].join(' ')}
                    >
                        Inventory
                    </span>
                </div>

                <div className="mt-1 flex min-w-0 items-center gap-1.5">
                    <span className="size-1.5 shrink-0 rounded-full bg-emerald-400/80" />

                    <span className="truncate text-[9px] font-medium uppercase tracking-[0.11em] text-sidebar-foreground/40">
                        Inventory System
                    </span>
                </div>
            </div>
        </div>
    );
}