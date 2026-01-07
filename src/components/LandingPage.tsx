import React, { useState } from 'react';
import { AuthForm } from './AuthForm';

export const LandingPage: React.FC = () => {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <img src="/lumen-logo.svg" alt="Lumen" className="w-8 h-8" />
          <span className="font-body text-xl font-semibold text-[#292524]">Lumen</span>
        </div>
      </header>

      {/* Hero Section */}
      <main className="px-6 py-12 lg:py-20 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left: Hero Text */}
          <div className="space-y-8">
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

            {/* Social Proof */}
            <div className="pt-4 flex items-center gap-4">
              <p className="font-ui text-sm text-[#78716C]">
                Join thousands of thinkers who use Lumen
              </p>
            </div>
          </div>

          {/* Right: Auth Form */}
          <div className="flex justify-center lg:justify-end">
            <AuthForm mode={authMode} onModeChange={setAuthMode} />
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
          </div>
        </div>
      </footer>
    </div>
  );
};
