import React, { useState } from 'react';
import { Sparkles, Phone, MapPin, User, FileText, CheckCircle2, Copy, Check, ShieldCheck, ArrowLeft, HeartHandshake, AlertCircle, Zap, Droplets, AlertTriangle, Palette } from 'lucide-react';
import { StoreSettings, Order, ShadeOption } from '../types';
import { PACKAGE_OFFERS, SALON_BRANCHES, EGYPT_GOVERNORATES, SHADE_OPTIONS } from '../data/constants';
import { generateOrderCode, formatArabicCairoDateNow } from '../utils/dateFormatter';

interface OrderFormProps {
  selectedPackageId: string;
  addHairWash: boolean;
  onToggleHairWash: (add: boolean) => void;
  selectedShade: string;
  onSelectShade: (shadeName: string) => void;
  wonPrize: string;
  settings: StoreSettings;
  onSubmitOrder: (order: Order) => Promise<void>;
  isSubmitting: boolean;
}

export const OrderForm: React.FC<OrderFormProps> = ({
  selectedPackageId,
  addHairWash,
  onToggleHairWash,
  selectedShade,
  onSelectShade,
  wonPrize,
  settings,
  onSubmitOrder,
  isSubmitting
}) => {
  const selectedPackage = PACKAGE_OFFERS.find(p => p.id === selectedPackageId) || PACKAGE_OFFERS[0];
  const hairWashCost = addHairWash ? settings.hairWashPrice : 0;
  const totalPrice = selectedPackage.price + hairWashCost;
  const depositAmount = settings.depositAmount;
  const remainingAmount = Math.max(0, totalPrice - depositAmount);

  const [customerName, setCustomerName] = useState('');
  const [phone1, setPhone1] = useState('');
  const [phone2, setPhone2] = useState('');
  const [selectedBranch, setSelectedBranch] = useState(SALON_BRANCHES[1].name); // Default to Heliopolis
  const [governorate, setGovernorate] = useState('القاهرة');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [copiedInstapay, setCopiedInstapay] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCopyInstapay = () => {
    navigator.clipboard.writeText(settings.whatsappDepositNumber);
    setCopiedInstapay(true);
    setTimeout(() => setCopiedInstapay(false), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('برجاء كتابة اسمك بالكامل');
      return;
    }

    if (!phone1.trim() || phone1.length < 10) {
      setErrorMsg('برجاء إدخال رقم هاتف صحيح (11 رقم)');
      return;
    }

    const newOrder: Order = {
      id: generateOrderCode(),
      orderCode: generateOrderCode(),
      customerName: customerName.trim(),
      phone1: phone1.trim(),
      phone2: phone2.trim() || undefined,
      governorate: governorate,
      branch: selectedBranch,
      address: address.trim() || 'العنوان المسجل بالفرع',
      notes: notes.trim() || undefined,
      packageId: selectedPackage.id,
      packageName: selectedPackage.name,
      packagePrice: selectedPackage.price,
      addHairWash: addHairWash,
      hairWashPrice: hairWashCost,
      selectedShade: selectedShade || 'اختيار بالفرع',
      wonPrize: wonPrize || undefined,
      depositAmount: depositAmount,
      remainingAmount: remainingAmount,
      totalPrice: totalPrice,
      status: 'deposit_pending',
      cairoFormattedDate: formatArabicCairoDateNow(),
      createdAt: new Date().toISOString(),
      syncedToGoogleSheet: false
    };

    await onSubmitOrder(newOrder);
  };

  return (
    <section id="order-form-section" className="py-12 sm:py-20 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Form Container Card */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          
          {/* Header Accent Pill */}
          <div className="text-center max-w-lg mx-auto mb-8">
            <div className="inline-flex items-center gap-2 bg-[#FF6600]/10 text-[#FF6600] border border-[#FF6600]/20 px-4 py-1 rounded-full text-xs font-black mb-3">
              <Sparkles className="w-4 h-4 text-[#FF6600]" />
              <span>استمارة تأكيد العرض وحجز الموعد</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              احجزي مكانك الآن في <span className="text-[#FF6600]">{settings.storeName}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 font-medium">
              املئي بياناتك لتسجيل الحجز وسيتم تحويلك لصفحة الفاتورة وتأكيد التحويل عبر واتساب
            </p>
          </div>

          {/* InstaPay Deposit Alert Box */}
          <div className="bg-slate-900 border-2 border-[#FF6600] text-white rounded-3xl p-5 sm:p-6 mb-8 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-white font-black text-sm sm:text-base">
                  <ShieldCheck className="w-5 h-5 text-[#FF6600]" />
                  <span>📌 شرط تأكيد العرض: تحويل عربون {depositAmount} جنيه إنستاباي</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 font-medium">
                  رقم تحويل إنستاباي المعتمد: <strong className="text-[#FF6600] font-black text-sm tracking-wider font-mono">{settings.whatsappDepositNumber}</strong>
                </p>
              </div>

              <button
                type="button"
                id="copy-instapay-number-btn"
                onClick={handleCopyInstapay}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-orange-50 text-[#FF6600] rounded-full text-xs font-black shadow-md active:scale-95 transition-all"
              >
                {copiedInstapay ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>تم النسخ بنجاح!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>نسخ رقم إنستاباي</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Form Start */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Customer Name & Primary Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1.5">
                  اسم العميلة بالكامل <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="input-customer-name"
                    type="text"
                    required
                    placeholder="مثال: ياسمين محمد حسن"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#FF6600] focus:bg-white rounded-2xl text-sm font-semibold outline-none transition-all"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1.5">
                  رقم الهاتف الأساسي (الواتساب) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="input-phone-1"
                    type="tel"
                    required
                    placeholder="مثال: 01286886296"
                    value={phone1}
                    onChange={(e) => setPhone1(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#FF6600] focus:bg-white rounded-2xl text-sm font-semibold outline-none transition-all"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>
            </div>

            {/* Secondary Phone & Branch Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1.5">
                  رقم هاتف إضافي (اختياري)
                </label>
                <div className="relative">
                  <input
                    id="input-phone-2"
                    type="tel"
                    placeholder="رقم آخر للطوارئ"
                    value={phone2}
                    onChange={(e) => setPhone2(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#FF6600] focus:bg-white rounded-2xl text-sm font-semibold outline-none transition-all"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1.5">
                  اختاري الفرع المراد الحجز فيه <span className="text-red-500">*</span>
                </label>
                <select
                  id="select-branch"
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#FF6600] focus:bg-white rounded-2xl text-sm font-bold text-slate-900 outline-none transition-all cursor-pointer"
                >
                  {SALON_BRANCHES.map(b => (
                    <option key={b.id} value={b.name}>
                      {b.name} (متبقي {b.spotsLeft} مقاعد)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Governorate & Detailed Address */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1.5">
                  المحافظة <span className="text-red-500">*</span>
                </label>
                <select
                  id="select-governorate"
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="w-full px-3 py-3 bg-slate-50 border border-slate-200 focus:border-[#FF6600] focus:bg-white rounded-2xl text-sm font-semibold text-slate-900 outline-none transition-all cursor-pointer"
                >
                  {EGYPT_GOVERNORATES.map(gov => (
                    <option key={gov} value={gov}>{gov}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1.5">
                  المنطقة أو العنوان التفصيلي
                </label>
                <div className="relative">
                  <input
                    id="input-address"
                    type="text"
                    placeholder="مثال: مصر الجديدة - شارع الحجاز"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#FF6600] focus:bg-white rounded-2xl text-sm font-semibold outline-none transition-all"
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1.5">
                ملاحظات إضافية (طول الشعر، موعد مفضل، إلخ)
              </label>
              <textarea
                id="input-notes"
                rows={2}
                placeholder="أية تفاصيل ترغبين في إخبارنا بها قبل الزيارة..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#FF6600] focus:bg-white rounded-2xl text-sm outline-none transition-all resize-none"
              ></textarea>
            </div>

            {/* Order Summary & Customization Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h4 className="text-sm sm:text-base font-black text-slate-900">
                  ملخص حجزكِ وتفاصيل الحساب
                </h4>
                <span className="text-xs font-black bg-[#FF6600]/10 text-[#FF6600] px-3 py-1 rounded-full">
                  {selectedPackage.name}
                </span>
              </div>

              {/* Quick Shade Selection/Confirmation */}
              <div className="bg-white border border-slate-200 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Palette className="w-4 h-4 text-[#FF6600] shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">درجة الصبغة المشمولة:</span>
                    <span className="text-[11px] text-slate-500">لون واحد مشمول مجاناً بالعرض</span>
                  </div>
                </div>

                <select
                  id="form-select-shade"
                  value={selectedShade || 'تحديد الدرجة بالفرع مع الخبيرة'}
                  onChange={(e) => onSelectShade(e.target.value)}
                  className="w-full sm:w-auto px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#FF6600]"
                >
                  <option value="تحديد الدرجة بالفرع مع الخبيرة">تحديد الدرجة بالفرع مع الخبيرة</option>
                  {SHADE_OPTIONS.map((shade: ShadeOption) => (
                    <option key={shade.id} value={shade.name}>
                      {shade.name} ({shade.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Clean Hair Wash Add-on Toggle */}
              <label className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-slate-200 cursor-pointer hover:border-[#FF6600]/40 transition-colors">
                <div className="flex items-center gap-2.5">
                  <Droplets className="w-4 h-4 text-[#FF6600] shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">إضافة غسيل شعر احترافي بالشامبو بالصالون</span>
                    <span className="text-[10px] text-slate-500">موصى به لتجهيز ونظافة ألياف الشعر قبل الجلسة</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#FF6600] bg-[#FF6600]/10 px-2 py-0.5 rounded-full">+100 ج</span>
                  <input
                    id="checkbox-hair-wash-form"
                    type="checkbox"
                    checked={addHairWash}
                    onChange={(e) => onToggleHairWash(e.target.checked)}
                    className="w-4 h-4 accent-[#FF6600] rounded cursor-pointer"
                  />
                </div>
              </label>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs sm:text-sm text-slate-600 border-t border-slate-200 pt-3">
                <div className="flex justify-between">
                  <span>سعر الباقة الأساسي ({selectedPackage.name}):</span>
                  <span className="font-bold text-slate-900">{selectedPackage.price} {settings.currency}</span>
                </div>
                {addHairWash && (
                  <div className="flex justify-between text-[#FF6600]">
                    <span>غسيل الشعر الاحترافي:</span>
                    <span className="font-bold">+{hairWashCost} {settings.currency}</span>
                  </div>
                )}
                {selectedShade && (
                  <div className="flex justify-between">
                    <span>درجة الصبغة المحددة:</span>
                    <span className="font-bold text-slate-800">{selectedShade}</span>
                  </div>
                )}
                {wonPrize && (
                  <div className="flex justify-between text-amber-700 font-bold">
                    <span>هدية ساعة حظ هبولة:</span>
                    <span>🎁 {wonPrize} (مجاناً)</span>
                  </div>
                )}
              </div>

              {/* Totals and Deposit */}
              <div className="pt-2 space-y-2 text-xs sm:text-sm border-t border-slate-200">
                <div className="flex justify-between font-black text-sm sm:text-base text-slate-900">
                  <span>الإجمالي الكلي:</span>
                  <span className="text-[#FF6600] text-xl font-mono">{totalPrice} {settings.currency}</span>
                </div>
                <div className="flex justify-between font-black text-slate-800 bg-[#FF6600]/10 p-3 rounded-2xl border border-[#FF6600]/20">
                  <span>مطلوب تحويل عربون لتأكيد الحجز:</span>
                  <span className="text-[#FF6600] font-mono text-base">{depositAmount} {settings.currency}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>المبلغ المتبقي للدفع بالفرع يوم الجلسة:</span>
                  <span className="font-mono">{remainingAmount} {settings.currency}</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="submit-order-btn"
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 px-6 rounded-full text-base sm:text-lg font-black text-white shadow-xl transition-all flex items-center justify-center gap-2 ${
                isSubmitting
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-[#FF6600] hover:bg-[#e65c00] shadow-[#FF6600]/30 active:scale-95'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>جاري تسجيل حجزك وتجهيز الفاتورة...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-200" />
                  <span>تأكيد العرض وحجز الموعد الآن ✨</span>
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-slate-500 font-medium">
              🔒 بياناتك آمنة تماماً. بعد الضغط سيتم نقلك لصفحة الفاتورة مع زر مباشر لإرسال إيصال التحويل عبر واتساب.
            </p>

          </form>

        </div>

      </div>
    </section>
  );
};

