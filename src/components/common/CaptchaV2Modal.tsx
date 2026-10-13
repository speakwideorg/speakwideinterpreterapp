import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  AppState,
  BackHandler,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Colors, Fonts } from '@app/themes';
import { normalize } from '@app/utils/orientation';

export type CaptchaMessage =
  | { version: 1; attemptId: string; type: 'ready' }
  | { version: 1; attemptId: string; type: 'solved'; token: string }
  | { version: 1; attemptId: string; type: 'expired' }
  | { version: 1; attemptId: string; type: 'error'; message: string };

interface CaptchaV2ModalProps {
  visible: boolean;
  pageUrl?: string;
  siteKey?: string;
  isSubmitting: boolean;
  cooldown?: number;
  message?: string;
  onSolved: (token: string) => void;
  onClose: () => void;
}

export const CaptchaV2Modal: React.FC<CaptchaV2ModalProps> = ({
  visible,
  pageUrl,
  siteKey,
  isSubmitting,
  cooldown = 0,
  message = '',
  onSolved,
  onClose,
}) => {
  const [attemptId, setAttemptId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const activeAttemptIdRef = useRef<string>('');
  const isSolvedRef = useRef<boolean>(false);
  const webViewRef = useRef<any>(null);

  // Helper to generate a collision-resistant unique attemptId (1-128 chars: alphanumeric, _, -)
  const generateAttemptId = useCallback(() => {
    return 'att_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  }, []);

  // Initialize or reset challenge session with a fresh attempt ID
  const startNewAttempt = useCallback(() => {
    const newId = generateAttemptId();
    activeAttemptIdRef.current = newId;
    isSolvedRef.current = false;
    setIsExpired(false);
    setLoadError(null);
    setIsLoading(true);
    setAttemptId(newId);
    console.log('[CaptchaV2Modal] Starting new verification attempt:', newId);
  }, [generateAttemptId]);

  // When modal becomes visible, start fresh attempt
  useEffect(() => {
    if (visible) {
      startNewAttempt();
    } else {
      activeAttemptIdRef.current = '';
      isSolvedRef.current = false;
    }
  }, [visible, startNewAttempt]);

  // Handle Backgrounding / Resume:
  // Invalidate the active challenge and reload with a fresh ID on resume.
  // Do not reload while registration is already submitting.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active' && visible && !isSubmitting) {
        console.log('[CaptchaV2Modal] App resumed from background, refreshing attempt');
        startNewAttempt();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [visible, isSubmitting, startNewAttempt]);

  // Handle Android Back button:
  // Disable dismissal while request is submitting; otherwise close and invalidate challenge.
  useEffect(() => {
    if (!visible) return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isSubmitting) {
        return true; // prevent dismiss during submission
      }
      onClose();
      return true;
    });

    return () => {
      backHandler.remove();
    };
  }, [visible, isSubmitting, onClose]);

  const userAgent =
    Platform.OS === 'ios'
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1'
      : 'Mozilla/5.0 (Linux; Android 13; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36';

  // Testing key: '6LeN5OwtAAAAAPXRz0mWUjxpT4TXNHYYpEz7lRWO'
  const effectiveSiteKey = siteKey || '6LebY-0tAAAAAHGGaHe8WMSnvlhEaD7erHW4cSGj';

  // Google reCAPTCHA v2 validates client-side domain against the sitekey.
  // The test site key 6LeN5Owt... is registered for localhost in Google Console.
  // Production keys are registered for speakwide.com.
  const isTestKey =
    effectiveSiteKey === '6LeN5OwtAAAAAPXRz0mWUjxpT4TXNHYYpEz7lRWO' ||
    effectiveSiteKey.startsWith('6LeN5Owt');

  const effectiveBaseUrl = isTestKey ? 'http://localhost/' : 'https://speakwide.com/';

  // Build target URL containing only the unique attemptId query param (NO registration details)
  const fullTargetUrl =
    attemptId && pageUrl
      ? `${pageUrl}${pageUrl.includes('?') ? '&' : '?'}attemptId=${encodeURIComponent(attemptId)}`
      : '';

  // Inline HTML for reCAPTCHA v2 checkbox
  // Defined with onRecaptchaLoad and window callbacks BEFORE Google script tag
  const inlineHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
        <style>
          * { box-sizing: border-box; }
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background-color: #F8F9FC;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }
          #recaptcha-wrapper {
            margin-top: 15px;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
          }
          #recaptcha-box {
            display: inline-block;
          }
        </style>
        <script type="text/javascript">
          // Capture console logs inside WebView
          var origConsoleError = console.error;
          console.error = function() {
            var msg = Array.prototype.slice.call(arguments).join(' ');
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                version: 1,
                attemptId: '${attemptId}',
                type: 'debug_log',
                message: '[WebView console.error] ' + msg
              }));
            }
            origConsoleError.apply(console, arguments);
          };

          var isRendered = false;
          function doRender() {
            if (isRendered) return;
            if (!window.grecaptcha || typeof window.grecaptcha.render !== 'function') {
              return;
            }
            isRendered = true;
            try {
              window.grecaptcha.render('recaptcha-box', {
                'sitekey': '${effectiveSiteKey}',
                'callback': function(token) {
                  if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      version: 1,
                      attemptId: '${attemptId}',
                      type: 'solved',
                      token: token
                    }));
                  }
                },
                'expired-callback': function() {
                  if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      version: 1,
                      attemptId: '${attemptId}',
                      type: 'expired'
                    }));
                  }
                },
                'error-callback': function() {
                  if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      version: 1,
                      attemptId: '${attemptId}',
                      type: 'error',
                      message: 'Verification challenge error'
                    }));
                  }
                }
              });

              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  version: 1,
                  attemptId: '${attemptId}',
                  type: 'ready'
                }));
              }
            } catch (e) {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  version: 1,
                  attemptId: '${attemptId}',
                  type: 'error',
                  message: e ? e.message : 'Render failed'
                }));
              }
            }
          }

          window.onRecaptchaLoad = function() {
            doRender();
          };

          window.addEventListener('load', function() {
            setTimeout(doRender, 300);
          });
        </script>
        <script src="https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit" async defer></script>
      </head>
      <body>
        <div id="recaptcha-wrapper">
          <div id="recaptcha-box"></div>
        </div>
      </body>
    </html>
  `;

  // Fall back to inline HTML if pageUrl is unhosted / default /captcha/mobile/ (which returns 404)
  const isHostedPageAvailable = Boolean(pageUrl && !pageUrl.includes('/captcha/mobile/'));
  const webViewSource = isHostedPageAvailable
    ? { uri: fullTargetUrl }
    : { html: inlineHtml, baseUrl: effectiveBaseUrl };

  // Validate incoming postMessages from the webview
  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const rawData = event.nativeEvent.data;
      if (!rawData || typeof rawData !== 'string') return;

      const data = JSON.parse(rawData);
      console.log('[CaptchaV2Modal] Received message from WebView:', data?.type);

      // 1. Message structure validation
      if (!data || data.version !== 1 || typeof data.type !== 'string') {
        return;
      }

      // 2. Active attempt ID validation (ignore stale or late messages)
      if (data.attemptId !== activeAttemptIdRef.current) {
        console.warn(
          `[CaptchaV2Modal] Ignored message with stale attemptId: ${data.attemptId}. Expected: ${activeAttemptIdRef.current}`
        );
        return;
      }

      // 3. Prevent duplicate solves
      if (isSolvedRef.current) {
        return;
      }

      switch (data.type) {
        case 'debug_log':
          console.log('[CaptchaV2Modal WebView Log]', data.message);
          break;

        case 'ready':
          setIsLoading(false);
          break;

        case 'solved':
          // 4. Token validation: must be nonempty string and <= 8192 characters
          if (
            typeof data.token === 'string' &&
            data.token.trim().length > 0 &&
            data.token.length <= 8192
          ) {
            isSolvedRef.current = true;
            console.log('[CaptchaV2Modal] Verification solved successfully');
            onSolved(data.token.trim());
          } else {
            console.error('[CaptchaV2Modal] Received invalid token from bridge');
            setLoadError('Invalid verification token. Please retry.');
          }
          break;

        case 'expired':
          console.log('[CaptchaV2Modal] Verification expired');
          setIsExpired(true);
          break;

        case 'error':
          console.error('[CaptchaV2Modal] Verification challenge error:', data.message);
          setLoadError(data.message || 'Security verification encountered an error.');
          break;

        default:
          break;
      }
    } catch (err) {
      console.warn('[CaptchaV2Modal] Failed to parse message from WebView:', err);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={() => {
        if (!isSubmitting) {
          onClose();
        }
      }}
    >
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.modalCard}>
          {/* Top Close Button */}
          <TouchableOpacity
            style={[styles.closeButton, isSubmitting && styles.closeButtonDisabled]}
            disabled={isSubmitting}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          {/* Shield / Security Icon (matching website RegistrationCaptchaModal) */}
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>🛡️</Text>
          </View>

          {/* Dialog Title & Subtitle */}
          <Text style={styles.title}>Verify you’re human</Text>
          <Text style={styles.subtitle}>
            Complete this quick check to finish registration.
          </Text>

          {/* Challenge Box */}
          <View style={styles.challengeBox}>
            {cooldown > 0 ? (
              <View style={styles.cooldownContainer}>
                <Text style={styles.cooldownTitle}>Too many attempts</Text>
                <Text style={styles.cooldownSubtitle}>
                  Try again in {cooldown} seconds. Your details are saved.
                </Text>
              </View>
            ) : loadError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{loadError}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={startNewAttempt}
                  disabled={isSubmitting}
                >
                  <Text style={styles.retryButtonText}>Retry verification</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.webViewWrapper}>
                {isLoading && (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="small" color={Colors.purple || '#7046E5'} />
                    <Text style={styles.loadingText}>Loading verification…</Text>
                  </View>
                )}

                {attemptId ? (
                  <WebView
                    ref={webViewRef}
                    key={attemptId}
                    source={webViewSource}
                    style={styles.webView}
                    userAgent={userAgent}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    originWhitelist={['*']}
                    onMessage={handleMessage}
                    onLoadEnd={() => setIsLoading(false)}
                    onError={syntheticEvent => {
                      const { nativeEvent } = syntheticEvent;
                      console.warn('[CaptchaV2Modal] WebView onError:', nativeEvent?.description);
                      setIsLoading(false);
                      setLoadError(
                        'Verification could not load. Check your connection and retry.',
                      );
                    }}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    scalesPageToFit={false}
                    mixedContentMode="always"
                  />
                ) : null}
              </View>
            )}
          </View>

          {/* Notice / Warning */}
          {isExpired && !loadError && (
            <Text style={styles.expiredNotice}>
              The check expired. Please complete it again.
            </Text>
          )}

          {!!message && (
            <Text style={styles.serverMessage}>{message}</Text>
          )}

          {/* Status Text / Spinner */}
          <View style={styles.statusRow}>
            {isSubmitting ? (
              <>
                <ActivityIndicator size="small" color={Colors.purple || '#7046E5'} />
                <Text style={styles.statusText}>Finishing registration…</Text>
              </>
            ) : (
              <Text style={styles.autoContinueText}>
                Your registration will continue automatically.
              </Text>
            )}
          </View>

          {/* Back to form Button (matching website RegistrationCaptchaModal) */}
          <TouchableOpacity
            style={[styles.backButton, isSubmitting && styles.backButtonDisabled]}
            disabled={isSubmitting}
            onPress={onClose}
          >
            <Text style={styles.backButtonText}>Back to form</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 3, 38, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: normalize(16),
  },
  modalCard: {
    width: '100%',
    maxWidth: normalize(380),
    maxHeight: '92%',
    backgroundColor: Colors.white,
    borderRadius: normalize(16),
    paddingHorizontal: normalize(20),
    paddingTop: normalize(24),
    paddingBottom: normalize(20),
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: normalize(14),
    right: normalize(14),
    padding: normalize(6),
    zIndex: 10,
  },
  closeButtonDisabled: {
    opacity: 0.3,
  },
  closeButtonText: {
    fontSize: normalize(16),
    color: Colors.gray || '#6B7280',
    fontFamily: Fonts.Inter_Medium,
  },
  iconCircle: {
    width: normalize(56),
    height: normalize(56),
    borderRadius: normalize(28),
    backgroundColor: 'rgba(112, 70, 229, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: normalize(14),
  },
  iconText: {
    fontSize: normalize(26),
  },
  title: {
    fontSize: normalize(20),
    fontFamily: Fonts.Manrope_Bold || Fonts.Inter_Bold,
    color: Colors.night_blue || '#111827',
    textAlign: 'center',
    marginBottom: normalize(6),
  },
  subtitle: {
    fontSize: normalize(13),
    fontFamily: Fonts.Inter_Regular,
    color: Colors.gray || '#6B7280',
    textAlign: 'center',
    lineHeight: normalize(18),
    marginBottom: normalize(16),
  },
  challengeBox: {
    width: '100%',
    height: normalize(480),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: normalize(12),
    backgroundColor: '#F8F9FC',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webViewWrapper: {
    width: '100%',
    height: normalize(480),
    position: 'relative',
  },
  webView: {
    width: '100%',
    height: normalize(480),
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F8F9FC',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: normalize(8),
    fontSize: normalize(12),
    fontFamily: Fonts.Inter_Regular,
    color: Colors.gray || '#6B7280',
  },
  cooldownContainer: {
    padding: normalize(16),
    alignItems: 'center',
  },
  cooldownTitle: {
    fontSize: normalize(14),
    fontFamily: Fonts.Inter_SemiBold,
    color: '#DC2626',
    marginBottom: normalize(4),
  },
  cooldownSubtitle: {
    fontSize: normalize(12),
    fontFamily: Fonts.Inter_Regular,
    color: Colors.gray || '#6B7280',
    textAlign: 'center',
  },
  errorContainer: {
    padding: normalize(16),
    alignItems: 'center',
  },
  errorText: {
    fontSize: normalize(12),
    fontFamily: Fonts.Inter_Regular,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: normalize(10),
  },
  retryButton: {
    backgroundColor: Colors.purple || '#7046E5',
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(7),
    borderRadius: normalize(6),
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: normalize(12),
    fontFamily: Fonts.Inter_SemiBold,
  },
  expiredNotice: {
    color: '#92400E',
    fontSize: normalize(12),
    fontFamily: Fonts.Inter_Medium,
    marginTop: normalize(8),
    textAlign: 'center',
  },
  serverMessage: {
    color: '#DC2626',
    fontSize: normalize(12),
    fontFamily: Fonts.Inter_Regular,
    marginTop: normalize(6),
    textAlign: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: normalize(30),
    marginTop: normalize(10),
    marginBottom: normalize(6),
    gap: normalize(8),
  },
  statusText: {
    fontSize: normalize(13),
    fontFamily: Fonts.Inter_Medium,
    color: Colors.night_blue || '#111827',
  },
  autoContinueText: {
    fontSize: normalize(12),
    fontFamily: Fonts.Inter_Regular,
    color: Colors.gray || '#6B7280',
    textAlign: 'center',
  },
  backButton: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: normalize(8),
    paddingVertical: normalize(10),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: normalize(8),
  },
  backButtonDisabled: {
    opacity: 0.4,
  },
  backButtonText: {
    fontSize: normalize(14),
    fontFamily: Fonts.Inter_Medium,
    color: Colors.night_blue || '#111827',
  },
});
