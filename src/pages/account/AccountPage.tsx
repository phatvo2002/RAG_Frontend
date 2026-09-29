import React, { useEffect, useState } from 'react';
import { Header } from '@/components/header';
import { accountApi } from '@/api/account.api';
import type { AccountProfile, ProviderKeySettings } from '@/api/account.api';
import { useApp } from '@/context/AppContext';

const providers = [
  { id: 'gemini', name: 'Gemini', description: 'Dùng khóa Google AI Studio cho câu trả lời AI.' },
  { id: 'claude', name: 'Claude', description: 'Dùng khóa Anthropic hoặc gateway đã được quản trị viên cho phép.' },
] as const;

export const AccountPage: React.FC = () => {
  const { currentUser, setCurrentUser, setLanguage } = useApp();
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [keys, setKeys] = useState<ProviderKeySettings | null>(null);
  const [draftKeys, setDraftKeys] = useState<Record<string, string>>({});
  const [endpoints, setEndpoints] = useState<Record<string, string>>({ claude: 'official' });
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const reloadKeys = async () => setKeys(await accountApi.providerKeys());
  useEffect(() => {
    Promise.all([accountApi.profile(), accountApi.providerKeys()])
      .then(([person, saved]) => { setProfile(person); setKeys(saved); setError(saved.configurationError ?? ''); setEndpoints({ claude: saved.keys.find(k => k.provider === 'claude')?.endpointId ?? 'official' }); })
      .catch(() => setError('Không thể tải thông tin tài khoản.'));
  }, []);

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile) return;
    setBusy('profile'); setError(''); setNotice('');
    try {
      const updated = await accountApi.updateProfile(profile);
      setProfile(updated);
      setCurrentUser({ ...currentUser, name: updated.displayName, displayName: updated.displayName });
      setLanguage(updated.preferredLanguage === 'en' ? 'en' : 'vi');
      setNotice('Đã cập nhật thông tin cá nhân.');
    }
    catch { setError('Không thể lưu thông tin cá nhân.'); }
    finally { setBusy(null); }
  };

  const saveKey = async (provider: string) => {
    const apiKey = draftKeys[provider]?.trim();
    if (!apiKey) return;
    setBusy(provider); setError(''); setNotice('');
    try {
      await accountApi.saveProviderKey(provider, apiKey, endpoints[provider] ?? 'official');
      setDraftKeys(current => ({ ...current, [provider]: '' }));
      await reloadKeys();
      setNotice(`Đã lưu khóa ${provider === 'gemini' ? 'Gemini' : 'Claude'}.`);
    } catch { setError('Không thể lưu khóa API. Hãy kiểm tra khóa và điểm kết nối.'); }
    finally { setBusy(null); }
  };

  const deleteKey = async (provider: string) => {
    if (!window.confirm(`Xóa khóa ${provider === 'gemini' ? 'Gemini' : 'Claude'} của bạn?`)) return;
    setBusy(provider); setError(''); setNotice('');
    try { await accountApi.deleteProviderKey(provider); await reloadKeys(); setNotice('Đã xóa khóa API.'); }
    catch { setError('Không thể xóa khóa API.'); }
    finally { setBusy(null); }
  };

  return <>
    <Header />
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#080d17] px-5 py-8 md:px-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Thông tin cá nhân</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Quản lý hồ sơ và khóa API dùng cho Trợ lý AI của bạn.</p></div>
        {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{error}</div>}
        {notice && <div role="status" className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">{notice}</div>}
        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#101827]">
          <h2 className="mb-4 text-lg font-semibold">Hồ sơ của tôi</h2>
          {!profile ? <p className="text-sm text-slate-500">Đang tải...</p> :
            <form onSubmit={saveProfile} className="grid gap-4 md:grid-cols-2">
              <label className="text-sm">Email<input value={profile.email} readOnly className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 p-2.5 text-slate-500 dark:border-slate-700 dark:bg-slate-900" /></label>
              <label className="text-sm">Tên đăng nhập<input value={profile.userName} readOnly className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 p-2.5 text-slate-500 dark:border-slate-700 dark:bg-slate-900" /></label>
              <label className="text-sm">Tên hiển thị<input required maxLength={200} value={profile.displayName} onChange={e => setProfile({ ...profile, displayName: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent p-2.5 dark:border-slate-700" /></label>
              <label className="text-sm">Ngôn ngữ<select value={profile.preferredLanguage} onChange={e => setProfile({ ...profile, preferredLanguage: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-900"><option value="vi">Tiếng Việt</option><option value="en">English</option></select></label>
              <label className="text-sm">Múi giờ<input maxLength={50} value={profile.timeZone ?? ''} onChange={e => setProfile({ ...profile, timeZone: e.target.value })} placeholder="Asia/Ho_Chi_Minh" className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent p-2.5 dark:border-slate-700" /></label>
              <div className="flex items-end"><button disabled={busy === 'profile'} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Lưu thông tin</button></div>
            </form>}
        </section>
        <section className="space-y-4"><div><h2 className="text-lg font-semibold">Khóa API cho Trợ lý AI</h2><p className="text-sm text-slate-500 dark:text-slate-400">Mỗi nhà cung cấp có một khóa riêng. Khóa đã lưu sẽ không hiển thị lại.</p></div>
          {providers.map(provider => {
            const saved = keys?.keys.find(key => key.provider === provider.id);
            return <div key={provider.id} className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#101827]">
              <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-semibold">{provider.name}</h3><p className="text-sm text-slate-500 dark:text-slate-400">{provider.description}</p></div>
                <span className={`rounded-full px-3 py-1 text-xs ${saved ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>{saved ? `Đã lưu ${saved.maskedSuffix}` : 'Chưa cấu hình'}</span></div>
              {provider.id === 'claude' && <label className="mt-4 block text-sm">Điểm kết nối<select value={endpoints.claude} onChange={e => setEndpoints({ ...endpoints, claude: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-900">{(keys?.claudeEndpoints ?? [{ id: 'official', name: 'Claude (official)' }]).map(endpoint => <option key={endpoint.id} value={endpoint.id}>{endpoint.name}</option>)}</select></label>}
              <label className="mt-4 block text-sm">{saved ? 'Khóa API mới' : 'Khóa API'}<input type="password" autoComplete="off" value={draftKeys[provider.id] ?? ''} onChange={e => setDraftKeys({ ...draftKeys, [provider.id]: e.target.value })} placeholder="Dán khóa API của bạn" className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent p-2.5 dark:border-slate-700" /></label>
              <div className="mt-4 flex gap-3"><button type="button" onClick={() => saveKey(provider.id)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saved ? 'Thay khóa' : 'Lưu khóa'}</button>{saved && <button type="button"onClick={() => deleteKey(provider.id)} className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 dark:border-red-800 dark:text-red-400">Xóa khóa</button>}</div>
            </div>;
          })}
        </section>
      </div>
    </div>
  </>;
};
