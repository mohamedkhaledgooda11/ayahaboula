import React from 'react';
import { Sparkles, Phone, MapPin, Facebook, ShieldCheck, Lock } from 'lucide-react';
import { StoreSettings } from '../types';
import { SALON_BRANCHES } from '../data/constants';

interface FooterProps {
  settings: StoreSettings;
}

export const Footer: React.FC<FooterProps> = ({ settings }) => {
  return (
    <footer id="main-footer" className="bg-slate-900 text-slate-300 pt-14 pb-24 sm:pb-14 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 mb-12 text-right">
          
          {/* Brand Col */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#FF6600] flex items-center justify-center text-white font-black text-sm shadow-md shadow-[#FF6600]/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-black text-white">{settings.storeName}</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4 font-medium">
              وجهتك الأولى للعناية الفائقة بالشعر، جلسات الكافيار وترتمنت الأرجان والصبغات الملكية، بإدارة وإشراف خبيرة التجميل {settings.salonOwner}.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-300 font-bold">
              <Phone className="w-4 h-4 text-[#FF6600]" />
              <span dir="ltr" className="font-mono text-sm text-[#FF6600]">{settings.whatsappDepositNumber}</span>
            </div>
          </div>

          {/* Branches Col */}
          <div>
            <h4 className="text-sm font-black text-white mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#FF6600]" />
              <span>فروعنا المعتمدة</span>
            </h4>
            <ul className="space-y-3 text-xs text-slate-400">
              {SALON_BRANCHES.map(b => (
                <li key={b.id} className="border-b border-slate-800/80 pb-2">
                  <strong className="text-white block text-xs font-bold mb-0.5">{b.name}</strong>
                  <span className="text-[11px] text-slate-400">{b.address}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Booking Policy Col */}
          <div>
            <h4 className="text-sm font-black text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#FF6600]" />
              <span>شروط وسياسة الحجز</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4 font-medium">
              • العرض ساري لمدة 4 أيام فقط (الأربعاء، الخميس، الجمعة، والسبت).<br />
              • متاح لأول 10 بنات فقط بكل فرع.<br />
              • تأكيد العرض يتطلب دفع عربون 150 جنيه عبر إنستاباي وإرسال الإيصال واتساب.<br />
              • الشعر الإفريقي خارج العرض.
            </p>

            <a
              href="https://www.facebook.com/profile.php?id=100076153371113"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-full text-xs font-bold transition-all border border-slate-700"
            >
              <Facebook className="w-4 h-4 text-[#1877F2]" />
              <span>صفحتنا على فيسبوك</span>
            </a>
          </div>

        </div>

        {/* Bottom Credits Bar */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} {settings.storeName}. جميع الحقوق محفوظة.
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <span>صالون تجميل آية هبولة للعناية بالشعر والصبغات الملكية</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

