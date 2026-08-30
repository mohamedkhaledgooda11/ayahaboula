import React, { useState, useRef } from 'react';
import { Sparkles, Video, Zap, Volume2, ShieldCheck, Check } from 'lucide-react';

interface ProductGalleryProps {
  onSelectPackage?: (packageId: string) => void;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ onSelectPackage }) => {
  const [activeMediaTab, setActiveMediaTab] = useState<'video1' | 'video2'>('video1');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleTabChange = (tab: 'video1' | 'video2') => {
    setActiveMediaTab(tab);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleVideoClick = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <section id="gallery-section" className="py-12 sm:py-16 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 bg-[#FF6600]/10 text-[#FF6600] border border-[#FF6600]/20 px-3.5 py-1 rounded-full text-xs font-black mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>معاينة حية وفيديوهات النتائج الواقعية</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
            شاهدي نتائج الجلسات على الطبيعة 📹✨
          </h2>
          <p className="text-sm text-slate-600 mt-2 font-medium">
            فيديوهات حقيقية من داخل صالون آية هبولة توضح نعومة ولمعان وترميم الشعر
          </p>
        </div>

        {/* Media Selector Tabs */}
        <div className="flex justify-center gap-2.5 mb-8">
          <button
            id="tab-video-1"
            onClick={() => handleTabChange('video1')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all ${
              activeMediaTab === 'video1'
                ? 'bg-[#FF6600] text-white shadow-lg shadow-[#FF6600]/30'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>فيديو العرض 1 (الكافيار والصبغة)</span>
          </button>

          <button
            id="tab-video-2"
            onClick={() => handleTabChange('video2')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all ${
              activeMediaTab === 'video2'
                ? 'bg-[#FF6600] text-white shadow-lg shadow-[#FF6600]/30'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>فيديو العرض 2 (ترتمنت الأرجان)</span>
          </button>
        </div>

        {/* Video Player Display Container - Custom 9:16 Frame matching video exactly */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Symmetrical Vertical Video Box (Mobile Reel Mockup) */}
          <div className="md:col-span-6 flex justify-center">
            <div className="w-full max-w-[320px] sm:max-w-[350px] aspect-[9/16] bg-slate-950 rounded-[2.5rem] p-2.5 sm:p-3 shadow-2xl border-4 border-slate-900 relative overflow-hidden group">
              
              {/* Phone Speaker Notch Top Bar */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-24 h-4 bg-slate-900/90 backdrop-blur-xs rounded-full flex items-center justify-center gap-2 pointer-events-none shadow-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
              </div>

              {/* Floating Live Badge */}
              <div className="absolute top-5 right-5 z-20 pointer-events-none">
                <span className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full border border-white/20">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  <span>نتيجة حية</span>
                </span>
              </div>

              {/* Video Element with guaranteed salon hair poster preview */}
              {activeMediaTab === 'video1' ? (
                <video
                  key="vid1"
                  ref={videoRef}
                  src="https://ayahaboula.mohamedgooda.com/media/vid1.mp4"
                  poster="/poster-vid1.jpg"
                  controls
                  playsInline
                  autoPlay={false}
                  preload="metadata"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onClick={handleVideoClick}
                  className="w-full h-full object-cover rounded-[2rem] bg-black shadow-inner cursor-pointer"
                >
                  عذراً، متصفحك لا يدعم تشغيل الفيديو.
                </video>
              ) : (
                <video
                  key="vid2"
                  ref={videoRef}
                  src="https://ayahaboula.mohamedgooda.com/media/vid2.mp4"
                  poster="/poster-vid2.jpg"
                  controls
                  playsInline
                  autoPlay={false}
                  preload="metadata"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onClick={handleVideoClick}
                  className="w-full h-full object-cover rounded-[2rem] bg-black shadow-inner cursor-pointer"
                >
                  عذراً، متصفحك لا يدعم تشغيل الفيديو.
                </video>
              )}

              {/* Tap to Play hint overlay when paused */}
              {!isPlaying && (
                <div 
                  onClick={handleVideoClick}
                  className="absolute inset-0 z-10 rounded-[2rem] bg-black/25 hover:bg-black/15 transition-colors flex items-center justify-center cursor-pointer pointer-events-auto"
                >
                  <div className="w-16 h-16 rounded-full bg-[#FF6600] text-white flex items-center justify-center shadow-2xl shadow-[#FF6600]/60 transform group-hover:scale-110 active:scale-95 transition-all">
                    <svg className="w-7 h-7 fill-white translate-x-0.5" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Quick Package Card linked to the Active Video */}
          <div className="md:col-span-6 bg-slate-900 text-white border-2 border-[#FF6600] rounded-3xl p-6 sm:p-7 text-right flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-block bg-[#FF6600] text-white text-xs font-black px-3.5 py-1 rounded-full shadow-sm">
                  {activeMediaTab === 'video1' ? 'العرض 1 - الأكثر توفيراً' : 'العرض 2 - الأكثر طلباً 🔥'}
                </span>
                <span className="text-[11px] text-amber-300 font-bold">
                  فيديو حقيقي من الصالون ✓
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white mb-2 leading-snug">
                {activeMediaTab === 'video1' ? 'باقة الكافيار والصبغة الملكية' : 'باقة ترتمنت الأرجان والصبغة الذهبية'}
              </h3>
              
              <div className="flex items-baseline gap-2 mb-5">
                <span className="text-3xl sm:text-4xl font-black text-[#FF6600] font-mono">
                  {activeMediaTab === 'video1' ? '500 جنيه' : '999 جنيه'}
                </span>
                <span className="text-xs sm:text-sm text-slate-400 line-through">
                  {activeMediaTab === 'video1' ? '1200 جنيه' : '2200 جنيه'}
                </span>
                <span className="text-xs text-emerald-400 font-bold mr-auto">
                  {activeMediaTab === 'video1' ? 'وفرتي 58%' : 'وفرتي 55%'}
                </span>
              </div>

              <ul className="text-xs sm:text-sm text-slate-300 space-y-2.5 mb-6">
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#FF6600]/20 text-[#FF6600] flex items-center justify-center font-black text-xs shrink-0">✓</span>
                  <span>{activeMediaTab === 'video1' ? 'جلسة كافيار ترميم مكثف وتغذية عميقة' : 'جلسة ترتمنت أرجان نقي لفرد ولمعان الشعر'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#FF6600]/20 text-[#FF6600] flex items-center justify-center font-black text-xs shrink-0">✓</span>
                  <span>صبغة شعر لون واحد جذاب حسب اختيارك</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#FF6600]/20 text-[#FF6600] flex items-center justify-center font-black text-xs shrink-0">✓</span>
                  <span>مجموعة العناية الكاملة (شامبو + بلسم) هدية مجانية</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#FF6600]/20 text-[#FF6600] flex items-center justify-center font-black text-xs shrink-0">✓</span>
                  <span>سحب فوري على ساعة حظ هبولة لهدايا إضافية</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3 pt-2">
              <button
                id={`book-from-gallery-${activeMediaTab}`}
                onClick={() => onSelectPackage && onSelectPackage(activeMediaTab === 'video1' ? 'offer-1' : 'offer-2')}
                className="w-full py-4 bg-[#FF6600] hover:bg-[#e65c00] text-white rounded-full text-sm sm:text-base font-black shadow-xl shadow-[#FF6600]/30 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>حجز هذه الباقة فوراً ({activeMediaTab === 'video1' ? '500 ج' : '999 ج'})</span>
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
