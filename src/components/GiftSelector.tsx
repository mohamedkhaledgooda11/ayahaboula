import React, { useState } from 'react';
import { Gift, Sparkles, Trophy, RotateCw, Zap } from 'lucide-react';
import { LUCKY_PRIZES } from '../data/constants';
import { LuckyPrize } from '../types';

interface GiftSelectorProps {
  wonPrize: string;
  onPrizeWon: (prizeName: string) => void;
}

export const GiftSelector: React.FC<GiftSelectorProps> = ({
  wonPrize,
  onPrizeWon
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [selectedPrizeObj, setSelectedPrizeObj] = useState<LuckyPrize | null>(null);
  const [hasSpun, setHasSpun] = useState(false);

  const totalPrizes = LUCKY_PRIZES.length;
  const sliceAngle = 360 / totalPrizes;

  const spinTheClock = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    // Pick a random prize index
    const randomIndex = Math.floor(Math.random() * totalPrizes);
    const targetPrize = LUCKY_PRIZES[randomIndex];

    // Extra spins for realistic fast spinning effect (5 full rotations + specific slice offset)
    const extraSpins = 5 * 360;
    const targetAngle = extraSpins + (360 - (randomIndex * sliceAngle)) - (sliceAngle / 2);
    const newTotalRotation = currentRotation + targetAngle;

    setCurrentRotation(newTotalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setSelectedPrizeObj(targetPrize);
      setHasSpun(true);
      onPrizeWon(targetPrize.name);
    }, 4000);
  };

  return (
    <section id="lucky-clock-section" className="py-10 sm:py-16 bg-white border-y-2 border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        
        {/* Title & Badge */}
        <div className="inline-flex items-center gap-2 bg-[#FF6600] text-white px-4 py-1.5 rounded-full text-xs sm:text-sm font-black shadow-md mb-3">
          <Sparkles className="w-4 h-4 animate-spin text-amber-200" />
          <span>ساعة حظ هبولة - العبي واكسبي هديتك المجانية! 🎯</span>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-2">
          ساعة الحظ الدوارة من <span className="text-[#FF6600]">آية هبولة</span> ✨
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto mb-8 font-medium">
          دوري عقرب ساعة الحظ واكسبي خدمة مجانية تضاف فوراً لحجزك (رموش، أظافر شي إن، وش وحواجب، سيشوار، بدكير، تنظيف بشرة، سويت...)!
        </p>

        {/* Lucky Clock / Wheel Interactive Stage */}
        <div className="relative max-w-sm sm:max-w-md mx-auto p-5 sm:p-7 bg-slate-50 rounded-3xl border-2 border-slate-200 shadow-xl mb-8">
          
          {/* Top Pointer Indicator (Dial Indicator) */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
            <div className="w-7 h-9 bg-slate-900 border-2 border-white rounded-b-full shadow-xl flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6600] animate-ping"></span>
            </div>
          </div>

          {/* Clock Dial Canvas */}
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto rounded-full overflow-hidden border-8 border-[#FF6600] shadow-2xl bg-white flex items-center justify-center">
            
            {/* Rotating Wheel Background & Slices */}
            <div
              className="absolute inset-0 w-full h-full rounded-full transition-transform duration-[4000ms] cubic-bezier(0.15, 0.9, 0.2, 1)"
              style={{
                transform: `rotate(${currentRotation}deg)`
              }}
            >
              {LUCKY_PRIZES.map((prize, idx) => {
                const angle = idx * sliceAngle;
                const isEven = idx % 2 === 0;
                return (
                  <div
                    key={prize.id}
                    className="absolute top-0 left-0 w-full h-full flex justify-center items-start pt-2.5 origin-center"
                    style={{
                      transform: `rotate(${angle}deg)`
                    }}
                  >
                    <div 
                      className={`text-[9px] sm:text-[11px] font-black px-2 py-0.5 rounded-md max-w-[85px] truncate shadow-xs ${
                        isEven ? 'bg-[#FF6600] text-white' : 'bg-slate-900 text-amber-300'
                      }`}
                    >
                      {prize.name}
                    </div>
                  </div>
                );
              })}

              {/* Decorative Wheel Spokes */}
              <div className="absolute inset-0 rounded-full border-2 border-[#FF6600]/20 pointer-events-none"></div>
            </div>

            {/* Center Clock Hub Button */}
            <button
              id="spin-clock-center-btn"
              type="button"
              disabled={isSpinning}
              onClick={spinTheClock}
              className={`relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#FF6600] hover:bg-[#e65c00] text-white font-black text-xs sm:text-sm shadow-2xl flex flex-col items-center justify-center gap-0.5 border-4 border-white active:scale-95 transition-all ${
                isSpinning ? 'opacity-80 cursor-not-allowed' : 'hover:scale-105 animate-sleek-pulse'
              }`}
            >
              <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? 'بتلف...' : 'دَوّري الحظ'}</span>
            </button>

          </div>

          {/* Spin CTA Button */}
          <div className="mt-6">
            <button
              id="spin-clock-action-btn"
              type="button"
              disabled={isSpinning}
              onClick={spinTheClock}
              className={`w-full py-4 px-6 rounded-full font-black text-sm sm:text-base transition-all shadow-xl flex items-center justify-center gap-2 ${
                isSpinning
                  ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                  : 'bg-[#FF6600] hover:bg-[#e65c00] text-white shadow-[#FF6600]/30 hover:scale-[1.02] active:scale-95'
              }`}
            >
              <Gift className="w-5 h-5 text-amber-200" />
              <span>{hasSpun ? 'لفي ساعة الحظ مرة تانية 🔄' : 'اضغطي للعب في ساعة حظ هبولة 🎁'}</span>
            </button>
          </div>

        </div>

        {/* Won Prize Celebration Alert */}
        {(wonPrize || selectedPrizeObj) && (
          <div className="max-w-md mx-auto bg-slate-900 border-2 border-[#FF6600] text-white rounded-3xl p-5 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-center gap-2 text-amber-300 font-black text-sm mb-1">
              <Trophy className="w-5 h-5 text-[#FF6600] animate-bounce" />
              <span>مبروووك! كسبتي في ساعة حظ هبولة 🎉</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-[#FF6600] my-2 font-mono">
              🎁 {wonPrize || selectedPrizeObj?.name}
            </div>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              تم إضافة هذه الهدية المجانية لحجزك تلقائياً وسيتم تنفيذها لكِ داخل الفرع مع العرض المختار!
            </p>
          </div>
        )}

      </div>
    </section>
  );
};

