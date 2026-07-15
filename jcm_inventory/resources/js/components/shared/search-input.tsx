import {
    Search,
    X,
} from 'lucide-react';
import type {
    ChangeEventHandler,
} from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type SearchInputProps = {
    value: string;
    onChange: ChangeEventHandler<HTMLInputElement>;
    onClear?: () => void;
    placeholder?: string;
    className?: string;
    name?: string;
};

export function SearchInput({
    value,
    onChange,
    onClear,
    placeholder = 'Search...',
    className,
    name = 'search',
}: SearchInputProps) {
    return (
        <div
            className={cn(
                'group relative min-w-0 flex-1',
                className,
            )}
        >
            <Search
                className={cn(
                    'pointer-events-none absolute',
                    'left-3 top-1/2 size-4',
                    '-translate-y-1/2',
                    'text-muted-foreground',
                    'transition-colors',
                    'group-focus-within:text-primary',
                )}
            />

            <Input
                type="search"
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={cn(
                    'h-11 rounded-lg',
                    'border-border/70 bg-background/70',
                    'pl-9 shadow-none',
                    'focus-visible:border-primary/40',
                    'focus-visible:ring-4',
                    'focus-visible:ring-primary/10',
                    'focus-visible:ring-offset-0',
                    value && onClear
                        ? 'pr-10'
                        : 'pr-3',
                )}
            />

            {value && onClear && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={onClear}
                    aria-label="Clear search"
                    className={cn(
                        'absolute right-1.5 top-1/2',
                        'size-8 -translate-y-1/2',
                        'rounded-md text-muted-foreground',
                        'hover:text-foreground',
                    )}
                >
                    <X className="size-4" />
                </Button>
            )}
        </div>
    );
}