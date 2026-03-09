'use client';

import React, { useState } from 'react';
import { Mail, Lock, User, Building2, GraduationCap, UserPlus } from 'lucide-react';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { BrutalInput } from '@/components/ui/BrutalInput';
import { COLORS } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onSuccess: () => void;
}

export function RegisterForm({ onSwitchToLogin, onSuccess }: RegisterFormProps) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState<string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register(
      email,
      password,
      name,
      department,
      year ? parseInt(year) : null
    );
    setLoading(false);

    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-3.5">
      {error && (
        <div className="bg-red-100 border-[2px] border-black p-3 rounded-xl text-[10px] font-bold text-red-800">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Full Name</label>
        <BrutalInput placeholder="Alex Johnson" icon={User} value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} required />
      </div>
      <div className="space-y-1.5">
        <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Email</label>
        <BrutalInput placeholder="you@campus.edu.in" icon={Mail} type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Department</label>
          <BrutalInput placeholder="Computer Science" icon={Building2} value={department} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDepartment(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Year</label>
          <BrutalInput placeholder="e.g. 2" icon={GraduationCap} type="number" value={year} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setYear(e.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Password</label>
        <BrutalInput placeholder="Min 6 characters" icon={Lock} type="password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} required />
      </div>
      <div className="space-y-1.5">
        <label className="font-black uppercase text-[9px] tracking-widest opacity-40 italic">Confirm Password</label>
        <BrutalInput placeholder="Repeat password" icon={Lock} type="password" value={confirmPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)} required />
      </div>

      <BrutalButton
        className="w-full py-3 text-[11px] mt-2"
        color={COLORS.teal}
        type="submit"
        disabled={loading}
      >
        {loading ? 'Creating Account...' : <><UserPlus className="w-4 h-4" /> Create Account</>}
      </BrutalButton>

      <div className="text-center pt-2">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-[9px] font-bold uppercase opacity-40 italic cursor-pointer hover:opacity-100 transition-opacity underline"
        >
          Already have an account? Sign In
        </button>
      </div>
    </form>
  );
}
