type RoleBadgeProps = {
    role: 'admin' | 'client' | string;
};

export function RoleBadge({ role }: RoleBadgeProps) {
    const isAdmin = role === 'admin';

    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                isAdmin
                    ? 'border border-indigo-200 bg-indigo-50 text-indigo-700'
                    : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
            }`}
        >
            {role}
        </span>
    );
}