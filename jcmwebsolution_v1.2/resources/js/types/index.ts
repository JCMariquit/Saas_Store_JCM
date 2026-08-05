import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
    isAdmin: boolean;
    platformRole: string | null;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface AdminSidebarItem {
    key: string;
    title: string;
    url: string;
    icon: string;
    badge?: string | null;
}

export interface AdminSidebarGroup {
    key: string;
    title: string;
    icon: string;
    collapsible: boolean;
    items: AdminSidebarItem[];
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    adminSidebar?: AdminSidebarGroup[];
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}
