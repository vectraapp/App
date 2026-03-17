import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { EmptyState, Loader } from '../../components/shared';
import { DUMMY_REPEATED_QUESTIONS, delay } from '../../services/dummyData';

export default function CourseAnalysisScreen() {
  const { courseCode } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const styles = createStyles(colors);
  const code = courseCode ? decodeURIComponent(courseCode) : '';

  useEffect(() => {
    loadData();
  }, [code]);

  const loadData = async () => {
    setLoading(true);
    await delay(400);
    setQuestions(DUMMY_REPEATED_QUESTIONS[code] || []);
    setLoading(false);
  };

  const maxAppearances = questions.length > 0 ? Math.max(...questions.map((q) => q.appearances)) : 1;

  const renderQuestion = ({ item, index }) => {
    const isExpanded = expanded === item.id;
    const barWidth = `${(item.appearances / maxAppearances) * 100}%`;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => setExpanded(isExpanded ? null : item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>{index + 1}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.topicText} numberOfLines={isExpanded ? undefined : 2}>
              {item.topic}
            </Text>
            <View style={styles.metaRow}>
              <View style={[styles.tag, { backgroundColor: colors.tint.primary }]}>
                <Feather name="repeat" size={10} color={colors.brand.primary} />
                <Text style={[styles.tagText, { color: colors.brand.primary }]}>
                  {item.appearances}x
                </Text>
              </View>
              <Text style={styles.yearsText}>
                {item.years[0]}–{item.years[item.years.length - 1]}
              </Text>
            </View>
          </View>
          <Feather
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.text.muted}
          />
        </View>

        {/* Frequency bar */}
        <View style={styles.barContainer}>
          <View style={[styles.barFill, { width: barWidth }]} />
        </View>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.sampleBox}>
              <Text style={styles.sampleLabel}>Sample Question</Text>
              <Text style={styles.sampleText}>{item.sample}</Text>
            </View>

            <View style={styles.yearsRow}>
              <Text style={styles.yearsLabel}>Years asked:</Text>
              <View style={styles.yearsChips}>
                {item.years.map((yr) => (
                  <View key={yr} style={styles.yearChip}>
                    <Text style={styles.yearChipText}>{yr}</Text>
                  </View>
                ))}
              </View>
            </View>

            {item.tags && (
              <View style={styles.tagsRow}>
                {item.tags.map((tag) => (
                  <View key={tag} style={styles.topicTag}>
                    <Text style={styles.topicTagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Loader />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Most Repeated</Text>
          {code ? <Text style={styles.headerSub}>{code}</Text> : null}
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Info banner */}
      <View style={styles.infoBanner}>
        <Feather name="trending-up" size={14} color={colors.brand.secondary} />
        <Text style={styles.infoText}>
          Topics ranked by how often they appear across past exams
        </Text>
      </View>

      {questions.length === 0 ? (
        <EmptyState
          icon="bar-chart-2"
          title="No Analysis Yet"
          subtitle="We don't have enough past questions to identify patterns for this course yet."
        />
      ) : (
        <FlatList
          data={questions}
          keyExtractor={(item) => item.id}
          renderItem={renderQuestion}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (c) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background.primary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    backBtn: {
      width: 40,
      height: 40,
      justifyContent: 'center',
    },
    headerCenter: {
      flex: 1,
      alignItems: 'center',
    },
    headerTitle: {
      ...FONTS.bold,
      fontSize: SIZES.lg,
      color: c.text.primary,
    },
    headerSub: {
      ...FONTS.regular,
      fontSize: SIZES.sm,
      color: c.text.muted,
      marginTop: 1,
    },
    infoBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginHorizontal: 16,
      marginTop: 12,
      marginBottom: 4,
      padding: 10,
      backgroundColor: c.tint.secondary,
      borderRadius: 8,
    },
    infoText: {
      ...FONTS.regular,
      fontSize: SIZES.sm,
      color: c.brand.secondary,
      flex: 1,
    },
    list: {
      padding: 16,
      paddingBottom: 32,
    },
    card: {
      backgroundColor: c.background.secondary,
      borderRadius: 12,
      marginBottom: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: c.border,
      ...SHADOWS.small,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    rankBadge: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: c.tint.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 2,
    },
    rankText: {
      ...FONTS.bold,
      fontSize: SIZES.sm,
      color: c.brand.primary,
    },
    cardInfo: {
      flex: 1,
    },
    topicText: {
      ...FONTS.semiBold,
      fontSize: SIZES.base,
      color: c.text.primary,
      lineHeight: 20,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 6,
    },
    tag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
    },
    tagText: {
      ...FONTS.semiBold,
      fontSize: SIZES.xs,
    },
    yearsText: {
      ...FONTS.regular,
      fontSize: SIZES.xs,
      color: c.text.muted,
    },
    barContainer: {
      height: 4,
      backgroundColor: c.tint.accent,
      borderRadius: 2,
      marginTop: 12,
      overflow: 'hidden',
    },
    barFill: {
      height: '100%',
      backgroundColor: c.brand.accent,
      borderRadius: 2,
    },
    expandedContent: {
      marginTop: 14,
      borderTopWidth: 1,
      borderTopColor: c.border,
      paddingTop: 14,
      gap: 12,
    },
    sampleBox: {
      backgroundColor: c.background.tertiary,
      borderRadius: 8,
      padding: 12,
    },
    sampleLabel: {
      ...FONTS.semiBold,
      fontSize: SIZES.xs,
      color: c.text.muted,
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    sampleText: {
      ...FONTS.regular,
      fontSize: SIZES.sm,
      color: c.text.secondary,
      lineHeight: 20,
    },
    yearsRow: {
      gap: 6,
    },
    yearsLabel: {
      ...FONTS.semiBold,
      fontSize: SIZES.xs,
      color: c.text.muted,
    },
    yearsChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    yearChip: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      backgroundColor: c.tint.primaryLight,
      borderRadius: 8,
    },
    yearChipText: {
      ...FONTS.medium,
      fontSize: SIZES.xs,
      color: c.brand.primary,
    },
    tagsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    topicTag: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      backgroundColor: c.tint.secondary,
      borderRadius: 8,
    },
    topicTagText: {
      ...FONTS.medium,
      fontSize: SIZES.xs,
      color: c.brand.secondary,
    },
  });
