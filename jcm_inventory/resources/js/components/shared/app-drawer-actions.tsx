import { LoadingButton } from '@/components/shared/loading-button';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type AppDrawerActionsProps = {
    processing?: boolean;
    onCancel: () => void;
    submitLabel?: string;
    processingLabel?: string;
    cancelLabel?: string;
    className?: string;
};

export function AppDrawerActions({
    processing = false,
    onCancel,
    submitLabel = 'Save',
    processingLabel = 'Saving...',
    cancelLabel = 'Cancel',
    className,
}: AppDrawerActionsProps) {
    return (
        <div
            className={cn(
                'sticky bottom-0 mt-auto',
                'flex justify-end gap-2',
                'border-t border-border/60',
                'bg-background/95 px-5 py-4',
                'backdrop-blur',
                className,
            )}
        >
            <Button
                type="button"
                variant="outline"
                disabled={processing}
                onClick={onCancel}
            >
                {cancelLabel}
            </Button>

            <LoadingButton
                type="submit"
                loading={processing}
                loadingText={processingLabel}
            >
                {submitLabel}
            </LoadingButton>
        </div>
    );
}