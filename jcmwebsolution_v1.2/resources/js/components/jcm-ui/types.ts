export type ProductItem = {
    id: number;
    name: string;
    description?: string | null;
    pricing_type: 'plan' | 'custom' | string;
    thumbnail_url?: string | null;
    image_url?: string | null;
    starting_price_label?: string | null;
};

export type ServiceItem = {
    id: number;
    name: string;
    description?: string | null;
    service_type: 'custom' | 'maintenance' | 'support' | 'consulting' | 'implementation' | 'other' | string;
    pricing_type?: 'fixed' | 'quote' | string;
    thumbnail_url?: string | null;
    image_url?: string | null;
    base_price_label?: string | null;
};

export type StoreCardItem = {
    id: number;
    name: string;
    label?: string | null;
    imageUrl?: string | null;
    badge?: string | null;
};