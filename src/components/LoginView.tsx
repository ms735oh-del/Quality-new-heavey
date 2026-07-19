/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, Mail, ShieldAlert, Globe, Loader2, ArrowRight, ArrowLeft, UserPlus, LogIn, Briefcase, User as UserIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { dbService } from '../services/db';

interface LoginViewProps {
  onLoginSuccess: (email: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const { language, setLanguage, activeInstitution, setActiveInstitution, institutions } = useApp();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [languageState, setLanguageState] = useState<'ar' | 'en'>(language || 'ar');

  // Login inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Signup inputs
  const [signupName, setSignupName] = useState('');
  const [signupNameAr, setSignupNameAr] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupDept, setSignupDept] = useState('Computer Science');
  const [signupDeptAr, setSignupDeptAr] = useState('علوم الحاسب');
  const [signupRole, setSignupRole] = useState<'Lecturer' | 'Student' | 'Guest'>('Lecturer');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const isRTL = languageState === 'ar';

  const toggleLanguage = () => {
    const next = languageState === 'ar' ? 'en' : 'ar';
    setLanguageState(next);
    setLanguage(next);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    setTimeout(() => {
      const sanitizedEmail = email.trim().toLowerCase();
      
      // Check if Director
      if (sanitizedEmail === 'lztalaslamqadm@gmail.com' || sanitizedEmail === 'iztalaslamqadm@gmail.com') {
        if (password === 'Aura@2026') {
          onLoginSuccess(sanitizedEmail);
        } else {
          setError(
            isRTL
              ? 'خطأ: كلمة المرور لحساب المدير العام غير صحيحة!'
              : 'Error: Invalid password for the General Director account!'
          );
          setLoading(false);
        }
        return;
      }

      // Check other users
      const instUsers = dbService.getUsers(activeInstitution.id);
      const matchedUser = instUsers.find(u => u.email.toLowerCase() === sanitizedEmail);

      if (matchedUser) {
        const storedPassword = dbService.getPassword(sanitizedEmail);
        if (password === storedPassword) {
          onLoginSuccess(sanitizedEmail);
        } else {
          setError(
            isRTL
              ? 'خطأ: كلمة المرور المدخلة غير صحيحة.'
              : 'Error: Invalid password.'
          );
          setLoading(false);
        }
      } else {
        setError(
          isRTL
            ? 'خطأ: البريد الإلكتروني غير مسجل في هذه الجامعة. يمكنك إنشاء حساب جديد.'
            : 'Error: Email not found in this institution. Please register first.'
        );
        setLoading(false);
      }
    }, 800);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!signupName || !signupEmail || !signupPassword) {
      setError(isRTL ? 'الرجاء تعبئة جميع الحقول المطلوبة!' : 'Please fill in all required fields!');
      setLoading(false);
      return;
    }

