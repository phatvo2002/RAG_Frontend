import React from 'react';
import { Link } from '@tanstack/react-router';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadCrumbItem {
  label: string;
  path?: string;
}

export interface BreadCrumbProps {
  items: BreadCrumbItem[];
  showHome?: boolean;
}

export const BreadCrumb: React.FC<BreadCrumbProps> = ({ items, showHome = true }) => {
  return (
    <nav className="nexora-breadcrumb flex items-center gap-1.5 text-xs text-slate-500 font-medium">
      {showHome && (
        <>
          <Link to="/chat" className="hover:text-slate-800 flex items-center gap-1 transition-colors">
            <Home className="w-3.5 h-3.5" />
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
        </>
      )}
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            {item.path && !isLast ? (
              <Link to={item.path as any} className="hover:text-slate-800 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'font-semibold text-slate-800' : ''}>{item.label}</span>
            )}
            {!isLast && <ChevronRight className="w-3 h-3 text-slate-400" />}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
export default BreadCrumb;
