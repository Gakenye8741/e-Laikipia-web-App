import { useForm } from 'react-hook-form';
import loginImage from '../../public/Laikipia-logo.png';
import { Navbar } from '../components/Navbar';
import { toast, Toaster } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../features/Auth/AuthSlice';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
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
    const toastId = toast.loading('Logging in...');
    try {
      const res = await loginUser(data).unwrap();

      // Save token to localStorage
      if (res.token) localStorage.setItem('token', res.token);

      // Save Redux state
      dispatch(setCredentials({
        user: res.user,
        token: res.token || '',
        role: res.user?.role || ''
      }));

      toast.success('✅ Logged in successfully', { id: toastId });

      // Redirect based on role
      navigate(res.user?.role === 'admin' ? '/admindashboard' : '/');
    } catch (error: any) {
      const errorMsg =
        error?.data?.error?.error ||
        error?.data?.error ||
        error?.error ||
        '❌ Something went wrong. Please try again.';
      toast.error(`Failed to login: ${errorMsg}`, { id: toastId });
    }
  };

  return (
    <>
      <Toaster richColors position="top-right" />
      <Navbar />
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-base-200 text-base-content transition-colors duration-300">
        {/* Image Side */}
        <div className="hidden md:block">
          <img
            src={loginImage}
            alt="Login Illustration"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Form Side */}
        <div className="flex items-center justify-center p-6">
          <div className="bg-base-200 shadow-xl rounded-2xl p-8 w-full max-w-md border-2 border-blue-500">
            <h2 className="text-3xl font-bold mb-6 text-center">🎓 Laikipia E-Vote Login Portal</h2>

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              {/* Registration Number Field */}
              <div>
                <label className="block text-sm font-medium mb-1">🆔 Registration Number</label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter your registration number"
                  {...register('reg_no', { required: true })}
                />
                {errors.reg_no && (
                  <span className="text-error text-sm mt-1 block">
                    Registration number is required.
                  </span>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium mb-1">🔐 Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input input-bordered w-full pr-10"
                    placeholder="Enter your password"
                    {...register('password', { required: true })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-error text-sm mt-1 block">Password is required.</span>
                )}
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn btn-primary w-full mt-4 text-lg tracking-wide"
                disabled={isLoading}
              >
                {isLoading ? '🚀 Logging in...' : '🎯 Login'}
              </button>
            </form>

            {/* Register Link */}
            <p className="text-sm text-center mt-5">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
