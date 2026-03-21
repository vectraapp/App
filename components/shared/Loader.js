/**
 * Vectra — Generic Loader
 *
 * Shows a skeleton shimmer instead of a spinner.
 *
 * fullScreen  → fills the whole screen with stacked skeleton rows
 * inline      → shows a compact row of skeleton bars (for use inside lists)
 */

import { View, StyleSheet } from 'react-native';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SkeletonBox } from './Skeleton';
import { useTheme } from '../../context/ThemeContext';
import { SIZES } from '../../constants/theme';

function GenericSkeleton({ colors }) {
  return (
    <>
      {/* Simulates a header */}
      <View style={[styles.header, { backgroundColor: colors.background.secondary, borderBottomColor: colors.border }]}>
        <SkeletonBox width={160} height={20} borderRadius={6} />
        <SkeletonBox width={40} height={40} borderRadius={20} />
      </View>
      {/* Simulates a list of cards */}
      <View style={styles.body}>
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={[styles.card, { backgroundColor: colors.background.secondary, borderColor: colors.border }]}>
            <View style={styles.row}>
              <SkeletonBox width={72} height={22} borderRadius={6} />
              <SkeletonBox width={52} height={22} borderRadius={6} />
            </View>
            <SkeletonBox width="80%" height={16} style={{ marginTop: 12 }} />
            <SkeletonBox width="55%" height={13} style={{ marginTop: 6 }} />
          </View>
        ))}
      </View>
    </>
  );
}

export default function Loader({ fullScreen = false }) {
  const { colors } = useTheme();

  if (fullScreen) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background.primary }]}>
        <GenericSkeleton colors={colors} />
      </SafeAreaView>
    );
  }

  // Inline: a couple of shimmer lines used inside partial content areas
  return (
    <View style={styles.inline}>
      <SkeletonBox height={16} borderRadius={6} style={{ marginBottom: 8 }} />
      <SkeletonBox width="70%" height={14} borderRadius={6} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding * 1.5,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  body: {
    paddingHorizontal: SIZES.padding * 1.5,
    paddingTop: 16,
  },
  card: {
    borderRadius: SIZES.radius,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inline: {
    padding: SIZES.padding,
  },
});
