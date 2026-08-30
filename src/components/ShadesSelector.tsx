import React from 'react';
import { Palette, Check } from 'lucide-react';
import { SHADE_OPTIONS } from '../data/constants';
import { ShadeOption } from '../types';

interface ShadesSelectorProps {
  selectedShade: string;
  onSelectShade: (shadeName: string) => void;
}

export const ShadesSelector: React.FC<ShadesSelectorProps> = ({
  selectedShade,
  onSelectShade
}) => {
  return (
    <section id="shades-section" className="py-8 sm:py-10 bg-slate-50 border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FF6600]/10 text-[#FF6600] flex items-center justify-center font-bold">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              اختاري درجة الصبغة المفضلة (لون واحد مشمول في العرض)
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              يمكنكِ تحديد اللون الآن أو استشارة أخصائية الصبغة عند زيارة الفرع
            </p>
          </div>
        </div>

        {/* Shades Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mt-5">
          {SHADE_OPTIONS.map((shade: ShadeOption) => {
            const isSelected = selectedShade === shade.name;
            return (
              <div
                key={shade.id}
                id={`shade-option-${shade.id}`}
                onClick={() => onSelectShade(shade.name)}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                  isSelected
                    ? 'border-[#FF6600] bg-white text-slate-900 shadow-md shadow-[#FF6600]/15 ring-2 ring-[#FF6600]/20'
                    : 'border-slate-200 bg-white hover:border-[#FF6600]/50 text-slate-700'
                }`}
              >
                <span
                  className="w-6 h-6 rounded-full border border-slate-300 shadow-inner shrink-0"
                  style={{ backgroundColor: shade.colorHex || '#FF6600' }}
                />
                <div className="overflow-hidden">
                  <div className="text-xs font-bold truncate text-slate-900">{shade.name}</div>
                  <div className="text-[10px] text-slate-500 truncate">{shade.category}</div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-[#FF6600] mr-auto shrink-0 stroke-[3]" />}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

