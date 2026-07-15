import {
    LoaderCircle,
} from 'lucide-react';

import {
    Button,
    type ButtonProps,
} from '@/components/ui/button';

type LoadingButtonProps = ButtonProps & {
    loading?: boolean;
    loadingText?: string;
};

export function LoadingButton({
    loading = false,
    loadingText,
    disabled,
    children,
    ...props
}: LoadingButtonProps) {
    return (
        <Button
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <LoaderCircle className="animate-spin" />
            )}

            {loading && loadingText
                ? loadingText
                : children}
        </Button>
    );
}