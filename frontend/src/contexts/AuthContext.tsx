import { createContext, useContext, useState, ReactNode } from 'react';

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

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      setUser({ id: response.user.id, email: response.user.email });
      setProfile(response.user);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: string, phoneNumber?: string) => {
    setLoading(true);
    try {
      await authService.register({
        email,
        full_name: fullName,
        role: role as 'admin' | 'parent' | 'teacher' | 'security',
        phone_number: phoneNumber,
        password
      });
      
      // After successful registration, sign in
      await signIn(email, password);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    // Mock reset
    console.log('Password reset for', email);
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
