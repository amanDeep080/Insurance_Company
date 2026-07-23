import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { loginStart, loginVerify } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('password'); // 'password' | 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const id = await loginStart(email, password);
      setUserId(id);
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await loginVerify(userId, code);
      if (user.status !== 'ACTIVE') navigate('/status');
      else navigate(`/${user.role}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-ink)] px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        <div className="flex items-center gap-2 justify-center mb-8">
          <ShieldCheck className="text-[var(--color-brass)]" size={26} />
          <span className="font-display text-2xl text-white tracking-wide">Suraksha Cover</span>
        </div>

        <div className="card p-7">
          <AnimatePresence mode="wait">
            {step === 'password' ? (
              <motion.form
                key="password"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
                onSubmit={handlePasswordSubmit}
              >
                <h1 className="font-display text-xl mb-1 text-[var(--color-ink)]">Welcome back</h1>
                <p className="text-sm text-[var(--color-muted)] mb-6">Sign in to manage your policies and claims.</p>

                <label className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Email</label>
                <div className="relative mt-1.5 mb-4">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                  <input
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border hairline focus-ring outline-none text-sm"
                  />
                </div>

                <label className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Password</label>
                <div className="relative mt-1.5 mb-2">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                  <input
                    type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border hairline focus-ring outline-none text-sm"
                  />
                </div>

                {error && <p className="text-sm text-[var(--color-danger)] mt-3">{error}</p>}

                <button
                  type="submit" disabled={loading}
                  className="w-full mt-5 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[var(--color-ink)] text-white text-sm font-medium hover:bg-[var(--color-ink-2)] transition-colors disabled:opacity-60 focus-ring"
                >
                  {loading ? 'Sending code…' : 'Continue'} <ArrowRight size={16} />
                </button>

                <p className="text-sm text-center mt-6 text-[var(--color-muted)]">
                  Don't have an account? <Link to="/signup" className="text-[var(--color-brass)] font-semibold hover:underline">Create one</Link>
                </p>

                <p className="text-xs text-[var(--color-muted)] text-center mt-5">
                  Demo: admin@surakshacover.in · agent@surakshacover.in · customer@surakshacover.in — password: Password@123
                </p>
              </motion.form>
            ) : (
              <motion.form
                key="otp"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleOtpSubmit}
              >
                <h1 className="font-display text-xl mb-1 text-[var(--color-ink)]">Verify it's you</h1>
                <p className="text-sm text-[var(--color-muted)] mb-6">
                  We sent a 6-digit code to your email and phone. In dev mode, check the backend console log.
                </p>

                <label className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Verification code</label>
                <input
                  type="text" inputMode="numeric" maxLength={6} required
                  value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full mt-1.5 mb-2 px-3 py-2.5 rounded-lg border hairline focus-ring outline-none text-lg tracking-[0.4em] text-center font-tabular"
                />

                {error && <p className="text-sm text-[var(--color-danger)] mt-3">{error}</p>}

                <button
                  type="submit" disabled={loading}
                  className="w-full mt-5 py-2.5 rounded-lg bg-[var(--color-brass)] text-white text-sm font-medium hover:brightness-95 transition disabled:opacity-60 focus-ring"
                >
                  {loading ? 'Verifying…' : 'Verify & sign in'}
                </button>
                <button
                  type="button" onClick={() => setStep('password')}
                  className="w-full mt-2 py-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
                >
                  ← Back
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
