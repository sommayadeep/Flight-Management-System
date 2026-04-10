import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Parse token from URL
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      // Save token (e.g., to localStorage)
      localStorage.setItem('token', token);
      // Redirect to home or dashboard
      navigate('/');
    } else {
      // Handle error
      navigate('/login');
    }
  }, [location, navigate]);

  return <div>Logging you in...</div>;
}
