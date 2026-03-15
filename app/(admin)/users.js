import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES } from '../../constants/theme';
import { Card, EmptyState } from '../../components/shared';
import { useToast } from '../../components/shared/Toast';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

const ROLE_COLORS = {
  user: { bg: 'rgba(100, 116, 139, 0.15)', text: '#64748B' },
  contributor: { bg: 'rgba(37, 99, 235, 0.15)', text: '#2563EB' },
  admin: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B' },
  super_admin: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444' },
};

export default function AdminUsers() {
  const { showToast } = useToast();
  const { colors } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadUsers = async () => {
    try {
      const response = await api.getAllUsers();
      if (response?.success && Array.isArray(response?.data)) {
        setUsers(response.data);
      } else if (Array.isArray(response?.data)) {
        setUsers(response.data);
      } else if (Array.isArray(response)) {
        setUsers(response);
      } else {
        setUsers([]);
      }
    } catch (err) {
      showToast('error', 'Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase().trim();
    return users.filter(
      (user) =>
        (user.display_name && user.display_name.toLowerCase().includes(query)) ||
        (user.email && user.email.toLowerCase().includes(query))
    );
  }, [users, searchQuery]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getRoleDisplay = (role) => {
    if (Array.isArray(role)) {
      // Pick the highest priority role to display
      const priority = ['super_admin', 'admin', 'contributor', 'user'];
      for (const r of priority) {
        if (role.includes(r)) return r;
      }
      return role[0] || 'user';
    }
    return role || 'user';
  };

  const styles = createStyles(colors);

  const renderUser = ({ item }) => {
    const role = getRoleDisplay(item.role);
    const roleColor = ROLE_COLORS[role] || ROLE_COLORS.user;
    const roleLabel = role.replace('_', ' ');

    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {item.display_name
                  ? item.display_name.charAt(0).toUpperCase()
                  : '?'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName} numberOfLines={1}>
                {item.display_name || 'Unknown'}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {item.email || ''}
              </Text>
            </View>
          </View>
          <View style={[styles.roleBadge, { backgroundColor: roleColor.bg }]}>
            <Text style={[styles.roleBadgeText, { color: roleColor.text }]}>
              {roleLabel}
            </Text>
          </View>
        </View>

        {item.created_at ? (
          <View style={styles.cardFooter}>
            <Feather name="calendar" size={12} color={colors.text.muted} />
            <Text style={styles.joinedText}>
              Joined {formatDate(item.created_at)}
            </Text>
          </View>
        ) : null}
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Users</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color={colors.text.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or email..."
            placeholderTextColor={colors.text.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 ? (
            <Feather
              name="x"
              size={18}
              color={colors.text.muted}
              onPress={() => setSearchQuery('')}
            />
          ) : null}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brand.secondary} />
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => String(item.id || item.email)}
          renderItem={renderUser}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.brand.secondary}
              colors={[colors.brand.secondary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="users"
              title={searchQuery ? 'No results' : 'No users found'}
              message={
                searchQuery
                  ? `No users matching "${searchQuery}"`
                  : 'No users have been registered yet'
              }
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: SIZES.padding * 1.5,
      paddingTop: 8,
      paddingBottom: 16,
      backgroundColor: colors.background.secondary,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: SIZES.xl,
      color: colors.text.primary,
      ...FONTS.bold,
    },
    searchContainer: {
      paddingHorizontal: SIZES.padding * 1.5,
      paddingVertical: 12,
      backgroundColor: colors.background.primary,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.secondary,
      borderRadius: SIZES.radius,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      height: 44,
    },
    searchInput: {
      flex: 1,
      fontSize: SIZES.md,
      color: colors.text.primary,
      marginLeft: 10,
      ...FONTS.regular,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    listContent: {
      padding: SIZES.padding * 1.5,
      paddingTop: 4,
      paddingBottom: 40,
      flexGrow: 1,
    },
    card: {
      marginBottom: 12,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: 10,
    },
    avatarCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.brand.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    avatarText: {
      fontSize: SIZES.base,
      color: '#FFFFFF',
      ...FONTS.bold,
    },
    userDetails: {
      flex: 1,
    },
    userName: {
      fontSize: SIZES.base,
      color: colors.text.primary,
      ...FONTS.semibold,
    },
    userEmail: {
      fontSize: SIZES.sm,
      color: colors.text.muted,
      marginTop: 2,
      ...FONTS.regular,
    },
    roleBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
    },
    roleBadgeText: {
      fontSize: SIZES.xs,
      ...FONTS.semibold,
      textTransform: 'capitalize',
    },
    cardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    joinedText: {
      fontSize: SIZES.sm,
      color: colors.text.muted,
      marginLeft: 6,
      ...FONTS.regular,
    },
  });
