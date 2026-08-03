import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import type { SubscriptionSummary } from '@/types/subscription';
import { router, usePage } from '@inertiajs/react';
import { FileSpreadsheet, FileText, LockKeyhole } from 'lucide-react';
import { useState } from 'react';

interface ReportExportButtonsProps {
    pdfUrl: string;
    excelPreviewUrl: string;
    recordCount: number;
    resourceLabel: string;
    className?: string;
}

export function ReportExportButtons({ pdfUrl, excelPreviewUrl, recordCount, resourceLabel, className }: ReportExportButtonsProps) {
    const { subscription } = usePage().props as {
        subscription?: SubscriptionSummary | null;
    };

    const [lockedAction, setLockedAction] = useState<'pdf' | 'excel' | null>(null);

    const canExport = subscription?.access_mode === 'full';

    function openReport(format: 'pdf' | 'excel'): void {
        if (recordCount === 0) {
            return;
        }

        if (!canExport) {
            setLockedAction(format);
            return;
        }

        const reportWindow = window.open(format === 'pdf' ? pdfUrl : excelPreviewUrl, '_blank', 'noopener,noreferrer');

        if (reportWindow) {
            reportWindow.opener = null;
        }
    }

    return (
        <>
            <div className={className}>
                <Button
                    type="button"
                    variant="outline"
                    disabled={recordCount === 0}
                    title={!canExport ? 'Select to review subscription renewal options.' : undefined}
                    onClick={() => openReport('pdf')}
                    className="h-9 rounded-lg px-3 text-xs"
                >
                    {canExport ? <FileText className="size-3.5" /> : <LockKeyhole className="size-3.5" />}
                    PDF
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    disabled={recordCount === 0}
                    title={!canExport ? 'Select to review subscription renewal options.' : undefined}
                    onClick={() => openReport('excel')}
                    className="h-9 rounded-lg px-3 text-xs"
                >
                    {canExport ? <FileSpreadsheet className="size-3.5" /> : <LockKeyhole className="size-3.5" />}
                    Excel
                </Button>
            </div>

            <ConfirmDialog
                open={lockedAction !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setLockedAction(null);
                    }
                }}
                title="Subscription renewal required"
                description={
                    `Your JCM Inventory subscription is currently read-only. ` +
                    `Renew the owner plan to export ${resourceLabel} as ` +
                    `${lockedAction === 'pdf' ? 'PDF' : 'Excel'}.`
                }
                confirmText="View Subscription"
                processing={false}
                onConfirm={() => {
                    setLockedAction(null);

                    router.visit(route('subscription.index', undefined, false));
                }}
            />
        </>
    );
}
