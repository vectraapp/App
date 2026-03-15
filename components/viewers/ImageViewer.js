import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ImageView from 'react-native-image-viewing';
import { Feather } from '@expo/vector-icons';

export default function VectraImageViewer({ images, initialIndex = 0, visible, onClose }) {
  // images = array of URL strings
  const imageObjects = (images || []).map(url => ({ uri: url }));

  return (
    <ImageView
      images={imageObjects}
      imageIndex={initialIndex}
      visible={visible}
      onRequestClose={onClose}
      swipeToCloseEnabled={true}
      doubleTapToZoomEnabled={true}
      FooterComponent={({ imageIndex }) => (
        <View style={styles.footer}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Feather name="x" size={20} color="white" />
          </TouchableOpacity>
          <Text style={styles.counter}>
            {imageIndex + 1} / {images.length}
          </Text>
          <View style={{ width: 44 }} />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  closeBtn: { padding: 8 },
  counter: { color: 'white', fontSize: 16, fontWeight: '600' },
});
