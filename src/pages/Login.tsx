import { useForm } from 'react-hook-form';
import loginImage from '../../public/Laikipia-logo.png';
import { Navbar } from '../components/Navbar';
import { toast, Toaster } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../features/Auth/AuthSlice';
import { useState } from 'react';
import { Eye, EyeOff, User, Lock } from 'lucide-react'; // Added icons for inputs
import { authApi } from '../features/APIS/Auth.Api';

interface LoginDetails {
  reg_no: string;
  password: string;
}

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
    <div className="min-h-screen bg-slate-100 font-sans">
      <Toaster richColors position="top-right" />
      <Navbar />
      
      <main className="grid grid-cols-1 md:grid-cols-2 min-h-[calc(100vh-64px)] transition-colors duration-300">
        
        {/* Left Side: Branding */}
        <div className="hidden md:flex flex-col items-center justify-center bg-white border-r border-slate-200 p-12 relative overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-50" />
          <img
            src={loginImage}
            alt="Laikipia University Logo"
            className="w-3/4 max-w-sm h-auto object-contain z-10 drop-shadow-md"
          />
          <div className="mt-8 text-center z-10">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">LU E-VOTING SYSTEM</h1>
            <p className="text-slate-500 font-medium max-w-xs mt-2">
              Secure, transparent, and reliable digital balloting for Kenyan University.
            </p>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="flex items-center justify-center p-6 sm:p-12">
          <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-3xl p-8 w-full max-w-md border border-slate-100 relative">
            {/* Header Accent Line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-[#D32F2F] rounded-b-full" />

            <header className="text-center mt-4 mb-10">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">
                WELCOME <span className="text-[#D32F2F]">BACK</span>
              </h2>
              <p className="text-slate-500 text-sm mt-1">Please enter your student credentials</p>
            </header>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Registration Number */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-widest ml-1">
                  Registration Number
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#D32F2F] transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    className={`w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-2 ${errors.reg_no ? 'border-red-500' : 'border-slate-100'} focus:bg-white focus:border-[#D32F2F] outline-none transition-all text-slate-800 font-medium placeholder:text-slate-400 shadow-sm`}
                    placeholder="N11/3/XXXXX/XX"
                    {...register('reg_no', { required: "Registration number is required" })}
                  />
                </div>
                {errors.reg_no && (
                  <p className="text-[#D32F2F] text-[10px] mt-1 font-bold uppercase tracking-tighter ml-2">
                    {errors.reg_no.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-widest ml-1">
                  Security Password
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#D32F2F] transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`w-full pl-12 pr-12 py-4 bg-slate-50 rounded-2xl border-2 ${errors.password ? 'border-red-500' : 'border-slate-100'} focus:bg-white focus:border-[#D32F2F] outline-none transition-all text-slate-800 font-medium shadow-sm`}
                    placeholder="••••••••"
                    {...register('password', { required: "Password is required" })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#D32F2F] transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[#D32F2F] text-[10px] mt-1 font-bold uppercase tracking-tighter ml-2">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Password Reset */}
              <div className="flex justify-end">
                <Link 
                  to="/forgot-password" 
                  className="text-xs font-bold text-[#D32F2F] hover:text-[#B71C1C] transition-colors uppercase tracking-tighter"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Action */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#D32F2F] hover:bg-black text-white font-black py-4 rounded-2xl shadow-xl shadow-red-100 transition-all active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-[0.1em] text-sm mt-2"
              >
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
              </button>
            </form>

            <footer className="mt-8 pt-6 border-t border-slate-50 text-center">
              <p className="text-sm text-slate-500 font-medium">
                New to the system?{' '}
                <Link to="/register" className="text-[#D32F2F] font-extrabold hover:underline underline-offset-4 transition-all">
                  Create Profile
                </Link>
              </p>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;