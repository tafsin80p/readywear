"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
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
  const soundLoopRef = useRef<any>(null);
  const seenOrderIdsRef = useRef<Set<string>>(new Set());

  // Stop alert sound
  const stopAlertSound = useCallback(() => {
    if (soundLoopRef.current) {
      clearInterval(soundLoopRef.current);
      soundLoopRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  // Start continuous loud order alert sound until user interacts
  const startAlertSound = useCallback(() => {
    stopAlertSound();

    if (toneUrl && audioRef.current) {
      try {
        audioRef.current.src = toneUrl;
        audioRef.current.loop = true;
        audioRef.current.load();
        const p = audioRef.current.play();
        if (p) p.catch(() => {});
        return;
      } catch (e) {
        console.error("Audio element error", e);
      }
    }

    // High quality loud repeating cash-register / POS chime via Web Audio
    const playChimeSequence = () => {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();

        const playTone = (freq: number, start: number, dur: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
          gain.gain.setValueAtTime(0, ctx.currentTime + start);
          gain.gain.linearRampToValueAtTime(0.7, ctx.currentTime + start + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + start);
          osc.stop(ctx.currentTime + start + dur);
        };

        const now = 0;
        playTone(987.77, now, 0.3);         // B5
        playTone(1318.51, now + 0.18, 0.35); // E6
        playTone(1760.00, now + 0.38, 0.7);  // A6
      } catch (e) {
        console.error("Web audio chime error:", e);
      }
    };

    playChimeSequence();
    soundLoopRef.current = setInterval(playChimeSequence, 1600);
  }, [toneUrl, stopAlertSound]);

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

  // OneSignal Init
  useEffect(() => {
    if (!isSupported || !appId) return;

    const initOneSignal = async () => {
      try {
        await OneSignal.init({
          appId: appId,
          safari_web_id: "web.onesignal.auto.6514249a-4cb8-451b-a889-88f5913c9a7f",
          allowLocalhostAsSecureOrigin: true
        });

        if (pathname.startsWith('/admin')) {
          await OneSignal.User.addTag("role", "admin");
        }

        const updateSubscriptionStatus = () => {
          setIsSubscribed(!!OneSignal.User.PushSubscription.optedIn);
        };
        updateSubscriptionStatus();
        OneSignal.User.PushSubscription.addEventListener("change", updateSubscriptionStatus);

        // Handle foreground notifications
        const handleNotification = (event: any) => {
          event.preventDefault();
          
          const notification = event.notification;
          const data = notification.additionalData as any;
          const title = notification.title || "New Notification";
          const body = notification.body || "";
          
          const isOrder = data?.type === 'order' || 
            title.toLowerCase().includes('order') || 
            body.toLowerCase().includes('order') ||
            (data?.url && String(data.url).includes('/orders'));

          if (isOrder) {
            if (pathname.startsWith('/admin')) {
              setIncomingOrder({
                title,
                body,
                url: data?.url || "/admin/orders"
              });
              startAlertSound();
            } else {
              toast.success(`${title}\n${body}`, {
                duration: 5000,
                icon: '🛍️',
              });
            }
          } else {
            toast.success(`${title}\n${body}`, {
              duration: 5000,
              icon: '🔔',
            });
          }
        };

        OneSignal.Notifications.addEventListener('foregroundWillDisplay', handleNotification);

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

  }, [isSupported, appId, pathname, startAlertSound]);

  // Handle custom prompt
  useEffect(() => {
    if (typeof window !== "undefined" && pathname.startsWith('/admin') && pathname !== '/admin/login' && appId) {
      const checkPermission = async () => {
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

  // Fast Polling for New Orders in Admin Panel (every 5 seconds)
  useEffect(() => {
    if (!pathname.startsWith('/admin')) return;
    
    let lastChecked = Date.now() - 5000;
    
    const pollOrders = async () => {
      try {
        const res = await fetch(`/api/admin/orders/latest?since=${lastChecked}`);
        if (!res.ok) return;
        
        const data = await res.json();
        
        if (data.success && data.orders && data.orders.length > 0) {
          const freshOrders = data.orders.filter((o: any) => !seenOrderIdsRef.current.has(o._id));
          
          if (freshOrders.length > 0) {
            const newOrder = freshOrders[0];
            seenOrderIdsRef.current.add(newOrder._id);
            
            setIncomingOrder({
              title: "New Order Received! 🛍️",
              body: `Order #${newOrder.orderId} from ${newOrder.customerInfo?.firstName || 'Customer'} • ৳${newOrder.pricing?.total?.toLocaleString('en-US')}`,
              url: `/admin/orders/${newOrder._id}`
            });
            
            startAlertSound();
          }
        }
        
        lastChecked = Date.now();
      } catch (err) {
        // Silently fail polling errors
      }
    };

    const interval = setInterval(pollOrders, 5000);
    return () => {
      clearInterval(interval);
      stopAlertSound();
    };
  }, [pathname, startAlertSound, stopAlertSound]);

  const handleCloseOverlay = (redirectUrl?: string) => {
    setIsClosing(true);
    stopAlertSound();

    setTimeout(() => {
      setIncomingOrder(null);
      setIsClosing(false);
      if (redirectUrl) {
        router.push(redirectUrl);
      }
    }, 200);
  };

  // FULL SCREEN POPUP ALWAYS HAS HIGHEST PRIORITY OVER EVERYTHING
  if (incomingOrder) {
    return (
      <div className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-primary/95 backdrop-blur-md p-4 duration-300 ${isClosing ? 'animate-zoom-out' : 'animate-fade-zoom'}`}>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleCloseOverlay();
          }}
          className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 p-2.5 rounded-full transition-all"
          title="Close Alert"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div 
          onClick={() => handleCloseOverlay(incomingOrder.url)}
          className="flex flex-col items-center justify-center cursor-pointer text-white group max-w-lg text-center"
        >
          <div className="w-24 h-24 bg-white text-primary rounded-full flex items-center justify-center mb-8 shadow-2xl animate-ripple group-hover:scale-110 transition-transform duration-300">
            <ShoppingBag className="w-12 h-12 animate-ring" />
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black mb-4 text-center tracking-tight drop-shadow-lg">
            {incomingOrder.title}
          </h1>
          <p className="text-base md:text-xl text-white/90 text-center font-medium mb-8 drop-shadow-md leading-relaxed px-4">
            {incomingOrder.body}
          </p>
          
          <div className="bg-white text-primary font-black text-lg px-8 py-3 rounded-2xl shadow-xl hover:bg-gray-50 transition-colors">
            View Order Details →
          </div>
        </div>
      </div>
    );
  }

  // Push Prompt Dialog
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

  return (
    <>
      <audio ref={audioRef} preload="auto" className="hidden" playsInline />
      
      {/* Floating Subscribe Button if not subscribed */}
      {!isSubscribed && pathname.startsWith('/admin') && !showPrompt && isSupported && (
        <button
          onClick={async () => {
            try {
              await OneSignal.Notifications.requestPermission();
              setIsSubscribed(!!OneSignal.User.PushSubscription.optedIn);
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
