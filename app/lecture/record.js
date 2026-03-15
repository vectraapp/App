import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/shared';
import { useToast } from '../../components/shared/Toast';
import api from '../../services/api';

export default function RecordScreen() {
  const { courseCode, courseName, courseId } = useLocalSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [recording, setRecording] = useState(null);
  const [recordingUri, setRecordingUri] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);

  // Lecture details
  const [topic, setTopic] = useState('');
  const [lecturer, setLecturer] = useState('');
  const [showDetails, setShowDetails] = useState(true);

  // Images/Pictures
  const [images, setImages] = useState([]);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');

  const timerRef = useRef(null);

  // Request microphone permission
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        setHasPermission(status === 'granted');
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Microphone permission is required to record lectures.',
            [{ text: 'OK', onPress: () => router.back() }]
          );
        }

        // Configure audio mode for recording
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      } catch (error) {
        console.error('Permission error:', error);
        showToast('error', 'Failed to get microphone permission');
      }
    })();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Pick image from gallery
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library to add images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 10 - images.length, // Max 10 images
      });

      if (!result.canceled && result.assets) {
        setImages((prev) => [...prev, ...result.assets.map(asset => asset.uri)]);
        showToast('success', `${result.assets.length} image(s) added`);
      }
    } catch (error) {
      console.error('[Image] Pick error:', error);
      showToast('error', 'Failed to pick image');
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your camera to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        setImages((prev) => [...prev, result.assets[0].uri]);
        showToast('success', 'Photo added');
      }
    } catch (error) {
      console.error('[Image] Camera error:', error);
      showToast('error', 'Failed to take photo');
    }
  };

  // Remove image
  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Show image picker options
  const showImageOptions = () => {
    if (images.length >= 10) {
      showToast('info', 'Maximum 10 images allowed');
      return;
    }

    Alert.alert(
      'Add Picture',
      'Choose an option',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const formatTime = (s) => {
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    if (!topic.trim()) {
      showToast('error', 'Please enter a topic for this lecture');
      return;
    }

    try {
      console.log('[Recording] Starting...');

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      setIsPaused(false);
      setShowDetails(false);

      // Start timer
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);

      showToast('success', 'Recording started');
      console.log('[Recording] Started successfully');
    } catch (error) {
      console.error('[Recording] Failed to start:', error);
      showToast('error', 'Failed to start recording: ' + error.message);
    }
  };

  const pauseRecording = async () => {
    if (!recording) return;

    try {
      if (isPaused) {
        await recording.startAsync();
        timerRef.current = setInterval(() => {
          setSeconds((prev) => prev + 1);
        }, 1000);
        setIsPaused(false);
        showToast('info', 'Recording resumed');
      } else {
        await recording.pauseAsync();
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        setIsPaused(true);
        showToast('info', 'Recording paused');
      }
    } catch (error) {
      console.error('[Recording] Pause/resume error:', error);
      showToast('error', 'Failed to pause/resume recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      console.log('[Recording] Stopping...');

      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Stop recording
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordingUri(uri);
      setRecording(null);
      setIsRecording(false);
      setIsPaused(false);

      console.log('[Recording] Saved to:', uri);
      showToast('success', 'Recording saved!');

      // Ask user if they want to process now
      Alert.alert(
        'Recording Complete',
        'Would you like to process this recording now? AI will transcribe and structure your notes.',
        [
          {
            text: 'Later',
            style: 'cancel',
            onPress: () => saveWithoutProcessing(uri),
          },
          {
            text: 'Process Now',
            onPress: () => processRecording(uri),
          },
        ]
      );
    } catch (error) {
      console.error('[Recording] Failed to stop:', error);
      showToast('error', 'Failed to stop recording: ' + error.message);
    }
  };

  const saveWithoutProcessing = async (uri) => {
    try {
      setIsProcessing(true);
      setProcessingStatus('Saving lecture...');

      // Create lecture in backend
      const lectureResponse = await api.createLecture({
        course_code: courseCode,
        course_name: courseName,
        topic: topic.trim(),
        lecturer: lecturer.trim() || null,
        date: new Date().toISOString().split('T')[0],
        duration: seconds,
      });

      if (!lectureResponse.success) {
        throw new Error(lectureResponse.message || 'Failed to save lecture');
      }

      const lectureId = lectureResponse.data.id;

      // Upload images if any
      if (images.length > 0) {
        setProcessingStatus('Uploading images...');
        try {
          await api.uploadLectureImages(lectureId, images);
          console.log('[Save] Images uploaded');
        } catch (imgError) {
          console.warn('[Save] Image upload failed:', imgError.message);
          // Continue even if image upload fails
        }
      }

      showToast('success', 'Lecture saved! You can process it later.');
      router.back();
    } catch (error) {
      console.error('[Save] Error:', error);
      showToast('error', 'Failed to save: ' + error.message);
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const processRecording = async (uri) => {
    try {
      setIsProcessing(true);
      setProcessingStatus('Creating lecture...');

      // Step 1: Create lecture in backend
      const lectureResponse = await api.createLecture({
        course_code: courseCode,
        course_name: courseName,
        topic: topic.trim(),
        lecturer: lecturer.trim() || null,
        date: new Date().toISOString().split('T')[0],
        duration: seconds,
      });

      if (!lectureResponse.success) {
        throw new Error(lectureResponse.message || 'Failed to create lecture');
      }

      const lectureId = lectureResponse.data.id;
      console.log('[Process] Lecture created:', lectureId);

      // Step 2: Upload audio
      setProcessingStatus('Uploading audio...');
      const uploadResponse = await api.uploadAudio(lectureId, { uri });

      if (!uploadResponse.success) {
        throw new Error(uploadResponse.message || 'Failed to upload audio');
      }

      console.log('[Process] Audio uploaded');

      // Step 2.5: Upload images if any
      if (images.length > 0) {
        setProcessingStatus(`Uploading ${images.length} image(s)...`);
        try {
          await api.uploadLectureImages(lectureId, images);
          console.log('[Process] Images uploaded');
        } catch (imgError) {
          console.warn('[Process] Image upload failed:', imgError.message);
          // Continue even if image upload fails
        }
      }

      // Step 3: Trigger AI processing
      setProcessingStatus('Starting AI processing...');
      const processResponse = await api.processLecture(lectureId);

      if (!processResponse.success) {
        throw new Error(processResponse.message || 'Failed to start processing');
      }

      console.log('[Process] AI processing started');

      showToast('success', 'Processing started! Check back in a few minutes.');
      router.replace(`/lecture/${lectureId}`);
    } catch (error) {
      console.error('[Process] Error:', error);
      showToast('error', 'Processing failed: ' + error.message);

      // Still go back but show error
      setTimeout(() => router.back(), 2000);
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const cancelRecording = async () => {
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setRecording(null);
    setIsRecording(false);
    setIsPaused(false);
    setSeconds(0);
    setShowDetails(true);
    showToast('info', 'Recording cancelled');
  };

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerContainer}>
          <Feather name="mic-off" size={48} color={colors.text.muted} />
          <Text style={styles.permissionText}>Microphone permission denied</Text>
          <Button title="Go Back" onPress={() => router.back()} style={{ marginTop: 20 }} />
        </View>
      </SafeAreaView>
    );
  }

  if (isProcessing) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerContainer}>
          <View style={styles.processingIndicator}>
            <Feather name="loader" size={32} color={colors.brand.primary} />
          </View>
          <Text style={styles.processingTitle}>Processing Recording</Text>
          <Text style={styles.processingStatus}>{processingStatus}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              if (isRecording) {
                Alert.alert(
                  'Stop Recording?',
                  'You have an active recording. Do you want to cancel it?',
                  [
                    { text: 'Continue Recording', style: 'cancel' },
                    { text: 'Cancel Recording', style: 'destructive', onPress: cancelRecording },
                  ]
                );
                return;
              }
              router.back();
            }}
            style={styles.backBtn}
          >
            <Feather name="arrow-left" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{courseCode || 'New Recording'}</Text>
            <Text style={styles.headerSubtitle}>{courseName || ''}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Lecture Details (before recording) */}
          {showDetails && (
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Lecture Details</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Topic *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Introduction to Data Structures"
                  placeholderTextColor={colors.text.muted}
                  value={topic}
                  onChangeText={setTopic}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Lecturer (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Dr. Smith"
                  placeholderTextColor={colors.text.muted}
                  value={lecturer}
                  onChangeText={setLecturer}
                />
              </View>

              {/* Pictures Section */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Pictures (optional)</Text>
                <Text style={styles.inputHint}>Add photos of slides, whiteboard, or notes</Text>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.imagesScroll}
                  contentContainerStyle={styles.imagesContainer}
                >
                  {images.map((uri, index) => (
                    <View key={index} style={styles.imageWrapper}>
                      <Image source={{ uri }} style={styles.imageThumbnail} />
                      <TouchableOpacity
                        style={styles.removeImageBtn}
                        onPress={() => removeImage(index)}
                      >
                        <Feather name="x" size={14} color={colors.white} />
                      </TouchableOpacity>
                    </View>
                  ))}

                  {images.length < 10 && (
                    <TouchableOpacity style={styles.addImageBtn} onPress={showImageOptions}>
                      <Feather name="plus" size={24} color={colors.brand.primary} />
                      <Text style={styles.addImageText}>Add</Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>

                {images.length > 0 && (
                  <Text style={styles.imageCount}>{images.length}/10 images</Text>
                )}
              </View>
            </View>
          )}

          {/* Recording Area */}
          <View style={styles.recordingArea}>
            <Text style={styles.timer}>{formatTime(seconds)}</Text>

            <View style={styles.waveformPlaceholder}>
              {isRecording ? (
                <View style={styles.recordingIndicator}>
                  <View style={[styles.recordingDot, isPaused && styles.recordingDotPaused]} />
                  <Text style={styles.recordingText}>
                    {isPaused ? 'Paused' : 'Recording...'}
                  </Text>
                </View>
              ) : (
                <Text style={styles.idleText}>
                  {topic ? 'Tap the button to start recording' : 'Enter topic above, then start recording'}
                </Text>
              )}
            </View>

            {/* Control Buttons */}
            <View style={styles.controlsRow}>
              {isRecording && (
                <TouchableOpacity style={styles.secondaryBtn} onPress={pauseRecording}>
                  <Feather name={isPaused ? 'play' : 'pause'} size={24} color={colors.text.primary} />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.recordBtn,
                  isRecording && styles.recordBtnActive,
                  !topic.trim() && !isRecording && styles.recordBtnDisabled,
                ]}
                onPress={isRecording ? stopRecording : startRecording}
                disabled={!topic.trim() && !isRecording}
                activeOpacity={0.8}
              >
                <View style={isRecording ? styles.stopIcon : styles.micIcon}>
                  {isRecording ? null : (
                    <Feather name="mic" size={32} color={colors.white} />
                  )}
                </View>
              </TouchableOpacity>

              {isRecording && (
                <TouchableOpacity style={styles.secondaryBtn} onPress={cancelRecording}>
                  <Feather name="x" size={24} color={colors.brand.error} />
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.recordLabel}>
              {isRecording
                ? 'Tap red button to stop'
                : topic.trim()
                ? 'Tap to start recording'
                : 'Enter topic first'}
            </Text>
          </View>

          {/* Info */}
          <View style={styles.infoBox}>
            <Feather name="info" size={14} color={colors.text.muted} />
            <Text style={styles.infoText}>
              Your recording will be transcribed by AI (Whisper) and structured into organized notes.
              This usually takes 1-3 minutes after recording.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: SIZES.md,
    color: colors.text.muted,
    marginTop: 16,
    textAlign: 'center',
    ...FONTS.regular,
  },
  processingIndicator: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.tint.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  processingTitle: {
    fontSize: SIZES.lg,
    color: colors.text.primary,
    marginBottom: 8,
    ...FONTS.semibold,
  },
  processingStatus: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    ...FONTS.regular,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.lg,
    color: colors.text.primary,
    ...FONTS.bold,
  },
  headerSubtitle: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginTop: 2,
    ...FONTS.regular,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SIZES.padding * 1.5,
  },
  detailsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: SIZES.md,
    color: colors.text.primary,
    marginBottom: 16,
    ...FONTS.semibold,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginBottom: 8,
    ...FONTS.medium,
  },
  input: {
    backgroundColor: colors.background.tertiary,
    borderRadius: SIZES.radius,
    padding: 14,
    fontSize: SIZES.base,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border,
    ...FONTS.regular,
  },
  inputHint: {
    fontSize: SIZES.xs,
    color: colors.text.muted,
    marginBottom: 10,
    ...FONTS.regular,
  },
  imagesScroll: {
    marginTop: 4,
  },
  imagesContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
  },
  imageWrapper: {
    position: 'relative',
  },
  imageThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.background.tertiary,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.brand.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageBtn: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.brand.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
  },
  addImageText: {
    fontSize: SIZES.xs,
    color: colors.brand.primary,
    marginTop: 4,
    ...FONTS.medium,
  },
  imageCount: {
    fontSize: SIZES.xs,
    color: colors.text.muted,
    marginTop: 8,
    textAlign: 'right',
    ...FONTS.regular,
  },
  recordingArea: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  timer: {
    fontSize: 52,
    color: colors.text.primary,
    letterSpacing: 2,
    marginBottom: 20,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
  },
  waveformPlaceholder: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.brand.error,
    marginRight: 8,
  },
  recordingDotPaused: {
    backgroundColor: colors.brand.warning,
  },
  recordingText: {
    fontSize: SIZES.md,
    color: colors.brand.error,
    ...FONTS.medium,
  },
  idleText: {
    fontSize: SIZES.base,
    color: colors.text.muted,
    textAlign: 'center',
    ...FONTS.regular,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 16,
  },
  secondaryBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.brand.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordBtnActive: {
    backgroundColor: colors.brand.error,
  },
  recordBtnDisabled: {
    backgroundColor: colors.text.muted,
    opacity: 0.5,
  },
  micIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopIcon: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
  recordLabel: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginTop: 8,
    ...FONTS.regular,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background.tertiary,
    borderRadius: SIZES.radius,
    padding: 14,
    marginTop: 20,
  },
  infoText: {
    flex: 1,
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginLeft: 10,
    lineHeight: 18,
    ...FONTS.regular,
  },
});
