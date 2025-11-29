import { ReactElement, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';

interface ProtectedRouteProps {
  children: ReactElement;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const { user, accessToken, fetchCurrentUser } = useUserStore();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const ensureProfile = async () => {
      if (accessToken && !user) {
        setChecking(true);
        await fetchCurrentUser();
        setChecking(false);
      }
    };

    ensureProfile();
  }, [accessToken, user, fetchCurrentUser]);

  if (!accessToken && !user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (checking) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <span className="flex items-center gap-2 text-sm text-gray-600">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
          Checking session...
        </span>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
