import type { ReactNode } from 'react';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type FormFieldProps = {
    id?: string;
    label: string;
    description?: string;
    error?: string;
    required?: boolean;
    children: ReactNode;
    className?: string;
};

export function FormField({
    id,
    label,
    description,
    error,
    required = false,
    children,
    className,
}: FormFieldProps) {
    return (
        <div
            className={cn(
                'space-y-2',
                className,
            )}
        >
            <Label htmlFor={id}>
                {label}

                {required && (
                    <span className="ml-1 text-destructive">
                        *
                    </span>
                )}
            </Label>

            {description && (
                <p className="text-xs text-muted-foreground">
                    {description}
                </p>
            )}

            {children}

            {error && (
                <p
                    role="alert"
                    className="text-xs text-destructive"
                >
                    {error}
                </p>
            )}
        </div>
    );
}