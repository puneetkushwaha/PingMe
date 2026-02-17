import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast"; // Added toast function

import { useCallStore } from "./store/useCallStore";
import CallModal from "./components/CallModal";

import { messaging, getToken, onMessage, VAPID_KEY } from "./lib/firebase"; // Added FCM imports
import { axiosInstance } from "./lib/axios"; // Added axiosInstance
import { useChatStore } from "./store/useChatStore"; // Added useChatStore

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();
  const { theme } = useThemeStore();
  const { subscribeToCalls, unsubscribeFromCalls } = useCallStore();
  const { subscribeToMessages, unsubscribeFromMessages } = useChatStore(); // Added subscribeToMessages
  const [deferredPrompt, setDeferredPrompt] = useState(null);


  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (authUser) {
      subscribeToCalls();
      subscribeToMessages(); // Added subscribeToMessages
      return () => {
        unsubscribeFromCalls();
        unsubscribeFromMessages(); // Added unsubscribeFromMessages
      };
    }
  }, [authUser, subscribeToCalls, unsubscribeFromCalls, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // PWA Install Prompt Handler
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.deferredPrompt = e; // Store globally for access from settings
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Request Notification Permission
  useEffect(() => {
    if (authUser && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, [authUser]);

  // FCM Token Registration
  useEffect(() => {
    if (authUser && 'Notification' in window) {
      const registerFCMToken = async () => {
        try {
          // Register service worker
          if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log('Service Worker registered:', registration);

            // Request notification permission
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
              // Get FCM token
              const token = await getToken(messaging, {
                vapidKey: VAPID_KEY,
                serviceWorkerRegistration: registration
              });

              if (token) {
                console.log('FCM Token:', token);
                // Send token to backend
                await axiosInstance.post('/fcm/token', { token });
                console.log('FCM token saved to backend');
              }
            }
          }
        } catch (error) {
          console.error('Error registering FCM:', error);
        }
      };

      registerFCMToken();
    }
  }, [authUser]);

  // Handle foreground messages
  useEffect(() => {
    if (authUser) {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Foreground message received:', payload);
        toast(`${payload.notification.title}: ${payload.notification.body}`, {
          icon: '💬',
          duration: 4000
        });
      });

      return () => unsubscribe();
    }
  }, [authUser]);


  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div data-theme={theme}>
      {/* <Navbar /> */}

      <Routes>
        <Route path="/" element={authUser ? <HomePage onlineUsers={onlineUsers} /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/settings" element={authUser ? <SettingsPage /> : <Navigate to="/login" />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>

      <CallModal />
      <Toaster />
    </div>
  );
};
export default App;
