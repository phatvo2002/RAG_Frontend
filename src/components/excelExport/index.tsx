import React from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { Button, ButtonProps } from '@/components/button';

export interface ExcelExportProps extends Omit<ButtonProps, 'onClick'> {
  filename?: string;
  data?: any[];
  onExport?: () => void;
  buttonText?: string;
}

export const ExcelExport: React.FC<ExcelExportProps> = ({
  filename = 'export_data.xlsx',
  data,
  onExport,
  buttonText = 'Xuất Excel',
  ...props
}) => {
  const handleExport = () => {
    if (onExport) {
      onExport();
      return;
    }
    // Default CSV/Excel download trigger
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((obj) => Object.values(obj).join(',')).join('\n');
    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename.replace('.xlsx', '.csv');
    link.click();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}
      onClick={handleExport}
      {...props}
    >
      {buttonText}
    </Button>
  );
};
export default ExcelExport;

