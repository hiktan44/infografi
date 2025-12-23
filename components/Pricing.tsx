
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { Check, Zap, Crown, Rocket } from 'lucide-react';

interface PricingProps {
  onSelectPlan: (plan: string) => void;
}

const Pricing: React.FC<PricingProps> = ({ onSelectPlan }) => {
  const plans = [
    {
      name: "Başlangıç",
      price: "Ücretsiz",
      description: "Temel analizler için ideal",
      features: ["720p Çözünürlük", "Günde 3 Görsel", "Standart Modeller", "Topluluk Desteği"],
      icon: Rocket,
      color: "border-slate-800",
      button: "Ücretsiz Başla"
    },
    {
      name: "Pro",
      price: "₺500",
      period: "/ay",
      description: "Profesyonel içerik üreticileri için",
      features: ["2K Ultra HD Çözünürlük", "Sınırsız Görsel", "Gemini 3 Pro Erişimi", "Dikey & Yatay Formatlar", "Öncelikli İşleme"],
      icon: Zap,
      color: "border-orange-500 shadow-neon-orange",
      button: "Pro'ya Geç",
      popular: true
    },
    {
      name: "Kurumsal",
      price: "Özel",
      description: "Şirketler ve büyük takımlar için",
      features: ["4K Çözünürlük", "API Erişimi", "Özel Tasarım Stilleri", "7/24 Teknik Destek", "SLA Garantisi"],
      icon: Crown,
      color: "border-violet-500",
      button: "Bize Ulaşın"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 animate-in fade-in duration-700">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Planınızı Seçin</h2>
        <p className="text-slate-400 text-lg">Yüksek kaliteli infografikler için ihtiyacınız olan gücü seçin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.name}
            className={`glass-panel rounded-3xl p-8 border-2 transition-all hover:scale-105 flex flex-col ${plan.color}`}
          >
            {plan.popular && (
              <div className="bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit mb-4">
                En Popüler
              </div>
            )}
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <plan.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">{plan.price}</span>
                  {plan.period && <span className="text-slate-500 text-sm">{plan.period}</span>}
                </div>
              </div>
            </div>
            
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">{plan.description}</p>
            
            <div className="space-y-4 mb-10 flex-1">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-slate-300">{feature}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => onSelectPlan(plan.name)}
              className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                plan.popular 
                ? 'bg-orange-500 text-white shadow-lg hover:bg-orange-600' 
                : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
              }`}
            >
              {plan.button}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-20 p-8 glass-panel rounded-[2rem] border border-white/5 text-center">
        <p className="text-slate-500 text-sm font-mono">
          Güvenli ödeme altyapımız <span className="text-white">Stripe</span> ve <span className="text-white">iyzico</span> tarafından sağlanmaktadır.
        </p>
      </div>
    </div>
  );
};

export default Pricing;
