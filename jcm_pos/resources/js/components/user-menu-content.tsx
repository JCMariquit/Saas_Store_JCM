import {
    CircleHelp,
    LogOut,
    Settings,
    User,
    WalletCards,
} from 'lucide-react';
import { router } from '@inertiajs/react';

import {
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

type UserMenuContentProps = {
    user?: {
        name?: string | null;
        email?: string | null;
    } | null;
};

export function UserMenuContent({ user }: UserMenuContentProps) {
    return (
        <>
            <div className="px-3 py-2">
                <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <User className="size-4" />
                    </div>

                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                            {user?.name ?? 'User'}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                            {user?.email ?? 'No email available'}
                        </p>
                    </div>
                </div>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem
                onClick={() => router.visit('/client/billing')}
                className="h-10 cursor-pointer rounded-xl"
            >
                <WalletCards className="mr-2 size-4" />
                Billing
            </DropdownMenuItem>

            <DropdownMenuItem
                onClick={() => router.visit('/settings/profile')}
                className="h-10 cursor-pointer rounded-xl"
            >
                <Settings className="mr-2 size-4" />
                Settings
            </DropdownMenuItem>

            <DropdownMenuItem
                onClick={() => {}}
                className="h-10 cursor-pointer rounded-xl"
            >
                <CircleHelp className="mr-2 size-4" />
                Help
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
                onClick={() => router.post('/logout')}
                className="h-10 cursor-pointer rounded-xl text-red-500 focus:text-red-500"
            >
                <LogOut className="mr-2 size-4" />
                Logout
            </DropdownMenuItem>
        </>
    );
}