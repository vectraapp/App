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
import { delay, DUMMY_AI_MESSAGES } from '../../services/dummyData';

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
      // Seed with dummy chat history
      setMessages([...initialMessages, ...DUMMY_AI_MESSAGES]);
    } else {
      setMessages(initialMessages);
    }
  }, []);

  const handleAutoAction = async (actionType, topicName) => {
    setIsTyping(true);
    try {
      await delay(1200);
      let content;
      if (actionType === 'recap') content = `Here's a quick recap of **${topicName}**:\n\n• Key concepts were introduced and explained with examples.\n• Important definitions and theorems were covered.\n• Practical applications were discussed.\n\nWould you like me to go deeper into any specific part?`;
      else if (actionType === 'explain') content = `Let me explain the key concepts from **${topicName}** in simple terms:\n\nThe main ideas revolve around understanding the fundamental principles and how they apply in practice. The core concept can be broken down into three parts: definition, mechanism, and application.\n\nWhat specific concept would you like me to clarify?`;
      else if (actionType === 'quiz') content = `Here's a quick quiz on **${topicName}**:\n\n**Q1:** What is the primary purpose of the main concept discussed?\n**Q2:** Explain the difference between the two main approaches.\n**Q3:** Give an example of how this is applied in a real scenario.\n\nTake your time to answer each question, then I'll give you feedback!`;
      else if (actionType === 'flashcards') content = `Here are flashcards for **${topicName}**:\n\n**Card 1:**\nFront: What is [Key Term 1]?\nBack: [Key Term 1] is the process by which...\n\n**Card 2:**\nFront: Name the main types/categories\nBack: Type A, Type B, Type C\n\n**Card 3:**\nFront: What is the significance of [Concept]?\nBack: It is important because...\n\nSay "next" for more flashcards!`;
      else content = 'I am ready to help you study. What would you like to know?';
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
          onPress: () => {
            setMessages([
              {
                id: 'sys_1',
                role: 'assistant',
                content: `I am your AI study assistant for "${topic || 'this lecture'}". How can I help you study?`,
              },
            ]);
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
      await delay(1200);
      const aiResponses = [
        `That's a great question about **${messageText.substring(0, 30)}...**\n\nBased on the material covered, the key thing to understand is that this concept builds on fundamental principles. Let me break it down:\n\n1. First, consider the basic definition\n2. Then look at how it's applied\n3. Finally, understand the edge cases\n\nWould you like me to elaborate on any of these points?`,
        `Excellent question! Here's what you need to know:\n\nThe concept you're asking about is central to understanding this topic. In simple terms, it works by taking an input, processing it according to defined rules, and producing an output.\n\nFor your exam, remember: the key formula/algorithm is what professors love to test on!`,
        `Let me explain this clearly:\n\nThis is one of the most commonly tested topics in past exams. The main point is that you need to understand both the theory AND the practical application.\n\nHere's a memory trick: think of it as [PROCESS → OUTPUT → VERIFICATION]\n\nDoes that help clarify things?`,
        `Good question! This comes up a lot in past questions.\n\nThe short answer is: it depends on the context. In scenario A, you would apply method X. In scenario B, method Y is more appropriate.\n\nThe distinction examiners look for is whether you understand WHY each approach is used, not just HOW.`,
      ];
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      setMessages((prev) => [...prev, { id: `ai_${Date.now()}`, role: 'assistant', content: randomResponse }]);
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
