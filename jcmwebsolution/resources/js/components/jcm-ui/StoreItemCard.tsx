import { ImageIcon } from 'lucide-react';
import type { StoreCardItem } from './types';

type StoreItemCardProps = {
    item: StoreCardItem;
    fallbackIcon?: React.ReactNode;
    onClick?: () => void;
};

export default function StoreItemCard({ item, fallbackIcon, onClick }: StoreItemCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="group overflow-hidden rounded-1xl border border-slate-200 bg-white text-left shadow-[0_14px_36px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_18px_44px_rgba(14,165,233,0.14)]"
        >
            <div className="relative h-[230px] overflow-hidden bg-gradient-to-br from-sky-50 to-blue-100">
                {item.imageUrl ? (
                    <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        {fallbackIcon ?? <ImageIcon className="h-10 w-10 text-slate-400" />}
                    </div>
                )}

                {item.badge && (
                    <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-slate-700 shadow-sm backdrop-blur">
                        {item.badge}
                    </div>
                )}
            </div>

            <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-sky-600">{item.label}</p>

                    <span className="text-xs font-bold text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-sky-600">
                        View →
                    </span>
                </div>

                <h3 className="mt-2 line-clamp-2 text-xl font-black leading-tight text-slate-950">
                    {item.name}
                </h3>
            </div>
        </button>
    );
}