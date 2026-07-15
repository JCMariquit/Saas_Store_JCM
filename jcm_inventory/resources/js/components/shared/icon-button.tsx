import type {
    ComponentProps,
    ReactNode,
} from 'react';

import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type IconButtonProps =
    ComponentProps<typeof Button> & {
        label: string;
        children: ReactNode;
    };

export function IconButton({
    label,
    children,
    className,
    type = 'button',
    variant = 'ghost',
    size = 'icon',
    ...props
}: IconButtonProps) {
    return (
        <TooltipProvider delayDuration={250}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        type={type}
                        variant={variant}
                        size={size}
                        aria-label={label}
                        className={cn(
                            'size-8 rounded-lg',
                            'border border-transparent',
                            'text-muted-foreground',
                            'transition-all duration-150',
                            'hover:border-border/70',
                            'hover:bg-muted/70',
                            'hover:text-foreground',
                            className,
                        )}
                        {...props}
                    >
                        {children}
                    </Button>
                </TooltipTrigger>

                <TooltipContent sideOffset={6}>
                    <p>{label}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}