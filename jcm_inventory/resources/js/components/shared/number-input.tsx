import type { ComponentProps } from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type NumberInputProps = Omit<
    ComponentProps<typeof Input>,
    'type' | 'value' | 'onChange'
> & {
    value: string;
    onValueChange: (value: string) => void;
};

export function NumberInput({
    value,
    onValueChange,
    min = '0',
    step = '0.001',
    placeholder = '0',
    className,
    ...props
}: NumberInputProps) {
    return (
        <Input
            type="number"
            inputMode="decimal"
            value={value}
            min={min}
            step={step}
            placeholder={placeholder}
            onChange={(event) =>
                onValueChange(event.target.value)
            }
            className={cn(
                'tabular-nums',
                className,
            )}
            {...props}
        />
    );
}