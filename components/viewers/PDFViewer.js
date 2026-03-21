import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TouchableOpacity,
  ActivityIndicator, StyleSheet, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system/legacy';
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

/**
 * Determines the WebView source for a given URI:
 *   - Remote https:// URLs → Google Docs viewer
 *   - Local file:// or content:// URIs → base64 data URI embedded in HTML
 */
async function resolveSource(uri) {
  const isLocal = uri.startsWith('file://') || uri.startsWith('content://');

  if (!isLocal) {
    // Remote PDF — render through Google Docs viewer (no download button shown)
    return {
      uri: `https://docs.google.com/viewer?url=${encodeURIComponent(uri)}&embedded=true`,
      isGoogleDocs: true,
    };
  }

  // Local file — read as base64 and embed so the viewer stays fully in-app
  try {
    let fileUri = uri;

    // Android content:// URIs need to be copied to the cache first
    if (Platform.OS === 'android' && uri.startsWith('content://')) {
      const dest = `${FileSystem.cacheDirectory}vectra_pdf_${Date.now()}.pdf`;
      await FileSystem.copyAsync({ from: uri, to: dest });
      fileUri = dest;
    }

    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return { base64, isGoogleDocs: false };
  } catch {
    // Fallback: try loading the URI directly in WebView
    return { uri, isGoogleDocs: false };
  }
}

/** Minimal HTML page that embeds a base64 PDF via <embed>. */
function buildHtml(base64) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { width:100%; height:100%; background:#f5f5f5; }
    embed { width:100%; height:100%; display:block; }
  </style>
</head>
<body>
  <embed src="data:application/pdf;base64,${base64}" type="application/pdf" />
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function PDFViewer({ url, title, visible, onClose }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [webViewSource, setWebViewSource] = useState(null);
  const [isGoogleDocs, setIsGoogleDocs] = useState(false);

  useEffect(() => {
    if (!visible || !url) return;

    setLoading(true);
    setError(false);
    setWebViewSource(null);

    resolveSource(url).then((result) => {
      setIsGoogleDocs(result.isGoogleDocs);
      if (result.base64) {
        setWebViewSource({ html: buildHtml(result.base64) });
      } else {
        setWebViewSource({ uri: result.uri });
      }
    });
  }, [url, visible]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background.primary }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.background.secondary, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Feather name="x" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>
            {title || 'Document'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Error state */}
        {error && (
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={48} color={colors.brand.error} />
            <Text style={styles.errorTitle}>Could Not Load PDF</Text>
            <Text style={styles.errorText}>
              The document could not be displayed. Try reopening or check your connection.
            </Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => {
              setError(false);
              setLoading(true);
            }}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading overlay */}
        {loading && !error && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.brand.secondary} />
            <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
              Loading document…
            </Text>
          </View>
        )}

        {/* WebView */}
        {webViewSource && !error && (
          <WebView
            source={webViewSource}
            style={[styles.webView, loading && { opacity: 0 }]}
            onLoadEnd={() => setLoading(false)}
            onError={() => { setLoading(false); setError(true); }}
            onHttpError={() => { setLoading(false); setError(true); }}
            javaScriptEnabled
            domStorageEnabled
            allowFileAccess
            allowFileAccessFromFileURLs
            allowUniversalAccessFromFileURLs
            originWhitelist={['*']}
            onShouldStartLoadWithRequest={(req) => {
              // Block navigations away from Google Docs or the PDF itself
              if (isGoogleDocs && req.url.includes('docs.google.com')) return true;
              if (!isGoogleDocs) return true;
              return false;
            }}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: SIZES.base,
    color: colors.text.primary,
    textAlign: 'center',
    marginHorizontal: 12,
    ...FONTS.semibold,
  },
  webView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.primary,
    zIndex: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: SIZES.sm,
    ...FONTS.regular,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding * 2,
  },
  errorTitle: {
    fontSize: SIZES.lg,
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
    ...FONTS.semibold,
  },
  errorText: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    textAlign: 'center',
    lineHeight: 20,
    ...FONTS.regular,
  },
  retryBtn: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: colors.brand.secondary,
    borderRadius: SIZES.radius,
  },
  retryText: {
    fontSize: SIZES.base,
    color: colors.background.primary,
    ...FONTS.semibold,
  },
});
