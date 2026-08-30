import React from 'react';
import { Check, Sparkles, Flame, Droplets, Info, AlertTriangle, Zap } from 'lucide-react';
import { PACKAGE_OFFERS } from '../data/constants';
import { PackageOffer, StoreSettings } from '../types';

interface PackageSelectorProps {
  selectedPackageId: string;
  onSelectPackage: (packageId: string) => void;
  addHairWash: boolean;
  onToggleHairWash: (add: boolean) => void;
  settings: StoreSettings;
}

export const PackageSelector: React.FC<PackageSelectorProps> = ({
  selectedPackageId,
  onSelectPackage,
  addHairWash,
  onToggleHairWash,
  settings
}) => {
  return (
    <section id="packages-section" className="py-10 sm:py-16 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 bg-[#FF6600]/10 text-[#FF6600] border border-[#FF6600]/20 px-4 py-1 rounded-full text-xs font-black mb-3">
            <Flame className="w-4 h-4 fill-[#FF6600] animate-pulse" />
            <span>باقات العرض الأقوى - اختاري باقتك المفضلة</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
            عروض بيوتي سنتر آية هبولة الحصرية ✨
          </h2>
          <p className="text-sm text-slate-600 mt-2 font-medium">
            سعر خاص جداً ومتاح لأول 10 بنات فقط بكل فرع خلال الأيام الـ 4 المحددة
          </p>
        </div>

        {/* The 2 Main Packages Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
          {PACKAGE_OFFERS.map((pkg: PackageOffer) => {
            const isSelected = selectedPackageId === pkg.id;
            return (
              <div
                key={pkg.id}
                id={`package-card-${pkg.id}`}
                onClick={() => onSelectPackage(pkg.id)}
                className={`relative rounded-3xl p-6 sm:p-7 transition-all cursor-pointer border-2 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white border-[#FF6600] shadow-2xl shadow-[#FF6600]/20 ring-4 ring-[#FF6600]/10 scale-[1.01]'
                    : 'bg-white border-slate-200 hover:border-[#FF6600]/60 hover:shadow-lg'
                }`}
              >
                {/* Popular / Value Badge */}
                {pkg.badge && (
                  <div className="absolute -top-3.5 right-6">
                    <span className="bg-[#FF6600] text-white text-xs font-black px-3.5 py-1 rounded-full shadow-md">
                      {pkg.badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mt-1 mb-3">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">{pkg.name}</h3>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                      isSelected ? 'bg-[#FF6600] border-[#FF6600] text-white' : 'border-slate-300'
                    }`}>
                      {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 font-medium mb-5 leading-relaxed">
                    {pkg.shortDescription}
                  </p>

                  {/* Pricing Box */}
                  <div className="bg-[#FF6600]/5 border border-[#FF6600]/20 rounded-2xl p-4 mb-6 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-slate-500 font-bold block mb-1">سعر العرض الشامل:</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl sm:text-4xl font-black text-[#FF6600]">{pkg.price}</span>
                        <span className="text-sm font-bold text-slate-800">{settings.currency} فقط</span>
                      </div>
                    </div>
                    <div className="text-left">
                      <span className="text-xs text-slate-400 line-through block">{pkg.originalPrice} {settings.currency}</span>
                      <span className="inline-block bg-red-100 text-red-700 text-xs font-black px-2.5 py-0.5 rounded-full mt-1">
                        وفرتي {pkg.discountPercent}%
                      </span>
                    </div>
                  </div>

                  {/* Feature Bullets */}
                  <ul className="space-y-3 mb-6 text-sm text-slate-700">
                    {pkg.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-black text-xs">
                          ✓
                        </span>
                        <span className="font-bold text-slate-800">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Package Select Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPackage(pkg.id);
                  }}
                  className={`w-full py-3.5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
                    isSelected
                      ? 'bg-[#FF6600] text-white shadow-lg shadow-[#FF6600]/30 hover:bg-[#e65c00]'
                      : 'bg-slate-100 hover:bg-orange-50 hover:text-[#FF6600] text-slate-700'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>تم اختيار هذه الباقة بنجاح</span>
                    </>
                  ) : (
                    <span>اختيار هذا العرض</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Hair Wash Add-on Box */}
        <div className="max-w-4xl mx-auto bg-white border-2 border-slate-200 hover:border-[#FF6600]/50 rounded-3xl p-5 sm:p-6 shadow-sm mb-4 transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#FF6600]/10 text-[#FF6600] flex items-center justify-center shrink-0">
                <Droplets className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                  <span>إضافة غسيل الشعر الاحترافي قبل الجلسة</span>
                  <span className="bg-[#FF6600]/10 text-[#FF6600] text-xs font-black px-2.5 py-0.5 rounded-full">
                    +100 جنيه
                  </span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  ملحوظة هامة: أي عرض يزيد 100 ج في حال الرغبة في غسيل الشعر بالشامبو المخصص داخل الصالون.
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer bg-slate-50 hover:bg-orange-50 border border-slate-200 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black text-slate-800 transition-colors shrink-0">
              <input
                id="checkbox-hair-wash"
                type="checkbox"
                checked={addHairWash}
                onChange={(e) => onToggleHairWash(e.target.checked)}
                className="w-4 h-4 accent-[#FF6600] rounded cursor-pointer"
              />
              <span>إضافة غسيل الشعر (+100 ج)</span>
            </label>
          </div>
        </div>

        {/* African Hair Notice */}
        <div className="max-w-4xl mx-auto bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-amber-950 font-semibold shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>تنبيه وإخلاء مسؤولية: <strong>الشعر الإفريقي خارج هذا العرض</strong>، ويتم تحديد سعره بعد المعاينة المباشرة بالفرع.</span>
        </div>

      </div>
    </section>
  );
};

