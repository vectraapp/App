import React, { useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity,
  SafeAreaView, ActivityIndicator, StyleSheet
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function PDFViewer({ url, title, visible, onClose }) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);

  // Use Google Docs viewer - works for all PDFs, no download option
  const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
        {/* Header - NO download button */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Feather name="x" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text
            style={[styles.title, { color: colors.text.primary }]}
            numberOfLines={1}
          >
            {title || 'Document'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Loading indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.brand.primary} />
            <Text style={{ color: colors.text.secondary, marginTop: 12 }}>
              Loading document...
            </Text>
          </View>
        )}

        {/* PDF rendered inside app - no download */}
        <WebView
          source={{ uri: googleDocsUrl }}
          style={{ flex: 1 }}
          onLoadEnd={() => setLoading(false)}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onShouldStartLoadWithRequest={(request) => {
            if (request.url.includes('docs.google.com')) return true;
            if (request.url === url) return true;
            return false;
          }}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeBtn: { padding: 8 },
  title: { flex: 1, fontSize: 16, fontWeight: '600', textAlign: 'center' },
  loadingContainer: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
});
