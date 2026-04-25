export type ProductItem = {
    id: number;
    name: string;
    description: string | null;
    pricing_type: string;
    status: string;
    starting_price: number | null;
    starting_price_label: string;
    image_url: string | null;
    thumbnail_url: string | null;
};

export type ServiceItem = {
    id: number;
    code: string;
    name: string;
    description: string | null;
    service_type: string;
    pricing_type: string;
    base_price: number | null;
    base_price_label: string;
    status: string;
};

export type StoreCardItem = {
    id: number;
    name: string;
    label: string;
    imageUrl?: string | null;
    badge?: string;
};