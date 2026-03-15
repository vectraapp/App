import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

const POLL_INTERVAL = 4000; // 4 seconds

export default function GroupChatScreen() {
  const { id, name } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const flatListRef = useRef(null);
  const pollRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [group, setGroup] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Load group details + initial messages
  useEffect(() => {
    loadGroup();
    loadMessages(true);
    // Start polling for new messages
    pollRef.current = setInterval(() => loadMessages(false), POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [id]);

  const loadGroup = async () => {
    try {
      const response = await api.getGroup(id);
      setGroup(response.data);
    } catch {
      // Non-critical
    }
  };

  const loadMessages = useCallback(async (initial = false) => {
    try {
      const response = await api.getGroupMessages(id, { limit: 60 });
      const newMessages = response.data || [];
      setMessages((prev) => {
        // Only update if there are new messages (avoid re-render on same data)
        if (initial) return newMessages;
        if (newMessages.length !== prev.length) return newMessages;
        const lastNew = newMessages[newMessages.length - 1];
        const lastPrev = prev[prev.length - 1];
        if (lastNew?.id !== lastPrev?.id) return newMessages;
        return prev;
      });
    } catch {
      // Silently fail on poll errors
    } finally {
      if (initial) setLoading(false);
    }
  }, [id]);

  // Scroll to end when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);

    // Optimistic update
    const tempId = `temp_${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      content: text,
      is_mine: true,
      created_at: new Date().toISOString(),
      display_name: 'You',
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const response = await api.sendGroupMessage(id, text);
      // Replace optimistic message with real one
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? response.data : m))
      );
    } catch {
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setInput(text); // Restore input
    } finally {
      setSending(false);
    }
  };

  const handleShareInvite = async () => {
    if (!group?.invite_code) return;
    try {
      const deepLink = `vectra://groups/join?code=${group.invite_code}`;
      await Share.share({
        message: `Join my study group "${group.name}" on Vectra!\n\nInvite code: ${group.invite_code}\nOr tap: ${deepLink}`,
      });
    } catch {
      // User cancelled
    }
  };

  const handleLeave = () => {
    Alert.alert(
      'Leave Group',
      `Are you sure you want to leave "${group?.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.leaveGroup(id);
              router.back();
            } catch (err) {
              Alert.alert('Error', err.message || 'Could not leave group');
            }
          },
        },
      ]
    );
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  // Group messages by date for date separators
  const messagesWithSeparators = React.useMemo(() => {
    const result = [];
    let lastDate = null;
    messages.forEach((msg) => {
      const date = msg.created_at ? new Date(msg.created_at).toDateString() : null;
      if (date && date !== lastDate) {
        result.push({ id: `sep_${date}`, type: 'separator', label: formatDate(msg.created_at) });
        lastDate = date;
      }
      result.push({ ...msg, type: 'message' });
    });
    return result;
  }, [messages]);

  const renderItem = ({ item }) => {
    if (item.type === 'separator') {
      return (
        <View style={styles.dateSeparator}>
          <View style={styles.dateLine} />
          <Text style={styles.dateLabel}>{item.label}</Text>
          <View style={styles.dateLine} />
        </View>
      );
    }

    const isMe = item.is_mine;
    return (
      <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
        {!isMe ? (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.display_name?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
        ) : null}

        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          {!isMe ? (
            <Text style={styles.senderName}>{item.display_name}</Text>
          ) : null}
          <Text style={[styles.msgText, isMe ? styles.msgTextMe : styles.msgTextThem]}>
            {item.content}
          </Text>
          <Text style={[styles.msgTime, isMe ? styles.msgTimeMe : styles.msgTimeThem]}>
            {formatTime(item.created_at)}
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

          <TouchableOpacity style={styles.headerCenter} onPress={() => setShowInfo(!showInfo)}>
            <Text style={styles.groupName} numberOfLines={1}>{name || group?.name}</Text>
            <Text style={styles.groupSub}>{group?.course_code} · {group?.member_count || '—'} members</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerBtn} onPress={handleShareInvite}>
            <Feather name="user-plus" size={20} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Group info panel */}
        {showInfo ? (
          <View style={[styles.infoPanel, { backgroundColor: colors.background.secondary }]}>
            <View style={styles.infoPanelRow}>
              <View style={styles.inviteCodeBox}>
                <Text style={styles.inviteLabel}>Invite Code</Text>
                <Text style={styles.inviteCode}>{group?.invite_code || '—'}</Text>
              </View>
              <TouchableOpacity style={styles.shareCodeBtn} onPress={handleShareInvite}>
                <Feather name="share-2" size={16} color={colors.brand.primary} />
                <Text style={styles.shareCodeText}>Share</Text>
              </TouchableOpacity>
            </View>
            {group?.description ? (
              <Text style={styles.groupDesc}>{group.description}</Text>
            ) : null}
            <TouchableOpacity style={styles.leaveBtn} onPress={handleLeave}>
              <Feather name="log-out" size={14} color={colors.brand.error} />
              <Text style={styles.leaveBtnText}>Leave Group</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Messages */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.brand.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messagesWithSeparators}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <Feather name="message-circle" size={36} color={colors.text.inactive} />
                <Text style={styles.emptyChatTitle}>No messages yet</Text>
                <Text style={styles.emptyChatSub}>
                  Be the first to say something!
                </Text>
              </View>
            }
          />
        )}

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Message..."
            placeholderTextColor={colors.text.muted}
            multiline
            maxLength={1000}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Feather name="send" size={18} color={input.trim() ? colors.white : colors.text.muted} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.primary },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  headerCenter: { flex: 1 },
  groupName: { fontSize: SIZES.base, color: colors.text.primary, ...FONTS.bold },
  groupSub: { fontSize: SIZES.xs, color: colors.text.muted, ...FONTS.regular, marginTop: 1 },
  headerBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  infoPanel: {
    paddingHorizontal: SIZES.padding * 1.5,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  },
  infoPanelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  inviteCodeBox: {},
  inviteLabel: { fontSize: SIZES.xs, color: colors.text.muted, ...FONTS.regular },
  inviteCode: { fontSize: SIZES.lg, color: colors.text.primary, ...FONTS.bold, letterSpacing: 2 },
  shareCodeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: colors.tint.primary, borderRadius: SIZES.radius,
  },
  shareCodeText: { fontSize: SIZES.sm, color: colors.brand.primary, ...FONTS.semibold },
  groupDesc: { fontSize: SIZES.sm, color: colors.text.secondary, ...FONTS.regular },
  leaveBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 4, alignSelf: 'flex-start',
  },
  leaveBtnText: { fontSize: SIZES.sm, color: colors.brand.error, ...FONTS.medium },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  messagesList: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 8 },
  emptyChat: { flex: 1, alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyChatTitle: { fontSize: SIZES.base, color: colors.text.secondary, ...FONTS.semibold },
  emptyChatSub: { fontSize: SIZES.sm, color: colors.text.muted, ...FONTS.regular },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    gap: 8,
  },
  dateLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dateLabel: {
    fontSize: SIZES.xs, color: colors.text.muted,
    paddingHorizontal: 4, ...FONTS.regular,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-end',
    gap: 6,
  },
  msgRowMe: { justifyContent: 'flex-end' },
  avatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.tint.primary,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 2,
  },
  avatarText: { fontSize: SIZES.xs, color: colors.brand.primary, ...FONTS.bold },
  bubble: {
    maxWidth: '75%',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubbleMe: {
    backgroundColor: colors.brand.primary,
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: colors.background.secondary,
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: SIZES.xs,
    color: colors.brand.primary,
    marginBottom: 2,
    ...FONTS.semibold,
  },
  msgText: { fontSize: SIZES.base, lineHeight: 20, ...FONTS.regular },
  msgTextMe: { color: colors.white },
  msgTextThem: { color: colors.text.primary },
  msgTime: { fontSize: 10, marginTop: 3, ...FONTS.regular },
  msgTimeMe: { color: 'rgba(255,255,255,0.65)', textAlign: 'right' },
  msgTimeThem: { color: colors.text.inactive },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 10,
    backgroundColor: colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.background.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: SIZES.base,
    color: colors.text.primary,
    maxHeight: 100,
    ...FONTS.regular,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.brand.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: colors.border },
});
