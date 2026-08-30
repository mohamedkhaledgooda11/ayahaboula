import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Package,
  Search,
  Filter,
  Printer,
  MessageCircle,
  Settings,
  Code,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  Send,
  AlertCircle,
  Database,
  FileSpreadsheet,
  Download,
  Activity,
  Trash2
} from 'lucide-react';
import { Order, StoreSettings, DashboardStats } from '../types';
import { 
  fetchAllOrders, 
  updateOrderStatus, 
  calculateStats, 
  saveLocalSettings,
  saveSettingsDualEngine,
  fetchServerSettings 
} from '../utils/storage';
import { printOrderReceipt, openWhatsAppConfirmation } from '../utils/orderUtils';
import { GOOGLE_APPS_SCRIPT_FULL_CODE } from '../utils/googleAppsScriptCode';
import { CONFIG_PHP_CODE, API_PHP_CODE, SCHEMA_SQL_CODE } from '../utils/phpBackendCode';
import { testMetaPixelConnection, initMetaPixel, getPixelLogs, clearPixelLogs, PixelEventLog } from '../utils/pixelManager';
import { getMetaPixelCodeSnippet } from '../utils/metaPixelSnippet';

interface DashboardPageProps {
  settings: StoreSettings;
  onUpdateSettings: (newSettings: StoreSettings) => void;
  onBackToHome: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  settings,
  onUpdateSettings,
  onBackToHome
}) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Dashboard state
  const [activeTab, setActiveTab] = useState<'orders' | 'settings' | 'codes'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalSales: 0,
    totalDeposits: 0,
    newOrders: 0,
    confirmedOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0
  });

  // Table filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');

  // Settings form state
  const [formData, setFormData] = useState<StoreSettings>(settings);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveStatusMessage, setSaveStatusMessage] = useState('');
  const [isSyncingBackend, setIsSyncingBackend] = useState(false);

  // Google Sheet ping state
  const [isTestingSheet, setIsTestingSheet] = useState(false);
  const [sheetTestResult, setSheetTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Meta Pixel test state & Live Logs
  const [isTestingPixel, setIsTestingPixel] = useState(false);
  const [pixelTestResult, setPixelTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [pixelLogs, setPixelLogs] = useState<PixelEventLog[]>(() => getPixelLogs());

  // Code Tab state
  const [activeCodeFile, setActiveCodeFile] = useState<'googleSheet' | 'configPhp' | 'apiPhp' | 'schemaSql' | 'metaPixelCode'>('googleSheet');
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
      refreshSettingsFromBackend();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handlePixelLogUpdate = () => {
      setPixelLogs(getPixelLogs());
    };
    window.addEventListener('meta_pixel_event_logged', handlePixelLogUpdate);
    return () => {
      window.removeEventListener('meta_pixel_event_logged', handlePixelLogUpdate);
    };
  }, []);

  const refreshSettingsFromBackend = async () => {
    setIsSyncingBackend(true);
    try {
      const serverSettings = await fetchServerSettings();
      if (serverSettings) {
        setFormData(serverSettings);
        onUpdateSettings(serverSettings);
      }
    } catch (e) {
      console.warn('Could not sync with backend settings', e);
    } finally {
      setIsSyncingBackend(false);
    }
  };

  const loadOrders = async () => {
    const fetched = await fetchAllOrders();
    setOrders(fetched);
    setStats(calculateStats(fetched));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = passwordInput.trim();
    const customPass = (settings.adminPasswordPlainText || '').trim();

    // Accept 'admin' OR 'admin123' OR custom password configured in settings
    if (
      cleanInput === 'admin' ||
      cleanInput === 'admin123' ||
      (customPass && cleanInput === customPass)
    ) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('كلمة المرور غير صحيحة. كلمة المرور الافتراضية هي: admin أو admin123');
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    await updateOrderStatus(orderId, newStatus);
    await loadOrders();
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSaveStatusMessage('');
    try {
      const res = await saveSettingsDualEngine(formData);
      onUpdateSettings(res.data);
      setFormData(res.data);
      if (res.data.metaPixelId) {
        initMetaPixel(res.data.metaPixelId, res.data.metaTestEventCode);
      }
      setSettingsSuccess(true);
      setSaveStatusMessage(res.message || 'تم حفظ وتحديث الإعدادات بنجاح في قاعدة البيانات والباك إند والقرص الصلب!');
      setTimeout(() => setSettingsSuccess(false), 6000);
    } catch (err: any) {
      setSaveStatusMessage('حدث خطأ أثناء الحفظ: ' + (err?.message || 'خطأ غير معروف'));
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleTestGoogleSheet = async () => {
    if (!formData.googleSheetUrl) {
      setSheetTestResult({ success: false, message: 'يرجى إدخال رابط Google Apps Script Web App أولاً' });
      return;
    }
    setIsTestingSheet(true);
    setSheetTestResult(null);

    try {
      const res = await fetch('/api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'testGoogleSheet',
          googleSheetUrl: formData.googleSheetUrl
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setSheetTestResult({ success: true, message: '✅ تم الاتصال بنجاح وتأكيد استجابة Google Sheets!' });
      } else {
        setSheetTestResult({ success: false, message: '❌ خطأ: ' + (data.message || 'فشل الاتصال') });
      }
    } catch (e) {
      setSheetTestResult({ success: false, message: 'فشل الاتصال المباشر (تأكد من نشر السكربت كـ Web App مع صلاحية Anyone)' });
    } finally {
      setIsTestingSheet(false);
    }
  };

  const handleTestMetaPixel = (eventType: 'PageView' | 'Purchase' | 'Lead' = 'PageView') => {
    setIsTestingPixel(true);
    setPixelTestResult(null);
    try {
      const res = testMetaPixelConnection(formData.metaPixelId, formData.metaTestEventCode, eventType);
      setPixelTestResult(res);
      setPixelLogs(getPixelLogs());
    } catch (err: any) {
      setPixelTestResult({ success: false, message: 'خطأ: ' + err.message });
    } finally {
      setIsTestingPixel(false);
    }
  };

  const handleClearLogs = () => {
    clearPixelLogs();
    setPixelLogs([]);
  };

  // Filtered orders list
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      (order.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.phone1 || '').includes(searchQuery) ||
      (order.orderCode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.governorate || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.branch || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesBranch = branchFilter === 'all' || order.branch === branchFilter;

    return matchesSearch && matchesStatus && matchesBranch;
  });

  const getCodeContent = () => {
    switch (activeCodeFile) {
      case 'googleSheet': return GOOGLE_APPS_SCRIPT_FULL_CODE;
      case 'configPhp': return CONFIG_PHP_CODE;
      case 'apiPhp': return API_PHP_CODE;
      case 'schemaSql': return SCHEMA_SQL_CODE;
      case 'metaPixelCode': return getMetaPixelCodeSnippet(formData.metaPixelId, formData.metaTestEventCode);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeContent());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleDownloadCode = () => {
    const content = getCodeContent();
    let filename = 'Code.gs';
    if (activeCodeFile === 'configPhp') filename = 'config.php';
    if (activeCodeFile === 'apiPhp') filename = 'api.php';
    if (activeCodeFile === 'schemaSql') filename = 'schema.sql';
    if (activeCodeFile === 'metaPixelCode') filename = 'meta-pixel.html';

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Auth Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#FF6600]/20 text-[#FF6600] border border-[#FF6600]/30 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white mb-1">
            لوحة تحكم الإدارة (Admin فقط)
          </h2>
          <p className="text-xs text-slate-400 mb-6 font-medium">
            منطقة محمية خاصة بمسؤولي صالون آية هبولة فقط
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            {authError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl text-xs font-bold">
                {authError}
              </div>
            )}

            <div className="relative">
              <input
                id="admin-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="كلمة المرور (admin أو admin123)"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-900 border border-slate-700 focus:border-[#FF6600] text-white rounded-2xl text-sm font-mono outline-none text-center"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3.5 top-3.5 text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-700/60 text-right">
              <div className="text-[12px] font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <span className="text-[#FF6600]">🔑</span>
                <span>بيانات الدخول للوحة التحكم:</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                يمكنك كتابة <strong className="text-[#FF6600] font-mono bg-slate-800 px-1.5 py-0.5 rounded">admin</strong> أو <strong className="text-[#FF6600] font-mono bg-slate-800 px-1.5 py-0.5 rounded">admin123</strong> للدخول مباشرة (ويمكنك تغييرها لاحقاً من تبويب الإعدادات).
              </p>
            </div>

            <button
              id="admin-login-btn"
              type="submit"
              className="w-full py-3.5 bg-[#FF6600] hover:bg-[#e65c00] text-white font-black rounded-full text-sm shadow-xl shadow-[#FF6600]/30 active:scale-98 transition-all cursor-pointer"
            >
              تسجيل الدخول للوحة الإدارة
            </button>
          </form>

          <button
            onClick={onBackToHome}
            className="mt-6 text-xs text-slate-500 hover:text-slate-300 transition-colors font-medium"
          >
            العودة لصفحة المتجر الرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="admin-dashboard-page" className="min-h-screen bg-slate-100 text-slate-900 pb-16">
      
      {/* Dashboard Topbar */}
      <div className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#FF6600] flex items-center justify-center text-white font-black text-sm shadow-md shadow-[#FF6600]/30">
              AH
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black text-white">{settings.storeName} - لوحة الإدارة</h1>
              <p className="text-[10px] text-[#FF6600] font-bold">إدارة الحجوزات ونظام المزامنة المزدوج</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onBackToHome}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full text-xs font-bold transition-colors"
            >
              عرض المتجر
            </button>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-3.5 py-1.5 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-full text-xs font-bold transition-colors"
            >
              خروج
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-300 pb-3">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all ${
              activeTab === 'orders'
                ? 'bg-[#FF6600] text-white shadow-lg shadow-[#FF6600]/25'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>جدول الحجوزات ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all ${
              activeTab === 'settings'
                ? 'bg-[#FF6600] text-white shadow-lg shadow-[#FF6600]/25'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>إعدادات المتجر وإنستاباي</span>
          </button>

          <button
            onClick={() => setActiveTab('codes')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all ${
              activeTab === 'codes'
                ? 'bg-[#FF6600] text-white shadow-lg shadow-[#FF6600]/25'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>أكواد السيرفر وGoogle Script</span>
          </button>
        </div>

        {/* TAB 1: ORDERS & STATS */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            
            {/* Stats Cards Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <div className="text-xs text-slate-500 font-bold mb-1">إجمالي الحجوزات</div>
                <div className="text-2xl font-black text-slate-900 font-mono">{stats.totalOrders}</div>
                <div className="text-[11px] text-[#FF6600] font-bold mt-1">حجز مسجل</div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <div className="text-xs text-slate-500 font-bold mb-1">إجمالي المبيعات</div>
                <div className="text-2xl font-black text-emerald-600 font-mono">{stats.totalSales} {settings.currency}</div>
                <div className="text-[11px] text-slate-500 mt-1 font-medium">قيمة الباقات والإضافات</div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <div className="text-xs text-slate-500 font-bold mb-1">عربين إنستاباي المستلمة</div>
                <div className="text-2xl font-black text-[#FF6600] font-mono">{stats.totalDeposits} {settings.currency}</div>
                <div className="text-[11px] text-slate-500 mt-1 font-medium">عربون 150 ج / حجز</div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <div className="text-xs text-slate-500 font-bold mb-1">حجوزات جديدة / قيد التأكيد</div>
                <div className="text-2xl font-black text-amber-600 font-mono">{stats.newOrders}</div>
                <div className="text-[11px] text-amber-700 font-bold mt-1">في انتظار تأكيد الواتساب</div>
              </div>
            </div>

            {/* Orders Management Table Card */}
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
              
              {/* Table Search & Filter Bar */}
              <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <input
                    type="text"
                    placeholder="بحث بالاسم، الهاتف، الكود، المحافظة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-3 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm font-semibold outline-none focus:border-[#FF6600]"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-800 outline-none"
                  >
                    <option value="all">كل الحالات</option>
                    <option value="deposit_pending">في انتظار العربون</option>
                    <option value="confirmed">تم التأكيد</option>
                    <option value="completed">تمت الجلسة</option>
                    <option value="cancelled">ملغي</option>
                  </select>

                  <button
                    onClick={loadOrders}
                    title="تحديث البيانات"
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Table Container */}
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-4">كود الحجز</th>
                      <th className="p-4">العميلة والهاتف</th>
                      <th className="p-4">الفرع والمحافظة</th>
                      <th className="p-4">الباقة والخدمات</th>
                      <th className="p-4">ساعة الحظ</th>
                      <th className="p-4">الحساب والعربون</th>
                      <th className="p-4">التاريخ بتوقيت القاهرة</th>
                      <th className="p-4">الحالة</th>
                      <th className="p-4 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-slate-400 font-bold">
                          لا توجد حجوزات مطابقة لمعايير البحث الحالية
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map(order => (
                        <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                          
                          <td className="p-4 font-black font-mono text-[#FF6600]">
                            {order.orderCode}
                          </td>

                          <td className="p-4">
                            <div className="font-bold text-slate-900">{order.customerName}</div>
                            <div className="text-[11px] text-slate-500 font-mono" dir="ltr">{order.phone1}</div>
                          </td>

                          <td className="p-4">
                            <div className="font-bold text-slate-900">{order.branch}</div>
                            <div className="text-[10px] text-slate-500">{order.governorate}</div>
                          </td>

                          <td className="p-4">
                            <div className="font-bold text-slate-800">{order.packageName}</div>
                            {order.addHairWash && (
                              <span className="text-[10px] text-[#FF6600] font-bold block">+ غسيل شعر (100 ج)</span>
                            )}
                            {order.selectedShade && (
                              <span className="text-[10px] text-slate-500 block">صبغة: {order.selectedShade}</span>
                            )}
                          </td>

                          <td className="p-4">
                            {order.wonPrize ? (
                              <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-block border border-amber-200">
                                🎁 {order.wonPrize}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">-</span>
                            )}
                          </td>

                          <td className="p-4">
                            <div className="font-black text-slate-900 font-mono">{order.totalPrice} {settings.currency}</div>
                            <div className="text-[10px] text-[#FF6600] font-bold">عربون: {order.depositAmount} ج</div>
                            <div className="text-[10px] text-emerald-700 font-medium">متبقي: {order.remainingAmount} ج</div>
                          </td>

                          <td className="p-4 text-[11px] text-slate-600 whitespace-nowrap font-medium">
                            {order.cairoFormattedDate}
                          </td>

                          <td className="p-4">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value as any)}
                              className={`text-[11px] font-bold px-3 py-1 rounded-full border outline-none cursor-pointer ${
                                order.status === 'confirmed'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                  : order.status === 'completed'
                                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                                  : order.status === 'cancelled'
                                  ? 'bg-red-50 text-red-700 border-red-300'
                                  : 'bg-amber-50 text-amber-800 border-amber-300'
                              }`}
                            >
                              <option value="deposit_pending">في انتظار العربون</option>
                              <option value="confirmed">تم التأكيد ✓</option>
                              <option value="completed">تمت الجلسة</option>
                              <option value="cancelled">ملغي</option>
                            </select>
                          </td>

                          <td className="p-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => openWhatsAppConfirmation(order, settings)}
                                title="مراسلة واتساب"
                                className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-full transition-colors"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => printOrderReceipt(order, settings)}
                                title="طباعة الفاتورة"
                                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: STORE SETTINGS & GOOGLE SHEET */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 mb-1">إعدادات الصالون وبوابة إنستاباي والميتا بيكسل</h2>
                <p className="text-xs text-slate-500 font-medium">تحكم في أرقام الواتساب ومبلغ العربون ومعرف البيكسل والمزامنة المزدوجة</p>
              </div>

              <button
                type="button"
                onClick={refreshSettingsFromBackend}
                disabled={isSyncingBackend}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                title="جلب آخر الإعدادات من السيرفر وقاعدة البيانات"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingBackend ? 'animate-spin text-[#FF6600]' : ''}`} />
                <span>{isSyncingBackend ? 'جاري المزامنة...' : 'مزامنة من السيرفر'}</span>
              </button>
            </div>

            {settingsSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 mb-6">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{saveStatusMessage || 'تم حفظ وتحديث كافة الإعدادات بنجاح في السيرفر وقاعدة البيانات والذاكرة المحلية!'}</span>
              </div>
            )}

            {saveStatusMessage && !settingsSuccess && (
              <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl text-xs font-bold flex items-center gap-2 mb-6">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>{saveStatusMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم الصالون / المتجر</label>
                  <input
                    type="text"
                    value={formData.storeName}
                    onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold outline-none focus:border-[#FF6600]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم صاحبة الصالون</label>
                  <input
                    type="text"
                    value={formData.salonOwner}
                    onChange={(e) => setFormData({ ...formData, salonOwner: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold outline-none focus:border-[#FF6600]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم الواتساب وتحويل إنستاباي</label>
                  <input
                    type="text"
                    value={formData.whatsappDepositNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappDepositNumber: e.target.value, whatsappNumber: '20' + e.target.value.replace(/^0+/, '') })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-mono font-bold outline-none focus:border-[#FF6600]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">مبلغ العربون المطلوب (جنيه)</label>
                  <input
                    type="number"
                    value={formData.depositAmount}
                    onChange={(e) => setFormData({ ...formData, depositAmount: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-mono font-bold outline-none focus:border-[#FF6600]"
                  />
                </div>
              </div>

              {/* Google Apps Script Integration Section */}
              <div className="border-t border-slate-200 pt-5 mt-5">
                <div className="flex items-center gap-2 text-sm font-black text-slate-900 mb-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <span>رابط Google Apps Script Web App (المزامنة التلقائية مع Google Sheet)</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3 font-medium">
                  الصقي رابط Web App الناتج من نشر كود `Code.gs` لمزامنة كافة الحجوزات فورياً مع شيت جوجل
                </p>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={formData.googleSheetUrl}
                    onChange={(e) => setFormData({ ...formData, googleSheetUrl: e.target.value })}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-mono outline-none focus:border-[#FF6600]"
                  />
                  <button
                    type="button"
                    onClick={handleTestGoogleSheet}
                    disabled={isTestingSheet}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-black transition-all whitespace-nowrap shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    {isTestingSheet ? 'جاري الفحص...' : 'اختبار الاتصال (Ping) 🚀'}
                  </button>
                </div>

                {sheetTestResult && (
                  <div className={`mt-2 p-3 rounded-2xl text-xs font-bold ${sheetTestResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {sheetTestResult.message}
                  </div>
                )}
              </div>

              {/* Meta Pixel & Facebook Tracking Section */}
              <div className="border-t border-slate-200 pt-5 mt-5">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                    <Sparkles className="w-5 h-5 text-[#FF6600]" />
                    <span>إعدادات فيسبوك بيكسل وتتبع الحملات الإعلانية (Meta Pixel)</span>
                  </div>
                  {formData.metaPixelId ? (
                    <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-3 py-0.5 rounded-full border border-emerald-300">
                      ● بيكسل نشط: {formData.metaPixelId}
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-3 py-0.5 rounded-full border border-amber-300">
                      ⚠️ لم يتم تعيين بيكسل بعد
                    </span>
                  )}
                </div>
                
                <p className="text-[11px] text-slate-500 mb-3 font-medium leading-relaxed">
                  أدخلي معرّف البيكسل (Pixel ID) الخاص بكِ من مدير أحداث فيسبوك (Events Manager) ليتم تتبع كافة الزيارات وإرسال حدث الشراء (Purchase) والحجز فورياً في صفحة <strong>/thankyou</strong>.
                </p>

                {/* Inputs for Pixel ID & Test Event Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      معرّف البيكسل (Meta Pixel ID)
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: 100076153371113"
                      value={formData.metaPixelId || ''}
                      onChange={(e) => setFormData({ ...formData, metaPixelId: e.target.value.trim() })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-mono font-bold outline-none focus:border-[#FF6600]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      كود اختبار الأحداث (Test Event Code - اختياري)
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: TEST12345 (من تبويب Test events)"
                      value={formData.metaTestEventCode || ''}
                      onChange={(e) => setFormData({ ...formData, metaTestEventCode: e.target.value.trim() })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-mono font-bold outline-none focus:border-[#FF6600]"
                    />
                  </div>
                </div>

                {/* Test Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-[11px] font-bold text-slate-600">اختبار إرسال حدث فوري:</span>
                  <button
                    type="button"
                    onClick={() => handleTestMetaPixel('PageView')}
                    disabled={isTestingPixel || !formData.metaPixelId}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-300 text-white rounded-full text-xs font-bold transition-all"
                  >
                    ⚡ زيارة صفحة (PageView)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTestMetaPixel('Purchase')}
                    disabled={isTestingPixel || !formData.metaPixelId}
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-300 text-white rounded-full text-xs font-bold transition-all shadow-sm"
                  >
                    🛒 شراء وتأكيد (Purchase 600ج)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTestMetaPixel('Lead')}
                    disabled={isTestingPixel || !formData.metaPixelId}
                    className="px-3.5 py-1.5 bg-[#FF6600] hover:bg-[#e65c00] disabled:bg-slate-300 text-white rounded-full text-xs font-bold transition-all shadow-sm"
                  >
                    🎯 عميلة مهتمة (Lead)
                  </button>
                </div>

                {pixelTestResult && (
                  <div className={`mt-2 p-3 rounded-2xl text-xs font-bold ${pixelTestResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {pixelTestResult.message}
                  </div>
                )}

                {/* Live Pixel Activity Log */}
                <div className="mt-4 p-4 bg-slate-900 text-slate-200 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between gap-2 mb-2 border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-100">
                      <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span>سجل أحداث البيكسل المباشر (Live Meta Pixel Activity Log)</span>
                    </div>
                    {pixelLogs.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearLogs}
                        className="text-[10px] text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>مسح السجل</span>
                      </button>
                    )}
                  </div>

                  {pixelLogs.length === 0 ? (
                    <div className="text-[11px] text-slate-400 py-3 text-center">
                      لم يتم تسجيل أي أحداث بيكسل بعد في هذه الجلسة. جربي الضغط على أحد أزرار الاختبار أعلاه أو فتح صفحة المتجر.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {pixelLogs.map((log) => (
                        <div key={log.id} className="p-2 bg-slate-800/80 rounded-xl border border-slate-700/60 text-[11px] flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                              log.eventName === 'Purchase' 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : log.eventName === 'InitiateCheckout'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}>
                              {log.eventName}
                            </span>
                            <span className="font-mono text-slate-300">ID: {log.pixelId}</span>
                            {log.params?.test_event_code && (
                              <span className="text-[10px] text-amber-300 font-mono">[{log.params.test_event_code}]</span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {log.cairoTime}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Events Firing Map Infobox */}
                <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="text-xs font-black text-slate-800 mb-2">الأحداث التي يتم إرسالها لفيسبوك تلقائياً:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] text-slate-600">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <strong className="text-slate-900 block font-mono">1. PageView</strong>
                      عند زيارة أي صفحة أو التبديل بين الأقسام
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <strong className="text-slate-900 block font-mono">2. InitiateCheckout</strong>
                      عند بدء كتابة البيانات وتأكيد طلب الحجز
                    </div>
                    <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-300 text-emerald-900">
                      <strong className="text-emerald-950 block font-mono font-black">3. Purchase & Lead 🎯</strong>
                      عند فتح صفحة <strong>/thankyou</strong> مع قيمة الفاتورة وكود الحجز
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Password Setting */}
              <div className="border-t border-slate-200 pt-5 mt-5">
                <div className="flex items-center gap-2 text-sm font-black text-slate-900 mb-2">
                  <Lock className="w-5 h-5 text-[#FF6600]" />
                  <span>كلمة مرور لوحة الإدارة (Admin Password)</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3 font-medium leading-relaxed">
                  كلمة المرور الحالية المستخدمة للدخول إلى هذه اللوحة. يمكنك كتابة أي كلمة مرور جديدة تفضلينها لحماية حسابك:
                </p>

                <div className="max-w-md">
                  <input
                    type="text"
                    placeholder="كلمة مرور لوحة الإدارة (الافتراضي: admin أو admin123)"
                    value={formData.adminPasswordPlainText || ''}
                    onChange={(e) => setFormData({ ...formData, adminPasswordPlainText: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-mono font-bold outline-none focus:border-[#FF6600]"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    * ملاحظة: تقبل اللوحة تلقائياً أيضاً: <code className="font-bold text-slate-600">admin</code> أو <code className="font-bold text-slate-600">admin123</code> لضمان عدم إغلاق اللوحة بالخطأ.
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-5 mt-5">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-7 py-3.5 bg-[#FF6600] hover:bg-[#e65c00] disabled:bg-slate-300 text-white font-black rounded-full text-xs sm:text-sm shadow-xl shadow-[#FF6600]/30 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  {isSavingSettings ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جاري المزامنة والحفظ في الباك إند...</span>
                    </>
                  ) : (
                    <span>حفظ ومزامنة كافة الإعدادات مع السيرفر وقاعدة البيانات 💾</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* TAB 3: SERVER & GOOGLE SCRIPTS CODE VIEWER */}
        {activeTab === 'codes' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">أكواد الباك إند وقاعدة البيانات وسكربت جوجل شيت</h2>
                <p className="text-xs text-slate-500 font-medium">الأكواد البرمجية الكاملة والمجهزة للنشر المباشر على خادم PHP أو Google Apps Script</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? 'تم النسخ!' : 'نسخ الكود'}</span>
                </button>

                <button
                  onClick={handleDownloadCode}
                  className="px-4 py-2 bg-[#FF6600] hover:bg-[#e65c00] text-white rounded-full text-xs font-black flex items-center gap-1.5 transition-colors shadow-md shadow-[#FF6600]/25"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل الملف</span>
                </button>
              </div>
            </div>

            {/* Code Selector Tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setActiveCodeFile('googleSheet')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  activeCodeFile === 'googleSheet' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Code.gs (Google Apps Script)
              </button>
              <button
                onClick={() => setActiveCodeFile('apiPhp')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  activeCodeFile === 'apiPhp' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                api.php (REST API)
              </button>
              <button
                onClick={() => setActiveCodeFile('configPhp')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  activeCodeFile === 'configPhp' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                config.php (PDO & Timezone)
              </button>
              <button
                onClick={() => setActiveCodeFile('schemaSql')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  activeCodeFile === 'schemaSql' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                schema.sql (MySQL Schema)
              </button>
              <button
                onClick={() => setActiveCodeFile('metaPixelCode')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  activeCodeFile === 'metaPixelCode' ? 'bg-[#FF6600] text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Meta Pixel Code (كود البيكسل)
              </button>
            </div>

            {/* Code Display Area */}
            <div className="bg-slate-900 text-slate-200 rounded-3xl p-5 font-mono text-xs overflow-x-auto max-h-[500px] border border-slate-800 shadow-inner">
              <pre>{getCodeContent()}</pre>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

