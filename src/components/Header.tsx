import React from 'react';
import { Sparkles, Phone, ShieldCheck, MapPin, Gift, LayoutDashboard, Zap } from 'lucide-react';
import { StoreSettings } from '../types';

interface HeaderProps {
  settings: StoreSettings;
  activeTab: 'home' | 'thankyou' | 'dashboard';
  setActiveTab: (tab: 'home' | 'thankyou' | 'dashboard') => void;
  onSpinClick?: () => void;
  onBookClick?: () => void;
  onAdminClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  activeTab,
  setActiveTab,
  onSpinClick,
  onBookClick,
  onAdminClick
}) => {
  return (
    <header id="main-header" className="sticky top-0 z-50 bg-[#FF6600] text-white shadow-xl">
      {/* Sleek Scarcity & Countdown Sub-bar */}
      <div className="bg-black/15 backdrop-blur-xs border-b border-white/10 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-bold text-white">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
            <span className="text-[11px] sm:text-xs">🔥 {settings.daysRemainingText} - متاح لأول 10 بنات بكل فرع فقط!</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-[11px]">
            <span className="hidden sm:inline bg-white/20 text-white font-black px-2.5 py-0.5 rounded-full">تأكيد العرض: عربون 150 ج إنستاباي</span>
            <span className="hidden sm:inline font-mono text-amber-200 font-bold">{settings.whatsappDepositNumber}</span>
            {onAdminClick && (
              <a
                href="/admin"
                onClick={(e) => {
                  e.preventDefault();
                  onAdminClick();
                }}
                className="text-white/80 hover:text-white flex items-center gap-1 font-bold text-[10px] sm:text-[11px] bg-black/20 hover:bg-black/30 px-2 py-0.5 rounded-full transition-colors"
                title="لوحة الإدارة (/admin)"
              >
                <span>لوحة الإدارة</span>
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand Identity */}
          <div 
            onClick={() => setActiveTab('home')} 
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none min-w-0"
          >
            <div className="bg-white p-1 sm:p-1.5 rounded-full shadow-md group-hover:scale-105 transition-transform shrink-0">
              <div className="w-8 h-8 sm:w-11 sm:h-11 bg-[#FF6600] rounded-full flex items-center justify-center text-white font-black text-sm sm:text-xl shadow-inner tracking-wider">
                AH
              </div>
            </div>
            <div className="min-w-0 overflow-hidden">
              <h1 className="text-sm sm:text-2xl font-black leading-tight uppercase tracking-tight text-white group-hover:text-amber-200 transition-colors truncate">
                {settings.storeName}
              </h1>
              <p className="text-[9px] sm:text-xs text-white/90 font-medium truncate">
                خبيرة التجميل {settings.salonOwner}
              </p>
            </div>
          </div>

          {/* Navigation & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {activeTab === 'home' && (
              <>
                <button
                  id="header-lucky-btn"
                  onClick={onSpinClick}
                  className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-xs transition-all active:scale-95 whitespace-nowrap"
                >
                  <Gift className="w-4 h-4 text-amber-300" />
                  <span>ساعة حظ هبولة 🎰</span>
                </button>

                <button
                  id="header-book-btn"
                  onClick={onBookClick}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-black bg-white text-[#FF6600] hover:bg-amber-50 shadow-lg shadow-black/10 active:scale-95 transition-all whitespace-nowrap"
                >
                  <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-[#FF6600] shrink-0" />
                  <span>حجز سريع ⚡</span>
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

