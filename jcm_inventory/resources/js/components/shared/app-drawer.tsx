import { X } from 'lucide-react';
import {
    type ReactNode,
    useEffect,
    useId,
} from 'react';

import { IconButton } from '@/components/shared/icon-button';
import { cn } from '@/lib/utils';

type AppDrawerProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: ReactNode;
    description?: ReactNode;
    children: ReactNode;
    processing?: boolean;
    widthClassName?: string;
    className?: string;
};

export function AppDrawer({
    open,
    onOpenChange,
    title,
    description,
    children,
    processing = false,
    widthClassName = 'max-w-xl',
    className,
}: AppDrawerProps) {
    const titleId = useId();
    const descriptionId = useId();

    useEffect(() => {
        if (!open) {
            return;
        }

        const previousOverflow =
            document.body.style.overflow;

        document.body.style.overflow = 'hidden';

        function handleKeyDown(
            event: KeyboardEvent,
        ): void {
            if (
                event.key === 'Escape' &&
                !processing
            ) {
                onOpenChange(false);
            }
        }

        window.addEventListener(
            'keydown',
            handleKeyDown,
        );

        return () => {
            document.body.style.overflow =
                previousOverflow;

            window.removeEventListener(
                'keydown',
                handleKeyDown,
            );
        };
    }, [open, processing, onOpenChange]);

    if (!open) {
        return null;
    }

    return (
        <div
            className={cn(
                'fixed inset-0 z-50 flex justify-end',
                'bg-black/60 backdrop-blur-sm',
                'animate-in fade-in-0 duration-200',
            )}
            onMouseDown={(event) => {
                if (
                    event.target === event.currentTarget &&
                    !processing
                ) {
                    onOpenChange(false);
                }
            }}
        >
            <aside
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={
                    description
                        ? descriptionId
                        : undefined
                }
                className={cn(
                    'flex h-full w-full flex-col',
                    'border-l border-border/70',
                    'bg-background shadow-2xl',
                    'animate-in slide-in-from-right',
                    'duration-300',
                    widthClassName,
                    className,
                )}
            >
                <header className="flex items-start justify-between gap-4 border-b border-border/60 px-5 py-4">
                    <div className="min-w-0">
                        <h2
                            id={titleId}
                            className="text-lg font-semibold tracking-tight"
                        >
                            {title}
                        </h2>

                        {description && (
                            <p
                                id={descriptionId}
                                className="mt-1 text-xs leading-5 text-muted-foreground"
                            >
                                {description}
                            </p>
                        )}
                    </div>

                    <IconButton
                        label="Close drawer"
                        onClick={() =>
                            onOpenChange(false)
                        }
                        disabled={processing}
                        className="shrink-0"
                    >
                        <X className="size-4" />
                    </IconButton>
                </header>

                <div className="min-h-0 flex-1 overflow-y-auto">
                    {children}
                </div>
            </aside>
        </div>
    );
}