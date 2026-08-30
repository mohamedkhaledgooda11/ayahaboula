import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, Flame, ShieldAlert, CheckCircle2, MapPin, Gift, ArrowDown, Star, Play, Zap } from 'lucide-react';
import { StoreSettings } from '../types';
import { SALON_BRANCHES } from '../data/constants';

interface CompactHeroProps {
  settings: StoreSettings;
  onBookClick: () => void;
  onSpinClick: () => void;
}

export const CompactHero: React.FC<CompactHeroProps> = ({
  settings,
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
    <section id="hero-section" className="relative pt-6 pb-12 sm:pt-10 sm:pb-16 bg-white overflow-hidden">
      
      {/* Decorative Warm Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FF6600]/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Urgent Announcement Pill */}
        <div className="flex justify-center mb-5">
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

        {/* Countdown Timer Box - Sleek Interface Style */}
        <div className="max-w-md mx-auto bg-slate-900 text-white rounded-3xl p-5 shadow-xl border-2 border-[#FF6600] text-center mb-8">
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-amber-300 mb-3">
            <Clock className="w-4 h-4 animate-spin text-[#FF6600]" />
            <span>ينتهي العرض الخاص ويغلق الحجز خلال:</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl py-2.5 px-1 shadow-inner">
              <span className="block text-2xl sm:text-3xl font-black text-[#FF6600] font-mono">{format2(timeLeft.days)}</span>
              <span className="text-[11px] text-slate-300 font-bold">أيام</span>
            </div>
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl py-2.5 px-1 shadow-inner">
              <span className="block text-2xl sm:text-3xl font-black text-[#FF6600] font-mono">{format2(timeLeft.hours)}</span>
              <span className="text-[11px] text-slate-300 font-bold">ساعة</span>
            </div>
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl py-2.5 px-1 shadow-inner">
              <span className="block text-2xl sm:text-3xl font-black text-[#FF6600] font-mono">{format2(timeLeft.minutes)}</span>
              <span className="text-[11px] text-slate-300 font-bold">دقيقة</span>
            </div>
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl py-2.5 px-1 shadow-inner">
              <span className="block text-2xl sm:text-3xl font-black text-[#FF6600] font-mono">{format2(timeLeft.seconds)}</span>
              <span className="text-[11px] text-slate-300 font-bold">ثانية</span>
            </div>
          </div>
        </div>

        {/* Quick CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto mb-10">
          <button
            id="hero-book-now-btn"
            onClick={onBookClick}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-4 sm:py-5 rounded-full bg-[#FF6600] hover:bg-[#e65c00] text-white text-lg sm:text-xl font-black shadow-2xl shadow-[#FF6600]/40 hover:scale-105 active:scale-95 transition-all group"
          >
            <span>اختاري باقتك واحجزي الآن</span>
            <ArrowDown className="w-6 h-6 group-hover:translate-y-1 transition-transform animate-bounce" />
          </button>

          <button
            id="hero-lucky-wheel-btn"
            onClick={onSpinClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-white hover:bg-orange-50 text-[#FF6600] border-2 border-[#FF6600] font-black text-sm sm:text-base shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            <Gift className="w-5 h-5 text-[#FF6600] animate-pulse" />
            <span>العب ساعة حظ هبولة 🎰</span>
          </button>
        </div>

        {/* Branches Badges */}
        <div className="border-t border-slate-100 pt-8">
          <div className="text-center text-xs font-black text-slate-500 uppercase tracking-wider mb-4">📍 فروعنا المعتمدة لحجز العرض الترويجي:</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
            {SALON_BRANCHES.map(branch => (
              <div 
                key={branch.id} 
                className="bg-white border border-slate-200 hover:border-[#FF6600] rounded-2xl p-3.5 flex items-center justify-between text-right shadow-xs hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FF6600]/10 flex items-center justify-center text-[#FF6600] shrink-0 font-bold">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-black text-slate-900">{branch.name}</h2>
                    <p className="text-[11px] text-slate-500">{branch.city}</p>
                  </div>
                </div>
                <span className="text-[10px] font-black bg-[#FF6600]/10 text-[#FF6600] border border-[#FF6600]/20 px-2.5 py-1 rounded-full">
                  متبقي {branch.spotsLeft} مقاعد
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

