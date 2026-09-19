"use client";

import { useEffect, useState } from "react";
import { initFirebase, getToken, onMessage } from "@/lib/firebase";
import { toast } from "react-hot-toast";
import { usePathname, useRouter } from "next/navigation";
import { Bell, X, ShoppingBag } from "lucide-react";

export default function PushNotificationManager({ toneUrl }: { toneUrl?: string }) {
  const [isSupported, setIsSupported] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [incomingOrder, setIncomingOrder] = useState<{ title: string; body: string; url: string } | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check if the browser supports notifications and service workers
    if (typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator) {
      setIsSupported(true);
      
      // Fetch dynamic firebase configuration from database
      fetch('/api/settings/firebase')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.config) {
             setConfig(data.config);
          }
        })
        .catch(err => console.error("Failed to fetch Firebase config:", err));
    }
  }, []);

  useEffect(() => {
    if (!isSupported || !config) return;

    const { messaging } = initFirebase(config);
    if (!messaging) return;

    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          console.log("Notification permission granted.");
          
          // Get the FCM token
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          const token = await getToken(messaging, {
            vapidKey: config.vapidKey,
            serviceWorkerRegistration: registration
          });
          
          if (token) {
            console.log("FCM Token:", token);
            // Send this token to the backend if we are on the admin panel
            if (pathname.startsWith('/admin')) {
              try {
                await fetch('/api/admin/fcm-token', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ token })
                });
                console.log("Admin FCM token registered successfully.");
              } catch (err) {
                console.error("Failed to register Admin FCM token:", err);
              }
            }
          } else {
            console.log("No registration token available. Request permission to generate one.");
          }
        } else {
          console.log("Notification permission not granted.");
        }
      } catch (error) {
        console.error("An error occurred while retrieving token. ", error);
      }
    };

    if (Notification.permission === "granted") {
      requestPermission();
    }
    
    // Store request permission function in state so it can be called from UI
    setTriggerPermission(() => requestPermission);
    
    // Create a floating button in the UI for the admin to debug notifications
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      const debugBtn = document.createElement("button");
      debugBtn.innerText = `🔔 Push Status: ${Notification.permission}`;
      debugBtn.className = "fixed bottom-5 right-5 bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg z-50 font-medium text-sm hover:bg-purple-700 transition-all";
      debugBtn.onclick = () => {
        debugBtn.innerText = "Requesting...";
        requestPermission().then(() => {
          debugBtn.innerText = `🔔 Push Status: ${Notification.permission}`;
        });
      };
      document.body.appendChild(debugBtn);
      
      const testOverlayBtn = document.createElement("button");
      testOverlayBtn.innerText = `🧪 Test Overlay`;
      testOverlayBtn.className = "fixed bottom-16 right-5 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg z-50 font-medium text-sm hover:bg-green-700 transition-all";
      testOverlayBtn.onclick = () => {
        setIncomingOrder({
          title: "New Order! (Test)",
          body: "This is a test order notification.",
          url: "/admin/orders"
        });
      };
      document.body.appendChild(testOverlayBtn);
      
      return () => {
        if (document.body.contains(debugBtn)) {
          debugBtn.remove();
        }
        if (document.body.contains(testOverlayBtn)) {
          testOverlayBtn.remove();
        }
      };
    }

    // Listen for messages when the app is in the foreground
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Foreground message received:", payload);
      
      // Check if it's a new order notification and we are in admin
      const isOrder = payload.data?.type === 'order' || (payload.notification?.title && payload.notification.title.includes('Order'));
      
      if (isOrder) {
        setIncomingOrder({
          title: payload.notification?.title || "New Order!",
          body: payload.notification?.body || "A new order has been received.",
          url: payload.data?.url || "/admin/orders"
        });
      } else if (payload.notification) {
        // Show normal toast notification
        toast.success(
          `${payload.notification.title}\n${payload.notification.body}`,
          {
            duration: 5000,
            icon: '🔔',
          }
        );
      }
        
        // Play notification tone
        try {
          if (toneUrl) {
            new Audio(toneUrl).play().catch(e => console.error("Failed to play custom tone", e));
          } else {
            // Fallback synthetic beep
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
        } catch (error) {
          console.error("Audio playback error:", error);
        }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isSupported, config, pathname]);

  // Handle dismissal of custom prompt
  const [showPrompt, setShowPrompt] = useState(false);
  const [triggerPermission, setTriggerPermission] = useState<(() => Promise<void>) | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (pathname.startsWith('/admin') && Notification.permission === "default") {
        const hasDismissed = localStorage.getItem('push_prompt_dismissed');
        if (!hasDismissed) {
          setShowPrompt(true);
        }
      }
    }
  }, [pathname]);

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
                if (triggerPermission) {
                  await triggerPermission();
                } else if (typeof window !== "undefined" && "Notification" in window) {
                   await Notification.requestPermission();
                   // A reload will naturally trigger the useEffect to setup FCM again
                   window.location.reload();
                }
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

  return null;
}
