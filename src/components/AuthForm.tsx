import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PenTool, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

interface AuthFormProps {
  mode: 'login' | 'signup' | 'forgot';
  onModeChange: (mode: 'login' | 'signup' | 'forgot') => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode, onModeChange }) => {
  const { signIn, signUp, resetPassword, error, clearError } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');

  const validateForm = () => {
    if (!email) {
      setFormError('Email is required');
      return false;
    }
    if (!email.includes('@')) {
      setFormError('Please enter a valid email');
      return false;
    }
    if (mode !== 'forgot') {
      if (!password) {
        setFormError('Password is required');
        return false;
      }
      if (password.length < 6) {
        setFormError('Password must be at least 6 characters');
        return false;
      }
      if (mode === 'signup' && password !== confirmPassword) {
        setFormError('Passwords do not match');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setFormError('');
    setSuccessMessage('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          setFormError(error.message);
        } else {
          navigate('/app');
        }
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password);
        if (error) {
          setFormError(error.message);
        } else {
          setSuccessMessage('Check your email to confirm your account!');
        }
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          setFormError(error.message);
        } else {
          setSuccessMessage('Password reset link sent to your email!');
        }
      }
    } catch (err) {
      setFormError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-sm shadow-xl shadow-[#292524]/5 border border-[#E7E5E4] p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FAFAF9] border border-[#E7E5E4] mb-4">
            <PenTool size={20} className="text-[#3C5F5A]" />
          </div>
          <h2 className="font-body text-2xl font-semibold text-[#292524]">
            {mode === 'login' && 'Welcome back'}
            {mode === 'signup' && 'Create your account'}
            {mode === 'forgot' && 'Reset your password'}
          </h2>
          <p className="font-ui text-sm text-[#78716C] mt-2">
            {mode === 'login' && 'Sign in to access your thoughts'}
            {mode === 'signup' && 'Start capturing your ideas'}
            {mode === 'forgot' && 'We\'ll send you a reset link'}
          </p>
        </div>

        {(formError || error) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-sm flex items-start gap-3">
            <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
            <p className="font-ui text-sm text-red-700">{formError || error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-sm">
            <p className="font-ui text-sm text-emerald-700">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-ui text-xs font-medium text-[#78716C] uppercase tracking-wider mb-2">
              Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FAFAF9] border border-[#E7E5E4] rounded-sm py-3 pl-12 pr-4 font-body text-[#292524] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#3C5F5A] focus:ring-1 focus:ring-[#3C5F5A] transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <label className="block font-ui text-xs font-medium text-[#78716C] uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#FAFAF9] border border-[#E7E5E4] rounded-sm py-3 pl-12 pr-4 font-body text-[#292524] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#3C5F5A] focus:ring-1 focus:ring-[#3C5F5A] transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block font-ui text-xs font-medium text-[#78716C] uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#FAFAF9] border border-[#E7E5E4] rounded-sm py-3 pl-12 pr-4 font-body text-[#292524] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#3C5F5A] focus:ring-1 focus:ring-[#3C5F5A] transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          {mode === 'forgot' && (
            <p className="font-ui text-sm text-[#78716C]">
              Enter your email and we'll send you a link to reset your password.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#292524] text-[#FAFAF9] py-3 rounded-sm font-ui text-sm font-medium uppercase tracking-wider hover:bg-[#1C1917] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-[#FAFAF9]/30 border-t-[#FAFAF9] rounded-full animate-spin" />
            ) : (
              <>
                {mode === 'login' && 'Sign In'}
                {mode === 'signup' && 'Create Account'}
                {mode === 'forgot' && 'Send Reset Link'}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#E7E5E4]">
          <p className="font-ui text-sm text-[#78716C] text-center">
            {mode === 'login' && (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => { clearError(); setFormError(''); onModeChange('signup'); }}
                  className="text-[#3C5F5A] hover:underline font-medium"
                >
                  Sign up
                </button>
              </>
            )}
            {mode === 'signup' && (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => { clearError(); setFormError(''); onModeChange('login'); }}
                  className="text-[#3C5F5A] hover:underline font-medium"
                >
                  Sign in
                </button>
              </>
            )}
            {mode === 'forgot' && (
              <>
                Remember your password?{' '}
                <button
                  onClick={() => { clearError(); setFormError(''); onModeChange('login'); }}
                  className="text-[#3C5F5A] hover:underline font-medium"
                >
                  Sign in
                </button>
              </>
            )}
          </p>

          {mode === 'login' && (
            <p className="font-ui text-sm text-[#78716C] text-center mt-3">
              <button
                onClick={() => { clearError(); setFormError(''); onModeChange('forgot'); }}
                className="text-[#A8A29E] hover:text-[#78716C] transition-colors"
              >
                Forgot your password?
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
