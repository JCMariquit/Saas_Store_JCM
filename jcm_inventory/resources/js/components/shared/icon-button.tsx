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
    variant = 'outline',
    size = 'icon',
    ...props
}: IconButtonProps) {
    return (
        <TooltipProvider delayDuration={300}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        type={type}
                        variant={variant}
                        size={size}
                        aria-label={label}
                        className={cn(
                            'size-9',
                            className,
                        )}
                        {...props}
                    >
                        {children}
                    </Button>
                </TooltipTrigger>

                <TooltipContent>
                    <p>{label}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}