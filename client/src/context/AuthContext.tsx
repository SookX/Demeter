// contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios from 'axios';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  updated_at?: string;
}

export interface User {
  id: string;
  email: string;
}

export interface Session {
  token: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/auth',
  withCredentials: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Persist token to sessionStorage
  useEffect(() => {
    if (session?.token) {
      sessionStorage.setItem('token', session.token);
    } else {
      sessionStorage.removeItem('token');
    }
  }, [session]);

  const loadProfile = async (userId: string) => {
    try {
      const { data } = await api.get(`/profile/${userId}`);
      setProfile(data);
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data } = await api.post('/login', { email, password });
      setUser(data.user);
      setSession(data); // triggers sessionStorage update
      await loadProfile(data.user.id);
      return { error: null };
    } catch (err: any) {
      return { error: err.response?.data || err };
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const { data } = await api.post('/register', {
        email,
        password,
        username,
      });
      setUser(data.user);
      setSession(data); // triggers sessionStorage update
      setProfile(data.profile);
      return { error: null };
    } catch (err: any) {
      return { error: err.response?.data || err };
    }
  };

  const signInWithGoogle = async () => {
    try {
      window.location.href = `${api.defaults.baseURL}/google`;
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      await api.post('/auth/signout');
    } catch (err) {
      console.warn('Signout failed:', err);
    } finally {
      setUser(null);
      setProfile(null);
      setSession(null); // clears token from sessionStorage via useEffect
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { data } = await api.patch(`/profile/${user.id}`, updates);
      setProfile((prev) => (prev ? { ...prev, ...data } : data));
      return { error: null };
    } catch (err: any) {
      return { error: err.response?.data || err };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
