import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Audio } from 'expo-av';
import { FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/shared';
import ShareLectureSheet from '../../components/sharing/ShareLectureSheet';
import ShareCodeModal from '../../components/sharing/ShareCodeModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { delay, DUMMY_LECTURES } from '../../services/dummyData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_SIZE = (SCREEN_WIDTH - SIZES.padding * 3 - 8) / 3;

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hrs}h ${remainMins}m`;
}

const TABS = [
  { id: 'notes', label: 'Notes', icon: 'file-text' },
  { id: 'photos', label: 'Photos', icon: 'image' },
  { id: 'transcript', label: 'Transcript', icon: 'mic' },
  { id: 'ai', label: 'AI Tools', icon: 'cpu' },
];

// Map backend snake_case fields to UI camelCase
function mapLecture(item) {
  return {
    id: item.id,
    courseCode: item.course_code || '',
    courseName: item.course_name || '',
    topic: item.topic || '',
    lecturer: item.lecturer || '',
    date: item.date || '',
    duration: item.duration || 0,
    status: item.status || 'draft',
    isFavorite: item.is_favorite || false,
    audioUrl: item.audio_url || null,
    transcript: item.transcript || null,
    structuredMarkdown: item.structured_markdown || null,
    photos: (item.images || []).map((img) => ({
      id: img.id,
      uri: img.image_url,
      timestamp: img.order_index,
    })),
    createdAt: item.created_at || null,
  };
}

export default function LectureDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [activeTab, setActiveTab] = useState('notes');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoViewerVisible, setPhotoViewerVisible] = useState(false);
  const [lecture, setLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [shareModalData, setShareModalData] = useState(null);

  // Audio player state
  const soundRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);

  useEffect(() => {
    fetchLecture();
    // Cleanup audio on unmount
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, [id]);

  const fetchLecture = async () => {
    try {
      setLoading(true);
      await delay(300);

      // First check AsyncStorage for locally recorded lectures
      const localJson = await AsyncStorage.getItem('local_lectures');
      const localLectures = localJson ? JSON.parse(localJson) : [];
      const localFound = localLectures.find((l) => l.id === id);
      if (localFound) {
        setLecture(mapLecture({ ...localFound, audio_url: localFound.audio_url }));
        return;
      }

      // Fall back to dummy data
      const found = DUMMY_LECTURES.find((l) => l.id === id) || DUMMY_LECTURES[0];
      setLecture(mapLecture(found));
    } catch (err) {
      console.error('Failed to load lecture:', err);
      setLecture(mapLecture(DUMMY_LECTURES[0]));
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (shareData) => {
    try {
      await delay(600);
      const code = 'DEMO01';
      const deepLink = `vectra://sharing/preview?code=${code}`;
      setShareModalData({ code, link: deepLink, expiresAt: null });
      setShowShareSheet(false);
    } catch (err) {
      console.error('Share failed:', err);
      Alert.alert('Share Failed', 'Could not generate share link. Please try again.');
    }
  };

  // Audio playback functions
  const onPlaybackStatusUpdate = useCallback((status) => {
    if (status.isLoaded) {
      setPlaybackPosition(status.positionMillis || 0);
      setPlaybackDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPlaybackPosition(0);
      }
    }
  }, []);

  const loadAndPlayAudio = async () => {
    if (!lecture?.audioUrl) return;
    setAudioLoading(true);
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: lecture.audioUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate,
      );
      soundRef.current = sound;
    } catch (err) {
      console.error('Failed to load audio:', err);
      Alert.alert('Playback Error', 'Could not load the audio recording.');
    } finally {
      setAudioLoading(false);
    }
  };

  const togglePlayPause = async () => {
    if (!soundRef.current) {
      await loadAndPlayAudio();
      return;
    }
    try {
      const status = await soundRef.current.getStatusAsync();
      if (status.isPlaying) {
        await soundRef.current.pauseAsync();
      } else {
        if (status.positionMillis >= (status.durationMillis || 0) - 100) {
          await soundRef.current.setPositionAsync(0);
        }
        await soundRef.current.playAsync();
      }
    } catch (err) {
      console.error('Playback toggle failed:', err);
    }
  };

  const seekRelative = async (ms) => {
    if (!soundRef.current) return;
    try {
      const status = await soundRef.current.getStatusAsync();
      const newPos = Math.max(0, Math.min(status.positionMillis + ms, status.durationMillis || 0));
      await soundRef.current.setPositionAsync(newPos);
    } catch (err) {
      console.error('Seek failed:', err);
    }
  };

  const formatTime = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const progressPercent = playbackDuration > 0
    ? (playbackPosition / playbackDuration) * 100
    : 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brand.secondary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!lecture) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.notFound}>Lecture not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.goBack}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isProcessing = lecture.status === 'processing';
  const photos = lecture.photos || [];

  const openPhotoViewer = (photo) => {
    setSelectedPhoto(photo);
    setPhotoViewerVisible(true);
  };

  const renderNotesTab = () => (
    <ScrollView contentContainerStyle={styles.tabContent} showsVerticalScrollIndicator={false}>
      {isProcessing ? (
        <Card style={styles.processingCard}>
          <Feather name="loader" size={24} color={colors.brand.warning} />
          <Text style={styles.processingTitle}>Processing Lecture</Text>
          <Text style={styles.processingText}>
            Your lecture is being transcribed and structured. This may take a few minutes.
          </Text>
        </Card>
      ) : (
        <Card style={styles.notesCard}>
          <Text style={styles.notesContent}>
            {lecture.structuredMarkdown || 'No structured notes available yet.'}
          </Text>
        </Card>
      )}
    </ScrollView>
  );

  const renderPhotosTab = () => (
    <View style={styles.photosContainer}>
      {photos.length > 0 ? (
        <FlatList
          data={photos}
          numColumns={3}
          keyExtractor={(item, index) => `photo-${index}`}
          contentContainerStyle={styles.photoGrid}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.photoThumbnail}
              onPress={() => openPhotoViewer(item)}
              activeOpacity={0.8}
            >
              <Image source={{ uri: item.uri }} style={styles.photoImage} />
              {item.timestamp && (
                <View style={styles.photoTimestamp}>
                  <Text style={styles.photoTimestampText}>{item.timestamp}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.emptyPhotos}>
          <View style={styles.emptyIcon}>
            <Feather name="image" size={32} color={colors.text.muted} />
          </View>
          <Text style={styles.emptyTitle}>No photos captured</Text>
          <Text style={styles.emptyText}>
            Photos taken during the lecture recording will appear here.
          </Text>
        </View>
      )}
    </View>
  );

  const renderTranscriptTab = () => (
    <ScrollView contentContainerStyle={styles.tabContent} showsVerticalScrollIndicator={false}>
      {isProcessing ? (
        <Card style={styles.processingCard}>
          <Feather name="loader" size={24} color={colors.brand.warning} />
          <Text style={styles.processingTitle}>Generating Transcript</Text>
          <Text style={styles.processingText}>
            The transcript will be available once processing is complete.
          </Text>
        </Card>
      ) : (
        <Card style={styles.notesCard}>
          <Text style={styles.transcriptText}>
            {lecture.transcript || 'No transcript available yet.'}
          </Text>
        </Card>
      )}
    </ScrollView>
  );

  const renderAIToolsTab = () => (
    <ScrollView contentContainerStyle={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.aiActions}>
        <AIActionButton
          icon="refresh-cw"
          label="Quick Recap"
          description="Get a brief summary of key points"
          onPress={() => router.push({
            pathname: '/ai/chat',
            params: { lectureId: lecture.id, topic: lecture.topic, action: 'recap' },
          })}
        />
        <AIActionButton
          icon="book"
          label="Explain Simply"
          description="Simplify complex concepts"
          onPress={() => router.push({
            pathname: '/ai/chat',
            params: { lectureId: lecture.id, topic: lecture.topic, action: 'explain' },
          })}
        />
        <AIActionButton
          icon="help-circle"
          label="Practice Quiz"
          description="Test your understanding"
          onPress={() => router.push({
            pathname: '/ai/chat',
            params: { lectureId: lecture.id, topic: lecture.topic, action: 'quiz' },
          })}
        />
        <AIActionButton
          icon="layers"
          label="Flashcards"
          description="Create study flashcards"
          onPress={() => router.push({
            pathname: '/ai/chat',
            params: { lectureId: lecture.id, topic: lecture.topic, action: 'flashcards' },
          })}
        />
      </View>
    </ScrollView>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notes':
        return renderNotesTab();
      case 'photos':
        return renderPhotosTab();
      case 'transcript':
        return renderTranscriptTab();
      case 'ai':
        return renderAIToolsTab();
      default:
        return renderNotesTab();
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{lecture.courseCode}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={styles.aiBtn}
              onPress={() => setShowShareSheet(true)}
            >
              <Feather name="share-2" size={20} color={colors.brand.secondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.aiBtn}
              onPress={() => router.push({
                pathname: '/ai/chat',
                params: { lectureId: lecture.id, topic: lecture.topic },
              })}
            >
              <Feather name="message-circle" size={20} color={colors.brand.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Lecture Info */}
        <View style={styles.infoSection}>
          <Text style={styles.topic}>{lecture.topic}</Text>
          <Text style={styles.courseName}>{lecture.courseName}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Feather name="user" size={14} color={colors.text.muted} />
              <Text style={styles.metaText}>{lecture.lecturer}</Text>
            </View>
            <View style={styles.metaItem}>
              <Feather name="clock" size={14} color={colors.text.muted} />
              <Text style={styles.metaText}>{formatDuration(lecture.duration)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Feather name="calendar" size={14} color={colors.text.muted} />
              <Text style={styles.metaText}>{lecture.date}</Text>
            </View>
          </View>
        </View>

        {/* Audio Player */}
        {lecture.audioUrl && (
          <View style={styles.audioPlayer}>
            <TouchableOpacity
              style={styles.audioSeekBtn}
              onPress={() => seekRelative(-15000)}
              disabled={!soundRef.current}
            >
              <Feather name="rewind" size={18} color={soundRef.current ? colors.text.primary : colors.text.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.audioPlayBtn}
              onPress={togglePlayPause}
              disabled={audioLoading}
              activeOpacity={0.7}
            >
              {audioLoading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Feather name={isPlaying ? 'pause' : 'play'} size={22} color={colors.white} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.audioSeekBtn}
              onPress={() => seekRelative(15000)}
              disabled={!soundRef.current}
            >
              <Feather name="fast-forward" size={18} color={soundRef.current ? colors.text.primary : colors.text.muted} />
            </TouchableOpacity>

            <View style={styles.audioProgressArea}>
              <View style={styles.audioProgressBar}>
                <View style={[styles.audioProgressFill, { width: `${progressPercent}%` }]} />
              </View>
              <View style={styles.audioTimeRow}>
                <Text style={styles.audioTime}>{formatTime(playbackPosition)}</Text>
                <Text style={styles.audioTime}>{playbackDuration > 0 ? formatTime(playbackDuration) : '--:--'}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabBar}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Feather
                name={tab.icon}
                size={16}
                color={activeTab === tab.id ? colors.brand.secondary : colors.text.muted}
              />
              <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              {tab.id === 'photos' && photos.length > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{photos.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.tabContentWrapper}>
          {renderTabContent()}
        </View>

        {/* Share Sheet */}
        <ShareLectureSheet
          visible={showShareSheet}
          onClose={() => setShowShareSheet(false)}
          lecture={lecture}
          onShare={handleShare}
        />

        {/* Share Code + Link Modal */}
        <ShareCodeModal
          visible={!!shareModalData}
          onClose={() => setShareModalData(null)}
          shareCode={shareModalData?.code}
          shareLink={shareModalData?.link}
          expiryDate={shareModalData?.expiresAt}
        />

        {/* Photo Viewer Modal */}
        <Modal
          visible={photoViewerVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setPhotoViewerVisible(false)}
        >
          <View style={styles.photoViewerOverlay}>
            <TouchableOpacity
              style={styles.photoViewerClose}
              onPress={() => setPhotoViewerVisible(false)}
            >
              <Feather name="x" size={24} color={colors.white} />
            </TouchableOpacity>
            {selectedPhoto && (
              <Image
                source={{ uri: selectedPhoto.uri }}
                style={styles.photoViewerImage}
                resizeMode="contain"
              />
            )}
            {selectedPhoto?.timestamp && (
              <View style={styles.photoViewerInfo}>
                <Text style={styles.photoViewerTimestamp}>
                  Captured at {selectedPhoto.timestamp}
                </Text>
              </View>
            )}
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

function AIActionButton({ icon, label, description, onPress }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <TouchableOpacity style={styles.aiActionBtn} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.aiActionIcon}>
        <Feather name={icon} size={20} color={colors.brand.secondary} />
      </View>
      <View style={styles.aiActionText}>
        <Text style={styles.aiActionLabel}>{label}</Text>
        <Text style={styles.aiActionDesc}>{description}</Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.text.muted} />
    </TouchableOpacity>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFound: {
    fontSize: SIZES.lg,
    color: colors.text.primary,
    ...FONTS.semibold,
  },
  goBack: {
    fontSize: SIZES.md,
    color: colors.brand.secondary,
    marginTop: 12,
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
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.lg,
    color: colors.text.primary,
    ...FONTS.bold,
  },
  aiBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.tint.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    padding: SIZES.padding * 1.5,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topic: {
    fontSize: SIZES.xl,
    color: colors.text.primary,
    marginBottom: 4,
    ...FONTS.bold,
  },
  courseName: {
    fontSize: SIZES.md,
    color: colors.text.muted,
    marginBottom: 16,
    ...FONTS.regular,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginLeft: 6,
    ...FONTS.regular,
  },
  audioPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  audioPlayBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brand.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioSeekBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioProgressArea: {
    flex: 1,
  },
  audioProgressBar: {
    height: 4,
    backgroundColor: colors.background.tertiary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  audioProgressFill: {
    height: '100%',
    backgroundColor: colors.brand.secondary,
    borderRadius: 2,
  },
  audioTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  audioTime: {
    fontSize: 11,
    color: colors.text.muted,
    ...FONTS.regular,
    fontVariant: ['tabular-nums'],
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: SIZES.padding,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.brand.secondary,
  },
  tabLabel: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    ...FONTS.medium,
  },
  tabLabelActive: {
    color: colors.brand.secondary,
  },
  tabBadge: {
    backgroundColor: colors.brand.secondary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
  },
  tabBadgeText: {
    fontSize: 10,
    color: colors.background.primary,
    ...FONTS.semibold,
  },
  tabContentWrapper: {
    flex: 1,
  },
  tabContent: {
    padding: SIZES.padding * 1.5,
    paddingBottom: 40,
  },
  processingCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  processingTitle: {
    fontSize: SIZES.lg,
    color: colors.text.primary,
    marginTop: 12,
    ...FONTS.semibold,
  },
  processingText: {
    fontSize: SIZES.md,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    ...FONTS.regular,
  },
  notesCard: {
    backgroundColor: colors.background.tertiary,
  },
  notesContent: {
    fontSize: SIZES.md,
    color: colors.text.primary,
    lineHeight: 22,
    ...FONTS.regular,
  },
  transcriptText: {
    fontSize: SIZES.md,
    color: colors.text.secondary,
    lineHeight: 22,
    fontStyle: 'italic',
    ...FONTS.regular,
  },
  photosContainer: {
    flex: 1,
  },
  photoGrid: {
    padding: SIZES.padding * 1.5,
    gap: 4,
  },
  photoThumbnail: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 4,
    overflow: 'hidden',
    backgroundColor: colors.background.tertiary,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoTimestamp: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.overlay,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  photoTimestampText: {
    fontSize: 10,
    color: colors.white,
    ...FONTS.medium,
  },
  emptyPhotos: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 2,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: SIZES.lg,
    color: colors.text.primary,
    marginBottom: 8,
    ...FONTS.semibold,
  },
  emptyText: {
    fontSize: SIZES.md,
    color: colors.text.muted,
    textAlign: 'center',
    lineHeight: 20,
    ...FONTS.regular,
  },
  aiActions: {
    gap: 12,
  },
  aiActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: SIZES.radius,
    padding: 16,
  },
  aiActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.tint.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  aiActionText: {
    flex: 1,
  },
  aiActionLabel: {
    fontSize: SIZES.base,
    color: colors.text.primary,
    ...FONTS.semibold,
  },
  aiActionDesc: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginTop: 2,
    ...FONTS.regular,
  },
  photoViewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoViewerClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  photoViewerImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  photoViewerInfo: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  photoViewerTimestamp: {
    fontSize: SIZES.md,
    color: colors.white,
    ...FONTS.medium,
  },
});
