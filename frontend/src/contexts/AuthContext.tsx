import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { api } from '../lib/api';

type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'security' | 'parent' | 'teacher';
  phone_number?: string;
  is_active: boolean;
};

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: string, phoneNumber?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userData = await api.getMe();
        setUser({ id: userData.id, email: userData.email });
        setProfile({
          id: userData.id,
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role as UserProfile['role'],
          phone_number: userData.phone_number,
          is_active: userData.is_active,
        });
      } catch (error) {
        // User not authenticated, clear token
        api.clearToken();
      }
    };

    checkAuthStatus();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const authData = await api.login(email, password);
      setUser({ id: authData.user.id, email: authData.user.email });
      setProfile({
        id: authData.user.id,
        email: authData.user.email,
        full_name: authData.user.full_name,
        role: authData.user.role as UserProfile['role'],
        phone_number: authData.user.phone_number,
        is_active: authData.user.is_active,
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: string, phoneNumber?: string) => {
    setLoading(true);
    try {
      const authData = await api.register(email, password, fullName, role, phoneNumber);
      setUser({ id: authData.user.id, email: authData.user.email });
      setProfile({
        id: authData.user.id,
        email: authData.user.email,
        full_name: authData.user.full_name,
        role: authData.user.role as UserProfile['role'],
        phone_number: authData.user.phone_number,
        is_active: authData.user.is_active,
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    // TODO: Implement password reset with backend
    console.log('Password reset requested for', email);
    throw new Error('Password reset not yet implemented');
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
