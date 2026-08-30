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
  Download
} from 'lucide-react';
import { Order, StoreSettings, DashboardStats } from '../types';
import { fetchAllOrders, updateOrderStatus, calculateStats, saveLocalSettings } from '../utils/storage';
import { printOrderReceipt, openWhatsAppConfirmation } from '../utils/orderUtils';
import { GOOGLE_APPS_SCRIPT_FULL_CODE } from '../utils/googleAppsScriptCode';
import { CONFIG_PHP_CODE, API_PHP_CODE, SCHEMA_SQL_CODE } from '../utils/phpBackendCode';

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

  // Google Sheet ping state
  const [isTestingSheet, setIsTestingSheet] = useState(false);
  const [sheetTestResult, setSheetTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Code Tab state
  const [activeCodeFile, setActiveCodeFile] = useState<'googleSheet' | 'configPhp' | 'apiPhp' | 'schemaSql'>('googleSheet');
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated]);

  const loadOrders = async () => {
    const fetched = await fetchAllOrders();
    setOrders(fetched);
    setStats(calculateStats(fetched));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'admin' || passwordInput === (settings.adminPasswordPlainText || 'admin')) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('كلمة المرور غير صحيحة، كلمة المرور هي: admin');
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    await updateOrderStatus(orderId, newStatus);
    await loadOrders();
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    saveLocalSettings(formData);
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 3000);
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
                placeholder="كلمة المرور (admin)"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-900 border border-slate-700 focus:border-[#FF6600] text-white rounded-2xl text-sm font-mono outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3.5 top-3.5 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              id="admin-login-btn"
              type="submit"
              className="w-full py-3.5 bg-[#FF6600] hover:bg-[#e65c00] text-white font-black rounded-full text-sm shadow-xl shadow-[#FF6600]/30 active:scale-98 transition-all"
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
            <h2 className="text-xl font-black text-slate-900 mb-2">إعدادات الصالون وبوابة إنستاباي وجوجل شيت</h2>
            <p className="text-xs text-slate-500 mb-6 font-medium">تحكم في أرقام الواتساب ومبلغ العربون ومزامنة الطلبات</p>

            {settingsSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 mb-6">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>تم حفظ وتحديث كافة الإعدادات بنجاح!</span>
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
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-black transition-all whitespace-nowrap shadow-md shadow-emerald-600/20"
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

              <div className="border-t border-slate-200 pt-5 mt-5">
                <button
                  type="submit"
                  className="px-7 py-3.5 bg-[#FF6600] hover:bg-[#e65c00] text-white font-black rounded-full text-xs sm:text-sm shadow-xl shadow-[#FF6600]/30 transition-all active:scale-95"
                >
                  حفظ وتطبيق كافة الإعدادات
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

