import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { FONTS, SIZES } from '../../constants/theme';
import { Button, Card, Loader } from '../../components/shared';
import { useToast } from '../../components/shared/Toast';
import { useTheme } from '../../context/ThemeContext';
import useAuthStore from '../../store/authStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const getProfile = useAuthStore((s) => s.getProfile);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const p = await getProfile();
      setProfile(p);
      if (p?.avatarUrl) {
        setAvatarUrl(p.avatarUrl);
      }
    } catch (err) {
      // silently handle
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    showToast('info', 'You have been signed out.');
    router.replace('/(auth)/login');
  };

  const pickImage = async (useCamera = false) => {
    setShowPhotoModal(false);

    const permissionResult = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      showToast('error', 'Permission to access photos was denied');
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setAvatarUrl(uri);
      await updateProfile({ avatarUrl: uri });
      showToast('success', 'Profile photo updated');
    }
  };

  const removePhoto = async () => {
    setShowPhotoModal(false);
    setAvatarUrl(null);
    await updateProfile({ avatarUrl: null });
    showToast('info', 'Profile photo removed');
  };

  const styles = createStyles(colors);

  if (loading) {
    return <Loader fullScreen />;
  }

  const displayName = user?.displayName || user?.display_name || profile?.displayName || profile?.display_name || '';
  const initials = displayName
    ? displayName.split(' ').filter(Boolean).map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '';

  const userRole = user?.profile?.role || user?.role || profile?.role || 'user';
  const roleStr = Array.isArray(userRole) ? userRole[0] : userRole;
  const isAdmin = roleStr === 'admin' || roleStr === 'super_admin';
  const isContributor = roleStr === 'contributor';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => router.push('/settings')}
          >
            <Feather name="settings" size={20} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* User Info */}
        <View style={styles.userSection}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => setShowPhotoModal(true)}
            activeOpacity={0.8}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                {initials ? (
                  <Text style={styles.avatarText}>{initials}</Text>
                ) : (
                  <Feather name="user" size={36} color={colors.white} />
                )}
              </View>
            )}
            <View style={styles.editBadge}>
              <Feather name="camera" size={14} color={colors.white} />
            </View>
          </TouchableOpacity>
          <Text style={styles.userName}>{displayName || user?.email?.split('@')[0] || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
          {user?.isStudentEmail ? (
            <View style={styles.studentBadge}>
              <Feather name="award" size={12} color={colors.brand.secondary} />
              <Text style={styles.studentBadgeText}>Student Account</Text>
            </View>
          ) : null}
        </View>

        {/* Academic Info */}
        {profile ? (
          <Card style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Academic Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>University</Text>
              <Text style={styles.infoValue}>{profile.universityName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Faculty</Text>
              <Text style={styles.infoValue}>{profile.facultyName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Department</Text>
              <Text style={styles.infoValue}>{profile.departmentName}</Text>
            </View>
            <View style={[styles.infoRow, styles.infoRowLast]}>
              <Text style={styles.infoLabel}>Level</Text>
              <Text style={styles.infoValue}>{profile.level}</Text>
            </View>
          </Card>
        ) : null}

        {/* Dashboards - Show for Admin/Contributor */}
        {(isAdmin || isContributor) && (
          <View style={styles.dashboardSection}>
            <Text style={styles.sectionTitle}>Your Dashboards</Text>
            <Card style={styles.dashboardCard}>
              <View style={styles.dashboardItem}>
                <View style={[styles.dashboardIcon, { backgroundColor: colors.background.tertiary }]}>
                  <Feather name="book-open" size={20} color={colors.brand.secondary} />
                </View>
                <View style={styles.dashboardContent}>
                  <Text style={styles.dashboardTitle}>Student View</Text>
                  <Text style={styles.dashboardDesc}>Currently active</Text>
                </View>
                <Feather name="check" size={18} color={colors.brand.accent} />
              </View>

              {isAdmin && (
                <TouchableOpacity
                  style={styles.dashboardItem}
                  activeOpacity={0.7}
                  onPress={() => router.push('/(admin)/dashboard')}
                >
                  <View style={[styles.dashboardIcon, { backgroundColor: colors.tint.error }]}>
                    <Feather name="bar-chart-2" size={20} color={colors.brand.error} />
                  </View>
                  <View style={styles.dashboardContent}>
                    <Text style={styles.dashboardTitle}>Admin Dashboard</Text>
                    <Text style={styles.dashboardDesc}>Manage content and users</Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={colors.text.muted} />
                </TouchableOpacity>
              )}

              {isContributor && (
                <TouchableOpacity style={styles.dashboardItem} activeOpacity={0.7}>
                  <View style={[styles.dashboardIcon, { backgroundColor: colors.tint.accent }]}>
                    <Feather name="edit-2" size={20} color={colors.brand.accent} />
                  </View>
                  <View style={styles.dashboardContent}>
                    <Text style={styles.dashboardTitle}>Contributor Portal</Text>
                    <Text style={styles.dashboardDesc}>Upload past questions</Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={colors.text.muted} />
                </TouchableOpacity>
              )}
            </Card>
          </View>
        )}

        {/* Sharing Section */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Sharing</Text>
          <Card style={styles.menuCard}>
            <MenuItem
              colors={colors}
              icon="gift"
              label="Redeem Share Code"
              sublabel="Access shared content"
              onPress={() => router.push('/sharing/redeem-code')}
            />
            <MenuItem
              colors={colors}
              icon="users"
              label="Shared with Me"
              sublabel="Content others shared"
              onPress={() => router.push('/sharing/shared-with-me')}
            />
            <MenuItem
              colors={colors}
              icon="share-2"
              label="My Shares"
              sublabel="Manage your shares"
              onPress={() => router.push('/sharing/my-shares')}
              isLast
            />
          </Card>
        </View>

        {/* Upload Section */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Contribute</Text>
          <Card style={styles.menuCard}>
            <MenuItem
              colors={colors}
              icon="upload"
              label="Upload Past Question"
              sublabel="Help your peers"
              onPress={() => router.push('/upload/question')}
            />
            <MenuItem
              colors={colors}
              icon="book"
              label="Upload Textbook"
              sublabel="Share study materials"
              onPress={() => router.push('/upload/textbook')}
            />
            <MenuItem
              colors={colors}
              icon="inbox"
              label="My Uploads"
              sublabel="Track your submissions"
              onPress={() => router.push('/upload/my-uploads')}
              isLast
            />
          </Card>
        </View>

        {/* Settings Section */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Settings</Text>
          <Card style={styles.menuCard}>
            <MenuItem
              colors={colors}
              icon="moon"
              label="Appearance"
              sublabel="Theme and display"
              onPress={() => router.push('/settings/appearance')}
            />
            <MenuItem
              colors={colors}
              icon="bell"
              label="Notifications"
              sublabel="Push and email alerts"
              onPress={() => router.push('/settings/notifications')}
              isLast
            />
          </Card>
        </View>

        {/* About Section */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>About</Text>
          <Card style={styles.menuCard}>
            <MenuItem
              colors={colors}
              icon="info"
              label="About Vectra"
              onPress={() => router.push('/about')}
            />
            <MenuItem
              colors={colors}
              icon="help-circle"
              label="Help and Support"
              onPress={() => router.push('/support')}
            />
            <MenuItem
              colors={colors}
              icon="shield"
              label="Privacy Policy"
              onPress={() => router.push('/legal/privacy')}
            />
            <MenuItem
              colors={colors}
              icon="file-text"
              label="Terms of Service"
              onPress={() => router.push('/legal/terms')}
              isLast
            />
          </Card>
        </View>

        {/* Logout */}
        <View style={styles.logoutSection}>
          <Button
            title="Sign Out"
            onPress={handleLogout}
            variant="outline"
            icon="log-out"
          />
        </View>

        {/* Version */}
        <Text style={styles.version}>Vectra v1.0.0</Text>
      </ScrollView>

      {/* Photo Options Modal */}
      <Modal
        visible={showPhotoModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPhotoModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPhotoModal(false)}
        >
          <View style={styles.bottomSheet}>
            <View style={styles.bottomSheetHandle} />
            <Text style={styles.bottomSheetTitle}>Profile Photo</Text>

            <TouchableOpacity style={styles.photoOption} onPress={() => pickImage(true)}>
              <View style={styles.photoOptionIcon}>
                <Feather name="camera" size={20} color={colors.brand.secondary} />
              </View>
              <Text style={styles.photoOptionText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.photoOption} onPress={() => pickImage(false)}>
              <View style={styles.photoOptionIcon}>
                <Feather name="image" size={20} color={colors.brand.secondary} />
              </View>
              <Text style={styles.photoOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>

            {avatarUrl && (
              <TouchableOpacity style={styles.photoOption} onPress={removePhoto}>
                <View style={[styles.photoOptionIcon, { backgroundColor: colors.tint.error }]}>
                  <Feather name="trash-2" size={20} color={colors.brand.error} />
                </View>
                <Text style={[styles.photoOptionText, { color: colors.brand.error }]}>
                  Remove Photo
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowPhotoModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

function MenuItem({ colors, icon, label, sublabel, onPress, isLast = false }) {
  return (
    <TouchableOpacity
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 14,
          paddingVertical: 14,
          borderBottomWidth: isLast ? 0 : 1,
          borderBottomColor: colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: colors.tint.secondary,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
          }}
        >
          <Feather name={icon} size={18} color={colors.brand.secondary} />
        </View>
        <View>
          <Text style={{ fontSize: SIZES.base, color: colors.text.primary, ...FONTS.medium }}>
            {label}
          </Text>
          {sublabel && (
            <Text style={{ fontSize: SIZES.sm, color: colors.text.muted, marginTop: 2, ...FONTS.regular }}>
              {sublabel}
            </Text>
          )}
        </View>
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
  scrollContent: {
    paddingBottom: 40,
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
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userSection: {
    alignItems: 'center',
    paddingVertical: 28,
    backgroundColor: colors.background.secondary,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarText: {
    fontSize: SIZES.xxl,
    color: colors.white,
    ...FONTS.bold,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.brand.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background.secondary,
  },
  userName: {
    fontSize: SIZES.lg,
    color: colors.text.primary,
    ...FONTS.semibold,
  },
  userEmail: {
    fontSize: SIZES.md,
    color: colors.text.muted,
    marginTop: 2,
    ...FONTS.regular,
  },
  studentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.tint.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
  },
  studentBadgeText: {
    fontSize: SIZES.sm,
    color: colors.brand.secondary,
    marginLeft: 4,
    ...FONTS.medium,
  },
  infoCard: {
    marginHorizontal: SIZES.padding * 1.5,
    marginTop: 20,
  },
  infoCardTitle: {
    fontSize: SIZES.base,
    color: colors.text.primary,
    marginBottom: 14,
    ...FONTS.semibold,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: SIZES.md,
    color: colors.text.muted,
    ...FONTS.regular,
  },
  infoValue: {
    fontSize: SIZES.md,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
    ...FONTS.medium,
  },
  dashboardSection: {
    marginTop: 20,
    paddingHorizontal: SIZES.padding * 1.5,
  },
  sectionTitle: {
    fontSize: SIZES.md,
    color: colors.text.muted,
    marginBottom: 12,
    ...FONTS.semibold,
  },
  dashboardCard: {
    padding: 0,
    overflow: 'hidden',
  },
  dashboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dashboardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dashboardContent: {
    flex: 1,
  },
  dashboardTitle: {
    fontSize: SIZES.base,
    color: colors.text.primary,
    ...FONTS.medium,
  },
  dashboardDesc: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginTop: 2,
    ...FONTS.regular,
  },
  menuSection: {
    marginTop: 24,
    paddingHorizontal: SIZES.padding * 1.5,
  },
  menuSectionTitle: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    ...FONTS.semibold,
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  logoutSection: {
    marginTop: 24,
    marginHorizontal: SIZES.padding * 1.5,
  },
  version: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: SIZES.sm,
    color: colors.text.muted,
    ...FONTS.regular,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SIZES.padding * 1.5,
    paddingBottom: 40,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  bottomSheetTitle: {
    fontSize: SIZES.lg,
    color: colors.text.primary,
    marginBottom: 20,
    ...FONTS.bold,
  },
  photoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: colors.background.tertiary,
    borderRadius: SIZES.radius,
    marginBottom: 10,
  },
  photoOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.tint.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  photoOptionText: {
    fontSize: SIZES.base,
    color: colors.text.primary,
    ...FONTS.medium,
  },
  cancelButton: {
    marginTop: 10,
    padding: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: SIZES.base,
    color: colors.text.muted,
    ...FONTS.medium,
  },
});
