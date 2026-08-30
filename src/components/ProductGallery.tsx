import React, { useState } from 'react';
import { Play, Sparkles, Video, Zap } from 'lucide-react';

interface ProductGalleryProps {
  onSelectPackage?: (packageId: string) => void;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ onSelectPackage }) => {
  const [activeMediaTab, setActiveMediaTab] = useState<'video1' | 'video2'>('video1');

  return (
    <section id="gallery-section" className="py-10 sm:py-16 bg-white border-y border-slate-200">
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
            onClick={() => setActiveMediaTab('video1')}
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
            onClick={() => setActiveMediaTab('video2')}
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

        {/* Video Player Display Container */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Main Video Box */}
          <div className="md:col-span-8 bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-900 relative flex items-center justify-center min-h-[320px] sm:min-h-[460px]">
            {activeMediaTab === 'video1' ? (
              <video
                key="vid1"
                src="https://ayahaboula.mohamedgooda.com/media/vid1.mp4"
                controls
                playsInline
                autoPlay={false}
                preload="metadata"
                className="w-full max-h-[520px] object-contain rounded-2xl bg-black"
              >
                عذراً، متصفحك لا يدعم تشغيل الفيديو.
              </video>
            ) : (
              <video
                key="vid2"
                src="https://ayahaboula.mohamedgooda.com/media/vid2.mp4"
                controls
                playsInline
                autoPlay={false}
                preload="metadata"
                className="w-full max-h-[520px] object-contain rounded-2xl bg-black"
              >
                عذراً، متصفحك لا يدعم تشغيل الفيديو.
              </video>
            )}
          </div>

          {/* Quick Package Card linked to the Active Video */}
          <div className="md:col-span-4 bg-slate-900 text-white border-2 border-[#FF6600] rounded-3xl p-6 text-right flex flex-col justify-between h-full shadow-2xl">
            <div>
              <span className="inline-block bg-[#FF6600] text-white text-xs font-black px-3 py-1 rounded-full mb-3 shadow-sm">
                {activeMediaTab === 'video1' ? 'العرض 1 - الأكثر توفيراً' : 'العرض 2 - الأكثر طلباً 🔥'}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white mb-2">
                {activeMediaTab === 'video1' ? 'باقة الكافيار والصبغة الملكية' : 'باقة ترتمنت الأرجان والصبغة الذهبية'}
              </h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-black text-[#FF6600] font-mono">
                  {activeMediaTab === 'video1' ? '500 جنيه' : '999 جنيه'}
                </span>
                <span className="text-xs text-slate-400 line-through">
                  {activeMediaTab === 'video1' ? '1200 جنيه' : '2200 جنيه'}
                </span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-[#FF6600] font-black">✓</span>
                  <span>{activeMediaTab === 'video1' ? 'جلسة كافيار ترميم مكثف' : 'جلسة ترتمنت أرجان نقي'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#FF6600] font-black">✓</span>
                  <span>صبغة شعر لون واحد جذاب</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#FF6600] font-black">✓</span>
                  <span>مجموعة العناية شامبو + بلسم هدية</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#FF6600] font-black">✓</span>
                  <span>سحب مجاني على ساعة حظ هبولة</span>
                </li>
              </ul>
            </div>

            <button
              id={`book-from-gallery-${activeMediaTab}`}
              onClick={() => onSelectPackage && onSelectPackage(activeMediaTab === 'video1' ? 'offer-1' : 'offer-2')}
              className="w-full py-3 bg-[#FF6600] hover:bg-[#e65c00] text-white rounded-full text-xs sm:text-sm font-black shadow-lg shadow-[#FF6600]/30 active:scale-95 transition-all"
            >
              حجز هذه الباقة فوراً ({activeMediaTab === 'video1' ? '500 ج' : '999 ج'})
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};

