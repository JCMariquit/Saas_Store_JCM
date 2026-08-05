import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type SearchInputProps = {
    id?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
};

export function SearchInput({
    id = 'search',
    value,
    onChange,
    placeholder = 'Search...',
}: SearchInputProps) {
    return (
        <div className="relative w-full sm:max-w-sm">
            <Label htmlFor={id} className="sr-only">
                Search
            </Label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
            <Input
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="h-11 rounded-xl border-border bg-card pl-10 shadow-sm transition focus:border-primary focus:ring-2 focus:ring-blue-500/20"
            />
        </div>
    );
}