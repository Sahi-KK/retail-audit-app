import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useEffect } from 'react';
import { useAuditStore } from '../store/auditStore';

WebBrowser.maybeCompleteAuthSession();

// Google Client IDs provided by the user
const WEB_CLIENT_ID = "610435419091-0ukqoo0up84ts0go6lnh7q129dlccf0f.apps.googleusercontent.com";
const ANDROID_CLIENT_ID = "610435419091-ibvk54r6nvf2tqdim69arl53u1soeeub.apps.googleusercontent.com";

export function useGoogleAuth() {
  const { updateAuth } = useAuditStore();

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: WEB_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        fetchUserInfo(authentication.accessToken);
      }
    }
  }, [response]);

  const fetchUserInfo = async (token: string) => {
    try {
      const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = await res.json();
      
      if (user.email) {
        // GHOST IDENTITY: Generate a unique, unchangeable ID from the email
        const handle = user.email.split('@')[0];
        const domain = user.email.split('@')[1].split('.')[0];
        const verifiedId = `${handle}_${domain}`.toLowerCase();
        
        // Update store with verified credentials
        updateAuth(
          user.name || handle, 
          verifiedId, 
          true, // isGoogleAuth
          user.email
        );
      }
    } catch (error) {
      console.error("Google Auth: Failed to fetch user info", error);
    }
  };

  return {
    signIn: () => promptAsync(),
    isLoading: !request,
  };
}
