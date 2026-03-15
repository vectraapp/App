import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

export default function AIChatScreen() {
  const { lectureId, topic, action } = useLocalSearchParams();
  const router = useRouter();
  const flatListRef = useRef(null);
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const initialMessages = [
      {
        id: 'sys_1',
        role: 'assistant',
        content: `I am your AI study assistant for "${topic || 'this lecture'}". How can I help you study?`,
      },
    ];

    if (action && topic) {
      setMessages(initialMessages);
      handleAutoAction(action, topic);
    } else if (lectureId) {
      // Load existing chat history from server for lecture-specific chats
      setMessages(initialMessages);
      loadChatHistory(initialMessages);
    } else {
      setMessages(initialMessages);
    }
  }, []);

  const loadChatHistory = async (initialMessages) => {
    try {
      const response = await api.getChatHistory(lectureId);
      const historyData = response.data || [];
      if (historyData.length > 0) {
        const historyMessages = historyData.map((h) => ({
          id: h.id,
          role: h.role,
          content: h.message,
        }));
        setMessages([...initialMessages, ...historyMessages]);
      }
    } catch {
      // Silently fail — start fresh if history can't be loaded
    }
  };

  const handleAutoAction = async (actionType, topicName) => {
    setIsTyping(true);
    try {
      let prompt;
      if (actionType === 'recap') prompt = `Give me a recap of the lecture: ${topicName}`;
      else if (actionType === 'explain') prompt = `Explain the key concepts from: ${topicName}`;
      else if (actionType === 'quiz') prompt = `Generate a quiz based on: ${topicName}`;
      else if (actionType === 'flashcards') prompt = `Create flashcards for: ${topicName}`;
      else prompt = `Help me study: ${topicName}`;

      const response = await api.chatWithAI(lectureId || null, prompt);
      const content = response.data?.response || response.data?.message || 'I can help you study this topic. What would you like to know?';
      setMessages((prev) => [...prev, { id: `auto_${Date.now()}`, role: 'assistant', content }]);
    } catch (err) {
      setMessages((prev) => [...prev, { id: `auto_${Date.now()}`, role: 'assistant', content: 'I am ready to help you study. What would you like to know?' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    Alert.alert(
      'Clear Chat History',
      'This will permanently delete all messages in this chat. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              if (lectureId) {
                await api.clearChatHistory(lectureId);
              }
              setMessages([
                {
                  id: 'sys_1',
                  role: 'assistant',
                  content: `I am your AI study assistant for "${topic || 'this lecture'}". How can I help you study?`,
                },
              ]);
            } catch (err) {
              Alert.alert('Error', 'Could not clear chat history. Please try again.');
            }
          },
        },
      ]
    );
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageText = input.trim();
    setInput('');
    setIsTyping(true);

    try {
      // Build conversation history to send (skip system greeting, map to {role, content})
      const history = messages
        .filter((m) => m.id !== 'sys_1')
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await api.chatWithAI(lectureId || null, messageText, history);
      const content = response.data?.message || response.data?.response || 'I apologize, I could not generate a response. Please try again.';
      setMessages((prev) => [...prev, { id: `ai_${Date.now()}`, role: 'assistant', content }]);
    } catch (err) {
      setMessages((prev) => [...prev, { id: `ai_${Date.now()}`, role: 'assistant', content: `Sorry, I encountered an error: ${err.message}. Please try again.` }]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
        {!isUser ? (
          <View style={styles.aiAvatar}>
            <Feather name="cpu" size={14} color={colors.brand.secondary} />
          </View>
        ) : null}
        <View style={[styles.messageContent, isUser ? styles.userContent : styles.aiContent]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>AI Assistant</Text>
            <Text style={styles.headerSubtitle}>{topic || 'Study Chat'}</Text>
          </View>
          <TouchableOpacity onPress={handleClearChat} style={styles.clearBtn}>
            <Feather name="trash-2" size={18} color={colors.text.muted} />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Typing Indicator */}
        {isTyping ? (
          <View style={styles.typingContainer}>
            <Text style={styles.typingText}>AI is thinking...</Text>
          </View>
        ) : null}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Ask a question..."
            placeholderTextColor={colors.text.muted}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!input.trim()}
          >
            <Feather name="send" size={18} color={input.trim() ? colors.white : colors.text.muted} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.primary,
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
    marginTop: 1,
    ...FONTS.regular,
  },
  messagesList: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  userBubble: {
    justifyContent: 'flex-end',
  },
  aiBubble: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.tint.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  messageContent: {
    maxWidth: '80%',
    borderRadius: SIZES.radius,
    padding: 12,
  },
  userContent: {
    backgroundColor: colors.brand.primary,
    borderBottomRightRadius: 4,
    marginLeft: 'auto',
  },
  aiContent: {
    backgroundColor: colors.background.secondary,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: SIZES.md,
    lineHeight: 20,
    ...FONTS.regular,
  },
  userText: {
    color: colors.white,
  },
  aiText: {
    color: colors.text.primary,
  },
  typingContainer: {
    paddingHorizontal: SIZES.padding * 1.5,
    paddingVertical: 8,
  },
  typingText: {
    fontSize: SIZES.sm,
    color: colors.text.muted,
    fontStyle: 'italic',
    ...FONTS.regular,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 10,
    backgroundColor: colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.background.primary,
    borderRadius: SIZES.radiusLg,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: SIZES.md,
    color: colors.text.primary,
    maxHeight: 100,
    marginRight: 8,
    ...FONTS.regular,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: colors.border,
  },
});
