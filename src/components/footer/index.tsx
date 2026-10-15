import React from 'react';
import { APP_NAME } from '@/constants';
import { useTranslation } from 'react-i18next';

export const Footer: React.FC = () => {
  const { i18n } = useTranslation();
  return (
    <footer className="py-3 px-6 bg-white border-t border-slate-200 text-center text-[11px] text-slate-400">
      <p>© {new Date().getFullYear()} {APP_NAME}. {i18n.language.startsWith('vi') ? 'Bản quyền thuộc về doanh nghiệp.' : 'All rights reserved.'}</p>
    </footer>
  );
};
export default Footer;

