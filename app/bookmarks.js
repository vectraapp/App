import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES, SHADOWS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { EmptyState } from '../components/shared';
import { delay, DUMMY_BOOKMARKS } from '../services/dummyData';

const TABS = ['All', 'Questions', 'Lectures'];

function getRelativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

export default function BookmarksScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState([]);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    const load = async () => {
      await delay(400);
      setBookmarks(DUMMY_BOOKMARKS);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = bookmarks.filter((b) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Questions') return b.type === 'question';
    if (activeTab === 'Lectures') return b.type === 'lecture';
    return true;
  });

  const handleRemove = (id) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const renderItem = ({ item }) => {
    const isQuestion = item.type === 'question';
    return (
      <View style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: isQuestion ? colors.tint.primary : colors.tint.secondary }]}>
          <Feather
            name={isQuestion ? 'file-text' : 'mic'}
            size={20}
            color={isQuestion ? colors.brand.primary : colors.brand.secondary}
          />
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.cardSubtitle} numberOfLines={1}>{item.subtitle}</Text>
          {item.note ? (
            <Text style={styles.cardNote} numberOfLines={2}>{item.note}</Text>
          ) : null}
          <Text style={styles.cardTime}>{getRelativeTime(item.bookmarked_at)}</Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionBtn}>
            <Feather name="bookmark" size={18} color={colors.brand.warning} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleRemove(item.id)}>
            <Feather name="trash-2" size={18} color={colors.brand.error} />
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
        <Text style={styles.headerTitle}>Bookmarks</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Filter tabs */}
      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.brand.secondary} />
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="bookmark"
          title="No bookmarks yet"
          message={
            activeTab === 'All'
              ? 'Save questions and lectures to revisit them quickly.'
              : `No ${activeTab.toLowerCase()} bookmarked yet.`
          }
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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

  // Tabs
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 10,
    backgroundColor: c.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: c.background.tertiary,
    borderWidth: 1,
    borderColor: c.border,
  },
  tabActive: {
    backgroundColor: c.brand.primary,
    borderColor: c.brand.primary,
  },
  tabText: {
    fontSize: SIZES.sm,
    color: c.text.secondary,
    ...FONTS.medium,
  },
  tabTextActive: {
    color: c.white,
    ...FONTS.semibold,
  },

  // List
  listContent: {
    padding: SIZES.padding,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: c.background.secondary,
    borderRadius: SIZES.radius,
    padding: 14,
    borderWidth: 1,
    borderColor: c.border,
    alignItems: 'flex-start',
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
  cardNote: {
    fontSize: SIZES.xs,
    color: c.text.secondary,
    fontStyle: 'italic',
    marginBottom: 4,
    ...FONTS.regular,
  },
  cardTime: {
    fontSize: SIZES.xs,
    color: c.text.inactive,
    ...FONTS.regular,
  },
  cardActions: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
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