    setTimeout(() => {
      const sanitizedEmail = signupEmail.trim().toLowerCase();

      // Avoid registering with director email
      if (sanitizedEmail === 'lztalaslamqadm@gmail.com' || sanitizedEmail === 'iztalaslamqadm@gmail.com') {
        setError(
          isRTL
            ? 'خطأ: لا يمكن التسجيل باستخدام البريد الإلكتروني الخاص بمدير النظام!'
            : 'Error: Cannot register using the Platform Director email!'
        );
        setLoading(false);
        return;
      }

      const instUsers = dbService.getUsers(activeInstitution.id);
      const alreadyExists = instUsers.some(u => u.email.toLowerCase() === sanitizedEmail);

      if (alreadyExists) {
        setError(
          isRTL
            ? 'خطأ: هذا البريد الإلكتروني مسجل بالفعل في النظام.'
            : 'Error: This email address is already registered.'
        );
        setLoading(false);
        return;
      }

      // Register user in local database
      dbService.addUser({
        institutionId: activeInstitution.id,
        name: signupName,
        arabicName: signupNameAr || signupName,
        email: sanitizedEmail,
        role: signupRole,
        avatar: signupRole === 'Student' ? '👨‍🎓' : signupRole === 'Lecturer' ? '👨‍🏫' : '👤',
        department: signupDept,
        arabicDepartment: signupDeptAr || signupDept,
        active: true
      }, 'guest', 'Anonymous Sign Up', signupRole);

      // Save password
      dbService.setPassword(sanitizedEmail, signupPassword);

      setSuccess(
        isRTL
          ? 'تم إنشاء حسابك بنجاح! يمكنك الآن تسجيل الدخول.'
          : 'Account created successfully! You can now log in.'
      );
      setEmail(sanitizedEmail);
      setPassword(signupPassword);
      setMode('login');
      setLoading(false);
    }, 1000);
  };

  return (
    <div
      className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans text-slate-100"
      style={{ direction: isRTL ? 'rtl' : 'ltr' }}
    >
      {/* Background Decorative Rings */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Floating Language Switcher */}
      <div className="absolute top-6 right-6 left-auto">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/40 border border-slate-700/50 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer text-white"
        >
          <Globe className="w-4 h-4 text-indigo-400" />
          <span>{isRTL ? 'English' : 'العربية'}</span>
        </button>
      </div>

      <div className="max-w-md w-full bg-slate-950/60 backdrop-blur-md border border-slate-800 rounded-2xl p-8 space-y-6 shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white rounded-2xl flex items-center justify-center font-bold text-2xl mx-auto shadow-lg shadow-indigo-500/20">
            🎓
          </div>
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
              {isRTL ? 'منصة أورا للجودة والاعتماد' : 'AURA Quality & Accreditation'}
            </h1>
            <p className="text-xs text-slate-400">
              {isRTL ? 'نظام إدارة الجودة الأكاديمية والمؤسسية الموحد' : 'Unified Academic Quality Management System'}
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'login' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>{isRTL ? 'تسجيل دخول' : 'Sign In'}</span>
          </button>
          <button
            onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'signup' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>{isRTL ? 'إنشاء حساب جديد' : 'Sign Up'}</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        {/* Login Form */}
        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            {/* Institution / Tenant Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 block">
                {isRTL ? 'الجامعة / المؤسسة المستهدفة' : 'Target University / Institution'}
              </label>
              <select
                value={activeInstitution.id}
                onChange={(e) => setActiveInstitution(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-semibold"
              >
                {institutions.map(inst => (
                  <option key={inst.id} value={inst.id}>
                    {inst.logo} &nbsp; {isRTL ? inst.arabicName : inst.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Info Hint about Director Password and demo */}
            <div className="p-3.5 bg-indigo-500/5 border border-indigo-500/15 rounded-xl space-y-1.5 text-[11px] text-indigo-300">
              <div className="font-bold flex items-center gap-1.5 text-indigo-200">
                <span>🔑</span>
                <span>{isRTL ? 'بيانات الوصول للمدير والأعضاء:' : 'Access Information:'}</span>
              </div>
              <div className="space-y-1">
                <p>
                  <strong>{isRTL ? 'مدير المنصة:' : 'Platform Admin:'}</strong>{' '}
                  <code className="text-white bg-slate-900 px-1.5 py-0.5 rounded font-mono">lztalaslamqadm@gmail.com</code>
                </p>
                <p>
                  <strong>{isRTL ? 'كلمة مرور المدير الآمنة:' : 'Director Password:'}</strong>{' '}
                  <code className="text-white bg-slate-900 px-1.5 py-0.5 rounded font-mono font-bold text-emerald-400">Aura@2026</code>
                </p>
                <p className="text-[10px] text-slate-400 border-t border-indigo-500/10 pt-1">
                  {isRTL 
                    ? '💡 يمكن لأي شخص آخر إنشاء حساب مستخدم عادي وتعيين كلمة المرور الخاصة به فوراً.'
                    : '💡 Anyone else can register a regular user account and set their own secure password immediately.'}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 block">
                {isRTL ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <div className="relative">
                <span className={`absolute inset-y-0 ${isRTL ? 'right-3' : 'left-3'} flex items-center text-slate-500`}>
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="lztalaslamqadm@gmail.com"
                  className={`w-full bg-slate-900 border border-slate-800 rounded-xl py-3 ${
                    isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'
                  } text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-mono`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 block">
                {isRTL ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <span className={`absolute inset-y-0 ${isRTL ? 'right-3' : 'left-3'} flex items-center text-slate-500`}>
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full bg-slate-900 border border-slate-800 rounded-xl py-3 ${
                    isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'
                  } text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:bg-indigo-600/50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isRTL ? (
                <ArrowRight className="w-4 h-4 rotate-180" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              <span>{loading ? (isRTL ? 'جاري التحقق من الصلاحيات...' : 'Authenticating...') : (isRTL ? 'تسجيل الدخول الآمن' : 'Secure Login')}</span>
            </button>
          </form>
        ) : (
          /* Signup Form */
          <form onSubmit={handleSignup} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 block">
                  {isRTL ? 'الاسم بالإنجليزية' : 'Name (English)'}
                </label>
                <div className="relative">
                  <span className={`absolute inset-y-0 ${isRTL ? 'right-3' : 'left-3'} flex items-center text-slate-500`}>
                    <UserIcon className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Dr. Ahmed Ali"
                    className={`w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 ${
                      isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'
                    } text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 block">
                  {isRTL ? 'الاسم بالعربية' : 'Name (Arabic)'}
                </label>
                <input
                  type="text"
                  required
                  value={signupNameAr}
                  onChange={(e) => setSignupNameAr(e.target.value)}
                  placeholder="مثال: د. أحمد علي"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-right"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 block">
                {isRTL ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <div className="relative">
                <span className={`absolute inset-y-0 ${isRTL ? 'right-3' : 'left-3'} flex items-center text-slate-500`}>
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="ahmed@example.com"
                  className={`w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 ${
                    isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'
                  } text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-mono`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 block">
                {isRTL ? 'كلمة المرور الآمنة' : 'Secure Password'}
              </label>
              <div className="relative">
                <span className={`absolute inset-y-0 ${isRTL ? 'right-3' : 'left-3'} flex items-center text-slate-500`}>
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 ${
                    isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'
                  } text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 block">
                  {isRTL ? 'القسم (English)' : 'Department (En)'}
                </label>
                <div className="relative">
                  <span className={`absolute inset-y-0 ${isRTL ? 'right-3' : 'left-3'} flex items-center text-slate-500`}>
                    <Briefcase className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={signupDept}
                    onChange={(e) => setSignupDept(e.target.value)}
                    placeholder="Computer Science"
                    className={`w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 ${
                      isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'
                    } text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 block">
                  {isRTL ? 'القسم بالعربية' : 'Department (Ar)'}
                </label>
                <input
                  type="text"
                  required
                  value={signupDeptAr}
                  onChange={(e) => setSignupDeptAr(e.target.value)}
                  placeholder="علوم الحاسب الآلي"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-right"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 block">
                {isRTL ? 'دور المستخدم الافتراضي' : 'User Role'}
              </label>
              <select
                value={signupRole}
                onChange={(e) => setSignupRole(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              >
                <option value="Lecturer">{isRTL ? 'عضو هيئة تدريس / محاضر' : 'Lecturer'}</option>
                <option value="Student">{isRTL ? 'طالب' : 'Student'}</option>
                <option value="Guest">{isRTL ? 'زائر / مستخدم عام' : 'Guest / External Reviewer'}</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-3 disabled:bg-indigo-600/50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              <span>{loading ? (isRTL ? 'جاري تسجيل حسابك الأكاديمي...' : 'Creating Account...') : (isRTL ? 'إتمام التسجيل والتشغيل' : 'Register & Setup Account')}</span>
            </button>
          </form>
        )}

        <div className="border-t border-slate-900 pt-4 text-center">
          <p className="text-[10px] text-slate-500">
            {isRTL
              ? 'تخضع كافة مدخلاتك لمعايير عزل المستأجر الأمنية لضمان سرية الجودة والاعتماد.'
              : 'All variables are completely isolated within your sandbox container.'}
          </p>
        </div>
      </div>

      <div className="mt-8 text-center text-[10px] text-slate-600 space-y-1">
        <p>© {new Date().getFullYear()} AURA Academic Quality Assurance SaaS. All rights reserved.</p>
        <p>{isRTL ? 'معايير أمان معتمدة ومطابقة لمجلس التعليم العالي' : 'SaaS Infrastructure aligned with Higher Education Security Standards'}</p>
      </div>
    </div>
  );
};
