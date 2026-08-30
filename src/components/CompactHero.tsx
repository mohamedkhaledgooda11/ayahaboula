import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, Flame, ShieldAlert, MapPin, Gift, ArrowDown, Zap, Check } from 'lucide-react';
import { StoreSettings, PackageOffer } from '../types';
import { SALON_BRANCHES, PACKAGE_OFFERS } from '../data/constants';

interface CompactHeroProps {
  settings: StoreSettings;
  selectedPackageId: string;
  onSelectPackage: (packageId: string) => void;
  onBookClick: () => void;
  onSpinClick: () => void;
}

export const CompactHero: React.FC<CompactHeroProps> = ({
  settings,
  selectedPackageId,
  onSelectPackage,
  onBookClick,
  onSpinClick
}) => {
  // 4-day countdown timer
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 14,
    minutes: 42,
    seconds: 18
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const format2 = (n: number) => String(n).padStart(2, '0');

  return (
    <section id="hero-section" className="relative pt-6 pb-12 sm:pt-10 sm:pb-16 bg-white overflow-hidden border-b border-slate-200">
      
      {/* Decorative Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FF6600]/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Urgent Announcement Pill */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2 bg-[#FF6600]/10 border border-[#FF6600]/30 text-[#FF6600] px-4 py-1.5 rounded-full text-xs sm:text-sm font-black shadow-xs">
            <Flame className="w-4 h-4 fill-[#FF6600] animate-pulse" />
            <span>عرض حصري لمدة 4 أيام فقط (الأربعاء • الخميس • الجمعة • السبت) ✨</span>
          </div>
        </div>

        {/* Hero Main Header */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-snug sm:leading-tight">
            تألقي بأقوى عروض العناية والصبغة في <br className="hidden sm:inline" />
            <span className="text-[#FF6600] inline-block font-black mt-1 sm:mt-0">
              {settings.storeName}
            </span>
          </h1>

          <p className="mt-3 sm:mt-4 text-xs sm:text-base md:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            جلسات كافيار وترتمنت أرجان نقي مع صبغة لون واحد متألقة ومجموعة العناية المنزلية مجاناً! 
            مع مفاجأة <strong className="text-[#FF6600] font-bold">ساعة حظ هبولة</strong> لكسب هدايا وجلسات إضافية فوراً 🎁
          </p>

          {/* Scarcity Alert & Notice */}
          <div className="mt-3 sm:mt-4 inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3.5 py-1.5 rounded-2xl text-[11px] sm:text-sm font-bold shadow-xs">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
            <span>⚠️ العرض متاح لأول 10 بنات فقط بكل فرع | ❌ الشعر الأفريقي خارج العرض</span>
          </div>
        </div>

        {/* Sleek Countdown Timer Bar */}
        <div className="max-w-md mx-auto bg-slate-900 text-white rounded-3xl p-4 sm:p-5 shadow-xl border-2 border-slate-800 text-center mb-8">
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-amber-300 mb-3">
            <Clock className="w-4 h-4 text-[#FF6600] animate-spin" />
            <span>ينتهي العرض الخاص ويغلق باب الحجز خلال:</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl py-2 px-1">
              <span className="block text-xl sm:text-2xl font-black text-[#FF6600] font-mono">{format2(timeLeft.days)}</span>
              <span className="text-[10px] sm:text-[11px] text-slate-300 font-bold">أيام</span>
            </div>
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl py-2 px-1">
              <span className="block text-xl sm:text-2xl font-black text-[#FF6600] font-mono">{format2(timeLeft.hours)}</span>
              <span className="text-[10px] sm:text-[11px] text-slate-300 font-bold">ساعة</span>
            </div>
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl py-2 px-1">
              <span className="block text-xl sm:text-2xl font-black text-[#FF6600] font-mono">{format2(timeLeft.minutes)}</span>
              <span className="text-[10px] sm:text-[11px] text-slate-300 font-bold">دقيقة</span>
            </div>
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl py-2 px-1">
              <span className="block text-xl sm:text-2xl font-black text-[#FF6600] font-mono">{format2(timeLeft.seconds)}</span>
              <span className="text-[10px] sm:text-[11px] text-slate-300 font-bold">ثانية</span>
            </div>
          </div>
        </div>

        {/* The 2 Main Offers Quick-Selection Cards (Calm, Elegant, Not Bloated) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto mb-8">
          {PACKAGE_OFFERS.map((pkg) => {
            const isSelected = selectedPackageId === pkg.id;
            return (
              <div
                key={pkg.id}
                onClick={() => onSelectPackage(pkg.id)}
                className={`p-4 sm:p-5 rounded-3xl border-2 transition-all cursor-pointer text-right flex flex-col justify-between ${
                  isSelected
                    ? 'bg-orange-50/50 border-[#FF6600] shadow-xl shadow-[#FF6600]/10 ring-2 ring-[#FF6600]/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-[#FF6600]/10 text-[#FF6600]">
                      {pkg.badge}
                    </span>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      isSelected ? 'bg-[#FF6600] text-white' : 'border border-slate-300 text-transparent'
                    }`}>
                      ✓
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                    {pkg.shortDescription}
                  </p>
                </div>

                <div className="flex items-baseline justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-[#FF6600] font-mono">{pkg.price}</span>
                    <span className="text-xs font-bold text-slate-700">جنيه فقط</span>
                  </div>
                  <span className="text-xs text-slate-400 line-through">
                    {pkg.originalPrice} جنيه
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto mb-8">
          <button
            id="hero-book-now-btn"
            onClick={onBookClick}
            className="w-full sm:flex-1 py-4 px-6 rounded-full bg-[#FF6600] hover:bg-[#e65c00] text-white text-base font-black shadow-xl shadow-[#FF6600]/30 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5 fill-white" />
            <span>احجزي باقتك الآن (عربون 150 ج)</span>
          </button>

          <button
            id="hero-lucky-wheel-btn"
            onClick={onSpinClick}
            className="w-full sm:w-auto py-4 px-5 rounded-full bg-white hover:bg-orange-50 text-[#FF6600] border-2 border-[#FF6600] font-black text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Gift className="w-4 h-4 text-[#FF6600]" />
            <span>ساعة حظ هبولة 🎰</span>
          </button>
        </div>

        {/* Branches Badges */}
        <div className="border-t border-slate-100 pt-6">
          <div className="text-center text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3">
            📍 فروع صالون آية هبولة المعتمدة:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-2xl mx-auto">
            {SALON_BRANCHES.map(branch => (
              <div 
                key={branch.id} 
                className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 flex items-center justify-between text-right text-xs font-bold"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#FF6600] shrink-0" />
                  <span className="text-slate-800">{branch.name}</span>
                </div>
                <span className="text-[10px] text-[#FF6600] bg-[#FF6600]/10 px-2 py-0.5 rounded-full font-black">
                  {branch.spotsLeft} مقاعد
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
