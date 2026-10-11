/**
 * AuthProvider component.
 * Exposes authentication state to the entire app hierarchy.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './useAuth';
import { authService } from '@/services';
import type { Profile } from '@/types';
import type { SignUpParams, LogInParams } from '@/services/types';
import { useDemoStore } from '@/store/demoStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const currentPersonaId = useDemoStore((state) => state.currentPersonaId);

  const refreshUser = useCallback(async () => {
    try {
      const current = await authService.getCurrentUser();
      setUser(current);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync when demoStore changes persona
  useEffect(() => {
    refreshUser();
  }, [currentPersonaId, refreshUser]);

  const logIn = useCallback(async (params: LogInParams) => {
    setIsLoading(true);
    try {
      const profile = await authService.logIn(params);
      setUser(profile);
      return profile;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (params: SignUpParams) => {
    setIsLoading(true);
    try {
      const profile = await authService.signUp(params);
      setUser(profile);
      return profile;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logOut();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const switchPersona = useCallback(async (personaId: string) => {
    setIsLoading(true);
    try {
      const profile = await authService.switchPersona(personaId);
      setUser(profile);
      return profile;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        logIn,
        signUp,
        logOut,
        switchPersona,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
