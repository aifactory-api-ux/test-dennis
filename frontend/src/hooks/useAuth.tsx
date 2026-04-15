import { useState, useContext, createContext } from 'react';
import { User, UserLoginRequest, UserLoginResponse } from '../types/user';
import { login as apiLogin } from '../api/auth';

// Extended AuthContextType to include error and isLoading for hooks
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: UserLoginRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  error: string | null;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: UserLoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response: UserLoginResponse = await apiLogin(credentials);
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem('token', response.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
    error,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
