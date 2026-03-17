import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  Share,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { Card, EmptyState, Button } from '../../components/shared';
import { delay, DUMMY_QUESTIONS, DUMMY_TEXTBOOKS, DUMMY_SESSIONS } from '../../services/dummyData';
import { AI_RESPONSES } from '../../constants/mockData';

const TABS = ['Questions', 'Materials', 'PDFs', 'Jot'];

const FALLBACK_SESSIONS = ['2021/2022', '2022/2023', '2023/2024', '2024/2025', '2025/2026'];

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const courseCode = decodeURIComponent(id);

  const [activeTab, setActiveTab] = useState(0);
  const [selectedSession, setSelectedSession] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [uploadedPdfs, setUploadedPdfs] = useState([]);
  const [jot, setJot] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  const [showAISheet, setShowAISheet] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [pdfUploading, setPdfUploading] = useState(false);

  // API data state
  const [questions, setQuestions] = useState([]);
  const [textbooks, setTextbooks] = useState([]);
  const [sessions, setSessions] = useState(FALLBACK_SESSIONS);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [isLoadingTextbooks, setIsLoadingTextbooks] = useState(true);

  // Load questions, textbooks, and sessions from dummy data
  useEffect(() => {
    const loadQuestions = async () => {
      setIsLoadingQuestions(true);
      await delay(400);
      const filtered = DUMMY_QUESTIONS
        .filter((q) => q.courseCode === courseCode)
        .map((q) => ({
          id: q.id,
          courseCode: q.courseCode,
          session: q.session,
          semester: q.semester,
          type: q.type,
          pages: q.pages,
          title: q.title,
          imageUrl: null,
          fileType: 'pdf',
          source: 'past_questions',
        }));
      setQuestions(filtered);
      setIsLoadingQuestions(false);
    };

    const loadTextbooks = async () => {
      setIsLoadingTextbooks(true);
      await delay(300);
      setTextbooks(DUMMY_TEXTBOOKS.filter((t) => t.course_code === courseCode));
      setIsLoadingTextbooks(false);
    };

    const loadSessions = () => {
      setSessions(DUMMY_SESSIONS.map((s) => s.value));
    };

    loadQuestions();
    loadTextbooks();
    loadSessions();
  }, [courseCode]);

  // Filter questions client-side based on selected filters
  const filteredQuestions = questions.filter((q) => {
    if (selectedSession !== 'all' && q.session !== selectedSession) return false;
    if (selectedType !== 'all' && q.type !== selectedType) return false;
    return true;
  });

  // Load saved notes and PDFs
  useEffect(() => {
    loadData();
  }, [courseCode]);

  const loadData = async () => {
    try {
      const savedPdfs = await AsyncStorage.getItem(`pdfs_${courseCode}`);
      const savedJot = await AsyncStorage.getItem(`jot_${courseCode}`);
      if (savedPdfs) setUploadedPdfs(JSON.parse(savedPdfs));
      if (savedJot) setJot(savedJot);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  // Auto-save jot notes
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        await AsyncStorage.setItem(`jot_${courseCode}`, jot);
        setLastSaved(new Date());
      } catch (err) {
        console.error('Failed to save jot:', err);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [jot, courseCode]);

  // Save PDFs to storage
  const savePdfs = async (pdfs) => {
    try {
      await AsyncStorage.setItem(`pdfs_${courseCode}`, JSON.stringify(pdfs));
    } catch (err) {
      console.error('Failed to save PDFs:', err);
    }
  };

  // Handle PDF upload
  const handlePdfUpload = async () => {
    try {
      setPdfUploading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        const file = result.assets[0];
        const newPdf = {
          id: Date.now().toString(),
          name: file.name,
          uri: file.uri,
          size: file.size,
          uploadedAt: new Date().toISOString(),
        };
        const updatedPdfs = [...uploadedPdfs, newPdf];
        setUploadedPdfs(updatedPdfs);
        await savePdfs(updatedPdfs);
      }
    } catch (err) {
      console.error('PDF upload error:', err);
    } finally {
      setPdfUploading(false);
    }
  };

  // Delete PDF
  const handleDeletePdf = async (pdfId) => {
    const updatedPdfs = uploadedPdfs.filter(pdf => pdf.id !== pdfId);
    setUploadedPdfs(updatedPdfs);
    await savePdfs(updatedPdfs);
  };

  // Open a local PDF file
  const openPdf = async (pdf) => {
    try {
      if (Platform.OS === 'android') {
        // On Android, get content URI and open with system viewer
        const cUri = await FileSystem.getContentUriAsync(pdf.uri);
        await Linking.openURL(cUri);
      } else {
        // On iOS, open directly
        await Linking.openURL(pdf.uri);
      }
    } catch (err) {
      console.error('Failed to open PDF:', err);
      Alert.alert('Cannot Open PDF', 'Unable to open this PDF. Please install a PDF viewer app.');
    }
  };

  // Share course
  const handleShareCourse = async () => {
    try {
      await Share.share({
        message: `Check out ${courseCode} on Vectra - ${questions.length} past questions available!`,
      });
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleAIAction = async (action) => {
    setAiLoading(true);
    setShowAISheet(false);

    try {
      await delay(1200);
      let text = '';
      if (action === 'summarize') {
        text = AI_RESPONSES.summarizeQuestions(courseCode, filteredQuestions.length);
      } else if (action === 'solve' && selectedQuestions.length > 0) {
        const question = questions.find((q) => q.id === selectedQuestions[0]);
        text = AI_RESPONSES.solveQuestion(question?.title || 'Selected question');
      } else if (action === 'explain') {
        text = AI_RESPONSES.explain(courseCode);
      } else if (action === 'quiz') {
        text = AI_RESPONSES.quiz(courseCode);
      }
      setAiResponse(text || 'No response available.');
    } catch (err) {
      setAiResponse('Sorry, something went wrong. Please try again later.');
    } finally {
      setAiLoading(false);
    }
  };

  const styles = createStyles(colors);

  const MY_UPLOAD_STATUS = {
    pending:   { label: 'Under Review', icon: 'clock',       color: '#F59E0B', bg: '#FEF3C7' },
    reviewing: { label: 'Reviewing',    icon: 'eye',         color: '#3B82F6', bg: '#DBEAFE' },
    approved:  { label: 'Your Upload',  icon: 'check-circle',color: '#10B981', bg: '#D1FAE5' },
    rejected:  { label: 'Rejected',     icon: 'x-circle',    color: '#EF4444', bg: '#FEE2E2' },
  };

  const renderQuestion = ({ item }) => {
    const isSelected = selectedQuestions.includes(item.id);
    const myStatus = item.myUpload ? MY_UPLOAD_STATUS[item.uploadStatus] || MY_UPLOAD_STATUS.pending : null;
    const isUpload = item.source === 'user_upload';
    const hasFile = !!item.imageUrl;

    const handleCardPress = () => {
      if (isUpload && hasFile) {
        Linking.openURL(item.imageUrl).catch(() =>
          Alert.alert('Cannot Open', 'Unable to open this file.')
        );
      } else if (!isUpload) {
        router.push(`/question/${item.id}`);
      }
    };

    return (
      <Card
        style={[
          styles.questionCard,
          isSelected && styles.questionCardSelected,
          item.myUpload && item.uploadStatus === 'rejected' && styles.questionCardRejected,
        ]}
        onPress={handleCardPress}
      >
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => toggleQuestionSelection(item.id)}
        >
          <View style={[styles.checkboxInner, isSelected && styles.checkboxChecked]}>
            {isSelected && <Feather name="check" size={14} color={colors.white} />}
          </View>
        </TouchableOpacity>
        <View style={styles.questionContent}>
          <View style={styles.questionHeader}>
            <View
              style={[
                styles.typeBadge,
                item.type === 'Exam' ? styles.examBadge : styles.testBadge,
              ]}
            >
              <Text
                style={[
                  styles.typeText,
                  item.type === 'Exam' ? styles.examText : styles.testText,
                ]}
              >
                {item.type}
              </Text>
            </View>
            <Text style={styles.session}>{item.session}</Text>
          </View>
          <Text style={styles.questionTitle}>{item.title}</Text>
          <View style={styles.questionFooter}>
            <View style={styles.detail}>
              <Feather name="book-open" size={13} color={colors.text.muted} />
              <Text style={styles.detailText}>{item.semester}</Text>
            </View>
            {item.pages > 0 && (
              <View style={styles.detail}>
                <Feather name="file" size={13} color={colors.text.muted} />
                <Text style={styles.detailText}>{item.pages} pages</Text>
              </View>
            )}
            {isUpload && hasFile && (
              <TouchableOpacity
                style={styles.viewDocBtn}
                onPress={handleCardPress}
              >
                <Feather name="external-link" size={11} color={colors.brand.primary} />
                <Text style={styles.viewDocText}>View</Text>
              </TouchableOpacity>
            )}
          </View>
          {/* Status badge — only visible to the uploader */}
          {myStatus && (
            <View style={[styles.myUploadBadge, { backgroundColor: myStatus.bg }]}>
              <Feather name={myStatus.icon} size={11} color={myStatus.color} />
              <Text style={[styles.myUploadBadgeText, { color: myStatus.color }]}>
                {myStatus.label}
              </Text>
            </View>
          )}
        </View>
      </Card>
    );
  };

  const renderTextbook = ({ item }) => (
    <Card style={styles.textbookCard}>
      <View style={styles.textbookIcon}>
        <Feather name="book" size={24} color={colors.brand.primary} />
      </View>
      <View style={styles.textbookContent}>
        <Text style={styles.textbookTitle}>{item.title}</Text>
        <Text style={styles.textbookAuthor}>{item.author}</Text>
        <View style={styles.textbookMeta}>
          <View style={styles.textbookTypeBadge}>
            <Text style={styles.textbookTypeText}>{item.type}</Text>
          </View>
          <Text style={styles.textbookEdition}>{item.edition}</Text>
        </View>
      </View>
    </Card>
  );

  const renderQuestionsTab = () => {
    const activeFilterCount =
      (selectedSession !== 'all' ? 1 : 0) + (selectedType !== 'all' ? 1 : 0);
    const filterLabel = [
      selectedType !== 'all' ? (selectedType === 'Exam' ? 'Exams' : 'Tests') : 'All Types',
      selectedSession !== 'all' ? selectedSession : 'All Sessions',
    ].join(' · ');

    return (
    <View style={styles.tabContent}>
      {/* Compact filter bar */}
      <View style={styles.filterBar}>
        <Text style={styles.filterBarLabel} numberOfLines={1}>{filterLabel}</Text>
        <TouchableOpacity
          style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
          onPress={() => setShowFilterModal(true)}
        >
          <Feather name="sliders" size={15} color={activeFilterCount > 0 ? colors.brand.primary : colors.text.muted} />
          <Text style={[styles.filterBtnText, activeFilterCount > 0 && { color: colors.brand.primary }]}>
            Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Questions List */}
      {isLoadingQuestions ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brand.secondary} />
          <Text style={styles.loadingText}>Loading questions...</Text>
        </View>
      ) : filteredQuestions.length > 0 ? (
        <FlatList
          data={filteredQuestions}
          renderItem={renderQuestion}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState
          icon="file-text"
          title="No questions found"
          message="No past questions match your filters."
        />
      )}
    </View>
    );
  };

  const renderMaterialsTab = () => (
    <View style={styles.tabContent}>
      {isLoadingTextbooks ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brand.secondary} />
          <Text style={styles.loadingText}>Loading materials...</Text>
        </View>
      ) : textbooks.length > 0 ? (
        <FlatList
          data={textbooks}
          renderItem={renderTextbook}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState
          icon="book-open"
          title="No materials yet"
          message={`No recommended materials for ${courseCode} have been added.`}
        />
      )}
    </View>
  );

  const renderPdfsTab = () => (
    <View style={[styles.tabContent, styles.pdfContainer]}>
      <View style={styles.pdfHeader}>
        <Text style={styles.pdfTitle}>Course PDFs</Text>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handlePdfUpload}
          disabled={pdfUploading}
        >
          {pdfUploading ? (
            <ActivityIndicator size="small" color={colors.brand.secondary} />
          ) : (
            <>
              <Feather name="upload" size={16} color={colors.brand.secondary} />
              <Text style={styles.uploadButtonText}>Upload PDF</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {uploadedPdfs.length > 0 ? (
        <FlatList
          data={uploadedPdfs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.pdfItem}
              onPress={() => openPdf(item)}
              activeOpacity={0.7}
            >
              <View style={styles.pdfIcon}>
                <Feather name="file-text" size={24} color={colors.brand.error} />
              </View>
              <View style={styles.pdfInfo}>
                <Text style={styles.pdfName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.pdfMeta}>
                  {formatFileSize(item.size)} • {new Date(item.uploadedAt).toLocaleDateString()}
                </Text>
                <Text style={styles.pdfTapHint}>Tap to open</Text>
              </View>
              <TouchableOpacity
                style={styles.pdfAction}
                onPress={() => handleDeletePdf(item.id)}
              >
                <Feather name="trash-2" size={18} color={colors.brand.error} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.pdfList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyPdfState}>
          <View style={styles.emptyPdfIcon}>
            <Feather name="file-plus" size={48} color={colors.text.muted} />
          </View>
          <Text style={styles.emptyPdfTitle}>No PDFs uploaded</Text>
          <Text style={styles.emptyPdfText}>
            Upload lecture notes, past questions, or study materials as PDFs
          </Text>
          <Button
            title="Upload Your First PDF"
            onPress={handlePdfUpload}
            icon="upload"
            style={styles.emptyUploadBtn}
          />
        </View>
      )}
    </View>
  );

  const renderJotTab = () => (
    <View style={[styles.tabContent, styles.notesContainer]}>
      <View style={styles.notesHeader}>
        <Text style={styles.notesTitle}>Quick Notes</Text>
        {lastSaved && (
          <Text style={styles.saveStatus}>
            <Feather name="check" size={12} color={colors.brand.accent} /> Auto-saved
          </Text>
        )}
      </View>
      <TextInput
        style={styles.jotInput}
        multiline
        placeholder="Jot down quick thoughts here..."
        placeholderTextColor={colors.text.inactive}
        value={jot}
        onChangeText={setJot}
        textAlignVertical="top"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{courseCode}</Text>
            <Text style={styles.headerSubtitle}>
              {isLoadingQuestions ? 'Loading...' : `${questions.length} question${questions.length !== 1 ? 's' : ''}`}
            </Text>
          </View>
          <TouchableOpacity style={styles.backBtn} onPress={handleShareCourse}>
            <Feather name="share-2" size={20} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {TABS.map((tab, index) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === index && styles.tabActive]}
              onPress={() => setActiveTab(index)}
            >
              <Text style={[styles.tabText, activeTab === index && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === 0 && renderQuestionsTab()}
        {activeTab === 1 && renderMaterialsTab()}
        {activeTab === 2 && renderPdfsTab()}
        {activeTab === 3 && renderJotTab()}

        {/* Upload shortcuts bar — shown on Questions and Materials tabs */}
        {(activeTab === 0 || activeTab === 1) && (
          <View style={styles.uploadBar}>
            <TouchableOpacity
              style={styles.uploadBarBtn}
              onPress={() => router.push({ pathname: '/upload/question', params: { courseCode, courseName: courseCode } })}
            >
              <Feather name="upload" size={15} color={colors.brand.secondary} />
              <Text style={styles.uploadBarBtnText}>Upload Past Question</Text>
            </TouchableOpacity>
            <View style={styles.uploadBarDivider} />
            <TouchableOpacity
              style={styles.uploadBarBtn}
              onPress={() => router.push({ pathname: '/upload/textbook', params: { courseCode } })}
            >
              <Feather name="book" size={15} color={colors.brand.accent} />
              <Text style={[styles.uploadBarBtnText, { color: colors.brand.accent }]}>Upload Material</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Floating AI Button - Only on Questions tab */}
        {activeTab === 0 && (
          <TouchableOpacity
            style={styles.floatingAIButton}
            onPress={() => setShowAISheet(true)}
            activeOpacity={0.8}
          >
            <Feather name="cpu" size={24} color={colors.background.primary} />
          </TouchableOpacity>
        )}

        {/* Filter Modal */}
        <Modal
          visible={showFilterModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowFilterModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowFilterModal(false)}
          >
            <View style={styles.filterModal}>
              <View style={styles.bottomSheetHandle} />
              <View style={styles.filterModalHeader}>
                <Text style={styles.bottomSheetTitle}>Filter Questions</Text>
                {(selectedSession !== 'all' || selectedType !== 'all') && (
                  <TouchableOpacity onPress={() => { setSelectedSession('all'); setSelectedType('all'); }}>
                    <Text style={{ fontSize: SIZES.sm, color: colors.brand.primary, ...FONTS.medium }}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.filterSectionLabel}>Academic Session</Text>
              <TouchableOpacity
                style={[styles.filterOption, selectedSession === 'all' && styles.filterOptionActive]}
                onPress={() => setSelectedSession('all')}
              >
                <Text style={[styles.filterOptionText, selectedSession === 'all' && styles.filterOptionTextActive]}>All Sessions</Text>
                {selectedSession === 'all' && <Feather name="check" size={16} color={colors.brand.primary} />}
              </TouchableOpacity>
              {sessions.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.filterOption, selectedSession === s && styles.filterOptionActive]}
                  onPress={() => { setSelectedSession(s); setShowFilterModal(false); }}
                >
                  <Text style={[styles.filterOptionText, selectedSession === s && styles.filterOptionTextActive]}>{s}</Text>
                  {selectedSession === s && <Feather name="check" size={16} color={colors.brand.primary} />}
                </TouchableOpacity>
              ))}

              <Text style={[styles.filterSectionLabel, { marginTop: 16 }]}>Question Type</Text>
              {[['all', 'All Types'], ['Exam', 'Exams Only'], ['Test', 'Tests Only']].map(([val, label]) => (
                <TouchableOpacity
                  key={val}
                  style={[styles.filterOption, selectedType === val && styles.filterOptionActive]}
                  onPress={() => { setSelectedType(val); setShowFilterModal(false); }}
                >
                  <Text style={[styles.filterOptionText, selectedType === val && styles.filterOptionTextActive]}>{label}</Text>
                  {selectedType === val && <Feather name="check" size={16} color={colors.brand.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* AI Bottom Sheet */}
        <Modal
          visible={showAISheet}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAISheet(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowAISheet(false)}
          >
            <View style={styles.bottomSheet}>
              <View style={styles.bottomSheetHandle} />
              <Text style={styles.bottomSheetTitle}>AI Study Assistant</Text>

              <TouchableOpacity
                style={styles.aiAction}
                onPress={() => handleAIAction('summarize')}
              >
                <View style={styles.aiActionIcon}>
                  <Feather name="file-text" size={20} color={colors.brand.secondary} />
                </View>
                <View style={styles.aiActionContent}>
                  <Text style={styles.aiActionTitle}>Summarize Questions</Text>
                  <Text style={styles.aiActionDesc}>Get a summary of all past questions</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.aiAction, selectedQuestions.length === 0 && styles.aiActionDisabled]}
                onPress={() => handleAIAction('solve')}
                disabled={selectedQuestions.length === 0}
              >
                <View style={styles.aiActionIcon}>
                  <Feather name="edit-3" size={20} color={colors.brand.secondary} />
                </View>
                <View style={styles.aiActionContent}>
                  <Text style={styles.aiActionTitle}>Solve Selected</Text>
                  <Text style={styles.aiActionDesc}>
                    {selectedQuestions.length > 0
                      ? `Solve ${selectedQuestions.length} selected question(s)`
                      : 'Select questions first'}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.aiAction}
                onPress={() => handleAIAction('explain')}
              >
                <View style={styles.aiActionIcon}>
                  <Feather name="book-open" size={20} color={colors.brand.secondary} />
                </View>
                <View style={styles.aiActionContent}>
                  <Text style={styles.aiActionTitle}>Explain Concepts</Text>
                  <Text style={styles.aiActionDesc}>Understand key topics from this course</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.aiAction}
                onPress={() => handleAIAction('quiz')}
              >
                <View style={styles.aiActionIcon}>
                  <Feather name="help-circle" size={20} color={colors.brand.secondary} />
                </View>
                <View style={styles.aiActionContent}>
                  <Text style={styles.aiActionTitle}>Generate Quiz</Text>
                  <Text style={styles.aiActionDesc}>Practice with AI-generated questions</Text>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* AI Response Modal */}
        <Modal
          visible={!!aiResponse || aiLoading}
          transparent
          animationType="fade"
          onRequestClose={() => setAiResponse(null)}
        >
          <View style={styles.aiResponseOverlay}>
            <View style={styles.aiResponseModal}>
              <View style={styles.aiResponseHeader}>
                <Text style={styles.aiResponseTitle}>AI Response</Text>
                <TouchableOpacity onPress={() => setAiResponse(null)}>
                  <Feather name="x" size={24} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
              {aiLoading ? (
                <View style={styles.aiLoading}>
                  <Feather name="cpu" size={32} color={colors.brand.secondary} />
                  <Text style={styles.aiLoadingText}>Thinking...</Text>
                </View>
              ) : (
                <ScrollView style={styles.aiResponseContent}>
                  <Text style={styles.aiResponseText}>{aiResponse}</Text>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.lg,
    color: colors.text.primary,
    ...FONTS.bold,
  },
  headerSubtitle: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginTop: 2,
    ...FONTS.regular,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    paddingHorizontal: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.brand.secondary,
  },
  tabText: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    ...FONTS.medium,
  },
  tabTextActive: {
    color: colors.brand.secondary,
    ...FONTS.semibold,
  },
  tabContent: {
    flex: 1,
  },
  // Compact filter bar
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background.secondary,
  },
  filterBarLabel: {
    flex: 1,
    fontSize: SIZES.sm,
    color: colors.text.muted,
    ...FONTS.regular,
    marginRight: 8,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: SIZES.radiusSm,
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterBtnActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.tint.primary,
  },
  filterBtnText: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    ...FONTS.medium,
  },
  // Filter modal
  filterModal: {
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: SIZES.radiusLg,
    borderTopRightRadius: SIZES.radiusLg,
    padding: SIZES.padding * 1.5,
    paddingBottom: 32,
    marginTop: 'auto',
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterSectionLabel: {
    fontSize: SIZES.xs,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    ...FONTS.semibold,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: SIZES.radiusSm,
    marginBottom: 4,
  },
  filterOptionActive: {
    backgroundColor: colors.tint.primary,
  },
  filterOptionText: {
    fontSize: SIZES.base,
    color: colors.text.secondary,
    ...FONTS.regular,
  },
  filterOptionTextActive: {
    color: colors.brand.primary,
    ...FONTS.semibold,
  },
  // Upload bar
  uploadBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: SIZES.padding,
  },
  uploadBarBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  uploadBarBtnText: {
    fontSize: SIZES.sm,
    color: colors.brand.secondary,
    ...FONTS.medium,
  },
  uploadBarDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
  },
  listContent: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: SIZES.md,
    color: colors.text.muted,
    marginTop: 12,
    ...FONTS.medium,
  },
  questionCard: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  questionCardSelected: {
    borderColor: colors.brand.secondary,
  },
  questionCardRejected: {
    opacity: 0.7,
  },
  myUploadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 8,
    gap: 4,
  },
  myUploadBadgeText: {
    fontSize: SIZES.xs,
    ...FONTS.semibold,
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  checkboxInner: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.brand.secondary,
    borderColor: colors.brand.secondary,
  },
  questionContent: {
    flex: 1,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  examBadge: {
    backgroundColor: colors.tint.primary,
  },
  testBadge: {
    backgroundColor: colors.tint.secondary,
  },
  typeText: {
    fontSize: SIZES.sm,
    ...FONTS.semibold,
  },
  examText: {
    color: colors.brand.primary,
  },
  testText: {
    color: colors.brand.secondary,
  },
  session: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    ...FONTS.medium,
  },
  questionTitle: {
    fontSize: SIZES.base,
    color: colors.text.primary,
    marginBottom: 10,
    ...FONTS.medium,
  },
  questionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginLeft: 4,
    ...FONTS.regular,
  },
  viewDocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: colors.tint.primary,
    marginLeft: 'auto',
  },
  viewDocText: {
    fontSize: SIZES.xs,
    color: colors.brand.primary,
    ...FONTS.semibold,
  },
  textbookCard: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  textbookIcon: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textbookContent: {
    flex: 1,
  },
  textbookTitle: {
    fontSize: SIZES.base,
    color: colors.text.primary,
    ...FONTS.semibold,
  },
  textbookAuthor: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginTop: 2,
    ...FONTS.regular,
  },
  textbookMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  textbookTypeBadge: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  textbookTypeText: {
    fontSize: SIZES.xs,
    color: colors.brand.secondary,
    ...FONTS.medium,
  },
  textbookEdition: {
    fontSize: SIZES.xs,
    color: colors.text.muted,
    ...FONTS.regular,
  },
  // PDF Tab Styles
  pdfContainer: {
    padding: SIZES.padding,
  },
  pdfHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pdfTitle: {
    fontSize: SIZES.lg,
    color: colors.text.primary,
    ...FONTS.semibold,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.tint.secondary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  uploadButtonText: {
    fontSize: SIZES.sm,
    color: colors.brand.secondary,
    marginLeft: 6,
    ...FONTS.medium,
  },
  pdfList: {
    paddingBottom: 20,
  },
  pdfItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    padding: 14,
    borderRadius: SIZES.radius,
    marginBottom: 10,
  },
  pdfIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.tint.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pdfInfo: {
    flex: 1,
  },
  pdfName: {
    fontSize: SIZES.base,
    color: colors.text.primary,
    ...FONTS.medium,
  },
  pdfMeta: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginTop: 2,
    ...FONTS.regular,
  },
  pdfTapHint: {
    fontSize: SIZES.xs,
    color: colors.brand.secondary,
    marginTop: 2,
    ...FONTS.medium,
  },
  pdfAction: {
    padding: 8,
  },
  emptyPdfState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyPdfIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyPdfTitle: {
    fontSize: SIZES.lg,
    color: colors.text.primary,
    marginBottom: 8,
    ...FONTS.semibold,
  },
  emptyPdfText: {
    fontSize: SIZES.md,
    color: colors.text.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    ...FONTS.regular,
  },
  emptyUploadBtn: {
    paddingHorizontal: 24,
  },
  // Jot Tab Styles
  notesContainer: {
    padding: SIZES.padding,
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  notesTitle: {
    fontSize: SIZES.lg,
    color: colors.text.primary,
    ...FONTS.semibold,
  },
  saveStatus: {
    fontSize: SIZES.sm,
    color: colors.brand.accent,
    ...FONTS.medium,
  },
  jotInput: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    fontSize: SIZES.base,
    color: colors.text.primary,
    lineHeight: 24,
    ...FONTS.regular,
  },
  floatingAIButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
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
  aiAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background.tertiary,
    borderRadius: SIZES.radius,
    marginBottom: 12,
  },
  aiActionDisabled: {
    opacity: 0.5,
  },
  aiActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.tint.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  aiActionContent: {
    flex: 1,
  },
  aiActionTitle: {
    fontSize: SIZES.base,
    color: colors.text.primary,
    ...FONTS.semibold,
  },
  aiActionDesc: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    marginTop: 2,
    ...FONTS.regular,
  },
  aiResponseOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  aiResponseModal: {
    backgroundColor: colors.background.secondary,
    borderRadius: SIZES.radius,
    width: '100%',
    maxHeight: '80%',
  },
  aiResponseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  aiResponseTitle: {
    fontSize: SIZES.lg,
    color: colors.text.primary,
    ...FONTS.bold,
  },
  aiLoading: {
    padding: 40,
    alignItems: 'center',
  },
  aiLoadingText: {
    fontSize: SIZES.md,
    color: colors.text.muted,
    marginTop: 12,
    ...FONTS.medium,
  },
  aiResponseContent: {
    padding: SIZES.padding,
    maxHeight: 400,
  },
  aiResponseText: {
    fontSize: SIZES.md,
    color: colors.text.secondary,
    lineHeight: 24,
    ...FONTS.regular,
  },
});
