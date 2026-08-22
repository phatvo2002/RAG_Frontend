import React from 'react';
import { FileText } from 'lucide-react';
import { Button, ButtonProps } from '@/components/button';

export interface WordExportProps extends Omit<ButtonProps, 'onClick'> {
  filename?: string;
  content?: string;
  onExport?: () => void;
  buttonText?: string;
}

export const WordExport: React.FC<WordExportProps> = ({
  filename = 'export_document.doc',
  content = '',
  onExport,
  buttonText = 'Xuất Word',
  ...props
}) => {
  const handleExport = () => {
    if (onExport) {
      onExport();
      return;
    }
    const header = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body>';
    const footer = '</body></html>';
    const sourceHTML = header + content + footer;
    const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      leftIcon={<FileText className="w-3.5 h-3.5 text-blue-600" />}
      onClick={handleExport}
      {...props}
    >
      {buttonText}
    </Button>
  );
};
export default WordExport;

