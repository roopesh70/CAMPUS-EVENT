'use client';

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { BrutalCard } from '@/components/ui/BrutalCard';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { BrutalInput } from '@/components/ui/BrutalInput';
import { COLORS } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSuccess: () => void;
  showRegisterLink?: boolean;
}

export function LoginForm({ onSwitchToRegister, onSuccess, showRegisterLink = true }: LoginFormProps) {
  const { login, loginWithGoogle, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    const result = await loginWithGoogle();
    setLoading(false);
    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || 'Google login failed');
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Enter your email to reset password');
      return;
    }
    const result = await resetPassword(email);
    if (result.success) {
      setResetSent(true);
      setError('');
    } else {
      setError(result.error || 'Reset failed');
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && (
        <div className="bg-red-100 border-[2px] border-black p-3 rounded-xl text-[10px] font-bold text-red-800">
          {error}
        </div>
      )}
      {resetSent && (
        <div className="bg-green-100 border-[2px] border-black p-3 rounded-xl text-[10px] font-bold text-green-800">
          Password reset email sent! Check your inbox.
        </div>
      )}

      <div className="space-y-1.5">
        <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Email</label>
        <BrutalInput
          placeholder="you@campus.edu.in"
          icon={Mail}
          type="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Password</label>
        <div className="relative">
          <BrutalInput
            placeholder="••••••••"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            icon={Lock}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <BrutalButton
        className="w-full py-3 text-[11px]"
        color={COLORS.yellow}
        type="submit"
        disabled={loading}
      >
        {loading ? 'Signing in...' : <><LogIn className="w-4 h-4" /> Sign In</>}
      </BrutalButton>

      <div className="relative flex items-center justify-center my-4">
        <div className="border-t-[2px] border-black border-opacity-10 w-full"></div>
        <span className="bg-white px-3 text-[8px] font-black uppercase opacity-30 absolute">or</span>
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        className="w-full border-[2.5px] border-black p-2.5 rounded-xl font-black uppercase text-[10px] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all flex items-center justify-center gap-2 bg-white"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continue with Google
      </button>

      <div className="flex justify-between items-center pt-2">
        <button
          type="button"
          onClick={handleResetPassword}
          className="text-[9px] font-bold uppercase opacity-40 italic cursor-pointer hover:opacity-100 transition-opacity underline"
        >
          Forgot Password?
        </button>
        {showRegisterLink && (
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-[9px] font-bold uppercase opacity-40 italic cursor-pointer hover:opacity-100 transition-opacity underline"
          >
            Create Account
          </button>
        )}
      </div>
    </form>
  );
}
