import { useEffect, useRef, useState } from "react";

interface TurnstileCaptchaProps {
  onVerify: (token: string) => void;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    turnstile: {
      render: (container: string | HTMLElement, options: any) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

export function TurnstileCaptcha({ onVerify, onError }: TurnstileCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [widgetId, setWidgetId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Turnstile script
    if (!document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]')) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => setIsLoaded(true);
      document.head.appendChild(script);
    } else {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && containerRef.current && window.turnstile) {
      const id = window.turnstile.render(containerRef.current, {
        sitekey: '0x4AAAAAAAzR-b8BRENpJ7SU', // Use your actual Cloudflare Turnstile site key
        callback: onVerify,
        'error-callback': onError,
        theme: 'light',
        size: 'normal'
      });
      setWidgetId(id);
    }
  }, [isLoaded, onVerify, onError]);

  return <div ref={containerRef} className="turnstile-container" />;
}