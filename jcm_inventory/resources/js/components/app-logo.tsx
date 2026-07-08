import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-10 shrink-0 items-center justify-center rounded-[12px] bg-primary/10 text-primary ring-1 ring-primary/15">
                <AppLogoIcon className="size-6 fill-current" />
            </div>

            <div className="min-w-0 flex-1 text-left leading-tight transition-all duration-200 group-data-[collapsible=icon]/sidebar:hidden">
                <span className="block truncate text-sm font-bold text-sidebar-foreground">
                    JCM Inventory
                </span>

                <span className="mt-0.5 block truncate text-[11px] font-medium text-sidebar-foreground/45">
                    Inventory Management
                </span>
            </div>
        </>
    );
}