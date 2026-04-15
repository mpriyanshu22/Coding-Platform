import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router'; 
import { loginUser } from "../authSlice";
import { useEffect, useState } from 'react';
import { Code2, Eye, EyeOff, LogIn } from 'lucide-react';

const loginSchema = z.object({
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password is too weak") 
});

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    dispatch(loginUser(data));
  };

  return (
    <div className="min-h-screen flex text-base-content bg-base-200/50">
      {/* Left side brand / graphic */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center bg-base-300 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 opacity-50 z-0"></div>
        <div className="z-10 text-center max-w-md px-8 relative">
           <Code2 size={64} className="text-primary mx-auto mb-6 drop-shadow-lg" />
           <h1 className="text-4xl font-bold font-mono tracking-tight text-base-content mb-4">CodeWithMe</h1>
           <p className="text-lg text-base-content/70">Sign in to sync your progress, track submissions, and pick up where you left off. The ideal coding platform tailored for professionals.</p>
        </div>
      </div>

      {/* Right side form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8 bg-base-100 p-8 sm:p-10 rounded-3xl shadow-2xl border border-base-200">
          <div>
            <h2 className="text-center text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="mt-2 text-center text-sm text-base-content/60">
              Please enter your credentials to login
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Global Error Display */}
            {error && (
              <div className="alert alert-error text-sm rounded-xl py-3 px-4 shadow-sm">
                 <span className="font-semibold">{typeof error === 'string' ? error : "Login failed. Please try again."}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-medium text-base-content/70">Email Address</span>
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className={`input input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors ${errors.emailId ? 'input-error' : 'focus:border-primary'}`} 
                  {...register('emailId')}
                />
                {errors.emailId && (
                  <span className="text-error text-xs mt-1 px-1 font-medium">{errors.emailId.message}</span>
                )}
              </div>

              <div className="form-control">
                <div className="flex justify-between items-center py-1">
                  <label className="label p-0">
                    <span className="label-text font-medium text-base-content/70">Password</span>
                  </label>
                  <a href="#" className="text-xs font-semibold text-primary hover:text-primary-focus transition-colors">Forgot password?</a>
                </div>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`input input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors pr-10 hover:border-base-content/30 ${errors.password ? 'input-error' : 'focus:border-primary'}`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-base-content/40 hover:text-base-content/80 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-error text-xs mt-1 px-1 font-medium">{errors.password.message}</span>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                className={`btn btn-primary w-full text-white font-semibold text-lg shadow-primary/30 shadow-lg group ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {!loading && <LogIn size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />}
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-base-content/60">
            Don't have an account?{' '}
            <NavLink to="/signup" className="font-semibold text-primary hover:text-primary-focus transition-colors">
              Create an account
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;