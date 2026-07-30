import { ReportExportButtons } from '@/components/reports/report-export-buttons';

type ReportFilterValue = string | number | null | undefined;

interface ProcurementReportExportButtonsProps {
    basePath: string;
    filters: object;
    recordCount: number;
    resourceLabel: string;
    className?: string;
}

export function ProcurementReportExportButtons({ basePath, filters, recordCount, resourceLabel, className }: ProcurementReportExportButtonsProps) {
    const parameters = new URLSearchParams();

    Object.entries(filters as Record<string, ReportFilterValue>).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '' || value === 0 || value === '0') {
            return;
        }

        parameters.set(key, String(value));
    });

    const query = parameters.toString();
    const suffix = query ? `?${query}` : '';

    return (
        <ReportExportButtons
            pdfUrl={`${basePath}/pdf${suffix}`}
            excelPreviewUrl={`${basePath}/excel-preview${suffix}`}
            recordCount={recordCount}
            resourceLabel={resourceLabel}
            className={className}
        />
    );
}
