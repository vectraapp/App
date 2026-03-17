import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES } from '../../constants/theme';
import { Card } from '../../components/shared';
import { useTheme } from '../../context/ThemeContext';
import { delay, DUMMY_SHARED_WITH_ME } from '../../services/dummyData';

export default function SharedWithMeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [sharedItems, setSharedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadSharedItems();
  }, []);

  const loadSharedItems = async () => {
    try {
      await delay(400);
      const mapped = DUMMY_SHARED_WITH_ME.map(item => ({
        id: item.id,
        title: item.resource_title,
        course: item.course_code,
        sharedBy: item.shared_by_email,
        sharedAt: new Date(item.redeemed_at),
        expiresAt: null,
        type: item.resource_type,
        resourceId: item.resource_id,
      }));
      setSharedItems(mapped);
    } catch (error) {
      console.log('Error loading shared items:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadSharedItems();
  };

  const formatDate = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysRemaining = (expiresAt) => {
    const now = new Date();
    const diff = new Date(expiresAt) - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const renderItem = ({ item }) => {
    const daysRemaining = item.expiresAt ? getDaysRemaining(item.expiresAt) : null;
    const isExpiringSoon = daysRemaining !== null && daysRemaining <= 3;

    return (
      <TouchableOpacity
        onPress={() => router.push(`/lecture/${item.resourceId}`)}
        activeOpacity={0.7}
      >
        <Card style={styles.itemCard}>
          <View style={styles.itemIcon}>
            <Feather name="book-open" size={24} color={colors.brand.secondary} />
          </View>

          <View style={styles.itemContent}>
            <Text style={styles.itemTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.itemCourse} numberOfLines={1}>
              {item.course}
            </Text>
            <View style={styles.itemMeta}>
              <View style={styles.sharedByRow}>
                <Feather name="user" size={12} color={colors.text.muted} />
                <Text style={styles.sharedByText}>
                  {item.sharedBy} - {formatDate(item.sharedAt)}
                </Text>
              </View>
              <View style={[
                styles.expiryBadge,
                isExpiringSoon && styles.expiryBadgeWarning,
              ]}>
                <Feather
                  name="clock"
                  size={10}
                  color={isExpiringSoon ? colors.brand.warning : colors.text.muted}
                />
                <Text style={[
                  styles.expiryText,
                  isExpiringSoon && styles.expiryTextWarning,
                ]}>
                  {daysRemaining !== null ? `${daysRemaining} days left` : 'No expiry'}
                </Text>
              </View>
            </View>
          </View>

          <Feather name="chevron-right" size={20} color={colors.text.muted} />
        </Card>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Feather name="inbox" size={48} color={colors.text.muted} />
      </View>
      <Text style={styles.emptyTitle}>No Shared Content</Text>
      <Text style={styles.emptyText}>
        When someone shares lectures with you, they will appear here.
      </Text>
      <TouchableOpacity
        style={styles.redeemButton}
        onPress={() => router.push('/sharing/redeem-code')}
      >
        <Feather name="gift" size={18} color={colors.white} />
        <Text style={styles.redeemButtonText}>Redeem a Code</Text>
      </TouchableOpacity>
    </View>
  );

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shared With Me</Text>
          <TouchableOpacity
            style={styles.redeemHeaderBtn}
            onPress={() => router.push('/sharing/redeem-code')}
          >
            <Feather name="plus" size={22} color={colors.brand.secondary} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.brand.primary} />
          </View>
        ) : (
          <FlatList
            data={sharedItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.listContent,
              sharedItems.length === 0 && styles.listContentEmpty,
            ]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmpty}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={colors.brand.primary}
              />
            }
          />
        )}
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
  headerTitle: {
    fontSize: SIZES.lg,
    color: colors.text.primary,
    ...FONTS.bold,
  },
  redeemHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.tint.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: SIZES.padding,
    gap: 12,
  },
  listContentEmpty: {
    flex: 1,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  itemIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.tint.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: SIZES.base,
    color: colors.text.primary,
    marginBottom: 2,
    ...FONTS.semibold,
  },
  itemCourse: {
    fontSize: SIZES.sm,
    color: colors.text.secondary,
    marginBottom: 6,
    ...FONTS.regular,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sharedByRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sharedByText: {
    fontSize: SIZES.xs,
    color: colors.text.muted,
    ...FONTS.regular,
  },
  expiryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: colors.background.tertiary,
  },
  expiryBadgeWarning: {
    backgroundColor: colors.tint.warning,
  },
  expiryText: {
    fontSize: SIZES.xs,
    color: colors.text.muted,
    ...FONTS.medium,
  },
  expiryTextWarning: {
    color: colors.brand.warning,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding * 2,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: SIZES.xl,
    color: colors.text.primary,
    marginBottom: 8,
    ...FONTS.bold,
  },
  emptyText: {
    fontSize: SIZES.base,
    color: colors.text.muted,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    ...FONTS.regular,
  },
  redeemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: SIZES.radius,
    backgroundColor: colors.brand.primary,
  },
  redeemButtonText: {
    fontSize: SIZES.base,
    color: colors.white,
    ...FONTS.semibold,
  },
});
