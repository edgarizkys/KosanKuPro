import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS, SPACING, FONTS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  onFinishOnboarding: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onFinishOnboarding,
}) => {
  const { login } = useAuth();
  const [showAuthDrawer, setShowAuthDrawer] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Animated values
  const floatAnim = useRef(new Animated.Value(0)).current;
  const drawerY = useRef(new Animated.Value(0)).current;
  const fadeOnboarding = useRef(new Animated.Value(1)).current;
  const fadeAuth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 3D Mascot Floating Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -14,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleOpenAuth = () => {
    setShowAuthDrawer(true);
    fadeAuth.setValue(1);
    Animated.parallel([
      Animated.timing(fadeOnboarding, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.spring(drawerY, {
        toValue: -10,
        friction: 7,
        tension: 40,
        useNativeDriver: false,
      }),
      Animated.timing(fadeAuth, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleBackToOnboarding = () => {
    Animated.parallel([
      Animated.timing(fadeAuth, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.spring(drawerY, {
        toValue: 0,
        friction: 7,
        tension: 40,
        useNativeDriver: false,
      }),
      Animated.timing(fadeOnboarding, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(() => setShowAuthDrawer(false));
  };

  const handleLoginSubmit = async (role: 'TENANT' | 'LANDLORD' = 'TENANT') => {
    if (role === 'LANDLORD') {
      await login('admin@kosanku.com', 'LANDLORD');
    } else {
      await login(email || 'budi@kosanku.com', 'TENANT');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0D14" />

      {/* Top Section — 3D Floating Mascot Character */}
      <View style={styles.topSection}>
        {/* Glow Spheres */}
        <View style={styles.glowSphere} />

        <Animated.View
          style={[
            styles.mascotWrapper,
            {
              transform: [{ translateY: floatAnim }],
            },
          ]}
        >
          <View style={styles.mascotImageCard}>
            <Image
              source={require('../../../assets/kosanku_3d_mascot.jpg')}
              style={styles.mascotImage}
              resizeMode="cover"
            />
          </View>
        </Animated.View>
      </View>

      {/* Bottom Section — Sliding Sheet Card */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.bottomSection}
      >
        <Animated.View
          style={[
            styles.bottomCard,
            {
              transform: [{ translateY: drawerY }],
            },
          ]}
        >
          {!showAuthDrawer ? (
            /* STATE 1: ONBOARDING HERO TEXT & CTA */
            <Animated.View style={{ opacity: fadeOnboarding }}>
              <View style={styles.badgeRow}>
                <Text style={styles.badgeText}>✨ SMART HOUSING 2026</Text>
              </View>

              <Text style={styles.heroTitle}>
                Kelola & Cari Kosan {'\n'}
                <Text style={styles.heroTitleHighlight}>Lebih Praktis 🔑</Text>
              </Text>

              <Text style={styles.heroSub}>
                Sewa kamar favoritmu, bayar otomatis via Midtrans, dan nikmati layanan AI Concierge 24 jam.
              </Text>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleOpenAuth}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>Mulai Sekarang 🔥</Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            /* STATE 2: SLIDING AUTH FORM (Email, Password, Social Login) */
            <Animated.View style={{ opacity: fadeAuth }}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={handleBackToOnboarding}
              >
                <Text style={styles.backBtnText}>← Kembali ke Informasi</Text>
              </TouchableOpacity>

              <Text style={styles.formTitle}>Selamat Datang Kembali 👋</Text>
              <Text style={styles.formSub}>Masuk ke akun KosanKu Pro Anda</Text>

              {/* Input Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email / No. HP</Text>
                <TextInput
                  style={styles.input}
                  placeholder="budi@kosanku.com"
                  placeholderTextColor={COLORS.textSubtle}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />
              </View>

              {/* Input Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Kata Sandi</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textSubtle}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              {/* Action Login Buttons */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => handleLoginSubmit('TENANT')}
              >
                <Text style={styles.primaryButtonText}>Masuk sebagai Penyewa</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => handleLoginSubmit('LANDLORD')}
              >
                <Text style={styles.secondaryButtonText}>Portal Pengelola (Owner)</Text>
              </TouchableOpacity>

              {/* Social Login Buttons */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>atau masuk dengan</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialRow}>
                <TouchableOpacity
                  style={styles.socialBtn}
                  onPress={() => handleLoginSubmit('TENANT')}
                >
                  <Text style={styles.socialBtnText}>🌐 Google</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.socialBtn}
                  onPress={() => handleLoginSubmit('TENANT')}
                >
                  <Text style={styles.socialBtnText}>💬 Meta WA</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0D14',
  },
  topSection: {
    height: '48%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  glowSphere: {
    position: 'absolute',
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: (width * 0.75) / 2,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  mascotWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotImageCard: {
    width: width * 0.65,
    height: width * 0.65,
    borderRadius: (width * 0.65) / 2,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(245, 158, 11, 0.5)',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.7,
    shadowRadius: 28,
    elevation: 20,
    backgroundColor: COLORS.card,
  },
  mascotImage: {
    width: '100%',
    height: '100%',
  },
  bottomSection: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomCard: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    padding: SPACING.xl,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: '52%',
  },
  badgeRow: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  badgeText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: COLORS.text,
    lineHeight: 36,
  },
  heroTitleHighlight: {
    color: '#F59E0B',
  },
  heroSub: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    lineHeight: 22,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  primaryButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: SPACING.sm,
  },
  primaryButtonText: {
    color: '#000',
    fontSize: FONTS.sizes.md,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: FONTS.sizes.sm,
    fontWeight: 'bold',
  },
  backBtn: {
    marginBottom: SPACING.sm,
  },
  backBtnText: {
    color: COLORS.accent,
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
  },
  formTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  formSub: {
    fontSize: FONTS.sizes.xs,
    color: '#64748B',
    marginBottom: SPACING.md,
  },
  inputGroup: {
    marginBottom: SPACING.sm,
  },
  inputLabel: {
    color: '#334155',
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    height: 48,
    color: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    color: '#64748B',
    fontSize: 11,
    marginHorizontal: SPACING.sm,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  socialBtnText: {
    color: '#0F172A',
    fontWeight: 'bold',
    fontSize: FONTS.sizes.xs,
  },
});
