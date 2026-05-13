import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-[5px] text-foreground">
                <AppLogoIcon className="size-5 fill-current text-foreground" />
            </div>

            <div className="ml-2 grid flex-1 text-left text-sm">
                <span className="truncate leading-tight font-semibold text-foreground">
                    JCM Starter Kit
                </span>
            </div>
        </>
    );
}