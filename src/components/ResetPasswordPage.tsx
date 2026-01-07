import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { updatePassword } from '../supabase';
import { Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearError } = useAuth();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');

  const token = searchParams.get('token');
  const type = searchParams.get('type');

  React.useEffect(() => {
    if (!token || type !== 'recovery') {
      setError('Invalid or expired reset link. Please request a new password reset.');
    }
    clearError();
  }, [token, type, clearError]);

  const validateForm = () => {
    if (!password) {
      setFormError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setError('');
    setSuccess(false);

    if (!validateForm()) return;

    setLoading(true);

    try {
      const { error: updateError } = await updatePassword(password);
      
      if (updateError) {
        setFormError(updateError.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          navigate('/app');
        }, 3000);
      }
    } catch (err) {
      setFormError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-sm shadow-xl shadow-[#292524]/5 border border-[#E7E5E4] p-8">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} className="text-red-600" />
            </div>
            <h2 className="font-body text-xl font-semibold text-[#292524] mb-2">
              Invalid Reset Link
            </h2>
            <p className="font-body text-[#78716C] mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-[#292524] text-[#FAFAF9] px-6 py-3 rounded-sm font-ui text-sm font-medium uppercase tracking-wider hover:bg-[#1C1917] transition-all inline-flex items-center gap-2"
            >
              Go to Home
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-sm shadow-xl shadow-[#292524]/5 border border-[#E7E5E4] p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-full bg-[#FAFAF9] border border-[#E7E5E4] flex items-center justify-center mx-auto mb-4">
              <Lock size={20} className="text-[#3C5F5A]" />
            </div>
            <h2 className="font-body text-2xl font-semibold text-[#292524]">
              Set New Password
            </h2>
            <p className="font-ui text-sm text-[#78716C] mt-2">
              Enter your new password below
            </p>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-sm flex items-start gap-3">
              <CheckCircle size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-ui text-sm text-emerald-700 font-medium">Password Updated!</p>
                <p className="font-ui text-xs text-emerald-600 mt-1">
                  Redirecting to your notes...
                </p>
              </div>
            </div>
          )}

          {(formError || error) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-sm flex items-start gap-3">
              <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
              <p className="font-ui text-sm text-red-700">{formError || error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-ui text-xs font-medium text-[#78716C] uppercase tracking-wider mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#FAFAF9] border border-[#E7E5E4] rounded-sm py-3 pl-12 pr-4 font-body text-[#292524] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#3C5F5A] focus:ring-1 focus:ring-[#3C5F5A] transition-all"
                  placeholder="••••••••"
                  disabled={success}
                />
              </div>
            </div>

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
                  disabled={success}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-[#292524] text-[#FAFAF9] py-3 rounded-sm font-ui text-sm font-medium uppercase tracking-wider hover:bg-[#1C1917] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-[#FAFAF9]/30 border-t-[#FAFAF9] rounded-full animate-spin" />
              ) : (
                <>
                  Update Password
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#E7E5E4]">
            <button
              onClick={() => navigate('/')}
              className="w-full text-center font-ui text-sm text-[#78716C] hover:text-[#292524] transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
