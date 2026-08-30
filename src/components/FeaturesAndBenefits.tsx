import React from 'react';
import { Sparkles, ShieldCheck, Heart, Award, Flame } from 'lucide-react';

export const FeaturesAndBenefits: React.FC = () => {
  const benefits = [
    {
      title: 'جلسات الكافيار والأرجان الأصلي 100%',
      desc: 'مواد تغذية وفرد وترميم مستوردة عالية الجودة تمنح شعرك نعومة ولمعاناً لا يقاوم بدون أية أضرار.',
      icon: Sparkles
    },
    {
      title: 'صبغات بروفيشنال خالية من الأمونيا الحارقة',
      desc: 'صبغة متجانسة وثابتة تدوم طويلاً مع ألوان غنية وجذابة تحافظ على مرونة وترطيب ألياف الشعر.',
      icon: Heart
    },
    {
      title: 'فريق متخصص بقيادة آية هبولة',
      desc: 'خبرة طويلة في عالم تجميل وتصفيف الشعر بأحدث التقنيات وأعلى معايير النظافة والتعقيم.',
      icon: Award
    },
    {
      title: 'هدية مجانية مؤكدة في كل حجز 🎁',
      desc: 'بالإضافة لمجموعة الشامبو والبلسم، لكِ سحب مؤكد على ساعة حظ هبولة لخدمة تجميل إضافية مجاناً!',
      icon: Flame
    }
  ];

  return (
    <section id="benefits-section" className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 bg-[#FF6600]/10 text-[#FF6600] border border-[#FF6600]/20 px-3.5 py-1 rounded-full text-xs font-black mb-3">
            <ShieldCheck className="w-4 h-4 text-[#FF6600]" />
            <span>لماذا تختارين صالون آية هبولة؟</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
            العناية الملكية التي يستحقها شعرك 👑
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 font-medium">
            نضمن لكِ أفضل تجربة تجميلية ونتائج مبهرة تدوم طويلاً من أول جلسة
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {benefits.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200 hover:border-[#FF6600] rounded-3xl p-6 text-right transition-all hover:shadow-xl hover:-translate-y-1 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white group-hover:bg-[#FF6600] text-[#FF6600] group-hover:text-white border border-slate-200 group-hover:border-[#FF6600] flex items-center justify-center mb-4 transition-all shadow-sm">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{item.desc}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

