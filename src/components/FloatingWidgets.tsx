import React, { useState, useEffect } from 'react';
import { MessageCircle, Gift, Sparkles, ArrowDown } from 'lucide-react';
import { StoreSettings } from '../types';
import { LIVE_ACTIVITY_MESSAGES } from '../data/constants';

interface FloatingWidgetsProps {
  settings: StoreSettings;
  onBookClick: () => void;
  onSpinClick: () => void;
  selectedPackagePrice: number;
}

export const FloatingWidgets: React.FC<FloatingWidgetsProps> = ({
  settings,
  onBookClick,
  onSpinClick,
  selectedPackagePrice
}) => {
  const [currentToastIndex, setCurrentToastIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // Show intermittent live order notifications
    const interval = setInterval(() => {
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        setCurrentToastIndex(prev => (prev + 1) % LIVE_ACTIVITY_MESSAGES.length);
      }, 5000);
    }, 12000);

    // Trigger first toast after 3 seconds
    const firstTimeout = setTimeout(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4500);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(firstTimeout);
    };
  }, []);

  const cleanPhone = settings.whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `مرحباً ${settings.storeName}، أود الاستفسار وتأكيد حجز عرض التجميل وساعة الحظ ✨`
  )}`;

  const currentMsg = LIVE_ACTIVITY_MESSAGES[currentToastIndex];

  return (
    <>
      {/* Floating WhatsApp Action Button */}
      <a
        id="floating-whatsapp-btn"
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="تواصل معنا عبر واتساب"
        className="fixed bottom-16 sm:bottom-6 right-3 sm:right-6 z-30 w-11 h-11 sm:w-14 sm:h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30 hover:scale-110 active:scale-95 transition-all group"
      >
        <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 fill-white text-emerald-500" />
        <span className="absolute right-16 bg-slate-900 text-white text-xs font-bold px-3.5 py-1.5 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl hidden sm:block border border-slate-700">
          تواصل واتساب مباشر 💬
        </span>
      </a>

      {/* Floating Haboula Lucky Clock Action Mini Badge (Desktop Only to prevent mobile clutter) */}
      <button
        id="floating-lucky-clock-badge"
        onClick={onSpinClick}
        title="ساعة حظ هبولة"
        className="hidden sm:flex fixed bottom-24 right-6 z-30 w-14 h-14 bg-[#FF6600] text-white rounded-full items-center justify-center shadow-2xl shadow-[#FF6600]/40 hover:scale-110 active:scale-95 transition-all group animate-bounce border-2 border-white"
      >
        <Gift className="w-7 h-7" />
        <span className="absolute right-16 bg-slate-900 text-white text-xs font-bold px-3.5 py-1.5 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl hidden sm:block border border-slate-700">
          العب ساعة حظ هبولة 🎯
        </span>
      </button>

      {/* Live Social Proof Activity Toast Notification (Top on Mobile, Bottom-Left on Desktop) */}
      {showToast && currentMsg && (
        <div className="fixed top-18 sm:top-auto sm:bottom-6 left-3 right-3 sm:right-auto sm:left-4 z-40 max-w-xs sm:max-w-sm mx-auto sm:mx-0 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 shadow-2xl flex items-center gap-3 animate-slide-in">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#FF6600]/10 text-[#FF6600] flex items-center justify-center shrink-0 border border-[#FF6600]/20">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="text-right overflow-hidden flex-1">
            <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <span>{currentMsg.name}</span>
              <span className="text-[10px] text-[#FF6600] bg-[#FF6600]/10 px-2 py-0.5 rounded-full font-bold">{currentMsg.branch}</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-600 truncate mt-0.5 font-medium">{currentMsg.text}</p>
          </div>
        </div>
      )}

      {/* Mobile Sticky Quick Booking Bottom Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-2.5 px-3.5 flex items-center justify-between shadow-2xl">
        <div className="text-right">
          <span className="text-[9px] text-slate-500 block font-bold leading-none">سعر العرض:</span>
          <span className="text-base font-black text-[#FF6600] font-mono leading-tight">{selectedPackagePrice} {settings.currency}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSpinClick}
            className="px-3 py-2 bg-amber-50 text-amber-900 border border-amber-300 rounded-full text-xs font-black flex items-center gap-1 shrink-0"
          >
            <Gift className="w-3.5 h-3.5 text-[#FF6600]" />
            <span>ساعة الحظ</span>
          </button>

          <button
            onClick={onBookClick}
            className="px-4 py-2 bg-[#FF6600] hover:bg-[#e65c00] text-white rounded-full text-xs font-black shadow-lg shadow-[#FF6600]/30 flex items-center gap-1 shrink-0 active:scale-95"
          >
            <span>احجزي الآن</span>
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );
};

