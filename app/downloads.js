import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES, SHADOWS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { EmptyState } from '../components/shared';
import { delay, DUMMY_DOWNLOADS, DUMMY_DOWNLOAD_STATS } from '../services/dummyData';

const FILTER_CHIPS = ['All', 'Questions', 'Lectures', 'Textbooks'];

function getTypeFromItem(item) {
  if (item.type === 'question_pdf') return 'question';
  if (item.type === 'lecture_pdf') return 'lecture';
  if (item.type === 'textbook_pdf') return 'textbook';
  return 'other';
}

function formatSize(mb) {
  if (mb < 1) return `${Math.round(mb * 1024)} KB`;
  return `${mb.toFixed(1)} MB`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getIconName(type) {
  if (type === 'question') return 'file-text';
  if (type === 'lecture') return 'mic';
  if (type === 'textbook') return 'book';
  return 'file';
}

function getIconColor(type, colors) {
  if (type === 'question') return { icon: colors.brand.primary, bg: colors.tint.primary };
  if (type === 'lecture') return { icon: colors.brand.secondary, bg: colors.tint.secondary };
  if (type === 'textbook') return { icon: colors.brand.accent, bg: colors.tint.accent };
  return { icon: colors.text.muted, bg: colors.background.tertiary };
}

export default function DownloadsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [loading, setLoading] = useState(true);
  const [downloads, setDownloads] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeChip, setActiveChip] = useState('All');

  useEffect(() => {
    const load = async () => {
      await delay(400);
      setDownloads(DUMMY_DOWNLOADS);
      setStats(DUMMY_DOWNLOAD_STATS);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = downloads.filter((d) => {
    if (activeChip === 'All') return true;
    const t = getTypeFromItem(d);
    if (activeChip === 'Questions') return t === 'question';
    if (activeChip === 'Lectures') return t === 'lecture';
    if (activeChip === 'Textbooks') return t === 'textbook';
    return true;
  });

  const handleDelete = (item) => {
    Alert.alert(
      'Delete Download',
      `Remove "${item.title}" from your downloads?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setDownloads((prev) => prev.filter((d) => d.id !== item.id)),
        },
      ]
    );
  };

  const storageUsedPct = stats ? Math.min((stats.total_size_mb / stats.storage_limit_mb) * 100, 100) : 0;

  const renderItem = ({ item }) => {
    const type = getTypeFromItem(item);
    const { icon: iconColor, bg: bgColor } = getIconColor(type, colors);
    return (
      <View style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
          <Feather name={getIconName(type)} size={20} color={iconColor} />
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.cardSubtitle} numberOfLines={1}>{item.subtitle}</Text>
          <View style={styles.cardMeta}>
            <Text style={styles.cardSize}>{formatSize(item.size_mb)}</Text>
            <Text style={styles.cardDot}>{'\u00B7'}</Text>
            <Text style={styles.cardDate}>{formatDate(item.downloaded_at)}</Text>
          </View>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionBtn}>
            <Feather name="eye" size={17} color={colors.brand.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item)}>
            <Feather name="trash-2" size={17} color={colors.brand.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Downloads</Text>
        <View style={{ width: 38 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.brand.secondary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              icon="download"
              title="No downloads"
              message={
                activeChip === 'All'
                  ? 'Downloaded files will appear here for offline access.'
                  : `No ${activeChip.toLowerCase()} downloaded yet.`
              }
            />
          }
          ListHeaderComponent={
            <>
              {/* Stats card */}
              {stats && (
                <View style={styles.statsCard}>
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Feather name="folder" size={20} color={colors.brand.primary} />
                      <Text style={styles.statNumber}>{downloads.length}</Text>
                      <Text style={styles.statLabel}>Files</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Feather name="hard-drive" size={20} color={colors.brand.accent} />
                      <Text style={styles.statNumber}>{formatSize(stats.total_size_mb)}</Text>
                      <Text style={styles.statLabel}>Used</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Feather name="database" size={20} color={colors.text.muted} />
                      <Text style={styles.statNumber}>{formatSize(stats.storage_limit_mb)}</Text>
                      <Text style={styles.statLabel}>Limit</Text>
                    </View>
                  </View>
                  <View style={styles.storageBarRow}>
                    <Text style={styles.storageLabel}>Storage Used</Text>
                    <Text style={styles.storagePercent}>{storageUsedPct.toFixed(1)}%</Text>
                  </View>
                  <View style={styles.storageBarBg}>
                    <View style={[styles.storageBarFill, { width: `${storageUsedPct}%` }]} />
                  </View>
                </View>
              )}

              {/* Filter chips */}
              <View style={styles.chipRow}>
                {FILTER_CHIPS.map((chip) => (
                  <TouchableOpacity
                    key={chip}
                    style={[styles.chip, activeChip === chip && styles.chipActive]}
                    onPress={() => setActiveChip(chip)}
                  >
                    <Text style={[styles.chipText, activeChip === chip && styles.chipTextActive]}>
                      {chip}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          }
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (c) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: c.background.primary,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    backgroundColor: c.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.background.tertiary,
  },
  headerTitle: {
    fontSize: SIZES.lg,
    color: c.text.primary,
    ...FONTS.bold,
  },
  listContent: {
    paddingBottom: 24,
  },

  // Stats card
  statsCard: {
    margin: SIZES.padding,
    backgroundColor: c.background.secondary,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    borderWidth: 1,
    borderColor: c.border,
    ...SHADOWS.small,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: c.border,
  },
  statNumber: {
    fontSize: SIZES.base,
    color: c.text.primary,
    ...FONTS.bold,
  },
  statLabel: {
    fontSize: SIZES.xs,
    color: c.text.muted,
    ...FONTS.regular,
  },
  storageBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  storageLabel: {
    fontSize: SIZES.xs,
    color: c.text.muted,
    ...FONTS.medium,
  },
  storagePercent: {
    fontSize: SIZES.xs,
    color: c.brand.accent,
    ...FONTS.semibold,
  },
  storageBarBg: {
    height: 8,
    backgroundColor: c.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  storageBarFill: {
    height: '100%',
    backgroundColor: c.brand.accent,
    borderRadius: 4,
  },

  // Chips
  chipRow: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding,
    paddingBottom: 12,
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: c.background.secondary,
    borderWidth: 1,
    borderColor: c.border,
  },
  chipActive: {
    backgroundColor: c.brand.primary,
    borderColor: c.brand.primary,
  },
  chipText: {
    fontSize: SIZES.sm,
    color: c.text.secondary,
    ...FONTS.medium,
  },
  chipTextActive: {
    color: c.white,
    ...FONTS.semibold,
  },

  // Card
  card: {
    flexDirection: 'row',
    backgroundColor: c.background.secondary,
    borderRadius: SIZES.radius,
    padding: 14,
    marginHorizontal: SIZES.padding,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: c.border,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: SIZES.sm,
    color: c.text.primary,
    marginBottom: 2,
    ...FONTS.semibold,
  },
  cardSubtitle: {
    fontSize: SIZES.xs,
    color: c.text.muted,
    marginBottom: 4,
    ...FONTS.regular,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardSize: {
    fontSize: SIZES.xs,
    color: c.brand.primary,
    ...FONTS.semibold,
  },
  cardDot: {
    fontSize: SIZES.xs,
    color: c.text.inactive,
  },
  cardDate: {
    fontSize: SIZES.xs,
    color: c.text.inactive,
    ...FONTS.regular,
  },
  cardActions: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    marginLeft: 8,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.background.tertiary,
  },
});
