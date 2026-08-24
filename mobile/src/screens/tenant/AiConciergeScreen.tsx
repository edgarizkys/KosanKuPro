import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS, SPACING, FONTS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  '📶 Apa password WiFi kos?',
  '💳 Bagaimana cara bayar sewa?',
  '📜 Aturan jam malam & tamu',
  '🛠️ Cara buat tiket perbaikan',
];

export const AiConciergeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Halo ${user?.name || 'Penyewa'}! Saya Concierge AI KosanKu Pro 🤖✨. Ada yang bisa saya bantu terkait hunian kos, fasilitas, pembayaran, atau perbaikan hari ini?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input.trim();
    if (!text) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let aiResponseText =
        'Terima kasih atas pertanyaan Anda. Informasi ini telah diproses oleh AI KosanKu. Apakah ada hal lain yang ingin Anda ketahui?';

      const lower = text.toLowerCase();
      if (lower.includes('wifi') || lower.includes('password')) {
        aiResponseText =
          '📶 **WiFi KosanKu Pro**:\nSSID: KosanKu_HighSpeed_5G\nPassword: `kosankusuperfast2026`\nKecepatan simetris 100Mbps dengan backup fiber second line.';
      } else if (lower.includes('bayar') || lower.includes('sewa') || lower.includes('tagihan')) {
        aiResponseText =
          '💳 **Pembayaran Sewa**:\nAnda dapat membayar langsung via menu **Bayar Sekarang** di beranda aplikasi (mendukung QRIS, GoPay, OVO, & Transfer Bank BCA/Mandiri via Midtrans). Notifikasi & kuitansi WA akan otomatis terkirim!';
      } else if (lower.includes('aturan') || lower.includes('jam malam') || lower.includes('tamu')) {
        aiResponseText =
          '📜 **Aturan KosanKu Pro**:\n1. Jam malam bertamu s/d pukul 22:00 WIB.\n2. Tamu menginap harap melapor ke pengelola via aplikasi.\n3. Akses Smart Lock gerbang utama aktif 24 jam dengan fingerprint/NFC.';
      } else if (lower.includes('rusak') || lower.includes('perbaikan') || lower.includes('tiket')) {
        aiResponseText =
          '🛠️ **Laporan Kerusakan**:\nSilakan buka tab **Laporan** di menu bawah untuk mengisi formulir komplain (AC bocor, lampu mati, dll). Tim teknisi kami akan merespons dalam 1x24 jam!';
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={styles.aiAvatar}>
              <Text style={{ fontSize: 18 }}>🤖</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>AI Concierge KosanKu</Text>
              <Text style={styles.headerStatus}>● Asisten Aktif 24/7</Text>
            </View>
          </View>
        </View>

        {/* Quick Prompts */}
        <View style={styles.quickPromptsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {QUICK_PROMPTS.map((prompt, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.promptChip}
                onPress={() => handleSend(prompt)}
              >
                <Text style={styles.promptChipText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Message Stream */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                msg.sender === 'user' ? styles.userBubble : styles.aiBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  msg.sender === 'user' ? styles.userMessageText : styles.aiMessageText,
                ]}
              >
                {msg.text}
              </Text>
              <Text style={styles.timestamp}>{msg.timestamp}</Text>
            </View>
          ))}

          {isTyping && (
            <View style={[styles.messageBubble, styles.aiBubble]}>
              <Text style={styles.typingText}>🤖 Concierge sedang mengetik...</Text>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Tanyakan sesuatu ke AI Concierge..."
            placeholderTextColor={COLORS.textSubtle}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => handleSend()}
          />
          <TouchableOpacity style={styles.sendButton} onPress={() => handleSend()}>
            <Text style={styles.sendIcon}>➔</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
  },
  headerStatus: {
    color: COLORS.success,
    fontSize: 10,
    fontWeight: '600',
  },
  quickPromptsWrapper: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  promptChip: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: 4,
  },
  promptChipText: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '500',
  },
  messagesContainer: {
    padding: SPACING.md,
  },
  messageBubble: {
    maxWidth: '82%',
    padding: SPACING.md,
    borderRadius: 16,
    marginBottom: SPACING.sm,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.accent,
    borderBottomRightRadius: 2,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: FONTS.sizes.sm,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#000',
    fontWeight: '500',
  },
  aiMessageText: {
    color: COLORS.text,
  },
  timestamp: {
    fontSize: 9,
    color: COLORS.textSubtle,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  typingText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    color: COLORS.text,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: FONTS.sizes.sm,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  sendIcon: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
