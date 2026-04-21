type DrawerFieldProps = {
    label: string;
    value: string | number | null;
};

export function DrawerField({ label, value }: DrawerFieldProps) {
    return (
        <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {label}
            </p>
            <p className="mt-1 text-sm text-slate-900">
                {value ?? '-'}
            </p>
        </div>
    );
}