import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Lock, Mail, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        success('Welcome back to IntelliCart!');
        navigate(redirectPath, { replace: true });
      } else {
        setErrorMessage(res.message || 'Invalid credentials');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail, quickPassword) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-2.5 group">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform text-white">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-slate-900">
            IntelliCart
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-extrabold text-slate-900 tracking-tight">
          Sign in to your account
        </h2>
        <p className="mt-2 text-xs text-slate-500">
          Or{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-500">
            create a new account for personalized recommendations
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl border border-slate-100 rounded-3xl">
          
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-hidden text-slate-900"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-500"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-hidden text-slate-900"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-brand-600/30 transition-all hover:scale-102 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Demonstration Quick Login Personas */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Demo Accounts (Viva Testing)
              </span>
              <UserCheck className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@intellicart.com', 'admin123')}
                className="p-2 text-left bg-amber-50 hover:bg-amber-100/80 text-amber-900 rounded-lg border border-amber-200/60 font-medium transition-colors"
              >
                <span className="font-bold block">Admin Account</span>
                <span className="text-[10px] text-amber-700">admin@intellicart.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('rahul.tech@example.com', 'password123')}
                className="p-2 text-left bg-blue-50 hover:bg-blue-100/80 text-blue-900 rounded-lg border border-blue-200/60 font-medium transition-colors"
              >
                <span className="font-bold block">Tech Persona</span>
                <span className="text-[10px] text-blue-700">rahul.tech@example.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('priya.fashion@example.com', 'password123')}
                className="p-2 text-left bg-rose-50 hover:bg-rose-100/80 text-rose-900 rounded-lg border border-rose-200/60 font-medium transition-colors"
              >
                <span className="font-bold block">Fashion Persona</span>
                <span className="text-[10px] text-rose-700">priya.fashion@example.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('anita.fit@example.com', 'password123')}
                className="p-2 text-left bg-emerald-50 hover:bg-emerald-100/80 text-emerald-900 rounded-lg border border-emerald-200/60 font-medium transition-colors"
              >
                <span className="font-bold block">Fitness Persona</span>
                <span className="text-[10px] text-emerald-700">anita.fit@example.com</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
