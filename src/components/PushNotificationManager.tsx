"use client";

import React, { useEffect, useState, useRef } from "react";
import OneSignal from 'react-onesignal';
import { toast } from "react-hot-toast";
import { usePathname, useRouter } from "next/navigation";
import { Bell, X, ShoppingBag } from "lucide-react";

export default function PushNotificationManager({ toneUrl }: { toneUrl?: string }) {
  const [isSupported, setIsSupported] = useState(false);
  const [appId, setAppId] = useState<string | null>(null);
  const [incomingOrder, setIncomingOrder] = useState<{ title: string; body: string; url: string } | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsSupported(true);
      // Fetch OneSignal config
      fetch('/api/settings/onesignal')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.config?.appId) {
             setAppId(data.config.appId);
          }
        })
        .catch(err => console.error("Failed to fetch OneSignal config:", err));
    }
  }, []);

  // Unlock Audio on First User Interaction
  useEffect(() => {
    const unlockAudio = () => {
      if (audioRef.current && !audioUnlocked) {
        audioRef.current.play().then(() => {
          audioRef.current?.pause();
          setAudioUnlocked(true);
        }).catch(() => {});
        // Remove listeners once unlocked
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      }
    };

    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, [audioUnlocked]);

  useEffect(() => {
    if (!isSupported || !appId) return;

    const initOneSignal = async () => {
      try {
        await OneSignal.init({
          appId: appId,
          safari_web_id: "web.onesignal.auto.6514249a-4cb8-451b-a889-88f5913c9a7f",
          allowLocalhostAsSecureOrigin: true
        });

        // Add 'role: admin' tag if user is in admin dashboard
        if (pathname.startsWith('/admin')) {
          await OneSignal.User.addTag("role", "admin");
        }

        // Check and track subscription status
        const updateSubscriptionStatus = () => {
          setIsSubscribed(OneSignal.User.PushSubscription.optedIn);
        };
        updateSubscriptionStatus();
        OneSignal.User.PushSubscription.addEventListener("change", updateSubscriptionStatus);

        // Handle foreground notifications (OneSignal v16+)
        const handleNotification = (event: any) => {
          event.preventDefault(); // Prevent default browser notification in foreground
          
          const notification = event.notification;
          const data = notification.additionalData as any;
          const title = notification.title || "New Notification";
          const body = notification.body || "";
          
          const isOrder = data?.type === 'order' || title.toLowerCase().includes('order');

          if (isOrder && pathname.startsWith('/admin')) {
            setIncomingOrder({
              title,
              body,
              url: data?.url || "/admin/orders"
            });
          } else {
            toast.success(`${title}\n${body}`, {
              duration: 5000,
              icon: '🔔',
            });
          }

          // Play audio using the unlocked reference
          if (toneUrl && audioRef.current) {
            audioRef.current.src = toneUrl;
            audioRef.current.loop = true;
            audioRef.current.play().catch(e => console.error("Failed to play order alert:", e));
          } else if (!toneUrl) {
              const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
              if (AudioContext) {
                const ctx = new AudioContext();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
                gain.gain.setValueAtTime(0, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.6);
              }
            }
        };

        OneSignal.Notifications.addEventListener('foregroundWillDisplay', handleNotification);

        // Cleanup function for listener
        return () => {
          OneSignal.Notifications.removeEventListener('foregroundWillDisplay', handleNotification);
        };

      } catch (err) {
        console.error("OneSignal Init Error:", err);
      }
    };

    let cleanupFn: (() => void) | void;
    initOneSignal().then(cleanup => {
      cleanupFn = cleanup;
    });

    return () => {
      if (cleanupFn) cleanupFn();
    };

  }, [isSupported, appId, pathname, toneUrl]);

  // Handle custom prompt
  useEffect(() => {
    if (typeof window !== "undefined" && pathname.startsWith('/admin') && pathname !== '/admin/login' && appId) {
      const checkPermission = async () => {
        // OneSignal uses its own permission state, but browser permission is sufficient for the prompt check
        if (Notification.permission === "default") {
          const hasDismissed = localStorage.getItem('push_prompt_dismissed');
          if (!hasDismissed) {
            setShowPrompt(true);
          }
        }
      };
      checkPermission();
    }
  }, [pathname, appId]);

  if (showPrompt && pathname.startsWith('/admin')) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative animate-zoom-in text-center">
          <button 
            onClick={() => {
              setShowPrompt(false);
              localStorage.setItem('push_prompt_dismissed', 'true');
            }}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Bell className="w-10 h-10 animate-bounce" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Stay Updated!</h2>
          <p className="text-gray-600 mb-8 leading-relaxed text-sm">
            Allow push notifications to get instant alerts for new orders, low stock, and important updates in your store.
          </p>
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={async () => {
                setShowPrompt(false);
                try {
                  await OneSignal.Notifications.requestPermission();
                } catch (e) {}
              }}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2"
            >
              Allow Notifications
            </button>
            <button 
              onClick={() => {
                setShowPrompt(false);
                localStorage.setItem('push_prompt_dismissed', 'true');
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleCloseOverlay = (redirectUrl?: string) => {
    setIsClosing(true);
    
    // Stop audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setTimeout(() => {
      setIncomingOrder(null);
      setIsClosing(false);
      if (redirectUrl) {
        router.push(redirectUrl);
      }
    }, 200);
  };

  if (incomingOrder) {
    return (
      <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-primary/95 backdrop-blur-md p-4 duration-300 ${isClosing ? 'animate-zoom-out' : 'animate-fade-zoom'}`}>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleCloseOverlay();
          }}
          className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 p-2 rounded-full transition-all"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div 
          onClick={() => handleCloseOverlay(incomingOrder.url)}
          className="flex flex-col items-center justify-center cursor-pointer text-white group"
        >
          <div className="w-24 h-24 bg-white text-primary rounded-full flex items-center justify-center mb-8 shadow-2xl animate-ripple group-hover:scale-110 transition-transform duration-300">
            <ShoppingBag className="w-12 h-12 animate-ring" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-center tracking-tight drop-shadow-lg">
            {incomingOrder.title}
          </h1>
          <p className="text-lg md:text-xl text-white/90 text-center max-w-2xl font-medium mb-8 drop-shadow-md">
            {incomingOrder.body}
          </p>
          
          <div className="bg-white text-primary font-black text-lg px-8 py-3 rounded-2xl shadow-xl hover:bg-gray-50 transition-colors">
            View Order Details
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <audio ref={audioRef} preload="auto" className="hidden" playsInline />
      
      {/* Floating Subscribe Button if not subscribed */}
      {!isSubscribed && pathname.startsWith('/admin') && !showPrompt && isSupported && (
        <button
          onClick={async () => {
            try {
              await OneSignal.Notifications.requestPermission();
              setIsSubscribed(OneSignal.User.PushSubscription.optedIn);
            } catch (e) {}
          }}
          className="fixed bottom-24 md:bottom-6 right-6 z-[9000] bg-primary hover:bg-primary/90 text-white p-4 rounded-full shadow-2xl flex items-center gap-3 group animate-bounce"
        >
          <Bell className="w-6 h-6 animate-ring" />
          <span className="font-bold hidden md:block group-hover:block whitespace-nowrap overflow-hidden transition-all max-w-0 group-hover:max-w-[200px]">
            Enable Alerts
          </span>
        </button>
      )}
    </>
  );
}
