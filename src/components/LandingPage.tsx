import React, { useState } from 'react';
import { AuthForm } from './AuthForm';
import { BookOpen, Sparkles, Zap, Shield, ArrowRight } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#292524] flex items-center justify-center">
            <BookOpen size={16} className="text-[#FAFAF9]" />
          </div>
          <span className="font-body text-xl font-semibold text-[#292524]">Lumen</span>
        </div>
      </header>

      {/* Hero Section */}
      <main className="px-6 py-12 lg:py-20 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left: Hero Text */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3C5F5A]/10 text-[#3C5F5A] font-ui text-xs font-medium uppercase tracking-wider">
              <Sparkles size={14} />
              <span>Think better, write smarter</span>
            </div>
            
            <h1 className="font-body text-5xl lg:text-6xl font-semibold text-[#292524] leading-tight">
              A thinking space for{' '}
              <span className="relative">
                <span className="relative z-10">clarity</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                  <path d="M2 6C50 2 150 2 198 6" stroke="#3C5F5A" strokeWidth="2" strokeLinecap="round" strokeDasharray="8 4" />
                </svg>
              </span>
            </h1>
            
            <p className="font-body text-xl text-[#78716C] leading-relaxed max-w-lg">
              Lumen is a minimalist writing environment designed for deep thinking. 
              Capture ideas, explore thoughts, and find clarity in a distraction-free space.
            </p>

            {/* Features */}
            <div className="grid sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-sm bg-[#F5F5F4] flex items-center justify-center flex-shrink-0">
                  <Zap size={16} className="text-[#3C5F5A]" />
                </div>
                <div>
                  <h3 className="font-ui text-sm font-medium text-[#292524]">Lightning Fast</h3>
                  <p className="font-ui text-xs text-[#78716C]">Capture thoughts instantly</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-sm bg-[#F5F5F4] flex items-center justify-center flex-shrink-0">
                  <Shield size={16} className="text-[#3C5F5A]" />
                </div>
                <div>
                  <h3 className="font-ui text-sm font-medium text-[#292524]">Private by Design</h3>
                  <p className="font-ui text-xs text-[#78716C]">End-to-end encrypted</p>
                </div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="pt-4 flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-[#E7E5E4] border-2 border-[#FAFAF9]" />
                ))}
              </div>
              <p className="font-ui text-sm text-[#78716C]">
                Join <span className="font-medium text-[#292524]">2,000+</span> thinkers
              </p>
            </div>
          </div>

          {/* Right: Auth Form */}
          <div className="flex justify-center lg:justify-end">
            <AuthForm mode={authMode} onModeChange={setAuthMode} />
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <p className="font-ui text-sm text-[#A8A29E] uppercase tracking-widest mb-4">
            Trusted by thinkers worldwide
          </p>
          <div className="flex items-center justify-center gap-8 opacity-50 grayscale">
            <span className="font-body text-xl font-semibold">Notion</span>
            <span className="font-body text-xl font-semibold">Obsidian</span>
            <span className="font-body text-xl font-semibold">Roam</span>
            <span className="font-body text-xl font-semibold">Craft</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-[#E7E5E4] mt-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="font-ui text-xs text-[#A8A29E]">
            © 2026 Lumen. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="font-ui text-xs text-[#78716C] hover:text-[#292524] transition-colors">Privacy</a>
            <a href="#" className="font-ui text-xs text-[#78716C] hover:text-[#292524] transition-colors">Terms</a>
            <a href="#" className="font-ui text-xs text-[#78716C] hover:text-[#292524] transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
