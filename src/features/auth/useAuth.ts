/**
 * Auth Hook & Context.
 * Wraps authService and connects to useDemoStore for reactive persona switches.
 * Never imports mock data directly — calls services layer exclusively.
 */
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { authService } from '@/services';
import type { Profile } from '@/types';
import type { SignUpParams, LogInParams } from '@/services/types';
import { useDemoStore } from '@/store/demoStore';

interface AuthContextValue {
  user: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logIn: (params: LogInParams) => Promise<Profile>;
  signUp: (params: SignUpParams) => Promise<Profile>;
  logOut: () => Promise<void>;
  switchPersona: (personaId: string) => Promise<Profile>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
