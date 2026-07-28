export type SubscriptionAccessMode = 'full' | 'read_only' | 'blocked';

export type BillingInterval = 'monthly' | 'quarterly' | 'yearly' | 'custom';

export interface SubscriptionSummary {
    access_id: number;
    user_id: number;
    account_owner_id: number;
    product_id: number;
    product_user_type_id: number;
    product_code: string;
    product_name: string;
    role_code: string;
    role_name: string;
    membership_status: string;
    subscription_id: number | null;
    subscription_code: string | null;
    subscription_status: string | null;
    plan_id: number | null;
    plan_price_id: number | null;
    plan_code: string | null;
    plan_name: string | null;
    billing_interval: BillingInterval | null;
    subscription_type: string | null;
    catalog_price: number | null;
    charged_amount: number | null;
    currency: string | null;
    start_date: string | null;
    end_date: string | null;
    trial_ends_at: string | null;
    current_period_start: string | null;
    current_period_end: string | null;
    grace_ends_at: string | null;
    cancel_at_period_end: boolean;
    access_mode: SubscriptionAccessMode;
    is_owner: boolean;
    is_usable: boolean;
    can_write: boolean;
}

export interface PlanPrice {
    id: number;
    billing_interval: BillingInterval;
    price: number;
    compare_at_price: number | null;
    currency: string;
    duration_days: number;
    is_default: boolean;
}

export interface PlanFeature {
    code: string;
    name: string;
    description: string | null;
    limit_value: number | null;
}

export interface PlanRole {
    code: string;
    name: string;
    max_accounts: number | null;
}

export interface PlanLimit {
    value: number | null;
    is_unlimited: boolean;
    description: string | null;
}

export interface SubscriptionPlan {
    id: number;
    code: string;
    name: string;
    description: string | null;
    trial_days: number;
    sort_order: number;
    has_role_based_access: boolean;
    has_multi_branch: boolean;
    prices: PlanPrice[];
    features: PlanFeature[];
    roles: PlanRole[];
    limits: Record<string, PlanLimit>;
}

export interface SubscriptionOrder {
    id: number;
    order_code: string;
    plan_id: number;
    plan_price_id: number;
    billing_type: BillingInterval;
    order_type: string;
    amount: number;
    currency: string;
    status: 'pending' | 'payment_submitted';
    ordered_at: string | null;
}

export interface PaymentMethod {
    id: number;
    name: string;
    slug: string;
    account_name: string | null;
    account_number: string | null;
    instructions: string | null;
    image_path: string | null;
}
