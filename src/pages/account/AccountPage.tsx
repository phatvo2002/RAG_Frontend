import React, { useEffect, useState } from 'react';
import { Header } from '@/components/header';
import { ConfirmModal } from '@/components/disclosure';
import { accountApi } from '@/api/account.api';
import type { AccountProfile, ProviderKeySettings } from '@/api/account.api';
import { useApp } from '@/context/AppContext';
import { Check, KeyRound, Mail, Save, UserRound } from 'lucide-react';

const providers = [
  { id: 'gemini', name: 'Gemini', descriptionEn: 'Use a Google AI Studio key for AI responses.', descriptionVi: 'Dùng khóa Google AI Studio cho câu trả lời AI.' },
  { id: 'claude', name: 'Claude', descriptionEn: 'Use an Anthropic key or an administrator-approved gateway.', descriptionVi: 'Dùng khóa Anthropic hoặc gateway đã được quản trị viên cho phép.' },
] as const;

export const AccountPage: React.FC = () => {
  const { currentUser, setCurrentUser, setLanguage, language, showToast } = useApp();
  const tr = (en: string, vi: string) => language === 'vi' ? vi : en;
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [keys, setKeys] = useState<ProviderKeySettings | null>(null);
  const [draftKeys, setDraftKeys] = useState<Record<string, string>>({});
  const [endpoints, setEndpoints] = useState<Record<string, string>>({ claude: 'official' });
  const [busy, setBusy] = useState<string | null>(null);
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [activeSection, setActiveSection] = useState<'profile' | 'keys'>('profile');

  const reloadKeys = async () => setKeys(await accountApi.providerKeys());
  useEffect(() => {
    Promise.all([accountApi.profile(), accountApi.providerKeys()])
      .then(([person, saved]) => { setProfile(person); setKeys(saved); setError(saved.configurationError ?? ''); setEndpoints({ claude: saved.keys.find(k => k.provider === 'claude')?.endpointId ?? 'official' }); })
      .catch(() => setError(tr('Could not load account information.', 'Không thể tải thông tin tài khoản.')));
  }, []);

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile) return;
    setBusy('profile'); setError(''); setNotice('');
    try {
      const updated = await accountApi.updateProfile(profile);
      setProfile(updated);
      setCurrentUser({ ...currentUser, name: updated.displayName, displayName: updated.displayName });
      setLanguage(updated.preferredLanguage === 'vi' ? 'vi' : 'en');
      setNotice(tr('Profile updated.', 'Đã cập nhật thông tin cá nhân.'));
    }
    catch { setError(tr('Could not save profile.', 'Không thể lưu thông tin cá nhân.')); }
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
      setNotice(tr(`${provider === 'gemini' ? 'Gemini' : 'Claude'} key saved.`, `Đã lưu khóa ${provider === 'gemini' ? 'Gemini' : 'Claude'}.`));
    } catch { setError(tr('Could not save API key. Check the key and endpoint.', 'Không thể lưu khóa API. Hãy kiểm tra khóa và điểm kết nối.')); }
    finally { setBusy(null); }
  };

  const deleteKey = async () => {
    const provider = keyToDelete;
    if (!provider || busy) return;
    setBusy(provider); setError(''); setNotice('');
    try { await accountApi.deleteProviderKey(provider); await reloadKeys(); showToast(tr('API key deleted.', 'Đã xóa khóa API.'), 'success'); }
    catch (err) { showToast(err instanceof Error ? err.message : tr('Could not delete API key.', 'Không thể xóa khóa API.'), 'error'); }
    finally { setBusy(null); setKeyToDelete(null); }
  };

  const displayName = profile?.displayName || currentUser.displayName || currentUser.name || profile?.userName || '';
  const scrollToSection = (section: 'profile' | 'keys') => {
    setActiveSection(section);
    document.getElementById(section === 'profile' ? 'account-profile' : 'account-api-keys')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const inputClass = 'mt-1 h-10 w-full rounded-md border border-[#d6dfed] bg-white px-3 text-sm text-[#253856] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-blue-900/40';

  return <>
    <Header />
    <div className="flex-1 overflow-y-auto bg-[#f5f8fc] px-4 py-6 text-[#1d2d4c] transition-colors dark:bg-[#080d17] dark:text-slate-100 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-[#152747] dark:text-white">{tr('Personal information', 'Thông tin cá nhân')}</h1>
          <p className="mt-1 text-sm text-[#7183a2] dark:text-slate-400">{tr('Manage your profile and AI assistant API keys.', 'Quản lý hồ sơ và khóa API dùng cho Trợ lý AI của bạn.')}</p>
        </header>

        <nav aria-label={tr('Account sections', 'Các mục quản lý tài khoản')} className="flex items-center gap-8 border-b border-[#d9e2ef] text-sm">
          <button type="button" onClick={() => scrollToSection('profile')} className={`relative flex items-center gap-2 pb-3 pt-1 font-medium transition-colors ${activeSection === 'profile' ? 'text-blue-600 dark:text-blue-400' : 'text-[#647795] hover:text-[#1d2d4c] dark:text-slate-400'}`}>
            <UserRound className="h-4 w-4" /> {tr('Profile', 'Hồ sơ')}
            {activeSection === 'profile' && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-blue-600" />}
          </button>
          <button type="button" onClick={() => scrollToSection('keys')} className={`relative flex items-center gap-2 pb-3 pt-1 font-medium transition-colors ${activeSection === 'keys' ? 'text-blue-600 dark:text-blue-400' : 'text-[#647795] hover:text-[#1d2d4c] dark:text-slate-400'}`}>
            <KeyRound className="h-4 w-4" /> {tr('API keys', 'Khóa API')}
            {activeSection === 'keys' && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-blue-600" />}
          </button>
        </nav>

        {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{error}</div>}
        {notice && <div role="status" className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">{notice}</div>}

        <section id="account-profile" className="scroll-mt-6 overflow-hidden rounded-lg border border-[#e0e7f1] bg-white shadow-[0_1px_2px_rgba(20,40,80,0.03)] dark:border-slate-800 dark:bg-[#101827]">
          <div className="grid min-w-0 md:grid-cols-[minmax(0,37fr)_minmax(0,63fr)]">
            <div className="min-w-0 border-b border-[#e3eaf4] bg-[#f3f7fc] px-5 py-5 dark:border-slate-800 dark:bg-[#111d30] sm:px-6 md:border-b-0 md:border-r">
              <h2 className="text-lg font-semibold text-[#172a4c] dark:text-slate-100">{tr('Account information', 'Thông tin tài khoản')}</h2>
              <p className="mt-0.5 text-xs text-[#7b8ca8] dark:text-slate-400">{tr('Basic information about your account.', 'Thông tin cơ bản về tài khoản của bạn.')}</p>
              {!profile ? <div className="mt-5 h-20 animate-pulse rounded-lg bg-slate-200/70 dark:bg-slate-800" /> : <>
                <div className="mt-4 flex items-center gap-4 border-b border-[#e1e8f2] pb-4 dark:border-slate-700">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#d9e8ff] text-blue-600 dark:bg-blue-950 dark:text-blue-300"><UserRound className="h-8 w-8 fill-current" strokeWidth={1.5} /></div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#182a49] dark:text-slate-100">{displayName}</p>
                    <p className="mt-1 truncate text-xs text-[#7486a3] dark:text-slate-400">{profile.email}</p>
                  </div>
                </div>
                <div className="space-y-4 pt-4 text-xs">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 shrink-0 text-[#273b5c] dark:text-slate-300" />
                    <div className="min-w-0 flex-1"><p className="font-medium text-[#253856] dark:text-slate-200">Email</p><p className="mt-0.5 truncate text-[#7b8ca8] dark:text-slate-400">{profile.email}</p></div>
                    <span className="shrink-0 rounded-full bg-[#e9eef5] px-3 py-1 text-[10px] text-[#72819a] dark:bg-slate-800 dark:text-slate-400">{tr('Cannot be changed', 'Không thể thay đổi')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <UserRound className="h-4 w-4 shrink-0 text-[#273b5c] dark:text-slate-300" />
                    <div className="min-w-0 flex-1"><p className="font-medium text-[#253856] dark:text-slate-200">{tr('Username', 'Tên đăng nhập')}</p><p className="mt-0.5 truncate text-[#7b8ca8] dark:text-slate-400">{profile.userName}</p></div>
                    <span className="shrink-0 rounded-full bg-[#e9eef5] px-3 py-1 text-[10px] text-[#72819a] dark:bg-slate-800 dark:text-slate-400">{tr('Cannot be changed', 'Không thể thay đổi')}</span>
                  </div>
                </div>
              </>}
            </div>

            <div className="min-w-0 px-5 py-5 sm:px-6">
              <h2 className="text-lg font-semibold text-[#172a4c] dark:text-slate-100">{tr('Profile settings', 'Tùy chỉnh hồ sơ')}</h2>
              <p className="mt-0.5 text-xs text-[#7b8ca8] dark:text-slate-400">{tr('Update your display information and personal preferences.', 'Cập nhật thông tin hiển thị và tùy chọn cá nhân của bạn.')}</p>
              {!profile ? <p className="mt-5 text-sm text-slate-500">{tr('Loading account information...', 'Đang tải thông tin tài khoản...')}</p> : <form onSubmit={saveProfile} className="mt-5 grid gap-x-5 gap-y-4 sm:grid-cols-2">
                <label className="text-xs font-medium text-[#253856] dark:text-slate-300">{tr('Display name', 'Tên hiển thị')}
                  <input required maxLength={200} value={profile.displayName} onChange={e => setProfile({ ...profile, displayName: e.target.value })} className={inputClass} />
                </label>
                <label className="text-xs font-medium text-[#253856] dark:text-slate-300">{tr('Language', 'Ngôn ngữ')}
                  <select value={profile.preferredLanguage} onChange={e => setProfile({ ...profile, preferredLanguage: e.target.value })} className={inputClass}>
                    <option value="en">English</option><option value="vi">Tiếng Việt</option>
                  </select>
                </label>
                <label className="text-xs font-medium text-[#253856] dark:text-slate-300 sm:col-span-2">{tr('Time zone', 'Múi giờ')}
                  <input maxLength={50} value={profile.timeZone ?? ''} onChange={e => setProfile({ ...profile, timeZone: e.target.value })} placeholder="Asia/Ho_Chi_Minh" className={inputClass} />
                </label>
                <div className="flex justify-end sm:col-span-2">
                  <button disabled={busy === 'profile'} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#1762f4] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"><Save className="h-4 w-4" />{busy === 'profile' ? tr('Saving...', 'Đang lưu...') : tr('Save changes', 'Lưu thông tin')}</button>
                </div>
              </form>}
            </div>
          </div>
        </section>

        <section id="account-api-keys" className="scroll-mt-6 rounded-lg border border-[#e0e7f1] bg-white px-5 py-5 shadow-[0_1px_2px_rgba(20,40,80,0.03)] dark:border-slate-800 dark:bg-[#101827] sm:px-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-[#172a4c] dark:text-slate-100">{tr('AI assistant API keys', 'Khóa API cho Trợ lý AI')}</h2>
            <p className="mt-0.5 text-xs text-[#7b8ca8] dark:text-slate-400">{tr('Each provider has a separate key. Saved keys cannot be viewed again.', 'Mỗi nhà cung cấp có một khóa riêng. Khóa đã lưu sẽ không hiển thị lại.')}</p>
          </div>
          {!keys ? <div className="h-24 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" /> : <div className="divide-y divide-[#e8edf4] dark:divide-slate-800">
            {providers.map(provider => {
              const saved = keys.keys.find(key => key.provider === provider.id);
              return <div key={provider.id} className="grid min-w-0 gap-4 py-4 first:pt-1 md:grid-cols-[minmax(0,40fr)_minmax(0,60fr)] md:gap-6">
                <div className="min-w-0 border-b border-[#edf1f6] pb-3 lg:border-0 lg:pb-0">
                  <h3 className="text-sm font-medium text-[#203353] dark:text-slate-200">{provider.name}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#7b8ca8] dark:text-slate-400">{tr(provider.descriptionEn, provider.descriptionVi)}</p>
                </div>
                <div className="min-w-0 space-y-2">
                  {provider.id === 'claude' && <label className="block text-[11px] font-medium text-[#526581] dark:text-slate-400">{tr('Endpoint', 'Điểm kết nối')}
                    <select value={endpoints.claude} onChange={e => setEndpoints({ ...endpoints, claude: e.target.value })} className={`${inputClass} mt-1 h-9 text-xs`}>
                      {(keys.claudeEndpoints ?? [{ id: 'official', name: 'Claude (official)' }]).map(endpoint => <option key={endpoint.id} value={endpoint.id}>{endpoint.name}</option>)}
                    </select>
                  </label>}
                  {saved && <div className="flex items-center gap-3">
                    <label className="min-w-0 flex-1 text-[11px] font-medium text-[#526581] dark:text-slate-400">{tr('Current API key', 'Khóa API hiện tại')}
                      <input readOnly value={`••••••••••••••••${saved.maskedSuffix}`} aria-label={tr(`Saved ${provider.name} API key, hidden`, `Khóa API ${provider.name} đã lưu, đã được ẩn`)} className={`${inputClass} h-9 bg-[#f0f3f7] text-xs tracking-wide text-[#8190a8] dark:bg-slate-800`} />
                    </label>
                    <span className="mt-4 inline-flex shrink-0 items-center gap-1 rounded-full bg-[#ddf9eb] px-3 py-1.5 text-[11px] font-medium text-[#16935d] dark:bg-emerald-950/60 dark:text-emerald-300"><Check className="h-3.5 w-3.5" />{tr('Saved', 'Đã lưu')}</span>
                  </div>}
                  <div className="flex flex-col items-end gap-2 sm:flex-row">
                    <label className="min-w-0 flex-1 text-[11px] font-medium text-[#526581] dark:text-slate-400">{saved ? tr('Replace with a new API key', 'Thay thế bằng khóa API mới') : tr('API key', 'Khóa API')}
                      <input type="password" autoComplete="off" value={draftKeys[provider.id] ?? ''} onChange={e => setDraftKeys({ ...draftKeys, [provider.id]: e.target.value })} placeholder={tr(`Enter ${provider.name} API key...`, `Nhập khóa API ${provider.name}...`)} className={`${inputClass} h-9 text-xs`} />
                    </label>
                    <div className="flex w-full shrink-0 gap-2 sm:w-auto sm:pb-0.5">
                      <button type="button" disabled={!draftKeys[provider.id]?.trim() || busy === provider.id} onClick={() => saveKey(provider.id)} className="h-9 flex-1 rounded-md border border-[#d6dfed] bg-[#f7f9fc] px-3 text-xs font-medium text-[#556985] transition hover:bg-[#edf3fc] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 sm:flex-none">{busy === provider.id ? tr('Saving...', 'Đang lưu...') : saved ? tr('Update key', 'Cập nhật khóa') : tr('Save key', 'Lưu khóa')}</button>
                      {saved && <button type="button" disabled={busy === provider.id} onClick={() => setKeyToDelete(provider.id)} className="h-9 rounded-md border border-red-200 px-3 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900/70 dark:text-red-400 dark:hover:bg-red-950/50">{tr('Delete', 'Xóa')}</button>}
                    </div>
                  </div>
                </div>
              </div>;
            })}
          </div>}
        </section>
      </div>
    </div>
    <ConfirmModal
      isOpen={keyToDelete !== null}
      onClose={() => { if (!busy) setKeyToDelete(null); }}
      onConfirm={deleteKey}
      isLoading={busy === keyToDelete && keyToDelete !== null}
      title={tr('Delete API key', 'Xóa khóa API')}
      message={keyToDelete ? tr(`Delete your ${keyToDelete === 'gemini' ? 'Gemini' : 'Claude'} key?`, `Xóa khóa ${keyToDelete === 'gemini' ? 'Gemini' : 'Claude'} của bạn?`) : ''}
      confirmText={tr('Delete', 'Xóa')}
    />
  </>;
};
