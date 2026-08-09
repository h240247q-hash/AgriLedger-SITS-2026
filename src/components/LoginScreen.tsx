import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { DEFAULT_PROFILES } from '../data/defaultProfiles';
import { loginUserApi, registerUserApi } from '../api/client';
import {
  ShieldCheck,
  UserCheck,
  Key,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  Sparkles,
  Building2,
  Truck,
  Sprout,
  Landmark,
  Eye,
  EyeOff,
  UserPlus,
  Lock,
  Mail,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Tractor
} from 'lucide-react';

import tractorImg from '../assets/images/tractor_hero_bg_1785235529303.jpg';

interface LoginScreenProps {
  onLogin: (profile: UserProfile) => void;
  onOpenUssdModal?: () => void;
  onNewFarmerRegistered?: (farmerName: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onOpenUssdModal, onNewFarmerRegistered }) => {
  const [authTab, setAuthTab] = useState<'welcome' | 'association' | 'signin' | 'signup' | 'personas'>('signin');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState<string>('kudzaishe.mupotaringa@agri-forge.net');
  const [loginPassword, setLoginPassword] = useState<string>('password123');

  // Sign up form state
  const [signUpName, setSignUpName] = useState<string>('');
  const [signUpEmail, setSignUpEmail] = useState<string>('');
  const [signUpPhone, setSignUpPhone] = useState<string>('');
  const [signUpLocation, setSignUpLocation] = useState<string>('Murehwa Ward 12');
  const [signUpOrganization, setSignUpOrganization] = useState<string>('Murehwa Smallholder Cooperative');
  const [signUpRole, setSignUpRole] = useState<UserRole>('farmer');
  const [signUpPassword, setSignUpPassword] = useState<string>('');

  // UI States
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handle Quick Demo Persona Select
  const handlePersonaSelect = (role: UserRole) => {
    const profile = DEFAULT_PROFILES[role];
    onLogin(profile);
  };

  // Handle Real Database Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await loginUserApi(loginEmail, loginPassword);
      if (response.success && response.user) {
        const u = response.user;
        const profile: UserProfile = {
          id: String(u.id || Date.now()),
          name: u.name || 'AgriUser',
          role: (u.role as UserRole) || 'farmer',
          email: u.email || loginEmail,
          phone: u.phone || '+263770000000',
          location: u.location || 'Harare',
          organization: u.organization || 'Murehwa Smallholder Cooperative',
          avatarInitials: (u.name || 'AU')
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase(),
        };
        onLogin(profile);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check credentials or register first.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Real Database Sign Up (Register Farmer into Smallholder Association & Refer to Sign In)
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpName || (!signUpEmail && !signUpPhone) || !signUpPassword) {
      setErrorMessage('Please fill in your full name, email or phone, and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const finalEmail = signUpEmail || `${signUpName.toLowerCase().replace(/\s+/g, '.')}@smallholder.zw`;
      const response = await registerUserApi({
        email: finalEmail,
        password: signUpPassword,
        name: signUpName,
        role: signUpRole,
        location: signUpLocation || 'Murehwa Ward 12',
        organization: signUpOrganization || 'Smallholder Farmers Association',
        phone: signUpPhone || '+263771234567',
      });

      if (response.success && response.user) {
        // Pre-fill login credentials for seamless Sign In
        setLoginEmail(finalEmail);
        setLoginPassword(signUpPassword);

        // Notify parent system of new farmer registration
        if (onNewFarmerRegistered) {
          onNewFarmerRegistered(signUpName);
        }

        setSuccessMessage(
          `🎉 REGISTRATION CONFIRMED! Welcome to the Smallholder's Association, ${signUpName}! Your farmer account details have been saved in the database. You are now referred to sign in with your password below.`
        );

        // Refer registered farmer to Sign In screen
        setTimeout(() => {
          setAuthTab('signin');
        }, 1800);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Check if email/phone already exists in database.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'farmer':
        return <Sprout className="w-5 h-5 text-emerald-400" />;
      case 'dealer':
        return <Building2 className="w-5 h-5 text-blue-400" />;
      case 'supplier':
        return <Truck className="w-5 h-5 text-amber-400" />;
      case 'admin':
        return <Landmark className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Radial Topography Background */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#3b82f6 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      ></div>

      {/* Glow Effects */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <header className="relative z-10 px-6 md:px-10 py-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-emerald-900/30">
            🌱
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-tight flex items-center gap-2">
              AgriLedger-SITS
            </h1>
            <p className="text-xs text-slate-400">National Smart Input Tracking & Agriculture Ledger</p>
          </div>
        </div>
      </header>

      {/* Main Form & Hero Section Container */}
      <main className="relative z-10 max-w-6xl mx-auto w-full px-4 py-8 my-auto">
        {/* Split Grid: Left Hero Image + Right Auth Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
          
          {/* LEFT COLUMN: Featured Tractor Banner Image Container */}
          <div className="lg:col-span-5 relative flex flex-col justify-between overflow-hidden min-h-[300px] lg:min-h-[600px]">
            {/* Background Tractor Photo */}
            <img
              src={tractorImg}
              alt="Agricultural Tractor Spraying Crops"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
            />
            
            {/* Dark Gradient Overlay for High Contrast Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none"></div>
          </div>

          {/* RIGHT COLUMN: Interactive Login / Register Form Panel */}
          <div className="lg:col-span-7 p-6 md:p-8 flex flex-col justify-center">
            
            {/* PROMINENT USSD FEATURE PHONE GATEWAY BANNER (*141#) */}
            <div className="mb-6 p-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border-2 border-emerald-500/40 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      GSM USSD *141#
                    </span>
                    <span className="text-xs font-bold text-white tracking-tight">
                      Smallholder Farmer Feature Phone Access
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-snug">
                    Dial <code className="text-emerald-400 font-bold bg-black/60 px-1.5 py-0.5 rounded font-mono">*141#</code> on your phone to plan your farming season, log planting/spraying, redeem vouchers, or launch your farmer account directly!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onOpenUssdModal}
                  className="w-full sm:w-auto px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0 transition-transform hover:scale-102"
                >
                  <Smartphone className="w-4 h-4 text-slate-950" />
                  <span>Dial *141# USSD Portal</span>
                </button>
              </div>
            </div>

            {/* TOP NAVIGATION TAB SWITCHER */}
            <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 mb-6 gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('signin');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                    authTab === 'signin'
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Member Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('signup');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                    authTab === 'signup'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register Farmer</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('personas');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                    authTab === 'personas'
                      ? 'bg-amber-600 text-white shadow'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Demo Role Switcher</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('welcome');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                    authTab === 'welcome' || authTab === 'association'
                      ? 'bg-slate-700 text-white shadow'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  <Tractor className="w-3.5 h-3.5" />
                  <span>System Info</span>
                </button>
              </div>

              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                ● Ledger Online
              </span>
            </div>

            {/* Notifications Alert Banner */}
            {errorMessage && (
              <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-start gap-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-start gap-2.5 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{successMessage}</span>
              </div>
            )}

            {/* PAGE 1: WELCOMING PAGE (FIRST SCREEN WITH TRACTOR THEME BEFORE SIGNING IN) */}
            {authTab === 'welcome' && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-2">
                  <h2 className="text-2xl font-extrabold text-white tracking-tight leading-snug">
                    National Smart Agriculture & Input Subsidies Ledger
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Empowering Zimbabwean smallholder farmers with anti-tamper QR input vouchers, GSM USSD connectivity (*141#), and direct market access to accredited buyers.
                  </p>
                </div>

                {/* Main Navigation Action Button */}
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('association');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="w-full p-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-sm rounded-xl shadow-xl flex items-center justify-center gap-2.5 cursor-pointer transition-transform hover:scale-[1.01]"
                >
                  <span>Proceed to Smallholder Association Portal</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </button>

                {/* Quick USSD and Demo Switcher row */}
                <div className="flex items-center justify-between pt-2 text-xs border-t border-slate-800">
                  <button
                    type="button"
                    onClick={onOpenUssdModal}
                    className="text-emerald-400 font-bold hover:underline flex items-center gap-1.5 cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>Feature Phone? Dial *141# USSD</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthTab('personas')}
                    className="text-amber-400 font-bold hover:underline flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Quick Demo Role Switcher</span>
                  </button>
                </div>
              </div>
            )}

            {/* PAGE 2: SEPARATE SMALLHOLDER ASSOCIATION & NATIONAL INPUT LEDGER PAGE */}
            {authTab === 'association' && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-2">

                </div>

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab('signup');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="p-3.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-102"
                  >
                    <UserPlus className="w-4 h-4 text-slate-950" />
                    <span>1. Register First (Smallholder's Association)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab('signin');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="p-3.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-102"
                  >
                    <Lock className="w-4 h-4 text-white" />
                    <span>2. Member Sign In (Database Auth)</span>
                  </button>
                </div>

                {/* Quick Links */}
                <div className="flex items-center justify-between pt-2 text-xs border-t border-slate-800">
                  <button
                    type="button"
                    onClick={onOpenUssdModal}
                    className="text-emerald-400 font-bold hover:underline flex items-center gap-1.5 cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>Feature Phone? Dial *141# USSD</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthTab('personas')}
                    className="text-amber-400 font-bold hover:underline flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Quick Demo Role Switcher</span>
                  </button>
                </div>
              </div>
            )}

            {/* FORM TAB 1: SIGN IN (DATABASE AUTHENTICATION) */}
            {authTab === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <h2 className="text-xl font-extrabold text-white tracking-tight mb-1">
                    Registered Member Sign In
                  </h2>
                  <p className="text-xs text-slate-400 mb-4">
                    Enter your registered email address or phone number and password stored in the database.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email Address or Phone Number
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="kudzaishe@agriledger.zw or +263 77..."
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white outline-none focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Account Password
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter account password"
                      className="w-full pl-9 pr-10 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white outline-none focus:border-blue-500 transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Pre-configured quick credentials buttons */}
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 block">Quick Credentials Test:</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginEmail('kudzaishe.mupotaringa@agri-forge.net');
                        setLoginPassword('password123');
                      }}
                      className="text-[10px] bg-slate-800 hover:bg-slate-700 text-emerald-300 px-2 py-1 rounded border border-slate-700 cursor-pointer"
                    >
                      Farmer Account
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginEmail('dealer@agriledger.zw');
                        setLoginPassword('password123');
                      }}
                      className="text-[10px] bg-slate-800 hover:bg-slate-700 text-blue-300 px-2 py-1 rounded border border-slate-700 cursor-pointer"
                    >
                      Dealer Hub
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginEmail('supplier@agriledger.zw');
                        setLoginPassword('password123');
                      }}
                      className="text-[10px] bg-slate-800 hover:bg-slate-700 text-amber-300 px-2 py-1 rounded border border-slate-700 cursor-pointer"
                    >
                      Bulk Supplier
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginEmail('admin@agriledger.zw');
                        setLoginPassword('password123');
                      }}
                      className="text-[10px] bg-slate-800 hover:bg-slate-700 text-indigo-300 px-2 py-1 rounded border border-slate-700 cursor-pointer"
                    >
                      AGRITEX Admin
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{isLoading ? 'Verifying Database Credentials...' : 'Sign In to Dashboard'}</span>
                </button>
              </form>
            )}

            {/* FORM TAB 2: SIGN UP (SMALLHOLDER ASSOCIATION REGISTRATION & SAVED TO DATABASE) */}
            {authTab === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-3.5">
                <div>
                  <h2 className="text-xl font-extrabold text-white tracking-tight mb-1 flex items-center gap-2">
                    <span>🌾 Smallholder's Association Registration</span>
                  </h2>
                  <p className="text-xs text-slate-300 mb-3">
                    Farmers must be registered in the Smallholder's Association first. Your details & password will be saved in the database, and you will be referred to sign in.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      placeholder="e.g. Tendai Mhako"
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Account Role *
                    </label>
                    <select
                      value={signUpRole}
                      onChange={(e) => setSignUpRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white outline-none focus:border-emerald-500"
                    >
                      <option value="farmer">Smallholder Farmer</option>
                      <option value="dealer">Agro-Dealer Distribution Depot</option>
                      <option value="supplier">Bulk Fertilizer/Seed Supplier</option>
                      <option value="admin">AGRITEX System Officer</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      placeholder="tendai@murehwa.zw"
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Mobile Number (USSD)
                    </label>
                    <input
                      type="text"
                      value={signUpPhone}
                      onChange={(e) => setSignUpPhone(e.target.value)}
                      placeholder="+263 77..."
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      District / Location
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={signUpLocation}
                        onChange={(e) => setSignUpLocation(e.target.value)}
                        placeholder="Murehwa Ward 12"
                        className="w-full pl-8 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Co-op or Company Name
                    </label>
                    <input
                      type="text"
                      value={signUpOrganization}
                      onChange={(e) => setSignUpOrganization(e.target.value)}
                      placeholder="e.g. Murehwa Grain Cooperative"
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Set Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white outline-none focus:border-emerald-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50 mt-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isLoading ? 'Saving Account to Database...' : 'Register & Save to Database'}</span>
                </button>
              </form>
            )}

            {/* FORM TAB 3: DEMO PERSONAS QUICK SWITCH */}
            {authTab === 'personas' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-extrabold text-white tracking-tight mb-1">
                    Demo Role Persona Selection
                  </h2>
                  <p className="text-xs text-slate-400 mb-3">
                    Click any persona card to instantly launch that specific operational view.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Farmer */}
                  <div
                    onClick={() => handlePersonaSelect('farmer')}
                    className="p-3.5 bg-slate-950 border border-slate-800 hover:border-emerald-500/60 rounded-xl cursor-pointer group transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        {getRoleIcon('farmer')}
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">
                        Farmer
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-white group-hover:text-emerald-300">
                      {DEFAULT_PROFILES.farmer.name}
                    </h3>
                    <p className="text-[11px] text-slate-400">{DEFAULT_PROFILES.farmer.location}</p>
                  </div>

                  {/* Dealer */}
                  <div
                    onClick={() => handlePersonaSelect('dealer')}
                    className="p-3.5 bg-slate-950 border border-slate-800 hover:border-blue-500/60 rounded-xl cursor-pointer group transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        {getRoleIcon('dealer')}
                      </div>
                      <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full uppercase">
                        Dealer Hub
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-white group-hover:text-blue-300">
                      {DEFAULT_PROFILES.dealer.name}
                    </h3>
                    <p className="text-[11px] text-slate-400">{DEFAULT_PROFILES.dealer.location}</p>
                  </div>

                  {/* Supplier */}
                  <div
                    onClick={() => handlePersonaSelect('supplier')}
                    className="p-3.5 bg-slate-950 border border-slate-800 hover:border-amber-500/60 rounded-xl cursor-pointer group transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                        {getRoleIcon('supplier')}
                      </div>
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase">
                        Supplier
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-white group-hover:text-amber-300">
                      {DEFAULT_PROFILES.supplier.name}
                    </h3>
                    <p className="text-[11px] text-slate-400">{DEFAULT_PROFILES.supplier.location}</p>
                  </div>

                  {/* Admin */}
                  <div
                    onClick={() => handlePersonaSelect('admin')}
                    className="p-3.5 bg-slate-950 border border-slate-800 hover:border-indigo-500/60 rounded-xl cursor-pointer group transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                        {getRoleIcon('admin')}
                      </div>
                      <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full uppercase">
                        AGRITEX Admin
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-white group-hover:text-indigo-300">
                      {DEFAULT_PROFILES.admin.name}
                    </h3>
                    <p className="text-[11px] text-slate-400">{DEFAULT_PROFILES.admin.location}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4 border-t border-slate-800/80 bg-slate-900/40 text-center text-[11px] text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
        <span>© 2026 AgriLedger-SITS Input Tracking System • All User Credentials Encrypted & Stored</span>
        <div className="flex items-center gap-3 text-slate-400">
          <span className="flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            USSD Portal *141#
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Key className="w-3.5 h-3.5 text-blue-400" />
            Database Ledger Connected
          </span>
        </div>
      </footer>
    </div>
  );
};
