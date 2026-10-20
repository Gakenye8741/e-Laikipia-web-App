import { useForm } from 'react-hook-form';
import loginImage from '../../public/Laikipia-logo.png';
import { Navbar } from '../components/Navbar';
import { toast, Toaster } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../features/Auth/AuthSlice';
import { useState } from 'react';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { authApi } from '../features/APIS/Auth.Api';
import { motion, AnimatePresence, MotionConfig, type Variants } from 'framer-motion';

interface LoginDetails {
  reg_no: string;
  password: string;
}

/* ------------------------------ Animations ------------------------------ */

// Parent: shows its children one after another
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.25 } },
};

// Child: rises into place with a little spring
const rise: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 16 } },
};

// Error text: pops in and shakes once
const ErrorText = ({ message }: { message?: string }) => (
  <AnimatePresence>
    {message && (
      <motion.p
        initial={{ opacity: 0, y: -8, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto', x: [0, -6, 6, -4, 4, 0] }}
        exit={{ opacity: 0, y: -8, height: 0 }}
        transition={{ duration: 0.4 }}
        className="text-[#D32F2F] text-[10px] mt-1 font-bold uppercase tracking-tighter ml-2"
      >
        {message}
      </motion.p>
    )}
  </AnimatePresence>
);

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginDetails>();
  const [loginUser, { isLoading }] = authApi.useLoginMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: LoginDetails) => {
    const toastId = toast.loading('Authenticating credentials...');
    try {
      const res = await loginUser(data).unwrap();

      if (res.token) localStorage.setItem('token', res.token);

      dispatch(setCredentials({
        user: res.user,
        token: res.token || '',
        role: res.user?.role || ''
      }));

      toast.success('Access Granted. Redirecting...', { id: toastId });

      const userRole = res.user?.role?.toLowerCase();
      navigate(userRole === 'admin' ? '/admindashboard' : '/');
    } catch (error: any) {
      const errorMsg =
        error?.data?.error?.error ||
        error?.data?.error ||
        error?.error ||
        'Authentication failed. Please check your credentials.';
      toast.error(errorMsg, { id: toastId });
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-slate-100 font-sans">
        <Toaster richColors position="top-right" />
        <Navbar />

        <main className="grid grid-cols-1 md:grid-cols-2 min-h-[calc(100vh-64px)]">

          {/* Left Side: Image completely occupying half the page */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 70, damping: 16 }}
            className="hidden md:block w-full h-full relative border-r border-slate-200 overflow-hidden"
            style={{
              backgroundImage: `url(${loginImage})`,
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '85%', // Fills up the container maximum space safely without clipping edges
              backgroundColor: '#ffffff' // Keeps background matching the image canvas
            }}
          >
            {/* Soft glowing blobs that drift around */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -left-16 top-10 h-64 w-64 rounded-full bg-[#D32F2F]/10 blur-3xl"
              animate={{ x: [0, 50, 0], y: [0, 40, 0], scale: [1, 1.25, 1] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -right-16 top-1/2 h-72 w-72 rounded-full bg-[#D32F2F]/10 blur-3xl"
              animate={{ x: [0, -40, 0], y: [0, -50, 0], scale: [1.1, 0.9, 1.1] }}
              transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Subtle overlay shading/text at the bottom of the half-page banner */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/80 to-transparent p-12 pt-32 text-center"
            >
              <motion.h1 variants={rise} className="text-3xl font-black text-slate-800 tracking-tight">
                SECURE-VOTE PLATFORM
              </motion.h1>
              <motion.p variants={rise} className="text-slate-500 font-medium max-w-xs mx-auto mt-2 text-sm">
                Secure, transparent, and decentralized biometric balloting system for Laikipia University.
              </motion.p>
            </motion.div>
          </motion.div>

          {/* Right Side: Auth Form */}
          <div className="relative flex items-center justify-center p-6 sm:p-12 bg-slate-50 md:bg-white overflow-hidden">
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#D32F2F]/10 blur-3xl"
              animate={{ x: [0, -40, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />

            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 90, damping: 15 }}
              className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-3xl p-8 w-full max-w-md border border-slate-100 relative"
            >
              {/* Header Accent Line */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
                className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-[#D32F2F] rounded-b-full origin-center"
              />

              <motion.div variants={stagger} initial="hidden" animate="show">
                <motion.header variants={rise} className="text-center mt-4 mb-10">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">
                    WELCOME{' '}
                    <motion.span
                      className="inline-block text-[#D32F2F]"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      BACK
                    </motion.span>
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">Please enter your Admin credentials</p>
                </motion.header>

                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                  {/* Registration Number */}
                  <motion.div variants={rise} className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-widest ml-1">
                      Registration Number
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#D32F2F] group-focus-within:scale-110 transition-all">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        className={`w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-2 ${errors.reg_no ? 'border-red-500' : 'border-slate-100'} focus:bg-white focus:border-[#D32F2F] focus:shadow-[0_0_0_4px_rgba(211,47,47,0.12)] outline-none transition-all text-slate-800 font-medium placeholder:text-slate-400 shadow-sm`}
                        placeholder="N11/3/XXXXX/XX"
                        {...register('reg_no', { required: "Registration number is required" })}
                      />
                    </div>
                    <ErrorText message={errors.reg_no?.message} />
                  </motion.div>

                  {/* Password */}
                  <motion.div variants={rise} className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-widest ml-1">
                      Security Password
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#D32F2F] group-focus-within:scale-110 transition-all">
                        <Lock size={18} />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className={`w-full pl-12 pr-12 py-4 bg-slate-50 rounded-2xl border-2 ${errors.password ? 'border-red-500' : 'border-slate-100'} focus:bg-white focus:border-[#D32F2F] focus:shadow-[0_0_0_4px_rgba(211,47,47,0.12)] outline-none transition-all text-slate-800 font-medium shadow-sm`}
                        placeholder="••••••••"
                        {...register('password', { required: "Password is required" })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#D32F2F] transition-colors"
                      >
                        {/* Eye icon flips when you toggle it */}
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.span
                            key={showPassword ? 'hide' : 'show'}
                            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                            animate={{ opacity: 1, rotate: 0, scale: 1 }}
                            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                            transition={{ duration: 0.15 }}
                            className="block"
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </motion.span>
                        </AnimatePresence>
                      </button>
                    </div>
                    <ErrorText message={errors.password?.message} />
                  </motion.div>

                  {/* Password Reset */}
                  <motion.div variants={rise} className="flex justify-end">
                    <Link
                      to="/forgot-password"
                      className="text-xs font-bold text-[#D32F2F] hover:text-[#B71C1C] transition-colors uppercase tracking-tighter"
                    >
                      Forgot Password?
                    </Link>
                  </motion.div>

                  {/* Submit Action */}
                  <motion.div variants={rise}>
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={isLoading ? undefined : { y: -3, scale: 1.02 }}
                      whileTap={isLoading ? undefined : { scale: 0.96 }}
                      className="relative overflow-hidden w-full bg-[#D32F2F] hover:bg-black text-white font-black py-4 rounded-2xl shadow-xl shadow-red-100 transition-colors disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-[0.1em] text-sm mt-2"
                    >
                      {/* Light streak that sweeps across the button */}
                      {!isLoading && (
                        <motion.span
                          aria-hidden
                          className="absolute inset-y-0 left-0 w-1/4 -skew-x-12 bg-white/25"
                          initial={{ x: '-150%' }}
                          animate={{ x: '500%' }}
                          transition={{ duration: 1.3, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
                        />
                      )}
                      <span className="relative">
                        {isLoading ? (
                          <span className="flex items-center justify-center gap-3">
                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            AUTHORIZING...
                          </span>
                        ) : (
                          "Login to Dashboard"
                        )}
                      </span>
                    </motion.button>
                  </motion.div>
                </form>

                <motion.footer variants={rise} className="mt-8 pt-6 border-t border-slate-50 text-center">
                 
                </motion.footer>
              </motion.div>
            </motion.div>
          </div>
        </main>
      </div>
    </MotionConfig>
  );
};

export default Login;