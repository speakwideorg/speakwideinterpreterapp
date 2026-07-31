import React from 'react';
import { View, Platform } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

interface CaptchaWebViewProps {
  siteKey: string;
  baseUrl: string;
  onSuccess: (token: string) => void;
  onError: (error: string) => void;
}

export const CaptchaWebView: React.FC<CaptchaWebViewProps> = ({
  siteKey,
  baseUrl,
  onSuccess,
  onError,
}) => {
  let formattedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  if (formattedBaseUrl.includes('admin.speakwide.com')) {
    formattedBaseUrl = 'https://speakwide.com/';
  }

  const userAgent = Platform.OS === 'ios'
    ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1'
    : 'Mozilla/5.0 (Linux; Android 13; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36';

  // HTML Content to render reCAPTCHA v3 inside WebView
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <script src="https://www.google.com/recaptcha/api.js?render=${siteKey}"></script>
        <script type="text/javascript">
          function executeV3() {
            if (!window.grecaptcha) {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ERROR', error: 'reCAPTCHA JS not loaded' }));
              }
              return;
            }
            window.grecaptcha.ready(function() {
              window.grecaptcha.execute('${siteKey}', { action: 'signup' })
                .then(function(token) {
                  if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SUCCESS', token: token }));
                  }
                })
                .catch(function(err) {
                  if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ERROR', error: err ? err.message : 'Execution failed' }));
                  }
                });
            });
          }
          window.onload = function() {
            setTimeout(executeV3, 100);
          };
        </script>
      </head>
      <body></body>
    </html>
  `;

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SUCCESS' && data.token) {
        onSuccess(data.token);
      } else if (data.type === 'ERROR') {
        onError(data.error || 'CAPTCHA verification failed.');
      }
    } catch (e) {
      onError('Failed to parse CAPTCHA message.');
    }
  };

  return (
    <View style={{ width: 0, height: 0, opacity: 0, position: 'absolute' }}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent, baseUrl: formattedBaseUrl }}
        onMessage={handleMessage}
        userAgent={userAgent}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        javaScriptCanOpenWindowsAutomatically={false}
        setSupportMultipleWindows={false}
      />
    </View>
  );
};
