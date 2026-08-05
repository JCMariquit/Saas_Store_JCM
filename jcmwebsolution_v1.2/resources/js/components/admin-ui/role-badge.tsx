type RoleBadgeProps = {
    role: 'super_admin' | 'admin' | 'user' | string;
};

const roleStyles: Record<string, { label: string; className: string }> = {
    super_admin: {
        label: 'Super Admin',
        className: 'border-violet-500/20 bg-violet-500/10 text-violet-400',
    },
    admin: {
        label: 'Administrator',
        className: 'border-primary/20 bg-primary/10 text-primary',
    },
    user: {
        label: 'Client',
        className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    },
};

export function RoleBadge({ role }: RoleBadgeProps) {
    const details = roleStyles[role] ?? {
        label: role.replaceAll('_', ' '),
        className: 'border-border bg-muted/35 text-muted-foreground',
    };

    return (
        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize ${details.className}`}>
            {details.label}
        </span>
    );
}
