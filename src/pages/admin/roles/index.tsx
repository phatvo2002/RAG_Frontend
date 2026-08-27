import React, { useState } from 'react';
import { Header } from '@/components/header';
import { useApp } from '@/context/AppContext';
import { useTranslation } from 'react-i18next';
import { useRolesQuery, useDeactivateRoleMutation, useReactivateRoleMutation, RoleItem } from '@/api/roles.api';
import { Shield, Plus, CheckCircle, Users, AlertCircle, RefreshCw, Lock, Unlock } from 'lucide-react';

export const RolesPage: React.FC = () => {
  const { showToast } = useApp();
  const { t } = useTranslation(['admin', 'common']);

  // TanStack Query for Roles
  const {
    data: roles = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useRolesQuery();

  const deactivateMutation = useDeactivateRoleMutation();
  const reactivateMutation = useReactivateRoleMutation();

  const handleToggleStatus = (role: RoleItem) => {
    const isInactive = role.status === 'Vô hiệu hóa';
    if (isInactive) {
      reactivateMutation.mutate(role.id, {
        onSuccess: () => {
          showToast(`Đã kích hoạt lại vai trò "${role.name || role.role}" thành công!`, 'success');
        },
        onError: (err: any) => {
          showToast(err.message || 'Không thể kích hoạt vai trò', 'error');
        },
      });
    } else {
      if (window.confirm(`Bạn có chắc chắn muốn vô hiệu hóa vai trò "${role.name || role.role}" không?`)) {
        deactivateMutation.mutate(role.id, {
          onSuccess: () => {
            showToast(`Đã vô hiệu hóa vai trò "${role.name || role.role}" thành công!`, 'info');
          },
          onError: (err: any) => {
            showToast(err.message || 'Không thể vô hiệu hóa vai trò', 'error');
          },
        });
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-black overflow-hidden transition-colors">
      <Header
        title={t('roles.title', { defaultValue: 'Vai trò & Phân quyền' })}
        subTitle={t('roles.subtitle', { defaultValue: 'Chính sách kiểm soát truy cập và phân quyền chi tiết cho các nhóm người dùng' })}
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 w-full">
        {/* Error Alert if query fails */}
        {isError && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>Không thể đồng bộ vai trò từ máy chủ: {(error as any)?.message || 'Đang sử dụng dữ liệu dự phòng'}.</span>
            </div>
            <button
              onClick={() => refetch()}
              className="px-2.5 py-1 bg-amber-200 dark:bg-amber-800 hover:bg-amber-300 dark:hover:bg-amber-700 rounded font-medium transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Thử lại</span>
            </button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
              {t('roles.listTitle', { defaultValue: 'Danh sách vai trò' })} ({roles.length})
            </h3>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
              {t('roles.subtitle', { defaultValue: 'Chính sách phân quyền và số lượng người dùng theo từng vai trò' })}
            </p>
          </div>

          <button
            onClick={() => showToast('Tính năng tạo vai trò mới đang được cập nhật', 'info')}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium flex items-center gap-1.5 shadow-2xs shadow-blue-500/20 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('roles.addRole', { defaultValue: 'Thêm vai trò' })}</span>
          </button>
        </div>

        {isLoading || isFetching ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 bg-white dark:bg-zinc-900 p-5 rounded-lg border border-slate-200 dark:border-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.map((r) => {
              const isInactive = r.status === 'Vô hiệu hóa';
              return (
                <div
                  key={r.id}
                  className={`bg-white dark:bg-zinc-900 p-5 rounded-lg border shadow-2xs space-y-4 hover:border-blue-300 dark:hover:border-zinc-700 transition-all ${
                    isInactive
                      ? 'border-slate-200/60 dark:border-zinc-800/60 opacity-75'
                      : 'border-slate-200 dark:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-8 h-8 rounded flex items-center justify-center ${
                      isInactive
                        ? 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                        : 'bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400'
                    }`}>
                      <Shield className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                      <Users className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                      <span>{t('roles.usersCount', { count: r.userCount, defaultValue: `${r.userCount} người dùng` })}</span>
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">{r.name || r.role}</h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{r.description || 'Chưa có mô tả chi tiết'}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                    {isInactive ? (
                      <span className="text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Vô hiệu hóa</span>
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Đang hoạt động</span>
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(r)}
                        className={`text-xs font-medium cursor-pointer ${
                          isInactive
                            ? 'text-emerald-600 dark:text-emerald-400 hover:underline'
                            : 'text-amber-600 dark:text-amber-400 hover:underline'
                        }`}
                      >
                        {isInactive ? 'Kích hoạt' : 'Khóa'}
                      </button>
                      <span className="text-slate-300 dark:text-zinc-700">|</span>
                      <button
                        onClick={() => showToast(`Cấu hình quyền hạn cho ${r.name || r.role}`, 'info')}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                      >
                        {t('roles.configure', { defaultValue: 'Cấu hình quyền' })}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
export default RolesPage;
