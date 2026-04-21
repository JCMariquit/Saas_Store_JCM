type UserAvatarInitialsProps = {
    name: string;
};

export function UserAvatarInitials({ name }: UserAvatarInitialsProps) {
    const initials = name
        ?.split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-sm">
            {initials}
        </div>
    );
}