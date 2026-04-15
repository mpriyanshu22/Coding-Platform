import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../authSlice';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, LogOut, Code2, Settings } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <div className="navbar bg-base-100/70 backdrop-blur-md shadow-sm border-b border-base-200 sticky top-0 z-50 px-4 md:px-8 h-16">
      {/* Brand / Logo */}
      <div className="flex-1">
        <button
          onClick={() => navigate('/')}
          className="btn btn-ghost hover:bg-transparent normal-case text-xl md:text-2xl font-bold font-mono text-primary gap-2 px-0 flex items-center"
        >
          <Code2 size={28} />
          <span>CodeWithMe</span>
        </button>
      </div>

      {/* Right-hand side Container */}
      <div className="flex items-center gap-2 md:gap-3">

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-circle btn-sm flex items-center justify-center transition-transform active:scale-90"
          title="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun size={20} className="text-warning" />
          ) : (
            <Moon size={20} className="text-slate-600" />
          )}
        </button>

        {/* Admin Button - Styled as a badge-like button */}
        {user?.role === 'admin' && (
          <button
            onClick={() => navigate('/admin')}
            className="btn btn-warning btn-sm border-none shadow-sm hover:shadow-md font-bold px-4 gap-2 flex items-center"
          >
            <Settings size={14} />
            <span className="hidden sm:inline">Admin</span>
          </button>
        )}

        {/* Profile Dropdown */}
        <div className="dropdown dropdown-end flex items-center">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle avatar placeholder hover:bg-base-200 transition-colors"
          >
            <div className="bg-neutral text-neutral-content rounded-full w-9 flex items-center justify-center border border-base-300 shadow-inner">
              <span className="text-sm font-bold uppercase select-none">
                {user?.username?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </span>
            </div>
          </div>

          <ul
            tabIndex={0}
            className="mt-3 z-[1] p-2 shadow-xl menu menu-sm dropdown-content bg-base-100 rounded-xl w-60 border border-base-200 animate-in fade-in slide-in-from-top-2"
          >
            <li className="px-4 py-3">
              <div className="flex flex-col gap-0.5 p-0 bg-transparent hover:bg-transparent cursor-default">
                <span className="font-bold text-sm text-base-content truncate">
                  {user?.username || 'User Account'}
                </span>
                <span className="text-xs opacity-50 truncate font-medium">
                  {user?.email}
                </span>
              </div>
            </li>
            <div className="divider my-0 opacity-50"></div>
            <li>
              <button
                onClick={handleLogout}
                className="text-error hover:bg-error/10 font-semibold flex items-center gap-2 m-1"
              >
                <LogOut size={16} />
                Logout
              </button>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default Navbar;