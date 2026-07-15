import type { ReactNode } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type BooleanFieldProps = {
    id: string;
    checked: boolean;

    onCheckedChange: (
        checked: boolean,
    ) => void;

    label: ReactNode;
    description?: ReactNode;
    error?: string;

    disabled?: boolean;
    className?: string;
};

export function BooleanField({
    id,
    checked,
    onCheckedChange,
    label,
    description,
    error,
    disabled = false,
    className,
}: BooleanFieldProps) {
    return (
        <div className="space-y-2">
            <div
                className={cn(
                    'flex items-start gap-3',
                    'rounded-lg border bg-muted/20 p-4',
                    error && 'border-destructive',
                    className,
                )}
            >
                <Checkbox
                    id={id}
                    checked={checked}
                    disabled={disabled}
                    onCheckedChange={(value) =>
                        onCheckedChange(
                            value === true,
                        )
                    }
                    className="mt-0.5"
                />

                <div className="min-w-0 space-y-1">
                    <Label
                        htmlFor={id}
                        className="cursor-pointer leading-5"
                    >
                        {label}
                    </Label>

                    {description && (
                        <p className="text-xs leading-5 text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
            </div>

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