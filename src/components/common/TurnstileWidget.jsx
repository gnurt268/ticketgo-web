import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Alert, Box, CircularProgress } from '@mui/material';

const SCRIPT_ID = 'turnstile-api-script';
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

const TurnstileWidget = forwardRef(({ siteKey, onVerify, onExpire, onError }, ref) => {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [isLoading, setIsLoading] = useState(Boolean(siteKey));
  const [scriptError, setScriptError] = useState(null);

  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onVerifyRef.current = onVerify;
    onExpireRef.current = onExpire;
    onErrorRef.current = onError;
  }, [onVerify, onExpire, onError]);

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.reset(widgetIdRef.current);
      }
    },
  }));

  useEffect(() => {
    if (!siteKey) {
      return undefined;
    }

    let isMounted = true;

    const renderWidget = () => {
      if (!isMounted || !containerRef.current || !window.turnstile) {
        return;
      }

      if (widgetIdRef.current !== null) {
        return;
      }

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: 'light',
        callback: (token) => onVerifyRef.current?.(token),
        'expired-callback': () => {
          onExpireRef.current?.();
          if (widgetIdRef.current !== null) {
            window.turnstile.reset(widgetIdRef.current);
          }
        },
        'error-callback': () => {
          onErrorRef.current?.();
          setScriptError('Không thể xác minh CAPTCHA. Vui lòng thử lại.');
        },
      });
      setIsLoading(false);
    };

    const existingScript = document.getElementById(SCRIPT_ID);
    if (existingScript) {
      if (window.turnstile) {
        renderWidget();
      } else {
        existingScript.addEventListener('load', renderWidget, { once: true });
      }
    } else {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = renderWidget;
      script.onerror = () => {
        setScriptError('Không tải được CAPTCHA. Vui lòng kiểm tra kết nối mạng.');
        setIsLoading(false);
      };
      document.head.appendChild(script);
    }

    return () => {
      isMounted = false;
      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey]);

  if (!siteKey) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      {isLoading && <CircularProgress size={24} />}
      {scriptError && <Alert severity="error">{scriptError}</Alert>}
      <Box ref={containerRef} />
    </Box>
  );
});

TurnstileWidget.displayName = 'TurnstileWidget';

export default TurnstileWidget;
