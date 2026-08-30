import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Video, Zap, Volume2, ShieldCheck, Check, Play, Film } from 'lucide-react';
import { PACKAGE_OFFERS } from '../data/constants';
import { PackageOffer } from '../types';

interface ProductGalleryProps {
  selectedPackageId: string;
  onSelectPackage: (packageId: string) => void;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ 
  selectedPackageId,
  onSelectPackage 
}) => {
  const isOffer1 = selectedPackageId === 'offer-1';
  const activeMediaTab: 'video1' | 'video2' = isOffer1 ? 'video1' : 'video2';
  
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Synchronize playback state when package / tab changes
  useEffect(() => {
    setIsPlaying(false);
    setVideoError(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [selectedPackageId]);

  const handleTabChange = (tab: 'video1' | 'video2') => {
    onSelectPackage(tab === 'video1' ? 'offer-1' : 'offer-2');
  };

  const handleVideoClick = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setVideoError(false);
          })
          .catch((err) => {
            console.warn('Video playback notice:', err);
            setIsPlaying(false);
          });
      }
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const currentPkg: PackageOffer = PACKAGE_OFFERS.find(p => p.id === selectedPackageId) || PACKAGE_OFFERS[0];

  return (
    <section id="gallery-section" className="py-12 sm:py-16 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 bg-[#FF6600]/10 text-[#FF6600] border border-[#FF6600]/20 px-3.5 py-1 rounded-full text-xs font-black mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>معاينة حية من داخل الصالون 📹</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
            شاهدي تفاصيل جلسات العرض على الطبيعة ✨
          </h2>
          <p className="text-sm text-slate-600 mt-2 font-medium">
            تصوير حقيقي من داخل صالون آية هبولة يوضح جلسات الكافيار وترتمنت الأرجان مع الصبغة
          </p>
        </div>

        {/* Media Selector Tabs - Synchronized with Package Selection */}
        <div className="flex justify-center gap-2.5 mb-8">
          <button
            id="tab-video-1"
            type="button"
            onClick={() => handleTabChange('video1')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all ${
              activeMediaTab === 'video1'
                ? 'bg-[#FF6600] text-white shadow-lg shadow-[#FF6600]/30 scale-105'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>العرض 1: باقة الكافيار (500 ج)</span>
          </button>

          <button
            id="tab-video-2"
            type="button"
            onClick={() => handleTabChange('video2')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all ${
              activeMediaTab === 'video2'
                ? 'bg-[#FF6600] text-white shadow-lg shadow-[#FF6600]/30 scale-105'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>العرض 2: باقة ترتمنت الأرجان (999 ج)</span>
          </button>
        </div>

        {/* Video Player & Info Display Container - Clean Studio Player (No mobile phone mockup) */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* High-End Studio Video Player Card */}
          <div className="md:col-span-6 flex justify-center">
            <div className="w-full max-w-[340px] sm:max-w-[380px] bg-slate-950 rounded-3xl p-3.5 sm:p-4 shadow-2xl border-2 border-slate-700/80 relative overflow-hidden group">
              
              {/* Studio Player Top Header Bar */}
              <div className="flex items-center justify-between gap-2 mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                  <span className="text-[11px] font-black text-slate-200">
                    {activeMediaTab === 'video1' ? 'باقة الكافيار والصبغة الملكية' : 'باقة ترتمنت الأرجان والصبغة الذهبية'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-700">
                  <Film className="w-3 h-3 text-[#FF6600]" />
                  <span>1080p HD</span>
                </div>
              </div>

              {/* Video Screen Container */}
              <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-black shadow-inner">
                {/* Video Element with guaranteed salon hair poster preview */}
                <video
                  key={activeMediaTab}
                  ref={videoRef}
                  poster={activeMediaTab === 'video1' ? '/poster-vid1.jpg' : '/poster-vid2.jpg'}
                  controls
                  playsInline
                  autoPlay={false}
                  preload="none"
                  onPlay={() => {
                    setIsPlaying(true);
                    setVideoError(false);
                  }}
                  onPause={() => setIsPlaying(false)}
                  onError={() => {
                    console.warn('Video source could not be played directly by current browser codec/network');
                    setVideoError(true);
                  }}
                  onClick={handleVideoClick}
                  className="w-full h-full object-cover rounded-2xl bg-black cursor-pointer"
                >
                  <source
                    src={activeMediaTab === 'video1' ? '/media/vid1.mp4' : '/media/vid2.mp4'}
                    type="video/mp4"
                  />
                  <source
                    src={activeMediaTab === 'video1' ? 'https://ayahaboula.mohamedgooda.com/media/vid1.mp4' : 'https://ayahaboula.mohamedgooda.com/media/vid2.mp4'}
                    type="video/mp4"
                  />
                  عذراً، متصفحك لا يدعم تشغيل الفيديو مباشرة.
                </video>

                {/* Error fallback banner if video fails to play on restricted browsers */}
                {videoError && (
                  <div className="absolute inset-x-3 bottom-14 z-30 bg-slate-900/95 text-white p-3 rounded-xl text-center text-xs border border-amber-500/40">
                    <p className="font-bold mb-1">قد يتطلب تشغيل الفيديو متصفحاً حديثاً</p>
                    <a
                      href={activeMediaTab === 'video1' ? '/media/vid1.mp4' : '/media/vid2.mp4'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-1 bg-[#FF6600] text-white px-3 py-1 rounded-full text-[11px] font-black"
                    >
                      فتح الفيديو في نافذة مستقلة ↗
                    </a>
                  </div>
                )}

                {/* Tap to Play hint overlay when paused */}
                {!isPlaying && (
                  <div 
                    onClick={handleVideoClick}
                    className="absolute inset-0 z-10 bg-black/25 hover:bg-black/15 transition-colors flex items-center justify-center cursor-pointer pointer-events-auto"
                  >
                    <div className="w-16 h-16 rounded-full bg-[#FF6600] text-white flex items-center justify-center shadow-2xl shadow-[#FF6600]/60 transform group-hover:scale-110 active:scale-95 transition-all">
                      <Play className="w-7 h-7 fill-white translate-x-0.5" />
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Session Overview Card beside Video */}
          <div className="md:col-span-6 bg-slate-900 text-white border-2 border-[#FF6600] rounded-3xl p-6 sm:p-7 text-right flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-block bg-[#FF6600] text-white text-xs font-black px-3.5 py-1 rounded-full shadow-sm">
                  {activeMediaTab === 'video1' ? 'العرض 1 • الكافيار والصبغة 🎀' : 'العرض 2 • ترتمنت الأرجان والصبغة 🔥'}
                </span>
                <span className="text-[11px] text-amber-300 font-bold">
                  تصوير صالون آية هبولة ✓
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white mb-2 leading-snug">
                {currentPkg.name}
              </h3>
              
              <div className="flex items-baseline gap-2 mb-5">
                <span className="text-3xl sm:text-4xl font-black text-[#FF6600] font-mono">
                  {currentPkg.price} جنيه
                </span>
                <span className="text-xs sm:text-sm text-slate-400 line-through">
                  {currentPkg.originalPrice} جنيه
                </span>
                <span className="text-xs text-emerald-400 font-bold mr-auto">
                  وفرتي {currentPkg.discountPercent}%
                </span>
              </div>

              <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-4 mb-6 space-y-2.5 text-xs sm:text-sm text-slate-200">
                <p className="font-bold text-amber-200 text-xs mb-1">✨ ما تشاهدينه في هذا الفيديو:</p>
                {activeMediaTab === 'video1' ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-[#FF6600] font-bold">✓</span>
                      <span>جلسة كافيار لتغذية وترميم خصلات الشعر واستعادة مرونته</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#FF6600] font-bold">✓</span>
                      <span>صبغة لون واحد متجانس تمنح الشعر حيوية ولمعاناً ثابتاً</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#FF6600] font-bold">✓</span>
                      <span>مجموعة العناية المنزلية (شامبو + بلسم) هدية مع الجلسة</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-[#FF6600] font-bold">✓</span>
                      <span>فرد وترميم حريري متكامل بأقوى ترتمنت أرجان معالج</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#FF6600] font-bold">✓</span>
                      <span>صبغة بروفيشنال خالية من الأمونيا تدوم طويلاً</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#FF6600] font-bold">✓</span>
                      <span>مجموعة الأرجان الملكية المنزلية هدية مجانية مع الحجز</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                id={`book-from-gallery-${activeMediaTab}`}
                type="button"
                onClick={() => onSelectPackage(activeMediaTab === 'video1' ? 'offer-1' : 'offer-2')}
                className="w-full py-4 bg-[#FF6600] hover:bg-[#e65c00] text-white rounded-full text-sm sm:text-base font-black shadow-xl shadow-[#FF6600]/30 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>اختيار هذه الباقة ({currentPkg.price} ج) والانتقال للحجز ⬇️</span>
              </button>

              <p className="text-center text-[11px] text-slate-400 font-medium">
                تأكيد الحجز بعربون 150 ج عبر إنستاباي - متاح لأول 10 بنات فقط
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
