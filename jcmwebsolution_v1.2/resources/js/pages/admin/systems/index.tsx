import { PageHero } from '@/components/admin-ui/page-hero';
import { SectionCard } from '@/components/admin-ui/section-card';
import { StatsCard } from '@/components/admin-ui/stats-card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Boxes, ExternalLink, KeyRound, Layers3, Plus, Users } from 'lucide-react';

type SystemRow = { id:number; product_code:string; name:string; description?:string|null; app_url?:string|null; status:string; plans_count:number; live_subscriptions:number; active_access:number };
type Props = { systems:SystemRow[]; stats:{systems:number; active_systems:number; accounts:number; live_subscriptions:number; provisioned:number} };
const breadcrumbs: BreadcrumbItem[] = [{ title:'Systems', href:'/admin/systems' }];
export default function SystemsIndex({ systems, stats }:Props) {
 return <AppLayout breadcrumbs={breadcrumbs}><Head title="Systems Overview" /><div className="space-y-5">
  <PageHero eyebrow="Enterprise Systems Control" title="Systems Overview" description="Manage every JCM application, provision customer environments, and control access from one flagship platform." />
  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
   <StatsCard title="Systems" value={stats.systems} icon={<Boxes className="size-5" />} />
   <StatsCard title="Active" value={stats.active_systems} icon={<Layers3 className="size-5" />} tone="emerald" />
   <StatsCard title="Account owners" value={stats.accounts} icon={<Users className="size-5" />} tone="indigo" />
   <StatsCard title="Live subscriptions" value={stats.live_subscriptions} icon={<KeyRound className="size-5" />} tone="amber" />
   <StatsCard title="Provisioned" value={stats.provisioned} icon={<Plus className="size-5" />} tone="rose" />
  </div>
  <SectionCard title="JCM System Catalog" description="Each system can have its own plans, modules, product roles, sidebar, policies, and application URL." actions={<div className="flex gap-2"><Button asChild variant="outline"><Link href="/admin/products">Manage catalog</Link></Button><Button asChild><Link href="/admin/systems/provision"><Plus className="size-4" />Provision account</Link></Button></div>}>
   <div className="grid gap-4 lg:grid-cols-2">
    {systems.map((system)=><article key={system.id} className="rounded-2xl border border-border/70 bg-background/35 p-4">
      <div className="flex items-start justify-between gap-3"><div><p className="text-[9px] font-semibold uppercase tracking-widest text-primary">{system.product_code}</p><h3 className="mt-1 text-base font-semibold">{system.name}</h3><p className="mt-2 text-xs leading-5 text-muted-foreground">{system.description || 'No system description.'}</p></div><span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-[9px] font-semibold uppercase text-primary">{system.status}</span></div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center"><div className="rounded-xl border border-border/60 p-2"><b className="block text-lg">{system.plans_count}</b><span className="text-[9px] text-muted-foreground">Plans</span></div><div className="rounded-xl border border-border/60 p-2"><b className="block text-lg">{system.live_subscriptions}</b><span className="text-[9px] text-muted-foreground">Subscriptions</span></div><div className="rounded-xl border border-border/60 p-2"><b className="block text-lg">{system.active_access}</b><span className="text-[9px] text-muted-foreground">Access</span></div></div>
      <div className="mt-4 flex flex-wrap gap-2"><Button size="sm" variant="outline" asChild><Link href={`/admin/modules?product_id=${system.id}`}>Modules</Link></Button><Button size="sm" variant="outline" asChild><Link href={`/admin/sidebar-controls?product_id=${system.id}`}>Sidebar</Link></Button>{system.app_url && <Button size="sm" variant="ghost" asChild><a href={system.app_url} target="_blank" rel="noreferrer"><ExternalLink className="size-3.5" />Open</a></Button>}</div>
    </article>)}
   </div>
  </SectionCard>
 </div></AppLayout>;
}
