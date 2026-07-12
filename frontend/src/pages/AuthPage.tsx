import React, { useState, useEffect } from 'react'
import {
  Eye, EyeOff, Truck, Shield, MapPin, Users, TrendingUp,
  Lock, Mail, ChevronDown, AlertCircle, Loader2, LogIn
} from 'lucide-react'

interface AuthPageProps {
  onLogin: (token: string, user: AuthUser) => void
}

export interface AuthUser {
  id: number
  name: string
  email: string
  role: string
}

const ROLES = [
  {
    key: 'FLEET_MANAGER',
    label: 'Fleet Manager',
    email: 'manager@transitops.com',
    description: 'Fleet, Drivers & Analytics',
    icon: Truck,
    color: '#f97316'
  },
  {
    key: 'DISPATCHER',
    label: 'Dispatcher',
    email: 'dispatcher@transitops.com',
    description: 'Manage Trips, view Fleet',
    icon: MapPin,
    color: '#22c55e'
  },
  {
    key: 'SAFETY_OFFICER',
    label: 'Safety Officer',
    email: 'safety@transitops.com',
    description: 'Manage Drivers, view Trips',
    icon: Shield,
    color: '#f59e0b'
  },
  {
    key: 'FINANCIAL_ANALYST',
    label: 'Financial Analyst',
    email: 'analyst@transitops.com',
    description: 'Fuel & Expenses, Analytics',
    icon: TrendingUp,
    color: '#06b6d4'
  }
]

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [email, setEmail] = useState('manager@transitops.com')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState(ROLES[0])
  const [isRoleOpen, setIsRoleOpen] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [lockTimer, setLockTimer] = useState(0)
  const [mounted, setMounted] = useState(false)

  // Read system/saved theme to match the rest of the app
  const savedTheme = localStorage.getItem('theme') || 'light'
  const isDark = savedTheme === 'dark'

  useEffect(() => {
    // Apply the app theme to the document
    const root = window.document.documentElement
    if (isDark) root.classList.add('dark')
    else root.classList.remove('dark')
    setMounted(true)
  }, [])

  useEffect(() => {
    if (lockTimer > 0) {
      const t = setTimeout(() => setLockTimer(l => l - 1), 1000)
      return () => clearTimeout(t)
    } else if (lockTimer === 0 && isLocked) {
      setIsLocked(false)
      setError(null)
    }
  }, [lockTimer, isLocked])

  const handleRoleSelect = (role: typeof ROLES[0]) => {
    setSelectedRole(role)
    setEmail(role.email)
    setIsRoleOpen(false)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLocked || isLoading) return
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      })

      const data = await res.json()

      if (!res.ok) {
        const attempts = failedAttempts + 1
        setFailedAttempts(attempts)
        if (attempts >= 5) {
          setIsLocked(true)
          setLockTimer(30)
          setError('Account locked after 5 failed attempts. Try again in 30s.')
        } else {
          setError(data?.error?.message || 'Invalid email or password.')
        }
        return
      }

      if (data?.data?.token) {
        const token = data.data.token
        const user = data.data.user as AuthUser
        localStorage.setItem('token', token)
        localStorage.setItem('activeRole', user.role)
        localStorage.setItem('user', JSON.stringify(user))
        if (rememberMe) localStorage.setItem('rememberEmail', email)
        setFailedAttempts(0)
        onLogin(token, user)
      } else {
        setError('No token returned. Please try again.')
      }
    } catch {
      setError('Connection failed. Make sure the backend is running.')
    } finally {
      setIsLoading(false)
    }
  }

  const inputBase =
    'w-full rounded-xl text-sm text-text-primary placeholder:text-text-secondary bg-bg-main border border-border-custom focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange transition-all duration-200 disabled:opacity-50'

  return (
    <div className="min-h-screen flex bg-bg-main text-text-primary font-sans">

      {/* ── Left branding panel (sidebar-style) ── */}
      <div
        className={`hidden lg:flex flex-col justify-between w-72 xl:w-80 shrink-0 bg-bg-sidebar border-r border-slate-800 px-8 py-10 transition-all duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Logo */}
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-orange text-white font-bold text-lg shadow-lg shadow-orange-500/20">
              T
            </div>
            <span className="text-xl font-bold tracking-wide text-white">TransitOps</span>
          </div>

          <div className="space-y-2 mb-8">
            <h2 className="text-2xl font-bold text-white leading-snug">
              Smart Transport<br />Operations Platform
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              One login, four roles. Each role is scoped to the operations it needs.
            </p>
          </div>

          {/* Role list */}
          <div className="space-y-2">
            {ROLES.map((role, i) => (
              <div
                key={role.key}
                className="flex items-center gap-3 p-3 rounded-xl transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateX(0)' : 'translateX(-12px)',
                  transition: `all 0.45s ease ${i * 0.08}s`
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${role.color}22`, border: `1px solid ${role.color}44` }}
                >
                  <role.icon size={13} style={{ color: role.color }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white leading-none mb-0.5">{role.label}</p>
                  <p className="text-xs text-slate-500">{role.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-slate-600">© 2026 TransitOps · RBAC v2.0</p>
      </div>

      {/* ── Right login panel ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div
          className={`w-full max-w-md transition-all duration-500 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >

          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-orange text-white font-bold text-lg shadow-lg shadow-orange-500/20">
              T
            </div>
            <span className="text-xl font-bold tracking-wide text-text-primary">TransitOps</span>
          </div>

          {/* Card */}
          <div className="bg-bg-card rounded-2xl border border-border-custom shadow-custom p-8 space-y-6">

            {/* Heading */}
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Sign in to your account</h1>
              <p className="text-sm text-text-secondary mt-1">Enter your credentials to continue</p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50">
                <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">
                    {isLocked ? 'Account Locked' : 'Sign-in failed'}
                  </p>
                  <p className="text-xs text-red-500/80 dark:text-red-400/70 mt-0.5">{error}</p>
                  {isLocked && lockTimer > 0 && (
                    <p className="text-xs text-red-400/60 mt-1">Unlocks in {lockTimer}s</p>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-widest text-text-secondary">
                  Email
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(null) }}
                    placeholder="you@transitops.com"
                    disabled={isLocked}
                    className={`${inputBase} pl-10 pr-4 py-2.5`}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-widest text-text-secondary">
                  Password
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(null) }}
                    placeholder="••••••••"
                    disabled={isLocked}
                    className={`${inputBase} pl-10 pr-11 py-2.5`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors p-0.5"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Role RBAC dropdown */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-widest text-text-secondary">
                  Role (RBAC)
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsRoleOpen(v => !v)}
                    disabled={isLocked}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm text-text-primary bg-bg-main border border-border-custom hover:border-brand-orange/50 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 transition-all duration-200 disabled:opacity-50 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: selectedRole.color }} />
                      <span className="font-medium">{selectedRole.label}</span>
                    </div>
                    <ChevronDown
                      size={14}
                      className="text-text-secondary transition-transform duration-200"
                      style={{ transform: isRoleOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                  </button>

                  {isRoleOpen && (
                    <div className="absolute z-50 top-full mt-1.5 left-0 right-0 bg-bg-card border border-border-custom rounded-xl shadow-custom overflow-hidden">
                      {ROLES.map(role => (
                        <button
                          key={role.key}
                          type="button"
                          onClick={() => handleRoleSelect(role)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors cursor-pointer ${
                            role.key === selectedRole.key
                              ? 'bg-brand-orange/8 border-l-2 border-brand-orange'
                              : 'border-l-2 border-transparent hover:bg-bg-main'
                          }`}
                        >
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: `${role.color}18` }}
                          >
                            <role.icon size={12} style={{ color: role.color }} />
                          </div>
                          <div>
                            <p className="font-semibold text-text-primary text-sm leading-none mb-0.5">{role.label}</p>
                            <p className="text-xs text-text-secondary">{role.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Remember me + forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none group">
                  <div
                    onClick={() => setRememberMe(v => !v)}
                    className={`w-4 h-4 rounded flex items-center justify-center transition-colors border cursor-pointer ${
                      rememberMe
                        ? 'bg-brand-orange border-brand-orange'
                        : 'bg-bg-main border-border-custom group-hover:border-brand-orange/50'
                    }`}
                  >
                    {rememberMe && (
                      <svg viewBox="0 0 12 12" className="w-3 h-3">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm font-medium text-brand-orange hover:text-brand-orange-hover transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || isLocked}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-brand-orange hover:bg-brand-orange-hover active:scale-[0.98] shadow-lg shadow-orange-500/20 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Signing in…
                  </>
                ) : isLocked ? (
                  <>
                    <Lock size={15} />
                    Locked ({lockTimer}s)
                  </>
                ) : (
                  <>
                    <LogIn size={15} />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Divider + access info */}
            <div className="border-t border-border-custom pt-4 space-y-2">
              <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Access scoped by role</p>
              <div className="grid grid-cols-1 gap-1">
                {ROLES.map(role => (
                  <div key={role.key} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: role.color }} />
                    <p className="text-xs text-text-secondary">
                      <span className="text-text-primary font-medium">{role.label}</span>
                      {' → '}
                      {role.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Demo hint */}
          <p className="text-center text-xs text-text-secondary mt-4">
            Demo password for all accounts:{' '}
            <code className="font-mono font-semibold text-text-primary bg-bg-card px-1.5 py-0.5 rounded border border-border-custom">
              Password123
            </code>
          </p>
        </div>
      </div>
    </div>
  )
}
