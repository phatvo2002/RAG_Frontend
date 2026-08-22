import React from 'react';
import { APP_NAME } from '@/constants';

export const Footer: React.FC = () => {
  return (
    <footer className="py-3 px-6 bg-white border-t border-slate-200 text-center text-[11px] text-slate-400">
      <p>© {new Date().getFullYear()} {APP_NAME}. Bản quyền thuộc về doanh nghiệp.</p>
    </footer>
  );
};
export default Footer;

