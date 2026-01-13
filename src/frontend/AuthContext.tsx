import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Define what a User object looks like
type User = {
  id: number;
  username: string;
  email: string;
  settings?: string;
};

// Define what the AuthContext provides
type AuthContextType = {
  token: string | null;
  user: User | null;
  login: (newToken: string, newUser: User) => void;
  logout: () => void;
  initialized: boolean;
};

// Create context with proper type (or null initially)
const AuthContext = createContext<AuthContextType | null>(null);

// Props type for AuthProvider component
type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');

    if (storedToken) {
      setToken(storedToken);
    }
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
    setInitialized(true);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser || null);
    localStorage.setItem('authToken', newToken);
    if (newUser) {
      localStorage.setItem('authUser', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('authUser');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  };

  const value: AuthContextType = { token, user, login, logout, initialized };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
