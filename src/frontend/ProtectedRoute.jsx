import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function ProtectedRoute({ children }) {
  const { token, initialized } = useAuth();

  if (!initialized) {
    // Optionally show a splash/loading state while we restore auth from localStorage
    return null;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
