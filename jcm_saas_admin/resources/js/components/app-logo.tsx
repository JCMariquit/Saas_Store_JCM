interface AppLogoProps {
    className?: string;
}

export default function AppLogo({ className = 'h-6 w-6' }: AppLogoProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            fill="none"
            className={className}
        >
            <rect x="8" y="8" width="32" height="32" rx="10" fill="currentColor" />
            <path
                d="M18 24C18 19.5817 21.5817 16 26 16H30V20H26C23.7909 20 22 21.7909 22 24V32H18V24Z"
                fill="white"
            />
            <path
                d="M24 28C24 25.7909 25.7909 24 28 24H31V28H29C28.4477 28 28 28.4477 28 29V32H24V28Z"
                fill="white"
            />
        </svg>
    );
}