import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES, SHADOWS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

function getRelativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return '1d ago';
  return `${days}d ago`;
}

function getIconForType(type) {
  if (type === 'question') return 'file-text';
  if (type === 'lecture') return 'mic';
  if (type === 'course') return 'book-open';
  return 'file';
}

function getIconColor(type, colors) {
  if (type === 'question') return { icon: colors.brand.primary, bg: colors.tint.primary };
  if (type === 'lecture') return { icon: colors.brand.secondary, bg: colors.tint.secondary };
  if (type === 'course') return { icon: colors.brand.accent, bg: colors.tint.accent };
  return { icon: colors.text.muted, bg: colors.background.tertiary };
}

export default function RecentlyViewed({ items }) {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  if (!items || items.length === 0) {
    return null;
  }

  const handlePress = (item) => {
    try {
      router.push(item.route);
    } catch {
      router.push('/browse');
    }
  };

  const renderItem = ({ item }) => {
    const { icon, bg } = getIconColor(item.type, colors);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handlePress(item)}
        activeOpacity={0.8}
      >
        <View style={[styles.iconContainer, { backgroundColor: bg }]}>
          <Feather name={getIconForType(item.type)} size={18} color={icon} />
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.cardSubtitle} numberOfLines={1}>{item.subtitle}</Text>
        <Text style={styles.cardTime}>{getRelativeTime(item.viewed_at)}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <Feather name="clock" size={15} color={colors.text.muted} />
        <Text style={styles.sectionTitle}>Recently Viewed</Text>
      </View>
      <FlatList
        horizontal
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const createStyles = (c) => StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SIZES.padding,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: SIZES.base,
    color: c.text.primary,
    ...FONTS.semibold,
  },
  listContent: {
    paddingHorizontal: SIZES.padding,
    gap: 10,
    paddingBottom: 4,
  },
  card: {
    width: 130,
    backgroundColor: c.background.secondary,
    borderRadius: SIZES.radius,
    padding: 12,
    borderWidth: 1,
    borderColor: c.border,
    ...SHADOWS.small,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: SIZES.xs,
    color: c.text.primary,
    marginBottom: 3,
    ...FONTS.semibold,
  },
  cardSubtitle: {
    fontSize: SIZES.xs,
    color: c.text.muted,
    marginBottom: 6,
    ...FONTS.regular,
  },
  cardTime: {
    fontSize: SIZES.xs,
    color: c.text.inactive,
    ...FONTS.regular,
  },
});
