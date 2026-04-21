import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Crypto from 'expo-crypto';
import { useState, useEffect } from 'react';
import { useAuditStore } from '../store/auditStore';

// Initialize the web browser for the auth flow
WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const { updateAuth } = useAuditStore();
  const [isLoading, setIsLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: '610435419091-0ukqoo0up84ts0go6lnh7q129dlccf0f.apps.googleusercontent.com',
    androidClientId: '610435419091-ibvk54r6nvf2tqdim69arl53u1soeeub.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleLoginSuccess(authentication?.accessToken);
    }
  }, [response]);

  const handleLoginSuccess = async (token: string | undefined) => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = await userInfoResponse.json();
      
      // Generate a deterministic Auditor ID from the email
      const emailHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        user.email
      );
      const shortId = `LUX-${emailHash.substring(0, 4).toUpperCase()}`;

      // Update global store
      updateAuth(user.name, shortId);
      
    } catch (error) {
      console.error('Google Auth Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async () => {
    setIsLoading(true);
    try {
      await promptAsync();
    } catch (e) {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    updateAuth('', '');
  };

  return { signIn, signOut, isLoading, request };
}
