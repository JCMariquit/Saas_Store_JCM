import type {
    FormEventHandler,
    ReactNode,
} from 'react';

import { LoadingButton } from '@/components/shared/loading-button';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type FormDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;

    title: ReactNode;
    description?: ReactNode;
    children: ReactNode;

    onSubmit: FormEventHandler<HTMLFormElement>;

    processing?: boolean;
    submitText?: string;
    processingText?: string;
    cancelText?: string;

    maxWidth?: string;
    contentClassName?: string;
    bodyClassName?: string;
};

export function FormDialog({
    open,
    onOpenChange,
    title,
    description,
    children,
    onSubmit,
    processing = false,
    submitText = 'Save',
    processingText = 'Saving...',
    cancelText = 'Cancel',
    maxWidth = 'max-w-2xl',
    contentClassName,
    bodyClassName,
}: FormDialogProps) {
    function handleOpenChange(
        nextOpen: boolean,
    ): void {
        if (processing) {
            return;
        }

        onOpenChange(nextOpen);
    }

    return (
        <Dialog
            open={open}
            onOpenChange={handleOpenChange}
        >
            <DialogContent
                className={cn(
                    'max-h-[90vh] overflow-hidden p-0',
                    maxWidth,
                    contentClassName,
                )}
            >
                <DialogHeader className="border-b px-6 py-5 pr-12">
                    <DialogTitle>
                        {title}
                    </DialogTitle>

                    {description && (
                        <DialogDescription>
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>

                <form
                    onSubmit={onSubmit}
                    className="flex min-h-0 flex-col"
                >
                    <div
                        className={cn(
                            'max-h-[calc(90vh-145px)]',
                            'space-y-5 overflow-y-auto',
                            'px-6 py-5',
                            bodyClassName,
                        )}
                    >
                        {children}
                    </div>

                    <DialogFooter className="border-t bg-background px-6 py-4">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={processing}
                            onClick={() =>
                                handleOpenChange(false)
                            }
                        >
                            {cancelText}
                        </Button>

                        <LoadingButton
                            type="submit"
                            loading={processing}
                            loadingText={processingText}
                        >
                            {submitText}
                        </LoadingButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}