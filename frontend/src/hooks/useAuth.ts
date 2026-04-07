import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as apiLogin, getCurrentUser } from '../api/auth';
import { UserLoginRequest, UserResponse } from '../types/user';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserResponse | null;
  loading: boolean;
  login: (credentials: UserLoginRequest) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user && !!localStorage.getItem('auth_token');

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      loadUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  async function loadUser(token: string) {
    try {
      const userData = await getCurrentUser(token);
      setUser(userData);
    } catch (err) {
      console.error('Failed to load user:', err);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  }

  async function login(credentials: UserLoginRequest): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const response = await apiLogin(credentials);
      localStorage.setItem('auth_token', response.token);
      setUser(response.user);
    } catch (err: any) {
      setError(err.message || 'Error de autenticación');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('auth_token');
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        logout,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default useAuth;
