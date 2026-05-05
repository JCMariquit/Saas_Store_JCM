import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type TableActionButtonsProps = {
    name: string;
    onEdit: () => void;
    onDelete: () => void;
};

export function TableActionButtons({
    name,
    onEdit,
    onDelete,
}: TableActionButtonsProps) {
    return (
        <div className="flex items-center justify-center gap-2">
            <Button
                type="button"
                variant="outline"
                className="h-10 rounded-xl border-blue-200 bg-white px-3 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                title={`Edit ${name}`}
                aria-label={`Edit ${name}`}
                onClick={onEdit}
            >
                <Pencil className="h-4 w-4" />
            </Button>

            <Button
                type="button"
                variant="outline"
                className="h-10 rounded-xl border-red-200 bg-white px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
                title={`Delete ${name}`}
                aria-label={`Delete ${name}`}
                onClick={onDelete}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}