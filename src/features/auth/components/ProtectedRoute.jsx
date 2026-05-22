import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { Crown } from 'lucide-react';
import { selectIsAuthenticated, selectCurrentUser, setCredentials, clearCredentials } from '../store/authSlice';
import { API_BASE_URL } from '../../../config/env';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const location = useLocation();
  const [isAttemptingSilentRefresh, setIsAttemptingSilentRefresh] = useState(!isAuthenticated);

  useEffect(() => {
    const attemptSilentRefresh = async () => {
      if (isAuthenticated) {
        setIsAttemptingSilentRefresh(false);
        return;
      }

      const refreshToken = localStorage.getItem('admin_refresh_token');
      if (!refreshToken) {
        setIsAttemptingSilentRefresh(false);
        return;
      }

      if (refreshToken === 'mock_sandbox_refresh_token_jwt') {
        const mockUser = {
          userId: '00000000-0000-0000-0000-000000000000',
          email: 'admin@cab.local',
          fullName: 'Tài Khoản Admin Demo',
          role: 'ADMIN',
          accountStatus: 'ACTIVE',
        };

        dispatch(
          setCredentials({
            accessToken: 'mock_sandbox_access_token_jwt',
            user: mockUser,
          })
        );
        setIsAttemptingSilentRefresh(false);
        return;
      }

      try {
        const res = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
          refreshToken,
        });

        const data = res.data.result;
        const accessToken = data.accessToken;
        const newRefreshToken = data.refreshToken;
        const userSummary = data.user;

        if (userSummary?.role !== 'ADMIN') {
          throw new Error('Unauthorized role access');
        }

        dispatch(
          setCredentials({
            accessToken,
            user: userSummary,
          })
        );

        if (newRefreshToken) {
          localStorage.setItem('admin_refresh_token', newRefreshToken);
        }
      } catch (err) {
        console.error('Silent refresh failed:', err);
        dispatch(clearCredentials());
      } finally {
        setIsAttemptingSilentRefresh(false);
      }
    };

    attemptSilentRefresh();
  }, [isAuthenticated, dispatch]);

  if (isAttemptingSilentRefresh) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-base">
        <div className="text-center flex flex-col items-center gap-5">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-accent-primary to-blue-500 flex items-center justify-center shadow-neon animate-pulse-slow">
            <Crown size={28} className="text-white" />
          </div>
          <p className="text-sm font-semibold text-text-secondary tracking-wide">
            Verifying Admin Session...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-base p-4">
        <div className="w-full max-w-md bg-surface border border-border-light rounded-xl p-8 text-center shadow-card-hover">
          <div className="w-16 h-16 rounded-xl bg-status-danger-bg border border-status-danger/20 flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">🚫</span>
          </div>
          <h2 className="text-xl font-bold text-status-danger mb-3">Access Denied</h2>
          <p className="text-sm text-text-secondary mb-6 leading-relaxed">
            Only users with the administrator role are permitted to enter this portal.
          </p>
          <button
            className="w-full py-3 bg-gradient-to-r from-accent-primary to-violet-600 text-white font-bold text-sm rounded-lg shadow-accent hover:shadow-accent-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
            onClick={() => dispatch(clearCredentials())}
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
