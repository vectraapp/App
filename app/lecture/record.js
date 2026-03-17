import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/shared';
import { useToast } from '../../components/shared/Toast';
import { delay } from '../../services/dummyData';

const PROCESSING_STEPS = [
  { id: 'transcribe', label: 'Transcribing audio...', icon: 'mic', duration: 2200 },
  { id: 'organize', label: 'Organizing notes...', icon: 'file-text', duration: 1600 },
  { id: 'pdf', label: 'Generating PDF...', icon: 'download', duration: 1200 },
  { id: 'save', label: 'Saving lecture...', icon: 'check-circle', duration: 700 },
];

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

  // Images/Pictures
  const [images, setImages] = useState([]);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(-1); // index into PROCESSING_STEPS
  const [completedSteps, setCompletedSteps] = useState([]);

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
      if (timerRef.current) clearInterval(timerRef.current);

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordingUri(uri);
      setRecording(null);
      setIsRecording(false);
      setIsPaused(false);

      // Auto-process immediately, no alert
      processAndSaveRecording(uri);
    } catch (error) {
      console.error('[Recording] Failed to stop:', error);
      showToast('error', 'Failed to stop recording: ' + error.message);
    }
  };

  const processAndSaveRecording = async (uri) => {
    setIsProcessing(true);
    setCompletedSteps([]);
    setProcessingStep(0);

    try {
      for (let i = 0; i < PROCESSING_STEPS.length; i++) {
        setProcessingStep(i);
        await delay(PROCESSING_STEPS[i].duration);
        setCompletedSteps((prev) => [...prev, i]);
      }

      const newId = `local_${Date.now()}`;
      const now = new Date();

      // Build simulated transcript and notes
      const simulatedTranscript = `[Lecture transcript for "${topic}"]\n\nThis lecture was recorded on ${now.toLocaleDateString()} and has been automatically transcribed.\n\nThe lecture covers key concepts in ${topic}, including definitions, examples, and practical applications as presented by ${lecturer || 'the lecturer'}.`;

      const simulatedNotes = `# ${topic}\n\n**Course:** ${courseCode || 'Unknown'} — ${courseName || ''}\n**Lecturer:** ${lecturer || 'N/A'}\n**Date:** ${now.toLocaleDateString()}\n\n## Overview\nThis lecture introduces ${topic} with core concepts and examples.\n\n## Key Points\n- Definitions and terminology\n- Foundational principles\n- Worked examples\n- Summary and revision tips\n\n## Notes\nFull notes are based on the recorded audio. Review the transcript for detailed content.`;

      const newLecture = {
        id: newId,
        course_code: courseCode || '',
        course_name: courseName || '',
        topic: topic.trim(),
        lecturer: lecturer.trim() || 'Unknown',
        date: now.toISOString(),
        duration: seconds,
        status: 'processed',
        is_favorite: false,
        audio_url: uri,
        transcript: simulatedTranscript,
        structured_markdown: simulatedNotes,
        images: images.map((imgUri, idx) => ({
          id: `img_${newId}_${idx}`,
          image_url: imgUri,
          order_index: idx,
        })),
        created_at: now.toISOString(),
        _isLocal: true, // flag for future sync
      };

      // Save to AsyncStorage (local device storage)
      const existing = await AsyncStorage.getItem('local_lectures');
      const localLectures = existing ? JSON.parse(existing) : [];
      localLectures.unshift(newLecture);
      await AsyncStorage.setItem('local_lectures', JSON.stringify(localLectures));

      showToast('success', 'Lecture saved!');
      router.replace(`/lecture/${newId}`);
    } catch (error) {
      console.error('[Record] Save error:', error);
      showToast('error', 'Failed to save lecture: ' + error.message);
      setIsProcessing(false);
      setProcessingStep(-1);
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
            <Feather name="cpu" size={32} color={colors.brand.primary} />
          </View>
          <Text style={styles.processingTitle}>Processing Lecture</Text>
          <Text style={styles.processingSubtitle}>Please keep the app open</Text>

          <View style={styles.stepsList}>
            {PROCESSING_STEPS.map((step, idx) => {
              const isDone = completedSteps.includes(idx);
              const isActive = processingStep === idx && !isDone;
              return (
                <View key={step.id} style={styles.stepRow}>
                  <View style={[
                    styles.stepIconWrap,
                    isDone && { backgroundColor: colors.tint.accent },
                    isActive && { backgroundColor: colors.tint.primary },
                  ]}>
                    <Feather
                      name={isDone ? 'check' : step.icon}
                      size={16}
                      color={isDone ? colors.brand.accent : isActive ? colors.brand.primary : colors.text.inactive}
                    />
                  </View>
                  <Text style={[
                    styles.stepLabel,
                    isDone && { color: colors.brand.accent },
                    isActive && { color: colors.text.primary },
                  ]}>
                    {step.label}
                  </Text>
                </View>
              );
            })}
          </View>
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

        {/* Scrollable details (inputs + images) */}
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
          {/* Lecture Details (shown before recording starts) */}
          {!isRecording && (
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
            </View>
          )}

          {/* During recording: show topic + status */}
          {isRecording && (
            <View style={styles.recordingInfo}>
              <Text style={styles.recordingTopic} numberOfLines={1}>{topic}</Text>
              <View style={styles.recordingStatusRow}>
                <View style={[styles.recordingDot, isPaused && styles.recordingDotPaused]} />
                <Text style={[styles.recordingStatusText, isPaused && { color: colors.brand.warning }]}>
                  {isPaused ? 'Paused' : 'Recording...'}
                </Text>
              </View>
            </View>
          )}

          {/* Pictures Section — visible always */}
          <View style={styles.inputGroup}>
            <View style={styles.picturesHeader}>
              <Text style={styles.inputLabel}>Pictures</Text>
              {images.length > 0 && (
                <Text style={styles.imageCount}>{images.length}/10</Text>
              )}
            </View>
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
                  <Feather name="camera" size={22} color={colors.brand.primary} />
                  <Text style={styles.addImageText}>Add Photo</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </ScrollView>

        {/* Fixed bottom record controls */}
        <View style={styles.bottomControls}>
          <Text style={styles.timer}>{formatTime(seconds)}</Text>

          <View style={styles.controlsRow}>
            {/* Pause/Resume — only when recording */}
            {isRecording ? (
              <TouchableOpacity style={styles.secondaryBtn} onPress={pauseRecording}>
                <Feather name={isPaused ? 'play' : 'pause'} size={24} color={colors.text.primary} />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 50 }} />
            )}

            {/* Main record button */}
            <TouchableOpacity
              style={[
                styles.recordBtn,
                !topic.trim() && !isRecording && styles.recordBtnDisabled,
              ]}
              onPress={isRecording ? stopRecording : startRecording}
              disabled={!topic.trim() && !isRecording}
              activeOpacity={0.8}
            >
              {isRecording ? (
                <View style={styles.stopIcon} />
              ) : (
                <Feather name="mic" size={32} color={colors.white} />
              )}
            </TouchableOpacity>

            {/* Cancel — only when recording */}
            {isRecording ? (
              <TouchableOpacity style={styles.secondaryBtn} onPress={cancelRecording}>
                <Feather name="x" size={24} color={colors.brand.error} />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 50 }} />
            )}
          </View>

          <Text style={styles.recordLabel}>
            {isRecording
              ? (isPaused ? 'Tap mic to resume' : 'Tap square to stop')
              : topic.trim()
              ? 'Tap mic to start recording'
              : 'Enter a topic first'}
          </Text>
        </View>
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
    marginBottom: 6,
    ...FONTS.semibold,
  },
  processingSubtitle: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginBottom: 32,
    ...FONTS.regular,
  },
  stepsList: {
    width: '100%',
    paddingHorizontal: 20,
    gap: 14,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  stepIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepLabel: {
    fontSize: SIZES.base,
    color: colors.text.inactive,
    ...FONTS.medium,
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
    paddingBottom: 10,
  },
  detailsSection: {
    marginBottom: 20,
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
  // During-recording info block
  recordingInfo: {
    backgroundColor: colors.background.secondary,
    borderRadius: SIZES.radius,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recordingTopic: {
    fontSize: SIZES.base,
    color: colors.text.primary,
    marginBottom: 6,
    ...FONTS.semibold,
  },
  recordingStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingStatusText: {
    fontSize: SIZES.sm,
    color: colors.brand.error,
    marginLeft: 8,
    ...FONTS.medium,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.brand.error,
  },
  recordingDotPaused: {
    backgroundColor: colors.brand.warning,
  },
  picturesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  // Fixed bottom controls
  bottomControls: {
    backgroundColor: colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: SIZES.padding * 1.5,
    alignItems: 'center',
  },
  timer: {
    fontSize: 44,
    color: colors.text.primary,
    letterSpacing: 2,
    marginBottom: 16,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 10,
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
});
