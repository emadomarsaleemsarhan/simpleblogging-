import Constants from "expo-constants";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView, type WebViewNavigation } from "react-native-webview";

const fallbackUrl = "https://blog-publisher-ic6i.onrender.com";

function getAppUrl() {
  const configuredUrl =
    process.env.EXPO_PUBLIC_BLOG_PUBLISHER_URL ??
    Constants.expoConfig?.extra?.blogPublisherUrl ??
    fallbackUrl;

  return String(configuredUrl).replace(/\/+$/, "");
}

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const appUrl = useMemo(getAppUrl, []);
  const allowedHost = useMemo(() => new URL(appUrl).host, [appUrl]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);

  const handleNavigationStateChange = useCallback((event: WebViewNavigation) => {
    setCanGoBack(event.canGoBack);
  }, []);

  const retry = useCallback(() => {
    setError(false);
    setIsLoading(true);
    webViewRef.current?.reload();
  }, []);

  const goBack = useCallback(() => {
    if (canGoBack) {
      webViewRef.current?.goBack();
    }
  }, [canGoBack]);

  return (
    <SafeAreaView style={styles.shell}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          disabled={!canGoBack}
          onPress={goBack}
          style={[styles.backButton, !canGoBack ? styles.backButtonDisabled : null]}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Blog Publisher</Text>
          <Text style={styles.subtitle}>Editorial Studio</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={retry} style={styles.reloadButton}>
          <Text style={styles.reloadButtonText}>Refresh</Text>
        </Pressable>
      </View>

      <View style={styles.webFrame}>
        {error ? (
          <View style={styles.errorPanel}>
            <Text style={styles.errorTitle}>Cannot load Blog Publisher</Text>
            <Text style={styles.errorCopy}>Check the connection or confirm the platform URL is reachable.</Text>
            <Pressable accessibilityRole="button" onPress={retry} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Try again</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <WebView
              ref={webViewRef}
              source={{ uri: appUrl }}
              style={styles.webView}
              allowsBackForwardNavigationGestures
              javaScriptEnabled
              domStorageEnabled
              pullToRefreshEnabled
              setSupportMultipleWindows={false}
              startInLoadingState={false}
              onLoadStart={() => setIsLoading(true)}
              onLoadEnd={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setError(true);
              }}
              onHttpError={(event) => {
                if (event.nativeEvent.statusCode >= 500) {
                  setIsLoading(false);
                  setError(true);
                }
              }}
              onNavigationStateChange={handleNavigationStateChange}
              onShouldStartLoadWithRequest={(request) => {
                const requestHost = new URL(request.url).host;
                const isSameApp = requestHost === allowedHost;
                if (!isSameApp) {
                  Linking.openURL(request.url);
                }
                return isSameApp;
              }}
            />
            {isLoading ? (
              <View pointerEvents="none" style={styles.loadingOverlay}>
                <ActivityIndicator color="#0f6f5c" size="large" />
                <Text style={styles.loadingText}>Loading workspace</Text>
              </View>
            ) : null}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: "#0a3f35",
    flex: 1,
  },
  header: {
    alignItems: "center",
    backgroundColor: "#0a3f35",
    borderBottomColor: "rgba(255,255,255,0.12)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: Platform.OS === "android" ? 12 : 4,
    paddingBottom: 12,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    color: "#fffdf8",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0,
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(255,253,248,0.68)",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
    textAlign: "center",
  },
  backButton: {
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 68,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  backButtonDisabled: {
    opacity: 0.38,
  },
  backButtonText: {
    color: "#fffdf8",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
  },
  reloadButton: {
    backgroundColor: "#c9842b",
    borderRadius: 8,
    minWidth: 78,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  reloadButtonText: {
    color: "#23180b",
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
  },
  webFrame: {
    backgroundColor: "#f6f1e7",
    flex: 1,
  },
  webView: {
    backgroundColor: "#f6f1e7",
    flex: 1,
  },
  loadingOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(246,241,231,0.92)",
    bottom: 0,
    gap: 12,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  loadingText: {
    color: "#31413b",
    fontSize: 14,
    fontWeight: "800",
  },
  errorPanel: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 28,
  },
  errorTitle: {
    color: "#16231f",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 10,
    textAlign: "center",
  },
  errorCopy: {
    color: "#68766f",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 22,
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: "#0f6f5c",
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: "#fffdf8",
    fontSize: 15,
    fontWeight: "900",
  },
});
