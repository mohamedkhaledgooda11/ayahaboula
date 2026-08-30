import React, { useState } from 'react';
import { Star, Facebook, ExternalLink, Sparkles, ZoomIn } from 'lucide-react';
import { REVIEWS_LIST } from '../data/constants';

export const ReviewsSection: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Extract only review images
  const reviewImages = REVIEWS_LIST
    .map(rev => rev.imageUrl)
    .filter((url): url is string => Boolean(url));

  return (
    <section id="reviews-section" className="py-12 sm:py-16 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 bg-[#FF6600]/10 text-[#FF6600] border border-[#FF6600]/20 px-3.5 py-1 rounded-full text-xs font-black mb-3">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>آراء وتجارب عميلاتنا الحقيقية بالصور</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
            تجارب حقيقية تسعدنا وتفرحنا 🤍✨
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 font-medium">
            شاهدي صور ونتائج جلسات الكافيار وترتمنت الأرجان والصبغات من داخل فروعنا
          </p>
        </div>

        {/* Reviews Photos Grid Only (No text cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-10">
          {reviewImages.map((imgUrl, index) => (
            <div
              key={index}
              onClick={() => setSelectedImage(imgUrl)}
              className="group relative aspect-4/5 sm:aspect-3/4 rounded-3xl overflow-hidden shadow-md hover:shadow-2xl border-2 border-white hover:border-[#FF6600] cursor-pointer bg-slate-100 transition-all duration-300 transform hover:-translate-y-1"
            >
              <img
                src={imgUrl}
                alt={`صورة ريفيو عميلة ${index + 1}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              
              {/* Sleek Overlay on Hover */}
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity flex flex-col justify-between p-3.5 sm:p-4">
                <div className="flex justify-end">
                  <span className="bg-white/90 backdrop-blur-xs text-[#FF6600] p-1.5 rounded-full shadow-md">
                    <ZoomIn className="w-4 h-4" />
                  </span>
                </div>
                <div>
                  <span className="inline-block bg-[#FF6600] text-white text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-full shadow-sm">
                    تجربة عميلة مؤكدة ✓
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Facebook Community Link */}
        <div className="text-center">
          <a
            href="https://www.facebook.com/profile.php?id=100076153371113"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs sm:text-sm font-black shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
          >
            <Facebook className="w-4 h-4" />
            <span>تابعي المزيد من الفيديوهات والصور على صفحتنا الرسمية على فيسبوك</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>

      {/* Image Modal Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-2" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md"
            >
              ✕
            </button>
            <img
              src={selectedImage}
              alt="صورة التقييم"
              referrerPolicy="no-referrer"
              className="w-full h-auto max-h-[80vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </section>
  );
};


