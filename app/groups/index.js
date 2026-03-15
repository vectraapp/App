import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { EmptyState, Card } from '../../components/shared';
import api from '../../services/api';

export default function GroupsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGroups = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await api.getMyGroups();
      setGroups(response.data || []);
    } catch {
      setGroups([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  const onRefresh = () => { setRefreshing(true); fetchGroups(true); };

  const renderGroup = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push({ pathname: '/groups/[id]', params: { id: item.id, name: item.name } })}
    >
      <Card style={styles.groupCard}>
        <View style={styles.groupAvatar}>
          <Text style={styles.groupAvatarText}>
            {item.course_code?.slice(0, 3) || item.name?.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.groupInfo}>
          <Text style={styles.groupName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.groupCourse} numberOfLines={1}>{item.course_code}</Text>
          {item.description ? (
            <Text style={styles.groupDesc} numberOfLines={1}>{item.description}</Text>
          ) : null}
        </View>

        <View style={styles.groupMeta}>
          <View style={styles.memberCount}>
            <Feather name="users" size={12} color={colors.text.muted} />
            <Text style={styles.memberCountText}>{item.member_count || 1}</Text>
          </View>
          {item.my_role === 'admin' ? (
            <View style={[styles.roleBadge, { backgroundColor: colors.tint.primary }]}>
              <Text style={[styles.roleText, { color: colors.brand.primary }]}>Admin</Text>
            </View>
          ) : null}
          <Feather name="chevron-right" size={16} color={colors.text.inactive} />
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Study Groups</Text>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => router.push('/groups/create')}
          >
            <Feather name="plus" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Join via code banner */}
        <TouchableOpacity
          style={[styles.joinBanner, { backgroundColor: colors.tint.secondary }]}
          onPress={() => router.push('/groups/join')}
          activeOpacity={0.8}
        >
          <Feather name="link" size={16} color={colors.brand.secondary} />
          <Text style={[styles.joinBannerText, { color: colors.brand.secondary }]}>
            Have an invite code? Tap to join a group
          </Text>
          <Feather name="chevron-right" size={16} color={colors.brand.secondary} />
        </TouchableOpacity>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.brand.primary} />
          </View>
        ) : (
          <FlatList
            data={groups}
            keyExtractor={(item) => item.id}
            renderItem={renderGroup}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.brand.primary]}
                tintColor={colors.brand.primary}
              />
            }
            ListEmptyComponent={
              <EmptyState
                icon="users"
                title="No study groups yet"
                message={"Create a group for your course or join one with an invite code to start collaborating with your classmates."}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.primary },
  container: { flex: 1 },
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
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: SIZES.xl, color: colors.text.primary, ...FONTS.bold },
  createBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.brand.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  joinBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SIZES.padding * 1.5,
    marginTop: 14,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: SIZES.radius,
    gap: 8,
  },
  joinBannerText: { flex: 1, fontSize: SIZES.sm, ...FONTS.medium },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: {
    paddingHorizontal: SIZES.padding * 1.5,
    paddingTop: 10,
    paddingBottom: 30,
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 14,
    gap: 12,
  },
  groupAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.tint.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  groupAvatarText: {
    fontSize: SIZES.sm, color: colors.brand.primary, ...FONTS.bold,
  },
  groupInfo: { flex: 1 },
  groupName: { fontSize: SIZES.base, color: colors.text.primary, ...FONTS.semibold },
  groupCourse: { fontSize: SIZES.sm, color: colors.brand.primary, ...FONTS.medium, marginTop: 1 },
  groupDesc: { fontSize: SIZES.xs, color: colors.text.muted, ...FONTS.regular, marginTop: 2 },
  groupMeta: { alignItems: 'flex-end', gap: 6 },
  memberCount: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  memberCountText: { fontSize: SIZES.xs, color: colors.text.muted, ...FONTS.regular },
  roleBadge: {
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4,
  },
  roleText: { fontSize: SIZES.xs, ...FONTS.semibold },
});
