type ProductCardSkeletonProps = {
    title: string;
    description: string;
    price: string;
};

export default function ProductCardSkeleton({
    title,
    description,
    price,
}: ProductCardSkeletonProps) {
    return (
        <div className="group rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_18px_50px_rgba(58,95,145,0.10)] transition hover:-translate-y-1">
            <div className="mb-5 h-44 rounded-[24px] bg-gradient-to-br from-sky-100 via-blue-50 to-slate-100" />

            <div className="space-y-3">
                <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                    Coming from DB later
                </span>

                <h3 className="text-xl font-bold text-slate-900">{title}</h3>

                <p className="text-sm leading-7 text-slate-500">{description}</p>

                <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-extrabold text-blue-600">{price}</span>
                    <button
                        type="button"
                        className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                    >
                        View
                    </button>
                </div>
            </div>
        </div>
    );
}