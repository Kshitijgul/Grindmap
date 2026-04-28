import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Still checking auth — show nothing (or a spinner)
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-lime-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Checking session...</p>
        </div>
      </div>
    );
  }

  // Not logged in — redirect to home
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Logged in — render the page
  return children;
}