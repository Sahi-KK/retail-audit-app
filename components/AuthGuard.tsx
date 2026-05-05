import React, { useEffect } from 'react';
import { useAuditStore } from '../store/auditStore';
import { useRouter, useSegments } from 'expo-router';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { auth, updateAuth } = useAuditStore();
  const router = useRouter();
  const segments = useSegments();

  const validateAccess = (n: string, i: string) => {
    const trimmedName = (n || "").trim();
    const trimmedId = (i || "").trim();
    return trimmedName.length > 0 && trimmedId.length > 0;
  };

  const isAuthenticated = auth.auditorId && auth.auditorName && validateAccess(auth.auditorName, auth.auditorId);

  useEffect(() => {
    if (auth.auditorId && auth.auditorName && !validateAccess(auth.auditorName, auth.auditorId)) {
      updateAuth('', '');
    }
  }, [auth.auditorId, auth.auditorName]);

  useEffect(() => {
    // Determine if we are currently on the login screen
    const inAuthGroup = segments[0] === 'login';
    
    console.log(`[AUTH] Guard Check - Authenticated: ${isAuthenticated}, Segments: ${JSON.stringify(segments)}, InAuthGroup: ${inAuthGroup}`);

    if (!isAuthenticated && !inAuthGroup) {
      console.log("[AUTH] Unverified Identity. Redirecting to Entry Protocol...");
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      console.log("[AUTH] Identity Verified. Redirecting to Command Center...");
      router.replace('/');
    }
  }, [isAuthenticated, segments, router]);

  return <>{children}</>;
}
