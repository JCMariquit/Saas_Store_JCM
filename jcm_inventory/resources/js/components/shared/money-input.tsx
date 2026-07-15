import { CircleDollarSign } from 'lucide-react';
import type { ComponentProps } from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type MoneyInputProps = Omit<
    ComponentProps<typeof Input>,
    'type' | 'value' | 'onChange'
> & {
    value: string;
    onValueChange: (value: string) => void;
};

export function MoneyInput({
    value,
    onValueChange,
    className,
    placeholder = '0.00',
    min = '0',
    step = '0.01',
    ...props
}: MoneyInputProps) {
    return (
        <div className="group relative">
            <CircleDollarSign
                className={cn(
                    'pointer-events-none absolute',
                    'left-3 top-1/2 size-4',
                    '-translate-y-1/2',
                    'text-muted-foreground',
                    'transition-colors',
                    'group-focus-within:text-emerald-400',
                )}
            />

            <Input
                type="number"
                inputMode="decimal"
                min={min}
                step={step}
                value={value}
                onChange={(event) =>
                    onValueChange(event.target.value)
                }
                placeholder={placeholder}
                className={cn(
                    'pl-9 tabular-nums',
                    'focus-visible:border-emerald-500/40',
                    'focus-visible:ring-emerald-500/10',
                    className,
                )}
                {...props}
            />
        </div>
    );
}