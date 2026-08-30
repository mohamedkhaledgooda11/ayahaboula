import React, { useEffect, useState } from 'react';
import { CheckCircle2, MessageCircle, Copy, Check, Printer, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { Order, StoreSettings } from '../types';
import { openWhatsAppConfirmation, printOrderReceipt } from '../utils/orderUtils';
import { trackPurchase, trackPageView } from '../utils/pixelManager';
import { getLastSavedOrder } from '../utils/storage';

interface ThankYouPageProps {
  order: Order | null;
  settings: StoreSettings;
  onBackToHome: () => void;
}

export const ThankYouPage: React.FC<ThankYouPageProps> = ({
  order: propOrder,
  settings,
  onBackToHome
}) => {
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(() => propOrder || getLastSavedOrder());

  useEffect(() => {
    if (propOrder) {
      setActiveOrder(propOrder);
    } else if (!activeOrder) {
      const recent = getLastSavedOrder();
      if (recent) setActiveOrder(recent);
    }
  }, [propOrder]);

  useEffect(() => {
    // Fire Meta / Facebook Pixel Purchase & Lead events
    trackPageView('ThankYouPage');
    if (activeOrder) {
      trackPurchase(activeOrder);
    }
  }, [activeOrder]);

  const order = activeOrder;

  if (!order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-orange-100 text-[#FF6600] flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">لا توجد تفاصيل حجز نشطة حالياً</h2>
        <p className="text-xs text-slate-500 mb-6">يرجى العودة للصفحة الرئيسية واختيار العرض لتسجيل الحجز.</p>
        <button
          onClick={onBackToHome}
          className="px-6 py-3 bg-[#FF6600] text-white font-black rounded-full text-sm shadow-md hover:bg-[#e65c00] transition-colors"
        >
          العودة للصفحة الرئيسية
        </button>
      </div>
    );
  }

  const handleCopyInstapay = () => {
    navigator.clipboard.writeText(settings.whatsappDepositNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 3000);
  };

  return (
    <div id="thank-you-page" className="py-10 sm:py-16 bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Success Header Box */}
        <div className="bg-white border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 shadow-xl text-center mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-black px-3.5 py-1 rounded-full mb-3">
            تم تسجيل طلب حجزك المبدئي بنجاح 🎉
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
            شكراً لكِ يا <span className="text-[#FF6600]">{order.customerName}</span> 🤍
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed font-medium">
            كود حجزك الخاص هو: <strong className="text-[#FF6600] text-base font-black tracking-wider bg-[#FF6600]/10 px-3 py-1 rounded-xl border border-[#FF6600]/20 font-mono">{order.orderCode}</strong>
          </p>

          <p className="text-[11px] text-slate-400 mt-2 font-medium">
            {order.cairoFormattedDate}
          </p>
        </div>

        {/* Step 2: Critical Deposit & WhatsApp Instruction Box */}
        <div className="bg-slate-900 border-2 border-[#FF6600] text-white rounded-3xl p-6 sm:p-8 shadow-2xl mb-6 relative overflow-hidden">
          
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-[#FF6600] animate-spin" />
            <h2 className="text-lg sm:text-xl font-black text-white">
              الخطوة الأخيرة والضرورية لتأكيد العرض وميعادك ✨
            </h2>
          </div>

          <div className="space-y-3.5 text-xs sm:text-sm text-slate-300 font-medium leading-relaxed mb-6">
            <div className="flex items-start gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl">
              <span className="w-6 h-6 rounded-full bg-[#FF6600] text-white flex items-center justify-center font-black shrink-0">1</span>
              <div>
                <strong className="text-white block text-sm mb-0.5">تحويل عربون الحجز ({order.depositAmount} جنيه):</strong>
                عبر تطبيق إنستاباي على الرقم: <span className="text-[#FF6600] font-mono font-black text-base">{settings.whatsappDepositNumber}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl">
              <span className="w-6 h-6 rounded-full bg-[#FF6600] text-white flex items-center justify-center font-black shrink-0">2</span>
              <div>
                <strong className="text-white block text-sm mb-0.5">إرسال صورة إيصال التحويل على واتساب:</strong>
                اضغطي على الزر الأخضر بالأسفل لإرسال تفاصيل الحجز وصورة التحويل وكتابة اسمك والفرع لتأكيد الميعاد فوراً 🤍
              </div>
            </div>
          </div>

          {/* Quick Actions in Banner */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              id="confirm-whatsapp-receipt-btn"
              onClick={() => openWhatsAppConfirmation(order, settings)}
              className="flex-1 py-4 px-6 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full text-sm sm:text-base font-black shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              <span>إرسال تفاصيل الحجز وصورة التحويل واتساب 📱</span>
            </button>

            <button
              id="copy-deposit-number-thankyou-btn"
              onClick={handleCopyInstapay}
              className="py-3.5 px-5 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs sm:text-sm font-bold border border-white/30 flex items-center justify-center gap-2 transition-all"
            >
              {copiedNumber ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>تم نسخ الرقم!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>نسخ رقم إنستاباي ({settings.whatsappDepositNumber})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Complete Booking Invoice Details */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md mb-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
            <div>
              <h3 className="text-lg font-black text-slate-900">فاتورة الحجز الرسمية</h3>
              <p className="text-xs text-slate-500">صالون {settings.storeName} - إدارة {settings.salonOwner}</p>
            </div>
            <button
              id="print-invoice-btn"
              onClick={() => printOrderReceipt(order, settings)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full text-xs font-bold transition-colors"
            >
              <Printer className="w-4 h-4 text-[#FF6600]" />
              <span>طباعة الفاتورة</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm mb-6">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-slate-500 block mb-1">اسم العميلة:</span>
              <strong className="text-slate-900 font-black text-sm">{order.customerName}</strong>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-slate-500 block mb-1">رقم الهاتف:</span>
              <strong className="text-slate-900 font-bold text-sm font-mono" dir="ltr">{order.phone1}</strong>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-slate-500 block mb-1">الفرع المختار:</span>
              <strong className="text-[#FF6600] font-black">{order.branch}</strong>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-slate-500 block mb-1">المحافظة / العنوان:</span>
              <strong className="text-slate-900 font-bold">{order.governorate} - {order.address}</strong>
            </div>
          </div>

          {/* Pricing Breakdown Table */}
          <div className="border border-slate-200 rounded-3xl overflow-hidden mb-6">
            <div className="bg-slate-100 px-4 py-3 text-xs font-black text-slate-700 flex justify-between">
              <span>الخدمة / الباقة</span>
              <span>السعر</span>
            </div>
            <div className="p-4 space-y-2.5 text-xs sm:text-sm bg-white">
              <div className="flex justify-between font-bold text-slate-900">
                <span>{order.packageName}</span>
                <span>{order.packagePrice} {settings.currency}</span>
              </div>
              {order.addHairWash && (
                <div className="flex justify-between text-[#FF6600] font-bold">
                  <span>غسيل الشعر الاحترافي</span>
                  <span>+{order.hairWashPrice} {settings.currency}</span>
                </div>
              )}
              {order.selectedShade && (
                <div className="flex justify-between text-slate-600">
                  <span>درجة الصبغة المحددة</span>
                  <span className="font-semibold text-slate-800">{order.selectedShade}</span>
                </div>
              )}
              {order.wonPrize && (
                <div className="flex justify-between text-amber-700 font-bold">
                  <span>هدية ساعة حظ هبولة 🎁</span>
                  <span>{order.wonPrize} (هدية مجانية)</span>
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between font-black text-slate-900 text-sm sm:text-base">
                <span>الإجمالي الكلي:</span>
                <span className="text-[#FF6600] font-mono text-lg">{order.totalPrice} {settings.currency}</span>
              </div>
              <div className="flex justify-between font-black text-slate-800 bg-[#FF6600]/10 p-2.5 rounded-xl border border-[#FF6600]/20">
                <span>العربون المحول إنستاباي:</span>
                <span className="text-[#FF6600] font-mono">{order.depositAmount} {settings.currency}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-700">
                <span>المتبقي للدفع عند الحضور بالفرع:</span>
                <span className="font-mono">{order.remainingAmount} {settings.currency}</span>
              </div>
            </div>
          </div>

          {/* Return Home Button */}
          <div className="text-center">
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-[#FF6600] transition-colors"
            >
              <span>العودة لصفحة العروض الرئيسية</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

