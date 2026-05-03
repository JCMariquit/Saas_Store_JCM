import { Boxes } from 'lucide-react';
import SectionHeader from './SectionHeader';
import StoreItemCard from './StoreItemCard';
import type { StoreCardItem } from './types';

type StoreGridSectionProps = {
    id: string;
    eyebrow: string;
    title: string;
    description: string;
    items: StoreCardItem[];
    emptyTitle: string;
    emptyDescription: string;
    emptyIcon?: React.ReactNode;
    fallbackIcon?: React.ReactNode;
    onItemClick?: (item: StoreCardItem) => void;
};

export default function StoreGridSection({
    id,
    eyebrow,
    title,
    description,
    items,
    emptyTitle,
    emptyDescription,
    emptyIcon,
    fallbackIcon,
    onItemClick,
}: StoreGridSectionProps) {
    return (
        <section id={id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <SectionHeader eyebrow={eyebrow} title={title} description={description} />

            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {items.length > 0 ? (
                    items.map((item) => (
                        <StoreItemCard
                            key={item.id}
                            item={item}
                            fallbackIcon={fallbackIcon}
                            onClick={() => onItemClick?.(item)}
                        />
                    ))
                ) : (
                    <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                            {emptyIcon ?? <Boxes className="h-6 w-6 text-slate-500" />}
                        </div>

                        <h3 className="mt-4 text-lg font-black text-slate-950">{emptyTitle}</h3>
                        <p className="mt-2 text-sm text-slate-500">{emptyDescription}</p>
                    </div>
                )}
            </div>
        </section>
    );
}