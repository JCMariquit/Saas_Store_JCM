import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
            </div>

            <div className="ml-1 grid flex-1 text-left text-sm leading-tight">
                <span className="mb-0.5 truncate font-semibold">
                    JCM Web Solution
                </span>
                <span className="truncate text-xs text-slate-500">
                    Digital products & services
                </span>
            </div>
        </>
    );
}