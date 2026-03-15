import React, { useState } from 'react';
import {
  TouchableOpacity, View, Text, Modal, ScrollView,
  StyleSheet, ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const AI_OPTIONS = {
  past_questions: [
    { id: 'solve', icon: 'search', title: 'Solve Selected Question', subtitle: 'Get step-by-step solution' },
    { id: 'summarize', icon: 'file-text', title: 'Summarize All Questions', subtitle: 'Key topics covered' },
    { id: 'explain', icon: 'book-open', title: 'Explain Concepts', subtitle: 'Break down difficult topics' },
    { id: 'predict', icon: 'target', title: 'Predict Exam Topics', subtitle: 'Based on past patterns' },
  ],
  notebook: [
    { id: 'summarize', icon: 'book', title: 'Summarize Notes', subtitle: 'Get a quick overview' },
    { id: 'chat', icon: 'message-circle', title: 'Ask About Notes', subtitle: 'Ask any question' },
    { id: 'keypoints', icon: 'key', title: 'Extract Key Points', subtitle: 'Important highlights' },
    { id: 'flashcards', icon: 'layers', title: 'Create Flashcards', subtitle: 'For quick revision' },
  ],
  textbook: [
    { id: 'summarize', icon: 'book', title: 'Summarize Content', subtitle: 'Chapter overview' },
    { id: 'chat', icon: 'message-circle', title: 'Ask About Textbook', subtitle: 'Any question about content' },
    { id: 'concepts', icon: 'key', title: 'Key Concepts', subtitle: 'Core ideas explained' },
  ],
  lecture: [
    { id: 'recap', icon: 'file-text', title: 'Generate Recap', subtitle: 'Summary of lecture' },
    { id: 'chat', icon: 'message-circle', title: 'Chat About Lecture', subtitle: 'Ask any question' },
    { id: 'takeaways', icon: 'target', title: 'Key Takeaways', subtitle: 'Most important points' },
    { id: 'study_notes', icon: 'book', title: 'Create Study Notes', subtitle: 'Formatted for revision' },
    { id: 'predict', icon: 'trending-up', title: 'Predict Exam Questions', subtitle: 'Based on lecture content' },
  ],
  browse: [
    { id: 'recommend', icon: 'star', title: 'Recommend Resources', subtitle: 'Best materials for this course' },
    { id: 'studyplan', icon: 'calendar', title: 'Create Study Plan', subtitle: 'Personalized schedule' },
  ],
  profile: [
    { id: 'insights', icon: 'bar-chart-2', title: 'Study Insights', subtitle: 'Your learning patterns' },
    { id: 'recommend', icon: 'star', title: 'Recommendations', subtitle: 'What to study next' },
  ],
};

export default function FloatingAIButton({ context = 'lecture', data = {}, onAction }) {
  const { colors } = useTheme();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const options = AI_OPTIONS[context] || AI_OPTIONS.lecture;

  const handleOption = async (option) => {
    setLoading(true);
    setResult(null);
    try {
      if (onAction) {
        const response = await onAction(option.id, data);
        setResult(response);
      }
    } catch (error) {
      setResult({ error: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setSheetVisible(true)}
        activeOpacity={0.85}
      >
        <Feather name="cpu" size={26} color="white" />
      </TouchableOpacity>

      {/* AI Options Bottom Sheet */}
      <Modal
        visible={sheetVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSheetVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setSheetVisible(false)}
        />
        <View style={[styles.sheet, { backgroundColor: colors.background.secondary }]}>
          {/* Sheet Header */}
          <View style={styles.sheetHeader}>
            <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
            <View style={styles.sheetTitleRow}>
              <Feather name="zap" size={20} color="#22D3EE" />
              <Text style={[styles.sheetTitle, { color: colors.text.primary }]}>
                AI Assistant
              </Text>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {loading && (
              <View style={styles.loadingBox}>
                <ActivityIndicator color="#22D3EE" size="large" />
                <Text style={{ color: colors.text.secondary, marginTop: 12 }}>
                  AI is thinking...
                </Text>
              </View>
            )}

            {result && !loading && (
              <View style={[styles.resultBox, { backgroundColor: colors.background.tertiary }]}>
                <Text style={[styles.resultText, { color: colors.text.primary }]}>
                  {result.error || result.content || result.text || JSON.stringify(result)}
                </Text>
                <TouchableOpacity onPress={() => setResult(null)}>
                  <Text style={{ color: '#22D3EE', marginTop: 8 }}>Try another option</Text>
                </TouchableOpacity>
              </View>
            )}

            {!loading && !result && options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.option, { borderBottomColor: colors.border }]}
                onPress={() => handleOption(option)}
              >
                <View style={[styles.optionIconWrap, { backgroundColor: colors.tint.secondary }]}>
                  <Feather name={option.icon} size={18} color="#22D3EE" />
                </View>
                <View style={styles.optionText}>
                  <Text style={[styles.optionTitle, { color: colors.text.primary }]}>
                    {option.title}
                  </Text>
                  <Text style={[styles.optionSubtitle, { color: colors.text.muted }]}>
                    {option.subtitle}
                  </Text>
                </View>
                <Feather name="chevron-right" size={16} color={colors.text.muted} />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.background.tertiary }]}
            onPress={() => { setSheetVisible(false); setResult(null); setLoading(false); }}
          >
            <Text style={{ color: colors.text.secondary, fontWeight: '600' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#22D3EE',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22D3EE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 999,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    paddingBottom: 24,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  sheetHeader: { paddingHorizontal: 20, paddingBottom: 12 },
  sheetTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  sheetTitle: { fontSize: 18, fontWeight: '700' },
  loadingBox: { alignItems: 'center', paddingVertical: 40 },
  resultBox: { margin: 16, padding: 16, borderRadius: 12 },
  resultText: { fontSize: 14, lineHeight: 22 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 14,
  },
  optionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: { flex: 1 },
  optionTitle: { fontSize: 15, fontWeight: '600' },
  optionSubtitle: { fontSize: 12, marginTop: 2 },
  closeButton: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
});
